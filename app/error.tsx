'use client'

import Link from 'next/link'

// Batas galat akar — menangkap kegagalan pada app/(app)/layout.tsx
// sendiri (mis. sesi tidak dapat dibaca, basis data tak terjangkau)
// sebelum kerangka aplikasi (bilah samping/header) sempat tergambar.
// Karena itu halaman ini BERDIRI SENDIRI, mengikuti gaya #masuk
// (sipantau-mockup-v2-sprin.html), bukan meniru kartu di dalam aplikasi
// yang mengandaikan bilah samping sudah ada.
//
// app/(app)/error.tsx menangani galat yang lebih umum — kegagalan pada
// SATU halaman saja setelah kerangka aplikasi berhasil tergambar.

export default function GalatAkar({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div id="masuk">
      <div className="kotak">
        <div className="lambang">SP</div>
        <h1>SI PANTAU</h1>
        <div className="sub">Terjadi kesalahan yang tidak terduga</div>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,.72)', lineHeight: 1.6,
          textAlign: 'center', marginTop: 14, marginBottom: 22,
        }}>
          Sistem tidak dapat menampilkan halaman ini. Ini kegagalan sistem,
          bukan tanda kesalahan Anda — coba lagi, atau masuk ulang bila
          berulang.
        </p>
        <button
          className="btn-masuk"
          onClick={reset}
          style={{ width: '100%' }}
        >
          Coba lagi
        </button>
        <Link
          href="/masuk"
          style={{
            display: 'block', textAlign: 'center', marginTop: 14,
            fontSize: 12.5, color: 'rgba(255,255,255,.6)',
          }}
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  )
}
