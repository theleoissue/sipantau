import { KerangkaKepala, KerangkaKisiKartu } from '@/components/sipantau/kerangka-muat'

export default function Memuat() {
  return (
    <>
      <KerangkaKepala />
      <KerangkaKisiKartu n={4} />
    </>
  )
}
