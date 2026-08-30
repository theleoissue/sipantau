// Uji fungsional siklus hidup SPT yang baru dibangun (migrasi 0023-0026):
// penjaga transisi status, empat syarat terbit, anti-race pencabutan,
// dan seluruh fungsi tindakan. Yang dikejar terutama: syarat yang
// melintasi empat tabel (BR-33) benar-benar tertegakkan di basis data,
// bukan hanya di antarmuka yang belum dibangun sama sekali.

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
  panit2:   '00000000-0000-0000-0000-000000000009',
  anggota1: '00000000-0000-0000-0000-000000000004',
  anggota2: '00000000-0000-0000-0000-000000000005',
  pemel:    '00000000-0000-0000-0000-000000000006',
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
    ('${ID.kasubdit}'),('${ID.kanit1}'),('${ID.kanit2}'),('${ID.panit1}'),('${ID.panit2}'),
    ('${ID.anggota1}'),('${ID.anggota2}'),('${ID.pemel}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi,aktif) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false,true),
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false,true),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false,true),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false,true),
    ('${ID.panit2}','Panit Dua','0000009','0000009@sipantau.internal','panit','${UNIT.satu}',false,true),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.satu}',false,true),
    ('${ID.pemel}','Pemeliharaan','0000006','0000006@sipantau.internal','pemeliharaan',null,false,true);
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
  // rollback-on-throw WAJIB: tanpa ini, galat di dalam fn() meninggalkan
  // transaksi terbuka dalam keadaan aborted, dan SETIAP kueri berikutnya
  // (termasuk di luar fungsi ini) ikut gagal dengan "current transaction
  // is aborted" — bukan galat asli yang sedang diuji.
  try {
    const hasil = await fn()
    await db.exec('commit')
    return hasil
  } catch (e) {
    await db.exec('rollback')
    throw e
  }
}
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)
async function galat(fn) {
  try { await fn(); return null } catch (e) { return e.message }
}

// =====================================================================
// Draf baru, kosong sama sekali — dasar pengujian syarat terbit
// =====================================================================
let sptKosong = 0
async function buatDrafKosong() {
  sptKosong++
  const id = `30000000-0000-0000-0000-${String(sptKosong).padStart(12, '0')}`
  await db.query(
    `insert into public.penugasan (id,judul,unit_id,status,diterbitkan_oleh)
     values ($1,'Draf Uji','${UNIT.satu}','draf','${ID.kanit1}')`, [id])
  return id
}

// U-SIK-01 — terbit ditolak, seluruh empat syarat disebutkan sekaligus
{
  const id = await buatDrafKosong()
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.terbitkan_draf($1)`, [id])))
  cek('U-SIK-01', 'Terbit ditolak dan menyebutkan SELURUH syarat yang kurang sekaligus',
    e !== null
    && e.includes('nomor SPT') && e.includes('dasar penugasan')
    && e.includes('titik lokasi berkoordinat') && e.includes('Panit Penanggung Jawab')
    && e.includes('pelaksana berperan Anggota'))
}

// U-SIK-02 — lengkapi satu per satu, sisanya tetap ditolak
{
  const id = await buatDrafKosong()
  await db.query(`update public.penugasan set nomor_spt=$1 where id=$2`,
    [`SP.Uji/${sptKosong}/VIII/2026`, id])
  await db.query(`insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
                  values ($1,'laporan_informasi','LI/1','2026-08-01')`, [id])
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.terbitkan_draf($1)`, [id])))
  cek('U-SIK-02', 'Dua syarat terpenuhi, dua sisanya (lokasi & Panit & Anggota) masih ditolak',
    e !== null && e.includes('titik lokasi berkoordinat') && e.includes('Panit Penanggung Jawab')
    && !e.includes('nomor SPT') && !e.includes('dasar penugasan'))
}

