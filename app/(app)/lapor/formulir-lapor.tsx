'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { kirimLaporan } from './aksi'
import { catatFoto } from '@/app/(app)/laporan/aksi'
import { klienBrowser } from '@/lib/supabase/client'
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

type KoordinatFoto = { lat: number; lng: number; akurasi: number }
type FotoSiap = {
  id: string
  berkas: File
  sumber: 'kamera' | 'galeri'
  pratinjau: string
  diambilPada: string | null
  koordinat: KoordinatFoto | null
  status: 'siap' | 'terunggah' | 'gagal'
}

function bacaKoordinatFoto(): Promise<KoordinatFoto | null> {
  if (!navigator.geolocation) return Promise.resolve(null)
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      posisi => resolve({
        lat: posisi.coords.latitude,
        lng: posisi.coords.longitude,
        akurasi: posisi.coords.accuracy,
      }),
      () => navigator.geolocation.getCurrentPosition(
        posisi => resolve({
          lat: posisi.coords.latitude,
          lng: posisi.coords.longitude,
          akurasi: posisi.coords.accuracy,
        }),
        () => resolve(null),
        { timeout: 5_000, maximumAge: 30_000 },
      ),
      { timeout: 12_000, enableHighAccuracy: true, maximumAge: 5_000 },
    )
  })
}

type DrafLaporan = {
  sptId: string; jenis: string; statusKegiatan: string; uraian: string; kendala: string
  lokasiId: string; keteranganLokasi: string; alasan: AlasanLokasi; alasanLainnya: string
}

