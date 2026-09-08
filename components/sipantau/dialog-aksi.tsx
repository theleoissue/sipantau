'use client'

import { DialogModal } from './dialog-modal'

import { useState, useTransition } from 'react'

export interface HasilDialogAksi {
  galat?: string
  sukses?: string
}

/**
 * Dialog konfirmasi umum untuk tindakan siklus SPT — mengikuti pola
 * yang sama dengan tombol-keluar.tsx. Dipakai berulang (Tutup,
 * Batalkan, Buka Kembali, Bermasalah, dst.) supaya boilerplate modal
 * tidak diulang enam kali.
 *
 * `butuhAlasan` menampilkan kotak teks wajib (alasan_pembatalan,
 * alasan_pencabutan, dan sejenisnya selalu wajib pada kolomnya).
 */
export function DialogAksi({
  terbuka,
  judul,
  keterangan,
  butuhAlasan = false,
  labelAlasan = 'Alasan',
  labelTombol = 'Ya, lanjutkan',
  berbahaya = false,
  onTutup,
  onKonfirmasi,
}: {
  terbuka: boolean
  judul: string
  keterangan: string
  butuhAlasan?: boolean
  labelAlasan?: string
  labelTombol?: string
  berbahaya?: boolean
  onTutup: () => void
  onKonfirmasi: (alasan: string) => Promise<HasilDialogAksi>
}) {
  const [alasan, setAlasan] = useState('')
  const [galat, setGalat] = useState<string | null>(null)
  const [proses, mulai] = useTransition()

  if (!terbuka) return null

  return (
    <DialogModal label={judul} terkunci={proses} onTutup={() => { onTutup(); setAlasan(''); setGalat(null) }}>
      <div style={{
        background: 'var(--card)', borderRadius: 14, padding: 24,
        maxWidth: 420, width: '100%', boxShadow: 'var(--sh-lg)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>{judul}</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 10 }}>
          {keterangan}
        </p>

        {butuhAlasan && (
          <textarea
            aria-label={labelAlasan}
            value={alasan}
            onChange={e => setAlasan(e.target.value)}
            placeholder={`${labelAlasan}…`}
            rows={3}
            style={{
              width: '100%', marginTop: 14, padding: '10px 12px', fontSize: 13,
              border: '1px solid var(--line-2)', borderRadius: 8, resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        )}

        {galat && <p role="alert" style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 10 }}>{galat}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button
            className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }}
            disabled={proses}
            onClick={() => { onTutup(); setAlasan(''); setGalat(null) }}
          >
            Batal
          </button>
          <button
            className={berbahaya ? 'btn btn-d' : 'btn btn-p'}
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={proses || (butuhAlasan && !alasan.trim())}
            onClick={() => mulai(async () => {
              setGalat(null)
              const r = await onKonfirmasi(alasan.trim())
              if (r.galat) setGalat(r.galat)
              else { onTutup(); setAlasan('') }
            })}
          >
            {proses ? 'Memproses…' : labelTombol}
          </button>
        </div>
      </div>
    </DialogModal>
  )
}
