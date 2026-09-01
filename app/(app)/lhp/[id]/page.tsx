import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { satuLhp } from '@/lib/lhp/kueri'
import { daftarPersonel } from '@/lib/personel/kueri'
import { FormulirLhp } from '@/components/sipantau/formulir-lhp'
import { TombolBagikanWa } from '@/components/sipantau/tombol-bagikan-wa'
import { Ikon } from '@/components/sipantau/ikon'
import { idValid } from '@/lib/utils'

export const metadata = { title: 'LHP Ringkas — Si PANTAU' }

export default async function RincianLhp({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!idValid(id)) notFound()

  // Independen — daftarPersonel() tidak menerima argumen, tidak perlu
  // menunggu pengguna/lhp lebih dulu.
  const [pengguna, lhp, personelUnit] = await Promise.all([
    wajibkanSudahSiap(),
    satuLhp(id),
    daftarPersonel(),
  ])

  if (!lhp) notFound()

  // BR-11: hanya Anggota penyusunnya sendiri, dan hanya selagi masih
  // draf — ditegakkan RLS/pemicu 0028/0029, ini murni menentukan
  // tampilan (input vs teks baca).
  const bolehSunting = pengguna.id === lhp.disusun_oleh && lhp.status === 'draf'

  return (
    <>
      <div className="kh">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="spt-id">{lhp.penugasan?.nomor_spt ?? '—'}</span>
            <span className={`lc ${lhp.status === 'final' ? 'selesai' : 'draf'}`}>
              {lhp.status === 'final' ? 'final' : 'draf'}
            </span>
          </div>
          <h1>LHP Ringkas</h1>
          <p className="sub">
            {lhp.penugasan?.judul ?? '—'} · disusun {lhp.penyusun?.nama ?? '—'}
          </p>
        </div>
        <div className="kh-aksi">
          <Link href="/lhp" className="btn btn-o">Kembali</Link>
          <TombolBagikanWa lhp={lhp} />
          {lhp.penugasan_id && (
            <Link href={`/penugasan/${lhp.penugasan_id}`} className="btn btn-o">
              <Ikon nama="spt" /> Lihat Penugasan
            </Link>
          )}
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-b">
          <FormulirLhp lhp={lhp} bolehSunting={bolehSunting} personelUnit={personelUnit} />
        </div>
      </section>
    </>
  )
}
