// Uji RLS + fungsi untuk pengajuan_sprin (migrasi 0053/0054): alur
// persetujuan scan SPRIN Anggota/Panit -> Kanit unit yang sama.

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

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi,aktif) values
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false,true),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false,true),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false,true),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.dua}',false,true);
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
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}

// =====================================================================
// ajukan_scan_sprin — hanya Anggota/Panit
// =====================================================================

let pengajuanSatu
await komit(ID.anggota1, async () => {
  const r = await db.query(
    `select public.ajukan_scan_sprin($1) as id`, [{ judul: 'Uji' }])
  pengajuanSatu = r.rows[0].id
})
cek('U-PS-01', 'Anggota berhasil mengajukan scan SPRIN', !!pengajuanSatu)

await sebagai(ID.kanit1, async () => {
  const e = await galat(() => db.query(`select public.ajukan_scan_sprin($1)`, [{ judul: 'x' }]))
  cek('U-PS-02', 'Kanit TIDAK dapat mengajukan scan (BUKAN_PENGAJU)', e?.includes('BUKAN_PENGAJU'))
})

// =====================================================================
// SELECT pengajuan_sprin — pemilik dan Kanit unit yang sama saja
// (menutup celah 0053: tabel sempat tanpa grant select sama sekali)
// =====================================================================

await sebagai(ID.anggota1, async () => {
  const r = await db.query(`select count(*)::int as n from public.pengajuan_sprin where id=$1`, [pengajuanSatu])
  cek('U-PS-03', 'Pengaju sendiri DAPAT membaca pengajuannya', r.rows[0].n === 1)
})

await sebagai(ID.kanit1, async () => {
  const r = await db.query(`select count(*)::int as n from public.pengajuan_sprin where id=$1`, [pengajuanSatu])
  cek('U-PS-04', 'Kanit unit yang sama DAPAT membaca pengajuan', r.rows[0].n === 1)
})

await sebagai(ID.kanit2, async () => {
  const r = await db.query(`select count(*)::int as n from public.pengajuan_sprin where id=$1`, [pengajuanSatu])
  cek('U-PS-05', 'Kanit UNIT LAIN TIDAK membaca pengajuan (nol baris)', r.rows[0].n === 0)
})

await sebagai(ID.anggota2, async () => {
  const r = await db.query(`select count(*)::int as n from public.pengajuan_sprin where id=$1`, [pengajuanSatu])
  cek('U-PS-06', 'Anggota lain (bukan pengaju, bukan Kanit) TIDAK membaca pengajuan', r.rows[0].n === 0)
})

// =====================================================================
// putuskan_pengajuan_sprin — hanya Kanit unit yang sama
// =====================================================================

await sebagai(ID.kanit2, async () => {
  const e = await galat(() => db.query(
    `select public.putuskan_pengajuan_sprin($1,'disetujui',null)`, [pengajuanSatu]))
  cek('U-PS-07', 'Kanit UNIT LAIN DITOLAK memutuskan pengajuan', e?.includes('BUKAN_KANIT_ATAU_TIDAK_DITEMUKAN'))
})

await sebagai(ID.kanit1, async () => {
  const e = await galat(() => db.query(
    `select public.putuskan_pengajuan_sprin($1,'perlu_perbaikan',null)`, [pengajuanSatu]))
  cek('U-PS-08', 'perlu_perbaikan tanpa catatan DITOLAK (CATATAN_PERBAIKAN_WAJIB)', e?.includes('CATATAN_PERBAIKAN_WAJIB'))
})

await komit(ID.kanit1, async () => {
  await db.query(`select public.putuskan_pengajuan_sprin($1,'perlu_perbaikan','Nomor SPRIN salah baca')`, [pengajuanSatu])
})
{
  const r = await db.query(`select status, catatan_kanit from public.pengajuan_sprin where id=$1`, [pengajuanSatu])
  cek('U-PS-09', 'Status berubah jadi perlu_perbaikan dengan catatan tersimpan',
    r.rows[0].status === 'perlu_perbaikan' && r.rows[0].catatan_kanit === 'Nomor SPRIN salah baca')
}

// =====================================================================
// kirim_ulang_scan_sprin — hanya pengaju sendiri, hanya saat perlu_perbaikan
// =====================================================================

await sebagai(ID.anggota2, async () => {
  const e = await galat(() => db.query(
    `select public.kirim_ulang_scan_sprin($1,$2)`, [pengajuanSatu, { judul: 'Palsu' }]))
  cek('U-PS-10', 'Bukan pengaju TIDAK dapat kirim ulang', e?.includes('PENGAJUAN_TIDAK_DAPAT_DIKIRIM_ULANG'))
})

await komit(ID.anggota1, async () => {
  await db.query(`select public.kirim_ulang_scan_sprin($1,$2)`, [pengajuanSatu, { judul: 'Diperbaiki' }])
})
{
  const r = await db.query(`select status, catatan_kanit from public.pengajuan_sprin where id=$1`, [pengajuanSatu])
  cek('U-PS-11', 'Kirim ulang mengembalikan status ke diajukan dan mengosongkan catatan',
    r.rows[0].status === 'diajukan' && r.rows[0].catatan_kanit === null)
}

