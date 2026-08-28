-- =====================================================================
-- 0004 — Fungsi bantu kewenangan pada skema sipantau_auth
-- Sumber: docs/10-modul-6.1-auth.md Addendum 6.1-T Bagian 1 [FINAL]
-- =====================================================================
--
-- RANCANGAN B DIPILIH: peran dan unit TIDAK ditanamkan di dalam token,
-- melainkan dibaca dari tabel users pada tiap kueri. Alasannya keamanan,
-- bukan kerapian — pada rancangan token, pengguna yang perannya baru
-- diturunkan tetap memegang kewenangan lama sampai tokennya kedaluwarsa
-- (bawaan sampai satu jam). Pada sistem berisi data perkara, jendela
-- selebar itu tidak dapat diterima.
--
-- Akibatnya KP-6.1-22 terpenuhi tanpa mekanisme apa pun: tidak ada token
-- yang perlu disegarkan karena peran memang tidak pernah ada di dalamnya.
--
-- TIGA HAL YANG WAJIB ADA PADA SETIAP FUNGSI DI BAWAH:
--   security definer  — melewati RLS tabel users. Tanpa ini, kebijakan
--                       pada users yang memanggil peran_saya() akan
--                       memanggil dirinya sendiri: rekursi tak berhingga.
--                       Ini kesalahan paling sering pada pola ini.
--   stable            — hasil tidak berubah dalam satu pernyataan,
--                       boleh disimpan sementara.
--   set search_path = '' — mengunci jalur pencarian nama. Konsekuensinya
--                       seluruh nama tabel WAJIB berskema lengkap.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fungsi 1 — peran pengguna yang sedang masuk
-- Mengembalikan NULL bila akun tidak aktif, sehingga seluruh kebijakan
-- yang membandingkannya otomatis gagal tertutup (KP-6.1-24).
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.peran_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select peran::text
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

revoke execute on function sipantau_auth.peran_saya() from public;
grant execute on function sipantau_auth.peran_saya() to authenticated;

-- ---------------------------------------------------------------------
-- Fungsi 2 — unit pengguna yang sedang masuk
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.unit_saya()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select unit_id
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

revoke execute on function sipantau_auth.unit_saya() from public;
grant execute on function sipantau_auth.unit_saya() to authenticated;

-- ---------------------------------------------------------------------
-- Fungsi 4 — penanda Perangkat Terdaftar
--
-- Fungsi 3 (penugasan_yang_saya_awasi) TIDAK ada di sini melainkan di
-- migrasi Modul 6.2, karena ia membaca public.penugasan_panit yang belum
-- lahir pada titik ini. Dengan search_path terkunci, fungsi berbahasa sql
-- divalidasi saat dibuat, jadi tabelnya wajib sudah ada.
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.perangkat_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select penanda_perangkat
  from public.perangkat_masuk
  where user_id = (select auth.uid())
$$;

revoke execute on function sipantau_auth.perangkat_saya() from public;
grant execute on function sipantau_auth.perangkat_saya() to authenticated;

-- ---------------------------------------------------------------------
-- CATATAN CELAH YANG PERNAH TERJADI (docs/CLAUDE.md §11)
--
-- PostgreSQL memberi EXECUTE kepada PUBLIC secara bawaan setiap kali
-- `create function` dijalankan. Tanpa `revoke ... from public` di atas,
-- peran anon sebenarnya punya hak menjalankan fungsi-fungsi ini.
-- Pencabutan itu sebab itu bagian dari berkas ini, bukan tambalan
-- di migrasi belakangan.
-- ---------------------------------------------------------------------
