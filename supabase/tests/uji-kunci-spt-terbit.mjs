// Uji penguncian kolom dan jejak audit SPT sesudah terbit.
//
// Lahir dari audit 5 September 2026, yang menemukan dua butir PRD tidak
// pernah ditegakkan sama sekali:
//
//   KP-6.2-07  nomor_spt, unit_id, tanggal_mulai terkunci sesudah terbit
//              — nyatanya hanya unit_id; dua lainnya cuma dikunci di
//              dalam cabang 'kasubdit', jadi Kanit melewatinya
//   KP-6.2-39  suntingan sesudah terbit tercatat di jejak audit lengkap
//              dengan nama kolom, nilai lama, nilai baru — nyatanya
//              nilai enum 'sunting_spt' tidak pernah ditulis siapa pun
//
// Ditutup migrasi 0046 dan 0047. Berkas ini yang menjaganya tetap
// tertutup.
//
// CATATAN CARA MENGUJI. Penjaga di sini MELEMPAR galat, jadi pesan
// galatnya memang bukti yang sah. Meski begitu keadaan baris tetap
// diperiksa terpisah pada butir penguncian: bila suatu saat penjaganya
// diganti kebijakan RLS, penolakan berubah menjadi "nol baris tersentuh
// tanpa galat", dan uji yang hanya melihat galat akan lulus palsu.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit: '00000000-0000-0000-0000-000000000001',
  kanit:    '00000000-0000-0000-0000-000000000002',
  panit:    '00000000-0000-0000-0000-000000000003',
  anggota:  '00000000-0000-0000-0000-000000000004',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
const TERBIT  = '20000000-0000-0000-0000-000000000001'  // status 'berjalan'
const DRAF    = '20000000-0000-0000-0000-000000000002'  // status 'draf'
const BARU    = '20000000-0000-0000-0000-000000000003'  // status 'baru'
const MASALAH = '20000000-0000-0000-0000-000000000004'  // status 'bermasalah'

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
    ('${ID.kasubdit}'),('${ID.kanit}'),('${ID.panit}'),('${ID.anggota}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false),
    ('${ID.kanit}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.panit}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false);

  insert into public.penugasan
    (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,
     tanggal_mulai,tanggal_batas,uraian_tugas,objek)
  values ('${TERBIT}','SP/1/2026','Penyelidikan Unit I','${UNIT.satu}','berjalan',
          '${ID.kanit}',now(),date '2026-09-01',date '2026-09-30','uraian asli',null);

  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,tanggal_mulai,tanggal_batas)
  values ('${DRAF}','SP/2/2026','Draf Unit I','${UNIT.satu}','draf',
          date '2026-09-01', date '2026-09-30');

  -- Status terbit selain 'berjalan'. Disisipkan langsung, bukan lewat
  -- UPDATE: fn_jaga_transisi_status_spt (0024) menolak perpindahan
  -- status yang tidak sah, dan itu memang benar adanya.
  insert into public.penugasan
    (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,
     tanggal_mulai,tanggal_batas,jenis_masalah,uraian_masalah)
  values
    ('${BARU}','SP/3/2026','Baru Unit I','${UNIT.satu}','baru','${ID.kanit}',now(),
     date '2026-09-01', date '2026-09-30', null, null),
    ('${MASALAH}','SP/4/2026','Bermasalah Unit I','${UNIT.satu}','bermasalah','${ID.kanit}',now(),
     date '2026-09-01', date '2026-09-30', 'kendala_keamanan', 'uraian kendala di lapangan');

  -- Syarat terbit lengkap untuk DRAF (fn_periksa_syarat_terbit, 0024)
  insert into public.penugasan_dasar (penugasan_id,urutan,jenis,nomor)
  values ('${DRAF}',1,'laporan_polisi','LP/9/2026');
  insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng)
  values ('${DRAF}',1,'Mapolda',-6.9,107.6);
  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${DRAF}','${ID.panit}','${ID.kanit}');
  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${DRAF}','${ID.anggota}',1,now());
`)

let lulus = 0, gagal = 0
const cek = (k, t, ok) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`) }
}

/**
 * Menjalankan sesuatu sebagai `id` di dalam transaksi.
 * Bila bergalat, transaksinya SUDAH dibatalkan saat kembali.
 */
async function sebagai(id, sql, params = []) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: id, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  try { await db.query(sql, params); return null }
  catch (e) { await db.exec('rollback'); return e.message }
}

/** Membaca keadaan di dalam transaksi yang masih terbuka, lalu membatalkannya. */
async function bacaLaluBatalkan(sql, params = []) {
  await db.exec('reset role')
  const r = await db.query(sql, params)
  await db.exec('rollback')
  return r.rows
}

/** Keadaan sesudah transaksi yang sudah dibatalkan sendiri oleh sebagai(). */
async function baca(sql, params = []) {
  return (await db.query(sql, params)).rows
}

// =====================================================================
// KP-6.2-07 — kolom terkunci sesudah terbit, untuk SIAPA PUN
// =====================================================================

