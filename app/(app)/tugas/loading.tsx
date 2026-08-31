import { KerangkaKepala } from '@/components/sipantau/kerangka-muat'

export default function Memuat() {
  return (
    <>
      <KerangkaKepala />
      <div className="kartu">
        <div className="kartu-b">
          <div className="kg kg-baris" style={{ width: '60%' }} />
          <div className="kg kg-baris" style={{ width: '90%' }} />
          <div className="kg kg-baris" style={{ width: '100%', height: 40, marginTop: 14 }} />
        </div>
      </div>
    </>
  )
}
