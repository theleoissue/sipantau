import Link from 'next/link'
import { Ikon } from '@/components/sipantau/ikon'

// notFound() dari dalam halaman (mis. SPT/laporan/LHP dengan id yang
// tidak ada) berakhir di sini — bilah samping dan header sudah berhasil
// tergambar, hanya isinya yang diganti. Jauh lebih sering terjadi
// daripada alamat yang benar-benar salah ketik (app/not-found.tsx).
export default function TidakDitemukan() {
  return (
    <section className="kartu">
      <div className="kosong" style={{ padding: '52px 24px' }}>
        <div className="ic">
          <Ikon nama="cari" />
        </div>
        <h3>Tidak ditemukan</h3>
        <p>Data yang Anda cari tidak ada, atau sudah tidak lagi dalam lingkup Anda.</p>
        <Link href="/beranda" className="btn btn-p">
          Kembali ke beranda
        </Link>
      </div>
    </section>
  )
}
