'use client'

import { useTransition } from 'react'
import { tandaiSemuaSudahDibaca } from '@/app/(app)/pemberitahuan/aksi'
import { Ikon } from './ikon'

export function TombolTandaiSemua() {
  const [proses, mulai] = useTransition()

  return (
    <button
      className="btn btn-o"
      disabled={proses}
      onClick={() => mulai(async () => { await tandaiSemuaSudahDibaca() })}
    >
      <Ikon nama="centang" />
      {proses ? 'Menandai…' : 'Tandai semua sudah dibaca'}
    </button>
  )
}
