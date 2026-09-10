'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PROFIL } from '@/lib/auth/menu'
import type { Peran } from '@/lib/supabase/types'
import { Ikon } from './ikon'

/**
 * Navigasi utama pada layar telepon. Hanya tampil di bawah 768px
 * (aturan #bb pada globals.css), berisi empat menu pertama peran ini.
 *
 * Ini pengganti laci-hamburger yang membuat perpindahan menu terasa
 * lambat di telepon — sasaran sentuhnya besar dan selalu terlihat,
 * sesuai docs/00-fondasi.md §10.5.
 */
export function BilahBawah({ peran, sesiBerjalan = false }: { peran: Peran; sesiBerjalan?: boolean }) {
  const jalur = usePathname()
  const profil = PROFIL[peran]

  const butir = profil.bilahBawah
    .map(id => profil.nav.find(b => 'id' in b && b.id === id))
    .filter((b): b is Extract<typeof profil.nav[number], { id: string }> =>
      !!b && 'id' in b)

  if (butir.length === 0) return null

  return (
    <nav id="bb" className={peran === 'anggota' || peran === 'panit' ? 'bb-lapangan' : undefined} aria-label="Navigasi utama">
      {butir.map(b => (
        <Link
          key={b.id}
          href={b.rute}
          aria-current={jalur === b.rute || jalur.startsWith(b.rute + '/') ? 'page' : undefined}
          className={`${jalur === b.rute || jalur.startsWith(b.rute + '/') ? 'on' : ''} ${b.id === 'tugas' ? `bb-pusat ${sesiBerjalan ? 'sesi-berjalan' : ''}` : ''}`}
        >
          <span className="bb-ikon"><Ikon nama={b.ikon} /></span>
          <span className="bb-label">{b.id === 'tugas' && sesiBerjalan ? 'Sedang Bertugas' : b.id === 'penugasan' ? 'Penugasan' : b.label}</span>
        </Link>
      ))}
    </nav>
  )
}
