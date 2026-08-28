'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { masuk, type HasilMasuk } from './aksi'

function TombolMasuk() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-masuk" disabled={pending}>
      {pending ? 'Menghubungkan…' : 'Masuk'}
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
        <div
          role="alert"
          style={{
            background: 'var(--red-bg)',
            color: 'var(--red)',
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            fontSize: 12.5,
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          {hasil.galat}
        </div>
      )}

      <div className="fg">
        <label htmlFor="nrp">NRP</label>
        <input
          id="nrp"
          name="nrp"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          required
          autoFocus
          // Isian NRP dipertahankan saat galat; kata sandi selalu
          // dikosongkan (KP-6.1-06).
          defaultValue={hasil.nrp ?? ''}
        />
      </div>

      <div className="fg">
        <label htmlFor="sandi">Kata sandi</label>
        <div style={{ position: 'relative' }}>
          <input
            id="sandi"
            name="sandi"
            type={lihatSandi ? 'text' : 'password'}
            autoComplete="current-password"
            required
            style={{ paddingRight: 74 }}
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
              color: 'var(--ink-2)',
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
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-3)',
          textAlign: 'center',
          marginTop: 14,
          lineHeight: 1.5,
        }}
      >
        Lupa kata sandi? Hubungi Kanit unit Anda.
      </div>
    </form>
  )
}
