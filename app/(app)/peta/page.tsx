import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { posisiPetaAwal, daftarSptUntukPeta, titikLokasiUntukPeta } from '@/lib/gps/kueri'
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
  const [posisiAwal, daftarSpt, titikLokasi] = await Promise.all([
    posisiPetaAwal(), daftarSptUntukPeta(), titikLokasiUntukPeta(),
  ])

  // Pin contoh untuk demo/presentasi — MURNI tampilan, tidak pernah
  // menyentuh posisi_terkini atau tabel mana pun. Aktif hanya lewat
  // ?contoh=1 di URL, ditempatkan dekat lokasi tugas SPT pertama yang
  // punya titik lokasi. Selalu berlabel "Contoh" di peta (lihat
  // PetaLangsung) supaya tidak pernah disalahartikan sebagai posisi
  // GPS sungguhan.
  const contohDemo = cari.contoh === '1' && titikLokasi.length > 0
    ? (() => {
        const t = titikLokasi[0]
        const dLat = 0.0009 // ~100 m ke utara
        const dLng = 0.0009 / Math.cos((t.lat * Math.PI) / 180) // ~100 m ke timur
        return { lat: t.lat + dLat, lng: t.lng + dLng, nama: 'Personel (contoh)' }
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

      <PetaLangsung posisiAwal={posisiAwal} daftarSpt={daftarSpt} titikLokasi={titikLokasi} fokus={fokus} contohDemo={contohDemo} />
    </>
  )
}
