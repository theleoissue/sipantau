'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PESAN: Record<string, string> = {
  // KP-6.1-17: dialihkan ke beranda disertai pesan sekilas. Sistem
  // DILARANG menampilkan halaman galat yang membenarkan keberadaan
  // halaman yang dituju.
  'diluar-kewenangan': 'Halaman itu di luar kewenangan Anda.',
  // KP-6.1-22: penanda kecil saat kewenangan berubah di tengah jalan.
  'kewenangan-berubah': 'Kewenangan Anda baru saja diperbarui.',
}

function Isi() {
  const params = useSearchParams()
  const kunci = params.get('pesan')
  const [tampil, setTampil] = useState(true)

  useEffect(() => {
    if (!kunci) return
    const jam = setTimeout(() => setTampil(false), 5000)
    return () => clearTimeout(jam)
  }, [kunci])

  if (!kunci || !PESAN[kunci] || !tampil) return null

  return (
    <div
      role="status"
      style={{
        background: 'var(--amber-bg)',
        color: 'var(--amber)',
        padding: '11px 14px',
        borderRadius: 'var(--r-sm)',
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 18,
      }}
    >
      {PESAN[kunci]}
    </div>
  )
}

export function PesanSekilas() {
  return <Suspense fallback={null}><Isi /></Suspense>
}