let e = await sebagai(ID.kanit,
  `update public.penugasan set nomor_spt='SP/999/PALSU' where id=$1`, [TERBIT])
let baris = await baca(`select nomor_spt from public.penugasan where id=$1`, [TERBIT])
cek('U-KS-01', 'Kanit DITOLAK mengubah nomor_spt SPT yang sudah terbit',
  e !== null && e.includes('KOLOM_TERKUNCI') && baris[0].nomor_spt === 'SP/1/2026')

e = await sebagai(ID.kanit,
  `update public.penugasan set tanggal_mulai=date '2020-01-01' where id=$1`, [TERBIT])
baris = await baca(`select tanggal_mulai from public.penugasan where id=$1`, [TERBIT])
cek('U-KS-02', 'Kanit DITOLAK mengubah tanggal_mulai SPT yang sudah terbit',
  e !== null && e.includes('KOLOM_TERKUNCI')
  && new Date(baris[0].tanggal_mulai).toISOString().startsWith('2026-09-01'))

e = await sebagai(ID.kanit,
  `update public.penugasan set unit_id=$2 where id=$1`, [TERBIT, UNIT.dua])
baris = await baca(`select unit_id from public.penugasan where id=$1`, [TERBIT])
cek('U-KS-03', 'unit_id tetap terkunci (regresi penjaga lama)',
  e !== null && e.includes('KOLOM_TERKUNCI') && baris[0].unit_id === UNIT.satu)

// SPT 'baru' dan 'bermasalah' juga sudah terbit — bukan hanya 'berjalan'.
for (const [kode, status, id] of [['U-KS-04', 'baru', BARU],
                                  ['U-KS-05', 'bermasalah', MASALAH]]) {
  e = await sebagai(ID.kanit,
    `update public.penugasan set nomor_spt='SP/888/PALSU' where id=$1`, [id])
  baris = await baca(`select nomor_spt from public.penugasan where id=$1`, [id])
  cek(kode, `nomor_spt tetap terkunci saat status '${status}'`,
    e !== null && e.includes('KOLOM_TERKUNCI')
    && baris[0].nomor_spt !== 'SP/888/PALSU')
}

// =====================================================================
// Draf TIDAK ikut terkunci — penyusunan harus tetap berjalan
// =====================================================================

e = await sebagai(ID.kanit,
  `update public.penugasan set nomor_spt='SP/2-revisi/2026' where id=$1`, [DRAF])
baris = e === null
  ? await bacaLaluBatalkan(`select nomor_spt from public.penugasan where id=$1`, [DRAF])
  : []
cek('U-KS-06', 'nomor_spt DRAF masih dapat disunting',
  e === null && baris[0]?.nomor_spt === 'SP/2-revisi/2026')

e = await sebagai(ID.kanit,
  `update public.penugasan set tanggal_mulai=date '2026-09-05' where id=$1`, [DRAF])
baris = e === null
  ? await bacaLaluBatalkan(`select tanggal_mulai from public.penugasan where id=$1`, [DRAF])
  : []
cek('U-KS-07', 'tanggal_mulai DRAF masih dapat disunting',
  e === null && new Date(baris[0]?.tanggal_mulai).toISOString().startsWith('2026-09-05'))

// Penerbitan memindahkan draf -> baru dalam satu UPDATE. Bila kuncinya
// memakai new.status dan bukan old.status, butir ini yang jatuh.
e = await sebagai(ID.kanit, `select public.terbitkan_draf($1)`, [DRAF])
baris = e === null
  ? await bacaLaluBatalkan(`select status from public.penugasan where id=$1`, [DRAF])
  : []
cek('U-KS-08', 'terbitkan_draf tetap berhasil (kunci memakai old.status)',
  e === null && baris[0]?.status === 'baru')

// =====================================================================
// KP-6.2-39 — jejak audit suntingan sesudah terbit
// =====================================================================

async function jejakSunting(sql, params) {
  const galat = await sebagai(ID.kanit, sql, params)
  if (galat) return { galat, baris: [] }
  const rows = await bacaLaluBatalkan(
    `select pelaku_id, peran_pelaku::text peran, sasaran_tabel, sasaran_id, keterangan
       from public.jejak_audit
      where jenis_tindakan::text = 'sunting_spt'
      order by waktu desc`)
  return { galat: null, baris: rows }
}

let h = await jejakSunting(
  `update public.penugasan set judul='Judul Diganti' where id=$1`, [TERBIT])
cek('U-KS-09', 'Sunting SPT terbit menghasilkan TEPAT satu baris sunting_spt',
  h.galat === null && h.baris.length === 1)
cek('U-KS-10', 'Keterangan memuat nama kolom, nilai lama, dan nilai baru',
  h.baris[0]?.keterangan === 'judul: Penyelidikan Unit I -> Judul Diganti')
cek('U-KS-11', 'Jejak menunjuk baris penugasan yang benar',
  h.baris[0]?.sasaran_tabel === 'penugasan' && h.baris[0]?.sasaran_id === TERBIT)
cek('U-KS-12', 'Pelaku jejak adalah penyunting itu sendiri',
  h.baris[0]?.pelaku_id === ID.kanit && h.baris[0]?.peran === 'kanit')

