// Tipe dan label murni — TIDAK mengimpor apa pun yang menyentuh server
// (klienServer, next/headers). Komponen Client mengimpor dari sini,
// bukan dari kueri.ts, supaya lib/supabase/server.ts tidak ikut
// terbawa ke bundel peramban.

export type StatusLhp = 'draf' | 'final'
export type PeranPihak = 'pelapor' | 'terlapor'

export interface PetugasLhp {
  id: string
  petugas_id: string
  urutan: number
  users: { nama: string; pangkat: string | null; nrp: string } | null
}

export interface PihakLhp {
  id: string
  peran: PeranPihak
  nama: string
  nomor_pengenal: string | null
  keterangan: string | null
  urutan: number
}

export interface SaksiLhp {
  id: string
  nama: string
  kedudukan: string | null
  keterangan: string | null
  urutan: number
}

export interface BarangBuktiLhp {
  id: string
  uraian: string
  keterangan: string | null
  urutan: number
}

export interface FotoLhp {
  foto_id: string
  foto_dokumentasi: { berkas_path: string; keterangan: string | null } | null
}

export interface LhpLengkap {
  id: string
  penugasan_id: string
  disusun_oleh: string
  dasar: string | null
  waktu_kegiatan: string | null
  tempat_kegiatan: string | null
  perkara: string | null
  dasar_hukum: string | null
  kronologis: string | null
  langkah: string | null
  rencana_tindak_lanjut: string | null
  kesimpulan: string | null
  catatan: string | null
  status: StatusLhp
  dibuat_pada: string
  diubah_pada: string
  penugasan: { nomor_spt: string | null; judul: string; unit_id: string } | null
  penyusun: { nama: string; pangkat: string | null; nrp: string } | null
  lhp_petugas: PetugasLhp[]
  lhp_pihak: PihakLhp[]
  lhp_saksi: SaksiLhp[]
  lhp_barang_bukti: BarangBuktiLhp[]
  lhp_foto: FotoLhp[]
}
