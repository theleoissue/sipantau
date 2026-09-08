import Link from 'next/link'
import { LABEL_JENIS_LAPORAN, type LaporanLengkap, type StatusLaporan } from '@/lib/laporan/tipe'
import { inisial } from '@/lib/utils'
import { Ikon } from './ikon'

export type RingkasanLaporan = Pick<LaporanLengkap,
  'id' | 'jenis' | 'uraian' | 'status_laporan' | 'dikirim_pada' | 'penugasan' | 'pelapor' | 'foto_dokumentasi'>

const STATUS: Record<StatusLaporan, { label: string; warna: string }> = {
  terkirim: { label: 'Menunggu tinjauan', warna: 'baru' },
  perlu_diperbaiki: { label: 'Perlu perbaikan', warna: 'berjalan' },
  disetujui: { label: 'Disetujui', warna: 'selesai' },
  ditarik: { label: 'Ditarik', warna: 'dibatalkan' },
}

function waktu(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

/** Informasi yang sama pada HP dan desktop, tanpa kolom tersembunyi. */
export function DaftarKartuLaporan({ daftar }: { daftar: RingkasanLaporan[] }) {
  return (
    <section className="laporan-masuk" aria-labelledby="judul-laporan-masuk">
      <div className="laporan-masuk-kepala">
        <div><h2 id="judul-laporan-masuk">Laporan masuk</h2><span className="laporan-jumlah" aria-label={`${daftar.length} laporan`}>{daftar.length}</span></div>
        {daftar.length > 1 && <p>Terbaru lebih dulu</p>}
      </div>
      {daftar.length === 0 ? (
        <div className="kartu kosong laporan-kosong">
          <Ikon nama="masuk_kotak" />
          <h3>Belum ada laporan masuk</h3>
          <p>Laporan dari pelaksana akan tampil di sini begitu dikirim dari lapangan.</p>
        </div>
      ) : (
        <div className="laporan-kisi">
          {daftar.map(r => {
            const status = STATUS[r.status_laporan]
            return (
              <article className="laporan-kartu" key={r.id} aria-labelledby={`laporan-${r.id}`}>
                <div className="laporan-kartu-atas">
                  <span className="laporan-jenis"><Ikon nama="lapor" />{LABEL_JENIS_LAPORAN[r.jenis]}</span>
                  <span className={`lc ${status.warna}`}>{status.label}</span>
                </div>
                <div className="laporan-pelapor">
                  <div className="av" aria-hidden="true">{inisial(r.pelapor?.nama ?? '?')}</div>
                  <div>
                    <h3 id={`laporan-${r.id}`}>{r.pelapor?.nama ?? 'Pelapor tidak tersedia'}</h3>
                    <time dateTime={r.dikirim_pada}>{waktu(r.dikirim_pada)} WIB</time>
                  </div>
                </div>
                <p className="laporan-ringkasan">{r.uraian}</p>
                <div className="laporan-penugasan">
                  <Ikon nama="spt" />
                  <div>
                    <span className="laporan-label">Penugasan</span>
                    <p className="spt-id">{r.penugasan?.nomor_spt ?? 'Nomor SPT belum tersedia'}</p>
                    {r.penugasan?.judul && <p className="laporan-judul-spt">{r.penugasan.judul}</p>}
                  </div>
                </div>
                <div className="laporan-kartu-kaki">
                  <span className="laporan-foto"><Ikon nama="gambar" />{r.foto_dokumentasi.length ? `${r.foto_dokumentasi.length} foto` : 'Tanpa foto'}</span>
                  <Link href={`/laporan/${r.id}`} className="btn btn-p"
                    aria-label={`Lihat laporan ${r.pelapor?.nama ?? ''}, ${waktu(r.dikirim_pada)}`}>
                    Lihat laporan<Ikon nama="mata" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
