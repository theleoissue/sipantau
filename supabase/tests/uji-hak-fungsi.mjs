// Uji hak eksekusi fungsi security definer (migrasi 0069).
//
// PostgreSQL memberi EXECUTE kepada PUBLIC pada setiap fungsi baru. Fungsi
// security definer berjalan sebagai pemiliknya dan melewati RLS, sehingga
// satu `revoke all ... from public` yang terlupa membuka pintu RPC tanpa
// masuk bagi siapa pun yang memegang kunci anon — yang memang publik.
// Sampai 13 September 2026 hal itu terjadi pada 46 fungsi di produksi,
// dan seluruh uji lain tetap lulus karena tidak satu pun memeriksanya.
//
// Berkas ini memeriksa SELURUH fungsi security definer, bukan daftar yang
// ditulis tangan: fungsi yang dibuat sesudah 0069 ikut tertangkap tanpa
// perlu mengubah berkas ini. Yang wajib diubah bila memang ada pintu RPC
// baru untuk aplikasi hanyalah IZIN_AUTHENTICATED di bawah.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))

// ---------------------------------------------------------------------
// Daftar izin: fungsi security definer di public yang MEMANG dipanggil
// aplikasi lewat supabase.rpc() (app/, lib/, components/). Hanya daftar
// ini yang boleh dieksekusi authenticated. Anon tidak pernah.
//
// Fungsi yang dipanggil Fungsi Tepi (admin_*, kirim_titik_native*,
// fn_periksa_batas_laju) tidak di sini: Fungsi Tepi memakai service_role.
// ---------------------------------------------------------------------
const IZIN_AUTHENTICATED = new Set([
  'ajukan_scan_sprin', 'ajukan_sprin_turun', 'ajukan_usulan_sprin',
  'batalkan_spt', 'buka_kembali_spt', 'buka_sesi_tugas',
  'cabut_panit', 'cabut_pelaksana',
  'catat_jejak_audit', 'catat_keluar', 'catat_masuk_berhasil', 'catat_tanda_terima',
  'finalkan_lhp', 'hapus_spt_permanen', 'kembalikan_dari_bermasalah',
  'kirim_titik', 'kirim_titik_borongan', 'kirim_ulang_scan_sprin',
  'mulai_lhp', 'perpanjang_batas', 'personel_lhp_dapat_dipilih',
  'putuskan_pengajuan_sprin', 'selesaikan_ganti_sandi_wajib', 'selesaikan_sesi_tugas',
  'setujui_laporan', 'tambah_pelaksana',
  'tandai_izin_lokasi_pulih', 'tandai_izin_lokasi_terputus', 'tandai_spt_bermasalah',
  'tarik_laporan', 'tarik_pengajuan_sprin', 'terbitkan_draf', 'terbitkan_token_sesi_native',
  'tunjuk_panit', 'tutup_spt', 'unggah_surat_spt',
])

