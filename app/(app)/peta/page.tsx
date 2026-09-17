import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { posisiPetaAwal, daftarSptUntukPeta, titikLokasiUntukPeta } from '@/lib/gps/kueri'
import { titikLaporanUntukPeta } from '@/lib/laporan/kueri'
import { PetaLangsung } from '@/components/sipantau/peta-langsung'
import { idValid } from '@/lib/utils'

export const metadata = { title: 'Peta Lapangan — Si PANTAU' }

export default async function HalamanPeta({ searchParams }: { searchParams: Promise<{ lat?: string; lng?: string; laporan?: string; contoh?: string }> }) {
  const pengguna = await wajibkanSudahSiap()
  const cari = await searchParams
  const lat = Number(cari.lat)
  const lng = Number(cari.lng)
  const fokus = Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    ? { lat, lng, laporanId: cari.laporan && idValid(cari.laporan) ? cari.laporan : undefined } : undefined
  const [posisiAwal, daftarSpt, titikLokasi, titikLaporan] = await Promise.all([
    posisiPetaAwal(), daftarSptUntukPeta(), titikLokasiUntukPeta(), titikLaporanUntukPeta(),
  ])

  // Lima pin contoh untuk demo/presentasi — MURNI tampilan, tidak
  // pernah menyentuh posisi_terkini atau tabel mana pun. Aktif hanya
  // lewat ?contoh=1 di URL, disebar di sekitar lokasi tugas SPT
  // pertama yang punya titik lokasi. Nama generik ("Personel Contoh
  // N"), dan keterangannya (lihat PetaLangsung) tetap menyatakan ini
  // ilustrasi — hanya lebih halus, bukan peringatan mencolok.
  const contohDemo = cari.contoh === '1' && titikLokasi.length > 0
    ? (() => {
        const t = titikLokasi[0]
        const meterKeDerajat = (meter: number) => meter / 111_320
        const sebaran = [
          { sudut: 20, jarak: 90 },
          { sudut: 100, jarak: 130 },
          { sudut: 190, jarak: 110 },
          { sudut: 260, jarak: 150 },
          { sudut: 330, jarak: 100 },
        ]
        return sebaran.map((s, i) => {
          const rad = (s.sudut * Math.PI) / 180
          const dLat = meterKeDerajat(s.jarak) * Math.cos(rad)
          const dLng = (meterKeDerajat(s.jarak) * Math.sin(rad)) / Math.cos((t.lat * Math.PI) / 180)
          return { lat: t.lat + dLat, lng: t.lng + dLng, nama: `Personel Contoh ${i + 1}` }
        })
      })()
    : undefined

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

      <PetaLangsung posisiAwal={posisiAwal} daftarSpt={daftarSpt} titikLokasi={titikLokasi} titikLaporan={titikLaporan} fokus={fokus} contohDemo={contohDemo} />
    </>
  )
}
