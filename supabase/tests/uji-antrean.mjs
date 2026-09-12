// Uji inti antrean Titik luring (lib/gps/antrean-inti.ts).
//
// Bukan uji basis data — tidak ada pglite di sini. Yang dikejar adalah
// perilaku yang kegagalannya paling mahal: Titik lapangan hilang tanpa
// suara. Persis itu yang terjadi sebelum antrean ada, dan aplikasinya
// bahkan menulis "Akan dicoba lagi" padahal tidak ada yang disimpan.

import { antrekanKe, kirimAntreanDari, BATAS_ANTREAN } from '../../lib/gps/antrean-inti.ts'
import { mutuAkurasi, AKURASI_DIRAGUKAN_METER, haluskanJejak, sederhanakanJejak,
  TOLERANSI_SEDERHANA_METER, AKURASI_TINGGI_METER, jarakMeter, arahDerajat,
  saringKalman, bersihkanTitikJejak } from '../../lib/gps/tipe.ts'
import { tautanNavigasi } from '../../lib/gps/navigasi.ts'
import { readFileSync } from 'node:fs'

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
  const hasil = await kirimAntreanDari(simpan, async k => { k.forEach(t => urutan.push(t.antreanId)); return {} })
  cek('U-ANT-01', 'Titik dikirim dari yang paling lama, berurutan', urutan.join('') === 'abc')
  cek('U-ANT-02', 'Antrean kosong setelah semua terkirim', simpan.lihat().length === 0)
  cek('U-ANT-03', 'Jumlah terkirim dilaporkan apa adanya', hasil.terkirim === 3 && hasil.tersisa === 0)
}

// ---------------------------------------------------------------------
// Jaringan putus — inti dari seluruh Jalur A
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a'), titik('b'), titik('c')])
  // Kelompok dipaksa satu per satu supaya kegagalan di tengah dapat diuji.
  const hasil = await kirimAntreanDari(simpan, async k => {
    if (k.some(t => t.antreanId === 'b')) throw new Error('jaringan mati')
    return {}
  }, Date.now, 1)
  cek('U-ANT-04', 'Berhenti pada kegagalan jaringan, tidak memaksa terus', hasil.galat === 'jaringan')
  cek('U-ANT-05', 'Titik yang belum terkirim TETAP tersimpan, tidak hilang',
    simpan.lihat().map(t => t.antreanId).join('') === 'bc')
  cek('U-ANT-06', 'Sisa dilaporkan benar', hasil.terkirim === 1 && hasil.tersisa === 2)

  // Jaringan pulih: lanjut dari tempat berhenti, urutan tetap terjaga.
  const urutan = []
  const lanjut = await kirimAntreanDari(simpan, async k => { k.forEach(t => urutan.push(t.antreanId)); return {} }, Date.now, 1)
  cek('U-ANT-07', 'Sesudah jaringan pulih, sisanya terkirim urut', urutan.join('') === 'bc')
  cek('U-ANT-08', 'Antrean bersih setelah pemulihan', lanjut.tersisa === 0 && simpan.lihat().length === 0)
}

// ---------------------------------------------------------------------
// Penolakan server BUKAN kegagalan jaringan
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a'), titik('b')])
  const hasil = await kirimAntreanDari(simpan, async k =>
    k.some(t => t.antreanId === 'a')
      ? { galat: 'SESI_TERTUTUP', tolakPermanen: true }
      : {}, Date.now, 1)
  cek('U-ANT-09', 'Titik yang ditolak PERMANEN dibuang, tidak menyumbat antrean',
    simpan.lihat().map(t => t.antreanId).join('') === 'b')
  cek('U-ANT-10', 'Galat penolakan diteruskan apa adanya', hasil.galat === 'SESI_TERTUTUP')
}

