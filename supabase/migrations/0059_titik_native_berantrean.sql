-- =====================================================================
-- 0059 — Jalur native memakai antrean_id, umur, dan baterai
--
-- Bagian pertama dari pelacak native milik sendiri (Jalur A5).
--
-- MASALAH YANG DITUTUP
--
-- 1. Penjaga ganda 0040 memakai jendela WAKTU: "kalau ada Titik lain
--    dalam 10 detik terakhir, buang". Ambang itu dikalibrasi terhadap
--    jeda 15 detik. Sejak perekaman dipercepat jadi 3 detik (0058 dan
--    perubahan klien yang menyertainya), penjaga itu membuang hampir
--    setiap Titik native — diam-diam, tanpa satu pun galat.
--
--    Penggantinya bukan ambang baru yang ditebak ulang, melainkan
--    antrean_id buatan perangkat: dedup yang TEPAT dan tidak peduli
--    seberapa rapat perekamannya. Persis pelajaran yang sama dengan
--    jalur web pada A1.
--
-- 2. Jalur native tidak pernah dapat membawa WAKTU TANGKAP. Server yang
--    menstempelnya, sehingga Titik yang tertahan di antrean akan
--    tercatat pada waktu tiba — merusak urutan, kecepatan, dan penilaian
--    loncatan. Sama seperti web, yang dikirim adalah UMUR (selisih dua
--    waktu perangkat), bukan waktu mutlak, supaya jam HP yang meleset
--    tidak membuat seluruh Titiknya ditolak.
--
-- 3. Baterai tidak pernah tercatat dari jalur native.
--
-- SELURUH PARAMETER BARU BERNILAI BAWAAN. APK lama di lapangan memanggil
-- bentuk yang lama; panggilan itu tetap sah dan tetap memakai perilaku
-- lama, sehingga pemasangan APK baru tidak harus serentak.
-- =====================================================================

-- Bentuk lama DIBUANG, bukan dibiarkan berdampingan: parameter baru
-- semuanya bernilai bawaan, sehingga panggilan enam argumen akan cocok
-- dengan KEDUA tanda tangan dan PostgreSQL menolaknya sebagai ambigu
-- ("function ... is not unique"). Membuangnya tetap aman bagi APK lama —
-- bentuk barunya menerima panggilan lama apa adanya.
drop function if exists public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean
);

create or replace function public.kirim_titik_native(
  p_token          text,
  p_lat            numeric,
  p_lng            numeric,
  p_akurasi_meter  numeric,
  p_kecepatan_mps  numeric,
  p_arah_derajat   numeric,
  p_lokasi_tiruan  boolean default false,
  p_antrean_id     uuid default null,
  p_usia_ms        bigint default null,
  p_baterai_persen smallint default null
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

  if v_sesi.ditutup_pada is not null then
    raise exception 'SESI_TERTUTUP: Sesi Tugas ini sudah berakhir, Titik tidak dapat disimpan';
  end if;

  -- Waktu tangkap diturunkan dari UMUR terhadap jam SERVER. Tanpa umur
  -- (APK lama), jatuh ke perilaku lama: distempel saat tiba.
  v_direkam := now() - (coalesce(greatest(p_usia_ms, 0), 0) || ' milliseconds')::interval;

  -- PENJAGA GANDA.
  --
  -- Dengan antrean_id, kekembaran ditolak indeks unik pada
  -- location_logs (KP-6.4-19) secara TEPAT — tidak ada lagi tebakan
  -- ambang waktu, dan kerapatan perekaman bebas berubah tanpa
  -- mengubah apa pun di sini.
  --
  -- Jendela 10 detik yang lama HANYA dipakai bila perangkat tidak
  -- mengirim antrean_id (APK lama). Nilainya tetap seperti semula
  -- supaya perilaku APK lama tidak berubah di tengah masa peralihan.
  if p_antrean_id is null then
    if exists (
      select 1 from public.location_logs
       where sesi_tugas_id = v_token.sesi_tugas_id
         and direkam_pada > now() - interval '10 seconds'
    ) then
      return null;
    end if;
  end if;

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_sesi.pengguna_id)::text,
    true
  );

  v_id := public.fn_catat_titik(
    v_token.sesi_tugas_id,
    p_lat,
    p_lng,
    p_akurasi_meter,
    p_kecepatan_mps,
    p_arah_derajat,
    p_baterai_persen,
    'gps',
    coalesce(p_antrean_id, gen_random_uuid()),
    v_direkam,
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

revoke all on function public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean, uuid, bigint, smallint
) from public;
grant execute on function public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean, uuid, bigint, smallint
) to service_role;
