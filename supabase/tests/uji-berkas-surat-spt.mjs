// Uji jalur unggah pindaian surat perintah (berkas_surat_path).
//
// Lahir dari audit 5 September 2026: TIDAK ADA satu jalur pun, di
// seluruh aplikasi, yang pernah mengisi kolom ini — membuat tutup_spt
// mustahil dipakai sungguhan (BR-25/chk_selesai_wajib_berkas, 0007).
// Tiga uji lain yang menyentuh tutup_spt (uji-siklus-spt.mjs,
// uji-gps.mjs, uji-notifikasi.mjs) semuanya mengisi berkas_surat_path
// lewat UPDATE SQL LANGSUNG — itulah sebabnya seluruh 358 uji lulus
// sementara fiturnya sendiri tidak pernah ada. Berkas ini yang pertama
// membuktikan jalur SUNGGUHAN (Storage -> unggah_surat_spt -> tutup_spt)
// benar-benar berhasil ujung ke ujung.
//
// Ditutup migrasi 0048. stub.sql turut diperbaiki pada sesi yang sama:
// tanpa grant atas skema storage, SETIAP kebijakan RLS Storage proyek
// ini (termasuk wadah 'dokumentasi' sejak 0013) gagal "permission
// denied for schema storage" pada percobaan pertama — lulus-palsu yang
// menyamar sebagai aman padahal cuma tidak pernah teruji.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kanit1:   '00000000-0000-0000-0000-000000000002',
  panit1:   '00000000-0000-0000-0000-000000000003',
  anggota1: '00000000-0000-0000-0000-000000000004',
  kanit2:   '00000000-0000-0000-0000-000000000007',
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
    ('${ID.kanit1}'),('${ID.panit1}'),('${ID.anggota1}'),('${ID.kanit2}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false);

  insert into public.penugasan
    (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT}','SP/1/2026','Penyelidikan Unit I','${UNIT.satu}','berjalan',
          '${ID.kanit1}',now(),date '2026-09-01',date '2026-09-30');

  insert into public.penugasan_dasar (penugasan_id,urutan,jenis,nomor)
  values ('${SPT}',1,'laporan_polisi','LP/9/2026');
  insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng)
  values ('${SPT}',1,'Mapolda',-6.9,107.6);
  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT}','${ID.panit1}','${ID.kanit1}');
  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT}','${ID.anggota1}',1,now());