await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `select public.kirim_ulang_scan_sprin($1,$2)`, [pengajuanSatu, { judul: 'Lagi' }]))
  cek('U-PS-12', 'Kirim ulang DITOLAK saat status bukan perlu_perbaikan', e?.includes('PENGAJUAN_TIDAK_DAPAT_DIKIRIM_ULANG'))
})

// =====================================================================
// Pemberitahuan (0055) — tanpa ini ajuan tersimpan tetapi tidak pernah
// sampai ke Kanit, dan keputusan Kanit tidak pernah sampai ke pengaju.
// =====================================================================

const notif = async (penerima, jenis) => Number((await db.query(
  `select count(*)::int as n from public.notifikasi where penerima_id=$1 and jenis=$2`,
  [penerima, jenis])).rows[0].n)

cek('U-PS-13', 'Kanit unit yang sama menerima notifikasi ajuan',
  await notif(ID.kanit1, 'sprin_diajukan') >= 1)
cek('U-PS-14', 'Kanit UNIT LAIN tidak menerima notifikasi ajuan',
  await notif(ID.kanit2, 'sprin_diajukan') === 0)
cek('U-PS-15', 'Pengaju tidak menerima notifikasi atas ajuannya sendiri (BR-74)',
  await notif(ID.anggota1, 'sprin_diajukan') === 0)
cek('U-PS-16', 'Kirim ulang memunculkan notifikasi kedua ke Kanit',
  await notif(ID.kanit1, 'sprin_diajukan') === 2)
cek('U-PS-17', 'Pengaju menerima notifikasi keputusan Kanit',
  await notif(ID.anggota1, 'sprin_diputuskan') === 1)
cek('U-PS-18', 'Catatan perbaikan ikut terbawa pada isi notifikasi',
  Number((await db.query(
    `select count(*)::int as n from public.notifikasi
      where penerima_id=$1 and jenis='sprin_diputuskan' and isi ilike '%Nomor SPRIN salah baca%'`,
    [ID.anggota1])).rows[0].n) === 1)
cek('U-PS-19', 'Notifikasi Kanit menunjuk kotak persetujuan',
  Number((await db.query(
    `select count(*)::int as n from public.notifikasi
      where penerima_id=$1 and jenis='sprin_diajukan' and tujuan_jenis='pengajuan_sprin'`,
    [ID.kanit1])).rows[0].n) === 2)

// =====================================================================
// Usulan SPRIN (migrasi 0063)
//
// Arahnya kebalikan dari scan: suratnya BELUM ada, dan bawahan meminta
// Kanit menerbitkannya. Yang dijaga di sini tiga hal yang kalau meleset
// gagalnya senyap — alasan wajib benar-benar ditegakkan, nomor SPT tidak
// pernah boleh datang dari pengusul, dan menarik ajuan tidak boleh
// menjadi cara menghapus keputusan yang sudah diambil.
// =====================================================================

const USULAN = {
  alasan: 'Ditemukan aktivitas pembuangan limbah di luar jam kerja pada lokasi yang sama tiga hari berturut-turut.',
  judul: 'Penyelidikan dugaan pembuangan limbah',
  objek: 'Kegiatan pembuangan limbah cair',
  sasaran: 'Kawasan industri sisi timur',
  uraian_tugas: 'Pengamatan dan pengumpulan keterangan awal.',
  lokasi: [{ nama: 'Kawasan industri', alamat: 'Jl. Contoh', keterangan: '' }],
  personel: ['Anggota Satu'],
}

let idUsulan
await komit(ID.anggota1, async () => {
  idUsulan = (await db.query(`select public.ajukan_usulan_sprin($1::jsonb) id`,
    [JSON.stringify(USULAN)])).rows[0].id
})

cek('U-PS-20', 'Anggota dapat mengajukan usulan, dan tersimpan sebagai asal=usulan',
  (await db.query(`select asal, status from public.pengajuan_sprin where id=$1`, [idUsulan]))
    .rows[0].asal === 'usulan')

cek('U-PS-21', 'Usulan masuk ke kotak yang SAMA dengan scan, bukan daftar terpisah',
  Number((await db.query(
    `select count(*) n from public.pengajuan_sprin where unit_id=$1 and status='diajukan'`,
    [UNIT.satu])).rows[0].n) >= 1)

cek('U-PS-22', 'Ajuan scan yang sudah ada tetap terbaca sebagai asal=scan',
  (await db.query(`select asal from public.pengajuan_sprin where id=$1`, [pengajuanSatu]))
    .rows[0].asal === 'scan')

{
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(`select public.ajukan_usulan_sprin($1::jsonb)`,
      [JSON.stringify({ ...USULAN, alasan: '   ' })])))
  cek('U-PS-23', 'Usulan tanpa alasan ditolak — Kanit tidak boleh diminta memutuskan tanpa bahan',
    e !== null && e.includes('ALASAN_WAJIB'))
}

