// Tipe data SiPANTAU — ditulis tangan, BUKAN hasil `supabase gen types`.
//
// Alasannya: berkas hasil generate ditimpa utuh setiap kali dijalankan,
// sehingga komentar yang menjelaskan aturan PRD ikut hilang. Di proyek
// ini justru komentar itulah yang menahan kesalahan berulang.

export type Peran = 'kasubdit' | 'kanit' | 'panit' | 'anggota' | 'pemeliharaan'

/** Empat peran organisasi. Akun Pemeliharaan sengaja di luar daftar ini —
 *  ia akun teknis, bukan peran kelima (docs/10-modul-6.1-auth.md §2.5). */
export const PERAN_ORGANISASI: Peran[] = ['kasubdit', 'kanit', 'panit', 'anggota']

export const LABEL_PERAN: Record<Peran, string> = {
  kasubdit: 'Kasubdit',
  kanit: 'Kanit',
  panit: 'Panit',
  anggota: 'Anggota',
  pemeliharaan: 'Akun Pemeliharaan',
}

export interface Unit {
  id: string
  nama: string
  keterangan: string | null
  aktif: boolean
  urutan: number
  kode_klasifikasi: string | null
}

export interface Pengguna {
  id: string
  nama: string
  nrp: string
  /** Teknis semata. DILARANG ditampilkan di antarmuka mana pun. */
  email_sistem: string
  pangkat: string | null
  peran: Peran
  unit_id: string | null
  aktif: boolean
  wajib_ganti_sandi: boolean
  terakhir_masuk: string | null
  sedang_bertugas: boolean
  posisi_terakhir_lat: number | null
  posisi_terakhir_lng: number | null
  /** Dasar penghitungan status hijau/kuning/abu-abu. JANGAN dicampur
   *  dengan terakhir_masuk. */
  terakhir_terlihat: string | null
}

export type JenisTindakanAudit =
  | 'masuk_berhasil' | 'keluar' | 'geser_perangkat'
  | 'ganti_sandi' | 'reset_sandi'
  | 'ubah_peran' | 'nonaktifkan_akun' | 'aktifkan_akun'
  | 'akses_pemeliharaan'
  | 'terbit_spt' | 'tutup_spt' | 'batal_spt' | 'hapus_spt'
  | 'finalisasi_lhp' | 'ekspor_dokumen'

/** Email sintetis dari NRP. Satu-satunya tempat pola ini ditulis —
 *  bentuknya juga ditegakkan CHECK constraint pada tabel users, jadi
 *  keduanya wajib tetap sama. */
export function emailSistemDari(nrp: string): string {
  return `${nrp.trim().toLowerCase()}@sipantau.internal`
}
