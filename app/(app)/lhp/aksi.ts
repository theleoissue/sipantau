'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'

// =====================================================================
// Seluruh penulisan data LHP lewat berkas ini (docs/CLAUDE.md §6.1).
//
// Sama seperti app/(app)/penugasan/aksi.ts: tidak ada pemeriksaan peran
// di sini. RLS (0028) dan fungsi security definer (0030) yang menjadi
// satu-satunya sumber kebenaran wewenang — di sini hanya menerjemahkan
// penolakannya menjadi kalimat yang dapat dibaca manusia.
// =====================================================================

export interface HasilAksi {
  galat?: string
  sukses?: string
}

/** Memulai draf LHP untuk satu SPT (mulai_lhp(), 0030) lalu langsung
 *  membuka rinciannya. dasar/waktuKegiatan/tempatKegiatan sudah
 *  diformat pemanggil (halaman rincian SPT) dari data yang sudah ada —
 *  boleh kosong bila sumbernya tidak tersedia (docs/00-fondasi.md §8.7,
 *  mis. Sesi Tugas belum pernah dibuka). */
export async function mulaiLhpAksi(
  penugasanId: string,
  autoisi: { dasar?: string; waktuKegiatan?: string; tempatKegiatan?: string },
): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { data, error } = await supabase.rpc('mulai_lhp', {
    p_penugasan_id: penugasanId,
    p_dasar: autoisi.dasar ?? null,
    p_waktu_kegiatan: autoisi.waktuKegiatan ?? null,
    p_tempat_kegiatan: autoisi.tempatKegiatan ?? null,
  })

  if (error) {
    if (error.message.includes('BUKAN_ANGGOTA')) return { galat: 'Hanya Anggota yang dapat menyusun LHP Ringkas.' }
    if (error.message.includes('BUKAN_PELAKSANA')) return { galat: 'Anda bukan pelaksana aktif pada penugasan ini.' }
    return { galat: `Gagal membuat draf LHP: ${error.message}` }
  }

  revalidatePath('/lhp')
  revalidatePath(`/penugasan/${penugasanId}`)
  redirect(`/lhp/${data as string}`)
}

/** Menyimpan isian teks formulir (perkara, dasar hukum, kronologis,
 *  dst.) — pembaruan langsung ke tabel lhp, ditahan trigger
 *  fn_kunci_lhp begitu statusnya final (0029). */
export async function simpanIsiLhp(
  id: string,
  isian: {
    dasar?: string | null
    waktu_kegiatan?: string | null
    tempat_kegiatan?: string | null
    perkara?: string | null
    dasar_hukum?: string | null
    kronologis?: string | null
    langkah?: string | null
    rencana_tindak_lanjut?: string | null
    kesimpulan?: string | null
    catatan?: string | null
  },
): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp').update(isian).eq('id', id)

  if (error) {
    if (error.message.includes('LHP_TERKUNCI')) return { galat: 'LHP ini sudah difinalkan, tidak dapat diubah lagi.' }
    if (error.message.includes('row-level security')) return { galat: 'Hanya Anggota penyusunnya sendiri yang dapat menyunting.' }
    return { galat: `Gagal menyimpan: ${error.message}` }
  }

  revalidatePath(`/lhp/${id}`)
  return { sukses: 'Tersimpan.' }
}

export async function finalkanLhpAksi(id: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('finalkan_lhp', { p_lhp_id: id })

  if (error) {
    if (error.message.includes('TIDAK_DAPAT_DIFINALKAN')) {
      return { galat: 'LHP tidak ditemukan, bukan milik Anda, atau sudah difinalkan.' }
    }
    return { galat: `Gagal memfinalkan: ${error.message}` }
  }

  revalidatePath(`/lhp/${id}`)
  revalidatePath('/lhp')
  return { sukses: 'LHP Ringkas difinalkan. Panit dan Kanit unit terkait sudah diberi tahu.' }
}

// ---------------------------------------------------------------------
// Bagian dinamis — petugas/pihak/saksi/barang bukti. RLS 0028 sudah
// membatasi tulis hanya penyusun sendiri selagi status masih draf,
// jadi di sini plain insert/delete, bukan RPC (pola sama seperti
// penugasan_dasar/penugasan_lokasi di app/(app)/penugasan/aksi.ts).
// ---------------------------------------------------------------------

export async function tambahPetugas(lhpId: string, petugasId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { data: baris } = await supabase
    .from('lhp_petugas').select('urutan').eq('lhp_id', lhpId).order('urutan', { ascending: false }).limit(1)
  const urutanBaru = ((baris?.[0] as { urutan: number } | undefined)?.urutan ?? 0) + 1

  const { error } = await supabase.from('lhp_petugas').insert({ lhp_id: lhpId, petugas_id: petugasId, urutan: urutanBaru })
  if (error) return { galat: `Gagal menambah petugas: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Petugas ditambahkan.' }
}

export async function hapusPetugas(id: string, lhpId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_petugas').delete().eq('id', id)
  if (error) return { galat: `Gagal menghapus petugas: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Petugas dihapus.' }
}

export async function tambahPihak(
  lhpId: string, peran: 'pelapor' | 'terlapor', nama: string, nomorPengenal: string, keterangan: string,
): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_pihak').insert({
    lhp_id: lhpId, peran, nama: nama.trim(),
    nomor_pengenal: nomorPengenal.trim() || null,
    keterangan: keterangan.trim() || null,
  })
  if (error) return { galat: `Gagal menambah pihak: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Pihak ditambahkan.' }
}

export async function hapusPihak(id: string, lhpId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_pihak').delete().eq('id', id)
  if (error) return { galat: `Gagal menghapus pihak: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Pihak dihapus.' }
}

export async function tambahSaksi(lhpId: string, nama: string, kedudukan: string, keterangan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_saksi').insert({
    lhp_id: lhpId, nama: nama.trim(),
    kedudukan: kedudukan.trim() || null,
    keterangan: keterangan.trim() || null,
  })
  if (error) return { galat: `Gagal menambah saksi: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Saksi ditambahkan.' }
}

export async function hapusSaksi(id: string, lhpId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_saksi').delete().eq('id', id)
  if (error) return { galat: `Gagal menghapus saksi: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Saksi dihapus.' }
}

export async function tambahBarangBukti(lhpId: string, uraian: string, keterangan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_barang_bukti').insert({
    lhp_id: lhpId, uraian: uraian.trim(), keterangan: keterangan.trim() || null,
  })
  if (error) return { galat: `Gagal menambah barang bukti: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Barang bukti ditambahkan.' }
}

export async function hapusBarangBukti(id: string, lhpId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_barang_bukti').delete().eq('id', id)
  if (error) return { galat: `Gagal menghapus barang bukti: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Barang bukti dihapus.' }
}

export async function tambahFoto(lhpId: string, fotoId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_foto').insert({ lhp_id: lhpId, foto_id: fotoId })
  if (error) return { galat: `Gagal melampirkan foto: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Foto dilampirkan.' }
}

export async function hapusFoto(lhpId: string, fotoId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('lhp_foto').delete().eq('lhp_id', lhpId).eq('foto_id', fotoId)
  if (error) return { galat: `Gagal melepas foto: ${error.message}` }
  revalidatePath(`/lhp/${lhpId}`)
  return { sukses: 'Foto dilepas.' }
}
