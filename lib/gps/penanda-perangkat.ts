// Penanda perangkat bentuk web — dipakai HANYA oleh Mulai Tugas versi
// web (migrasi 0031, permintaan eksplisit pemilik produk mencabut
// lapis kedua BR-65 untuk uji coba/demo — Android tetap versi
// sungguhan untuk lapangan, langkah 4 CLAUDE.md §10 masih tertunda).
//
// Awalan 'web-' DIPERTAHANKAN (bukan disamarkan jadi mirip Android) —
// baris yang tersimpan tetap jujur soal asalnya, sesuai Prinsip 0.6:
// sistem menyajikan fakta apa adanya, bukan menyembunyikannya.
//
// Disimpan di localStorage supaya SATU peramban/perangkat memakai
// penanda yang SAMA lintas sesi (pola sama seperti P-09 pada Android),
// bukan penanda baru setiap kali Mulai Tugas ditekan.
const KUNCI = 'sipantau-penanda-perangkat-web'

export function penandaPerangkatWeb(): string {
  if (typeof window === 'undefined') return 'web-server'
  try {
    let penanda = window.localStorage.getItem(KUNCI)
    if (!penanda) {
      penanda = `web-${crypto.randomUUID()}`
      window.localStorage.setItem(KUNCI, penanda)
    }
    return penanda
  } catch {
    // localStorage tidak tersedia (mode pribadi, dsb.) — penanda acak
    // sekali pakai, tetap lolos syarat "tidak boleh kosong".
    return `web-${crypto.randomUUID()}`
  }
}
