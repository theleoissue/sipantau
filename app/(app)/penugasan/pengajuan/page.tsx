import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { Ikon } from '@/components/sipantau/ikon'
import { TindakanPengajuanSprin } from '@/components/sipantau/tindakan-pengajuan-sprin'

export const metadata = { title: 'Persetujuan scan SPRIN — Si PANTAU' }

type Pengajuan = {
  id: string; status: string; data_scan: { nomor_spt?: string; judul?: string; sasaran?: string; uraian_tugas?: string }
  catatan_kanit: string | null; dibuat_pada: string
  pengaju: { nama: string; pangkat: string | null } | null
}

export default async function HalamanPengajuanSprin() {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()
  const { data } = await supabase.from('pengajuan_sprin').select('id,status,data_scan,catatan_kanit,dibuat_pada,pengaju:users!pengajuan_sprin_diajukan_oleh_fkey(nama,pangkat)').eq('unit_id', pengguna.unit_id!).order('dibuat_pada', { ascending: false })
  const daftar = (data ?? []) as unknown as Pengajuan[]
  return <>
    <div className="kh"><div><h1>Persetujuan scan SPRIN</h1><p className="sub">Tinjau hasil scan dari Panit dan Anggota sebelum penugasan dibuat.</p></div><div className="kh-aksi"><Link href="/penugasan/terbitkan" className="btn btn-g"><Ikon nama="tambah" />Terbitkan langsung</Link></div></div>
    {daftar.length === 0 ? <div className="kartu kosong"><Ikon nama="spt" /><h3>Belum ada scan yang diajukan</h3><p>Hasil scan dari Panit atau Anggota akan tampil di halaman ini.</p></div> : <div className="kisi k-kartu">
      {daftar.map(item => <article className="kartu" key={item.id}>
        <div className="kartu-head"><div><span className={`lencana ${item.status}`}>{item.status.replace('_', ' ')}</span><h3>{item.data_scan.judul || 'Judul belum terbaca'}</h3></div></div>
        <p className="sub"><b>{item.pengaju?.nama ?? 'Pengaju'}</b>{item.pengaju?.pangkat ? ` · ${item.pengaju.pangkat}` : ''}</p>
        <dl className="rincian-mini"><div><dt>Nomor SPRIN</dt><dd>{item.data_scan.nomor_spt || 'Belum terbaca'}</dd></div><div><dt>Sasaran</dt><dd>{item.data_scan.sasaran || 'Belum terbaca'}</dd></div></dl>
        {item.data_scan.uraian_tugas && <p>{item.data_scan.uraian_tugas}</p>}
        {item.catatan_kanit && <p className="bantu"><b>Catatan Kanit:</b> {item.catatan_kanit}</p>}
        {item.status === 'diajukan' && <TindakanPengajuanSprin id={item.id} />}
        {item.status === 'disetujui' && <Link href={`/penugasan/terbitkan?pengajuan=${item.id}`} className="btn btn-g">Lanjutkan menjadi penugasan</Link>}
      </article>)}
    </div>}
  </>
}
