'use client'

import { useMemo, useState, useTransition } from 'react'
import { LABEL_PERAN } from '@/lib/supabase/types'
import { statusSinyal, labelTerakhirTerlihat } from '@/lib/gps/tipe'
import type { Akun, UnitRingkas } from '@/lib/akun/tipe'
import { nonaktifkanAkunAksi, aktifkanKembaliAksi, resetSandiAksi } from '@/app/(app)/akun/aksi'
import { DialogAksi } from './dialog-aksi'
import { DialogKataSandiBaru } from './dialog-kata-sandi-baru'
import { FormulirAkun } from './formulir-akun'
import { Ikon } from './ikon'

function waktuMasuk(iso: string | null): string {
  if (!iso) return 'Belum pernah masuk'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

const LENCANA_PERAN: Record<string, string> = {
  kasubdit: 'bermasalah', admin: 'bermasalah', kanit: 'berjalan', panit: 'baru', anggota: 'selesai',
}

type DialogAktif = { jenis: 'nonaktif' | 'reset_sandi'; akun: Akun } | null

export function TabelAkun({ daftar, unitAktif }: { daftar: Akun[]; unitAktif: UnitRingkas[] }) {
  const [cari, setCari] = useState('')
  const [formulir, setFormulir] = useState<'tambah' | Akun | null>(null)
  const [dialog, setDialog] = useState<DialogAktif>(null)
  const [kataSandiBaru, setKataSandiBaru] = useState<{ nama: string; nrp: string; kataSandi: string } | null>(null)
  const [, mulaiAktifkan] = useTransition()
  const [galatBaris, setGalatBaris] = useState<string | null>(null)

  const tersaring = useMemo(() => {
    const q = cari.trim().toLowerCase()
    if (!q) return daftar
    return daftar.filter(a => a.nama.toLowerCase().includes(q) || a.nrp.includes(q))
  }, [cari, daftar])

  const kelompok = useMemo(() => {
    const peta = new Map<string, Akun[]>()
    for (const a of tersaring) {
      const grup = peta.get(a.unit_nama) ?? []
      grup.push(a)
      peta.set(a.unit_nama, grup)
    }
    return [...peta.entries()].sort(([a], [b]) => a.localeCompare(b, 'id'))
  }, [tersaring])

  return (
    <>
      <section className="kartu">
        <div className="kartu-h">
          <h3>Daftar akun</h3>
          <span className="isyarat">{daftar.length} akun</span>
        </div>
        <div className="kartu-b" style={{ paddingBottom: 0 }}>
          <form className="cari" onSubmit={e => e.preventDefault()} style={{ marginBottom: 14 }}>
            <Ikon nama="cari" />
            <input
              type="search" value={cari} onChange={e => setCari(e.target.value)}
              placeholder="Cari nama atau NRP" aria-label="Cari akun"
            />
          </form>
        </div>

        {galatBaris && (
          <div className="kartu-b" style={{ paddingTop: 0 }}>
            <p style={{ fontSize: 12.5, color: 'var(--red)' }}>{galatBaris}</p>
          </div>
        )}

        <div className="kartu-b rata tw" style={{ paddingTop: 0 }}>
          {kelompok.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="orang" />
              <h3>Tidak ada akun yang cocok</h3>
            </div>
          ) : (
            kelompok.map(([namaUnit, baris]) => (
              <div key={namaUnit} style={{ marginBottom: 8 }}>
                <div style={{
                  padding: '10px 4px', fontSize: 12.5, fontWeight: 700,
                  color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.03em',
                  borderBottom: '1px solid var(--line-2)',
                }}>
                  {namaUnit}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th><th>NRP</th><th>Peran</th><th>Kehadiran</th><th>Status</th><th>Terakhir masuk</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {baris.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="sel-utama">{a.nama}</div>
                          {a.pangkat && <div className="sel-sub">{a.pangkat}</div>}
                        </td>
                        <td style={{ color: 'var(--ink-2)' }}>{a.nrp}</td>
                        <td><span className={`lc ${LENCANA_PERAN[a.peran] ?? 'selesai'}`}>{LABEL_PERAN[a.peran]}</span></td>
                        <td>
                          {a.terlihat_pada ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                              <span className={`th ${statusSinyal(a.terlihat_pada)}`} />
                              {labelTerakhirTerlihat(a.terlihat_pada)}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Belum pernah terlihat</span>
                          )}
                        </td>
                        <td>
                          <span className={`lc ${a.aktif ? 'selesai' : 'dibatalkan'}`}>{a.aktif ? 'Aktif' : 'Nonaktif'}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-2)' }}>{waktuMasuk(a.terakhir_masuk)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn btn-o btn-sm" onClick={() => setFormulir(a)}>Ubah</button>
                          <button
                            className="btn btn-o btn-sm" style={{ marginLeft: 6 }}
                            onClick={() => setDialog({ jenis: 'reset_sandi', akun: a })}
                          >
                            Reset sandi
                          </button>
                          {a.aktif ? (
                            <button
                              className="btn btn-o btn-sm" style={{ color: 'var(--red)', borderColor: '#FCA5A5', marginLeft: 6 }}
                              onClick={() => setDialog({ jenis: 'nonaktif', akun: a })}
                            >
                              Nonaktifkan
                            </button>
                          ) : (
                            <button
                              className="btn btn-o btn-sm" style={{ marginLeft: 6 }}
                              onClick={() => mulaiAktifkan(async () => {
                                setGalatBaris(null)
                                const r = await aktifkanKembaliAksi(a.id)
                                if (r.galat) setGalatBaris(r.galat)
                              })}
                            >
                              Aktifkan kembali
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </section>

      <div style={{ marginTop: 14 }}>
        <button className="btn btn-g" onClick={() => setFormulir('tambah')}>
          <Ikon nama="tambah" />Tambah akun
        </button>
      </div>

      {formulir && (
        <FormulirAkun
          akun={formulir === 'tambah' ? null : formulir}
          unitAktif={unitAktif}
          onTutup={() => setFormulir(null)}
          onBerhasilBuat={info => {
            setFormulir(null)
            setKataSandiBaru({ nama: info.nama, nrp: info.nrp, kataSandi: info.kataSandiSementara })
          }}
        />
      )}

      {kataSandiBaru && (
        <DialogKataSandiBaru
          nama={kataSandiBaru.nama} nrp={kataSandiBaru.nrp} kataSandi={kataSandiBaru.kataSandi}
          onTutup={() => setKataSandiBaru(null)}
        />
      )}

      <DialogAksi
        terbuka={dialog?.jenis === 'nonaktif'}
        judul="Nonaktifkan akun ini?"
        keterangan={`${dialog?.akun.nama ?? ''} tidak akan bisa masuk lagi. Sesi tugas yang sedang berjalan ditutup. Riwayat laporan tetap tersimpan.`}
        labelTombol="Nonaktifkan"
        berbahaya
        onTutup={() => setDialog(null)}
        onKonfirmasi={async () => {
          const r = await nonaktifkanAkunAksi(dialog!.akun.id)
          return r.galat ? { galat: r.galat } : { sukses: r.sukses }
        }}
      />

      <DialogAksi
        terbuka={dialog?.jenis === 'reset_sandi'}
        judul="Reset kata sandi?"
        keterangan={`Kata sandi baru ${dialog?.akun.nama ?? ''} ditampilkan satu kali dan tidak dapat dilihat kembali. Seluruh sesi masuknya akan berakhir.`}
        labelTombol="Reset kata sandi"
        onTutup={() => setDialog(null)}
        onKonfirmasi={async () => {
          const akun = dialog!.akun
          const r = await resetSandiAksi(akun.id)
          if (r.galat) return { galat: r.galat }
          setKataSandiBaru({ nama: akun.nama, nrp: akun.nrp, kataSandi: r.kataSandiSementara! })
          return { sukses: 'ok' }
        }}
      />
    </>
  )
}
