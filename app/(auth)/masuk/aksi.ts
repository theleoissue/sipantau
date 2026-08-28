'use server'

import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'
import { emailSistemDari } from '@/lib/supabase/types'
import { rutePeranIni } from '@/lib/auth/menu'
import type { Peran } from '@/lib/supabase/types'

export interface HasilMasuk {
  galat?: string
  /** Dibedakan dari galat kredensial supaya isian NRP tidak dikosongkan
   *  percuma saat yang bermasalah sebenarnya jaringan (KP-6.1-06). */
  jenisGalat?: 'kredensial' | 'jaringan' | 'nonaktif'
  nrp?: string
}

export async function masuk(
  _sebelumnya: HasilMasuk,
  data: FormData,
): Promise<HasilMasuk> {
  // Spasi di awal dan akhir dibuang sebelum diproses (KP-6.1-04).
  const nrp = String(data.get('nrp') ?? '').trim()
  const sandi = String(data.get('sandi') ?? '')

  if (!nrp || !sandi) {
    return { galat: 'NRP dan kata sandi wajib diisi.', jenisGalat: 'kredensial', nrp }
  }

  const supabase = await klienServer()

  let peran: Peran
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailSistemDari(nrp),
      password: sandi,
    })

    if (error) {
      // KP-6.1-02: satu pesan yang sama untuk NRP tidak terdaftar DAN
      // kata sandi salah. Membedakan keduanya membocorkan NRP mana yang
      // terdaftar — daftar personel unit penyelidikan bukan informasi
      // yang boleh diraba dari luar.
      return {
        galat: 'NRP atau kata sandi tidak sesuai.',
        jenisGalat: 'kredensial',
        nrp,
      }
    }

    // Memperbarui terakhir_masuk dan mencatat jejak audit (KP-6.1-05).
    // Fungsi ini juga menolak akun nonaktif di tingkat basis data
    // (KP-6.1-03), bukan hanya di layar.
    const { data: baris, error: galatCatat } = await supabase
      .rpc('catat_masuk_berhasil')
      .single<{ peran: Peran; wajib_ganti_sandi: boolean }>()

    if (galatCatat) {
      await supabase.auth.signOut()
      if (galatCatat.message.includes('AKUN_NONAKTIF')) {
        return {
          galat: 'Akun ini sedang tidak aktif. Hubungi Kanit unit Anda.',
          jenisGalat: 'nonaktif',
          nrp,
        }
      }
      return {
        galat: 'NRP atau kata sandi tidak sesuai.',
        jenisGalat: 'kredensial',
        nrp,
      }
    }

    if (baris.wajib_ganti_sandi) redirect('/ganti-sandi-wajib')
    peran = baris.peran
  } catch (e) {
    // redirect() bekerja dengan melempar; jangan ditelan sebagai galat.
    if (e && typeof e === 'object' && 'digest' in e &&
        String((e as { digest?: string }).digest).startsWith('NEXT_REDIRECT')) {
      throw e
    }
    return {
      galat: 'Tidak dapat menghubungi server. Periksa jaringan Anda.',
      jenisGalat: 'jaringan',
      nrp,
    }
  }

  redirect(rutePeranIni(peran))
}
