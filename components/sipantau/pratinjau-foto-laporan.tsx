'use client'

import { useState } from 'react'
import { DialogModal } from './dialog-modal'
import { Ikon } from './ikon'

type Foto = { id: string; url: string | null; keterangan: string | null; sumber: string; lat: number | null; lng: number | null; diambil_pada: string | null }

function waktu(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(iso))
}

export function PratinjauFotoLaporan({ foto }: { foto: Foto[] }) {
  const [aktif, setAktif] = useState<number | null>(null)
  const dipilih = aktif === null ? null : foto[aktif]
  return <>
    <div className="laporan-foto-grid">
      {foto.map((f, i) => {
        const berkoordinat = f.lat !== null && f.lng !== null
        return <button key={f.id} type="button" className="laporan-foto-item" onClick={() => setAktif(i)}>
          <div className="laporan-foto-gambar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {f.url && <img src={f.url} alt={f.keterangan ?? `Dokumentasi ${i + 1}`} />}
            <span className={`laporan-foto-status ${berkoordinat ? 'ada' : ''}`}><Ikon nama="pin" />{berkoordinat ? 'Titik terekam' : 'Tanpa titik'}</span>
          </div>
          <div className="laporan-foto-meta">
            <strong>{f.keterangan || `Dokumentasi ${i + 1}`}</strong>
            <span>{f.diambil_pada ? waktu(f.diambil_pada) : f.sumber === 'kamera' ? 'Waktu pengambilan tidak terekam' : 'Lampiran dari galeri'}</span>
            {berkoordinat ? <small><Ikon nama="pin" />{f.lat!.toFixed(5)}, {f.lng!.toFixed(5)}</small> : <small>Lokasi foto tidak tersedia</small>}
          </div>
        </button>
      })}
    </div>
    {dipilih && <DialogModal label="Pratinjau foto dokumentasi" onTutup={() => setAktif(null)}>
      <div className="pratinjau-foto-laporan">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {dipilih.url && <img src={dipilih.url} alt={dipilih.keterangan ?? 'Foto dokumentasi'} />}
        <div className="pratinjau-foto-info">
          <strong>{dipilih.keterangan || `Dokumentasi ${(aktif ?? 0) + 1}`}</strong>
          <span>{dipilih.diambil_pada ? waktu(dipilih.diambil_pada) : dipilih.sumber === 'kamera' ? 'Waktu pengambilan tidak terekam' : 'Lampiran dari galeri'}</span>
          {dipilih.lat !== null && dipilih.lng !== null ? <small><Ikon nama="pin" />{dipilih.lat.toFixed(5)}, {dipilih.lng.toFixed(5)}</small> : <small>Lokasi foto tidak tersedia</small>}
        </div>
      </div>
    </DialogModal>}
  </>
}
