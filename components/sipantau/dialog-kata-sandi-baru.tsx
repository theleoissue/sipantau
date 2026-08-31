'use client'

import { useState } from 'react'
import { Ikon } from './ikon'

/**
 * Layar kata sandi awal/hasil reset — §6.6.5 docs/60-modul-6.6-6.9-user-
 * notif.md: "Muncul sekali setelah akun dibuat atau kata sandi direset.
 * Menampilkan NRP dan kata sandi dalam aksara besar yang mudah
 * dibacakan. Satu tombol untuk menyalin, satu tombol untuk menutup.
 * Peringatan bahwa layar ini tidak dapat dibuka kembali ditulis sebelum
 * tombol tutup, bukan sesudahnya."
 *
 * BR-76: kata sandi TIDAK PERNAH disimpan di state React manapun selain
 * di sini, dan lenyap begitu onTutup dipanggil — tidak ada jalan untuk
 * memunculkannya kembali dari dalam aplikasi.
 */
export function DialogKataSandiBaru({
  nama,
  nrp,
  kataSandi,
  onTutup,
}: {
  nama: string
  nrp: string
  kataSandi: string
  onTutup: () => void
}) {
  const [tersalin, setTersalin] = useState(false)

  async function salin() {
    try {
      await navigator.clipboard.writeText(kataSandi)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 2500)
    } catch {
      // Clipboard API bisa ditolak browser (izin, konteks non-aman).
      // Kata sandi tetap terlihat di layar untuk disalin manual.
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(10,17,30,.7)',
        display: 'grid', placeItems: 'center', padding: 20,
      }}
    >
      <div style={{
        background: 'var(--card)', borderRadius: 14, padding: 28,
        maxWidth: 420, width: '100%', boxShadow: 'var(--sh-lg)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>Kata sandi baru — {nama}</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 8 }}>
          Sampaikan kepada personel ini. Layar ini hanya tampil satu kali dan tidak dapat dibuka kembali.
        </p>

        <div style={{
          marginTop: 18, padding: '16px 18px', borderRadius: 10,
          background: 'var(--bg)', border: '1px solid var(--line-2)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 650, color: 'var(--ink-3)', letterSpacing: '.04em' }}>NRP</div>
          <div style={{ fontSize: 20, fontWeight: 650, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '.03em', color: 'var(--ink)' }}>
            {nrp}
          </div>
          <div style={{ fontSize: 11, fontWeight: 650, color: 'var(--ink-3)', letterSpacing: '.04em', marginTop: 14 }}>KATA SANDI</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '.08em', color: 'var(--primary)' }}>
            {kataSandi}
          </div>
        </div>

        <button
          className="btn btn-o"
          style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}
          onClick={salin}
        >
          <Ikon nama={tersalin ? 'centang' : 'salin'} />
          {tersalin ? 'Tersalin' : 'Salin kata sandi'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--red)', lineHeight: 1.5, marginTop: 16 }}>
          Pastikan sudah dicatat atau disampaikan — layar ini tidak dapat dibuka kembali setelah ditutup.
        </p>

        <button
          className="btn btn-p"
          style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
          onClick={onTutup}
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
