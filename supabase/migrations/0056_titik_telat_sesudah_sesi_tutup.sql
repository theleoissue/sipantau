-- =====================================================================
-- 0056 — Titik yang tertahan di antrean boleh menyusul sesudah Sesi
-- Tugas ditutup
--
-- KEPUTUSAN PEMILIK PRODUK, 11 September 2026. Bukan tebakan.
--
-- BR-01/KP-6.4-12 berbunyi "tidak ada Titik tanpa Sesi Tugas berjalan,
-- dalam keadaan apa pun", dan fn_catat_titik menegakkannya dengan
-- menolak SELURUH Titik begitu ditutup_pada terisi. Akibatnya justru
-- kasus lapangan yang paling sering: sinyal baru pulih sesudah petugas
-- keluar dari kawasan pabrik, sesi sudah ditutup, dan seluruh Titik yang
-- tertahan di antrean HILANG — padahal Titik itu ditangkap saat sesi
-- masih berjalan.
--
-- Yang dilonggarkan hanya WAKTU TIBA, bukan keabsahan Titik: Titik tetap
-- wajib ditangkap DI DALAM rentang sesi (dibuka_pada .. ditutup_pada).
-- Titik yang ditangkap sesudah sesi ditutup tetap ditolak seperti semula.
-- Maksud BR-01 utuh — Titik tetap milik Sesi Tugas yang sah — yang
-- berubah cuma pengakuan bahwa jaringan bisa datang terlambat.
--
-- DUA EFEK SAMPING YANG SENGAJA DIMATIKAN UNTUK SESI TERTUTUP:
--
-- 1. posisi_terkini TIDAK ditulis. fn_tutup_sesi_tugas menghapus baris
--    itu (KP-6.4-30); membiarkan Titik susulan menulisnya berarti
--    membuatnya kembali, dan petugas yang sudah selesai bertugas muncul
--    lagi di peta langsung seolah masih di lapangan. Peta langsung
--    adalah keadaan hidup, bukan arsip.
--
-- 2. titik_penanda TETAP dicatat. Itu bukti lokasi tiruan, dan bukti
--    tidak boleh hilang hanya karena jaringannya telat.
--
-- SEKALIAN: jumlah_titik dulu ikut terkunci pada penjaga yang sama
-- dengan titik_terakhir_pada, sehingga Titik yang datang TIDAK BERURUTAN
-- tidak menambah hitungan sama sekali. Selama tidak ada antrean hal itu
-- hampir tak pernah terjadi; dengan antrean, urutan tiba memang tidak
-- dijamin. Sekarang hitungan selalu bertambah, sementara
-- titik_terakhir_pada tetap hanya boleh maju.
-- =====================================================================

