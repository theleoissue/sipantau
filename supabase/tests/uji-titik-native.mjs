// Uji Pengiriman Native GPS (migrasi 0037 + 0038).
//
// Yang dikejar: token ini satu-satunya kredensial di seluruh sistem yang
// berdiri LEPAS dari sesi masuk — dipakai kode native ketika proses
// aplikasi sudah mati dan auth.uid() tidak ada lagi. Karena itu batas
// kemampuannya wajib diuji dari dua arah sekaligus: yang berhak memang
// bisa, dan yang tidak berhak memang TIDAK bisa (CLAUDE.md §9).

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kanit1:   '00000000-0000-0000-0000-000000000002',
  anggota1: '00000000-0000-0000-0000-000000000004',
  anggota2: '00000000-0000-0000-0000-000000000005',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001' }
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
    ('${ID.kanit1}'),('${ID.anggota1}'),('${ID.anggota2}');

  insert into public.unit (id, nama, urutan) values ('${UNIT.satu}','Unit I',1);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.satu}',false);

  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT.a}','SP.Gas.Lidik/1/VIII/RES.5.3/2026/Ditreskrimsus','Penyelidikan A','${UNIT.satu}','berjalan','${ID.kanit1}',now(),current_date,current_date+7);

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
  const hasil = await fn()
  await db.exec('commit')
  return hasil
}
// Fungsi Tepi titik-native memanggil dengan kunci service_role; keadaan
// itu ditirukan di sini, TANPA satu pun klaim jwt terpasang — persis
// seperti sungguhan, di mana tidak ada sesi masuk sama sekali.
async function sebagaiService(fn) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims','',true)`)
  await db.exec('set local role service_role')
  const hasil = await fn()
  await db.exec('commit')
  return hasil
}
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)
async function galat(fn) {
  try { await fn(); return null } catch (e) { await db.exec('rollback'); return e.message }
}

// Sesi Tugas milik anggota1, dibuka lewat jalur biasa.
const idSesi = await sebagai(ID.anggota1, async () =>
  (await db.query(`select id from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 15, 'android-uji-1'])).rows[0].id)

// =====================================================================
// Penerbitan token
// =====================================================================

const token = await sebagai(ID.anggota1, async () =>
  (await db.query(`select public.terbitkan_token_sesi_native($1,$2) t`,
    [idSesi, 'android-uji-1'])).rows[0].t)

cek('U-TN-01', 'Pemegang sesi menerbitkan token: 64 aksara heksadesimal',
  typeof token === 'string' && /^[0-9a-f]{64}$/.test(token))

cek('U-TN-02', 'Yang tersimpan hanya SIDIK token, bukan tokennya sendiri',
  await n(`select count(*) n from public.token_sesi_native
            where sesi_tugas_id=$1 and token_hash = sha256(convert_to($2,'UTF8'))`,
          [idSesi, token]) === 1
  && await n(`select count(*) n from public.token_sesi_native
               where encode(token_hash,'hex') = $1`, [token]) === 0)

cek('U-TN-03', 'Penanda perangkat DIIKAT saat penerbitan, bukan dikirim tiap Titik',
  (await db.query(`select penanda_perangkat p from public.token_sesi_native where sesi_tugas_id=$1`,
    [idSesi])).rows[0].p === 'android-uji-1')

{
  const e = await galat(() => sebagai(ID.anggota2, () =>
    db.query(`select public.terbitkan_token_sesi_native($1,$2)`, [idSesi, 'android-lain'])))
  cek('U-TN-04', 'Orang LAIN tidak dapat menerbitkan token atas sesi bukan miliknya',
    e !== null && e.includes('BUKAN_PEMEGANG'))
}
{
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(`select public.terbitkan_token_sesi_native($1,$2)`, [idSesi, '   '])))
  cek('U-TN-05', 'Penanda perangkat kosong ditolak saat penerbitan',
    e !== null && e.includes('MASUKAN_TIDAK_LENGKAP'))
}

// =====================================================================
// Pengiriman Titik lewat token
// =====================================================================

// Titik pembuka sesi (ditulis buka_sesi_tugas) dituakan lebih dulu.
// Penjaga Titik ganda (migrasi 0040) memang menolak Titik native yang
// datang dalam 10 detik sesudah Titik lain — di lapangan Titik pembuka
// dan Titik berikutnya berjarak belasan detik, bukan milidetik seperti
// di dalam uji ini. Tanpa penuaan ini yang teruji bukan jalur native
// melainkan penjaganya sendiri, yang sudah diuji tersendiri di bawah.
await db.query(
  `update public.location_logs set direkam_pada = direkam_pada - interval '60 seconds'
    where sesi_tugas_id=$1`, [idSesi])

const idTitik = await sebagaiService(async () =>
  (await db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6) id`,
    [token, -6.91, 107.61, 12, 1.4, 90])).rows[0].id)

cek('U-TN-06', 'Token sah menyimpan Titik TANPA sesi masuk sama sekali',
  idTitik != null &&
  await n(`select count(*) n from public.location_logs where id=$1`, [idTitik]) === 1)

cek('U-TN-07', 'Titik masuk ke sesi yang ditunjuk token, memakai penanda yang diikat',
  await n(`select count(*) n from public.location_logs
            where id=$1 and sesi_tugas_id=$2 and penanda_perangkat='android-uji-1'`,
          [idTitik, idSesi]) === 1)

