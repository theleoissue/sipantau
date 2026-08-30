// Uji fungsional Modul 6.9 (Notifikasi).
//
// Yang dikejar terutama: BR-68 (daftar tertutup), BR-69 (ikut lingkup
// PEMANTAUAN LANGSUNG, bukan riwayat — beda dari BR-21/BR-62 GPS),
// BR-74 (tidak pernah memberi tahu pelaku sendiri), EC-6.9-04 (dedup
// penerima ganda), dan bahwa SEMBILAN titik sambung di 0021 benar-benar
// menyisipkan baris, bukan sekadar tidak bergalat.

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
const SPT = { draf: '20000000-0000-0000-0000-000000000001' }

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

  -- SPT masih DRAF: menguji spt_diterbitkan + spt_ditugaskan bersamaan
  -- saat terbit (0021), bukan saat pelaksana disisipkan ke draf.
  -- nomor_spt, dasar, dan titik lokasi berkoordinat disertakan supaya
  -- trg_periksa_syarat_terbit (migrasi 0024) tidak menahan penerbitan
  -- di bawah — empat syarat minimumnya sungguh ditegakkan sekarang.
  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh)
  values ('${SPT.draf}','SP.Gas.Lidik/1/VIII/RES.5.3/2026/Ditreskrimsus','Uji Notifikasi','${UNIT.satu}','draf','${ID.kanit1}');

  insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
  values ('${SPT.draf}','laporan_informasi','LI/1/VIII/2026',current_date);

  insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
  values ('${SPT.draf}',1,'Bandara Kertajati',-6.649,108.169,300);

  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.draf}','${ID.panit1}','${ID.kanit1}');

  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.draf}','${ID.anggota1}',1,now());
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
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}
const jenisUntuk = async (penerima) =>
  (await db.query(`select jenis from public.notifikasi where penerima_id=$1 order by dibuat_pada`, [penerima])).rows.map(r => r.jenis)

// =====================================================================
// BR-68 — daftar tertutup
// =====================================================================
{
  const e = await galat(() => db.query(
    `insert into public.notifikasi (penerima_id, jenis, judul, tujuan_jenis)
     values ($1, 'jenis_karangan', 'x', 'tanpa_tujuan')`, [ID.anggota1]))
  cek('U-NTF-01', 'Jenis di luar daftar tertutup ditolak (BR-68)', e !== null)
}

// KP-6.9-30 / BR-72 — klien tidak dapat menyisipkan langsung
await sebagai(ID.anggota1, async () => {
  const e = await galat(() => db.query(
    `insert into public.notifikasi (penerima_id, jenis, judul, tujuan_jenis)
     values ($1, 'laporan_disetujui', 'Karangan', 'tanpa_tujuan')`, [ID.anggota1]))
  cek('U-NTF-02', 'Klien tidak dapat menyisipkan pemberitahuan langsung', e !== null)
})

// =====================================================================
// fn_buat_notifikasi — penyaringan inti (BR-74, KP-6.9-05/41, EC-6.9-04)
// =====================================================================
await db.query(`select public.fn_buat_notifikasi(
  'laporan_disetujui',
  array[$1::uuid, $2::uuid, $3::uuid, $1::uuid],
  'Uji', 'Uji isi', 'tanpa_tujuan', null, null, null, false, $2::uuid
)`, [ID.anggota1, ID.anggota2, ID.pemel])
// Penerima: anggota1 (dua kali, harus jadi satu — EC-6.9-04), anggota2
// (pelaku sendiri, harus disaring — BR-74), pemel (peran pemeliharaan,
// harus disaring — KP-6.9-41).
cek('U-NTF-03', 'Duplikat penerima jadi satu baris (EC-6.9-04)',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1 and judul='Uji'`, [ID.anggota1]) === 1)
cek('U-NTF-04', 'Pelaku sendiri tidak menerima pemberitahuan atas perbuatannya (BR-74)',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1 and judul='Uji'`, [ID.anggota2]) === 0)
cek('U-NTF-05', 'Akun Pemeliharaan tidak pernah menerima pemberitahuan (KP-6.9-41)',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1`, [ID.pemel]) === 0)

await db.query(`update public.users set aktif=false where id=$1`, [ID.anggota2])
await db.query(`select public.fn_buat_notifikasi(
  'laporan_disetujui', array[$1::uuid], 'Uji nonaktif', 'x', 'tanpa_tujuan', null, null, null, false, null
)`, [ID.anggota2])
cek('U-NTF-06', 'Akun nonaktif tidak menerima pemberitahuan (KP-6.9-05)',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1 and judul='Uji nonaktif'`, [ID.anggota2]) === 0)
await db.query(`update public.users set aktif=true where id=$1`, [ID.anggota2])

