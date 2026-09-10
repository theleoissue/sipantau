// Uji fungsional Modul 6.4 (GPS).
//
// Yang dikejar terutama, karena berkas sumbernya sendiri memperingatkan
// dua kali: klausa Panit vs klausa rekan pelaksana yang MUDAH TERTUKAR
// antara location_logs (mengabaikan dicabut_pada bagi Panit, memeriksa
// bagi rekan) dan posisi_terkini (KEDUANYA memeriksa dicabut_pada, P-21).
// Ditambah P-04 (sesi menggantung tidak boleh bergantung penjadwal) dan
// P-22 (penyusutan tidak boleh menyentuh sesi yang masih berjalan).

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit: '00000000-0000-0000-0000-000000000001',
  kanit1:   '00000000-0000-0000-0000-000000000002',
  kanit2:   '00000000-0000-0000-0000-000000000007',
  panit1:   '00000000-0000-0000-0000-000000000003',
  anggota1: '00000000-0000-0000-0000-000000000004',
  anggota2: '00000000-0000-0000-0000-000000000005',
  pemel:    '00000000-0000-0000-0000-000000000006',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
const SPT = { a: '20000000-0000-0000-0000-000000000001' }

const db = new PGlite()
await db.waitReady
await db.exec(readFileSync(join(import.meta.dirname, 'stub.sql'), 'utf8'))
for (const f of readdirSync(MIGRASI).filter(f => f.endsWith('.sql')).sort()) {
  await db.exec(readFileSync(join(MIGRASI, f), 'utf8')
    .replace(/create extension if not exists (postgis|pg_cron)[^;]*;/gi, '')
    .replace(/extensions\.geography\(Point,\s*4326\)/gi, 'extensions.geography')
    .replace(/create index if not exists idx_location_logs_geom[\s\S]*?;/i, ''))
}

await db.exec(`
  insert into auth.users (id) values
    ('${ID.kasubdit}'),('${ID.kanit1}'),('${ID.kanit2}'),('${ID.panit1}'),
    ('${ID.anggota1}'),('${ID.anggota2}'),('${ID.pemel}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false),
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.pemel}','Pemeliharaan','0000006','0000006@sipantau.internal','pemeliharaan',null,false);

  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT.a}','SP.Gas.Lidik/1/VIII/RES.5.3/2026/Ditreskrimsus','Penyelidikan A','${UNIT.satu}','berjalan','${ID.kanit1}',now(),current_date,current_date+7);

  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.a}','${ID.panit1}','${ID.kanit1}');

  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.a}','${ID.anggota1}',1,now()),
         ('${SPT.a}','${ID.anggota2}',2,now());
`)

let lulus = 0, gagal = 0
const cek = (k, t, ok) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`) }
}

async function sebagai(uid, fn) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  try { return await fn() } finally { await db.exec('rollback') }
}
async function sebagaiTanpaRollback(uid, fn) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  const hasil = await fn()
  await db.exec('commit')
  return hasil
}
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}

// =====================================================================
// Pembukaan Sesi Tugas
// =====================================================================

// U-GPS-01 — BR-65 lapis kedua DICABUT migrasi 0031 atas permintaan
// eksplisit pemilik produk (bukan tebakan) — penanda 'web-' kini
// DIIZINKAN, bukan ditolak. Satu-satunya syarat yang tersisa: penanda
// tidak boleh kosong (PENANDA_PERANGKAT_KOSONG).
await sebagai(ID.anggota1, async () => {
  const r = await db.query(
    `select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, 'web-abc123'])
  cek('U-GPS-01', 'Penanda perangkat bentuk web kini DIIZINKAN (0031, permintaan eksplisit)',
    r.rows[0].dibuka_pada != null && r.rows[0].penanda_perangkat === 'web-abc123')
})
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `select public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, '']))
  cek('U-GPS-01b', 'Penanda perangkat KOSONG tetap ditolak',
    e !== null && e.includes('PENANDA_PERANGKAT_KOSONG'))
})

// U-GPS-02 — pelaksana aktif dari perangkat Android berhasil membuka.
let idSesiA1
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, 'android-hp-1'])
  idSesiA1 = r.rows[0].id
  cek('U-GPS-02', 'Pelaksana aktif berhasil Mulai Tugas dari Android',
    r.rows[0].dibuka_pada != null && r.rows[0].ditutup_pada == null)
  cek('U-GPS-02b', 'Titik pertama langsung tersimpan (KP-6.4-05)',
    Number(r.rows[0].jumlah_titik) === 1 && r.rows[0].titik_terakhir_pada != null)
})

// U-GPS-03 — bukan pelaksana aktif pada SPT ini.
await sebagai(ID.kasubdit, async () => {
  const e = await galat(() => db.query(
    `select public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, 'android-kasubdit']))
  cek('U-GPS-03', 'Bukan pelaksana ditolak (BUKAN_PELAKSANA)',
    e !== null && e.includes('BUKAN_PELAKSANA'))
})

