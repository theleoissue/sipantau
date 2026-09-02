import { klienServer } from '@/lib/supabase/server'
import type { SelJadwal, UnitRingkas, KeadaanPiket } from './tipe'
import { jumlahHari } from './tipe'

// =====================================================================
// Pembacaan jadwal piket.
//
// TIDAK ADA penyaring lingkup di sini, sama seperti modul lain: yang
// tampil wajib persis sama dengan yang diizinkan RLS (kebijakan
// jadwal_piket_baca_semua, migrasi 0042 — seluruh peran yang sudah
// masuk boleh membaca). Menambah penyaring di sini hanya akan membuat
// layar dan basis data berbeda pendapat.
// =====================================================================

export interface JadwalBulan {
  unit: UnitRingkas[]
  /** Dikunci "<unit_id>|<tanggal>" — satu pencarian tetap untuk tiap
   *  sel, alih-alih menyusuri seluruh larik pada tiap kotak tabel. */
  sel: Map<string, SelJadwal>
}

export function kunciSel(unitId: string, tanggal: string): string {
  return `${unitId}|${tanggal}`
}

export async function jadwalBulan(tahun: number, bulan: number): Promise<JadwalBulan> {
  const supabase = await klienServer()
  const bln = String(bulan).padStart(2, '0')
  const mulai = `${tahun}-${bln}-01`
  const akhir = `${tahun}-${bln}-${String(jumlahHari(tahun, bulan)).padStart(2, '0')}`

  // Lepas satu sama lain — daftar unit tidak butuh hasil jadwalnya.
  const [hasilUnit, hasilJadwal] = await Promise.all([
    supabase.from('unit').select('id, nama, urutan').eq('aktif', true).order('urutan'),
    supabase.from('jadwal_piket')
      .select('tanggal, unit_id, keadaan, disunting_manual, catatan')
      .gte('tanggal', mulai).lte('tanggal', akhir),
  ])

  if (hasilUnit.error) throw new Error(`Gagal membaca unit: ${hasilUnit.error.message}`)
  if (hasilJadwal.error) throw new Error(`Gagal membaca jadwal piket: ${hasilJadwal.error.message}`)

  const sel = new Map<string, SelJadwal>()
  for (const b of (hasilJadwal.data ?? []) as SelJadwal[]) {
    sel.set(kunciSel(b.unit_id, b.tanggal), b)
  }

  return { unit: (hasilUnit.data ?? []) as UnitRingkas[], sel }
}

/** Keadaan seluruh unit pada satu tanggal. Dipakai penanda "sedang
 *  Piket" di beranda, peta, dan halaman personel. */
export async function piketPada(tanggal: string): Promise<Map<string, KeadaanPiket>> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('jadwal_piket')
    .select('unit_id, keadaan')
    .eq('tanggal', tanggal)

  // Jadwal belum disusun BUKAN keadaan galat — sistem berjalan penuh
  // tanpa jadwal piket, penandanya saja yang tidak muncul. Karena itu
  // galat di sini ditelan menjadi peta kosong, tidak dilempar: sebuah
  // modul tambahan tidak boleh sanggup mematikan beranda dan peta.
  if (error) return new Map()

  const peta = new Map<string, KeadaanPiket>()
  for (const b of (data ?? []) as { unit_id: string; keadaan: KeadaanPiket }[]) {
    peta.set(b.unit_id, b.keadaan)
  }
  return peta
}

/** Unit aktif berurutan. Dipakai bersama piketPada() untuk menampilkan
 *  keadaan seluruh unit hari ini — halaman yang memakainya tidak perlu
 *  tahu bahwa daftarnya datang dari tabel unit. */
export async function daftarUnitAktif(): Promise<UnitRingkas[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('unit').select('id, nama, urutan').eq('aktif', true).order('urutan')
  if (error) return []
  return (data ?? []) as UnitRingkas[]
}
