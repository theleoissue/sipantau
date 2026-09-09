'use client'

import { useState, useTransition } from 'react'
import { ajukanScanSprin, kirimUlangScanSprin, type DataScanSprin } from '@/app/(app)/penugasan/aksi'
import { ScanSprin } from './scan-sprin'

/** Layar scan untuk Panit/Anggota. Penugasan belum dibuat pada tahap ini. */
export function AjukanScanSprin({ perbaikan }: { perbaikan?: { id: string; catatan: string | null } }) {
  const [pesan, setPesan] = useState('')
  const [menyimpan, mulai] = useTransition()

  function kirim(data: DataScanSprin) {
    setPesan('')
    mulai(async () => {
      const hasil = perbaikan ? await kirimUlangScanSprin(perbaikan.id, data) : await ajukanScanSprin(data)
      setPesan(hasil.sukses ?? hasil.galat ?? 'Pengajuan belum dapat diproses.')
    })
  }

  return <>
    <div className="kartu" style={{ marginBottom: 16 }}>
      <h3>{perbaikan ? 'Perbaiki hasil scan untuk Kanit' : 'Ajukan hasil scan ke Kanit'}</h3>
      <p className="sub">Foto atau unggah seluruh halaman SPRIN. Sistem membaca dokumen, lalu Kanit memeriksa hasilnya sebelum menjadi penugasan aktif.</p>
      {perbaikan?.catatan && <p className="bantu"><b>Catatan Kanit:</b> {perbaikan.catatan}</p>}
    </div>
    <ScanSprin onHasil={kirim} pesanSukses={perbaikan ? 'Hasil scan perbaikan sedang dikirim ulang ke Kanit.' : 'Hasil scan sedang dikirim ke Kanit untuk ditinjau.'} />
    {menyimpan && <p className="bantu" role="status">Menyimpan pengajuan…</p>}
    {pesan && <p className="bantu" role="status">{pesan}</p>}
  </>
}
