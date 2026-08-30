-- =====================================================================
-- 0024 — Penjaga siklus hidup SPT: transisi status, syarat terbit,
-- syarat minimum bertahan, dan perpindahan otomatis baru->berjalan
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 6 (Addendum 6.2-T)
-- =====================================================================
--
-- INI YANG PALING MUNGKIN SALAH DI MODUL INI (ditulis eksplisit di
-- berkas sumber, tiga sebab sekaligus): syarat melintasi empat tabel,
-- pelanggarannya terjadi lewat perubahan di tabel LAIN (mencabut
-- pelaksana tidak menyentuh baris penugasan sama sekali), dan dua
-- pencabutan yang tiba bersamaan sama-sama melihat "masih ada dua
-- tersisa" sebelum salah satunya sempat menyimpan. PENGUNCIAN BARIS
-- INDUK (for update) BUKAN DETAIL GAYA PENULISAN — tanpanya berkurang
-- jadi nol adalah kejadian nyata yang dapat terjadi, bukan teoretis.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Penjaga peta transisi status — BARU, tidak eksplisit tertulis di
-- berkas sumber sebagai satu pemicu tersendiri, tapi WAJIB ada karena
-- Kanit memegang hak update bebas kolom apa pun pada penugasan_ubah_
-- kanit (migrasi 0008) — tanpa ini, tidak ada yang mencegah SPT
-- dibatalkan lalu "dibuka" balik ke berjalan lewat panggilan mentah,
-- padahal KP-6.2-51 tegas: dibatalkan tidak dapat dibuka kembali dalam
-- bentuk apa pun.
-- ---------------------------------------------------------------------
create or replace function public.fn_jaga_transisi_status_spt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'draf' and new.status in ('baru', 'dibatalkan')) or
    (old.status = 'baru' and new.status in ('berjalan', 'bermasalah', 'selesai', 'dibatalkan')) or
    (old.status = 'berjalan' and new.status in ('bermasalah', 'selesai', 'dibatalkan')) or
    (old.status = 'bermasalah' and new.status in ('berjalan', 'selesai', 'dibatalkan')) or
    (old.status = 'selesai' and new.status = 'berjalan')
  ) then
    raise exception 'TRANSISI_STATUS_TIDAK_SAH: % ke % tidak diperbolehkan', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger trg_jaga_transisi_status_spt
  before update on public.penugasan
  for each row
  execute function public.fn_jaga_transisi_status_spt();

-- ---------------------------------------------------------------------
-- Syarat terbit — berlaku sekali, pada draf -> baru.
-- ---------------------------------------------------------------------
create or replace function public.fn_periksa_syarat_terbit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kurang text[] := '{}';
  n int;
begin
  if not (new.status = 'baru' and old.status = 'draf') then
    return new;
  end if;

  -- array_append(), bukan operator ||: pada beberapa mesin Postgres
  -- (termasuk pglite yang dipakai uji lokal), || antara text[] kosong
  -- dan literal teks tak bertipe salah diresolusi sebagai percobaan
  -- meng-cast teksnya MENJADI text[] ("malformed array literal"),
  -- bukan menambah satu elemen. array_append tidak ambigu.
  if new.nomor_spt is null or length(trim(new.nomor_spt)) = 0 then
    kurang := array_append(kurang, 'nomor SPT');
  end if;

  select count(*) into n
    from public.penugasan_dasar where penugasan_id = new.id;
  if n = 0 then kurang := array_append(kurang, 'dasar penugasan'); end if;

  select count(*) into n
    from public.penugasan_lokasi
   where penugasan_id = new.id and lat is not null and lng is not null;
  if n = 0 then kurang := array_append(kurang, 'titik lokasi berkoordinat'); end if;

  select count(*) into n
    from public.penugasan_panit
   where penugasan_id = new.id and dicabut_pada is null;
  if n = 0 then kurang := array_append(kurang, 'Panit Penanggung Jawab'); end if;

  select count(*) into n
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.id
     and pp.dicabut_pada is null
     and u.peran = 'anggota';
  if n = 0 then kurang := array_append(kurang, 'pelaksana berperan Anggota'); end if;

  if array_length(kurang, 1) > 0 then
    raise exception 'SYARAT_TERBIT_KURANG: %', array_to_string(kurang, ', ');
  end if;

  return new;
end;
$$;

create trigger trg_periksa_syarat_terbit
  before update on public.penugasan
  for each row
  execute function public.fn_periksa_syarat_terbit();

-- ---------------------------------------------------------------------
-- Pengosongan penanda Lewat Batas saat tanggal_batas berubah (0.1.5) —
-- perpanjangan yang kembali terlampaui tetap memberi tahu.
-- ---------------------------------------------------------------------
create or replace function public.fn_reset_penanda_lewat_batas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.tanggal_batas is distinct from old.tanggal_batas then
    new.lewat_batas_diberitahukan_pada := null;
  end if;
  return new;
end;
$$;

create trigger trg_reset_penanda_lewat_batas
  before update on public.penugasan
  for each row
  execute function public.fn_reset_penanda_lewat_batas();

