import { KerangkaKepala, KerangkaTabel } from '@/components/sipantau/kerangka-muat'

export default function Memuat() {
  return (
    <>
      <KerangkaKepala />
      <KerangkaTabel baris={6} />
    </>
  )
}
