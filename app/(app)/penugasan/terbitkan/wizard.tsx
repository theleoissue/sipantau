'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { simpanPenugasan, perbaruiDraf, revisiPenugasan, type DataScanSprin } from '../aksi'
import { Ikon } from '@/components/sipantau/ikon'
import { PetaPilihLokasi } from '@/components/sipantau/peta-pilih-lokasi'
import { ScanSprin } from '@/components/sipantau/scan-sprin'

const LANGKAH = [
  'Keterangan Penugasan',
  'Dasar Penugasan',
  'Titik Lokasi',
  'Susunan Tim',
] as const

// Menyunting draf HANYA mencakup tiga langkah pertama — Susunan Tim
// draf sudah dapat diubah dari Kelola Tim pada halaman rincian SPT
// (bolehUbahTim di sana sudah mengizinkan status 'draf'), jadi tidak
// diduplikasi di sini. Menampilkannya lagi hanya akan membingungkan:
// isian di langkah itu tidak akan pernah tersimpan lewat perbaruiDraf.
const LANGKAH_SUNTING_DRAF = LANGKAH.slice(0, 3)
const LANGKAH_REVISI = LANGKAH.slice(0, 1)

const JENIS_DASAR = [
  ['laporan_informasi', 'Laporan Informasi'],
  ['laporan_polisi', 'Laporan Polisi'],
  ['laporan_pengaduan', 'Laporan Pengaduan'],
  ['surat_perintah_terdahulu', 'Surat Perintah Terdahulu'],
  ['disposisi_pimpinan', 'Disposisi Pimpinan'],
  ['lainnya', 'Lainnya'],
] as const

const BULAN_ROMAWI = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
const KUNCI_DRAF_BARU = 'sipantau:draf-penugasan:baru:v1'

interface Personel { id: string; nama: string; pangkat: string | null; peran: string }

type Dasar = { jenis: string; nomor: string; tanggal: string; keterangan: string }
type Lokasi = { nama: string; alamat: string; keterangan: string; lat: string; lng: string; radius: string }

export interface DrafAwal {
  id: string
  nomor_spt: string | null
  jenis_kegiatan: string
  judul: string
  objek: string | null
  sasaran: string | null
  uraian_tugas: string | null
  nomor_lp: string | null
  sumber_informasi: string | null
  prioritas: string
  tanggal_mulai: string | null
  tanggal_batas: string | null
  dasar: Dasar[]
  lokasi: Lokasi[]
}

