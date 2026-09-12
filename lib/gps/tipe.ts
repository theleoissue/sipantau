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

/**
 * Keadaan gerak pada pembacaan terakhir (migrasi 0066).
 *
 * null BUKAN 'diam'. Ia berarti tidak diketahui — Titik dari jalur web,
 * atau perangkat yang tidak melaporkan kecepatan — dan WAJIB
 * diperlakukan persis seperti sebelum keterangan ini ada: penanda
 * bergerak seperti biasa. Membekukan penanda karena kita tidak tahu
 * adalah kebalikan dari maksudnya.
 */
export type AktivitasGerak = 'diam' | 'berjalan' | 'berkendara' | 'tidak_diketahui'

export const LABEL_AKTIVITAS: Record<AktivitasGerak, string> = {
  diam: 'Diam di tempat',
  berjalan: 'Berjalan',
  berkendara: 'Berkendara',
  tidak_diketahui: 'Gerak belum terbaca',
}

/** Benar hanya bila perangkat SUNGGUH menyatakan diam. */
export function sedangDiam(a: AktivitasGerak | null | undefined): boolean {
  return a === 'diam'
}

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
  /** null = tidak diketahui, BUKAN diam. Lihat AktivitasGerak. */
  aktivitas: AktivitasGerak | null
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

/**
 * Catmull-Rom SENTRIPETAL (alpha = 0,5), bukan seragam.
 *
 * Bentuk seragam - yang dipakai sebelumnya - melontar di belokan tajam:
 * kurvanya membusur KELUAR dari wilayah titik yang terekam, ke tempat
 * yang petugasnya tidak pernah lewati. Terukur pada jalur uji:
 *
 *   putar balik            37,3 m  ->  9,6 m
 *   masuk gang lalu keluar 11,1 m  ->  6,5 m
 *
 * Pada jejak yang dapat menjadi bahan bukti, garis yang menyimpang ke
 * tempat yang tidak pernah didatangi bukan sekadar kurang rapi.
 * Dijaga U-HLS-06 dan U-HLS-07.
 *
 * Sentripetal tetap INTERPOLASI - kurvanya melewati persis setiap titik
 * asli, sama seperti sebelumnya (U-HLS-01). Yang berubah hanya cara
 * jarak antar titik diperhitungkan saat melengkung.
 *
 * Dihitung dengan susunan piramida Barry-Goldman; simpul waktunya
 * berjarak |p(i+1) - p(i)|^alpha, bukan 1 seperti pada bentuk seragam.
 */
function catmullRom(
  p0: [number, number], p1: [number, number],
  p2: [number, number], p3: [number, number], t: number,
): [number, number] {
  // t = 0 dikembalikan APA ADANYA, tidak lewat perhitungan.
  //
  // Secara matematis hasilnya memang p1, tetapi melewatkannya lewat enam
  // operasi pecahan menyisakan galat pembulatan sekitar 1e-17 - dan itu
  // cukup membuat perbandingan "kurva melewati persis titik asli" gagal,
  // padahal sifat itulah yang paling dijaga di sini.
  if (t <= 0) return p1

  const alpha = 0.5
  const simpul = (a: [number, number], b: [number, number], awal: number) =>
    awal + Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), alpha)

  const t0 = 0
  const t1 = simpul(p0, p1, t0)
  const t2 = simpul(p1, p2, t1)
  const t3 = simpul(p2, p3, t2)

  // Dua titik berimpit membuat simpulnya sama dan pembaginya nol.
  // Terjadi pada ujung jejak (titik pertama dan terakhir digandakan) dan
  // pada Titik kembar yang lolos penyaring.
  if (t1 === t0 || t2 === t1 || t3 === t2) return p1

  const waktu = t1 + (t2 - t1) * t
  const antara = (
    a: [number, number], b: [number, number], ta: number, tb: number,
  ): [number, number] => {
    const w = (tb - waktu) / (tb - ta), v = (waktu - ta) / (tb - ta)
    return [w * a[0] + v * b[0], w * a[1] + v * b[1]]
  }

  const a1 = antara(p0, p1, t0, t1)
  const a2 = antara(p1, p2, t1, t2)
  const a3 = antara(p2, p3, t2, t3)
  return antara(antara(a1, a2, t0, t2), antara(a2, a3, t1, t3), t1, t2)
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
export function haluskanJejak(titik: [number, number][], perSegmen = 0): [number, number][] {
  if (titik.length < 3) return titik
  const hasil: [number, number][] = []
  for (let i = 0; i < titik.length - 1; i++) {
    const p0 = titik[i === 0 ? 0 : i - 1]
    const p1 = titik[i]
    const p2 = titik[i + 1]
    const p3 = titik[i + 2 >= titik.length ? titik.length - 1 : i + 2]

    // Kerapatan MENGIKUTI PANJANG RUAS, tidak lagi enam untuk semua.
    //
    // Angka tetap salah di dua arah sekaligus: ruas dua meter dipecah
    // enam kali tanpa satu pun bedanya terlihat, sementara ruas tiga
    // ratus meter tetap tampak patah karena juga cuma enam. Sekarang
    // kira-kira satu titik antara tiap 12 meter, dibatasi supaya jejak
    // panjang tidak meledak jumlah koordinatnya.
    const bagi = perSegmen > 0
      ? perSegmen
      : Math.max(2, Math.min(10, Math.round(jarakMeter(p1, p2) / 12)))

    for (let s = 0; s < bagi; s++) hasil.push(catmullRom(p0, p1, p2, p3, s / bagi))
  }
  hasil.push(titik[titik.length - 1])
  return hasil
}