`)

let lulus = 0, gagal = 0
const cek = (k, t, ok) => {
  if (ok) { lulus++; console.log(`  LULUS  ${k}  ${t}`) }
  else    { gagal++; console.log(`  GAGAL  ${k}  ${t}`) }
}

async function sebagai(id, sql, params = []) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: id, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  try { const r = await db.query(sql, params); await db.exec('commit'); return { galat: null, r } }
  catch (e) { await db.exec('rollback'); return { galat: e.message, r: null } }
}

async function baca(sql, params = []) {
  return (await db.query(sql, params)).rows
}

// =====================================================================
// Kebijakan Storage — surat_spt_unggah_kanit / surat_spt_baca_sesuai_lingkup
// =====================================================================

let h = await sebagai(ID.kanit1,
  `insert into storage.objects (bucket_id, name, owner) values ('surat-spt', $1, $2)`,
  [`${SPT}/asli.pdf`, ID.kanit1])
cek('U-BS-01', 'Kanit pemilik unit dapat mengunggah ke folder SPT-nya sendiri',
  h.galat === null)

h = await sebagai(ID.kanit2,
  `insert into storage.objects (bucket_id, name, owner) values ('surat-spt', $1, $2)`,
  [`${SPT}/susupan.pdf`, ID.kanit2])
cek('U-BS-02', 'Kanit UNIT LAIN DITOLAK mengunggah ke folder SPT ini',
  h.galat !== null)

h = await sebagai(ID.anggota1,
  `insert into storage.objects (bucket_id, name, owner) values ('surat-spt', $1, $2)`,
  [`${SPT}/dari-anggota.pdf`, ID.anggota1])
cek('U-BS-03', 'Anggota (bukan Kanit) DITOLAK mengunggah',
  h.galat !== null)

h = await sebagai(ID.kanit1,
  `select count(*)::int n from storage.objects where bucket_id='surat-spt' and name=$1`,
  [`${SPT}/asli.pdf`])
cek('U-BS-04', 'Kanit pemilik dapat membaca kembali berkas yang diunggah',
  h.galat === null && h.r.rows[0].n === 1)

h = await sebagai(ID.kanit2,
  `select count(*)::int n from storage.objects where bucket_id='surat-spt' and name=$1`,
  [`${SPT}/asli.pdf`])
cek('U-BS-05', 'Kanit UNIT LAIN tidak dapat membaca berkas SPT ini (nol baris, bukan galat)',
  h.galat === null && h.r.rows[0].n === 0)

// =====================================================================
// unggah_surat_spt — menautkan jalur berkas ke baris penugasan
// =====================================================================

h = await sebagai(ID.kanit2,
  `select public.unggah_surat_spt($1, $2)`, [SPT, `${SPT}/dari-kanit2.pdf`])
cek('U-BS-06', 'Kanit UNIT LAIN DITOLAK memanggil unggah_surat_spt atas SPT ini',
  h.galat !== null && h.galat.includes('TIDAK_DITEMUKAN'))

h = await sebagai(ID.anggota1,
  `select public.unggah_surat_spt($1, $2)`, [SPT, `${SPT}/dari-anggota.pdf`])
cek('U-BS-07', 'Anggota DITOLAK memanggil unggah_surat_spt',
  h.galat !== null && h.galat.includes('BUKAN_KANIT'))

h = await sebagai(ID.kanit1,
  `select public.unggah_surat_spt($1, $2)`,
  [SPT, `20000000-0000-0000-0000-000000009999/palsu.pdf`])
cek('U-BS-08', 'Jalur berkas yang menunjuk SPT LAIN ditolak (pertahanan berlapis)',
  h.galat !== null && h.galat.includes('BERKAS_TIDAK_SAH'))

h = await sebagai(ID.kanit1,
  `select public.unggah_surat_spt($1, $2)`, [SPT, `${SPT}/asli.pdf`])
cek('U-BS-09', 'Kanit pemilik BERHASIL menautkan berkas ke penugasannya',
  h.galat === null)

let baris = await baca(`select berkas_surat_path from public.penugasan where id=$1`, [SPT])
cek('U-BS-10', 'berkas_surat_path tersimpan sesuai yang diunggah',
  baris[0].berkas_surat_path === `${SPT}/asli.pdf`)

baris = await baca(
  `select keterangan from public.jejak_audit where jenis_tindakan::text='unggah_surat_spt' and sasaran_id=$1`,
  [SPT])
cek('U-BS-11', 'Jejak audit unggah_surat_spt tercatat (KP-6.2-61, nilai enum sejak 0007 kini terpakai)',
  baris.length === 1)

// =====================================================================
// Pembuktian ujung ke ujung — tutup_spt SEKARANG benar-benar bisa
// dipakai lewat jalur aplikasi yang sesungguhnya, bukan diisi paksa
// lewat SQL seperti tiga uji lain yang menyentuh fungsi ini.
// =====================================================================

h = await sebagai(ID.kanit1, `select public.tutup_spt($1)`, [SPT])
cek('U-BS-12', 'tutup_spt BERHASIL sesudah berkas dilampirkan lewat jalur sungguhan',
  h.galat === null)

baris = await baca(`select status from public.penugasan where id=$1`, [SPT])
cek('U-BS-13', 'Status benar berpindah ke selesai',
  baris[0].status === 'selesai')

// =====================================================================
// SPT sudah tertutup — unggah_surat_spt tidak lagi diterima
// =====================================================================

h = await sebagai(ID.kanit1,
  `select public.unggah_surat_spt($1, $2)`, [SPT, `${SPT}/pengganti.pdf`])
cek('U-BS-14', 'unggah_surat_spt DITOLAK sesudah SPT tertutup',
  h.galat !== null && h.galat.includes('TIDAK_DITEMUKAN'))

console.log(`\n== ${lulus} butir uji berkas surat SPT ${gagal === 0 ? 'lulus' : `LULUS, ${gagal} GAGAL`}`)
await db.close()
process.exit(gagal === 0 ? 0 : 1)
