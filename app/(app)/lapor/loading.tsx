import { KerangkaRincian } from '@/components/sipantau/kerangka-muat'

// Tanpa berkas ini, /lapor — "Kirim Laporan" di bilah bawah — tidak
// di-prefetch sama sekali. Dokumentasi Next 16: rute dinamis dilewati
// prefetch kecuali ada loading.tsx, sehingga menekan menunya membuat
// layar diam sampai server selesai merender seluruh halaman. Dengan
// berkas ini, kerangka tampil seketika dan isinya menyusul.
export default function Memuat() {
  return <KerangkaRincian />
}
