import { daftarAkun, daftarUnitAktifUntukForm } from '@/lib/akun/kueri'
import { TabelAkun } from '@/components/sipantau/tabel-akun'

export const metadata = { title: 'Manajemen Akun — Si PANTAU' }

/**
 * Manajemen Akun — Modul 6.6, eksklusif Admin sejak migrasi 0032
 * (keputusan sadar mengubah PRD, lihat lib/supabase/types.ts). Server
 * Component untuk pengambilan data (docs/CLAUDE.md §6.1); seluruh
 * interaksi (pencarian, formulir, dialog konfirmasi) ada di TabelAkun,
 * Client Component.
 */
export default async function HalamanAkun() {
  const [daftar, unitAktif] = await Promise.all([
    daftarAkun(),
    daftarUnitAktifUntukForm(),
  ])

  return (
    <>
      <div className="kh">
        <div>
          <h1>Manajemen akun</h1>
          <p className="sub">
            Kelola akun personel yang memiliki akses ke Si PANTAU beserta perannya. Akun tidak dihapus, hanya dinonaktifkan agar riwayat pekerjaannya tetap utuh.
          </p>
        </div>
      </div>

      <TabelAkun daftar={daftar} unitAktif={unitAktif} />
    </>
  )
}