create or replace function public.fn_catat_titik(
  p_sesi_id                uuid,
  p_lat                    numeric,
  p_lng                    numeric,
  p_akurasi_meter          numeric,
  p_kecepatan_mps          numeric,
  p_arah_derajat           numeric,
  p_baterai_persen         smallint,
  p_sumber_lokasi          public.sumber_lokasi_titik,
  p_antrean_id             uuid,
  p_direkam_pada           timestamptz,
  p_penanda_perangkat      text,
  p_penanda_perangkat_asal text,
  p_lokasi_tiruan          boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi         record;
  v_id           uuid;
  v_sebab        public.sebab_diragukan_titik;
  v_akurasi_buruk boolean := false;
  v_lompatan     boolean := false;
  v_wajar        record;
  v_jarak        numeric;
  v_detik        numeric;
  v_kecepatan_terhitung numeric;
  v_terlambat    boolean;
begin
  select * into v_sesi from public.sesi_tugas where id = p_sesi_id;

  if not found then
    raise exception 'SESI_TIDAK_DITEMUKAN';
  end if;

  -- BR-01 / KP-6.4-12: tidak ada Titik tanpa Sesi Tugas berjalan, dalam
  -- keadaan apa pun.
  -- Dilonggarkan 0056: Titik boleh MENYUSUL sesudah sesi ditutup asalkan
  -- ditangkapnya masih di dalam rentang sesi. Yang ditangkap SESUDAH
  -- penutupan tetap ditolak.
  if v_sesi.ditutup_pada is not null and p_direkam_pada > v_sesi.ditutup_pada then
    raise exception 'SESI_TERTUTUP: Sesi Tugas ini sudah berakhir, Titik tidak dapat disimpan';
  end if;

  if v_sesi.pengguna_id <> (select auth.uid()) then
    raise exception 'BUKAN_PEMEGANG: Sesi Tugas ini bukan milik Anda';
  end if;

  -- KP-6.4-21, tiga pemeriksaan waktu — SATU-SATUNYA alasan Titik
  -- ditolak (aturan modul butir 5). Bukan soal mutu, soal dapat
  -- dipercaya atau tidak.
  if p_direkam_pada > now() + interval '5 minutes' then
    raise exception 'WAKTU_TIDAK_MASUK_AKAL: waktu Titik berada di masa depan';
  end if;
  if p_direkam_pada < v_sesi.dibuka_pada then
    raise exception 'WAKTU_TIDAK_MASUK_AKAL: waktu Titik mendahului Mulai Tugas';
  end if;

  v_terlambat := (now() - p_direkam_pada) > interval '5 minutes';

  -- KP-6.4-14 DIPERKETAT (0051): 30 meter, bukan seratus seperti
  -- tertulis PRD — lihat catatan penyimpangan di atas.
  if p_akurasi_meter is not null and p_akurasi_meter > 30 then
    v_akurasi_buruk := true;
  end if;

  -- KP-6.4-15: kecepatan tersirat terhadap Titik WAJAR sebelumnya
  -- melebihi 150 km/j (41.6667 m/s). Titik yang sudah diragukan tidak
  -- dipakai sebagai pembanding, supaya satu lompatan tidak menulari
  -- seluruh titik sesudahnya.
  select lat, lng, direkam_pada into v_wajar
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
   order by direkam_pada desc limit 1;

  if found then
    v_detik := extract(epoch from (p_direkam_pada - v_wajar.direkam_pada));
    if v_detik > 0 then
      v_jarak := extensions.ST_Distance(
        extensions.ST_MakePoint(v_wajar.lng, v_wajar.lat)::extensions.geography,
        extensions.ST_MakePoint(p_lng, p_lat)::extensions.geography
      );
      v_kecepatan_terhitung := v_jarak / v_detik;
      if v_kecepatan_terhitung > 41.6667 then
        v_lompatan := true;
      end if;
    end if;
  end if;

  v_sebab := case
    when v_akurasi_buruk and v_lompatan then 'keduanya'
    when v_akurasi_buruk then 'akurasi_buruk'
    when v_lompatan then 'lompatan_tidak_wajar'
    else null
  end;

  -- KP-6.4-19: antrean_id unik menangkal kiriman kembar. Pengiriman
  -- ulang karena jawaban server tidak sampai berakhir tenang, tanpa
  -- baris kedua.
  insert into public.location_logs
    (sesi_tugas_id, penugasan_id, pengguna_id, lat, lng, akurasi_meter,
     kecepatan_mps, arah_derajat, baterai_persen, sumber_lokasi,
     diragukan_sebab, antrean_id, direkam_pada, diterima_terlambat,
     penanda_perangkat, penanda_perangkat_asal)
  values
    (p_sesi_id, v_sesi.penugasan_id, v_sesi.pengguna_id, p_lat, p_lng, p_akurasi_meter,
     p_kecepatan_mps, p_arah_derajat, p_baterai_persen, p_sumber_lokasi,
     v_sebab, p_antrean_id, p_direkam_pada, v_terlambat,
     p_penanda_perangkat, p_penanda_perangkat_asal)
  on conflict (antrean_id) do nothing
  returning id into v_id;

  if v_id is null then
    -- Kiriman kembar: baris sudah ada, tidak ada efek samping kedua kalinya.
    select id into v_id from public.location_logs where antrean_id = p_antrean_id;
    return v_id;
  end if;

  -- KP-6.4-17 / BR-61: baris terpisah, hanya dibuat bila benar tiruan.
  if p_lokasi_tiruan then
    insert into public.titik_penanda (location_log_id, penugasan_id, unit_id, lokasi_tiruan)
    select v_id, v_sesi.penugasan_id, p.unit_id, true
      from public.penugasan p where p.id = v_sesi.penugasan_id;
  end if;

  -- KP-6.4-13: sesi_tugas dan posisi_terkini diperbarui dalam transaksi
  -- yang sama dengan penyisipan Titik.
  -- 0056: hitungan SELALU bertambah; hanya titik_terakhir_pada yang tidak
  -- boleh mundur. Sebelumnya keduanya terikat satu penjaga, sehingga Titik
  -- yang tiba tidak berurutan (lumrah pada antrean luring) tidak terhitung.
  update public.sesi_tugas
     set jumlah_titik        = jumlah_titik + 1,
         titik_terakhir_pada = greatest(coalesce(titik_terakhir_pada, p_direkam_pada), p_direkam_pada),
         diubah_pada         = now()
   where id = p_sesi_id;

  -- 0056: peta langsung adalah keadaan HIDUP. fn_tutup_sesi_tugas
  -- menghapus baris ini (KP-6.4-30); membiarkan Titik susulan menulis
  -- ulang berarti memunculkan kembali petugas yang sudah selesai
  -- bertugas seolah masih di lapangan.
  if v_sesi.ditutup_pada is null then
    insert into public.posisi_terkini
      (sesi_tugas_id, penugasan_id, pengguna_id, unit_id, lat, lng,
       akurasi_meter, baterai_persen, sumber_lokasi, direkam_pada, diubah_pada)
    select p_sesi_id, v_sesi.penugasan_id, v_sesi.pengguna_id, p.unit_id, p_lat, p_lng,
           p_akurasi_meter, p_baterai_persen, p_sumber_lokasi, p_direkam_pada, now()
      from public.penugasan p where p.id = v_sesi.penugasan_id
    on conflict (sesi_tugas_id) do update
       set lat            = excluded.lat,
           lng            = excluded.lng,
           akurasi_meter  = excluded.akurasi_meter,
           baterai_persen = excluded.baterai_persen,
           sumber_lokasi  = excluded.sumber_lokasi,
           direkam_pada   = excluded.direkam_pada,
           diubah_pada    = now()
     -- Dua pembaruan hampir bersamaan (6.4.6): yang lebih lama tidak
     -- menimpa yang lebih baru.
     where excluded.direkam_pada > public.posisi_terkini.direkam_pada;
  end if;

  -- terakhir_terlihat bertahan MELEWATI penutupan sesi — posisi_terkini
  -- dihapus saat sesi ditutup, jadi ini satu-satunya jejak "kapan
  -- terakhir terlihat" yang tersisa setelahnya. Penjaga "lebih baru
  -- saja" yang sama seperti posisi_terkini di atas. Membuka jalur_resmi
  -- tepat sebelum menyentuh users: kolom terakhir_terlihat dikunci
  -- fn_jaga_kolom_users (0041), dan inilah SATU-SATUNYA penulis yang
  -- sah. Cakupannya transaksi (parameter ketiga true) sehingga pulih
  -- sendiri begitu transaksi selesai — pola yang sama dengan fungsi
  -- kata sandi di 0006.
  perform set_config('sipantau.jalur_resmi', 'on', true);

  update public.users
     set terakhir_terlihat = p_direkam_pada
   where id = v_sesi.pengguna_id
     and (terakhir_terlihat is null or terakhir_terlihat < p_direkam_pada);

  return v_id;
end;
$$;
