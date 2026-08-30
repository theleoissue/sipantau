-- =====================================================================
-- 0033 — Transfer kewenangan akun ke Admin, perluasan lingkup baca
-- =====================================================================
--
-- Bagian dari keputusan sadar mengubah PRD (lihat catatan panjang di
-- 0032). Dua hal terjadi di sini:
--
--   1. Kasubdit KEHILANGAN kewenangan menulis kolom akun (peran, unit,
--      aktif) — pindah eksklusif ke Admin. Rekap Lintas Unit dan
--      seluruh kewenangan Kasubdit yang LAIN tidak disentuh sama sekali
--      (user hanya minta soal akun, bukan seluruh peran Kasubdit).
--   2. Admin mendapat hak BACA lintas-unit yang sama persis dengan
--      Kasubdit di setiap tabel yang sebelumnya memeriksa
--      peran_saya() = 'kasubdit' untuk hak "lihat semua".
--
-- BR-70 (docs/60-modul...md baris 132/813) ditegakkan di sini juga —
-- SAMA SEKALI belum ada di migrasi manapun sebelum ini, dan sekarang
-- jadi genting karena inilah migrasi pertama yang membuat penonaktifan
-- akun sungguhan mungkin terjadi lewat jalur normal.
-- =====================================================================

-- ---------------------------------------------------------------------
-- users — baca: tambah admin ke "lihat semua" (menggantikan versi 0014,
-- yang sudah menggantikan versi 0005 — ini yang aktif sekarang).
-- ---------------------------------------------------------------------
drop policy if exists "users_baca_sesuai_lingkup" on public.users;

create policy "users_baca_sesuai_lingkup"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
    and peran in ('panit', 'anggota')
  )
);

-- unit — baca: tambah admin.
drop policy if exists "unit_baca" on public.unit;

create policy "unit_baca"
on public.unit
for select
to authenticated
using (
  aktif = true
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
);

-- jejak_audit — baca: tambah admin.
drop policy if exists "jejak_audit_baca" on public.jejak_audit;

create policy "jejak_audit_baca"
on public.jejak_audit
for select
to authenticated
using (
  pelaku_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and pelaku_id in (
      select u.id from public.users u
      where u.unit_id = (select sipantau_auth.unit_saya())
    )
  )
);

-- ---------------------------------------------------------------------
-- users — tulis: kewenangan "ubah apa pun" PINDAH dari Kasubdit ke
-- Admin. users_ubah_diri_sendiri, users_ubah_kanit_reset_sandi, dan
-- users_ubah_pemeliharaan TIDAK disentuh — tidak berkaitan dengan
-- perubahan ini.
-- ---------------------------------------------------------------------
drop policy if exists "users_ubah_kasubdit" on public.users;

create policy "users_ubah_admin"
on public.users
for update
to authenticated
using ((select sipantau_auth.peran_saya()) = 'admin')
with check ((select sipantau_auth.peran_saya()) = 'admin');

