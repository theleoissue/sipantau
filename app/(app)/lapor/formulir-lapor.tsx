'use client'

import { useState, useTransition, useEffect } from 'react'
import { kirimLaporan } from './aksi'
import { LABEL_ALASAN_LOKASI, type SptUntukLapor, type AlasanLokasi } from '@/lib/laporan/tipe'
import { Ikon } from '@/components/sipantau/ikon'

const ALASAN: AlasanLokasi[] = [
  'gps_tidak_tertangkap', 'daya_habis', 'izin_lokasi_mati',
  'area_terbatas', 'disusun_setelah_pulang', 'perangkat_rusak', 'lainnya',
]

/** Penanda perangkat sederhana, disimpan di localStorage. Bukan
 *  Perangkat Terdaftar sungguhan (mekanisme itu belum dibangun, lihat
 *  catatan migrasi 0010) — sekadar identitas kasar untuk jejak audit. */
function ambilPenandaPerangkat(): string {
  const kunci = 'sipantau_penanda_perangkat'
  let nilai = localStorage.getItem(kunci)
  if (!nilai) {
    nilai = crypto.randomUUID()
    localStorage.setItem(kunci, nilai)
  }
  return nilai
}

type StatusGeo = 'mencari' | 'berhasil' | 'gagal'

export function FormulirLapor({ daftarSpt }: { daftarSpt: SptUntukLapor[] }) {
  const [sptId, setSptId] = useState(daftarSpt[0]?.id ?? '')
  const [jenis, setJenis] = useState('perkembangan')
  const [statusKegiatan, setStatusKegiatan] = useState('berjalan')
  const [uraian, setUraian] = useState('')
  const [kendala, setKendala] = useState('')
  const [lokasiId, setLokasiId] = useState('')
  const [keteranganLokasi, setKeteranganLokasi] = useState('')
  const [alasan, setAlasan] = useState<AlasanLokasi>('gps_tidak_tertangkap')
  const [alasanLainnya, setAlasanLainnya] = useState('')
  const [galat, setGalat] = useState<string | null>(null)
  const [menyimpan, mulai] = useTransition()

  // Bila API-nya tidak ada sama sekali, keadaan awal langsung 'gagal' —
  // dihitung sekali saat inisialisasi, bukan lewat setState di dalam
  // efek (yang memicu render beruntun untuk kasus yang sudah pasti
  // sejak render pertama).
  const [statusGeo, setStatusGeo] = useState<StatusGeo>(
    () => (typeof navigator !== 'undefined' && navigator.geolocation) ? 'mencari' : 'gagal')
  const [koordinat, setKoordinat] = useState<{ lat: number; lng: number; akurasi: number } | null>(null)

  // Kotak lokasi menampilkan keadaan mencari sinyal selama GPS dibaca.
  // Pelapor TIDAK PERNAH terkunci menunggu — tombol Lewati langsung
  // membuka pemilih alasan (6.3.5).
  useEffect(() => {
    if (!navigator.geolocation) return
    const jam = navigator.geolocation.getCurrentPosition(
      pos => {
        setKoordinat({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: pos.coords.accuracy,
        })
        setStatusGeo('berhasil')
      },
      () => setStatusGeo('gagal'),
      { timeout: 10_000, enableHighAccuracy: true },
    )
    return () => { if (typeof jam === 'number') navigator.geolocation.clearWatch(jam) }
  }, [])

  const spt = daftarSpt.find(s => s.id === sptId)
  const lewatBatas = spt?.tanggal_batas ? spt.tanggal_batas < new Date().toISOString().slice(0, 10) : false
  const lokasiGagal = statusGeo === 'gagal'

  function kirim() {
    setGalat(null)
    if (!sptId) { setGalat('Pilih penugasan terlebih dahulu.'); return }

    mulai(async () => {
      const hasil = await kirimLaporan({
        penugasan_id: sptId,
        jenis,
        status_kegiatan: statusKegiatan,
        uraian,
        kendala,
        lokasi_id: lokasiId || null,
        lokasi_lat: statusGeo === 'berhasil' ? koordinat!.lat : null,
        lokasi_lng: statusGeo === 'berhasil' ? koordinat!.lng : null,
        akurasi_meter: statusGeo === 'berhasil' ? koordinat!.akurasi : null,
        alasan_lokasi: statusGeo !== 'berhasil' ? alasan : null,
        alasan_lokasi_lainnya: alasan === 'lainnya' ? alasanLainnya : '',
        keterangan_lokasi: keteranganLokasi,
        penanda_perangkat: ambilPenandaPerangkat(),
      })
      if (hasil?.galat) setGalat(hasil.galat)
    })
  }

  if (daftarSpt.length === 0) {
    return (
      <div className="kartu">
        <div className="kosong">
          <Ikon nama="lapor" />
          <h3>Belum ada penugasan aktif</h3>
          <p>Anda belum tercantum sebagai pelaksana pada penugasan yang sedang berjalan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="kisi k-2">
      <section className="kartu">
        <div className="kartu-h"><h3>Formulir laporan</h3></div>
        <div className="kartu-b">
          {galat && (
            <div role="alert" style={{
              background: 'var(--red-bg)', color: 'var(--red)', padding: '10px 12px',
              borderRadius: 'var(--r-sm)', fontSize: 13, marginBottom: 16,
            }}>
              {galat}
            </div>
          )}

          {lewatBatas && (
            <div className="kartu" style={{ marginBottom: 16, borderLeft: '3px solid var(--red)' }}>
              <div className="kartu-b" style={{ fontSize: 13, color: 'var(--red)' }}>
                Batas waktu penugasan ini sudah terlampaui. Laporan tetap dapat dikirim.
              </div>
            </div>
          )}

          <div className="fg">
            <label>Penugasan <span className="wajib">*</span></label>
            <select value={sptId} onChange={e => { setSptId(e.target.value); setLokasiId('') }}>
              {daftarSpt.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nomor_spt ?? '(belum bernomor)'} — {s.judul}
                </option>
              ))}
            </select>
            <div className="bantu">Hanya penugasan yang masih berjalan dapat dipilih.</div>
          </div>

          {spt && spt.penugasan_lokasi.length > 0 && (
            <div className="fg">
              <label>Titik lokasi tugas</label>
              <select value={lokasiId} onChange={e => setLokasiId(e.target.value)}>
                <option value="">Tidak pada titik mana pun</option>
                {[...spt.penugasan_lokasi].sort((a, b) => a.urutan - b.urutan).map(l => (
                  <option key={l.id} value={l.id}>Titik {l.urutan} — {l.nama}</option>
                ))}
              </select>
            </div>
          )}

          <div className="f2">
            <div className="fg">
              <label>Jenis laporan <span className="wajib">*</span></label>
              <select value={jenis} onChange={e => setJenis(e.target.value)}>
                <option value="pulbaket_awal">Pulbaket Awal</option>
                <option value="perkembangan">Perkembangan</option>
                <option value="akhir">Akhir</option>
              </select>
            </div>
            <div className="fg">
              <label>Status kegiatan <span className="wajib">*</span></label>
              <select value={statusKegiatan} onChange={e => setStatusKegiatan(e.target.value)}>
                <option value="berjalan">Berjalan</option>
                <option value="selesai">Selesai</option>
                <option value="bermasalah">Bermasalah</option>
              </select>
            </div>
          </div>

          {/* Kotak lokasi: tiga fakta berdampingan, tidak pernah
              menyimpulkan (Aturan Modul 6.3.4 #2). */}
          <div className="fg">
            <label>Lokasi</label>
            {statusGeo === 'mencari' && (
              <div className="kartu" style={{ padding: 14 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Mencari sinyal GPS…</div>
                <button type="button" className="btn btn-o btn-sm" style={{ marginTop: 8 }}
                        onClick={() => setStatusGeo('gagal')}>
                  Lewati
                </button>
              </div>
            )}
            {statusGeo === 'berhasil' && koordinat && (
              <div className="kartu" style={{ padding: 14, borderLeft: '3px solid var(--green)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Koordinat terekam</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, fontFamily: 'var(--mono)' }}>
                  {koordinat.lat.toFixed(5)}, {koordinat.lng.toFixed(5)} · ketelitian ±{Math.round(koordinat.akurasi)}m
                </div>
                <div className="bantu">
                  Status lokasi (terverifikasi / di luar titik) dihitung server setelah dikirim.
                </div>
              </div>
            )}
            {lokasiGagal && (
              <>
                <div className="bantu" style={{ marginBottom: 8 }}>
                  Koordinat tidak berhasil direkam. Laporan tetap dapat dikirim — pilih alasannya.
                </div>
                <select value={alasan} onChange={e => setAlasan(e.target.value as AlasanLokasi)}>
                  {ALASAN.map(a => <option key={a} value={a}>{LABEL_ALASAN_LOKASI[a]}</option>)}
                </select>
                {alasan === 'lainnya' && (
                  <input
                    style={{ marginTop: 8 }}
                    value={alasanLainnya}
                    onChange={e => setAlasanLainnya(e.target.value)}
                    placeholder="Uraikan alasannya"
                  />
                )}
              </>
            )}
          </div>

          <div className="fg">
            <label>Uraian kegiatan <span className="wajib">*</span></label>
            <textarea value={uraian} onChange={e => setUraian(e.target.value)}
                      placeholder="Jelaskan kegiatan yang dilaksanakan, temuan di lapangan, dan pihak yang ditemui." />
          </div>

          <div className="fg">
            <label>Kendala di lapangan</label>
            <textarea value={kendala} onChange={e => setKendala(e.target.value)}
                      style={{ minHeight: 76 }} placeholder="Kosongkan bila tidak ada kendala." />
          </div>

          <div className="fg">
            <label>Keterangan lokasi</label>
            <input value={keteranganLokasi} onChange={e => setKeteranganLokasi(e.target.value)}
                   placeholder="Boleh kosong. Contoh: sedang di luar titik karena mengikuti target." />
          </div>

          <div className="bantu" style={{ marginBottom: 12 }}>
            Foto dokumentasi dapat ditambahkan setelah laporan ini terkirim, dari halaman rinciannya.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={kirim} disabled={menyimpan}>
              <Ikon nama="kirim" />
              {menyimpan ? 'Mengirim…' : 'Kirim laporan'}
            </button>
          </div>
        </div>
      </section>

      <section className="kartu" style={{ alignSelf: 'start' }}>
        <div className="kartu-h"><h3>Sebelum mengirim</h3></div>
        <div className="kartu-b">
          <div className="grs">
            {[
              ['Pastikan kegiatan sesuai surat perintah', 'Kegiatan di luar objek dan sasaran penugasan tidak boleh dilaksanakan.'],
              ['Laporan tetap terkirim tanpa koordinat', 'Bila lokasi tidak terekam, laporan tetap masuk dengan alasan yang Anda pilih.'],
              ['Periksa uraian sebelum mengirim', 'Penyuntingan setelah terkirim akan tercatat dan tetap terbaca peninjau.'],
            ].map(([t, d]) => (
              <div className="grs-i rampung" key={t}>
                <div className="kp"><strong>{t}</strong></div>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
