import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { personelDapatDipilih } from '@/lib/penugasan/kueri'
import { WizardTerbitkan } from '../wizard'
import type { DataScanSprin } from '../../aksi'

export const metadata = { title: 'Pindai & Terbitkan SPRIN — Si PANTAU' }

export default async function HalamanBuatPenugasan({ searchParams }: { searchParams: Promise<{ pengajuan?: string }> }) {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()
  const { pengajuan } = await searchParams
  const [personel, { data: unit }, { data: scanDisetujui }] = await Promise.all([
    personelDapatDipilih(),
    supabase.from('unit').select('nama, kode_klasifikasi').eq('id', pengguna.unit_id!).maybeSingle<{ nama: string; kode_klasifikasi: string | null }>(),
    pengajuan ? supabase.from('pengajuan_sprin').select('data_scan').eq('id', pengajuan).eq('status', 'disetujui').maybeSingle<{ data_scan: DataScanSprin }>() : Promise.resolve({ data: null }),
  ])
  return <WizardTerbitkan personel={personel} kodeKlasifikasi={unit?.kode_klasifikasi ?? null} namaUnit={unit?.nama ?? 'unit Anda'} scanAwal={scanDisetujui?.data_scan} pemilikDraf={{ id: pengguna.id, unitId: pengguna.unit_id!, konteks: pengajuan ? `pengajuan:${pengajuan}` : 'baru' }} />
}
