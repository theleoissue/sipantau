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

  // Ketiga di bawah TIDAK saling bergantung — sebelumnya ditulis
  // sebagai tiga `await` berurutan, yang berarti setiap navigasi
  // menunggu tiga perjalanan bolak-balik ke Supabase SATU PER SATU
  // padahal bisa serentak. Inilah bagian terbesar dari keluhan
  // "pindah menu lambat": kelambatan ini terjadi di layout akar, jadi
  // tertimpa pada SETIAP perpindahan halaman, bukan cuma sesekali.
  const [namaUnit, sesi, jumlahNotifAwal] = await Promise.all([
    (async () => {
      if (!pengguna.unit_id) return null
      const supabase = await klienServer()
      const { data } = await supabase
        .from('unit')
        .select('nama')
        .eq('id', pengguna.unit_id)
        .maybeSingle<{ nama: string }>()
      return data?.nama ?? null
    })(),
    // KP-6.1-28 (catatan tempatnya sudah disiapkan tombol-keluar.tsx):
    // dialog Keluar perlu tahu ada Sesi Tugas berjalan atau tidak,
    // supaya peringatannya bukan sekadar kalimat generik.
    sesiAktifSaya(),
    jumlahBelumDibaca(),
  ])

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
