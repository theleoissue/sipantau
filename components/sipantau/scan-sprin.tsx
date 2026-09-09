'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { scanSprin, type HasilScanSprin } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

export function ScanSprin({ onHasil }: { onHasil: (data: NonNullable<HasilScanSprin['data']>) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [pesan, setPesan] = useState('')
  // Nilai platform dibaca setelah komponen terpasang agar HTML awal di web
  // dan WebView sama. Ini mencegah tombol kamera muncul setengah jalan saat
  // React masih melakukan hidrasi.
  const [native, setNative] = useState(false)
  const [memindai, mulai] = useTransition()
  useEffect(() => {
    const timer = window.setTimeout(() => setNative(Capacitor.isNativePlatform()), 0)
    return () => window.clearTimeout(timer)
  }, [])
  async function proses(berkas: File) {
    const fd = new FormData(); fd.set('berkas', berkas)
    const hasil = await scanSprin(fd)
    if (hasil.data) { onHasil(hasil.data); setPesan('Hasil scan sudah dimasukkan sebagai draf. Periksa kembali sebelum menerbitkan.') } else setPesan(hasil.galat ?? 'Scan gagal.')
  }
  function bukaKamera() {
    mulai(async () => {
      try {
        const foto = await Camera.getPhoto({ quality: 95, resultType: CameraResultType.Uri, source: CameraSource.Camera, allowEditing: true, correctOrientation: true })
        if (!foto.webPath) throw new Error('Foto tidak tersedia')
        const blob = await fetch(foto.webPath).then(r => r.blob())
        await proses(new File([blob], `scan-sprin.${foto.format ?? 'jpeg'}`, { type: blob.type || 'image/jpeg' }))
      } catch { setPesan('Kamera dibatalkan atau tidak dapat dibuka.') }
    })
  }
  return <section className="scan-sprin">
    <div><strong>Scan SPRIN</strong><p>Unggah PDF atau foto. Hasilnya menjadi draf dan wajib diperiksa sebelum diterbitkan.</p></div>
    <input ref={input} type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => {
      const berkas = e.target.files?.[0]; e.target.value = ''
      if (!berkas) return
      mulai(async () => { await proses(berkas) })
    }} />
    {native && <button type="button" className="btn btn-p" disabled={memindai} onClick={bukaKamera}><Ikon nama="kamera" />Scan kamera</button>}
    <button type="button" className="btn btn-o" disabled={memindai} onClick={() => input.current?.click()}><Ikon nama="berkas" />{memindai ? 'Membaca…' : 'Unggah berkas'}</button>
    {pesan && <p className="bantu" role="status">{pesan}</p>}
  </section>
}
