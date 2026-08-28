'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { klienServer } from '@/lib/supabase/server'

// =====================================================================
// Seluruh penulisan data penugasan lewat berkas ini (docs/CLAUDE.md §6.1).
//
// Tidak ada satu pun aksi di sini yang memeriksa peran pemanggil sendiri.
// Itu disengaja: pemeriksaannya ada di aturan akses baris, dan menirunya
// di sini akan melahirkan dua sumber kebenaran yang cepat atau lambat
// berbeda isi. Yang dikerjakan di sini adalah menerjemahkan penolakan
// basis data menjadi kalimat yang dapat dibaca manusia.
// =====================================================================

export interface HasilAksi {
  galat?: string
  sukses?: string
}

/**
 * Tanda terima SPT. Otomatis saat pelaksana pertama kali membuka
 * rincian, bukan tombol terpisah.
 *
 * Kegagalannya sengaja ditelan: yang membuka rincian belum tentu
 * pelaksana (bisa Kanit, Panit, atau Kasubdit), dan bagi mereka fungsi
 * ini memang tidak melakukan apa-apa. Menampilkan galat di situ hanya
 * membingungkan.
 */
export async function catatTandaTerima(penugasanId: string): Promise<void> {
  try {
    const supabase = await klienServer()
    await supabase.rpc('catat_tanda_terima', { p_penugasan_id: penugasanId })
  } catch {
    // Sengaja diam. Lihat penjelasan di atas.
  }
}

interface IsianTerbitkan {
  judul: string
  jenis_kegiatan: string
  nomor_spt: string | null
  objek: string | null
  sasaran: string | null
  uraian_tugas: string | null
  nomor_lp: string | null
  sumber_informasi: string | null
  prioritas: string
  tanggal_mulai: string | null
  tanggal_batas: string | null
  dasar: { jenis: string; nomor: string; tanggal: string; keterangan: string }[]
  lokasi: { nama: string; alamat: string; keterangan: string; lat: string; lng: string; radius: string }[]
  panit: string[]
  pelaksana: string[]
  terbitkan: boolean
}

/**
 * Menyimpan SPT sebagai draf, atau langsung menerbitkannya.
 *
 * Empat syarat minimum sebelum SPT boleh terbit (nomor SPT, dasar
 * hukum, titik lokasi berkoordinat, Panit + Anggota pelaksana)
 * diperiksa di sini SEBELUM menyentuh basis data — bukan untuk
 * menggantikan penegakannya di sana, melainkan supaya pengguna
 * mendapat pesan yang jelas alih-alih pesan galat mentah.
 */
