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
 * Menyimpan SPT SELALU sebagai draf terlebih dahulu, lalu menerbitkannya
 * lewat terbitkan_draf() (migrasi 0025) bila diminta.
 *
 * Draf-lebih-dahulu ini disengaja, bukan gaya penulisan: Empat syarat
 * minimum (KP-6.2-04) ditegakkan trg_periksa_syarat_terbit yang HANYA
 * bereaksi pada transisi status draf -> baru (migrasi 0024). Menyimpan
 * langsung dengan status='baru' pada INSERT tidak pernah melewati
 * pemicu itu sama sekali — celah nyata yang sempat ada sebelum
 * perbaikan ini, dan pemeriksaan sisi klien lama (mengecek
 * `pelaksana.length === 0`, bukan peran anggota di dalamnya) juga
 * tidak benar-benar menegakkan "sekurang-kurangnya satu pelaksana
 * BERPERAN ANGGOTA". Satu sumber kebenaran sekarang: pesan galat di
 * bawah datang langsung dari SYARAT_TERBIT_KURANG, yang menyebutkan
 * seluruh kekurangannya sekaligus.
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
      status: 'draf',
      tanggal_mulai: isian.tanggal_mulai || null,
      tanggal_batas: isian.tanggal_batas || null,
      unit_id: aku.unit_id,
      diterbitkan_oleh: user.id,
      ditugaskan_oleh: user.id,
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
    const { error: galatTerbit } = await supabase.rpc('terbitkan_draf', { p_id: spt.id })
    if (galatTerbit) {
      revalidatePath('/penugasan')
      // Draf sudah TERSIMPAN dengan aman pada titik ini — hanya
      // penerbitannya yang gagal. Diarahkan ke rinciannya sendiri
      // supaya Kanit dapat melengkapi yang kurang dan menekan
      // Terbitkan lagi dari sana, bukan kehilangan isian yang sudah
      // disusun.
      redirect(`/penugasan/${spt.id}?belumTerbit=${encodeURIComponent(
        galatTerbit.message.includes('SYARAT_TERBIT_KURANG')
          ? galatTerbit.message.replace('SYARAT_TERBIT_KURANG: ', 'Belum dapat diterbitkan. Masih kurang: ') + '.'
          : galatTerbit.message,
      )}`)
    }
  }

  revalidatePath('/penugasan')
  redirect(`/penugasan/${spt.id}`)
}

/** Menerbitkan draf yang sudah tersimpan (KP-6.2-04..06). Dipanggil
 *  dari halaman rincian bila penerbitan awal sempat gagal, atau bila
 *  Kanit memang sengaja menyusun draf lebih dulu lalu menerbitkannya
 *  belakangan. */
export async function terbitkanDraf(penugasanId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('terbitkan_draf', { p_id: penugasanId })

  if (error) {
    if (error.message.includes('SYARAT_TERBIT_KURANG')) {
      return { galat: error.message.replace('SYARAT_TERBIT_KURANG: ', 'Belum dapat diterbitkan. Masih kurang: ') + '.' }
    }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat menerbitkan penugasan.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Draf tidak ditemukan atau bukan milik unit Anda.' }
    return { galat: `Gagal menerbitkan: ${error.message}` }
  }

  revalidatePath(`/penugasan/${penugasanId}`)
  revalidatePath('/penugasan')
  return { sukses: 'Penugasan berhasil diterbitkan.' }
}

// =====================================================================
// Siklus hidup SPT setelah terbit (migrasi 0025) — satu Server Action
// tipis per fungsi basis data, menerjemahkan kode galat menjadi kalimat
// yang dapat dibaca manusia. Tidak ada pemeriksaan peran di sini,
// alasannya sama seperti catatan pembuka berkas ini.
// =====================================================================

