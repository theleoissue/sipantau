import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { sesiAktifSaya } from '@/lib/gps/kueri'
import { jumlahBelumDibaca } from '@/lib/notifikasi/kueri'
import { KerangkaAplikasi } from '@/components/sipantau/kerangka-aplikasi'
import { PesanSekilas } from '@/components/sipantau/pesan-sekilas'

// Seluruh halaman setelah masuk melewati sini. Server Component:
// datanya tidak berubah selama halaman terbuka (docs/CLAUDE.md §6.1).
export default async function TataLetakAplikasi({
  children,
}: {
  children: React.ReactNode
}) {
  const pengguna = await wajibkanSudahSiap()

  let namaUnit: string | null = null
  if (pengguna.unit_id) {
    const supabase = await klienServer()
    const { data } = await supabase
      .from('unit')
      .select('nama')
      .eq('id', pengguna.unit_id)
      .maybeSingle<{ nama: string }>()
    namaUnit = data?.nama ?? null
  }

  // KP-6.1-28 (catatan tempatnya sudah disiapkan tombol-keluar.tsx):
  // dialog Keluar perlu tahu ada Sesi Tugas berjalan atau tidak, supaya
  // peringatannya bukan sekadar kalimat generik.
  const sesi = await sesiAktifSaya()
  const jumlahNotifAwal = await jumlahBelumDibaca()

  return (
    <KerangkaAplikasi
      pengguna={pengguna}
      namaUnit={namaUnit}
      sedangBertugas={sesi !== null}
      jumlahNotifAwal={jumlahNotifAwal}
    >
      <PesanSekilas />
      {children}
    </KerangkaAplikasi>
  )
}
