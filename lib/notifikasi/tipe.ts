// Tipe murni Modul 6.9. Judul dan isi TIDAK disusun ulang di sini —
// keduanya dibaca apa adanya dari baris notifikasi (AM-6.9-03: judul
// baku, tidak disusun bebas oleh pemanggil, dan itu berlaku juga bagi
// lapisan tampilan — satu sumber kebenaran di basis data).

export type JenisNotifikasi =
  | 'spt_diterbitkan' | 'spt_ditugaskan' | 'spt_lewat_batas' | 'spt_bermasalah'
  | 'spt_dicabut' | 'spt_ditutup'
  | 'laporan_masuk' | 'laporan_dikoreksi' | 'catatan_diberikan'
  | 'laporan_perlu_diperbaiki' | 'laporan_disetujui'
  | 'sesi_ditutup_keluar_aplikasi' | 'izin_lokasi_terputus' | 'sesi_menggantung'
  | 'akun_dinonaktifkan' | 'kata_sandi_direset'
  // Ditambahkan migrasi 0029 bersama Modul 6.8 (LHP), sesudah daftar di
  // bawah ditulis untuk Modul 6.9 — dan TERLEWAT di sisi TypeScript
  // sampai halaman Pemberitahuan seorang Kanit mati total karenanya.
  | 'lhp_difinalkan'

export type TujuanNotifikasi = 'penugasan' | 'laporan' | 'akun' | 'tanpa_tujuan' | 'lhp'

export interface Notifikasi {
  id: string
  jenis: JenisNotifikasi
  judul: string
  isi: string | null
  tujuan_jenis: TujuanNotifikasi | null
  tujuan_id: string | null
  mendesak: boolean
  dibaca_pada: string | null
  dibuat_pada: string
}

/** Ikon dan warna per jenis — disalin dari objek JENIS_PB pada
 *  sipantau-mockup-v2-sprin.html (docs/CLAUDE.md §7.1: prototype yang
 *  diikuti). Judul TIDAK disalin dari sana — dipakai judul baku
 *  sungguhan dari baris notifikasi, bukan salinan kedua yang bisa
 *  menyimpang. */
export const IKON_JENIS_NOTIFIKASI: Record<JenisNotifikasi, { ikon: string; bg: string; warna: string }> = {
  spt_diterbitkan:              { ikon: 'spt',         bg: 'var(--amber-bg)', warna: '#B45309' },
  spt_ditugaskan:                { ikon: 'spt',         bg: 'var(--blue-bg)',  warna: '#1D4ED8' },
  spt_lewat_batas:                { ikon: 'awas',        bg: 'var(--amber-bg)', warna: '#B45309' },
  spt_bermasalah:                { ikon: 'awas',        bg: 'var(--red-bg)',   warna: '#B91C1C' },
  spt_dicabut:                    { ikon: 'silang',      bg: 'var(--bg)',       warna: '#475569' },
  spt_ditutup:                    { ikon: 'centang',     bg: 'var(--green-bg)', warna: '#047857' },
  laporan_masuk:                  { ikon: 'masuk_kotak', bg: 'var(--blue-bg)',  warna: '#1D4ED8' },
  laporan_dikoreksi:              { ikon: 'lapor',       bg: 'var(--bg)',       warna: '#475569' },
  catatan_diberikan:              { ikon: 'kirim',       bg: 'var(--amber-bg)', warna: '#B45309' },
  laporan_perlu_diperbaiki:      { ikon: 'awas',        bg: 'var(--red-bg)',   warna: '#B91C1C' },
  laporan_disetujui:              { ikon: 'centang',     bg: 'var(--green-bg)', warna: '#047857' },
  sesi_ditutup_keluar_aplikasi:  { ikon: 'satelit',     bg: 'var(--red-bg)',   warna: '#B91C1C' },
  izin_lokasi_terputus:          { ikon: 'pin',         bg: 'var(--red-bg)',   warna: '#B91C1C' },
  sesi_menggantung:                { ikon: 'riwayat',     bg: 'var(--bg)',       warna: '#475569' },
  akun_dinonaktifkan:              { ikon: 'orang',       bg: 'var(--bg)',       warna: '#475569' },
  kata_sandi_direset:              { ikon: 'kunci_buka',  bg: 'var(--amber-bg)', warna: '#B45309' },
  lhp_difinalkan:                  { ikon: 'berkas',      bg: 'var(--green-bg)', warna: '#047857' },
}