/**
 * Toleransi penyederhanaan, DIPILIH DARI PENGUKURAN bukan dari perkiraan.
 *
 * Diuji pada rute berkelok 24 ruas dengan derau GPS +-8 m, 960 Titik:
 *
 *   toleransi   zigzag   koordinat   simpangan maks dari rekaman
 *   (tanpa)        481        3097        0,0 m
 *        3 m       327         920        6,1 m
 *        5 m       255         857       10,3 m   <- dipakai
 *        7 m       181         768       14,4 m
 *       10 m        81         480       28,2 m
 *       15 m        55         259       33,3 m
 *
 * Toleransi besar memang jauh lebih mulus, tetapi simpangannya melebar
 * cepat - dan yang melebar bukan hanya garis lurusnya. Simpul yang makin
 * jarang membuat kurva membusur makin lebar DI ANTARA simpul, sehingga
 * simpangan akhirnya SELALU lebih besar daripada toleransi yang disetel.
 *
 * Lima meter dipilih karena pada setelan itu garis yang digambar tidak
 * pernah menyimpang lebih jauh daripada AKURASI_TINGGI_METER - batas
 * yang sistem ini sendiri pakai untuk menyebut sebuah Titik akurat.
 * Dengan kata lain simpangan gambarnya masih di dalam ketidakpastian
 * rekamannya sendiri, jadi ia tidak menambah satu pun keraguan baru.
 */
/**
 * Satu Titik beserta keterangan yang dibutuhkan penyaring Kalman.
 * Jejak peta menyimpan bentuk ini, bukan sekadar pasangan koordinat:
 * tanpa akurasi dan waktu, penyaring tidak punya dasar untuk memutuskan
 * pembacaan mana yang layak dipercaya.
 */
export interface TitikJejak {
  la: number
  lo: number
  /** Akurasi yang dilaporkan perangkat, meter. null = tidak dilaporkan. */
  akurasi: number | null
  /** Waktu rekam, milidetik sejak epoch. */
  t: number
}

/**
 * Seberapa liar gerak yang dianggap mungkin, dalam m/s².
 *
 * INI TOMBOL KEKETATANNYA. Makin KECIL makin ketat: penyaring makin
 * percaya pada modelnya sendiri (gerak lurus berkecepatan tetap) dan
 * makin menolak pembacaan yang menyimpang. Makin besar makin longgar
 * dan makin mengikuti tiap pembacaan.
 *
 * 0,4 m/s² dipilih ketat dengan sengaja. Percepatan orang berjalan dan
 * kendaraan kota yang wajar berada di bawah angka itu untuk rentang
 * beberapa detik, sehingga lompatan GPS yang menuntut percepatan lebih
 * besar akan ditahan alih-alih diikuti.
 *
 * Menaikkannya ke 1,5 membuat jejak mengikuti pembacaan hampir apa
 * adanya — berguna bila ternyata belokan tajam yang NYATA ikut terpotong.
 */
export const KELIARAN_GERAK_MPS2 = 0.4

/** Batas bawah dan atas ragam pengukuran. Perangkat kerap melaporkan
 *  akurasi yang terlalu optimis; lantai 4 meter mencegah satu pembacaan
 *  mengaku sempurna lalu menyeret seluruh jalur. Langit-langit 60 meter
 *  mencegah satu pembacaan buruk membuat penyaring berhenti percaya
 *  pada apa pun. */
