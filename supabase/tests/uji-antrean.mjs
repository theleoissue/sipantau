// Uji inti antrean Titik luring (lib/gps/antrean-inti.ts).
//
// Bukan uji basis data — tidak ada pglite di sini. Yang dikejar adalah
// perilaku yang kegagalannya paling mahal: Titik lapangan hilang tanpa
// suara. Persis itu yang terjadi sebelum antrean ada, dan aplikasinya
// bahkan menulis "Akan dicoba lagi" padahal tidak ada yang disimpan.

import { antrekanKe, kirimAntreanDari, BATAS_ANTREAN } from '../../lib/gps/antrean-inti.ts'

let lulus = 0, gagal = 0
const cek = (k, t, ok) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`) }
}

/** Penyimpanan tiruan di memori, meniru Preferences. */
function penyimpanan(awal = []) {
  let isi = [...awal]
  return {
    async baca() { return isi.map(t => ({ ...t })) },
    async tulis(daftar) { isi = daftar.map(t => ({ ...t })) },
    lihat: () => isi,
  }
}

const titik = (id, ditangkapPada = 1_000) => ({ antreanId: id, ditangkapPada })

// ---------------------------------------------------------------------
// Urutan pengiriman
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a'), titik('b'), titik('c')])
  const urutan = []
  const hasil = await kirimAntreanDari(simpan, async t => { urutan.push(t.antreanId); return {} })
  cek('U-ANT-01', 'Titik dikirim dari yang paling lama, berurutan', urutan.join('') === 'abc')
  cek('U-ANT-02', 'Antrean kosong setelah semua terkirim', simpan.lihat().length === 0)
  cek('U-ANT-03', 'Jumlah terkirim dilaporkan apa adanya', hasil.terkirim === 3 && hasil.tersisa === 0)
}

// ---------------------------------------------------------------------
// Jaringan putus — inti dari seluruh Jalur A
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a'), titik('b'), titik('c')])
  const hasil = await kirimAntreanDari(simpan, async t => {
    if (t.antreanId === 'b') throw new Error('jaringan mati')
    return {}
  })
  cek('U-ANT-04', 'Berhenti pada kegagalan jaringan, tidak memaksa terus', hasil.galat === 'jaringan')
  cek('U-ANT-05', 'Titik yang belum terkirim TETAP tersimpan, tidak hilang',
    simpan.lihat().map(t => t.antreanId).join('') === 'bc')
  cek('U-ANT-06', 'Sisa dilaporkan benar', hasil.terkirim === 1 && hasil.tersisa === 2)

  // Jaringan pulih: lanjut dari tempat berhenti, urutan tetap terjaga.
  const urutan = []
  const lanjut = await kirimAntreanDari(simpan, async t => { urutan.push(t.antreanId); return {} })
  cek('U-ANT-07', 'Sesudah jaringan pulih, sisanya terkirim urut', urutan.join('') === 'bc')
  cek('U-ANT-08', 'Antrean bersih setelah pemulihan', lanjut.tersisa === 0 && simpan.lihat().length === 0)
}

// ---------------------------------------------------------------------
// Penolakan server BUKAN kegagalan jaringan
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a'), titik('b')])
  const hasil = await kirimAntreanDari(simpan, async t =>
    t.antreanId === 'a' ? { galat: 'SESI_TERTUTUP' } : {})
  cek('U-ANT-09', 'Titik yang DITOLAK server dibuang, tidak menyumbat antrean',
    simpan.lihat().map(t => t.antreanId).join('') === 'b')
  cek('U-ANT-10', 'Galat penolakan diteruskan apa adanya', hasil.galat === 'SESI_TERTUTUP')
}

// ---------------------------------------------------------------------
// Umur dihitung saat KIRIM, bukan saat ditangkap
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a', 10_000)])
  let usiaTerkirim = null
  await kirimAntreanDari(simpan, async (_t, usiaMs) => { usiaTerkirim = usiaMs; return {} },
    () => 25_000)
  cek('U-ANT-11', 'Umur dihitung pada saat pengiriman (25s - 10s = 15s)', usiaTerkirim === 15_000)
}
{
  const simpan = penyimpanan([titik('a', 90_000)])
  let usiaTerkirim = null
  await kirimAntreanDari(simpan, async (_t, usiaMs) => { usiaTerkirim = usiaMs; return {} },
    () => 30_000)
  cek('U-ANT-12', 'Jam perangkat yang mundur tidak menghasilkan umur negatif', usiaTerkirim === 0)
}

// ---------------------------------------------------------------------
// Titik baru yang masuk SELAGI pengiriman berjalan
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a')])
  let sudah = false
  await kirimAntreanDari(simpan, async () => {
    if (!sudah) {
      sudah = true
      // Meniru Titik baru yang tiba di tengah permintaan.
      await simpan.tulis([...(await simpan.baca()), titik('baru')])
    }
    return {}
  })
  cek('U-ANT-13', 'Titik yang masuk saat pengiriman berjalan tidak ikut terhapus',
    simpan.lihat().length === 0)
}

// ---------------------------------------------------------------------
// Batas antrean: penuh berarti berhenti menerima, BUKAN membuang bukti
// ---------------------------------------------------------------------
{
  const isi = Array.from({ length: BATAS_ANTREAN }, (_, i) => titik('t' + i))
  const simpan = penyimpanan(isi)
  const diterima = await antrekanKe(simpan, titik('kelebihan'))
  cek('U-ANT-14', 'Antrean penuh menolak Titik baru dan mengatakannya', diterima === false)
  cek('U-ANT-15', 'Titik lama TIDAK dibuang saat antrean penuh',
    simpan.lihat().length === BATAS_ANTREAN && simpan.lihat()[0].antreanId === 't0')
}

// =====================================================================
// Tingkatan mutu akurasi (Jalur A3)
// =====================================================================

const { mutuAkurasi, AKURASI_DIRAGUKAN_METER } = await import('../../lib/gps/tipe.ts')

cek('U-MUT-01', 'Tepat 10 m masih tergolong tinggi', mutuAkurasi(10) === 'tinggi')
cek('U-MUT-02', 'Di atas 10 m turun ke sedang', mutuAkurasi(10.1) === 'sedang')
cek('U-MUT-03', 'Tepat 30 m masih sedang — batas basis data belum terlampaui',
  mutuAkurasi(30) === 'sedang')
cek('U-MUT-04', 'Di atas 30 m tergolong rendah', mutuAkurasi(31) === 'rendah')
cek('U-MUT-05', 'Akurasi yang tidak dilaporkan tidak dianggap buruk',
  mutuAkurasi(null) === 'tidak_diketahui' && mutuAkurasi(undefined) === 'tidak_diketahui')

// Ambang layar WAJIB sama dengan ambang fn_catat_titik. Kalau salah satu
// digeser tanpa yang lain, basis data dan layar akan menyebut Titik yang
// sama dengan dua sebutan berbeda — dan tidak ada yang bergalat.
{
  const { readFileSync } = await import('node:fs')
  const sql = readFileSync(
    new URL('../migrations/0056_titik_telat_sesudah_sesi_tutup.sql', import.meta.url), 'utf8')
  cek('U-MUT-06', 'Ambang diragukan di layar sama dengan di fn_catat_titik',
    sql.includes(`p_akurasi_meter > ${AKURASI_DIRAGUKAN_METER}`))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji antrean luring lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
