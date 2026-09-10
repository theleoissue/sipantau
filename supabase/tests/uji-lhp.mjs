// Uji fungsional Modul 6.8 (LHP Ringkas Otomatis).
//
// Yang dikejar terutama: RBAC "menyusun hanya Anggota, pelaksana aktif
// SPT itu" (fondasi.md §7), lingkup baca Kasubdit/Kanit/Panit/Anggota
// (fondasi.md §7 baris 341-345), penguncian setelah difinalkan (tiru
// fn_kunci_laporan), pelebaran daftar tertutup notifikasi 'lhp_difinalkan'
// (BR-68/BR-72) tanpa merusak nilai lama, dan lhp_foto yang HANYA boleh
// menaut foto dari SPT yang sama (bukan tautan bebas lintas SPT/unit).

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit: '00000000-0000-0000-0000-000000000001',
  kanit1:   '00000000-0000-0000-0000-000000000002',
  kanit2:   '00000000-0000-0000-0000-000000000007',
  panit1:   '00000000-0000-0000-0000-000000000003',
  anggota1: '00000000-0000-0000-0000-000000000004',
  anggota2: '00000000-0000-0000-0000-000000000005',
  pemel:    '00000000-0000-0000-0000-000000000006',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
const SPT = { satu: '20000000-0000-0000-0000-000000000001',
              dua:  '20000000-0000-0000-0000-000000000002' }

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
    ('${ID.kasubdit}'),('${ID.kanit1}'),('${ID.kanit2}'),('${ID.panit1}'),
    ('${ID.anggota1}'),('${ID.anggota2}'),('${ID.pemel}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi,aktif) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false,true),
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false,true),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false,true),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false,true),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.pemel}','Pemeliharaan','0000006','0000006@sipantau.internal','pemeliharaan',null,false,true);

  -- SPT satu (Unit I): anggota1 pelaksana aktif, panit1 mengawasi.
  -- Disisipkan langsung berstatus 'berjalan' — pemicu transisi hanya
  -- memeriksa UPDATE, bukan INSERT (sama seperti berkas uji lain).
  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh)
  values ('${SPT.satu}','SP.Gas.Lidik/1/VIII/RES.5.3/2026/Ditreskrimsus','Uji LHP Satu','${UNIT.satu}','berjalan','${ID.kanit1}');
  insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
  values ('${SPT.satu}','laporan_informasi','LI/1/VIII/2026',current_date);
  insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
  values ('${SPT.satu}',1,'Bandara Kertajati',-6.649,108.169,300);
  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.satu}','${ID.panit1}','${ID.kanit1}');
  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.satu}','${ID.anggota1}',1,now());

  -- SPT dua (Unit II): tidak berkaitan sama sekali, dipakai menguji
  -- lhp_foto menolak foto dari SPT lain.
  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh)
  values ('${SPT.dua}','SP.Gas.Lidik/2/VIII/RES.5.3/2026/Ditreskrimsus','Uji LHP Dua','${UNIT.dua}','berjalan','${ID.kanit2}');
  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.dua}','${ID.kanit2}',1,now());

  -- Laporan + foto pada SPT satu (untuk uji lhp_foto berhasil) dan SPT
  -- dua (untuk uji lhp_foto ditolak).
  insert into public.laporan_harian (id,penugasan_id,pelapor_id,jenis,uraian,penanda_perangkat,alasan_lokasi)
  values
    ('30000000-0000-0000-0000-000000000001','${SPT.satu}','${ID.anggota1}','perkembangan','Uraian satu','uji','gps_tidak_tertangkap'),
    ('30000000-0000-0000-0000-000000000002','${SPT.dua}','${ID.kanit2}','perkembangan','Uraian dua','uji','gps_tidak_tertangkap');
  insert into public.foto_dokumentasi (id,laporan_id,diunggah_oleh,sumber,berkas_path)
  values
    ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','${ID.anggota1}','kamera','satu.jpg'),
    ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','${ID.kanit2}','kamera','dua.jpg');
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
// mulai_lhp — RBAC menyusun (hanya Anggota, pelaksana aktif)
// =====================================================================

await sebagai(ID.kanit1, async () => {
  const e = await galat(() => db.query(
    `select public.mulai_lhp($1,'Dasar','Waktu','Tempat')`, [SPT.satu]))
  cek('U-LHP-01', 'Kanit tidak dapat menyusun LHP (BUKAN_ANGGOTA)', e?.includes('BUKAN_ANGGOTA'))
})

await sebagai(ID.panit1, async () => {
  const e = await galat(() => db.query(
    `select public.mulai_lhp($1,'Dasar','Waktu','Tempat')`, [SPT.satu]))
  cek('U-LHP-02', 'Panit tidak dapat menyusun LHP (BUKAN_ANGGOTA)', e?.includes('BUKAN_ANGGOTA'))
})

