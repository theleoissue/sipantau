'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { putuskanPengajuanSprin } from '@/app/(app)/penugasan/aksi'

export function TindakanPengajuanSprin({ id }: { id: string }) {
  const router = useRouter()
  const [catatan, setCatatan] = useState('')
  const [pesan, setPesan] = useState('')
  const [sibuk, mulai] = useTransition()
  function putuskan(status: 'perlu_perbaikan' | 'disetujui' | 'ditolak') {
    setPesan('')
    mulai(async () => {
      const hasil = await putuskanPengajuanSprin(id, status, catatan)
      setPesan(hasil.sukses ?? hasil.galat ?? '')
      if (hasil.sukses) router.refresh()
    })
  }
  return <div className="tindakan-pengajuan">
    <label className="field"><span>Catatan untuk pengaju</span><textarea value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Wajib diisi bila meminta perbaikan." rows={3} /></label>
    <div className="kh-aksi">
      <button type="button" className="btn btn-o" disabled={sibuk} onClick={() => putuskan('perlu_perbaikan')}>Minta perbaikan</button>
      <button type="button" className="btn btn-d" disabled={sibuk} onClick={() => putuskan('ditolak')}>Tolak</button>
      <button type="button" className="btn btn-g" disabled={sibuk} onClick={() => putuskan('disetujui')}>{sibuk ? 'Menyimpan…' : 'Setujui'}</button>
    </div>
    {pesan && <p className="bantu" role="status">{pesan}</p>}
  </div>
}
