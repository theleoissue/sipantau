// Tipe data SiPANTAU — ditulis tangan, BUKAN hasil `supabase gen types`.
//
// Alasannya: berkas hasil generate ditimpa utuh setiap kali dijalankan,
// sehingga komentar yang menjelaskan aturan PRD ikut hilang. Di proyek
// ini justru komentar itulah yang menahan kesalahan berulang.

export type Peran = 'kasubdit' | 'admin' | 'kanit' | 'panit' | 'anggota' | 'pemeliharaan'

/** Lima peran organisasi. Akun Pemeliharaan sengaja di luar daftar ini —
 *  ia akun teknis, bukan peran keenam (docs/10-modul-6.1-auth.md §2.5).
 *
 *  Admin (migrasi 0032, keputusan sadar mengubah PRD) MENGGANTIKAN
 *  Kasubdit khusus untuk Manajemen Akun — Kasubdit kehilangan hak tulis
 *  peran/unit/aktif, tetap memegang Rekap Lintas Unit. Admin mendapat
 *  hak baca "semua unit" yang sama persis dengan Kasubdit di seluruh
 *  sistem lainnya. */
export const PERAN_ORGANISASI: Peran[] = ['kasubdit', 'admin', 'kanit', 'panit', 'anggota']

export const LABEL_PERAN: Record<Peran, string> = {
  kasubdit: 'Kasubdit',
  admin: 'Admin',
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
  /** Disertakan lewat join pada penggunaSekarang() (lib/auth/pengguna.ts)
   *  supaya app/(app)/layout.tsx tidak perlu kueri terpisah demi nama
   *  unit pada setiap navigasi. null untuk Akun Pemeliharaan. */
  unit?: { nama: string } | null
}

export type JenisTindakanAudit =
  | 'masuk_berhasil' | 'keluar' | 'geser_perangkat'
  | 'ganti_sandi' | 'reset_sandi'
  | 'ubah_peran' | 'nonaktifkan_akun' | 'aktifkan_akun'
  | 'buat_akun' | 'sunting_akun' | 'ubah_unit'
  | 'akses_pemeliharaan'
  | 'terbit_spt' | 'tutup_spt' | 'batal_spt' | 'hapus_spt'
  | 'finalisasi_lhp' | 'ekspor_dokumen'

/** Email sintetis dari NRP. Satu-satunya tempat pola ini ditulis —
 *  bentuknya juga ditegakkan CHECK constraint pada tabel users, jadi
 *  keduanya wajib tetap sama. */
export function emailSistemDari(nrp: string): string {
  return `${nrp.trim().toLowerCase()}@sipantau.internal`
}
