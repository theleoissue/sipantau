// Fungsi Tepi reset-kata-sandi — docs/10-modul-6.1-auth.md §2.3 (12 langkah).
//
// Masukan : { "user_id_sasaran": "uuid" }
// Keluaran: { "kata_sandi_sementara": "Kn7pRx4mTq2w" }
//
// Wewenang (BR-15) dan batas laju (BR-51 amandemen Modul 6.6, KP-6.6-25)
// diperiksa DI BASIS DATA lewat admin_periksa_reset_kata_sandi SEBELUM
// kata sandi disentuh sama sekali — urutan ini mengikat. Membalik
// urutannya berarti permintaan yang ditolak bisa tetap mengunci akun
// sasaran dengan kata sandi baru yang tak diketahui siapa pun, sebab
// kata sandi tidak dapat "dibatalkan" seperti baris tabel biasa.

import { klienService } from '../_shared/klien.ts'
import { bangkitkanKataSandiSementara } from '../_shared/sandi.ts'
import { jsonRespons, galatKeRespons } from '../_shared/respons.ts'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonRespons({ kode: 'METODE_TIDAK_DIIZINKAN' }, 405)
  }

  // Langkah 1-2: baca dan sahkan token pemanggil.
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

  let badan: { user_id_sasaran?: string }
  try {
    badan = await req.json()
  } catch {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'Badan permintaan bukan JSON' }, 400)
  }
  const sasaranId = badan.user_id_sasaran
  if (!sasaranId || typeof sasaranId !== 'string') {
    return jsonRespons({ kode: 'MASUKAN_TIDAK_LENGKAP', keterangan: 'user_id_sasaran wajib diisi' }, 400)
  }

  // Langkah 3-6: wewenang pemanggil DIBACA DARI BASIS DATA, bukan
  // dipercaya dari badan permintaan (KP-6.1-45). Batas laju BR-51 ikut
  // diperiksa di sini, sebelum kata sandi disentuh.
  const { error: errPeriksa } = await svc.rpc('admin_periksa_reset_kata_sandi', {
    p_pelaku_id: pelakuId,
    p_sasaran_id: sasaranId,
  })
  if (errPeriksa) {
    return galatKeRespons(errPeriksa.message)
  }

  // Langkah 7: bangkitkan Kata Sandi Sementara.
  const kataSandiSementara = bangkitkanKataSandiSementara()

  // Langkah 8: ubah kata sandi sasaran lewat Admin API.
  const { error: errUbahSandi } = await svc.auth.admin.updateUserById(sasaranId, {
    password: kataSandiSementara,
  })
  if (errUbahSandi) {
    return jsonRespons(
      { kode: 'GAGAL_UBAH_SANDI', keterangan: 'Tidak dapat mengubah kata sandi pada sistem autentikasi' },
      500
    )
  }

  // Langkah 9-11: wajib_ganti_sandi, akhiri sesi masuk, jejak audit,
  // pemberitahuan ke sasaran (KP-6.6-26) — satu panggilan basis data.
  const { error: errSelesai } = await svc.rpc('admin_reset_kata_sandi_selesai', {
    p_pelaku_id: pelakuId,
    p_sasaran_id: sasaranId,
  })
  if (errSelesai) {
    // Kata sandi SUDAH terlanjur berubah di langkah 8 (pre-flight barusan
    // lulus, jadi ini seharusnya jarang terjadi — kemungkinan keadaan
    // berubah di antara dua panggilan). Tidak dapat dibatalkan; laporkan
    // apa adanya supaya pemanggil tahu keadaan sasaran sudah berubah.
    return jsonRespons(
      { kode: 'GAGAL_SEBAGIAN', keterangan: 'Kata sandi berubah namun langkah penutup gagal: ' + errSelesai.message },
      500
    )
  }

  // Langkah 12.
  return jsonRespons({ kata_sandi_sementara: kataSandiSementara })
})
