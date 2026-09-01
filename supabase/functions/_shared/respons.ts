// Pemetaan galat fungsi basis data ke kode HTTP. Pesan galat berasal
// dari `raise exception` di migrasi 0035 — dicocokkan lewat awalan
// kodenya, bukan diteruskan mentah (supaya kata sandi atau rincian
// internal tidak pernah bocor ke pemanggil, KP-6.1-38).

export function jsonRespons(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

const PEMETAAN: Array<[string, number]> = [
  ['TOKEN_TIDAK_SAH', 401],
  // Pengiriman Native (0038). 410 dipilih dengan sengaja untuk
  // SESI_TERTUTUP: kode itu berarti "sasarannya memang sudah tidak ada
  // lagi, jangan diulang" — perangkat yang menerimanya tahu harus
  // BERHENTI mengirim, bukan mencoba lagi seperti pada galat sementara.
  ['SESI_TERTUTUP', 410],
  ['SESI_TIDAK_DITEMUKAN', 404],
  ['BUKAN_PEMEGANG', 403],
  ['WAKTU_TIDAK_MASUK_AKAL', 400],
  ['PELAKU_TIDAK_AKTIF', 403],
  ['BUKAN_ADMIN', 403],
  ['TIDAK_BERWENANG', 403],
  ['SASARAN_TIDAK_DITEMUKAN', 404],
  ['BATAS_LAJU', 429],
  ['BR_70_KASUBDIT_TERAKHIR', 409],
  ['MASUKAN_TIDAK_LENGKAP', 400],
  ['NRP_SUDAH_TERPAKAI', 409],
  ['PERLU_PEMULIHAN', 409],
]

export function galatKeRespons(pesan: string): Response {
  for (const [kode, status] of PEMETAAN) {
    if (pesan.includes(kode)) {
      return jsonRespons({ kode, keterangan: pesan.replace(/^.*?:\s*/, '') }, status)
    }
  }
  return jsonRespons({ kode: 'GALAT_INTERNAL', keterangan: 'Terjadi kesalahan tak terduga' }, 500)
}
