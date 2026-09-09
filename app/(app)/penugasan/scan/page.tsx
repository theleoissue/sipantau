import Link from 'next/link'
import { redirect } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { AjukanScanSprin } from '@/components/sipantau/ajukan-scan-sprin'
import { Ikon } from '@/components/sipantau/ikon'
import { klienServer } from '@/lib/supabase/server'

export const metadata = { title: 'Scan SPRIN — Si PANTAU' }

export default async function HalamanScanSprin() {
  const pengguna = await wajibkanSudahSiap()
  if (pengguna.peran === 'kanit') redirect('/penugasan/terbitkan/buat')
  if (!['anggota', 'panit'].includes(pengguna.peran)) redirect('/penugasan')
  const supabase = await klienServer()
  const { data: perluPerbaikan } = await supabase.from('pengajuan_sprin').select('id,catatan_kanit').eq('diajukan_oleh', pengguna.id).eq('status', 'perlu_perbaikan').order('dibuat_pada', { ascending: false }).limit(1).maybeSingle<{ id: string; catatan_kanit: string | null }>()
  return <>
    <div className="kh">
      <div><h1>Scan surat perintah</h1><p className="sub">Ajukan hasil pembacaan SPRIN untuk persetujuan Kanit.</p></div>
      <div className="kh-aksi"><Link href="/penugasan" className="btn btn-o"><Ikon nama="silang" />Kembali</Link></div>
    </div>
    <AjukanScanSprin perbaikan={perluPerbaikan ? { id: perluPerbaikan.id, catatan: perluPerbaikan.catatan_kanit } : undefined} />
  </>
}
