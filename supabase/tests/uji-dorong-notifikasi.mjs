// Uji pemicu dorongan notifikasi (migrasi 0070).
//
// Sampai 13 September 2026 dorongan FCM dipicu Database Webhook Dashboard
// yang menyimpan kunci service_role dan rahasia webhook sebagai teks biasa
// di definisi pemicunya. Berkas ini membuktikan:
//   - pemicu itu terbuang dan penggantinya tidak membawa kredensial;
//   - penjaga 0070 benar-benar menangkap pemicu berkredensial (tidak hampa);
//   - permintaan yang diantrekan ke pg_net membawa rahasia dari Vault dan
//     TIDAK membawa Authorization;
//   - EC-6.9-08: kegagalan dorongan tidak menggagalkan pemberitahuan;
//   - rantai fungsi security definer tetap mengantar dorongan saat pelakunya
//     authenticated biasa.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const F0070 = '0070_dorong_notifikasi_lewat_vault.sql'
const URL_DORONG = 'https://fklmpvelyjhsyzkcbnuc.supabase.co/functions/v1/kirim-notifikasi-dorong'
const RAHASIA = 'rahasia-uji-bukan-nilai-produksi'
// Dirakit saat berjalan: bentuknya cukup menyerupai JWT untuk ditangkap
// penjaga 0070, tanpa pernah menjadi untaian mirip kunci di dalam repo.
const JWT_TIRUAN = ['eyJ' + 'tiruan'.repeat(4), 'eyJ' + 'tiruan'.repeat(4), 'tiruan'].join('.')

