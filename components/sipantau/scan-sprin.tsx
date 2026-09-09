'use client'

import { useRef, useState, useTransition } from 'react'
import { scanSprin, type HasilScanSprin } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'

export function ScanSprin({ onHasil }: { onHasil: (data: NonNullable<HasilScanSprin['data']>) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [pesan, setPesan] = useState('')
  const [memindai, mulai] = useTransition()
  return <section className="scan-sprin">
    <div><strong>Scan SPRIN</strong><p>Unggah PDF atau foto. Hasilnya menjadi draf dan wajib diperiksa sebelum diterbitkan.</p></div>
    <input ref={input} type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => {
      const berkas = e.target.files?.[0]; e.target.value = ''
      if (!berkas) return
      mulai(async () => { const fd = new FormData(); fd.set('berkas', berkas); const hasil = await scanSprin(fd); if (hasil.data) { onHasil(hasil.data); setPesan('Hasil scan sudah dimasukkan sebagai draf. Periksa kembali sebelum menerbitkan.') } else setPesan(hasil.galat ?? 'Scan gagal.') })
    }} />
    <button type="button" className="btn btn-o" disabled={memindai} onClick={() => input.current?.click()}><Ikon nama="berkas" />{memindai ? 'Membaca…' : 'Pindai SPRIN'}</button>
    {pesan && <p className="bantu" role="status">{pesan}</p>}
  </section>
}
