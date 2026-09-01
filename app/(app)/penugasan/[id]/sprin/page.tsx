import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { satuPenugasan } from '@/lib/penugasan/kueri'
import { TombolCetak } from './tombol-cetak'
import { idValid } from '@/lib/utils'

export const metadata = { title: 'Surat Perintah — Si PANTAU' }

/** Judul surat menyebut jenis kegiatannya, seperti dokumen resmi:
 *  "SURAT PERINTAH PENYELIDIKAN", bukan "SURAT PERINTAH" polos. */
const JUDUL_JENIS: Record<string, string> = {
  penyelidikan: 'Surat Perintah Penyelidikan',
  pulbaket: 'Surat Perintah Pengumpulan Bahan Keterangan',
  pengamanan: 'Surat Perintah Pengamanan',
}

/** Sebutan pelaksana pada judul lampiran, mengikuti jenis kegiatan —
 *  dokumen contoh memakai "DAFTAR NAMA PENYELIDIK". */
const SEBUTAN_PELAKSANA: Record<string, string> = {
  penyelidikan: 'Penyelidik',
  pulbaket: 'Petugas',
  pengamanan: 'Petugas',
}

const LABEL_DASAR: Record<string, string> = {
  laporan_informasi: 'Laporan Informasi',
  laporan_polisi: 'Laporan Polisi',
  laporan_pengaduan: 'Laporan Pengaduan',
  surat_perintah_terdahulu: 'Surat Perintah',
  disposisi_pimpinan: 'Disposisi Pimpinan',
  lainnya: 'Dasar lain',
}

/** Kop dipakai dua kali: badan surat dan halaman lampiran. */
function KopSurat() {
  return (
    <div className="sprin-kop">
      <div className="teks-kop">
        <div className="l1">Kepolisian Negara Republik Indonesia</div>
        <div className="l2">Daerah Jawa Barat</div>
        <div className="l3">Direktorat Reserse Kriminal Khusus</div>
      </div>
      <Image
        src="/lambang-polri.png"
        alt="Lambang Kepolisian Negara Republik Indonesia"
        width={78}
        height={72}
        className="sprin-lambang"
        priority
      />
    </div>
  )
}

function tglIndo(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso.length === 10 ? iso + 'T00:00:00' : iso))
}

/**
 * Konsep surat perintah tugas, siap dicetak.
 *
 * Formatnya mengikuti contoh SPRIN resmi yang diberikan pemilik produk:
 * judul "SURAT PERINTAH" (bukan "Surat Perintah Tugas"), tabel tim di
 * badan surat, dan blok tanda tangan berisi NRP lengkap.
 *
 * Ini BUKAN pengganti tanda tangan basah. Alurnya: cetak, tandatangani
 * secara fisik, pindai, lalu unggah kembali ke sistem — dan SPT tidak
 * dapat ditutup sebelum pindaian itu terlampir (BR-25).
 */
