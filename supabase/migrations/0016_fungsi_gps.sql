-- =====================================================================
-- 0016 — Fungsi dan pemicu Modul 6.4 (GPS)
-- Sumber: docs/40-modul-6.4-gps.md Bagian 0 (P-01..P-22), Bagian 4
-- (6.4.3, 6.4.4), Bagian 5 (BR-54..67)
-- =====================================================================
--
-- POLA YANG DIPAKAI, SUDAH TERBUKTI DUA KALI DI MODUL SEBELUMNYA
-- (Addendum 6.2-T Bagian 7 untuk Lewat Batas, Addendum 6.3-T Celah 7
-- untuk Belum Melapor): penjadwal (0018) TIDAK PERNAH menjadi
-- satu-satunya jalan menutup Sesi Menggantung. fn_buka_sesi_tugas
-- menutup sendiri sesi basi milik pemanggilnya sebelum menyisipkan
-- (P-04, BR-36). Penjadwal turun pangkat menjadi kurir kedua.
--
-- SELURUH PENULISAN ke sesi_tugas, location_logs, posisi_terkini, dan
-- titik_penanda berjalan lewat fungsi di bawah. Tidak ada grant
-- insert/update langsung kepada authenticated pada tabel mana pun di
-- modul ini (0015) — persis pola sesi_tugas sejak Modul 6.2.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fungsi lingkup tambahan untuk RLS 0017.
--
-- PERINGATAN (Bagian 7 §9.2 Ketetapan implementasi): fungsi "_aktif" di
-- bawah BERBEDA dari sipantau_auth.penugasan_yang_saya_awasi() dan
-- sipantau_auth.penugasan_yang_saya_laksanakan() yang SUDAH ADA sejak
-- Modul 6.2 (0008) — keduanya MENGABAIKAN dicabut_pada dan dipakai apa
-- adanya untuk location_logs (BR-21, BR-62 sisi Panit/riwayat).
--
-- Fungsi "_aktif" di bawah MEMERIKSA dicabut_pada dan dipakai KHUSUS
-- untuk posisi_terkini (BR-62 teramandemen, P-21). Menyalin salah satu
-- ke tempat yang salah adalah kesalahan yang paling mungkin di modul
-- ini — sudah diperingatkan tiga kali di berkas sumber.
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.penugasan_yang_saya_awasi_aktif()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_panit
  where panit_id = (select auth.uid())
    and dicabut_pada is null
$$;

revoke execute on function sipantau_auth.penugasan_yang_saya_awasi_aktif() from public;
grant execute on function sipantau_auth.penugasan_yang_saya_awasi_aktif() to authenticated;

create or replace function sipantau_auth.penugasan_yang_saya_laksanakan_aktif()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_pelaksana
  where pelaksana_id = (select auth.uid())
    and dicabut_pada is null
$$;

revoke execute on function sipantau_auth.penugasan_yang_saya_laksanakan_aktif() from public;
grant execute on function sipantau_auth.penugasan_yang_saya_laksanakan_aktif() to authenticated;

