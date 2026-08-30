import { klienServer } from '@/lib/supabase/server'

// =====================================================================
// Pembacaan data penugasan.
//
// TIDAK ADA satu pun kueri di berkas ini yang menambahkan penyaring
// lingkup sendiri (unit_id, pelaksana_id, dan semacamnya). Penyaringan
// itu urusan aturan akses baris di basis data.
//
// Ini disengaja dan penting: kalau lapisan ini ikut menyaring, kebocoran
// pada kebijakan RLS akan tertutupi oleh penyaring aplikasi dan tidak
// pernah ketahuan — sampai suatu hari ada yang memanggil API-nya
// langsung. Yang tampil di layar wajib persis sama dengan yang
// diizinkan basis data, tidak kurang dan tidak lebih.
// =====================================================================

export type StatusSpt =
  | 'draf' | 'baru' | 'berjalan' | 'bermasalah' | 'selesai' | 'dibatalkan'

export type Prioritas = 'normal' | 'penting' | 'urgent'

export interface TitikLokasi {
  id: string
  urutan: number
  nama: string
  alamat: string | null
  keterangan: string | null
  lat: number | null
  lng: number | null
  radius_meter: number | null
}

export interface DasarPenugasan {
  id: string
  urutan: number
  jenis: string
  nomor: string | null
  tanggal: string | null
  keterangan: string | null
}

export interface OrangSpt {
  id: string
  pelaksana_id?: string
  panit_id?: string
  urutan?: number
  dibaca_pada?: string | null
  dicabut_pada: string | null
  alasan_pencabutan: string | null
  users: { id: string; nama: string; pangkat: string | null; peran: string; nrp: string } | null
}

export interface Penugasan {
  id: string
  nomor_spt: string | null
  jenis_kegiatan: string
  judul: string
  objek: string | null
  sasaran: string | null
  uraian_tugas: string | null
  nomor_lp: string | null
  sumber_informasi: string | null
  unit_id: string
  prioritas: Prioritas
  status: StatusSpt
  tanggal_mulai: string | null
  tanggal_batas: string | null
  berkas_surat_path: string | null
  diterbitkan_oleh: string | null
  diterbitkan_pada: string | null
  ditutup_pada: string | null
  dibatalkan_pada: string | null
  alasan_pembatalan: string | null
  jenis_masalah: string | null
  uraian_masalah: string | null
}

export interface Perpanjangan {
  id: string
  tanggal_lama: string | null
  tanggal_baru: string
  alasan: string
  diubah_pada: string
  users: { nama: string } | null
}

export async function riwayatPerpanjangan(penugasanId: string): Promise<Perpanjangan[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('penugasan_perpanjangan')
    .select('id, tanggal_lama, tanggal_baru, alasan, diubah_pada, users:diubah_oleh ( nama )')
    .eq('penugasan_id', penugasanId)
    .order('diubah_pada', { ascending: false })

  if (error) throw new Error(`Gagal membaca riwayat perpanjangan: ${error.message}`)
  return (data ?? []) as unknown as Perpanjangan[]
}

/** Boleh dihapus permanen hanya bila belum pernah ada laporan maupun
 *  Sesi Tugas (KP-6.2-48) — dihitung di sini supaya tombol Hapus hanya
 *  ditampilkan bila benar-benar berlaku (BR-11), bukan ditampilkan lalu
 *  ditolak. */
export async function bolehHapusPermanen(penugasanId: string): Promise<boolean> {
  const supabase = await klienServer()
  const [{ count: jumlahLaporan }, { count: jumlahSesi }] = await Promise.all([
    supabase.from('laporan_harian').select('id', { count: 'exact', head: true }).eq('penugasan_id', penugasanId),
    supabase.from('sesi_tugas').select('id', { count: 'exact', head: true }).eq('penugasan_id', penugasanId),
  ])
  return (jumlahLaporan ?? 0) === 0 && (jumlahSesi ?? 0) === 0
}

