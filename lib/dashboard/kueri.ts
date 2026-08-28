import { klienServer } from '@/lib/supabase/server'
import { hariIniJakarta } from '@/lib/penugasan/kueri'
import type { Peran } from '@/lib/supabase/types'

/**
 * Batas awal "hari ini" WIB, dinyatakan sebagai ISO UTC yang benar.
 *
 * BR-64: Asia/Jakarta selalu UTC+7 tanpa DST. Membandingkan kolom
 * timestamptz dengan string tanggal polos seperti '2026-08-28' akan
 * dibaca PostgREST sebagai tengah malam UTC — meleset tujuh jam dari
 * tengah malam WIB yang dimaksud. Baris di bawah menghitung batasnya
 * secara eksplisit sebelum dikirim sebagai filter.
 */
function awalHariJakartaUtc(): string {
  return new Date(`${hariIniJakarta()}T00:00:00+07:00`).toISOString()
}

// =====================================================================
// Kartu statistik dashboard.
//
// TIDAK ADA angka tren/perbandingan "naik 3 dari pekan lalu" seperti di
// mockup — itu menuntut cuplikan data pekan lalu yang tidak tersimpan
// di mana pun. Mengarang angkanya lebih berbahaya daripada tidak
// menampilkannya sama sekali (Prinsip Non-Menghakimi berlaku juga pada
// sistem terhadap dirinya: jangan menyajikan fakta yang tidak ada).
//
// Setiap hitungan di sini TIDAK menambahkan penyaring lingkup sendiri —
// itu tugas RLS. Kalau seorang Kanit melihat angka unit lain, itu
// kebocoran kebijakan yang harus diperbaiki di database, bukan ditutup
// dengan filter tambahan di sini.
// =====================================================================

export interface KartuStat {
  label: string
  nilai: number
  keterangan: string
  warna: string
}