await sebagai(ID.anggota2, async () => {
  const e = await galat(() => db.query(
    `select public.mulai_lhp($1,'Dasar','Waktu','Tempat')`, [SPT.satu]))
  cek('U-LHP-03', 'Anggota yang BUKAN pelaksana SPT itu ditolak (BUKAN_PELAKSANA)', e?.includes('BUKAN_PELAKSANA'))
})

// SPT satu: pelaksana aktif adalah anggota1 sendiri.
let lhpSatu
await komit(ID.anggota1, async () => {
  const r = await db.query(
    `select public.mulai_lhp($1,'SP.Gas.Lidik/1/VIII/RES.5.3/2026','Senin 10 Juni 2026','Bandara Kertajati') as id`,
    [SPT.satu])
  lhpSatu = r.rows[0].id
})
cek('U-LHP-04', 'Anggota pelaksana aktif berhasil membuat draf LHP', !!lhpSatu)
cek('U-LHP-05', 'Draf tersimpan dengan status draf dan disusun_oleh benar',
  (await db.query(`select status, disusun_oleh from public.lhp where id=$1`, [lhpSatu])).rows[0].status === 'draf'
  && (await db.query(`select disusun_oleh from public.lhp where id=$1`, [lhpSatu])).rows[0].disusun_oleh === ID.anggota1)
cek('U-LHP-06', 'Dasar/waktu/tempat otomatis tersimpan apa adanya dari pemanggil',
  (await db.query(`select dasar from public.lhp where id=$1`, [lhpSatu])).rows[0].dasar === 'SP.Gas.Lidik/1/VIII/RES.5.3/2026')

// lhp_petugas terisi otomatis: panit1 (urutan 1) lalu anggota1 (urutan 2)
const petugas = (await db.query(
  `select petugas_id, urutan from public.lhp_petugas where lhp_id=$1 order by urutan`, [lhpSatu])).rows
cek('U-LHP-07', 'lhp_petugas terisi otomatis: Panit lebih dulu, pelaksana menyusul',
  petugas.length === 2 && petugas[0].petugas_id === ID.panit1 && petugas[1].petugas_id === ID.anggota1)

await sebagai(ID.anggota1, async () => {
  const kandidat = (await db.query(`select id from public.personel_lhp_dapat_dipilih($1) order by id`, [lhpSatu])).rows.map(r => r.id)
  cek('U-LHP-07A', 'Penyusun melihat hanya tim aktif SPRIN sebagai kandidat petugas',
    kandidat.length === 2 && kandidat.includes(ID.panit1) && kandidat.includes(ID.anggota1))
  const e = await galat(() => db.query(
    `insert into public.lhp_petugas (lhp_id,petugas_id,urutan) values ($1,$2,99)`, [lhpSatu, ID.anggota2]))
  cek('U-LHP-07B', 'Petugas di luar tim SPRIN ditolak pada tingkat database', e?.includes('BUKAN_TIM_SPT'))
})
await sebagai(ID.anggota2, async () => {
  cek('U-LHP-07C', 'Bukan penyusun tidak memperoleh kandidat petugas LHP',
    await n(`select count(*) n from public.personel_lhp_dapat_dipilih($1)`, [lhpSatu]) === 0)
})

// =====================================================================
// RLS baca — lingkup Kasubdit/Kanit/Panit/Anggota (fondasi.md §7)
// =====================================================================

await sebagai(ID.anggota1, async () => {
  cek('U-LHP-08', 'Anggota penyusun membaca LHP miliknya',
    await n(`select count(*) n from public.lhp where id=$1`, [lhpSatu]) === 1)
})
await sebagai(ID.anggota2, async () => {
  cek('U-LHP-09', 'Anggota lain (bukan penyusun, bukan pengawas) TIDAK membaca LHP ini',
    await n(`select count(*) n from public.lhp where id=$1`, [lhpSatu]) === 0)
})
await sebagai(ID.panit1, async () => {
  cek('U-LHP-10', 'Panit yang mengawasi SPT ini DAPAT membaca LHP-nya',
    await n(`select count(*) n from public.lhp where id=$1`, [lhpSatu]) === 1)
})
await sebagai(ID.kanit1, async () => {
  cek('U-LHP-11', 'Kanit unit pemilik DAPAT membaca LHP unitnya',
    await n(`select count(*) n from public.lhp where id=$1`, [lhpSatu]) === 1)
})
await sebagai(ID.kanit2, async () => {
  cek('U-LHP-12', 'Kanit UNIT LAIN TIDAK membaca LHP unit lain',
    await n(`select count(*) n from public.lhp where id=$1`, [lhpSatu]) === 0)
})
await sebagai(ID.kasubdit, async () => {
  cek('U-LHP-13', 'Kasubdit membaca LHP seluruh unit',
    await n(`select count(*) n from public.lhp where id=$1`, [lhpSatu]) === 1)
})

// =====================================================================
// Tabel anak — tulis hanya penyusun selagi draf
// =====================================================================

