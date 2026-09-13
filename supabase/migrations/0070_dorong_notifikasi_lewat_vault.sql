-- =====================================================================
-- 0070 — Pemicu dorongan notifikasi tanpa kredensial di katalog
--
-- TEMUAN
--
-- Diperiksa 13 September 2026 langsung ke basis data produksi:
-- Database Webhook Dashboard `dorong_notifikasi` (AFTER INSERT ON
-- public.notifikasi -> supabase_functions.http_request) menyimpan seluruh
-- header permintaannya sebagai ARGUMEN PEMICU — teks biasa yang terbaca
-- pg_get_triggerdef(). Isinya dua kredensial:
--
--   Authorization: Bearer <kunci legacy service_role yang sedang berlaku>
--   x-sipantau-webhook-secret: <rahasia webhook>
--
-- Katalog terbaca setiap peran yang dapat menjalankan SQL, termasuk
-- supabase_read_only_user (kueri baca-saja Management API). Akses
-- baca-saja cukup untuk memperoleh kunci yang melewati seluruh RLS.
--
-- Header Authorization itu tidak pernah dibutuhkan: kirim-notifikasi-dorong
-- terpasang dengan verify_jwt = false (diperiksa di produksi — tanpa
-- Authorization fungsi membalas 401 dari kodenya sendiri, bukan dari
-- gerbang), dan kewenangannya hanya diputuskan x-sipantau-webhook-secret.
--
-- YANG DILAKUKAN
--
--   1. Pemicu Dashboard dibuang.
--   2. Diganti trg_dorong_notifikasi -> fn_dorong_notifikasi, tertulis di
--      repo. Rahasia dibaca dari Supabase Vault SAAT pemicu berjalan: tidak
--      ada kredensial di definisi pemicu maupun badan fungsi. Tanpa header
--      Authorization.
--   3. Hanya baris mendesak yang diantar (KP-6.9-24). Fungsi Tepi juga
--      memeriksanya sendiri. Bila kelak jenis tidak mendesak ikut didorong
--      (KP-6.9-36), klausa WHEN di bawah dan Fungsi Tepi WAJIB diubah
--      bersamaan — mengubah salah satunya saja gagal diam-diam.
--
-- Bentuk badan permintaan sama dengan Database Webhook (type, table,
-- schema, record, old_record), jadi Fungsi Tepi versi lama maupun yang
-- sudah diperkuat sama-sama menerimanya.
--
-- EC-6.9-08: kegagalan dorongan tidak pernah menggagalkan pembuatan
-- pemberitahuan. Rahasia yang hilang atau pg_net yang menolak hanya
-- menghasilkan WARNING di log Postgres; baris notifikasi tetap tersimpan.
-- Karena WARNING mudah terlewat, prasyarat di awal berkas ini menolak
-- dijalankan sama sekali bila rahasianya belum ada.
--
-- PRASYARAT — dijalankan pemilik di SQL Editor SEBELUM berkas ini:
--
--   select vault.create_secret(
--     '<nilai acak BARU>',
--     'sipantau_push_webhook_secret',
--     'Header x-sipantau-webhook-secret untuk kirim-notifikasi-dorong');
--
-- Nilai yang sama disetel sebagai rahasia Fungsi Tepi PUSH_WEBHOOK_SECRET.
-- Nilai lama WAJIB diganti, bukan dipakai ulang: ia sudah tertulis di
-- katalog dan tercetak di transkrip pemeriksaan. Urutan lengkapnya di
-- docs/SETUP-PUSH-ANDROID.md.
--
-- YANG TIDAK DILAKUKAN
--
-- Hak anon/authenticated atas net.http_request_queue dan
-- net._http_response (diberikan kepada PUBLIC oleh supabase_admin) tidak
-- dicabut di sini:
--   - postgres tidak memegang grant option atas tabel itu (diperiksa),
--     jadi REVOKE-nya hanya WARNING tanpa efek — lulus palsu;
--   - kalaupun berhasil dicabut dari PUBLIC, pemicu ini dan
--     kerja_hangatkan_aplikasi (0068) kehilangan hak menulis antrean.
-- Keduanya tidak terjangkau lewat API selama skema net dan
-- supabase_functions tidak masuk db_schema PostgREST dan pg_graphql tidak
-- aktif (diperiksa: PGRST106). Itu yang dijaga.
--
-- Kunci legacy service_role yang sempat tertulis TIDAK menjadi tidak
-- berlaku karena berkas ini. Rotasinya tugas terpisah: pindah ke kunci
-- sb_publishable / sb_secret, lalu mematikan kunci legacy.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Prasyarat — diperiksa SEBELUM apa pun diubah, supaya dorongan yang
-- sedang berjalan tidak terputus oleh berkas yang gagal di tengah.
-- ---------------------------------------------------------------------
do $$
begin
  if pg_catalog.to_regprocedure('net.http_post(text, jsonb, jsonb, jsonb, integer)') is null then
    raise exception 'PG_NET_TIDAK_ADA: ekstensi pg_net wajib aktif';
  end if;

  if pg_catalog.to_regclass('vault.decrypted_secrets') is null then
    raise exception 'VAULT_TIDAK_ADA: ekstensi supabase_vault wajib aktif';
  end if;

  if not exists (select 1
                   from vault.decrypted_secrets
                  where name = 'sipantau_push_webhook_secret'
                    and coalesce(decrypted_secret, '') <> '') then
    raise exception 'RAHASIA_VAULT_BELUM_ADA: jalankan vault.create_secret dengan nama sipantau_push_webhook_secret lebih dulu';
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- Pemicu Dashboard beserta kredensial di argumennya
-- ---------------------------------------------------------------------
drop trigger if exists dorong_notifikasi on public.notifikasi;

