// Kerangka abu-abu berkedip saat memuat — docs/CLAUDE.md §7.3: "Keadaan
// memuat memakai kerangka abu-abu berkedip, bukan pemutar berputar."
// Kelas .kg/.kg-baris dan pola susunannya disalin dari K.kerangka pada
// sipantau-mockup-v2-sprin.html (baris 1296-1298) — sudah disiapkan di
// globals.css sejak awal, hanya belum pernah disambungkan ke satu pun
// loading.tsx sampai sekarang.

/** Satu kartu kerangka, tiga baris teks + satu baris tipis penutup —
 *  bentuk dasar K.kerangka(n) pada mockup. */
function KartuKerangka() {
  return (
    <div className="kartu">
      <div className="kartu-b">
        <div className="kg kg-baris" style={{ width: '38%' }} />
        <div className="kg kg-baris" style={{ width: '88%' }} />
        <div className="kg kg-baris" style={{ width: '62%' }} />
        <div className="kg kg-baris" style={{ width: '100%', height: 5, marginTop: 14 }} />
      </div>
    </div>
  )
}

/** Kisi kartu SPT/LHP — dipakai halaman yang menampilkan daftar sebagai
 *  kartu (Penugasan, LHP Ringkas). */
export function KerangkaKisiKartu({ n = 3 }: { n?: number }) {
  return (
    <div className="kisi k-kartu">
      {Array.from({ length: n }).map((_, i) => <KartuKerangka key={i} />)}
    </div>
  )
}

/** Baris kerangka untuk tabel (Manajemen Akun, Status Personel, Semua
 *  Laporan) — jumlah kolom kg tidak perlu persis sama, sekadar mengisi
 *  ritme baris supaya tidak melompat begitu data sungguhan tiba. */
export function KerangkaTabel({ baris = 6 }: { baris?: number }) {
  return (
    <section className="kartu">
      <div className="kartu-b rata tw">
        <table>
          <tbody>
            {Array.from({ length: baris }).map((_, i) => (
              <tr key={i}>
                <td><div className="kg kg-baris" style={{ width: 140 }} /></td>
                <td><div className="kg kg-baris" style={{ width: 80 }} /></td>
                <td><div className="kg kg-baris" style={{ width: 70 }} /></td>
                <td><div className="kg kg-baris" style={{ width: 60 }} /></td>
                <td><div className="kg kg-baris" style={{ width: 110 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Kartu statistik kerangka — baris k-stat pada Beranda. */
export function KerangkaStat({ n = 3 }: { n?: number }) {
  return (
    <div className="k-stat" style={{ marginBottom: 16 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div className="stat" key={i}>
          <div className="kg kg-baris" style={{ width: '50%' }} />
          <div className="kg kg-baris" style={{ width: '30%', height: 22, marginTop: 6 }} />
          <div className="kg kg-baris" style={{ width: '70%', marginTop: 6 }} />
        </div>
      ))}
    </div>
  )
}

/** Kepala halaman kerangka (judul + subjudul) — dipakai bersama salah
 *  satu bentuk di atas supaya seluruh layar terasa "sedang memuat",
 *  bukan cuma isinya. */
export function KerangkaKepala() {
  return (
    <div className="kh">
      <div>
        <div className="kg kg-baris" style={{ width: 180, height: 22 }} />
        <div className="kg kg-baris" style={{ width: 320, marginTop: 8 }} />
      </div>
    </div>
  )
}

/** Halaman rincian satu entitas (SPT, laporan, LHP) — kepala sempit
 *  plus satu kartu isi. Dipakai apa adanya, tidak perlu meniru bentuk
 *  persis tiap halaman rincian — sekadar mengisi ritme sebelum data
 *  sungguhan tiba. */
export function KerangkaRincian() {
  return (
    <>
      <div className="kh">
        <div>
          <div className="kg kg-baris" style={{ width: 160, height: 20 }} />
          <div className="kg kg-baris" style={{ width: 260, marginTop: 8 }} />
        </div>
      </div>
      <div className="kartu">
        <div className="kartu-b">
          <div className="kg kg-baris" style={{ width: '90%' }} />
          <div className="kg kg-baris" style={{ width: '75%' }} />
          <div className="kg kg-baris" style={{ width: '82%' }} />
          <div className="kg kg-baris" style={{ width: '40%' }} />
        </div>
      </div>
    </>
  )
}
