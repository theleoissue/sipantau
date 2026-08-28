'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'

export interface HasilTindakan {
  galat?: string
  sukses?: string
}

export async function beriCatatan(
  laporanId: string,
  isi: string,
  jenis: 'catatan' | 'minta_perbaikan',
): Promise<HasilTindakan> {
  if (!isi.trim()) return { galat: 'Isi catatan wajib diisi.' }

  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir.' }

  const { error } = await supabase.from('catatan_laporan').insert({
    laporan_id: laporanId,
    peninjau_id: user.id,
    jenis,
    isi: isi.trim(),
  })

  if (error) {
    if (error.message.includes('TINJAU_SENDIRI')) {
      return { galat: 'Tidak dapat meninjau laporan sendiri.' }
    }
    return { galat: `Gagal menyimpan catatan: ${error.message}` }
  }

  await supabase.rpc('catat_jejak_audit', {
    p_jenis: jenis === 'minta_perbaikan' ? 'minta_perbaikan_laporan' : 'catat_laporan',
    p_sasaran_tabel: 'laporan_harian',
    p_sasaran_id: laporanId,
  })

  revalidatePath(`/laporan/${laporanId}`)
  return { sukses: 'Catatan tersimpan.' }
}

export async function setujuiLaporan(laporanId: string): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('setujui_laporan', { p_laporan_id: laporanId })

  if (error) {
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat menyetujui laporan.' }
    if (error.message.includes('DI_LUAR_UNIT')) return { galat: 'Laporan ini bukan milik unit Anda.' }
    return { galat: `Gagal menyetujui laporan: ${error.message}` }
  }

  revalidatePath(`/laporan/${laporanId}`)
  return { sukses: 'Laporan disetujui.' }
}

export async function tarikLaporan(laporanId: string, alasan: string): Promise<HasilTindakan> {
  if (!alasan.trim()) return { galat: 'Alasan penarikan wajib diisi.' }

  const supabase = await klienServer()
  const { error } = await supabase.rpc('tarik_laporan', {
    p_laporan_id: laporanId, p_alasan: alasan.trim(),
  })

  if (error) {
    if (error.message.includes('BUKAN_PEMILIK')) return { galat: 'Hanya pengirim laporan yang dapat menariknya.' }
    return { galat: `Gagal menarik laporan: ${error.message}` }
  }

  revalidatePath(`/laporan/${laporanId}`)
  return { sukses: 'Laporan ditarik.' }
}

export async function suntingLaporan(
  laporanId: string,
  uraian: string,
  kendala: string,
  statusKegiatan: string,
): Promise<HasilTindakan> {
  if (!uraian.trim()) return { galat: 'Uraian kegiatan wajib diisi.' }

  const supabase = await klienServer()
  const { error } = await supabase
    .from('laporan_harian')
    .update({
      uraian: uraian.trim(),
      kendala: kendala.trim() || null,
      status_kegiatan: statusKegiatan,
    })
    .eq('id', laporanId)

  if (error) {
    if (error.message.includes('LAPORAN_TERKUNCI') || error.message.includes('SPT_TERTUTUP')) {
      return { galat: 'Laporan ini sudah terkunci dan tidak dapat disunting.' }
    }
    return { galat: `Gagal menyimpan penyuntingan: ${error.message}` }
  }

  await supabase.rpc('catat_jejak_audit', {
    p_jenis: 'sunting_laporan', p_sasaran_tabel: 'laporan_harian', p_sasaran_id: laporanId,
  })

  revalidatePath(`/laporan/${laporanId}`)
  return { sukses: 'Perubahan tersimpan.' }
}

/**
 * Mencatat metadata foto SETELAH berkasnya berhasil diunggah ke
 * Storage dari sisi klien (kebijakan Storage memeriksa sendiri bahwa
 * pengunggah adalah pelapor laporan yang masih dapat disunting —
 * migrasi 0013). Fungsi ini hanya menautkan baris, tidak menyentuh
 * berkas fisik.
 */
export async function catatFoto(input: {
  laporanId: string
  berkasPath: string
  sumber: 'kamera' | 'galeri'
  lat: number | null
  lng: number | null
  akurasiMeter: number | null
  diambilPada: string | null
}): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir.' }

  const { error } = await supabase.from('foto_dokumentasi').insert({
    laporan_id: input.laporanId,
    diunggah_oleh: user.id,
    sumber: input.sumber,
    berkas_path: input.berkasPath,
    // Foto TIDAK PERNAH mewarisi koordinat laporan induknya (BR-42).
    lat: input.sumber === 'kamera' ? input.lat : null,
    lng: input.sumber === 'kamera' ? input.lng : null,
    akurasi_meter: input.sumber === 'kamera' ? input.akurasiMeter : null,
    diambil_pada: input.sumber === 'kamera' ? input.diambilPada : null,
  })

  if (error) return { galat: `Gagal mencatat foto: ${error.message}` }

  revalidatePath(`/laporan/${input.laporanId}`)
  return { sukses: 'Foto ditambahkan.' }
}