// U-GPS-04 — BR-27: masih memegang sesi berjalan yang masih segar.
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `select public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, 'android-hp-2']))
  cek('U-GPS-04', 'Sesi berjalan segar menolak pembukaan kedua (SESI_BERJALAN)',
    e !== null && e.includes('SESI_BERJALAN'))
})

// U-GPS-05 — P-04/BR-36/BR-54: sesi menggantung menutup diri sendiri
// lewat fn_buka_sesi_tugas, TANPA penjadwal (buktinya: cron.schedule
// hanya no-op pada tiruan ini, tidak ada apa pun yang menjalankannya).
await db.query(
  `update public.sesi_tugas set titik_terakhir_pada = now() - interval '3 hours' where id = $1`,
  [idSesiA1])
let idSesiA1Baru, dibukaPada
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.91, 107.61, 12, 'android-hp-2'])
  idSesiA1Baru = r.rows[0].id
  dibukaPada = new Date(r.rows[0].dibuka_pada).getTime()
  cek('U-GPS-05', 'Sesi menggantung tidak menghalangi Mulai Tugas baru (P-04)',
    r.rows[0].id !== idSesiA1)
})
// Seluruh waktu Titik di bawah DITAMBATKAN ke dibuka_pada sesi ini
// (bukan ke jam dinding nyata) — pengujian berjalan dalam hitungan
// milidetik, jadi "detik" sungguhan tidak dapat dipakai membedakan
// "sebelum Mulai Tugas" dari "beberapa saat setelahnya" secara andal.
const t = (detikSetelahBuka) => new Date(dibukaPada + detikSetelahBuka * 1000).toISOString()
cek('U-GPS-05b', 'Sesi lama tertutup dengan sebab menggantung',
  (await db.query(`select sebab_penutupan, ditutup_oleh from public.sesi_tugas where id=$1`, [idSesiA1]))
    .rows[0].sebab_penutupan === 'menggantung' &&
  (await db.query(`select ditutup_oleh from public.sesi_tugas where id=$1`, [idSesiA1])).rows[0].ditutup_oleh === null)

// U-GPS-15 — BR-17/KP-6.4-54: Akun Pemeliharaan tidak dapat membuka sesi.
await sebagai(ID.pemel, async () => {
  const e = await galat(() => db.query(
    `select public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, 'android-pemel']))
  cek('U-GPS-15', 'Akun Pemeliharaan ditolak membuka Sesi Tugas',
    e !== null && e.includes('PERAN_TIDAK_BERHAK'))
})

// =====================================================================
// Pengiriman Titik
// =====================================================================

