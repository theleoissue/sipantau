import { KerangkaKepala } from '@/components/sipantau/kerangka-muat'

export default function Memuat() {
  return (
    <>
      <KerangkaKepala />
      <div className="laporan-kisi" aria-label="Memuat laporan" aria-busy="true">
        {[0, 1, 2].map(i => (
          <div className="laporan-kartu" key={i} aria-hidden="true">
            <div className="kg kg-baris" style={{ width: '45%' }} />
            <div className="kg" style={{ height: 44, width: '80%' }} />
            <div className="kg" style={{ height: 60 }} />
            <div className="kg" style={{ height: 78 }} />
            <div className="kg" style={{ height: 44, width: '50%', alignSelf: 'flex-end' }} />
          </div>
        ))}
      </div>
    </>
  )
}
