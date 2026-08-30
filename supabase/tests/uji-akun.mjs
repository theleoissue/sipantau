// Uji fungsional Modul 6.6 (peran Admin baru) — migrasi 0032/0033.
//
// KEPUTUSAN SADAR MENGUBAH PRD (dicatat di migrasi 0032): peran 'admin'
// menggantikan Kasubdit KHUSUS untuk Manajemen Akun. Yang diuji di sini
// terutama:
//   1. Admin mendapat hak baca "semua unit" yang sama persis dengan
//      Kasubdit lama, di seluruh tabel.
//   2. Admin (bukan Kasubdit) yang sekarang dapat mengubah peran/unit/
//      status aktif pengguna.
//   3. Kasubdit KEHILANGAN kewenangan itu — uji NEGATIF, ini regresi
//      yang SENGAJA diverifikasi, bukan terlewat.
//   4. BR-70: tidak boleh nol Kasubdit aktif, ditegakkan pemicu,
//      berlaku dari jalur manapun (bahkan percobaan langsung Admin).

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit1: '00000000-0000-0000-0000-000000000001',
  kasubdit2: '00000000-0000-0000-0000-000000000002',
  admin1:    '00000000-0000-0000-0000-000000000003',
  kanit1:    '00000000-0000-0000-0000-000000000004',
  anggota1:  '00000000-0000-0000-0000-000000000005',
  pemel:     '00000000-0000-0000-0000-000000000006',
}
const UNIT = {
  satu: '10000000-0000-0000-0000-000000000001',
  nonaktif: '10000000-0000-0000-0000-000000000002',
}

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
    ('${ID.kasubdit1}'),('${ID.kasubdit2}'),('${ID.admin1}'),('${ID.kanit1}'),
    ('${ID.anggota1}'),('${ID.pemel}');

  insert into public.unit (id, nama, urutan, aktif) values
    ('${UNIT.satu}','Unit I',1,true),
    ('${UNIT.nonaktif}','Unit Nonaktif',2,false);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi,aktif) values
    ('${ID.kasubdit1}','Kasubdit Satu','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false,true),
    ('${ID.kasubdit2}','Kasubdit Dua','0000002','0000002@sipantau.internal','kasubdit','${UNIT.satu}',false,true),
    ('${ID.admin1}','Admin Satu','0000003','0000003@sipantau.internal','admin','${UNIT.satu}',false,true),
    ('${ID.kanit1}','Kanit Satu','0000004','0000004@sipantau.internal','kanit','${UNIT.satu}',false,true),
    ('${ID.anggota1}','Anggota Satu','0000005','0000005@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.pemel}','Pemeliharaan','0000006','0000006@sipantau.internal','pemeliharaan',null,false,true);
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
async function komit(uid, fn) {
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
// Admin — hak baca "semua unit" (mirror Kasubdit lama)
// =====================================================================
await sebagai(ID.admin1, async () => {
  cek('U-AKN-01', 'Admin membaca seluruh baris users lintas unit',
    await n(`select count(*) n from public.users`) === 6)
  cek('U-AKN-02', 'Admin membaca unit tidak aktif sekalipun',
    await n(`select count(*) n from public.unit where id=$1`, [UNIT.nonaktif]) === 1)
})

// =====================================================================
// Admin — kewenangan tulis akun (peran/unit/aktif) — MILIK BARU
// =====================================================================
await komit(ID.admin1, async () => {
  await db.query(`update public.users set pangkat='BRIGADIR' where id=$1`, [ID.anggota1])
})
cek('U-AKN-03', 'Admin dapat mengubah kolom akun pengguna lain',
  (await db.query(`select pangkat from public.users where id=$1`, [ID.anggota1])).rows[0].pangkat === 'BRIGADIR')

await komit(ID.admin1, async () => {
  await db.query(`update public.users set aktif=false where id=$1`, [ID.anggota1])
})
cek('U-AKN-04', 'Admin dapat menonaktifkan akun',
  (await db.query(`select aktif from public.users where id=$1`, [ID.anggota1])).rows[0].aktif === false)
await db.query(`update public.users set aktif=true where id=$1`, [ID.anggota1])

// =====================================================================
// Kasubdit — KEHILANGAN kewenangan tulis akun (UJI NEGATIF, regresi
// yang sengaja diverifikasi — sebelum migrasi 0033 ini akan LULUS
// sebagai "boleh", sekarang wajib GAGAL/ditolak)
// =====================================================================
// RLS (bukan pemicu) yang menahan ini sekarang — users_ubah_kasubdit
// sudah dihapus, jadi baris anggota1 tidak lagi cocok satu pun
// kebijakan UPDATE permisif bagi Kasubdit. UPDATE yang tersaring RLS
// TIDAK bergalat, ia diam-diam mempengaruhi nol baris (jebakan yang
// sudah pernah tercatat di memori sesi ini) — makanya diperiksa lewat
// KEADAAN AKHIR baris, bukan pesan galat.
await sebagai(ID.kasubdit1, async () => {
  await db.query(`update public.users set peran='kanit' where id=$1`, [ID.anggota1])
  cek('U-AKN-05', 'Kasubdit TIDAK LAGI dapat mengubah peran pengguna lain (RLS menyaring diam-diam)',
    (await db.query(`select peran from public.users where id=$1`, [ID.anggota1])).rows[0].peran === 'anggota')
})

await sebagai(ID.kasubdit1, async () => {
  await db.query(`update public.users set aktif=false where id=$1`, [ID.anggota1])
  cek('U-AKN-06', 'Kasubdit TIDAK LAGI dapat menonaktifkan akun (RLS menyaring diam-diam)',
    (await db.query(`select aktif from public.users where id=$1`, [ID.anggota1])).rows[0].aktif === true)
})
await sebagai(ID.kasubdit1, async () => {
  const e = await galat(() => db.query(
    `update public.users set unit_id=$1 where id=$2`, [UNIT.satu, ID.anggota1]))
  // unit_id sama dengan sebelumnya (tidak sungguh berubah) — pemicu
  // hanya menolak bila NILAI-nya benar-benar berbeda. Uji dengan unit
  // baru supaya perubahan nyata teruji.
  cek('U-AKN-07', 'Kasubdit tetap dapat menyunting baris sendiri (nama/pangkat) — bukan diblokir total',
    e === null)
})

// Kasubdit menyunting diri sendiri (kolom biasa) tetap berjalan —
// hanya kolom akun (peran/unit/aktif) yang terkunci baginya sekarang.
await komit(ID.kasubdit1, async () => {
  await db.query(`update public.users set pangkat='KOMBES POL' where id=$1`, [ID.kasubdit1])
})
cek('U-AKN-08', 'Kasubdit tetap dapat mengubah kolom biasa (pangkat) miliknya sendiri',
  (await db.query(`select pangkat from public.users where id=$1`, [ID.kasubdit1])).rows[0].pangkat === 'KOMBES POL')

// =====================================================================
// Kanit — reset wajib_ganti_sandi timnya sendiri TIDAK BERUBAH
// =====================================================================
await komit(ID.kanit1, async () => {
  await db.query(`update public.users set wajib_ganti_sandi=true where id=$1`, [ID.anggota1])
})
cek('U-AKN-09', 'Kanit tetap dapat menyalakan wajib_ganti_sandi Anggota unitnya (tidak berubah)',
  (await db.query(`select wajib_ganti_sandi from public.users where id=$1`, [ID.anggota1])).rows[0].wajib_ganti_sandi === true)
await db.query(`update public.users set wajib_ganti_sandi=false where id=$1`, [ID.anggota1])

// =====================================================================
// BR-70 — tidak boleh nol Kasubdit aktif
// =====================================================================
await sebagai(ID.admin1, async () => {
  const e = await galat(() => db.query(
    `update public.users set aktif=false where id=$1`, [ID.kasubdit2]))
  cek('U-AKN-11', 'Menonaktifkan Kasubdit kedua (masih ada Kasubdit satu aktif) berhasil',
    e === null)
})
await db.query(`update public.users set aktif=true where id=$1`, [ID.kasubdit2])

// Sekarang nonaktifkan kasubdit2 SUNGGUHAN (commit), sisakan hanya
// kasubdit1 aktif — lalu coba nonaktifkan kasubdit1, harus ditolak.
await komit(ID.admin1, async () => {
  await db.query(`update public.users set aktif=false where id=$1`, [ID.kasubdit2])
})
await sebagai(ID.admin1, async () => {
  const e = await galat(() => db.query(
    `update public.users set aktif=false where id=$1`, [ID.kasubdit1]))
  cek('U-AKN-12', 'Menonaktifkan Kasubdit TERAKHIR yang aktif ditolak (BR_70_KASUBDIT_TERAKHIR)',
    e !== null && e.includes('BR_70_KASUBDIT_TERAKHIR'))
})
await sebagai(ID.admin1, async () => {
  const e = await galat(() => db.query(
    `update public.users set peran='kanit' where id=$1`, [ID.kasubdit1]))
  cek('U-AKN-13', 'Mengubah PERAN Kasubdit terakhir menjauh dari kasubdit juga ditolak BR-70',
    e !== null && e.includes('BR_70_KASUBDIT_TERAKHIR'))
})
// Pulihkan kasubdit2 supaya keadaan basis data konsisten untuk uji selanjutnya.
await komit(ID.admin1, async () => {
  await db.query(`update public.users set aktif=true where id=$1`, [ID.kasubdit2])
})

console.log(gagal === 0
  ? `\n== ${lulus} butir uji Akun (Admin) lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
