-- =====================================================================
-- 0014 — Perbaikan kebijakan baca users: Kanit tidak boleh melihat
-- Kasubdit sekalipun unit_id-nya kebetulan sama
-- Sumber: docs/00-fondasi.md §2.4 (Kanit hanya melihat Panit dan
-- Anggota di unitnya sendiri)
-- =====================================================================
--
-- DUDUK PERKARANYA
--
-- Kebijakan asli (migrasi 0005) mengizinkan Kanit membaca baris users
-- mana pun yang unit_id-nya sama dengan unitnya sendiri:
--
--   (peran_saya() = 'kanit' and unit_id = unit_saya())
--
-- Akun Pemeliharaan sengaja tidak punya unit_id (null), jadi aman dari
-- klausa ini. Tapi Kasubdit WAJIB punya unit_id — kolomnya NOT NULL
-- untuk seluruh peran organisasi (migrasi 0003, chk_users_unit_sesuai_
-- peran) — dan nilainya diisi salah satu unit sebagai penambat teknis
-- semata (lihat catatan di supabase/seed/002_personel.sql), BUKAN
-- karena Kasubdit sungguhan "berada di" unit itu.
--
-- Akibatnya: begitu Kasubdit ditambatkan ke unit yang sama dengan
-- seorang Kanit, Kanit itu ikut melihat baris Kasubdit di halaman
-- Status Personel — padahal §2.4 hanya menyebut "Panit dan Anggota di
-- unit tersebut". Ditemukan lewat pemeriksaan sungguhan di browser
-- (daftar Status Personel Kanit menampilkan 17 orang, termasuk
-- Kasubdit), bukan dugaan.
--
-- KETETAPAN: klausa Kanit ditambah pembatas peran, persis menirukan
-- kata-kata §2.4.
-- =====================================================================

drop policy if exists "users_baca_sesuai_lingkup" on public.users;

create policy "users_baca_sesuai_lingkup"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
    and peran in ('panit', 'anggota')
  )
);
