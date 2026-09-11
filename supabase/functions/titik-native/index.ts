// Fungsi Tepi titik-native — Pengiriman Native GPS.
//
// Masukan : badan JSON milik pustaka @capgo/background-geolocation apa
//           adanya (Location + "source":"native"), ditambah kepala
//           x-sipantau-token berisi token sesi (migrasi 0037).
// Keluaran: { "berhasil": true }
//
// KENAPA INI ADA — dan kenapa daftar tertutup §8 bertambah satu.
//
// CLAUDE.md §8 mengunci Fungsi Tepi pada empat nama dan mensyaratkan
// revisi PRD tercatat untuk menambahnya. Ini penambahan kelima, dengan
// keputusan tercatat pada 1 September 2026 atas persetujuan eksplisit
// pemilik produk sesudah tiga pilihan dibandingkan terbuka:
//
//   (a) jalur API Next.js + service_role  -> ditolak: menaruh kunci
//       service_role di env aplikasi, yang selama ini sengaja dijauhkan
//   (b) memberi hak kepada peran anon     -> ditolak: menabrak §5.1
//       ("anon tidak pernah diberi hak apa pun") dan membuka tebakan
//       token tanpa batas langsung di Supabase
//   (c) Fungsi Tepi baru ini              -> DIPILIH
//
// Alasan (c) menang: ia justru memenuhi TUJUAN §8 sendiri — "hanya untuk
// operasi yang mensyaratkan kunci istimewa". Ini satu-satunya pilihan
// yang menjaga anon tetap nol hak SEKALIGUS service_role tetap di luar
// aplikasi Next.js. Fungsi ini tidak memindahkan satu pun logika yang
// seharusnya di RLS: seluruh pemeriksaan (token, kepemilikan, sesi masih
// terbuka, kewajaran Titik) dikerjakan basis data pada kirim_titik_native.
//
// Berbeda dari empat Fungsi Tepi lain, di sini TIDAK ADA sesi masuk yang
// bisa diperiksa — itulah seluruh alasan keberadaannya. Proses aplikasi
// sudah mati ketika Titik ini dikirim; yang tersisa hanya layanan latar
// depan Android. Token sesi menggantikan sesi masuk, dan token itu jauh
// lebih sempit: satu sesi, hanya menambah Titik, mati sendiri begitu
// sesinya ditutup.

import { klienService } from '../_shared/klien.ts'
import { jsonRespons, galatKeRespons } from '../_shared/respons.ts'

interface BadanLokasi {
  latitude?: unknown
  longitude?: unknown
  accuracy?: unknown
  speed?: unknown
  bearing?: unknown
  simulated?: unknown
}

/** Bentuk baru: sekelompok Titik dari antrean perangkat (migrasi 0060). */
interface BadanBorongan {
  titik?: unknown
}

/** Satu butir di dalam kelompok. Namanya mengikuti kolom, bukan pustaka. */
interface ButirTitik {
  antrean_id?: unknown
  lat?: unknown
  lng?: unknown
  akurasi_meter?: unknown
  kecepatan_mps?: unknown
  arah_derajat?: unknown
  baterai_persen?: unknown
  lokasi_tiruan?: unknown
  usia_ms?: unknown
}

/** Angka yang benar-benar angka. Pustaka mengirim null untuk medan yang
 *  tidak tersedia pada perangkat tertentu (kecepatan dan arah sering
 *  kosong saat diam), dan itu sah — dibedakan dari nilai rusak. */
function angkaAtauNull(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonRespons({ kode: 'METODE_TIDAK_DIIZINKAN' }, 405)
  }

  const token = req.headers.get('x-sipantau-token')
  if (!token) {
    return jsonRespons({ kode: 'TOKEN_TIDAK_SAH', keterangan: 'Kepala x-sipantau-token tidak ada' }, 401)
  }

  let badan: BadanLokasi & BadanBorongan
  try {
    badan = await req.json()
  } catch {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'Badan permintaan bukan JSON' }, 400)
  }

  const svc = klienService()

  // DUA BENTUK BADAN, dan keduanya wajib tetap dilayani.
  //
  // Bentuk kelompok dipakai layanan latar depan milik sendiri: ia
  // merekam ke antrean SQLite di perangkat lalu menyetorkannya
  // berkelompok. Bentuk tunggal adalah badan mentah pustaka
  // @capgo/background-geolocation, dan APK yang sudah di lapangan masih
  // mengirimnya. Membuang bentuk lama berarti setiap HP yang belum
  // diperbarui berhenti mengirim Titik tanpa satu pun galat terlihat.
  if (Array.isArray(badan.titik)) {
    const daftar = badan.titik as ButirTitik[]
    if (daftar.length === 0) return jsonRespons({ berhasil: true, jumlah: 0 })

    // Hanya bentuknya yang diperiksa di sini. Seluruh putusan lain —
    // token sah, sesi masih terbuka, Titik wajar — milik basis data.
    for (const t of daftar) {
      if (angkaAtauNull(t.lat) === null || angkaAtauNull(t.lng) === null) {
        return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'setiap Titik wajib punya lat dan lng berupa angka' }, 400)
      }
    }

    const { data, error } = await svc.rpc('kirim_titik_native_borongan', {
      p_token: token,
      p_titik: daftar.map((t) => ({
        antrean_id: typeof t.antrean_id === 'string' ? t.antrean_id : null,
        lat: angkaAtauNull(t.lat),
        lng: angkaAtauNull(t.lng),
        akurasi_meter: angkaAtauNull(t.akurasi_meter),
        kecepatan_mps: angkaAtauNull(t.kecepatan_mps),
        arah_derajat: angkaAtauNull(t.arah_derajat),
        baterai_persen: angkaAtauNull(t.baterai_persen),
        lokasi_tiruan: t.lokasi_tiruan === true,
        usia_ms: angkaAtauNull(t.usia_ms),
      })),
    })

    if (error) return galatKeRespons(error.message)
    return jsonRespons({ berhasil: true, jumlah: data ?? daftar.length })
  }

  // Koordinat wajib ada dan berupa angka. Sisanya boleh kosong.
  const lat = angkaAtauNull(badan.latitude)
  const lng = angkaAtauNull(badan.longitude)
  if (lat === null || lng === null) {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'latitude dan longitude wajib berupa angka' }, 400)
  }

  // Seluruh pemeriksaan lain milik basis data (kirim_titik_native ->
  // fn_catat_titik): token sah atau tidak, sesi masih terbuka atau
  // sudah ditutup, Titik wajar atau diragukan. TIDAK ada satu pun yang
  // diputuskan di sini — Fungsi Tepi tidak boleh jadi tempat memindahkan
  // logika yang seharusnya ditegakkan basis data (CLAUDE.md §8).
  const { error } = await svc.rpc('kirim_titik_native', {
    p_token: token,
    p_lat: lat,
    p_lng: lng,
    p_akurasi_meter: angkaAtauNull(badan.accuracy),
    p_kecepatan_mps: angkaAtauNull(badan.speed),
    p_arah_derajat: angkaAtauNull(badan.bearing),
    p_lokasi_tiruan: badan.simulated === true,
  })

  if (error) return galatKeRespons(error.message)
  return jsonRespons({ berhasil: true })
})
