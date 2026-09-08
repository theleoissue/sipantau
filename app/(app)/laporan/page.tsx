import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarLaporan } from '@/lib/laporan/kueri'
import { DaftarKartuLaporan } from '@/components/sipantau/daftar-kartu-laporan'

export const metadata = { title: 'Laporan — Si PANTAU' }

const JUDUL: Record<string, string> = {
  kanit: 'Semua Laporan', panit: 'Tinjau Laporan', kasubdit: 'Semua Laporan', admin: 'Semua Laporan',
}
const SUB: Record<string, string> = {
  kanit: 'Pantau laporan lapangan dan tindak lanjut pelaksana unit Anda.',
  panit: 'Laporan dari pelaksana pada penugasan yang Anda tanggungjawabi.',
  kasubdit: 'Laporan lapangan dari seluruh unit Subdit IV.',
  admin: 'Laporan lapangan dari seluruh unit Subdit IV.',
}

export default async function HalamanDaftarLaporan() {
  // Lingkup data tetap dijaga RLS; desain kartu tidak mengubah hak akses.
  const [pengguna, daftar] = await Promise.all([wajibkanSudahSiap(), daftarLaporan()])
  return (
    <>
      <div className="kh">
        <div>
          <h1>{JUDUL[pengguna.peran] ?? 'Laporan'}</h1>
          <p className="sub">{SUB[pengguna.peran] ?? ''}</p>
        </div>
      </div>
      <DaftarKartuLaporan daftar={daftar} />
    </>
  )
}
