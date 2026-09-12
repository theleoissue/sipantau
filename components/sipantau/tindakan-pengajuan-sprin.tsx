'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { putuskanPengajuanSprin } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'

export function TindakanPengajuanSprin({ id }: { id: string }) {
  const router = useRouter()
  const [catatan, setCatatan] = useState('')
  const [pesan, setPesan] = useState('')
  const [sibuk, mulai] = useTransition()
  function putuskan(status: 'perlu_perbaikan' | 'disetujui' | 'ditolak') {
    setPesan('')
    if (status === 'perlu_perbaikan' && !catatan.trim()) {
      setPesan('Tulis bagian yang harus diperbaiki terlebih dahulu.')
      return
    }
    mulai(async () => {
      const hasil = await putuskanPengajuanSprin(id, status, catatan)
      setPesan(hasil.sukses ?? hasil.galat ?? '')
      if (hasil.sukses) router.refresh()
    })
  }
  return <footer className="ajuan-tindakan">
    <label><span>Catatan untuk pengaju <small>Wajib jika meminta perbaikan</small></span>
      <textarea value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Contoh: mohon perjelas sasaran dan unggah halaman kedua SPRIN." rows={2} />
    </label>
    <div className="ajuan-tombol">
      <button type="button" className="btn btn-o" disabled={sibuk} onClick={() => putuskan('perlu_perbaikan')}><Ikon nama="sunting" /> Minta perbaikan</button>
      <button type="button" className="btn btn-d" disabled={sibuk} onClick={() => putuskan('ditolak')}><Ikon nama="silang" /> Tolak</button>
      <button type="button" className="btn btn-g" disabled={sibuk} onClick={() => putuskan('disetujui')}><Ikon nama="centang" /> {sibuk ? 'Menyimpan…' : 'Setujui'}</button>
    </div>
    {pesan && <p className="ajuan-pesan" role="status" aria-live="polite">{pesan}</p>}
  </footer>
}