export function FormulirLapor({ daftarSpt, penggunaId }: { daftarSpt: SptUntukLapor[]; penggunaId: string }) {
  const KUNCI_DRAF = `sipantau:draf-laporan:v2:${penggunaId}`
  const router = useRouter()
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
  const [statusDraf, setStatusDraf] = useState('')
  const sudahPulih = useRef(false)
  const sudahTerkirim = useRef(false)
  const kamera = useRef<HTMLInputElement>(null)
  const galeri = useRef<HTMLInputElement>(null)
  const kunciLokasiKamera = useRef<Promise<KoordinatFoto | null> | null>(null)
  const [foto, setFoto] = useState<FotoSiap[]>([])
  const [laporanTersimpanId, setLaporanTersimpanId] = useState<string | null>(null)

  // Pratinjau foto memakai URL objek, dan itu menahan berkasnya di
  // memori sampai dicabut. hapusFoto sudah mencabut miliknya sendiri;
  // yang belum adalah saat halaman ditinggalkan selagi masih ada foto
  // yang menunggu.
  //
  // Lewat ref, BUKAN lewat daftar gantungan. Efek pembongkaran yang
  // bergantung pada [foto] akan ikut berjalan setiap kali foto
  // bertambah — mencabut pratinjau yang justru sedang tampil, dan
  // gambarnya berubah kosong. Sedangkan dengan daftar kosong, efeknya
  // menutup nilai foto dari render PERTAMA yang masih kosong, sehingga
  // tidak mencabut apa pun. Ref menghindari keduanya.
  const pratinjauHidup = useRef<string[]>([])
  // Efek tanpa daftar gantungan: berjalan sesudah SETIAP render, jadi ref
  // ini selalu memuat daftar terkini. Menyetelnya langsung saat render
  // dilarang (react-hooks/refs) dan memang tidak aman pada render yang
  // dibatalkan React.
  useEffect(() => { pratinjauHidup.current = foto.map(item => item.pratinjau) })
  useEffect(() => () => {
    pratinjauHidup.current.forEach(url => URL.revokeObjectURL(url))
  }, [])

  // Bila API-nya tidak ada sama sekali, keadaan awal langsung 'gagal' —
  // SELALU 'mencari' pada render pertama, di server MAUPUN di klien.
  // Bentuk sebelumnya (`typeof navigator !== 'undefined' && ...`)
  // terlihat aman untuk SSR, tapi justru itu penyebabnya: nilai itu
  // dihitung SEKALI LAGI saat komponen di-hydrate di peramban, dan di
  // sana `navigator` SELALU ada — sedangkan di server tidak pernah ada.
  // Server merender 'gagal', klien merender 'mencari': React membuang
  // pohonnya dan merender ulang seluruhnya ("Hydration failed"), yang
  // terlihat sebagai kedipan/pergantian tampilan sesaat setelah halaman
  // dibuka. Ketetapan 'gagal' saat geolocation sungguh tidak ada
  // sekarang dipindah ke efek di bawah (hanya berjalan di klien),
  // bukan di initializer state yang ikut dijalankan saat SSR.
  const [statusGeo, setStatusGeo] = useState<StatusGeo>('mencari')
  const [koordinat, setKoordinat] = useState<{ lat: number; lng: number; akurasi: number } | null>(null)

  // Kotak lokasi menampilkan keadaan mencari sinyal selama GPS dibaca.
  // Pelapor TIDAK PERNAH terkunci menunggu — tombol Lewati langsung
  // membuka pemilih alasan (6.3.5).
  useEffect(() => {
    // Peramban tanpa API geolocation sama sekali (praktis tidak pernah
    // terjadi di peramban bergerak masa kini): statusGeo tetap
    // 'mencari' selamanya, bukan cacat — tombol Lewati yang sudah
    // tampil sejak awal (baris di bawah) tetap membuka pemilih alasan
    // kapan pun, jadi pelapor tidak pernah terkunci menunggu.
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

  function isiDraf(): DrafLaporan {
    return { sptId, jenis, statusKegiatan, uraian, kendala, lokasiId, keteranganLokasi, alasan, alasanLainnya }
  }

  function simpanDrafLokal(otomatis = false) {
    try {
    const draf = isiDraf()
    const adaIsian = Boolean(draf.uraian.trim() || draf.kendala.trim() || draf.keteranganLokasi.trim() || draf.alasanLainnya.trim())
    if (!adaIsian) {
      localStorage.removeItem(KUNCI_DRAF)
      if (!otomatis) setStatusDraf('Tidak ada isian untuk disimpan.')
      return
    }
    localStorage.setItem(KUNCI_DRAF, JSON.stringify(draf))
    setStatusDraf(otomatis ? 'Draf tersimpan otomatis di perangkat.' : 'Draf tersimpan di perangkat ini.')
    } catch { setStatusDraf('Penyimpanan perangkat tidak tersedia. Isian belum tersimpan.') }
  }

  useEffect(() => {
    if (sudahPulih.current) return
    const pulihkan = window.setTimeout(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_DRAF)
      if (tersimpan) {
        const draf = JSON.parse(tersimpan) as DrafLaporan
        if (!draf || !['sptId', 'jenis', 'statusKegiatan', 'uraian', 'kendala', 'lokasiId', 'keteranganLokasi', 'alasan', 'alasanLainnya'].every(k => typeof draf[k as keyof DrafLaporan] === 'string')) throw new Error('Draf tidak valid')
        if (!daftarSpt.some(s => s.id === draf.sptId)) {
          localStorage.removeItem(KUNCI_DRAF)
          sudahPulih.current = true
          return
        }
        setSptId(draf.sptId)
        setJenis(draf.jenis || 'perkembangan')
        setStatusKegiatan(draf.statusKegiatan || 'berjalan')
        setUraian(draf.uraian || '')
        setKendala(draf.kendala || '')
        setLokasiId(draf.lokasiId || '')
        setKeteranganLokasi(draf.keteranganLokasi || '')
        setAlasan(draf.alasan || 'gps_tidak_tertangkap')
        setAlasanLainnya(draf.alasanLainnya || '')
        setStatusDraf('Draf sebelumnya dipulihkan dari perangkat ini.')
      }
    } catch { setStatusDraf('Draf tidak dapat dipulihkan dari perangkat ini.') }
    sudahPulih.current = true
    }, 0)
    return () => window.clearTimeout(pulihkan)
  }, [daftarSpt, KUNCI_DRAF])

  useEffect(() => {
    if (!sudahPulih.current) return
    const simpan = () => {
      if (sudahTerkirim.current) return
      try {
      const draf: DrafLaporan = { sptId, jenis, statusKegiatan, uraian, kendala, lokasiId, keteranganLokasi, alasan, alasanLainnya }
      const adaIsian = Boolean(draf.uraian.trim() || draf.kendala.trim() || draf.keteranganLokasi.trim() || draf.alasanLainnya.trim())
      if (!adaIsian) { localStorage.removeItem(KUNCI_DRAF); return }
      localStorage.setItem(KUNCI_DRAF, JSON.stringify(draf))
      setStatusDraf('Draf tersimpan otomatis di perangkat.')
      } catch { setStatusDraf('Penyimpanan perangkat tidak tersedia. Isian belum tersimpan.') }
    }
    const timer = window.setTimeout(simpan, 400)
    const saatTersembunyi = () => { if (document.hidden) simpan() }
    window.addEventListener('pagehide', simpan)
    document.addEventListener('visibilitychange', saatTersembunyi)
    return () => { window.clearTimeout(timer); window.removeEventListener('pagehide', simpan); document.removeEventListener('visibilitychange', saatTersembunyi); simpan() }
  }, [KUNCI_DRAF, sptId, jenis, statusKegiatan, uraian, kendala, lokasiId, keteranganLokasi, alasan, alasanLainnya])

  const spt = daftarSpt.find(s => s.id === sptId)
  const lewatBatas = spt?.tanggal_batas ? spt.tanggal_batas < new Date().toISOString().slice(0, 10) : false
  const lokasiGagal = statusGeo === 'gagal'

  function bukaKamera() {
    kunciLokasiKamera.current = bacaKoordinatFoto()
    kamera.current?.click()
  }

  async function tambahkanFoto(berkas: File, sumber: 'kamera' | 'galeri') {
    const id = crypto.randomUUID()
    const diambilPada = sumber === 'kamera' ? new Date().toISOString() : null
    const koordinat = sumber === 'kamera'
      ? await (kunciLokasiKamera.current ?? bacaKoordinatFoto())
      : null
    kunciLokasiKamera.current = null
    setFoto(sekarang => [...sekarang, {
      id, berkas, sumber, diambilPada, koordinat,
      pratinjau: URL.createObjectURL(berkas), status: 'siap',
    }])
  }

  function hapusFoto(id: string) {
    setFoto(sekarang => {
      const target = sekarang.find(item => item.id === id)
      if (target) URL.revokeObjectURL(target.pratinjau)
      return sekarang.filter(item => item.id !== id)
    })
  }

  async function unggahFoto(item: FotoSiap, laporanId: string) {
    const ekstensiAsli = item.berkas.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ekstensi = /^[a-z0-9]{2,5}$/.test(ekstensiAsli) ? ekstensiAsli : 'jpg'
    const path = `${sptId}/${laporanId}/${item.id}.${ekstensi}`
    const supabase = klienBrowser()
    const { error } = await supabase.storage.from('dokumentasi').upload(path, item.berkas)
    if (error && !error.message.toLowerCase().includes('already exists')) throw new Error(error.message)
    const hasil = await catatFoto({
      laporanId, berkasPath: path, sumber: item.sumber,
      lat: item.koordinat?.lat ?? null,
      lng: item.koordinat?.lng ?? null,
      akurasiMeter: item.koordinat?.akurasi ?? null,
      diambilPada: item.diambilPada,
    })
    if (hasil.galat) throw new Error(hasil.galat)
  }

  function kirim() {
    setGalat(null)
    if (!sptId) { setGalat('Pilih penugasan terlebih dahulu.'); return }

    mulai(async () => {
      const hasil = laporanTersimpanId ? { id: laporanTersimpanId } : await kirimLaporan({
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
      else if (hasil?.id) {
        setLaporanTersimpanId(hasil.id)
        // DRAF DIBUANG DI SINI, bukan sesudah foto selesai.
        //
        // Sejak baris ini laporannya SUDAH tersimpan di server. Draf yang
        // dibiarkan hidup membuka jendela laporan ganda: bila unggahan
        // foto gagal lalu halaman ditutup, laporanTersimpanId (keadaan
        // komponen) ikut hilang, sedangkan draf tetap ada — membuka
        // formulir lagi dan menekan Kirim akan MEMBUAT LAPORAN KEDUA
        // untuk kejadian yang sama. Pada berkas perkara itu bukan
        // kerepotan kecil.
        //
        // Foto yang belum terunggah tidak ikut hilang haknya: ia tetap
        // dapat ditambahkan dari halaman rincian laporan.
        sudahTerkirim.current = true
        try { localStorage.removeItem(KUNCI_DRAF) } catch { /* Laporan sudah tersimpan di server. */ }

        const belumTerunggah = foto.filter(item => item.status !== 'terunggah')
        let gagal = 0
        for (const item of belumTerunggah) {
          try {
            await unggahFoto(item, hasil.id)
            setFoto(sekarang => sekarang.map(f => f.id === item.id ? { ...f, status: 'terunggah' } : f))
          } catch {
            gagal += 1
            setFoto(sekarang => sekarang.map(f => f.id === item.id ? { ...f, status: 'gagal' } : f))
          }
        }
        if (gagal > 0) {
          setGalat(
            `Laporan sudah tersimpan, tetapi ${gagal} foto belum berhasil diunggah. `
            + 'Ketuk Coba unggah lagi. Bila tetap gagal, foto dapat ditambahkan '
            + 'dari halaman rincian laporan — laporannya sendiri tidak akan hilang.',
          )
          return
        }
        router.push(`/laporan/${hasil.id}`)
      }
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

          <div className="fg lapor-dok">
            <div className="lapor-dok-kepala">
              <div>
                <label>Foto dokumentasi</label>
                <div className="bantu">Tambahkan sekarang agar foto ikut terkirim bersama laporan.</div>
              </div>
              {foto.length > 0 && <span className="lapor-dok-jumlah">{foto.length} foto</span>}
            </div>
            <div className="lapor-dok-aksi">
              <button type="button" className="btn btn-o" onClick={bukaKamera} disabled={menyimpan}>
                <Ikon nama="kamera" /> Ambil foto
              </button>
              <button type="button" className="btn btn-o" onClick={() => galeri.current?.click()} disabled={menyimpan}>
                <Ikon nama="gambar" /> Dari galeri
              </button>
            </div>
            <input ref={kamera} type="file" accept="image/*" capture="environment" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) void tambahkanFoto(f, 'kamera'); e.target.value = '' }} />
            <input ref={galeri} type="file" accept="image/*" multiple hidden
              onChange={e => { Array.from(e.target.files ?? []).forEach(f => void tambahkanFoto(f, 'galeri')); e.target.value = '' }} />
            {foto.length > 0 && (
              <div className="lapor-dok-daftar">
                {foto.map(item => (
                  <article className="lapor-dok-item" key={item.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.pratinjau} alt="Pratinjau dokumentasi" />
                    <div className="lapor-dok-info">
                      <strong>{item.sumber === 'kamera' ? 'Foto kamera' : 'Foto lampiran'}</strong>
                      <span className={item.koordinat ? 'foto-lokasi-ok' : ''}>
                        {item.sumber === 'galeri'
                          ? 'Tanpa koordinat terverifikasi'
                          : item.koordinat
                            ? `GPS ±${Math.round(item.koordinat.akurasi)} m`
                            : 'GPS belum terekam'}
                      </span>
                      {item.status === 'gagal' && <span className="lapor-dok-galat">Unggahan gagal</span>}
                    </div>
                    {item.status !== 'terunggah' && (
                      <button type="button" className="lapor-dok-hapus" aria-label="Hapus foto"
                        onClick={() => hapusFoto(item.id)} disabled={menyimpan}>×</button>
                    )}
                  </article>
                ))}
              </div>
            )}
            <div className="bantu">Foto kamera menyimpan posisi saat pengambilan. Foto galeri tetap diberi label lampiran.</div>
          </div>

          <div className="laporan-catatan-draf">
            Draf teks tersimpan di perangkat ini. Foto yang belum dikirim tetap tersedia selama halaman ini tidak ditutup.
          </div>

          {statusDraf && <div className="bantu" role="status" style={{ marginBottom: 12 }}>{statusDraf}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-o" onClick={() => simpanDrafLokal()} disabled={menyimpan}>
              Simpan draf
            </button>
            <button type="button" className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={kirim} disabled={menyimpan}>
              <Ikon nama="kirim" />
              {menyimpan ? 'Mengirim laporan dan foto…' : laporanTersimpanId ? 'Coba unggah lagi' : 'Kirim laporan'}
            </button>
          </div>
        </div>
      </section>

      <section className="kartu laporan-panduan" style={{ alignSelf: 'start' }}>
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
