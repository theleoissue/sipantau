// Uji fungsional lingkup data Modul 6.2.
//
// Yang dikejar terutama: rekursi RLS antara penugasan dan
// penugasan_pelaksana. Bug itu TIDAK muncul saat migrasi dipasang,
// hanya saat tabelnya dikueri — jadi menguji "migrasi lulus" saja
// tidak membuktikan apa pun.

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
  panitLain:'00000000-0000-0000-0000-000000000008',
  anggota1: '00000000-0000-0000-0000-000000000004',
  anggota2: '00000000-0000-0000-0000-000000000005',
  pemel:    '00000000-0000-0000-0000-000000000006',
  // Panit yang tidak pernah ditunjuk dan tidak pernah jadi pelaksana.
  panitKosong: '00000000-0000-0000-0000-000000000009',
}
const UNIT = { satu: '10000000-0000-0000-0000-000000000001',
               dua:  '10000000-0000-0000-0000-000000000002' }
const SPT = { terbit: '20000000-0000-0000-0000-000000000001',
              draf:   '20000000-0000-0000-0000-000000000002',
              unit2:  '20000000-0000-0000-0000-000000000003' }

const db = new PGlite()
await db.waitReady
await db.exec(readFileSync(join(import.meta.dirname, 'stub.sql'), 'utf8'))
for (const f of readdirSync(MIGRASI).filter(f => f.endsWith('.sql')).sort()) {
  await db.exec(readFileSync(join(MIGRASI, f), 'utf8')
    .replace(/create extension if not exists (postgis|pg_cron)[^;]*;/gi, ''))
}

