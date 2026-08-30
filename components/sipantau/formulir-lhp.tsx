'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  simpanIsiLhp, finalkanLhpAksi,
  tambahPetugas, hapusPetugas,
  tambahPihak, hapusPihak,
  tambahSaksi, hapusSaksi,
  tambahBarangBukti, hapusBarangBukti,
} from '@/app/(app)/lhp/aksi'
import { DialogAksi } from './dialog-aksi'
import { Ikon } from './ikon'
import type { LhpLengkap } from '@/lib/lhp/tipe'
import type { Personel } from '@/lib/personel/kueri'

const gaya = {
  label: { fontSize: 11.5, fontWeight: 650, color: 'var(--ink-2)', textTransform: 'uppercase' as const, letterSpacing: '.03em', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid var(--line-2)', borderRadius: 8, fontFamily: 'inherit' },
  baca: { fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' as const },
}

function Bagian({ nomor, judul, children }: { nomor: string; judul: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
        {nomor}. {judul.toUpperCase()}
      </div>
      {children}
    </div>
  )
}

/**
 * Formulir LHP Ringkas — satu-satunya halaman yang belum punya acuan
 * mockup (Modul 6.8 "belum digali", lihat catatan di ikon.tsx). Urutan
 * bagian mengikuti kerangka LHP yang ditunjukkan pemilik produk (format
 * "Laporan Perkembangan" bergaya WA): Dasar, Waktu, Tempat, Perkara,
 * Petugas, Pasal, Pihak, Kronologis, Barang Bukti, Langkah, Rencana
 * Tindak Lanjut, Kesimpulan, Catatan.
 *
 * bolehSunting sudah diputuskan pemanggil (akuPenyusun && status==='draf')
 * — di sini murni menentukan tampilan input vs teks baca (BR-11).
 */
export function FormulirLhp({
  lhp,
  bolehSunting,
  personelUnit,
}: {
  lhp: LhpLengkap
  bolehSunting: boolean
  personelUnit: Personel[]
}) {
  const router = useRouter()
  const [isi, setIsi] = useState({
    dasar: lhp.dasar ?? '',
    waktu_kegiatan: lhp.waktu_kegiatan ?? '',
    tempat_kegiatan: lhp.tempat_kegiatan ?? '',
    perkara: lhp.perkara ?? '',
    dasar_hukum: lhp.dasar_hukum ?? '',
    kronologis: lhp.kronologis ?? '',
    langkah: lhp.langkah ?? '',
    rencana_tindak_lanjut: lhp.rencana_tindak_lanjut ?? '',
    kesimpulan: lhp.kesimpulan ?? '',
    catatan: lhp.catatan ?? '',
  })
  const [, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)
  const [tersimpan, setTersimpan] = useState(false)
  const [dialogFinal, setDialogFinal] = useState(false)

  const [petugasBaru, setPetugasBaru] = useState('')
  const [peranPihakBaru, setPeranPihakBaru] = useState<'pelapor' | 'terlapor'>('terlapor')
  const [namaPihakBaru, setNamaPihakBaru] = useState('')
  const [nomorPengenalBaru, setNomorPengenalBaru] = useState('')
  const [namaSaksiBaru, setNamaSaksiBaru] = useState('')
  const [kedudukanSaksiBaru, setKedudukanSaksiBaru] = useState('')
  const [uraianBuktiBaru, setUraianBuktiBaru] = useState('')

  const idPetugasAda = new Set(lhp.lhp_petugas.map(p => p.petugas_id))
  const calonPetugas = personelUnit.filter(p => p.aktif && p.peran !== 'pemeliharaan' && !idPetugasAda.has(p.id))

  function ubah<K extends keyof typeof isi>(k: K, v: string) {
    setIsi(s => ({ ...s, [k]: v }))
    setTersimpan(false)
  }

  function simpan() {
    setGalat(null)
    mulai(async () => {
      const r = await simpanIsiLhp(lhp.id, isi)
      if (r.galat) setGalat(r.galat)
      else { setTersimpan(true); router.refresh() }
    })
  }

  const teksatau = (v: string) => v || <span style={{ color: 'var(--ink-3)' }}>Belum diisi</span>

  return (
    <div>
      {bolehSunting && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          marginBottom: 18, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8,
        }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
            {tersimpan ? 'Tersimpan.' : 'Draf — simpan perubahan sebelum berpindah halaman.'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-o btn-sm" onClick={simpan}>Simpan</button>
            <button className="btn btn-p btn-sm" onClick={() => setDialogFinal(true)}>
              <Ikon nama="kunci_buka" /> Finalkan
            </button>
          </div>
        </div>
      )}
      {galat && <p style={{ color: 'var(--red)', fontSize: 12.5, marginBottom: 14 }}>{galat}</p>}

      <Bagian nomor="I" judul="Dasar">
        {bolehSunting
          ? <input style={gaya.input} value={isi.dasar} onChange={e => ubah('dasar', e.target.value)} placeholder="Nomor SPT / dasar penugasan" />
          : <p style={gaya.baca}>{teksatau(lhp.dasar ?? '')}</p>}
      </Bagian>

      <Bagian nomor="II" judul="Waktu">
        {bolehSunting
          ? <input style={gaya.input} value={isi.waktu_kegiatan} onChange={e => ubah('waktu_kegiatan', e.target.value)} placeholder="Hari, tanggal, pukul kegiatan" />
          : <p style={gaya.baca}>{teksatau(lhp.waktu_kegiatan ?? '')}</p>}
      </Bagian>

      <Bagian nomor="III" judul="Tempat / TKP">
        {bolehSunting
          ? <input style={gaya.input} value={isi.tempat_kegiatan} onChange={e => ubah('tempat_kegiatan', e.target.value)} placeholder="Lokasi kegiatan" />
          : <p style={gaya.baca}>{teksatau(lhp.tempat_kegiatan ?? '')}</p>}
      </Bagian>

      <Bagian nomor="IV" judul="Perkara">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={2} value={isi.perkara} onChange={e => ubah('perkara', e.target.value)} placeholder="Uraian singkat perkara" />
          : <p style={gaya.baca}>{teksatau(lhp.perkara ?? '')}</p>}
      </Bagian>

      <Bagian nomor="V" judul="Petugas">
        {bolehSunting && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <select
              value={petugasBaru} onChange={e => setPetugasBaru(e.target.value)}
              style={{ flex: 1, minWidth: 160, padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }}
            >
              <option value="">Tambah petugas…</option>
              {calonPetugas.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            <button
              className="btn btn-o btn-sm" disabled={!petugasBaru}
              onClick={() => mulai(async () => {
                const r = await tambahPetugas(lhp.id, petugasBaru)
                if (r.galat) setGalat(r.galat); else { setPetugasBaru(''); router.refresh() }
              })}
            >
              <Ikon nama="tambah" /> Tambah
            </button>
          </div>
        )}
        {lhp.lhp_petugas.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Belum ada petugas.</p>
        ) : (
          <ol style={{ marginLeft: 18 }}>
            {lhp.lhp_petugas.sort((a, b) => a.urutan - b.urutan).map(p => (
              <li key={p.id} style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>
                  {p.users?.nama ?? '—'}{p.users?.pangkat ? `, ${p.users.pangkat}` : ''}
                  {p.users?.nrp ? ` (NRP ${p.users.nrp})` : ''}
                </span>
                {bolehSunting && (
                  <button className="btn btn-o btn-sm" style={{ color: 'var(--red)' }}
                    onClick={() => mulai(async () => { await hapusPetugas(p.id, lhp.id); router.refresh() })}>
                    <Ikon nama="silang" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </Bagian>

      <Bagian nomor="VI" judul="Pasal / Undang-Undang">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={2} value={isi.dasar_hukum} onChange={e => ubah('dasar_hukum', e.target.value)} placeholder="Pasal atau undang-undang yang disangkakan" />
          : <p style={gaya.baca}>{teksatau(lhp.dasar_hukum ?? '')}</p>}
      </Bagian>

      <Bagian nomor="VII" judul="Pelapor dan Terlapor">
        {bolehSunting && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <select value={peranPihakBaru} onChange={e => setPeranPihakBaru(e.target.value as 'pelapor' | 'terlapor')}
              style={{ padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }}>
              <option value="pelapor">Pelapor</option>
              <option value="terlapor">Terlapor</option>
            </select>
            <input value={namaPihakBaru} onChange={e => setNamaPihakBaru(e.target.value)} placeholder="Nama"
              style={{ flex: 1, minWidth: 140, padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }} />
            <input value={nomorPengenalBaru} onChange={e => setNomorPengenalBaru(e.target.value)} placeholder="Nomor pengenal (bila ada)"
              style={{ flex: 1, minWidth: 140, padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }} />
            <button className="btn btn-o btn-sm" disabled={!namaPihakBaru.trim()}
              onClick={() => mulai(async () => {
                const r = await tambahPihak(lhp.id, peranPihakBaru, namaPihakBaru, nomorPengenalBaru, '')
                if (r.galat) setGalat(r.galat)
                else { setNamaPihakBaru(''); setNomorPengenalBaru(''); router.refresh() }
              })}>
              <Ikon nama="tambah" /> Tambah
            </button>
          </div>
        )}
        {lhp.lhp_pihak.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Belum ada pihak.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lhp.lhp_pihak.map(p => (
              <div key={p.id} style={{ fontSize: 13.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--ink)' }}>{p.peran}</span>
                <span>{p.nama}{p.nomor_pengenal ? ` — ${p.nomor_pengenal}` : ''}</span>
                {bolehSunting && (
                  <button className="btn btn-o btn-sm" style={{ color: 'var(--red)' }}
                    onClick={() => mulai(async () => { await hapusPihak(p.id, lhp.id); router.refresh() })}>
                    <Ikon nama="silang" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Bagian>

      <Bagian nomor="VIII" judul="Kronologis dan Fakta Lapangan">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={6} value={isi.kronologis} onChange={e => ubah('kronologis', e.target.value)} placeholder="Uraian hasil kegiatan dan fakta lapangan" />
          : <p style={gaya.baca}>{teksatau(lhp.kronologis ?? '')}</p>}
      </Bagian>

      <Bagian nomor="IX" judul="Saksi">
        {bolehSunting && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <input value={namaSaksiBaru} onChange={e => setNamaSaksiBaru(e.target.value)} placeholder="Nama saksi"
              style={{ flex: 1, minWidth: 140, padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }} />
            <input value={kedudukanSaksiBaru} onChange={e => setKedudukanSaksiBaru(e.target.value)} placeholder="Kedudukan"
              style={{ flex: 1, minWidth: 140, padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }} />
            <button className="btn btn-o btn-sm" disabled={!namaSaksiBaru.trim()}
              onClick={() => mulai(async () => {
                const r = await tambahSaksi(lhp.id, namaSaksiBaru, kedudukanSaksiBaru, '')
                if (r.galat) setGalat(r.galat)
                else { setNamaSaksiBaru(''); setKedudukanSaksiBaru(''); router.refresh() }
              })}>
              <Ikon nama="tambah" /> Tambah
            </button>
          </div>
        )}
        {lhp.lhp_saksi.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Belum ada saksi.</p>
        ) : (
          <ol style={{ marginLeft: 18 }}>
            {lhp.lhp_saksi.map(s => (
              <li key={s.id} style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{s.nama}{s.kedudukan ? ` (${s.kedudukan})` : ''}</span>
                {bolehSunting && (
                  <button className="btn btn-o btn-sm" style={{ color: 'var(--red)' }}
                    onClick={() => mulai(async () => { await hapusSaksi(s.id, lhp.id); router.refresh() })}>
                    <Ikon nama="silang" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </Bagian>

      <Bagian nomor="X" judul="Barang Bukti">
        {bolehSunting && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <input value={uraianBuktiBaru} onChange={e => setUraianBuktiBaru(e.target.value)} placeholder="Uraian barang bukti"
              style={{ flex: 1, minWidth: 200, padding: '7px 10px', fontSize: 12.5, border: '1px solid var(--line-2)', borderRadius: 8 }} />
            <button className="btn btn-o btn-sm" disabled={!uraianBuktiBaru.trim()}
              onClick={() => mulai(async () => {
                const r = await tambahBarangBukti(lhp.id, uraianBuktiBaru, '')
                if (r.galat) setGalat(r.galat)
                else { setUraianBuktiBaru(''); router.refresh() }
              })}>
              <Ikon nama="tambah" /> Tambah
            </button>
          </div>
        )}
        {lhp.lhp_barang_bukti.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Belum ada barang bukti.</p>
        ) : (
          <ul style={{ marginLeft: 18 }}>
            {lhp.lhp_barang_bukti.map(b => (
              <li key={b.id} style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{b.uraian}</span>
                {bolehSunting && (
                  <button className="btn btn-o btn-sm" style={{ color: 'var(--red)' }}
                    onClick={() => mulai(async () => { await hapusBarangBukti(b.id, lhp.id); router.refresh() })}>
                    <Ikon nama="silang" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Bagian>

      <Bagian nomor="XI" judul="Langkah yang Telah Dilakukan">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={3} value={isi.langkah} onChange={e => ubah('langkah', e.target.value)} />
          : <p style={gaya.baca}>{teksatau(lhp.langkah ?? '')}</p>}
      </Bagian>

      <Bagian nomor="XII" judul="Rencana Tindak Lanjut">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={3} value={isi.rencana_tindak_lanjut} onChange={e => ubah('rencana_tindak_lanjut', e.target.value)} />
          : <p style={gaya.baca}>{teksatau(lhp.rencana_tindak_lanjut ?? '')}</p>}
      </Bagian>

      <Bagian nomor="XIII" judul="Kesimpulan">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={3} value={isi.kesimpulan} onChange={e => ubah('kesimpulan', e.target.value)} />
          : <p style={gaya.baca}>{teksatau(lhp.kesimpulan ?? '')}</p>}
      </Bagian>

      <Bagian nomor="XIV" judul="Catatan">
        {bolehSunting
          ? <textarea style={{ ...gaya.input, resize: 'vertical' }} rows={2} value={isi.catatan} onChange={e => ubah('catatan', e.target.value)} />
          : <p style={gaya.baca}>{teksatau(lhp.catatan ?? '')}</p>}
      </Bagian>

      <DialogAksi
        terbuka={dialogFinal}
        judul="Finalkan LHP Ringkas?"
        keterangan="Setelah difinalkan, LHP ini terkunci dan tidak dapat diubah lagi. Panit dan Kanit unit terkait akan diberi tahu."
        labelTombol="Finalkan"
        onTutup={() => setDialogFinal(false)}
        onKonfirmasi={async () => {
          const r = await finalkanLhpAksi(lhp.id)
          if (!r.galat) router.refresh()
          return r
        }}
      />
    </div>
  )
}
