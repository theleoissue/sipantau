'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ajukanScanSprin, ajukanSprinTurun, kirimUlangScanSprin, type DataScanSprin } from '@/app/(app)/penugasan/aksi'
import { ScanSprin } from './scan-sprin'

/**
 * Layar scan, dalam tiga keadaan:
 *
 *  - scan biasa  : Panit/Anggota mengajukan SPRIN yang sudah ada ke Kanit.
 *  - perbaikan   : pengaju mengganti hasil scan yang dikembalikan Kanit.
 *  - SPRIN turun : SPRIN yang sudah ditandatangani pimpinan untuk usulan
 *                  yang sebelumnya disetujui Kanit (migrasi 0067), dipindai
 *                  pengusul atau Kanit dan tertaut ke usulan asalnya.
 *
 * Penugasan belum dibuat pada tahap ini.
 */
export function AjukanScanSprin({ perbaikan, usulan }: {
  perbaikan?: { id: string; catatan: string | null }
  usulan?: { id: string; judul: string }
}) {
  const router = useRouter()
  const [pesan, setPesan] = useState('')
  const [menyimpan, mulai] = useTransition()

  function kirim(data: DataScanSprin) {
    setPesan('')
    mulai(async () => {
      const hasil = usulan
        ? await ajukanSprinTurun(usulan.id, data)
        : perbaikan ? await kirimUlangScanSprin(perbaikan.id, data) : await ajukanScanSprin(data)
      setPesan(hasil.sukses ?? hasil.galat ?? 'Pengajuan belum dapat diproses.')
      // Hanya bila basis data sudah menyatakan disetujui — pindaian Kanit.
      if (hasil.lanjut) router.push(hasil.lanjut)
    })
  }

  const judul = usulan
    ? 'Pindai SPRIN yang sudah turun'
    : perbaikan ? 'Perbaiki hasil scan untuk Kanit' : 'Ajukan hasil scan ke Kanit'
  const keterangan = usulan
    ? `Untuk usulan "${usulan.judul || 'tanpa judul'}". Foto atau unggah seluruh halaman SPRIN yang sudah ditandatangani pimpinan. Hasilnya tertaut ke usulan asalnya.`
    : 'Foto atau unggah seluruh halaman SPRIN. Sistem membaca dokumen, lalu Kanit memeriksa hasilnya sebelum menjadi penugasan aktif.'
  const pesanSukses = usulan
    ? 'SPRIN sedang disimpan dan ditautkan ke usulan.'
    : perbaikan ? 'Hasil scan perbaikan sedang dikirim ulang ke Kanit.' : 'Hasil scan sedang dikirim ke Kanit untuk ditinjau.'

  return <>
    <div className="kartu" style={{ marginBottom: 16 }}>
      <h3>{judul}</h3>
      <p className="sub">{keterangan}</p>
      {perbaikan?.catatan && <p className="bantu"><b>Catatan Kanit:</b> {perbaikan.catatan}</p>}
    </div>
    <ScanSprin onHasil={kirim} pesanSukses={pesanSukses} />
    {menyimpan && <p className="bantu" role="status">Menyimpan pengajuan…</p>}
    {pesan && <p className="bantu" role="status">{pesan}</p>}
  </>
}
