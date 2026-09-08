'use client'

import { DialogModal } from './dialog-modal'

import { useState, useTransition } from 'react'
import { buatAkunAksi, suntingAkunAksi } from '@/app/(app)/akun/aksi'
import { LABEL_PERAN, emailSistemDari, type Peran } from '@/lib/supabase/types'
import { PERAN_DAPAT_DIPILIH, type Akun, type UnitRingkas } from '@/lib/akun/tipe'

const gaya = {
  label: { fontSize: 11.5, fontWeight: 650, color: 'var(--ink-2)', textTransform: 'uppercase' as const, letterSpacing: '.03em', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid var(--line-2)', borderRadius: 8, fontFamily: 'inherit' },
  bidang: { marginBottom: 14 },
}

/**
 * Tambah/Sunting Akun — TIDAK ADA rancangan mockup untuk formulir ini
 * (tombol Tambah/Ubah di prototype cuma toast placeholder). Susunan
 * kolom mengikuti AM-6.6-01 persis: nama, NRP, pangkat, peran, unit
 * (kecuali peran pemeliharaan — di luar jangkauan formulir ini sama
 * sekali, AM-6.6-06).
 *
 * NRP dikunci pada mode sunting: KP-6.6-13 mensyaratkan email sistem
 * autentikasi (auth.users.email) ikut berubah bila NRP berubah, itu di
 * luar jangkauan pembaruan RLS biasa dan tidak ada Fungsi Tepi untuk
 * itu (daftar tertutup, CLAUDE.md §8) — dicatat sebagai celah terbuka,
 * bukan ditebak jalan keluarnya (docs/60-... Bagian 12, butir 4).
 */
export function FormulirAkun({
  akun,
  unitAktif,
  onTutup,
  onBerhasilBuat,
}: {
  /** null berarti mode Tambah; diisi berarti mode Sunting. */
  akun: Akun | null
  unitAktif: UnitRingkas[]
  onTutup: () => void
  onBerhasilBuat: (info: { nama: string; nrp: string; kataSandiSementara: string }) => void
}) {
  const modeSunting = akun !== null
  const [nama, setNama] = useState(akun?.nama ?? '')
  const [nrp, setNrp] = useState(akun?.nrp ?? '')
  const [pangkat, setPangkat] = useState(akun?.pangkat ?? '')
  const [jabatan, setJabatan] = useState(akun?.jabatan ?? '')
  const [peran, setPeran] = useState<Peran>(akun?.peran ?? 'anggota')
  const [unitId, setUnitId] = useState(akun?.unit_id ?? unitAktif[0]?.id ?? '')
  const [galat, setGalat] = useState<string | null>(null)
  const [proses, mulai] = useTransition()

  const siapDikirim = nama.trim() !== '' && nrp.trim() !== '' && pangkat.trim() !== '' && unitId !== ''

  function simpan() {
    setGalat(null)
    mulai(async () => {
      if (modeSunting) {
        const r = await suntingAkunAksi(akun.id, { nama, pangkat, jabatan, peran, unit_id: unitId })
        if (r.galat) setGalat(r.galat)
        else onTutup()
      } else {
        const r = await buatAkunAksi({ nama, nrp, pangkat, peran, unit_id: unitId })
        if (r.galat) setGalat(r.galat)
        else onBerhasilBuat({ nama, nrp, kataSandiSementara: r.kataSandiSementara! })
      }
    })
  }

  return (
    <DialogModal label={modeSunting ? "Sunting akun" : "Tambah akun"} terkunci={proses} onTutup={onTutup}>
      <div style={{
        background: 'var(--card)', borderRadius: 14, padding: 24,
        maxWidth: 440, width: '100%', boxShadow: 'var(--sh-lg)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>
          {modeSunting ? 'Sunting akun' : 'Tambah akun'}
        </h3>

        <div style={{ marginTop: 18 }}>
          <div style={gaya.bidang}>
            <label style={gaya.label}>Nama</label>
            <input style={gaya.input} value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama lengkap" disabled={proses} />
          </div>

          <div style={gaya.bidang}>
            <label style={gaya.label}>NRP</label>
            <input
              style={{ ...gaya.input, ...(modeSunting ? { background: 'var(--bg)', color: 'var(--ink-3)' } : {}) }}
              value={nrp}
              onChange={e => setNrp(e.target.value)}
              placeholder="Nomor Registrasi Pokok"
              disabled={proses || modeSunting}
            />
            {!modeSunting && nrp.trim() !== '' && (
              <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 5 }}>
                Email sistem: {emailSistemDari(nrp)}
              </p>
            )}
            {modeSunting && (
              <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 5 }}>
                NRP tidak dapat diubah lewat formulir ini.
              </p>
            )}
          </div>

          <div style={gaya.bidang}>
            <label style={gaya.label}>Pangkat</label>
            <input style={gaya.input} value={pangkat} onChange={e => setPangkat(e.target.value)} placeholder="mis. BRIPDA" disabled={proses} />
          </div>

          {/* Hanya pada mode sunting: pembuatan akun lewat Fungsi Tepi
              buat-akun yang belum mengenal medan ini (lihat keterangan
              pada IsianSuntingAkun). Diisi tepat sesudah akun jadi. */}
          {modeSunting && (
            <div style={gaya.bidang}>
              <label style={gaya.label}>Jabatan</label>
              <input
                style={gaya.input}
                value={jabatan}
                onChange={e => setJabatan(e.target.value)}
                placeholder="mis. BANIT I SUBDIT IV"
                disabled={proses}
              />
              <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 5 }}>
                Tercetak pada lampiran Surat Perintah. Kosongkan bila belum
                ditetapkan — lampiran akan memakai kedudukan pada SPT.
              </p>
            </div>
          )}

          <div style={gaya.bidang}>
            <label style={gaya.label}>Peran</label>
            <select style={gaya.input} value={peran} onChange={e => setPeran(e.target.value as Peran)} disabled={proses}>
              {PERAN_DAPAT_DIPILIH.map(p => <option key={p} value={p}>{LABEL_PERAN[p]}</option>)}
            </select>
          </div>

          <div style={gaya.bidang}>
            <label style={gaya.label}>Unit</label>
            <select style={gaya.input} value={unitId} onChange={e => setUnitId(e.target.value)} disabled={proses}>
              {unitAktif.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
            </select>
          </div>
        </div>

        {galat && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 4 }}>{galat}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }} disabled={proses} onClick={onTutup}>
            Batal
          </button>
          <button
            className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}
            disabled={proses || !siapDikirim}
            onClick={simpan}
          >
            {proses ? 'Menyimpan…' : modeSunting ? 'Simpan perubahan' : 'Buat akun'}
          </button>
        </div>
      </div>
    </DialogModal>
  )
}