-- =====================================================================
-- fn_tutup_sesi_tugas — inti penutupan, dipakai seluruh jalur
--
-- Bukan dipanggil klien secara langsung (tidak ada grant execute ke
-- authenticated). Seluruh jalur penutupan — manual, penjadwal, pemicu
-- SPT/pelaksana/akun — memanggilnya lewat `perform`.
--
-- Ringkasan Rute (KP-6.4-30, aturan modul butir 6): disusun TEPAT SEKALI
-- di sini, tidak pernah dihitung ulang. Jarak hanya menjumlah titik yang
-- TIDAK diragukan (BR-57); akurasi_median dihitung dari seluruh titik
-- berketelitian tercatat, karena ia keterangan mutu, bukan penilaian.
-- =====================================================================
create or replace function public.fn_tutup_sesi_tugas(
  p_sesi_id     uuid,
  p_sebab       public.sebab_penutupan_sesi,
  p_ditutup_oleh uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jarak   numeric := 0;
  v_median  numeric;
  v_awal    record;
  v_akhir   record;
  v_prev_lat numeric;
  v_prev_lng numeric;
  v_titik   record;
begin
  -- Titik pertama dan terakhir yang WAJAR (P-20, koordinat awal/akhir
  -- bermakna hanya bila diambil dari titik yang dapat dipercaya).
  select lat, lng into v_awal
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
   order by direkam_pada asc limit 1;

  select lat, lng into v_akhir
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
   order by direkam_pada desc limit 1;

  -- Jarak tempuh: jumlah jarak antar titik WAJAR berurutan saja
  -- (BR-57 — titik diragukan tidak ikut menggambar garis maupun
  -- dihitung ke jarak).
  v_prev_lat := null;
  v_prev_lng := null;
  for v_titik in
    select lat, lng
      from public.location_logs
     where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
     order by direkam_pada asc
  loop
    if v_prev_lat is not null then
      v_jarak := v_jarak + extensions.ST_Distance(
        extensions.ST_MakePoint(v_prev_lng, v_prev_lat)::extensions.geography,
        extensions.ST_MakePoint(v_titik.lng, v_titik.lat)::extensions.geography
      );
    end if;
    v_prev_lat := v_titik.lat;
    v_prev_lng := v_titik.lng;
  end loop;

  select percentile_cont(0.5) within group (order by akurasi_meter)
    into v_median
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and akurasi_meter is not null;

  update public.sesi_tugas
     set ditutup_pada          = now(),
         sebab_penutupan       = p_sebab,
         ditutup_oleh          = p_ditutup_oleh,
         jarak_tempuh_meter    = v_jarak,
         akurasi_median_meter  = v_median,
         lat_awal              = v_awal.lat,
         lng_awal              = v_awal.lng,
         lat_akhir             = v_akhir.lat,
         lng_akhir             = v_akhir.lng,
         diringkas_pada        = now(),
         diubah_pada           = now()
   where id = p_sesi_id
     and ditutup_pada is null;

  -- KP-6.4-30: baris posisi_terkini dihapus dalam transaksi yang sama.
  -- replica identity bawaan (P-18) memastikan peristiwa penghapusan
  -- yang tersiar ke seluruh pelanggan Realtime hanya membawa kunci
  -- utamanya (sesi_tugas_id, UUID tanpa arti).
  delete from public.posisi_terkini where sesi_tugas_id = p_sesi_id;
end;
$$;

-- ---------------------------------------------------------------------
-- selesaikan_sesi_tugas — satu-satunya jalur PENUTUPAN MANUSIA
-- (KP-6.4-24). Dipanggil dari Server Action lewat tombol geser Selesai
-- Tugas.
-- ---------------------------------------------------------------------
create or replace function public.selesaikan_sesi_tugas(p_sesi_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pengguna uuid := (select auth.uid());
begin
  if not exists (
    select 1 from public.sesi_tugas
     where id = p_sesi_id and pengguna_id = v_pengguna and ditutup_pada is null
  ) then
    raise exception 'BUKAN_PEMEGANG: Sesi Tugas ini bukan milik Anda atau sudah tertutup';
  end if;

  perform public.fn_tutup_sesi_tugas(p_sesi_id, 'manual', v_pengguna);
  perform public.catat_jejak_audit('tutup_sesi_tugas', 'sesi_tugas', p_sesi_id, 'manual');
end;
$$;

revoke execute on function public.selesaikan_sesi_tugas(uuid) from public;
grant execute on function public.selesaikan_sesi_tugas(uuid) to authenticated;

-- =====================================================================
-- buka_sesi_tugas — satu-satunya jalur PEMBUKAAN (KP-6.4-01..08)
-- =====================================================================
create or replace function public.buka_sesi_tugas(
  p_penugasan_id      uuid,
  p_lat               numeric,
  p_lng               numeric,
  p_akurasi_meter     numeric,
  p_penanda_perangkat text
)
returns public.sesi_tugas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pengguna   uuid := (select auth.uid());
  v_peran      text := (select sipantau_auth.peran_saya());
  v_pelaksana  record;
  v_lama       record;
  v_baru       public.sesi_tugas;
  v_status     public.status_spt;
begin
  if v_pengguna is null then
    raise exception 'TANPA_SESI';
  end if;

  -- BR-17 / KP-6.4-54: Akun Pemeliharaan tidak dapat membuka Sesi Tugas.
  if v_peran is null or v_peran = 'pemeliharaan' then
    raise exception 'PERAN_TIDAK_BERHAK: Akun ini tidak dapat membuka Sesi Tugas';
  end if;

  -- BR-65 / KP-6.4-68 lapis kedua: penyembunyian tombol pada bentuk web
  -- (lapis pertama, di antarmuka) TIDAK cukup sendirian (Section 9.1).
  -- Penanda perangkat bentuk web membawa awalan 'web-' (lihat
  -- lib/gps/penanda-perangkat.ts) dan ditolak di sini tanpa terkecuali,
  -- independen dari apa pun yang terjadi di antarmuka.
  if p_penanda_perangkat is null or p_penanda_perangkat like 'web-%' then
    raise exception 'BENTUK_WEB: Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang';
  end if;

  select status into v_status from public.penugasan where id = p_penugasan_id;
  if not found then
    raise exception 'SPT_TIDAK_DITEMUKAN';
  end if;
  if v_status not in ('baru', 'berjalan', 'bermasalah') then
    raise exception 'SPT_TIDAK_MENERIMA: SPT ini tidak sedang berjalan';
  end if;

  -- Mengunci baris pelaksana (KP-6.4-07): bila SPT ini sedang dihapus
  -- permanen atau pencabutan pelaksana sedang berlangsung hampir
  -- bersamaan, salah satu dari kedua tindakan menunggu transaksi yang
  -- lain selesai — tidak ada keadaan setengah jadi.
  select * into v_pelaksana
    from public.penugasan_pelaksana
   where penugasan_id = p_penugasan_id and pelaksana_id = v_pengguna
   for update;

  if not found or v_pelaksana.dicabut_pada is not null then
    raise exception 'BUKAN_PELAKSANA: Anda bukan pelaksana aktif pada SPT ini';
  end if;

  -- P-04 (BR-54, BR-36): tutup sendiri Sesi Menggantung milik pemanggil
  -- SEBELUM menyisipkan, di dalam kunci baris yang sama. Kemampuan
  -- seseorang Mulai Tugas tidak boleh bergantung pada berjalannya
  -- penjadwal (0018).
  select * into v_lama
    from public.sesi_tugas
   where pengguna_id = v_pengguna and ditutup_pada is null
   for update;

  if found then
    if coalesce(v_lama.titik_terakhir_pada, v_lama.dibuka_pada) < now() - interval '2 hours' then
      perform public.fn_tutup_sesi_tugas(v_lama.id, 'menggantung', null);
    else
      raise exception 'SESI_BERJALAN: Anda masih dalam Sesi Tugas untuk penugasan %, dibuka %',
        v_lama.penugasan_id, v_lama.dibuka_pada;
    end if;
  end if;

  -- titik_terakhir_pada TIDAK diisi di sini (dibiarkan kosong) —
  -- fn_catat_titik di bawah yang mengisinya lewat pembaruan berpenjaga
  -- "kosong ATAU lebih lama". now() konstan sepanjang satu transaksi,
  -- jadi mengisinya di sini akan sama persis dengan direkam_pada Titik
  -- pertama dan membuat penjaga ">" pada fn_catat_titik gagal mencatat
  -- Titik pertama itu sendiri.
  insert into public.sesi_tugas
    (penugasan_id, pengguna_id, penanda_perangkat, jumlah_titik)
  values
    (p_penugasan_id, v_pengguna, p_penanda_perangkat, 0)
  returning * into v_baru;

  -- KP-6.4-05: satu Titik pertama seketika, tanpa menunggu ambang.
  perform public.fn_catat_titik(
    p_sesi_id           => v_baru.id,
    p_lat               => p_lat,
    p_lng               => p_lng,
    p_akurasi_meter     => p_akurasi_meter,
    p_kecepatan_mps     => null,
    p_arah_derajat      => null,
    p_baterai_persen    => null,
    p_sumber_lokasi     => 'gps',
    p_antrean_id        => gen_random_uuid(),
    p_direkam_pada      => now(),
    p_penanda_perangkat => p_penanda_perangkat,
    p_penanda_perangkat_asal => p_penanda_perangkat,
    p_lokasi_tiruan     => false
  );

  perform public.catat_jejak_audit('buka_sesi_tugas', 'sesi_tugas', v_baru.id);

  select * into v_baru from public.sesi_tugas where id = v_baru.id;
  return v_baru;
end;
$$;

revoke execute on function public.buka_sesi_tugas(uuid, numeric, numeric, numeric, text) from public;
grant execute on function public.buka_sesi_tugas(uuid, numeric, numeric, numeric, text) to authenticated;

-- =====================================================================
-- fn_catat_titik — satu-satunya jalur PENGIRIMAN TITIK
-- (KP-6.4-09..23). Dipanggil langsung oleh buka_sesi_tugas untuk Titik
-- pertama, dan oleh kirim_titik (RPC klien) untuk Titik berikutnya.
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
  if v_sesi.ditutup_pada is not null then
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

  -- KP-6.4-14: akurasi lebih buruk dari 100 meter.
  if p_akurasi_meter is not null and p_akurasi_meter > 100 then
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
  update public.sesi_tugas
     set titik_terakhir_pada = p_direkam_pada,
         jumlah_titik        = jumlah_titik + 1,
         diubah_pada         = now()
   where id = p_sesi_id
     and (titik_terakhir_pada is null or titik_terakhir_pada < p_direkam_pada);

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

  return v_id;
end;
$$;

-- Tidak ada grant execute untuk fn_catat_titik: klien memanggil
-- kirim_titik di bawah, yang menegakkan batas laju (bila 6.10 sudah
-- ada) dan Perangkat Terdaftar sebelum meneruskan ke sini.

-- ---------------------------------------------------------------------
-- kirim_titik — RPC yang dipanggil klien untuk Titik KEDUA dan
-- seterusnya (Titik pertama sudah dikirim buka_sesi_tugas).
--
-- Pembatasan laju (BR-51 amandemen, kirim_titik 600/5 menit) SENGAJA
-- BELUM ditegakkan di sini — mekanismenya milik Modul 6.10 yang belum
-- dibangun (docs/CLAUDE.md §10), dan modul itu sendiri yang mendaftarkan
-- kirim_titik ke daftar tertutupnya. Menambah batas laju tanpa 6.10
-- berarti membangun infrastruktur yang belum diminta.
-- ---------------------------------------------------------------------
create or replace function public.kirim_titik(
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
  p_lokasi_tiruan          boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.fn_catat_titik(
    p_sesi_id, p_lat, p_lng, p_akurasi_meter, p_kecepatan_mps, p_arah_derajat,
    p_baterai_persen, p_sumber_lokasi, p_antrean_id, p_direkam_pada,
    p_penanda_perangkat, coalesce(p_penanda_perangkat_asal, p_penanda_perangkat),
    p_lokasi_tiruan
  );
end;
$$;

revoke execute on function public.kirim_titik(
  uuid, numeric, numeric, numeric, numeric, numeric, smallint,
  public.sumber_lokasi_titik, uuid, timestamptz, text, text, boolean) from public;
grant execute on function public.kirim_titik(
  uuid, numeric, numeric, numeric, numeric, numeric, smallint,
  public.sumber_lokasi_titik, uuid, timestamptz, text, text, boolean) to authenticated;

-- =====================================================================
-- Penutupan sistem, tiga pemicu (KP-6.4-28, 29; BR-20)
-- =====================================================================

-- ---------------------------------------------------------------------
-- trg_tutup_sesi_spt_selesai — Kanit menutup/membatalkan SPT (KP-6.4-28)
-- ---------------------------------------------------------------------
create or replace function public.fn_tutup_sesi_spt_selesai()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi record;
begin
  if new.status in ('selesai', 'dibatalkan') and old.status not in ('selesai', 'dibatalkan') then
    for v_sesi in
      select id from public.sesi_tugas
       where penugasan_id = new.id and ditutup_pada is null
    loop
      perform public.fn_tutup_sesi_tugas(v_sesi.id, 'spt_ditutup', null);
    end loop;
  end if;
  return new;
end;
$$;

create trigger trg_tutup_sesi_spt_selesai
  after update on public.penugasan
  for each row
  execute function public.fn_tutup_sesi_spt_selesai();

-- ---------------------------------------------------------------------
-- trg_tutup_sesi_pelaksana_dicabut — pelaksana dicabut saat sesi
-- berjalan (KP-6.4-29, BR-30). Rute yang sudah terekam tetap tersimpan.
-- ---------------------------------------------------------------------
create or replace function public.fn_tutup_sesi_pelaksana_dicabut()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi record;
begin
  if new.dicabut_pada is not null and old.dicabut_pada is null then
    select id into v_sesi from public.sesi_tugas
     where penugasan_id = new.penugasan_id
       and pengguna_id = new.pelaksana_id
       and ditutup_pada is null;

    if found then
      perform public.fn_tutup_sesi_tugas(v_sesi.id, 'dicabut_dari_spt', null);
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_tutup_sesi_pelaksana_dicabut
  after update on public.penugasan_pelaksana
  for each row
  execute function public.fn_tutup_sesi_pelaksana_dicabut();

-- ---------------------------------------------------------------------
-- trg_tutup_sesi_akun_nonaktif — akun dinonaktifkan saat sesi berjalan
-- (BR-20). Berjalan apa pun mekanisme yang menonaktifkan akun (Fungsi
-- Tepi nonaktifkan-akun), karena pemicu ini menempel pada kolom aktif
-- itu sendiri, bukan pada jalurnya.
-- ---------------------------------------------------------------------
create or replace function public.fn_tutup_sesi_akun_nonaktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi record;
begin
  if new.aktif = false and old.aktif = true then
    for v_sesi in
      select id from public.sesi_tugas
       where pengguna_id = new.id and ditutup_pada is null
    loop
      perform public.fn_tutup_sesi_tugas(v_sesi.id, 'akun_dinonaktifkan', null);
    end loop;
  end if;
  return new;
end;
$$;

create trigger trg_tutup_sesi_akun_nonaktif
  after update on public.users
  for each row
  execute function public.fn_tutup_sesi_akun_nonaktif();

-- =====================================================================
-- Perluasan catat_keluar (0006) — KP-6.4-25, BR-19.
--
-- Sebab 'keluar_aplikasi' TIDAK sama dengan 'manual' (pengguna tidak
-- menggeser Selesai Tugas) dan TIDAK memerlukan persetujuan siapa pun.
-- Rute yang sudah terekam tetap tersimpan; Kanit dan Panit Penanggung
-- Jawab diberi tahu lewat baris notifikasi (Modul 6.9 yang mengantar).
--
-- CATATAN LINGKUP: ini perluasan fungsi Modul 6.1 yang sudah ada, bukan
-- perombakan modul itu — perluasan yang sama polanya dengan bagaimana
-- Modul 6.3 menambahkan trg_isi_sesi_tugas tanpa menulis ulang 6.2.
-- =====================================================================
create or replace function public.catat_keluar()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id    uuid := (select auth.uid());
  v_peran public.peran_pengguna;
  v_sesi  record;
begin
  if v_id is null then
    return; -- sudah tidak bersesi, tidak ada yang perlu dicatat
  end if;

  select peran into v_peran from public.users where id = v_id;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
  values
    (v_id, v_peran, 'keluar', 'users', v_id);

  for v_sesi in
    select id from public.sesi_tugas where pengguna_id = v_id and ditutup_pada is null
  loop
    perform public.fn_tutup_sesi_tugas(v_sesi.id, 'keluar_aplikasi', v_id);
  end loop;

  delete from public.perangkat_masuk where user_id = v_id;
end;
$$;

revoke execute on function public.catat_keluar() from public;
grant execute on function public.catat_keluar() to authenticated;

-- =====================================================================
-- Izin lokasi terputus/pulih (KP-6.4-56..58)
--
-- Sesi TETAP TERBUKA saat izin dicabut — bukan penutupan, penandaan.
-- izin_dicabut_pada/izin_dipulihkan_pada pada sesi_tugas mencatat SATU
-- siklus riwayat (kapan terjadi dalam sesi ini); izin_terputus pada
-- posisi_terkini adalah KEADAAN HIDUP yang dibaca peta (KP-6.4-38: bukan
-- bagian dari warna status, keterangan tersendiri).
--
-- Notifikasi Kanit/Panit (KP-6.4-56) SENGAJA BELUM disisipkan: tabel
-- `notifikasi` milik Modul 6.9 yang belum dibangun (docs/CLAUDE.md §10
-- langkah 12 menyusul langkah 10 GPS ini). Mengikuti pola P-08 — dicatat
-- di sini supaya bukan temuan pemeriksaan silang berikutnya, diisi saat
-- Modul 6.9 berdiri.
-- =====================================================================
create or replace function public.tandai_izin_lokasi_terputus(p_sesi_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.sesi_tugas
     set izin_dicabut_pada = now(), diubah_pada = now()
   where id = p_sesi_id
     and pengguna_id = (select auth.uid())
     and ditutup_pada is null
     and izin_dicabut_pada is null;

  update public.posisi_terkini
     set izin_terputus = true, diubah_pada = now()
   where sesi_tugas_id = p_sesi_id;
end;
$$;

revoke execute on function public.tandai_izin_lokasi_terputus(uuid) from public;
grant execute on function public.tandai_izin_lokasi_terputus(uuid) to authenticated;

create or replace function public.tandai_izin_lokasi_pulih(p_sesi_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.sesi_tugas
     set izin_dipulihkan_pada = now(), diubah_pada = now()
   where id = p_sesi_id
     and pengguna_id = (select auth.uid())
     and ditutup_pada is null
     and izin_dicabut_pada is not null
     and izin_dipulihkan_pada is null;

  update public.posisi_terkini
     set izin_terputus = false, diubah_pada = now()
   where sesi_tugas_id = p_sesi_id;
end;
$$;

revoke execute on function public.tandai_izin_lokasi_pulih(uuid) from public;
grant execute on function public.tandai_izin_lokasi_pulih(uuid) to authenticated;

-- =====================================================================
-- CATATAN PENDING — sebab 'pindah_perangkat' (KP-6.4-26, BR-16, BR-25)
--
-- Enum dan fn_tutup_sesi_tugas SUDAH mendukung sebab ini sepenuhnya.
-- Yang BELUM ada: titik pengait di sisi masuk (catat_masuk_berhasil,
-- 0006) yang mendeteksi perangkat baru dan memanggil
-- fn_tutup_sesi_tugas dengan sebab pindah_perangkat.
--
-- SEBABNYA SAMA PERSIS dengan catatan yang sudah ada di 0003 dan 0010:
-- mekanisme Perangkat Terdaftar (perbandingan sungguhan terhadap
-- perangkat_masuk, bukan sekadar penyimpanan) belum dibangun di
-- Modul 6.1 mana pun, dan catat_masuk_berhasil() hari ini tidak
-- menerima parameter penanda perangkat sama sekali — tidak ada yang
-- bisa dibandingkan. Menambahkannya sekarang berarti merombak tanda
-- tangan fungsi dan alur masuk Modul 6.1, di luar cakupan Modul 6.4.
--
-- Sampai Modul 6.1 membangun mekanisme itu, sesi yang tertinggal di
-- perangkat lama akan tertutup lewat jalur 'menggantung' (P-04) begitu
-- pemiliknya Mulai Tugas dari perangkat baru — bukan cacat, hanya sebab
-- yang tercatat kurang tepat untuk sementara.
-- =====================================================================
