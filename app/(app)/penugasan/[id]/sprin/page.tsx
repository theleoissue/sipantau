import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { satuPenugasan } from '@/lib/penugasan/kueri'
import { TombolCetak } from './tombol-cetak'
import { idValid } from '@/lib/utils'

export const metadata = { title: 'Surat Perintah — Si PANTAU' }

const LABEL_DASAR: Record<string, string> = {
  laporan_informasi: 'Laporan Informasi',
  laporan_polisi: 'Laporan Polisi',
  laporan_pengaduan: 'Laporan Pengaduan',
  surat_perintah_terdahulu: 'Surat Perintah',
  disposisi_pimpinan: 'Disposisi Pimpinan',
  lainnya: 'Dasar lain',
}

function tglIndo(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso.length === 10 ? iso + 'T00:00:00' : iso))
}

/**
 * Konsep surat perintah tugas, siap dicetak.
 *
 * Formatnya mengikuti contoh SPRIN resmi yang diberikan pemilik produk:
 * judul "SURAT PERINTAH" (bukan "Surat Perintah Tugas"), tabel tim di
 * badan surat, dan blok tanda tangan berisi NRP lengkap.
 *
 * Ini BUKAN pengganti tanda tangan basah. Alurnya: cetak, tandatangani
 * secara fisik, pindai, lalu unggah kembali ke sistem — dan SPT tidak
 * dapat ditutup sebelum pindaian itu terlampir (BR-25).
 */
