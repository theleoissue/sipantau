import { klienServer } from '@/lib/supabase/server'
import type { Notifikasi } from './tipe'

// Tidak ada penyaring lingkup tambahan di sini — RLS
// (notifikasi_baca_milik_sendiri, migrasi 0019) sudah membatasi hanya
// baris penerima_id = auth.uid() yang terbaca, sesuai KP-6.9-28.

const KOLOM = 'id, jenis, judul, isi, tujuan_jenis, tujuan_id, mendesak, dibaca_pada, dibuat_pada'

/** KP-6.9-13: tiga puluh baris sekali muat. */
export async function daftarNotifikasi(offset = 0, batas = 30): Promise<Notifikasi[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('notifikasi')
    .select(KOLOM)
    .order('dibuat_pada', { ascending: false })
    .range(offset, offset + batas - 1)

  if (error) throw new Error(`Gagal membaca pemberitahuan: ${error.message}`)
  return (data ?? []) as Notifikasi[]
}

export async function jumlahBelumDibaca(): Promise<number> {
  const supabase = await klienServer()
  const { count, error } = await supabase
    .from('notifikasi')
    .select('id', { count: 'exact', head: true })
    .is('dibaca_pada', null)

  if (error) throw new Error(`Gagal membaca jumlah belum dibaca: ${error.message}`)
  return count ?? 0
}

// Pengelompokan per hari (kunciHariJakarta, labelHari, kelompokkanPerHari)
// pindah ke ./tipe — dipakai juga komponen klien DaftarNotifikasi, yang
// tidak boleh mengimpor berkas ini (klienServer menyeret next/headers).
