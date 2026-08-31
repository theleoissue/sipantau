'use client'

import { Ikon } from '@/components/sipantau/ikon'

// Batas galat untuk SATU halaman di dalam aplikasi — bilah samping dan
// header (app/(app)/layout.tsx) sudah berhasil tergambar lebih dulu,
// jadi tampilan ini hanya menggantikan ISI halaman, mengikuti gaya
// .kosong yang sudah dipakai untuk keadaan kosong di seluruh aplikasi
// (bukan pemutar berputar, docs/CLAUDE.md §7.3).
export default function GalatHalaman({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="kartu">
      <div className="kosong" style={{ padding: '52px 24px' }}>
        <div className="ic" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
          <Ikon nama="awas" />
        </div>
        <h3>Halaman ini gagal dimuat</h3>
        <p>
          Ini kegagalan sistem, bukan tanda kesalahan Anda. Coba lagi —
          bila berulang, hubungi Kanit unit Anda.
        </p>
        <button className="btn btn-p" onClick={reset}>
          Coba lagi
        </button>
      </div>
    </section>
  )
}
