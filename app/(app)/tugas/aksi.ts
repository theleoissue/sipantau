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
export interface TitikMasuk {
  sesiId: string
  lat: number
  lng: number
  akurasiMeter: number | null
  kecepatanMps: number | null
  /** Arah perjalanan dalam derajat, dari perangkat. */
  arahDerajat: number | null
  penandaPerangkat: string
  /**
   * Dibuat perangkat SEKALI saat Titik ditangkap dan dipakai ulang pada
   * setiap percobaan kirim. Indeks unik pada antrean_id (KP-6.4-19) baru
   * dapat menolak kiriman kembar bila nilainya memang berasal dari
   * perangkat — sebelumnya dibuat ulang di server tiap permintaan,
   * sehingga percobaan ulang selalu lolos sebagai Titik baru.
   */
  antreanId: string
  /**
   * Umur pembacaan dalam milidetik menurut jam perangkat pada saat
   * dikirim. SENGAJA bukan stempel waktu absolut: yang dikirim adalah
   * SELISIH dua waktu perangkat, jadi jam HP yang meleset tidak
   * berpengaruh. Kalau waktu absolut perangkat yang dikirim, satu HP
   * berjam salah akan membuat seluruh Titiknya ditolak
   * WAKTU_TIDAK_MASUK_AKAL dan pelacakannya mati tanpa suara.
   */
  usiaMs: number
  /** Perangkat melaporkan lokasi ini berasal dari penyedia tiruan. */
  lokasiTiruan: boolean
}

export async function kirimTitikWeb(titik: TitikMasuk): Promise<HasilTindakan> {
  const supabase = await klienServer()
  // Umur dibatasi supaya nilai rusak tidak menghasilkan waktu ngawur;
  // 24 jam jauh melampaui Sesi Tugas mana pun.
  const usia = Math.min(Math.max(titik.usiaMs, 0), 24 * 60 * 60 * 1000)
  const { error } = await supabase.rpc('kirim_titik', {
    p_sesi_id: titik.sesiId,
    p_lat: titik.lat,
    p_lng: titik.lng,
    p_akurasi_meter: titik.akurasiMeter,
    p_kecepatan_mps: titik.kecepatanMps,
    p_arah_derajat: titik.arahDerajat,
    p_baterai_persen: null,
    p_sumber_lokasi: titik.akurasiMeter != null && titik.akurasiMeter <= 50 ? 'gps' : 'jaringan',
    p_antrean_id: titik.antreanId,
    p_direkam_pada: new Date(Date.now() - usia).toISOString(),
    p_penanda_perangkat: titik.penandaPerangkat,
    p_penanda_perangkat_asal: titik.penandaPerangkat,
    p_lokasi_tiruan: titik.lokasiTiruan,
  })

  if (error) {
    if (error.message.includes('SESI_TERTUTUP')) return { galat: 'Sesi Tugas ini sudah berakhir.' }
    return { galat: `Gagal mengirim titik: ${error.message}` }
  }
  return { sukses: 'Titik terkirim.' }
}

/**
 * Menerbitkan token Pengiriman Native (migrasi 0037/0038) untuk Sesi
 * Tugas milik pemanggil sendiri. Dipanggil sekali tiap kali pengawas
 * native dinyalakan — termasuk saat APK dibuka kembali pada sesi yang
 * masih berjalan, sehingga penerbitan ulang otomatis mematikan token
 * yang tertinggal di pemasangan sebelumnya.
 *
 * Tokennya dikembalikan APA ADANYA persis sekali di sini, lalu langsung
 * diserahkan ke pustaka pelacakan untuk disimpan pada penyimpanan
 * pribadi aplikasi. Tidak disimpan di mana pun oleh kode kita sendiri,
 * dan tidak pernah bisa dibaca ulang dari basis data.
 */
export async function terbitkanTokenNative(
  sesiId: string,
  penandaPerangkat: string,
): Promise<{ token?: string; galat?: string }> {
  const supabase = await klienServer()
  const { data, error } = await supabase.rpc('terbitkan_token_sesi_native', {
    p_sesi_id: sesiId,
    p_penanda_perangkat: penandaPerangkat,
  })

  if (error) {
    if (error.message.includes('BUKAN_PEMEGANG')) return { galat: 'Sesi Tugas ini bukan milik Anda.' }
    if (error.message.includes('SESI_TERTUTUP')) return { galat: 'Sesi Tugas ini sudah berakhir.' }
    return { galat: `Gagal menyiapkan pelacakan latar: ${error.message}` }
  }
  return { token: data as string }
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
