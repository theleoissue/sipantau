// Uji fungsional migrasi 0034/0035 — fungsi bantu yang dipanggil dari
// Fungsi Tepi (buat-akun, nonaktifkan-akun, reset-kata-sandi) lewat
// klien service_role. p_pelaku_id dikirim eksplisit (bukan auth.uid()),
// jadi diuji di sini dengan role Postgres 'service_role', BUKAN
// 'authenticated' — meniru persis bagaimana Fungsi Tepi memanggilnya.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit1: '00000000-0000-0000-0000-000000000001',
  admin1:    '00000000-0000-0000-0000-000000000003',
  kanit1:    '00000000-0000-0000-0000-000000000004',
  kanit2:    '00000000-0000-0000-0000-000000000007',
  anggota1:  '00000000-0000-0000-0000-000000000005',
  anggota2:  '00000000-0000-0000-0000-000000000008',
  pemel:     '00000000-0000-0000-0000-000000000006',
  baru:      '00000000-0000-0000-0000-000000000009',
}
const UNIT = {
  satu: '10000000-0000-0000-0000-000000000001',
  dua:  '10000000-0000-0000-0000-000000000003',
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
    ('${ID.kasubdit1}'),('${ID.admin1}'),('${ID.kanit1}'),('${ID.kanit2}'),
    ('${ID.anggota1}'),('${ID.anggota2}'),('${ID.pemel}'),('${ID.baru}');

  insert into public.unit (id, nama, urutan, aktif) values
    ('${UNIT.satu}','Unit I',1,true),
    ('${UNIT.dua}','Unit II',2,true);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi,aktif) values
    ('${ID.kasubdit1}','Kasubdit Satu','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false,true),
    ('${ID.admin1}','Admin Satu','0000003','0000003@sipantau.internal','admin','${UNIT.satu}',false,true),
    ('${ID.kanit1}','Kanit Satu','0000004','0000004@sipantau.internal','kanit','${UNIT.satu}',false,true),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false,true),
    ('${ID.anggota1}','Anggota Satu','0000005','0000005@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.anggota2}','Anggota Dua','0000008','0000008@sipantau.internal','anggota','${UNIT.dua}',false,true),
    ('${ID.pemel}','Pemeliharaan','0000006','0000006@sipantau.internal','pemeliharaan',null,false,true);

  insert into public.perangkat_masuk (user_id, penanda_perangkat) values
    ('${ID.anggota1}', 'android-abc');
`)

let lulus = 0, gagal = 0
const cek = (k, t, ok) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`) }
}

// Meniru klien service_role: role Postgres 'service_role', BUKAN
// 'authenticated' — tidak ada request.jwt.claims sama sekali, sama
// seperti Fungsi Tepi Deno memanggilnya.
async function sebagaiService(fn) {
  await db.exec('begin')
  await db.exec('set local role service_role')
  try { return await fn() } finally { await db.exec('rollback') }
}
async function komitService(fn) {
  await db.exec('begin')
  await db.exec('set local role service_role')
  const hasil = await fn()
  await db.exec('commit')
  return hasil
}
async function sebagaiAuth(uid, fn) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  try { return await fn() } finally { await db.exec('rollback') }
}
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}

// =====================================================================
// admin_buat_akun
// =====================================================================
await komitService(async () => {
  await db.query(
    `select public.admin_buat_akun($1,$2,$3,$4,$5,$6,$7,$8)`,
    [ID.admin1, ID.baru, 'Anggota Baru', '0000009', '0000009@sipantau.internal',
     'BRIPDA', 'anggota', UNIT.satu])
})
cek('U-MAK-01', 'admin_buat_akun oleh Admin menyisipkan baris users',
  (await db.query(`select nama from public.users where id=$1`, [ID.baru])).rows[0]?.nama === 'Anggota Baru')
cek('U-MAK-02', 'admin_buat_akun mencatat jejak audit buat_akun',
  await n(`select count(*) n from public.jejak_audit where sasaran_id=$1 and jenis_tindakan='buat_akun'`, [ID.baru]) === 1)

await sebagaiService(async () => {
  const e = await galat(() => db.query(
    `select public.admin_buat_akun($1,$2,$3,$4,$5,$6,$7,$8)`,
    [ID.kanit1, '00000000-0000-0000-0000-000000000099', 'X', '9999999', '9999999@sipantau.internal',
     'BRIPDA', 'anggota', UNIT.satu]))
  cek('U-MAK-03', 'admin_buat_akun ditolak bila pelaku bukan Admin (mis. Kanit)',
    e !== null && e.includes('BUKAN_ADMIN'))
})
await sebagaiService(async () => {
  const e = await galat(() => db.query(
    `select public.admin_buat_akun($1,$2,$3,$4,$5,$6,$7,$8)`,
    [ID.pemel, '00000000-0000-0000-0000-000000000099', 'X', '9999999', '9999999@sipantau.internal',
     'BRIPDA', 'anggota', UNIT.satu]))
  cek('U-MAK-04', 'admin_buat_akun ditolak bila pelaku Akun Pemeliharaan (KP-6.6-35)',
    e !== null && e.includes('BUKAN_ADMIN'))
})