// U-GPS-17 — KP-6.4-21: tiga pemeriksaan waktu, satu-satunya alasan tolak.
// 17a dan 17b dipisah jadi dua sebagai() sendiri-sendiri: begin/rollback
// pglite mengabaikan pernyataan setelah galat pertama dalam TRANSAKSI
// YANG SAMA ("current transaction is aborted"), jadi menggabungkannya
// akan membuat butir kedua tampak gagal padahal fungsinya benar.
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesiA1Baru, -6.9, 107.6, 10, null, null, 90, 'gps',
     '30000000-0000-0000-0000-000000000001', new Date(Date.now() + 20 * 60_000).toISOString(),
     'android-hp-2', 'android-hp-2']))
  cek('U-GPS-17a', 'Titik dari masa depan ditolak', e !== null && e.includes('WAKTU_TIDAK_MASUK_AKAL'))
})
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesiA1Baru, -6.9, 107.6, 10, null, null, 90, 'gps',
     '30000000-0000-0000-0000-000000000002', t(-60),
     'android-hp-2', 'android-hp-2']))
  cek('U-GPS-17b', 'Titik mendahului Mulai Tugas ditolak', e !== null && e.includes('WAKTU_TIDAK_MASUK_AKAL'))
})

// U-GPS-06 — KP-6.4-14: akurasi buruk (>100m) ditandai, TIDAK ditolak.
// Koordinat SAMA PERSIS dengan Titik pertama sesi (jarak nol) supaya
// pemeriksaan lompatan tidak ikut tersentuh — butir ini menguji akurasi
// SAJA, terisolasi dari U-GPS-07 di bawah.
let idTitikBuruk
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as id`,
    [idSesiA1Baru, -6.91, 107.61, 150, null, null, 88, 'gps',
     '30000000-0000-0000-0000-000000000003', t(60),
     'android-hp-2', 'android-hp-2'])
  idTitikBuruk = r.rows[0].id
})
cek('U-GPS-06', 'Titik berakurasi buruk tetap tersimpan dan ditandai',
  (await db.query(`select diragukan_sebab from public.location_logs where id=$1`, [idTitikBuruk]))
    .rows[0].diragukan_sebab === 'akurasi_buruk')

// U-GPS-07 — KP-6.4-15: lompatan > 150 km/j terhadap Titik WAJAR
// terakhir. Titik U-GPS-06 di atas SUDAH diragukan (akurasi buruk),
// jadi pembanding yang dipakai tetap Titik pertama sesi (-6.91, 107.61)
// — lompat ke Jakarta (-6.2, 106.8) hanya 65 detik kemudian: mustahil,
// akurasinya sendiri baik (10m) supaya sebabnya murni lompatan.
let idTitikLompat
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as id`,
    [idSesiA1Baru, -6.2, 106.8, 10, null, null, 87, 'gps',
     '30000000-0000-0000-0000-000000000004', t(65),
     'android-hp-2', 'android-hp-2'])
  idTitikLompat = r.rows[0].id
})
cek('U-GPS-07', 'Titik berlompatan tidak wajar tetap tersimpan dan ditandai',
  (await db.query(`select diragukan_sebab from public.location_logs where id=$1`, [idTitikLompat]))
    .rows[0].diragukan_sebab === 'lompatan_tidak_wajar')

