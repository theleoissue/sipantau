// Uji batas lintas unit peran Kanit.
//
// Kanit adalah peran dengan kewenangan tulis terluas di bawah Admin: ia
// satu-satunya yang menerbitkan, menutup, dan menyusun ulang SPT. Batas
// yang menahannya cuma satu — unitnya sendiri. Bila batas itu bocor pada
// SATU fungsi saja, seorang Kanit dapat menutup, membatalkan, bahkan
// menghapus permanen SPT unit lain.
//
// Berkas ini lahir dari audit 1 September 2026. Sebelumnya hanya tiga
// dari belasan fungsi Kanit-only yang punya uji lintas unit
// (terbitkan_draf, tandai_spt_bermasalah, buka_kembali_spt di
// uji-siklus-spt.mjs). Sisanya terbukti aman saat diperiksa, tetapi
// tidak ada satu pun uji yang menjaganya tetap begitu — itulah yang
// ditutup di sini.
//
// CATATAN CARA MENGUJI. Sebagian fungsi menolak dengan melempar galat,
// sebagian lain menyaring lewat klausa where sehingga menyentuh NOL
// baris tanpa galat sama sekali. Keduanya sah sebagai penolakan, tetapi
// hanya yang pertama terlihat dari pesan galat — yang kedua wajib
// diperiksa lewat KEADAAN BARIS. Memeriksa galat saja akan lulus palsu.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kanit1:   '00000000-0000-0000-0000-000000000002',
  kanit2:   '00000000-0000-0000-0000-000000000007',
  panit1:   '00000000-0000-0000-0000-000000000003',
  anggota1: '00000000-0000-0000-0000-000000000004',
  anggota2: '00000000-0000-0000-0000-000000000005',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
const SPT = '20000000-0000-0000-0000-000000000001'

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
    ('${ID.kanit1}'),('${ID.kanit2}'),('${ID.panit1}'),('${ID.anggota1}'),('${ID.anggota2}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.dua}',false);

  insert into public.penugasan
    (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT}','SP/1/2026','Penyelidikan Unit I','${UNIT.satu}','berjalan',
          '${ID.kanit1}',now(),current_date,current_date+7);

  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT}','${ID.panit1}','${ID.kanit1}');

  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT}','${ID.anggota1}',1,now());
`)

const relPelaksana = (await db.query(
  `select id from public.penugasan_pelaksana where penugasan_id=$1`, [SPT])).rows[0].id
const relPanit = (await db.query(
  `select id from public.penugasan_panit where penugasan_id=$1`, [SPT])).rows[0].id

let lulus = 0, gagal = 0
const cek = (k, t, ok) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`) }
}

/** Menjalankan sesuatu sebagai Kanit Unit II, selalu dibatalkan. */
async function sebagaiKanitUnitLain(sql, params) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: ID.kanit2, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  let galat = null
  try { await db.query(sql, params) } catch (e) { galat = e.message }
  await db.exec('rollback')
  return galat
}

// =====================================================================
// Fungsi yang MELEMPAR galat bila SPT di luar unit pemanggil
// =====================================================================
const menolakDenganGalat = [
  ['U-LU-01', 'tutup_spt',          `select public.tutup_spt($1)`,                 [SPT]],
  ['U-LU-02', 'batalkan_spt',       `select public.batalkan_spt($1,$2)`,           [SPT, 'alasan pembatalan yang memadai']],
  ['U-LU-03', 'perpanjang_batas',   `select public.perpanjang_batas($1,$2,$3)`,    [SPT, '2027-01-01', 'alasan perpanjangan yang memadai']],
  ['U-LU-04', 'tambah_pelaksana',   `select public.tambah_pelaksana($1,$2)`,       [SPT, ID.anggota2]],
  ['U-LU-05', 'tunjuk_panit',       `select public.tunjuk_panit($1,$2)`,           [SPT, ID.panit1]],
  ['U-LU-06', 'cabut_pelaksana',    `select public.cabut_pelaksana($1,$2)`,        [relPelaksana, 'alasan pencabutan yang memadai']],
  ['U-LU-07', 'cabut_panit',        `select public.cabut_panit($1,$2)`,            [relPanit, 'alasan pencabutan yang memadai']],
  ['U-LU-08', 'hapus_spt_permanen', `select public.hapus_spt_permanen($1)`,        [SPT]],
  ['U-LU-09', 'mulai_lhp',          `select public.mulai_lhp($1,$2,$3,$4)`,        [SPT, 'dasar', 'waktu', 'tempat']],
]

for (const [kode, nama, sql, params] of menolakDenganGalat) {
  const e = await sebagaiKanitUnitLain(sql, params)
  cek(kode, `Kanit unit lain DITOLAK memanggil ${nama} atas SPT unit ini`, e !== null)
}

// =====================================================================
// Fungsi yang menyaring lewat klausa where — menolak TANPA galat
//
// catat_tanda_terima terikat pelaksana_id = auth.uid(), jadi Kanit unit
// lain menyentuh nol baris dan tidak ada galat apa pun. Memeriksa galat
// di sini akan LULUS PALSU; yang diperiksa keadaan barisnya.
// =====================================================================
{
  const sebelum = (await db.query(
    `select dibaca_pada from public.penugasan_pelaksana where id=$1`, [relPelaksana])).rows[0].dibaca_pada

  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: ID.kanit2, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  await db.query(`select public.catat_tanda_terima($1)`, [SPT])
  await db.exec('commit')

  const sesudah = (await db.query(
    `select dibaca_pada from public.penugasan_pelaksana where id=$1`, [relPelaksana])).rows[0].dibaca_pada

  cek('U-LU-10', 'catat_tanda_terima Kanit unit lain menyentuh NOL baris (bukan bergalat)',
    sebelum === null && sesudah === null)
}

// =====================================================================
// Pembacaan — batas yang sama wajib berlaku bagi SELECT
// =====================================================================
{
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: ID.kanit2, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  const n = async (sql, p) => Number((await db.query(sql, p)).rows[0].n)

  cek('U-LU-11', 'Kanit unit lain tidak membaca SPT unit ini',
    await n(`select count(*) n from public.penugasan where id=$1`, [SPT]) === 0)
  cek('U-LU-12', 'Kanit unit lain tidak membaca susunan pelaksananya',
    await n(`select count(*) n from public.penugasan_pelaksana where penugasan_id=$1`, [SPT]) === 0)
  cek('U-LU-13', 'Kanit unit lain tidak membaca akun anggota unit ini',
    await n(`select count(*) n from public.users where id=$1`, [ID.anggota1]) === 0)

  await db.exec('rollback')
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji batas lintas unit Kanit lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