// Kegagalan yang BUKAN penolakan permanen tidak boleh membuang apa pun.
// Bentuk sebelumnya menghapus kelompoknya lebih dulu lalu baru memeriksa
// galat — satu migrasi yang belum dijalankan cukup untuk melenyapkan
// seluruh rekaman lapangan tanpa suara.
{
  const simpan = penyimpanan([titik('a'), titik('b')])
  const hasil = await kirimAntreanDari(simpan, async () =>
    ({ galat: 'function kirim_titik_borongan does not exist' }), Date.now, 1)
  cek('U-ANT-16', 'Galat server yang tidak dikenal TIDAK membuang Titik',
    simpan.lihat().map(t => t.antreanId).join('') === 'ab')
  cek('U-ANT-17', 'Sisa dilaporkan utuh saat galat tidak dikenal',
    hasil.terkirim === 0 && hasil.tersisa === 2)
}

// ---------------------------------------------------------------------
// Umur dihitung saat KIRIM, bukan saat ditangkap
// ---------------------------------------------------------------------
{
  const simpan = penyimpanan([titik('a', 10_000)])
  let usiaTerkirim = null
  await kirimAntreanDari(simpan, async (_k, usia) => { usiaTerkirim = usia[0]; return {} },
    () => 25_000)
  cek('U-ANT-11', 'Umur dihitung pada saat pengiriman (25s - 10s = 15s)', usiaTerkirim === 15_000)
}
{
  const simpan = penyimpanan([titik('a', 90_000)])
  let usiaTerkirim = null
  await kirimAntreanDari(simpan, async (_k, usia) => { usiaTerkirim = usia[0]; return {} },
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
  const sql = readFileSync(
    new URL('../migrations/0056_titik_telat_sesudah_sesi_tutup.sql', import.meta.url), 'utf8')
  cek('U-MUT-06', 'Ambang diragukan di layar sama dengan di fn_catat_titik',
    sql.includes(`p_akurasi_meter > ${AKURASI_DIRAGUKAN_METER}`))
}

// =====================================================================
// Jejak halus dan arah perjalanan (Jalur B1)
// =====================================================================

{
  const asli = [[-6.90, 107.60], [-6.901, 107.601], [-6.9005, 107.6025], [-6.902, 107.604]]
  const halus = haluskanJejak(asli)

  // SIFAT PALING PENTING. Catmull-Rom itu interpolasi: kurvanya wajib
  // melewati PERSIS tiap titik asli. Kalau sifat ini hilang, jejak yang
  // digambar tidak lagi mewakili rekaman — dan jejak ini bisa jadi
  // bahan bukti.
  const adaPersis = t => halus.some(h => h[0] === t[0] && h[1] === t[1])
  cek('U-HLS-01', 'Kurva melewati PERSIS setiap titik asli, tidak menggeser satu pun',
    asli.every(adaPersis))
  cek('U-HLS-02', 'Titik antara benar-benar ditambahkan', halus.length > asli.length)
  cek('U-HLS-03', 'Titik awal dan akhir tidak bergeser',
    halus[0][0] === asli[0][0] && halus[0][1] === asli[0][1]
    && halus.at(-1)[0] === asli.at(-1)[0] && halus.at(-1)[1] === asli.at(-1)[1])
}

// --- Lontaran di belokan (Catmull-Rom sentripetal) ---
{
  // Jarak titik ke SELURUH garis, bukan ke simpul terdekat.
  const keGaris = (p, g) => {
    let min = Infinity
    for (let i = 0; i < g.length - 1; i++) {
      const a = g[i], b = g[i + 1], r = Math.cos(a[0] * Math.PI / 180)
      const dx = b[0] - a[0], dy = (b[1] - a[1]) * r
      const L = dx * dx + dy * dy
      let t = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * r * dy) / L : 0
      t = Math.max(0, Math.min(1, t))
      min = Math.min(min, jarakMeter(p, [a[0] + t * dx, a[1] + t * (b[1] - a[1])]))
    }
    return min
  }
  // Seberapa jauh kurva keluar dari WILAYAH titik yang terekam. Melengkung
  // yang wajar tidak pernah keluar; keluar berarti garisnya menyimpang ke
  // tempat yang petugasnya tidak pernah datangi.
  const keluarWilayah = (kurva, asli) => {
    const la = asli.map(p => p[0]), lo = asli.map(p => p[1])
    const [laMin, laMaks, loMin, loMaks] =
      [Math.min(...la), Math.max(...la), Math.min(...lo), Math.max(...lo)]
    let maks = 0
    for (const p of kurva) {
      const dekat = [Math.min(Math.max(p[0], laMin), laMaks), Math.min(Math.max(p[1], loMin), loMaks)]
      if (dekat[0] !== p[0] || dekat[1] !== p[1]) maks = Math.max(maks, jarakMeter(p, dekat))
    }
    return maks
  }

  // Putar balik — bentuk yang dulu membuat bentuk SERAGAM melontar 37 m.
  const putarBalik = [[-6.900, 107.600], [-6.900, 107.6027], [-6.9005, 107.6027], [-6.9005, 107.600]]
  cek('U-HLS-06', 'Putar balik: kurva tidak melontar jauh ke luar jalur yang terekam',
    keluarWilayah(haluskanJejak(putarBalik), putarBalik) < 15)

  const gang = [[-6.900, 107.600], [-6.9008, 107.600], [-6.9008, 107.6004], [-6.900, 107.6004], [-6.900, 107.601]]
  cek('U-HLS-07', 'Masuk gang lalu keluar: lontaran tetap terkendali',
    keluarWilayah(haluskanJejak(gang), gang) < 10)

  cek('U-HLS-08', 'Ruas panjang diberi titik antara lebih banyak daripada ruas pendek',
    haluskanJejak([[-6.9, 107.6], [-6.9, 107.603], [-6.9, 107.606]]).length
    > haluskanJejak([[-6.9, 107.6], [-6.9, 107.60005], [-6.9, 107.6001]]).length)

  // --- Penyederhanaan (Douglas-Peucker) ---
  const lurusBerderau = []
  let benih = 7
  const acak = () => { benih = (benih * 1103515245 + 12345) & 0x7fffffff; return benih / 0x7fffffff - 0.5 }
  for (let i = 0; i < 150; i++) lurusBerderau.push([-6.9 + acak() * 0.00012, 107.6 + i * 0.00012])
  const sederhana = sederhanakanJejak(lurusBerderau)

  // SIFAT YANG MEMBUATNYA BOLEH DIPAKAI DI SINI. Beda dari penghalus
  // rata-rata dan dari map matching, fungsi ini hanya MEMBUANG titik.
  // Kalau sifat ini hilang, garis di peta berhenti mewakili rekaman.
  cek('U-SDH-01', 'Hanya MEMBUANG titik, tidak pernah menggeser atau mengarang satu pun',
    sederhana.every(t => lurusBerderau.some(a => a[0] === t[0] && a[1] === t[1])))
  cek('U-SDH-02', 'Urutan jejak tidak berubah',
    sederhana.every((t, i) => i === 0
      || lurusBerderau.indexOf(t) > lurusBerderau.indexOf(sederhana[i - 1])))
  cek('U-SDH-03', 'Titik awal dan akhir tidak pernah dibuang',
    sederhana[0] === lurusBerderau[0] && sederhana.at(-1) === lurusBerderau.at(-1))
  cek('U-SDH-04', 'Jalur lurus berderau benar-benar dipangkas',
    sederhana.length < lurusBerderau.length / 2)

  // JAMINAN Douglas-Peucker. Tanpa ini, penyederhanaan bebas memotong
  // tikungan sungguhan dan jejaknya berubah bentuk tanpa terlihat.
  cek('U-SDH-05', `Titik yang dibuang tetap berada dalam ${TOLERANSI_SEDERHANA_METER} m dari garis yang tersisa`,
    lurusBerderau.every(p => keGaris(p, sederhana) <= TOLERANSI_SEDERHANA_METER + 0.001))

  cek('U-SDH-06', 'Toleransi bawaan tidak melebihi ambang akurasi tinggi — simpangan gambar tetap di dalam ketidakpastian rekamannya sendiri',
    TOLERANSI_SEDERHANA_METER <= AKURASI_TINGGI_METER)

  cek('U-SDH-07', 'Tikungan sungguhan TIDAK ikut dipangkas',
    sederhanakanJejak([[-6.900, 107.600], [-6.900, 107.6027], [-6.9027, 107.6027]]).length === 3)

  cek('U-SDH-08', 'Jejak pendek dan kosong dikembalikan apa adanya',
    sederhanakanJejak([]).length === 0 && sederhanakanJejak([[-6.9, 107.6], [-6.91, 107.61]]).length === 2)

  // Sesi panjang tidak boleh membuat tumpukan pemanggilan meledak —
  // sebab itu implementasinya memakai tumpukan, bukan rekursi.
  {
    const panjang = []
    for (let i = 0; i < 12000; i++) panjang.push([-6.9 + acak() * 0.0004, 107.6 + i * 0.00002])
    let aman = true
    try { sederhanakanJejak(panjang) } catch { aman = false }
    cek('U-SDH-09', 'Jejak 12.000 Titik tidak membuat galat tumpukan pemanggilan', aman)
  }
}

