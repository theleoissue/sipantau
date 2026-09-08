'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'

/** Warna ikon sistem mengikuti halaman, bukan tema gelap/terang perangkat. */
export function TampilanPerangkat() {
  const jalur = usePathname()
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const gelap = jalur === '/masuk'
    void SystemBars.setStyle({ style: gelap ? SystemBarsStyle.Dark : SystemBarsStyle.Light })
      .catch(() => { /* APK lama tetap bisa membuka halaman tanpa SystemBars. */ })
  }, [jalur])
  return null
}
