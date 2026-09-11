import { Capacitor, registerPlugin } from '@capacitor/core'

// Pemeriksa hal-hal DI LUAR aplikasi yang diam-diam mematikan perekaman.
//
// Bukan kemewahan. Pustaka pelacak yang dipakai menyatakan sendiri
// pengirimannya "best-effort: there is no on-disk queue and no automatic
// retry", dan tidak menyediakan satu pun cara mengambil Titik yang
// tertahan. Artinya begitu proses aplikasi dibunuh sistem, Titik yang
// gagal terkirim memang hilang — antrean luring di JS pun ikut mati
// karena tidak ada JS yang berjalan.
//
// Maka pertahanan yang benar bukan menambal sesudahnya, melainkan
// menjaga prosesnya tetap hidup. Di Indonesia ini bukan kasus langka:
// Xiaomi, Oppo, Vivo, dan Realme mendominasi lapangan dan semuanya
// agresif membunuh layanan latar depan.

export interface KesehatanPelacak {
  pabrikan: string
  model: string
  versiAndroid: number
  hematBateraiDikecualikan: boolean
  adaLayarAutostart: boolean
}

interface PluginKesehatan {
  periksa(): Promise<KesehatanPelacak>
  bukaPengaturanBaterai(): Promise<void>
  bukaPengaturanAutostart(): Promise<void>
}

const Plugin = registerPlugin<PluginKesehatan>('KesehatanPelacak')

/** Mengembalikan null di luar Android — tidak ada yang bisa diperiksa di peramban. */
export async function periksaKesehatanPelacak(): Promise<KesehatanPelacak | null> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return null
  try {
    return await Plugin.periksa()
  } catch {
    // APK lama yang belum memuat plugin ini menolak pemanggilannya.
    // Diperlakukan sebagai "tidak diketahui", bukan sebagai masalah.
    return null
  }
}

export async function bukaPengaturanBaterai(): Promise<void> {
  try { await Plugin.bukaPengaturanBaterai() } catch { /* tidak ada yang bisa dilakukan */ }
}

export async function bukaPengaturanAutostart(): Promise<void> {
  try { await Plugin.bukaPengaturanAutostart() } catch { /* tidak ada yang bisa dilakukan */ }
}

const KUNCI_ABAIKAN = 'sipantau.peringatan-baterai-diabaikan'

/**
 * Menyembunyikan peringatan atas pernyataan petugas sendiri.
 *
 * PERLU ADA karena pemeriksaannya memang tidak selalu dapat dipercaya:
 * isIgnoringBatteryOptimizations membaca daftar putih doze bawaan
 * Android, sedangkan ColorOS (realme/Oppo), MIUI, dan FuntouchOS punya
 * pengelola daya SENDIRI. Petugas bisa sudah mengizinkan segalanya di
 * layar merek, dan indikator bawaan itu TETAP false selamanya.
 *
 * Peringatan yang mustahil dipenuhi lebih buruk daripada tidak ada — ia
 * melatih orang mengabaikan peringatan. Jadi disediakan jalan untuk
 * menyatakan "sudah saya atur", dan pernyataan itu dihormati.
 */
export async function abaikanPeringatanBaterai(): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key: KUNCI_ABAIKAN, value: '1' })
}

export async function peringatanBateraiDiabaikan(): Promise<boolean> {
  try {
    const { Preferences } = await import('@capacitor/preferences')
    return (await Preferences.get({ key: KUNCI_ABAIKAN })).value === '1'
  } catch {
    return false
  }
}

/** Panduan singkat per merek, dipakai saat layar autostart tidak dapat dibuka langsung. */
export function panduanAutostart(pabrikan: string): string | null {
  const m = pabrikan.toLowerCase()
  if (m.includes('xiaomi') || m.includes('redmi') || m.includes('poco')) {
    return 'Setelan → Aplikasi → Kelola aplikasi → SiPANTAU → Autostart: nyalakan, lalu Hemat baterai: Tanpa batasan.'
  }
  if (m.includes('oppo') || m.includes('realme')) {
    return 'Setelan → Baterai → Penggunaan daya aplikasi → SiPANTAU → izinkan Berjalan di latar belakang dan Mulai otomatis.'
  }
  if (m.includes('vivo')) {
    return 'Setelan → Baterai → Konsumsi daya tinggi latar belakang → izinkan SiPANTAU, lalu i Manager → Mulai otomatis: nyalakan.'
  }
  if (m.includes('samsung')) {
    return 'Setelan → Baterai → Batas penggunaan latar belakang → Aplikasi tidak pernah ditidurkan: tambahkan SiPANTAU.'
  }
  if (m.includes('huawei') || m.includes('honor')) {
    return 'Setelan → Baterai → Peluncuran aplikasi → SiPANTAU: ubah ke Kelola manual dan nyalakan ketiganya.'
  }
  return null
}
