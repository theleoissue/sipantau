import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { satuPenugasan, lewatBatas, hariTerlampaui } from '@/lib/penugasan/kueri'
import { catatTandaTerima } from '../aksi'
import { Ikon } from '@/components/sipantau/ikon'
import { inisial } from '@/lib/utils'

export const metadata = { title: 'Rincian Penugasan — Si PANTAU' }

const LABEL_DASAR: Record<string, string> = {
  laporan_informasi: 'Laporan Informasi',
  laporan_polisi: 'Laporan Polisi',
  laporan_pengaduan: 'Laporan Pengaduan',
  surat_perintah_terdahulu: 'Surat Perintah Terdahulu',
  disposisi_pimpinan: 'Disposisi Pimpinan',
  lainnya: 'Lainnya',
}

const WARNA_AVATAR = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626']

function tanggal(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')))
}

export default async function RincianPenugasan({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pengguna = await wajibkanSudahSiap()
  const spt = await satuPenugasan(id)

  if (!spt) notFound()

  // Tanda terima otomatis saat pelaksana pertama kali membuka rincian,
  // bukan tombol terpisah. Dijalankan diam-diam; kegagalannya tidak
  // boleh menghalangi halaman tampil.
  await catatTandaTerima(id)

  const lokasi = [...(spt.penugasan_lokasi ?? [])].sort((a, b) => a.urutan - b.urutan)
  const dasar = [...(spt.penugasan_dasar ?? [])].sort((a, b) => a.urutan - b.urutan)
  const pelaksana = (spt.penugasan_pelaksana ?? [])
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  const panit = spt.penugasan_panit ?? []
  const telat = lewatBatas(spt)

  const akuPelaksana = pelaksana.some(
    p => p.pelaksana_id === pengguna.id && !p.dicabut_pada)

  return (
    <>
      <div className="kh">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className={`pr ${spt.prioritas}`}>{spt.prioritas}</span>
            <span className={`lc ${spt.status}`}>{spt.status}</span>
            {telat && (
              <span className="lc bermasalah">
                lewat batas {hariTerlampaui(spt)} hari
              </span>
            )}
          </div>
          <h1>{spt.judul}</h1>
          {spt.objek && <p className="sub">{spt.objek}</p>}
          <p className="sub" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 7 }}>
            {spt.nomor_spt ?? 'Nomor SPT belum diisi'}
          </p>
        </div>

        <div className="kh-aksi">
          <Link href="/penugasan" className="btn btn-o">Kembali</Link>

          {/* BR-11 di setiap tombol: yang di luar kewenangan tidak
              dirender sama sekali. */}
          {pengguna.peran === 'kanit' && spt.status !== 'draf' && (
            <Link href={`/penugasan/${spt.id}/sprin`} className="btn btn-o">
              <Ikon nama="cetak" />
              Cetak SPRIN
            </Link>
          )}
          {pengguna.peran === 'kanit' && (
            <Link href={`/penugasan/${spt.id}/sunting`} className="btn btn-p">
              <Ikon nama="lapor" />
              Sunting
            </Link>
          )}
          {akuPelaksana && ['baru', 'berjalan', 'bermasalah'].includes(spt.status) && (
            <Link href="/lapor" className="btn btn-g">
              <Ikon nama="lapor" />
              Kirim laporan
            </Link>
          )}
        </div>
      </div>

      {spt.status === 'dibatalkan' && spt.alasan_pembatalan && (
        <div className="kartu" style={{ marginBottom: 18, borderLeft: '3px solid var(--red)' }}>
          <div className="kartu-b">
            <strong style={{ fontSize: 13, color: 'var(--red)' }}>Penugasan dibatalkan</strong>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.6 }}>
              {spt.alasan_pembatalan}
            </p>
          </div>
        </div>
      )}

      <div className="rk" style={{ marginBottom: 18 }}>
        <div><div className="k">Sasaran</div><div className="v">{spt.sasaran ?? '—'}</div></div>
        <div><div className="k">Satuan</div><div className="v">{spt.unit?.nama ?? '—'}</div></div>
        <div><div className="k">Mulai</div><div className="v">{tanggal(spt.tanggal_mulai)}</div></div>
        <div><div className="k">Batas waktu</div><div className="v">{tanggal(spt.tanggal_batas)}</div></div>
        <div><div className="k">Jenis kegiatan</div><div className="v">{spt.jenis_kegiatan}</div></div>
        <div><div className="k">Nomor LP</div><div className="v">{spt.nomor_lp ?? '—'}</div></div>
      </div>

      <div className="kisi k-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="kartu">
            <div className="kartu-h"><h3>Uraian tugas</h3></div>
            <div className="kartu-b">
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>
                {spt.uraian_tugas ?? 'Uraian tugas belum diisi.'}
              </p>
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-h">
              <h3>Dasar penugasan</h3>
              <span className="isyarat">{dasar.length} dasar</span>
            </div>
            <div className="kartu-b rata lok-daftar">
              {dasar.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-3)' }}>
                  Belum ada dasar penugasan.
                </div>
              ) : dasar.map(d => (
                <div className="lok" key={d.id}>
                  <div className="no">{d.urutan}</div>
                  <div className="meta">
                    <div className="nm">{LABEL_DASAR[d.jenis] ?? d.jenis}</div>
                    <div className="koord">{d.nomor ?? '—'}</div>
                    <div className="radius">{tanggal(d.tanggal)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rekam kegiatan berisi laporan harian — Modul 6.3. */}
          <section className="kartu">
            <div className="kartu-h"><h3>Rekam kegiatan</h3></div>
            <div className="kartu-b">
              <div className="kosong" style={{ padding: '20px 0' }}>
                <Ikon nama="masuk_kotak" />
                <h3>Belum ada laporan</h3>
                <p>Laporan kegiatan harian akan muncul di sini.</p>
              </div>
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="kartu">
            <div className="kartu-h">
              <h3>Titik lokasi</h3>
              <span className="isyarat">{lokasi.length} titik, berurutan</span>
            </div>
            <div className="kartu-b rata lok-daftar">
              {lokasi.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-3)' }}>
                  Belum ada titik lokasi.
                </div>
              ) : lokasi.map(l => (
                <div className="lok" key={l.id}>
                  <div className="no">{l.urutan}</div>
                  <div className="meta">
                    <div className="nm">{l.nama}</div>
                    {/* Titik tanpa koordinat BUKAN kekurangan data: ada
                        tempat yang memang tidak dapat dijatuhi pin. */}
                    <div className="koord">
                      {l.lat !== null && l.lng !== null
                        ? `${Number(l.lat).toFixed(4)}, ${Number(l.lng).toFixed(4)}`
                        : 'Tanpa titik koordinat'}
                    </div>
                    {l.radius_meter && <div className="radius">Radius {l.radius_meter} m</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-h">
              <h3>Pelaksana</h3>
              <span className="isyarat">
                {pelaksana.filter(p => !p.dicabut_pada).length} orang
              </span>
            </div>
            <div className="kartu-b rata daftar-orang">
              {pelaksana.map((p, i) => (
                <div className="dor" key={p.id} style={{ opacity: p.dicabut_pada ? 0.5 : 1 }}>
                  <div
                    className="av av-md"
                    style={{ background: WARNA_AVATAR[i % WARNA_AVATAR.length], color: '#fff' }}
                  >
                    {inisial(p.users?.nama ?? '?')}
                  </div>
                  <div className="meta">
                    <div className="nm">{p.users?.nama ?? '—'}</div>
                    <div className="st">
                      {p.dicabut_pada
                        ? 'Sudah dicabut dari penugasan ini'
                        : p.dibaca_pada
                          ? 'Sudah membuka penugasan'
                          : 'Belum membuka penugasan'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="kartu">
            <div className="kartu-h"><h3>Panit Penanggung Jawab</h3></div>
            <div className="kartu-b rata daftar-orang">
              {panit.map(p => (
                <div className="dor" key={p.id} style={{ opacity: p.dicabut_pada ? 0.5 : 1 }}>
                  <div
                    className="av av-md"
                    style={{ background: '#2563EB', color: '#fff' }}
                  >
                    {inisial(p.users?.nama ?? '?')}
                  </div>
                  <div className="meta">
                    <div className="nm">{p.users?.nama ?? '—'}</div>
                    <div className="st">
                      {p.dicabut_pada
                        ? 'Penunjukan sudah berakhir'
                        : 'Ditunjuk untuk penugasan ini'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