export async function tandaiBermasalah(
  penugasanId: string, jenisMasalah: string, uraian: string,
): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('tandai_spt_bermasalah', {
    p_id: penugasanId, p_jenis_masalah: jenisMasalah, p_uraian: uraian,
  })
  if (error) {
    if (error.message.includes('URAIAN_WAJIB')) return { galat: 'Uraian masalah wajib diisi.' }
    if (error.message.includes('BUKAN_TIM')) {
      return { galat: 'Hanya pelaksana atau Panit Penanggung Jawab aktif yang dapat menandai bermasalah.' }
    }
    return { galat: `Gagal menandai bermasalah: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Penugasan ditandai bermasalah.' }
}

export async function kembalikanDariBermasalah(penugasanId: string, alasan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('kembalikan_dari_bermasalah', { p_id: penugasanId, p_alasan: alasan })
  if (error) {
    if (error.message.includes('ALASAN_WAJIB')) return { galat: 'Alasan pengembalian wajib diisi.' }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat mengembalikan status.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Penugasan tidak ditemukan atau bukan berstatus bermasalah.' }
    return { galat: `Gagal mengembalikan status: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Status dikembalikan ke berjalan.' }
}

export async function tutupSpt(penugasanId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('tutup_spt', { p_id: penugasanId })
  if (error) {
    if (error.message.includes('chk_selesai_wajib_berkas') || error.message.includes('chk_spt_selesai_wajib_berkas')) {
      return { galat: 'Lampirkan pindaian surat perintah tugas sebelum menutup penugasan.' }
    }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat menutup penugasan.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Penugasan tidak ditemukan, bukan milik unit Anda, atau sudah tertutup.' }
    return { galat: `Gagal menutup penugasan: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  revalidatePath('/penugasan')
  return { sukses: 'Penugasan ditutup.' }
}

export async function batalkanSpt(penugasanId: string, alasan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('batalkan_spt', { p_id: penugasanId, p_alasan: alasan })
  if (error) {
    if (error.message.includes('ALASAN_WAJIB')) return { galat: 'Alasan pembatalan wajib diisi.' }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat membatalkan penugasan.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Penugasan tidak ditemukan, bukan milik unit Anda, atau sudah dibatalkan.' }
    return { galat: `Gagal membatalkan penugasan: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  revalidatePath('/penugasan')
  return { sukses: 'Penugasan dibatalkan.' }
}

export async function bukaKembaliSpt(penugasanId: string, alasan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('buka_kembali_spt', { p_id: penugasanId, p_alasan: alasan })
  if (error) {
    if (error.message.includes('ALASAN_WAJIB')) return { galat: 'Alasan pembukaan kembali wajib diisi.' }
    if (error.message.includes('TIDAK_BERWENANG')) return { galat: 'Hanya Kanit unit pemilik atau Kasubdit yang dapat membuka kembali.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Penugasan tidak ditemukan, bukan berstatus selesai, atau bukan milik unit Anda.' }
    return { galat: `Gagal membuka kembali: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  revalidatePath('/penugasan')
  return { sukses: 'Penugasan dibuka kembali.' }
}

export async function perpanjangBatas(penugasanId: string, tanggalBaru: string, alasan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('perpanjang_batas', {
    p_id: penugasanId, p_tanggal_baru: tanggalBaru, p_alasan: alasan,
  })
  if (error) {
    if (error.message.includes('ALASAN_WAJIB')) return { galat: 'Alasan perpanjangan wajib diisi.' }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat mengubah batas waktu.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Penugasan tidak ditemukan, bukan milik unit Anda, atau sudah tertutup.' }
    return { galat: `Gagal memperpanjang batas waktu: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Batas waktu diperpanjang.' }
}

export async function hapusSptPermanen(penugasanId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('hapus_spt_permanen', { p_id: penugasanId })
  if (error) {
    if (error.message.includes('SUDAH_ADA_KEGIATAN')) {
      return { galat: 'Penugasan ini sudah memiliki kegiatan tercatat, tidak dapat dihapus permanen. Gunakan Batalkan.' }
    }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat menghapus penugasan.' }
    if (error.message.includes('TIDAK_DITEMUKAN')) return { galat: 'Penugasan tidak ditemukan atau bukan milik unit Anda.' }
    return { galat: `Gagal menghapus penugasan: ${error.message}` }
  }
  revalidatePath('/penugasan')
  redirect('/penugasan')
}

// ---------------------------------------------------------------------
// Susunan tim — cabut/tambah pelaksana, tunjuk/cabut Panit.
// ---------------------------------------------------------------------

export async function tambahPelaksana(penugasanId: string, pelaksanaId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('tambah_pelaksana', { p_id: penugasanId, p_pelaksana_id: pelaksanaId })
  if (error) {
    if (error.message.includes('BUKAN_PERSONEL_UNIT')) return { galat: 'Hanya personel aktif unit Anda yang dapat ditambahkan.' }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat menambah pelaksana.' }
    return { galat: `Gagal menambah pelaksana: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Pelaksana ditambahkan.' }
}

export async function cabutPelaksana(relasiId: string, penugasanId: string, alasan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('cabut_pelaksana', { p_relasi_id: relasiId, p_alasan: alasan })
  if (error) {
    if (error.message.includes('ALASAN_WAJIB')) return { galat: 'Alasan pencabutan wajib diisi.' }
    if (error.message.includes('PELAKSANA_ANGGOTA_TERAKHIR')) {
      return { galat: 'Ini pelaksana berperan Anggota terakhir pada penugasan ini — tunjuk penggantinya lebih dulu.' }
    }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat mencabut pelaksana.' }
    return { galat: `Gagal mencabut pelaksana: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Pelaksana dicabut.' }
}

export async function tunjukPanit(penugasanId: string, panitId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('tunjuk_panit', { p_id: penugasanId, p_panit_id: panitId })
  if (error) {
    if (error.message.includes('BUKAN_PANIT_UNIT')) return { galat: 'Hanya Panit aktif unit Anda yang dapat ditunjuk.' }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat menunjuk Panit Penanggung Jawab.' }
    return { galat: `Gagal menunjuk Panit: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Panit Penanggung Jawab ditunjuk.' }
}

export async function cabutPanit(relasiId: string, penugasanId: string, alasan: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.rpc('cabut_panit', { p_relasi_id: relasiId, p_alasan: alasan })
  if (error) {
    if (error.message.includes('ALASAN_WAJIB')) return { galat: 'Alasan pencabutan wajib diisi.' }
    if (error.message.includes('PANIT_TERAKHIR')) {
      return { galat: 'Ini Panit Penanggung Jawab terakhir pada penugasan ini — tunjuk penggantinya lebih dulu.' }
    }
    if (error.message.includes('BUKAN_KANIT')) return { galat: 'Hanya Kanit yang dapat mencabut Panit.' }
    return { galat: `Gagal mencabut Panit: ${error.message}` }
  }
  revalidatePath(`/penugasan/${penugasanId}`)
  return { sukses: 'Panit Penanggung Jawab dicabut.' }
}
