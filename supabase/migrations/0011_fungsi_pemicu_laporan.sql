-- =====================================================================
-- 0011 — Fungsi dan pemicu Modul 6.3
-- Sumber: docs/30-modul-6.3-pelaporan.md Addendum 6.3-T, sepuluh celah
-- =====================================================================
--
-- Prinsip yang dipakai konsisten (Addendum 6.3-T pembuka):
--   1. Klien tidak pernah dipercaya untuk fakta pembuktian. Koordinat
--      mentah boleh dikirim klien; kesimpulan darinya (jarak, status,
--      titik terdekat) selalu dihitung ulang server dan menimpa kiriman
--      klien.
--   2. Kolom yang mewakili kejadian pada satu waktu tertentu dibekukan
--      setelah tercatat.
--   3. Setiap pemicu memeriksa PERUBAHAN KOLOM, bukan sekadar kejadian
--      UPDATE — mencegah efek samping saling menimpa antar-pemicu.
--
-- KOREKSI YANG SUDAH DITERAPKAN dari docs/01-koreksi.md (bukan salinan
-- apa adanya dari contoh kode Addendum 6.3-T, yang punya bug tersendiri):
--   I.3  fn_minta_perbaikan wajib security definer — Panit tidak
--        memiliki hak tulis langsung ke laporan_harian.
--   I.4  seluruh fungsi mengunci search_path = '' dan nama tabel
--        berskema lengkap.
--   I.5  daftar kolom beku pada fn_tandai_sunting dilengkapi penuh.
--   I.12 "IF titik IS NULL" diganti "IF NOT FOUND" — bentuk asli hanya
--        benar bila SELURUH medan record kosong, dan itu kebetulan
--        bekerja sekarang tapi akan diam-diam meleset kelak.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Celah 1 — Kalkulasi lokasi di server, sekali saat INSERT
-- ---------------------------------------------------------------------
create or replace function public.fn_hitung_lokasi_laporan()
returns trigger
language plpgsql
security definer
-- PENGECUALIAN DISENGAJA dari konvensi search_path = '' proyek ini.
-- Supabase memasang PostGIS ke skema `extensions`, bukan `public`
-- (kebiasaan dashboard-nya, untuk menjaga public tetap bersih). Dengan
-- search_path benar-benar kosong, tipe `geography` bawaan PostGIS tidak
-- akan ditemukan SAMA SEKALI — bukan cuma di pengujian lokal, di
-- Supabase asli juga. Daftar tetap dan eksplisit ini (bukan kosong,
-- bukan warisan sesi) tetap menutup celah suntik skema yang jadi alasan
-- aturan itu ada; nama tabel tetap ditulis berskema public.* di bawah.
set search_path = public, extensions
as $$
declare
  titik record;
begin
  if new.lokasi_lat is null or new.lokasi_lng is null then
    new.status_lokasi := 'tidak_terekam';
    return new;
  end if;

  select pl.id, pl.radius_meter,
         ST_Distance(
           ST_MakePoint(pl.lng, pl.lat)::geography,
           ST_MakePoint(new.lokasi_lng, new.lokasi_lat)::geography
         ) as jarak
    into titik
    from public.penugasan_lokasi pl
   where pl.penugasan_id = new.penugasan_id and pl.lat is not null
   order by jarak asc
   limit 1;

  -- BUKAN "titik IS NULL": pada tipe record, itu hanya benar bila
  -- seluruh medan kosong. NOT FOUND memeriksa tepat yang dimaksud —
  -- apakah SELECT di atas menemukan baris (docs/01-koreksi.md I.12).
  if not found then
    new.status_lokasi := 'di_luar_titik';
    return new;
  end if;

  new.lokasi_id_terdekat := titik.id;
  new.jarak_meter        := titik.jarak;
  new.status_lokasi := case when titik.jarak <= titik.radius_meter
                             then 'terverifikasi' else 'di_luar_titik' end;
  return new;
end;
$$;

create trigger trg_hitung_lokasi
  before insert on public.laporan_harian
  for each row
  execute function public.fn_hitung_lokasi_laporan();

-- ---------------------------------------------------------------------
-- Celah 10 — Pemeriksaan gabungan saat pengiriman: SPT masih menerima
-- laporan, dan pengirim benar-benar pelaksana aktif SPT itu.
--
-- Ditempatkan sebelum Celah 3 dalam berkas ini, tetapi keduanya
-- berjalan sesuai abjad nama pemicu (trg_hitung_lokasi < trg_isi_sesi_
-- tugas < trg_periksa_pelapor_aktif), independen satu sama lain.
-- ---------------------------------------------------------------------
create or replace function public.fn_periksa_pelapor_aktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.status_spt;
begin
  select status into v_status from public.penugasan where id = new.penugasan_id;

  if v_status not in ('baru', 'berjalan', 'bermasalah') then
    raise exception 'SPT_TERTUTUP: SPT ini tidak lagi menerima laporan';
  end if;

  if not exists (
    select 1 from public.penugasan_pelaksana
     where penugasan_id = new.penugasan_id
       and pelaksana_id = new.pelapor_id
       and dicabut_pada is null
  ) then
    raise exception 'BUKAN_PELAKSANA: Anda bukan pelaksana aktif pada penugasan ini';
  end if;

  return new;
