// Uji penjaga rute. Menyalin RUTE_KHUSUS_PERAN apa adanya dari menu.ts
// lewat regex, supaya yang diuji benar-benar aturan yang dipakai.
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
const src = readFileSync(fileURLToPath(new URL('../../lib/auth/menu.ts', import.meta.url)), 'utf8')
const blok = src.match(/export const RUTE_KHUSUS_PERAN[^=]*=\s*\[([\s\S]*?)\n\]/)[1]
const aturan = [...blok.matchAll(/\{\s*pola:\s*(\/.*?\/),\s*peran:\s*\[([^\]]*)\]/g)]
  .map(m => ({ pola: eval(m[1]), peran: m[2].split(',').map(s => s.trim().replace(/'/g,'')).filter(Boolean) }))

const boleh = (rute, peran) => {
  const a = aturan.find(a => a.pola.test(rute))
  return a ? a.peran.includes(peran) : true
}

let lulus = 0, gagal = 0
const cek = (kode, ket, benar) => {
  if (benar) { lulus++; console.log(`  LULUS  ${kode}  ${ket}`) }
  else { gagal++; console.log(`  GAGAL  ${kode}  ${ket}`) }
}

console.log(`(${aturan.length} aturan terbaca dari menu.ts)\n`)

// --- celah pencocokan awalan yang pernah nyata terjadi ---
cek('U-RUTE-01','Anggota TIDAK dapat membuka /penugasan/terbitkan', !boleh('/penugasan/terbitkan','anggota'))
cek('U-RUTE-02','Panit TIDAK dapat membuka /penugasan/terbitkan', !boleh('/penugasan/terbitkan','panit'))
cek('U-RUTE-03','Kasubdit TIDAK dapat menerbitkan SPT (BR-06)', !boleh('/penugasan/terbitkan','kasubdit'))
cek('U-RUTE-04','Kanit DAPAT membuka /penugasan/terbitkan', boleh('/penugasan/terbitkan','kanit'))
cek('U-RUTE-05','Anggota TIDAK dapat menyunting SPT lewat sub-rute', !boleh('/penugasan/abc-123/sunting','anggota'))
cek('U-RUTE-06','Panit TIDAK dapat menutup SPT', !boleh('/penugasan/abc-123/tutup','panit'))
cek('U-RUTE-07','Anggota DAPAT membuka rincian SPT biasa', boleh('/penugasan/abc-123','anggota'))
cek('U-RUTE-08','Anggota DAPAT membuka daftar penugasan', boleh('/penugasan','anggota'))

// --- kewenangan eksklusif Kasubdit (BR-07) ---
for (const p of ['kanit','panit','anggota','pemeliharaan']) {
  cek('U-RUTE-09',`${p} TIDAK dapat membuka /akun`, !boleh('/akun',p))
  cek('U-RUTE-10',`${p} TIDAK dapat membuka /akun/unit (sub-rute)`, !boleh('/akun/unit',p))
  cek('U-RUTE-11',`${p} TIDAK dapat membuka /rekap`, !boleh('/rekap',p))
}
cek('U-RUTE-12','Kasubdit DAPAT membuka /akun', boleh('/akun','kasubdit'))

// --- Sesi Tugas: Kasubdit dan Pemeliharaan dilarang (KP-6.1-43) ---
cek('U-RUTE-13','Kasubdit TIDAK dapat membuka Sesi Tugas', !boleh('/tugas','kasubdit'))
cek('U-RUTE-14','Akun Pemeliharaan TIDAK dapat membuka Sesi Tugas', !boleh('/tugas','pemeliharaan'))
cek('U-RUTE-15','Akun Pemeliharaan TIDAK dapat mengirim laporan', !boleh('/lapor','pemeliharaan'))
cek('U-RUTE-16','Anggota DAPAT membuka Sesi Tugas', boleh('/tugas','anggota'))
cek('U-RUTE-17','Panit DAPAT membuka Sesi Tugas', boleh('/tugas','panit'))
cek('U-RUTE-18','Kanit DAPAT membuka Sesi Tugas (keputusan 6.2 ronde 3)', boleh('/tugas','kanit'))

// --- peninjauan laporan bukan urusan Anggota ---
cek('U-RUTE-19','Anggota TIDAK dapat membuka /laporan (peninjauan)', !boleh('/laporan','anggota'))
cek('U-RUTE-20','Anggota TIDAK dapat membuka /laporan/abc (sub-rute)', !boleh('/laporan/abc','anggota'))
cek('U-RUTE-21','Panit DAPAT meninjau laporan', boleh('/laporan','panit'))

// --- halaman pemeliharaan tertutup bagi keempat peran ---
for (const p of ['kasubdit','kanit','panit','anggota'])
  cek('U-RUTE-22',`${p} TIDAK dapat membuka /pemeliharaan`, !boleh('/pemeliharaan',p))
cek('U-RUTE-23','Akun Pemeliharaan TIDAK melihat dashboard peran mana pun (KP-6.1-40)', !boleh('/beranda','pemeliharaan'))

console.log(`\n== ${lulus} lulus, ${gagal} gagal`)
process.exit(gagal===0?0:1)