// U-SIK-03 — lengkap penuh, terbit berhasil
let sptUtuh
{
  sptUtuh = await buatDrafKosong()
  await db.exec(`
    update public.penugasan set nomor_spt='SP.Uji/${sptKosong}/VIII/2026' where id='${sptUtuh}';
    insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
      values ('${sptUtuh}','laporan_informasi','LI/1','2026-08-01');
    insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
      values ('${sptUtuh}',1,'Lokasi Uji',-6.9,107.6,300);
    insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
      values ('${sptUtuh}','${ID.panit1}','${ID.kanit1}');
    insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
      values ('${sptUtuh}','${ID.anggota1}',1,now());
  `)
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.terbitkan_draf($1)`, [sptUtuh])))
  cek('U-SIK-03', 'Empat syarat lengkap: terbit berhasil',
    e === null && await n(`select count(*) n from public.penugasan where id=$1 and status='baru'`, [sptUtuh]) === 1)
}

// U-SIK-04 — Kanit unit lain tidak dapat menerbitkan draf unit ini
{
  const id = await buatDrafKosong()
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit2, () =>
    db.query(`select public.terbitkan_draf($1)`, [id])))
  cek('U-SIK-04', 'Kanit unit lain tidak dapat menerbitkan draf unit ini',
    e !== null && e.includes('TIDAK_DITEMUKAN'))
}

// =====================================================================
// Penjaga transisi status
// =====================================================================
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.batalkan_spt($1, 'Uji pembatalan')`, [sptUtuh])
})
{
  const e = await galat(() => db.query(
    `update public.penugasan set status='berjalan' where id=$1`, [sptUtuh]))
  cek('U-SIK-05', 'SPT dibatalkan TIDAK PERNAH dapat dibuka kembali dalam bentuk apa pun (KP-6.2-51)',
    e !== null && e.includes('TRANSISI_STATUS_TIDAK_SAH'))
}
{
  const e = await galat(() => db.query(
    `update public.penugasan set status='selesai' where id=$1`, [sptUtuh]))
  cek('U-SIK-05b', 'SPT dibatalkan tidak dapat berpindah ke status mana pun',
    e !== null && e.includes('TRANSISI_STATUS_TIDAK_SAH'))
}

// =====================================================================
// Susunan tim: syarat minimum bertahan + anti-race (Bagian 6)
// =====================================================================
let sptTim
{
  sptTim = await buatDrafKosong()
  // Anak-anak WAJIB disisipkan SEBELUM status berpindah ke baru — trg_
  // periksa_syarat_terbit menilai keadaan PADA SAAT transisi, bukan di
  // akhir batch. Membalik urutan ini membuat pemicu yang sedang diuji
  // di bagian lain (Bagian 2) ikut menolak transisi ini juga, padahal
  // uji di sini menyasar Bagian 6.
  await db.exec(`
    insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
      values ('${sptTim}','laporan_informasi','LI/2','2026-08-01');
    insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
      values ('${sptTim}',1,'Lokasi Tim',-6.9,107.6,300);
    insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
      values ('${sptTim}','${ID.panit1}','${ID.kanit1}');
    insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
      values ('${sptTim}','${ID.anggota1}',1,now());
    update public.penugasan set nomor_spt='SP.Tim/${sptKosong}/VIII/2026', status='baru', diterbitkan_pada=now() where id='${sptTim}';
  `)
}

{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.cabut_panit((select id from public.penugasan_panit where penugasan_id=$1), 'Rotasi')`, [sptTim])))
  cek('U-SIK-06', 'Mencabut Panit SATU-SATUNYA ditolak (KP-6.2-25)',
    e !== null && e.includes('PANIT_TERAKHIR'))
}
{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.cabut_pelaksana((select id from public.penugasan_pelaksana where penugasan_id=$1), 'Rotasi')`, [sptTim])))
  cek('U-SIK-07', 'Mencabut pelaksana Anggota SATU-SATUNYA ditolak (KP-6.2-26)',
    e !== null && e.includes('PELAKSANA_ANGGOTA_TERAKHIR'))
}

