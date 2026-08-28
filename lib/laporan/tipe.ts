// Tipe dan label murni — TIDAK mengimpor apa pun yang menyentuh server
// (klienServer, next/headers). Komponen Client mengimpor dari sini,
// bukan dari kueri.ts, supaya lib/supabase/server.ts tidak ikut
// terbawa ke bundel peramban.

export type JenisLaporan = 'pulbaket_awal' | 'perkembangan' | 'akhir'
export type StatusKegiatan = 'berjalan' | 'selesai' | 'bermasalah'
export type StatusLokasi = 'terverifikasi' | 'di_luar_titik' | 'tidak_terekam'
export type AlasanLokasi =
  | 'gps_tidak_tertangkap' | 'daya_habis' | 'izin_lokasi_mati'
  | 'area_terbatas' | 'disusun_setelah_pulang' | 'perangkat_rusak' | 'lainnya'
export type StatusLaporan = 'terkirim' | 'perlu_diperbaiki' | 'disetujui' | 'ditarik'

export const LABEL_ALASAN_LOKASI: Record<AlasanLokasi, string> = {
  gps_tidak_tertangkap: 'Sinyal GPS tidak tertangkap di dalam gedung',
  daya_habis: 'Perangkat kehabisan daya saat kegiatan',
  izin_lokasi_mati: 'Izin lokasi tertolak atau tidak aktif',
  area_terbatas: 'Kegiatan di area terbatas yang melarang perangkat',
  disusun_setelah_pulang: 'Laporan disusun setelah meninggalkan lokasi',
  perangkat_rusak: 'Perangkat rusak atau tertinggal',
  lainnya: 'Lainnya',
}

export const LABEL_JENIS_LAPORAN: Record<JenisLaporan, string> = {
  pulbaket_awal: 'Pulbaket Awal',
  perkembangan: 'Perkembangan',
  akhir: 'Akhir',
}

export interface CatatanLaporan {
  id: string
  peninjau_id: string
  jenis: 'catatan' | 'minta_perbaikan'
  isi: string
  dibuat_pada: string
  disunting_pada: string | null
  users: { nama: string; peran: string } | null
}

export interface FotoLaporan {
  id: string
  sumber: 'kamera' | 'galeri'
  berkas_path: string
  keterangan: string | null
  lat: number | null
  lng: number | null
  diambil_pada: string | null
}

export interface LaporanLengkap {
  id: string
  penugasan_id: string
  pelapor_id: string
  jenis: JenisLaporan
  uraian: string
  kendala: string | null
  status_kegiatan: StatusKegiatan
  lokasi_lat: number | null
  lokasi_lng: number | null
  akurasi_meter: number | null
  status_lokasi: StatusLokasi | null
  lokasi_id: string | null
  lokasi_id_terdekat: string | null
  jarak_meter: number | null
  alasan_lokasi: AlasanLokasi | null
  alasan_lokasi_lainnya: string | null
  keterangan_lokasi: string | null
  status_laporan: StatusLaporan
  disunting_pada: string | null
  jumlah_suntingan: number
  dikirim_pada: string
  penugasan: { nomor_spt: string | null; judul: string; unit_id: string } | null
  pelapor: { nama: string; pangkat: string | null } | null
  lokasi_pilihan: { nama: string } | null
  lokasi_terdekat: { nama: string } | null
  catatan_laporan: CatatanLaporan[]
  foto_dokumentasi: FotoLaporan[]
}

export interface SptUntukLapor {
  id: string
  nomor_spt: string | null
  judul: string
  status: string
  tanggal_batas: string | null
  penugasan_lokasi: { id: string; urutan: number; nama: string }[]
}