cek('U-HLS-04', 'Jejak terlalu pendek dikembalikan apa adanya, bukan dipaksa melengkung',
  haluskanJejak([[-6.9, 107.6], [-6.91, 107.61]]).length === 2)
cek('U-HLS-05', 'Jejak kosong tidak membuat galat', haluskanJejak([]).length === 0)

cek('U-ARH-01', 'Bergerak ke utara menghasilkan arah mendekati 0 derajat',
  Math.abs(arahDerajat([-6.9, 107.6], [-6.89, 107.6])) < 1)
cek('U-ARH-02', 'Bergerak ke timur menghasilkan arah mendekati 90 derajat',
  Math.abs(arahDerajat([-6.9, 107.6], [-6.9, 107.61]) - 90) < 1)
cek('U-ARH-03', 'Bergerak ke barat menghasilkan arah mendekati 270 derajat',
  Math.abs(arahDerajat([-6.9, 107.6], [-6.9, 107.59]) - 270) < 1)
cek('U-ARH-04', 'Arah selalu berada di rentang 0..360',
  [[-6.89, 107.59], [-6.91, 107.61], [-6.91, 107.59]].every(k => {
    const a = arahDerajat([-6.9, 107.6], k)
    return a >= 0 && a < 360
  }))

// =====================================================================
// Tautan navigasi (Jalur B5)
// =====================================================================

