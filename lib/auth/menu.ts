import type { Peran } from '@/lib/supabase/types'

// =====================================================================
// Peta menu dan rute per peran
//
// BR-11 (mengikat): menu, tombol, dan tindakan di luar kewenangan peran
// TIDAK DIRENDER SAMA SEKALI — bukan dirender dalam keadaan nonaktif.
// KP-6.1-18 mengulanginya dengan kata-kata yang sama.
//
// Susunan menu di bawah disalin dari objek PERAN pada
// sipantau-mockup-v2-sprin.html supaya urutan dan sebutannya persis.
// =====================================================================

export type ButirNav =
  | { kelompok: string }
  | { id: string; rute: string; ikon: string; label: string }

export interface ProfilPeran {
  label: string
  /** Menu bilah samping, sudah termasuk kepala kelompoknya. */
  nav: ButirNav[]
  /** Empat menu yang muncul di bilah bawah pada layar telepon. */
  bilahBawah: string[]
  beranda: string
}

export const PROFIL: Record<Peran, ProfilPeran> = {
  kasubdit: {
    label: 'Kasubdit',
    nav: [
      { kelompok: 'Pengawasan' },
      { id: 'beranda',   rute: '/beranda',   ikon: 'dasbor',      label: 'Beranda' },
      { id: 'penugasan', rute: '/penugasan', ikon: 'spt',         label: 'Semua Penugasan' },
      { id: 'laporan',   rute: '/laporan',   ikon: 'masuk_kotak', label: 'Semua Laporan' },
      { id: 'peta',      rute: '/peta',      ikon: 'peta',        label: 'Peta Lapangan' },
      { id: 'personel',  rute: '/personel',  ikon: 'grafik',      label: 'Status Personel' },
      { kelompok: 'Administrasi' },
      { id: 'rekap',     rute: '/rekap',     ikon: 'unduh',       label: 'Rekap Lintas Unit' },
      { id: 'akun',      rute: '/akun',      ikon: 'orang',       label: 'Manajemen Akun' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'peta', 'personel'],
    beranda: '/beranda',
  },

  kanit: {
    label: 'Kanit',
    nav: [
      { kelompok: 'Unit Saya' },
      { id: 'beranda',   rute: '/beranda',   ikon: 'dasbor',      label: 'Beranda' },
      { id: 'penugasan', rute: '/penugasan', ikon: 'spt',         label: 'Kelola Penugasan' },
      { id: 'laporan',   rute: '/laporan',   ikon: 'masuk_kotak', label: 'Tinjau Laporan' },
      { id: 'peta',      rute: '/peta',      ikon: 'peta',        label: 'Peta Lapangan' },
      { id: 'personel',  rute: '/personel',  ikon: 'orang',       label: 'Personel Unit' },
      { kelompok: 'Tugas Saya' },
      { id: 'tugas',     rute: '/tugas',     ikon: 'satelit',     label: 'Sesi Tugas' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'peta', 'laporan'],
    beranda: '/beranda',
  },

  panit: {
    label: 'Panit',
    nav: [
      { kelompok: 'Penugasan Saya' },
      { id: 'beranda',   rute: '/beranda',   ikon: 'dasbor',      label: 'Beranda' },
      { id: 'penugasan', rute: '/penugasan', ikon: 'spt',         label: 'Penugasan Saya' },
      { id: 'laporan',   rute: '/laporan',   ikon: 'masuk_kotak', label: 'Tinjau Laporan' },
      { id: 'peta',      rute: '/peta',      ikon: 'peta',        label: 'Peta Tim' },
      { kelompok: 'Tugas Saya' },
      { id: 'tugas',     rute: '/tugas',     ikon: 'satelit',     label: 'Sesi Tugas' },
      { id: 'riwayat',   rute: '/riwayat',   ikon: 'riwayat',     label: 'Riwayat Laporan' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'peta', 'tugas'],
    beranda: '/beranda',
  },

  anggota: {
    label: 'Anggota',
    nav: [
      { kelompok: 'Tugas' },
      { id: 'beranda',   rute: '/beranda',   ikon: 'dasbor',  label: 'Beranda' },
      { id: 'tugas',     rute: '/tugas',     ikon: 'satelit', label: 'Sesi Tugas' },
      { id: 'penugasan', rute: '/penugasan', ikon: 'spt',     label: 'Tugas Saya' },
      { kelompok: 'Pelaporan' },
      { id: 'lapor',     rute: '/lapor',     ikon: 'lapor',   label: 'Kirim Laporan' },
      { id: 'riwayat',   rute: '/riwayat',   ikon: 'riwayat', label: 'Riwayat Laporan' },
    ],
    bilahBawah: ['beranda', 'tugas', 'lapor', 'riwayat'],
    beranda: '/beranda',
  },

  // Akun Pemeliharaan bukan peran kelima. Berandanya adalah halaman
  // pemeliharaan berisi daftar akun dan tombol reset, BUKAN dashboard
  // peran mana pun (KP-6.1-40).
  pemeliharaan: {
    label: 'Akun Pemeliharaan',
    nav: [
      { kelompok: 'Pemeliharaan' },
      { id: 'pemeliharaan', rute: '/pemeliharaan', ikon: 'orang', label: 'Daftar Akun' },
    ],
    bilahBawah: ['pemeliharaan'],
    beranda: '/pemeliharaan',
  },
}

// =====================================================================
// Penjaga rute
//
// MEMAKAI REGEX, BUKAN PENCOCOKAN AWALAN.
//
// Ini bukan selera. Pencocokan awalan pernah membuka celah nyata di
// proyek ini: mengizinkan '/penugasan' bagi seluruh peran sekaligus
// membuka '/penugasan/terbitkan' dan '/penugasan/<id>/sunting' bagi
// peran yang tidak berhak, karena keduanya berawalan sama. Peran yang
// tidak berwenang tinggal mengetik alamatnya langsung.
//
// Lapisan ini tetap BUKAN pengamanan sesungguhnya (KP-6.1-19) — aturan
// akses baris yang menahannya. Ia ada supaya pengguna tidak berhadapan
// dengan layar galat, sesuai KP-6.1-17.
// =====================================================================

interface AturanRute {
  pola: RegExp
  /** Peran yang boleh membuka. Kosong berarti seluruh peran yang masuk. */
  peran: Peran[]
}

export const RUTE_KHUSUS_PERAN: AturanRute[] = [
  // Menerbitkan dan menyunting SPT: eksklusif Kanit (BR-06).
  { pola: /^\/penugasan\/terbitkan\/?$/,             peran: ['kanit'] },
  { pola: /^\/penugasan\/[^/]+\/sunting\/?$/,        peran: ['kanit'] },
  { pola: /^\/penugasan\/[^/]+\/tutup\/?$/,          peran: ['kanit'] },

  // Manajemen akun dan rekap lintas unit: eksklusif Kasubdit (BR-07).
  { pola: /^\/akun(\/.*)?$/,                          peran: ['kasubdit'] },
  { pola: /^\/rekap(\/.*)?$/,                         peran: ['kasubdit'] },

  // Sesi Tugas dan pengiriman laporan: Anggota, Panit, dan Kanit.
  // Kasubdit tidak turun ke lapangan; Akun Pemeliharaan dilarang
  // membuka Sesi Tugas maupun menyusun laporan (KP-6.1-43).
  { pola: /^\/tugas(\/.*)?$/,                         peran: ['anggota', 'panit', 'kanit'] },
  { pola: /^\/lapor(\/.*)?$/,                         peran: ['anggota', 'panit', 'kanit'] },
  { pola: /^\/riwayat(\/.*)?$/,                       peran: ['anggota', 'panit', 'kanit'] },

  // Meninjau laporan: bukan urusan Anggota (matriks §2.3).
  { pola: /^\/laporan(\/.*)?$/,                       peran: ['kasubdit', 'kanit', 'panit'] },

  // Personel: Anggota hanya melihat dirinya, tidak punya halaman ini.
  { pola: /^\/personel(\/.*)?$/,                      peran: ['kasubdit', 'kanit'] },

  // Halaman pemeliharaan hanya untuk akun teknis itu sendiri.
  { pola: /^\/pemeliharaan(\/.*)?$/,                  peran: ['pemeliharaan'] },

  // Peta dan penugasan terbuka bagi keempat peran organisasi, tetapi
  // ISInya disaring aturan akses baris menurut lingkup masing-masing.
  { pola: /^\/peta(\/.*)?$/,                          peran: ['kasubdit', 'kanit', 'panit', 'anggota'] },
  { pola: /^\/penugasan(\/.*)?$/,                     peran: ['kasubdit', 'kanit', 'panit', 'anggota'] },
  { pola: /^\/beranda(\/.*)?$/,                       peran: ['kasubdit', 'kanit', 'panit', 'anggota'] },
]

/** Aturan PERTAMA yang cocok yang menang, jadi urutan daftar di atas
 *  penting: pola sempit ditulis sebelum pola lebar. */
export function bolehAksesRute(rute: string, peran: Peran): boolean {
  const aturan = RUTE_KHUSUS_PERAN.find(a => a.pola.test(rute))
  if (!aturan) return true
  return aturan.peran.includes(peran)
}

export function rutePeranIni(peran: Peran): string {
  return PROFIL[peran].beranda
}
