-- =====================================================================
-- 0066 — Keadaan gerak ikut sampai ke peta langsung
--
-- titik_aktivitas (0057, 0065) sudah menjawab diam/berjalan/berkendara,
-- tetapi peta langsung tidak pernah membacanya: penanda petugas digerakkan
-- oleh Realtime pada public.posisi_terkini, dan tabel itu tidak membawa
-- keterangan gerak sama sekali. Akibatnya peta tetap menarik garis ke
-- setiap pembacaan baru walau petugasnya berdiri diam — dan karena
-- pembacaan saat diam adalah sebaran derau, garisnya menjadi jaring.
--
-- Menanyakannya lewat kueri tambahan tiap Titik masuk akan meniadakan
-- seluruh guna Realtime. Karena itu jawabannya dititipkan pada baris yang
-- memang sudah dikirim.
--
-- Kolom ini TIDAK ikut dalam daftar `do update set` milik upsert di
-- fn_catat_titik (0062), sehingga nilainya bertahan melewati Titik-Titik
-- berikutnya dan hanya berubah bila jalur native memperbaruinya. Itu
-- disengaja: fn_catat_titik tidak tahu apa-apa tentang sensor, dan
-- membuatnya tahu berarti menulis ulang fungsi terpanjang di proyek ini.
--
-- Yang disimpan adalah jawaban yang DIPAKAI, bukan sensor mentahnya:
-- sensor bila ada, kecepatan bila tidak. Aturannya sama persis dengan
-- titik_aktivitas, supaya peta langsung dan riwayat rute tidak pernah
-- menyebut Titik yang sama dengan dua sebutan berbeda.
--
-- Akibat sampingan yang disengaja: jalur ini bekerja SEBELUM APK dengan
-- sensor terpasang. Perangkat lama yang tetap melaporkan kecepatan sudah
-- cukup untuk membuat peta berhenti menggambar jaring; sensor nanti
-- hanya membuat jawabannya lebih tahan terhadap loncatan GPS.
--
-- Titik dari jalur web tidak lewat sini dan meninggalkan kolomnya NULL.
-- NULL berarti "tidak diketahui", dan peta wajib memperlakukannya persis
-- seperti sebelum migrasi ini — bergerak seperti biasa. Ketidaktahuan
-- tidak boleh membekukan penanda siapa pun.
-- =====================================================================

alter table public.posisi_terkini
  add column if not exists aktivitas public.jenis_aktivitas_titik;

comment on column public.posisi_terkini.aktivitas is
  'Keadaan gerak yang DIPAKAI untuk pembacaan terakhir: sensor perangkat bila ada, turunan kecepatan bila tidak. NULL = tidak diketahui (jalur web, atau perangkat lama tanpa kecepatan) dan WAJIB diperlakukan peta sebagai bergerak biasa, bukan diam.';

-- ---------------------------------------------------------------------
-- kirim_titik_native_borongan — disalin utuh dari 0065, ditambah
-- pembaruan posisi_terkini.aktivitas SEKALI di akhir kelompok.
--
-- Sekali di akhir, bukan tiap Titik: satu kelompok bisa berisi 200 Titik
-- dan yang berarti bagi peta hanyalah keadaan terakhir. Yang dipakai
-- adalah Titik dengan waktu rekam TERBARU di kelompok itu, bukan yang
-- terakhir dalam larik — antrean perangkat yang terkuras setelah lama
-- tanpa sinyal tidak menjamin urutan kirimnya sama dengan urutan waktu.
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
  v_aktivitas_akhir public.jenis_aktivitas_titik;
  v_waktu_akhir     timestamptz;
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
      -- sebelum migrasi 0065, supaya perangkat yang masih di lapangan
      -- tidak berubah perilakunya hanya karena basis datanya diperbarui.
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

    -- Keadaan gerak untuk peta: sensor lebih dulu, kecepatan sebagai
    -- cadangan — aturan yang sama dengan titik_aktivitas.
    if v_waktu_akhir is null or v_direkam > v_waktu_akhir then
      v_waktu_akhir := v_direkam;
      v_aktivitas_akhir := coalesce(
        v_sensor,
        public.aktivitas_dari_kecepatan(nullif(v_butir->>'kecepatan_mps', '')::numeric)
      );
    end if;

    v_jumlah := v_jumlah + 1;
  end loop;

  -- Hanya bila benar-benar ada jawaban, dan hanya bila Titik ini memang
  -- yang terbaru. Menimpa dengan 'tidak_diketahui' akan menghapus
  -- keterangan yang sudah benar; menimpa dengan Titik lama akan membuat
  -- peta mundur ke keadaan yang sudah lewat.
  if v_aktivitas_akhir is not null
     and v_aktivitas_akhir <> 'tidak_diketahui'::public.jenis_aktivitas_titik then
    update public.posisi_terkini
       set aktivitas = v_aktivitas_akhir
     where sesi_tugas_id = v_token.sesi_tugas_id
       and direkam_pada <= v_waktu_akhir;
  end if;

  update public.token_sesi_native
     set dipakai_pada = now()
   where sesi_tugas_id = v_token.sesi_tugas_id;

  return v_jumlah;
end;
$$;

revoke all on function public.kirim_titik_native_borongan(text, jsonb) from public;
grant execute on function public.kirim_titik_native_borongan(text, jsonb) to service_role;
