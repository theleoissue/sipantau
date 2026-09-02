'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'
import type { KeadaanPiket } from '@/lib/piket/tipe'

export interface HasilTindakan {
  galat?: string
  sukses?: string
}

/**
 * Menyusun jadwal satu bulan penuh dari keadaan awal tiap unit.
 *
 * Kewenangan TIDAK diperiksa di sini melainkan di dalam
 * susun_jadwal_piket (migrasi 0043) — satu tempat, dan tempat itu basis
 * data. Memeriksanya juga di sini hanya akan menghasilkan dua sumber
 * kebenaran yang suatu saat menyimpang.
 */
export async function susunJadwal(
  tahun: number,
  bulan: number,
  unitId: string[],
  awal: KeadaanPiket[],
): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const bln = String(bulan).padStart(2, '0')
  const hariTerakhir = new Date(tahun, bulan, 0).getDate()

  const { error } = await supabase.rpc('susun_jadwal_piket', {
    p_mulai: `${tahun}-${bln}-01`,
    p_sampai: `${tahun}-${bln}-${String(hariTerakhir).padStart(2, '0')}`,
    p_unit: unitId,
    p_awal: awal,
  })

  if (error) {
    if (error.message.includes('TIDAK_BERWENANG')) {
      return { galat: 'Hanya Kasubdit yang dapat menyusun jadwal piket.' }
    }
    if (error.message.includes('MASUKAN_TIDAK_LENGKAP')) {
      return { galat: 'Susunan unit dan keadaan awalnya belum lengkap.' }
    }
    return { galat: `Gagal menyusun jadwal: ${error.message}` }
  }

  revalidatePath('/piket')
  return { sukses: 'Jadwal tersusun. Hari yang pernah disunting tangan tidak ikut diubah.' }
}

/**
 * Menyunting satu hari untuk satu unit.
 *
 * disunting_manual DISETEL DI SINI, dan itu bukan rincian teknis:
 * penanda itulah yang membuat penyusunan ulang berikutnya melewati hari
 * ini. Tanpa disetel, penyesuaian yang baru saja dibuat akan hilang
 * pada penyusunan ulang pertama tanpa jejak apa pun.
 */
export async function suntingSel(
  tanggal: string,
  unitId: string,
  keadaan: KeadaanPiket,
  catatan: string | null,
): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir. Masuk kembali.' }

  const { error } = await supabase
    .from('jadwal_piket')
    .upsert({
      tanggal,
      unit_id: unitId,
      keadaan,
      disunting_manual: true,
      catatan: catatan?.trim() || null,
      diubah_oleh: user.id,
      diubah_pada: new Date().toISOString(),
    }, { onConflict: 'tanggal,unit_id' })

  // RLS menyaring UPDATE tanpa galat, tetapi upsert yang jatuh ke INSERT
  // MELEMPAR — jadi dua bentuk penolakan bisa muncul dari satu
  // pemanggilan. Keduanya diterjemahkan ke kalimat yang sama.
  if (error) {
    if (/row-level security/i.test(error.message)) {
      return { galat: 'Hanya Kasubdit yang dapat menyunting jadwal piket.' }
    }
    return { galat: `Gagal menyunting jadwal: ${error.message}` }
  }

  revalidatePath('/piket')
  return { sukses: 'Tersimpan.' }
}
