'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PROFIL } from '@/lib/auth/menu'
import type { Pengguna } from '@/lib/supabase/types'
import { inisial } from '@/lib/utils'
import { klienBrowser } from '@/lib/supabase/client'
import { labelJumlah } from '@/lib/notifikasi/tipe'
import { Ikon } from './ikon'

const WARNA_PERAN: Record<string, { latar: string; tinta: string }> = {
  kasubdit:     { latar: '#7C3AED', tinta: '#FFFFFF' },
  admin:        { latar: '#7C3AED', tinta: '#FFFFFF' },
  kanit:        { latar: '#F5A623', tinta: '#0F1C32' },
  panit:        { latar: '#2563EB', tinta: '#FFFFFF' },
  anggota:      { latar: '#059669', tinta: '#FFFFFF' },
  pemeliharaan: { latar: '#475569', tinta: '#FFFFFF' },
}

export function HeaderAplikasi({
  pengguna,
  jumlahNotifAwal = 0,
  onTekanMenu,
}: {
  pengguna: Pengguna
  jumlahNotifAwal?: number
  onTekanMenu: () => void
}) {
  const jalur = usePathname()
  const router = useRouter()
  const warna = WARNA_PERAN[pengguna.peran]
  const [jumlahNotif, setJumlahNotif] = useState(jumlahNotifAwal)
  // Resinkron ke potret server terbaru saat navigasi berpindah halaman
  // (jumlahNotifAwal dihitung ulang tiap kunjungan layout.tsx), TANPA
  // setState di dalam efek — mengikuti pola resmi React "adjusting
  // state when a prop changes" (setState di render, bukan di effect).
  const [awalTerekam, setAwalTerekam] = useState(jumlahNotifAwal)
  if (jumlahNotifAwal !== awalTerekam) {
    setAwalTerekam(jumlahNotifAwal)
    setJumlahNotif(jumlahNotifAwal)
  }

  // KP-6.9-17: penghitung bertambah tanpa memuat ulang halaman selama
  // aplikasi terbuka. KP-6.9-18: bila sambungan sempat terputus, potret
  // awal (dari Server Component saat halaman dibuka/muat ulang) yang
  // menjaga penghitung tetap benar — tidak ada yang perlu disusulkan
  // secara khusus di sini.
  useEffect(() => {
    const supabase = klienBrowser()
    const kanal = supabase
      .channel(`notifikasi-lonceng-${pengguna.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifikasi',
        filter: `penerima_id=eq.${pengguna.id}`,
      }, () => setJumlahNotif(v => v + 1))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'notifikasi',
        filter: `penerima_id=eq.${pengguna.id}`,
      }, payload => {
        const lama = payload.old as { dibaca_pada?: string | null }
        const baru = payload.new as { dibaca_pada?: string | null }
        if (!lama?.dibaca_pada && baru?.dibaca_pada) setJumlahNotif(v => Math.max(0, v - 1))
      })
      .subscribe()

    return () => { supabase.removeChannel(kanal) }
  }, [pengguna.id, jumlahNotifAwal])

  const butir = [...PROFIL[pengguna.peran].nav].sort((a, b) => ('rute' in b ? b.rute.length : 0) - ('rute' in a ? a.rute.length : 0)).find(
    b => 'rute' in b && (jalur === b.rute || jalur.startsWith(b.rute + '/')),
  )
  const judulKhusus = jalur.startsWith('/penugasan/terbitkan') ? 'Terbitkan Penugasan'
    : jalur === '/penugasan/scan' ? 'Pindai Surat Perintah'
    : /^\/penugasan\/[^/]+\/sunting$/.test(jalur) ? 'Revisi Penugasan'
    : /^\/penugasan\/[^/]+$/.test(jalur) && jalur !== '/penugasan/pengajuan' ? 'Detail Penugasan'
    : /^\/laporan\/[^/]+$/.test(jalur) ? 'Detail Laporan'
    : /^\/lhp\/[^/]+$/.test(jalur) ? 'Detail LHP Ringkas'
    : jalur === '/pemberitahuan' ? 'Pemberitahuan' : null
  const judul = judulKhusus ?? (butir && 'label' in butir ? butir.label : '')

  return (
    <header id="hd">
      <button className="ikon-btn" onClick={onTekanMenu} aria-label="Menu">
        <Ikon nama="menu" />
      </button>

      <div className="jejak">{judul}</div>

      <div className="hd-kanan">
        {/* Akun Pemeliharaan tidak pernah menerima pemberitahuan
            (KP-6.9-41) — lonceng yang tidak mungkin pernah berisi
            apa pun tidak ditampilkan, sejalan BR-11. */}
        {pengguna.peran !== 'pemeliharaan' && (
          <button
            className="ikon-btn"
            style={{ position: 'relative' }}
            onClick={() => router.push('/pemberitahuan')}
            aria-label="Pemberitahuan"
          >
            <Ikon nama="lonceng" />
            {jumlahNotif > 0 && <span className="lonceng-titik">{labelJumlah(jumlahNotif)}</span>}
          </button>
        )}
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