await sebagai(ID.anggota2, async () => {
  const e = await galat(() => db.query(
    `insert into public.lhp_pihak (lhp_id, peran, nama) values ($1,'terlapor','Uji Coba')`, [lhpSatu]))
  cek('U-LHP-14', 'Bukan penyusun TIDAK dapat menambah lhp_pihak', e !== null)
})

let idPihak
await komit(ID.anggota1, async () => {
  const r = await db.query(
    `insert into public.lhp_pihak (lhp_id, peran, nama, nomor_pengenal) values ($1,'terlapor','Terlapor Uji','3200000000000000') returning id`,
    [lhpSatu])
  idPihak = r.rows[0].id
})
cek('U-LHP-15', 'Penyusun DAPAT menambah lhp_pihak (termasuk nomor pengenal — A-02 disetujui institusi)', !!idPihak)

await komit(ID.anggota1, async () => {
  await db.query(`insert into public.lhp_saksi (lhp_id, nama, kedudukan) values ($1,'Saksi Uji','Ketua Regu')`, [lhpSatu])
  await db.query(`insert into public.lhp_barang_bukti (lhp_id, uraian) values ($1,'Surat pernyataan uji')`, [lhpSatu])
})
cek('U-LHP-16', 'Penyusun DAPAT menambah lhp_saksi',
  await n(`select count(*) n from public.lhp_saksi where lhp_id=$1`, [lhpSatu]) === 1)
cek('U-LHP-17', 'Penyusun DAPAT menambah lhp_barang_bukti',
  await n(`select count(*) n from public.lhp_barang_bukti where lhp_id=$1`, [lhpSatu]) === 1)

// =====================================================================
// lhp_foto — hanya foto dari SPT yang SAMA
// =====================================================================

await komit(ID.anggota1, async () => {
  await db.query(`insert into public.lhp_foto (lhp_id, foto_id) values ($1,'40000000-0000-0000-0000-000000000001')`, [lhpSatu])
})
cek('U-LHP-18', 'Foto dari laporan pada SPT YANG SAMA berhasil dilampirkan',
  await n(`select count(*) n from public.lhp_foto where lhp_id=$1`, [lhpSatu]) === 1)

await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `insert into public.lhp_foto (lhp_id, foto_id) values ($1,'40000000-0000-0000-0000-000000000002')`, [lhpSatu]))
  cek('U-LHP-19', 'Foto dari SPT LAIN ditolak (bukan berasal dari SPT yang sama)', e !== null)
})

// =====================================================================
// finalkan_lhp — penguncian + notifikasi Panit/Kanit unit terkait
// =====================================================================

await sebagai(ID.anggota2, async () => {
  const e = await galat(() => db.query(`select public.finalkan_lhp($1)`, [lhpSatu]))
  cek('U-LHP-20', 'Bukan pemilik tidak dapat memfinalkan LHP orang lain', e !== null)
})

await komit(ID.anggota1, async () => {
  await db.query(`select public.finalkan_lhp($1)`, [lhpSatu])
})
cek('U-LHP-21', 'LHP berstatus final setelah difinalkan',
  (await db.query(`select status from public.lhp where id=$1`, [lhpSatu])).rows[0].status === 'final')

await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(`update public.lhp set kesimpulan='Ubah paksa' where id=$1`, [lhpSatu]))
  cek('U-LHP-22', 'LHP yang sudah final TIDAK dapat diubah lagi (LHP_TERKUNCI)', e?.includes('LHP_TERKUNCI'))
})
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `insert into public.lhp_saksi (lhp_id, nama) values ($1,'Saksi Setelah Final')`, [lhpSatu]))
  cek('U-LHP-23', 'Tabel anak juga terkunci setelah induk final', e !== null)
})

const penerimaFinal = (await db.query(
  `select penerima_id from public.notifikasi where jenis='lhp_difinalkan' order by penerima_id`)).rows.map(r => r.penerima_id)
cek('U-LHP-24', 'Panit unit terkait menerima notifikasi LHP difinalkan (BR-72 lewat penerima_pengawas_spt)',
  penerimaFinal.includes(ID.panit1))
cek('U-LHP-25', 'Kanit unit terkait menerima notifikasi LHP difinalkan',
  penerimaFinal.includes(ID.kanit1))
cek('U-LHP-26', 'Anggota penyusun sendiri TIDAK menerima notifikasi atas perbuatannya (BR-74)',
  !penerimaFinal.includes(ID.anggota1))
cek('U-LHP-27', 'Kanit unit lain TIDAK ikut menerima notifikasi',
  !penerimaFinal.includes(ID.kanit2))

const e28 = await galat(() => db.query(`select public.finalkan_lhp($1)`, [lhpSatu]))
cek('U-LHP-28', 'LHP yang sudah final tidak dapat difinalkan ulang', e28 !== null)

console.log(gagal === 0
  ? `\n== ${lulus} butir uji LHP lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