// =====================================================================
// RLS — lingkup baca dan tandai baca
// =====================================================================
await sebagai(ID.anggota1, async () => {
  cek('U-NTF-07', 'Pengguna hanya membaca pemberitahuan miliknya',
    await n(`select count(*) n from public.notifikasi where penerima_id <> $1`, [ID.anggota1]) === 0)
})

let idNotifAnggota2
await db.query(`select public.fn_buat_notifikasi(
  'laporan_disetujui', array[$1::uuid], 'Milik Anggota Dua', 'x', 'tanpa_tujuan', null, null, null, false, null
) `, [ID.anggota2])
idNotifAnggota2 = (await db.query(
  `select id from public.notifikasi where penerima_id=$1 and judul='Milik Anggota Dua'`, [ID.anggota2])).rows[0].id

await sebagai(ID.anggota1, async () => {
  const jml = await n(`update public.notifikasi set dibaca_pada=now() where id=$1 returning 1 as n`, [idNotifAnggota2])
    .catch(() => 0)
  cek('U-NTF-08', 'Pengguna TIDAK dapat menandai pemberitahuan orang lain (RLS)', jml === 0)
})

await sebagaiTanpaRollback(ID.anggota2, async () => {
  await db.query(`update public.notifikasi set dibaca_pada=now() where id=$1`, [idNotifAnggota2])
})
const dibacaPertama = (await db.query(`select dibaca_pada from public.notifikasi where id=$1`, [idNotifAnggota2])).rows[0].dibaca_pada

await sebagaiTanpaRollback(ID.anggota2, async () => {
  // Coba mengubah judul sekaligus mengubah dibaca_pada — keduanya
  // harus dilucuti pemicu, hanya baris yang tetap ada, tanpa galat.
  await db.query(
    `update public.notifikasi set judul='Diubah paksa', dibaca_pada=now()+interval '1 hour' where id=$1`,
    [idNotifAnggota2])
})
const setelah = (await db.query(`select judul, dibaca_pada from public.notifikasi where id=$1`, [idNotifAnggota2])).rows[0]
cek('U-NTF-09', 'Kolom selain dibaca_pada tidak dapat diubah pemiliknya sendiri',
  setelah.judul === 'Milik Anggota Dua')
cek('U-NTF-10', 'dibaca_pada TIDAK mundur/maju setelah pertama tercatat (KP-6.9-11)',
  new Date(setelah.dibaca_pada).getTime() === new Date(dibacaPertama).getTime())

// =====================================================================
// Modul 6.2 — penerbitan SPT: spt_diterbitkan (Panit) + spt_ditugaskan
// (pelaksana yang SUDAH tercantum sejak draf, disatukan saat terbit)
// =====================================================================
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`update public.penugasan set status='baru', diterbitkan_pada=now() where id=$1`, [SPT.draf])
})
cek('U-NTF-11', 'Panit menerima spt_diterbitkan saat SPT terbit',
  (await jenisUntuk(ID.panit1)).includes('spt_diterbitkan'))
cek('U-NTF-12', 'Pelaksana sejak draf menerima spt_ditugaskan bersamaan penerbitan',
  (await jenisUntuk(ID.anggota1)).includes('spt_ditugaskan'))

// Pelaksana BARU ditambahkan setelah SPT terbit -> spt_ditugaskan
// langsung (jalur kedua, KP-6.9 penambahan pasca-terbit).
await db.query(
  `insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
   values ('${SPT.draf}','${ID.anggota2}',2,now())`)
cek('U-NTF-13', 'Pelaksana yang ditambahkan SETELAH SPT terbit langsung menerima spt_ditugaskan',
  (await jenisUntuk(ID.anggota2)).includes('spt_ditugaskan'))

// spt_bermasalah — lewat tandai_spt_bermasalah (0025), bukan UPDATE
// mentah: chk_bermasalah_wajib_jenis_uraian (0023) sekarang menegakkan
// jenis dan uraian wajib terisi persis sesuai KP-6.2-32.
await sebagaiTanpaRollback(ID.anggota1, async () => {
  await db.query(`select public.tandai_spt_bermasalah($1,'kendala_keamanan','Uji kendala keamanan')`, [SPT.draf])
})
cek('U-NTF-14a', 'Kanit unit menerima spt_bermasalah',
  (await jenisUntuk(ID.kanit1)).includes('spt_bermasalah'))
cek('U-NTF-14b', 'Kasubdit menerima spt_bermasalah',
  (await jenisUntuk(ID.kasubdit)).includes('spt_bermasalah'))
