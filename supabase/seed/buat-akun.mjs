/**
 * Membuat akun Supabase Auth untuk seluruh personel sekaligus.
 *
 * CARA PAKAI
 *   1. Pastikan .env.local sudah berisi NEXT_PUBLIC_SUPABASE_URL dan
 *      SUPABASE_SERVICE_ROLE_KEY (Project Settings > API > service_role)
 *   2. node supabase/seed/buat-akun.mjs
 *   3. Lalu jalankan supabase/seed/002_personel.sql di SQL Editor
 *
 * KENAPA ADA SKRIP INI
 *   Dua puluh satu akun dibuat satu per satu lewat dashboard berarti 21
 *   kali mengetik alamat berpola <nrp>@sipantau.internal. Satu digit
 *   salah dan akunnya tidak akan berjodoh dengan barisnya di
 *   002_personel.sql — dan gejalanya bukan galat, melainkan orang itu
 *   sekadar tidak muncul di sistem. Persis kegagalan senyap yang
 *   berulang kali diperingatkan PRD ini.
 *
 * DAFTAR NRP TIDAK DITULIS ULANG DI SINI
 *   Ia dibaca langsung dari 002_personel.sql. Dua daftar yang ditulis
 *   terpisah pasti berbeda isi cepat atau lambat; satu daftar tidak
 *   bisa.
 *
 * SOAL service_role KEY
 *   Kunci itu melewati SELURUH aturan akses baris. Ia hanya dipakai di
 *   sini, hanya di komputer Anda, dan TIDAK PERNAH masuk ke kode
 *   aplikasi maupun ke GitHub. Skrip ini tidak pernah mencetaknya.
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const AKAR = new URL('../../', import.meta.url)

// ---- baca .env.local tanpa pustaka tambahan ----
function bacaEnv() {
  let isi = ''
  try {
    isi = readFileSync(new URL('.env.local', AKAR), 'utf8')
  } catch {
    henti('Berkas .env.local tidak ditemukan di folder proyek.')
  }
  const env = {}
  for (const baris of isi.split('\n')) {
    const m = baris.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

function henti(pesan) {
  console.error('\nBERHENTI: ' + pesan + '\n')
  process.exit(1)
}

// ---- ambil daftar personel dari berkas SQL, bukan ditulis ulang ----
function bacaDaftarPersonel() {
  const sql = readFileSync(new URL('002_personel.sql', import.meta.url), 'utf8')
  const baris = [...sql.matchAll(
    /\(\s*'(\d{8})'\s*,\s*'([^']*)'\s*,\s*(?:'([^']*)'|null)\s*,\s*'(\w+)'/g,
  )]
  return baris.map(m => ({
    nrp: m[1], nama: m[2], pangkat: m[3] ?? null, peran: m[4],
  }))
}

const env = bacaEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const kunci = env.SUPABASE_SERVICE_ROLE_KEY

if (!url) henti('NEXT_PUBLIC_SUPABASE_URL belum diisi di .env.local')
if (!kunci) {
  henti(
    'SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local.\n' +
    'Ambil di Supabase: Project Settings > API > service_role (secret).\n' +
    'Tambahkan barisnya, jalankan lagi, lalu boleh dihapus kembali.',
  )
}

const SANDI_AWAL = 'Gantisaya123'

const personel = bacaDaftarPersonel()
if (personel.length === 0) henti('Tidak ada personel terbaca dari 002_personel.sql')

console.log(`\n${personel.length} personel terbaca dari 002_personel.sql`)
console.log(`Server  : ${url}`)
console.log(`Sandi awal semua akun: ${SANDI_AWAL} (wajib diganti saat masuk pertama)\n`)

const supabase = createClient(url, kunci, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let dibuat = 0, sudahAda = 0, gagal = 0

for (const p of personel) {
  const email = `${p.nrp}@sipantau.internal`
  const { error } = await supabase.auth.admin.createUser({
    email,
    password: SANDI_AWAL,
    email_confirm: true,   // tanpa ini akunnya tidak dapat masuk
  })

  if (!error) {
    dibuat++
    console.log(`  DIBUAT   ${p.nrp}  ${p.peran.padEnd(12)} ${p.nama}`)
  } else if (/already|exists|registered/i.test(error.message)) {
    sudahAda++
    console.log(`  ADA      ${p.nrp}  ${p.peran.padEnd(12)} ${p.nama}`)
  } else {
    gagal++
    console.log(`  GAGAL    ${p.nrp}  ${error.message}`)
  }
}

console.log(`\n${dibuat} dibuat, ${sudahAda} sudah ada, ${gagal} gagal`)

if (gagal > 0) {
  console.log('\nAda yang gagal. Perbaiki dulu sebelum menjalankan 002_personel.sql.')
  process.exit(1)
}

console.log('\nBerikutnya: jalankan supabase/seed/002_personel.sql di SQL Editor Supabase,')
console.log('lalu periksa kolom "lengkap" pada hasilnya bernilai true.\n')
