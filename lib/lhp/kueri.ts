import { klienServer } from '@/lib/supabase/server'
import type { LhpLengkap } from './tipe'
import type { Personel } from '@/lib/personel/kueri'

export * from './tipe'

// =====================================================================
// Pembacaan data Modul 6.8 (LHP Ringkas).
//
// Sama seperti lib/laporan/kueri.ts: TIDAK ADA penyaring lingkup di
// sini. Yang tampil di layar wajib persis sama dengan yang diizinkan
// RLS (0028) — kalau ada baris bocor atau hilang, itu kebijakan RLS
// yang perlu diperbaiki, bukan ditambal filter aplikasi.
// =====================================================================

const KOLOM_LENGKAP = `
  *,
  penugasan:penugasan_id ( nomor_spt, judul, unit_id ),
  penyusun:disusun_oleh ( nama, pangkat, nrp ),
  lhp_petugas ( id, petugas_id, urutan, users:petugas_id ( nama, pangkat, nrp ) ),
  lhp_pihak ( id, peran, nama, nomor_pengenal, keterangan, urutan ),
  lhp_saksi ( id, nama, kedudukan, keterangan, urutan ),
  lhp_barang_bukti ( id, uraian, keterangan, urutan ),
  lhp_foto ( foto_id, foto_dokumentasi:foto_id ( berkas_path, keterangan ) )
`

export async function satuLhp(id: string): Promise<LhpLengkap | null> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('lhp')
    .select(KOLOM_LENGKAP)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Gagal membaca LHP: ${error.message}`)
  return (data ?? null) as unknown as LhpLengkap | null
}

/** Kandidat tambahan dibatasi pada tim SPRIN yang sama oleh fungsi
 * security-definer 0056. Bagi pembaca selain penyusun draf hasilnya kosong. */
export async function personelLhpDapatDipilih(lhpId: string): Promise<Personel[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase.rpc('personel_lhp_dapat_dipilih', { p_lhp_id: lhpId })
  if (error) throw new Error(`Gagal membaca kandidat petugas LHP: ${error.message}`)
  return ((data ?? []) as Array<{
    id: string; nama: string; nrp: string; pangkat: string | null; peran: string
    aktif: boolean; terakhir_masuk: string | null; terlihat_pada: string | null; unit_nama: string | null
  }>).map(p => ({ ...p, unit: p.unit_nama ? { nama: p.unit_nama } : null }))
}

/** Daftar LHP dalam lingkup pengguna (Kasubdit/Kanit/Panit/Anggota —
 *  disaring RLS 0028, bukan di sini). */
export async function daftarLhp(opsi?: {
  penugasanId?: string
}): Promise<LhpLengkap[]> {
  const supabase = await klienServer()
  let q = supabase
    .from('lhp')
    .select(KOLOM_LENGKAP)
    .order('dibuat_pada', { ascending: false })

  if (opsi?.penugasanId) q = q.eq('penugasan_id', opsi.penugasanId)

  const { data, error } = await q
  if (error) throw new Error(`Gagal membaca daftar LHP: ${error.message}`)
  return (data ?? []) as unknown as LhpLengkap[]
}

/** Membuat draf baru — bungkus RPC mulai_lhp() (0030). Teks
 *  dasar/waktu_kegiatan/tempat_kegiatan diformat pemanggil (formulir
 *  Fase 2), bukan di sini; boleh kosong bila sumbernya tidak tersedia
 *  (docs/00-fondasi.md §8.7). */
export async function mulaiLhp(
  penugasanId: string,
  autoisi?: { dasar?: string; waktuKegiatan?: string; tempatKegiatan?: string },
): Promise<string> {
  const supabase = await klienServer()
  const { data, error } = await supabase.rpc('mulai_lhp', {
    p_penugasan_id: penugasanId,
    p_dasar: autoisi?.dasar ?? null,
    p_waktu_kegiatan: autoisi?.waktuKegiatan ?? null,
    p_tempat_kegiatan: autoisi?.tempatKegiatan ?? null,
  })

  if (error) throw new Error(`Gagal membuat draf LHP: ${error.message}`)
  return data as string
}

/** Mengunci LHP dan memberi tahu Panit/Kanit unit terkait — bungkus RPC
 *  finalkan_lhp() (0030). */
export async function finalkanLhp(id: string): Promise<void> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('finalkan_lhp', { p_lhp_id: id })
  if (error) throw new Error(`Gagal memfinalkan LHP: ${error.message}`)
}
