'use client'

import { usePathname } from 'next/navigation'
import { PROFIL } from '@/lib/auth/menu'
import type { Pengguna } from '@/lib/supabase/types'
import { inisial } from '@/lib/utils'
import { Ikon } from './ikon'

const WARNA_PERAN: Record<string, { latar: string; tinta: string }> = {
  kasubdit:     { latar: '#7C3AED', tinta: '#FFFFFF' },
  kanit:        { latar: '#F5A623', tinta: '#0F1C32' },
  panit:        { latar: '#2563EB', tinta: '#FFFFFF' },
  anggota:      { latar: '#059669', tinta: '#FFFFFF' },
  pemeliharaan: { latar: '#475569', tinta: '#FFFFFF' },
}

export function HeaderAplikasi({
  pengguna,
  onTekanMenu,
}: {
  pengguna: Pengguna
  onTekanMenu: () => void
}) {
  const jalur = usePathname()
  const warna = WARNA_PERAN[pengguna.peran]

  const butir = PROFIL[pengguna.peran].nav.find(
    b => 'rute' in b && (jalur === b.rute || jalur.startsWith(b.rute + '/')),
  )
  const judul = butir && 'label' in butir ? butir.label : ''

  return (
    <header id="hd">
      <button className="ikon-btn" onClick={onTekanMenu} aria-label="Menu">
        <Ikon nama="dasbor" />
      </button>

      <div className="jejak">{judul}</div>

      <div className="hd-kanan">
        {/* Lonceng pemberitahuan menunggu Modul 6.9 (Langkah 12).
            Sengaja belum dirender: menampilkan lonceng yang tidak
            pernah berisi apa-apa lebih membingungkan daripada tidak ada. */}
        <div
          className="av hd-av"
          style={{ background: warna.latar, color: warna.tinta }}
          title={pengguna.nama}
        >
          {inisial(pengguna.nama)}
        </div>
      </div>
    </header>
  )
}
