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
 */
export async function penggunaSekarang(): Promise<Pengguna | null> {
  const supabase = await klienServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as Pengguna
}

/**
 * Dipakai layout halaman setelah masuk. Mengembalikan pengguna, atau
 * mengalihkan bila belum masuk / akun nonaktif / kata sandi belum
 * diganti (KP-6.1-07, KP-6.1-24).
 *
 * proxy.ts sudah menyaring hal yang sama lebih dahulu. Pemeriksaan
 * ganda di sini disengaja: proxy tidak berjalan pada seluruh jenis
 * permintaan, dan lapisan ini yang benar-benar memegang baris users.
 */
export async function wajibkanSudahSiap(): Promise<Pengguna> {
  const p = await penggunaSekarang()

  if (!p) redirect('/masuk')
  if (!p.aktif) redirect('/masuk?sebab=nonaktif')
  if (p.wajib_ganti_sandi) redirect('/ganti-sandi-wajib')

  return p
}
