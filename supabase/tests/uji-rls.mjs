// Uji fungsional aturan akses baris SiPANTAU terhadap Postgres tiruan.
//
// Bukan sekadar memeriksa kebijakannya ADA, melainkan benar-benar
// berpura-pura menjadi tiap peran lalu mencoba membaca dan menulis.
//
// CATATAN METODE (pelajaran dari sesi lama, jangan diulangi):
//   Penolakan INSERT oleh RLS melempar galat sungguhan (WITH CHECK).
//   Penolakan UPDATE oleh RLS TIDAK melempar galat — klausa USING hanya
//   menyaring baris jadi nol baris berubah, tanpa satu pun pesan.
//   Karena itu uji UPDATE WAJIB memeriksa KEADAAN BARIS sesudahnya,
//   bukan ada tidaknya galat.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit:     '00000000-0000-0000-0000-000000000001',
  kanit1:       '00000000-0000-0000-0000-000000000002',
  panit1:       '00000000-0000-0000-0000-000000000003',
  anggota1:     '00000000-0000-0000-0000-000000000004',
  anggota2:     '00000000-0000-0000-0000-000000000005', // unit lain
  pemeliharaan: '00000000-0000-0000-0000-000000000006',
}
const UNIT = {
  satu: '10000000-0000-0000-0000-000000000001',
  dua:  '10000000-0000-0000-0000-000000000002',
}

const db = new PGlite()
await db.waitReady

await db.exec(readFileSync(join(import.meta.dirname, 'stub.sql'), 'utf8'))
for (const f of readdirSync(MIGRASI).filter(f => f.endsWith('.sql')).sort()) {
  await db.exec(
    readFileSync(join(MIGRASI, f), 'utf8')
      .replace(/create extension if not exists (postgis|pg_cron)[^;]*;/gi, '')
      .replace(/extensions\.geography\(Point,\s*4326\)/gi, 'extensions.geography')
      .replace(/create index if not exists idx_location_logs_geom[\s\S]*?;/i, ''))
}

// ---------------------------------------------------------------- seed
await db.exec(`
  insert into auth.users (id, email) values
    ('${ID.kasubdit}',     '0000001@sipantau.internal'),
    ('${ID.kanit1}',       '0000002@sipantau.internal'),
    ('${ID.panit1}',       '0000003@sipantau.internal'),
    ('${ID.anggota1}',     '0000004@sipantau.internal'),
    ('${ID.anggota2}',     '0000005@sipantau.internal'),
    ('${ID.pemeliharaan}', '0000006@sipantau.internal');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}', 'Unit I', 1),
    ('${UNIT.dua}',  'Unit II', 2);

  insert into public.users (id, nama, nrp, email_sistem, peran, unit_id, wajib_ganti_sandi) values
    ('${ID.kasubdit}',     'Kasubdit Uji', '0000001', '0000001@sipantau.internal', 'kasubdit',     '${UNIT.satu}', false),
    ('${ID.kanit1}',       'Kanit Uji',    '0000002', '0000002@sipantau.internal', 'kanit',        '${UNIT.satu}', false),
    ('${ID.panit1}',       'Panit Uji',    '0000003', '0000003@sipantau.internal', 'panit',        '${UNIT.satu}', false),
    ('${ID.anggota1}',     'Anggota Satu', '0000004', '0000004@sipantau.internal', 'anggota',      '${UNIT.satu}', false),
    ('${ID.anggota2}',     'Anggota Dua',  '0000005', '0000005@sipantau.internal', 'anggota',      '${UNIT.dua}',  false),
    ('${ID.pemeliharaan}', 'Pemeliharaan', '0000006', '0000006@sipantau.internal', 'pemeliharaan', null,           false);
`)

// ------------------------------------------------------------- perkakas
let lulus = 0, gagal = 0
const hasil = []

async function sebagai(uid, fn) {
  // Transaksi terpisah supaya set_config berlingkup lokal.
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims', $1, true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec(`set local role authenticated`)
  try {
    return await fn()
  } finally {
    await db.exec('rollback')
  }
}

function periksa(kode, keterangan, benar) {
  if (benar) { lulus++; hasil.push(`  LULUS  ${kode}  ${keterangan}`) }
  else       { gagal++; hasil.push(`  GAGAL  ${kode}  ${keterangan}`) }
}

async function jumlah(sql, params = []) {
  const r = await db.query(sql, params)
  return Number(r.rows[0].n)
}

// =====================================================================
// BAGIAN 1 — Tabel users
// =====================================================================

await sebagai(ID.anggota1, async () => {
  periksa('U-RLS-01', 'Anggota membaca barisnya sendiri',
    await jumlah(`select count(*) n from public.users where id = $1`, [ID.anggota1]) === 1)

  periksa('U-RLS-02', 'Anggota TIDAK membaca baris Anggota unit lain',
    await jumlah(`select count(*) n from public.users where id = $1`, [ID.anggota2]) === 0)

  periksa('U-RLS-03', 'Anggota TIDAK membaca baris rekan se-unit',
    await jumlah(`select count(*) n from public.users where id = $1`, [ID.kanit1]) === 0)
})

