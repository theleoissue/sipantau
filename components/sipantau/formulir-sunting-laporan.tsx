'use client'

import { useState, useTransition } from 'react'
import { suntingLaporan } from '@/app/(app)/laporan/aksi'
import { LABEL_POSISI_PENGIRIM, LABEL_TUJUAN_LAPORAN, type PosisiPengirim, type TujuanLaporan } from '@/lib/laporan/tipe'

export function FormulirSuntingLaporan({
  laporanId, uraianAwal, kendalaAwal, statusAwal,
  kesimpulanAwal, rencanaTindakLanjutAwal, posisiPengirimAwal, tujuanSuratAwal,
}: {
  laporanId: string
  uraianAwal: string
  kendalaAwal: string
  statusAwal: string
  kesimpulanAwal: string
  rencanaTindakLanjutAwal: string
  posisiPengirimAwal: PosisiPengirim
  tujuanSuratAwal: TujuanLaporan
}) {
  const [sunting, setSunting] = useState(false)
  const [uraian, setUraian] = useState(uraianAwal)
  const [kendala, setKendala] = useState(kendalaAwal)
  const [status, setStatus] = useState(statusAwal)
  const [kesimpulan, setKesimpulan] = useState(kesimpulanAwal)
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState(rencanaTindakLanjutAwal)
  const [posisiPengirim, setPosisiPengirim] = useState<PosisiPengirim>(posisiPengirimAwal)
  const [tujuanSurat, setTujuanSurat] = useState<TujuanLaporan>(tujuanSuratAwal)
  const [galat, setGalat] = useState<string | null>(null)
  const [proses, mulai] = useTransition()

  if (!sunting) {
    return (
      <button type="button" className="btn btn-o btn-sm" onClick={() => setSunting(true)}>
        Sunting
      </button>
    )
  }

  function simpan() {
    setGalat(null)
    mulai(async () => {
      const hasil = await suntingLaporan(laporanId, uraian, kendala, status, kesimpulan, rencanaTindakLanjut, posisiPengirim, tujuanSurat)
      if (hasil?.galat) setGalat(hasil.galat)
      else setSunting(false)
    })
  }

  return (
    <div className="kartu" style={{ marginBottom: 18 }}>
      <div className="kartu-h"><h3>Sunting laporan</h3></div>
      <div className="kartu-b">
        {galat && (
          <div role="alert" style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 12.5, marginBottom: 12 }}>
            {galat}
          </div>
        )}
        <div className="f2">
          <div className="fg">
            <label>Status kegiatan</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="berjalan">Berjalan</option>
              <option value="selesai">Selesai</option>
              <option value="bermasalah">Bermasalah</option>
            </select>
          </div>
          <div className="fg" />
        </div>
        <div className="fg">
          <label>Hasil yang Dicapai</label>
          <textarea value={uraian} onChange={e => setUraian(e.target.value)} />
        </div>
        <div className="fg">
          <label>Kendala</label>
          <textarea value={kendala} onChange={e => setKendala(e.target.value)} style={{ minHeight: 76 }} />
        </div>
        <div className="fg">
          <label>Kesimpulan</label>
          <textarea value={kesimpulan} onChange={e => setKesimpulan(e.target.value)} style={{ minHeight: 76 }} placeholder="Boleh kosong bila belum ada kesimpulan." />
        </div>
        <div className="fg">
          <label>Rencana Tindak Lanjut</label>
          <textarea value={rencanaTindakLanjut} onChange={e => setRencanaTindakLanjut(e.target.value)} style={{ minHeight: 76 }} placeholder="Boleh kosong." />
        </div>
        <div className="f2">
          <div className="fg">
            <label>Dari</label>
            <select value={posisiPengirim} onChange={e => setPosisiPengirim(e.target.value as PosisiPengirim)}>
              {Object.entries(LABEL_POSISI_PENGIRIM).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Kepada</label>
            <select value={tujuanSurat} onChange={e => setTujuanSurat(e.target.value as TujuanLaporan)}>
              {Object.entries(LABEL_TUJUAN_LAPORAN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-o" onClick={() => setSunting(false)} disabled={proses}>
            Batal
          </button>
          <button type="button" className="btn btn-p" onClick={simpan} disabled={proses}>
            {proses ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
