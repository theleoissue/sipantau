import { klienServer } from '@/lib/supabase/server'
import type { SesiAktifSaya, PosisiPeta, SesiRute, TitikRute } from './tipe'

// =====================================================================
// Pembacaan data Modul 6.4.
//
// Sama seperti lib/penugasan/kueri.ts: TIDAK ADA penyaring lingkup di
// sini. Yang tampil di layar wajib persis sama dengan yang diizinkan
// RLS 0017 (dua asimetri Panit/rekan yang mudah tertukar), tidak kurang
// dan tidak lebih.
// =====================================================================

/** Sesi Tugas berjalan milik pengguna yang sedang masuk, kalau ada.
 *  null berarti belum membuka Sesi Tugas. */
export async function sesiAktifSaya(): Promise<SesiAktifSaya | null> {
  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('sesi_tugas')
    .select(`
      id, penugasan_id, dibuka_pada, titik_terakhir_pada, jumlah_titik,
      izin_dicabut_pada, izin_dipulihkan_pada,
      penugasan:penugasan_id ( nomor_spt, judul )
    `)
    .eq('pengguna_id', user.id)
    .is('ditutup_pada', null)
    .maybeSingle()

  if (error) throw new Error(`Gagal membaca Sesi Tugas: ${error.message}`)
  if (!data) return null

  const spt = data.penugasan as unknown as { nomor_spt: string | null; judul: string }
  return {
    id: data.id,
    penugasan_id: data.penugasan_id,
    nomor_spt: spt?.nomor_spt ?? null,
    judul: spt?.judul ?? '',
    dibuka_pada: data.dibuka_pada,
    titik_terakhir_pada: data.titik_terakhir_pada,
    jumlah_titik: data.jumlah_titik,
    izin_dicabut_pada: data.izin_dicabut_pada,
    izin_dipulihkan_pada: data.izin_dipulihkan_pada,
  }
}

/** Posisi hidup dalam lingkup pengguna — bahan awal peta sebelum
 *  Client Component mengambil alih lewat Realtime (docs/CLAUDE.md §6.1:
 *  Server Component tidak dapat berlangganan, jadi ini hanya potret
 *  saat halaman dibuka). */
export async function posisiPetaAwal(): Promise<PosisiPeta[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('posisi_terkini')
    .select(`
      sesi_tugas_id, penugasan_id, pengguna_id, unit_id, lat, lng,
      akurasi_meter, baterai_persen, sumber_lokasi, izin_terputus, direkam_pada,
      pengguna:pengguna_id ( nama ),
      penugasan:penugasan_id ( nomor_spt, judul )
    `)

  if (error) throw new Error(`Gagal membaca peta: ${error.message}`)
  return (data ?? []).map(baris => {
    const b = baris as unknown as Record<string, unknown>
    const pengguna = b.pengguna as { nama: string } | null
    const penugasan = b.penugasan as { nomor_spt: string | null; judul: string } | null
    return {
      sesi_tugas_id: b.sesi_tugas_id as string,
      penugasan_id: b.penugasan_id as string,
      pengguna_id: b.pengguna_id as string,
      unit_id: b.unit_id as string,
      lat: Number(b.lat),
      lng: Number(b.lng),
      akurasi_meter: b.akurasi_meter == null ? null : Number(b.akurasi_meter),
      baterai_persen: b.baterai_persen as number | null,
      sumber_lokasi: b.sumber_lokasi as PosisiPeta['sumber_lokasi'],
      izin_terputus: b.izin_terputus as boolean,
      direkam_pada: b.direkam_pada as string,
      nama: pengguna?.nama ?? '—',
      nomor_spt: penugasan?.nomor_spt ?? null,
      judul: penugasan?.judul ?? '',
    }
  })
}

/** Daftar SPT dalam lingkup pengguna, untuk penyaring peta. Bukan
 *  daftar SPT lengkap — cukup yang perlu tampil di dropdown. */
export async function daftarSptUntukPeta(): Promise<{ id: string; nomor_spt: string | null; judul: string }[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('penugasan')
    .select('id, nomor_spt, judul')
    .in('status', ['baru', 'berjalan', 'bermasalah'])
    .order('diterbitkan_pada', { ascending: false })

  if (error) throw new Error(`Gagal membaca daftar penugasan: ${error.message}`)
  return data ?? []
}

export interface LokasiSptPeta {
  penugasan_id: string
  nomor_spt: string | null
  judul: string
  nama: string
  lat: number
  lng: number
  radius_meter: number | null
}

/** Titik lokasi (tujuan) SPT aktif — BUKAN posisi personel. Ditampilkan
 *  di Peta Lapangan sebagai penanda permanen supaya peta tidak pernah
 *  kosong sama sekali sekalipun belum ada Sesi Tugas berjalan (KP-6.4
 *  tidak mensyaratkan ini untuk peta waktu nyata, tapi tidak
 *  melarangnya — dan tanpa acuan, peta kosong tidak bermakna apa pun
 *  bagi pengawas). Lingkupnya mengikuti RLS penugasan_lokasi apa
 *  adanya (mengikuti induk), disaring ke status aktif di sini supaya
 *  konsisten dengan daftarSptUntukPeta di atas. */
