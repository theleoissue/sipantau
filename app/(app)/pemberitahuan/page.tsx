import { daftarNotifikasi, jumlahBelumDibaca } from '@/lib/notifikasi/kueri'
import { DaftarNotifikasi } from '@/components/sipantau/daftar-notifikasi'
import { TombolTandaiSemua } from '@/components/sipantau/tombol-tandai-semua'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Pemberitahuan — Si PANTAU' }

export default async function HalamanPemberitahuan() {
  // Lepas satu sama lain: belum HARUS dihitung dari SELURUH baris milik
  // pengguna (sama seperti lonceng di layout.tsx), bukan dari 30 baris
  // pertama yang dimuat halaman ini — kalau tidak, angkanya akan salah
  // begitu ada lebih dari 30 notifikasi dan sebagian belum dibaca ada
  // di halaman kedua dan seterusnya.
  const [daftar, belum] = await Promise.all([
    daftarNotifikasi(),
    jumlahBelumDibaca(),
  ])

  return (
    <>
      <div className="kh">
        <div>
          <h1>Pemberitahuan</h1>
          <p className="sub">Kabar tentang penugasan, laporan, dan sesi tugas dalam lingkup Anda.</p>
        </div>
        {belum > 0 && (
          <div className="kh-aksi"><TombolTandaiSemua /></div>
        )}
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>{belum > 0 ? `${belum} belum dibaca` : 'Semua sudah dibaca'}</h3>
        </div>
        <div className="kartu-b rata">
          {daftar.length === 0 ? (
            <div className="kosong" style={{ padding: '28px 0' }}>
              <Ikon nama="lonceng" />
              <h3>Belum ada pemberitahuan</h3>
              <p>Kabar tentang penugasan dan laporan akan muncul di sini.</p>
            </div>
          ) : (
            <DaftarNotifikasi awal={daftar} />
          )}
        </div>
      </section>
    </>
  )
}
