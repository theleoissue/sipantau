'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { scanSprin, type HasilScanSprin } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'
import { PratinjauScanSprin } from './pratinjau-scan-sprin'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor, registerPlugin } from '@capacitor/core'

const MAKS_HALAMAN = 8

type HasilPemindaiDokumen = { pages: string[] }
const DokumenScanner = registerPlugin<{ scan(options: { pageLimit: number }): Promise<HasilPemindaiDokumen> }>('DokumenScanner')

function dariBase64(base64: string, tipe: string) {
  const data = atob(base64)
  const bytes = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i)
  return new Blob([bytes], { type: tipe })
}

/** Mengecilkan foto dokumen sebelum melewati jaringan WebView dan Server Action. */
async function siapkanFoto(base64: string, format?: string) {
  const sumber = dariBase64(base64, `image/${format ?? 'jpeg'}`)
  const url = URL.createObjectURL(sumber)
  try {
    const gambar = new Image()
    await new Promise<void>((selesai, gagal) => {
      gambar.onload = () => selesai()
      gambar.onerror = () => gagal(new Error('Foto tidak dapat dibaca'))
      gambar.src = url
    })
    const skala = Math.min(1, 1600 / Math.max(gambar.width, gambar.height))
    const kanvas = document.createElement('canvas')
    kanvas.width = Math.max(1, Math.round(gambar.width * skala))
    kanvas.height = Math.max(1, Math.round(gambar.height * skala))
    kanvas.getContext('2d')?.drawImage(gambar, 0, 0, kanvas.width, kanvas.height)
    const hasil = await new Promise<Blob | null>(selesai => kanvas.toBlob(selesai, 'image/jpeg', .72))
    if (!hasil) throw new Error('Foto tidak dapat dikompres')
    return new File([hasil], `halaman-sprin-${Date.now()}.jpg`, { type: 'image/jpeg' })
  } finally { URL.revokeObjectURL(url) }
}

