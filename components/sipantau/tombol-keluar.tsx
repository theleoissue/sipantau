'use client'

import { useState, useTransition } from 'react'
import { keluar, cekSedangBertugas } from '@/app/(app)/aksi-keluar'
import { Ikon } from './ikon'

/**
 * KP-6.1-26: permintaan keluar dikonfirmasi lebih dulu, dan setelah
 * dikonfirmasi Sesi Masuk berakhir tanpa persetujuan siapa pun.
 *
 * KP-6.1-28: bila Sesi Tugas sedang berjalan, dialog memberi tahu lebih
 * dulu bahwa sesinya akan ditutup, sehingga pengguna dapat membatalkan.
 * sedangBertugas diperiksa SESAAT tombol ini ditekan (cekSedangBertugas,
 * app/(app)/aksi-keluar.ts) — BUKAN dibaca di layout.tsx pada setiap
 * navigasi. Dialog ini jarang dibuka, jadi tidak ada alasan menanggung
 * satu perjalanan bolak-balik tambahan ke basis data di setiap
 * perpindahan halaman hanya demi kalimat dalam dialog yang jarang tampil.
 */
export function TombolKeluar() {
  const [tanya, setTanya] = useState(false)
  const [sedangBertugas, setSedangBertugas] = useState(false)
  const [proses, setProses] = useState(false)
  const [, mulaiCek] = useTransition()

  return (
    <>
      <button
        className="nav-i"
        onClick={() => mulaiCek(async () => {
          setSedangBertugas(await cekSedangBertugas())
          setTanya(true)
        })}
      >
        <Ikon nama="keluar" />
        <span className="lbl">Keluar</span>
      </button>

      {tanya && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-keluar"
          onClick={e => { if (e.target === e.currentTarget) setTanya(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(10,17,30,.6)',
            display: 'grid', placeItems: 'center', padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--card)', borderRadius: 14, padding: 24,
              maxWidth: 380, width: '100%', boxShadow: 'var(--sh-lg)',
            }}
          >
            <h3 id="judul-keluar" style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>
              Keluar dari aplikasi?
            </h3>

            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 10 }}>
              {sedangBertugas
                ? 'Sesi Tugas Anda yang sedang berjalan akan ditutup. Rute yang sudah terekam tetap tersimpan utuh, dan Kanit serta Panit Penanggung Jawab akan diberi tahu.'
                : 'Anda perlu memasukkan NRP dan kata sandi lagi untuk masuk kembali.'}
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-o"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setTanya(false)}
                disabled={proses}
              >
                Batal
              </button>
              <form
                action={keluar}
                style={{ flex: 1 }}
                onSubmit={() => setProses(true)}
              >
                <button
                  type="submit"
                  className="btn btn-d"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={proses}
                >
                  {proses ? 'Keluar…' : 'Ya, keluar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
