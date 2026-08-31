import { KerangkaStat, KerangkaKisiKartu } from '@/components/sipantau/kerangka-muat'

export default function Memuat() {
  return (
    <>
      <div className="kh">
        <div>
          <div className="kg kg-baris" style={{ width: 220, height: 22 }} />
          <div className="kg kg-baris" style={{ width: 340, marginTop: 8 }} />
        </div>
      </div>
      <KerangkaStat n={3} />
      <div className="kisi k-2">
        <KerangkaKisiKartu n={2} />
        <KerangkaKisiKartu n={2} />
      </div>
    </>
  )
}