export function WizardTerbitkan({
  personel,
  kodeKlasifikasi,
  namaUnit,
  draf,
  scanAwal,
  mode = draf ? 'draf' : 'baru',
}: {
  personel: Personel[]
  kodeKlasifikasi: string | null
  namaUnit: string
  /** Bila diisi, wizard dalam mode SUNTING draf yang sudah ada (bukan
   *  membuat baru) — hanya tiga langkah pertama, disimpan lewat
   *  perbaruiDraf(), bukan simpanPenugasan(). */
  draf?: DrafAwal
  /** Hasil scan yang sudah disetujui Kanit; tetap hanya isian awal. */
  scanAwal?: DataScanSprin
  mode?: 'baru' | 'draf' | 'revisi'
}) {
  const sedangRevisi = mode === 'revisi'
  const langkah = sedangRevisi ? LANGKAH_REVISI : draf ? LANGKAH_SUNTING_DRAF : LANGKAH
  const [n, setN] = useState(1)
  const [galat, setGalat] = useState<string | null>(null)
  const [menyimpan, mulai] = useTransition()

  const [judul, setJudul] = useState(draf?.judul ?? scanAwal?.judul ?? '')
  const [jenisKegiatan, setJenisKegiatan] = useState(draf?.jenis_kegiatan ?? scanAwal?.jenis_kegiatan ?? 'penyelidikan')
  const [nomorSpt, setNomorSpt] = useState(draf?.nomor_spt ?? scanAwal?.nomor_spt ?? '')
  const [objek, setObjek] = useState(draf?.objek ?? scanAwal?.objek ?? '')
  const [sasaran, setSasaran] = useState(draf?.sasaran ?? scanAwal?.sasaran ?? '')
  const [uraian, setUraian] = useState(draf?.uraian_tugas ?? scanAwal?.uraian_tugas ?? '')
  const [nomorLp, setNomorLp] = useState(draf?.nomor_lp ?? scanAwal?.nomor_lp ?? '')
  const [sumber, setSumber] = useState(draf?.sumber_informasi ?? scanAwal?.sumber_informasi ?? '')
  const [prioritas, setPrioritas] = useState(draf?.prioritas ?? scanAwal?.prioritas ?? 'normal')
  const [mulaiTgl, setMulaiTgl] = useState(draf?.tanggal_mulai ?? scanAwal?.tanggal_mulai ?? '')
  const [batasTgl, setBatasTgl] = useState(draf?.tanggal_batas ?? scanAwal?.tanggal_batas ?? '')

  const [dasar, setDasar] = useState<Dasar[]>(draf?.dasar.length ? draf.dasar : [
    { jenis: 'laporan_informasi', nomor: '', tanggal: '', keterangan: '' },
  ])
  const [lokasi, setLokasi] = useState<Lokasi[]>(draf?.lokasi.length ? draf.lokasi : [
    { nama: '', alamat: '', keterangan: '', lat: '', lng: '', radius: '300' },
  ])
  const [titikAktif, setTitikAktif] = useState(0)
  const [panit, setPanit] = useState<string[]>([])
  const [pelaksana, setPelaksana] = useState<string[]>([])
  const [statusSimpanOtomatis, setStatusSimpanOtomatis] = useState('')
  const drafLokalSiap = useRef(false)

  // Draf penugasan baru disimpan di perangkat sampai Kanit memilih
  // "Simpan sebagai draf". Draf server yang sudah ada memakai jalur
  // penyimpanan resmi dan tidak pernah ditimpa penyimpanan lokal ini.
  useEffect(() => {
    if (draf) return
    if (scanAwal) { drafLokalSiap.current = true; return }
    const pulihkan = window.setTimeout(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_DRAF_BARU)
      if (tersimpan) {
        const nilai = JSON.parse(tersimpan) as Record<string, unknown>
        setJudul(typeof nilai.judul === 'string' ? nilai.judul : '')
        setJenisKegiatan(typeof nilai.jenisKegiatan === 'string' ? nilai.jenisKegiatan : 'penyelidikan')
        setNomorSpt(typeof nilai.nomorSpt === 'string' ? nilai.nomorSpt : '')
        setObjek(typeof nilai.objek === 'string' ? nilai.objek : '')
        setSasaran(typeof nilai.sasaran === 'string' ? nilai.sasaran : '')
        setUraian(typeof nilai.uraian === 'string' ? nilai.uraian : '')
        setNomorLp(typeof nilai.nomorLp === 'string' ? nilai.nomorLp : '')
        setSumber(typeof nilai.sumber === 'string' ? nilai.sumber : '')
        setPrioritas(typeof nilai.prioritas === 'string' ? nilai.prioritas : 'normal')
        setMulaiTgl(typeof nilai.mulaiTgl === 'string' ? nilai.mulaiTgl : '')
        setBatasTgl(typeof nilai.batasTgl === 'string' ? nilai.batasTgl : '')
        if (Array.isArray(nilai.dasar)) setDasar(nilai.dasar as Dasar[])
        if (Array.isArray(nilai.lokasi)) setLokasi(nilai.lokasi as Lokasi[])
        if (Array.isArray(nilai.panit)) setPanit(nilai.panit.filter((id): id is string => typeof id === 'string'))
        if (Array.isArray(nilai.pelaksana)) setPelaksana(nilai.pelaksana.filter((id): id is string => typeof id === 'string'))
        setStatusSimpanOtomatis('Draf sebelumnya dipulihkan dari perangkat ini.')
      }
    } catch { localStorage.removeItem(KUNCI_DRAF_BARU) }
    drafLokalSiap.current = true
    }, 0)
    return () => window.clearTimeout(pulihkan)
  }, [draf, scanAwal])

  useEffect(() => {
    if (draf || !drafLokalSiap.current) return
    const timer = window.setTimeout(() => {
      const adaIsian = Boolean(judul.trim() || uraian.trim() || objek.trim() || sasaran.trim() || nomorSpt.trim())
      if (!adaIsian) return
      localStorage.setItem(KUNCI_DRAF_BARU, JSON.stringify({
        judul, jenisKegiatan, nomorSpt, objek, sasaran, uraian, nomorLp, sumber,
        prioritas, mulaiTgl, batasTgl, dasar, lokasi, panit, pelaksana,
      }))
      setStatusSimpanOtomatis('Perubahan tersimpan otomatis di perangkat.')
    }, 700)
    return () => window.clearTimeout(timer)
  }, [draf, judul, jenisKegiatan, nomorSpt, objek, sasaran, uraian, nomorLp, sumber, prioritas, mulaiTgl, batasTgl, dasar, lokasi, panit, pelaksana])

  /**
   * Kerangka nomor SPT yang disodorkan sistem. Nomor agendanya sengaja
   * dibiarkan sebagai tanda tanya — ia berasal dari buku agenda
   * administrasi di luar sistem, dan SiPANTAU tidak pernah
   * membangkitkannya sendiri (BR-23).
   */
  function sodorkanNomor() {
    const kini = new Date()
    const bulan = BULAN_ROMAWI[kini.getMonth()]
    const tahun = kini.getFullYear()
    const kode = kodeKlasifikasi ?? 'RES.__'
    setNomorSpt(`SP.Gas.Lidik/____/${bulan}/${kode}/${tahun}/Ditreskrimsus`)
  }

  function terapkanScan(data: { nomor_spt: string; judul: string; objek: string; sasaran: string; uraian_tugas: string; nomor_lp: string; sumber_informasi: string; jenis_kegiatan: string; prioritas: string; tanggal_mulai: string; tanggal_batas: string; personel: string[] }) {
    setNomorSpt(data.nomor_spt || nomorSpt); setJudul(data.judul || judul); setObjek(data.objek || objek); setSasaran(data.sasaran || sasaran); setUraian(data.uraian_tugas || uraian); setNomorLp(data.nomor_lp || nomorLp); setSumber(data.sumber_informasi || sumber)
    if (['penyelidikan', 'pulbaket', 'pengamanan'].includes(data.jenis_kegiatan)) setJenisKegiatan(data.jenis_kegiatan)
    if (['normal', 'penting', 'urgent'].includes(data.prioritas)) setPrioritas(data.prioritas)
    setMulaiTgl(data.tanggal_mulai || mulaiTgl); setBatasTgl(data.tanggal_batas || batasTgl)
    const nama = data.personel.map(n => n.toLowerCase().replace(/[^a-z]/g, ''))
    const cocok = personel.filter(p => nama.includes(p.nama.toLowerCase().replace(/[^a-z]/g, ''))).map(p => p.id)
    if (cocok.length) setPelaksana(cocok)
  }

  const calonPanit = personel.filter(p => p.peran === 'panit')
  const calonPelaksana = personel

  function simpan(terbitkan: boolean) {
    setGalat(null)
    mulai(async () => {
      const isianDasar = dasar.filter(d => d.nomor.trim() || d.keterangan.trim())
      const isianLokasi = lokasi.filter(l => l.nama.trim())

      const hasil = sedangRevisi && draf
        ? await revisiPenugasan(draf.id, {
            judul, jenis_kegiatan: jenisKegiatan,
            objek: objek || null, sasaran: sasaran || null,
            uraian_tugas: uraian || null,
            nomor_lp: nomorLp || null, sumber_informasi: sumber || null,
            prioritas,
          })
        : draf
        ? await perbaruiDraf(draf.id, {
            judul, jenis_kegiatan: jenisKegiatan,
            nomor_spt: nomorSpt || null,
            objek: objek || null, sasaran: sasaran || null,
            uraian_tugas: uraian || null,
            nomor_lp: nomorLp || null, sumber_informasi: sumber || null,
            prioritas,
            tanggal_mulai: mulaiTgl || null, tanggal_batas: batasTgl || null,
            dasar: isianDasar, lokasi: isianLokasi,
          })
        : await simpanPenugasan({
            judul, jenis_kegiatan: jenisKegiatan,
            nomor_spt: nomorSpt || null,
            objek: objek || null, sasaran: sasaran || null,
            uraian_tugas: uraian || null,
            nomor_lp: nomorLp || null, sumber_informasi: sumber || null,
            prioritas,
            tanggal_mulai: mulaiTgl || null, tanggal_batas: batasTgl || null,
            dasar: isianDasar, lokasi: isianLokasi,
            panit, pelaksana, terbitkan,
          })
      if (hasil?.galat) setGalat(hasil.galat)
      else if (!draf) localStorage.removeItem(KUNCI_DRAF_BARU)
    })
  }

  function togglePilih(daftar: string[], set: (v: string[]) => void, id: string) {
    set(daftar.includes(id) ? daftar.filter(x => x !== id) : [...daftar, id])
  }

  return (
    <>
      <Link
        href={draf ? `/penugasan/${draf.id}` : '/penugasan'}
        className="back-link"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
                 color: 'var(--ink-2)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
      >
        <Ikon nama="silang" />
        {draf ? 'Kembali ke rincian penugasan' : 'Batalkan penerbitan'}
      </Link>

      <div className="kh">
        <div>
          <h1>{sedangRevisi ? 'Revisi penugasan' : draf ? 'Sunting draf penugasan' : 'Terbitkan penugasan'}</h1>
          <p className="sub">
            {sedangRevisi
              ? 'Perbaiki keterangan penugasan. Nomor SPT dan tanggal mulai tetap terkunci; batas waktu diubah melalui Perpanjang Batas.'
              : draf
              ? 'Susunan tim tetap diubah dari Kelola Tim pada rincian penugasan.'
              : `Surat perintah tugas untuk ${namaUnit}.`}
          </p>
        </div>
      </div>

      {!draf && <ScanSprin onHasil={terapkanScan} />}

      <div className="wiz-steps">
        {langkah.map((lb, i) => (
          <button
            key={lb}
            type="button"
            className={`wiz-s ${n === i + 1 ? 'on' : n > i + 1 ? 'done' : ''}`}
            onClick={() => setN(i + 1)}
          >
            <span className="no">{n > i + 1 ? '✓' : i + 1}</span>
            {lb}
          </button>
        ))}
      </div>

      {!draf && statusSimpanOtomatis && (
        <p className="bantu" role="status" style={{ margin: '0 0 12px' }}>{statusSimpanOtomatis}</p>
      )}

      {galat && (
        <div
          role="alert"
          className="kartu"
          style={{ marginBottom: 16, borderLeft: '3px solid var(--red)' }}
        >
          <div className="kartu-b" style={{ color: 'var(--red)', fontSize: 13, lineHeight: 1.6 }}>
            {galat}
          </div>
        </div>
      )}

      <section className="kartu">
        <div className="kartu-b">

          {/* ───────────── 1. Keterangan ───────────── */}
          {n === 1 && (
            <>
              <div className="fg">
                <label>Nomor SPT</label>
                <input
                  value={nomorSpt}
                  onChange={e => setNomorSpt(e.target.value)}
                  readOnly={sedangRevisi}
                  style={{ fontFamily: 'var(--mono)' }}
                  placeholder="SP.Gas.Lidik/…"
                />
                <div className="bantu">
                  {sedangRevisi ? 'Nomor SPT tidak dapat diubah setelah penugasan diterbitkan.' : <>
                  Kerangka nomor disodorkan sistem — nomor agenda tetap
                  diketik dari buku agenda administrasi.{' '}
                  <button type="button" onClick={sodorkanNomor}
                          style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Sodorkan kerangka
                  </button>
                  </>}
                </div>
              </div>

              <div className="f2">
                <div className="fg">
                  <label>Jenis kegiatan</label>
                  <select value={jenisKegiatan} onChange={e => setJenisKegiatan(e.target.value)}>
                    <option value="penyelidikan">Penyelidikan</option>
                    <option value="pulbaket">Pulbaket</option>
                    <option value="pengamanan">Pengamanan</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Prioritas</label>
                  <select value={prioritas} onChange={e => setPrioritas(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="penting">Penting</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="fg">
                <label>Judul penugasan <span className="wajib">*</span></label>
                <input value={judul} onChange={e => setJudul(e.target.value)}
                       placeholder="Judul singkat penugasan" />
              </div>

              <div className="f2">
                <div className="fg">
                  <label>Objek</label>
                  <input value={objek} onChange={e => setObjek(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Sasaran</label>
                  <input value={sasaran} onChange={e => setSasaran(e.target.value)} />
                </div>
              </div>

              <div className="fg">
                <label>Uraian tugas</label>
                <textarea rows={4} value={uraian} onChange={e => setUraian(e.target.value)}
                          placeholder="Uraian naratif tugas yang diperintahkan" />
              </div>

              <div className="f2">
                <div className="fg">
                  <label>Nomor Laporan Polisi</label>
                  <input value={nomorLp} onChange={e => setNomorLp(e.target.value)} />
                  <div className="bantu">Boleh kosong — pulbaket awal kerap belum memilikinya.</div>
                </div>
                <div className="fg">
                  <label>Sumber informasi</label>
                  <input value={sumber} onChange={e => setSumber(e.target.value)} />
                  <div className="bantu">Boleh kosong.</div>
                </div>
              </div>

              <div className="f2">
                <div className="fg">
                  <label>Tanggal mulai</label>
                  <input type="date" value={mulaiTgl} onChange={e => setMulaiTgl(e.target.value)} readOnly={sedangRevisi} />
                </div>
                <div className="fg">
                  <label>Batas waktu</label>
                  <input type="date" value={batasTgl} onChange={e => setBatasTgl(e.target.value)} readOnly={sedangRevisi} />
                  {sedangRevisi && <div className="bantu">Gunakan tombol Perpanjang Batas pada rincian agar alasan perubahan tercatat.</div>}
                </div>
              </div>
            </>
          )}

          {/* ───────────── 2. Dasar ───────────── */}
          {n === 2 && (
            <>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
                Landasan terbitnya surat perintah. Sekurang-kurangnya satu
                dasar wajib ada sebelum penugasan dapat diterbitkan.
              </p>

              {dasar.map((d, i) => (
                <div key={i} className="baris-dasar">
                  <div className="f2">
                    <div className="fg">
                      <label>Jenis</label>
                      <select
                        value={d.jenis}
                        onChange={e => setDasar(dasar.map((x, j) =>
                          j === i ? { ...x, jenis: e.target.value } : x))}
                      >
                        {JENIS_DASAR.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="fg">
                      <label>Nomor</label>
                      <input value={d.nomor}
                             onChange={e => setDasar(dasar.map((x, j) =>
                               j === i ? { ...x, nomor: e.target.value } : x))} />
                    </div>
                  </div>
                  <div className="f2">
                    <div className="fg">
                      <label>Tanggal</label>
                      <input type="date" value={d.tanggal}
                             onChange={e => setDasar(dasar.map((x, j) =>
                               j === i ? { ...x, tanggal: e.target.value } : x))} />
                    </div>
                    <div className="fg">
                      <label>
                        Keterangan
                        {d.jenis === 'lainnya' && <span className="wajib"> *</span>}
                      </label>
                      <input value={d.keterangan}
                             onChange={e => setDasar(dasar.map((x, j) =>
                               j === i ? { ...x, keterangan: e.target.value } : x))} />
                    </div>
                  </div>
                  {dasar.length > 1 && (
                    <button type="button" className="btn btn-o btn-sm"
                            onClick={() => setDasar(dasar.filter((_, j) => j !== i))}>
                      Hapus dasar {i + 1}
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="tambah-baris"
                      onClick={() => setDasar([...dasar,
                        { jenis: 'laporan_informasi', nomor: '', tanggal: '', keterangan: '' }])}>
                <Ikon nama="tambah" /> Tambah dasar penugasan
              </button>
            </>
          )}

          {/* ───────────── 3. Titik lokasi ───────────── */}
          {n === 3 && (
            <>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
                Tempat-tempat yang tercantum pada surat, berurutan.
                Sekurang-kurangnya satu titik wajib berkoordinat — tanpa itu
                sistem tidak punya pembanding untuk menetapkan status lokasi
                laporan. Titik tanpa koordinat tetap boleh ada dan bukan
                kekurangan data.
              </p>

              {/* KP-6.2-16: tiga cara menetapkan koordinat — peta+pin dan
                  pencarian nama tempat di sini, ketik lintang/bujur manual
                  tetap ada di bawah pada tiap blok titik (cara ketiga). */}
              <PetaPilihLokasi
                titik={lokasi.map(l => ({ nama: l.nama, lat: l.lat, lng: l.lng }))}
                aktif={Math.min(titikAktif, lokasi.length - 1)}
                onAktifChange={setTitikAktif}
                onUbahKoordinat={(i, lat, lng) => setLokasi(lokasi.map((x, j) =>
                  j === i ? { ...x, lat, lng } : x))}
              />

              {lokasi.map((l, i) => (
                <div
                  key={i}
                  className="blok-lokasi-tb"
                  onClick={() => setTitikAktif(i)}
                  style={i === titikAktif
                    ? { borderColor: 'var(--gold)', boxShadow: '0 0 0 1px var(--gold)' }
                    : undefined}
                >
                  <div className="fg">
                    <label>Titik {i + 1} — nama tempat <span className="wajib">*</span></label>
                    <input value={l.nama}
                           onChange={e => setLokasi(lokasi.map((x, j) =>
                             j === i ? { ...x, nama: e.target.value } : x))}
                           placeholder="Contoh: Bandara Internasional Kertajati" />
                  </div>
                  <div className="fg">
                    <label>Alamat</label>
                    <input value={l.alamat}
                           onChange={e => setLokasi(lokasi.map((x, j) =>
                             j === i ? { ...x, alamat: e.target.value } : x))} />
                  </div>
                  <div className="f2">
                    <div className="fg">
                      <label>Lintang (lat)</label>
                      <input value={l.lat} inputMode="decimal" placeholder="-6.6489"
                             onChange={e => setLokasi(lokasi.map((x, j) =>
                               j === i ? { ...x, lat: e.target.value } : x))} />
                    </div>
                    <div className="fg">
                      <label>Bujur (lng)</label>
                      <input value={l.lng} inputMode="decimal" placeholder="108.1689"
                             onChange={e => setLokasi(lokasi.map((x, j) =>
                               j === i ? { ...x, lng: e.target.value } : x))} />
                    </div>
                  </div>
                  <div className="f2">
                    <div className="fg">
                      <label>Radius (meter)</label>
                      <input type="number" min={100} max={2000} value={l.radius}
                             onChange={e => setLokasi(lokasi.map((x, j) =>
                               j === i ? { ...x, radius: e.target.value } : x))} />
                      <div className="bantu">Antara 100 dan 2000 meter.</div>
                    </div>
                    <div className="fg">
                      <label>Peran titik ini</label>
                      <input value={l.keterangan} placeholder="lokasi pemeriksaan, lokasi transaksi"
                             onChange={e => setLokasi(lokasi.map((x, j) =>
                               j === i ? { ...x, keterangan: e.target.value } : x))} />
                    </div>
                  </div>
                  {lokasi.length > 1 && (
                    <button type="button" className="btn btn-o btn-sm"
                            onClick={() => setLokasi(lokasi.filter((_, j) => j !== i))}>
                      Hapus titik {i + 1}
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="tambah-baris"
                      onClick={() => {
                        setLokasi([...lokasi,
                          { nama: '', alamat: '', keterangan: '', lat: '', lng: '', radius: '300' }])
                        setTitikAktif(lokasi.length)
                      }}>
                <Ikon nama="tambah" /> Tambah titik lokasi
              </button>
            </>
          )}

          {/* ───────────── 4. Susunan tim ───────────── */}
          {!draf && n === 4 && (
            <>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.6 }}>
                Tim melekat pada surat perintah ini, bukan pada unit, dan
                disusun ulang setiap kali surat baru diterbitkan.
              </p>

              <div className="fg">
                <label>Panit Penanggung Jawab <span className="wajib">*</span></label>
                <div className="pilih-orang-box">
                  {calonPanit.length === 0 && (
                    <div style={{ padding: 12, fontSize: 13, color: 'var(--ink-3)' }}>
                      Belum ada Panit di unit ini.
                    </div>
                  )}
                  {calonPanit.map(p => (
                    <label key={p.id} className="pilih-orang-i">
                      <input type="checkbox" checked={panit.includes(p.id)}
                             onChange={() => togglePilih(panit, setPanit, p.id)} />
                      <span>{p.pangkat ? `${p.pangkat} ` : ''}{p.nama}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label>Pelaksana <span className="wajib">*</span></label>
                <div className="pilih-orang-box">
                  {calonPelaksana.map(p => (
                    <label key={p.id} className="pilih-orang-i">
                      <input type="checkbox" checked={pelaksana.includes(p.id)}
                             onChange={() => togglePilih(pelaksana, setPelaksana, p.id)} />
                      <span>
                        {p.pangkat ? `${p.pangkat} ` : ''}{p.nama}
                        <small style={{ color: 'var(--ink-3)', marginLeft: 6 }}>{p.peran}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="bantu">
                  Kanit dan Panit boleh dicantumkan sebagai pelaksana, dan
                  memperoleh kemampuan membuka Sesi Tugas serta mengirim
                  laporan pada penugasan ini saja.
                </div>
              </div>
            </>
          )}

          <div className="wiz-nav">
            <button type="button" className="btn btn-o"
                    onClick={() => setN(Math.max(1, n - 1))}
                    disabled={n === 1 || menyimpan}>
              Sebelumnya
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {draf ? (
                <>
                  {n < langkah.length && (
                    <button type="button" className="btn btn-o"
                            onClick={() => setN(n + 1)} disabled={menyimpan}>
                      Berikutnya
                    </button>
                  )}
                  <button type="button" className="btn btn-p"
                          onClick={() => simpan(false)} disabled={menyimpan}>
                    {menyimpan ? 'Menyimpan…' : sedangRevisi ? 'Simpan revisi' : 'Simpan perubahan'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-o"
                          onClick={() => simpan(false)} disabled={menyimpan}>
                    Simpan sebagai draf
                  </button>

                  {n < langkah.length ? (
                    <button type="button" className="btn btn-p"
                            onClick={() => setN(n + 1)} disabled={menyimpan}>
                      Berikutnya
                    </button>
                  ) : (
                    <button type="button" className="btn btn-g"
                            onClick={() => simpan(true)} disabled={menyimpan}>
                      {menyimpan ? 'Menerbitkan…' : 'Terbitkan penugasan'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
