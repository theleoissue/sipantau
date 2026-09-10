'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cabutPelaksana, tambahPelaksana, tunjukPanit, cabutPanit } from '@/app/(app)/penugasan/aksi'
import { DialogAksi } from './dialog-aksi'
import { inisial } from '@/lib/utils'
import { Ikon } from './ikon'

interface Orang {
  id: string
  dicabut_pada: string | null
  users: { nama: string } | null
  pelaksana_id?: string
  panit_id?: string
}
interface Personel { id: string; nama: string; peran: string; aktif: boolean }

const WARNA_AVATAR = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626']

/**
 * Susunan tim: cabut pelaksana/Panit (dengan alasan wajib, ditolak
 * basis data bila akan menghabiskan syarat minimum BR-33) dan
 * penambahannya. Hanya dirender untuk Kanit unit pemilik (BR-11) —
 * halaman pemanggil yang memutuskan itu, bukan komponen ini.
 */
export function KelolaTim({
  penugasanId,
  pelaksana,
  panit,
  personelTersedia,
  bolehUbah,
  bagian = 'semua',
}: {
  penugasanId: string
  pelaksana: Orang[]
  panit: Orang[]
  personelTersedia: Personel[]
  bolehUbah: boolean
  bagian?: 'panit' | 'pelaksana' | 'semua'
}) {
  const router = useRouter()
  const [cabutRelasi, setCabutRelasi] = useState<{ id: string; jenis: 'pelaksana' | 'panit' } | null>(null)
  const [tambahPersonelId, setTambahPersonelId] = useState('')
  const [tunjukPanitId, setTunjukPanitId] = useState('')
  const [galat, setGalat] = useState<string | null>(null)
  const [, mulai] = useTransition()

  if (!bolehUbah) return null

  const idPelaksanaAktif = new Set(pelaksana.filter(p => !p.dicabut_pada).map(p => p.pelaksana_id))
  const idPanitAktif = new Set(panit.filter(p => !p.dicabut_pada).map(p => p.panit_id))
  const calonPelaksana = personelTersedia.filter(p => p.aktif && ['anggota', 'panit', 'kanit'].includes(p.peran) && !idPelaksanaAktif.has(p.id))
  const calonPanit = personelTersedia.filter(p => p.aktif && p.peran === 'panit' && !idPanitAktif.has(p.id))

  const tampilPanit = bagian === 'panit' || bagian === 'semua'
  const tampilPelaksana = bagian === 'pelaksana' || bagian === 'semua'
  const label = bagian === 'panit' ? 'Kelola Panit' : bagian === 'pelaksana' ? 'Kelola Pelaksana' : 'Kelola Tim'

  return (
    <details className="kelola-tim-lipat">
      <summary className="btn btn-o btn-sm"><Ikon nama="orang" /> {label}</summary>
      <div className="kelola-tim">
      {tampilPanit && <>
      <section className="kelola-tim-blok kelola-tim-panit">
      <div className="kelola-tim-label"><b>1. Panit Penanggung Jawab</b><span>Penanggung jawab utama di lapangan</span></div>
      <div className="kelola-tim-tambah">
        <select
          value={tunjukPanitId} onChange={e => setTunjukPanitId(e.target.value)}
        >
          <option value="">Tunjuk Panit Penanggung Jawab…</option>
          {calonPanit.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select>
        <button className="btn btn-p btn-sm" disabled={!tunjukPanitId} onClick={() => mulai(async () => {
          const r = await tunjukPanit(penugasanId, tunjukPanitId)
          if (r.galat) setGalat(r.galat); else { setTunjukPanitId(''); router.refresh() }
        })}><Ikon nama="tambah" /> Tunjuk</button>
      </div>
      {panit.filter(p => !p.dicabut_pada).map(p => (
        <div key={p.id} className="dor kelola-tim-orang"><div className="av av-sm" style={{ background: '#2563EB', color: '#fff' }}>{inisial(p.users?.nama ?? '?')}</div><div className="meta"><div className="nm">{p.users?.nama ?? '—'}</div><div className="st">Panit Penanggung Jawab</div></div><button className="btn btn-o btn-sm" style={{ color: 'var(--red)' }} onClick={() => setCabutRelasi({ id: p.id, jenis: 'panit' })}>Cabut</button></div>
      ))}
      </section>
      </>}
      {tampilPelaksana && <>
      <section className="kelola-tim-blok">
      <div className="kelola-tim-label"><b>2. Pelaksana</b><span>Personel pelaksana tugas</span></div>
      <div className="kelola-tim-tambah">
        <select
          value={tambahPersonelId} onChange={e => setTambahPersonelId(e.target.value)}
        >
          <option value="">Tambah pelaksana…</option>
          {calonPelaksana.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select>
        <button
          className="btn btn-o btn-sm" disabled={!tambahPersonelId}
          onClick={() => mulai(async () => {
            const r = await tambahPelaksana(penugasanId, tambahPersonelId)
            if (r.galat) setGalat(r.galat); else { setTambahPersonelId(''); router.refresh() }
          })}
        >
          <Ikon nama="tambah" /> Tambah
        </button>
      </div>

      {pelaksana.map((p, i) => !p.dicabut_pada && (
        <div key={p.id} className="dor" style={{ marginTop: 8 }}>
          <div className="av av-sm" style={{ background: WARNA_AVATAR[i % WARNA_AVATAR.length], color: '#fff' }}>
            {inisial(p.users?.nama ?? '?')}
          </div>
          <div className="meta"><div className="nm">{p.users?.nama ?? '—'}</div></div>
          <button
            className="btn btn-o btn-sm" style={{ color: 'var(--red)' }}
            onClick={() => setCabutRelasi({ id: p.id, jenis: 'pelaksana' })}
          >
            Cabut
          </button>
        </div>
      ))}

      </section>
      </>}

      {galat && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 8 }}>{galat}</p>}

      <DialogAksi
        terbuka={cabutRelasi !== null}
        judul={`Cabut ${cabutRelasi?.jenis === 'panit' ? 'Panit Penanggung Jawab' : 'pelaksana'}?`}
        keterangan="Baris tidak dihapus, hanya ditandai dicabut — laporan, foto, dan rute yang sudah terekam tetap ada. Alasan wajib diisi."
        butuhAlasan labelAlasan="Alasan pencabutan" labelTombol="Cabut" berbahaya
        onTutup={() => setCabutRelasi(null)}
        onKonfirmasi={async alasan => {
          if (!cabutRelasi) return {}
          const r = cabutRelasi.jenis === 'panit'
            ? await cabutPanit(cabutRelasi.id, penugasanId, alasan)
            : await cabutPelaksana(cabutRelasi.id, penugasanId, alasan)
          if (!r.galat) router.refresh()
          return r
        }}
      />
      </div>
    </details>
  )
}
