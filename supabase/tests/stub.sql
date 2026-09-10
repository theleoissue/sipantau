-- Tiruan minimal lingkungan Supabase untuk pglite.
-- BUKAN bagian aplikasi. Hanya dipakai menguji migrasi secara lokal.

create schema if not exists auth;
create schema if not exists storage;

create table if not exists auth.users (
  id    uuid primary key,
  email text
);

create table if not exists storage.buckets (
  id     text primary key,
  name   text,
  public boolean default false
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text,
  name       text,
  owner      uuid,
  created_at timestamptz default now()
);

-- auth.uid() membaca klaim JWT palsu yang disetel skrip uji.
--
-- coalesce di dalam WAJIB: tanpa sesi, current_setting mengembalikan
-- string kosong, dan ''::json melempar galat parse yang membingungkan
-- alih-alih menjawab NULL. auth.uid() Supabase sungguhan menjawab NULL
-- pada keadaan itu, jadi tiruan ini harus menirukannya.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::json ->> 'sub',
    ''
  )::uuid
$$;

-- Peran bawaan Supabase.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

grant usage on schema public to anon, authenticated, service_role;

-- Supabase sungguhan memberi hak DML dasar atas storage.objects/buckets
-- kepada authenticated (RLS-nya sendiri yang membatasi baris/berkas
-- mana yang tersentuh) — tanpa baris ini, SETIAP kebijakan RLS Storage
-- proyek ini (wadah 'dokumentasi' sejak 0013, 'surat-spt' sejak 0048)
-- gagal dengan "permission denied for schema storage" pada percobaan
-- pertama, bukan ditolak RLS-nya — lulus-palsu yang menyamar sebagai
-- lolos keamanan padahal cuma tidak pernah benar-benar diuji.
grant usage on schema storage to anon, authenticated, service_role;
grant select on storage.buckets to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;

-- =====================================================================
-- Tiruan PostGIS untuk uji lokal.
--
-- pglite tidak membundel PostGIS. Bentuk di bawah BUKAN pengganti nyata
-- — hanya mendekati perilaku ST_MakePoint/ST_Distance secukupnya supaya
-- CABANG LOGIKA (dalam radius / di luar radius / tanpa koordinat) dapat
-- diuji sungguhan dengan angka geografis nyata, bukan sekadar dilewati.
--
-- Migrasi ASLI di supabase/migrations/ tetap memakai `create extension
-- postgis` dan tipe `geography` sungguhan — tidak menyentuh berkas ini.
--
-- Ditempatkan di skema extensions (bukan public) supaya rujukan
-- berskema lengkap extensions.geography / extensions.ST_MakePoint /
-- extensions.ST_Distance yang dipakai migrasi GPS (0015/0016, mengikuti
-- pola search_path = public, extensions dari 0011) benar-benar
-- menemukan sesuatu di uji lokal ini, persis seperti di Supabase
-- sungguhan yang memasang PostGIS ke skema extensions.
-- =====================================================================
create schema if not exists extensions;

-- Supabase sungguhan mengizinkan peran aplikasi memakai skema ini. Tanpa
-- baris berikut, tiruan di sini menolak setiap kueri BER-security_invoker
-- yang menyentuh PostGIS — celah yang baru ketahuan saat tampilan pertama
-- yang memakainya ditulis. HARUS sesudah skemanya dibuat: grant pada
-- skema yang belum ada menggagalkan seluruh stub.
grant usage on schema extensions to anon, authenticated, service_role;

create type extensions.geography as (lng double precision, lat double precision);

create or replace function extensions.ST_MakePoint(lng double precision, lat double precision)
returns extensions.geography language sql immutable as $$
  select row(lng, lat)::extensions.geography
$$;

create or replace function extensions.ST_Distance(a extensions.geography, b extensions.geography)
returns double precision language plpgsql immutable as $$
declare
  r    double precision := 6371000; -- radius Bumi, meter
  dlat double precision := radians(b.lat - a.lat);
  dlng double precision := radians(b.lng - a.lng);
  h    double precision;
begin
  h := sin(dlat / 2) ^ 2 + cos(radians(a.lat)) * cos(radians(b.lat)) * sin(dlng / 2) ^ 2;
  return r * 2 * atan2(sqrt(h), sqrt(1 - h));
end;
$$;

-- =====================================================================
-- Tiruan pg_cron minimal. Ekstensi sungguhan tidak tersedia di pglite.
-- Migrasi asli memakai `select cron.schedule(...)` sungguhan — cukup
-- ditiru dengan fungsi tanpa-operasi supaya migrasi selesai berjalan.
-- =====================================================================
create schema if not exists cron;

create or replace function cron.schedule(job_name text, schedule text, command text)
returns bigint language sql as $$ select 1::bigint $$;

-- Dipakai butir uji U-6.4-02 (docs/40-modul-6.4-gps.md) untuk menjedakan
-- penjadwal secara sengaja dan membuktikan penutupan Sesi Menggantung
-- TIDAK bergantung padanya (P-04, BR-36).
create or replace function cron.unschedule(job_name text)
returns boolean language sql as $$ select true $$;

-- Tiruan storage.foldername Supabase: memecah path berkas jadi array
-- segmen sebelum nama berkas terakhir.
create or replace function storage.foldername(name text)
returns text[] language sql immutable as $$
  select (regexp_split_to_array(name, '/'))[1 : array_length(regexp_split_to_array(name, '/'), 1) - 1]
$$;

alter table storage.objects enable row level security;