cek('U-TN-08', 'Akurasi <= 50 m dicatat sebagai sumber gps (ambang sama dengan jalur biasa)',
  await n(`select count(*) n from public.location_logs where id=$1 and sumber_lokasi='gps'`,
          [idTitik]) === 1)

cek('U-TN-09', 'posisi_terkini ikut diperbarui — peta pengawas hidup dari jalur native juga',
  await n(`select count(*) n from public.posisi_terkini
            where sesi_tugas_id=$1 and lat=-6.91 and lng=107.61`, [idSesi]) === 1)

cek('U-TN-10', 'users.terakhir_terlihat ikut terisi dari jalur native (0036 tetap berlaku)',
  await n(`select count(*) n from public.users
            where id=$1 and terakhir_terlihat is not null`, [ID.anggota1]) === 1)

cek('U-TN-11', 'dipakai_pada tercatat, supaya jalur native dapat ditelusuri',
  await n(`select count(*) n from public.token_sesi_native
            where sesi_tugas_id=$1 and dipakai_pada is not null`, [idSesi]) === 1)

// =====================================================================
// Penolakan
// =====================================================================

{
  const e = await galat(() => sebagaiService(() =>
    db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6)`,
      ['f'.repeat(64), -6.9, 107.6, 12, null, null])))
  cek('U-TN-12', 'Token yang tidak dikenal ditolak', e !== null && e.includes('TOKEN_TIDAK_SAH'))
}
{
  const e = await galat(() => sebagaiService(() =>
    db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6)`,
      ['', -6.9, 107.6, 12, null, null])))
  cek('U-TN-13', 'Token kosong ditolak', e !== null && e.includes('TOKEN_TIDAK_SAH'))
}

// Penerbitan ulang wajib MEMATIKAN token lama — kalau tidak, perangkat
// yang hilang tetap dapat mengirim posisi palsu selamanya.
const tokenBaru = await sebagai(ID.anggota1, async () =>
  (await db.query(`select public.terbitkan_token_sesi_native($1,$2) t`,
    [idSesi, 'android-uji-1'])).rows[0].t)

cek('U-TN-14', 'Penerbitan ulang menghasilkan token yang berbeda', tokenBaru !== token)
{
  const e = await galat(() => sebagaiService(() =>
    db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6)`,
      [token, -6.9, 107.6, 12, null, null])))
  cek('U-TN-15', 'Token LAMA seketika tidak berlaku sesudah diterbitkan ulang',
    e !== null && e.includes('TOKEN_TIDAK_SAH'))
}

// Hak akses: jalur native TIDAK boleh terjangkau dari sesi pengguna
// biasa, dan isi tabel token tidak boleh terbaca siapa pun.
{
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6)`,
      [tokenBaru, -6.9, 107.6, 12, null, null])))
  cek('U-TN-16', 'kirim_titik_native TIDAK dapat dipanggil peran authenticated',
    e !== null && /permission denied|tidak memiliki hak|not exist/i.test(e))
}
{
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(`select count(*) from public.token_sesi_native`)))
  cek('U-TN-17', 'Tabel token tidak terbaca peran authenticated (tanpa grant, RLS menyala)',
    e !== null && /permission denied|tidak memiliki hak/i.test(e))
}

// =====================================================================
// Penjaga Titik ganda (migrasi 0040)
//
// Kedua jalur — JS lewat kirim_titik dan native lewat kirim_titik_native
// — kini hidup berdampingan dan berangkat dari pembaruan lokasi yang
// SAMA. Tanpa penjaga ini satu posisi tercatat dua kali.
// =====================================================================
{
  const jml = async () => n(
    `select count(*) n from public.location_logs where sesi_tugas_id=$1`, [idSesi])
  const sebelum = await jml()

  const hasilGanda = await sebagaiService(async () =>
    (await db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6) id`,
      [tokenBaru, -6.9001, 107.6001, 12, null, null])).rows[0].id)

  cek('U-TN-19', 'Titik native dalam 10 detik sesudah Titik lain DIABAIKAN, tidak ganda',
    hasilGanda === null && (await jml()) === sebelum)

  // Mundurkan seluruh Titik melewati ambang — meniru keadaan proses
  // aplikasi sudah mati sehingga jalur JS ikut mati bersamanya.
  await db.query(
    `update public.location_logs set direkam_pada = direkam_pada - interval '60 seconds'
      where sesi_tugas_id=$1`, [idSesi])

  const hasilSah = await sebagaiService(async () =>
    (await db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6) id`,
      [tokenBaru, -6.9002, 107.6002, 12, null, null])).rows[0].id)

  cek('U-TN-20', 'Titik native SESUDAH ambang tetap direkam (aplikasi mati, JS ikut mati)',
    hasilSah !== null && (await jml()) === sebelum + 1)
}

// Sesi ditutup = token mati dengan sendirinya, tanpa perlu dihapus.
await sebagai(ID.anggota1, () =>
  db.query(`select public.selesaikan_sesi_tugas($1)`, [idSesi]))
{
  const e = await galat(() => sebagaiService(() =>
    db.query(`select public.kirim_titik_native($1,$2,$3,$4,$5,$6)`,
      [tokenBaru, -6.9, 107.6, 12, null, null])))
  cek('U-TN-18', 'Sesi ditutup: token langsung tidak berlaku (BR-01/KP-6.4-12)',
    e !== null && e.includes('SESI_TERTUTUP'))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji Pengiriman Native lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
