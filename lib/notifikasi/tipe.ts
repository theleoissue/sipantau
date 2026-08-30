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

export type TujuanNotifikasi = 'penugasan' | 'laporan' | 'akun' | 'tanpa_tujuan'

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
}

/** KP-6.9-15: layar yang dibuka saat pemberitahuan ditekan. */
export function tujuanRute(n: Pick<Notifikasi, 'tujuan_jenis' | 'tujuan_id'>): string | null {
  if (!n.tujuan_jenis || !n.tujuan_id) return null
  if (n.tujuan_jenis === 'penugasan') return `/penugasan/${n.tujuan_id}`
  if (n.tujuan_jenis === 'laporan') return `/laporan/${n.tujuan_id}`
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