export interface PenugasanLengkap extends Penugasan {
  penugasan_lokasi: TitikLokasi[]
  penugasan_dasar: DasarPenugasan[]
  penugasan_pelaksana: OrangSpt[]
  penugasan_panit: OrangSpt[]
  unit: { nama: string; kode_klasifikasi: string | null } | null
}

/**
 * Menghitung penanda Lewat Batas pada zona waktu Asia/Jakarta.
 *
 * BR-64, dan ini bukan kerewelan: server berjalan UTC, selisihnya tujuh
 * jam. Memakai tanggal server apa adanya membuat SPT yang batasnya hari
 * ini ditandai lewat batas sejak pukul 17.00 WIB kemarin — Kanit melihat
 * penanda merah pada penugasan yang sebenarnya masih punya sisa waktu
 * satu hari penuh. Tanpa satu pun galat, dan meleset setiap hari.
 */
export function hariIniJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function lewatBatas(p: { tanggal_batas: string | null; status: StatusSpt }): boolean {
  if (!p.tanggal_batas) return false
  if (!['baru', 'berjalan', 'bermasalah'].includes(p.status)) return false
  return p.tanggal_batas < hariIniJakarta()
}

export function hariTerlampaui(p: { tanggal_batas: string | null }): number {
  if (!p.tanggal_batas) return 0
  const batas = new Date(p.tanggal_batas + 'T00:00:00Z').getTime()
  const kini = new Date(hariIniJakarta() + 'T00:00:00Z').getTime()
  return Math.round((kini - batas) / 86_400_000)
}

const KOLOM_LENGKAP = `
  *,
  unit ( nama, kode_klasifikasi ),
  penugasan_lokasi ( id, urutan, nama, alamat, keterangan, lat, lng, radius_meter ),
  penugasan_dasar ( id, urutan, jenis, nomor, tanggal, keterangan ),
  penugasan_pelaksana ( id, pelaksana_id, urutan, dibaca_pada, dicabut_pada, alasan_pencabutan,
                        users:pelaksana_id ( id, nama, pangkat, peran, nrp ) ),
  penugasan_panit ( id, panit_id, dicabut_pada, alasan_pencabutan,
                    users:panit_id ( id, nama, pangkat, peran, nrp ) )
`

/** Daftar penugasan aktif. Riwayat punya halamannya sendiri. */
export async function daftarPenugasan(opsi?: {
  status?: StatusSpt[]
  kueri?: string
}): Promise<PenugasanLengkap[]> {
  const supabase = await klienServer()

  let q = supabase
    .from('penugasan')
    .select(KOLOM_LENGKAP)
    .order('diterbitkan_pada', { ascending: false, nullsFirst: false })
    .order('dibuat_pada', { ascending: false })

  if (opsi?.status?.length) q = q.in('status', opsi.status)
  if (opsi?.kueri) {
    const k = `%${opsi.kueri}%`
    q = q.or(`judul.ilike.${k},nomor_spt.ilike.${k},objek.ilike.${k}`)
  }

  const { data, error } = await q
  if (error) throw new Error(`Gagal membaca daftar penugasan: ${error.message}`)
  return (data ?? []) as unknown as PenugasanLengkap[]
}

export async function satuPenugasan(id: string): Promise<PenugasanLengkap | null> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('penugasan')
    .select(KOLOM_LENGKAP)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Gagal membaca penugasan: ${error.message}`)
  return (data ?? null) as unknown as PenugasanLengkap | null
}

/** Personel yang dapat dipilih sebagai Panit PJ atau pelaksana.
 *  Akun Pemeliharaan TIDAK muncul di sini (BR-17, KP-6.1-42). */
export async function personelDapatDipilih() {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, pangkat, peran')
    .eq('aktif', true)
    .neq('peran', 'pemeliharaan')
    .neq('peran', 'kasubdit')
    .order('nama')

  if (error) throw new Error(`Gagal membaca daftar personel: ${error.message}`)
  return data ?? []
}