// =====================================================================
// admin_nonaktifkan_akun
// =====================================================================
await komitService(async () => {
  await db.query(`select public.admin_nonaktifkan_akun($1,$2)`, [ID.admin1, ID.anggota1])
})
cek('U-MAK-05', 'admin_nonaktifkan_akun oleh Admin menyetel aktif=false',
  (await db.query(`select aktif from public.users where id=$1`, [ID.anggota1])).rows[0].aktif === false)
cek('U-MAK-06', 'admin_nonaktifkan_akun mengakhiri sesi masuk (perangkat_masuk terhapus)',
  await n(`select count(*) n from public.perangkat_masuk where user_id=$1`, [ID.anggota1]) === 0)
cek('U-MAK-07', 'admin_nonaktifkan_akun mencatat jejak audit nonaktifkan_akun',
  await n(`select count(*) n from public.jejak_audit where sasaran_id=$1 and jenis_tindakan='nonaktifkan_akun'`, [ID.anggota1]) === 1)
await db.exec(`update public.users set aktif=true where id='${ID.anggota1}'`)
await db.exec(`insert into public.perangkat_masuk (user_id, penanda_perangkat) values ('${ID.anggota1}','android-abc')`)

await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_nonaktifkan_akun($1,$2)`, [ID.kanit1, ID.anggota1]))
  cek('U-MAK-08', 'admin_nonaktifkan_akun ditolak bila pelaku bukan Admin',
    e !== null && e.includes('BUKAN_ADMIN'))
})
await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_nonaktifkan_akun($1,$2)`, [ID.admin1, ID.kasubdit1]))
  cek('U-MAK-09', 'admin_nonaktifkan_akun tetap tunduk BR-70 (Kasubdit aktif terakhir)',
    e !== null && e.includes('BR_70_KASUBDIT_TERAKHIR'))
})

// =====================================================================
// admin_reset_kata_sandi_selesai — wewenang BR-15
// =====================================================================
await komitService(async () => {
  await db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.admin1, ID.anggota1])
})
cek('U-MAK-10', 'Admin mereset sandi siapa pun: wajib_ganti_sandi menyala',
  (await db.query(`select wajib_ganti_sandi from public.users where id=$1`, [ID.anggota1])).rows[0].wajib_ganti_sandi === true)
cek('U-MAK-11', 'Reset sandi mengakhiri sesi masuk sasaran',
  await n(`select count(*) n from public.perangkat_masuk where user_id=$1`, [ID.anggota1]) === 0)
await db.exec(`update public.users set wajib_ganti_sandi=false where id='${ID.anggota1}'`)
await db.exec(`delete from public.notifikasi where penerima_id='${ID.anggota1}'`)

await komitService(async () => {
  await db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.pemel, ID.anggota2])
})
cek('U-MAK-12', 'Akun Pemeliharaan dapat mereset sandi siapa pun (KP-6.6-33)',
  (await db.query(`select wajib_ganti_sandi from public.users where id=$1`, [ID.anggota2])).rows[0].wajib_ganti_sandi === true)
await db.exec(`update public.users set wajib_ganti_sandi=false where id='${ID.anggota2}'`)
await db.exec(`delete from public.notifikasi where penerima_id='${ID.anggota2}'`)

await komitService(async () => {
  await db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.kanit1, ID.anggota1])
})
cek('U-MAK-13', 'Kanit dapat mereset sandi Anggota unitnya sendiri (BR-15)',
  (await db.query(`select wajib_ganti_sandi from public.users where id=$1`, [ID.anggota1])).rows[0].wajib_ganti_sandi === true)
await db.exec(`update public.users set wajib_ganti_sandi=false where id='${ID.anggota1}'`)
await db.exec(`delete from public.notifikasi where penerima_id='${ID.anggota1}'`)

await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.kanit1, ID.anggota2]))
  cek('U-MAK-14', 'Kanit TIDAK dapat mereset sandi Anggota unit LAIN (BR-15)',
    e !== null && e.includes('TIDAK_BERWENANG'))
})
await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.kanit1, ID.kanit2]))
  cek('U-MAK-15', 'Kanit TIDAK dapat mereset sandi Kanit lain (bukan anggota/panit)',
    e !== null && e.includes('TIDAK_BERWENANG'))
})

// admin_periksa_reset_kata_sandi harus dipanggil Fungsi Tepi SEBELUM
// mengubah kata sandi lewat Admin API — cukup ditolak di sini, TANPA
// menyentuh public.users sama sekali (murni baca).
await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_periksa_reset_kata_sandi($1,$2)`, [ID.kanit1, ID.kanit2]))
  cek('U-MAK-24', 'admin_periksa_reset_kata_sandi menolak lebih dulu, sebelum kata sandi diubah',
    e !== null && e.includes('TIDAK_BERWENANG'))
})
await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_periksa_reset_kata_sandi($1,$2)`, [ID.admin1, ID.anggota1]))
  cek('U-MAK-25', 'admin_periksa_reset_kata_sandi meluluskan pemanggil berwenang tanpa efek samping',
    e === null)
})

