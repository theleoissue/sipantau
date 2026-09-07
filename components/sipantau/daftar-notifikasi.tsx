'use client'

import { useState, useTransition } from 'react'
import { muatNotifikasiLanjut } from '@/app/(app)/pemberitahuan/aksi'
import { kelompokkanPerHari, type Notifikasi } from '@/lib/notifikasi/tipe'
import { BarisNotifikasi } from './baris-notifikasi'

const BATAS = 30

/** KP-6.9-13: tiga puluh baris sekali muat, dengan tombol untuk
 *  melanjutkan. daftarNotifikasi(offset, batas) sudah lengkap sejak
 *  ditulis (lib/notifikasi/kueri.ts) — yang selama ini tidak ada adalah
 *  pemanggil argumen keduanya. Tanpa komponen ini, notifikasi ke-31 ke
 *  atas tidak terjangkau siapa pun, termasuk pemiliknya sendiri (bukan
 *  kebocoran — RLS tetap menyaring milik sendiri — hanya tidak
 *  terlihat). */
export function DaftarNotifikasi({ awal }: { awal: Notifikasi[] }) {
  const [daftar, setDaftar] = useState(awal)
  const [habis, setHabis] = useState(awal.length < BATAS)
  const [memuat, mulai] = useTransition()

  const kelompok = kelompokkanPerHari(daftar)

  return (
    <>
      {/* Dirender hanya saat page.tsx sudah memastikan daftar awal
          tidak kosong — keadaan kosong ditangani di sana. */}
      {kelompok.map(({ kunci, label, baris }) => (
        <div key={kunci}>
          <div className="pb-hari">{label}</div>
          {baris.map(n => <BarisNotifikasi key={n.id} n={n} />)}
        </div>
      ))}

      {!habis && (
        <div style={{ textAlign: 'center', padding: '14px 0 4px' }}>
          <button
            type="button"
            className="btn btn-o"
            disabled={memuat}
            onClick={() => mulai(async () => {
              const lanjutan = await muatNotifikasiLanjut(daftar.length)
              setDaftar(d => [...d, ...lanjutan])
              if (lanjutan.length < BATAS) setHabis(true)
            })}
          >
            {memuat ? 'Memuat…' : 'Muat lebih banyak'}
          </button>
        </div>
      )}
    </>
  )
}