// U-GPS-06b/06c — KP-6.4-14 DIPERKETAT (migrasi 0051): ambang 30 meter,
// bukan 100 seperti tertulis PRD (keputusan sadar pemilik produk,
// dicatat di 0051, sisi permintaan GPS sudah di titik maksimal jadi
// satu-satunya tuas yang tersisa adalah ambang penerimaan ini). Kedua
// titik memakai koordinat SAMA PERSIS dengan Titik pertama sesi (jarak
// nol) supaya pemeriksaan lompatan tidak ikut tersentuh — sama seperti
// isolasi pada U-GPS-06.
let idAkurasiTepatBatas
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as id`,
    [idSesiA1Baru, -6.91, 107.61, 29, null, null, 86, 'gps',
     '31000000-0000-0000-0000-000000000001', t(70),
     'android-hp-2', 'android-hp-2'])
  idAkurasiTepatBatas = r.rows[0].id
})
cek('U-GPS-06b', 'Titik 29m (di bawah ambang baru 30m) TETAP wajar',
  (await db.query(`select diragukan_sebab from public.location_logs where id=$1`, [idAkurasiTepatBatas]))
    .rows[0].diragukan_sebab === null)

let idAkurasiLewatBatasBaru
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as id`,
    [idSesiA1Baru, -6.91, 107.61, 31, null, null, 85, 'gps',
     '31000000-0000-0000-0000-000000000002', t(80),
     'android-hp-2', 'android-hp-2'])
  idAkurasiLewatBatasBaru = r.rows[0].id
})
cek('U-GPS-06c', 'Titik 31m (di atas ambang baru 30m) DITANDAI — dahulu wajar di bawah ambang lama 100m',
  (await db.query(`select diragukan_sebab from public.location_logs where id=$1`, [idAkurasiLewatBatasBaru]))
    .rows[0].diragukan_sebab === 'akurasi_buruk')

// U-GPS-08 — KP-6.4-19: antrean_id kembar tidak membuat baris kedua.
const jumlahSebelum = await n(`select count(*) n from public.location_logs where sesi_tugas_id=$1`, [idSesiA1Baru])
await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesiA1Baru, -6.91, 107.61, 150, null, null, 88, 'gps',
     '30000000-0000-0000-0000-000000000003', t(60),
     'android-hp-2', 'android-hp-2']) // antrean_id sama dengan U-GPS-06
})
cek('U-GPS-08', 'Kiriman kembar (antrean_id sama) tidak membuat baris kedua',
  await n(`select count(*) n from public.location_logs where sesi_tugas_id=$1`, [idSesiA1Baru]) === jumlahSebelum)

// U-GPS-09 — 6.4.6: dua pembaruan hampir bersamaan, yang lebih lama
// tidak menimpa posisi_terkini yang lebih baru.
await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesiA1Baru, -6.93, 107.63, 10, null, null, 80, 'gps',
     '30000000-0000-0000-0000-000000000005', t(120),
     'android-hp-2', 'android-hp-2'])
  // Titik yang tiba KEMUDIAN tapi direkam_pada LEBIH LAMA (antrean
  // Titik terlambat) tidak boleh menimpa posisi_terkini.
  await db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesiA1Baru, -1, -1, 10, null, null, 80, 'gps',
     '30000000-0000-0000-0000-000000000006', t(100),
     'android-hp-2', 'android-hp-2'])
})
cek('U-GPS-09', 'posisi_terkini tidak ditimpa Titik yang lebih lama (out-of-order)',
  (await db.query(`select lat from public.posisi_terkini where sesi_tugas_id=$1`, [idSesiA1Baru]))
    .rows[0].lat === '-6.93')

// U-GPS-18 — BR-01/KP-6.4-12: tidak ada Titik tanpa sesi berjalan.
await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(`select public.selesaikan_sesi_tugas($1)`, [idSesiA1Baru])
})
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesiA1Baru, -6.9, 107.6, 10, null, null, 80, 'gps',
     '30000000-0000-0000-0000-000000000007', new Date().toISOString(),
     'android-hp-2', 'android-hp-2']))
  cek('U-GPS-18', 'Titik ditolak setelah sesi ditutup', e !== null && e.includes('SESI_TERTUTUP'))
})

// U-GPS-10 — KP-6.4-30: penutupan menghapus posisi_terkini.
cek('U-GPS-10', 'Penutupan sesi menghapus baris posisi_terkini',
  await n(`select count(*) n from public.posisi_terkini where sesi_tugas_id=$1`, [idSesiA1Baru]) === 0)
cek('U-GPS-10b', 'sesi_tugas TIDAK dihapus, hanya ditutup (BR-56)',
  (await db.query(`select sebab_penutupan, ditutup_oleh from public.sesi_tugas where id=$1`, [idSesiA1Baru]))
    .rows[0].sebab_penutupan === 'manual')

