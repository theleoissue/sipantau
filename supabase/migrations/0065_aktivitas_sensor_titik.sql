-- =====================================================================
-- 0065 — Keadaan gerak dari SENSOR BADAN HP, dan sumber lokasi yang jujur
--
-- Dua hal, keduanya tentang satu penyakit yang sama: peta menyimpulkan
-- gerak dari perpindahan koordinat, padahal koordinatnya sendiri yang
-- sedang meleset.
--
-- 1. aktivitas_sensor
--    Android menyediakan pengenalan aktivitas berbasis akselerometer dan
--    giroskop (Activity Recognition, sudah ada di play-services-location
--    yang terpasang). Ia menjawab diam / berjalan / berkendara TANPA
--    memakai GPS sama sekali, sehingga TIDAK DAPAT DITIPU oleh loncatan
--    posisi.
--
--    Ini penting justru pada kasus yang paling merepotkan: petugas berdiri
--    diam di dalam gedung, GPS melompat 60 meter dalam 3 detik, dan
--    kecepatan turunan membacanya 20 m/s — "berkendara". Sensor badan HP
--    tetap menjawab diam, karena badan HP-nya memang tidak ke mana-mana.
--
--    Nilainya memakai daftar tertutup YANG SUDAH ADA,
--    public.jenis_aktivitas_titik (0057). Tidak dibuat kosakata kedua:
--    dua daftar untuk hal yang sama selalu berakhir saling menyimpang
--    (CLAUDE.md §11, BR-77).
--
-- 2. sumber_lokasi
--    kirim_titik_native_borongan menuliskan 'gps' sebagai NILAI KERAS
--    untuk setiap Titik native. Padahal yang memberi posisi adalah
--    FusedLocationProvider — perpaduan GNSS, Wi-Fi, dan seluler — dan
--    daftar nilainya sudah menyediakan 'fusi'.
--
--    Akibatnya seluruh 10.631 Titik yang sudah masuk mengaku 'gps'
--    padahal tidak seorang pun pernah menyatakannya. Kolom itu terlihat
--    berisi keterangan, padahal isinya nilai bawaan. Belum merugikan hari
--    ini, tetapi begitu dipakai menilai mutu Titik ia akan menyesatkan.
--
--    Sesudah migrasi ini, sumber dibaca dari kiriman. APK lama yang tidak
--    mengirimnya tetap jatuh ke 'gps' seperti sebelumnya, jadi perangkat
--    yang masih di lapangan tidak berubah perilakunya.
--
-- fn_catat_titik SENGAJA TIDAK DISENTUH. Menambah parameter ke sana
-- menuntut drop + tulis ulang seluruh badannya — fungsi terpanjang di
-- proyek ini, dengan tujuh aturan penolakan di dalamnya — hanya untuk
-- satu kolom tambahan. Nilainya ditulis sesudah baris terbentuk, di
-- dalam transaksi yang sama, dari dalam fungsi security definer yang
-- sama. Tidak ada hak tulis baru yang dibuka: location_logs tetap hanya
-- ber-grant select bagi authenticated.
-- =====================================================================

alter table public.location_logs
  add column if not exists aktivitas_sensor public.jenis_aktivitas_titik;

comment on column public.location_logs.aktivitas_sensor is
  'Keadaan gerak menurut sensor gerak perangkat (Activity Recognition), BUKAN turunan koordinat. NULL berarti perangkat tidak melaporkannya — APK lama, atau sensor belum yakin. Tidak dapat ditipu loncatan GPS, karena tidak memakai GPS.';

-- ---------------------------------------------------------------------
-- kirim_titik_native_borongan — ditulis ulang utuh dari 0060.
-- Yang berubah hanya: sumber dibaca dari kiriman, id Titik ditangkap,
-- dan aktivitas_sensor ditulis bila dikirim. Sisanya sama persis.
-- ---------------------------------------------------------------------
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
  v_id      uuid;
  v_sensor  public.jenis_aktivitas_titik;
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

    select public.fn_catat_titik(
      v_token.sesi_tugas_id,
      (v_butir->>'lat')::numeric,
      (v_butir->>'lng')::numeric,
      nullif(v_butir->>'akurasi_meter', '')::numeric,
      nullif(v_butir->>'kecepatan_mps', '')::numeric,
      nullif(v_butir->>'arah_derajat', '')::numeric,
      nullif(v_butir->>'baterai_persen', '')::smallint,
      -- APK lama tidak mengirim 'sumber'. Jatuhnya ke 'gps' persis seperti
      -- sebelum migrasi ini, supaya perangkat yang masih di lapangan tidak
      -- berubah perilakunya hanya karena basis datanya diperbarui.
      coalesce(
        nullif(v_butir->>'sumber', '')::public.sumber_lokasi_titik,
        'gps'::public.sumber_lokasi_titik
      ),
      coalesce(nullif(v_butir->>'antrean_id', '')::uuid, gen_random_uuid()),
      v_direkam,
      v_token.penanda_perangkat,
      v_token.penanda_perangkat,
      coalesce((v_butir->>'lokasi_tiruan')::boolean, false)
    ) into v_id;

    -- 'tidak_diketahui' diperlakukan sama dengan tidak dikirim: ia
    -- KETIADAAN jawaban, bukan jawaban. Menyimpannya membuat pembaca
    -- mengira ada keterangan di situ.
    v_sensor := nullif(
      nullif(v_butir->>'aktivitas_sensor', '')::public.jenis_aktivitas_titik,
      'tidak_diketahui'::public.jenis_aktivitas_titik
    );

    if v_sensor is not null and v_id is not null then
      update public.location_logs
         set aktivitas_sensor = v_sensor
       where id = v_id
         and aktivitas_sensor is null;   -- kiriman kembar tidak menulis dua kali
    end if;

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

