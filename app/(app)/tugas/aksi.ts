'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'

export interface HasilTindakan {
  galat?: string
  sukses?: string
}

/**
 * Selesai Tugas (KP-6.4-24). BR-65 hanya membatasi PEMBUKAAN Sesi Tugas
 * pada bentuk Android — penutupan tetap tersedia penuh dari web, karena
 * seseorang yang perangkatnya rusak berhak mengakhiri sesinya sendiri
 * tanpa harus meminjam Android orang lain.
 */
export async function selesaiTugas(sesiId: string): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('selesaikan_sesi_tugas', { p_sesi_id: sesiId })

  if (error) {
    if (error.message.includes('BUKAN_PEMEGANG')) {
      return { galat: 'Sesi Tugas ini bukan milik Anda atau sudah tertutup.' }
    }
    return { galat: `Gagal menyelesaikan Sesi Tugas: ${error.message}` }
  }

  revalidatePath('/tugas')
  revalidatePath('/beranda')
  return { sukses: 'Sesi Tugas selesai. Rute Anda sudah tersimpan.' }
}

/** KP-6.4-56: izin lokasi dicabut pengguna sendiri di tengah sesi. */
export async function tandaiIzinTerputus(sesiId: string): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('tandai_izin_lokasi_terputus', { p_sesi_id: sesiId })
  if (error) return { galat: `Gagal mencatat izin terputus: ${error.message}` }
  revalidatePath('/tugas')
  return { sukses: 'Tercatat.' }
}

/** KP-6.4-57: izin lokasi diberikan kembali sebelum sesi berakhir. */
export async function tandaiIzinPulih(sesiId: string): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('tandai_izin_lokasi_pulih', { p_sesi_id: sesiId })
  if (error) return { galat: `Gagal mencatat izin pulih: ${error.message}` }
  revalidatePath('/tugas')
  return { sukses: 'Tercatat.' }
}
