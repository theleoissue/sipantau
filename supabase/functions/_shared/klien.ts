// Klien Supabase dipakai bersama ketiga Fungsi Tepi Manajemen Akun.
// Kunci service_role dibaca dari rahasia Fungsi Tepi (Deno.env), TIDAK
// PERNAH dari berkas .env sisi klien (CLAUDE.md §8, docs/10-modul-6.1-auth.md §2.3).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function bacaEnvWajib(nama: string): string {
  const nilai = Deno.env.get(nama)
  if (!nilai) throw new Error(`Variabel lingkungan ${nama} tidak disetel`)
  return nilai
}

export function klienService() {
  return createClient(
    bacaEnvWajib('SUPABASE_URL'),
    bacaEnvWajib('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
