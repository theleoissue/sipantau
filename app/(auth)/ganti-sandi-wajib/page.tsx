import { FormulirGantiSandi } from './formulir'

export const metadata = { title: 'Ganti Kata Sandi — Si PANTAU' }

// Halaman buntu. Selama wajib_ganti_sandi menyala, proxy.ts mengembalikan
// pengguna ke sini dari halaman mana pun (KP-6.1-07, KP-6.1-08).
// Tidak ada jalan melewatinya (AM-6.1-04) — karena itu tidak ada tombol
// "nanti saja" maupun tautan keluar di halaman ini.
export default function HalamanGantiSandi() {
  return (
    <div className="kotak">
      <div className="lambang">SP</div>
      <h1>GANTI KATA SANDI</h1>
      <div className="sub">Wajib sebelum melanjutkan</div>
      <div className="satuan">
        Kata sandi yang diberikan kepada Anda bersifat sementara.
        <br />
        Gantilah sekarang supaya hanya Anda yang mengetahuinya.
      </div>

      <FormulirGantiSandi />
    </div>
  )
}
