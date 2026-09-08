'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Lapisan modal native: fokus tertahan, Escape, dan tidak terpotong kartu/peta. */
export function DialogModal({ children, label, onTutup, terkunci = false, tutupLewatLatar = true }: {
  children: ReactNode
  label: string
  onTutup: () => void
  terkunci?: boolean
  tutupLewatLatar?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current!
    const fokusSebelumnya = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    el.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      el.close()
      document.body.style.overflow = overflow
      fokusSebelumnya?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog ref={dialog} className="dialog-modal" aria-label={label}
      onKeyDown={e => {
        if (e.key !== 'Tab') return
        const daftar = [...e.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        )].filter(el => el.getClientRects().length > 0)
        const awal = daftar[0], akhir = daftar[daftar.length - 1]
        if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir?.focus() }
        else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal?.focus() }
      }}
      onCancel={e => { e.preventDefault(); if (!terkunci && tutupLewatLatar) onTutup() }}
      onClick={e => { if (e.target === e.currentTarget && !terkunci && tutupLewatLatar) onTutup() }}>
      {children}
    </dialog>
  )
}
