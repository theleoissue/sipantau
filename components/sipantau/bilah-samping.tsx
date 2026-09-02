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
}: {
  pengguna: Pengguna
  namaUnit: string | null
  onTutupLaci: () => void
}) {
  const jalur = usePathname()
  const profil = PROFIL[pengguna.peran]
  const warna = WARNA_PERAN[pengguna.peran]

  return (
    <aside id="sb">
      <div className="sb-merek">
        {/* Lambang resmi, menggantikan penanda sementara "SP". Ukuran
            sumbernya 2x slot 34px supaya tetap tajam di layar rapat. */}
        <Image
          src="/logo-sipantau.png"
          alt="SI PANTAU"
          width={68} height={68}
          className="sb-tanda"
          priority
        />
        <div className="sb-nama">
          SI PANTAU
          <small>Subdit IV Ditreskrimsus</small>
        </div>
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
              className={`nav-i ${jalur === b.rute || jalur.startsWith(b.rute + '/') ? 'on' : ''}`}
            >
              <Ikon nama={b.ikon} />
              <span className="lbl">{b.label}</span>
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
