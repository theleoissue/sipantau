import { sesiAktifSaya, ruteSayaLintasSpt } from '@/lib/gps/kueri'
import { daftarPenugasan } from '@/lib/penugasan/kueri'
import { KartuSesiTugas } from '@/components/sipantau/kartu-sesi-tugas'
import { LABEL_SEBAB_PENUTUPAN } from '@/lib/gps/tipe'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Sesi Tugas — Si PANTAU' }

function tanggalWaktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

function jarakTampil(meter: number | null): string {
  if (meter == null) return '—'
  return meter >= 1000 ? `${(meter / 1000).toFixed(1)} km` : `${Math.round(meter)} m`
}

export default async function HalamanTugas() {
  const [sesi, riwayat, penugasanAktif] = await Promise.all([
    sesiAktifSaya(),
    ruteSayaLintasSpt(),
    // RLS menyaring sendiri ke SPT tempat pengguna ini pelaksana aktif
    // (lib/penugasan/kueri.ts: tidak ada penyaring tambahan di sini).
    daftarPenugasan({ status: ['baru', 'berjalan', 'bermasalah'] }),
  ])

  return (
    <>
      <div className="kh">
        <div>
          <h1>Sesi Tugas</h1>
          <p className="sub">
            Perekaman posisi hanya berjalan selama Sesi Tugas dibuka.
          </p>
        </div>
      </div>

      <KartuSesiTugas
        sesi={sesi}
        sptTersedia={penugasanAktif.map(p => ({ id: p.id, nomor_spt: p.nomor_spt, judul: p.judul }))}
      />

      {/* Rute Saya (KP-6.4-46): sama persis dengan yang dilihat
          pengawas, tanpa satu bagian pun disembunyikan — orang yang
          dilacak berhak melihat seluruh data tentang dirinya sendiri. */}
      <section className="kartu" style={{ marginTop: 18 }}>
        <div className="kartu-h">
          <h3>Rute Saya</h3>
          <span className="isyarat">{riwayat.length} sesi</span>
        </div>
        {/* tw WAJIB ikut di sini: table{min-width:660px} berlaku untuk
            SELURUH tabel (globals.css), sementara body{overflow-x:hidden}
            memangkas kelebihannya diam-diam. Tanpa .tw, kolom Titik dan
            Keadaan terpotong dan TIDAK dapat dijangkau sama sekali di
            layar telepon — bukan sekadar sempit. */}
        <div className="kartu-b rata tw">
          {riwayat.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="riwayat" />
              <h3>Belum ada riwayat</h3>
              <p>Perekaman posisi hanya berjalan selama Sesi Tugas dibuka.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Penugasan</th><th>Mulai</th><th>Jarak</th><th>Titik</th><th>Keadaan</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="sel-utama">{s.nomor_spt ?? s.judul}</div>
                      <div className="sel-sub">{s.judul}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{tanggalWaktu(s.dibuka_pada)}</td>
                    <td>{jarakTampil(s.jarak_tempuh_meter)}</td>
                    <td>{s.jumlah_titik}</td>
                    <td>
                      {s.ditutup_pada
                        ? (s.sebab_penutupan ? LABEL_SEBAB_PENUTUPAN[s.sebab_penutupan] : '—')
                        : <span className="lc berjalan">Berjalan</span>}
                      {/* Penanda sesi di luar jadwal piket (migrasi 0045).
                          Ditulis sebagai FAKTA, bukan tuduhan — Prinsip
                          Non-Menghakimi (CLAUDE.md §7.3). Sesinya sendiri
                          berjalan penuh, tidak pernah dihalangi. */}
                      {s.di_luar_jadwal && (
                        <>
                          <br />
                          <span className="lencana-piket k-lepas_dinas"
                                title="Unit Anda berstatus Lepas Dinas saat sesi ini dibuka">
                            Di luar jadwal piket
                          </span>
                        </>
                      )}
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
