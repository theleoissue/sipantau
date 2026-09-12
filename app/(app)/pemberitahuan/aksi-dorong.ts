'use server'

import { klienServer } from '@/lib/supabase/server'

export async function simpanLanggananDorong(input: {
  token: string
  penandaPerangkat: string
}): Promise<{ galat?: string }> {
  if (!input.token.trim() || !input.penandaPerangkat.trim()) return { galat: 'Penanda perangkat tidak lengkap.' }

  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir.' }

  // Aturan satu perangkat: token lama milik akun yang sama tidak boleh
  // terus menerima kabar setelah pengguna berpindah perangkat.
  const { error: galatNonaktif } = await supabase.from('langganan_dorong')
    .update({ aktif: false, diubah_pada: new Date().toISOString() })
    .eq('pengguna_id', user.id)
    .neq('penanda_perangkat', input.penandaPerangkat)
  if (galatNonaktif) return { galat: `Pendaftaran pemberitahuan gagal: ${galatNonaktif.message}` }

  const { error } = await supabase.from('langganan_dorong').upsert({
    pengguna_id: user.id,
    penanda_perangkat: input.penandaPerangkat,
    penanda_dorong: input.token.trim(),
    aktif: true,
    diubah_pada: new Date().toISOString(),
  }, { onConflict: 'pengguna_id,penanda_perangkat' })

  return error ? { galat: `Pendaftaran pemberitahuan gagal: ${error.message}` } : {}
}