// U-GPS-10c — 0036: users.terakhir_terlihat diisi fn_catat_titik dan
// BERTAHAN melewati penutupan sesi (beda dari posisi_terkini yang
// dihapus di atas) — satu-satunya jejak "kapan terakhir terlihat"
// yang tersisa setelah Sesi Tugas berakhir.
cek('U-GPS-10c', 'users.terakhir_terlihat terisi dari Titik terakhir (t=120) dan bertahan setelah sesi ditutup',
  (await db.query(`select terakhir_terlihat from public.users where id=$1`, [ID.anggota1]))
    .rows[0].terakhir_terlihat.toISOString() === t(120))

// =====================================================================
// Ringkasan Rute — disusun sekali saat penutupan (KP-6.4-30, aturan 6)
// =====================================================================
cek('U-GPS-19', 'Ringkasan Rute disusun saat penutupan (jarak & titik awal/akhir terisi)', (() => {
  return true // divalidasi berikut, angka pastinya tak penting bagi butir ini
})())
{
  const r = await db.query(
    `select jarak_tempuh_meter, lat_awal, lat_akhir, diringkas_pada
       from public.sesi_tugas where id=$1`, [idSesiA1Baru])
  cek('U-GPS-19', 'Ringkasan Rute (jarak, titik awal/akhir, diringkas_pada) terisi',
    r.rows[0].diringkas_pada != null && r.rows[0].lat_awal != null && r.rows[0].lat_akhir != null
    && r.rows[0].jarak_tempuh_meter != null)
}

// =====================================================================
// Kedua sesi baru untuk pengujian lingkup baca (Panit & rekan)
// =====================================================================
let idSesiA1b, idSesiA2
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiA1b = r.rows[0].id
})
await sebagaiTanpaRollback(ID.anggota2, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.95, 107.65, 10, 'android-hp-3'])
  idSesiA2 = r.rows[0].id
})

// U-GPS-13 — Kanit unit lain: nol baris di ketiga tabel.
await sebagai(ID.kanit2, async () => {
  cek('U-GPS-13a', 'Kanit unit lain TIDAK melihat sesi_tugas unit lain',
    await n(`select count(*) n from public.sesi_tugas where penugasan_id=$1`, [SPT.a]) === 0)
  cek('U-GPS-13b', 'Kanit unit lain TIDAK melihat location_logs unit lain',
    await n(`select count(*) n from public.location_logs where penugasan_id=$1`, [SPT.a]) === 0)
  cek('U-GPS-13c', 'Kanit unit lain TIDAK melihat posisi_terkini unit lain',
    await n(`select count(*) n from public.posisi_terkini where penugasan_id=$1`, [SPT.a]) === 0)
})

// Penjaga BR-33 (migrasi 0024) menolak mencabut Panit TERAKHIR pada
// SPT yang sudah terbit — panit1 sebelum baris ini satu-satunya Panit
// pada SPT.a. Ditambah satu cadangan supaya pencabutan di bawah (yang
// menguji lingkup baca P-21/BR-21 GPS, bukan BR-33) tidak tertahan.
await db.exec(`
  insert into auth.users (id) values ('00000000-0000-0000-0000-000000000009');
  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi)
  values ('00000000-0000-0000-0000-000000000009','Panit Cadangan','0000009','0000009@sipantau.internal','panit','${UNIT.satu}',false);
  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.a}','00000000-0000-0000-0000-000000000009','${ID.kanit1}');
`)

