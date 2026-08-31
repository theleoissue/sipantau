import { klienServer } from '@/lib/supabase/server'
import type { Akun, UnitRingkas } from './tipe'

// Lingkup baca ditentukan RLS (users_baca_sesuai_lingkup, migrasi 0033):
// Admin membaca seluruh baris lintas unit, termasuk yang nonaktif
// (KP-6.6-28). Akun Pemeliharaan SENGAJA disaring eksplisit di sini,
// sama seperti lib/personel/kueri.ts — ia bukan peran organisasi
// (docs/10-modul-6.1-auth.md §2.5), tidak pernah tampil di Manajemen
// Akun, dan tidak dibuat/disunting lewat alur ini (AM-6.6-06).

export async function daftarAkun(): Promise<Akun[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, nrp, pangkat, peran, unit_id, aktif, terakhir_masuk, unit:unit_id ( nama )')
    .neq('peran', 'pemeliharaan')
    .order('nama')

  if (error) throw new Error(`Gagal membaca daftar akun: ${error.message}`)

  return ((data ?? []) as unknown as {
    id: string; nama: string; nrp: string; pangkat: string | null
    peran: Akun['peran']; unit_id: string; aktif: boolean; terakhir_masuk: string | null
    unit: { nama: string } | null
  }[]).map(r => ({
    id: r.id, nama: r.nama, nrp: r.nrp, pangkat: r.pangkat, peran: r.peran,
    unit_id: r.unit_id, unit_nama: r.unit?.nama ?? '—', aktif: r.aktif,
    terakhir_masuk: r.terakhir_masuk,
  }))
}

/** Unit aktif untuk pilihan pada formulir — KP-6.6-07: "hanya dapat
 *  dipilih dari unit yang berstatus aktif". */
export async function daftarUnitAktifUntukForm(): Promise<UnitRingkas[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('unit').select('id, nama').eq('aktif', true).order('urutan')

  if (error) throw new Error(`Gagal membaca daftar unit: ${error.message}`)
  return data ?? []
}
