'use server'

import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'
import { rutePeranIni } from '@/lib/auth/menu'
import type { Peran } from '@/lib/supabase/types'

export interface HasilGanti {
  galat?: string
}

export async function gantiSandi(
  _sebelumnya: HasilGanti,
  data: FormData,
): Promise<HasilGanti> {
  const baru = String(data.get('baru') ?? '')
  const ulang = String(data.get('ulang') ?? '')

  // Minimal delapan karakter, tanpa syarat huruf besar/angka/lambang
  // (AM-6.1-03). Syarat rumit pada pengguna lapangan justru menghasilkan
  // kata sandi yang dituliskan di kertas.
  if (baru.length < 8) {
    return { galat: 'Kata sandi baru sekurang-kurangnya delapan karakter.' }
  }
  if (baru !== ulang) {
    return { galat: 'Ulangan kata sandi tidak sama.' }
  }

  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/masuk')

  // KP-6.1-10: kata sandi baru harus berbeda dari Kata Sandi Sementara.
  // Diperiksa dengan mencoba masuk memakai kata sandi baru itu — bila
  // berhasil, berarti ia sama dengan yang sedang berlaku.
  const { error: galatSama } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: baru,
  })
  if (!galatSama) {
    return { galat: 'Kata sandi baru harus berbeda dari yang diberikan kepada Anda.' }
  }

  const { error } = await supabase.auth.updateUser({ password: baru })
  if (error) {
    return { galat: 'Kata sandi gagal disimpan. Coba lagi.' }
  }

  // Memadamkan wajib_ganti_sandi lewat jalur resmi. Penjaga kolom pada
  // migrasi 0005 sengaja menolak perubahan kolom ini dari jalur biasa,
  // supaya Kata Sandi Sementara tidak dapat dilewati tanpa benar-benar
  // menggantinya (AM-6.1-04).
  const { error: galatSelesai } = await supabase.rpc('selesaikan_ganti_sandi_wajib')
  if (galatSelesai) {
    return { galat: 'Kata sandi tersimpan, tetapi status akun gagal diperbarui. Muat ulang halaman.' }
  }

  const { data: baris } = await supabase
    .from('users')
    .select('peran')
    .eq('id', user.id)
    .single<{ peran: Peran }>()

  redirect(rutePeranIni(baris?.peran ?? 'anggota'))
}