export default async function HalamanSprin({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!idValid(id)) notFound()
  // Independen — satuPenugasan(id) tidak butuh hasil wajibkanSudahSiap(),
  // hanya perlu penjagaannya (redirect bila belum siap).
  const [, spt] = await Promise.all([
    wajibkanSudahSiap(),
    satuPenugasan(id),
  ])
  if (!spt) notFound()

  const supabase = await klienServer()
  const { data: penerbit } = await supabase
    .from('users')
    .select('nama, pangkat, nrp')
    .eq('id', spt.diterbitkan_oleh ?? '')
    .maybeSingle<{ nama: string; pangkat: string | null; nrp: string }>()

  const lokasi = [...(spt.penugasan_lokasi ?? [])].sort((a, b) => a.urutan - b.urutan)
  const dasar = [...(spt.penugasan_dasar ?? [])].sort((a, b) => a.urutan - b.urutan)

  // Panit Penanggung Jawab lebih dulu, lalu pelaksana yang bukan Panit —
  // mengikuti urutan pada surat fisik.
  const panitAktif = (spt.penugasan_panit ?? []).filter(p => !p.dicabut_pada)
  const idPanit = new Set(panitAktif.map(p => p.panit_id))
  const tim = [
    ...panitAktif.map(p => ({
      kunci: p.id, orang: p.users, kedudukan: 'Panit Penanggung Jawab',
    })),
    ...(spt.penugasan_pelaksana ?? [])
      .filter(p => !p.dicabut_pada && !idPanit.has(p.pelaksana_id))
      .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
      .map(p => ({ kunci: p.id, orang: p.users, kedudukan: 'Pelaksana' })),
  ]

  return (
    <>
      <Link
        href={`/penugasan/${spt.id}`}
        className="back-link"
        style={{ display: 'inline-block', marginBottom: 14, color: 'var(--ink-2)',
                 fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
      >
        ← Kembali ke rincian penugasan
      </Link>

      <div className="sprin-catatan">
        Konsep surat perintah tugas — cetak, tandatangani secara fisik,
        pindai, lalu unggah kembali ke sistem. Bukan pengganti tanda
        tangan basah.
      </div>

      <div className="sprin-toolbar-aksi"
           style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <TombolCetak />
      </div>

      <div className="sprin-lembar">
        <div className="sprin-kop">
          <Image
            src="/lambang-polri.png"
            alt="Lambang Kepolisian Negara Republik Indonesia"
            width={78}
            height={72}
            className="sprin-lambang"
            priority
          />
          <div className="teks-kop">
            <div className="l1">Kepolisian Negara Republik Indonesia</div>
            <div className="l2">Daerah Jawa Barat</div>
            <div className="l3">Direktorat Reserse Kriminal Khusus</div>
          </div>
        </div>

        <div className="sprin-judul">
          <h2>Surat Perintah</h2>
          <div className="no">Nomor : {spt.nomor_spt ?? '—'}</div>
        </div>

        <div className="sprin-baris">
          <div className="lbl">Pertimbangan</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            Bahwa untuk kepentingan dinas Kepolisian {spt.unit?.nama ?? ''} Subdit IV
            Ditreskrimsus Polda Jawa Barat, dipandang perlu mengeluarkan surat
            perintah ini.
          </div>
        </div>

        <div className="sprin-baris">
          <div className="lbl">Dasar</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            <ol style={{ marginLeft: 16 }}>
              {dasar.length === 0 ? (
                <li>—</li>
              ) : dasar.map(d => (
                <li key={d.id}>
                  {LABEL_DASAR[d.jenis] ?? d.jenis} Nomor {d.nomor ?? '—'}
                  {d.tanggal ? ` tanggal ${tglIndo(d.tanggal)}` : ''}
                  {d.keterangan ? `, ${d.keterangan}` : ''}.
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase',
                    margin: '20px 0 14px', letterSpacing: '.02em' }}>
          Diperintahkan
        </p>

        <div className="sprin-baris">
          <div className="lbl">Kepada</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            <table className="sprin-tabel">
              <thead>
                <tr>
                  <th className="c-no">No</th>
                  <th className="c-nama">Nama</th>
                  <th className="c-pangkat">Pangkat / NRP</th>
                  <th className="c-jab">Kedudukan</th>
                </tr>
              </thead>
              <tbody>
                {tim.map((t, i) => (
                  <tr key={t.kunci}>
                    <td className="c-no">{i + 1}</td>
                    <td className="c-nama">{t.orang?.nama ?? '—'}</td>
                    <td className="c-pangkat">
                      {t.orang?.pangkat ?? '—'}
                      <br />
                      {/* NRP diambil dari baris users, bukan diketik ulang. */}
                      NRP {t.orang?.nrp ?? '—'}
                    </td>
                    <td className="c-jab">{t.kedudukan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sprin-baris" style={{ marginTop: 16 }}>
          <div className="lbl">Untuk</div>
          <div className="titik-dua">:</div>
          <div className="isi">
            <ol className="sprin-daftar">
              <li>
                Melaksanakan {spt.jenis_kegiatan} terhadap <b>{spt.objek ?? '—'}</b>
                {spt.sasaran ? <> dengan sasaran <b>{spt.sasaran}</b></> : null}
                {spt.nomor_lp ? `, terkait Laporan Polisi Nomor ${spt.nomor_lp}` : ''}.
              </li>
              {spt.uraian_tugas && <li>{spt.uraian_tugas}</li>}
              <li>
                Melaksanakan tugas pada tempat sebagai berikut:
                <ol style={{ marginLeft: 18, listStyle: 'lower-alpha' }}>
                  {lokasi.map(l => <li key={l.id}>{l.nama}.</li>)}
                </ol>
              </li>
              <li>
                Melaksanakan tugas terhitung mulai tanggal{' '}
                <b>{tglIndo(spt.tanggal_mulai)}</b> sampai dengan{' '}
                <b>{tglIndo(spt.tanggal_batas)}</b>.
              </li>
              <li>Mengadakan koordinasi dan kerja sama sebaik-baiknya dengan unsur terkait.</li>
              <li>Melaksanakan perintah ini dengan penuh rasa tanggung jawab.</li>
            </ol>
          </div>
        </div>

        <p style={{ marginTop: 14 }}>Selesai.</p>

        <div className="sprin-ttd-wrap">
          <div className="kotak">
            <div>Dikeluarkan di : Bandung</div>
            <div>Pada tanggal&nbsp;&nbsp; : {tglIndo(spt.diterbitkan_pada ?? spt.tanggal_mulai)}</div>
            <div className="jabatan-ttd">
              Kepala {spt.unit?.nama ?? 'Unit'}
              <br />
              Subdit IV Ditreskrimsus
            </div>
            {/* Ruang kosong untuk tanda tangan dan cap basah. Sengaja
                TIDAK diisi gambar cap tiruan — surat ini konsep, dan
                cap palsu pada konsep surat dinas adalah masalah
                tersendiri. */}
            <div style={{ height: 78 }} />
            <div className="nama-ttd">{penerbit?.nama ?? '—'}</div>
            <div>{penerbit?.pangkat ?? ''} NRP {penerbit?.nrp ?? '—'}</div>
          </div>
        </div>
      </div>
    </>
  )
}