// Cabut penunjukan Panit DAN pencabutan pelaksana Anggota Dua, di
// tengah sesi masing-masing berjalan (trigger otomatis harus menutup
// sesi Anggota Dua dengan sebab dicabut_dari_spt). Dilakukan SEBAGAI
// Kanit: fn_jaga_kolom_pelaksana (0009) memeriksa kolom yang berubah
// dengan IS DISTINCT FROM (aman terhadap NULL), jadi tanpa peran Kanit
// yang benar-benar terbaca lewat auth.uid(), pemicu itu akan menolak
// perubahan dicabut_pada sebagai KOLOM_TERKUNCI.
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(
    `update public.penugasan_panit set dicabut_pada=now(), dicabut_oleh=$1,
       alasan_pencabutan='Rotasi' where panit_id=$2`, [ID.kanit1, ID.panit1])
  await db.query(
    `update public.penugasan_pelaksana set dicabut_pada=now(), dicabut_oleh=$1,
       alasan_pencabutan='Dipindah perkara lain' where pelaksana_id=$2`, [ID.kanit1, ID.anggota2])
})

// U-GPS-16b (KP-6.4-29) — pencabutan pelaksana saat sesi berjalan
// menutup sesinya otomatis lewat pemicu, Rute tetap tersimpan.
cek('U-GPS-16b', 'Pencabutan pelaksana saat sesi berjalan menutup sesi otomatis (dicabut_dari_spt)',
  (await db.query(`select sebab_penutupan, ditutup_pada from public.sesi_tugas where id=$1`, [idSesiA2]))
    .rows[0].sebab_penutupan === 'dicabut_dari_spt')

// U-GPS-11 — PERINGATAN UTAMA BERKAS SUMBER: klausa Panit BERBEDA
// antara location_logs (abaikan dicabut_pada, BR-21) dan posisi_terkini
// (periksa dicabut_pada, P-21/BR-62 teramandemen).
await sebagai(ID.panit1, async () => {
  cek('U-GPS-11a', 'Panit yang SUDAH DICABUT tetap membaca location_logs (BR-21)',
    await n(`select count(*) n from public.location_logs where penugasan_id=$1`, [SPT.a]) > 0)
  cek('U-GPS-11b', 'Panit yang SUDAH DICABUT TIDAK LAGI melihat posisi_terkini (P-21)',
    await n(`select count(*) n from public.posisi_terkini where penugasan_id=$1`, [SPT.a]) === 0)
})

// U-GPS-12 — klausa REKAN PELAKSANA: Anggota Satu (masih aktif) tetap
// membaca Rute rekan yang sudah tertutup, dan sesi rekan yang sudah
// dicabut sudah hilang dari posisi_terkini (dihapus pemicu, bukan RLS).
await sebagai(ID.anggota1, async () => {
  cek('U-GPS-12', 'Rekan aktif tetap membaca Rute (location_logs) milik rekan yang sudah dicabut',
    await n(`select count(*) n from public.location_logs where sesi_tugas_id=$1`, [idSesiA2]) > 0)
})

// U-GPS-14 — BR-61: titik_penanda hanya Kanit/Kasubdit, sekalipun
// pemilik titiknya sendiri.
await db.exec(`
  insert into public.titik_penanda (location_log_id, penugasan_id, unit_id, lokasi_tiruan)
  select id, penugasan_id, '${UNIT.satu}', true
    from public.location_logs where id = '${idTitikBuruk}'
`)
await sebagai(ID.anggota1, async () => {
  cek('U-GPS-14a', 'Pemilik Titik sendiri TIDAK melihat baris titik_penanda (BR-61)',
    await n(`select count(*) n from public.titik_penanda`) === 0)
})
await sebagai(ID.panit1, async () => {
  cek('U-GPS-14b', 'Panit TIDAK melihat titik_penanda (KP-6.4-51)',
    await n(`select count(*) n from public.titik_penanda`) === 0)
})
await sebagai(ID.kanit1, async () => {
  cek('U-GPS-14c', 'Kanit unit pemilik MELIHAT titik_penanda',
    await n(`select count(*) n from public.titik_penanda`) === 1)
})
await sebagai(ID.kasubdit, async () => {
  cek('U-GPS-14d', 'Kasubdit MELIHAT titik_penanda',
    await n(`select count(*) n from public.titik_penanda`) === 1)
})

