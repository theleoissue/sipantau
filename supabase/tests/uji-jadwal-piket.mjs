// Uji jadwal piket (migrasi 0042 + 0043).
//
// Modul di luar PRD, dibangun 2 September 2026 dengan acuan bentuk
// "JADWAL PIKET UNIT GAKKUM SATLANTAS POLRESTABES BANDUNG".
//
// Dua hal yang paling perlu dibuktikan, dan keduanya berasal dari
// dokumen acuan itu sendiri:
//   1. Pembangkitnya menghasilkan PERSIS pola dokumen itu — bukan
//      sekadar "pola yang masuk akal". Diuji dengan menyalin 19 hari
//      pertamanya apa adanya lalu dibandingkan sel demi sel.
//   2. Penyusunan ulang TIDAK menimpa hari yang disunting tangan.
//      Dokumen itu menyimpang dua kali dalam 38 hari; tanpa penjaga
//      ini, satu kali menyusun ulang menghapus seluruh penyesuaian
//      tanpa jejak.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))
const ID = {
  kasubdit: '00000000-0000-0000-0000-000000000001',
  kanit1:   '00000000-0000-0000-0000-000000000002',
  anggota1: '00000000-0000-0000-0000-000000000004',
}
const UNIT = {
  satu: '10000000-0000-0000-0000-000000000001',
  dua:  '10000000-0000-0000-0000-000000000002',
  tiga: '10000000-0000-0000-0000-000000000003',
  empat:'10000000-0000-0000-0000-000000000004',
}

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
    ('${ID.kasubdit}'),('${ID.kanit1}'),('${ID.anggota1}');

  insert into public.unit (id, nama, urutan) values
    ('${UNIT.satu}','Unit I',1), ('${UNIT.dua}','Unit II',2),
    ('${UNIT.tiga}','Unit III',3), ('${UNIT.empat}','Unit IV',4);

  insert into public.users (id,nama,nrp,email_sistem,peran,unit_id,wajib_ganti_sandi) values
    ('${ID.kasubdit}','Kasubdit','0000001','0000001@sipantau.internal','kasubdit','${UNIT.satu}',false),
    ('${ID.kanit1}','Kanit Satu','0000002','0000002@sipantau.internal','kanit','${UNIT.satu}',false),
    ('${ID.anggota1}','Anggota Satu','0000004','0000004@sipantau.internal','anggota','${UNIT.satu}',false);
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
  const hasil = await fn()
  await db.exec('commit')
  return hasil
}
async function galat(fn) {
  try { await fn(); return null } catch (e) { await db.exec('rollback').catch(() => {}); return e.message }
}
const n = async (sql, p = []) => Number((await db.query(sql, p)).rows[0].n)

// Larik dikirim sebagai literal PostgreSQL, bukan larik JS: penyandi
// parameter pglite tidak menebak tipe elemennya sendiri (galat array_in).
// Cast-nya ditulis di SQL supaya tipenya tidak pernah ambigu.
const larik = a => '{' + a.join(',') + '}'
const SUSUN = `select public.susun_jadwal_piket($1,$2,$3::uuid[],$4::public.keadaan_piket[])`

// =====================================================================
// Kewenangan menyusun
// =====================================================================
{
  const e = await galat(() => sebagai(ID.kanit1, () =>
    db.query(SUSUN, ['2026-08-01', '2026-08-19', larik([UNIT.satu]), larik(['cadangan'])])))
  cek('U-JP-01', 'Kanit TIDAK dapat menyusun jadwal piket (lintas unit)',
    e !== null && e.includes('TIDAK_BERWENANG'))
}
{
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(SUSUN, ['2026-08-01', '2026-08-19', larik([UNIT.satu]), larik(['cadangan'])])))
  cek('U-JP-02', 'Anggota TIDAK dapat menyusun jadwal piket',
    e !== null && e.includes('TIDAK_BERWENANG'))
}

// =====================================================================
// Pembangkit wajib menghasilkan PERSIS pola dokumen acuan
//
// Disalin apa adanya dari tabel pertama dokumen (1-19 Agustus), termasuk
// keadaan awalnya: Regu 1 Cadangan, Regu 2 Lepas Dinas, Regu 3 Piket.
// =====================================================================
const DOK = {
  [UNIT.satu]: 'C P L C P L C P L C P L C P L C P L C',
  [UNIT.dua]:  'L C P L C P L C P L C P L C P L C P L',
  [UNIT.tiga]: 'P L C P L C P L C P L C P L C P L C P',
}
const KODE = { cadangan: 'C', piket: 'P', lepas_dinas: 'L' }

await sebagai(ID.kasubdit, () =>
  db.query(SUSUN, ['2026-08-01', '2026-08-19',
    larik([UNIT.satu, UNIT.dua, UNIT.tiga]),
    larik(['cadangan', 'lepas_dinas', 'piket'])]))

let cocokSemua = true
const salah = []
for (const [unit, harapan] of Object.entries(DOK)) {
  const baris = (await db.query(
    `select keadaan from public.jadwal_piket
      where unit_id=$1 order by tanggal`, [unit])).rows.map(r => KODE[r.keadaan]).join(' ')
  if (baris !== harapan) { cocokSemua = false; salah.push(`${unit}\n    harap: ${harapan}\n    dapat: ${baris}`) }
}
cek('U-JP-03', 'Pembangkit menghasilkan PERSIS 19 hari pertama dokumen acuan', cocokSemua)
if (!cocokSemua) salah.forEach(s => console.log('    ' + s))