-- Pemicu penjaga kolom: bypass "boleh ubah apa pun" pindah ke admin.
-- Kasubdit sekarang tunduk pada pemeriksaan per-kolom yang sama seperti
-- peran lain di bawahnya (peran/unit_id/aktif jadi TERKUNCI baginya —
-- itulah inti perubahan ini).
create or replace function public.fn_jaga_kolom_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
begin
  -- Admin boleh mengubah apa pun (KEWENANGAN INI SEBELUMNYA MILIK
  -- KASUBDIT — dipindahkan di sini, migrasi 0033).
  if v_peran = 'admin' then
    return new;
  end if;

  -- Peran dan unit hanya boleh disentuh Admin, tanpa kecuali.
  if new.peran is distinct from old.peran
     or new.unit_id is distinct from old.unit_id then
    raise exception 'KOLOM_TERKUNCI: peran dan unit hanya dapat diubah Admin';
  end if;

  -- NRP dan email sintetis tidak pernah berubah setelah akun dibuat.
  if new.nrp is distinct from old.nrp
     or new.email_sistem is distinct from old.email_sistem then
    raise exception 'KOLOM_TERKUNCI: NRP tidak dapat diubah';
  end if;

  -- Penonaktifan akun adalah kewenangan Admin dan Akun Pemeliharaan.
  if new.aktif is distinct from old.aktif
     and v_peran <> 'pemeliharaan' then
    raise exception 'KOLOM_TERKUNCI: status aktif hanya dapat diubah Admin atau Akun Pemeliharaan';
  end if;

  -- Kanit hanya boleh menyentuh wajib_ganti_sandi (BR-15). Bila ia
  -- mengubah kolom lain, seluruh perubahannya ditolak.
  if v_peran = 'kanit' and new.id <> (select auth.uid()) then
    if new.nama              is distinct from old.nama
       or new.pangkat        is distinct from old.pangkat
       or new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: Kanit hanya dapat menyalakan penggantian kata sandi';
    end if;
  end if;

  -- Kolom biometrik disediakan kosong dan tidak dibaca maupun ditulis
  -- modul mana pun sampai fitur verifikasi wajah disetujui tertulis
  -- (AM-6.1-17).
  if new.foto_acuan_wajah is distinct from old.foto_acuan_wajah then
    raise exception 'KOLOM_TERKUNCI: foto_acuan_wajah belum boleh diisi';
  end if;

  -- CELAH YANG DITUTUP DI SINI (tidak berubah dari 0005): kebijakan
  -- "users_ubah_diri_sendiri" mengizinkan seseorang mengubah barisnya
  -- sendiri — dua kolom di bawah hanya boleh berubah dari dalam fungsi
  -- security definer di 0006.
  if coalesce(current_setting('sipantau.jalur_resmi', true), '') <> 'on' then
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
-- BR-70: sistem tidak boleh berada tanpa satu pun akun kasubdit aktif.
-- Ditegakkan pemicu (bukan hanya di Fungsi Tepi nonaktifkan-akun) supaya
-- berlaku dari JALUR MANAPUN pembaruan datang — pola yang sama dengan
-- alasan fn_tutup_sesi_akun_nonaktif (0016) dijadikan pemicu, bukan
-- logika Fungsi Tepi semata (docs/01-koreksi.md W.3).
-- ---------------------------------------------------------------------
create or replace function public.fn_jaga_kasubdit_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.peran = 'kasubdit' and old.aktif = true
     and (new.peran is distinct from 'kasubdit'::public.peran_pengguna or new.aktif = false) then
    if not exists (
      select 1 from public.users
       where peran = 'kasubdit' and aktif = true and id <> old.id
    ) then
      raise exception 'BR_70_KASUBDIT_TERAKHIR: sistem tidak boleh berada tanpa satu pun akun kasubdit aktif';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_jaga_kasubdit_terakhir
  before update on public.users
  for each row
  execute function public.fn_jaga_kasubdit_terakhir();

-- ---------------------------------------------------------------------
-- penugasan — baca: tambah admin.
-- ---------------------------------------------------------------------
drop policy if exists "penugasan_baca_sesuai_lingkup" on public.penugasan;

create policy "penugasan_baca_sesuai_lingkup"
on public.penugasan
for select
to authenticated
using (
  (
    (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
    and (status <> 'draf' or diterbitkan_oleh = (select auth.uid()))
  )
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  or id in (select sipantau_auth.penugasan_yang_saya_awasi())
  or id in (select sipantau_auth.penugasan_yang_saya_laksanakan())
);

-- ---------------------------------------------------------------------
-- laporan_harian — baca dan tulis catatan: tambah admin.
-- ---------------------------------------------------------------------
drop policy if exists "laporan_baca_sesuai_lingkup" on public.laporan_harian;

create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  pelapor_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
       where unit_id = (select sipantau_auth.unit_saya())
    )
  )
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
);

drop policy if exists "catatan_tambah_peninjau" on public.catatan_laporan;

create policy "catatan_tambah_peninjau"
on public.catatan_laporan
for insert
to authenticated
with check (
  peninjau_id = (select auth.uid())
  and (
    (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin')
    or (
      (select sipantau_auth.peran_saya()) = 'kanit'
      and laporan_id in (
        select lh.id from public.laporan_harian lh
        join public.penugasan p on p.id = lh.penugasan_id
         where p.unit_id = (select sipantau_auth.unit_saya())
      )
    )
    or laporan_id in (
      select lh.id from public.laporan_harian lh
       where lh.penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
    )
  )
);

-- ---------------------------------------------------------------------
-- GPS (Modul 6.4) — empat kebijakan baca: tambah admin.
-- ---------------------------------------------------------------------
drop policy if exists "sesi_tugas_baca_sesuai_lingkup" on public.sesi_tugas;

create policy "sesi_tugas_baca_sesuai_lingkup"
on public.sesi_tugas
for select
to authenticated
using (
  pengguna_id = (select auth.uid())
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_laksanakan_aktif())
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
  or (
      (select sipantau_auth.peran_saya()) = 'kanit'
      and penugasan_id in (
        select id from public.penugasan where unit_id = (select sipantau_auth.unit_saya())
      )
     )
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
);

