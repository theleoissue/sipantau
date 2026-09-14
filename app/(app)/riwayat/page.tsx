import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarLaporan, LABEL_JENIS_LAPORAN } from '@/lib/laporan/kueri'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Riwayat Laporan — Si PANTAU' }

// 0071 menggantikan LHP Ringkas: dulu hanya laporan milik sendiri
// (riwayatLaporanSaya). Sekarang daftarLaporan() TANPA penyaring lagi —
// RLS (laporan_baca_sesuai_lingkup) sendiri yang membedakan lingkup tiap
// peran, sama seperti /lhp dulu (Kasubdit/Admin: semua unit; Kanit: unit
// sendiri; Panit: penugasan yang diawasinya; Anggota: laporan miliknya).
const JUDUL: Record<string, string> = {
  kasubdit: 'Riwayat Laporan — Seluruh Unit',
  admin: 'Riwayat Laporan — Seluruh Unit',
  kanit: 'Riwayat Laporan — Unit Saya',
  panit: 'Riwayat Laporan — Tim Saya',
  anggota: 'Riwayat Laporan Saya',
}

const SUB: Record<string, string> = {
  kasubdit: 'Seluruh laporan lapangan dari unit Subdit IV, beserta catatan peninjau.',
  admin: 'Seluruh laporan lapangan dari unit Subdit IV, beserta catatan peninjau.',
  kanit: 'Laporan lapangan dari unit Anda, beserta catatan peninjau.',
  panit: 'Laporan lapangan pada penugasan yang Anda awasi.',
  anggota: 'Seluruh laporan yang pernah Anda kirim beserta catatan dari peninjau.',
}

function waktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

const LABEL_STATUS: Record<string, string> = {
  terkirim: 'Menunggu tinjauan',
  perlu_diperbaiki: 'Perlu diperbaiki',
  disetujui: 'Sudah ditinjau',
  ditarik: 'Ditarik',
}

export default async function HalamanRiwayat() {
  const pengguna = await wajibkanSudahSiap()
  const daftar = await daftarLaporan()

  return (
    <>
      <div className="kh">
        <div>
          <h1>{JUDUL[pengguna.peran] ?? 'Riwayat Laporan'}</h1>
          <p className="sub">{SUB[pengguna.peran] ?? ''}</p>
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>Laporan terkirim</h3>
          <span className="isyarat">{daftar.length} laporan</span>
        </div>
        <div className="kartu-b rata">
          {daftar.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="riwayat" />
              <h3>Belum ada laporan terkirim</h3>
              <p>Laporan yang dikirim dari lapangan akan tersimpan di sini.</p>
              {['anggota', 'panit', 'kanit'].includes(pengguna.peran) && (
                <Link href="/lapor" className="btn btn-g">Kirim laporan pertama</Link>
              )}
            </div>
          ) : (
            daftar.map(r => (
              <Link
                key={r.id} href={`/laporan/${r.id}`}
                className="dor"
                style={{ alignItems: 'flex-start', padding: '16px 18px', textDecoration: 'none', display: 'flex' }}
              >
                <div className="meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="spt-id">{r.penugasan?.nomor_spt ?? '—'}</span>
                    <span className={`lc ${r.status_laporan === 'disetujui' ? 'selesai'
                      : r.status_laporan === 'ditarik' ? 'dibatalkan'
                      : r.status_laporan === 'perlu_diperbaiki' ? 'bermasalah' : 'berjalan'}`}>
                      {LABEL_STATUS[r.status_laporan]}
                    </span>
                  </div>
                  <div className="nm">{LABEL_JENIS_LAPORAN[r.jenis]} — {r.penugasan?.judul ?? ''}</div>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 5, lineHeight: 1.55 }}>
                    {r.uraian.slice(0, 130)}…
                  </p>
                  <div className="st" style={{ marginTop: 7 }}>
                    {r.pelapor?.nama ?? '—'} · {waktu(r.dikirim_pada)}{r.foto_dokumentasi.length > 0 ? ` · ${r.foto_dokumentasi.length} foto` : ''}
                  </div>
                  {r.catatan_laporan.length > 0 && (
                    <div className="nota" style={{ marginTop: 10 }}>
                      <b>{r.catatan_laporan[r.catatan_laporan.length - 1].users?.nama ?? '—'}</b>
                      {r.catatan_laporan[r.catatan_laporan.length - 1].isi}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  )
}
