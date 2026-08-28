// Klien Supabase untuk Server Component, Server Action, dan proxy.
// Seluruh penulisan data lewat sini, tidak pernah dari komponen tampilan
// (docs/CLAUDE.md §6.3).

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function klienServer() {
  const gudangCookie = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return gudangCookie.getAll()
        },
        setAll(daftar) {
          try {
            daftar.forEach(({ name, value, options }) =>
              gudangCookie.set(name, value, options))
          } catch {
            // Dipanggil dari Server Component, yang tidak boleh menulis
            // cookie. Aman diabaikan: proxy.ts yang menyegarkan sesi.
          }
        },
      },
    },
  )
}
