'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ajukanUsulanSprin, tarikPengajuanSprin, type DataUsulanSprin } from '@/app/(app)/penugasan/aksi'
import { Ikon } from './ikon'

/**
 * Formulir usulan penerbitan SPRIN untuk Panit dan Anggota.
 *
 * Berbeda dari layar scan, di sini SURATNYA BELUM ADA. Yang dikirim
 * bukan hasil pembacaan dokumen melainkan permintaan agar dokumennya
 * diterbitkan — maka medan yang diminta jauh lebih sedikit, dan yang
 * terpenting justru medan yang tidak punya padanan pada scan: alasan.
 *
 * Alurnya sejak 0067: usulan yang disetujui Kanit naik ke pimpinan untuk
 * ditandatangani, lalu SPRIN yang sudah jadi dipindai dan ditautkan ke
 * usulan ini. Yang dijadikan penugasan adalah SPRIN itu, bukan usulannya.
 *
 * Nomor SPT sengaja TIDAK ADA di formulir ini. Nomor berasal dari buku
 * agenda Bagian Administrasi di luar SiPANTAU dan tidak pernah
 * dibangkitkan sistem (modul 6.2); menyediakan kolomnya akan mengundang
 * pengusul mengarang nomor yang kemudian terbaca seolah sah.
 */

export interface AjuanSaya {
  id: string
  asal: string
  status: string
  catatan_kanit: string | null
  dibuat_pada: string
  /** Pada scan: usulan yang dipenuhi SPRIN ini (0067). */
  usulan_id: string | null
  /** Pada usulan: SPRIN yang sudah turun untuknya (0067). */
  sprin_turun_id: string | null
  judul: string
  alasan: string
}

const LABEL_STATUS: Record<string, string> = {
  diajukan: 'Menunggu keputusan Kanit',
  perlu_perbaikan: 'Diminta diperbaiki',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  ditarik: 'Ditarik',
}

/** Sama dengan penjaga SPRIN_SUDAH_TURUN di ajukan_sprin_turun. */
const TURUN_BERLAKU = ['diajukan', 'perlu_perbaikan', 'disetujui']

function labelAjuan(a: AjuanSaya) {
  if (a.asal === 'usulan' && a.status === 'disetujui') return 'Disetujui · diteruskan ke pimpinan'
  return LABEL_STATUS[a.status] ?? a.status
}

/** Keadaan SPRIN untuk usulan yang sudah disetujui Kanit. */
function KeadaanSprinTurun({ ajuan, semua }: { ajuan: AjuanSaya; semua: AjuanSaya[] }) {
  const turun = ajuan.sprin_turun_id ? semua.find(x => x.id === ajuan.sprin_turun_id) : undefined

  // Dipindai Kanit: baris scan itu milik Kanit dan tidak terbaca di sini,
  // tetapi sprin_turun_id pada usulan Anda tetap menunjukkannya.
  if (ajuan.sprin_turun_id && !turun) {
    return <p className="usul-catatan"><b>SPRIN sudah turun</b> dan diterima Kanit.</p>
  }
  if (turun && TURUN_BERLAKU.includes(turun.status)) {
    return <p className="usul-catatan"><b>SPRIN sudah turun</b> — {LABEL_STATUS[turun.status] ?? turun.status}.</p>
  }
  return <div className="usul-catatan">
    <p><b>Menunggu SPRIN dari pimpinan.</b> Setelah ditandatangani, pindai SPRIN-nya supaya tertaut ke usulan ini.</p>
    <Link href={`/penugasan/scan?usulan=${ajuan.id}`} className="btn btn-o btn-sm">
      <Ikon nama="kamera" /> Pindai SPRIN yang sudah turun
    </Link>
  </div>
}

const KOSONG: DataUsulanSprin = {
  alasan: '', judul: '', objek: '', sasaran: '', uraian_tugas: '',
  lokasi: [{ nama: '', alamat: '', keterangan: '' }],
  tanggal_mulai: '', tanggal_batas: '', personel: [],
}

