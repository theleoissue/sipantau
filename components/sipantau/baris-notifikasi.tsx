'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { tandaiSudahDibaca } from '@/app/(app)/pemberitahuan/aksi'
import {
  IKON_JENIS_NOTIFIKASI, RUPA_NOTIFIKASI_BAKU, tujuanRute, labelWaktuNotifikasi,
  type Notifikasi,
} from '@/lib/notifikasi/tipe'
import { Ikon } from './ikon'

/** KP-6.9-09 + KP-6.9-15 sekaligus: membuka pemberitahuan menandainya
 *  sudah dibaca DAN membawa ke layar tujuannya. Bila tujuannya sudah
 *  tidak ada (KP-6.9-16 — SPT/laporan sudah terhapus), baris ini
 *  memang sudah ikut terhapus berantai dan tidak akan pernah muncul
 *  di sini, jadi tidak perlu ditangani sebagai kasus galat. */
export function BarisNotifikasi({ n }: { n: Notifikasi }) {
  const router = useRouter()
  const [, mulai] = useTransition()
  // Jangan pernah membaca langsung tanpa cadangan: jenis datang dari
  // basis data, dan daftarnya sudah pernah dipanjangkan dari migrasi
  // modul lain tanpa berkas ini ikut diperbarui. Lihat keterangan pada
  // RUPA_NOTIFIKASI_BAKU.
  const rupa = IKON_JENIS_NOTIFIKASI[n.jenis] ?? RUPA_NOTIFIKASI_BAKU
  const rute = tujuanRute(n)

  return (
    <div
      className={`pb ${n.dibaca_pada ? '' : 'belum'}`}
      onClick={() => mulai(async () => {
        if (!n.dibaca_pada) await tandaiSudahDibaca(n.id)
        if (rute) router.push(rute)
      })}
    >
      <div className="ic" style={{ background: rupa.bg, color: rupa.warna }}>
        <Ikon nama={rupa.ikon} />
      </div>
      <div className="tx">
        <div className="jd">{n.judul}</div>
        {n.isi && <div className="is">{n.isi}</div>}
        <div className="wk">
          {labelWaktuNotifikasi(n.dibuat_pada)}
          {n.mendesak && <span className="mendesak">Mendesak</span>}
        </div>
      </div>
    </div>
  )
}
