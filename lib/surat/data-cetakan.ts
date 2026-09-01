import { klienServer } from '@/lib/supabase/server'
import { satuPenugasan } from '@/lib/penugasan/kueri'

// =====================================================================
// Penyusun data untuk cetakan Surat Perintah (.docx).
//
// Berkas ini SENGAJA tidak tahu apa-apa soal docxtemplater maupun bentuk
// cetakannya. Tugasnya satu: mengubah sebuah SPT jadi objek datar berisi
// nilai siap-tempel. Dengan begitu berganti cetakan, berganti jenis
// perkara, bahkan berganti pustaka penghasil dokumen sekalipun tidak
// menyentuh berkas ini.
//
// Seluruh penyusunan kalimat resmi TIDAK dilakukan di sini — kalimat
// baku dan kutipan pasal tinggal di dalam berkas cetakan Word, tempat
// orang yang paham hukumnya dapat menyuntingnya tanpa menyentuh kode.
// =====================================================================

const LABEL_DASAR: Record<string, string> = {
  laporan_informasi: 'Laporan Informasi',
  laporan_polisi: 'Laporan Polisi',
  laporan_pengaduan: 'Laporan Pengaduan',
  surat_perintah_terdahulu: 'Surat Perintah',
  disposisi_pimpinan: 'Disposisi Pimpinan',
  lainnya: 'Dasar lain',
}

const JUDUL_JENIS: Record<string, string> = {
  penyelidikan: 'SURAT PERINTAH PENYELIDIKAN',
  pulbaket: 'SURAT PERINTAH PENGUMPULAN BAHAN KETERANGAN',
  pengamanan: 'SURAT PERINTAH PENGAMANAN',
}

const SEBUTAN_PELAKSANA: Record<string, string> = {
  penyelidikan: 'PENYELIDIK',
  pulbaket: 'PETUGAS',
  pengamanan: 'PETUGAS',
}

/** Tanggal panjang Indonesia. Zona Asia/Jakarta wajib (CLAUDE.md §5.5):
 *  server berjalan UTC, dan tanpa zona ini tanggal surat dinas meleset
 *  satu hari setiap hari sesudah pukul 17.00 WIB. */
function tglIndo(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso.length === 10 ? `${iso}T00:00:00+07:00` : iso))
}

export interface BarisPersonel {
  no: number
  nama: string
  pangkat: string
  nrp: string
  pangkat_nrp: string
  jabatan: string
}

export interface DataCetakanSurat {
  nomor_spt: string
  judul_surat: string
  sebutan_pelaksana: string
  judul: string
  objek: string
  sasaran: string
  uraian_tugas: string
  nomor_lp: string
  tanggal_mulai: string
  tanggal_batas: string
  tgl_terbit: string
  kota: string
  unit: string
  penerima_nama: string
  penerima_pangkat: string
  penerima_nrp: string
  pejabat_atas_nama: string
  pejabat_jabatan: string
  pejabat_keterangan: string
  pejabat_nama: string
  pejabat_pangkat: string
  pejabat_nrp: string
  personel: BarisPersonel[]
  dasar: { no: number; teks: string }[]
  lokasi: { no: number; nama: string }[]
  ada_personel: boolean
  ada_dasar: boolean
  ada_lokasi: boolean
}

/** null bila SPT tidak ada atau di luar lingkup pembacanya (RLS yang
 *  memutuskan, bukan pemeriksaan tambahan di sini). */
