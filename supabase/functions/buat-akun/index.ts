// Fungsi Tepi buat-akun — TIDAK ADA spesifikasi langkah resmi di PRD
// (docs/60-modul-6.6-6.9-user-notif.md menandai ini sendiri sebagai
// "belum ditetapkan"). Dirancang mengikuti pola reset-kata-sandi +
// KP-6.6-01/02/04/05/06/07/08 + EC-6.6-10.
//
// Masukan : { "nama", "nrp", "pangkat", "peran", "unit_id" } — peran
//           pemeliharaan tidak pernah lewat sini sama sekali (AM-6.6-06)
// Keluaran: { "kata_sandi_sementara": "...", "user_id": "uuid" }
//
// EC-6.6-10: bila baris public.users gagal disisipkan SETELAH pengguna
// auth berhasil dibuat, pengguna auth itu WAJIB dibatalkan sebelum
// mengembalikan galat — tanpa ini NRP tersandera pada sistem autentikasi
// dan tidak dapat dipakai ulang (KP-6.6-08 pada percobaan berikutnya).

import { klienService } from '../_shared/klien.ts'
import { bangkitkanKataSandiSementara } from '../_shared/sandi.ts'
import { jsonRespons, galatKeRespons } from '../_shared/respons.ts'

// Pemeliharaan SENGAJA di luar daftar ini — AM-6.6-06: "tidak dapat
// diberikan lewat antarmuka mana pun. Akun itu dibuat sekali saat
// penyiapan sistem." Harus sama persis dengan PERAN_DAPAT_DIPILIH di
// lib/akun/tipe.ts — dua daftar terpisah untuk hal yang sama cepat atau
// lambat berbeda isi.
const PERAN_VALID = ['kasubdit', 'admin', 'kanit', 'panit', 'anggota'] as const
type PeranValid = (typeof PERAN_VALID)[number]

