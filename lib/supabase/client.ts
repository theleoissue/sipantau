// Klien Supabase untuk Client Component.
// Hanya dipakai hal yang wajib hidup tanpa muat ulang: peta posisi,
// penghitung lonceng, status personel, status Sesi Tugas
// (docs/CLAUDE.md §6.1).

import { createBrowserClient } from '@supabase/ssr'

export function klienBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
