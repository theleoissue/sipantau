import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { posisiPetaAwal, daftarSptUntukPeta, titikLokasiUntukPeta } from '@/lib/gps/kueri'
import { PetaLangsung } from '@/components/sipantau/peta-langsung'

export const metadata = { title: 'Peta Lapangan — Si PANTAU' }

export default async function HalamanPeta({ searchParams }: { searchParams: Promise<{ lat?: string; lng?: string }> }) {
  const pengguna = await wajibkanSudahSiap()
  const cari = await searchParams
  const lat = Number(cari.lat)
  const lng = Number(cari.lng)
  const fokus = Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    ? { lat, lng } : undefined
  const [posisiAwal, daftarSpt, titikLokasi] = await Promise.all([
    posisiPetaAwal(), daftarSptUntukPeta(), titikLokasiUntukPeta(),
  ])

  const sub = (pengguna.peran === 'kasubdit' || pengguna.peran === 'admin')
    ? 'Peta seluruh unit di bawah Subdit IV.'
    : pengguna.peran === 'kanit'
    ? 'Peta unit Anda.'
    : pengguna.peran === 'panit'
    ? 'Peta penugasan yang Anda awasi.'
    : 'Posisi Anda dan rekan pelaksana aktif pada penugasan yang sama.'

  return (
    <>
      <div className="kh">
        <div>
          <h1>Peta lapangan</h1>
          <p className="sub">{fokus ? 'Menampilkan titik pengambilan foto dokumentasi.' : `${sub} Pelacakan hanya berjalan selama Sesi Tugas dibuka.`}</p>
        </div>
      </div>

      <PetaLangsung posisiAwal={posisiAwal} daftarSpt={daftarSpt} titikLokasi={titikLokasi} fokus={fokus} />
    </>
  )
}
