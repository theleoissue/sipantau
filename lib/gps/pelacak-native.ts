import { Capacitor, registerPlugin } from '@capacitor/core'

// Pelacak native milik sendiri (PelacakService).
//
// Bukan pembungkus pustaka, melainkan penggantinya di Android. Susunan
// lama menaruh penangkapan DAN pengiriman Titik di dalam WebView, dan
// keduanya berhenti serentak pada keadaan yang paling sering terjadi di
// lapangan: begitu jaringan hilang, WebView menampilkan halaman galat
// bawaan peramban dan tidak ada satu baris JavaScript pun yang berjalan
// lagi. Antrean yang dibangun untuk menyelamatkan Titik saat sinyal
// putus ternyata ikut mati persis ketika ia paling dibutuhkan.
//
// PelacakService merekam ke antrean SQLite di perangkat dan
// menyetorkannya sendiri. Halaman boleh tampil, boleh galat, boleh
// tertutup — tidak satu pun mengubah apa yang terekam.

export interface StatusPelacak {
  berjalan: boolean
  /** Sesi Tugas yang sedang direkam layanan, null bila tidak ada. */
  sesi?: string | null
  /** Titik yang masih tertahan di antrean perangkat; -1 bila tak terbaca. */
  tertahan: number
}

interface PluginPelacak {
  mulai(opsi: { url: string; kunci: string | null; token: string; sesi: string }): Promise<StatusPelacak>
  berhenti(): Promise<StatusPelacak>
  status(): Promise<StatusPelacak>
  mintaIzinGerak(): Promise<StatusPelacak>
}

const Plugin = registerPlugin<PluginPelacak>('Pelacak')

export function pelacakNativeTersedia(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

/**
 * Menyalakan layanan. Mengembalikan null bila TIDAK berhasil — dan
 * pemanggilnya wajib memperlakukan null sebagai "rekam dari JS seperti
 * sebelumnya", bukan sebagai kegagalan yang boleh didiamkan.
 *
 * Sebabnya nyata: APK yang sudah di lapangan belum memuat plugin ini dan
 * akan menolak pemanggilannya, dan Android 12 ke atas menolak layanan
 * latar depan yang dinyalakan dari latar belakang. Menganggap perekaman
 * berjalan padahal layanannya tidak pernah hidup persis bentuk kegagalan
 * senyap yang seluruh modul ini hindari.
 */
export async function mulaiPelacakNative(opsi: {
  token: string
  sesiId: string
}): Promise<StatusPelacak | null> {
  if (!pelacakNativeTersedia()) return null
  const alamat = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!alamat) return null
  try {
    return await Plugin.mulai({
      url: `${alamat}/functions/v1/titik-native`,
      // Kunci anon, bukan rahasia: ia memang sudah terbuka di sisi klien,
      // dan perannya di sini cuma melewati gerbang Fungsi Tepi.
      // Kredensial sesungguhnya adalah token sesi di bawahnya.
      kunci: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
      token: opsi.token,
      sesi: opsi.sesiId,
    })
  } catch {
    return null
  }
}

/**
 * Meminta izin pengenalan gerak. Sengaja TIDAK menggagalkan apa pun.
 *
 * Sensor gerak menjawab diam/berjalan/berkendara dari akselerometer,
 * tanpa GPS, sehingga tidak ikut tertipu ketika posisi melompat — itulah
 * yang membuat jejak berhenti menggambar jaring saat petugas diam. Tapi
 * ia peningkatan mutu, bukan syarat: ditolak, atau APK lama yang belum
 * punya metodenya, perekaman tetap berjalan persis seperti sebelumnya
 * dan basis data kembali menyimpulkan gerak dari kecepatan.
 */
export async function mintaIzinGerakNative(): Promise<void> {
  if (!pelacakNativeTersedia()) return
  try { await Plugin.mintaIzinGerak() } catch { /* APK lama, atau ditolak */ }
}

export async function hentikanPelacakNative(): Promise<void> {
  if (!pelacakNativeTersedia()) return
  try { await Plugin.berhenti() } catch { /* APK lama: memang tidak ada yang berjalan */ }
}

export async function statusPelacakNative(): Promise<StatusPelacak | null> {
  if (!pelacakNativeTersedia()) return null
  try { return await Plugin.status() } catch { return null }
}
