-- =====================================================================
-- 0040 — kirim_titik_native: penjaga Titik ganda
--
-- Menutup cacat yang ditemukan dari uji lapangan sungguhan: posisi di
-- peta MEMBEKU sepanjang Sesi Tugas berjalan meski APK terbuka, dan
-- baru berpindah setelah sesi ditutup lalu dibuka lagi.
--
-- Sebabnya bukan di sini melainkan di klien: jalur JS dibungkam begitu
-- token native berhasil diterbitkan, dengan anggapan kode native sudah
-- mengirim sendiri. Token terbit hanya membuktikan MIGRASINYA
-- terpasang, sama sekali bukan membuktikan Fungsi Tepi titik-native
-- sudah di-deploy dan menjawab — dan pustaka pelacakan tidak punya
-- percobaan ulang maupun laporan balik ke JS, jadi POST yang menjawab
-- 404 membuang seluruh Titik tanpa satu pun tanda.
--
-- Klien sudah diperbaiki supaya JS SELALU mengirim. Berkas ini
-- mengurus akibatnya: kedua jalur kini hidup berdampingan, jadi
-- gandanya dicegah di sini.
-- =====================================================================

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

  -- PENJAGA GANDA (0040).
  --
  -- Sejak perbaikan lapangan, jalur JS TIDAK PERNAH LAGI dibungkam:
  -- selama aplikasi masih hidup ia yang mengirim, sebab ia andal dan
  -- melaporkan galatnya. Kode native mengirim SEJAJAR dengannya dari
  -- pembaruan lokasi yang sama, jadi tanpa penjaga ini satu posisi
  -- tercatat dua kali — jejak Rute ganda dan location_logs (tabel
  -- tercepat tumbuh di sistem ini) membesar dua kali lipat.
  --
  -- Digantinya di sini, BUKAN dengan membungkam JS seperti dulu:
  -- membungkam JS berarti seluruh perekaman bergantung pada jalur yang
  -- tidak punya percobaan ulang dan tidak melaporkan kegagalan sama
  -- sekali. Bila jalur itu diam-diam gagal, tidak ada yang tersisa.
  --
  -- Ambang 10 detik dipilih dengan sengaja di bawah jeda antar-Titik
  -- (15 detik): kedua jalur berangkat dari pembaruan lokasi yang SAMA
  -- sehingga selisihnya nyaris nol dan pasti tertangkap, sementara
  -- Titik berikutnya yang sah (>=15 detik kemudian) tidak pernah ikut
  -- tersaring. Ketika aplikasi sudah mati dan JS ikut mati, tidak ada
  -- Titik pendahulu yang menghalangi — native merekam seperti biasa.
  -- Kalau JS gagal karena jaringan, native juga tetap lolos: itu bonus
  -- ketahanan, bukan efek samping.
  if exists (
    select 1 from public.location_logs
     where sesi_tugas_id = v_token.sesi_tugas_id
       and direkam_pada > now() - interval '10 seconds'
  ) then
    return null;
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


revoke execute on function public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean) from public;
grant execute on function public.kirim_titik_native(
  text, numeric, numeric, numeric, numeric, numeric, boolean) to service_role;