-- ---------------------------------------------------------------------
-- KP-6.2-30 — baru -> berjalan otomatis pada laporan pertama. Satu-
-- satunya perpindahan status yang berjalan sendiri tanpa manusia
-- (aturan modul 6.2.4 butir 5).
-- ---------------------------------------------------------------------
create or replace function public.fn_spt_baru_ke_berjalan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.penugasan
     set status = 'berjalan', diubah_pada = now()
   where id = new.penugasan_id and status = 'baru';
  return new;
end;
$$;

create trigger trg_spt_baru_ke_berjalan
  after insert on public.laporan_harian
  for each row
  execute function public.fn_spt_baru_ke_berjalan();

-- =====================================================================
-- Syarat minimum bertahan seumur SPT (Bagian 6) — empat pemicu.
-- Draf/selesai/dibatalkan SENGAJA dikecualikan: draf masih disusun
-- (boleh sementara nol), sedangkan selesai/dibatalkan sudah tidak
-- menerima perubahan susunan tim/dasar/lokasi sama sekali (terkunci
-- BR lain), jadi penjaga di sini tidak pernah tersentuh pada keduanya.
-- =====================================================================

create or replace function public.fn_jaga_pelaksana_anggota_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (new.dicabut_pada is not null and old.dicabut_pada is null) then
    return new;
  end if;

  -- Penguncian baris induk: menyerialkan dua pencabutan yang tiba
  -- bersamaan. Yang kedua menunggu sampai yang pertama menuntaskan
  -- transaksinya, lalu menghitung ulang keadaan yang sudah berubah.
  select status into st
    from public.penugasan
   where id = new.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.penugasan_id
     and pp.dicabut_pada is null
     and pp.id <> new.id
     and u.peran = 'anggota';

  if sisa = 0 then
    raise exception 'PELAKSANA_ANGGOTA_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_pelaksana_anggota_terakhir
  before update on public.penugasan_pelaksana
  for each row
  execute function public.fn_jaga_pelaksana_anggota_terakhir();

create or replace function public.fn_jaga_panit_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (new.dicabut_pada is not null and old.dicabut_pada is null) then
    return new;
  end if;

  select status into st
    from public.penugasan
   where id = new.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_panit
   where penugasan_id = new.penugasan_id
     and dicabut_pada is null
     and id <> new.id;

  if sisa = 0 then
    raise exception 'PANIT_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_panit_terakhir
  before update on public.penugasan_panit
  for each row
  execute function public.fn_jaga_panit_terakhir();

create or replace function public.fn_jaga_dasar_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  select status into st
    from public.penugasan
   where id = old.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return old;
  end if;

  select count(*) into sisa
    from public.penugasan_dasar
   where penugasan_id = old.penugasan_id
     and id <> old.id;

  if sisa = 0 then
    raise exception 'DASAR_PENUGASAN_TERAKHIR';
  end if;

  return old;
end;
$$;

create trigger trg_jaga_dasar_terakhir
  before delete on public.penugasan_dasar
  for each row
  execute function public.fn_jaga_dasar_terakhir();

-- KP-6.2-42 (penolakan hapus titik yang sudah dirujuk laporan) +
-- syarat minimum satu titik berkoordinat, digabung satu pemicu karena
-- keduanya sama-sama peristiwa BEFORE DELETE pada tabel yang sama.
create or replace function public.fn_jaga_lokasi_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
  n int;
begin
  select count(*) into n
    from public.laporan_harian where lokasi_id = old.id;
  if n > 0 then
    raise exception 'TITIK_SUDAH_DIRUJUK_LAPORAN';
  end if;

  if old.lat is null then
    return old;
  end if;

  select status into st
    from public.penugasan
   where id = old.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return old;
  end if;

  select count(*) into sisa
    from public.penugasan_lokasi
   where penugasan_id = old.penugasan_id
     and id <> old.id
     and lat is not null and lng is not null;

  if sisa = 0 then
    raise exception 'LOKASI_BERKOORDINAT_TERAKHIR';
  end if;

  return old;
end;
$$;

create trigger trg_jaga_lokasi_terakhir
  before delete on public.penugasan_lokasi
  for each row
  execute function public.fn_jaga_lokasi_terakhir();

-- Pengosongan koordinat titik terakhir melanggar BR-33 sama persis
-- dengan menghapusnya — pelanggaran lewat SUNTINGAN, bukan penghapusan.
create or replace function public.fn_jaga_lokasi_berkoordinat_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (old.lat is not null and new.lat is null) then
    return new;
  end if;

  select status into st
    from public.penugasan where id = new.penugasan_id for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_lokasi
   where penugasan_id = new.penugasan_id
     and id <> new.id
     and lat is not null and lng is not null;

  if sisa = 0 then
    raise exception 'LOKASI_BERKOORDINAT_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_lokasi_berkoordinat_terakhir
  before update on public.penugasan_lokasi
  for each row
  execute function public.fn_jaga_lokasi_berkoordinat_terakhir();
