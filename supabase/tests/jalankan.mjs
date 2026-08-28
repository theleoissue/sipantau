// Menjalankan seluruh migrasi SiPANTAU terhadap Postgres tiruan (pglite).
// Tujuannya menangkap galat sintaks, urutan, dan rujukan yang salah
// SEBELUM berkas SQL-nya dikirim untuk dijalankan di Supabase sungguhan.

import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRASI = fileURLToPath(new URL('../migrations', import.meta.url))

// Ekstensi yang tidak tersedia di pglite. Baris pembuatannya dilucuti
// saat uji lokal; di Supabase sungguhan ia tetap dijalankan apa adanya.
function lucutiEkstensi(sql) {
  return sql.replace(
    /create extension if not exists (postgis|pg_cron)[^;]*;/gi,
    "-- [uji lokal] baris create extension dilucuti\n"
  )
}

const db = new PGlite()
await db.waitReady

console.log('== memasang stub Supabase')
await db.exec(readFileSync(join(import.meta.dirname, 'stub.sql'), 'utf8'))

const berkas = readdirSync(MIGRASI).filter(f => f.endsWith('.sql')).sort()
let gagal = 0

for (const f of berkas) {
  const sql = lucutiEkstensi(readFileSync(join(MIGRASI, f), 'utf8'))
  try {
    await db.exec(sql)
    console.log(`   OK   ${f}`)
  } catch (e) {
    gagal++
    console.log(`   GAGAL ${f}`)
    console.log(`        ${e.message}`)
    if (e.hint) console.log(`        petunjuk: ${e.hint}`)
  }
}

console.log(gagal === 0
  ? `\n== ${berkas.length} migrasi lulus`
  : `\n== ${gagal} dari ${berkas.length} migrasi GAGAL`)


process.exit(gagal === 0 ? 0 : 1)