/** Dipakai bila jenis dari basis data BELUM dikenal peta di atas.
 *
 *  Ini bukan kemewahan. Daftar jenis notifikasi sudah sekali dipanjangkan
 *  dari berkas migrasi modul lain (0029 menambah lhp_difinalkan saat
 *  Modul 6.8 dibangun) tanpa sisi TypeScript ikut diperbarui, dan
 *  akibatnya bukan satu baris yang tampil aneh melainkan SELURUH halaman
 *  Pemberitahuan mati — sebab rupa yang undefined dibaca .bg-nya saat
 *  render. Satu baris yang jenisnya belum dikenal tidak boleh sanggup
 *  menjatuhkan halaman berisi puluhan baris lain yang baik-baik saja. */
export const RUPA_NOTIFIKASI_BAKU = { ikon: 'lonceng', bg: 'var(--bg)', warna: '#475569' }

/** KP-6.9-15: layar yang dibuka saat pemberitahuan ditekan. */
export function tujuanRute(n: Pick<Notifikasi, 'tujuan_jenis' | 'tujuan_id'>): string | null {
  if (!n.tujuan_jenis || !n.tujuan_id) return null
  if (n.tujuan_jenis === 'penugasan') return `/penugasan/${n.tujuan_id}`
  if (n.tujuan_jenis === 'laporan') return `/laporan/${n.tujuan_id}`
  // tujuan_id di sini adalah id LHP, BUKAN penugasan_id — migrasi 0030
  // menyebutkannya terang-terangan pada finalkan_lhp().
  if (n.tujuan_jenis === 'lhp') return `/lhp/${n.tujuan_id}`
  return null
}

/** Q-06/KP-6.9-12: berhenti pada 99, di atas itu "99+". */
export function labelJumlah(n: number): string {
  return n > 99 ? '99+' : String(n)
}

/** KP-6.9-35: nisbi untuk kurang dari sehari, tanggal untuk selebihnya. */
export function labelWaktuNotifikasi(iso: string): string {
  const menit = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (menit < 1) return 'Baru saja'
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

// ---------------------------------------------------------------------
// Pengelompokan per hari — dipindah dari lib/notifikasi/kueri.ts supaya
// dapat dipakai komponen klien (DaftarNotifikasi, pemuatan bertahap
// KP-6.9-13) tanpa ikut menyeret klienServer (next/headers, tidak boleh
// masuk bundel klien). Berkas ini murni fungsi, sudah aman diimpor
// komponen klien (BarisNotifikasi.tsx sudah melakukannya).
// ---------------------------------------------------------------------

/** Q-08/BR-64: dikelompokkan menurut hari kalender Asia/Jakarta, BUKAN
 *  ::date polos yang membaca zona bawaan server (UTC). */
export function kunciHariJakarta(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso)) // 'en-CA' -> YYYY-MM-DD, urut leksikal benar
}

export function labelHari(kunci: string): string {
  const hariIniJakarta = kunciHariJakarta(new Date().toISOString())
  const kemarinJakarta = kunciHariJakarta(new Date(Date.now() - 24 * 3600_000).toISOString())
  if (kunci === hariIniJakarta) return 'Hari ini'
  if (kunci === kemarinJakarta) return 'Kemarin'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(kunci + 'T00:00:00+07:00'))
}

export function kelompokkanPerHari(daftar: Notifikasi[]): { kunci: string; label: string; baris: Notifikasi[] }[] {
  const peta = new Map<string, Notifikasi[]>()
  for (const n of daftar) {
    const kunci = kunciHariJakarta(n.dibuat_pada)
    if (!peta.has(kunci)) peta.set(kunci, [])
    peta.get(kunci)!.push(n)
  }
  return [...peta.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([kunci, baris]) => ({ kunci, label: labelHari(kunci), baris }))
}
