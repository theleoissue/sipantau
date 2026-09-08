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
    <>
      {/* Moto Polri — dekorasi murni, pojok kiri bawah (area yang pada
          tangkapan layar acuan ditempati foto Gedung Polda Jabar; tidak
          ada berkas foto itu di repo ini). */}
      <div className="moto" aria-hidden="true">
        <span>Melindungi</span>
        <span>Mengayomi</span>
        <span>Melayani</span>
      </div>

      {/* Siluet Jawa Barat — dekorasi sekunder, sangat redup. Bentuk
          geografis generik yang disederhanakan, BUKAN lambang resmi
          apa pun — tidak ada berkas peta di repo untuk dijiplak, jadi
          digambar sebagai garis sederhana secukupnya untuk menunjukkan
          konteks kedaerahan tanpa mengalihkan perhatian dari formulir. */}
      <div className="peta-jabar" aria-hidden="true">
        <svg viewBox="0 0 300 400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 96 C46 70 88 54 132 58 C168 61 190 44 224 52
                   C252 59 268 88 258 118 C276 140 286 168 270 194
                   C284 214 278 244 254 258 C260 284 240 308 212 306
                   C204 330 178 344 152 334 C126 350 96 342 84 316
                   C56 320 34 300 36 272 C16 262 8 236 22 212
                   C6 192 10 162 30 146 C20 128 18 110 18 96 Z" />
        </svg>
        <div className="tagline">
          <div className="garis" />
          <div>Jawa Barat</div>
          <div>Lebih Aman</div>
          <div>Bersama</div>
        </div>
      </div>

      <div className="kotak">
        {/* Lambang resmi SI PANTAU (butir A-04, diserahkan pemilik
            produk 2 September 2026) — menggantikan penanda sementara
            "SP" yang sengaja dipakai selama berkasnya belum ada. */}
        <Image
          src="/logo-sipantau.png"
          alt="Lambang SI PANTAU"
          width={128} height={128}
          className="lambang"
          priority
        />
        <h1>SI PANTAU</h1>
        <div className="sub-baris">
          <span className="garis" />
          <span className="sub">Sistem Pengawasan Anggota Terpadu</span>
          <span className="garis" />
        </div>
        <div className="satuan">
          Unit I Subdit IV Ditreskrimsus
          <br />
          Kepolisian Daerah Jawa Barat
        </div>

        <FormulirMasuk sebabAwal={sebab} />

        <div className="kaki-baris">
          <span className="garis" />
          <span className="kaki">Aplikasi internal — bukan untuk disebarluaskan</span>
          <span className="garis" />
        </div>
      </div>
    </>
  )
}
