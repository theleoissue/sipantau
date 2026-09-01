'use server'

import { klienServer } from '@/lib/supabase/server'
import { sesiAktifSaya } from '@/lib/gps/kueri'

/**
 * KP-6.1-26: Sesi Masuk berakhir tanpa persetujuan siapa pun.
 *
 * catat_keluar() mencatat jejak audit DAN menghapus baris
 * perangkat_masuk, supaya perangkat ini tidak lagi terhitung sebagai
 * Perangkat Terdaftar (BR-16).
 *
 * SENGAJA TIDAK memanggil redirect() di sini. redirect() dari dalam
 * Server Action menghasilkan navigasi LUNAK: pohon router klien milik
 * (app) tetap hidup selama perpindahan, padahal sesinya baru saja
 * dihapus. Setiap render ulang (app) yang menyusul — muatan RSC yang
 * masih dalam perjalanan, atau penyegaran berkala — menemui
 * wajibkanSudahSiap() tanpa sesi lalu memicu pengalihan DI TENGAH
 * pengalihan yang sedang berjalan. Akibatnya halaman kosong, dan
 * sifatnya kadang-kadang karena bergantung pada perlombaan waktu.
 *
 * Pemanggilnya yang berpindah, dengan navigasi KERAS (lihat
 * components/sipantau/tombol-keluar.tsx). Selain menghapus kelas galat
 * itu seluruhnya, navigasi keras juga membuang habis seluruh keadaan
 * klien: singgahan router, keadaan React, dan Zustand. Pada perangkat
 * yang dipakai bergantian, tidak ada satu pun sisa data pengguna
 * sebelumnya yang tertinggal di memori peramban.
 */
export async function keluar() {
  const supabase = await klienServer()
  await supabase.rpc('catat_keluar')
  await supabase.auth.signOut()
}

/**
 * KP-6.1-28: dialog Keluar perlu tahu ada Sesi Tugas berjalan atau
 * tidak. Diambil SESAAT tombol Keluar ditekan, bukan lagi dibaca di
 * app/(app)/layout.tsx pada SETIAP navigasi — dialog ini hanya terbuka
 * sesekali, jadi tidak ada alasan menanggung satu perjalanan bolak-balik
 * tambahan ke basis data pada setiap perpindahan halaman.
 */
export async function cekSedangBertugas(): Promise<boolean> {
  return (await sesiAktifSaya()) !== null
}
