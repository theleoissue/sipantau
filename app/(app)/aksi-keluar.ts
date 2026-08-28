'use server'

import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'

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