// KP-6.6-26: pemberitahuan ke sasaran, menyebut siapa yang meresetnya.
// Tidak ada pemicu otomatis untuk ini (beda dari akun_dinonaktifkan) —
// admin_reset_kata_sandi_selesai wajib menyisipkannya sendiri.
await komitService(async () => {
  await db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.admin1, ID.anggota1])
})
cek('U-MAK-19', 'Reset sandi mengirim notifikasi kata_sandi_direset ke sasaran (KP-6.6-26)',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1 and jenis='kata_sandi_direset'`, [ID.anggota1]) === 1)
cek('U-MAK-20', 'Isi notifikasi menyebut nama pelaku',
  (await db.query(`select isi from public.notifikasi where penerima_id=$1 and jenis='kata_sandi_direset'`, [ID.anggota1])).rows[0].isi.includes('Admin Satu'))
await db.exec(`update public.users set wajib_ganti_sandi=false where id='${ID.anggota1}'`)
await db.exec(`delete from public.notifikasi where penerima_id='${ID.anggota1}'`)

// =====================================================================
// BR-51 — batas laju ditegakkan DI BASIS DATA (bukan hanya di aplikasi)
// =====================================================================
for (let i = 0; i < 10; i++) {
  await db.query(
    `insert into public.jejak_audit (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
     values ($1,'admin','reset_sandi','users',$2)`,
    [ID.admin1, ID.anggota1])
}
await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.admin1, ID.anggota1]))
  cek('U-MAK-21', 'Reset sandi ke-11 dalam satu jam oleh pelaku sama ditolak (BR-51, KP-6.6-25)',
    e !== null && e.includes('BATAS_LAJU'))
})
await sebagaiService(async () => {
  const e = await galat(() => db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.kanit1, ID.anggota1]))
  cek('U-MAK-22', 'Batas laju dihitung per pelaku, bukan global (pelaku lain tetap bisa)',
    e === null)
})
await db.exec(`update public.users set wajib_ganti_sandi=false where id in ('${ID.anggota1}')`)
await db.exec(`delete from public.notifikasi where penerima_id='${ID.anggota1}'`)

for (let i = 0; i < 20; i++) {
  await db.query(
    `insert into public.jejak_audit (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
     values ($1,'admin','buat_akun','users',$2)`,
    [ID.admin1, ID.anggota1])
}
await sebagaiService(async () => {
  const e = await galat(() => db.query(
    `select public.admin_buat_akun($1,$2,$3,$4,$5,$6,$7,$8)`,
    [ID.admin1, '00000000-0000-0000-0000-000000000097', 'X', '9999997', '9999997@sipantau.internal',
     'BRIPDA', 'anggota', UNIT.satu]))
  cek('U-MAK-23', 'Pembuatan akun ke-21 dalam satu jam oleh pelaku sama ditolak (BR-51 amandemen)',
    e !== null && e.includes('BATAS_LAJU'))
})

// =====================================================================
// Hak eksekusi — HANYA service_role, bukan pengguna authenticated biasa
// =====================================================================
await sebagaiAuth(ID.admin1, async () => {
  const e = await galat(() => db.query(
    `select public.admin_buat_akun($1,$2,$3,$4,$5,$6,$7,$8)`,
    [ID.admin1, '00000000-0000-0000-0000-000000000098', 'X', '9999998', '9999998@sipantau.internal',
     'BRIPDA', 'anggota', UNIT.satu]))
  cek('U-MAK-16', 'admin_buat_akun TIDAK dapat dipanggil lewat sesi authenticated biasa (hanya service_role)',
    e !== null && /permission denied/i.test(e))
})
await sebagaiAuth(ID.admin1, async () => {
  const e = await galat(() => db.query(`select public.admin_nonaktifkan_akun($1,$2)`, [ID.admin1, ID.anggota1]))
  cek('U-MAK-17', 'admin_nonaktifkan_akun TIDAK dapat dipanggil lewat sesi authenticated biasa',
    e !== null && /permission denied/i.test(e))
})
await sebagaiAuth(ID.admin1, async () => {
  const e = await galat(() => db.query(`select public.admin_reset_kata_sandi_selesai($1,$2)`, [ID.admin1, ID.anggota1]))
  cek('U-MAK-18', 'admin_reset_kata_sandi_selesai TIDAK dapat dipanggil lewat sesi authenticated biasa',
    e !== null && /permission denied/i.test(e))
})

console.log(gagal === 0
  ? `\n== ${lulus} butir uji fungsi bantu Manajemen Akun lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