cek('U-NTF-14c', 'Kanit unit LAIN tidak menerima spt_bermasalah',
  !(await jenisUntuk(ID.kanit2)).includes('spt_bermasalah'))

// spt_dicabut — hanya orang yang dicabut
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(
    `update public.penugasan_pelaksana set dicabut_pada=now(), dicabut_oleh=$1,
       alasan_pencabutan='Uji' where penugasan_id=$2 and pelaksana_id=$3`,
    [ID.kanit1, SPT.draf, ID.anggota2])
})
cek('U-NTF-15a', 'Pelaksana yang dicabut menerima spt_dicabut',
  (await jenisUntuk(ID.anggota2)).includes('spt_dicabut'))
cek('U-NTF-15b', 'Pelaksana LAIN yang tidak dicabut tidak ikut menerima spt_dicabut',
  !(await jenisUntuk(ID.anggota1)).includes('spt_dicabut'))

// spt_ditutup — pelaksana yang belum dicabut (anggota1, karena anggota2 sudah dicabut)
await db.query(`update public.penugasan set status='selesai', berkas_surat_path='x.pdf', ditutup_pada=now() where id=$1`, [SPT.draf])
cek('U-NTF-16a', 'Pelaksana aktif menerima spt_ditutup',
  (await jenisUntuk(ID.anggota1)).includes('spt_ditutup'))
cek('U-NTF-16b', 'Pelaksana yang SUDAH DICABUT sebelumnya tidak menerima spt_ditutup lagi (BR-69)',
  !(await jenisUntuk(ID.anggota2)).includes('spt_ditutup'))

// =====================================================================
// Modul 6.3 — laporan
// =====================================================================
await db.query(`update public.penugasan set status='berjalan' where id=$1`, [SPT.draf])
let idLaporan
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(
    `insert into public.laporan_harian
       (penugasan_id, pelapor_id, jenis, uraian, penanda_perangkat, lokasi_lat, lokasi_lng, akurasi_meter)
     values ($1,$2,'perkembangan','Uji laporan','android-uji',-6.9,107.6,10)
     returning id`, [SPT.draf, ID.anggota1])
  idLaporan = r.rows[0].id
})
cek('U-NTF-17', 'Panit dan Kanit menerima laporan_masuk',
  (await jenisUntuk(ID.panit1)).includes('laporan_masuk') && (await jenisUntuk(ID.kanit1)).includes('laporan_masuk'))
cek('U-NTF-17b', 'Pelapor sendiri TIDAK menerima laporan_masuk atas laporannya sendiri (BR-74)',
  !(await jenisUntuk(ID.anggota1)).includes('laporan_masuk'))

await sebagaiTanpaRollback(ID.panit1, async () => {
  await db.query(
    `insert into public.catatan_laporan (laporan_id, peninjau_id, jenis, isi)
     values ($1,$2,'catatan','Uji catatan biasa')`, [idLaporan, ID.panit1])
})
cek('U-NTF-18', 'Catatan biasa mengirim catatan_diberikan ke pelapor',
  (await jenisUntuk(ID.anggota1)).includes('catatan_diberikan'))

await sebagaiTanpaRollback(ID.panit1, async () => {
  await db.query(
    `insert into public.catatan_laporan (laporan_id, peninjau_id, jenis, isi)
     values ($1,$2,'minta_perbaikan','Uji minta perbaikan')`, [idLaporan, ID.panit1])
})
cek('U-NTF-19', 'minta_perbaikan mengirim laporan_perlu_diperbaiki ke pelapor',
  (await jenisUntuk(ID.anggota1)).includes('laporan_perlu_diperbaiki'))