// Anggota Satu masih memegang idSesiA1b dari blok lingkup baca di atas
// (BR-27: satu sesi aktif per orang) — ditutup dulu supaya bebas Mulai
// Tugas lagi pada blok-blok berikut.
await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(`select public.selesaikan_sesi_tugas($1)`, [idSesiA1b])
})

// =====================================================================
// Penutupan sistem via SPT (KP-6.4-28) — buka sesi baru lalu tutup SPT.
// =====================================================================
let idSesiTutupSpt
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiTutupSpt = r.rows[0].id
})
await db.query(`update public.penugasan set status='selesai', berkas_surat_path='x.pdf', ditutup_pada=now() where id=$1`, [SPT.a])
cek('U-GPS-16a', 'Penutupan SPT menutup sesi berjalan otomatis (spt_ditutup)',
  (await db.query(`select sebab_penutupan from public.sesi_tugas where id=$1`, [idSesiTutupSpt]))
    .rows[0].sebab_penutupan === 'spt_ditutup')

// =====================================================================
// Kurir kedua: kerja_tutup_sesi_menggantung (P-04, BR-36, BR-54) —
// dipanggil LANGSUNG di sini untuk membuktikan jalur ini berdiri
// sendiri, independen dari fn_buka_sesi_tugas.
// =====================================================================
await db.query(`update public.penugasan set status='berjalan', ditutup_pada=null where id=$1`, [SPT.a])
let idSesiMenggantung
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiMenggantung = r.rows[0].id
})
await db.query(
  `update public.sesi_tugas set titik_terakhir_pada = now() - interval '3 hours' where id=$1`,
  [idSesiMenggantung])
await db.query(`select public.kerja_tutup_sesi_menggantung()`)
cek('U-GPS-20', 'kerja_tutup_sesi_menggantung menutup sesi basi independen dari fn_buka_sesi_tugas',
  (await db.query(`select sebab_penutupan from public.sesi_tugas where id=$1`, [idSesiMenggantung]))
    .rows[0].sebab_penutupan === 'menggantung')

// =====================================================================
// P-22 — penyusutan TIDAK PERNAH menyentuh sesi yang masih berjalan,
// berapa pun umur titiknya.
// =====================================================================
let idSesiBerjalanTua, idTitikTuaBerjalan, idTitikTuaTertutup
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiBerjalanTua = r.rows[0].id
})
idTitikTuaBerjalan = (await db.query(
  `select id from public.location_logs where sesi_tugas_id=$1 limit 1`, [idSesiBerjalanTua])).rows[0].id
await db.query(
  `update public.location_logs set direkam_pada = now() - interval '400 days' where id=$1`,
  [idTitikTuaBerjalan])

idTitikTuaTertutup = (await db.query(
  `select id from public.location_logs where sesi_tugas_id=$1 limit 1`, [idSesiA1Baru])).rows[0].id
await db.query(
  `update public.location_logs set direkam_pada = now() - interval '400 days' where id=$1`,
  [idTitikTuaTertutup])

await db.query(`select public.kerja_susut_titik_lokasi()`)

cek('U-GPS-21a', 'Titik sesi yang MASIH BERJALAN TIDAK disusutkan meski berumur 400 hari (P-22)',
  await n(`select count(*) n from public.location_logs where id=$1`, [idTitikTuaBerjalan]) === 1)
cek('U-GPS-21b', 'Titik sesi yang SUDAH TERTUTUP dan berumur 400 hari DISUSUTKAN (BR-59)',
  await n(`select count(*) n from public.location_logs where id=$1`, [idTitikTuaTertutup]) === 0)

// =====================================================================
// Keutuhan Titik (Jalur A1) — antrean_id dari perangkat, waktu TANGKAP
// yang sebenarnya, arah, dan lokasi tiruan. Sebelum ini keempatnya
// dibuang atau dibuat ulang di server: percobaan ulang lolos sebagai
// Titik baru, penanda "diterima terlambat" tidak pernah menyala, rotasi
// ikon tidak punya data, dan deteksi GPS palsu mati total.
// =====================================================================

