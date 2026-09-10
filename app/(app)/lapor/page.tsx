import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { sptUntukLapor } from '@/lib/laporan/kueri'
import { FormulirLapor } from './formulir-lapor'

export const metadata = { title: 'Kirim Laporan — Si PANTAU' }

export default async function HalamanLapor() {
  const pengguna = await wajibkanSudahSiap()
  const daftarSpt = await sptUntukLapor(pengguna.id)

  return (
    <>
      <div className="kh">
        <div>
          <h1>Kirim laporan</h1>
          <p className="sub">
            Laporkan perkembangan kegiatan Anda di lapangan.
          </p>
        </div>
      </div>

      <FormulirLapor key={pengguna.id} penggunaId={pengguna.id} daftarSpt={daftarSpt} />
    </>
  )
}