await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.setujui_laporan($1)`, [idLaporan])
})
cek('U-NTF-20', 'Persetujuan laporan mengirim laporan_disetujui ke pelapor',
  (await jenisUntuk(ID.anggota1)).includes('laporan_disetujui'))

// =====================================================================
// Modul 6.4 — GPS: tiga jenis yang sejak 0016 ditunda, dipenuhi 0021
// =====================================================================
let idSesiKeluar
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.draf, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiKeluar = r.rows[0].id
  await db.query(`select public.catat_keluar()`)
})
cek('U-NTF-21', 'Keluar aplikasi saat sesi berjalan mengirim sesi_ditutup_keluar_aplikasi ke pengawas',
  (await jenisUntuk(ID.panit1)).includes('sesi_ditutup_keluar_aplikasi')
  && (await jenisUntuk(ID.kanit1)).includes('sesi_ditutup_keluar_aplikasi'))

let idSesiMenggantung
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.draf, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiMenggantung = r.rows[0].id
})
await db.query(
  `update public.sesi_tugas set titik_terakhir_pada = now() - interval '3 hours' where id=$1`,
  [idSesiMenggantung])
await db.query(`select public.kerja_tutup_sesi_menggantung()`)
cek('U-NTF-22', 'Sesi menggantung mengirim sesi_menggantung ke pemilik dan Kanit unit',
  (await jenisUntuk(ID.anggota1)).includes('sesi_menggantung')
  && (await jenisUntuk(ID.kanit1)).includes('sesi_menggantung'))

let idSesiIzin
await sebagaiTanpaRollback(ID.anggota1, async () => {
  const r = await db.query(`select * from public.buka_sesi_tugas($1,$2,$3,$4,$5)`,
    [SPT.draf, -6.9, 107.6, 10, 'android-hp-1'])
  idSesiIzin = r.rows[0].id
  await db.query(`select public.tandai_izin_lokasi_terputus($1)`, [idSesiIzin])
})
cek('U-NTF-23', 'Izin lokasi terputus mengirim izin_lokasi_terputus ke pengawas',
  (await jenisUntuk(ID.panit1)).includes('izin_lokasi_terputus')
  && (await jenisUntuk(ID.kanit1)).includes('izin_lokasi_terputus'))

// =====================================================================
// akun_dinonaktifkan — Kanit unit diberi tahu, dirinya sendiri tidak
// =====================================================================
await db.query(`update public.users set aktif=false where id=$1`, [ID.anggota1])
cek('U-NTF-24a', 'Kanit unit menerima akun_dinonaktifkan',
  (await jenisUntuk(ID.kanit1)).includes('akun_dinonaktifkan'))
await db.query(`update public.users set aktif=true where id=$1`, [ID.anggota1])

await db.query(`update public.users set aktif=false where id=$1`, [ID.kanit1])
// Kanit1 satu-satunya Kanit di Unit I, jadi query penerima (peran=kanit
// and unit_id=... and id<>new.id) sudah tidak mungkin memilihnya
// sendiri — diperiksa lewat tujuan_id (subjek yang dinonaktifkan),
// bukan jenisUntuk() mentah, supaya tidak keliru tertangkap baris
// U-NTF-24a (tentang Anggota Satu) yang sudah lebih dulu ada.
cek('U-NTF-24b', 'Kanit yang menonaktifkan DIRINYA SENDIRI tidak menerima pemberitahuan atas itu',
  await n(`select count(*) n from public.notifikasi
            where penerima_id=$1 and jenis='akun_dinonaktifkan' and tujuan_id=$1`, [ID.kanit1]) === 0)

// =====================================================================
// BR-71 — penyusutan: hanya yang sudah dibaca DAN tua yang hilang
//
// Baris DISISIPKAN LANGSUNG dengan dibaca_pada sudah lampau, bukan
// di-UPDATE dari baris yang sudah pernah dibaca — trg_notifikasi_hanya_
// tandai_baca (0019) mengunci dibaca_pada begitu pertama kali terisi
// (KP-6.9-11), jadi backdating lewat UPDATE pada baris idNotifAnggota2
// (sudah ditandai dibaca di U-NTF-08..10) akan diam-diam DIABAIKAN —
// itu perilaku BENAR di sana, bukan sesuatu yang harus dikalahkan di
// sini.
// =====================================================================
const idTuaSudahDibaca = (await db.query(
  `insert into public.notifikasi (penerima_id, jenis, judul, tujuan_jenis, dibaca_pada, dibuat_pada)
   values ($1, 'laporan_disetujui', 'Uji retensi lama', 'tanpa_tujuan',
           now() - interval '100 days', now() - interval '100 days')
   returning id`, [ID.anggota2])).rows[0].id
const idTuaBelumDibaca = (await db.query(
  `insert into public.notifikasi (penerima_id, jenis, judul, tujuan_jenis, dibuat_pada)
   values ($1, 'laporan_disetujui', 'Uji retensi belum dibaca', 'tanpa_tujuan', now() - interval '200 days')
   returning id`, [ID.anggota2])).rows[0].id

await db.query(`select public.kerja_susutkan_notifikasi()`)
cek('U-NTF-25', 'Pemberitahuan sudah dibaca dan berumur >90 hari disusutkan (BR-71)',
  await n(`select count(*) n from public.notifikasi where id=$1`, [idTuaSudahDibaca]) === 0)
cek('U-NTF-26', 'Pemberitahuan BELUM dibaca tidak pernah disusutkan berapa pun umurnya',
  await n(`select count(*) n from public.notifikasi where id=$1`, [idTuaBelumDibaca]) === 1)

console.log(gagal === 0
  ? `\n== ${lulus} butir uji Notifikasi lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
