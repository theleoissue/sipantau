-- =====================================================================
-- 0019 — Tabel Modul 6.9: notifikasi (bentuk akhir), langganan_dorong
-- Sumber: docs/60-modul-6.6-6.9-user-notif.md Bagian 3 (5.20, 5.23)
-- =====================================================================
--
-- Berkas sumber menyebut `notifikasi` sudah ada sejak Addendum 6.2-T
-- sebagai KERANGKA. Pada penulisan ulang proyek ini modul-modul
-- sebelumnya tidak pernah membuat kerangkanya (docs/CLAUDE.md: PRD
-- tetap acuan, kode dibangun bersih) — jadi tabel ini dibuat langsung
-- dalam bentuk akhirnya di sini: enam belas jenis daftar tertutup
-- (BR-68), tujuan yang tidak selalu berupa SPT (Q-02), dan penanda
-- mendesak untuk dorongan. `create table if not exists` dipertahankan
-- sekadar berjaga-jaga, bukan karena kerangkanya benar ada.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'jenis_tujuan_notifikasi') then
    create type public.jenis_tujuan_notifikasi as enum ('penugasan', 'laporan', 'akun', 'tanpa_tujuan');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- notifikasi — bentuk akhir. Bila tabel belum ada sama sekali (basis
-- data baru yang langsung memasang migrasi ini tanpa kerangka lama),
-- dibuat penuh. Bila sudah ada dari Addendum 6.2-T, ditambah kolomnya.
-- ---------------------------------------------------------------------
create table if not exists public.notifikasi (
  id           uuid primary key default gen_random_uuid(),
  penerima_id  uuid not null references public.users (id),
  jenis        text not null,
  judul        text not null,
  isi          text,
  penugasan_id uuid references public.penugasan (id) on delete cascade,
  dibaca_pada  timestamptz,
  dibuat_pada  timestamptz not null default now()
);

alter table public.notifikasi
  add column if not exists tujuan_jenis public.jenis_tujuan_notifikasi,
  add column if not exists tujuan_id    uuid,
  add column if not exists laporan_id   uuid references public.laporan_harian (id) on delete cascade,
  add column if not exists mendesak     boolean not null default false;

-- BR-68: daftar tertutup enam belas nilai. Ditulis sebagai CHECK, bukan
-- enum — enum PostgreSQL tidak dapat menghapus nilai, sedangkan daftar
-- ini eksplisit dinyatakan tertutup dan hanya bertambah lewat revisi
-- PRD tercatat (sama pertimbangannya dengan sebab_penutupan_sesi, tapi
-- CHECK dipilih di sini karena constraint lama dari kerangka mungkin
-- sudah ada dengan bentuk berbeda dan perlu diganti bersih).
alter table public.notifikasi drop constraint if exists chk_notifikasi_jenis;
alter table public.notifikasi add constraint chk_notifikasi_jenis check (jenis in (
  'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
  'spt_dicabut', 'spt_ditutup',
  'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
  'laporan_perlu_diperbaiki', 'laporan_disetujui',
  'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
  'akun_dinonaktifkan', 'kata_sandi_direset'
));

create index if not exists idx_notifikasi_penerima
  on public.notifikasi (penerima_id, dibuat_pada desc);
-- Q-06/KP-6.9-08: pembacaan cepat "belum dibaca" tanpa menyisir seluruh
-- riwayat pengguna.
create index if not exists idx_notifikasi_belum_dibaca
  on public.notifikasi (penerima_id) where dibaca_pada is null;
-- BR-71: penyusutan hanya menyisir yang sudah dibaca.
create index if not exists idx_notifikasi_penyusutan
  on public.notifikasi (dibaca_pada) where dibaca_pada is not null;

alter table public.notifikasi enable row level security;
-- Hanya select + update (KP-6.9-30, AM-6.9-05): tidak ada insert dari
-- klien — pemberitahuan hanya lahir dari fn_buat_notifikasi (0020).
-- Tidak ada delete — pengguna tidak pernah menghapus pemberitahuan.
grant select, update on public.notifikasi to authenticated;

-- ---------------------------------------------------------------------
-- langganan_dorong — tabel baru
-- ---------------------------------------------------------------------
create table if not exists public.langganan_dorong (
  id                uuid primary key default gen_random_uuid(),
  pengguna_id       uuid not null references public.users (id) on delete cascade,
  penanda_perangkat text not null,
  penanda_dorong    text not null,
  jenis_dimatikan   text[] not null default '{}',
  aktif             boolean not null default true,
  dibuat_pada       timestamptz not null default now(),
  diubah_pada       timestamptz not null default now()
);

comment on column public.langganan_dorong.jenis_dimatikan is
  'BR-75: jenis mendesak diabaikan bila muncul di sini — tidak dapat dimatikan pengguna, ditegakkan di fn_buat_notifikasi, bukan di sini.';

create unique index if not exists uq_langganan_dorong_perangkat
  on public.langganan_dorong (pengguna_id, penanda_perangkat);

alter table public.langganan_dorong enable row level security;
grant select, insert, update on public.langganan_dorong to authenticated;

create policy "langganan_milik_sendiri"
on public.langganan_dorong
for all
to authenticated
using (pengguna_id = (select auth.uid()))
with check (pengguna_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- RLS notifikasi
-- ---------------------------------------------------------------------
create policy "notifikasi_baca_milik_sendiri"
on public.notifikasi
for select
to authenticated
using (penerima_id = (select auth.uid()));

create policy "notifikasi_tandai_milik_sendiri"
on public.notifikasi
for update
to authenticated
using (penerima_id = (select auth.uid()))
with check (penerima_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Kebijakan update di atas TIDAK membatasi kolom mana yang boleh
-- berubah — hak update tingkat baris bukan tingkat kolom. Tanpa pemicu
-- ini, pemilik pemberitahuan dapat mengubah judul/isi riwayatnya
-- sendiri. Pola yang sama dengan fn_jaga_kolom_pelaksana (0009).
-- ---------------------------------------------------------------------
create or replace function public.fn_notifikasi_hanya_tandai_baca()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.penerima_id  := old.penerima_id;
  new.jenis        := old.jenis;
  new.judul        := old.judul;
  new.isi          := old.isi;
  new.tujuan_jenis := old.tujuan_jenis;
  new.tujuan_id    := old.tujuan_id;
  new.penugasan_id := old.penugasan_id;
  new.laporan_id   := old.laporan_id;
  new.mendesak     := old.mendesak;
  new.dibuat_pada  := old.dibuat_pada;

  -- KP-6.9-11: yang pertama dicatat, itu yang berlaku.
  if old.dibaca_pada is not null then
    new.dibaca_pada := old.dibaca_pada;
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_hanya_tandai_baca
  before update on public.notifikasi
  for each row
  execute function public.fn_notifikasi_hanya_tandai_baca();
