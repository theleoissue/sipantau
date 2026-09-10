import { daftarAkun } from '@/lib/akun/kueri'
import { TabelAkun } from '@/components/sipantau/tabel-akun'

export const metadata = { title: 'Daftar Akun — Si PANTAU' }

export default async function Halaman() {
  const daftar = await daftarAkun()
  return <>
    <div className="kh"><div>
      <h1>Pemulihan akses</h1>
      <p className="sub">Cari akun yang terkunci atau lupa kata sandi. Setiap reset tercatat dan kata sandi sementara hanya ditampilkan satu kali.</p>
    </div></div>
    <TabelAkun daftar={daftar} hanyaReset />
  </>
}
