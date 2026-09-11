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
  /** Menu utama mobile; peran lapangan menempatkan Sesi Tugas di tengah. */
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
      { id: 'lhp',       rute: '/lhp',       ikon: 'berkas',      label: 'LHP Ringkas' },
      { kelompok: 'Administrasi' },
      { id: 'rekap',     rute: '/rekap',     ikon: 'unduh',       label: 'Rekap Lintas Unit' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'peta', 'personel'],
    beranda: '/beranda',
  },

  // Admin (migrasi 0032, keputusan sadar mengubah PRD — lihat komentar
  // pada Peran di lib/supabase/types.ts) MENGGANTIKAN Kasubdit khusus
  // untuk Manajemen Akun. Nav-nya sama persis dengan Kasubdit di seluruh
  // sistem lain (hak baca "semua unit" identik), MINUS Rekap Lintas Unit
  // (tetap eksklusif Kasubdit, tidak ikut dipindah) PLUS Manajemen Akun
  // eksklusif.
  admin: {
    label: 'Admin',
    nav: [
      { kelompok: 'Pengawasan' },
      { id: 'beranda',   rute: '/beranda',   ikon: 'dasbor',      label: 'Beranda' },
      { id: 'penugasan', rute: '/penugasan', ikon: 'spt',         label: 'Semua Penugasan' },
      { id: 'laporan',   rute: '/laporan',   ikon: 'masuk_kotak', label: 'Semua Laporan' },
      { id: 'peta',      rute: '/peta',      ikon: 'peta',        label: 'Peta Lapangan' },
      { id: 'personel',  rute: '/personel',  ikon: 'grafik',      label: 'Status Personel' },
      { id: 'lhp',       rute: '/lhp',       ikon: 'berkas',      label: 'LHP Ringkas' },
      { kelompok: 'Administrasi' },
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
      // Pintu tetap ke kotak persetujuan scan. Sebelumnya satu-satunya
      // jalan masuk adalah kartu di dalam halaman terbitkan, sehingga
      // ajuan bawahan hanya ketemu kalau Kanit kebetulan mencarinya.
      { id: 'pengajuan', rute: '/penugasan/pengajuan', ikon: 'centang', label: 'Persetujuan Scan' },
      { id: 'laporan',   rute: '/laporan',   ikon: 'masuk_kotak', label: 'Tinjau Laporan' },
      { id: 'peta',      rute: '/peta',      ikon: 'peta',        label: 'Peta Lapangan' },
      { id: 'personel',  rute: '/personel',  ikon: 'orang',       label: 'Personel Unit' },
      { id: 'lhp',       rute: '/lhp',       ikon: 'berkas',      label: 'LHP Ringkas' },
      { kelompok: 'Tugas Saya' },
      { id: 'tugas',     rute: '/tugas',     ikon: 'satelit',     label: 'Sesi Tugas' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'tugas', 'peta', 'laporan'],
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
      { id: 'lhp',       rute: '/lhp',       ikon: 'berkas',      label: 'LHP Ringkas' },
      { kelompok: 'Tugas Saya' },
      { id: 'tugas',     rute: '/tugas',     ikon: 'satelit',     label: 'Sesi Tugas' },
      { id: 'riwayat',   rute: '/riwayat',   ikon: 'riwayat',     label: 'Riwayat Laporan' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'tugas', 'peta', 'laporan'],
    beranda: '/beranda',
  },

  anggota: {
    label: 'Anggota',
    nav: [
      { kelompok: 'Tugas' },
      { id: 'beranda',   rute: '/beranda',   ikon: 'dasbor',  label: 'Beranda' },
      { id: 'tugas',     rute: '/tugas',     ikon: 'satelit', label: 'Sesi Tugas' },
      { id: 'penugasan', rute: '/penugasan', ikon: 'spt',     label: 'Tugas Saya' },
      // Modul 6.4 Bagian 577 memberi Anggota hak melihat peta waktu
      // nyata: posisi sendiri DAN rekan pelaksana aktif pada SPT yang
      // sama. Kebijakan RLS (posisi_terkini_baca_sesuai_lingkup, 0017),
      // penjaga rute, bahkan kalimat pengantar khusus Anggota pada
      // halamannya sudah lengkap sejak awal — hanya butir menu ini yang
      // tidak pernah terpasang, sehingga haknya ada tetapi tidak ada
      // satu pun jalan menuju ke sana.
      { id: 'peta',      rute: '/peta',      ikon: 'peta',    label: 'Peta Tim' },
      { kelompok: 'Pelaporan' },
      { id: 'lapor',     rute: '/lapor',     ikon: 'lapor',   label: 'Kirim Laporan' },
      { id: 'riwayat',   rute: '/riwayat',   ikon: 'riwayat', label: 'Riwayat Laporan' },
      { id: 'lhp',       rute: '/lhp',       ikon: 'berkas',  label: 'LHP Ringkas' },
    ],
    bilahBawah: ['beranda', 'penugasan', 'tugas', 'peta', 'lapor'],
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
  // Menerbitkan dan menyunting SPT: eksklusif Kanit (BR-06). Sub-rute
  // /penugasan/terbitkan/<id> (sunting draf, wizard yang sama dipakai
  // ulang) ikut tercakup pola ini.
  { pola: /^\/penugasan\/terbitkan(\/.*)?$/,         peran: ['kanit'] },
  // Scan oleh Panit/Anggota selalu menjadi pengajuan; kotak persetujuan
  // dan penerbitan tetap eksklusif Kanit.
  { pola: /^\/penugasan\/scan\/?$/,                   peran: ['anggota', 'panit', 'kanit'] },
  // Usulan: hanya yang benar-benar dapat mengusulkan. Kanit tidak
  // disertakan — ia menerbitkan langsung, dan ajukan_usulan_sprin
  // memang menolaknya (BUKAN_PENGAJU). Merender formulir yang pasti
  // gagal dikirim lebih buruk daripada tidak merendernya sama sekali.
  { pola: /^\/penugasan\/usul\/?$/,                   peran: ['anggota', 'panit'] },
  { pola: /^\/penugasan\/pengajuan(\/.*)?$/,          peran: ['kanit'] },
  { pola: /^\/penugasan\/[^/]+\/sunting\/?$/,        peran: ['kanit'] },
  { pola: /^\/penugasan\/[^/]+\/tutup\/?$/,          peran: ['kanit'] },

  // Manajemen akun: eksklusif Admin sejak migrasi 0032 (Kasubdit
  // kehilangan hak ini — "Menggantikan", keputusan sadar mengubah PRD).
  // Rekap lintas unit TETAP eksklusif Kasubdit, tidak ikut dipindah.
  { pola: /^\/akun(\/.*)?$/,                          peran: ['admin'] },
  { pola: /^\/rekap(\/.*)?$/,                         peran: ['kasubdit'] },

  // Sesi Tugas dan pengiriman laporan: Anggota, Panit, dan Kanit.
  // Kasubdit tidak turun ke lapangan; Akun Pemeliharaan dilarang
  // membuka Sesi Tugas maupun menyusun laporan (KP-6.1-43).
  { pola: /^\/tugas(\/.*)?$/,                         peran: ['anggota', 'panit', 'kanit'] },
  { pola: /^\/lapor(\/.*)?$/,                         peran: ['anggota', 'panit', 'kanit'] },
  { pola: /^\/riwayat(\/.*)?$/,                       peran: ['anggota', 'panit', 'kanit'] },

  // Daftar peninjauan: bukan urusan Anggota (matriks §2.3). Rincian
  // SATU laporan (/laporan/<id>) terbuka bagi keempat peran — Anggota
  // membuka miliknya sendiri lewat tautan dari Riwayat Laporan, dan
  // lingkupnya tetap ditegakkan RLS (pelapor_id = auth.uid()), bukan
  // oleh penjaga rute ini.
  { pola: /^\/laporan\/?$/,                           peran: ['kasubdit', 'admin', 'kanit', 'panit'] },
  { pola: /^\/laporan\/[^/]+$/,                       peran: ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] },

  // Personel: Anggota hanya melihat dirinya, tidak punya halaman ini.
  { pola: /^\/personel(\/.*)?$/,                      peran: ['kasubdit', 'admin', 'kanit'] },

  // Halaman pemeliharaan hanya untuk akun teknis itu sendiri.
  { pola: /^\/pemeliharaan(\/.*)?$/,                  peran: ['pemeliharaan'] },

  // Akun Pemeliharaan tidak pernah menerima pemberitahuan (KP-6.9-41,
  // "bukan bagian dari alur kerja") — halamannya pun bukan untuknya.
  { pola: /^\/pemberitahuan(\/.*)?$/,                 peran: ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] },

  // LHP Ringkas: peran organisasi boleh membuka (melihat dalam
  // lingkupnya, hanya Anggota yang benar-benar dapat menyusun/menyunting
  // — ditegakkan RLS 0028, bukan penjaga rute ini). Akun Pemeliharaan
  // tidak pernah ikut serta (docs/00-fondasi.md §7 tidak menyebutnya).
  { pola: /^\/lhp(\/.*)?$/,                           peran: ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] },

  // Peta dan penugasan terbuka bagi peran organisasi, tetapi ISInya
  // disaring aturan akses baris menurut lingkup masing-masing.
  { pola: /^\/peta(\/.*)?$/,                          peran: ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] },
  { pola: /^\/penugasan(\/.*)?$/,                     peran: ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] },
  { pola: /^\/beranda(\/.*)?$/,                       peran: ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] },
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
