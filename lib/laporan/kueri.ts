import { klienServer } from '@/lib/supabase/server'
import type { LaporanLengkap, StatusLaporan, SptUntukLapor } from './tipe'

export * from './tipe'

// =====================================================================
// Pembacaan data laporan.
//
// Sama seperti lib/penugasan/kueri.ts: TIDAK ADA penyaring lingkup di
// sini. Kalau ada baris yang bocor atau hilang, itu berarti kebijakan
// RLS yang perlu diperbaiki — bukan ditambal dengan filter aplikasi
// yang menyembunyikan gejalanya.
//
// Tipe dan label murni dipisah ke tipe.ts supaya Client Component dapat
// mengimpornya tanpa ikut menyeret lib/supabase/server.ts (yang
// menyentuh next/headers dan gagal dibundel untuk peramban).
// =====================================================================

const KOLOM_LENGKAP = `
  *,
  penugasan:penugasan_id ( nomor_spt, judul, unit_id ),
  pelapor:pelapor_id ( nama, pangkat ),
  lokasi_pilihan:lokasi_id ( nama ),
  lokasi_terdekat:lokasi_id_terdekat ( nama ),
  catatan_laporan ( id, peninjau_id, jenis, isi, dibuat_pada, disunting_pada,
                    users:peninjau_id ( nama, peran ) ),
  foto_dokumentasi ( id, sumber, berkas_path, keterangan, lat, lng, diambil_pada )
`

export async function satuLaporan(id: string): Promise<LaporanLengkap | null> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('laporan_harian')
    .select(KOLOM_LENGKAP)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Gagal membaca laporan: ${error.message}`)
  return (data ?? null) as unknown as LaporanLengkap | null
}

export async function daftarLaporan(opsi?: {
  status?: StatusLaporan[]
  kueri?: string
}): Promise<LaporanLengkap[]> {
  const supabase = await klienServer()
  let q = supabase
    .from('laporan_harian')
    .select(KOLOM_LENGKAP)
    .order('dikirim_pada', { ascending: false })

  if (opsi?.status?.length) q = q.in('status_laporan', opsi.status)
  if (opsi?.kueri) q = q.ilike('uraian', `%${opsi.kueri}%`)

  const { data, error } = await q
  if (error) throw new Error(`Gagal membaca daftar laporan: ${error.message}`)
  return (data ?? []) as unknown as LaporanLengkap[]
}

/** Riwayat milik satu orang (Anggota membuka Riwayat Laporan miliknya). */
export async function riwayatLaporanSaya(userId: string): Promise<LaporanLengkap[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('laporan_harian')
    .select(KOLOM_LENGKAP)
    .eq('pelapor_id', userId)
    .order('dikirim_pada', { ascending: false })

  if (error) throw new Error(`Gagal membaca riwayat laporan: ${error.message}`)
  return (data ?? []) as unknown as LaporanLengkap[]
}

/** SPT yang dapat dipilih di formulir Kirim Laporan: hanya tempat
 *  pengguna tercantum sebagai pelaksana AKTIF dan berstatus menerima
 *  laporan (KP-6.3-01, KP-6.3-04). */
export async function sptUntukLapor(userId: string): Promise<SptUntukLapor[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('penugasan')
    .select(`
      id, nomor_spt, judul, status, tanggal_batas,
      penugasan_lokasi ( id, urutan, nama ),
      penugasan_pelaksana!inner ( pelaksana_id, dicabut_pada )
    `)
    .in('status', ['baru', 'berjalan', 'bermasalah'])
    .eq('penugasan_pelaksana.pelaksana_id', userId)
    .is('penugasan_pelaksana.dicabut_pada', null)

  if (error) throw new Error(`Gagal membaca penugasan: ${error.message}`)
  return (data ?? []) as unknown as SptUntukLapor[]
}
