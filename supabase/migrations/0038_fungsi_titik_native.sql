-- =====================================================================
-- 0038 — Dua fungsi Pengiriman Native GPS
--
-- terbitkan_token_sesi_native  dipanggil pemegang sesi sendiri (sesi
--                              masuk biasa), sekali tiap Sesi Tugas
-- kirim_titik_native           dipanggil Fungsi Tepi titik-native saja,
--                              memakai token di atas sebagai kredensial
--
-- Latar belakang lengkap ada di kepala 0037.
-- =====================================================================


-- ---------------------------------------------------------------------
-- terbitkan_token_sesi_native
--
-- Token dikembalikan APA ADANYA tepat sekali, di sini. Sesudah ini yang
-- tersimpan hanya sidiknya, jadi tidak ada satu pun jalan membacanya
-- kembali dari basis data — sama seperti Kata Sandi Sementara pada
-- Manajemen Akun. Penerbitan ulang (mis. aplikasi dipasang ulang)
-- MENGGANTI sidik lama, sehingga token lama seketika tidak berlaku.
-- ---------------------------------------------------------------------
create or replace function public.terbitkan_token_sesi_native(
  p_sesi_id           uuid,
  p_penanda_perangkat text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi  record;
  v_token text;
begin
  if coalesce(btrim(p_penanda_perangkat), '') = '' then
    raise exception 'MASUKAN_TIDAK_LENGKAP: penanda perangkat wajib diisi';
  end if;

  select * into v_sesi from public.sesi_tugas where id = p_sesi_id;
  if not found then
    raise exception 'SESI_TIDAK_DITEMUKAN';
  end if;
  if v_sesi.ditutup_pada is not null then
    raise exception 'SESI_TERTUTUP: Sesi Tugas ini sudah berakhir';
  end if;

  -- Hanya pemegang sesi itu sendiri. Bukan Kanit, bukan Admin —
  -- token ini kemampuan MENULIS posisi atas nama seseorang, dan tidak
  -- seorang pun berhak menerbitkannya untuk orang lain.
  if v_sesi.pengguna_id <> (select auth.uid()) then
    raise exception 'BUKAN_PEMEGANG: Sesi Tugas ini bukan milik Anda';
  end if;

  -- Dua gen_random_uuid() = 64 aksara heksadesimal, ~244 bit acak.
  -- gen_random_uuid() ada di pg_catalog (bawaan PostgreSQL 13+), jadi
  -- tetap terjangkau meski search_path dikosongkan, dan TIDAK menuntut
  -- pgcrypto yang memang sengaja tidak dipasang proyek ini (0001).
  v_token := replace(gen_random_uuid()::text, '-', '')
          || replace(gen_random_uuid()::text, '-', '');

  insert into public.token_sesi_native
    (sesi_tugas_id, token_hash, penanda_perangkat)
  values
    (p_sesi_id, sha256(convert_to(v_token, 'UTF8')), btrim(p_penanda_perangkat))
  on conflict (sesi_tugas_id) do update
     set token_hash        = excluded.token_hash,
         penanda_perangkat = excluded.penanda_perangkat,
         dibuat_pada       = now(),
         dipakai_pada      = null;

  return v_token;
end;
$$;

revoke execute on function public.terbitkan_token_sesi_native(uuid, text) from public;
grant execute on function public.terbitkan_token_sesi_native(uuid, text) to authenticated;


-- ---------------------------------------------------------------------
-- kirim_titik_native
--
-- Titik yang datang dari kode native, tanpa sesi masuk sama sekali.
-- Kredensialnya token pada 0037, bukan auth.uid().
--
-- CATATAN PENTING soal set_config di bawah:
-- fn_catat_titik memeriksa kepemilikan lewat auth.uid(). Fungsi itu
-- TIDAK disalin ulang ke sini dengan sengaja — menyalin badan sepanjang
-- 150 baris berarti dua salinan aturan yang sama (aturan diragukan,
-- lompatan tak wajar, ambang akurasi, pembaruan posisi_terkini dan
-- terakhir_terlihat) yang pasti akan menyimpang satu sama lain suatu
-- saat; CLAUDE.md §11 menyebut persis kegagalan semacam itu.
--
-- Maka yang dilakukan: sesudah token TERBUKTI sah, pemiliknya dibaca
-- DARI BASIS DATA (bukan dari permintaan), lalu dipasang sebagai
-- identitas pemanggil hanya untuk transaksi ini (parameter ketiga
-- set_config = true berarti local, otomatis pulih begitu transaksi
-- selesai). Ini mekanisme yang sama persis dengan yang dipakai seluruh
-- berkas uji RLS proyek ini untuk berpura-pura menjadi seorang
-- pengguna (CLAUDE.md §9) — bukan celah baru, melainkan jalan resmi
-- menyatakan "permintaan ini sah atas nama orang tersebut".
--
-- Tidak ada jalan memalsukannya: yang dipasang berasal dari baris
-- sesi_tugas yang ditunjuk token, dan token tidak pernah menunjuk lebih
-- dari satu sesi.
-- ---------------------------------------------------------------------
create or replace function public.kirim_titik_native(
  p_token         text,
  p_lat           numeric,
  p_lng           numeric,
  p_akurasi_meter numeric,
  p_kecepatan_mps numeric,
  p_arah_derajat  numeric,
  p_lokasi_tiruan boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token record;
  v_sesi  record;
  v_id    uuid;
begin
  if coalesce(btrim(p_token), '') = '' then
    raise exception 'TOKEN_TIDAK_SAH';
  end if;

  select * into v_token from public.token_sesi_native
   where token_hash = sha256(convert_to(p_token, 'UTF8'));
  if not found then
    -- Sengaja pesan yang sama dengan token kosong: pemanggil tidak
    -- perlu tahu apakah tokennya salah bentuk atau sekadar tidak ada.
    raise exception 'TOKEN_TIDAK_SAH';
  end if;

  select * into v_sesi from public.sesi_tugas where id = v_token.sesi_tugas_id;
  if not found then
    raise exception 'TOKEN_TIDAK_SAH';
  end if;

  -- Sesi tertutup = token mati dengan sendirinya. Diperiksa di sini
  -- supaya balasannya jelas (dan Fungsi Tepi dapat menyuruh perangkat
  -- BERHENTI), sekalipun fn_catat_titik juga menolaknya sendiri.
  if v_sesi.ditutup_pada is not null then
    raise exception 'SESI_TERTUTUP: Sesi Tugas ini sudah berakhir, Titik tidak dapat disimpan';
  end if;

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_sesi.pengguna_id::text)::text,
    true
  );

  v_id := public.fn_catat_titik(
    v_token.sesi_tugas_id,
    p_lat,
    p_lng,
    p_akurasi_meter,
    p_kecepatan_mps,
    p_arah_derajat,
    null::smallint,   -- baterai: tidak disediakan pustaka pelacakan
    -- Ambang yang sama persis dengan jalur biasa (app/(app)/tugas/aksi.ts)
    case
      when p_akurasi_meter is not null and p_akurasi_meter <= 50
        then 'gps'::public.sumber_lokasi_titik
      else 'jaringan'::public.sumber_lokasi_titik
    end,
    gen_random_uuid(),
    -- Waktu server, seragam dengan jalur biasa. Pustaka memang
    -- menyertakan stempel waktu perangkat, tetapi memakainya di SINI
    -- saja akan membuat dua jalur memakai dua sumber waktu berbeda
    -- pada satu sesi yang sama. Penyelarasan ke BR-45/KP-6.4-39
    -- (waktu Titik DIHASILKAN, bukan waktu tiba) adalah pekerjaan
    -- tersendiri yang wajib menyentuh KEDUA jalur sekaligus.
    now(),
    v_token.penanda_perangkat,
    v_token.penanda_perangkat,
    coalesce(p_lokasi_tiruan, false)
  );

  update public.token_sesi_native
     set dipakai_pada = now()
   where sesi_tugas_id = v_token.sesi_tugas_id;

  return v_id;
end;
$$;

-- Hanya service_role. TIDAK kepada authenticated (jalur biasa sudah
-- punya kirim_titik) dan sudah pasti TIDAK kepada anon — pemeriksaan
-- token tetap wajib lewat Fungsi Tepi titik-native, supaya percobaan
-- menebak token tidak dapat ditembakkan langsung ke Supabase.
revoke execute on function public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean) from public;
grant execute on function public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean) to service_role;
