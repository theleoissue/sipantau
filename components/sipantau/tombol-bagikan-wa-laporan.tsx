'use client'

import { susunTeksWaLaporan } from '@/lib/laporan/teks'
import { Ikon } from './ikon'
import type { LaporanLengkap } from '@/lib/laporan/tipe'

/** Sama seperti tombol-bagikan-wa.tsx (LHP Ringkas) — dibedakan berkas
 *  karena membaca laporan_harian, bukan lhp (0071 menyatukan keduanya
 *  jadi satu jalur pengiriman, tetap dua tipe data di database). */
export function TombolBagikanWaLaporan({ laporan }: { laporan: LaporanLengkap }) {
  async function bagikan() {
    const teks = susunTeksWaLaporan(laporan)
    if (navigator.share) {
      try {
        await navigator.share({ text: teks })
        return
      } catch {
        // Dibatalkan pengguna atau gagal — jatuh ke cadangan di bawah.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank')
  }

  return (
    <button className="btn btn-o btn-sm" onClick={bagikan}>
      <Ikon nama="kirim" /> Bagikan ke WhatsApp
    </button>
  )
}
