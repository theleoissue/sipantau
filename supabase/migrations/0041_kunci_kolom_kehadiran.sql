-- =====================================================================
-- 0041 — Kunci kolom kehadiran dan posisi pada tabel users
--
-- TEMUAN AUDIT peran Kanit, 1 September 2026. Dibuktikan dengan
-- pengujian langsung terhadap seluruh migrasi, bukan dari pembacaan:
--
--   Kanit   -> dapat menyetel terakhir_terlihat, sedang_bertugas, dan
--              posisi_terakhir_lat/lng bagi SETIAP anggota unitnya
--   Anggota -> dapat menyetel keempatnya bagi DIRINYA SENDIRI
--
-- Keduanya tanpa satu pun galat. Padahal terakhir_terlihat adalah kolom
-- "Kehadiran" pada layar Personel dan Manajemen Akun — orang yang
-- sedang diawasi dapat memalsukan bukti kehadirannya sendiri.
--
-- SEBABNYA. fn_jaga_kolom_users memakai daftar-larangan. Kolom GPS
-- ditambahkan ke users pada 0003 dan terakhir_terlihat dipakai sejak
-- 0036, keduanya SESUDAH penjaga itu ditulis — jadi tidak pernah masuk
-- daftar. Persis kelas kegagalan yang diperingatkan CLAUDE.md §11:
-- "aturan diterapkan di satu tempat, tempat lain yang melanggar
-- terlewat".
--
-- Dua fungsi disalin ulang di bawah karena PostgreSQL tidak mengenal
-- penambalan sebagian. Selain sisipan yang diberi tanda, isinya identik
-- dengan versi terakhirnya (0039 dan 0036).
-- =====================================================================

create or replace function public.fn_jaga_kolom_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
  v_resmi boolean := coalesce(current_setting('sipantau.jalur_resmi', true), '') = 'on';
begin
  if v_peran = 'admin' then
    return new;
  end if;

  -- jabatan IKUT DIKUNCI di sini sejak 0039: ia tercetak pada lampiran
  -- Surat Perintah sebagai jabatan resmi pemegang perintah. Pemicu ini
  -- memakai daftar-larangan, jadi tanpa baris ini kolom baru otomatis
  -- boleh diubah pemiliknya sendiri lewat users_ubah_diri_sendiri —
  -- artinya siapa pun dapat menuliskan jabatannya sendiri di surat dinas.
  -- Ikut jalur_resmi yang sama supaya fungsi Manajemen Akun tetap bisa
  -- mengisinya atas nama Admin.
  if new.peran is distinct from old.peran
     or new.unit_id is distinct from old.unit_id
     or new.jabatan is distinct from old.jabatan then
    if not v_resmi then
      raise exception 'KOLOM_TERKUNCI: peran, unit, dan jabatan hanya dapat diubah Admin';
    end if;
  end if;

  -- KOLOM KEHADIRAN DAN POSISI (0041).
  --
  -- Pemicu ini memakai daftar-larangan, jadi kolom yang ditambahkan ke
  -- tabel users SESUDAHNYA otomatis boleh ditulis siapa pun yang lolos
  -- RLS. Empat kolom di bawah lolos begitu saja selama ini, dan
  -- akibatnya terbukti dengan pengujian: seorang Anggota dapat menyetel
  -- terakhir_terlihat miliknya SENDIRI (users_ubah_diri_sendiri), dan
  -- seorang Kanit dapat menyetelnya bagi seluruh anggota unitnya
  -- (users_ubah_kanit_tim). Padahal kolom itulah yang menjadi kolom
  -- "Kehadiran" pada layar Personel dan Manajemen Akun — artinya
  -- kehadiran dapat dipalsukan oleh orang yang justru sedang diawasi.
  -- Itu meruntuhkan seluruh maksud sistem ini.
  --
  -- terakhir_terlihat sah ditulis SATU tempat saja: fn_catat_titik,
  -- ketika sebuah Titik sungguh masuk. Karena itu dilepas hanya lewat
  -- jalur_resmi, penanda yang sudah dipakai kolom kata sandi (0006).
  --
  -- Tiga kolom lain tidak punya penulis sah sama sekali — sisa
  -- rancangan awal 0003 yang tidak pernah terpakai (posisi_terkini yang
  -- menjadi sumber kebenaran posisi). Dikunci juga: kolom tak terpakai
  -- yang bisa ditulis sembarang orang tetap permukaan serang, dan suatu
  -- saat bisa keliru dibaca sebagai data sungguhan.
  if not v_resmi then
    if new.terakhir_terlihat   is distinct from old.terakhir_terlihat
       or new.sedang_bertugas     is distinct from old.sedang_bertugas
       or new.posisi_terakhir_lat is distinct from old.posisi_terakhir_lat
       or new.posisi_terakhir_lng is distinct from old.posisi_terakhir_lng then
      raise exception 'KOLOM_TERKUNCI: kehadiran dan posisi hanya berubah dari perekaman Titik yang sah';
    end if;
  end if;

  if new.nrp is distinct from old.nrp
     or new.email_sistem is distinct from old.email_sistem then
    raise exception 'KOLOM_TERKUNCI: NRP tidak dapat diubah';
  end if;

  if new.aktif is distinct from old.aktif
     and v_peran <> 'pemeliharaan'
     and not v_resmi then
    raise exception 'KOLOM_TERKUNCI: status aktif hanya dapat diubah Admin atau Akun Pemeliharaan';
  end if;

  if v_peran = 'kanit' and new.id <> (select auth.uid()) then
    if new.nama              is distinct from old.nama
       or new.pangkat        is distinct from old.pangkat
       or new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: Kanit hanya dapat menyalakan penggantian kata sandi';
    end if;
  end if;

  if new.foto_acuan_wajah is distinct from old.foto_acuan_wajah then
    raise exception 'KOLOM_TERKUNCI: foto_acuan_wajah belum boleh diisi';
  end if;

  if not v_resmi then
    if new.wajib_ganti_sandi is distinct from old.wajib_ganti_sandi
       and v_peran not in ('kanit', 'pemeliharaan') then
      raise exception 'KOLOM_TERKUNCI: wajib_ganti_sandi hanya berubah lewat penggantian kata sandi yang sah';
    end if;

    if new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: terakhir_masuk hanya diisi sistem saat masuk';
    end if;
  end if;

  new.diubah_pada := now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- fn_catat_titik — satu-satunya penulis sah terakhir_terlihat.
-- Ditulis ulang HANYA untuk membuka jalur_resmi sebelum menyentuh users.
-- ---------------------------------------------------------------------
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

  -- BARU (0036): terakhir_terlihat bertahan MELEWATI penutupan sesi —
  -- posisi_terkini dihapus saat sesi ditutup, jadi ini satu-satunya
  -- jejak "kapan terakhir terlihat" yang tersisa setelahnya. Penjaga
  -- "lebih baru saja" yang sama seperti posisi_terkini di atas.
  -- Membuka jalur_resmi tepat sebelum menyentuh users: sejak 0041
  -- kolom terakhir_terlihat dikunci fn_jaga_kolom_users, dan inilah
  -- SATU-SATUNYA penulis yang sah. Cakupannya transaksi (parameter
  -- ketiga true) sehingga pulih sendiri begitu transaksi selesai —
  -- pola yang sama dengan fungsi kata sandi di 0006.
  perform set_config('sipantau.jalur_resmi', 'on', true);

  update public.users
     set terakhir_terlihat = p_direkam_pada
   where id = v_sesi.pengguna_id
     and (terakhir_terlihat is null or terakhir_terlihat < p_direkam_pada);

  return v_id;
end;
$$;
