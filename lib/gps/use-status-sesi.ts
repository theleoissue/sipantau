'use client'

import { useEffect, useState } from 'react'
import { klienBrowser } from '@/lib/supabase/client'

/** Pembacaan kecil di klien: tidak menghambat pemuatan halaman atau meminta GPS. */
export function useStatusSesi(penggunaId: string, aktif: boolean) {
  const [berjalan, setBerjalan] = useState(false)
  useEffect(() => {
    if (!aktif) return
    const db = klienBrowser()
    let dibuang = false
    let urutan = 0
    const baca = async () => {
      const permintaan = ++urutan
      try {
        const { data, error } = await db.from('sesi_tugas').select('id')
          .eq('pengguna_id', penggunaId).is('ditutup_pada', null).limit(1)
        if (!dibuang && permintaan === urutan) setBerjalan(!error && !!data?.length)
      } catch { if (!dibuang && permintaan === urutan) setBerjalan(false) }
    }
    const segarkan = () => { if (!document.hidden) void baca() }
    void baca()
    const kanal = db.channel(`navigasi-sesi-${penggunaId}`).on('postgres_changes', {
      event: '*', schema: 'public', table: 'sesi_tugas', filter: `pengguna_id=eq.${penggunaId}`,
    }, payload => {
      // Perubahan jumlah titik tiap beberapa detik tidak mengubah status sesi.
      if (payload.eventType !== 'UPDATE' || payload.new.ditutup_pada) segarkan()
    }).subscribe()
    const timer = window.setInterval(segarkan, 60_000)
    window.addEventListener('sipantau:sesi-berubah', segarkan)
    document.addEventListener('visibilitychange', segarkan)
    return () => {
      dibuang = true
      window.clearInterval(timer)
      window.removeEventListener('sipantau:sesi-berubah', segarkan)
      document.removeEventListener('visibilitychange', segarkan)
      void db.removeChannel(kanal)
    }
  }, [penggunaId, aktif])
  return berjalan
}
