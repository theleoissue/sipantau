'use client'

import { useRef, useState, useTransition } from 'react'
import { klienBrowser } from '@/lib/supabase/client'
import { catatFoto } from '@/app/(app)/laporan/aksi'
import { Ikon } from './ikon'

/**
 * Dua tombol terpisah — Ambil Foto vs Pilih dari Galeri — bukan satu
 * area unggah gabungan. Perbedaan keduanya menentukan status foto
 * (KP-6.3-27/28), jadi pilihannya harus terlihat sebagai dua jalan
 * berbeda sejak awal.
 *
 * Foto TIDAK PERNAH mewarisi koordinat laporan induknya (BR-42): foto
 * kamera membaca Geolocation-nya sendiri, foto galeri tidak dijamin
 * sama sekali. Watermark tertanam di piksel dan Kolase adalah Modul
 * 6.7 yang ditunda — di sini foto disimpan apa adanya beserta metanya.
 */
export function UnggahFoto({
  laporanId, penugasanId,
}: { laporanId: string; penugasanId: string }) {
  const kamera = useRef<HTMLInputElement>(null)
  const galeri = useRef<HTMLInputElement>(null)
  const [mengunggah, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)

  function unggah(berkas: File, sumber: 'kamera' | 'galeri') {
    setGalat(null)
    mulai(async () => {
      let lat: number | null = null, lng: number | null = null, akurasi: number | null = null
      let diambilPada: string | null = null

      if (sumber === 'kamera' && navigator.geolocation) {
        diambilPada = new Date().toISOString()
        await new Promise<void>(selesai => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              lat = pos.coords.latitude; lng = pos.coords.longitude
              akurasi = pos.coords.accuracy
              selesai()
            },
            () => selesai(),
            { timeout: 8_000 },
          )
        })
      }

      const ekstensi = berkas.name.split('.').pop() || 'jpg'
      const path = `${penugasanId}/${laporanId}/${crypto.randomUUID()}.${ekstensi}`

      const supabase = klienBrowser()
      const { error: galatUnggah } = await supabase.storage
        .from('dokumentasi')
        .upload(path, berkas)

      if (galatUnggah) {
        setGalat(`Gagal mengunggah berkas: ${galatUnggah.message}`)
        return
      }

      const hasil = await catatFoto({
        laporanId, berkasPath: path, sumber,
        lat, lng, akurasiMeter: akurasi, diambilPada,
      })
      if (hasil?.galat) setGalat(hasil.galat)
    })
  }

  return (
    <div className="fg">
      <label>Foto dokumentasi</label>

      {galat && (
        <div role="alert" style={{
          background: 'var(--red-bg)', color: 'var(--red)', padding: '8px 12px',
          borderRadius: 'var(--r-sm)', fontSize: 12.5, marginBottom: 10,
        }}>
          {galat}
        </div>
      )}

      <button type="button" disabled={mengunggah}
        className="jatuh"
        onClick={() => !mengunggah && kamera.current?.click()}
        style={{ opacity: mengunggah ? 0.6 : 1, pointerEvents: mengunggah ? 'none' : undefined }}
      >
        <Ikon nama="kamera" />
        <p>Ambil foto dengan kamera</p>
        <small>Koordinat dan waktu pengambilan ikut tersimpan</small>
      </button>
      <input
        ref={kamera} type="file" accept="image/*" capture="environment" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) unggah(f, 'kamera'); e.target.value = '' }}
      />

      <button type="button" disabled={mengunggah}
        className="jatuh"
        style={{ marginTop: 9, padding: 15, opacity: mengunggah ? 0.6 : 1, pointerEvents: mengunggah ? 'none' : undefined }}
        onClick={() => !mengunggah && galeri.current?.click()}
      >
        <Ikon nama="gambar" />
        <p style={{ fontSize: 12.5 }}>Atau pilih dari galeri</p>
        <small>Ditandai lampiran karena waktu dan lokasinya tidak dapat dijamin</small>
      </button>
      <input
        ref={galeri} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) unggah(f, 'galeri'); e.target.value = '' }}
      />

      {mengunggah && <div className="bantu">Mengunggah…</div>}
    </div>
  )
}