-- ---------------------------------------------------------------------
-- Pengganti
-- ---------------------------------------------------------------------
create or replace function public.fn_dorong_notifikasi()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rahasia text;
begin
  select ds.decrypted_secret
    into v_rahasia
    from vault.decrypted_secrets ds
   where ds.name = 'sipantau_push_webhook_secret'
   limit 1;

  if coalesce(v_rahasia, '') = '' then
    raise warning 'DORONG_DILEWATI: rahasia Vault sipantau_push_webhook_secret tidak ada (notifikasi %)', new.id;
    return null;
  end if;

  -- pg_net ASINKRON: permintaan hanya diantrekan, jadi penyisipan
  -- notifikasi tidak pernah tertahan menunggu Fungsi Tepi.
  perform net.http_post(
    url                  := 'https://fklmpvelyjhsyzkcbnuc.supabase.co/functions/v1/kirim-notifikasi-dorong',
    body                 := jsonb_build_object(
                              'type',       'INSERT',
                              'table',      'notifikasi',
                              'schema',     'public',
                              'record',     to_jsonb(new),
                              'old_record', null),
    params               := '{}'::jsonb,
    headers              := jsonb_build_object(
                              'content-type',              'application/json',
                              'x-sipantau-webhook-secret', v_rahasia),
    timeout_milliseconds := 5000
  );

  return null;
exception when others then
  -- EC-6.9-08. sqlerrm tidak memuat nilai header.
  raise warning 'DORONG_GAGAL: % (notifikasi %)', sqlerrm, new.id;
  return null;
end;
$$;

-- Fungsi pemicu tidak dapat dipanggil lewat RPC, tetapi pola 0069 tetap
-- diikuti: tidak ada alasan hak itu ada.
revoke all on function public.fn_dorong_notifikasi() from public;
revoke all on function public.fn_dorong_notifikasi() from anon, authenticated;

drop trigger if exists trg_dorong_notifikasi on public.notifikasi;
create trigger trg_dorong_notifikasi
  after insert on public.notifikasi
  for each row
  when (new.mendesak)
  execute function public.fn_dorong_notifikasi();

-- ---------------------------------------------------------------------
-- Penjaga di tempat: gagal terlihat jelas, bukan senyap.
--
-- Pemicu apa pun di basis data yang definisinya membawa JWT atau header
-- kredensial — misalnya Database Webhook baru yang dibuat lewat Dashboard
-- dengan tombol "Add auth header with service key" — membatalkan seluruh
-- berkas ini dan namanya disebut. Begitu pula badan fungsi di public yang
-- memuat JWT.
-- ---------------------------------------------------------------------
do $$
declare
  v_pemicu text;
  v_fungsi text;
begin
  select string_agg(t.tgrelid::regclass::text || ':' || t.tgname, ', ' order by t.tgname)
    into v_pemicu
    from pg_catalog.pg_trigger t
   where not t.tgisinternal
     and (pg_catalog.pg_get_triggerdef(t.oid) ~ 'eyJ[A-Za-z0-9_-]{10,}'
          or pg_catalog.pg_get_triggerdef(t.oid) ~* '(authorization|bearer|secret|apikey)');

  if v_pemicu is not null then
    raise exception 'PEMICU_MEMBAWA_KREDENSIAL: %', v_pemicu;
  end if;

  select string_agg(p.oid::regprocedure::text, ', ' order by p.proname)
    into v_fungsi
    from pg_catalog.pg_proc p
   where p.pronamespace = 'public'::regnamespace
     and p.prosrc ~ 'eyJ[A-Za-z0-9_-]{10,}';

  if v_fungsi is not null then
    raise exception 'FUNGSI_MEMBAWA_JWT: %', v_fungsi;
  end if;

  if not exists (select 1
                   from pg_catalog.pg_trigger t
                  where t.tgrelid = 'public.notifikasi'::regclass
                    and t.tgname = 'trg_dorong_notifikasi'
                    and t.tgenabled = 'O') then
    raise exception 'PEMICU_DORONG_TIDAK_TERPASANG';
  end if;
end
$$;
