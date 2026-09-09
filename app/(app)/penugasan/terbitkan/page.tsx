import Link from 'next/link'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Terbitkan Penugasan — Si PANTAU' }

/** Titik pilih Kanit supaya scan langsung tidak tercampur dengan pengajuan personel. */
export default function HalamanTerbitkan() {
  return <>
    <div className="kh"><div><h1>Terbitkan penugasan</h1><p className="sub">Pilih sumber surat perintah sebelum menyusun tim dan menerbitkan tugas.</p></div></div>
    <div className="kisi k-kartu pilihan-terbitkan">
      <Link href="/penugasan/terbitkan/buat" className="kartu pilihan-terbitkan-item">
        <Ikon nama="kamera" /><div><h3>Pindai surat perintah</h3><p>Scan atau unggah SPRIN yang Anda terima, periksa hasilnya, lalu terbitkan penugasan.</p><span className="btn btn-g">Pindai &amp; terbitkan</span></div>
      </Link>
      <Link href="/penugasan/pengajuan" className="kartu pilihan-terbitkan-item">
        <Ikon nama="masuk_kotak" /><div><h3>Persetujuan scan</h3><p>Tinjau SPRIN yang diajukan Panit atau Anggota. Minta perbaikan, tolak, atau setujui.</p><span className="btn btn-o">Buka persetujuan</span></div>
      </Link>
    </div>
  </>
}
