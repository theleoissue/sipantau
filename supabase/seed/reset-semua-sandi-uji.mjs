/**
 * Menyetel ULANG kata sandi SELURUH akun (public.users) menjadi satu
 * kata sandi standar — untuk KEPERLUAN UJI COBA saja (akun Admin baru,
 * pengujian Fungsi Tepi Manajemen Akun). BUKAN untuk personel sungguhan
 * memakai sistem sehari-hari; lihat reset-sandi-unit-1.mjs untuk itu.
 *
 * Berbeda dari reset-sandi-unit-1.mjs: wajib_ganti_sandi SENGAJA TIDAK
 * disetel true di sini, supaya login langsung tembus tanpa terhenti di
 * layar ganti sandi wajib saat sedang menguji fitur lain.
 *
 * CARA PAKAI
 *   1. Pastikan .env.local berisi NEXT_PUBLIC_SUPABASE_URL dan
 *      SUPABASE_SERVICE_ROLE_KEY (Project Settings > API > service_role)
 *   2. node supabase/seed/reset-semua-sandi-uji.mjs
 *   3. HAPUS kembali SUPABASE_SERVICE_ROLE_KEY dari .env.local sesudahnya
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const AKAR = new URL('../../', import.meta.url)

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

const env = bacaEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const kunci = env.SUPABASE_SERVICE_ROLE_KEY

if (!url) henti('NEXT_PUBLIC_SUPABASE_URL belum diisi di .env.local')
if (!kunci) henti('SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local.')

const SANDI_BARU = 'sipantau123'

const supabase = createClient(url, kunci, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: daftar, error: galatBaca } = await supabase
  .from('users').select('id, nrp, nama, peran')

if (galatBaca) henti(`Gagal membaca daftar users: ${galatBaca.message}`)

console.log(`\n${daftar.length} akun akan disetel ulang kata sandinya menjadi "${SANDI_BARU}".`)
console.log(`Server: ${url}\n`)

let berhasil = 0, gagal = 0

for (const u of daftar) {
  const { error } = await supabase.auth.admin.updateUserById(u.id, { password: SANDI_BARU })
  if (error) {
    gagal++
    console.log(`  GAGAL    ${u.nrp}  ${u.peran.padEnd(12)} ${u.nama} — ${error.message}`)
  } else {
    berhasil++
    console.log(`  SELESAI  ${u.nrp}  ${u.peran.padEnd(12)} ${u.nama}`)
  }
}

console.log(`\n${berhasil} selesai, ${gagal} gagal\n`)
