'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Ikon } from './ikon'

const SARING = ['semua', 'draf', 'baru', 'berjalan', 'bermasalah'] as const

/**
 * Penyaring daftar penugasan. Keadaan penyaring disimpan di URL, bukan
 * di useState — supaya halamannya dapat ditautkan, di-bookmark, dan
 * tombol kembali peramban bekerja sebagaimana mestinya.
 *
 * Pengambilan datanya tetap di Server Component; komponen ini hanya
 * mengubah alamat lalu membiarkan server mengambil ulang.
 */
export function PenyaringPenugasan({
  saringAktif,
  kueriAwal,
}: {
  saringAktif: string
  kueriAwal: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [kueri, setKueri] = useState(kueriAwal)
  const [awalTerekam, setAwalTerekam] = useState(kueriAwal)
  const [menunggu, mulaiTransisi] = useTransition()

  if (awalTerekam !== kueriAwal) {
    setAwalTerekam(kueriAwal)
    setKueri(kueriAwal)
  }

  function perbarui(saring = saringAktif) {
    const p = new URLSearchParams(params.toString())
    if (kueri.trim()) p.set('cari', kueri.trim())
    else p.delete('cari')
    if (saring !== 'semua') p.set('saring', saring)
    else p.delete('saring')
    mulaiTransisi(() => router.replace(`/penugasan?${p.toString()}`))
  }

  return (
    <div className="saring" style={{ opacity: menunggu ? 0.6 : 1 }}>
      <form
        className="cari"
        onSubmit={e => { e.preventDefault(); perbarui() }}
      >
        <Ikon nama="cari" />
        <input
          type="search"
          placeholder="Cari nomor, judul, atau objek"
          value={kueri}
          onChange={e => setKueri(e.target.value)}
          aria-label="Cari penugasan"
        />
        <button type="submit" className="cari-kirim" disabled={menunggu}>Cari</button>
      </form>

      {SARING.map(f => (
        <button
          key={f}
          type="button"
          className={`cip ${saringAktif === f ? 'on' : ''}`}
          aria-pressed={saringAktif === f}
          onClick={() => perbarui(f)}
        >
          {f[0].toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  )
}