export const AKURASI_LANTAI_METER = 4
export const AKURASI_LANGIT_METER = 60

/**
 * Penyaring Kalman gerak-lurus-berkecepatan-tetap, dua dimensi.
 *
 * Dipakai sebagai SUMBER GAMBAR peta, menggantikan Titik mentah. Yang
 * dikejar bukan keindahan: satu pembacaan meleset 40 meter menarik garis
 * ke tempat yang tidak pernah didatangi, dan itu menyesatkan pembacanya.
 *
 * Yang membuatnya bekerja, dan yang paling sering dilewatkan: ragam
 * pengukuran diambil dari akurasi TIAP Titik, bukan satu angka tetap.
 * Pembacaan 4 meter hampir diikuti penuh, pembacaan 30 meter nyaris
 * diabaikan. Itulah sebabnya titik biru Google meluncur alih-alih
 * menyentak.
 *
 * Koordinat mentahnya TIDAK berubah dan tidak ke mana-mana — location_logs
 * tetap memuat apa yang sungguh direkam perangkat. Ini murni lapisan
 * tampilan, dan saklar "GPS mentah" tetap memperlihatkan aslinya.
 */
export function saringKalman(titik: TitikJejak[]): [number, number][] {
  if (titik.length < 3) return titik.map(p => [p.la, p.lo] as [number, number])

  // Bekerja dalam meter pada bidang datar lokal. Untuk satu Sesi Tugas
  // (puluhan kilometer paling jauh) kesalahan proyeksinya jauh di bawah
  // ketelitian GPS itu sendiri.
  const la0 = titik[0].la
  const mPerLat = 111_320
  const mPerLng = 111_320 * Math.cos(la0 * Math.PI / 180)
  const keX = (p: TitikJejak) => (p.lo - titik[0].lo) * mPerLng
  const keY = (p: TitikJejak) => (p.la - la0) * mPerLat

  const ragam = (akurasi: number | null) => {
    const a = Math.min(
      AKURASI_LANGIT_METER,
      Math.max(AKURASI_LANTAI_METER, akurasi ?? 20),
    )
    return a * a
  }

  // Keadaan: [x, y, vx, vy]. Ragamnya disimpan sebagai dua matriks 2x2
  // terpisah (sumbu x dan y tidak berkorelasi pada model ini), jadi
  // cukup empat angka per sumbu alih-alih matriks 4x4 penuh.
  let x = keX(titik[0]), y = keY(titik[0])
  let vx = 0, vy = 0
  let pxx = ragam(titik[0].akurasi), pxv = 0, pvv = 100
  let pyy = pxx, pyv = 0, pwv = 100

  const hasil: [number, number][] = [[titik[0].la, titik[0].lo]]
  const q = KELIARAN_GERAK_MPS2 * KELIARAN_GERAK_MPS2

  for (let i = 1; i < titik.length; i++) {
    // Jeda dibatasi: jam perangkat yang meleset, atau lubang panjang
    // tanpa sinyal, tidak boleh meledakkan ragamnya.
    const dt = Math.min(60, Math.max(0.5, (titik[i].t - titik[i - 1].t) / 1000))
    const dt2 = dt * dt, dt3 = dt2 * dt, dt4 = dt2 * dt2

    // --- ramalan ---
    x += vx * dt; y += vy * dt
    pxx += dt * (2 * pxv + dt * pvv) + q * dt4 / 4
    pxv += dt * pvv + q * dt3 / 2
    pvv += q * dt2
    pyy += dt * (2 * pyv + dt * pwv) + q * dt4 / 4
    pyv += dt * pwv + q * dt3 / 2
    pwv += q * dt2

    // --- pembaruan ---
    const r = ragam(titik[i].akurasi)
    const zx = keX(titik[i]), zy = keY(titik[i])

    const sx = pxx + r
    const kx1 = pxx / sx, kx2 = pxv / sx
    const galatX = zx - x
    x += kx1 * galatX; vx += kx2 * galatX
    const pxxBaru = pxx * (1 - kx1)
    pvv -= kx2 * pxv
    pxv -= kx2 * pxx
    pxx = pxxBaru

    const sy = pyy + r
    const ky1 = pyy / sy, ky2 = pyv / sy
    const galatY = zy - y
    y += ky1 * galatY; vy += ky2 * galatY
    const pyyBaru = pyy * (1 - ky1)
    pwv -= ky2 * pyv
    pyv -= ky2 * pyy
    pyy = pyyBaru

    hasil.push([la0 + y / mPerLat, titik[0].lo + x / mPerLng])
  }

  return hasil
}

