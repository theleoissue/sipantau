'use client'

import { useState } from 'react'
import { resetSandiAksi } from '@/app/(app)/akun/aksi'
import { DialogAksi } from './dialog-aksi'
import { DialogKataSandiBaru } from './dialog-kata-sandi-baru'

export function ResetSandiPersonel({ id, nama, nrp }: { id: string; nama: string; nrp: string }) {
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [kataSandi, setKataSandi] = useState<string | null>(null)

  return <>
    <button type="button" className="btn btn-o btn-sm" onClick={() => setKonfirmasi(true)}>
      Reset sandi
    </button>
    <DialogAksi
      terbuka={konfirmasi}
      judul="Reset kata sandi?"
      keterangan={`Kata sandi sementara ${nama} akan ditampilkan satu kali dan seluruh sesi masuknya akan berakhir.`}
      labelTombol="Reset kata sandi"
      onTutup={() => setKonfirmasi(false)}
      onKonfirmasi={async () => {
        const hasil = await resetSandiAksi(id)
        if (hasil.galat) return { galat: hasil.galat }
        setKataSandi(hasil.kataSandiSementara ?? null)
        return { sukses: 'Kata sandi berhasil direset.' }
      }}
    />
    {kataSandi && <DialogKataSandiBaru nama={nama} nrp={nrp} kataSandi={kataSandi} onTutup={() => setKataSandi(null)} />}
  </>
}
