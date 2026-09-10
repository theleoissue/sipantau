'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { usePathname, useRouter } from 'next/navigation'

/** Menyambungkan tombol Back fisik Android ke riwayat navigasi Next.js. */
export function NavigasiPerangkat() {
  const router = useRouter()
  const jalur = usePathname()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let dibuang = false
    let pendengar: Awaited<ReturnType<typeof App.addListener>> | undefined
    void App.addListener('backButton', ({ canGoBack }) => {
      const modal = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1)
      if (modal) {
        modal.dispatchEvent(new Event('cancel', { cancelable: true }))
        return
      }
      const kembali = new Event('sipantau:kembali', { cancelable: true })
      if (!window.dispatchEvent(kembali)) return
      if (canGoBack) router.back()
      // Tautan langsung/pemulihan WebView kadang tidak memiliki riwayat
      // browser meski pengguna sedang jauh dari Beranda. Kembali ke
      // Beranda lebih berguna daripada menutup aplikasi mendadak.
      else if (jalur.startsWith('/penugasan/')) router.replace('/penugasan')
      else if (jalur.startsWith('/lhp/')) router.replace('/lhp')
      else if (jalur !== '/beranda' && jalur !== '/pemeliharaan') router.replace('/beranda')
      else void App.minimizeApp()
    }).then(handle => {
      if (dibuang) void handle.remove()
      else pendengar = handle
    })

    return () => {
      dibuang = true
      void pendengar?.remove()
    }
  }, [jalur, router])

  return null
}
