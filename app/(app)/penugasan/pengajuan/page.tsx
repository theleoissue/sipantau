import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { Ikon } from '@/components/sipantau/ikon'
import { TindakanPengajuanSprin } from '@/components/sipantau/tindakan-pengajuan-sprin'

export const metadata = { title: 'Persetujuan scan SPRIN — Si PANTAU' }

type Pengajuan = {
  id: string; status: string; asal: string
  data_scan: { nomor_spt?: string; judul?: string; sasaran?: string; uraian_tugas?: string; alasan?: string; objek?: string }
  catatan_kanit: string | null; dibuat_pada: string
  pengaju: { nama: string; pangkat: string | null } | null
}

export default async function HalamanPengajuanSprin() {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()
  // Galat WAJIB diperiksa, bukan dibuang. Saat hak baca tabel ini belum
  // diberikan (migrasi 0054/0055), kueri ini gagal dan daftar kosong —
  // tidak dapat dibedakan dari "memang belum ada ajuan" bila errornya
  // ikut dibuang, dan ajuan bawahan hilang tanpa jejak.
  const { data, error } = await supabase.from('pengajuan_sprin').select('id,status,asal,data_scan,catatan_kanit,dibuat_pada,pengaju:users!pengajuan_sprin_diajukan_oleh_fkey(nama,pangkat)').eq('unit_id', pengguna.unit_id!).order('dibuat_pada', { ascending: false })
  const daftar = (data ?? []) as unknown as Pengajuan[]
  return <>
    <div className="kh"><div><h1>Persetujuan ajuan SPRIN</h1><p className="sub">Tinjau scan dan usulan dari Panit dan Anggota sebelum penugasan dibuat.</p></div><div className="kh-aksi"><Link href="/penugasan/terbitkan" className="btn btn-o"><Ikon nama="silang" />Kembali</Link></div></div>
    {error ? <div className="kartu kosong"><Ikon nama="awas" /><h3>Daftar ajuan tidak dapat dibaca</h3><p>Ajuan yang masuk tidak dapat ditampilkan, jadi jangan dianggap kosong. Sampaikan pesan ini kepada pengembang: {error.message}</p></div>
      : daftar.length === 0 ? <div className="kartu kosong"><Ikon nama="spt" /><h3>Belum ada ajuan masuk</h3><p>Scan maupun usulan dari Panit atau Anggota akan tampil di halaman ini.</p></div> : <div className="kisi k-kartu">
      {daftar.map(item => <article className="kartu" key={item.id}>
        <div className="kartu-head"><div>
          <span className={`lencana ${item.status}`}>{item.status.replace('_', ' ')}</span>
          <span className="usul-asal">{item.asal === 'usulan' ? 'Usulan' : 'Scan'}</span>
          <h3>{item.data_scan.judul || (item.asal === 'usulan' ? 'Usulan tanpa judul' : 'Judul belum terbaca')}</h3>
        </div></div>
        <p className="sub"><b>{item.pengaju?.nama ?? 'Pengaju'}</b>{item.pengaju?.pangkat ? ` · ${item.pengaju.pangkat}` : ''}</p>
        {/* Alasan ditaruh PALING ATAS pada usulan, sebelum medan lain.
            Pada usulan, inilah satu-satunya hal yang dapat diputuskan —
            medan selebihnya baru rancangan isi surat. */}
        {item.asal === 'usulan' && item.data_scan.alasan && (
          <p className="usul-alasan"><b>Alasan pengusul:</b> {item.data_scan.alasan}</p>
        )}
        <dl className="rincian-mini">
          {/* Nomor SPRIN hanya bermakna pada scan. Pada usulan nomornya
              memang belum ada — menampilkannya "Belum terbaca" akan
              terbaca sebagai kegagalan pembacaan, padahal Kanit sendiri
              yang mengisinya nanti dari buku agenda (modul 6.2). */}
          {item.asal !== 'usulan' && (
            <div><dt>Nomor SPRIN</dt><dd>{item.data_scan.nomor_spt || 'Belum terbaca'}</dd></div>
          )}
          {item.asal === 'usulan' && item.data_scan.objek && (
            <div><dt>Objek</dt><dd>{item.data_scan.objek}</dd></div>
          )}
          <div><dt>Sasaran</dt><dd>{item.data_scan.sasaran || (item.asal === 'usulan' ? 'Belum disebutkan' : 'Belum terbaca')}</dd></div>
        </dl>
        {item.data_scan.uraian_tugas && <p>{item.data_scan.uraian_tugas}</p>}
        {item.catatan_kanit && <p className="bantu"><b>Catatan Kanit:</b> {item.catatan_kanit}</p>}
        {item.status === 'diajukan' && <TindakanPengajuanSprin id={item.id} />}
        {item.status === 'disetujui' && <Link href={`/penugasan/terbitkan/buat?pengajuan=${item.id}`} className="btn btn-g">Lanjutkan menjadi penugasan</Link>}
      </article>)}
    </div>}
  </>
}
