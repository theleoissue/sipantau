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
      {/* Lambang sementara bergaya prototype. DILARANG membuat tiruan
          lambang institusi; berkas resmi menunggu butir A-04. */}
      <div className="lambang">SP</div>
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