interface Badan {
  nama?: string
  nrp?: string
  pangkat?: string
  peran?: string
  unit_id?: string | null
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonRespons({ kode: 'METODE_TIDAK_DIIZINKAN' }, 405)
  }

  const kepalaOtorisasi = req.headers.get('Authorization') ?? ''
  const token = kepalaOtorisasi.startsWith('Bearer ') ? kepalaOtorisasi.slice(7) : null
  if (!token) {
    return jsonRespons({ kode: 'TOKEN_TIDAK_SAH', keterangan: 'Kepala Authorization tidak ada' }, 401)
  }

  const svc = klienService()
  const { data: dataToken, error: errToken } = await svc.auth.getUser(token)
  if (errToken || !dataToken.user) {
    return jsonRespons({ kode: 'TOKEN_TIDAK_SAH' }, 401)
  }
  const pelakuId = dataToken.user.id

  let badan: Badan
  try {
    badan = await req.json()
  } catch {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'Badan permintaan bukan JSON' }, 400)
  }

  const nama = badan.nama?.trim()
  const nrp = badan.nrp?.trim()
  const pangkat = badan.pangkat?.trim()
  const peran = badan.peran as PeranValid | undefined
  const unitId = badan.unit_id ?? null

  if (!nama || !nrp || !pangkat || !peran || !PERAN_VALID.includes(peran)) {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'nama/nrp/pangkat/peran wajib diisi dengan peran yang sah' }, 400)
  }
  // KP-6.6-07: unit wajib diisi. Tidak ada lagi cabang "pemeliharaan
  // tidak boleh berunit" di sini — AM-6.6-06 sudah menyingkirkannya dari
  // PERAN_VALID sama sekali, jadi peran di titik ini tidak pernah itu.
  if (!unitId) {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'Unit wajib dipilih untuk peran ini' }, 400)
  }

  // Wewenang dibaca dari basis data, bukan dipercaya dari badan permintaan.
  const { data: baris, error: errPelaku } = await svc
    .from('users')
    .select('peran, aktif')
    .eq('id', pelakuId)
    .maybeSingle()
  if (errPelaku || !baris || baris.peran !== 'admin' || !baris.aktif) {
    return jsonRespons({ kode: 'BUKAN_ADMIN', keterangan: 'Hanya Admin yang dapat membuat akun' }, 403)
  }

  // KP-6.6-07: unit wajib berstatus aktif.
  const { data: unit, error: errUnit } = await svc
    .from('unit')
    .select('aktif')
    .eq('id', unitId)
    .maybeSingle()
  if (errUnit || !unit || !unit.aktif) {
    return jsonRespons({ kode: 'UNIT_TIDAK_AKTIF', keterangan: 'Unit tidak ditemukan atau tidak aktif' }, 400)
  }

  const emailSistem = `${nrp.toLowerCase()}@sipantau.internal`

  // KP-6.6-02/03: NRP yang sudah dipakai baris users mana pun (aktif
  // ATAU nonaktif). email_sistem UNIK di basis data (chk_users_email_
  // sintetis + UNIQUE) — dua baris users tidak pernah bisa berbagi NRP
  // yang sama, aktif atau tidak, jadi keduanya ditolak di sini dengan
  // pesan berbeda. (KP-6.6-03 menyebut "meminta penegasan sebelum
  // melanjutkan" untuk NRP milik akun nonaktif — tidak dapat ditegakkan
  // sebagai "lanjutkan membuat baris baru" tanpa melanggar keunikan itu;
  // arahnya di sini adalah memulihkan akun lama, bukan membuat baru.)
  const { data: pemilikLama } = await svc
    .from('users')
    .select('nama, aktif')
    .eq('email_sistem', emailSistem)
    .maybeSingle()
  if (pemilikLama) {
    if (pemilikLama.aktif) {
      return jsonRespons(
        { kode: 'NRP_SUDAH_TERPAKAI', keterangan: `NRP sudah dipakai oleh ${pemilikLama.nama}` },
        409
      )
    }
    return jsonRespons(
      {
        kode: 'PERLU_PEMULIHAN',
        keterangan: `NRP ini pernah dipakai ${pemilikLama.nama} (kini nonaktif). Aktifkan kembali akun itu, bukan membuat akun baru.`,
      },
      409
    )
  }

  const kataSandiSementara = bangkitkanKataSandiSementara()

  const { data: dataAuth, error: errBuatAuth } = await svc.auth.admin.createUser({
    email: emailSistem,
    password: kataSandiSementara,
    email_confirm: true,
  })
  if (errBuatAuth || !dataAuth.user) {
    // KP-6.6-08: email sintetis sudah ada di sistem autentikasi meski
    // tidak ada baris users (akun yatim) — pemilihan di atas seharusnya
    // sudah menangkap kasus yang PUNYA baris users; ini sisa kasus akun
    // auth tanpa baris users sama sekali.
    return jsonRespons(
      { kode: 'PERLU_PEMULIHAN', keterangan: 'Akun ini perlu dipulihkan, bukan dibuat (sudah ada pada sistem autentikasi)' },
      409
    )
  }
  const akunId = dataAuth.user.id

  const { error: errSisip } = await svc.rpc('admin_buat_akun', {
    p_pelaku_id: pelakuId,
    p_akun_id: akunId,
    p_nama: nama,
    p_nrp: nrp,
    p_email: emailSistem,
    p_pangkat: pangkat,
    p_peran: peran,
    p_unit_id: unitId,
  })
  if (errSisip) {
    // EC-6.6-10: batalkan pengguna auth yang baru dibuat sebelum
    // mengembalikan galat, supaya NRP tidak tersandera.
    await svc.auth.admin.deleteUser(akunId)
    return galatKeRespons(errSisip.message)
  }

  return jsonRespons({ kata_sandi_sementara: kataSandiSementara, user_id: akunId })
})
