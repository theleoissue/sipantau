-- =====================================================================
-- 0002 — Tabel unit
-- Sumber: docs/10-modul-6.1-auth.md §5.10 [FINAL]
-- =====================================================================
--
-- Dibuat sebagai tabel tersendiri, bukan teks bebas, karena salah ketik
-- pada nama unit langsung merusak pembatasan lingkup data.
--
-- URUTAN: kebijakan RLS tabel ini ada di 0005, bukan di sini. Sebabnya
-- kebijakan itu memanggil sipantau_auth.peran_saya() yang baru lahir di
-- 0004, dan PostgreSQL memeriksa keberadaan fungsi saat kebijakan dibuat.
-- Sampai 0005 dijalankan, tabel ini terkunci total (RLS menyala tanpa
-- satu pun kebijakan = tolak semua), yang justru keadaan aman.
-- =====================================================================

create table if not exists public.unit (
  id               uuid primary key default gen_random_uuid(),
  nama             text        not null unique,
  keterangan       text,
  aktif            boolean     not null default true,
  urutan           integer     not null default 0,
  kode_klasifikasi text,
  dibuat_pada      timestamptz not null default now(),
  diubah_pada      timestamptz not null default now()
);

comment on table public.unit is
  'Daftar unit di bawah Subdit IV. Unit tidak dihapus melainkan dinonaktifkan (BR-12).';
comment on column public.unit.kode_klasifikasi is
  'Menyusun nomor SPT: SP.Gas.Lidik/<agenda>/<bulan romawi>/RES.<kode>/<tahun>/<kesatuan>';

create index if not exists idx_unit_aktif on public.unit (urutan) where aktif = true;

-- ---------------------------------------------------------------------
-- Hak akses — ditulis bersama pembuatannya (docs/01-koreksi.md J.1, J.2).
-- Peran anon tidak pernah diberi hak apa pun; sistem ini tidak punya
-- jalur tanpa masuk.
-- ---------------------------------------------------------------------
alter table public.unit enable row level security;

grant select on public.unit to authenticated;

-- Tidak ada grant insert/update/delete kepada authenticated di sini.
-- Pengelolaan daftar unit adalah kewenangan eksklusif Kasubdit (BR-07)
-- dan berjalan lewat Modul 6.6; grant-nya ditambahkan di migrasi modul itu.