-- ---------------------------------------------------------------------
-- titik_aktivitas — sensor menang atas kecepatan.
--
-- Dibuang lalu dibuat ulang, bukan `create or replace`: kolom baru
-- disisipkan sebelum `aktivitas`, dan `create or replace view` menolak
-- perubahan urutan kolom. Hak aksesnya diberikan kembali di berkas yang
-- sama (§5.1), dan security_invoker dinyatakan kembali (§5.2) — tanpa
-- itu tampilan melewati seluruh RLS tanpa satu pun galat.
-- ---------------------------------------------------------------------
drop view if exists public.titik_aktivitas;

create view public.titik_aktivitas
with (security_invoker = on)
as
with tepercaya as (
  select
    ll.*,
    lag(ll.lat)          over w as lat_sebelum,
    lag(ll.lng)          over w as lng_sebelum,
    lag(ll.direkam_pada) over w as waktu_sebelum
  from public.location_logs ll
  where ll.diragukan_sebab is null
  window w as (partition by ll.sesi_tugas_id order by ll.direkam_pada)
),
berkecepatan as (
  select
    t.*,
    (case
      when t.kecepatan_mps is not null then t.kecepatan_mps
      when t.waktu_sebelum is null then null
      when extract(epoch from (t.direkam_pada - t.waktu_sebelum)) <= 0 then null
      else public.jarak_meter(t.lat_sebelum, t.lng_sebelum, t.lat, t.lng)
           / extract(epoch from (t.direkam_pada - t.waktu_sebelum))
    end)::numeric as kecepatan_efektif_mps
  from tepercaya t
)
select
  b.id,
  b.sesi_tugas_id,
  b.penugasan_id,
  b.pengguna_id,
  b.lat,
  b.lng,
  b.akurasi_meter,
  b.direkam_pada,
  b.kecepatan_efektif_mps,
  b.aktivitas_sensor,
  -- Sensor menang bila ada. Ia mengukur gerak BADAN perangkat; kecepatan
  -- efektif hanyalah selisih koordinat dibagi waktu, dan koordinat itulah
  -- yang sedang meleset ketika jawabannya paling dibutuhkan.
  -- nullif: 'tidak_diketahui' dari sensor BUKAN jawaban, ia ketiadaan
  -- jawaban. Tanpa ini ia akan menang atas kecepatan yang justru tahu.
  -- Penjaga yang sama ada di jalur masuk; ditulis di dua tempat dengan
  -- sengaja, sebab baris lama boleh jadi sudah terlanjur menyimpannya.
  coalesce(
    nullif(b.aktivitas_sensor, 'tidak_diketahui'::public.jenis_aktivitas_titik),
    public.aktivitas_dari_kecepatan(b.kecepatan_efektif_mps)
  ) as aktivitas
from berkecepatan b
union all
-- Titik diragukan tetap TAMPIL — ia bukti, bukan sampah — hanya tidak
-- diklasifikasi.
select
  ll.id,
  ll.sesi_tugas_id,
  ll.penugasan_id,
  ll.pengguna_id,
  ll.lat,
  ll.lng,
  ll.akurasi_meter,
  ll.direkam_pada,
  null::numeric,
  ll.aktivitas_sensor,
  'tidak_diketahui'::public.jenis_aktivitas_titik
from public.location_logs ll
where ll.diragukan_sebab is not null;

grant select on public.titik_aktivitas to authenticated;

comment on view public.titik_aktivitas is
  'Titik beserta keadaan geraknya. aktivitas_sensor = jawaban sensor gerak perangkat (boleh NULL); aktivitas = jawaban yang dipakai, sensor lebih dulu, kecepatan sebagai cadangan. Titik diragukan tetap tampil dan tidak diklasifikasi (BR-57).';
