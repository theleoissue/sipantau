'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PROFIL } from '@/lib/auth/menu'
import { LABEL_PERAN, type Pengguna } from '@/lib/supabase/types'
import { inisial } from '@/lib/utils'
import { Ikon } from './ikon'
import { TombolKeluar } from './tombol-keluar'

/** Warna avatar per peran, disalin dari objek PERAN pada mockup. */
const WARNA_PERAN: Record<string, { latar: string; tinta: string }> = {
  kasubdit:     { latar: '#7C3AED', tinta: '#FFFFFF' },
  admin:        { latar: '#7C3AED', tinta: '#FFFFFF' },
  kanit:        { latar: '#F5A623', tinta: '#0F1C32' },
  panit:        { latar: '#2563EB', tinta: '#FFFFFF' },
  anggota:      { latar: '#059669', tinta: '#FFFFFF' },
  pemeliharaan: { latar: '#475569', tinta: '#FFFFFF' },
}

export function BilahSamping({
  pengguna,
  namaUnit,
  onTutupLaci,
  sesiBerjalan = false,
}: {
  pengguna: Pengguna
  namaUnit: string | null
  onTutupLaci: () => void
  sesiBerjalan?: boolean
}) {
  const jalur = usePathname()
  const profil = PROFIL[pengguna.peran]
  const warna = WARNA_PERAN[pengguna.peran]
  const ruteAktif = profil.nav.filter((b): b is Extract<typeof b, { rute: string }> => 'rute' in b)
    .filter(b => jalur === b.rute || jalur.startsWith(b.rute + '/'))
    .sort((a, b) => b.rute.length - a.rute.length)[0]?.rute

  return (
    <aside id="sb">
      <button type="button" className="ikon-btn sb-tutup" onClick={onTutupLaci} aria-label="Tutup menu"><Ikon nama="silang" /></button>
      <div className="sb-merek">
        {/* Logo mendatar sudah memuat lambang, nama, DAN subjudulnya
            sekaligus — karena itu ia menggantikan ketiganya, bukan
            ditambahkan di sampingnya.

            Memakai varian TERANG, bukan berkas asli paketnya. Berkas
            "Horizontal_Dark" itu dibuat untuk latar terang: tulisannya
            biru gelap #0040A0, dan terhadap latar bilah samping
            #0F1C32 kontrasnya cuma 1,82:1 — jauh di bawah ambang
            keterbacaan 4,5:1. Percobaan pertama mengalasinya putih;
            hasilnya seperti stiker tempel dan ditolak pemilik produk.
            Varian ini menerangkan tulisannya saja (lambangnya tidak
            disentuh sedikit pun) sehingga kontrasnya 11,6-15:1 dan
            logonya menyatu langsung dengan bilah sampingnya. */}
        <Image
          src="/logo-sipantau-horizontal-terang.png"
          alt="SI PANTAU — Sistem Pengawasan Anggota Terpadu"
          width={485} height={190}
          className="sb-logo-penuh"
          priority
        />
        {/* Bilah samping yang menyempit hanya menyisakan ruang selebar
            ikon — logo mendatar tidak mungkin muat di situ. */}
        <Image
          src="/logo-sipantau.png"
          alt="SI PANTAU"
          width={68} height={68}
          className="sb-logo-mini"
          priority
        />
      </div>

      <div className="sb-orang">
        <div
          className="av av-md"
          style={{ background: warna.latar, color: warna.tinta }}
        >
          {inisial(pengguna.nama)}
        </div>
        <div className="meta">
          <div className="nm">{pengguna.nama}</div>
          <div className="rl" style={{ color: warna.latar }}>
            {LABEL_PERAN[pengguna.peran]}
            {namaUnit ? ` · ${namaUnit}` : ''}
          </div>
        </div>
      </div>

      {/* BR-11: butir yang tidak ada di PROFIL peran ini tidak dirender
          sama sekali — bukan dirender dalam keadaan nonaktif. */}
      <nav className="sb-nav">
        {profil.nav.map((b, i) =>
          'kelompok' in b ? (
            <div className="sb-cap" key={`k${i}`}>{b.kelompok}</div>
          ) : (
            <Link
              key={b.id}
              href={b.rute}
              onClick={onTutupLaci}
              className={`nav-i ${ruteAktif === b.rute ? 'on' : ''}`}
              aria-current={ruteAktif === b.rute ? 'page' : undefined}
            >
              <Ikon nama={b.ikon} />
              <span className="lbl">{b.label}{b.id === 'tugas' && sesiBerjalan && <small className="nav-sesi-status">Sedang bertugas</small>}</span>
            </Link>
          ),
        )}
      </nav>

      <div className="sb-kaki">
        <TombolKeluar />
      </div>
    </aside>
  )
}
