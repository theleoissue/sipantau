'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { klienBrowser } from '@/lib/supabase/client'
import { unggahSuratSptAksi } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'

/**
 * BR-25/KP-6.2-45: tanpa berkas ini, tutup_spt ditolak basis data
 * (chk_selesai_wajib_berkas, migrasi 0007) — bukan sekadar disarankan.
 * Satu berkas per SPT; mengunggah lagi menggantikan yang sebelumnya
 * (kolom berkas_surat_path menunjuk yang terbaru saja, berkas lama
 * jadi yatim di Storage — dibiarkan, bukan kegagalan fungsional).
 */
export function UnggahSuratSpt({
  penugasanId, sudahAda,
}: { penugasanId: string; sudahAda: boolean }) {
  const berkas = useRef<HTMLInputElement>(null)
  const [mengunggah, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)
  const router = useRouter()

  function unggah(f: File) {
    setGalat(null)
    mulai(async () => {
      const ekstensi = f.name.split('.').pop() || 'pdf'
      const path = `${penugasanId}/${crypto.randomUUID()}.${ekstensi}`

      const supabase = klienBrowser()
      const { error: galatUnggah } = await supabase.storage
        .from('surat-spt')
        .upload(path, f)
      if (galatUnggah) {
        setGalat(`Gagal mengunggah berkas: ${galatUnggah.message}`)
        return
      }

      const hasil = await unggahSuratSptAksi(penugasanId, path)
      if (hasil?.galat) { setGalat(hasil.galat); return }
      router.refresh()
    })
  }

  return (
    <div>
      {galat && (
        <div role="alert" style={{
          background: 'var(--red-bg)', color: 'var(--red)', padding: '8px 12px',
          borderRadius: 'var(--r-sm)', fontSize: 12.5, marginBottom: 10,
        }}>
          {galat}
        </div>
      )}

      <div
        className="jatuh"
        onClick={() => !mengunggah && berkas.current?.click()}
        style={{ opacity: mengunggah ? 0.6 : 1, pointerEvents: mengunggah ? 'none' : undefined }}
      >
        <Ikon nama="berkas" />
        <p>{sudahAda ? 'Ganti berkas surat perintah' : 'Unggah pindaian surat perintah'}</p>
        <small>PDF atau foto pindaian, satu berkas</small>
      </div>
      <input
        ref={berkas} type="file" accept="application/pdf,image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) unggah(f); e.target.value = '' }}
      />

      {mengunggah && <div className="bantu">Mengunggah…</div>}
    </div>
  )
}
