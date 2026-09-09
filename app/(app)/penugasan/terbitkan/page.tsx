import Link from 'next/link'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Terbitkan Penugasan — Si PANTAU' }

/** Titik pilih Kanit supaya scan langsung tidak tercampur dengan pengajuan personel. */
export default function HalamanTerbitkan() {
  return <>
    <div className="kh"><div><h1>Terbitkan penugasan</h1><p className="sub">Pilih sumber surat perintah sebelum menyusun tim dan menerbitkan tugas.</p></div></div>
    <div className="pilihan-terbitkan">
      <Link href="/penugasan/terbitkan/buat" className="kartu pilihan-terbitkan-item">
        <span className="pilihan-terbitkan-ikon"><Ikon nama="kamera" /></span><div><span className="pilihan-terbitkan-label">Jalur Kanit</span><h3>Pindai surat perintah</h3><p>Scan atau unggah SPRIN, periksa hasilnya, lalu susun tim untuk diterbitkan.</p><span className="pilihan-terbitkan-aksi">Pindai &amp; terbitkan →</span></div>
      </Link>
      <Link href="/penugasan/pengajuan" className="kartu pilihan-terbitkan-item">
        <span className="pilihan-terbitkan-ikon"><Ikon nama="masuk_kotak" /></span><div><span className="pilihan-terbitkan-label">Jalur Anggota &amp; Panit</span><h3>Tinjau pengajuan scan</h3><p>Periksa SPRIN yang diajukan personel, lalu minta perbaikan, tolak, atau setujui.</p><span className="pilihan-terbitkan-aksi">Buka persetujuan →</span></div>
      </Link>
    </div>
  </>
}