end;
$$;

create trigger trg_periksa_pelapor_aktif
  before insert on public.laporan_harian
  for each row
  execute function public.fn_periksa_pelapor_aktif();

-- ---------------------------------------------------------------------
-- Celah 3 — Pengisian sesi_tugas_id otomatis, terikat SPT yang sama
--
-- Klien TIDAK PERNAH mengirim sesi_tugas_id. Sesi aktif pada SPT lain
-- tetap sah (BR-24: satu orang boleh terlibat banyak SPT) dan TIDAK
-- akan tertaut keliru karena penugasan_id disyaratkan sama persis.
-- ---------------------------------------------------------------------
create or replace function public.fn_isi_sesi_tugas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select id into new.sesi_tugas_id
    from public.sesi_tugas
   where pengguna_id = (select auth.uid())
     and penugasan_id = new.penugasan_id
     and ditutup_pada is null
   limit 1;
  return new;
end;
$$;

create trigger trg_isi_sesi_tugas
  before insert on public.laporan_harian
  for each row
  execute function public.fn_isi_sesi_tugas();

-- ---------------------------------------------------------------------
-- Celah 2 — Penguncian ganda: persetujuan Kanit ATAU penutupan SPT
--
-- Berjalan sebagai pemicu PERTAMA secara abjad pada event UPDATE
-- (trg_kunci_laporan < trg_tandai_sunting), sehingga tidak ada kolom
-- yang sempat berubah sebelum pemeriksaan kunci dijalankan.
--
-- Memeriksa STATUS SPT (enum), bukan kolom timestamp ditutup_pada,
-- jadi tidak tersentuh masalah "kolom sudah ada dengan makna beda"
-- yang pernah terjadi di Modul 6.3-K (docs/01-koreksi.md I.13) — status
-- 'selesai'/'dibatalkan' sudah mencakup kedua jalur penutupan sekaligus.
-- ---------------------------------------------------------------------
create or replace function public.fn_kunci_laporan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status_spt public.status_spt;
begin
  if old.status_laporan in ('disetujui', 'ditarik') then
    raise exception 'LAPORAN_TERKUNCI: laporan sudah terkunci, tidak dapat diubah';
  end if;

  select status into v_status_spt from public.penugasan where id = old.penugasan_id;
  if v_status_spt in ('selesai', 'dibatalkan') then
    raise exception 'SPT_TERTUTUP: SPT sudah ditutup, laporan ikut terkunci';
  end if;

  return new;
end;
$$;

create trigger trg_kunci_laporan
  before update on public.laporan_harian
  for each row
  execute function public.fn_kunci_laporan();

-- ---------------------------------------------------------------------
-- Celah 4 — Penanda penyuntingan + pembekuan kolom fakta (I.5: lengkap)
--
-- Persetujuan Kanit, penarikan, dan perpindahan ke perlu_diperbaiki
-- semuanya berupa UPDATE yang TIDAK menyentuh uraian/kendala/
-- status_kegiatan, jadi tidak pernah keliru tercatat sebagai suntingan
-- pelapor.
-- ---------------------------------------------------------------------
create or replace function public.fn_tandai_sunting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.uraian          is distinct from old.uraian
     or new.kendala      is distinct from old.kendala
     or new.status_kegiatan is distinct from old.status_kegiatan then
    new.disunting_pada   := now();
    new.jumlah_suntingan := old.jumlah_suntingan + 1;

    -- Celah 5: penyuntingan pelapor mengembalikan status yang sempat
    -- diminta perbaikan.
    if old.status_laporan = 'perlu_diperbaiki' then
      new.status_laporan := 'terkirim';
    end if;
  end if;

  -- Seluruh kolom fakta Celah 1 dibekukan (docs/01-koreksi.md I.5:
  -- daftar lengkap, bukan sebagian). Tidak boleh ikut berubah lewat
  -- jalur penyuntingan apa pun.
  new.lokasi_lat             := old.lokasi_lat;
  new.lokasi_lng             := old.lokasi_lng;
  new.akurasi_meter          := old.akurasi_meter;
  new.status_lokasi          := old.status_lokasi;
  new.lokasi_id_terdekat     := old.lokasi_id_terdekat;
  new.jarak_meter            := old.jarak_meter;
  new.lokasi_id              := old.lokasi_id;
  new.alasan_lokasi          := old.alasan_lokasi;
  new.alasan_lokasi_lainnya  := old.alasan_lokasi_lainnya;
  new.pelapor_id             := old.pelapor_id;
  new.penugasan_id           := old.penugasan_id;
  new.sesi_tugas_id          := old.sesi_tugas_id;
  new.penanda_perangkat      := old.penanda_perangkat;
  new.dikirim_pada           := old.dikirim_pada;

  return new;