const ID = {
  kanit1:   '00000000-0000-0000-0000-000000000002',
  panit1:   '00000000-0000-0000-0000-000000000003',
  anggota1: '00000000-0000-0000-0000-000000000004',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001' }
const SPT = { a: '20000000-0000-0000-0000-000000000001' }

const muat = f => readFileSync(join(MIGRASI, f), 'utf8')
  .replace(/create extension if not exists (postgis|pg_cron)[^;]*;/gi, '')
  .replace(/extensions\.geography\(Point,\s*4326\)/gi, 'extensions.geography')
  .replace(/create index if not exists idx_location_logs_geom[\s\S]*?;/i, '')

const db = new PGlite()
await db.waitReady
await db.exec(readFileSync(join(import.meta.dirname, 'stub.sql'), 'utf8'))

const berkas = readdirSync(MIGRASI).filter(f => f.endsWith('.sql')).sort()
if (!berkas.includes(F0070)) throw new Error(`${F0070} tidak ditemukan`)
for (const f of berkas.filter(f => f < F0070)) await db.exec(muat(f))

let lulus = 0, gagal = 0
const cek = (k, t, ok, rincian) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`); if (rincian) console.log(`         ${rincian}`) }
}
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}
async function sebagai(uid, fn) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  try {
    const hasil = await fn()
    await db.exec('commit')
    return hasil
  } catch (e) {
    await db.exec('rollback')
    throw e
  }
}
// Dijalankan di dalam transaksi yang selalu dibatalkan — untuk mengubah
// tiruan (rahasia, pg_net) tanpa mencemari butir sesudahnya.
async function coba(fn) {
  await db.exec('begin')
  try { return await fn() } finally { await db.exec('rollback') }
}
const antrean = async () => (await db.query(
  `select url, method, headers, convert_from(body, 'UTF8')::jsonb as badan
     from net.http_request_queue order by id`)).rows
const kosongkanAntrean = () => db.exec('delete from net.http_request_queue')
const jumlah = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)
const tanpaAuthorization = h => Object.keys(h ?? {}).every(k => !/authorization|apikey/i.test(k))

// ---------------------------------------------------------------------
// Keadaan produksi sebelum 0070: Database Webhook Dashboard.
// ---------------------------------------------------------------------
await db.exec(`
  create schema if not exists supabase_functions;
  create or replace function supabase_functions.http_request()
  returns trigger language plpgsql as $$ begin return new; end $$;

  create trigger dorong_notifikasi after insert on public.notifikasi for each row
    execute function supabase_functions.http_request('${URL_DORONG}', 'POST',
      '{"Content-type":"application/json","Authorization":"Bearer ${JWT_TIRUAN}","x-sipantau-webhook-secret":"tiruan"}',
      '{}', '5000');
`)
const adaPemicu = nama => jumlah(
  `select count(*) n from pg_trigger where tgrelid = 'public.notifikasi'::regclass and tgname = $1`, [nama])

// =====================================================================
// Prasyarat dan pemasangan
// =====================================================================
{
  await db.exec(`delete from vault.decrypted_secrets`)
  const e = await galat(() => db.exec(muat(F0070)))
  cek('U-DORONG-01', 'Tanpa rahasia Vault, 0070 menolak berjalan dan pemicu lama tidak tersentuh',
    /RAHASIA_VAULT_BELUM_ADA/.test(e ?? '') && await adaPemicu('dorong_notifikasi') === 1
      && await adaPemicu('trg_dorong_notifikasi') === 0,
    e)
}

await db.query(`insert into vault.decrypted_secrets (name, decrypted_secret) values ('sipantau_push_webhook_secret', $1)`,
  [RAHASIA])
{
  const e = await galat(() => db.exec(muat(F0070)))
  const p = (await db.query(
    `select tgenabled::text as nyala, pg_get_triggerdef(oid) as def
       from pg_trigger where tgrelid = 'public.notifikasi'::regclass and tgname = 'trg_dorong_notifikasi'`)).rows[0]
  cek('U-DORONG-02', 'Pemicu Dashboard terbuang; trg_dorong_notifikasi terpasang AFTER INSERT, menyala, hanya baris mendesak',
    e === null && await adaPemicu('dorong_notifikasi') === 0
      && p?.nyala === 'O' && /AFTER INSERT/.test(p.def) && /WHEN \(new\.mendesak\)/i.test(p.def),
    JSON.stringify({ e, p }))
}
{
  const bocor = (await db.query(
    `select tgrelid::regclass::text || ':' || tgname as nama from pg_trigger
      where not tgisinternal
        and (pg_get_triggerdef(oid) ~ 'eyJ[A-Za-z0-9_-]{10,}'
             or pg_get_triggerdef(oid) ~* '(authorization|bearer|secret|apikey)')`)).rows
  const src = (await db.query(`select prosrc from pg_proc where oid = 'public.fn_dorong_notifikasi()'::regprocedure`)).rows[0].prosrc
  cek('U-DORONG-03', 'Tidak satu pun definisi pemicu membawa kredensial, dan badan fungsi pengganti tanpa Authorization maupun nilai rahasia',
    bocor.length === 0 && !/authorization|bearer/i.test(src) && !src.includes(RAHASIA),
    JSON.stringify(bocor))
}
{
  const f = (await db.query(
    `select prosecdef, proconfig,
            has_function_privilege('anon', oid, 'execute') as anon,
            has_function_privilege('authenticated', oid, 'execute') as authd
       from pg_proc where oid = 'public.fn_dorong_notifikasi()'::regprocedure`)).rows[0]
  cek('U-DORONG-04', 'fn_dorong_notifikasi security definer, search_path kosong, tidak dapat dieksekusi anon/authenticated',
    f.prosecdef && String(f.proconfig).includes('search_path=""') && !f.anon && !f.authd,
    JSON.stringify(f))
}
{
  // Penjaga tidak hampa: pemicu berkredensial dengan nama lain
  // (Database Webhook baru dari Dashboard) membatalkan seluruh berkas.
  await db.exec(`
    create trigger webhook_lain after insert on public.notifikasi for each row
      execute function supabase_functions.http_request('${URL_DORONG}', 'POST',
        '{"Authorization":"Bearer ${JWT_TIRUAN}"}', '{}', '5000')`)
  const e = await galat(() => db.exec(muat(F0070)))
  await db.exec(`drop trigger webhook_lain on public.notifikasi`)
  cek('U-DORONG-05', 'Penjaga 0070 menolak bila masih ada pemicu yang membawa kredensial, dan menyebut namanya',
    /PEMICU_MEMBAWA_KREDENSIAL/.test(e ?? '') && e.includes('webhook_lain'), e)
}

// =====================================================================
// Perilaku saat pemberitahuan dibuat
// =====================================================================
await db.exec(`
  insert into auth.users (id) values ('${ID.kanit1}'),('${ID.panit1}'),('${ID.anggota1}');

  insert into public.unit (id, nama, urutan) values ('${UNIT.satu}','Unit I',1);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false);

  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT.a}','SP.Gas.Lidik/1/VIII/RES.5.3/2026/Ditreskrimsus','Penyelidikan A','${UNIT.satu}','berjalan','${ID.kanit1}',now(),current_date,current_date+7);

  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.a}','${ID.panit1}','${ID.kanit1}');

  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.a}','${ID.anggota1}',1,now());
