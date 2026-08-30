// Uji fungsional Modul 6.3 — Pelaporan Kegiatan Harian.
//
// Yang dikejar terutama: perhitungan lokasi PostGIS (tiruan Haversine
// di stub.sql), pembekuan kolom fakta, penguncian ganda (persetujuan +
// penutupan SPT), larangan meninjau laporan sendiri, dan kebocoran
// rekap_laporan_tim lintas unit.

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
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
const SPT = { a: '20000000-0000-0000-0000-000000000001' }
// Bandara Kertajati, Majalengka.
const TITIK = { lat: -6.6489, lng: 108.1689, radius: 300 }

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
    ('${ID.kasubdit}'),('${ID.kanit1}'),('${ID.kanit2}'),
    ('${ID.panit1}'),('${ID.anggota1}'),('${ID.anggota2}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false),
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.dua}',false);

  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT.a}','SP.Gas.Lidik/1/VIII/RES.5.3/2026/Ditreskrimsus','Penyelidikan A','${UNIT.satu}','berjalan','${ID.kanit1}',now(),current_date,current_date+7);

  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.a}','${ID.panit1}','${ID.kanit1}');

  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan)
  values ('${SPT.a}','${ID.anggota1}',1);

  insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
  values ('${SPT.a}',1,'Bandara Kertajati',${TITIK.lat},${TITIK.lng},${TITIK.radius});
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
async function sebagaiTanpaRollback(uid, fn) {
  await db.exec('begin')
  await db.query(`select set_config('request.jwt.claims',$1,true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' })])
  await db.exec('set local role authenticated')
  const hasil = await fn()
  await db.exec('commit')
  return hasil
}
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)

// =====================================================================
// Perhitungan lokasi (Celah 1)
// =====================================================================

// Titik dalam radius 300m dari Bandara Kertajati.
let idLaporanDalam
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`
    insert into public.laporan_harian
      (penugasan_id, pelapor_id, jenis, uraian, lokasi_lat, lokasi_lng, penanda_perangkat)
    values ($1,$2,'perkembangan','Uji lokasi dalam radius',$3,$4,'uji-1')
    returning id, status_lokasi, jarak_meter, lokasi_id_terdekat`,
    [SPT.a, ID.anggota1, TITIK.lat + 0.001, TITIK.lng]) // ~111m
  idLaporanDalam = r.rows[0].id
  cek('U-LAP-01', 'Koordinat dalam radius -> status terverifikasi', r.rows[0].status_lokasi === 'terverifikasi')
  cek('U-LAP-02', 'lokasi_id_terdekat terisi otomatis', r.rows[0].lokasi_id_terdekat !== null)
  cek('U-LAP-03', 'jarak_meter masuk akal (~100-150m)', r.rows[0].jarak_meter > 50 && r.rows[0].jarak_meter < 200)
})

// Titik jauh (>300m) dari satu-satunya Titik Lokasi.
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`
    insert into public.laporan_harian
      (penugasan_id, pelapor_id, jenis, uraian, lokasi_lat, lokasi_lng, penanda_perangkat)
    values ($1,$2,'perkembangan','Uji lokasi di luar radius',$3,$4,'uji-1')
    returning status_lokasi`,
    [SPT.a, ID.anggota1, TITIK.lat + 0.05, TITIK.lng]) // ~5.5km
  cek('U-LAP-04', 'Koordinat jauh -> status di_luar_titik (BUKAN ditolak, BR-03)', r.rows[0].status_lokasi === 'di_luar_titik')
})

// Tanpa koordinat -> wajib alasan.
await sebagai(ID.anggota1, async () => {
  let ditolak = false
  try {
    await db.query(`
      insert into public.laporan_harian (penugasan_id, pelapor_id, jenis, uraian, penanda_perangkat)
      values ($1,$2,'perkembangan','Tanpa alasan lokasi','uji-1')`, [SPT.a, ID.anggota1])
  } catch { ditolak = true }
  cek('U-LAP-05', 'Tanpa koordinat WAJIB alasan_lokasi (constraint)', ditolak)
})

let idLaporanTanpaLokasi
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`
    insert into public.laporan_harian
      (penugasan_id, pelapor_id, jenis, uraian, alasan_lokasi, penanda_perangkat)
    values ($1,$2,'perkembangan','Sinyal hilang di dalam gedung','gps_tidak_tertangkap','uji-1')
    returning id, status_lokasi`, [SPT.a, ID.anggota1])
  idLaporanTanpaLokasi = r.rows[0].id
  cek('U-LAP-06', 'Laporan TANPA koordinat tetap DITERIMA, ditandai tidak_terekam (BR-03)',
    r.rows[0].status_lokasi === 'tidak_terekam')
})

// =====================================================================
// Pembekuan kolom fakta (Celah 4)
// =====================================================================

// METODE: sebagai() melakukan rollback otomatis, jadi kalau dipakai di
// sini pemeriksaan SETELAHNYA akan selalu melihat nilai lama TANPA
// membuktikan pemicunya benar-benar menolak — transaksi mana pun yang
// di-rollback pasti kembali ke nilai lama, terlepas dari trigger bekerja
// atau tidak. UPDATE-nya wajib benar-benar di-COMMIT dulu, baru
// diperiksa apakah kolomnya ikut berubah atau tetap beku
// (supabase/tests/uji-penugasan.mjs sudah pernah mencatat jebakan yang
// sama persis untuk UPDATE yang ditolak RLS; ini versinya untuk UPDATE
// yang ditolak PEMICU).
const lokasiLatAsli = Number(
  (await db.query(`select lokasi_lat from public.laporan_harian where id=$1`, [idLaporanDalam])).rows[0].lokasi_lat)

await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(`update public.laporan_harian set lokasi_lat = -99 where id = $1`, [idLaporanDalam])
})
cek('U-LAP-07', 'lokasi_lat TIDAK dapat diubah pelapor sendiri sekalipun (beku)',
  Number((await db.query(`select lokasi_lat from public.laporan_harian where id=$1`, [idLaporanDalam])).rows[0].lokasi_lat) === lokasiLatAsli)

await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(`update public.laporan_harian set uraian = 'Diubah pelapor' where id = $1`, [idLaporanDalam])
})
cek('U-LAP-08', 'uraian (narasi manusia) DAPAT disunting pelapor',
  (await db.query(`select uraian from public.laporan_harian where id=$1`, [idLaporanDalam])).rows[0].uraian === 'Diubah pelapor')

cek('U-LAP-09', 'jumlah_suntingan bertambah saat isi berubah',
  Number((await db.query(`select jumlah_suntingan n from public.laporan_harian where id=$1`, [idLaporanDalam])).rows[0].n) === 1)

// =====================================================================
// Penguncian (Celah 2)
// =====================================================================

await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.setujui_laporan($1)`, [idLaporanDalam])
})
cek('U-LAP-10', 'Kanit dapat menyetujui laporan',
  (await db.query(`select status_laporan from public.laporan_harian where id=$1`, [idLaporanDalam])).rows[0].status_laporan === 'disetujui')