const ID = {
  kanit1:   '00000000-0000-0000-0000-000000000002',
  panit1:   '00000000-0000-0000-0000-000000000003',
  anggota1: '00000000-0000-0000-0000-000000000004',
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

let lulus = 0, gagal = 0
const cek = (k, t, ok, rincian) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`); if (rincian) console.log(`         ${rincian}`) }
}

async function sebagaiAnon(fn) {
  await db.exec('begin')
  await db.exec('set local role anon')
  try { return await fn() } finally { await db.exec('rollback') }
}
async function sebagai(uid, fn, { simpan = false } = {}) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  try {
    const hasil = await fn()
    await db.exec(simpan ? 'commit' : 'rollback')
    return hasil
  } catch (e) {
    await db.exec('rollback')
    throw e
  }
}
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}
const ditolakHak = pesan => /permission denied for function/i.test(pesan ?? '')

// =====================================================================
// Hak menurut katalog — seluruh fungsi security definer
// =====================================================================
const definer = (await db.query(`
  select n.nspname as skema, p.proname as nama, p.oid::regprocedure::text as tanda_tangan,
         has_function_privilege('anon', p.oid, 'execute')          as anon,
         has_function_privilege('authenticated', p.oid, 'execute') as authenticated,
         p.proacl is null
           or exists (select 1 from aclexplode(p.proacl) a
                       where a.grantee = p.proowner and a.privilege_type = 'EXECUTE') as pemilik
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where p.prosecdef and n.nspname in ('public', 'sipantau_auth')
   order by 1, 2`)).rows

const publik = definer.filter(f => f.skema === 'public')
const daftar = xs => xs.map(f => f.tanda_tangan).join(', ')

// Tanpa ini, kueri yang keliru menyaring nol baris dan seluruh butir di
// bawah lulus hampa.
cek('U-HAK-01', `Fungsi security definer di public benar-benar terbaca (${publik.length})`,
  publik.length >= 90)

{
  const terbuka = definer.filter(f => f.anon)
  cek('U-HAK-02', 'Tidak satu pun fungsi security definer (public, sipantau_auth) dapat dieksekusi anon',
    terbuka.length === 0, `terbuka: ${daftar(terbuka)}`)
}
{
  const terbuka = publik.filter(f => f.authenticated && !IZIN_AUTHENTICATED.has(f.nama))
  cek('U-HAK-03', 'Di luar daftar izin, tidak satu pun fungsi security definer di public dapat dieksekusi authenticated',
    terbuka.length === 0, `terbuka: ${daftar(terbuka)}`)
}
{
  // Daftar izin yang basi sama berbahayanya: nama yang salah ketik
  // membuat butir di atas lulus tanpa melindungi apa-apa, dan pintu RPC
  // yang haknya hilang mematahkan aplikasi tanpa satu pun uji gagal.
  const ada = new Map(publik.map(f => [f.nama, f]))
  const hilang = [...IZIN_AUTHENTICATED].filter(n => !ada.get(n)?.authenticated)
  cek('U-HAK-04', 'Setiap nama di daftar izin ada sebagai fungsi security definer dan dapat dieksekusi authenticated',
    hilang.length === 0, `hilang/tanpa hak: ${hilang.join(', ')}`)
}
{
  // pg_cron berjalan sebagai postgres, pemilik fungsinya. postgres di
  // Supabase bukan superuser — yang membuatnya tetap dapat menjalankan
  // kerja_* adalah hak pemilik pada ACL, jadi itulah yang diperiksa.
  const tanpa = publik.filter(f => !f.pemilik)
  cek('U-HAK-05', 'Pemilik setiap fungsi security definer tetap memegang EXECUTE (pg_cron, pemanggilan bersarang)',
    tanpa.length === 0, `tanpa hak pemilik: ${daftar(tanpa)}`)
}

// =====================================================================
// Pintu RPC yang dicabut 0069 benar-benar tertutup
// =====================================================================
const idSesi = await sebagai(ID.anggota1, async () =>
  (await db.query(`select id from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 10, 'web-hak'])).rows[0].id, { simpan: true })

{
  const e = await sebagaiAnon(() => galat(() => db.query(
    `select public.fn_buat_notifikasi('spt_lewat_batas', array[$1]::uuid[], 'Palsu', 'Palsu',
       'penugasan', $2, null, null, true, null)`, [ID.anggota1, SPT.a])))
  cek('U-HAK-06', 'Anon ditolak memanggil fn_buat_notifikasi (pemberitahuan mendesak palsu)',
    ditolakHak(e), e)
}
{
  const e = await sebagaiAnon(() => galat(() => db.query(
    `select public.fn_catat_titik($1, -6.95, 107.65, 5, null, null, 50::smallint, 'gps',
       gen_random_uuid(), now(), 'penyusup', null, false)`, [idSesi])))
  cek('U-HAK-07', 'Anon ditolak memanggil fn_catat_titik (penjaga auth.uid() lolos bila NULL)',
    ditolakHak(e), e)
}
{
  const e = await sebagaiAnon(() => galat(() => db.query(
    `select public.penerima_pengawas_spt($1)`, [SPT.a])))
  cek('U-HAK-08', 'Anon ditolak memanggil penerima_pengawas_spt (UUID pengawas per SPT)',
    ditolakHak(e), e)
}
{
  const e = await galat(() => sebagai(ID.anggota1, () => db.query(
    `select public.fn_tutup_sesi_tugas($1, 'keluar_aplikasi', null)`, [idSesi])))
  cek('U-HAK-09', 'Authenticated ditolak memanggil fn_tutup_sesi_tugas langsung',
    ditolakHak(e), e)
}
{
  const e = await galat(() => sebagai(ID.kanit1, () => db.query(
    `select public.penerima_kanit_unit($1)`, [UNIT.satu])))
  cek('U-HAK-10', 'Authenticated ditolak memanggil penerima_kanit_unit (hibah 0055 dicabut)',
    ditolakHak(e), e)
}
{
  const e = await galat(() => sebagai(ID.kanit1, () => db.query(
    `select public.kerja_tutup_sesi_menggantung()`)))
  cek('U-HAK-11', 'Authenticated ditolak menjalankan pekerjaan terjadwal kerja_tutup_sesi_menggantung',
    ditolakHak(e), e)
}

