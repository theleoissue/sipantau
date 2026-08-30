'use client'

import { useState, useTransition } from 'react'
import { mulaiLhpAksi } from '@/app/(app)/lhp/aksi'
import { Ikon } from './ikon'

/**
 * Memulai draf LHP Ringkas untuk SPT ini. Hanya dirender untuk Anggota
 * pelaksana aktif (BR-11) — halaman pemanggil yang memutuskan itu.
 * dasar/waktuKegiatan/tempatKegiatan sudah dihitung Server Component
 * pemanggil dari data yang sudah ada (nomor SPT, Sesi Tugas, titik
 * lokasi) supaya tidak menghitung ulang di sini.
 */
export function TombolSusunLhp({
  penugasanId,
  dasar,
  waktuKegiatan,
  tempatKegiatan,
}: {
  penugasanId: string
  dasar: string
  waktuKegiatan: string
  tempatKegiatan: string
}) {
  const [, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)

  return (
    <div>
      <button
        className="btn btn-p btn-sm"
        onClick={() => mulai(async () => {
          const r = await mulaiLhpAksi(penugasanId, { dasar, waktuKegiatan, tempatKegiatan })
          if (r?.galat) setGalat(r.galat)
        })}
      >
        <Ikon nama="berkas" /> Susun LHP Ringkas
      </button>
      {galat && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 8 }}>{galat}</p>}
    </div>
  )
}
