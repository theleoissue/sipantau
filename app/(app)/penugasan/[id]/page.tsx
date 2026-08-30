import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { satuPenugasan, lewatBatas, hariTerlampaui, riwayatPerpanjangan, bolehHapusPermanen } from '@/lib/penugasan/kueri'
import { ruteSptDenganTitik } from '@/lib/gps/kueri'
import { daftarLhp } from '@/lib/lhp/kueri'
import { riwayatLaporanSaya } from '@/lib/laporan/kueri'
import { catatTandaTerima } from '../aksi'
import { Ikon } from '@/components/sipantau/ikon'
import { RuteSpt } from '@/components/sipantau/rute-spt'
import { AksiSpt } from '@/components/sipantau/aksi-spt'
import { KelolaTim } from '@/components/sipantau/kelola-tim'
import { TombolSusunLhp } from '@/components/sipantau/tombol-susun-lhp'
import { daftarPersonel } from '@/lib/personel/kueri'
import { inisial } from '@/lib/utils'

const LABEL_JENIS_MASALAH: Record<string, string> = {
  alamat_sasaran_fiktif: 'Alamat atau sasaran fiktif',
  objek_tidak_ditemukan: 'Objek tidak ditemukan di lokasi',
  informasi_tidak_sesuai: 'Informasi awal tidak sesuai kenyataan',
  kendala_keamanan: 'Situasi tidak memungkinkan karena alasan keamanan',
  sasaran_berpindah: 'Sasaran berpindah tempat',
  kendala_perangkat_jaringan: 'Kendala perangkat atau jaringan',
  lainnya: 'Lainnya',
}

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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ belumTerbit?: string }>
}) {
  const { id } = await params
  const { belumTerbit } = await searchParams
  const pengguna = await wajibkanSudahSiap()

  // Ketiganya lepas satu sama lain (hanya butuh `id`, bukan hasil satu
  // sama lain) — sebelumnya ditulis menunggu tiga giliran berurutan,
  // padahal bisa serentak. catatTandaTerima murni efek samping (tanda
  // terima otomatis saat pelaksana pertama kali membuka rincian, bukan
  // tombol terpisah) dan kegagalannya memang tidak boleh menghalangi
  // halaman tampil, jadi aman dijalankan bersamaan dengan pembacaan.
  const [spt, rute] = await Promise.all([
    satuPenugasan(id),
    ruteSptDenganTitik(id),
    catatTandaTerima(id),
  ])

  if (!spt) notFound()

  const lokasi = [...(spt.penugasan_lokasi ?? [])].sort((a, b) => a.urutan - b.urutan)
  const dasar = [...(spt.penugasan_dasar ?? [])].sort((a, b) => a.urutan - b.urutan)
  const pelaksana = (spt.penugasan_pelaksana ?? [])
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  const panit = spt.penugasan_panit ?? []
  const telat = lewatBatas(spt)

  const akuPelaksana = pelaksana.some(
    p => p.pelaksana_id === pengguna.id && !p.dicabut_pada)
  const akuPanitAktif = panit.some(
    p => p.panit_id === pengguna.id && !p.dicabut_pada)
  const akuKanitPemilik = pengguna.peran === 'kanit' && spt.unit_id === pengguna.unit_id

  const [riwayatPerpanjang, bolehHapus, personel, lhpSpt, laporanSaya] = await Promise.all([
    riwayatPerpanjangan(id),
    akuKanitPemilik ? bolehHapusPermanen(id) : Promise.resolve(false),
    akuKanitPemilik ? daftarPersonel() : Promise.resolve([]),
    daftarLhp({ penugasanId: id }),
    akuPelaksana ? riwayatLaporanSaya(pengguna.id) : Promise.resolve([]),
  ])
  const bolehUbahTim = akuKanitPemilik && !['selesai', 'dibatalkan'].includes(spt.status)

  // Auto-isi LHP Ringkas (docs/00-fondasi.md §6.8 "Pembagian pengisian")
  // — dihitung di sini dari data yang sudah ada, dikirim ke tombol
  // klien apa adanya. Sesi Tugas milik pengguna sendiri dipakai untuk
  // waktu_kegiatan; boleh kosong bila belum pernah dibuka (§8.7).
  const sesiSaya = [...rute.sesi]
    .filter(s => s.pengguna_id === pengguna.id)
    .sort((a, b) => new Date(b.dibuka_pada).getTime() - new Date(a.dibuka_pada).getTime())[0]
  const waktuKegiatanOtomatis = sesiSaya
    ? `Pada hari ${new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(sesiSaya.dibuka_pada))}, sekira pukul ${new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(sesiSaya.dibuka_pada))} s.d. ${sesiSaya.ditutup_pada ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(sesiSaya.ditutup_pada)) : 'selesai'} WIB.`
    : ''
  const tempatKegiatanOtomatis = lokasi.map(l => l.nama).join(', ')
  const dasarOtomatis = spt.nomor_spt ? `Surat Perintah Tugas Nomor: ${spt.nomor_spt}` : ''

  // Laporan Harian sebagai "bahan utama" LHP (docs/30-modul-6.3-pelaporan.md
  // baris 442) — draf awal Kronologis, bukan versi final. Hanya laporan
  // pada SPT INI, milik pengguna sendiri, diurutkan waktu kirim.
  const kronologisOtomatis = laporanSaya
    .filter(l => l.penugasan_id === id)
    .sort((a, b) => new Date(a.dikirim_pada).getTime() - new Date(b.dikirim_pada).getTime())
    .map(l => `${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(l.dikirim_pada))} WIB — ${l.uraian}`)
    .join('\n\n')

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
          {/* KP-6.2-43: SPT selesai/dibatalkan sama sekali tidak
              menampilkan tombol sunting. Draf disunting lewat wizard
              yang sama (bukan halaman "Sunting" terpisah — itu belum
              dibangun, khusus SPT yang sudah terbit, KP-6.2-38..43). */}
          {akuKanitPemilik && spt.status === 'draf' && (
            <Link href={`/penugasan/terbitkan/${spt.id}`} className="btn btn-p">
              <Ikon nama="lapor" />
              Sunting Draf
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

      {belumTerbit && (
        <div className="kartu" style={{ marginBottom: 18, borderLeft: '3px solid var(--amber)' }}>
          <div className="kartu-b">
            <strong style={{ fontSize: 13, color: '#B45309' }}>Draf tersimpan, belum diterbitkan</strong>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.6 }}>{belumTerbit}</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <AksiSpt
          penugasanId={spt.id}
          status={spt.status}
          berkasAda={!!spt.berkas_surat_path}
          isKanitPemilik={akuKanitPemilik}
          isKasubdit={pengguna.peran === 'kasubdit'}
          isPelaksanaAktif={akuPelaksana}
          isPanitAktif={akuPanitAktif}
          bolehHapus={bolehHapus}
        />
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

      {/* Prinsip 0.6: menyatakan kejadian dan uraiannya, bukan menuduh. */}
      {spt.status === 'bermasalah' && spt.uraian_masalah && (
        <div className="kartu" style={{ marginBottom: 18, borderLeft: '3px solid var(--amber)' }}>
          <div className="kartu-b">
            <strong style={{ fontSize: 13, color: '#B45309' }}>
              Penugasan ditandai bermasalah — {spt.jenis_masalah ? LABEL_JENIS_MASALAH[spt.jenis_masalah] : '—'}
            </strong>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.6 }}>
              {spt.uraian_masalah}
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

          {/* LHP Ringkas — Modul 6.8. Menyusun HANYA Anggota pelaksana
              aktif (BR-11); Kanit/Panit/Kasubdit di sini murni melihat. */}
          <section className="kartu">
            <div className="kartu-h">
              <h3>LHP Ringkas</h3>
              <span className="isyarat">{lhpSpt.length} berkas</span>
            </div>
            <div className="kartu-b">
              {akuPelaksana && (
                <div style={{ marginBottom: lhpSpt.length > 0 ? 14 : 0 }}>
                  <TombolSusunLhp
                    penugasanId={spt.id}
                    dasar={dasarOtomatis}
                    waktuKegiatan={waktuKegiatanOtomatis}
                    tempatKegiatan={tempatKegiatanOtomatis}
                    kronologisAwal={kronologisOtomatis}
                  />
                </div>
              )}
              {lhpSpt.length === 0 ? (
                !akuPelaksana && (
                  <div className="kosong" style={{ padding: '20px 0' }}>
                    <Ikon nama="berkas" />
                    <h3>Belum ada LHP Ringkas</h3>
                    <p>LHP Ringkas yang disusun Anggota pelaksana akan tampil di sini.</p>
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lhpSpt.map(l => (
                    <Link
                      key={l.id} href={`/lhp/${l.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 10, padding: '10px 12px', border: '1px solid var(--line)',
                        borderRadius: 8, textDecoration: 'none',
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--ink)' }}>
                        {l.perkara ? l.perkara.slice(0, 40) : 'Belum diisi'} · {l.penyusun?.nama ?? '—'}
                      </span>
                      <span className={`lc ${l.status === 'final' ? 'selesai' : 'draf'}`}>
                        {l.status === 'final' ? 'final' : 'draf'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
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

          {bolehUbahTim && (
            <section className="kartu">
              <div className="kartu-h"><h3>Kelola Tim</h3></div>
              <div className="kartu-b">
                <KelolaTim
                  penugasanId={spt.id} pelaksana={pelaksana} panit={panit}
                  personelTersedia={personel} bolehUbah={bolehUbahTim}
                />
              </div>
            </section>
          )}

          {riwayatPerpanjang.length > 0 && (
            <section className="kartu">
              <div className="kartu-h">
                <h3>Riwayat Perpanjangan</h3>
                <span className="isyarat">{riwayatPerpanjang.length} kali</span>
              </div>
              <div className="kartu-b rata">
                {riwayatPerpanjang.map(r => (
                  <div key={r.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {tanggal(r.tanggal_lama)} → {tanggal(r.tanggal_baru)}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 3 }}>{r.alasan}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                      {r.users?.nama ?? '—'} · {tanggal(r.diubah_pada)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <section className="kartu" style={{ marginTop: 16 }}>
        <div className="kartu-h">
          <h3>Rute</h3>
          <span className="isyarat">{rute.sesi.length} sesi</span>
        </div>
        <div className="kartu-b">
          <RuteSpt sesi={rute.sesi} titikPerSesi={rute.titikPerSesi} lokasiSpt={lokasi} />
        </div>
      </section>
    </>
  )
}