// =====================================================================
// Yang TIDAK boleh ikut putus
// =====================================================================

// Pemicu: hak EXECUTE hanya diperiksa saat CREATE TRIGGER. Butir ini
// membuktikan pemicunya benar-benar BERJALAN — judul dikembalikan — dan
// bukan sekadar dilewati, pada peran yang tidak dapat mengeksekusinya.
{
  const idNotif = (await db.query(
    `insert into public.notifikasi (penerima_id, jenis, judul, tujuan_jenis, tujuan_id)
     values ($1, 'spt_ditugaskan', 'Asli', 'penugasan', $2) returning id`,
    [ID.anggota1, SPT.a])).rows[0].id

  const hasil = await sebagai(ID.anggota1, async () => {
    const hak = (await db.query(
      `select has_function_privilege('public.fn_notifikasi_hanya_tandai_baca()', 'execute') as boleh`)).rows[0].boleh
    await db.query(
      `update public.notifikasi set judul = 'Diubah', dibaca_pada = now() where id = $1`, [idNotif])
    const baris = (await db.query(
      `select judul, dibaca_pada from public.notifikasi where id = $1`, [idNotif])).rows[0]
    return { hak, baris }
  })
  cek('U-HAK-12', 'Pemicu fn_notifikasi_hanya_tandai_baca tetap berjalan bagi authenticated yang tidak dapat mengeksekusinya',
    hasil.hak === false && hasil.baris.judul === 'Asli' && hasil.baris.dibaca_pada != null,
    JSON.stringify(hasil))
}

// Pemanggilan bersarang dari fungsi security definer: current_user di
// dalamnya adalah pemilik, bukan authenticated.
{
  const e = await galat(() => sebagai(ID.anggota1, () => db.query(
    `select public.kirim_titik($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idSesi, -6.9, 107.6, 10, null, null, 90, 'gps',
     '30000000-0000-0000-0000-0000000000a1', new Date().toISOString(), 'web-hak', 'web-hak']),
    { simpan: true }))
  const n = Number((await db.query(
    `select count(*) n from public.location_logs where antrean_id = '30000000-0000-0000-0000-0000000000a1'`)).rows[0].n)
  cek('U-HAK-13', 'kirim_titik -> fn_catat_titik tetap berjalan bagi authenticated',
    e === null && n === 1, e)
}
{
  // catat_keluar -> fn_tutup_sesi_tugas -> penerima_pengawas_spt ->
  // fn_buat_notifikasi: empat lapis, tiga di antaranya kini tanpa hak
  // bagi authenticated.
  const e = await galat(() => sebagai(ID.anggota1, () => db.query(`select public.catat_keluar()`),
    { simpan: true }))
  const tertutup = (await db.query(
    `select ditutup_pada is not null as t, sebab_penutupan::text as sebab from public.sesi_tugas where id = $1`,
    [idSesi])).rows[0]
  const penerima = (await db.query(
    `select penerima_id from public.notifikasi
      where jenis = 'sesi_ditutup_keluar_aplikasi' and mendesak and penugasan_id = $1
      order by penerima_id`, [SPT.a])).rows.map(r => r.penerima_id)
  cek('U-HAK-14', 'catat_keluar menutup sesi dan memberi tahu Kanit serta Panit lewat fungsi yang sudah dicabut haknya',
    e === null && tertutup.t && tertutup.sebab === 'keluar_aplikasi'
      && penerima.length === 2 && penerima.includes(ID.kanit1) && penerima.includes(ID.panit1),
    JSON.stringify({ e, tertutup, penerima }))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji hak fungsi lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
