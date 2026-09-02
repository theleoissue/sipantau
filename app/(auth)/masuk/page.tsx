import Image from 'next/image'
import { FormulirMasuk } from './formulir-masuk'

export const metadata = { title: 'Masuk — Si PANTAU' }

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ sebab?: string }>
}) {
  const { sebab } = await searchParams

  return (
    <div className="kotak">
      {/* Lambang resmi SI PANTAU (butir A-04, diserahkan pemilik produk
          2 September 2026) — menggantikan penanda sementara "SP" yang
          sengaja dipakai selama berkasnya belum ada. */}
      <Image
        src="/logo-sipantau.png"
        alt="Lambang SI PANTAU"
        width={128} height={128}
        className="lambang"
        priority
      />
      <h1>SI PANTAU</h1>
      <div className="sub">Sistem Pengawasan Anggota Terpadu</div>
      <div className="satuan">
        Unit I Subdit IV Ditreskrimsus
        <br />
        Kepolisian Daerah Jawa Barat
      </div>

      <FormulirMasuk sebabAwal={sebab} />

      <div
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,.38)',
          textAlign: 'center',
          marginTop: 18,
        }}
      >
        Aplikasi internal — bukan untuk disebarluaskan
      </div>
    </div>
  )
}