export function ScanSprin({ onHasil, pesanSukses = 'Hasil scan sudah dimasukkan sebagai draf. Periksa kembali sebelum menerbitkan.' }: {
  onHasil: (data: NonNullable<HasilScanSprin['data']>) => void
  pesanSukses?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [halaman, setHalaman] = useState<File[]>([])
  const [antrianKoreksi, setAntrianKoreksi] = useState<File[]>([])
  const [pesan, setPesan] = useState('')
  const [native, setNative] = useState(false)
  const [menyiapkan, setMenyiapkan] = useState(false)
  const [memindai, mulai] = useTransition()

  useEffect(() => {
    const timer = window.setTimeout(() => setNative(Capacitor.isNativePlatform()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  function tambah(tambahan: File[], perluKoreksi = true) {
    const tersisa = MAKS_HALAMAN - halaman.length - antrianKoreksi.length
    if (tersisa <= 0) { setPesan(`Maksimal ${MAKS_HALAMAN} halaman sekali pindai.`); return }
    const dipakai = tambahan.slice(0, tersisa)
    // Foto (kamera atau JPG/PNG/WebP) dirapikan dulu lewat dialog koreksi;
    // PDF sudah berupa dokumen jadi, langsung ditambahkan apa adanya.
    const foto = perluKoreksi ? dipakai.filter(b => b.type !== 'application/pdf') : []
    const pdf = dipakai.filter(b => b.type === 'application/pdf')
    if (foto.length) setAntrianKoreksi(sebelum => [...sebelum, ...foto])
    // JPEG dari ML Kit sudah diperbaiki perspektif, rotasi, bayangan dan
    // noda secara native. Jangan buka crop kedua di WebView.
    if (pdf.length || !perluKoreksi) setHalaman(sebelum => [...sebelum, ...(perluKoreksi ? pdf : dipakai)])
    setPesan(tambahan.length > tersisa ? `Hanya ${MAKS_HALAMAN} halaman pertama yang ditambahkan.` : '')
  }

  async function proses() {
    const fd = new FormData()
    halaman.forEach(berkas => fd.append('berkas', berkas))
    const hasil = await scanSprin(fd)
    if (hasil.data) {
      onHasil(hasil.data)
      setPesan(pesanSukses)
    } else setPesan(hasil.galat ?? 'Scan gagal.')
  }

  async function bukaKamera() {
    setMenyiapkan(true)
    try {
      let foto
      try {
        foto = await Camera.getPhoto({ quality: 72, width: 1600, height: 1600, resultType: CameraResultType.Base64, source: CameraSource.Camera, allowEditing: true, correctOrientation: true })
      } catch {
        setPesan('Pengambilan foto dibatalkan atau kamera tidak dapat dibuka.')
        return
      }
      if (!foto.base64String) { setPesan('Foto diterima, tetapi datanya tidak lengkap. Coba potret ulang.'); return }
      tambah([await siapkanFoto(foto.base64String, foto.format)])
    } catch {
      setPesan('Foto sudah diambil, tetapi tidak dapat disiapkan. Coba potret ulang atau gunakan Unggah berkas.')
    } finally { setMenyiapkan(false) }
  }

  async function bukaPemindaiDokumen() {
    setMenyiapkan(true)
    setPesan('Menyiapkan pemindai dokumen…')
    try {
      const hasil = await DokumenScanner.scan({ pageLimit: MAKS_HALAMAN - halaman.length })
      if (!hasil.pages?.length) { setPesan('Tidak ada halaman yang dipilih dari pemindai.'); return }
      const berkas = hasil.pages.map((base64, i) => new File(
        [dariBase64(base64, 'image/jpeg')], `scan-sprin-${Date.now()}-${i + 1}.jpg`, { type: 'image/jpeg' },
      ))
      tambah(berkas, false)
      setPesan(`${berkas.length} halaman sudah dipindai dan dibersihkan. Tekan “Pindai” untuk membaca SPRIN.`)
    } catch (galat) {
      const kode = galat instanceof Error ? galat.message : ''
      if (kode.includes('PEMINDAIAN_DIBATALKAN')) setPesan('Pemindaian dibatalkan.')
      else setPesan('Pemindai dokumen tidak dapat dibuka. Pastikan Google Play services aktif, lalu coba lagi.')
    } finally { setMenyiapkan(false) }
  }

  const sibuk = menyiapkan || memindai || antrianKoreksi.length > 0
  return <section className="scan-sprin">
    <div><strong>Scan SPRIN</strong><p>Tambahkan setiap halaman dari kamera atau unggah PDF/foto. Semua halaman dibaca bersama sebagai satu SPRIN.</p></div>
    <input ref={input} type="file" hidden multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => {
      const berkas = Array.from(e.target.files ?? [])
      e.target.value = ''
      if (berkas.length) tambah(berkas)
    }} />
    {native && Capacitor.getPlatform() === 'android' && <button type="button" className="btn btn-p" disabled={sibuk} onClick={bukaPemindaiDokumen}><Ikon nama="kamera" />{halaman.length ? 'Tambah halaman' : 'Scan dokumen'}</button>}
    {native && Capacitor.getPlatform() !== 'android' && <button type="button" className="btn btn-p" disabled={sibuk} onClick={bukaKamera}><Ikon nama="kamera" />{halaman.length ? 'Tambah foto' : 'Scan kamera'}</button>}
    <button type="button" className="btn btn-o" disabled={sibuk} onClick={() => input.current?.click()}><Ikon nama="berkas" />Unggah halaman / PDF</button>
    {halaman.length > 0 && <div className="scan-sprin-ringkasan">
      <span><b>{halaman.length}</b> {halaman.length === 1 ? 'berkas siap dipindai' : 'halaman/berkas siap dipindai'}</span>
      <button type="button" className="btn btn-o btn-sm" disabled={memindai} onClick={() => { setHalaman([]); setAntrianKoreksi([]) }}><Ikon nama="silang" />Kosongkan</button>
      <button type="button" className="btn btn-p" disabled={sibuk} onClick={() => mulai(proses)}><Ikon nama="cari" />{memindai ? 'Membaca semua halaman…' : `Pindai ${halaman.length} halaman`}</button>
    </div>}
    {pesan && <p className="bantu" role="status">{pesan}</p>}
    {antrianKoreksi[0] && (
      <PratinjauScanSprin
        berkas={antrianKoreksi[0]}
        onSelesai={hasil => { setHalaman(h => [...h, hasil]); setAntrianKoreksi(q => q.slice(1)) }}
        onBatal={() => setAntrianKoreksi(q => q.slice(1))}
      />
    )}
  </section>
}