drop policy if exists "location_logs_baca_sesuai_lingkup" on public.location_logs;

create policy "location_logs_baca_sesuai_lingkup"
on public.location_logs
for select
to authenticated
using (
  pengguna_id = (select auth.uid())
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_laksanakan_aktif())
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
  or (
      (select sipantau_auth.peran_saya()) = 'kanit'
      and penugasan_id in (
        select id from public.penugasan where unit_id = (select sipantau_auth.unit_saya())
      )
     )
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
);

drop policy if exists "posisi_terkini_baca_sesuai_lingkup" on public.posisi_terkini;

create policy "posisi_terkini_baca_sesuai_lingkup"
on public.posisi_terkini
for select
to authenticated
using (
  pengguna_id = (select auth.uid())
  or (
    penugasan_id in (select sipantau_auth.penugasan_yang_saya_laksanakan_aktif())
    and exists (
      select 1 from public.penugasan_pelaksana pp
       where pp.penugasan_id = posisi_terkini.penugasan_id
         and pp.pelaksana_id = posisi_terkini.pengguna_id
         and pp.dicabut_pada is null
    )
  )
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi_aktif())
  or (
      (select sipantau_auth.peran_saya()) = 'kanit'
      and unit_id = (select sipantau_auth.unit_saya())
     )
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
);

drop policy if exists "titik_penanda_baca_terbatas" on public.titik_penanda;

create policy "titik_penanda_baca_terbatas"
on public.titik_penanda
for select
to authenticated
using (
  (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
);

-- ---------------------------------------------------------------------
-- LHP (Modul 6.8) — baca: tambah admin.
-- ---------------------------------------------------------------------
drop policy if exists "lhp_baca_sesuai_lingkup" on public.lhp;

create policy "lhp_baca_sesuai_lingkup"
on public.lhp
for select
to authenticated
using (
  disusun_oleh = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'admin', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
       where unit_id = (select sipantau_auth.unit_saya())
    )
  )
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
);

-- ---------------------------------------------------------------------
-- Notifikasi spt_bermasalah — penerima tambah admin (konsisten dengan
-- "admin melihat semua sama seperti kasubdit"). Menggantikan versi
-- 0026 (yang sudah menggantikan 0021) — versi itu yang aktif sekarang.
-- ---------------------------------------------------------------------
create or replace function public.fn_notifikasi_penugasan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penerima uuid[];
  v_pelaku   uuid := (select auth.uid());
  v_label_masalah text;
begin
  if new.status = 'baru' and old.status = 'draf' then
    select array_agg(panit_id) into v_penerima
      from public.penugasan_panit
     where penugasan_id = new.id and dicabut_pada is null;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_diterbitkan', v_penerima, 'Penugasan baru diterbitkan',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;

    select array_agg(pelaksana_id) into v_penerima
      from public.penugasan_pelaksana
     where penugasan_id = new.id and dicabut_pada is null;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_ditugaskan', v_penerima, 'Anda ditunjuk pada penugasan',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;
  end if;

  if new.status = 'bermasalah' and old.status <> 'bermasalah' then
    select array_agg(id) into v_penerima
      from public.users
     where aktif = true
       and ((peran = 'kanit' and unit_id = new.unit_id) or peran in ('kasubdit', 'admin'));

    v_label_masalah := case new.jenis_masalah
      when 'alamat_sasaran_fiktif'        then 'Alamat atau sasaran fiktif'
      when 'objek_tidak_ditemukan'         then 'Objek tidak ditemukan di lokasi'
      when 'informasi_tidak_sesuai'        then 'Informasi awal tidak sesuai kenyataan'
      when 'kendala_keamanan'              then 'Situasi tidak memungkinkan karena alasan keamanan'
      when 'sasaran_berpindah'             then 'Sasaran berpindah tempat'
      when 'kendala_perangkat_jaringan'    then 'Kendala perangkat atau jaringan'
      else 'Lainnya'
    end;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_bermasalah', v_penerima, 'Penugasan ditandai bermasalah',
        new.nomor_spt || ' — ' || new.judul || '. ' || v_label_masalah || ': ' || coalesce(new.uraian_masalah, ''),
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;
  end if;

  if new.status in ('selesai', 'dibatalkan') and old.status not in ('selesai', 'dibatalkan') then
    v_penerima := public.penerima_pelaksana_spt(new.id);

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_ditutup', v_penerima, 'Penugasan ditutup',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, false, v_pelaku
      );
    end if;
  end if;

  return new;
end;
$$;
