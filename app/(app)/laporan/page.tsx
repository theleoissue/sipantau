import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarLaporan, LABEL_JENIS_LAPORAN } from '@/lib/laporan/kueri'
import { inisial } from '@/lib/utils'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Laporan — Si PANTAU' }

const JUDUL: Record<string, string> = {
  kanit: 'Semua Laporan',
  panit: 'Review Laporan',
  kasubdit: 'Semua Laporan',
  admin: 'Semua Laporan',
}

const SUB: Record<string, string> = {
  kanit: 'Laporan dari pelaksana unit Anda yang menunggu tinjauan.',
  panit: 'Laporan dari pelaksana pada penugasan yang Anda tanggungjawabi.',
  kasubdit: 'Laporan lapangan dari seluruh unit Subdit IV.',
  admin: 'Laporan lapangan dari seluruh unit Subdit IV.',
}

function waktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

export default async function HalamanDaftarLaporan() {
  // Independen — daftarLaporan() tidak menerima argumen, lingkupnya
  // disaring RLS sendiri, tidak perlu menunggu pengguna lebih dulu.
  const [pengguna, daftar] = await Promise.all([
    wajibkanSudahSiap(),
    daftarLaporan(),
  ])

  return (
    <>
      <div className="kh">
        <div>
          <h1>{JUDUL[pengguna.peran] ?? 'Laporan'}</h1>
          <p className="sub">{SUB[pengguna.peran] ?? ''}</p>
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>Laporan masuk</h3>
          <span className="isyarat">{daftar.length} laporan</span>
        </div>
        <div className="kartu-b rata tw">
          {daftar.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="masuk_kotak" />
              <h3>Belum ada laporan masuk</h3>
              <p>Laporan dari pelaksana akan tampil di sini begitu dikirim dari lapangan.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Penugasan</th><th>Pelapor</th><th>Isi laporan</th>
                  <th>Status</th><th>Waktu</th><th />
                </tr>
              </thead>
              <tbody>
                {daftar.map(r => (
                  <tr key={r.id} className="bisa-klik">
                    <td>
                      <span className="spt-id">{r.penugasan?.nomor_spt ?? '—'}</span>
                      <div className="sel-sub">{r.penugasan?.judul?.slice(0, 32) ?? ''}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="av av-sm" style={{ background: '#2563EB', color: '#fff' }}>
                          {inisial(r.pelapor?.nama ?? '?')}
                        </div>
                        <span className="sel-utama">{r.pelapor?.nama ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div className="sel-utama" style={{ fontWeight: 500 }}>
                        {LABEL_JENIS_LAPORAN[r.jenis]} — {r.uraian.slice(0, 60)}…
                      </div>
                      {r.foto_dokumentasi.length > 0 && (
                        <div className="sel-sub">{r.foto_dokumentasi.length} foto</div>
                      )}
                    </td>
                    <td><span className={`lc ${r.status_laporan === 'disetujui' ? 'selesai' : 'berjalan'}`}>{r.status_laporan}</span></td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-2)' }}>{waktu(r.dikirim_pada)}</td>
                    <td>
                      <Link href={`/laporan/${r.id}`} className="btn btn-o btn-sm">
                        <Ikon nama="mata" />Buka
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}
