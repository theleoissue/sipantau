'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { susunJadwal, suntingSel } from '@/app/(app)/piket/aksi'
import {
  SIKLUS_KEADAAN, HURUF_KEADAAN, LABEL_KEADAAN, jumlahHari, hurufHari, akhirPekan,
  type KeadaanPiket, type SelJadwal, type UnitRingkas,
} from '@/lib/piket/tipe'
import { Ikon } from './ikon'

/**
 * Tabel jadwal piket — bentuknya mengikuti dokumen resmi: baris unit,
 * kolom tanggal, isinya P / C / LD.
 *
 * Client Component sebab seluruhnya interaksi: menyunting sel, menyusun
 * ulang sebulan, memilih keadaan awal. Datanya sendiri tetap datang
 * dari Server Component (CLAUDE.md §6.1) — di sini tidak ada satu pun
 * pengambilan data.
 */
export function TabelPiket({
  tahun, bulan, unit, sel, bolehSunting, hariIni,
}: {
  tahun: number
  bulan: number
  unit: UnitRingkas[]
  sel: SelJadwal[]
  bolehSunting: boolean
  hariIni: string
}) {
  const router = useRouter()
  const [proses, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)

  const [dialogSel, setDialogSel] = useState<{ unitId: string; tanggal: string } | null>(null)
  const [dialogSusun, setDialogSusun] = useState(false)

  const hari = jumlahHari(tahun, bulan)
  const bln = String(bulan).padStart(2, '0')
  const tgl = (h: number) => `${tahun}-${bln}-${String(h).padStart(2, '0')}`

  // Peta pencarian dibangun sekali per render, bukan disusuri ulang pada
  // tiap sel — tabelnya bisa 4 unit x 31 hari = 124 kotak.
  const peta = useMemo(() => {
    const m = new Map<string, SelJadwal>()
    for (const s of sel) m.set(`${s.unit_id}|${s.tanggal}`, s)
    return m
  }, [sel])

  const kosong = sel.length === 0

  function jalankan(fn: () => Promise<{ galat?: string }>) {
    setGalat(null)
    mulai(async () => {
      const r = await fn()
      if (r.galat) setGalat(r.galat)
      else { setDialogSel(null); setDialogSusun(false); router.refresh() }
    })
  }

  const selAktif = dialogSel ? peta.get(`${dialogSel.unitId}|${dialogSel.tanggal}`) : undefined
  const namaUnitAktif = dialogSel ? unit.find(u => u.id === dialogSel.unitId)?.nama : ''

  return (
    <>
      {galat && <p style={{ color: 'var(--red)', fontSize: 12.5, marginBottom: 10 }}>{galat}</p>}

      {bolehSunting && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <button className="btn btn-p btn-sm" onClick={() => setDialogSusun(true)} disabled={proses}>
            <Ikon nama="tambah" /> {kosong ? 'Susun jadwal bulan ini' : 'Susun ulang'}
          </button>
          {!kosong && (
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              Sel bertanda titik pernah disunting tangan dan tidak akan tertimpa.
            </span>
          )}
        </div>
      )}

      {kosong ? (
        <div className="kosong" style={{ padding: '28px 0' }}>
          <Ikon nama="riwayat" />
          <h3>Jadwal bulan ini belum disusun</h3>
          <p>
            {bolehSunting
              ? 'Tekan Susun jadwal untuk mengisi rotasinya, lalu sesuaikan hari yang perlu.'
              : 'Jadwal akan tampil di sini begitu Kasubdit menyusunnya.'}
          </p>
        </div>
      ) : (
        <div className="tw">
          <table className="piket-tabel">
            <thead>
              <tr>
                <th className="unit">Unit</th>
                {Array.from({ length: hari }, (_, i) => i + 1).map(h => (
                  <th
                    key={h}
                    className={
                      (tgl(h) === hariIni ? 'kini ' : '') +
                      (akhirPekan(tahun, bulan, h) ? 'pekan' : '')
                    }
                  >
                    <span className="tg">{h}</span>
                    <span className="hr">{hurufHari(tahun, bulan, h)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unit.map(u => (
                <tr key={u.id}>
                  <th className="unit">{u.nama}</th>
                  {Array.from({ length: hari }, (_, i) => i + 1).map(h => {
                    const t = tgl(h)
                    const s = peta.get(`${u.id}|${t}`)
                    const kelas = [
                      s ? `k-${s.keadaan}` : 'k-kosong',
                      t === hariIni ? 'kini' : '',
                      akhirPekan(tahun, bulan, h) ? 'pekan' : '',
                    ].filter(Boolean).join(' ')
                    return (
                      <td key={h} className={kelas}>
                        {bolehSunting ? (
                          <button
                            type="button"
                            className="sel"
                            title={`${u.nama} · ${t}${s ? ` · ${LABEL_KEADAAN[s.keadaan]}` : ''}`}
                            onClick={() => setDialogSel({ unitId: u.id, tanggal: t })}
                            disabled={proses}
                          >
                            {s ? HURUF_KEADAAN[s.keadaan] : '·'}
                            {s?.disunting_manual && <i className="tanda" />}
                          </button>
                        ) : (
                          <span className="sel" title={s ? LABEL_KEADAAN[s.keadaan] : ''}>
                            {s ? HURUF_KEADAAN[s.keadaan] : '·'}
                            {s?.disunting_manual && <i className="tanda" />}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="piket-ket">
        {SIKLUS_KEADAAN.map(k => (
          <span key={k}><i className={`kotak k-${k}`} />{HURUF_KEADAAN[k]} — {LABEL_KEADAAN[k]}</span>
        ))}
      </div>

      {/* ---- Dialog menyunting satu sel ---- */}
      {dialogSel && (
        <DialogPiket
          judul="Ubah giliran"
          keterangan={`${namaUnitAktif} · ${dialogSel.tanggal}`}
          proses={proses}
          onTutup={() => setDialogSel(null)}
        >
          <FormSel
            awal={selAktif?.keadaan}
            catatanAwal={selAktif?.catatan ?? ''}
            proses={proses}
            onSimpan={(keadaan, catatan) =>
              jalankan(() => suntingSel(dialogSel.tanggal, dialogSel.unitId, keadaan, catatan))}
          />
        </DialogPiket>
      )}

      {/* ---- Dialog menyusun sebulan ---- */}
      {dialogSusun && (
        <DialogPiket
          judul="Susun jadwal sebulan"
          keterangan="Tentukan keadaan tiap unit pada tanggal 1. Hari berikutnya bergeser sendiri mengikuti siklus Cadangan → Piket → Lepas Dinas."
          proses={proses}
          onTutup={() => setDialogSusun(false)}
        >
          <FormSusun
            unit={unit}
            proses={proses}
            onSimpan={(awal) =>
              jalankan(() => susunJadwal(tahun, bulan, unit.map(u => u.id), awal))}
          />
        </DialogPiket>
      )}
    </>
  )
}

function DialogPiket({
  judul, keterangan, proses, onTutup, children,
}: {
  judul: string; keterangan: string; proses: boolean
  onTutup: () => void; children: React.ReactNode
}) {
  return (
    <div
      role="dialog" aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget && !proses) onTutup() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,17,30,.6)',
        display: 'grid', placeItems: 'center', padding: 20,
      }}
    >
      <div style={{
        background: 'var(--card)', borderRadius: 14, padding: 24,
        maxWidth: 420, width: '100%', boxShadow: 'var(--sh-lg)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>{judul}</h3>
        <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 8 }}>
          {keterangan}
        </p>
        {children}
      </div>
    </div>
  )
}

function FormSel({
  awal, catatanAwal, proses, onSimpan,
}: {
  awal?: KeadaanPiket; catatanAwal: string; proses: boolean
  onSimpan: (k: KeadaanPiket, catatan: string) => void
}) {
  const [keadaan, setKeadaan] = useState<KeadaanPiket>(awal ?? 'piket')
  const [catatan, setCatatan] = useState(catatanAwal)

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {SIKLUS_KEADAAN.map(k => (
          <button
            key={k} type="button"
            className={`btn btn-sm ${keadaan === k ? 'btn-p' : 'btn-o'}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setKeadaan(k)} disabled={proses}
          >
            {LABEL_KEADAAN[k]}
          </button>
        ))}
      </div>

      <label style={{ display: 'block', fontSize: 12.5, marginTop: 14, color: 'var(--ink-2)' }}>
        Alasan penyesuaian <span style={{ color: 'var(--ink-3)' }}>(boleh dikosongkan)</span>
      </label>
      <input
        value={catatan} onChange={e => setCatatan(e.target.value)} disabled={proses}
        placeholder="mis. tukar dengan Unit II"
        style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 8, marginTop: 5 }}
      />

      <button
        className="btn btn-p" disabled={proses}
        style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
        onClick={() => onSimpan(keadaan, catatan)}
      >
        {proses ? 'Menyimpan…' : 'Simpan'}
      </button>
    </div>
  )
}

function FormSusun({
  unit, proses, onSimpan,
}: {
  unit: UnitRingkas[]; proses: boolean
  onSimpan: (awal: KeadaanPiket[]) => void
}) {
  // Bawaannya menyebar berurutan mengikuti siklus, sehingga pada rotasi
  // tiga unit hasilnya langsung sah: tiap hari satu Piket, satu
  // Cadangan, satu Lepas Dinas. Tetap dapat diubah sebelum disimpan.
  const [awal, setAwal] = useState<KeadaanPiket[]>(
    unit.map((_, i) => SIKLUS_KEADAAN[i % SIKLUS_KEADAAN.length]))

  return (
    <div style={{ marginTop: 16 }}>
      {unit.map((u, i) => (
        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{u.nama}</span>
          <select
            value={awal[i]} disabled={proses}
            onChange={e => setAwal(a => a.map((v, j) => j === i ? e.target.value as KeadaanPiket : v))}
            style={{ padding: '7px 10px', fontSize: 12.5, borderRadius: 8 }}
          >
            {SIKLUS_KEADAAN.map(k => <option key={k} value={k}>{LABEL_KEADAAN[k]}</option>)}
          </select>
        </div>
      ))}

      <button
        className="btn btn-p" disabled={proses}
        style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
        onClick={() => onSimpan(awal)}
      >
        {proses ? 'Menyusun…' : 'Susun jadwal'}
      </button>
    </div>
  )
}
