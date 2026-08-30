'use client'

import { useState, useTransition } from 'react'
import { selesaiTugas, tandaiIzinTerputus, tandaiIzinPulih } from '@/app/(app)/tugas/aksi'
import type { SesiAktifSaya } from '@/lib/gps/tipe'
import { Ikon } from './ikon'

function lamaBerjalan(dibukaPada: string): string {
  const menit = Math.floor((Date.now() - new Date(dibukaPada).getTime()) / 60_000)
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisaMenit = menit % 60
  return `${jam} jam ${sisaMenit} menit`
}

/**
 * BR-65 / KP-6.4-67: tombol Mulai Tugas TIDAK PERNAH dirender di bentuk
 * web — bukan disembunyikan lewat CSS, memang tidak ada elemennya sama
 * sekali. Bila sesi sedang berjalan (dibuka dari Android), web tetap
 * dapat menampilkan kartunya dan menutup sesi lewat Selesai Tugas —
 * hanya PEMBUKAAN yang eksklusif Android (P-19).
 */
export function KartuSesiTugas({ sesi }: { sesi: SesiAktifSaya | null }) {
  const [tanya, setTanya] = useState(false)
  const [proses, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)
  const izinTerputus = sesi ? sesi.izin_dicabut_pada !== null && sesi.izin_dipulihkan_pada === null : false

  if (!sesi) {
    return (
      <div className="sesi-kartu">
        <div className="lb">Sesi tugas</div>
        <div className="nilai">Belum ada sesi berjalan</div>
        <div className="ket">
          Sesi Tugas dan perekaman posisi hanya dapat dimulai dari aplikasi
          Android SiPANTAU terpasang. Bentuk web tetap dapat membaca
          penugasan, mengirim laporan, dan melihat Rute — perekaman
          posisinya sendiri memerlukan layanan latar depan yang tidak
          tersedia bagi halaman web.
        </div>
        <div className="sesi-syarat">
          <Ikon nama="satelit" />
          <span>Berkas pemasangan Android belum tersedia — menyusul pada tahap berikutnya.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="sesi-kartu jalan">
      <div className="lb">Sesi tugas berjalan</div>
      <div className="nilai">{lamaBerjalan(sesi.dibuka_pada)}</div>
      <div className="ket">
        Pelacakan aktif sejak Mulai Tugas · {sesi.jumlah_titik} titik terekam
      </div>
      <span className="spt-ket">
        {sesi.nomor_spt ?? sesi.penugasan_id} — {sesi.judul.slice(0, 44)}
        {sesi.judul.length > 44 ? '…' : ''}
      </span>

      {izinTerputus && (
        <div className="sesi-syarat" style={{ color: '#FDE68A' }}>
          <Ikon nama="awas" />
          <span>
            Izin lokasi sedang terputus. Sesi tetap terbuka; pulihkan izin di
            pengaturan perangkat agar posisi kembali terekam.
          </span>
        </div>
      )}

      {galat && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 10 }}>{galat}</p>}

      <div className="geser" onClick={() => setTanya(true)}>
        <div className="kepala"><Ikon nama="stop" /></div>
        <div className="tulis">Geser untuk selesai tugas</div>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="btn btn-o btn-sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}
            disabled={proses}
            onClick={() => mulai(async () => {
              const r = izinTerputus ? await tandaiIzinPulih(sesi.id) : await tandaiIzinTerputus(sesi.id)
              if (r.galat) setGalat(r.galat)
            })}
          >
            {izinTerputus ? 'Tandai izin pulih' : 'Tandai izin terputus'}
          </button>
        </div>
      )}

      {tanya && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={e => { if (e.target === e.currentTarget) setTanya(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(10,17,30,.6)',
            display: 'grid', placeItems: 'center', padding: 20,
          }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 24,
            maxWidth: 380, width: '100%', boxShadow: 'var(--sh-lg)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>
              Selesaikan Sesi Tugas?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 10 }}>
              Perekaman posisi akan berhenti seketika. Rute yang sudah
              terekam tersimpan utuh dan dapat dibuka kembali kapan pun.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setTanya(false)} disabled={proses}
              >
                Batal
              </button>
              <button
                className="btn btn-d" style={{ flex: 1, justifyContent: 'center' }}
                disabled={proses}
                onClick={() => mulai(async () => {
                  const r = await selesaiTugas(sesi.id)
                  if (r.galat) { setGalat(r.galat); setTanya(false) }
                })}
              >
                {proses ? 'Menyelesaikan…' : 'Ya, selesaikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
