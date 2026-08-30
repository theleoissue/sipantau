'use client'

import { susunTeksWa } from '@/lib/lhp/teks'
import { Ikon } from './ikon'
import type { LhpLengkap } from '@/lib/lhp/tipe'

/**
 * Menyusun LHP jadi teks gaya "Laporan Perkembangan" (format WA) dan
 * membukanya lewat berbagi bawaan perangkat — bukan integrasi WhatsApp
 * Business API (tidak perlu nomor terdaftar/persetujuan templat).
 *
 * navigator.share() dipakai lebih dulu (menu bagikan asli Android/iOS,
 * WhatsApp salah satu pilihannya); wa.me jadi cadangan di peramban yang
 * tidak mendukungnya. Teks tetap dapat disunting pengguna sebelum
 * dikirim — tombol ini hanya menyiapkan, bukan mengirim otomatis.
 */
export function TombolBagikanWa({ lhp }: { lhp: LhpLengkap }) {
  async function bagikan() {
    const teks = susunTeksWa(lhp)
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
