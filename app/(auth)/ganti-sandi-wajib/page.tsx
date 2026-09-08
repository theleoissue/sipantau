import { FormulirGantiSandi } from './formulir'

export const metadata = { title: 'Ganti Kata Sandi — Si PANTAU' }

// Sejak 8 September 2026 halaman ini TIDAK LAGI buntu (keputusan sadar
// pemilik produk, lihat proxy.ts) — tidak ada yang mengalihkan pengguna
// ke sini secara paksa. Halaman tetap ada dan tetap bisa dibuka
// (dituju manual, atau lewat pengaturan akun kelak), tapi ketiadaan
// tombol "nanti saja"/tautan keluar di bawah ini sekarang cuma warisan
// desain lama — bukan penegakan aktif apa pun.
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
