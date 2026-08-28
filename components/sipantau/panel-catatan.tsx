'use client'

import { useState, useTransition } from 'react'
import { beriCatatan, setujuiLaporan, tarikLaporan } from '@/app/(app)/laporan/aksi'
import type { CatatanLaporan } from '@/lib/laporan/tipe'

function waktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

export function PanelCatatan({
  laporanId,
  catatan,
  bolehMencatat,
  bolehSetujui,
  bolehTarik,
  terkunci,
}: {
  laporanId: string
  catatan: CatatanLaporan[]
  bolehMencatat: boolean
  bolehSetujui: boolean
  bolehTarik: boolean
  terkunci: boolean
}) {
  const [isi, setIsi] = useState('')
  const [alasanTarik, setAlasanTarik] = useState('')
  const [tanyaTarik, setTanyaTarik] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)
  const [proses, mulai] = useTransition()

  function kirimCatatan(jenis: 'catatan' | 'minta_perbaikan') {
    setGalat(null); setPesan(null)
    mulai(async () => {
      const hasil = await beriCatatan(laporanId, isi, jenis)
      if (hasil?.galat) setGalat(hasil.galat)
      else { setPesan(hasil?.sukses ?? null); setIsi('') }
    })
  }

  function setujui() {
    setGalat(null); setPesan(null)
    mulai(async () => {
      const hasil = await setujuiLaporan(laporanId)
      if (hasil?.galat) setGalat(hasil.galat)
      else setPesan(hasil?.sukses ?? null)
    })
  }

  function tarik() {
    setGalat(null)
    mulai(async () => {
      const hasil = await tarikLaporan(laporanId, alasanTarik)
      if (hasil?.galat) setGalat(hasil.galat)
      else { setPesan(hasil?.sukses ?? null); setTanyaTarik(false) }
    })
  }

  return (
    <section className="kartu">
      <div className="kartu-h"><h3>Catatan peninjau</h3></div>
      <div className="kartu-b">
        {galat && (
          <div role="alert" style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 12.5, marginBottom: 12 }}>
            {galat}
          </div>
        )}
        {pesan && (
          <div role="status" style={{ background: 'var(--green-bg)', color: 'var(--green)', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 12.5, marginBottom: 12 }}>
            {pesan}
          </div>
        )}

        {catatan.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>
            Belum ada catatan.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {catatan.map(c => (
              <div className="nota" key={c.id}>
                <b>
                  {c.users?.nama ?? '—'}
                  {c.jenis === 'minta_perbaikan' && (
                    <span className="lc bermasalah" style={{ marginLeft: 6, fontSize: 10 }}>minta perbaikan</span>
                  )}
                </b>
                {c.isi}
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                  {waktu(c.dibuat_pada)}{c.disunting_pada ? ' · disunting' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {bolehMencatat && !terkunci && (
          <>
            <textarea
              value={isi} onChange={e => setIsi(e.target.value)}
              placeholder="Tulis catatan untuk pelapor" style={{ marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-p btn-sm" onClick={() => kirimCatatan('catatan')} disabled={proses}>
                Beri catatan
              </button>
              <button type="button" className="btn btn-o btn-sm" onClick={() => kirimCatatan('minta_perbaikan')} disabled={proses}>
                Minta perbaikan
              </button>
            </div>
          </>
        )}

        {(bolehSetujui || bolehTarik) && !terkunci && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            {bolehSetujui && (
              <button type="button" className="btn btn-g btn-sm" onClick={setujui} disabled={proses}>
                Setujui laporan
              </button>
            )}
            {bolehTarik && (
              <button type="button" className="btn btn-d btn-sm" onClick={() => setTanyaTarik(true)} disabled={proses}>
                Tarik laporan
              </button>
            )}
          </div>
        )}

        {tanyaTarik && (
          <div
            role="dialog" aria-modal="true"
            onClick={e => { if (e.target === e.currentTarget) setTanyaTarik(false) }}
            style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,17,30,.6)', display: 'grid', placeItems: 'center', padding: 20 }}
          >
            <div style={{ background: 'var(--card)', borderRadius: 14, padding: 24, maxWidth: 400, width: '100%' }}>
              <h3 style={{ fontSize: 16, fontWeight: 650 }}>Tarik laporan ini?</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>
                Laporan tetap tersimpan dan tetap terbaca peninjau, ditandai ditarik. Alasan wajib diisi.
              </p>
              <textarea
                value={alasanTarik} onChange={e => setAlasanTarik(e.target.value)}
                placeholder="Alasan penarikan" style={{ marginTop: 12 }} autoFocus
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => setTanyaTarik(false)}>Batal</button>
                <button type="button" className="btn btn-d" style={{ flex: 1, justifyContent: 'center' }}
                        onClick={tarik} disabled={proses}>Ya, tarik</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
