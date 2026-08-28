'use server'

import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'

export interface HasilKirim {
  galat?: string
}

interface IsianLaporan {
  penugasan_id: string
  jenis: string
  status_kegiatan: string
  uraian: string
  kendala: string
  lokasi_id: string | null
  // Koordinat browser. null berarti gagal terekam — alasan wajib.
  lokasi_lat: number | null
  lokasi_lng: number | null
  akurasi_meter: number | null
  alasan_lokasi: string | null
  alasan_lokasi_lainnya: string | null
  keterangan_lokasi: string
  penanda_perangkat: string
}

/**
 * Mengirim laporan kegiatan harian.
 *
 * Perhitungan lokasi (jarak, titik terdekat, status_lokasi) TIDAK
 * dilakukan di sini — itu tugas pemicu server (fn_hitung_lokasi_laporan,
 * migrasi 0011). Fungsi ini hanya meneruskan koordinat mentah, persis
 * Aturan Modul 6.3.4 #4: kalkulasi kritis di server, bukan di klien.
 */
export async function kirimLaporan(isian: IsianLaporan): Promise<HasilKirim> {
  if (!isian.uraian.trim()) {
    return { galat: 'Uraian kegiatan wajib diisi.' }
  }
  // BR-03: laporan TIDAK PERNAH ditolak karena urusan lokasi. Alasan
  // hanya diwajibkan ketika koordinatnya memang tidak berhasil terekam.
  if (isian.lokasi_lat === null && !isian.alasan_lokasi) {
    return { galat: 'Pilih alasan lokasi tidak terekam.' }
  }
  if (isian.alasan_lokasi === 'lainnya' && !isian.alasan_lokasi_lainnya?.trim()) {
    return { galat: 'Uraikan alasan lokasi tidak terekam.' }
  }

  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir. Masuk kembali.' }

  const { data: baris, error } = await supabase
    .from('laporan_harian')
    .insert({
      penugasan_id: isian.penugasan_id,
      pelapor_id: user.id,
      jenis: isian.jenis,
      status_kegiatan: isian.status_kegiatan,
      uraian: isian.uraian.trim(),
      kendala: isian.kendala.trim() || null,
      lokasi_lat: isian.lokasi_lat,
      lokasi_lng: isian.lokasi_lng,
      akurasi_meter: isian.akurasi_meter,
      lokasi_id: isian.lokasi_id,
      alasan_lokasi: isian.lokasi_lat === null ? isian.alasan_lokasi : null,
      alasan_lokasi_lainnya: isian.lokasi_lat === null ? isian.alasan_lokasi_lainnya : null,
      keterangan_lokasi: isian.keterangan_lokasi.trim() || null,
      penanda_perangkat: isian.penanda_perangkat,
    })
    .select('id')
    .single<{ id: string }>()

  if (error) {
    if (error.message.includes('SPT_TERTUTUP')) {
      return { galat: 'Penugasan ini sudah tidak menerima laporan.' }
    }
    if (error.message.includes('BUKAN_PELAKSANA')) {
      return { galat: 'Anda bukan pelaksana aktif pada penugasan ini.' }
    }
    return { galat: `Gagal mengirim laporan: ${error.message}` }
  }

  redirect(`/laporan/${baris.id}`)
}