h = await jejakSunting(
  `update public.penugasan set judul='A', uraian_tugas='B', prioritas='urgent' where id=$1`,
  [TERBIT])
cek('U-KS-13', 'Beberapa kolom sekaligus tercatat pada SATU baris',
  h.baris.length === 1
  && h.baris[0].keterangan.includes('judul:')
  && h.baris[0].keterangan.includes('uraian_tugas:')
  && h.baris[0].keterangan.includes('prioritas: normal -> urgent'))

h = await jejakSunting(
  `update public.penugasan set objek='Objek Baru' where id=$1`, [TERBIT])
cek('U-KS-14', 'Nilai lama yang null ditulis "(kosong)", bukan menghilang',
  h.baris[0]?.keterangan === 'objek: (kosong) -> Objek Baru')

// Perubahan status punya tindakan auditnya sendiri (KP-6.2-61) — tidak
// boleh ikut tercatat sebagai sunting_spt. Dipakai batalkan_spt:
// tutup_spt menuntut berkas surat terunggah lebih dulu
// (chk_spt_selesai_wajib_berkas) dan tandai_spt_bermasalah menuntut
// pemanggilnya pelaksana atau Panit (KP-6.2-32) — keduanya syarat yang
// tidak ada urusannya dengan yang diuji di sini.
h = await jejakSunting(
  `select public.batalkan_spt($1,$2)`, [TERBIT, 'alasan pembatalan yang memadai'])
cek('U-KS-15', 'Perubahan status saja TIDAK menghasilkan jejak sunting_spt',
  h.galat === null && h.baris.length === 0)

// Menyunting draf bukan "suntingan sesudah terbit".
h = await jejakSunting(
  `update public.penugasan set judul='Draf Diganti' where id=$1`, [DRAF])
cek('U-KS-16', 'Menyunting DRAF TIDAK menghasilkan jejak sunting_spt',
  h.galat === null && h.baris.length === 0)

// UPDATE yang tidak mengubah satu pun kolom pantauan.
h = await jejakSunting(
  `update public.penugasan set diubah_pada=now() where id=$1`, [TERBIT])
cek('U-KS-17', 'UPDATE tanpa perubahan kolom pantauan tidak mencatat apa pun',
  h.galat === null && h.baris.length === 0)

// perpanjang_batas: dua baris jejak, dan hanya sunting_spt yang memuat
// nilai lama -> nilai baru sebagaimana dituntut KP-6.2-39.
e = await sebagai(ID.kanit,
  `select public.perpanjang_batas($1,$2,$3)`,
  [TERBIT, '2026-12-31', 'alasan perpanjangan yang memadai'])
const semua = e === null
  ? await bacaLaluBatalkan(
      `select jenis_tindakan::text jenis, keterangan from public.jejak_audit
        where sasaran_id=$1 order by waktu`, [TERBIT])
  : []
cek('U-KS-18', 'perpanjang_batas mencatat jejak perpanjang_batas DAN sunting_spt',
  e === null
  && semua.some(r => r.jenis === 'perpanjang_batas')
  && semua.some(r => r.jenis === 'sunting_spt'
      && r.keterangan.includes('tanggal_batas: 2026-09-30 -> 2026-12-31')))

// Jalur langsung tanpa perpanjang_batas — justru jalur inilah yang
// selama ini tidak tertangkap apa pun.
h = await jejakSunting(
  `update public.penugasan set tanggal_batas=date '2027-01-01' where id=$1`, [TERBIT])
cek('U-KS-19', 'tanggal_batas yang diubah LANGSUNG tetap tertangkap',
  h.baris.length === 1
  && h.baris[0].keterangan === 'tanggal_batas: 2026-09-30 -> 2027-01-01')

// =====================================================================
// Regresi penjaga lama — Kasubdit tetap tidak boleh menyunting
// =====================================================================

// Penolakan di sini datang dari KEBIJAKAN RLS, bukan pemicu:
// penugasan_ubah_kasubdit_buka_kembali (0008) hanya berlaku untuk SPT
// berstatus selesai/dibatalkan, jadi UPDATE ini menyentuh NOL baris
// TANPA galat sama sekali. Uji yang cuma melihat pesan galat akan
// menyatakan gagal padahal sistemnya justru benar — keadaan baris yang
// menentukan.
e = await sebagai(ID.kasubdit,
  `update public.penugasan set judul='Disunting Kasubdit' where id=$1`, [TERBIT])
baris = e === null
  ? await bacaLaluBatalkan(`select judul from public.penugasan where id=$1`, [TERBIT])
  : await baca(`select judul from public.penugasan where id=$1`, [TERBIT])
cek('U-KS-20', 'Kasubdit tetap tidak dapat menyunting isi penugasan berjalan',
  baris[0].judul === 'Penyelidikan Unit I')

console.log(`\n== ${lulus} butir uji kunci dan jejak SPT terbit ${gagal === 0 ? 'lulus' : `LULUS, ${gagal} GAGAL`}`)
await db.close()
process.exit(gagal === 0 ? 0 : 1)
