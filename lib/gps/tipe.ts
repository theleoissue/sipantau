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
 * Tingkatan mutu satu pembacaan GPS.
 *
 * Sepuluh meter adalah TARGET MUTU, bukan janji ketelitian: di dalam
 * gedung pabrik angka itu sering tidak tercapai oleh perangkat mana pun,
 * dan penyaringan tidak membuat pembacaan jadi lebih akurat — ia hanya
 * membuang yang buruk. Karena itu Titik 'rendah' TETAP DISIMPAN sebagai
 * bukti; yang dibedakan hanyalah apakah ia boleh menggerakkan ikon.
 *
 * AKURASI_DIRAGUKAN_METER wajib sama dengan ambang di fn_catat_titik
 * (migrasi 0051, dibawa ulang oleh 0056). Kalau salah satu digeser tanpa
 * yang lain, basis data dan layar akan menyebut Titik yang sama dengan
 * dua sebutan berbeda.
 */
export const AKURASI_TINGGI_METER = 10
export const AKURASI_DIRAGUKAN_METER = 30

export type MutuAkurasi = 'tinggi' | 'sedang' | 'rendah' | 'tidak_diketahui'

export function mutuAkurasi(meter: number | null | undefined): MutuAkurasi {
  if (meter == null) return 'tidak_diketahui'
  if (meter <= AKURASI_TINGGI_METER) return 'tinggi'
  if (meter <= AKURASI_DIRAGUKAN_METER) return 'sedang'
  return 'rendah'
}

/**
 * Arah perjalanan dari satu titik ke titik berikutnya, dalam derajat
 * kompas (0 = utara, 90 = timur).
 *
 * Diturunkan dari perpindahan, BUKAN dari arah_derajat perangkat:
 * posisi_terkini tidak menyimpan kolom itu, dan peramban kerap
 * mengembalikan heading kosong saat kecepatan rendah. Menurunkannya
 * dari dua posisi juga membuat ikon menunjuk searah garis yang memang
 * tergambar, bukan ke arah lain.
 */
export function arahDerajat(dari: [number, number], ke: [number, number]): number {
  const φ1 = dari[0] * Math.PI / 180
  const φ2 = ke[0] * Math.PI / 180
  const Δλ = (ke[1] - dari[1]) * Math.PI / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function catmullRom(
  p0: [number, number], p1: [number, number],
  p2: [number, number], p3: [number, number], t: number,
): [number, number] {
  const t2 = t * t, t3 = t2 * t
  const sumbu = (a: number, b: number, c: number, d: number) =>
    0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return [
    sumbu(p0[0], p1[0], p2[0], p3[0]),
    sumbu(p0[1], p1[1], p2[1], p3[1]),
  ]
}

/**
 * Melengkungkan jejak supaya tidak patah-patah bersudut di setiap Titik.
 *
 * Catmull-Rom SENGAJA dipilih karena ia INTERPOLASI: kurvanya melewati
 * PERSIS setiap titik asli, dan yang ditambahkan hanya lengkungan DI
 * ANTARA titik. Tidak ada satu pun koordinat rekaman yang digeser.
 *
 * Perbedaan itu bukan soal selera pada sistem ini: menempelkan jejak ke
 * jalan (map matching) MEMINDAHKAN titik, sedangkan ini tidak — dan
 * jejak petugas dapat menjadi bahan bukti penyelidikan.
 *
 * Murni lapisan tampilan; data mentah tidak disentuh sama sekali.
 */
export function haluskanJejak(titik: [number, number][], perSegmen = 6): [number, number][] {
  if (titik.length < 3) return titik
  const hasil: [number, number][] = []
  for (let i = 0; i < titik.length - 1; i++) {
    const p0 = titik[i === 0 ? 0 : i - 1]
    const p1 = titik[i]
    const p2 = titik[i + 1]
    const p3 = titik[i + 2 >= titik.length ? titik.length - 1 : i + 2]
    for (let s = 0; s < perSegmen; s++) hasil.push(catmullRom(p0, p1, p2, p3, s / perSegmen))
  }
  hasil.push(titik[titik.length - 1])
  return hasil
}

export const LABEL_MUTU_AKURASI: Record<MutuAkurasi, string> = {
  tinggi: 'GPS akurat',
  sedang: 'GPS cukup',
  rendah: 'GPS lemah',
  tidak_diketahui: 'Akurasi tidak dilaporkan',
}

/**
 * Membersihkan Titik mentah jadi jejak yang layak digambar, dua lapis:
 *
 * 1. GOYANGAN KECIL — Titik yang cuma bergeser dalam rentang goyangan
 *    dari Titik TERAKHIR YANG SUDAH DIPERTAHANKAN (bukan dari Titik
 *    mentah sebelumnya) dibuang. Pergeseran lambat yang genuinely
 *    berpindah tempat tetap terekam begitu akumulasinya melewati
 *    ambang, bukan terhapus diam-diam karena tiap langkahnya sendiri
 *    terlalu kecil.
 *
 * 2. LOMPATAN BESAR — TERBUKTI KURANG oleh pengujian langsung terhadap
 *    data uji berisi lompatan sesekali (bukan cuma tebakan): sinyal
 *    yang terpantul PARAH dari bangunan bisa melenceng 80-150 meter
 *    sekaligus, jauh melewati ambang goyangan, dan lapis pertama saja
 *    meloloskannya begitu saja — lalu titik SALAH itu jadi acuan baru
 *    bagi Titik sesudahnya, membuat pola melompat keluar-masuk di
 *    sekitar tiap lompatan.
 *
 *    Ditutup dengan syarat KONFIRMASI: Titik yang jauh dari Titik
 *    terakhir TIDAK langsung dipertahankan — ditahan dulu sebagai
 *    "calon". Baru dipertahankan (bersama calonnya) bila Titik
 *    BERIKUTNYA juga jauh dari yang lama DAN dekat dengan calon itu —
 *    dua bacaan berturut-turut yang saling menguatkan menunjuk tempat
 *    baru yang sama, bukan satu kali salah lalu kembali. Kalau Titik
 *    berikutnya ternyata dekat lagi ke tempat lama, calon itu terbukti
 *    cuma lompatan sesaat dan dibuang, tidak pernah ikut tergambar.
 *
 *    Akibatnya jejak tertunda SATU Titik untuk gerakan sungguhan —
 *    tidak terasa, karena penanda sendiri sudah dianimasikan halus
 *    ~12 detik per Titik (peta-langsung.tsx).
 */
export function bersihkanJejak(titik: [number, number][]): [number, number][] {
  if (titik.length === 0) return []
  const hasil: [number, number][] = [titik[0]]
  let calon: [number, number] | null = null
  for (let i = 1; i < titik.length; i++) {
    const t = titik[i]
    const terakhir = hasil[hasil.length - 1]
    if (jarakMeter(terakhir, t) < AMBANG_GOYANGAN_METER) {
      calon = null // ternyata sudah kembali dekat — calon lama gugur
      continue
    }
    if (calon && jarakMeter(calon, t) < AMBANG_GOYANGAN_METER) {
      hasil.push(calon, t)
      calon = null
    } else {
      calon = t
    }
  }
  return hasil
}