await sebagai(ID.anggota1, async () => {
  let ditolak = false
  try {
    await db.query(`update public.laporan_harian set uraian='coba ubah' where id=$1`, [idLaporanDalam])
  } catch { ditolak = true }
  cek('U-LAP-11', 'Laporan yang SUDAH DISETUJUI tidak dapat disunting siapa pun', ditolak)
})

// =====================================================================
// Larangan meninjau laporan sendiri (Celah 6, BR-31/BR-28)
// =====================================================================

await sebagai(ID.anggota1, async () => {
  let ditolak = false
  try {
    await db.query(`
      insert into public.catatan_laporan (laporan_id, peninjau_id, isi)
      values ($1,$2,'Mencoba mengomentari laporan sendiri')`, [idLaporanTanpaLokasi, ID.anggota1])
  } catch { ditolak = true }
  cek('U-LAP-12', 'Pelapor TIDAK dapat memberi catatan pada laporannya sendiri', ditolak)
})

// Panit MEMBERI catatan pada laporan Anggota -> sah.
let idCatatan
await sebagaiTanpaRollback(ID.panit1, async () => {
  const r = await db.query(`
    insert into public.catatan_laporan (laporan_id, peninjau_id, isi)
    values ($1,$2,'Perbaiki uraiannya') returning id`, [idLaporanTanpaLokasi, ID.panit1])
  idCatatan = r.rows[0].id
})
cek('U-LAP-13', 'Panit DAPAT memberi catatan pada laporan pelaksana yang diawasinya',
  idCatatan !== undefined)

// =====================================================================
// Celah 5 — minta_perbaikan memindahkan status, lalu penyuntingan
// pelapor mengembalikannya
// =====================================================================

await sebagaiTanpaRollback(ID.panit1, async () => {
  await db.query(`
    insert into public.catatan_laporan (laporan_id, peninjau_id, jenis, isi)
    values ($1,$2,'minta_perbaikan','Uraian kurang jelas')`, [idLaporanTanpaLokasi, ID.panit1])
})
cek('U-LAP-14', 'minta_perbaikan memindahkan status laporan (Celah 5)',
  (await db.query(`select status_laporan from public.laporan_harian where id=$1`, [idLaporanTanpaLokasi])).rows[0].status_laporan === 'perlu_diperbaiki')

await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(`update public.laporan_harian set uraian='Sudah diperbaiki' where id=$1`, [idLaporanTanpaLokasi])
})
cek('U-LAP-15', 'Penyuntingan pelapor mengembalikan status ke terkirim',
  (await db.query(`select status_laporan from public.laporan_harian where id=$1`, [idLaporanTanpaLokasi])).rows[0].status_laporan === 'terkirim')

// =====================================================================
// Lingkup baca laporan_harian — sesama pelaksana TIDAK termasuk
// =====================================================================

await sebagai(ID.anggota2, async () => {
  cek('U-LAP-16', 'Anggota unit lain TIDAK membaca laporan Unit I',
    await n(`select count(*) n from public.laporan_harian where id=$1`, [idLaporanTanpaLokasi]) === 0)
})

// =====================================================================
// rekap_laporan_tim — hanya presensi, TIDAK bocor lintas unit
// =====================================================================

await sebagai(ID.anggota1, async () => {
  cek('U-LAP-17', 'Pelaksana SPT itu melihat presensi lewat rekap_laporan_tim',
    await n(`select count(*) n from public.rekap_laporan_tim where penugasan_id=$1`, [SPT.a]) >= 1)
})

await sebagai(ID.anggota2, async () => {
  cek('U-LAP-18', 'rekap_laporan_tim TIDAK bocor ke Anggota yang bukan pelaksana SPT itu',
    await n(`select count(*) n from public.rekap_laporan_tim where penugasan_id=$1`, [SPT.a]) === 0)
})

// =====================================================================
// v_belum_lapor
// =====================================================================

await sebagai(ID.kanit1, async () => {
  cek('U-LAP-19', 'Kanit membaca v_belum_lapor untuk unitnya (view menyala)',
    await n(`select count(*) n from public.v_belum_lapor`) >= 0)
})

console.log(`\n== ${lulus} lulus, ${gagal} gagal`)
process.exit(gagal === 0 ? 0 : 1)
