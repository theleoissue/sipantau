import { klienServer } from '@/lib/supabase/server'

// Lingkupnya sudah ditentukan RLS (users_baca_sesuai_lingkup, migrasi
// 0005): Kasubdit membaca seluruh baris, Kanit membaca unitnya. Tidak
// ada penyaring tambahan di sini — Akun Pemeliharaan sengaja TIDAK
// pernah muncul di daftar personel (BR-17, KP-6.1-42), jadi disaring
// eksplisit, bukan sekadar terkebetulan tersaring RLS.

export interface Personel {
  id: string
  nama: string
  pangkat: string | null
  peran: string
  aktif: boolean
  terakhir_masuk: string | null
  unit: { nama: string } | null
}

export async function daftarPersonel(): Promise<Personel[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, pangkat, peran, aktif, terakhir_masuk, unit:unit_id ( nama )')
    .neq('peran', 'pemeliharaan')
    .order('peran')
    .order('nama')

  if (error) throw new Error(`Gagal membaca daftar personel: ${error.message}`)
  return (data ?? []) as unknown as Personel[]
}

export interface RekapUnit {
  unit_id: string
  nama_unit: string
  personel_aktif: number
  penugasan_aktif: number
  laporan_hari_ini: number
  bermasalah: number
}

/** Rekap Lintas Unit — eksklusif Kasubdit (BR-07). Dihitung dari sisi
 *  aplikasi dengan mengelompokkan hasil kueri, bukan lewat tampilan
 *  tersendiri: jumlah unit kecil (empat), jadi tidak butuh agregasi di
 *  database. */
export async function rekapLintasUnit(): Promise<RekapUnit[]> {
  const supabase = await klienServer()

  const { data: unit, error: galatUnit } = await supabase
    .from('unit').select('id, nama').eq('aktif', true).order('urutan')
  if (galatUnit) throw new Error(`Gagal membaca unit: ${galatUnit.message}`)

  const awalHariIni = new Date(
    `${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())}T00:00:00+07:00`,
  ).toISOString()

  const [{ data: personel }, { data: penugasan }, { data: laporan }] = await Promise.all([
    supabase.from('users').select('unit_id, aktif').neq('peran', 'pemeliharaan'),
    supabase.from('penugasan').select('id, unit_id, status'),
    supabase.from('laporan_harian').select('penugasan_id, dikirim_pada, status_laporan')
      .neq('status_laporan', 'ditarik').gte('dikirim_pada', awalHariIni),
  ])

  // Peta penugasan_id -> unit_id: laporan tidak punya unit_id langsung,
  // jadi dihitung per unit lewat SPT induknya.
  const penugasanUnitMap = new Map((penugasan ?? []).map(p => [p.id, p.unit_id]))

  return (unit ?? []).map(u => ({
    unit_id: u.id,
    nama_unit: u.nama,
    personel_aktif: (personel ?? []).filter(p => p.unit_id === u.id && p.aktif).length,
    penugasan_aktif: (penugasan ?? []).filter(
      p => p.unit_id === u.id && ['baru', 'berjalan', 'bermasalah'].includes(p.status)).length,
    laporan_hari_ini: (laporan ?? []).filter(l => penugasanUnitMap.get(l.penugasan_id) === u.id).length,
    bermasalah: (penugasan ?? []).filter(p => p.unit_id === u.id && p.status === 'bermasalah').length,
  }))
}
