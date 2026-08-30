import { daftarNotifikasi, kelompokkanPerHari } from '@/lib/notifikasi/kueri'
import { BarisNotifikasi } from '@/components/sipantau/baris-notifikasi'
import { TombolTandaiSemua } from '@/components/sipantau/tombol-tandai-semua'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Pemberitahuan — Si PANTAU' }

export default async function HalamanPemberitahuan() {
  const daftar = await daftarNotifikasi()
  const belum = daftar.filter(n => !n.dibaca_pada).length
  const kelompok = kelompokkanPerHari(daftar)

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
          <span className="isyarat">{daftar.length} pemberitahuan</span>
        </div>
        <div className="kartu-b rata">
          {daftar.length === 0 ? (
            <div className="kosong" style={{ padding: '28px 0' }}>
              <Ikon nama="lonceng" />
              <h3>Belum ada pemberitahuan</h3>
              <p>Kabar tentang penugasan dan laporan akan muncul di sini.</p>
            </div>
          ) : kelompok.map(({ kunci, label, baris }) => (
            <div key={kunci}>
              <div className="pb-hari">{label}</div>
              {baris.map(n => <BarisNotifikasi key={n.id} n={n} />)}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
