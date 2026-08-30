'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { selesaiTugas, tandaiIzinTerputus, tandaiIzinPulih, mulaiTugasWeb, kirimTitikWeb } from '@/app/(app)/tugas/aksi'
import { penandaPerangkatWeb } from '@/lib/gps/penanda-perangkat'
import type { SesiAktifSaya } from '@/lib/gps/tipe'
import { Ikon } from './ikon'

const JEDA_KIRIM_TITIK_MS = 20_000

function lamaBerjalan(dibukaPada: string): string {
  const menit = Math.floor((Date.now() - new Date(dibukaPada).getTime()) / 60_000)
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisaMenit = menit % 60
  return `${jam} jam ${sisaMenit} menit`
}

interface SptRingkas { id: string; nomor_spt: string | null; judul: string }

/**
 * BR-65 / KP-6.4-67: tombol Mulai Tugas TIDAK PERNAH dirender di bentuk
 * web SUNGGUHAN (Android nanti). Blok "Uji Coba: Mulai Tugas dari Web"
 * di bawah adalah PENGECUALIAN SENGAJA — migrasi 0031 mencabut lapis
 * kedua penegakannya atas permintaan eksplisit pemilik produk, sesudah
 * risikonya disampaikan lengkap: pelacakan lewat peramban berhenti
 * DIAM-DIAM begitu tab ditutup atau layar terkunci (tidak ada layanan
 * latar depan), dan itu bisa membuat Kanit salah menyimpulkan
 * Anggotanya kabur — persis kekeliruan yang coba dicegah BR-65
 * (docs/40-modul-6.4-gps.md baris 440-447). Dipakai untuk uji coba/
 * demo, BUKAN pengganti Langkah 4 (Bangun APK Android, CLAUDE.md §10).
 */
export function KartuSesiTugas({
  sesi,
  sptTersedia,
}: {
  sesi: SesiAktifSaya | null
  sptTersedia: SptRingkas[]
}) {
  const router = useRouter()
  const [tanya, setTanya] = useState(false)
  const [proses, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)
  const izinTerputus = sesi ? sesi.izin_dicabut_pada !== null && sesi.izin_dipulihkan_pada === null : false

  const [sptDipilih, setSptDipilih] = useState('')
  const [memulai, setMemulai] = useState(false)
  const [galatMulai, setGalatMulai] = useState<string | null>(null)

  const iniSesiWeb = sesi?.penanda_perangkat.startsWith('web-') ?? false
  const [jumlahTerkirim, setJumlahTerkirim] = useState(0)
  const [galatKirim, setGalatKirim] = useState<string | null>(null)
  const idPengawas = useRef<number | null>(null)
  const sedangMengirim = useRef(false)
  const terakhirKirim = useRef(0)

  // Selama sesi WEB ini berjalan (dan komponennya tetap terpasang di
  // tab ini — BR-65 mengingatkan: berhenti begitu tab ditutup), kirim
  // Titik berkala lewat watchPosition. Dijeda manual JEDA_KIRIM_TITIK_MS
  // supaya tidak mengirim di setiap pembaruan GPS mentah.
  useEffect(() => {
    if (!sesi || !iniSesiWeb || !navigator.geolocation) return

    idPengawas.current = navigator.geolocation.watchPosition(
      async pos => {
        const kini = Date.now()
        if (sedangMengirim.current || kini - terakhirKirim.current < JEDA_KIRIM_TITIK_MS) return
        sedangMengirim.current = true
        terakhirKirim.current = kini
        const r = await kirimTitikWeb(
          sesi.id, pos.coords.latitude, pos.coords.longitude,
          pos.coords.accuracy ?? null, pos.coords.speed ?? null,
          penandaPerangkatWeb(),
        )
        sedangMengirim.current = false
        if (r.galat) setGalatKirim(r.galat)
        else setJumlahTerkirim(n => n + 1)
      },
      () => setGalatKirim('Izin lokasi ditolak atau tidak tersedia — Titik berhenti terekam.'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    )

    return () => {
      if (idPengawas.current !== null) navigator.geolocation.clearWatch(idPengawas.current)
    }
  }, [sesi, iniSesiWeb])

  function mulaiTugasDariWeb() {
    if (!sptDipilih || !navigator.geolocation) return
    setGalatMulai(null)
    setMemulai(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        mulai(async () => {
          const r = await mulaiTugasWeb(
            sptDipilih, pos.coords.latitude, pos.coords.longitude,
            pos.coords.accuracy ?? null, penandaPerangkatWeb(),
          )
          setMemulai(false)
          if (r.galat) setGalatMulai(r.galat)
          else router.refresh()
        })
      },
      () => { setMemulai(false); setGalatMulai('Izin lokasi ditolak. Aktifkan izin lokasi peramban untuk memulai.') },
      { enableHighAccuracy: true, timeout: 20_000 },
    )
  }

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

        {sptTersedia.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,.25)' }}>
            <div className="sesi-syarat" style={{ color: '#FDE68A', marginBottom: 10 }}>
              <Ikon nama="awas" />
              <span>
                Uji coba: Mulai Tugas dari web. Perekaman berhenti diam-diam
                begitu tab ini ditutup atau layar terkunci — bukan untuk
                dipakai sungguhan di lapangan.
              </span>
            </div>
            <select
              value={sptDipilih} onChange={e => setSptDipilih(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 8, marginBottom: 8 }}
            >
              <option value="">Pilih penugasan…</option>
              {sptTersedia.map(s => (
                <option key={s.id} value={s.id}>{s.nomor_spt ?? s.judul} — {s.judul.slice(0, 40)}</option>
              ))}
            </select>
            <button
              type="button" className="btn btn-o btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', width: '100%', justifyContent: 'center' }}
              disabled={!sptDipilih || memulai}
              onClick={mulaiTugasDariWeb}
            >
              {memulai ? 'Meminta izin lokasi…' : 'Mulai Tugas (uji coba web)'}
            </button>
            {galatMulai && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 8 }}>{galatMulai}</p>}
          </div>
        )}
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

      {iniSesiWeb && (
        <div className="sesi-syarat" style={{ color: '#FDE68A' }}>
          <Ikon nama="awas" />
          <span>
            Sesi uji coba web — jaga tab ini tetap terbuka dan layar
            menyala. {jumlahTerkirim > 0 && `${jumlahTerkirim} titik terkirim dari tab ini.`}
          </span>
        </div>
      )}
      {galatKirim && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 8 }}>{galatKirim}</p>}

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
