'use client'

import { useEffect, useState } from 'react'
import { DialogModal } from './dialog-modal'
import { Ikon } from './ikon'

type Foto = { id: string; url: string | null; keterangan: string | null; sumber: string; lat: number | null; lng: number | null; diambil_pada: string | null }

function waktu(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(iso))
}

export function PratinjauFotoLaporan({ foto }: { foto: Foto[] }) {
  const [aktif, setAktif] = useState<number | null>(null)
  const [alamat, setAlamat] = useState<string | null>(null)
  const dipilih = aktif === null ? null : foto[aktif]
  useEffect(() => {
    if (!dipilih || dipilih.lat === null || dipilih.lng === null) { setAlamat(null); return }
    let batal = false
    setAlamat('Mencari alamat…')
    fetch('/api/tempat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aksi: 'balik', lat: dipilih.lat, lng: dipilih.lng }) })
      .then(r => r.json())
      .then(data => { if (!batal) setAlamat(data.alamat || 'Alamat tidak ditemukan') })
      .catch(() => { if (!batal) setAlamat('Alamat tidak tersedia') })
    return () => { batal = true }
  }, [dipilih])
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
          {alamat && <p className="pratinjau-foto-alamat">{alamat}</p>}
          {dipilih.lat !== null && dipilih.lng !== null && <div className="pratinjau-foto-aksi">
            <a className="btn btn-o btn-sm" href={`/peta?lat=${dipilih.lat}&lng=${dipilih.lng}`}>Buka Peta Lapangan</a>
            <a className="btn btn-p btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${dipilih.lat},${dipilih.lng}`} target="_blank" rel="noreferrer">Buka Maps</a>
          </div>}
        </div>
      </div>
    </DialogModal>}
  </>
}
