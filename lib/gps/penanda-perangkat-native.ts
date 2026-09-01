import { Preferences } from '@capacitor/preferences'

// Penanda perangkat Android sungguhan — dibangkitkan SEKALI saat
// pemasangan pertama, lalu disimpan permanen di perangkat (Preferences
// native, bukan localStorage WebView — bertahan lebih pasti melewati
// pembersihan data situs). Pola persis seperti dicontohkan
// docs/10-modul-6.1-auth.md §3.3 ("Lapis 1 dan 2").
//
// TIDAK berawalan 'web-' — itu penanda khusus jalur uji coba web
// (lib/gps/penanda-perangkat.ts, migrasi 0031). Baris yang tersimpan
// dari sini jujur menyatakan asalnya: perangkat Android terpasang.
const KUNCI = 'sipantau_penanda_perangkat'

export async function penandaPerangkatNative(): Promise<string> {
  const tersimpan = await Preferences.get({ key: KUNCI })
  if (tersimpan.value) return tersimpan.value

  const baru = crypto.randomUUID()
  await Preferences.set({ key: KUNCI, value: baru })
  return baru
}
