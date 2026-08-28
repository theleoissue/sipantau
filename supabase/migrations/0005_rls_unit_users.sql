-- =====================================================================
-- 0005 — Kebijakan RLS: unit, users, perangkat_masuk, jejak_audit
-- Sumber: docs/10-modul-6.1-auth.md §9.2 [FINAL], Addendum 6.1-T §1.3
-- =====================================================================
--
-- Setiap panggilan fungsi bantu DIBUNGKUS (select ...). Bentuk itu
-- membuat PostgreSQL menghitungnya sekali per pernyataan, bukan sekali
-- per baris (Addendum 6.1-T §1.4, mengikat). Tanpa pembungkus, tabel
-- berisi puluhan ribu baris koordinat akan terasa sangat lambat.
--
-- Klausa untuk peran Panit pada tabel users ditambahkan di migrasi
-- Modul 6.2, karena ia menelusuri penugasan_panit yang belum ada di sini
-- (AM-6.1-14: lingkup Panit TIDAK PERNAH lewat perbandingan kolom unit).
-- =====================================================================

-- ---------------------------------------------------------------------
-- unit
-- ---------------------------------------------------------------------
create policy "unit_baca"
on public.unit
for select
to authenticated
using (
  aktif = true
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
);

-- ---------------------------------------------------------------------
-- users — baca
--
-- Pengguna membaca barisnya sendiri. Kasubdit dan Akun Pemeliharaan
-- membaca seluruhnya. Kanit membaca baris pengguna di unitnya.
-- ---------------------------------------------------------------------
create policy "users_baca_sesuai_lingkup"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
);

-- ---------------------------------------------------------------------
-- users — tulis
--
-- Kolom peran dan unit_id hanya dapat ditulis Kasubdit. Penegakan
-- per-kolom tidak dapat dilakukan kebijakan RLS, jadi dijaga pemicu
-- di bawah — bukan diserahkan pada itikad baik lapisan tampilan.
--
-- Pengguna biasa hanya boleh mengubah barisnya sendiri, dan pemicu
-- yang membatasi kolom mana yang boleh berubah adalah penjaganya.
-- ---------------------------------------------------------------------
create policy "users_ubah_diri_sendiri"
on public.users
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "users_ubah_kasubdit"
on public.users
for update
to authenticated
using ((select sipantau_auth.peran_saya()) = 'kasubdit')
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');

-- Kanit: hanya untuk menyalakan wajib_ganti_sandi pada Anggota dan Panit
-- di unitnya (BR-15). Batasan kolomnya ditegakkan pemicu.
create policy "users_ubah_kanit_reset_sandi"
on public.users
for update
to authenticated
using (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and unit_id = (select sipantau_auth.unit_saya())
  and peran in ('anggota', 'panit')
)
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and unit_id = (select sipantau_auth.unit_saya())
  and peran in ('anggota', 'panit')
);

create policy "users_ubah_pemeliharaan"
on public.users
for update
to authenticated
using ((select sipantau_auth.peran_saya()) = 'pemeliharaan')
with check ((select sipantau_auth.peran_saya()) = 'pemeliharaan');

