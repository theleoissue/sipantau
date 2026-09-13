import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { Ikon } from '@/components/sipantau/ikon'
import { TindakanPengajuanSprin } from '@/components/sipantau/tindakan-pengajuan-sprin'

export const metadata = { title: 'Persetujuan ajuan SPRIN — Si PANTAU' }

type Pengajuan = {
  id: string; status: string; asal: string
  data_scan: { nomor_spt?: string; judul?: string; sasaran?: string; uraian_tugas?: string; alasan?: string; objek?: string }
  catatan_kanit: string | null; dibuat_pada: string
  /** Pada scan: usulan yang dipenuhi SPRIN ini (0067). */
  usulan_id: string | null
  /** Pada usulan: SPRIN yang sudah turun untuknya (0067). */
  sprin_turun_id: string | null
  pengaju: { nama: string; pangkat: string | null } | null
}

const LABEL_STATUS: Record<string, string> = {
  diajukan: 'Perlu ditinjau', disetujui: 'Disetujui', perlu_perbaikan: 'Perlu perbaikan',
  ditolak: 'Ditolak', ditarik: 'Ditarik pengaju',
}

/**
 * Pindaian tertaut yang masih berlaku. Yang ditolak atau ditarik
 * membebaskan usulannya untuk dipindai ulang — aturan yang sama dengan
 * penjaga SPRIN_SUDAH_TURUN di ajukan_sprin_turun.
 */
const TURUN_BERLAKU = ['diajukan', 'perlu_perbaikan', 'disetujui']

const KETERANGAN_TURUN: Record<string, string> = {
  diajukan: 'Hasil pindaiannya menunggu tinjauan Anda.',
  perlu_perbaikan: 'Hasil pindaiannya dikembalikan ke pengusul untuk diperbaiki.',
  disetujui: 'Hasil pindaiannya sudah disetujui dan siap dijadikan penugasan.',
}

function labelStatus(item: Pengajuan) {
  // Usulan yang disetujui belum menjadi penugasan: ia naik ke pimpinan
  // untuk ditandatangani, dan yang diterbitkan adalah SPRIN yang turun.
  if (item.asal === 'usulan' && item.status === 'disetujui') return 'Diteruskan ke pimpinan'
  return LABEL_STATUS[item.status] ?? item.status.replaceAll('_', ' ')
}

function waktu(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso)).replace('.', ':')
}

function KartuPengajuan({ item, usulanAsal, sprinTurun }: {
  item: Pengajuan
  usulanAsal?: Pengajuan
  sprinTurun?: Pengajuan
}) {
  const usulan = item.asal === 'usulan'
  const aktif = item.status === 'diajukan'
  const judul = item.data_scan.judul || (usulan ? 'Usulan penerbitan SPRIN' : 'Judul belum terbaca')
  const rincian = [
    !usulan ? ['Nomor SPRIN', item.data_scan.nomor_spt || 'Belum terbaca'] : null,
    item.data_scan.objek ? ['Objek', item.data_scan.objek] : null,
    ['Sasaran', item.data_scan.sasaran || (usulan ? 'Belum disebutkan' : 'Belum terbaca')],
  ].filter((nilai): nilai is string[] => Boolean(nilai))
  const turunBerlaku = sprinTurun && TURUN_BERLAKU.includes(sprinTurun.status) ? sprinTurun : undefined

  return <article className={`ajuan-kartu ${aktif ? 'ajuan-kartu-aktif' : ''}`}>
    <header className="ajuan-kepala">
      <div className="ajuan-badge">
        <span className={`lencana ${item.status}`}>{labelStatus(item)}</span>
        <span className="ajuan-asal"><Ikon nama={usulan ? 'berkas' : 'kamera'} />{usulan ? 'Usulan' : 'Hasil scan'}</span>
      </div>
      <time className="ajuan-waktu" dateTime={item.dibuat_pada}>{waktu(item.dibuat_pada)}</time>
    </header>
    <div className="ajuan-isi">
      <div className="ajuan-identitas">
        <div className="ajuan-identitas-ikon"><Ikon nama={usulan ? 'berkas' : 'spt'} /></div>
        <div>
          <h2>{judul}</h2>
          <p>Diajukan oleh <strong>{item.pengaju?.nama ?? 'Pengaju'}</strong>{item.pengaju?.pangkat ? ` · ${item.pengaju.pangkat}` : ''}</p>
          {item.usulan_id && <p>SPRIN untuk usulan <strong>{usulanAsal?.data_scan.judul || 'yang sudah disetujui'}</strong></p>}
        </div>
      </div>
      {usulan && item.data_scan.alasan && <section className="ajuan-alasan"><span>Alasan pengajuan</span><p>{item.data_scan.alasan}</p></section>}
      <dl className="ajuan-rincian">{rincian.map(([label, nilai]) => <div key={label}><dt>{label}</dt><dd>{nilai}</dd></div>)}</dl>
      {item.data_scan.uraian_tugas && <section className="ajuan-uraian"><h3>Uraian tugas</h3><p>{item.data_scan.uraian_tugas}</p></section>}
      {item.catatan_kanit && <section className="ajuan-catatan"><Ikon nama="catatan" /><div><strong>Catatan Kanit</strong><p>{item.catatan_kanit}</p></div></section>}
    </div>
    {aktif && <TindakanPengajuanSprin id={item.id} />}
    {!usulan && item.status === 'disetujui' && <footer className="ajuan-lanjut">
      <div><strong>Siap dijadikan penugasan</strong><p>Periksa dan lengkapi draf sebelum diterbitkan.</p></div>
      <Link href={`/penugasan/terbitkan/buat?pengajuan=${item.id}`} className="btn btn-g">Lanjutkan <Ikon nama="panah_kanan" /></Link>
    </footer>}
    {/* Usulan yang disetujui TIDAK membuka wizard dari isinya sendiri.
        Yang diterbitkan adalah SPRIN yang turun dari pimpinan (0067). */}
    {usulan && item.status === 'disetujui' && (turunBerlaku
      ? <footer className="ajuan-lanjut">
          <div><strong>SPRIN sudah turun</strong><p>{KETERANGAN_TURUN[turunBerlaku.status]}</p></div>
          {turunBerlaku.status === 'disetujui' && <Link href={`/penugasan/terbitkan/buat?pengajuan=${turunBerlaku.id}`} className="btn btn-g">Lanjutkan <Ikon nama="panah_kanan" /></Link>}
        </footer>
      : <footer className="ajuan-lanjut">
          <div><strong>Menunggu SPRIN dari pimpinan</strong><p>Setelah ditandatangani, pindai SPRIN-nya supaya tertaut ke usulan ini.</p></div>
          <Link href={`/penugasan/scan?usulan=${item.id}`} className="btn btn-g"><Ikon nama="kamera" />Pindai SPRIN</Link>
        </footer>)}
  </article>
}