// Tambah cadangan, sekarang pencabutan berhasil
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.tunjuk_panit($1, $2)`, [sptTim, ID.panit2])
  await db.query(`select public.tambah_pelaksana($1, $2)`, [sptTim, ID.anggota2])
})
{
  const r = await sebagaiTanpaRollback(ID.kanit1, () =>
    galat(() => db.query(
      `select public.cabut_panit((select id from public.penugasan_panit where penugasan_id=$1 and panit_id=$2), 'Rotasi')`,
      [sptTim, ID.panit1])))
  cek('U-SIK-08', 'Dengan cadangan, pencabutan Panit berhasil',
    r === null && await n(`select count(*) n from public.penugasan_panit where penugasan_id=$1 and dicabut_pada is null`, [sptTim]) === 1)
}

// U-SIK-09 — dasar/lokasi terakhir tidak dapat dihapus pada SPT terbit
{
  const e = await galat(() => db.query(
    `delete from public.penugasan_dasar where penugasan_id=$1`, [sptTim]))
  cek('U-SIK-09', 'Dasar penugasan SATU-SATUNYA tidak dapat dihapus (Bagian 6.4)',
    e !== null && e.includes('DASAR_PENUGASAN_TERAKHIR'))
}
{
  const e = await galat(() => db.query(
    `delete from public.penugasan_lokasi where penugasan_id=$1`, [sptTim]))
  cek('U-SIK-10', 'Titik lokasi berkoordinat SATU-SATUNYA tidak dapat dihapus',
    e !== null && e.includes('LOKASI_BERKOORDINAT_TERAKHIR'))
}
{
  const e = await galat(() => db.query(
    `update public.penugasan_lokasi set lat=null, lng=null where penugasan_id=$1`, [sptTim]))
  cek('U-SIK-11', 'Mengosongkan koordinat titik terakhir ditolak sama seperti menghapusnya',
    e !== null && e.includes('LOKASI_BERKOORDINAT_TERAKHIR'))
}

// =====================================================================
// Bermasalah dan pengembaliannya
// =====================================================================
{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit2, () =>
    db.query(`select public.tandai_spt_bermasalah($1,'lainnya','Uji')`, [sptTim])))
  cek('U-SIK-12', 'Kanit unit LAIN (bukan tim SPT ini) tidak dapat menandai bermasalah',
    e !== null && e.includes('BUKAN_TIM'))
}
await sebagaiTanpaRollback(ID.panit2, async () => {
  await db.query(`select public.tandai_spt_bermasalah($1,'kendala_keamanan','Situasi tidak aman')`, [sptTim])
})
cek('U-SIK-13', 'Panit Penanggung Jawab aktif dapat menandai bermasalah',
  (await db.query(`select status, jenis_masalah from public.penugasan where id=$1`, [sptTim])).rows[0].status === 'bermasalah')

{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.kembalikan_dari_bermasalah($1, '')`, [sptTim])))
  cek('U-SIK-14', 'Kembalikan dari bermasalah tanpa alasan ditolak',
    e !== null && e.includes('ALASAN_WAJIB'))
}
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.kembalikan_dari_bermasalah($1, 'Sudah aman')`, [sptTim])
})
cek('U-SIK-15', 'Kembalikan dari bermasalah dengan alasan berhasil, status ke berjalan',
  (await db.query(`select status from public.penugasan where id=$1`, [sptTim])).rows[0].status === 'berjalan')

// =====================================================================
// Perpanjangan batas waktu — riwayat permanen
// =====================================================================
await db.query(`update public.penugasan set tanggal_batas = current_date + 3 where id=$1`, [sptTim])
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.perpanjang_batas($1, current_date + 10, 'Perkara meluas')`, [sptTim])
})
cek('U-SIK-16', 'Perpanjangan tercatat permanen di penugasan_perpanjangan',
  await n(`select count(*) n from public.penugasan_perpanjangan where penugasan_id=$1`, [sptTim]) === 1)

// =====================================================================
// penugasan_tampil — BR-64: bukan current_date polos (docs/01-koreksi.md J.3)
// =====================================================================
let sptLewatBatas
{
  sptLewatBatas = await buatDrafKosong()
  await db.exec(`
    insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
      values ('${sptLewatBatas}','laporan_informasi','LI/3','2026-08-01');
    insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
      values ('${sptLewatBatas}',1,'Lokasi Lewat Batas',-6.9,107.6,300);
    insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
      values ('${sptLewatBatas}','${ID.panit1}','${ID.kanit1}');
    insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
      values ('${sptLewatBatas}','${ID.anggota1}',1,now());
    update public.penugasan set nomor_spt='SP.Lewat/${sptKosong}/VIII/2026', status='baru',
      diterbitkan_pada=now(), tanggal_batas = (now() at time zone 'Asia/Jakarta')::date - 1,
      diterbitkan_oleh='${ID.kanit1}'
      where id='${sptLewatBatas}';
  `)
}
cek('U-SIK-17', 'penugasan_tampil menandai lewat_batas memakai zona Asia/Jakarta, bukan current_date server',
  (await db.query(`select lewat_batas, hari_terlampaui from public.penugasan_tampil where id=$1`, [sptLewatBatas]))
    .rows[0].lewat_batas === true)