-- ---------------------------------------------------------------------
-- Pemicu penjaga kolom pada users
--
-- Kebijakan RLS tidak dapat membatasi KOLOM MANA yang boleh berubah,
-- hanya BARIS MANA. Tanpa pemicu ini, seorang Anggota yang boleh
-- mengubah barisnya sendiri dapat menaikkan perannya menjadi kasubdit
-- lewat permintaan langsung ke basis data — dan itu berhasil tanpa
-- satu pun galat. Ini persis kelas kegagalan senyap yang diperingatkan
-- docs/CLAUDE.md §11.
--
-- Nama berawalan trg_ dan fn_ (docs/01-koreksi.md I.8): urutan jalannya
-- pemicu ditentukan abjad nama, jadi penamaan bukan soal kerapian.
-- ---------------------------------------------------------------------
create or replace function public.fn_jaga_kolom_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
begin
  -- Kasubdit boleh mengubah apa pun.
  if v_peran = 'kasubdit' then
    return new;
  end if;

  -- Peran dan unit hanya boleh disentuh Kasubdit, tanpa kecuali.
  if new.peran is distinct from old.peran
     or new.unit_id is distinct from old.unit_id then
    raise exception 'KOLOM_TERKUNCI: peran dan unit hanya dapat diubah Kasubdit';
  end if;

  -- NRP dan email sintetis tidak pernah berubah setelah akun dibuat.
  if new.nrp is distinct from old.nrp
     or new.email_sistem is distinct from old.email_sistem then
    raise exception 'KOLOM_TERKUNCI: NRP tidak dapat diubah';
  end if;

  -- Penonaktifan akun adalah kewenangan Kasubdit dan Akun Pemeliharaan.
  if new.aktif is distinct from old.aktif
     and v_peran <> 'pemeliharaan' then
    raise exception 'KOLOM_TERKUNCI: status aktif hanya dapat diubah Kasubdit atau Akun Pemeliharaan';
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
  -- (AM-6.1-17). Mengisinya lebih awal berarti menyimpan data biometrik
  -- tanpa dasar.
  if new.foto_acuan_wajah is distinct from old.foto_acuan_wajah then
    raise exception 'KOLOM_TERKUNCI: foto_acuan_wajah belum boleh diisi';
  end if;

  -- CELAH YANG DITUTUP DI SINI:
  -- kebijakan "users_ubah_diri_sendiri" mengizinkan seseorang mengubah
  -- barisnya sendiri. Tanpa penjagaan di bawah, ia dapat mematikan
  -- wajib_ganti_sandi lewat permintaan langsung ke basis data dan
  -- melewati Kata Sandi Sementara tanpa pernah menggantinya — padahal
  -- AM-6.1-04 menyatakan tidak ada jalan melewatinya. Berhasil tanpa
  -- satu pun galat, jadi tidak akan ketahuan siapa pun.
  --
  -- Kedua kolom di bawah karena itu hanya boleh berubah dari dalam
  -- fungsi security definer di 0006, yang menyalakan penanda sesi ini
  -- sesaat sebelum menulis.
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

create trigger trg_jaga_kolom_users
  before update on public.users
  for each row
  execute function public.fn_jaga_kolom_users();

-- ---------------------------------------------------------------------
-- perangkat_masuk
--
-- Tidak ada grant kepada authenticated (0003), jadi kebijakan di bawah
-- hanya berlaku bagi fungsi security definer yang menyetel peran.
-- Ditulis tetap, supaya tabel tidak pernah berada dalam keadaan
-- "RLS menyala tanpa maksud yang tercatat".
-- ---------------------------------------------------------------------
create policy "perangkat_baca_sendiri"
on public.perangkat_masuk
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) = 'pemeliharaan'
);

-- ---------------------------------------------------------------------
-- jejak_audit
--
-- Baca: Kasubdit dan Akun Pemeliharaan seluruhnya; Kanit yang pelaku
-- atau sasarannya di unitnya; pengguna melihat jejaknya sendiri.
-- Tulis: seluruh pengguna terautentikasi dapat menambah.
-- Tidak ada yang dapat mengubah maupun menghapus (BR-22) — ditegakkan
-- dengan tidak adanya grant update/delete DAN pemicu penolak di bawah.
-- ---------------------------------------------------------------------
create policy "jejak_audit_baca"
on public.jejak_audit
for select
to authenticated
using (
  pelaku_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and pelaku_id in (
      select u.id from public.users u
      where u.unit_id = (select sipantau_auth.unit_saya())
    )
  )
);

create policy "jejak_audit_tambah"
on public.jejak_audit
for insert
to authenticated
with check (pelaku_id = (select auth.uid()));

create or replace function public.fn_jejak_audit_hanya_tambah()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'JEJAK_AUDIT_TERKUNCI: baris jejak audit tidak dapat diubah maupun dihapus';
end;
$$;

create trigger trg_jejak_audit_hanya_tambah
  before update or delete on public.jejak_audit
  for each row
  execute function public.fn_jejak_audit_hanya_tambah();