end;
$$;

create trigger trg_tandai_sunting
  before update on public.laporan_harian
  for each row
  execute function public.fn_tandai_sunting();

-- ---------------------------------------------------------------------
-- Celah 6 — Larangan meninjau laporan sendiri, lewat pemicu bukan CHECK
--
-- CHECK constraint tidak dapat menyubkueri tabel lain, jadi larangan
-- BR-31/BR-28 wajib pemicu.
-- ---------------------------------------------------------------------
create or replace function public.fn_larang_tinjau_sendiri()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pemilik uuid;
begin
  select pelapor_id into v_pemilik
    from public.laporan_harian where id = new.laporan_id;

  if v_pemilik = new.peninjau_id then
    raise exception 'TINJAU_SENDIRI: tidak dapat meninjau laporan sendiri';
  end if;

  return new;
end;
$$;

create trigger trg_larang_tinjau_sendiri
  before insert on public.catatan_laporan
  for each row
  execute function public.fn_larang_tinjau_sendiri();

-- ---------------------------------------------------------------------
-- Celah 5 — Perpindahan ke perlu_diperbaiki
--
-- SECURITY DEFINER wajib (docs/01-koreksi.md I.3): Panit TIDAK memiliki
-- hak tulis langsung ke laporan_harian (§9.2), sehingga UPDATE di bawah
-- akan ditolak RLS bila pemicu ini berjalan dengan hak pemanggil.
-- Pemicu trg_larang_tinjau_sendiri dan kebijakan penyisipan pada
-- catatan_laporan yang tetap menjaga siapa boleh sampai ke sini.
-- ---------------------------------------------------------------------
create or replace function public.fn_minta_perbaikan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.jenis = 'minta_perbaikan' then
    update public.laporan_harian
       set status_laporan = 'perlu_diperbaiki'
     where id = new.laporan_id
       and status_laporan not in ('disetujui', 'ditarik');
  end if;
  return new;
end;
$$;

create trigger trg_minta_perbaikan
  after insert on public.catatan_laporan
  for each row
  execute function public.fn_minta_perbaikan();

-- ---------------------------------------------------------------------
-- Fungsi tindakan yang dipanggil dari Server Action.
--
-- Ditulis sebagai fungsi terpisah (bukan UPDATE mentah dari klien)
-- supaya jejak audit tercatat pada transaksi yang sama, dan supaya
-- pesan galat yang sampai ke pengguna dapat diterjemahkan dari kode
-- galat pemicu di atas.
-- ---------------------------------------------------------------------

create or replace function public.setujui_laporan(p_laporan_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penugasan uuid;
  v_unit_saya uuid := (select sipantau_auth.unit_saya());
  v_unit_spt  uuid;
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menyetujui laporan';
  end if;

  select penugasan_id into v_penugasan
    from public.laporan_harian where id = p_laporan_id;
  select unit_id into v_unit_spt
    from public.penugasan where id = v_penugasan;

  if v_unit_spt is distinct from v_unit_saya then
    raise exception 'DI_LUAR_UNIT: laporan ini bukan milik unit Anda';
  end if;

  update public.laporan_harian
     set status_laporan = 'disetujui',
         disetujui_oleh = (select auth.uid()),
         disetujui_pada = now()
   where id = p_laporan_id;

  perform public.catat_jejak_audit('setujui_laporan', 'laporan_harian', p_laporan_id);
end;
$$;

revoke execute on function public.setujui_laporan(uuid) from public;
grant execute on function public.setujui_laporan(uuid) to authenticated;

create or replace function public.tarik_laporan(p_laporan_id uuid, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.laporan_harian
     where id = p_laporan_id and pelapor_id = (select auth.uid())
  ) then
    raise exception 'BUKAN_PEMILIK: hanya pengirim laporan yang dapat menariknya';
  end if;

  update public.laporan_harian
     set status_laporan  = 'ditarik',
         ditarik_pada     = now(),
         alasan_penarikan = p_alasan
   where id = p_laporan_id;

  perform public.catat_jejak_audit('tarik_laporan', 'laporan_harian', p_laporan_id, p_alasan);
end;
$$;

revoke execute on function public.tarik_laporan(uuid, text) from public;
grant execute on function public.tarik_laporan(uuid, text) to authenticated;
