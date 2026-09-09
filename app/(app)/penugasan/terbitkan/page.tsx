import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { personelDapatDipilih } from '@/lib/penugasan/kueri'
import { WizardTerbitkan } from './wizard'
import type { DataScanSprin } from '../aksi'

export const metadata = { title: 'Terbitkan Penugasan — Si PANTAU' }

// Rutenya sudah dijaga proxy.ts (khusus Kanit) dan aturan akses baris.
// Halaman ini hanya menyiapkan datanya.
export default async function HalamanTerbitkan({ searchParams }: { searchParams: Promise<{ pengajuan?: string }> }) {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()
  const { pengajuan } = await searchParams

  // Dua kueri ini TIDAK saling bergantung — personelDapatDipilih() tidak
  // menerima argumen, jadi tidak perlu menunggu pengguna/unit lebih dulu.
  const [personel, { data: unit }, { data: scanDisetujui }] = await Promise.all([
    personelDapatDipilih(),
    supabase
      .from('unit')
      .select('nama, kode_klasifikasi')
      .eq('id', pengguna.unit_id!)
      .maybeSingle<{ nama: string; kode_klasifikasi: string | null }>(),
    pengajuan
      ? supabase.from('pengajuan_sprin').select('data_scan').eq('id', pengajuan).eq('status', 'disetujui').maybeSingle<{ data_scan: DataScanSprin }>()
      : Promise.resolve({ data: null }),
  ])

  return (
    <WizardTerbitkan
      personel={personel}
      kodeKlasifikasi={unit?.kode_klasifikasi ?? null}
      namaUnit={unit?.nama ?? 'unit Anda'}
      scanAwal={scanDisetujui?.data_scan}
    />
  )
}