export async function titikLokasiUntukPeta(): Promise<LokasiSptPeta[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('penugasan_lokasi')
    .select('penugasan_id, nama, lat, lng, radius_meter, penugasan:penugasan_id ( nomor_spt, judul, status )')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (error) throw new Error(`Gagal membaca titik lokasi peta: ${error.message}`)

  return (data ?? [])
    .map(b => b as unknown as {
      penugasan_id: string; nama: string; lat: number; lng: number; radius_meter: number | null
      penugasan: { nomor_spt: string | null; judul: string; status: string } | null
    })
    .filter(b => b.penugasan && ['baru', 'berjalan', 'bermasalah'].includes(b.penugasan.status))
    .map(b => ({
      penugasan_id: b.penugasan_id,
      nomor_spt: b.penugasan!.nomor_spt,
      judul: b.penugasan!.judul,
      nama: b.nama,
      lat: b.lat,
      lng: b.lng,
      radius_meter: b.radius_meter,
    }))
}

/** Seluruh sesi (Rute) milik satu SPT — dipakai layar Rute pada
 *  rincian SPT (KP-6.4-41, KP-6.4-45). */
export async function ruteSpt(penugasanId: string): Promise<SesiRute[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('sesi_tugas')
    .select(`
      id, pengguna_id, dibuka_pada, ditutup_pada, sebab_penutupan,
      jarak_tempuh_meter, jumlah_titik, diringkas_pada,
      lat_awal, lng_awal, lat_akhir, lng_akhir,
      pengguna:pengguna_id ( nama )
    `)
    .eq('penugasan_id', penugasanId)
    .order('dibuka_pada', { ascending: false })

  if (error) throw new Error(`Gagal membaca Rute: ${error.message}`)
  return (data ?? []).map(b => {
    const p = b as unknown as Record<string, unknown>
    const pengguna = p.pengguna as { nama: string } | null
    return { ...(p as unknown as SesiRute), nama: pengguna?.nama ?? '—' }
  })
}

/** ruteSpt() + Titik tiap sesi dalam satu panggilan, untuk Layar Rute
 *  (KP-6.4-41). N+1 kueri kecil dianggap wajar di sini: jumlah sesi per
 *  SPT jarang lebih dari beberapa puluh, jauh dari skala location_logs
 *  sendiri yang memang tabel tumbuh tercepat sistem (Section 10.2). */
export async function ruteSptDenganTitik(
  penugasanId: string,
): Promise<{ sesi: SesiRute[]; titikPerSesi: Record<string, TitikRute[]> }> {
  const sesi = await ruteSpt(penugasanId)
  const titikPerSesi: Record<string, TitikRute[]> = {}
  for (const s of sesi) {
    titikPerSesi[s.id] = await titikSesi(s.id)
  }
  return { sesi, titikPerSesi }
}

/** Titik satu sesi untuk digambar sebagai garis (KP-6.4-42: hanya yang
 *  tidak diragukan dipakai menggambar garis — disaring di sini supaya
 *  komponen tampilan tidak perlu tahu aturannya). */
export async function titikSesi(sesiId: string): Promise<TitikRute[]> {
  const supabase = await klienServer()
  const { data, error } = await supabase
    .from('location_logs')
    .select('id, lat, lng, direkam_pada, diragukan_sebab')
    .eq('sesi_tugas_id', sesiId)
    .order('direkam_pada', { ascending: true })

  if (error) throw new Error(`Gagal membaca Titik: ${error.message}`)
  return (data ?? []).map(t => ({ ...t, lat: Number(t.lat), lng: Number(t.lng) }))
}

/** Seluruh sesi milik pengguna sendiri lintas SPT (KP-6.4-46, "Rute
 *  Saya"). */
export async function ruteSayaLintasSpt(): Promise<(SesiRute & { nomor_spt: string | null; judul: string })[]> {
  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('sesi_tugas')
    .select(`
      id, pengguna_id, dibuka_pada, ditutup_pada, sebab_penutupan,
      jarak_tempuh_meter, jumlah_titik, diringkas_pada,
      lat_awal, lng_awal, lat_akhir, lng_akhir,
      penugasan:penugasan_id ( nomor_spt, judul )
    `)
    .eq('pengguna_id', user.id)
    .order('dibuka_pada', { ascending: false })

  if (error) throw new Error(`Gagal membaca Rute Saya: ${error.message}`)
  return (data ?? []).map(b => {
    const p = b as unknown as Record<string, unknown>
    const spt = p.penugasan as { nomor_spt: string | null; judul: string } | null
    return {
      ...(p as unknown as SesiRute),
      nama: '',
      nomor_spt: spt?.nomor_spt ?? null,
      judul: spt?.judul ?? '',
    }
  })
}
