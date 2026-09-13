import { KerangkaKepala, KerangkaTabel } from '@/components/sipantau/kerangka-muat'

// Rute dinamis tanpa loading.tsx tidak di-prefetch sama sekali
// (dokumentasi Next 16), jadi menu ini sebelumnya menunggu server
// merender seluruh daftar akun sebelum layar berubah.
export default function Memuat() {
  return (
    <>
      <KerangkaKepala />
      <KerangkaTabel baris={6} />
    </>
  )
}
