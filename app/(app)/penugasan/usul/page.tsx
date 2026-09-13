import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { Ikon } from '@/components/sipantau/ikon'
import { AjukanUsulanSprin, type AjuanSaya } from '@/components/sipantau/ajukan-usulan-sprin'

export const metadata = { title: 'Usulkan SPRIN — Si PANTAU' }

type Baris = {
  id: string; asal: string; status: string; catatan_kanit: string | null; dibuat_pada: string
  usulan_id: string | null; sprin_turun_id: string | null
  data_scan: { judul?: string; alasan?: string } | null
}

export default async function HalamanUsulSprin() {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()

  // Hanya ajuan milik sendiri. Aturan akses baris sudah membatasinya
  // (kebijakan pengajuan_baca_pemilik_atau_kanit), tetapi penyaringnya
  // ditulis juga di sini supaya maksudnya terbaca dari kodenya — bukan
  // hanya berlaku karena ada lapisan lain yang kebetulan menahan.
  const { data, error } = await supabase
    .from('pengajuan_sprin')
    .select('id,asal,status,catatan_kanit,dibuat_pada,usulan_id,sprin_turun_id,data_scan')
    .eq('diajukan_oleh', pengguna.id)
    .order('dibuat_pada', { ascending: false })

  // Galat WAJIB diperiksa, bukan dibuang. Daftar yang gagal dibaca
  // tampak persis sama dengan daftar yang memang kosong, dan ajuan yang
  // sudah dikirim akan terlihat seolah tidak pernah ada.
  const daftar: AjuanSaya[] = ((data ?? []) as Baris[]).map(b => ({
    id: b.id, asal: b.asal, status: b.status,
    catatan_kanit: b.catatan_kanit, dibuat_pada: b.dibuat_pada,
    usulan_id: b.usulan_id, sprin_turun_id: b.sprin_turun_id,
    judul: b.data_scan?.judul ?? '',
    alasan: b.data_scan?.alasan ?? '',
  }))

  return <>
    <div className="kh">
      <div>
        <h1>Usulkan SPRIN</h1>
        <p className="sub">Untuk keadaan yang suratnya belum ada. Kanit memutuskan, pimpinan menandatangani.</p>
      </div>
      <div className="kh-aksi">
        <Link href="/penugasan/scan" className="btn btn-o">
          <Ikon nama="kamera" />
          SPRIN sudah ada? Scan saja
        </Link>
      </div>
    </div>

    {error && (
      <div className="kartu kosong" style={{ marginBottom: 16 }}>
        <Ikon nama="awas" />
        <h3>Ajuan Anda tidak dapat dibaca</h3>
        <p>Jangan dianggap kosong — ajuan yang sudah dikirim mungkin tetap ada. Sampaikan pesan ini kepada pengembang: {error.message}</p>
      </div>
    )}

    <AjukanUsulanSprin ajuanSaya={daftar} />
  </>
}
