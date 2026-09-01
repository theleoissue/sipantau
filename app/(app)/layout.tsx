import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { jumlahBelumDibaca } from '@/lib/notifikasi/kueri'
import { KerangkaAplikasi } from '@/components/sipantau/kerangka-aplikasi'
import { PesanSekilas } from '@/components/sipantau/pesan-sekilas'
import { PenyegarOtomatis } from '@/components/sipantau/penyegar-otomatis'

// Seluruh halaman setelah masuk melewati sini. Server Component:
// datanya tidak berubah selama halaman terbuka (docs/CLAUDE.md §6.1).
//
// Ini berjalan pada SETIAP navigasi (bukan sekali per sesi), jadi
// setiap kueri di sini adalah pajak yang tertimpa pada seluruh
// aplikasi. Nama unit sekarang ikut disertakan lewat join pada
// penggunaSekarang() sendiri (lib/auth/pengguna.ts) — bukan kueri
// terpisah lagi. sesiAktifSaya() (dulu di sini, demi kalimat pada
// dialog Keluar yang jarang dibuka) sudah dipindah jadi diperiksa
// SESAAT tombol itu ditekan (app/(app)/aksi-keluar.ts) — dialog itu
// tidak berhak menambah beban pada setiap perpindahan halaman.
export default async function TataLetakAplikasi({
  children,
}: {
  children: React.ReactNode
}) {
  // Lepas satu sama lain — wajibkanSudahSiap() tidak butuh hasil
  // jumlahBelumDibaca() atau sebaliknya.
  const [pengguna, jumlahNotifAwal] = await Promise.all([
    wajibkanSudahSiap(),
    jumlahBelumDibaca(),
  ])

  return (
    <KerangkaAplikasi
      pengguna={pengguna}
      namaUnit={pengguna.unit?.nama ?? null}
      jumlahNotifAwal={jumlahNotifAwal}
    >
      <PesanSekilas />
      {/* Dipasang di rangka, bukan per halaman: berlaku untuk SELURUH
          halaman sesudah masuk sekaligus, dan tetap terpasang saat
          berpindah halaman sehingga pencacahnya tidak berulang kali
          dibongkar-pasang. */}
      <PenyegarOtomatis />
      {children}
    </KerangkaAplikasi>
  )
}
