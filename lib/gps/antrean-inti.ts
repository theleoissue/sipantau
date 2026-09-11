// Inti antrean Titik luring, TANPA satu pun impor.
//
// Dipisah dari antrean.ts supaya dapat diuji sungguhan: penyimpanan dan
// pengirimnya diserahkan pemanggil. Ini bagian yang kegagalannya paling
// mahal — satu salah langkah di sini berarti rekaman lapangan hilang —
// jadi ia tidak boleh hanya "kelihatan benar".

export interface TitikTersimpan {
  antreanId: string
  ditangkapPada: number
  [kolom: string]: unknown
}

export interface Penyimpanan {
  baca(): Promise<TitikTersimpan[]>
  tulis(daftar: TitikTersimpan[]): Promise<void>
}

/**
 * Mengirim SATU KELOMPOK Titik sekaligus. Mengembalikan galat bila
 * server menolak; MELEMPAR bila jaringan gagal.
 *
 * `usia` sejajar indeks dengan `kelompok`.
 */
export interface HasilPengiriman {
  galat?: string
  /**
   * Penolakan ini berlaku SELAMANYA untuk Titik itu sendiri — misalnya
   * sesinya sudah ditutup, atau waktunya di luar rentang sesi.
   * Mengulanginya tidak akan pernah berhasil, jadi Titik dibuang supaya
   * tidak menyumbat antrean di belakangnya.
   *
   * Bila TIDAK diisi, kegagalan dianggap keadaan sementara — jaringan,
   * migrasi yang belum dijalankan, server sedang bermasalah — dan
   * Titiknya DIPERTAHANKAN. Ini bawaan yang disengaja: menebak salah ke
   * arah "buang" berarti kehilangan bukti lapangan, menebak salah ke
   * arah "simpan" paling banter menunda.
   */
  tolakPermanen?: boolean
}

export type Pengirim = (
  kelompok: TitikTersimpan[],
  usia: number[],
) => Promise<HasilPengiriman>

export interface HasilKirimAntrean {
  terkirim: number
  tersisa: number
  galat?: string
}

export const BATAS_ANTREAN = 5000

/**
 * Titik per permintaan.
 *
 * Perekaman dijalankan rapat, dan yang membatasinya bukan baterai
 * melainkan jumlah pemanggilan server. Mengirim berkelompok memutus
 * kaitan antara keduanya: merekam tiap 3 detik dengan kelompok 25
 * menghasilkan satu permintaan per ~75 detik — jauh LEBIH SEDIKIT
 * daripada satu Titik per 15 detik seperti sebelumnya, padahal
 * jejaknya lima kali lebih rapat.
 */
export const BESAR_KELOMPOK = 25

/**
 * Menaruh satu Titik di ujung antrean.
 *
 * Mengembalikan false bila antrean penuh. Titik lama TIDAK PERNAH
 * dibuang untuk memberi tempat: membuang bukti diam-diam persis
 * kesalahan yang sedang diperbaiki modul ini.
 */
export async function antrekanKe(
  simpan: Penyimpanan,
  titik: TitikTersimpan,
): Promise<boolean> {
  const daftar = await simpan.baca()
  if (daftar.length >= BATAS_ANTREAN) return false
  daftar.push(titik)
  await simpan.tulis(daftar)
  return true
}

/**
 * Mengirim antrean dari yang PALING LAMA, satu per satu.
 *
 * Berurutan, bukan serentak: server memakai Titik wajar terakhir sebagai
 * pembanding deteksi loncatan, jadi urutan tiba yang acak membuat
 * penilaian itu meleset.
 *
 * Berhenti pada kegagalan JARINGAN dan menyisakan seluruh sisanya —
 * jaringan tidak akan pulih di tengah satu putaran, dan memaksa terus
 * hanya membakar baterai. Sebaliknya PENOLAKAN SERVER membuang Titik
 * yang bersangkutan: mengulanginya akan ditolak lagi selamanya dan
 * menyumbat seluruh antrean di belakangnya.
 */
export async function kirimAntreanDari(
  simpan: Penyimpanan,
  kirim: Pengirim,
  sekarang: () => number = Date.now,
  besarKelompok: number = BESAR_KELOMPOK,
): Promise<HasilKirimAntrean> {
  let terkirim = 0
  for (;;) {
    const daftar = await simpan.baca()
    if (daftar.length === 0) return { terkirim, tersisa: 0 }

    const kelompok = daftar.slice(0, Math.max(1, besarKelompok))
    const kini = sekarang()
    let hasil: HasilPengiriman
    try {
      hasil = await kirim(kelompok, kelompok.map(t => Math.max(0, kini - t.ditangkapPada)))
    } catch {
      return { terkirim, tersisa: daftar.length, galat: 'jaringan' }
    }

    // Kegagalan yang BUKAN penolakan permanen tidak membuang apa pun.
    // Bentuk sebelumnya menghapus kelompoknya lebih dulu lalu baru
    // memeriksa galat, sehingga satu migrasi yang belum dijalankan pun
    // cukup untuk melenyapkan seluruh rekaman lapangan tanpa suara.
    if (hasil.galat && !hasil.tolakPermanen) {
      return { terkirim, tersisa: daftar.length, galat: hasil.galat }
    }

    // Dibaca ULANG, bukan memakai `daftar` yang sudah basi: Titik baru
    // bisa masuk selagi permintaan tadi berjalan, dan menulis balik
    // salinan lama akan melenyapkannya.
    const id = new Set(kelompok.map(t => t.antreanId))
    const sesudah = await simpan.baca()
    await simpan.tulis(sesudah.filter(t => !id.has(t.antreanId)))

    if (hasil.galat) {
      return { terkirim, tersisa: (await simpan.baca()).length, galat: hasil.galat }
    }
    terkirim += kelompok.length
  }
}
