'use client'

import { DialogModal } from './dialog-modal'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  terbitkanDraf, tandaiBermasalah, kembalikanDariBermasalah,
  tutupSpt, batalkanSpt, bukaKembaliSpt, perpanjangBatas, hapusSptPermanen,
} from '@/app/(app)/penugasan/aksi'
import { DialogAksi } from './dialog-aksi'
import { Ikon } from './ikon'

const JENIS_MASALAH: { nilai: string; label: string }[] = [
  { nilai: 'alamat_sasaran_fiktif', label: 'Alamat atau sasaran fiktif' },
  { nilai: 'objek_tidak_ditemukan', label: 'Objek tidak ditemukan di lokasi' },
  { nilai: 'informasi_tidak_sesuai', label: 'Informasi awal tidak sesuai kenyataan' },
  { nilai: 'kendala_keamanan', label: 'Situasi tidak memungkinkan karena alasan keamanan' },
  { nilai: 'sasaran_berpindah', label: 'Sasaran berpindah tempat' },
  { nilai: 'kendala_perangkat_jaringan', label: 'Kendala perangkat atau jaringan' },
  { nilai: 'lainnya', label: 'Lainnya' },
]

type DialogAktif =
  | null | 'bermasalah' | 'kembalikan' | 'tutup' | 'batalkan' | 'bukaKembali' | 'perpanjang' | 'hapus'

/**
 * Tombol tindakan siklus SPT (docs/20-modul-6.2-penugasan.md 6.2.5).
 * BR-11: setiap tombol hanya dirender bila propnya mengizinkan — bukan
 * ditampilkan lalu ditolak basis data. Kewenangan sungguhannya tetap
 * ditegakkan fungsi security definer masing-masing (migrasi 0025); flag
 * di sini murni supaya antarmuka tidak menawarkan yang tidak berhak.
 */
