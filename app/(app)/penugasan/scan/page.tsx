import Link from 'next/link'
import { redirect } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { AjukanScanSprin } from '@/components/sipantau/ajukan-scan-sprin'
import { Ikon } from '@/components/sipantau/ikon'
import { klienServer } from '@/lib/supabase/server'

export const metadata = { title: 'Scan SPRIN — Si PANTAU' }

type UsulanDitautkan = { id: string; asal: string; status: string; data_scan: { judul?: string } | null }

export default async function HalamanScanSprin({ searchParams }: { searchParams: Promise<{ usulan?: string }> }) {
  const pengguna = await wajibkanSudahSiap()
  const { usulan: idUsulan } = await searchParams
  const supabase = await klienServer()

  // SPRIN yang turun untuk sebuah usulan (0067). Kanit, Panit, dan Anggota
  // boleh memindainya; siapa yang benar-benar berhak diputuskan
  // ajukan_sprin_turun di basis data. Kanit TIDAK diarahkan ke wizard di
  // sini: pindaiannya harus tertaut ke usulan lebih dulu, lalu wizard
  // dibuka dari baris yang sudah tertaut itu.
  if (idUsulan) {
    if (!['kanit', 'anggota', 'panit'].includes(pengguna.peran)) redirect('/penugasan')
    const { data: usulan, error } = await supabase.from('pengajuan_sprin')
      .select('id,asal,status,data_scan')
      .eq('id', idUsulan)
      .maybeSingle<UsulanDitautkan>()
    const kembali = pengguna.peran === 'kanit' ? '/penugasan/pengajuan' : '/penugasan/usul'
    const dapatDitautkan = !error && usulan?.asal === 'usulan' && usulan.status === 'disetujui'

    return <>
      <div className="kh">
        <div><h1>Pindai SPRIN yang sudah turun</h1><p className="sub">SPRIN yang ditandatangani pimpinan ditautkan ke usulan asalnya.</p></div>
        <div className="kh-aksi"><Link href={kembali} className="btn btn-o"><Ikon nama="silang" />Kembali</Link></div>
      </div>
      {dapatDitautkan && usulan
        ? <AjukanScanSprin usulan={{ id: usulan.id, judul: usulan.data_scan?.judul ?? '' }} />
        : <div className="kartu kosong">
            <Ikon nama="awas" />
            <h3>Usulan tidak dapat ditautkan</h3>
            <p>{error
              ? `Usulan tidak dapat dibaca. Sampaikan pesan ini kepada pengembang: ${error.message}`
              : 'Usulan tidak ditemukan, belum disetujui Kanit, atau bukan usulan yang dapat Anda buka.'}</p>
          </div>}
    </>
  }

  if (pengguna.peran === 'kanit') redirect('/penugasan/terbitkan/buat')
  if (!['anggota', 'panit'].includes(pengguna.peran)) redirect('/penugasan')
  const { data: perluPerbaikan } = await supabase.from('pengajuan_sprin').select('id,catatan_kanit').eq('diajukan_oleh', pengguna.id).eq('status', 'perlu_perbaikan').order('dibuat_pada', { ascending: false }).limit(1).maybeSingle<{ id: string; catatan_kanit: string | null }>()
  return <>
    <div className="kh">
      <div><h1>Scan surat perintah</h1><p className="sub">Ajukan hasil pembacaan SPRIN untuk persetujuan Kanit.</p></div>
      <div className="kh-aksi"><Link href="/penugasan" className="btn btn-o"><Ikon nama="silang" />Kembali</Link></div>
    </div>
    <AjukanScanSprin perbaikan={perluPerbaikan ? { id: perluPerbaikan.id, catatan: perluPerbaikan.catatan_kanit } : undefined} />
  </>
}
