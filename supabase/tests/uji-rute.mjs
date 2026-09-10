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
cek('U-RUTE-08a','Anggota DAPAT mengajukan scan SPRIN', boleh('/penugasan/scan','anggota'))
cek('U-RUTE-08b','Panit DAPAT mengajukan scan SPRIN', boleh('/penugasan/scan','panit'))
cek('U-RUTE-08c','Anggota TIDAK dapat membuka persetujuan scan Kanit', !boleh('/penugasan/pengajuan','anggota'))
cek('U-RUTE-08d','Kanit DAPAT membuka persetujuan scan', boleh('/penugasan/pengajuan','kanit'))

// --- kewenangan eksklusif Kasubdit (BR-07) ---
for (const [i, p] of ['kanit','panit','anggota','pemeliharaan'].entries()) {
  cek(`U-RUTE-09${String.fromCharCode(65+i)}`,`${p} TIDAK dapat membuka /akun`, !boleh('/akun',p))
  cek(`U-RUTE-10${String.fromCharCode(65+i)}`,`${p} TIDAK dapat membuka /akun/unit (sub-rute)`, !boleh('/akun/unit',p))
  cek(`U-RUTE-11${String.fromCharCode(65+i)}`,`${p} TIDAK dapat membuka /rekap`, !boleh('/rekap',p))
}
// Migrasi 0032 (keputusan sadar mengubah PRD): Admin MENGGANTIKAN
// Kasubdit khusus untuk Manajemen Akun — lihat lib/supabase/types.ts.
cek('U-RUTE-12','Kasubdit TIDAK LAGI dapat membuka /akun (digantikan Admin)', !boleh('/akun','kasubdit'))
cek('U-RUTE-12b','Admin DAPAT membuka /akun', boleh('/akun','admin'))
cek('U-RUTE-12c','Admin TIDAK dapat membuka /rekap (tidak ikut dipindah)', !boleh('/rekap','admin'))

// --- Sesi Tugas: Kasubdit dan Pemeliharaan dilarang (KP-6.1-43) ---
cek('U-RUTE-13','Kasubdit TIDAK dapat membuka Sesi Tugas', !boleh('/tugas','kasubdit'))
cek('U-RUTE-14','Akun Pemeliharaan TIDAK dapat membuka Sesi Tugas', !boleh('/tugas','pemeliharaan'))
cek('U-RUTE-15','Akun Pemeliharaan TIDAK dapat mengirim laporan', !boleh('/lapor','pemeliharaan'))
cek('U-RUTE-16','Anggota DAPAT membuka Sesi Tugas', boleh('/tugas','anggota'))
cek('U-RUTE-17','Panit DAPAT membuka Sesi Tugas', boleh('/tugas','panit'))
cek('U-RUTE-18','Kanit DAPAT membuka Sesi Tugas (keputusan 6.2 ronde 3)', boleh('/tugas','kanit'))

// --- peninjauan laporan bukan urusan Anggota ---
cek('U-RUTE-19','Anggota TIDAK dapat membuka daftar peninjauan /laporan', !boleh('/laporan','anggota'))
// U-RUTE-20 lama ("Anggota TIDAK dapat /laporan/abc") sudah tidak
// berlaku sejak /laporan dipecah dua: rincian satu laporan kini
// terbuka bagi Anggota untuk miliknya sendiri — lihat U-RUTE-25.
cek('U-RUTE-21','Panit DAPAT meninjau laporan', boleh('/laporan','panit'))

// --- halaman pemeliharaan tertutup bagi seluruh peran organisasi ---
for (const [i, p] of ['kasubdit','admin','kanit','panit','anggota'].entries())
  cek(`U-RUTE-22${String.fromCharCode(65+i)}`,`${p} TIDAK dapat membuka /pemeliharaan`, !boleh('/pemeliharaan',p))
cek('U-RUTE-23','Akun Pemeliharaan TIDAK melihat dashboard peran mana pun (KP-6.1-40)', !boleh('/beranda','pemeliharaan'))

// --- Admin melihat "semua unit" seperti Kasubdit, di luar Manajemen Akun ---
for (const [i, rute] of ['/beranda','/penugasan','/peta','/laporan','/personel','/lhp','/pemberitahuan'].entries())
  cek(`U-RUTE-24${String.fromCharCode(65+i)}`,`Admin DAPAT membuka ${rute}`, boleh(rute,'admin'))
cek('U-RUTE-25','Admin TIDAK dapat membuka Sesi Tugas (bukan peran lapangan)', !boleh('/tugas','admin'))
cek('U-RUTE-26','Admin TIDAK dapat menerbitkan SPT (BR-06, bukan Kanit)', !boleh('/penugasan/terbitkan','admin'))

console.log(`\n== ${lulus} lulus, ${gagal} gagal`)
process.exit(gagal===0?0:1)