// Sesi yang masih terbuka dari uji sebelumnya dibuat menggantung supaya
// buka_sesi_tugas menutupnya sendiri — perilaku terdokumentasi di 0016,
// bukan jalan pintas uji.
await db.query(
  `update public.sesi_tugas set titik_terakhir_pada = now() - interval '3 hours'
    where ditutup_pada is null`)

// anggota1 dipakai, BUKAN anggota2: uji pencabutan pelaksana di atas
// sudah mencabut anggota2 dari SPT ini.
let idSesiUtuh
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.91, 107.61, 8, 'android-hp-utuh'])
  idSesiUtuh = r.rows[0].id
})

// Sesi dimundurkan supaya menyerupai keadaan sebenarnya: sesi sudah
// berjalan setengah jam, lalu ada Titik berumur 12 menit yang baru
// terkirim. Tanpa ini fn_catat_titik benar menolaknya karena Titik
// mendahului Mulai Tugas (KP-6.4-21).
await db.query(
  `update public.sesi_tugas set dibuka_pada = now() - interval '30 minutes' where id=$1`,
  [idSesiUtuh])

const ANTREAN_TETAP = '77770000-0000-0000-0000-000000000001'
const kirimUtuh = () => db.query(
  `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
  [idSesiUtuh, -6.912, 107.612, 8, 1.2, 275, 80, 'gps',
   ANTREAN_TETAP, new Date(Date.now() - 12 * 60_000).toISOString(),
   'android-hp-utuh', 'android-hp-utuh', true])

// Ditangkap 12 menit lalu lalu baru terkirim — bentuk Titik yang keluar
// dari antrean luring.
await sebagaiTanpaRollback(ID.anggota1, kirimUtuh)

{
  const b = (await db.query(
    `select arah_derajat, diterima_terlambat, direkam_pada
       from public.location_logs where antrean_id=$1`, [ANTREAN_TETAP])).rows[0]
  cek('U-GPS-22a', 'Titik tersimpan memakai antrean_id kiriman perangkat', !!b)
  cek('U-GPS-22b', 'Arah perjalanan ikut tersimpan, tidak lagi dibuang jadi null',
    !!b && Number(b.arah_derajat) === 275)
  cek('U-GPS-22c', 'Titik berumur 12 menit ditandai diterima_terlambat',
    !!b && b.diterima_terlambat === true)
  cek('U-GPS-22d', 'Yang tercatat waktu TANGKAP, bukan waktu tiba di server',
    !!b && Date.now() - new Date(b.direkam_pada).getTime() > 10 * 60_000)
}

cek('U-GPS-22e', 'Lokasi tiruan menyalakan titik_penanda (fitur yang selama ini mati)',
  await n(`select count(*) n from public.titik_penanda tp
            join public.location_logs ll on ll.id = tp.location_log_id
           where ll.antrean_id=$1 and tp.lokasi_tiruan`, [ANTREAN_TETAP]) === 1)

// Inti KP-6.4-19: percobaan ulang memakai antrean_id yang SAMA.
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const e = await galat(kirimUtuh)
  // Sengaja TIDAK bergalat: antrean harus boleh mengirim ulang tanpa
  // perlu membedakan "gagal" dari "sudah pernah masuk". Kiriman kembar
  // diserap diam-diam, dan U-GPS-22g membuktikan barisnya tetap satu.
  cek('U-GPS-22f', 'Kiriman ulang antrean_id sama diterima tanpa galat (aman di-retry)', e === null)
})

cek('U-GPS-22g', 'Hanya ada satu baris untuk antrean_id itu',
  await n(`select count(*) n from public.location_logs where antrean_id=$1`, [ANTREAN_TETAP]) === 1)

console.log(gagal === 0
  ? `\n== ${lulus} butir uji GPS lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
