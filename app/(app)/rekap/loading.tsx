import { KerangkaKepala, KerangkaStat, KerangkaTabel } from '@/components/sipantau/kerangka-muat'

export default function Memuat() {
  return (
    <>
      <KerangkaKepala />
      <KerangkaStat n={4} />
      <KerangkaTabel baris={4} />
    </>
  )
}
