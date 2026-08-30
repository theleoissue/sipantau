/**
 * Menyetel ULANG kata sandi 17 personel Unit I (dari berkas
 * "DAFTAR ANGGOTA UNIT I SUBDIT IV DAN PEJABAT DITRESKRIMSUS.docx")
 * menjadi satu kata sandi standar, untuk pengujian oleh personel
 * sungguhan — BUKAN skrip pembuatan akun (semuanya sudah ada sejak
 * supabase/seed/003_lengkap.sql).
 *
 * Direktur dan Wadir yang tercantum di berkas itu SENGAJA TIDAK
 * disertakan di sini — keduanya di luar cakupan Subdit IV yang diawasi
 * SiPANTAU dan tidak punya padanan salah satu dari lima peran tertutup
 * sistem ini (keputusan pengguna, bukan tebakan).
 *
 * CARA PAKAI
 *   1. Pastikan .env.local berisi NEXT_PUBLIC_SUPABASE_URL dan
 *      SUPABASE_SERVICE_ROLE_KEY (Project Settings > API > service_role)
 *   2. node supabase/seed/reset-sandi-unit-1.mjs
 *   3. HAPUS kembali SUPABASE_SERVICE_ROLE_KEY dari .env.local sesudahnya
 *
 * Kata sandi baru mewajibkan penggantian saat masuk pertama
 * (wajib_ganti_sandi disetel true di sini juga) — sama seperti akun
 * baru, supaya tidak ada personel sungguhan yang terus memakai kata
 * sandi standar ini selamanya.
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
if (!kunci) {
  henti(
    'SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local.\n' +
    'Ambil di Supabase: Project Settings > API > service_role (secret).\n' +
    'Tambahkan barisnya, jalankan lagi, lalu HAPUS kembali setelah selesai.',
  )
}

const SANDI_BARU = 'sipantau123'

// Persis 17 baris di berkas, Direktur dan Wadir tidak disertakan.
const NRP_UNIT_1 = [
  ['83101429', 'OLMA FRIDOKI, S.H., S.I.K., M.H.'],
  ['89120541', 'TITO WITULAR, S.E., M.H.'],
  ['82080373', 'AGUNG RAHMATULLOH, S.H.'],
  ['79090418', 'AHMAD FAUZI, S.H.'],
  ['92080083', 'RADEN AGUNG PAMUJI, S.H., M.M.'],
  ['76050662', 'DEDI RUSTANDI, S.H., M.H.'],
  ['84041750', 'RANGGA WIJAYA, S.H.'],
  ['87010193', 'SANIEF ZAINAL, S.H.'],
  ['93060056', 'DANI RAMDANI, S.H.'],
  ['94070195', 'BOBBY JULIANDA SAPUTRA, S.H.'],
  ['93110719', 'YOGI ABDUL ROHMAN, S.H.'],
  ['95100387', 'ADILLA NUR MUSLIMAH, S.I.Kom.'],
  ['95050966', 'ARIK AGUNG RISANTO, S.H.'],
  ['95100783', 'DEDE VERRY DASPIANTO, S.H.'],
  ['96120409', 'PRIMAN PRATAMA, S.E.'],
  ['97120227', 'ELSA SELVIA NADIANA, S.H.'],
  ['98060329', 'HEDDY FERDIANSYAH'],
]

console.log(`\n${NRP_UNIT_1.length} personel Unit I akan disetel ulang kata sandinya.`)
console.log(`Server    : ${url}`)
console.log(`Sandi baru: ${SANDI_BARU} (wajib diganti saat masuk pertama)\n`)

const supabase = createClient(url, kunci, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let berhasil = 0, tidakDitemukan = 0, gagal = 0

for (const [nrp, nama] of NRP_UNIT_1) {
  const { data: baris, error: galatBaca } = await supabase
    .from('users')
    .select('id')
    .eq('nrp', nrp)
    .maybeSingle()

  if (galatBaca || !baris) {
    tidakDitemukan++
    console.log(`  TIDAK ADA  ${nrp}  ${nama} — belum ada di tabel users, lewati`)
    continue
  }

  const { error: galatSandi } = await supabase.auth.admin.updateUserById(baris.id, {
    password: SANDI_BARU,
  })

  if (galatSandi) {
    gagal++
    console.log(`  GAGAL      ${nrp}  ${nama} — ${galatSandi.message}`)
    continue
  }

  const { error: galatFlag } = await supabase
    .from('users')
    .update({ wajib_ganti_sandi: true })
    .eq('id', baris.id)

  if (galatFlag) {
    console.log(`  SANDI OK, PENANDA GAGAL  ${nrp}  ${nama} — ${galatFlag.message}`)
  } else {
    berhasil++
    console.log(`  SELESAI    ${nrp}  ${nama}`)
  }
}

console.log(`\n${berhasil} selesai, ${tidakDitemukan} tidak ditemukan, ${gagal} gagal\n`)
