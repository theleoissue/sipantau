import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { jadwalBulan } from '@/lib/piket/kueri'
import { NAMA_BULAN, hariIniJakarta } from '@/lib/piket/tipe'
import { TabelPiket } from '@/components/sipantau/tabel-piket'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Jadwal Piket — Si PANTAU' }

/** "2026-09" -> {tahun, bulan}. Masukan yang tidak masuk akal jatuh ke
 *  bulan berjalan, bukan menggagalkan halaman: ini nilai dari alamat URL
 *  yang siapa pun dapat mengetiknya sendiri. */
function baca(param: string | undefined): { tahun: number; bulan: number } {
  const kini = hariIniJakarta()
  const bawaan = { tahun: Number(kini.slice(0, 4)), bulan: Number(kini.slice(5, 7)) }
  if (!param) return bawaan
  const c = /^(\d{4})-(\d{2})$/.exec(param)
  if (!c) return bawaan
  const tahun = Number(c[1]), bulan = Number(c[2])
  if (bulan < 1 || bulan > 12 || tahun < 2020 || tahun > 2100) return bawaan
  return { tahun, bulan }
}

function geser(tahun: number, bulan: number, arah: number): string {
  const d = new Date(tahun, bulan - 1 + arah, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function HalamanPiket({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>
}) {
  const { bulan: paramBulan } = await searchParams
  const { tahun, bulan } = baca(paramBulan)

  // Lepas satu sama lain — jadwalBulan tidak butuh hasil
  // wajibkanSudahSiap(), hanya perlu penjagaannya.
  const [pengguna, data] = await Promise.all([
    wajibkanSudahSiap(),
    jadwalBulan(tahun, bulan),
  ])

  // BR-11: yang tidak berwenang tidak melihat tombolnya sama sekali,
  // bukan melihatnya dalam keadaan nonaktif. Penegakan sesungguhnya
  // tetap di RLS dan susun_jadwal_piket — ini hanya lapisan tampilan.
  const bolehSunting = pengguna.peran === 'kasubdit'

  return (
    <>
      <div className="kh">
        <div>
          <h1>Jadwal piket</h1>
          <p className="sub">
            Giliran Piket, Cadangan, dan Lepas Dinas tiap unit.
            {bolehSunting
              ? ' Sel dapat disunting satu per satu; hari yang disunting tidak ikut berubah saat jadwal disusun ulang.'
              : ' Disusun oleh Kasubdit.'}
          </p>
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>{NAMA_BULAN[bulan - 1]} {tahun}</h3>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link className="btn btn-o btn-sm" href={`/piket?bulan=${geser(tahun, bulan, -1)}`}>
              <Ikon nama="naik" /> Sebelumnya
            </Link>
            <Link className="btn btn-o btn-sm" href={`/piket?bulan=${geser(tahun, bulan, 1)}`}>
              Berikutnya <Ikon nama="turun" />
            </Link>
          </div>
        </div>

        <div className="kartu-b">
          {data.unit.length === 0 ? (
            <div className="kosong" style={{ padding: '28px 0' }}>
              <Ikon nama="orang" />
              <h3>Belum ada unit aktif</h3>
              <p>Jadwal piket disusun per unit, jadi setidaknya satu unit harus aktif.</p>
            </div>
          ) : (
            <TabelPiket
              tahun={tahun}
              bulan={bulan}
              unit={data.unit}
              sel={[...data.sel.values()]}
              bolehSunting={bolehSunting}
              hariIni={hariIniJakarta()}
            />
          )}
        </div>
      </section>
    </>
  )
}