export function AjukanUsulanSprin({ ajuanSaya }: { ajuanSaya: AjuanSaya[] }) {
  const [isi, setIsi] = useState<DataUsulanSprin>(KOSONG)
  const [personelTeks, setPersonelTeks] = useState('')
  const [pesan, setPesan] = useState<string | null>(null)
  const [galat, setGalat] = useState<string | null>(null)
  const [menyimpan, mulai] = useTransition()

  const ubah = (medan: keyof DataUsulanSprin) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setIsi(s => ({ ...s, [medan]: e.target.value }))

  function ubahLokasi(i: number, medan: 'nama' | 'alamat', nilai: string) {
    setIsi(s => {
      const lokasi = [...(s.lokasi ?? [])]
      lokasi[i] = { ...lokasi[i], [medan]: nilai }
      return { ...s, lokasi }
    })
  }

  function kirim() {
    setPesan(null)
    setGalat(null)
    // Diperiksa juga di sini, bukan hanya di basis data. Penjaga di
    // ajukan_usulan_sprin tetap yang menentukan; yang ini supaya
    // pengusul tahu sebelum menunggu perjalanan ke server.
    if (!isi.alasan.trim()) {
      setGalat('Tulis alasan atau pertimbangannya. Tanpa itu Kanit tidak punya bahan untuk memutuskan.')
      return
    }
    mulai(async () => {
      const hasil = await ajukanUsulanSprin({
        ...isi,
        lokasi: (isi.lokasi ?? []).filter(l => l.nama.trim() || l.alamat.trim()),
        personel: personelTeks.split('\n').map(b => b.trim()).filter(Boolean),
      })
      if (hasil.galat) { setGalat(hasil.galat); return }
      setPesan(hasil.sukses ?? 'Usulan terkirim.')
      setIsi(KOSONG)
      setPersonelTeks('')
    })
  }

  function tarik(id: string) {
    setPesan(null)
    setGalat(null)
    mulai(async () => {
      const hasil = await tarikPengajuanSprin(id)
      if (hasil.galat) setGalat(hasil.galat)
      else setPesan(hasil.sukses ?? 'Ajuan ditarik.')
    })
  }

  return <>
    <section className="kartu" style={{ marginBottom: 16 }}>
      <div className="kartu-h"><h3>Usulkan penerbitan SPRIN</h3></div>
      <div className="kartu-b">
        <p className="bantu" style={{ marginBottom: 14 }}>
          Untuk keadaan yang suratnya <b>belum ada</b>. Kanit memutuskan dan meneruskannya ke
          pimpinan untuk ditandatangani; SPRIN yang sudah jadi nanti dipindai untuk dijadikan
          penugasan. Nomor surat bukan diisi di sini.
        </p>

        <div className="fg">
          <label htmlFor="u-alasan">Alasan atau pertimbangan <span className="wajib">*</span></label>
          <textarea id="u-alasan" rows={4} value={isi.alasan} onChange={ubah('alasan')}
            placeholder="Apa yang ditemukan, kenapa perlu ditindaklanjuti." />
          <div className="bantu">Ini yang dibaca Kanit lebih dulu. Sebutkan temuannya, bukan hanya permintaannya.</div>
        </div>

        <div className="fg">
          <label htmlFor="u-judul">Judul singkat</label>
          <input id="u-judul" type="text" value={isi.judul} onChange={ubah('judul')}
            placeholder="Contoh: Penyelidikan dugaan pembuangan limbah" />
        </div>

        <div className="usul-baris">
          <div className="fg">
            <label htmlFor="u-objek">Objek</label>
            <input id="u-objek" type="text" value={isi.objek} onChange={ubah('objek')}
              placeholder="Kegiatan atau perbuatan yang diduga terjadi" />
          </div>
          <div className="fg">
            <label htmlFor="u-sasaran">Sasaran</label>
            <input id="u-sasaran" type="text" value={isi.sasaran} onChange={ubah('sasaran')}
              placeholder="Pihak atau tempat yang dituju" />
          </div>
        </div>

        <div className="fg">
          <label htmlFor="u-uraian">Uraian tugas yang diusulkan</label>
          <textarea id="u-uraian" rows={3} value={isi.uraian_tugas} onChange={ubah('uraian_tugas')}
            placeholder="Apa yang hendak dikerjakan di lapangan." />
        </div>

        <div className="fg">
          <label>Lokasi</label>
          {(isi.lokasi ?? []).map((l, i) => (
            <div className="usul-lokasi" key={i}>
              <input type="text" value={l.nama} aria-label={`Nama lokasi ${i + 1}`}
                onChange={e => ubahLokasi(i, 'nama', e.target.value)} placeholder="Nama tempat" />
              <input type="text" value={l.alamat} aria-label={`Alamat lokasi ${i + 1}`}
                onChange={e => ubahLokasi(i, 'alamat', e.target.value)} placeholder="Alamat atau patokan" />
            </div>
          ))}
          <button type="button" className="btn btn-o btn-sm" disabled={menyimpan}
            onClick={() => setIsi(s => ({ ...s, lokasi: [...(s.lokasi ?? []), { nama: '', alamat: '', keterangan: '' }] }))}>
            <Ikon nama="tambah" /> Tambah lokasi
          </button>
          <div className="bantu">Titik pastinya dijatuhkan Kanit di peta saat menerbitkan.</div>
        </div>

        <div className="usul-baris">
          <div className="fg">
            <label htmlFor="u-mulai">Perkiraan mulai</label>
            <input id="u-mulai" type="date" value={isi.tanggal_mulai ?? ''} onChange={ubah('tanggal_mulai')} />
          </div>
          <div className="fg">
            <label htmlFor="u-batas">Perkiraan selesai</label>
            <input id="u-batas" type="date" value={isi.tanggal_batas ?? ''} onChange={ubah('tanggal_batas')} />
          </div>
        </div>

        <div className="fg">
          <label htmlFor="u-personel">Usulan personel</label>
          <textarea id="u-personel" rows={3} value={personelTeks}
            onChange={e => setPersonelTeks(e.target.value)}
            placeholder="Satu nama per baris" />
          <div className="bantu">Usulan saja. Penunjukan pelaksana tetap wewenang Kanit.</div>
        </div>

        {galat && <p className="usul-galat" role="alert">{galat}</p>}
        {pesan && <p className="bantu" role="status">{pesan}</p>}

        <button type="button" className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }}
          onClick={kirim} disabled={menyimpan}>
          <Ikon nama="kirim" />
          {menyimpan ? 'Mengirim…' : 'Kirim usulan ke Kanit'}
        </button>
      </div>
    </section>

    <section className="kartu">
      <div className="kartu-h"><h3>Ajuan saya</h3>
        {ajuanSaya.length > 0 && <span className="isyarat">{ajuanSaya.length} ajuan</span>}
      </div>
      <div className="kartu-b">
        {ajuanSaya.length === 0
          ? <p className="bantu">Belum ada ajuan yang Anda kirim.</p>
          : <div className="usul-daftar">
              {ajuanSaya.map(a => (
                <article className="usul-item" key={a.id}>
                  <div className="usul-item-kepala">
                    <span className={`lencana ${a.status}`}>{labelAjuan(a)}</span>
                    <span className="usul-asal">{a.asal === 'usulan' ? 'Usulan' : 'Scan'}</span>
                  </div>
                  <strong>{a.judul || 'Tanpa judul'}</strong>
                  {a.asal === 'scan' && a.usulan_id && (
                    <p className="usul-catatan">SPRIN untuk usulan <b>{ajuanSaya.find(x => x.id === a.usulan_id)?.judul || 'yang sudah disetujui'}</b></p>
                  )}
                  {a.alasan && <p className="usul-alasan">{a.alasan}</p>}
                  {a.catatan_kanit && <p className="usul-catatan"><b>Catatan Kanit:</b> {a.catatan_kanit}</p>}
                  {a.asal === 'usulan' && a.status === 'disetujui' && <KeadaanSprinTurun ajuan={a} semua={ajuanSaya} />}
                  {/* Menarik hanya selama Kanit belum memutuskan. Tombolnya
                      TIDAK ditampilkan dalam keadaan nonaktif pada keadaan
                      lain — BR-11: yang di luar kewenangan tidak dirender. */}
                  {(a.status === 'diajukan' || a.status === 'perlu_perbaikan') && (
                    <button type="button" className="btn btn-o btn-sm" disabled={menyimpan}
                      onClick={() => tarik(a.id)}>
                      Tarik ajuan
                    </button>
                  )}
                </article>
              ))}
            </div>}
      </div>
    </section>
  </>
}
