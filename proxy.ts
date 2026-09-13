// Gerbang utama. Di Next.js 16 berkas ini bernama proxy.ts dengan fungsi
// bernama `proxy` — bukan lagi middleware.ts/middleware. JANGAN membuat
// ulang middleware.ts, konvensi itu sudah ditinggalkan.
//
// Menegakkan KP-6.1-03, 17, dan 24. KP-6.1-07/08 (paksaan ganti Kata
// Sandi Sementara) sengaja TIDAK lagi ditegakkan di sini — lihat
// komentar di dekat "SENGAJA DICABUT" di bawah.

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { bolehAksesRute, rutePeranIni } from '@/lib/auth/menu'
import type { Peran } from '@/lib/supabase/types'

const RUTE_TERBUKA = ['/masuk']

export async function proxy(permintaan: NextRequest) {
  let jawaban = NextResponse.next({ request: permintaan })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return permintaan.cookies.getAll()
        },
        setAll(daftar) {
          daftar.forEach(({ name, value }) => permintaan.cookies.set(name, value))
          jawaban = NextResponse.next({ request: permintaan })
          daftar.forEach(({ name, value, options }) =>
            jawaban.cookies.set(name, value, options))
        },
      },
    },
  )

  // getClaims(), bukan getSession() maupun getUser().
  //
  // getSession() sekadar membaca cookie yang bisa dipalsukan. getUser()
  // aman, tetapi setiap pemanggilannya adalah permintaan jaringan ke
  // server Auth Supabase — padahal berkas ini berjalan pada SETIAP
  // navigasi, setiap router.refresh() PenyegarOtomatis, dan setiap
  // prefetch tautan menu.
  //
  // getClaims() memverifikasi tanda tangan token secara lokal dengan kunci
  // publik proyek (JWKS, ES256 — diperiksa 13 September 2026) dan tetap
  // menolak token kedaluwarsa, tanpa perjalanan ke server Auth. Token yang
  // sudah kedaluwarsa diperbarui lebih dulu lewat cookie, persis seperti
  // sebelumnya.
  //
  // Yang tidak diketahuinya: sesi yang dicabut di tempat lain sebelum
  // tokennya kedaluwarsa. Celah itu tidak menyangkut hak akses di sini —
  // status aktif akun tetap dibaca dari tabel users di bawah (KP-6.1-24),
  // dan seluruh data tetap dijaga RLS di basis data, bukan oleh berkas ini.
  //
  // Bila proyek kelak kembali ke kunci simetris, getClaims() sendiri jatuh
  // kembali ke getUser(); tidak ada yang perlu diubah di sini.
  const { data: klaim } = await supabase.auth.getClaims()
  const idPengguna = klaim?.claims?.sub
  const jalur = permintaan.nextUrl.pathname

  // ---- belum masuk ----
  if (!idPengguna) {
    if (RUTE_TERBUKA.includes(jalur)) return jawaban
    const ke = permintaan.nextUrl.clone()
    ke.pathname = '/masuk'
    ke.search = ''
    return NextResponse.redirect(ke)
  }

  const { data: baris } = await supabase
    .from('users')
    .select('peran, aktif')
    .eq('id', idPengguna)
    .maybeSingle()

  // Akun dinonaktifkan saat pengguna sedang masuk (KP-6.1-24).
  if (!baris || baris.aktif === false) {
    await supabase.auth.signOut()
    const ke = permintaan.nextUrl.clone()
    ke.pathname = '/masuk'
    ke.search = '?sebab=nonaktif'
    return NextResponse.redirect(ke)
  }

  const peran = baris.peran as Peran

  // KP-6.1-07/08/AM-6.1-04 (paksaan ganti Kata Sandi Sementara) SENGAJA
  // DICABUT di sini — keputusan sadar pemilik produk 8 September 2026,
  // bukan bug maupun tebakan. Penyimpangan dari PRD, dicatat supaya
  // sesi berikutnya tidak mengiranya terlewat. Kolom wajib_ganti_sandi
  // dan halaman /ganti-sandi-wajib TETAP ada (masih diisi buat-akun,
  // reset-kata-sandi, dan seed) tetapi tidak lagi ditegakkan apa pun —
  // pengguna boleh terus memakai kata sandi sementaranya tanpa batas.

  // Sudah masuk tapi membuka halaman masuk atau ganti sandi.
  if (jalur === '/masuk' || jalur === '/ganti-sandi-wajib' || jalur === '/') {
    const ke = permintaan.nextUrl.clone()
    ke.pathname = rutePeranIni(peran)
    ke.search = ''
    return NextResponse.redirect(ke)
  }

  // ---- di luar kewenangan (KP-6.1-17) ----
  // Dialihkan ke beranda perannya disertai pesan sekilas, BUKAN halaman
  // galat — halaman galat justru membenarkan keberadaan halaman itu.
  if (!bolehAksesRute(jalur, peran)) {
    const ke = permintaan.nextUrl.clone()
    ke.pathname = rutePeranIni(peran)
    ke.search = '?pesan=diluar-kewenangan'
    return NextResponse.redirect(ke)
  }

  return jawaban
}

export const config = {
  matcher: [
    // Seluruh jalur kecuali aset statis, berkas gambar, dan pustaka
    // OpenCV.js (rute /opencv-js, murni penyaji berkas statis untuk
    // koreksi scan SPRIN — tanpa data pengguna, tidak perlu gerbang ini).
    '/((?!_next/static|_next/image|favicon.ico|opencv-js|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
