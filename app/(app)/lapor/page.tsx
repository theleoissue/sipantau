import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { sptUntukLapor } from '@/lib/laporan/kueri'
import { idValid } from '@/lib/utils'
import { FormulirLapor } from './formulir-lapor'

export const metadata = { title: 'Kirim Laporan — Si PANTAU' }

export default async function HalamanLapor({ searchParams }: { searchParams: Promise<{ penugasan?: string }> }) {
  const pengguna = await wajibkanSudahSiap()
  const daftarSpt = await sptUntukLapor(pengguna.id)
  const cari = await searchParams
  const penugasanTerkunci = cari.penugasan && idValid(cari.penugasan) && daftarSpt.some(s => s.id === cari.penugasan)
    ? cari.penugasan
    : undefined

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

      <FormulirLapor key={`${pengguna.id}:${penugasanTerkunci ?? 'bebas'}`} penggunaId={pengguna.id} penggunaPeran={pengguna.peran} daftarSpt={daftarSpt} penugasanTerkunci={penugasanTerkunci} />
    </>
  )
}
