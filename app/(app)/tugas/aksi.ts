'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'

export interface HasilTindakan {
  galat?: string
  sukses?: string
}

/**
 * Mulai Tugas versi WEB — migrasi 0031 mencabut lapis kedua BR-65 atas
 * permintaan eksplisit pemilik produk (uji coba/demo, bukan pengganti
 * Langkah 4 Android). p_penanda_perangkat WAJIB berawalan 'web-'
 * (lib/gps/penanda-perangkat.ts) — kejujuran asal sesi tetap terjaga,
 * bukan menyamar sebagai Android.
 */
export async function mulaiTugasWeb(
  penugasanId: string,
  lat: number,
  lng: number,
  akurasiMeter: number | null,
  penandaPerangkat: string,
): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('buka_sesi_tugas', {
    p_penugasan_id: penugasanId,
    p_lat: lat,
    p_lng: lng,
    p_akurasi_meter: akurasiMeter,
    p_penanda_perangkat: penandaPerangkat,
  })

  if (error) {
    if (error.message.includes('BUKAN_PELAKSANA')) return { galat: 'Anda bukan pelaksana aktif pada penugasan ini.' }
    if (error.message.includes('SESI_BERJALAN')) return { galat: 'Anda masih dalam Sesi Tugas lain yang sedang berjalan.' }
    if (error.message.includes('SPT_TIDAK_MENERIMA')) return { galat: 'Penugasan ini tidak sedang menerima Sesi Tugas.' }
    if (error.message.includes('PERAN_TIDAK_BERHAK')) return { galat: 'Akun ini tidak dapat membuka Sesi Tugas.' }
    return { galat: `Gagal memulai Sesi Tugas: ${error.message}` }
  }

  revalidatePath('/tugas')
  revalidatePath('/beranda')
  return { sukses: 'Sesi Tugas dimulai.' }
}

/** Mengirim satu Titik selama Sesi Tugas web berjalan — dipanggil
 *  berkala dari kartu-sesi-tugas.tsx selama tab tetap terbuka (lihat
 *  peringatan BR-65 di komponen itu: berhenti diam-diam begitu tab
 *  ditutup/layar mati, ini keterbatasan yang disadari, bukan bug). */
export async function kirimTitikWeb(
  sesiId: string,
  lat: number,
  lng: number,
  akurasiMeter: number | null,
  kecepatanMps: number | null,
  penandaPerangkat: string,
): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('kirim_titik', {
    p_sesi_id: sesiId,
    p_lat: lat,
    p_lng: lng,
    p_akurasi_meter: akurasiMeter,
    p_kecepatan_mps: kecepatanMps,
    p_arah_derajat: null,
    p_baterai_persen: null,
    p_sumber_lokasi: akurasiMeter != null && akurasiMeter <= 50 ? 'gps' : 'jaringan',
    p_antrean_id: crypto.randomUUID(),
    p_direkam_pada: new Date().toISOString(),
    p_penanda_perangkat: penandaPerangkat,
    p_penanda_perangkat_asal: penandaPerangkat,
    p_lokasi_tiruan: false,
  })

  if (error) {
    if (error.message.includes('SESI_TERTUTUP')) return { galat: 'Sesi Tugas ini sudah berakhir.' }
    return { galat: `Gagal mengirim titik: ${error.message}` }
  }
  return { sukses: 'Titik terkirim.' }
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
