'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'next/navigation'

/** Menyambungkan tombol Back fisik Android ke riwayat navigasi Next.js. */
export function NavigasiPerangkat() {
  const router = useRouter()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let dibuang = false
    let pendengar: Awaited<ReturnType<typeof App.addListener>> | undefined
    void App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) router.back()
      else void App.exitApp()
    }).then(handle => {
      if (dibuang) void handle.remove()
      else pendengar = handle
    })

    return () => {
      dibuang = true
      void pendengar?.remove()
    }
  }, [router])

  return null
}
