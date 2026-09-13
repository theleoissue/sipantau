import { notFound } from 'next/navigation'
import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { satuLaporan, LABEL_JENIS_LAPORAN, LABEL_ALASAN_LOKASI } from '@/lib/laporan/kueri'
import { PanelCatatan } from '@/components/sipantau/panel-catatan'
import { FormulirSuntingLaporan } from '@/components/sipantau/formulir-sunting-laporan'
import { UnggahFoto } from '@/components/sipantau/unggah-foto'
import { Ikon } from '@/components/sipantau/ikon'
import { idValid } from '@/lib/utils'

export const metadata = { title: 'Rincian Laporan — Si PANTAU' }

const LABEL_STATUS_LOKASI: Record<string, string> = {
  terverifikasi: 'Terverifikasi di lokasi',
  di_luar_titik: 'Terekam di luar titik',
  tidak_terekam: 'Lokasi tidak terekam',
}

function waktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

export default async function RincianLaporan({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!idValid(id)) notFound()
  // Dua ini tidak saling bergantung — satuLaporan(id) tidak butuh pengguna,
  // baru dipakai belakangan untuk cek akuPelapor dkk.
  const [pengguna, laporan] = await Promise.all([
    wajibkanSudahSiap(),
    satuLaporan(id),
  ])
  if (!laporan) notFound()

  const supabase = await klienServer()

  // Tautan bermasa berlaku terbatas — 15 menit untuk penayangan biasa
  // (docs/01-koreksi.md I.9). Wadah tertutup, tidak pernah tautan tetap.
  const foto = await Promise.all(
    laporan.foto_dokumentasi.map(async f => {
      const { data } = await supabase.storage
        .from('dokumentasi')
        .createSignedUrl(f.berkas_path, 900)
      return { ...f, url: data?.signedUrl ?? null }
    }),
  )

  const akuPelapor = laporan.pelapor_id === pengguna.id
  const terkunci = laporan.status_laporan === 'disetujui' || laporan.status_laporan === 'ditarik'
  const bolehMencatat =
    !akuPelapor && ['panit', 'kanit', 'kasubdit', 'admin'].includes(pengguna.peran)
  const bolehSetujui = !akuPelapor && pengguna.peran === 'kanit'
  const bolehTarik = akuPelapor
  const bolehSunting = akuPelapor && !terkunci
  const bolehTambahFoto =
    akuPelapor && ['terkirim', 'perlu_diperbaiki'].includes(laporan.status_laporan)

  return (
    <main className="laporan-rincian">
      <div className="kh laporan-rincian-kepala">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="spt-id">{laporan.penugasan?.nomor_spt ?? '—'}</span>
            <span className={`lc ${laporan.status_laporan === 'disetujui' ? 'selesai'
              : laporan.status_laporan === 'ditarik' ? 'dibatalkan'
              : laporan.status_laporan === 'perlu_diperbaiki' ? 'bermasalah' : 'berjalan'}`}>
              {laporan.status_laporan.replace('_', ' ')}
            </span>
          </div>
          <h1>{LABEL_JENIS_LAPORAN[laporan.jenis]}</h1>
          <p className="sub">
            {laporan.pelapor?.nama ?? '—'} · {waktu(laporan.dikirim_pada)}
            {laporan.disunting_pada && ` · disunting (${laporan.jumlah_suntingan}×)`}
          </p>
        </div>

        <div className="kh-aksi">
          {bolehSunting && (
            <FormulirSuntingLaporan
              laporanId={laporan.id}
              uraianAwal={laporan.uraian}
              kendalaAwal={laporan.kendala ?? ''}
              statusAwal={laporan.status_kegiatan}
            />
          )}
        </div>
      </div>

      {laporan.status_laporan === 'ditarik' && (
        <div className="kartu" style={{ marginBottom: 18, borderLeft: '3px solid var(--red)' }}>
          <div className="kartu-b" style={{ color: 'var(--red)', fontSize: 13 }}>
            Laporan ini ditarik pelapornya.
          </div>
        </div>
      )}

      <div className="kisi k-2">
        <div className="laporan-rincian-utama">
          {/* Kotak lokasi: tiga fakta berdampingan, tidak menyimpulkan. */}
          <section className="kartu laporan-lokasi">
            <div className="kartu-h"><h3>Lokasi</h3></div>
            <div className="kartu-b">
              <div className="rk">
                <div>
                  <div className="k">Status</div>
                  <div className="v">
                    {laporan.status_lokasi ? LABEL_STATUS_LOKASI[laporan.status_lokasi] : '—'}
                  </div>
                </div>
                {laporan.jarak_meter !== null && (
                  <div>
                    <div className="k">Jarak ke titik terdekat</div>
                    <div className="v">{Math.round(laporan.jarak_meter)} m ({laporan.lokasi_terdekat?.nama ?? '—'})</div>
                  </div>
                )}
                {laporan.lokasi_pilihan && (
                  <div>
                    <div className="k">Titik yang ditunjuk pelapor</div>
                    <div className="v">{laporan.lokasi_pilihan.nama}</div>
                  </div>
                )}
                {laporan.akurasi_meter !== null && (
                  <div>
                    <div className="k">Ketelitian GPS</div>
                    <div className="v">±{Math.round(laporan.akurasi_meter)} m</div>
                  </div>
                )}
                {laporan.alasan_lokasi && (
                  <div>
                    <div className="k">Alasan lokasi tidak terekam</div>
                    <div className="v">
                      {laporan.alasan_lokasi === 'lainnya'
                        ? laporan.alasan_lokasi_lainnya
                        : LABEL_ALASAN_LOKASI[laporan.alasan_lokasi]}
                    </div>
                  </div>
                )}
              </div>
              {laporan.keterangan_lokasi && (
                <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 12 }}>
                  Keterangan pelapor: {laporan.keterangan_lokasi}
                </p>
              )}
            </div>
          </section>

          <section className="kartu laporan-uraian">
            <div className="kartu-h"><h3>Uraian kegiatan</h3></div>
            <div className="kartu-b">
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>
                {laporan.uraian}
              </p>
              {laporan.kendala && (
                <>
                  <div className="k" style={{ marginTop: 14 }}>Kendala</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)', marginTop: 4 }}>
                    {laporan.kendala}
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="kartu laporan-foto">
            <div className="kartu-h">
              <div><span className="laporan-bagian">Bukti lapangan</span><h3>Foto dokumentasi</h3></div>
              <span className="isyarat">{foto.length} foto</span>
            </div>
            <div className="kartu-b">
              {bolehTambahFoto && (
                <UnggahFoto laporanId={laporan.id} penugasanId={laporan.penugasan_id} />
              )}

              {foto.length > 0 && <div className="laporan-foto-grid">
                {foto.map((f, i) => {
                  const berkoordinat = f.lat !== null && f.lng !== null
                  return <a key={f.id} className="laporan-foto-item" href={f.url ?? '#'} target="_blank" rel="noreferrer">
                    <div className="laporan-foto-gambar">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {f.url && <img src={f.url} alt={f.keterangan ?? `Dokumentasi ${i + 1}`} />}
                      <span className={`laporan-foto-status ${berkoordinat ? 'ada' : ''}`}><Ikon nama="pin" />{berkoordinat ? 'Titik terekam' : 'Tanpa titik'}</span>
                    </div>
                    <div className="laporan-foto-meta">
                      <strong>{f.keterangan || `Dokumentasi ${i + 1}`}</strong>
                      <span>{f.diambil_pada ? waktu(f.diambil_pada) : f.sumber === 'kamera' ? 'Waktu pengambilan tidak terekam' : 'Lampiran dari galeri'}</span>
                      {berkoordinat ? <small><Ikon nama="pin" />{f.lat!.toFixed(5)}, {f.lng!.toFixed(5)}</small> : <small>Lokasi foto tidak tersedia</small>}
                    </div>
                  </a>
                })}
              </div>}

              {foto.length === 0 && !bolehTambahFoto && (
                <div className="kosong" style={{ padding: '18px 0' }}>
                  <Ikon nama="gambar" />
                  <h3>Tidak ada foto dilampirkan</h3>
                </div>
              )}
            </div>
          </section>
        </div>

        <div>
          <PanelCatatan
            laporanId={laporan.id}
            catatan={laporan.catatan_laporan}
            bolehMencatat={bolehMencatat}
            bolehSetujui={bolehSetujui}
            bolehTarik={bolehTarik}
            terkunci={terkunci}
          />
        </div>
      </div>

      <div className="laporan-rincian-kembali">
        <Link href={`/penugasan/${laporan.penugasan_id}`} className="btn btn-o">
          Kembali ke penugasan
        </Link>
      </div>
    </main>
  )
}
