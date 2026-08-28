'use client'

import { Ikon } from '@/components/sipantau/ikon'

export function TombolCetak() {
  return (
    <button className="btn btn-p" onClick={() => window.print()}>
      <Ikon nama="cetak" />
      Cetak Surat
    </button>
  )
}
