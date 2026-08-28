'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { gantiSandi, type HasilGanti } from './aksi'

function Tombol() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn-masuk" disabled={pending}>
      {pending ? 'Menyimpan…' : 'Simpan kata sandi baru'}
    </button>
  )
}

export function FormulirGantiSandi() {
  const [hasil, aksi] = useActionState<HasilGanti, FormData>(gantiSandi, {})

  return (
    <form action={aksi}>
      {hasil.galat && (
        <div
          role="alert"
          style={{
            background: 'var(--red-bg)', color: 'var(--red)',
            padding: '10px 12px', borderRadius: 'var(--r-sm)',
            fontSize: 12.5, lineHeight: 1.5, marginBottom: 16,
          }}
        >
          {hasil.galat}
        </div>
      )}

      <div className="fg">
        <label htmlFor="baru">Kata sandi baru</label>
        <input id="baru" name="baru" type="password"
               autoComplete="new-password" required minLength={8} autoFocus />
      </div>

      <div className="fg">
        <label htmlFor="ulang">Ulangi kata sandi baru</label>
        <input id="ulang" name="ulang" type="password"
               autoComplete="new-password" required minLength={8} />
      </div>

      <div style={{
        fontSize: 11.5, color: 'var(--ink-3)',
        lineHeight: 1.5, marginBottom: 16,
      }}>
        Sekurang-kurangnya delapan karakter. Tidak ada syarat huruf besar,
        angka, maupun lambang.
      </div>

      <Tombol />
    </form>
  )
}