// Sifat yang wajib berlaku tiap hari pada rotasi tiga unit.
{
  const menyimpang = await n(`
    select count(*) n from (
      select tanggal
        from public.jadwal_piket
       group by tanggal
      having count(*) filter (where keadaan='piket')       <> 1
          or count(*) filter (where keadaan='cadangan')    <> 1
          or count(*) filter (where keadaan='lepas_dinas') <> 1
    ) x`)
  cek('U-JP-04', 'Tiap hari tepat satu Piket, satu Cadangan, satu Lepas Dinas',
    menyimpang === 0)
}

// =====================================================================
// Penyuntingan manual — inti dari kenapa ini baris, bukan rumus
// =====================================================================
await sebagai(ID.kasubdit, () =>
  db.query(`update public.jadwal_piket
               set keadaan='piket', disunting_manual=true, catatan='uji',
                   diubah_oleh=$1, diubah_pada=now()
             where tanggal='2026-08-05' and unit_id=$2`, [ID.kasubdit, UNIT.satu]))

cek('U-JP-05', 'Kasubdit dapat menyunting satu hari',
  (await db.query(`select keadaan from public.jadwal_piket
                    where tanggal='2026-08-05' and unit_id=$1`, [UNIT.satu])).rows[0].keadaan === 'piket')

// Susun ulang rentang yang SAMA. Hari yang disunting wajib bertahan.
await sebagai(ID.kasubdit, () =>
  db.query(SUSUN, ['2026-08-01', '2026-08-19',
    larik([UNIT.satu, UNIT.dua, UNIT.tiga]),
    larik(['cadangan', 'lepas_dinas', 'piket'])]))

cek('U-JP-06', 'Penyusunan ulang TIDAK menimpa hari yang disunting tangan',
  (await db.query(`select keadaan from public.jadwal_piket
                    where tanggal='2026-08-05' and unit_id=$1`, [UNIT.satu])).rows[0].keadaan === 'piket')

cek('U-JP-07', 'Hari lain tetap tersusun ulang seperti biasa',
  (await db.query(`select keadaan from public.jadwal_piket
                    where tanggal='2026-08-06' and unit_id=$1`, [UNIT.satu])).rows[0].keadaan === 'lepas_dinas')

// =====================================================================
// Empat unit — SiPANTAU punya empat, dokumen acuan hanya tiga
// =====================================================================
await sebagai(ID.kasubdit, () =>
  db.query(SUSUN, ['2026-10-01', '2026-10-12',
    larik([UNIT.satu, UNIT.dua, UNIT.tiga, UNIT.empat]),
    larik(['cadangan', 'lepas_dinas', 'piket', 'cadangan'])]))

cek('U-JP-08', 'Empat unit tersusun tanpa galat (keadaan boleh dipakai dua unit)',
  await n(`select count(*) n from public.jadwal_piket where tanggal='2026-10-01'`) === 4)

// =====================================================================
// Hak baca dan hak tulis
// =====================================================================
await sebagai(ID.anggota1, async () =>
  cek('U-JP-09', 'Anggota DAPAT membaca jadwal seluruh unit (gunanya justru di situ)',
    await n(`select count(*) n from public.jadwal_piket where tanggal='2026-08-01'`) === 3))

// UPDATE yang ditolak RLS TIDAK melempar galat — ia menyentuh nol baris.
// Diperiksa lewat keadaan barisnya, bukan pesan galat; memeriksa galat
// di sini akan LULUS PALSU.
await sebagai(ID.kanit1, () =>
  db.query(`update public.jadwal_piket set keadaan='piket'
             where tanggal='2026-08-06' and unit_id=$1`, [UNIT.satu]))
cek('U-JP-10', 'Kanit TIDAK dapat mengubah jadwal (RLS menyaring diam-diam)',
  (await db.query(`select keadaan from public.jadwal_piket
                    where tanggal='2026-08-06' and unit_id=$1`, [UNIT.satu])).rows[0].keadaan === 'lepas_dinas')

// Perhatikan asimetrinya: INSERT yang gagal with check MELEMPAR galat,
// sedangkan UPDATE di atas hanya menyentuh nol baris tanpa galat. Dua
// bentuk penolakan yang berbeda pada tabel yang sama — keduanya wajib
// diuji dengan cara masing-masing, kalau tidak salah satunya lulus palsu.
{
  const e = await galat(() => sebagai(ID.anggota1, () =>
    db.query(`insert into public.jadwal_piket (tanggal,unit_id,keadaan)
              values ('2027-01-01',$1,'piket')`, [UNIT.satu])))
  cek('U-JP-11', 'Anggota TIDAK dapat menyisipkan baris jadwal (INSERT bergalat)',
    e !== null && /row-level security/i.test(e)
    && await n(`select count(*) n from public.jadwal_piket where tanggal='2027-01-01'`) === 0)
}

// =====================================================================
// Zona waktu — CLAUDE.md §5.5
// =====================================================================
{
  const hariJakarta = (await db.query(
    `select (now() at time zone 'Asia/Jakarta')::date d`)).rows[0].d
  await db.query(
    `insert into public.jadwal_piket (tanggal,unit_id,keadaan)
     values ($1,$2,'piket') on conflict (tanggal,unit_id) do update set keadaan='piket'`,
    [hariJakarta, UNIT.dua])
  const hasil = (await db.query(`select * from public.unit_piket_hari_ini()`)).rows.map(r => r.unit_piket_hari_ini)
  cek('U-JP-12', 'unit_piket_hari_ini memakai hari kalender Asia/Jakarta',
    hasil.includes(UNIT.dua))
}

console.log(gagal === 0
  ? `\n== ${lulus} butir uji jadwal piket lulus`
  : `\n== ${lulus} lulus, ${gagal} GAGAL`)

process.exit(gagal === 0 ? 0 : 1)
