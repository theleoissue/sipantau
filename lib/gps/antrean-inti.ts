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

/** Mengembalikan galat bila server menolak; MELEMPAR bila jaringan gagal. */
export type Pengirim = (titik: TitikTersimpan, usiaMs: number) => Promise<{ galat?: string }>

export interface HasilKirimAntrean {
  terkirim: number
  tersisa: number
  galat?: string
}

export const BATAS_ANTREAN = 5000

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
): Promise<HasilKirimAntrean> {
  let terkirim = 0
  for (;;) {
    const daftar = await simpan.baca()
    if (daftar.length === 0) return { terkirim, tersisa: 0 }

    const titik = daftar[0]
    let hasil: { galat?: string }
    try {
      hasil = await kirim(titik, Math.max(0, sekarang() - titik.ditangkapPada))
    } catch {
      return { terkirim, tersisa: daftar.length, galat: 'jaringan' }
    }

    // Dibaca ULANG, bukan memakai `daftar` yang sudah basi: Titik baru
    // bisa masuk selagi permintaan tadi berjalan, dan menulis balik
    // salinan lama akan melenyapkannya.
    const kini = await simpan.baca()
    await simpan.tulis(kini.filter(t => t.antreanId !== titik.antreanId))

    if (hasil.galat) {
      return { terkirim, tersisa: (await simpan.baca()).length, galat: hasil.galat }
    }
    terkirim++
  }
}
