-- =====================================================================
-- 0050 — KP-6.9-17: daftarkan notifikasi ke supabase_realtime
--
-- Ditandai PRD sendiri sebagai belum terjawab
-- (docs/60-modul-6.6-6.9-user-notif.md Bagian 12, butir 9: "Tabel
-- notifikasi perlu didaftarkan ke layanan waktu nyata"), dan
-- dikonfirmasi nyata lewat audit 5 September 2026: hanya posisi_terkini
-- (migrasi 0017) yang pernah ditambahkan ke publication supabase_
-- realtime. Langganan di header-aplikasi.tsx
-- (.channel('notifikasi-lonceng-...').on('postgres_changes', {table:
-- 'notifikasi'})) berhasil terpasang tanpa satu pun galat, tetapi TIDAK
-- PERNAH menerima kejadian apa pun — gagal senyap persis pola yang
-- diperingatkan CLAUDE.md §11. Penghitung lonceng karena itu hanya
-- pernah ikut benar saat halaman dimuat ulang, bukan hidup selama
-- aplikasi terbuka seperti dijanjikan KP-6.9-17.
--
-- Penyaringan per penerima TIDAK perlu ditambahkan di sini (beda dari
-- yang disebut PRD sebagai "belum ditetapkan") — Supabase Realtime
-- menjalankan ulang kebijakan RLS SELECT tabel untuk setiap pelanggan
-- sebelum menyalurkan satu baris pun (bukan menyalurkan mentah lalu
-- menyaring di klien). Kebijakan notifikasi_baca_sendiri (0019) sudah
-- membatasi penerima_id = auth.uid(), jadi mendaftarkan tabel ke
-- publication ini SUDAH CUKUP — filter tambahan di sisi klien
-- (header-aplikasi.tsx, `filter: penerima_id=eq.${pengguna.id}`) hanya
-- mempersempit lebih jauh, bukan satu-satunya penjaga.
-- =====================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'notifikasi'
  ) then
    alter publication supabase_realtime add table public.notifikasi;
  end if;
end
$$;
