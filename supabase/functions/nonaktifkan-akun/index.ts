// Fungsi Tepi nonaktifkan-akun — docs/01-koreksi.md Bagian W.3.
//
// Masukan : { "user_id_sasaran": "uuid" }
// Keluaran: { "berhasil": true }
//
// HANYA 6 langkah (bukan 7 seperti Q-05 semula): penutupan Sesi Tugas
// dan pemberitahuan Kanit unit SUDAH otomatis lewat pemicu pada tabel
// users (fn_tutup_sesi_akun_nonaktif, fn_notifikasi_akun_nonaktif) begitu
// kolom aktif berubah, dari jalur mana pun — TIDAK diduplikasi di sini.

import { klienService } from '../_shared/klien.ts'
import { jsonRespons, galatKeRespons } from '../_shared/respons.ts'

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

  // Wewenang (hanya Admin), BR-70, aktif=false, akhiri sesi masuk, jejak
  // audit — satu panggilan. Penutupan Sesi Tugas dan notifikasi Kanit
  // menyusul otomatis lewat pemicu pada tabel users begitu transaksi ini
  // komit.
  const { error } = await svc.rpc('admin_nonaktifkan_akun', {
    p_pelaku_id: pelakuId,
    p_sasaran_id: sasaranId,
  })
  if (error) {
    return galatKeRespons(error.message)
  }

  return jsonRespons({ berhasil: true })
})