export default async function HalamanSprin({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!idValid(id)) notFound()
  // Independen — satuPenugasan(id) tidak butuh hasil wajibkanSudahSiap(),
  // hanya perlu penjagaannya (redirect bila belum siap).
  const [, spt] = await Promise.all([
    wajibkanSudahSiap(),
    satuPenugasan(id),
  ])
  if (!spt) notFound()

  const supabase = await klienServer()
  // Pejabat penanda tangan TIDAK diketik ulang tiap SPT — disimpan
  // sekali sebagai pengaturan (migrasi 0039). Barisnya dijamin tepat
  // satu oleh chk_baris_tunggal, jadi maybeSingle() aman.
  const { data: pejabat } = await supabase
    .from('pengaturan_surat')
    .select('kota, atas_nama, jabatan, keterangan_jabatan, nama, pangkat, nrp')
    .maybeSingle<{
      kota: string; atas_nama: string; jabatan: string; keterangan_jabatan: string
      nama: string | null; pangkat: string | null; nrp: string | null
    }>()

  const lokasi = [...(spt.penugasan_lokasi ?? [])].sort((a, b) => a.urutan - b.urutan)
  const dasar = [...(spt.penugasan_dasar ?? [])].sort((a, b) => a.urutan - b.urutan)

  // Panit Penanggung Jawab lebih dulu, lalu pelaksana yang bukan Panit —
  // mengikuti urutan pada surat fisik.
  const panitAktif = (spt.penugasan_panit ?? []).filter(p => !p.dicabut_pada)
  const idPanit = new Set(panitAktif.map(p => p.panit_id))
  const tim = [
    ...panitAktif.map(p => ({
      kunci: p.id, orang: p.users, kedudukan: 'Panit Penanggung Jawab',
    })),
    ...(spt.penugasan_pelaksana ?? [])
      .filter(p => !p.dicabut_pada && !idPanit.has(p.pelaksana_id))
      .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
      .map(p => ({ kunci: p.id, orang: p.users, kedudukan: 'Pelaksana' })),
  ]

  // "Yang Menerima Perintah" pada dokumen resmi adalah pemegang kendali
  // di lapangan. Diambil Panit Penanggung Jawab; bila SPT tidak menunjuk
  // Panit, pelaksana urutan pertama yang mewakili.
  const penerima = (tim.find(t => t.kedudukan === 'Panit Penanggung Jawab') ?? tim[0])?.orang

  // Jabatan diambil TERPISAH, bukan ditumpangkan pada kueri penugasan
  // yang dipakai bersama banyak halaman lain: kolom ini hanya berguna
  // untuk lampiran surat, dan menambahkannya ke kueri bersama membuat
  // SELURUH halaman Penugasan gagal dimuat sebelum migrasi 0039 terpasang
  // (sudah terbukti terjadi saat diuji: "column users_2.jabatan does not
  // exist"). Galatnya pun ditelan di sini — bila kolomnya belum ada,
  // lampiran jatuh ke kedudukan pada SPT, bukan ikut mematikan halaman.
  const idOrang = tim.map(t => t.orang?.id).filter((v): v is string => !!v)
  let petaJabatan = new Map<string, string>()
  if (idOrang.length > 0) {
    const { data: barisJabatan } = await supabase
      .from('users').select('id, jabatan').in('id', idOrang)
    petaJabatan = new Map(
      (barisJabatan ?? [])
        .filter((b): b is { id: string; jabatan: string } => !!b.jabatan)
        .map(b => [b.id, b.jabatan]),
    )
  }

  return (
    <>
      <Link
        href={`/penugasan/${spt.id}`}
        className="back-link"
        style={{ display: 'inline-block', marginBottom: 14, color: 'var(--ink-2)',
                 fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
      >
        ← Kembali ke rincian penugasan
      </Link>

      <div className="sprin-catatan">
        Konsep surat perintah tugas — cetak, tandatangani secara fisik,
        pindai, lalu unggah kembali ke sistem. Bukan pengganti tanda
        tangan basah.
      </div>

      <div className="sprin-toolbar-aksi"
           style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <TombolCetak />
      </div>

      <div className="sprin-lembar">
        {/* Kode arsip pojok kiri atas, seperti pada dokumen resmi. */}
        <div className="sprin-arsip">A.5</div>
        <KopSurat />

        <div className="sprin-judul">
          <h2>{JUDUL_JENIS[spt.jenis_kegiatan] ?? 'Surat Perintah'}</h2>
          <div className="no">Nomor : {spt.nomor_spt ?? '—'}</div>
        </div>

        <div className="sprin-baris">
          <div className="lbl">Pertimbangan</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            Bahwa untuk kepentingan dinas Kepolisian {spt.unit?.nama ?? ''} Subdit IV
            Ditreskrimsus Polda Jawa Barat, dipandang perlu mengeluarkan surat
            perintah ini.
          </div>
        </div>

        <div className="sprin-baris">
          <div className="lbl">Dasar</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            <ol style={{ marginLeft: 16 }}>
              {dasar.length === 0 ? (
                <li>—</li>
              ) : dasar.map(d => (
                <li key={d.id}>
                  {LABEL_DASAR[d.jenis] ?? d.jenis} Nomor {d.nomor ?? '—'}
                  {d.tanggal ? ` tanggal ${tglIndo(d.tanggal)}` : ''}
                  {d.keterangan ? `, ${d.keterangan}` : ''}.
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase',
                    margin: '20px 0 14px', letterSpacing: '.02em' }}>
          Diperintahkan
        </p>

        {/* Dokumen resmi TIDAK memuat daftar personel di badan surat —
            ia merujuk ke lampiran, dan daftarnya jadi halaman tersendiri
            di bawah. Bentuk sebelumnya menaruh tabel tim di sini. */}
        <div className="sprin-baris">
          <div className="lbl">Kepada</div>
          <div className="titik-dua">:</div>
          <div className="isi" style={{ textTransform: 'uppercase' }}>
            Nama, pangkat, NRP, dan jabatan sesuai yang tercantum dalam
            lampiran surat perintah ini.
          </div>
        </div>

        <div className="sprin-baris" style={{ marginTop: 16 }}>
          <div className="lbl">Untuk</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            <ol className="sprin-daftar">
              <li>
                Melaksanakan {spt.jenis_kegiatan} terhadap <b>{spt.objek ?? '—'}</b>
                {spt.sasaran ? <> dengan sasaran <b>{spt.sasaran}</b></> : null}
                {spt.nomor_lp ? `, terkait Laporan Polisi Nomor ${spt.nomor_lp}` : ''}.
              </li>
              {spt.uraian_tugas && <li>{spt.uraian_tugas}</li>}
              <li>
                Melaksanakan tugas pada tempat sebagai berikut:
                <ol style={{ marginLeft: 18, listStyle: 'lower-alpha' }}>
                  {lokasi.map(l => <li key={l.id}>{l.nama}.</li>)}
                </ol>
              </li>
              <li>
                Melaksanakan tugas terhitung mulai tanggal{' '}
                <b>{tglIndo(spt.tanggal_mulai)}</b> sampai dengan{' '}
                <b>{tglIndo(spt.tanggal_batas)}</b>.
              </li>
              <li>Mengadakan koordinasi dan kerja sama sebaik-baiknya dengan unsur terkait.</li>
              <li>Melaksanakan perintah ini dengan penuh rasa tanggung jawab.</li>
            </ol>
          </div>
        </div>

        <p style={{ marginTop: 14 }}>Selesai.</p>

        {/* Tanggal penerbitan berdiri sendiri di atas kedua blok tanda
            tangan, rata kanan — seperti dokumen resmi. */}
        <div className="sprin-tempat-tanggal">
          <div><span className="k">Dikeluarkan di</span><span className="d">:</span> {pejabat?.kota ?? 'Bandung'}</div>
          <div><span className="k">pada tanggal</span><span className="d">:</span> {tglIndo(spt.diterbitkan_pada ?? spt.tanggal_mulai)}</div>
        </div>

        {/* DUA blok, bukan satu. Kiri: yang menerima perintah, diisi
            Panit Penanggung Jawab (pemegang kendali di lapangan) —
            bentuk sebelumnya hanya punya blok kanan. */}
        <div className="sprin-ttd-dua">
          <div className="kiri">
            <div>Yang Menerima Perintah</div>
            <div className="ruang" />
            <div className="blok-nama">
              <div className="nama-ttd">{penerima?.nama ?? '—'}</div>
              <div className="pangkat-ttd">
                {penerima?.pangkat ?? ''}{penerima?.nrp ? ` NRP ${penerima.nrp}` : ''}
              </div>
            </div>
          </div>

          <div className="kanan">
            <div className="jabatan-ttd">
              {pejabat?.atas_nama ?? 'a.n. DIREKTUR RESERSE KRIMINAL KHUSUS POLDA JABAR'}
            </div>
            <div className="jabatan-tengah">{pejabat?.jabatan ?? 'WADIR'}</div>
            <div className="ket-jabatan">{pejabat?.keterangan_jabatan ?? 'Selaku Penyidik'}</div>
            {/* Ruang kosong untuk tanda tangan dan cap basah. Sengaja
                TIDAK diisi cap tiruan — ini konsep surat, dan cap palsu
                pada konsep surat dinas adalah masalah tersendiri. */}
            <div className="ruang" />
            <div className="blok-nama">
              <div className="nama-ttd">{pejabat?.nama ?? '—'}</div>
              <div className="pangkat-ttd">
                {pejabat?.pangkat ?? ''}{pejabat?.nrp ? ` NRP ${pejabat.nrp}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ HALAMAN LAMPIRAN ============
          Lembar terpisah dengan kop dan blok tanda tangannya sendiri,
          selalu dimulai di halaman baru saat dicetak. */}
      <div className="sprin-lembar sprin-lampiran">
        <div className="lampiran-kepala">
          <div className="jd">Lampiran Surat Perintah {(JUDUL_JENIS[spt.jenis_kegiatan] ?? 'Surat Perintah').replace(/^Surat Perintah ?/i, '')}</div>
          <div className="brs"><span className="k">NOMOR</span><span className="d">:</span><span>{spt.nomor_spt ?? '—'}</span></div>
          <div className="brs"><span className="k">TANGGAL</span><span className="d">:</span><span>{tglIndo(spt.diterbitkan_pada ?? spt.tanggal_mulai)}</span></div>
        </div>

        <KopSurat />

        <h3 className="lampiran-judul">
          Daftar Nama {SEBUTAN_PELAKSANA[spt.jenis_kegiatan] ?? 'Petugas'}
        </h3>

        <table className="sprin-tabel lampiran-tabel">
          <thead>
            <tr>
              <th className="c-no">No.</th>
              <th className="c-nama">Nama</th>
              <th className="c-pangkat">Pangkat / NRP</th>
              <th className="c-jab">Jabatan</th>
            </tr>
            {/* Baris angka kolom — ada pada dokumen resmi. */}
            <tr className="angka-kolom">
              <th>1</th><th>2</th><th>3</th><th>4</th>
            </tr>
          </thead>
          <tbody>
            {tim.map((t, i) => (
              <tr key={t.kunci}>
                <td className="c-no">{i + 1}.</td>
                <td className="c-nama">{t.orang?.nama ?? '—'}</td>
                {/* Satu aliran teks, membungkus sendiri — dokumen asli
                    memutus baris setelah garis miring hanya ketika pangkatnya
                    panjang, bukan selalu. NRP dibaca dari baris users. */}
                <td className="c-pangkat">
                  {t.orang?.pangkat ?? '—'} / {t.orang?.nrp ?? '—'}
                </td>
                {/* Jabatan resmi (kolom jabatan, migrasi 0039). Bila
                    Admin belum mengisinya, kedudukan pada SPT dipakai
                    sebagai penadah supaya sel tidak pernah kosong. */}
                <td className="c-jab">{(t.orang?.id ? petaJabatan.get(t.orang.id) : null) || t.kedudukan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sprin-tempat-tanggal">
          <div><span className="k">Dikeluarkan di</span><span className="d">:</span> {pejabat?.kota ?? 'Bandung'}</div>
          <div><span className="k">pada tanggal</span><span className="d">:</span> {tglIndo(spt.diterbitkan_pada ?? spt.tanggal_mulai)}</div>
        </div>

        <div className="sprin-ttd-dua lampiran-ttd">
          <div className="kanan">
            <div className="jabatan-ttd">
              {pejabat?.atas_nama ?? 'a.n. DIREKTUR RESERSE KRIMINAL KHUSUS POLDA JABAR'}
            </div>
            <div className="jabatan-tengah">{pejabat?.jabatan ?? 'WADIR'}</div>
            <div className="ket-jabatan">{pejabat?.keterangan_jabatan ?? 'Selaku Penyidik'}</div>
            <div className="ruang" />
            <div className="blok-nama">
              <div className="nama-ttd">{pejabat?.nama ?? '—'}</div>
              <div className="pangkat-ttd">
                {pejabat?.pangkat ?? ''}{pejabat?.nrp ? ` NRP ${pejabat.nrp}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}