export async function statDashboard(peran: Peran): Promise<KartuStat[]> {
  const supabase = await klienServer()
  const hariIni = hariIniJakarta()
  const awalHariIni = awalHariJakartaUtc()

  const aktif = ['baru', 'berjalan', 'bermasalah']

  if (peran === 'kasubdit') {
    const [{ count: penugasanAktif }, { count: laporanHariIni }, { count: bermasalah }] = await Promise.all([
      supabase.from('penugasan').select('id', { count: 'exact', head: true }).in('status', aktif),
      supabase.from('laporan_harian').select('id', { count: 'exact', head: true })
        .neq('status_laporan', 'ditarik').gte('dikirim_pada', awalHariIni),
      supabase.from('penugasan').select('id', { count: 'exact', head: true }).eq('status', 'bermasalah'),
    ])
    return [
      { label: 'Penugasan aktif', nilai: penugasanAktif ?? 0, keterangan: 'seluruh unit', warna: 'var(--primary)' },
      { label: 'Laporan masuk hari ini', nilai: laporanHariIni ?? 0, keterangan: 'seluruh unit', warna: 'var(--gold)' },
      { label: 'Penugasan bermasalah', nilai: bermasalah ?? 0, keterangan: 'wajib ditinjau', warna: 'var(--red)' },
    ]
  }

  if (peran === 'kanit') {
    const [{ count: penugasanAktif }, { count: perluTinjau }, { data: spt }] = await Promise.all([
      supabase.from('penugasan').select('id', { count: 'exact', head: true }).in('status', aktif),
      supabase.from('laporan_harian').select('id', { count: 'exact', head: true }).eq('status_laporan', 'terkirim'),
      supabase.from('penugasan').select('tanggal_batas').in('status', aktif),
    ])
    const lewatBatas = (spt ?? []).filter(s => s.tanggal_batas && s.tanggal_batas < hariIni).length
    return [
      { label: 'Penugasan unit', nilai: penugasanAktif ?? 0, keterangan: 'sedang aktif', warna: 'var(--primary)' },
      { label: 'Laporan perlu ditinjau', nilai: perluTinjau ?? 0, keterangan: 'menunggu Anda', warna: 'var(--gold)' },
      { label: 'Melewati tenggat', nilai: lewatBatas, keterangan: lewatBatas === 0 ? 'bersih' : 'perlu perhatian', warna: lewatBatas === 0 ? 'var(--ink-3)' : 'var(--red)' },
    ]
  }

  if (peran === 'panit') {
    const [{ count: penugasanSaya }, { count: perluTinjau }, { count: belumLapor }] = await Promise.all([
      supabase.from('penugasan').select('id', { count: 'exact', head: true }).in('status', aktif),
      supabase.from('laporan_harian').select('id', { count: 'exact', head: true }).eq('status_laporan', 'terkirim'),
      supabase.from('v_belum_lapor').select('*', { count: 'exact', head: true }),
    ])
    return [
      { label: 'Penugasan saya', nilai: penugasanSaya ?? 0, keterangan: 'sedang aktif', warna: 'var(--primary)' },
      { label: 'Laporan perlu ditinjau', nilai: perluTinjau ?? 0, keterangan: 'menunggu Anda', warna: 'var(--gold)' },
      { label: 'Belum melapor hari ini', nilai: belumLapor ?? 0, keterangan: 'pelaksana', warna: (belumLapor ?? 0) === 0 ? 'var(--green)' : 'var(--ink-3)' },
    ]
  }

  // anggota
  const [{ count: tugasBerjalan }, { count: laporanTerkirim }, { count: menunggu }] = await Promise.all([
    supabase.from('penugasan').select('id', { count: 'exact', head: true }).in('status', aktif),
    supabase.from('laporan_harian').select('id', { count: 'exact', head: true }).neq('status_laporan', 'ditarik'),
    supabase.from('laporan_harian').select('id', { count: 'exact', head: true }).eq('status_laporan', 'terkirim'),
  ])
  return [
    { label: 'Tugas berjalan', nilai: tugasBerjalan ?? 0, keterangan: 'saat ini', warna: 'var(--primary)' },
    { label: 'Laporan terkirim', nilai: laporanTerkirim ?? 0, keterangan: 'total', warna: 'var(--green)' },
    { label: 'Menunggu ditinjau', nilai: menunggu ?? 0, keterangan: 'oleh peninjau', warna: 'var(--gold)' },
  ]
}

export interface AktivitasTerbaru {
  id: string
  pelapor_nama: string
  nomor_spt: string | null
  uraian: string
  dikirim_pada: string
  status_laporan: string
}

/** Aktivitas terbaru — RLS menentukan lingkupnya sendiri: Anggota
 *  hanya melihat laporannya sendiri, Panit yang diawasinya, Kanit
 *  unitnya, Kasubdit seluruhnya. Itu bukan kekurangan di sini, itu
 *  memang lingkup yang benar menurut matriks §2.3. */
export async function aktivitasTerbaru(): Promise<AktivitasTerbaru[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('laporan_harian')
    .select('id, uraian, dikirim_pada, status_laporan, pelapor:pelapor_id ( nama ), penugasan:penugasan_id ( nomor_spt )')
    .order('dikirim_pada', { ascending: false })
    .limit(6)

  if (error) throw new Error(`Gagal membaca aktivitas terbaru: ${error.message}`)

  return ((data ?? []) as unknown as {
    id: string; uraian: string; dikirim_pada: string; status_laporan: string
    pelapor: { nama: string } | null
    penugasan: { nomor_spt: string | null } | null
  }[]).map(r => ({
    id: r.id,
    pelapor_nama: r.pelapor?.nama ?? '—',
    nomor_spt: r.penugasan?.nomor_spt ?? null,
    uraian: r.uraian,
    dikirim_pada: r.dikirim_pada,
    status_laporan: r.status_laporan,
  }))
}