export async function simpanPenugasan(isian: IsianTerbitkan): Promise<HasilAksi> {
  const supabase = await klienServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir. Masuk kembali.' }

  const { data: aku } = await supabase
    .from('users')
    .select('unit_id, peran')
    .eq('id', user.id)
    .maybeSingle<{ unit_id: string | null; peran: string }>()

  if (!aku?.unit_id) return { galat: 'Akun Anda belum terhubung dengan unit mana pun.' }

  // ---- syarat minimum, diperiksa lebih dulu supaya pesannya jelas ----
  if (isian.terbitkan) {
    const kurang: string[] = []
    if (!isian.nomor_spt?.trim()) kurang.push('nomor SPT')
    if (isian.dasar.length === 0) kurang.push('sekurang-kurangnya satu dasar penugasan')
    if (!isian.lokasi.some(l => l.lat && l.lng))
      kurang.push('sekurang-kurangnya satu titik lokasi berkoordinat')
    if (isian.panit.length === 0) kurang.push('sekurang-kurangnya satu Panit Penanggung Jawab')
    if (isian.pelaksana.length === 0) kurang.push('sekurang-kurangnya satu pelaksana')

    if (kurang.length > 0) {
      return { galat: `Belum dapat diterbitkan. Masih kurang: ${kurang.join(', ')}.` }
    }
  }

  if (!isian.judul.trim()) return { galat: 'Judul penugasan wajib diisi.' }

  // ---- induk ----
  const { data: spt, error: galatSpt } = await supabase
    .from('penugasan')
    .insert({
      judul: isian.judul.trim(),
      jenis_kegiatan: isian.jenis_kegiatan,
      nomor_spt: isian.nomor_spt?.trim() || null,
      objek: isian.objek?.trim() || null,
      sasaran: isian.sasaran?.trim() || null,
      uraian_tugas: isian.uraian_tugas?.trim() || null,
      nomor_lp: isian.nomor_lp?.trim() || null,
      sumber_informasi: isian.sumber_informasi?.trim() || null,
      prioritas: isian.prioritas,
      status: isian.terbitkan ? 'baru' : 'draf',
      tanggal_mulai: isian.tanggal_mulai || null,
      tanggal_batas: isian.tanggal_batas || null,
      unit_id: aku.unit_id,
      diterbitkan_oleh: user.id,
      ditugaskan_oleh: user.id,
      diterbitkan_pada: isian.terbitkan ? new Date().toISOString() : null,
    })
    .select('id')
    .single<{ id: string }>()

  if (galatSpt) {
    if (galatSpt.message.includes('nomor_spt')) {
      return { galat: 'Nomor SPT itu sudah dipakai penugasan lain.' }
    }
    if (galatSpt.message.includes('chk_spt_batas_setelah_mulai')) {
      return { galat: 'Batas waktu tidak boleh mendahului tanggal mulai.' }
    }
    if (galatSpt.message.includes('row-level security')) {
      return { galat: 'Hanya Kanit yang dapat menerbitkan penugasan, dan hanya pada unitnya sendiri.' }
    }
    return { galat: `Gagal menyimpan penugasan: ${galatSpt.message}` }
  }

  // ---- anak-anaknya ----
  if (isian.dasar.length > 0) {
    const { error } = await supabase.from('penugasan_dasar').insert(
      isian.dasar.map((d, i) => ({
        penugasan_id: spt.id,
        urutan: i + 1,
        jenis: d.jenis,
        nomor: d.nomor?.trim() || null,
        tanggal: d.tanggal || null,
        keterangan: d.keterangan?.trim() || null,
      })),
    )
    if (error) return { galat: `Gagal menyimpan dasar penugasan: ${error.message}` }
  }

  if (isian.lokasi.length > 0) {
    const { error } = await supabase.from('penugasan_lokasi').insert(
      isian.lokasi.map((l, i) => {
        const adaKoordinat = !!(l.lat && l.lng)
        return {
          penugasan_id: spt.id,
          urutan: i + 1,
          nama: l.nama.trim(),
          alamat: l.alamat?.trim() || null,
          keterangan: l.keterangan?.trim() || null,
          lat: adaKoordinat ? Number(l.lat) : null,
          lng: adaKoordinat ? Number(l.lng) : null,
          // Radius hanya bermakna pada titik berkoordinat.
          radius_meter: adaKoordinat ? Number(l.radius || 300) : null,
        }
      }),
    )
    if (error) return { galat: `Gagal menyimpan titik lokasi: ${error.message}` }
  }

  if (isian.panit.length > 0) {
    const { error } = await supabase.from('penugasan_panit').insert(
      isian.panit.map(pid => ({
        penugasan_id: spt.id, panit_id: pid, ditunjuk_oleh: user.id,
      })),
    )
    if (error) return { galat: `Gagal menunjuk Panit: ${error.message}` }
  }

  if (isian.pelaksana.length > 0) {
    const { error } = await supabase.from('penugasan_pelaksana').insert(
      isian.pelaksana.map((pid, i) => ({
        penugasan_id: spt.id, pelaksana_id: pid, urutan: i + 1,
      })),
    )
    if (error) return { galat: `Gagal menugaskan pelaksana: ${error.message}` }
  }

  if (isian.terbitkan) {
    await supabase.rpc('catat_jejak_audit', {
      p_jenis: 'terbit_spt',
      p_sasaran_tabel: 'penugasan',
      p_sasaran_id: spt.id,
      p_keterangan: `Menerbitkan ${isian.nomor_spt ?? '(tanpa nomor)'}`,
    })
  }

  revalidatePath('/penugasan')
  redirect(`/penugasan/${spt.id}`)
}
