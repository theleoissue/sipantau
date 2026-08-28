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
-- =====================================================================
create type geography as (lng double precision, lat double precision);

create or replace function ST_MakePoint(lng double precision, lat double precision)
returns geography language sql immutable as $$
  select row(lng, lat)::geography
$$;

create or replace function ST_Distance(a geography, b geography)
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

-- Tiruan storage.foldername Supabase: memecah path berkas jadi array
-- segmen sebelum nama berkas terakhir.
create or replace function storage.foldername(name text)
returns text[] language sql immutable as $$
  select (regexp_split_to_array(name, '/'))[1 : array_length(regexp_split_to_array(name, '/'), 1) - 1]
$$;

alter table storage.objects enable row level security;
