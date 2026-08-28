// Gerbang utama. Di Next.js 16 berkas ini bernama proxy.ts dengan fungsi
// bernama `proxy` — bukan lagi middleware.ts/middleware. JANGAN membuat
// ulang middleware.ts, konvensi itu sudah ditinggalkan.
//
// Menegakkan KP-6.1-03, 07, 08, 17, dan 24.

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

  // getUser() dan bukan getSession(): yang pertama memverifikasi token ke
  // server Supabase, yang kedua sekadar membaca cookie yang bisa dipalsukan.
  const { data: { user } } = await supabase.auth.getUser()
  const jalur = permintaan.nextUrl.pathname

  // ---- belum masuk ----
  if (!user) {
    if (RUTE_TERBUKA.includes(jalur)) return jawaban
    const ke = permintaan.nextUrl.clone()
    ke.pathname = '/masuk'
    ke.search = ''
    return NextResponse.redirect(ke)
  }

  const { data: baris } = await supabase
    .from('users')
    .select('peran, aktif, wajib_ganti_sandi')
    .eq('id', user.id)
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

  // ---- Kata Sandi Sementara wajib diganti dulu (KP-6.1-07, 08) ----
  // Halaman ini buntu: tidak ada jalan melewatinya (AM-6.1-04).
  if (baris.wajib_ganti_sandi) {
    if (jalur === '/ganti-sandi-wajib') return jawaban
    const ke = permintaan.nextUrl.clone()
    ke.pathname = '/ganti-sandi-wajib'
    ke.search = ''
    return NextResponse.redirect(ke)
  }

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
    // Seluruh jalur kecuali aset statis dan berkas gambar.
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