`)
await kosongkanAntrean()

{
  await db.query(
    `select public.fn_buat_notifikasi('spt_lewat_batas', array[$1,$2]::uuid[], 'Lewat batas', 'Isi uji',
       'penugasan', $3, $3, null, true, null)`, [ID.kanit1, ID.panit1, SPT.a])
  const idNotif = (await db.query(
    `select id from public.notifikasi where judul = 'Lewat batas' order by id`)).rows.map(r => r.id)
  const q = await antrean()
  const idAntre = q.map(r => r.badan?.record?.id).sort()
  cek('U-DORONG-06', 'Setiap notifikasi mendesak diantrekan sekali ke kirim-notifikasi-dorong dengan rahasia dari Vault, tanpa Authorization',
    idNotif.length === 2 && q.length === 2
      && JSON.stringify(idAntre) === JSON.stringify([...idNotif].sort())
      && q.every(r => r.url === URL_DORONG && r.method === 'POST'
        && r.headers['x-sipantau-webhook-secret'] === RAHASIA
        && tanpaAuthorization(r.headers)
        && r.badan.type === 'INSERT' && r.badan.table === 'notifikasi' && r.badan.record.mendesak === true),
    JSON.stringify(q.map(r => ({ url: r.url, kunci_header: Object.keys(r.headers), type: r.badan?.type }))))
}
{
  await kosongkanAntrean()
  await db.query(
    `select public.fn_buat_notifikasi('spt_ditugaskan', array[$1]::uuid[], 'Tidak mendesak', null,
       'penugasan', $2, $2, null, false, null)`, [ID.anggota1, SPT.a])
  cek('U-DORONG-07', 'Notifikasi tidak mendesak tersimpan tetapi tidak diantrekan (KP-6.9-24)',
    await jumlah(`select count(*) n from public.notifikasi where judul = 'Tidak mendesak'`) === 1
      && (await antrean()).length === 0)
}
{
  const hasil = await coba(async () => {
    await db.exec(`delete from vault.decrypted_secrets`)
    await kosongkanAntrean()
    const e = await galat(() => db.query(
      `select public.fn_buat_notifikasi('spt_bermasalah', array[$1]::uuid[], 'Tanpa rahasia', null,
         'penugasan', $2, $2, null, true, null)`, [ID.kanit1, SPT.a]))
    // Galat di sini membatalkan transaksinya; kueri berikut akan ikut
    // melempar dan menyembunyikan butir ini di balik uji yang mogok.
    if (e) return { e }
    return { e, n: await jumlah(`select count(*) n from public.notifikasi where judul = 'Tanpa rahasia'`),
             antre: (await antrean()).length }
  })
  cek('U-DORONG-08', 'Rahasia Vault hilang: notifikasi tetap tersimpan, tidak ada permintaan tanpa rahasia (EC-6.9-08)',
    hasil.e === null && hasil.n === 1 && hasil.antre === 0, JSON.stringify(hasil))
}
{
  const hasil = await coba(async () => {
    await db.exec(`
      create or replace function net.http_post(url text, body jsonb default '{}'::jsonb,
        params jsonb default '{}'::jsonb, headers jsonb default '{}'::jsonb,
        timeout_milliseconds integer default 5000)
      returns bigint language plpgsql as $$ begin raise exception 'pg_net tiruan menolak'; end $$`)
    const e = await galat(() => db.query(
      `select public.fn_buat_notifikasi('spt_bermasalah', array[$1]::uuid[], 'Net menolak', null,
         'penugasan', $2, $2, null, true, null)`, [ID.kanit1, SPT.a]))
    if (e) return { e }
    return { e, n: await jumlah(`select count(*) n from public.notifikasi where judul = 'Net menolak'`) }
  })
  cek('U-DORONG-09', 'pg_net menolak: notifikasi tetap tersimpan (EC-6.9-08)',
    hasil.e === null && hasil.n === 1, JSON.stringify(hasil))
}
{
  // catat_keluar -> fn_tutup_sesi_tugas -> fn_buat_notifikasi (mendesak)
  // -> trg_dorong_notifikasi, dengan pelaku authenticated yang tidak
  // dapat membaca Vault maupun mengeksekusi fungsi pemicunya.
  await sebagai(ID.anggota1, () => db.query(
    `select id from public.buka_sesi_tugas($1,$2,$3,$4,$5)`, [SPT.a, -6.9, 107.6, 10, 'web-dorong']))
  await kosongkanAntrean()
  const e = await galat(() => sebagai(ID.anggota1, () => db.query(`select public.catat_keluar()`)))
  const q = (await antrean()).filter(r => r.badan?.record?.jenis === 'sesi_ditutup_keluar_aplikasi')
  const penerima = q.map(r => r.badan.record.penerima_id).sort()
  cek('U-DORONG-10', 'Pelaku authenticated (catat_keluar) tetap memicu dorongan ke Kanit dan Panit lewat rantai security definer',
    e === null && q.length === 2
      && JSON.stringify(penerima) === JSON.stringify([ID.kanit1, ID.panit1].sort())
      && q.every(r => r.headers['x-sipantau-webhook-secret'] === RAHASIA && tanpaAuthorization(r.headers)),
    JSON.stringify({ e, penerima }))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji dorongan notifikasi lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