await db.exec(`
  insert into auth.users (id) values
    ('${ID.kasubdit}'),('${ID.kanit1}'),('${ID.kanit2}'),('${ID.panit1}'),
    ('${ID.panitLain}'),('${ID.anggota1}'),('${ID.anggota2}'),('${ID.pemel}'),
    ('${ID.panitKosong}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false),
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.kanit2}','Kanit Dua','0000007','0000007@sipantau.internal','kanit','${UNIT.dua}',false),
    ('${ID.panit1}','Panit Satu','0000003','0000003@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.panitLain}','Panit Lain','0000008','0000008@sipantau.internal','panit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false),
    ('${ID.anggota2}','Anggota Dua','0000005','0000005@sipantau.internal','anggota','${UNIT.dua}',false),
    ('${ID.pemel}','Pemeliharaan','0000006','0000006@sipantau.internal','pemeliharaan',null,false),
    ('${ID.panitKosong}','Panit Tanpa Tugas','0000009','0000009@sipantau.internal','panit','${UNIT.satu}',false);

  -- SPT terbit di Unit I: Panit Satu mengawasi, Anggota Satu melaksanakan
  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada,tanggal_mulai,tanggal_batas)
  values ('${SPT.terbit}','SP.Gas.Lidik/912/VIII/RES.5.3/2026/Ditreskrimsus','Penyelidikan A','${UNIT.satu}','berjalan','${ID.kanit1}',now(),current_date,current_date+7);

  -- Draf milik Kanit Satu, belum terbit
  insert into public.penugasan (id,judul,unit_id,status,diterbitkan_oleh)
  values ('${SPT.draf}','Draf Belum Jadi','${UNIT.satu}','draf','${ID.kanit1}');

  -- SPT di unit lain
  insert into public.penugasan (id,nomor_spt,judul,unit_id,status,diterbitkan_oleh,diterbitkan_pada)
  values ('${SPT.unit2}','SP.Gas.Lidik/913/VIII/RES.5.4/2026/Ditreskrimsus','Penyelidikan B','${UNIT.dua}','berjalan','${ID.kanit2}',now());

  insert into public.penugasan_panit (penugasan_id,panit_id,ditunjuk_oleh)
  values ('${SPT.terbit}','${ID.panit1}','${ID.kanit1}');

  insert into public.penugasan_pelaksana (penugasan_id,pelaksana_id,urutan,ditugaskan_pada)
  values ('${SPT.terbit}','${ID.anggota1}',1,now()),
         ('${SPT.terbit}','${ID.panitLain}',2,now());

  insert into public.penugasan_dasar (penugasan_id,jenis,nomor,tanggal)
  values ('${SPT.terbit}','laporan_informasi','LI/1/VIII/2026',current_date);

  insert into public.penugasan_lokasi (penugasan_id,urutan,nama,lat,lng,radius_meter)
  values ('${SPT.terbit}',1,'Bandara Kertajati',-6.649,108.169,300);
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

// ---- rekursi RLS: kueri di bawah akan MELEMPAR bila lingkarannya ada
await sebagai(ID.anggota1, async () => {
  let bergalat = false, jml = -1
  try {
    jml = await n(`select count(*) n from public.penugasan`)
  } catch (e) { bergalat = true; console.log('        ' + e.message) }
  cek('U-SPT-01', 'Pelaksana membaca penugasan TANPA rekursi tak berhingga', !bergalat)
  cek('U-SPT-02', 'Pelaksana hanya melihat SPT yang mencantumkannya', jml === 1)

  bergalat = false
  try { await n(`select count(*) n from public.penugasan_pelaksana`) }
  catch { bergalat = true }
  cek('U-SPT-03', 'Pelaksana membaca penugasan_pelaksana TANPA rekursi', !bergalat)
})

await sebagai(ID.panit1, async () => {
  let bergalat = false, jml = -1
  try { jml = await n(`select count(*) n from public.penugasan`) }
  catch (e) { bergalat = true; console.log('        ' + e.message) }
  cek('U-SPT-04', 'Panit membaca penugasan TANPA rekursi', !bergalat)
  cek('U-SPT-05', 'Panit hanya melihat SPT yang ia awasi', jml === 1)
})

await sebagai(ID.panitKosong, async () => {
  cek('U-SPT-06', 'Panit tanpa penunjukan melihat NOL SPT (bukan se-unit)',
    await n(`select count(*) n from public.penugasan`) === 0)
})

await sebagai(ID.anggota2, async () => {
  cek('U-SPT-07', 'Anggota unit lain TIDAK melihat SPT Unit I',
    await n(`select count(*) n from public.penugasan where id = '${SPT.terbit}'`) === 0)
})

await sebagai(ID.kanit1, async () => {
  cek('U-SPT-08', 'Kanit melihat SPT unitnya termasuk drafnya sendiri',
    await n(`select count(*) n from public.penugasan`) === 2)
  cek('U-SPT-09', 'Kanit TIDAK melihat SPT unit lain',
    await n(`select count(*) n from public.penugasan where unit_id='${UNIT.dua}'`) === 0)
})

// ---- draf tidak boleh bocor ke atasan
await sebagai(ID.kasubdit, async () => {
  cek('U-SPT-10', 'Kasubdit melihat SPT terbit seluruh unit',
    await n(`select count(*) n from public.penugasan where status <> 'draf'`) === 2)
  cek('U-SPT-11', 'Draf milik Kanit TIDAK bocor ke Kasubdit',
    await n(`select count(*) n from public.penugasan where id='${SPT.draf}'`) === 0)
})

await sebagai(ID.pemel, async () => {
  cek('U-SPT-12', 'Draf TIDAK bocor ke Akun Pemeliharaan',
    await n(`select count(*) n from public.penugasan where id='${SPT.draf}'`) === 0)
})

// ---- pencabutan dilakukan Kanit, sebagaimana di aplikasi sungguhan
await db.exec('begin')
await db.query(`select set_config('request.jwt.claims',$1,true)`,
  [JSON.stringify({ sub: ID.kanit1, role: 'authenticated' })])
await db.exec('set local role authenticated')
await db.query(
  `update public.penugasan_panit set dicabut_pada=now(), dicabut_oleh=$1,
     alasan_pencabutan='Rotasi tugas' where panit_id=$2`, [ID.kanit1, ID.panit1])
await db.query(
  `update public.penugasan_pelaksana set dicabut_pada=now(), dicabut_oleh=$1,
     alasan_pencabutan='Dipindah perkara lain' where pelaksana_id=$2`, [ID.kanit1, ID.anggota1])
await db.exec('commit')

// ---- asimetri baca/tulis pada pencabutan (BR-21, BR-27)

await sebagai(ID.panit1, async () => {
  cek('U-SPT-13', 'Panit yang SUDAH DICABUT tetap membaca riwayat SPT (BR-21)',
    await n(`select count(*) n from public.penugasan where id='${SPT.terbit}'`) === 1)
})

await sebagai(ID.anggota1, async () => {
  cek('U-SPT-14', 'Pelaksana yang SUDAH DICABUT tetap membaca SPT-nya (BR-27)',
    await n(`select count(*) n from public.penugasan where id='${SPT.terbit}'`) === 1)
})

// ---- tulis
await sebagai(ID.panit1, async () => {
  let ditolak = false
  try {
    await db.query(`insert into public.penugasan (judul,unit_id,status,diterbitkan_oleh)
                    values ('SPT Palsu','${UNIT.satu}','draf','${ID.panit1}')`)
  } catch { ditolak = true }
  cek('U-SPT-15', 'Panit TIDAK dapat menerbitkan SPT (BR-06)', ditolak)
})

await sebagai(ID.kasubdit, async () => {
  let ditolak = false
  try {
    await db.query(`insert into public.penugasan (judul,unit_id,status,diterbitkan_oleh)
                    values ('SPT Kasubdit','${UNIT.satu}','draf','${ID.kasubdit}')`)
  } catch { ditolak = true }
  cek('U-SPT-16', 'Kasubdit TIDAK dapat menerbitkan SPT (BR-06)', ditolak)
})

await sebagai(ID.anggota1, async () => {
  await db.query(`update public.penugasan set judul='DIBAJAK' where id='${SPT.terbit}'`)
})
cek('U-SPT-17', 'Pelaksana TIDAK dapat menyunting SPT (periksa keadaan baris)',
  (await db.query(`select judul from public.penugasan where id='${SPT.terbit}'`)).rows[0].judul === 'Penyelidikan A')

await sebagai(ID.kanit2, async () => {
  await db.query(`update public.penugasan set judul='DIBAJAK' where id='${SPT.terbit}'`)
})
cek('U-SPT-18', 'Kanit unit lain TIDAK dapat menyunting SPT Unit I',
  (await db.query(`select judul from public.penugasan where id='${SPT.terbit}'`)).rows[0].judul === 'Penyelidikan A')

await sebagai(ID.kasubdit, async () => {
  await db.query(`update public.penugasan set judul='DIBAJAK' where id='${SPT.terbit}'`)
})
cek('U-SPT-19', 'Kasubdit TIDAK dapat menyunting isi SPT, hanya membuka kembali',
  (await db.query(`select judul from public.penugasan where id='${SPT.terbit}'`)).rows[0].judul === 'Penyelidikan A')

// ---- batasan (constraint) yang menahan aturan bisnis
let ditolak = false
try {
  await db.query(`update public.penugasan set status='selesai' where id='${SPT.terbit}'`)
} catch { ditolak = true }
cek('U-SPT-20', 'SPT TIDAK dapat selesai tanpa berkas surat (BR-25)', ditolak)

ditolak = false
try {
  await db.query(`update public.penugasan set status='dibatalkan' where id='${SPT.terbit}'`)
} catch { ditolak = true }
cek('U-SPT-21', 'SPT TIDAK dapat dibatalkan tanpa alasan', ditolak)

ditolak = false
try {
  await db.query(`insert into public.penugasan (judul,unit_id,tanggal_mulai,tanggal_batas,diterbitkan_oleh)
                  values ('Salah Tanggal','${UNIT.satu}',current_date,current_date-1,'${ID.kanit1}')`)
} catch { ditolak = true }
cek('U-SPT-22', 'Batas waktu TIDAK boleh mendahului tanggal mulai', ditolak)

ditolak = false
try {
  await db.query(`insert into public.penugasan_lokasi (penugasan_id,nama,lat,lng,radius_meter)
                  values ('${SPT.terbit}','Radius Terlalu Besar',-6.9,107.6,5000)`)
} catch { ditolak = true }
cek('U-SPT-23', 'Radius geofence dibatasi 100-2000 meter', ditolak)

ditolak = false
try {
  await db.query(`insert into public.penugasan_lokasi (penugasan_id,nama,lat)
                  values ('${SPT.terbit}','Lintang Tanpa Bujur',-6.9)`)
} catch { ditolak = true }
cek('U-SPT-24', 'Koordinat wajib berpasangan (lat tanpa lng ditolak)', ditolak)

// ---- BR-24 satu sesi aktif per orang
await db.query(`insert into public.sesi_tugas (penugasan_id,pengguna_id)
                values ('${SPT.terbit}','${ID.anggota1}')`)
ditolak = false
try {
  await db.query(`insert into public.sesi_tugas (penugasan_id,pengguna_id)
                  values ('${SPT.unit2}','${ID.anggota1}')`)
} catch { ditolak = true }
cek('U-SPT-25', 'Satu Sesi Tugas aktif per orang lintas SPT (BR-24)', ditolak)

await sebagai(ID.anggota1, async () => {
  let bergalat = false
  try { await n(`select count(*) n from public.sesi_tugas`) } catch { bergalat = true }
  cek('U-SPT-26', 'sesi_tugas tertutup total sampai Modul 6.4', bergalat)
})


// ---- penjaga kolom pada tabel penghubung (migrasi 0009) ----
//
// Kebijakan RLS mengizinkan pelaksana mengubah BARIS miliknya sendiri
// supaya tanda terima dapat ditulis. Yang diuji di bawah: ia tetap
// TIDAK dapat menyentuh KOLOM lain di baris yang sama.

await sebagai(ID.anggota1, async () => {
  let d = false
  try {
    await db.query(`update public.penugasan_pelaksana
        set dicabut_pada=now(), alasan_pencabutan='Mencabut diri sendiri'
      where pelaksana_id=$1`, [ID.anggota1])
  } catch { d = true }
  cek('U-SPT-27', 'Pelaksana TIDAK dapat mencabut dirinya sendiri dari SPT', d)

  d = false
  try {
    await db.query(`update public.penugasan_pelaksana set urutan=99 where pelaksana_id=$1`,
      [ID.anggota1])
  } catch { d = true }
  cek('U-SPT-28', 'Pelaksana TIDAK dapat mengubah urutannya pada surat', d)

  d = false
  try {
    await db.query(`update public.penugasan_pelaksana set pelaksana_id=$1 where pelaksana_id=$2`,
      [ID.anggota2, ID.anggota1])
  } catch { d = true }
  cek('U-SPT-29', 'Pelaksana TIDAK dapat mengalihkan penugasan ke orang lain', d)
})

// METODE: klausa USING yang menolak UPDATE menyaring baris jadi nol
// baris berubah, TANPA melempar galat. Yang diperiksa karena itu
// keadaan barisnya sesudahnya, bukan ada tidaknya galat.
await db.exec('begin')
await db.query(`select set_config('request.jwt.claims',$1,true)`,
  [JSON.stringify({ sub: ID.panit1, role: 'authenticated' })])
await db.exec('set local role authenticated')
await db.query(`update public.penugasan_panit set dicabut_pada=null where panit_id=$1`,
  [ID.panit1])
await db.exec('commit')

cek('U-SPT-30', 'Panit TIDAK dapat memulihkan penunjukannya sendiri',
  (await db.query(`select dicabut_pada from public.penugasan_panit where panit_id=$1`,
    [ID.panit1])).rows[0].dicabut_pada !== null)

// Tanda terima: jalur resminya berjalan, dan sekali tercatat tidak berubah.
await db.exec('begin')
await db.query(`select set_config('request.jwt.claims',$1,true)`,
  [JSON.stringify({ sub: ID.panitLain, role: 'authenticated' })])
await db.exec('set local role authenticated')
await db.query(`select public.catat_tanda_terima($1)`, [SPT.terbit])
await db.exec('commit')

cek('U-SPT-31', 'Tanda terima tercatat lewat fungsi resmi',
  (await db.query(`select dibaca_pada from public.penugasan_pelaksana where pelaksana_id=$1`,
    [ID.panitLain])).rows[0].dibaca_pada !== null)

await sebagai(ID.panitLain, async () => {
  let d = false
  try {
    await db.query(`update public.penugasan_pelaksana
        set dibaca_pada = now() - interval '5 days' where pelaksana_id=$1`, [ID.panitLain])
  } catch { d = true }
  cek('U-SPT-32', 'Tanda terima yang sudah tercatat TIDAK dapat dimundurkan', d)
})

// Pelaksana yang sudah dicabut TIDAK memperoleh tanda terima baru.
await db.exec('begin')
await db.query(`select set_config('request.jwt.claims',$1,true)`,
  [JSON.stringify({ sub: ID.anggota1, role: 'authenticated' })])
await db.exec('set local role authenticated')
await db.query(`select public.catat_tanda_terima($1)`, [SPT.terbit])
await db.exec('commit')

cek('U-SPT-33', 'Pelaksana yang sudah dicabut tidak mendapat tanda terima baru',
  (await db.query(`select dibaca_pada from public.penugasan_pelaksana where pelaksana_id=$1`,
    [ID.anggota1])).rows[0].dibaca_pada === null)

console.log(`\n== ${lulus} lulus, ${gagal} gagal`)
process.exit(gagal === 0 ? 0 : 1)