await sebagai(ID.kanit1, async () => {
  // 3, bukan 4: Panit dan Anggota di unitnya, TIDAK termasuk Kasubdit
  // meski unit_id-nya kebetulan sama (migrasi 0014, docs/00-fondasi §2.4).
  periksa('U-RLS-04', 'Kanit membaca Panit dan Anggota di unitnya (bukan Kasubdit)',
    await jumlah(`select count(*) n from public.users where unit_id = $1`, [UNIT.satu]) === 3)

  periksa('U-RLS-04B', 'Kanit TIDAK membaca baris Kasubdit meski unit_id sama (migrasi 0014)',
    await jumlah(`select count(*) n from public.users where id = $1`, [ID.kasubdit]) === 0)

  periksa('U-RLS-05', 'Kanit TIDAK membaca pengguna unit lain',
    await jumlah(`select count(*) n from public.users where unit_id = $1`, [UNIT.dua]) === 0)
})

await sebagai(ID.kasubdit, async () => {
  periksa('U-RLS-06', 'Kasubdit membaca seluruh pengguna',
    await jumlah(`select count(*) n from public.users`) === 6)
})

await sebagai(ID.pemeliharaan, async () => {
  periksa('U-RLS-07', 'Akun Pemeliharaan membaca seluruh pengguna',
    await jumlah(`select count(*) n from public.users`) === 6)
})

// ---- penjaga kolom: yang paling rawan gagal senyap ----

await sebagai(ID.anggota1, async () => {
  let ditolak = false
  try {
    await db.query(`update public.users set peran = 'kasubdit' where id = $1`, [ID.anggota1])
  } catch { ditolak = true }
  periksa('U-RLS-08', 'Anggota TIDAK dapat menaikkan perannya sendiri', ditolak)

  ditolak = false
  try {
    await db.query(`update public.users set unit_id = $2 where id = $1`, [ID.anggota1, UNIT.dua])
  } catch { ditolak = true }
  periksa('U-RLS-09', 'Anggota TIDAK dapat memindahkan dirinya ke unit lain', ditolak)

  ditolak = false
  try {
    await db.query(`update public.users set wajib_ganti_sandi = false where id = $1`, [ID.anggota1])
  } catch { ditolak = true }
  periksa('U-RLS-10', 'Anggota TIDAK dapat mematikan wajib_ganti_sandi sendiri', ditolak)

  ditolak = false
  try {
    await db.query(`update public.users set nrp = '9999999' where id = $1`, [ID.anggota1])
  } catch { ditolak = true }
  periksa('U-RLS-11', 'NRP tidak dapat diubah pemiliknya', ditolak)

  ditolak = false
  try {
    await db.query(`update public.users set foto_acuan_wajah = 'x.jpg' where id = $1`, [ID.anggota1])
  } catch { ditolak = true }
  periksa('U-RLS-12', 'Kolom biometrik belum boleh diisi (AM-6.1-17)', ditolak)

  ditolak = false
  try {
    await db.query(`update public.users set aktif = false where id = $1`, [ID.anggota1])
  } catch { ditolak = true }
  periksa('U-RLS-13', 'Anggota TIDAK dapat menonaktifkan akunnya sendiri', ditolak)
})

// Metode benar untuk UPDATE yang ditolak RLS: periksa KEADAAN BARIS,
// bukan ada tidaknya galat. Klausa USING menyaring diam-diam.
await sebagai(ID.anggota1, async () => {
  await db.query(`update public.users set nama = 'DIBAJAK' where id = $1`, [ID.anggota2])
})
periksa('U-RLS-14', 'Anggota TIDAK dapat mengubah baris Anggota lain (periksa keadaan baris)',
  (await db.query(`select nama from public.users where id = $1`, [ID.anggota2])).rows[0].nama === 'Anggota Dua')

await sebagai(ID.kanit1, async () => {
  await db.query(`update public.users set nama = 'DIBAJAK' where id = $1`, [ID.anggota2])
})
periksa('U-RLS-15', 'Kanit TIDAK dapat mengubah pengguna unit lain',
  (await db.query(`select nama from public.users where id = $1`, [ID.anggota2])).rows[0].nama === 'Anggota Dua')

await sebagai(ID.kanit1, async () => {
  await db.query(`update public.users set wajib_ganti_sandi = true where id = $1`, [ID.kasubdit])
})
periksa('U-RLS-16', 'Kanit TIDAK dapat mereset kata sandi Kasubdit (BR-15)',
  (await db.query(`select wajib_ganti_sandi w from public.users where id = $1`, [ID.kasubdit])).rows[0].w === false)

