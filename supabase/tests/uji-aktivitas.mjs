// Uji klasifikasi aktivitas Titik (migrasi 0057).
//
// Dua hal yang dikejar: ambangnya benar, dan tampilannya TIDAK menembus
// RLS. Yang kedua itu kesalahan yang menurut CLAUDE.md §11 sudah dua
// kali terjadi pada PRD ini — tampilan tanpa security_invoker melewati
// seluruh aturan akses baris tanpa satu pun galat.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kanit1:   '00000000-0000-0000-0000-000000000002',
  kanit2:   '00000000-0000-0000-0000-000000000007',
  anggota1: '00000000-0000-0000-0000-000000000004',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
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
  insert into auth.users (id) values ('${ID.kanit1}'),('${ID.kanit2}'),('${ID.anggota1}');
  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);
  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false);
  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh)
  values ('${SPT.a}','SP.Gas.Lidik/9/IX/RES.5.3/2026/Ditreskrimsus','Uji Aktivitas','${UNIT.satu}','berjalan','${ID.kanit1}');
  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.a}','${ID.anggota1}',1,now());
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
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)

// ---------------------------------------------------------------------
// Ambang
// ---------------------------------------------------------------------
const aktivitas = async mps =>
  (await db.query(`select public.aktivitas_dari_kecepatan($1) a`, [mps])).rows[0].a

cek('U-AKT-01', 'Nyaris tidak bergerak dibaca sebagai diam', await aktivitas(0.2) === 'diam')
cek('U-AKT-02', 'Kecepatan langkah kaki dibaca sebagai berjalan', await aktivitas(1.3) === 'berjalan')
cek('U-AKT-03', 'Kecepatan kendaraan dibaca sebagai berkendara', await aktivitas(12) === 'berkendara')
cek('U-AKT-04', 'Tepat di ambang bawah berjalan (0,5) bukan lagi diam', await aktivitas(0.5) === 'berjalan')
cek('U-AKT-05', 'Tepat di ambang bawah berkendara (2,8) bukan lagi berjalan', await aktivitas(2.8) === 'berkendara')
cek('U-AKT-06', 'Kecepatan yang tidak diketahui tidak ditebak', await aktivitas(null) === 'tidak_diketahui')

// ---------------------------------------------------------------------
// Kecepatan yang DITURUNKAN saat perangkat tidak melaporkannya
// ---------------------------------------------------------------------
let idSesi
await (async () => {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: ID.anggota1, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.a, -6.9, 107.6, 8, 'android-akt'])
  idSesi = r.rows[0].id
  await db.exec('commit')
})()

// Titik kedua: 300 meter dalam 30 detik = 10 m/s, TANPA kecepatan
// dilaporkan. Kalau penurunan jarak/waktu tidak jalan, ini akan terbaca
// 'tidak_diketahui' dan seluruh Titik dari peramban ikut tak terklasifikasi.
await db.query(
  `insert into public.location_logs
     (sesi_tugas_id, penugasan_id, pengguna_id, lat, lng, akurasi_meter,
      kecepatan_mps, sumber_lokasi, antrean_id, direkam_pada, penanda_perangkat, penanda_perangkat_asal)
   select $1, penugasan_id, pengguna_id, -6.9027, 107.6, 8, null, 'gps',
          gen_random_uuid(), (select dibuka_pada from public.sesi_tugas where id=$1) + interval '30 seconds',
          'android-akt', 'android-akt'
     from public.sesi_tugas where id=$1`, [idSesi])

{
  const b = (await db.query(
    `select aktivitas, kecepatan_efektif_mps from public.titik_aktivitas
      where sesi_tugas_id=$1 order by direkam_pada desc limit 1`, [idSesi])).rows[0]
  cek('U-AKT-07', 'Kecepatan diturunkan dari jarak dan waktu saat perangkat diam soal itu',
    b.kecepatan_efektif_mps != null && Number(b.kecepatan_efektif_mps) > 8)
  cek('U-AKT-08', 'Perpindahan 300 m dalam 30 detik terbaca berkendara', b.aktivitas === 'berkendara')
}

// Titik pertama tidak punya pembanding sebelumnya — tidak boleh ditebak.
cek('U-AKT-09', 'Titik pertama sesi tidak diklasifikasi karena tidak ada pembanding',
  await n(`select count(*) n from public.titik_aktivitas
            where sesi_tugas_id=$1 and aktivitas='tidak_diketahui'`, [idSesi]) === 1)

// ---------------------------------------------------------------------
// Titik diragukan tetap tampil, tetapi tidak diklasifikasi
// ---------------------------------------------------------------------
await db.query(
  `insert into public.location_logs
     (sesi_tugas_id, penugasan_id, pengguna_id, lat, lng, akurasi_meter, kecepatan_mps,
      sumber_lokasi, diragukan_sebab, antrean_id, direkam_pada, penanda_perangkat, penanda_perangkat_asal)
   select $1, penugasan_id, pengguna_id, -6.95, 107.65, 120, 1.2, 'gps', 'akurasi_buruk',
          gen_random_uuid(), (select dibuka_pada from public.sesi_tugas where id=$1) + interval '60 seconds',
          'android-akt', 'android-akt'
     from public.sesi_tugas where id=$1`, [idSesi])

cek('U-AKT-10', 'Titik diragukan TETAP tampil — ia bukti, bukan sampah',
  await n(`select count(*) n from public.titik_aktivitas where sesi_tugas_id=$1`, [idSesi]) === 3)
cek('U-AKT-11', 'Titik diragukan tidak diklasifikasi walau kecepatannya dilaporkan',
  await n(`select count(*) n from public.titik_aktivitas
            where sesi_tugas_id=$1 and akurasi_meter=120 and aktivitas='tidak_diketahui'`, [idSesi]) === 1)

// ---------------------------------------------------------------------
// RLS — tampilan TIDAK boleh menembus batas unit (CLAUDE.md §5.2, §11)
// ---------------------------------------------------------------------
await sebagai(ID.kanit1, async () => {
  cek('U-AKT-12', 'Kanit unit pemilik melihat titik aktivitas unitnya',
    await n(`select count(*) n from public.titik_aktivitas where sesi_tugas_id=$1`, [idSesi]) === 3)
})
await sebagai(ID.kanit2, async () => {
  cek('U-AKT-13', 'Kanit UNIT LAIN tidak melihat satu pun — security_invoker bekerja',
    await n(`select count(*) n from public.titik_aktivitas where sesi_tugas_id=$1`, [idSesi]) === 0)
})

console.log(gagal === 0
  ? `\n== ${lulus} butir uji aktivitas Titik lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
