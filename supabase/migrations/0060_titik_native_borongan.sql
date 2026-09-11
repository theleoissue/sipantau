-- =====================================================================
-- 0060 — Jalur native mengirim berkelompok
--
-- Bagian kedua pelacak native milik sendiri (Jalur A5). 0059 membuat
-- satu Titik native dapat membawa antrean_id, umur, dan baterai. Di sini
-- jalur itu dibuat dapat menyetor SEKELOMPOK sekaligus.
--
-- KENAPA PERLU
--
-- Layanan latar depan merekam tiap 3 detik dan menyimpannya ke antrean
-- SQLite di perangkat. Bila tiap Titik dikirim sendiri-sendiri, satu
-- sesi tanpa sinyal selama sejam menghasilkan 1.200 permintaan beruntun
-- begitu sinyal kembali — dan Fungsi Tepi ditagih per pemanggilan.
-- Alasannya sama persis dengan 0058 pada jalur web.
--
-- Token diperiksa SEKALI untuk seluruh kelompok, bukan per Titik: yang
-- diwakilinya memang satu sesi, dan mengulang pencarian hash 200 kali
-- untuk jawaban yang sama tidak menambah keamanan apa pun.
--
-- SATU TRANSAKSI, sama seperti 0058: kelompok yang ditolak tidak
-- menyisakan separuh baris, dan antrean di perangkat menahannya untuk
-- dikirim ulang. antrean_id yang dibuat perangkat membuat percobaan
-- ulang itu tidak pernah menghasilkan baris kembar.
--
-- Fungsi lama kirim_titik_native TIDAK diubah dan TIDAK dibuang: APK
-- yang sudah di lapangan masih memakainya.
-- =====================================================================

create or replace function public.kirim_titik_native_borongan(
  p_token text,
  p_titik jsonb
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token   record;
  v_sesi    record;
  v_butir   jsonb;
  v_jumlah  integer := 0;
  v_direkam timestamptz;
begin
  if coalesce(btrim(p_token), '') = '' then
    raise exception 'TOKEN_TIDAK_SAH';
  end if;

  select * into v_token from public.token_sesi_native
   where token_hash = sha256(convert_to(p_token, 'UTF8'));
  if not found then
    raise exception 'TOKEN_TIDAK_SAH';
  end if;

  select * into v_sesi from public.sesi_tugas where id = v_token.sesi_tugas_id;
  if not found then
    raise exception 'TOKEN_TIDAK_SAH';
  end if;

  -- SENGAJA TIDAK ADA penjaga "sesi sudah ditutup" di sini, berbeda
  -- dari kirim_titik_native. Kelompok yang tertahan tanpa sinyal memang
  -- baru tiba sesudah petugas menutup sesinya, dan 0056 sudah memutuskan
  -- Titik semacam itu WAJIB diterima selama waktu TANGKAPNYA masih di
  -- dalam sesi. Yang memutuskan tetap fn_catat_titik, satu per satu.

  if jsonb_typeof(p_titik) <> 'array' then
    raise exception 'BENTUK_TIDAK_SAH: daftar Titik harus berupa larik';
  end if;

  if jsonb_array_length(p_titik) > 200 then
    raise exception 'TERLALU_BANYAK: maksimal 200 Titik sekali kirim';
  end if;

  -- fn_catat_titik memeriksa kepemilikan lewat auth.uid(). Jalur native
  -- tidak punya sesi masuk, jadi pemiliknya dipinjamkan dari sesi yang
  -- token ini wakili — persis cara kirim_titik_native (0038).
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_sesi.pengguna_id)::text,
    true
  );

  for v_butir in select * from jsonb_array_elements(p_titik)
  loop
    -- UMUR, bukan waktu mutlak: jam HP yang meleset tidak boleh membuat
    -- seluruh Titiknya ditolak sebagai tidak masuk akal.
    v_direkam := now() - (
      coalesce(greatest(nullif(v_butir->>'usia_ms', '')::bigint, 0), 0) || ' milliseconds'
    )::interval;

    perform public.fn_catat_titik(
      v_token.sesi_tugas_id,
      (v_butir->>'lat')::numeric,
      (v_butir->>'lng')::numeric,
      nullif(v_butir->>'akurasi_meter', '')::numeric,
      nullif(v_butir->>'kecepatan_mps', '')::numeric,
      nullif(v_butir->>'arah_derajat', '')::numeric,
      nullif(v_butir->>'baterai_persen', '')::smallint,
      'gps'::public.sumber_lokasi_titik,
      coalesce(nullif(v_butir->>'antrean_id', '')::uuid, gen_random_uuid()),
      v_direkam,
      v_token.penanda_perangkat,
      v_token.penanda_perangkat,
      coalesce((v_butir->>'lokasi_tiruan')::boolean, false)
    );
    v_jumlah := v_jumlah + 1;
  end loop;

  update public.token_sesi_native
     set dipakai_pada = now()
   where sesi_tugas_id = v_token.sesi_tugas_id;

  return v_jumlah;
end;
$$;

revoke all on function public.kirim_titik_native_borongan(text, jsonb) from public;
grant execute on function public.kirim_titik_native_borongan(text, jsonb) to service_role;