// Nomor SPT berasal dari buku agenda di luar SiPANTAU (modul 6.2).
// Membiarkan nomor kiriman pengusul lolos membuat Kanit mengira nomor
// itu sudah sah.
{
  let idBernomor
  await komit(ID.anggota1, async () => {
    idBernomor = (await db.query(`select public.ajukan_usulan_sprin($1::jsonb) id`,
      [JSON.stringify({ ...USULAN, nomor_spt: 'SP.Lidik/999/IX/RES.5./2026' })])).rows[0].id
  })
  cek('U-PS-24', 'nomor_spt kiriman pengusul DIBUANG, bukan sekadar diabaikan',
    (await db.query(`select data_scan ? 'nomor_spt' as ada from public.pengajuan_sprin where id=$1`,
      [idBernomor])).rows[0].ada === false)
}

{
  const e = await galat(() => sebagai(ID.kanit1, () =>
    db.query(`select public.ajukan_usulan_sprin($1::jsonb)`, [JSON.stringify(USULAN)])))
  cek('U-PS-25', 'Kanit tidak mengusulkan kepada dirinya sendiri',
    e !== null && e.includes('BUKAN_PENGAJU'))
}

cek('U-PS-26', 'Kanit diberi tahu dengan kalimat usulan, bukan kalimat scan',
  Number((await db.query(
    `select count(*) n from public.notifikasi
      where penerima_id=$1 and jenis='sprin_diajukan' and judul like 'Usulan SPRIN%'`,
    [ID.kanit1])).rows[0].n) >= 1)

// --- Menarik ajuan ---

{
  const e = await galat(() => sebagai(ID.anggota2, () =>
    db.query(`select public.tarik_pengajuan_sprin($1)`, [idUsulan])))
  cek('U-PS-27', 'Orang lain tidak dapat menarik ajuan yang bukan miliknya',
    e !== null && e.includes('TIDAK_DAPAT_DITARIK'))
}

await komit(ID.anggota1, async () => {
  await db.query(`select public.tarik_pengajuan_sprin($1)`, [idUsulan])
})
cek('U-PS-28', 'Pengusul dapat menarik ajuannya selama belum diputuskan',
  (await db.query(`select status from public.pengajuan_sprin where id=$1`, [idUsulan]))
    .rows[0].status === 'ditarik')

cek('U-PS-29', 'Menarik BUKAN menghapus: barisnya tetap ada',
  Number((await db.query(`select count(*) n from public.pengajuan_sprin where id=$1`,
    [idUsulan])).rows[0].n) === 1)

{
  const e = await galat(() => sebagai(ID.kanit1, () =>
    db.query(`select public.putuskan_pengajuan_sprin($1,'disetujui')`, [idUsulan])))
  cek('U-PS-30', 'Ajuan yang sudah ditarik tidak dapat diputuskan Kanit',
    e !== null && e.includes('BUKAN_KANIT_ATAU_TIDAK_DITEMUKAN'))
}

{
  let idTetap
  await komit(ID.anggota1, async () => {
    idTetap = (await db.query(`select public.ajukan_usulan_sprin($1::jsonb) id`,
      [JSON.stringify(USULAN)])).rows[0].id
  })
  await komit(ID.kanit1, async () => {
    await db.query(`select public.putuskan_pengajuan_sprin($1,'ditolak')`, [idTetap])
  })
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(`select public.tarik_pengajuan_sprin($1)`, [idTetap])))
  cek('U-PS-31', 'Yang sudah diputuskan tidak dapat ditarik — keputusan bagian dari jejak',
    e !== null && e.includes('TIDAK_DAPAT_DITARIK'))

  cek('U-PS-32', 'Penolakan usulan memakai kalimat usulan, bukan kalimat scan',
    Number((await db.query(
      `select count(*) n from public.notifikasi
        where penerima_id=$1 and judul = 'Usulan SPRIN Anda ditolak'`,
      [ID.anggota1])).rows[0].n) === 1)
}

// Tanggal yang diisi pengusul WAJIB memakai nama medan yang dibaca
// wizard terbitkan. Medan bernama lain tersimpan rapi lalu hilang tanpa
// jejak saat Kanit melanjutkannya jadi penugasan.
{
  let idTanggal
  await komit(ID.panit1, async () => {
    idTanggal = (await db.query(`select public.ajukan_usulan_sprin($1::jsonb) id`,
      [JSON.stringify({ ...USULAN, tanggal_mulai: '2026-09-20', tanggal_batas: '2026-09-27' })])).rows[0].id
  })
  cek('U-PS-33', 'Tanggal usulan tersimpan pada medan yang dibaca wizard terbitkan',
    (await db.query(`select data_scan->>'tanggal_mulai' m, data_scan->>'tanggal_batas' b
                       from public.pengajuan_sprin where id=$1`, [idTanggal]))
      .rows[0].m === '2026-09-20')

  cek('U-PS-34', 'Panit juga dapat mengusulkan, bukan hanya Anggota',
    (await db.query(`select diajukan_oleh d from public.pengajuan_sprin where id=$1`, [idTanggal]))
      .rows[0].d === ID.panit1)
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji pengajuan scan SPRIN lulus`
  : `\n== ${gagal} dari ${lulus + gagal} butir uji pengajuan scan SPRIN GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
