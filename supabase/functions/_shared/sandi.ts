// Pembangkit Kata Sandi Sementara — docs/10-modul-6.1-auth.md §2.3.
// Dua belas karakter, huruf+angka saja, karakter yang mudah tertukar
// dibuang (angka nol, huruf O besar, angka satu, huruf I besar, huruf l
// kecil — kata sandi ini sering disampaikan lisan/pesan singkat), dan
// dibangkitkan lewat pembangkit acak kriptografis, bukan Math.random().

const KARAKTER =
  '23456789' +
  'ABCDEFGHJKLMNPQRSTUVWXYZ' +
  'abcdefghijkmnopqrstuvwxyz'

export function bangkitkanKataSandiSementara(panjang = 12): string {
  const acak = new Uint32Array(panjang)
  crypto.getRandomValues(acak)
  let hasil = ''
  for (let i = 0; i < panjang; i++) {
    hasil += KARAKTER[acak[i] % KARAKTER.length]
  }
  return hasil
}
