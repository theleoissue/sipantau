'use client'

import { useEffect, useState } from 'react'

import type { Pengguna } from '@/lib/supabase/types'
import { BilahSamping } from './bilah-samping'
import { HeaderAplikasi } from './header-aplikasi'
import { BilahBawah } from './bilah-bawah'
import { useStatusSesi } from '@/lib/gps/use-status-sesi'
import { NotifikasiDorong } from './notifikasi-dorong'

/**
 * Kerangka tiga tingkat, mengikuti perilaku responsif mockup:
 *
 *   > 1024px   bilah samping penuh (264px), selalu terlihat
 *   768-1024   otomatis menyusut jadi rel ikon (76px) supaya konten
 *              tidak tersempit; dapat dipaksa penuh lewat tombol menu
 *   < 768px    bilah samping jadi laci geser, navigasi utama berpindah
 *              ke bilah bawah berisi empat menu pertama peran ini
 *
 * Client Component karena memegang keadaan laci dan rel — keadaan
 * tampilan semacam ini memang tempatnya di sisi klien
 * (docs/CLAUDE.md §6.2).
 */
export function KerangkaAplikasi({
  pengguna,
  namaUnit,
  jumlahNotifAwal = 0,
  children,
}: {
  pengguna: Pengguna
  namaUnit: string | null
  jumlahNotifAwal?: number
  children: React.ReactNode
}) {
  const [laciTerbuka, setLaciTerbuka] = useState(false)
  const [dipaksaPenuh, setDipaksaPenuh] = useState(false)
  const sesiBerjalan = useStatusSesi(pengguna.id, ['anggota', 'panit', 'kanit'].includes(pengguna.peran))

  useEffect(() => {
    if (!laciTerbuka) return
    const fokusAwal = document.activeElement as HTMLElement | null
    document.querySelector<HTMLButtonElement>('#sb .sb-tutup')?.focus()
    const tutup = (event: Event) => { event.preventDefault(); setLaciTerbuka(false) }
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') tutup(event) }
    window.addEventListener('sipantau:kembali', tutup)
    window.addEventListener('keydown', keyboard)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('sipantau:kembali', tutup)
      window.removeEventListener('keydown', keyboard)
      document.body.style.overflow = overflow
      fokusAwal?.focus({ preventScroll: true })
    }
  }, [laciTerbuka])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const perbarui = () => {
      const menulis = document.activeElement?.matches('input, textarea, [contenteditable="true"]')
      document.body.classList.toggle('keyboard-terbuka', !!menulis && window.innerHeight - viewport.height > 150)
    }
    viewport.addEventListener('resize', perbarui)
    document.addEventListener('focusin', perbarui)
    document.addEventListener('focusout', perbarui)
    return () => {
      viewport.removeEventListener('resize', perbarui)
      document.removeEventListener('focusin', perbarui)
      document.removeEventListener('focusout', perbarui)
      document.body.classList.remove('keyboard-terbuka')
    }
  }, [])

  // Laci ditutup lewat penangan klik pada butir navigasi, BUKAN lewat
  // efek yang menyimak perubahan jalur. Menyetel keadaan dari dalam
  // efek menghasilkan render beruntun, dan di telepon itu terlihat
  // sebagai laci yang berkedip sesaat sebelum menutup.

  // Kelas pada <body> supaya aturan responsif mockup (yang menyasar
  // body.mini dan body.laci) bekerja apa adanya tanpa ditulis ulang.
  useEffect(() => {
    document.body.classList.toggle('mini', dipaksaPenuh)
    document.body.classList.toggle('laci', laciTerbuka)
    document.body.classList.add('sudah-masuk')
    return () => { document.body.classList.remove('mini', 'laci') }
  }, [dipaksaPenuh, laciTerbuka])

  return (
    <>
      <NotifikasiDorong />
      <BilahSamping
        sesiBerjalan={sesiBerjalan}
        pengguna={pengguna}
        namaUnit={namaUnit}
        onTutupLaci={() => setLaciTerbuka(false)}
      />

      {laciTerbuka && (
        <div
          onClick={() => setLaciTerbuka(false)}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 95,
            background: 'rgba(10,17,30,.5)',
          }}
        />
      )}

      <div id="rangka">
        <HeaderAplikasi
          menuTerbuka={laciTerbuka || dipaksaPenuh}
          pengguna={pengguna}
          jumlahNotifAwal={jumlahNotifAwal}
          onTekanMenu={() => {
            if (window.innerWidth <= 768) setLaciTerbuka(v => !v)
            else setDipaksaPenuh(v => !v)
          }}
        />
        <main id="utama">{children}</main>
      </div>

      <BilahBawah peran={pengguna.peran} sesiBerjalan={sesiBerjalan} />
    </>
  )
}