export default async function HalamanPengajuanSprin() {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()
  const { data, error } = await supabase.from('pengajuan_sprin')
    .select('id,status,asal,data_scan,catatan_kanit,dibuat_pada,usulan_id,sprin_turun_id,pengaju:users!pengajuan_sprin_diajukan_oleh_fkey(nama,pangkat)')
    .eq('unit_id', pengguna.unit_id!).order('dibuat_pada', { ascending: false })
  const daftar = (data ?? []) as unknown as Pengajuan[]
  const berdasarId = new Map(daftar.map(item => [item.id, item]))
  const kartu = (item: Pengajuan) => <KartuPengajuan item={item} key={item.id}
    usulanAsal={item.usulan_id ? berdasarId.get(item.usulan_id) : undefined}
    sprinTurun={item.sprin_turun_id ? berdasarId.get(item.sprin_turun_id) : undefined} />
  const menunggu = daftar.filter(item => item.status === 'diajukan')
  const riwayat = daftar.filter(item => item.status !== 'diajukan')

  return <>
    <div className="kh ajuan-judul">
      <div><h1>Persetujuan ajuan SPRIN</h1><p className="sub">Periksa hasil scan dan usulan sebelum menjadi penugasan resmi.</p></div>
      <div className="kh-aksi"><Link href="/penugasan/terbitkan" className="btn btn-o"><Ikon nama="panah_kiri" />Kembali</Link></div>
    </div>
    {error ? <div className="kartu kosong"><Ikon nama="awas" /><h3>Daftar ajuan tidak dapat dibaca</h3><p>Ajuan tidak dapat ditampilkan. Sampaikan pesan ini kepada pengembang: {error.message}</p></div>
      : daftar.length === 0 ? <div className="kartu kosong"><Ikon nama="spt" /><h3>Belum ada ajuan masuk</h3><p>Hasil scan dan usulan dari Panit atau Anggota akan tampil di sini.</p></div>
      : <div className="ajuan-halaman">
        <section aria-labelledby="ajuan-menunggu">
          <div className="ajuan-seksi-kepala"><div><h2 id="ajuan-menunggu">Menunggu keputusan</h2><p>Ajuan yang perlu diperiksa oleh Kanit.</p></div><span className="ajuan-jumlah">{menunggu.length}</span></div>
          {menunggu.length > 0 ? <div className="ajuan-grid">{menunggu.map(kartu)}</div>
            : <div className="ajuan-kosong-ringkas"><Ikon nama="centang" /><div><strong>Semua sudah ditinjau</strong><p>Tidak ada ajuan yang menunggu keputusan.</p></div></div>}
        </section>
        {riwayat.length > 0 && <section aria-labelledby="ajuan-riwayat">
          <div className="ajuan-seksi-kepala"><div><h2 id="ajuan-riwayat">Sudah diputuskan</h2><p>Riwayat keputusan terbaru unit Anda.</p></div><span className="ajuan-jumlah">{riwayat.length}</span></div>
          <div className="ajuan-grid">{riwayat.map(kartu)}</div>
        </section>}
      </div>}
  </>
}
