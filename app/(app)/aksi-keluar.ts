'use server'

import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'
import { sesiAktifSaya } from '@/lib/gps/kueri'

/**
 * KP-6.1-26: Sesi Masuk berakhir tanpa persetujuan siapa pun.
 *
 * catat_keluar() mencatat jejak audit DAN menghapus baris
 * perangkat_masuk, supaya perangkat ini tidak lagi terhitung sebagai
 * Perangkat Terdaftar (BR-16).
 */
export async function keluar() {
  const supabase = await klienServer()
  await supabase.rpc('catat_keluar')
  await supabase.auth.signOut()
  redirect('/masuk')
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
