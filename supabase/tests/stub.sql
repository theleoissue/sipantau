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
