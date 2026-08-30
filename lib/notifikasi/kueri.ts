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

/** Q-08/BR-64: dikelompokkan menurut hari kalender Asia/Jakarta, BUKAN
 *  ::date polos yang membaca zona bawaan server (UTC). */
export function kunciHariJakarta(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso)) // 'en-CA' -> YYYY-MM-DD, urut leksikal benar
}

export function labelHari(kunci: string): string {
  const hariIniJakarta = kunciHariJakarta(new Date().toISOString())
  const kemarinJakarta = kunciHariJakarta(new Date(Date.now() - 24 * 3600_000).toISOString())
  if (kunci === hariIniJakarta) return 'Hari ini'
  if (kunci === kemarinJakarta) return 'Kemarin'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(kunci + 'T00:00:00+07:00'))
}

export function kelompokkanPerHari(daftar: Notifikasi[]): { kunci: string; label: string; baris: Notifikasi[] }[] {
  const peta = new Map<string, Notifikasi[]>()
  for (const n of daftar) {
    const kunci = kunciHariJakarta(n.dibuat_pada)
    if (!peta.has(kunci)) peta.set(kunci, [])
    peta.get(kunci)!.push(n)
  }
  return [...peta.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([kunci, baris]) => ({ kunci, label: labelHari(kunci), baris }))
}