await sebagai(ID.kanit1, async () => {
  await db.query(`update public.users set wajib_ganti_sandi = true where id = $1`, [ID.anggota1])
  periksa('U-RLS-17', 'Kanit DAPAT menyalakan wajib_ganti_sandi Anggota di unitnya (BR-15)',
    (await db.query(`select wajib_ganti_sandi w from public.users where id = $1`, [ID.anggota1])).rows[0].w === true)
})

// =====================================================================
// BAGIAN 2 — Tabel unit
// =====================================================================

await sebagai(ID.anggota1, async () => {
  periksa('U-RLS-18', 'Seluruh pengguna membaca daftar unit aktif',
    await jumlah(`select count(*) n from public.unit`) === 2)

  let ditolak = false
  try {
    await db.query(`insert into public.unit (nama) values ('Unit Palsu')`)
  } catch { ditolak = true }
  periksa('U-RLS-19', 'Anggota TIDAK dapat menambah unit (tanpa grant insert)', ditolak)
})

// =====================================================================
// BAGIAN 3 — Tabel jejak_audit (BR-22 hanya-tambah)
// =====================================================================

await sebagai(ID.anggota1, async () => {
  await db.query(
    `insert into public.jejak_audit (pelaku_id, peran_pelaku, jenis_tindakan)
     values ($1, 'anggota', 'masuk_berhasil')`, [ID.anggota1])
  periksa('U-RLS-20', 'Pengguna dapat menambah jejak audit atas namanya sendiri',
    await jumlah(`select count(*) n from public.jejak_audit`) === 1)

  let ditolak = false
  try {
    await db.query(
      `insert into public.jejak_audit (pelaku_id, peran_pelaku, jenis_tindakan)
       values ($1, 'kasubdit', 'nonaktifkan_akun')`, [ID.kasubdit])
  } catch { ditolak = true }
  periksa('U-RLS-21', 'Pengguna TIDAK dapat mencatat jejak atas nama orang lain', ditolak)
})

await sebagai(ID.kasubdit, async () => {
  await db.query(
    `insert into public.jejak_audit (pelaku_id, peran_pelaku, jenis_tindakan)
     values ($1, 'kasubdit', 'masuk_berhasil')`, [ID.kasubdit])

  let ditolak = false
  try {
    await db.query(`update public.jejak_audit set keterangan = 'diubah'`)
  } catch { ditolak = true }
  periksa('U-RLS-22', 'Jejak audit TIDAK dapat diubah siapa pun (BR-22)', ditolak)

  ditolak = false
  try {
    await db.query(`delete from public.jejak_audit`)
  } catch { ditolak = true }
  periksa('U-RLS-23', 'Jejak audit TIDAK dapat dihapus siapa pun (BR-22)', ditolak)
})

// =====================================================================
// BAGIAN 4 — perangkat_masuk sengaja tanpa hak akses (koreksi J.2)
// =====================================================================

await sebagai(ID.anggota1, async () => {
  let ditolak = false
  try {
    await db.query(`select count(*) from public.perangkat_masuk`)
  } catch { ditolak = true }
  periksa('U-RLS-24', 'perangkat_masuk bergalat hak akses, bukan menjawab kosong', ditolak)
})

// =====================================================================
// BAGIAN 5 — Peran anon tidak boleh menyentuh apa pun
// =====================================================================

await db.exec('begin')
await db.exec(`set local role anon`)
for (const [kode, tabel] of [['U-RLS-25','users'], ['U-RLS-26','unit'], ['U-RLS-27','jejak_audit']]) {
  let ditolak = false
  try { await db.query(`select count(*) from public.${tabel}`) } catch { ditolak = true }
  periksa(kode, `anon TIDAK dapat membaca ${tabel}`, ditolak)
}
await db.exec('rollback')

// =====================================================================
// BAGIAN 6 — Disiplin penulisan (lahir dari kegagalan senyap nyata)
// =====================================================================

periksa('U-RLS-28', 'Seluruh pemicu berawalan trg_ (urutan jalan ditentukan abjad)',
  await jumlah(`
    select count(*) n from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and not t.tgisinternal
      and t.tgname not like 'trg\\_%'`) === 0)

periksa('U-RLS-29', 'Seluruh fungsi security definer mengunci search_path',
  await jumlah(`
    select count(*) n from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname in ('public', 'sipantau_auth')
      and p.prosecdef = true
      and not coalesce(array_to_string(p.proconfig, ','), '') like '%search_path=%'`) === 0)

periksa('U-RLS-30', 'Setiap tabel public menyalakan RLS',
  await jumlah(`
    select count(*) n from pg_class c
    join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false`) === 0)

periksa('U-RLS-31', 'Tidak ada fungsi yang menyisakan hak EXECUTE bagi PUBLIC',
  await jumlah(`
    select count(*) n from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'sipantau_auth'
      and has_function_privilege('public', p.oid, 'execute')`) === 0)

// =====================================================================
console.log(hasil.join('\n'))
console.log(`\n== ${lulus} lulus, ${gagal} gagal`)
process.exit(gagal === 0 ? 0 : 1)
