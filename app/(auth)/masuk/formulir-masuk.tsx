'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { masuk, type HasilMasuk } from './aksi'
import { Ikon } from '@/components/sipantau/ikon'

function TombolMasuk() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-masuk" disabled={pending}>
      {pending ? 'Menghubungkan…' : 'Masuk'}
      {/* Panah dekoratif saja — tidak ada makna fungsional, disembunyikan
          dari pembaca layar. Disembunyikan juga selagi pending supaya
          tidak bersanding aneh dengan "…". */}
      {!pending && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      )}
    </button>
  )
}

export function FormulirMasuk({ sebabAwal }: { sebabAwal?: string }) {
  const [hasil, aksi] = useActionState<HasilMasuk, FormData>(masuk, {
    galat:
      sebabAwal === 'nonaktif'
        ? 'Akun ini sedang tidak aktif. Hubungi Kanit unit Anda.'
        : undefined,
  })
  const [lihatSandi, setLihatSandi] = useState(false)

  return (
    <form action={aksi}>
      {hasil.galat && (
        <div role="alert" className="galat">
          <Ikon nama="awas" />
          <span>{hasil.galat}</span>
        </div>
      )}

      <div className="fg">
        <label htmlFor="nrp">NRP</label>
        <div className="ic-wrap">
          <Ikon nama="orang" className="ic" />
          <input
            id="nrp"
            name="nrp"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            required
            autoFocus
            placeholder="Masukkan NRP Anda"
            // Isian NRP dipertahankan saat galat; kata sandi selalu
            // dikosongkan (KP-6.1-06).
            defaultValue={hasil.nrp ?? ''}
          />
        </div>
      </div>

      <div className="fg">
        <label htmlFor="sandi">Kata sandi</label>
        <div className="ic-wrap">
          <Ikon nama="gembok" className="ic" />
          <input
            id="sandi"
            name="sandi"
            type={lihatSandi ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Masukkan kata sandi Anda"
            style={{ paddingRight: 78 }}
          />
          <button
            type="button"
            onClick={() => setLihatSandi(v => !v)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'rgba(180,205,235,.8)',
              padding: '4px 6px',
            }}
          >
            {lihatSandi ? 'Sembunyikan' : 'Perlihatkan'}
          </button>
        </div>
      </div>

      <TombolMasuk />

      {/* Tidak ada tautan lupa kata sandi: tidak ada surat elektronik
          sungguhan yang dapat dikirimi (docs/10-modul-6.1 §6.1.5). */}
      <div className="lupa-sandi">
        Lupa kata sandi? Hubungi Kanit unit Anda.
      </div>
    </form>
  )
}
