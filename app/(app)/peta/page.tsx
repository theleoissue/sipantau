import 'leaflet/dist/leaflet.css'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { posisiPetaAwal, daftarSptUntukPeta, titikLokasiUntukPeta } from '@/lib/gps/kueri'
import { PetaLangsung } from '@/components/sipantau/peta-langsung'
import { LencanaPiket } from '@/components/sipantau/lencana-piket'
import { piketPada } from '@/lib/piket/kueri'
import { hariIniJakarta } from '@/lib/piket/tipe'
import { daftarUnitAktif } from '@/lib/piket/kueri'

export const metadata = { title: 'Peta Lapangan — Si PANTAU' }

export default async function HalamanPeta() {
  const pengguna = await wajibkanSudahSiap()
  const [posisiAwal, daftarSpt, titikLokasi, piket, unit] = await Promise.all([
    posisiPetaAwal(), daftarSptUntukPeta(), titikLokasiUntukPeta(),
    piketPada(hariIniJakarta()), daftarUnitAktif(),
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
          <p className="sub">{sub} Pelacakan hanya berjalan selama Sesi Tugas dibuka.</p>
        </div>
      </div>

      {/* Keadaan piket hari ini. Menjawab pertanyaan yang selalu muncul
          saat melihat peta: siapa yang MEMANG sedang giliran, dan siapa
          yang sedang Lepas Dinas. Hilang dengan sendirinya bila jadwal
          bulan ini belum disusun — modul tambahan tidak boleh
          meninggalkan ruang kosong pada halaman yang sudah berjalan. */}
      {piket.size > 0 && (
        <div className="piket-ket" style={{ marginBottom: 12 }}>
          {unit.map(u => (
            <span key={u.id}>
              <b style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.nama}</b>{' '}
              <LencanaPiket keadaan={piket.get(u.id)} />
            </span>
          ))}
        </div>
      )}

      <PetaLangsung posisiAwal={posisiAwal} daftarSpt={daftarSpt} titikLokasi={titikLokasi} />
    </>
  )
}
