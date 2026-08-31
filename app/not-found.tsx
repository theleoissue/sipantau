// 404 akar — alamat yang tidak cocok dengan rute manapun, termasuk
// sebelum sesi masuk diketahui. Berdiri sendiri mengikuti gaya #masuk,
// bukan mengandaikan bilah samping sudah ada.
//
// app/(app)/not-found.tsx menangani notFound() yang dipanggil dari
// dalam halaman (mis. SPT dengan id yang tidak ada) — kasus yang jauh
// lebih sering terjadi daripada alamat yang benar-benar salah ketik.

import Link from 'next/link'

export default function TidakDitemukanAkar() {
  return (
    <div id="masuk">
      <div className="kotak">
        <div className="lambang">SP</div>
        <h1>SI PANTAU</h1>
        <div className="sub">Halaman tidak ditemukan</div>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,.72)', lineHeight: 1.6,
          textAlign: 'center', marginTop: 14, marginBottom: 22,
        }}>
          Alamat ini tidak dikenali sistem.
        </p>
        <Link href="/" className="btn-masuk" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Kembali ke beranda
        </Link>
      </div>
    </div>
  )
}
