import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { personelDapatDipilih } from '@/lib/penugasan/kueri'
import { WizardTerbitkan } from './wizard'

export const metadata = { title: 'Terbitkan Penugasan — Si PANTAU' }

// Rutenya sudah dijaga proxy.ts (khusus Kanit) dan aturan akses baris.
// Halaman ini hanya menyiapkan datanya.
export default async function HalamanTerbitkan() {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()

  // Dua kueri ini TIDAK saling bergantung — personelDapatDipilih() tidak
  // menerima argumen, jadi tidak perlu menunggu pengguna/unit lebih dulu.
  const [personel, { data: unit }] = await Promise.all([
    personelDapatDipilih(),
    supabase
      .from('unit')
      .select('nama, kode_klasifikasi')
      .eq('id', pengguna.unit_id!)
      .maybeSingle<{ nama: string; kode_klasifikasi: string | null }>(),
  ])

  return (
    <WizardTerbitkan
      personel={personel}
      kodeKlasifikasi={unit?.kode_klasifikasi ?? null}
      namaUnit={unit?.nama ?? 'unit Anda'}
    />
  )
}