export function AksiSpt({
  penugasanId,
  status,
  berkasAda,
  isKanitPemilik,
  isKasubdit,
  isPelaksanaAktif,
  isPanitAktif,
  bolehHapus,
}: {
  penugasanId: string
  status: string
  berkasAda: boolean
  isKanitPemilik: boolean
  isKasubdit: boolean
  isPelaksanaAktif: boolean
  isPanitAktif: boolean
  bolehHapus: boolean
}) {
  const router = useRouter()
  const [dialog, setDialog] = useState<DialogAktif>(null)
  const [jenisMasalah, setJenisMasalah] = useState(JENIS_MASALAH[0].nilai)
  const [tanggalBaru, setTanggalBaru] = useState('')
  const [teksDialog, setTeksDialog] = useState('')
  const [galatTeksDialog, setGalatTeksDialog] = useState<string | null>(null)
  const [sedangTerbit, mulaiTerbit] = useTransition()
  const [galatTerbit, setGalatTerbit] = useState<string | null>(null)

  const bisaBermasalah = (isPelaksanaAktif || isPanitAktif) && ['baru', 'berjalan'].includes(status)
  const bisaKembalikan = isKanitPemilik && status === 'bermasalah'
  const bisaTutup = isKanitPemilik && ['baru', 'berjalan', 'bermasalah'].includes(status)
  const bisaBatalkan = isKanitPemilik && ['draf', 'baru', 'berjalan', 'bermasalah'].includes(status)
  const bisaBukaKembali = (isKanitPemilik || isKasubdit) && status === 'selesai'
  const bisaPerpanjang = isKanitPemilik && ['baru', 'berjalan', 'bermasalah'].includes(status)
  const bisaHapus = isKanitPemilik && bolehHapus

  if (status === 'draf' && isKanitPemilik) {
    return (
      <>
        {galatTerbit && (
          <div className="kartu" style={{ marginBottom: 14, borderLeft: '3px solid var(--red)' }}>
            <div className="kartu-b"><p style={{ fontSize: 13, color: 'var(--red)' }}>{galatTerbit}</p></div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-p"
            onClick={() => mulaiTerbit(async () => {
              const r = await terbitkanDraf(penugasanId)
              if (r.galat) setGalatTerbit(r.galat)
              else router.refresh()
            })}
          >
            <Ikon nama="kirim" /> Terbitkan
          </button>
          {/* Draf tidak pernah punya laporan/Sesi Tugas (keduanya
              mensyaratkan SPT sudah terbit) — Hapus selalu berlaku,
              tidak perlu menghitung bolehHapus (KP-6.2-48). */}
          <button className="btn btn-o" style={{ color: 'var(--red)' }} onClick={() => setDialog('hapus')}>
            <Ikon nama="silang" /> Hapus Draf
          </button>
        </div>

        <DialogAksi
          terbuka={dialog === 'hapus'}
          judul="Hapus Draf Permanen?"
          keterangan="Draf ini akan dihapus permanen dan tidak dapat dipulihkan."
          labelTombol="Hapus Permanen" berbahaya
          onTutup={() => setDialog(null)}
          onKonfirmasi={async () => hapusSptPermanen(penugasanId)}
        />
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {bisaBermasalah && (
          <button className="btn btn-o" style={{ color: 'var(--red)' }} onClick={() => setDialog('bermasalah')}>
            <Ikon nama="awas" /> Tandai Bermasalah
          </button>
        )}
        {bisaKembalikan && (
          <button className="btn btn-o" onClick={() => setDialog('kembalikan')}>
            <Ikon nama="centang" /> Kembalikan dari Bermasalah
          </button>
        )}
        {bisaPerpanjang && (
          <button className="btn btn-o" onClick={() => setDialog('perpanjang')}>
            <Ikon nama="riwayat" /> Perpanjang Batas
          </button>
        )}
        {bisaTutup && (
          <button className="btn btn-o" onClick={() => setDialog('tutup')}>
            <Ikon nama="kunci_buka" /> Tutup Penugasan
          </button>
        )}
        {bisaBatalkan && (
          <button className="btn btn-o" style={{ color: 'var(--red)' }} onClick={() => setDialog('batalkan')}>
            <Ikon nama="silang" /> Batalkan
          </button>
        )}
        {bisaBukaKembali && (
          <button className="btn btn-o" onClick={() => setDialog('bukaKembali')}>
            <Ikon nama="kunci_buka" /> Buka Kembali
          </button>
        )}
        {bisaHapus && (
          <button className="btn btn-o" style={{ color: 'var(--red)' }} onClick={() => setDialog('hapus')}>
            <Ikon nama="silang" /> Hapus
          </button>
        )}
      </div>

      {/* Tandai Bermasalah — jenis masalah dari daftar tertutup (A-11),
          uraian bebas, keduanya wajib (KP-6.2-32). Bukan DialogAksi
          biasa karena butuh pilihan jenis, bukan sekadar alasan bebas. */}
      {dialog === 'bermasalah' && (
        <DialogModal label="Tandai Penugasan Bermasalah" terkunci={sedangTerbit} onTutup={() => setDialog(null)}>
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: 24, maxWidth: 420, width: '100%', boxShadow: 'var(--sh-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>Tandai Penugasan Bermasalah</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 10 }}>
              Bermasalah adalah keterangan keadaan, bukan penghentian kegiatan. Kanit dan Panit Penanggung Jawab akan diberi tahu.
            </p>
            <select
              value={jenisMasalah} onChange={e => setJenisMasalah(e.target.value)}
              style={{ width: '100%', marginTop: 14, padding: '9px 12px', fontSize: 13, border: '1px solid var(--line-2)', borderRadius: 8 }}
            >
              {JENIS_MASALAH.map(j => <option key={j.nilai} value={j.nilai}>{j.label}</option>)}
            </select>
            <textarea
              value={teksDialog} onChange={e => setTeksDialog(e.target.value)}
              placeholder="Uraikan keadaannya…" rows={3}
              style={{ width: '100%', marginTop: 10, padding: '10px 12px', fontSize: 13, border: '1px solid var(--line-2)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {galatTeksDialog && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 8 }}>{galatTeksDialog}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDialog(null)}>Batal</button>
              <button
                className="btn btn-d" style={{ flex: 1, justifyContent: 'center' }}
                disabled={sedangTerbit || !teksDialog.trim()}
                onClick={() => mulaiTerbit(async () => {
                  const r = await tandaiBermasalah(penugasanId, jenisMasalah, teksDialog.trim())
                  if (r.galat) setGalatTeksDialog(r.galat)
                  else { setDialog(null); setTeksDialog(''); router.refresh() }
                })}
              >
                Tandai Bermasalah
              </button>
            </div>
          </div>
        </DialogModal>
      )}

      <DialogAksi
        terbuka={dialog === 'kembalikan'}
        judul="Kembalikan dari Bermasalah?"
        keterangan="Status akan kembali ke berjalan. Alasan pengembalian wajib diisi."
        butuhAlasan labelAlasan="Alasan pengembalian" labelTombol="Kembalikan"
        onTutup={() => setDialog(null)}
        onKonfirmasi={async alasan => {
          const r = await kembalikanDariBermasalah(penugasanId, alasan)
          if (!r.galat) router.refresh()
          return r
        }}
      />

      <DialogAksi
        terbuka={dialog === 'tutup'}
        judul="Tutup Penugasan?"
        keterangan={berkasAda
          ? 'Sesi Tugas yang masih berjalan akan ikut ditutup dan rutenya tersimpan utuh. Penugasan yang belum rampung tetap dapat ditutup — ini keputusan Anda.'
          : 'Lampirkan pindaian surat perintah tugas lebih dulu sebelum menutup penugasan.'}
        labelTombol="Tutup Penugasan"
        onTutup={() => setDialog(null)}
        onKonfirmasi={async () => {
          const r = await tutupSpt(penugasanId)
          if (!r.galat) router.refresh()
          return r
        }}
      />

      <DialogAksi
        terbuka={dialog === 'batalkan'}
        judul="Batalkan Penugasan?"
        keterangan="Seluruh tim akan diberi tahu. Alasan pembatalan wajib diisi dan tindakan ini tidak dapat dibuka kembali."
        butuhAlasan labelAlasan="Alasan pembatalan" labelTombol="Batalkan" berbahaya
        onTutup={() => setDialog(null)}
        onKonfirmasi={async alasan => {
          const r = await batalkanSpt(penugasanId, alasan)
          if (!r.galat) router.refresh()
          return r
        }}
      />

      <DialogAksi
        terbuka={dialog === 'bukaKembali'}
        judul="Buka Kembali Penugasan?"
        keterangan="Status akan kembali ke berjalan. Alasan pembukaan kembali wajib diisi."
        butuhAlasan labelAlasan="Alasan pembukaan kembali" labelTombol="Buka Kembali"
        onTutup={() => setDialog(null)}
        onKonfirmasi={async alasan => {
          const r = await bukaKembaliSpt(penugasanId, alasan)
          if (!r.galat) router.refresh()
          return r
        }}
      />

      {dialog === 'perpanjang' && (
        <DialogModal label="Perpanjang Batas Waktu" terkunci={sedangTerbit} onTutup={() => setDialog(null)}>
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: 24, maxWidth: 400, width: '100%', boxShadow: 'var(--sh-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>Perpanjang Batas Waktu</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 10 }}>
              Tidak ada batas berapa kali perpanjangan boleh dilakukan. Seluruh riwayatnya tersimpan.
            </p>
            <input
              type="date" value={tanggalBaru} onChange={e => setTanggalBaru(e.target.value)}
              style={{ width: '100%', marginTop: 14, padding: '9px 12px', fontSize: 13, border: '1px solid var(--line-2)', borderRadius: 8 }}
            />
            <textarea
              value={teksDialog} onChange={e => setTeksDialog(e.target.value)}
              placeholder="Alasan perpanjangan…" rows={3}
              style={{ width: '100%', marginTop: 10, padding: '10px 12px', fontSize: 13, border: '1px solid var(--line-2)', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {galatTeksDialog && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 8 }}>{galatTeksDialog}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setDialog(null); setTeksDialog(''); setGalatTeksDialog(null) }}>
                Batal
              </button>
              <button
                className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}
                disabled={sedangTerbit || !tanggalBaru || !teksDialog.trim()}
                onClick={() => mulaiTerbit(async () => {
                  const r = await perpanjangBatas(penugasanId, tanggalBaru, teksDialog.trim())
                  if (r.galat) setGalatTeksDialog(r.galat)
                  else { setDialog(null); setTeksDialog(''); setTanggalBaru(''); router.refresh() }
                })}
              >
                Perpanjang
              </button>
            </div>
          </div>
        </DialogModal>
      )}

      <DialogAksi
        terbuka={dialog === 'hapus'}
        judul="Hapus Penugasan Permanen?"
        keterangan="Penugasan ini belum pernah memiliki laporan maupun Sesi Tugas, sehingga dapat dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        labelTombol="Hapus Permanen" berbahaya
        onTutup={() => setDialog(null)}
        onKonfirmasi={async () => hapusSptPermanen(penugasanId)}
      />
    </>
  )
}
