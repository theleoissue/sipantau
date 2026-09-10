'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { scanSprin, type HasilScanSprin } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'
import { PratinjauScanSprin } from './pratinjau-scan-sprin'
import { muatOpenCv } from '@/lib/scan/pemroses-dokumen'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor, registerPlugin } from '@capacitor/core'

const MAKS_HALAMAN = 8
const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const adalahDocx = (berkas: File) => berkas.type === MIME_DOCX || berkas.name.toLowerCase().endsWith('.docx')

type HasilPemindaiDokumen = { pages: string[] }
const DokumenScanner = registerPlugin<{ scan(options: { pageLimit: number }): Promise<HasilPemindaiDokumen> }>('DokumenScanner')

function dariBase64(base64: string, tipe: string) {
  const data = atob(base64)
  const bytes = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i)
  return new Blob([bytes], { type: tipe })
}

/** Kamera biasa mengembalikan URI file agar tidak membebani WebView dengan Base64. */
async function berkasDariUriKamera(uri: string) {
  const respons = await fetch(uri)
  if (!respons.ok) throw new Error('Foto kamera tidak dapat dibaca')
  const sumber = await respons.blob()
  return new File([sumber], `halaman-sprin-${Date.now()}.jpg`, { type: sumber.type || 'image/jpeg' })
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
  const [tahapBaca, setTahapBaca] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setNative(Capacitor.isNativePlatform()), 0)
    // Unduh pustaka pemroses gambar sejak halaman dibuka, selagi pengguna
    // masih mengarahkan kamera — bukan saat foto sudah jadi dan orangnya
    // menunggu. Kegagalannya diabaikan di sini: dialog koreksi memuatnya
    // lagi dan di sanalah pesan galatnya ditampilkan.
    muatOpenCv().catch(() => {})
    return () => window.clearTimeout(timer)
  }, [])

  function tambah(tambahan: File[], perluKoreksi = true) {
    const tersisa = MAKS_HALAMAN - halaman.length - antrianKoreksi.length
    if (tersisa <= 0) { setPesan(`Maksimal ${MAKS_HALAMAN} halaman sekali pindai.`); return }
    const dipakai = tambahan.slice(0, tersisa)
    // Foto (kamera atau JPG/PNG/WebP) dirapikan dulu lewat dialog koreksi;
    // PDF sudah berupa dokumen jadi, langsung ditambahkan apa adanya.
    const foto = perluKoreksi ? dipakai.filter(b => b.type !== 'application/pdf' && !adalahDocx(b)) : []
    const dokumen = dipakai.filter(b => b.type === 'application/pdf' || adalahDocx(b))
    if (foto.length) setAntrianKoreksi(sebelum => [...sebelum, ...foto])
    // JPEG dari pemindai native sudah diperbaiki perspektif, rotasi, bayangan dan
    // noda secara native. Jangan buka crop kedua di WebView.
    if (dokumen.length || !perluKoreksi) setHalaman(sebelum => [...sebelum, ...(perluKoreksi ? dokumen : dipakai)])
    setPesan(tambahan.length > tersisa ? `Hanya ${MAKS_HALAMAN} halaman pertama yang ditambahkan.` : '')
  }

  async function proses() {
    // Sisakan ruang multipart agar permintaan tidak ditolak sebelum aksi berjalan.
    if (halaman.reduce((total, file) => total + file.size, 0) > 3.8 * 1024 * 1024) {
      setPesan('Total berkas melebihi 3,8 MB. Hapus halaman yang tidak diperlukan atau gunakan berkas yang lebih kecil sebelum membaca SPRIN.')
      return
    }
    setPesan('')
    setTahapBaca('Mengirim berkas dan membaca isi SPRIN…')
    try {
    const fd = new FormData()
    halaman.forEach(berkas => fd.append('berkas', berkas))
    const hasil = await scanSprin(fd)
    if (hasil.data) {
      setTahapBaca('Mengisi draf dari hasil pembacaan…')
      onHasil(hasil.data)
      setPesan(pesanSukses)
    } else setPesan(hasil.galat ?? 'Scan gagal.')
    } catch { setPesan('Pembacaan terputus. Halaman Anda tetap tersedia; periksa koneksi lalu coba lagi.') }
    finally { setTahapBaca('') }
  }

  async function bukaKamera() {
    setMenyiapkan(true)
    setPesan('Membuka kamera…')
    try {
      let foto
      try {
        foto = await Camera.getPhoto({ quality: 70, width: 1440, height: 1440, resultType: CameraResultType.Uri, source: CameraSource.Camera, allowEditing: false, correctOrientation: true })
      } catch {
        setPesan('Pengambilan foto dibatalkan atau kamera tidak dapat dibuka.')
        return
      }
      const uri = foto.webPath ?? (foto.path ? Capacitor.convertFileSrc(foto.path) : undefined)
      if (!uri) { setPesan('Foto diterima, tetapi lokasi berkasnya tidak tersedia. Coba potret ulang.'); return }
      setPesan('Menyiapkan foto untuk dirapikan…')
      tambah([await berkasDariUriKamera(uri)])
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
      else if (kode.includes('IZIN_KAMERA_DITOLAK')) setPesan('Izin kamera belum diberikan. Izinkan kamera untuk SiPANTAU di Pengaturan, lalu coba lagi.')
      else if (kode.includes('OPENCV_GAGAL_DIMUAT')) setPesan('Komponen pemrosesan dokumen tidak berhasil dimuat. Tutup aplikasi lalu buka kembali, kemudian coba lagi.')
      else if (kode.includes('KAMERA_TIDAK_TERSEDIA')) setPesan('Kamera belakang tidak dapat digunakan saat ini. Tutup aplikasi lain yang memakai kamera lalu coba lagi.')
      else if (kode.includes('SCANNER_GAGAL_')) setPesan(`Scanner native gagal dimulai (${kode.replace(/^.*SCANNER_GAGAL_/, '')}). Kode ini dicatat untuk perbaikan.`)
      // Kode mentahnya ikut ditampilkan: pesan umum tanpa kode sempat
      // menyembunyikan "plugin is not implemented" (DokumenScanner tidak
      // terdaftar) sebagai seolah-olah gangguan kamera biasa.
      else setPesan(`Pemindai dokumen tidak dapat dibuka${kode ? ` (${kode})` : ''}. Coba lagi atau gunakan unggah halaman / PDF.`)
    } finally { setMenyiapkan(false) }
  }

  const sibuk = menyiapkan || memindai || antrianKoreksi.length > 0
  return <section className="scan-sprin" aria-busy={menyiapkan || memindai}>
    <div><strong>Scan SPRIN</strong><p>Tambahkan foto setiap halaman, PDF, atau DOCX. Semua berkas dibaca bersama sebagai satu SPRIN; periksa hasilnya sebelum diterbitkan.</p></div>
    <input ref={input} type="file" hidden multiple accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp" onChange={e => {
      const berkas = Array.from(e.target.files ?? [])
      e.target.value = ''
      if (berkas.length) tambah(berkas)
    }} />
    {native && Capacitor.getPlatform() === 'android' && <button type="button" className="btn btn-p" disabled={sibuk} onClick={bukaPemindaiDokumen}><Ikon nama="kamera" />{halaman.length ? 'Tambah halaman' : 'Scan dokumen'}</button>}
    {/* Cadangan di Android: kamera bawaan lalu dirapikan lewat dialog
        OpenCV.js di WebView. Tidak menyentuh plugin native sama sekali,
        jadi tetap tersedia bila pemindai native gagal terbuka. */}
    {native && <button type="button" className={Capacitor.getPlatform() === 'android' ? 'btn btn-o' : 'btn btn-p'} disabled={sibuk} onClick={bukaKamera}>
      <Ikon nama="kamera" />
      {Capacitor.getPlatform() === 'android'
        ? (halaman.length ? 'Tambah foto biasa' : 'Kamera biasa')
        : (halaman.length ? 'Tambah foto' : 'Scan kamera')}
    </button>}
    <button type="button" className="btn btn-o" disabled={sibuk} onClick={() => input.current?.click()}><Ikon nama="berkas" />Unggah DOCX / PDF / foto</button>
    {halaman.length > 0 && <div className="scan-sprin-ringkasan">
      <span><b>{halaman.length}</b> berkas siap • {(halaman.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(1)} / 3,8 MB</span>
      <button type="button" className="btn btn-o btn-sm" disabled={sibuk} onClick={() => { setHalaman([]); setAntrianKoreksi([]); setPesan('') }}><Ikon nama="silang" />Kosongkan</button>
      <button type="button" className="btn btn-p" disabled={sibuk} onClick={() => mulai(proses)}><Ikon nama="cari" />{memindai ? 'Membaca semua halaman…' : `Pindai ${halaman.length} halaman`}</button>
    </div>}
    {halaman.length > 0 && <ol className="scan-daftar-berkas">{halaman.map((file, i) => <li key={`${file.name}-${i}`}>
      <span><b>{i + 1}. {file.name}</b><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small></span>
      <button type="button" className="ikon-btn" disabled={sibuk || i === 0} aria-label={`Pindahkan berkas ${i + 1} ke atas`} onClick={() => setHalaman(h => { const baru = [...h]; [baru[i - 1], baru[i]] = [baru[i], baru[i - 1]]; return baru })}><Ikon nama="naik" /></button>
      <button type="button" className="ikon-btn" disabled={sibuk} aria-label={`Hapus berkas ${i + 1}`} onClick={() => setHalaman(h => h.filter((_, n) => n !== i))}><Ikon nama="silang" /></button>
    </li>)}</ol>}
    {tahapBaca && <p className="scan-status" role="status">{tahapBaca}</p>}
    {pesan && <p className="bantu" role="status">{pesan}</p>}
    {antrianKoreksi[0] && (
      <PratinjauScanSprin
        key={`${antrianKoreksi[0].name}-${antrianKoreksi[0].lastModified}`}
        berkas={antrianKoreksi[0]}
        onSelesai={hasil => { setHalaman(h => [...h, hasil]); setAntrianKoreksi(q => q.slice(1)) }}
        onBatal={() => setAntrianKoreksi(q => q.slice(1))}
      />
    )}
  </section>
}
