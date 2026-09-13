import { cache } from 'react'
import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'
import type { Pengguna } from '@/lib/supabase/types'

/**
 * Baris users pengguna yang sedang masuk, atau null.
 *
 * Peran dan unit SELALU dibaca dari basis data, tidak pernah dari apa
 * pun yang tersimpan di perangkat (AM-6.1-09). Nilai yang tersimpan di
 * perangkat hanya untuk mempercepat tampilan dan tidak pernah menjadi
 * dasar keputusan izin.
 *
 * DIBUNGKUS react.cache(): hampir setiap halaman memanggil ini SENDIRI
 * di atas panggilan yang layout.tsx sudah lakukan — tanpa pembungkus
 * ini, satu navigasi menjalankan pemeriksaan token dan kueri tabel users
 * dua kali. cache() menjadikan seluruh pemanggilan dengan argumen sama
 * dalam SATU permintaan render memakai hasil yang sama, tanpa perlu
 * mengubah satu pun pemanggilnya.
 *
 * getClaims(), bukan getUser() — alasan lengkapnya di proxy.ts. Token
 * diverifikasi secara lokal dengan kunci publik proyek, sehingga satu
 * perjalanan ke server Auth Supabase per render hilang. Yang menentukan
 * peran, unit, dan status aktif tetap baris users di bawah, dibaca dari
 * basis data — bukan isi token.
 */
export const penggunaSekarang = cache(async (): Promise<Pengguna | null> => {
  const supabase = await klienServer()

  const { data: klaim } = await supabase.auth.getClaims()
  const idPengguna = klaim?.claims?.sub
  if (!idPengguna) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, unit:unit_id ( nama )')
    .eq('id', idPengguna)
    .maybeSingle()

  if (error || !data) return null
  return data as Pengguna
})

/**
 * Dipakai layout halaman setelah masuk. Mengembalikan pengguna, atau
 * mengalihkan bila belum masuk / akun nonaktif (KP-6.1-24).
 *
 * proxy.ts sudah menyaring hal yang sama lebih dahulu. Pemeriksaan
 * ganda di sini disengaja: proxy tidak berjalan pada seluruh jenis
 * permintaan, dan lapisan ini yang benar-benar memegang baris users.
 *
 * Paksaan ganti Kata Sandi Sementara (KP-6.1-07) SENGAJA TIDAK lagi
 * diperiksa di sini — keputusan sadar pemilik produk 8 September 2026,
 * lihat proxy.ts. Baris ini SEBELUMNYA memeriksa p.wajib_ganti_sandi
 * dan mengalihkan ke /ganti-sandi-wajib; itu bertentangan langsung
 * dengan pencabutan di proxy.ts (yang mengalihkan /ganti-sandi-wajib
 * KELUAR ke beranda) dan mengakibatkan pantulan tanpa henti di antara
 * keduanya — celah yang sesungguhnya terjadi, bukan hipotetis.
 */
export async function wajibkanSudahSiap(): Promise<Pengguna> {
  const p = await penggunaSekarang()

  if (!p) redirect('/masuk')
  if (!p.aktif) redirect('/masuk?sebab=nonaktif')

  return p
}
