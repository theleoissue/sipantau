/**
 * Pengambil seluruh baris, menembus batas baris PostgREST.
 *
 * Supabase memasang `max_rows = 1000` pada proyek ini. Batas itu
 * diterapkan DIAM-DIAM: kueri tanpa `range()` mengembalikan seribu baris
 * pertama dan tidak memberi tanda apa pun bahwa masih ada sisanya —
 * tidak ada galat, tidak ada bendera, tidak ada jumlah total.
 *
 * Akibatnya sudah nyata di data yang ada: empat dari tujuh belas Sesi
 * Tugas melewati seribu Titik, dan yang terbesar 3.785. Karena jejak
 * diurutkan MENAIK, yang hilang justru bagian TERBARUNYA — garis berhenti
 * di sekitar seperempat perjalanan dan tidak pernah menyusul posisi
 * petugas sekarang. Di peta itu terlihat seperti perekaman yang mati di
 * tengah jalan, padahal Titiknya lengkap di basis data.
 *
 * Satu tempat saja yang menulis aturan ini, dipakai jalur peramban
 * maupun jalur server. Menyalinnya ke tiap pemanggil berarti cepat atau
 * lambat ada yang lupa, dan lupanya tidak akan bergalat (CLAUDE.md §11).
 */
export const BATAS_BARIS_POSTGREST = 1000

/**
 * @param ambil    dipanggil berulang dengan jendela baris; kembalikan
 *                 kueri Supabase yang sudah diberi `.range(dari, sampai)`
 * @param batasAman jaring pengaman terhadap putaran tak berujung bila
 *                  sebuah kueri terus mengembalikan halaman penuh
 */
export async function ambilSemuaHalaman<T>(
  ambil: (dari: number, sampai: number) => PromiseLike<{
    data: T[] | null
    error: { message: string } | null
  }>,
  batasAman = 50_000,
): Promise<T[]> {
  const semua: T[] = []

  for (let dari = 0; dari < batasAman; dari += BATAS_BARIS_POSTGREST) {
    const { data, error } = await ambil(dari, dari + BATAS_BARIS_POSTGREST - 1)
    if (error) throw new Error(error.message)

    const baris = data ?? []
    for (const b of baris) semua.push(b)

    // Halaman yang tidak penuh berarti sudah habis. Ini juga yang
    // membuat kasus lumrah — jejak di bawah seribu Titik — tetap
    // selesai dalam SATU perjalanan bolak-balik seperti sebelumnya.
    if (baris.length < BATAS_BARIS_POSTGREST) break
  }

  return semua
}
