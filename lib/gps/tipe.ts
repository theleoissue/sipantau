// Tipe murni Modul 6.4 (GPS). Tanpa impor next/headers — aman dipakai
// Client Component maupun Server Component, mengikuti pemisahan yang
// sama dengan lib/laporan/tipe.ts.

export type SebabPenutupanSesi =
  | 'manual' | 'keluar_aplikasi' | 'pindah_perangkat' | 'menggantung'
  | 'spt_ditutup' | 'dicabut_dari_spt' | 'akun_dinonaktifkan'

export const LABEL_SEBAB_PENUTUPAN: Record<SebabPenutupanSesi, string> = {
  manual: 'Diselesaikan manual',
  keluar_aplikasi: 'Keluar dari aplikasi',
  pindah_perangkat: 'Masuk di perangkat lain',
  menggantung: 'Tidak ada pembaruan posisi',
  spt_ditutup: 'Penugasan ditutup',
  dicabut_dari_spt: 'Dicabut dari penugasan',
  akun_dinonaktifkan: 'Akun dinonaktifkan',
}

export type SumberLokasi = 'gps' | 'jaringan' | 'fusi' | 'tidak_diketahui'

/** Sesi Tugas milik pengguna yang sedang masuk, kalau sedang berjalan. */
export interface SesiAktifSaya {
  id: string
  penugasan_id: string
  nomor_spt: string | null
  judul: string
  dibuka_pada: string
  titik_terakhir_pada: string | null
  jumlah_titik: number
  izin_dicabut_pada: string | null
  izin_dipulihkan_pada: string | null
  /** Berawalan 'web-' bila sesi ini dimulai dari Mulai Tugas versi web
   *  (migrasi 0031) — dipakai kartu-sesi-tugas.tsx memutuskan apakah
   *  tab ini sendiri yang harus melanjutkan mengirim Titik. */
  penanda_perangkat: string
}

/** Satu baris posisi_terkini beserta keterangan yang perlu ditampilkan
 *  peta — sudah digabung nama pemilik dan keterangan SPT-nya. */
export interface PosisiPeta {
  sesi_tugas_id: string
  penugasan_id: string
  pengguna_id: string
  unit_id: string
  lat: number
  lng: number
  akurasi_meter: number | null
  baterai_persen: number | null
  sumber_lokasi: SumberLokasi
  izin_terputus: boolean
  direkam_pada: string
  nama: string
  nomor_spt: string | null
  judul: string
}

/** Status Terakhir terlihat — tiga warna, tanpa kalimat menghakimi
 *  (KP-6.4-33..36, Prinsip 0.6). Dihitung dari direkam_pada, BUKAN
 *  waktu tiba di server (BR-45/KP-6.4-39). */
export type StatusSinyal = 'aktif' | 'pantau' | 'lama'

export function statusSinyal(direkamPada: string): StatusSinyal {
  const menit = (Date.now() - new Date(direkamPada).getTime()) / 60_000
  if (menit < 2) return 'aktif'
  if (menit <= 15) return 'pantau'
  return 'lama'
}

export function labelTerakhirTerlihat(direkamPada: string): string {
  const menit = Math.floor((Date.now() - new Date(direkamPada).getTime()) / 60_000)
  if (menit < 2) return 'Aktif'
  if (menit < 60) return `Terakhir terlihat ${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `Terakhir terlihat ${jam} jam lalu`
  return `Terakhir terlihat ${Math.floor(jam / 24)} hari lalu`
}

export interface SesiRute {
  id: string
  pengguna_id: string
  nama: string
  dibuka_pada: string
  ditutup_pada: string | null
  sebab_penutupan: SebabPenutupanSesi | null
  jarak_tempuh_meter: number | null
  jumlah_titik: number
  diringkas_pada: string | null
  lat_awal: number | null
  lng_awal: number | null
  lat_akhir: number | null
  lng_akhir: number | null
}

export interface TitikRute {
  id: string
  lat: number
  lng: number
  direkam_pada: string
  diragukan_sebab: string | null
}

// ---------------------------------------------------------------------
// Penyaringan goyangan GPS (jitter) — dipakai rute-spt.tsx (riwayat)
// DAN peta-langsung.tsx (jejak hidup). Satu definisi bersama supaya
// keduanya menegakkan ambang yang sama persis, bukan dua tempat yang
// diam-diam berbeda (CLAUDE.md §11).
//
// BUKAN soal akurasi/lompatan — itu sudah ditegakkan server lewat
// diragukan_sebab (KP-6.4-14/15). Ini murni gejala LAIN: seseorang yang
// diam di tempat (jaga pos, menunggu) tetap menerima Titik yang
// bergeser acak beberapa puluh meter akibat sinyal memantul dari
// bangunan (multipath) — nilai akurasi yang dilaporkan perangkat bisa
// saja tetap "baik" meski posisinya keliru, karena akurasi itu tingkat
// keyakinan perangkat sendiri, bukan jaminan kebenaran. Titik-titik itu
// LOLOS kedua pemeriksaan server, lalu tersambung garis lurus berurutan
// waktu, membentuk pola bintang berduri di peta — bukan jalur
// sungguhan.
// ---------------------------------------------------------------------

/** Jarak antara dua koordinat dalam meter (Haversine) — cukup akurat
 *  untuk jarak sependek ini, jauh di bawah presisi GPS itu sendiri. */
export function jarakMeter(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const lat1 = a[0] * Math.PI / 180
  const lat2 = b[0] * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Di bawah ini dianggap goyangan, bukan gerakan sungguhan. */
export const AMBANG_GOYANGAN_METER = 20

/**
 * Membuang Titik yang cuma bergeser dalam rentang goyangan dari Titik
 * TERAKHIR YANG SUDAH DIPERTAHANKAN — bukan dari Titik mentah
 * sebelumnya. Sengaja begitu: pergeseran lambat yang genuinely
 * berpindah tempat (beberapa meter tiap Titik, bertahan searah) tetap
 * terekam begitu akumulasinya melewati ambang, bukan terhapus diam-
 * diam karena tiap langkahnya sendiri-sendiri terlalu kecil.
 */
export function saringGoyangan(titik: [number, number][]): [number, number][] {
  if (titik.length === 0) return []
  const hasil: [number, number][] = [titik[0]]
  for (let i = 1; i < titik.length; i++) {
    const terakhir = hasil[hasil.length - 1]
    if (jarakMeter(terakhir, titik[i]) >= AMBANG_GOYANGAN_METER) hasil.push(titik[i])
  }
  return hasil
}