{
  const t = tautanNavigasi({ lat: -7.0045408, lng: 107.7438908, nama: 'PT. Dofudomi' })
  cek('U-NAV-01', 'Koordinat yang dikirim, bukan nama tempat',
    t.includes('-7.0045408') && t.includes('107.7438908') && !t.includes('Dofudomi'))
  cek('U-NAV-02', 'Memakai tautan universal yang jatuh ke peramban bila aplikasi peta tidak ada',
    t.startsWith('https://www.google.com/maps/dir/?api=1'))
  cek('U-NAV-03', 'Koordinat dikodekan aman untuk URL', t.includes('destination=-7.0045408%2C107.7438908'))
}
cek('U-NAV-04', 'Koordinat negatif dan nol tidak dibuang',
  tautanNavigasi({ lat: 0, lng: -0.5 }).includes('destination=0%2C-0.5'))

// =====================================================================
// Penyaring Kalman — sumber gambar peta menggantikan Titik mentah
//
// Yang dikejar dua hal yang bisa saling bertentangan: getaran turun,
// TAPI jalurnya tidak menyimpang jauh dari tempat yang sungguh terekam.
// Penyaring yang terlalu ketat akan memotong belokan nyata dan
// "merapikan" jejak menjadi kebohongan yang rapi.
// =====================================================================
{
  const deret = (n, f) => Array.from({ length: n }, (_, i) => f(i))
  const lurus = deret(30, i => ({ la: -6.9 + i * 0.0001, lo: 107.6, akurasi: 8, t: i * 3000 }))

  cek('U-KAL-01', 'Setiap pembacaan tetap menghasilkan satu koordinat, tidak ada yang hilang',
    saringKalman(lurus).length === lurus.length)

  cek('U-KAL-02', 'Kurang dari tiga Titik dikembalikan apa adanya, tanpa ditebak',
    saringKalman(lurus.slice(0, 2)).length === 2)

  cek('U-KAL-03', 'Titik pertama tidak pernah digeser — tidak ada dasar untuk menggesernya',
    jarakMeter(saringKalman(lurus)[0], [lurus[0].la, lurus[0].lo]) < 0.01)

  const hasilLurus = saringKalman(lurus)
  cek('U-KAL-04', 'Jalur lurus tetap lurus, penyaring tidak mengarang belokan',
    hasilLurus.every(p => jarakMeter(p, [p[0], 107.6]) < 1))

  // Diam di tempat: derau ±25 m di sekitar satu titik.
  let benih = 3
  const acak = () => { benih = (benih * 1103515245 + 12345) & 0x7fffffff; return benih / 0x7fffffff - 0.5 }
  const diam = deret(40, i => ({
    la: -6.9 + acak() * 0.00045, lo: 107.6 + acak() * 0.00045, akurasi: 22, t: i * 3000,
  }))
  const pusat = [-6.9, 107.6]
  const rerata = a => a.reduce((x, y) => x + y, 0) / a.length
  const sebarKasar = rerata(diam.map(p => jarakMeter([p.la, p.lo], pusat)))
  const sebarHalus = rerata(saringKalman(diam).map(p => jarakMeter(p, pusat)))
  cek('U-KAL-05', 'Sebaran derau saat diam menyusut, bukan bertambah',
    sebarHalus < sebarKasar)

  // INI yang membuktikan ragam per-Titik benar-benar dipakai. Satu
  // pencilan yang sama, dua pengakuan akurasi berbeda. Yang mengaku
  // akurat WAJIB menarik jalur lebih jauh daripada yang mengaku buruk —
  // kalau ragamnya diabaikan, keduanya akan menarik sama saja.
  const denganPencilan = akurasi => {
    const d = deret(21, i => ({ la: -6.9 + i * 0.0001, lo: 107.6, akurasi: 6, t: i * 3000 }))
    d[10] = { la: d[10].la, lo: 107.6 + 0.0005, akurasi, t: d[10].t }  // ~55 m melenceng
    return saringKalman(d)
  }
  const tarikanAkurat = jarakMeter(denganPencilan(5)[10], [denganPencilan(5)[10][0], 107.6])
  const tarikanBuruk = jarakMeter(denganPencilan(50)[10], [denganPencilan(50)[10][0], 107.6])
  cek('U-KAL-06', 'Pembacaan yang mengaku akurat menarik jalur LEBIH JAUH daripada yang mengaku buruk',
    tarikanAkurat > tarikanBuruk * 1.5)

  cek('U-KAL-07', 'Pencilan berakurasi buruk tidak menyeret jalur sejauh simpangannya sendiri',
    tarikanBuruk < 55 / 2)

  // Kejujuran: garis yang digambar tidak boleh menjauh dari Titik yang
  // sungguh terekam melebihi ketidakpastian pengukurannya sendiri.
  const berkelok = deret(60, i => ({
    la: -6.9 + i * 0.00008 + acak() * 0.00004,
    lo: 107.6 + Math.sin(i / 6) * 0.0004 + acak() * 0.00004,
    akurasi: 9, t: i * 3000,
  }))
  const halusKelok = saringKalman(berkelok)
  const simpang = halusKelok.map((p, i) => jarakMeter(p, [berkelok[i].la, berkelok[i].lo]))
    .sort((a, b) => a - b)
  cek('U-KAL-08', 'Simpangan garis dari Titik asli tetap di dalam ketidakpastian pengukurannya',
    simpang[Math.floor(simpang.length * 0.95)] < 20)

  // Pembersih bentuk TitikJejak mendelegasikan ke aturan yang sama.
  const berjalan = deret(12, i => ({ la: -6.9 + i * 0.0004, lo: 107.6, akurasi: 8, t: i * 3000 }))
  const dibersihkan = bersihkanTitikJejak(berjalan)
  cek('U-KAL-09', 'bersihkanTitikJejak mengembalikan objek Titik utuh, bukan sekadar koordinat',
    dibersihkan.length > 0 && typeof dibersihkan[0].akurasi === 'number'
    && typeof dibersihkan[0].t === 'number')
  cek('U-KAL-10', 'Yang dikembalikan benar-benar Titik ASLI, bukan salinan yang dibentuk ulang',
    dibersihkan.every(p => berjalan.includes(p)))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji antrean luring lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