export async function dataCetakanSurat(penugasanId: string): Promise<DataCetakanSurat | null> {
  const spt = await satuPenugasan(penugasanId)
  if (!spt) return null

  const supabase = await klienServer()

  const { data: pejabat } = await supabase
    .from('pengaturan_surat')
    .select('kota, atas_nama, jabatan, keterangan_jabatan, nama, pangkat, nrp')
    .maybeSingle<{
      kota: string; atas_nama: string; jabatan: string; keterangan_jabatan: string
      nama: string | null; pangkat: string | null; nrp: string | null
    }>()

  // Panit Penanggung Jawab lebih dulu, lalu pelaksana yang bukan Panit —
  // urutan yang sama dengan surat fisik.
  const panitAktif = (spt.penugasan_panit ?? []).filter(p => !p.dicabut_pada)
  const idPanit = new Set(panitAktif.map(p => p.panit_id))
  const tim = [
    ...panitAktif.map(p => ({ orang: p.users, kedudukan: 'Panit Penanggung Jawab' })),
    ...(spt.penugasan_pelaksana ?? [])
      .filter(p => !p.dicabut_pada && !idPanit.has(p.pelaksana_id))
      .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
      .map(p => ({ orang: p.users, kedudukan: 'Pelaksana' })),
  ]

  // Jabatan resmi diambil terpisah — alasannya sama seperti pada halaman
  // cetak HTML: kolom ini hanya berguna untuk surat, dan menumpangkannya
  // pada kueri penugasan yang dipakai bersama membuat SELURUH halaman
  // Penugasan gagal dimuat sebelum migrasi 0039 terpasang.
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

  const personel: BarisPersonel[] = tim.map((t, i) => {
    const pangkat = t.orang?.pangkat ?? ''
    const nrp = t.orang?.nrp ?? ''
    return {
      no: i + 1,
      nama: t.orang?.nama ?? '',
      pangkat,
      nrp,
      // Disediakan tergabung JUGA, supaya berkas cetakan bebas memilih
      // satu sel gabungan atau dua kolom terpisah tanpa mengubah kode.
      pangkat_nrp: [pangkat, nrp].filter(Boolean).join(' / '),
      jabatan: (t.orang?.id ? petaJabatan.get(t.orang.id) : null) || t.kedudukan,
    }
  })

  const penerima = tim.find(t => t.kedudukan === 'Panit Penanggung Jawab')?.orang ?? tim[0]?.orang

  const dasar = [...(spt.penugasan_dasar ?? [])]
    .sort((a, b) => a.urutan - b.urutan)
    .map((d, i) => ({
      no: i + 1,
      teks: [
        LABEL_DASAR[d.jenis] ?? d.jenis,
        d.nomor ? `Nomor ${d.nomor}` : '',
        d.tanggal ? `tanggal ${tglIndo(d.tanggal)}` : '',
        d.keterangan ?? '',
      ].filter(Boolean).join(' ').replace(/\s+,/g, ',').trim(),
    }))

  const lokasi = [...(spt.penugasan_lokasi ?? [])]
    .sort((a, b) => a.urutan - b.urutan)
    .map((l, i) => ({ no: i + 1, nama: l.nama }))

  return {
    nomor_spt: spt.nomor_spt ?? '',
    judul_surat: JUDUL_JENIS[spt.jenis_kegiatan] ?? 'SURAT PERINTAH',
    sebutan_pelaksana: SEBUTAN_PELAKSANA[spt.jenis_kegiatan] ?? 'PETUGAS',
    judul: spt.judul ?? '',
    objek: spt.objek ?? '',
    sasaran: spt.sasaran ?? '',
    uraian_tugas: spt.uraian_tugas ?? '',
    nomor_lp: spt.nomor_lp ?? '',
    tanggal_mulai: tglIndo(spt.tanggal_mulai),
    tanggal_batas: tglIndo(spt.tanggal_batas),
    tgl_terbit: tglIndo(spt.diterbitkan_pada ?? spt.tanggal_mulai),
    kota: pejabat?.kota ?? 'Bandung',
    unit: spt.unit?.nama ?? '',
    penerima_nama: penerima?.nama ?? '',
    penerima_pangkat: penerima?.pangkat ?? '',
    penerima_nrp: penerima?.nrp ?? '',
    pejabat_atas_nama: pejabat?.atas_nama ?? '',
    pejabat_jabatan: pejabat?.jabatan ?? '',
    pejabat_keterangan: pejabat?.keterangan_jabatan ?? '',
    pejabat_nama: pejabat?.nama ?? '',
    pejabat_pangkat: pejabat?.pangkat ?? '',
    pejabat_nrp: pejabat?.nrp ?? '',
    personel,
    dasar,
    lokasi,
    // Penanda bagi bagian bersyarat pada cetakan ({#ada_lokasi}...),
    // supaya kepala tabel tidak ikut tercetak saat isinya kosong.
    ada_personel: personel.length > 0,
    ada_dasar: dasar.length > 0,
    ada_lokasi: lokasi.length > 0,
  }
}