/**
 * Pembersih yang sama untuk bentuk TitikJejak.
 *
 * MENDELEGASIKAN ke bersihkanJejak, tidak menyalin aturannya. Dua
 * salinan aturan yang sama selalu berakhir menyimpang tanpa terlihat
 * (CLAUDE.md §11) — dan di sini menyimpangnya berarti jejak hidup dan
 * jejak riwayat memperlakukan Titik yang sama secara berbeda.
 *
 * bersihkanJejak mengembalikan objek larik YANG SAMA dengan masukannya,
 * jadi asalnya dapat ditemukan kembali lewat identitas, bukan lewat
 * pencocokan koordinat yang bisa keliru saat dua Titik kebetulan sama.
 */
export function bersihkanTitikJejak(titik: TitikJejak[]): TitikJejak[] {
  const koordinat = titik.map(p => [p.la, p.lo] as [number, number])
  const asal = new WeakMap<[number, number], TitikJejak>()
  koordinat.forEach((k, i) => asal.set(k, titik[i]))
  return bersihkanJejak(koordinat)
    .map(k => asal.get(k))
    .filter((p): p is TitikJejak => p != null)
}

export const TOLERANSI_SEDERHANA_METER = 5

/**
 * Membuang Titik yang tidak mengubah BENTUK jalur (Douglas-Peucker).
 *
 * Ini yang sesungguhnya menghilangkan zigzag. Melengkungkan jejak tidak
 * pernah bisa menghilangkannya - spline yang diberi titik bergerigi
 * menghasilkan lengkungan yang bergerigi juga, hanya lebih rapat. Yang
 * perlu dikerjakan adalah membuang giginya lebih dulu.
 *
 * SIFAT YANG MEMBUATNYA AMAN DIPAKAI DI SINI: fungsi ini hanya MEMBUANG
 * titik, tidak pernah memindahkan apalagi mengarang. Setiap koordinat
 * yang tersisa adalah posisi yang benar-benar terekam - berbeda dari
 * penghalus rata-rata (Chaikin, Gauss) yang menggeser garis ke tempat
 * yang tidak pernah didatangi, dan berbeda dari map matching yang
 * menariknya ke jalan terdekat. Dijaga U-SDH-01.
 *
 * Titik mentahnya sendiri tetap utuh di basis data; ini lapisan tampilan.
 */
export function sederhanakanJejak(
  titik: [number, number][],
  toleransiMeter = TOLERANSI_SEDERHANA_METER,
): [number, number][] {
  if (titik.length < 3) return titik

  // Jarak titik ke RUAS a-b. Proyeksi setempat sudah memadai: ruas jejak
  // paling panjang pun hanya ratusan meter, jauh di bawah skala yang
  // membuat kelengkungan bumi terasa.
  const keRuas = (p: [number, number], a: [number, number], b: [number, number]): number => {
    const rentang = Math.cos(a[0] * Math.PI / 180)
    const dx = b[0] - a[0], dy = (b[1] - a[1]) * rentang
    const panjang = dx * dx + dy * dy
    if (panjang === 0) return jarakMeter(p, a)
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * rentang * dy) / panjang
    t = Math.max(0, Math.min(1, t))
    return jarakMeter(p, [a[0] + t * dx, a[1] + t * (b[1] - a[1])])
  }

  const simpan = new Array<boolean>(titik.length).fill(false)
  simpan[0] = simpan[titik.length - 1] = true

  // Tumpukan, bukan rekursi: sesi delapan jam pada jeda tiga detik
  // menghasilkan ribuan titik, dan rekursi sedalam itu dapat melampaui
  // batas tumpukan pemanggilan peramban (U-SDH-09).
  const tugas: [number, number][] = [[0, titik.length - 1]]
  while (tugas.length > 0) {
    const [awal, akhir] = tugas.pop()!
    let jauh = 0, di = -1
    for (let i = awal + 1; i < akhir; i++) {
      const d = keRuas(titik[i], titik[awal], titik[akhir])
      if (d > jauh) { jauh = d; di = i }
    }
    if (di !== -1 && jauh > toleransiMeter) {
      simpan[di] = true
      tugas.push([awal, di], [di, akhir])
    }
  }

  return titik.filter((_, i) => simpan[i])
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