// =====================================================================
// kerja_periksa_lewat_batas — mengirim sekali, tidak berulang
// =====================================================================
await db.query(`select public.kerja_periksa_lewat_batas()`)
cek('U-SIK-18', 'Pekerjaan Lewat Batas mengirim pemberitahuan ke Kanit penerbit',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1 and jenis='spt_lewat_batas' and penugasan_id=$2`,
    [ID.kanit1, sptLewatBatas]) === 1)

await db.query(`select public.kerja_periksa_lewat_batas()`)
cek('U-SIK-19', 'Pekerjaan yang sama dijalankan lagi TIDAK mengirim pemberitahuan kedua',
  await n(`select count(*) n from public.notifikasi where penerima_id=$1 and jenis='spt_lewat_batas' and penugasan_id=$2`,
    [ID.kanit1, sptLewatBatas]) === 1)

await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.perpanjang_batas($1, current_date + 5, 'Perpanjangan uji')`, [sptLewatBatas])
})
cek('U-SIK-20', 'Perpanjangan batas mengosongkan penanda supaya lewat batas berikutnya tetap memberi tahu',
  (await db.query(`select lewat_batas_diberitahukan_pada from public.penugasan where id=$1`, [sptLewatBatas]))
    .rows[0].lewat_batas_diberitahukan_pada === null)

// =====================================================================
// Penutupan, pembatalan, buka kembali
// =====================================================================
let sptTutup
{
  sptTutup = await buatDrafKosong()
  await db.exec(`
    insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
      values ('${sptTutup}','laporan_informasi','LI/4','2026-08-01');
    insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
      values ('${sptTutup}',1,'Lokasi Tutup',-6.9,107.6,300);
    insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
      values ('${sptTutup}','${ID.panit1}','${ID.kanit1}');
    insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
      values ('${sptTutup}','${ID.anggota1}',1,now());
    update public.penugasan set nomor_spt='SP.Tutup/${sptKosong}/VIII/2026', status='baru', diterbitkan_pada=now() where id='${sptTutup}';
  `)
}
{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.tutup_spt($1)`, [sptTutup])))
  cek('U-SIK-21', 'Tutup SPT tanpa berkas surat ditolak (BR-25, chk_spt_selesai_wajib_berkas)',
    e !== null)
}
await db.query(`update public.penugasan set berkas_surat_path='surat.pdf' where id=$1`, [sptTutup])
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.tutup_spt($1)`, [sptTutup])
})
cek('U-SIK-22', 'Tutup SPT dengan berkas surat berhasil, status selesai',
  (await db.query(`select status from public.penugasan where id=$1`, [sptTutup])).rows[0].status === 'selesai')

{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit2, () =>
    db.query(`select public.buka_kembali_spt($1, 'Uji')`, [sptTutup])))
  cek('U-SIK-23', 'Kanit unit LAIN tidak dapat membuka kembali SPT ini',
    e !== null && e.includes('TIDAK_DITEMUKAN'))
}
await sebagaiTanpaRollback(ID.kasubdit, async () => {
  await db.query(`select public.buka_kembali_spt($1, 'Ditemukan kekurangan data')`, [sptTutup])
})
cek('U-SIK-24', 'Kasubdit dapat membuka kembali SPT selesai (KP-6.2-50)',
  (await db.query(`select status from public.penugasan where id=$1`, [sptTutup])).rows[0].status === 'berjalan')

// =====================================================================
// Penghapusan permanen — hanya bila belum pernah ada kegiatan
// =====================================================================
let sptHapus
{
  sptHapus = await buatDrafKosong()
}
await sebagaiTanpaRollback(ID.kanit1, async () => {
  await db.query(`select public.hapus_spt_permanen($1)`, [sptHapus])
})
cek('U-SIK-25', 'Draf tanpa kegiatan sama sekali dapat dihapus permanen (KP-6.2-48)',
  await n(`select count(*) n from public.penugasan where id=$1`, [sptHapus]) === 0)

// anggota1 sudah dicantumkan sebagai pelaksana sptTutup sejak
// penyusunannya di atas (syarat terbit menuntutnya).
await db.query(`
  insert into public.laporan_harian
    (penugasan_id, pelapor_id, jenis, uraian, penanda_perangkat, alasan_lokasi)
  values ($1, $2, 'perkembangan', 'Uji kegiatan', 'android-uji', 'gps_tidak_tertangkap')
`, [sptTutup, ID.anggota1])
{
  const e = await galat(() => sebagaiTanpaRollback(ID.kanit1, () =>
    db.query(`select public.hapus_spt_permanen($1)`, [sptTutup])))
  cek('U-SIK-26', 'SPT yang sudah punya kegiatan (laporan) TIDAK dapat dihapus permanen',
    e !== null && e.includes('SUDAH_ADA_KEGIATAN'))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji siklus SPT lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
