import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarPenugasan, type StatusSpt } from '@/lib/penugasan/kueri'
import { KartuSpt } from '@/components/sipantau/kartu-spt'
import { PenyaringPenugasan } from '@/components/sipantau/penyaring-penugasan'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Penugasan — Si PANTAU' }

const JUDUL: Record<string, string> = {
  anggota: 'Tugas saya',
  panit: 'Penugasan saya',
  kanit: 'Kelola penugasan',
  kasubdit: 'Semua penugasan',
  admin: 'Semua penugasan',
  pemeliharaan: 'Semua penugasan',
}

const SUB: Record<string, string> = {
  anggota: 'Penugasan yang ditujukan kepada Anda beserta status laporannya.',
  panit: 'Penugasan tempat Anda ditunjuk sebagai Panit Penanggung Jawab.',
  kanit: 'Penugasan pada unit Anda. Terbitkan surat perintah dan tunjuk pelaksana.',
  kasubdit: 'Seluruh penugasan penyelidikan lapangan pada Subdit IV.',
  admin: 'Seluruh penugasan penyelidikan lapangan pada Subdit IV.',
  pemeliharaan: 'Seluruh penugasan penyelidikan lapangan pada Subdit IV.',
}

// Daftar menampilkan yang AKTIF saja. Riwayat punya submenu tersendiri
// dengan penyaring bawaan enam bulan ke belakang.
const STATUS_AKTIF: StatusSpt[] = ['draf', 'baru', 'berjalan', 'bermasalah']

export default async function HalamanPenugasan({
  searchParams,
}: {
  searchParams: Promise<{ saring?: string; cari?: string }>
}) {
  // Independen — searchParams tidak butuh pengguna lebih dulu.
  const [pengguna, { saring, cari }] = await Promise.all([
    wajibkanSudahSiap(),
    searchParams,
  ])

  const status: StatusSpt[] =
    saring && saring !== 'semua' ? [saring as StatusSpt] : STATUS_AKTIF

  const daftar = await daftarPenugasan({ status, kueri: cari })

  return (
    <>
      <div className="kh">
        <div>
          <h1>{JUDUL[pengguna.peran]}</h1>
          <p className="sub">{SUB[pengguna.peran]}</p>
        </div>

        {/* BR-11: tombol Terbitkan hanya dirender untuk Kanit. Peran lain
            tidak melihatnya sama sekali, bukan melihatnya dalam keadaan
            nonaktif. Rutenya juga dijaga proxy.ts dan RLS. */}
        {pengguna.peran === 'kanit' && (
          <div className="kh-aksi">
            <Link href="/penugasan/terbitkan" className="btn btn-g">
              <Ikon nama="tambah" />
              Kelola penerbitan
            </Link>
          </div>
        )}
        {(pengguna.peran === 'anggota' || pengguna.peran === 'panit') && (
          <div className="kh-aksi">
            <Link href="/penugasan/scan" className="btn btn-g">
              <Ikon nama="kamera" />
              Ajukan scan SPRIN
            </Link>
          </div>
        )}
      </div>

      <PenyaringPenugasan saringAktif={saring ?? 'semua'} kueriAwal={cari ?? ''} />

      {daftar.length > 0 ? (
        <div className="kisi k-kartu">
          {daftar.map(spt => <KartuSpt key={spt.id} spt={spt} />)}
        </div>
      ) : (
        <div className="kartu">
          <div className="kosong">
            <Ikon nama="spt" />
            <h3>
              {cari || (saring && saring !== 'semua')
                ? 'Tidak ada penugasan yang cocok'
                : pengguna.peran === 'panit'
                  ? 'Anda belum ditunjuk pada penugasan mana pun'
                  : 'Belum ada penugasan aktif'}
            </h3>
            <p>
              {cari || (saring && saring !== 'semua')
                ? 'Ubah kata kunci pencarian atau pilih penyaring lain.'
                : pengguna.peran === 'panit'
                  ? 'Penugasan akan muncul di sini begitu Kanit menunjuk Anda sebagai Panit Penanggung Jawab.'
                  : pengguna.peran === 'kanit'
                    ? 'Terbitkan surat perintah tugas untuk memulai.'
                    : 'Penugasan akan muncul di sini begitu Anda dicantumkan sebagai pelaksana.'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
