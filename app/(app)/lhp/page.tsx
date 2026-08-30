import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarLhp } from '@/lib/lhp/kueri'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'LHP Ringkas — Si PANTAU' }

// Menyusun LHP HANYA Anggota (docs/00-fondasi.md §7, baris 341) —
// Kasubdit/Kanit/Panit di sini murni melihat dalam lingkupnya (RLS
// 0028), tidak pernah punya tombol susun/sunting (BR-11).
const JUDUL: Record<string, string> = {
  kasubdit: 'LHP Ringkas — Seluruh Unit',
  admin: 'LHP Ringkas — Seluruh Unit',
  kanit: 'LHP Ringkas — Unit Saya',
  panit: 'LHP Ringkas — Tim Saya',
  anggota: 'LHP Ringkas Saya',
}

const SUB: Record<string, string> = {
  kasubdit: 'Laporan Hasil Penyelidikan ringkas dari seluruh unit Subdit IV.',
  admin: 'Laporan Hasil Penyelidikan ringkas dari seluruh unit Subdit IV.',
  kanit: 'Laporan Hasil Penyelidikan ringkas yang disusun Anggota unit Anda.',
  panit: 'Laporan Hasil Penyelidikan ringkas pada penugasan yang Anda tanggungjawabi.',
  anggota: 'Draf dan LHP Ringkas yang sudah Anda susun.',
}

function waktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

export default async function HalamanDaftarLhp() {
  const [pengguna, daftar] = await Promise.all([
    wajibkanSudahSiap(),
    daftarLhp(),
  ])

  return (
    <>
      <div className="kh">
        <div>
          <h1>{JUDUL[pengguna.peran] ?? 'LHP Ringkas'}</h1>
          <p className="sub">{SUB[pengguna.peran] ?? ''}</p>
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>Daftar LHP</h3>
          <span className="isyarat">{daftar.length} berkas</span>
        </div>
        <div className="kartu-b rata tw">
          {daftar.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="berkas" />
              <h3>Belum ada LHP Ringkas</h3>
              <p>
                {pengguna.peran === 'anggota'
                  ? 'Susun LHP Ringkas dari halaman rincian penugasan tempat Anda bertugas.'
                  : 'LHP Ringkas yang disusun Anggota akan tampil di sini.'}
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Penugasan</th><th>Perkara</th><th>Penyusun</th>
                  <th>Status</th><th>Dibuat</th><th />
                </tr>
              </thead>
              <tbody>
                {daftar.map(l => (
                  <tr key={l.id} className="bisa-klik">
                    <td>
                      <span className="spt-id">{l.penugasan?.nomor_spt ?? '—'}</span>
                      <div className="sel-sub">{l.penugasan?.judul?.slice(0, 32) ?? ''}</div>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div className="sel-utama" style={{ fontWeight: 500 }}>
                        {l.perkara ? l.perkara.slice(0, 60) : <span style={{ color: 'var(--ink-3)' }}>Belum diisi</span>}
                      </div>
                    </td>
                    <td><span className="sel-utama">{l.penyusun?.nama ?? '—'}</span></td>
                    <td><span className={`lc ${l.status === 'final' ? 'selesai' : 'draf'}`}>{l.status === 'final' ? 'final' : 'draf'}</span></td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-2)' }}>{waktu(l.dibuat_pada)}</td>
                    <td>
                      <Link href={`/lhp/${l.id}`} className="btn btn-o btn-sm">
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
