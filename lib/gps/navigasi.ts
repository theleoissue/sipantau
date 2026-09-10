// Tautan navigasi ke satu titik lokasi tugas.
//
// SENGAJA menyerahkan penunjuk arahnya ke aplikasi peta bawaan
// perangkat, bukan membangun navigasi belokan-demi-belokan di dalam
// SiPANTAU. Alasannya bukan kemalasan:
//
// 1. Nol biaya dan nol kunci API. Menggeser tugas ini ke Routes API
//    berarti tagihan per permintaan untuk sesuatu yang sudah dimiliki
//    setiap petugas di HP-nya.
// 2. Peta bawaan sudah tahu lalu lintas, penutupan jalan, dan suara
//    penunjuk arah — hal-hal yang tidak akan pernah kita kejar.
// 3. Pelacakan SiPANTAU TIDAK terganggu. Sesi Tugas tetap berjalan di
//    latar; berpindah aplikasi tidak menghentikan perekaman Titik.

/** Koordinat tujuan; keduanya wajib ada karena tidak semua lokasi punya pin. */
export interface TujuanNavigasi {
  lat: number
  lng: number
  nama?: string | null
}

/**
 * Tautan universal Google Maps.
 *
 * Bentuk "google.com/maps/dir/?api=1" dipilih karena ia bekerja di mana
 * saja: di Android ia dibuka aplikasi Google Maps kalau terpasang, dan
 * jatuh ke peramban kalau tidak — tanpa perlu menebak skema intent
 * khusus perangkat yang bisa gagal diam-diam.
 *
 * Koordinat yang dikirim, bukan nama tempat: nama bisa berulang atau
 * salah dicocokkan, sedangkan titik lokasi tugas sudah pasti.
 */
export function tautanNavigasi(tujuan: TujuanNavigasi): string {
  const titik = `${tujuan.lat},${tujuan.lng}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(titik)}&travelmode=driving`
}
