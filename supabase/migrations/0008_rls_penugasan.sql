-- =====================================================================
-- 0008 — Fungsi lingkup dan kebijakan RLS Modul 6.2
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 7 [FINAL]
-- =====================================================================
--
-- DUA HAL YANG PALING MUNGKIN SALAH DI MODUL INI, keduanya ditulis
-- eksplisit di berkas sumbernya:
--
--   1. Klausa BACA untuk Panit dan pelaksana MENGABAIKAN dicabut_pada,
--      sedangkan klausa TULIS MEMERIKSANYA. Menyamakan keduanya
--      melanggar BR-21: Panit kehilangan riwayat yang seharusnya
--      terbaca selamanya. Asimetri di bawah disengaja.
--
--   2. Draf tidak boleh bocor. Klausa Kasubdit wajib menyertakan
--      pengecualian draf, kalau tidak catatan yang belum jadi terbaca
--      atasan sebelum pemiliknya selesai berpikir.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fungsi 3 — lingkup Panit (Addendum 6.1-T Bagian 1, Fungsi 3)
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.penugasan_yang_saya_awasi()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_panit
  where panit_id = (select auth.uid())
$$;

revoke execute on function sipantau_auth.penugasan_yang_saya_awasi() from public;
grant execute on function sipantau_auth.penugasan_yang_saya_awasi() to authenticated;

-- ---------------------------------------------------------------------
-- Fungsi 5 — lingkup pelaksana
--
-- FUNGSI INI ADA UNTUK MENCEGAH REKURSI RLS TAK BERHINGGA.
--
-- Tanpanya, kebijakan baca `penugasan` (cabang pelaksana) akan
-- menyubkueri `penugasan_pelaksana` secara langsung, sementara
-- kebijakan baca `penugasan_pelaksana` menyubkueri balik ke
-- `penugasan` — dan PostgreSQL mendeteksi lingkaran tak berujung lalu
-- menolak kueri apa pun pada kedua tabel.
--
-- Ini bug yang benar-benar terjadi di proyek ini dan baru ketahuan
-- lewat uji fungsional, bukan lewat tinjauan kode. security definer
-- memutus lingkarannya karena fungsi berjalan sebagai pemilik tabel
-- sehingga melewati RLS.
-- ---------------------------------------------------------------------
create or replace function sipantau_auth.penugasan_yang_saya_laksanakan()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_pelaksana
  where pelaksana_id = (select auth.uid())
$$;

revoke execute on function sipantau_auth.penugasan_yang_saya_laksanakan() from public;
grant execute on function sipantau_auth.penugasan_yang_saya_laksanakan() to authenticated;

-- ---------------------------------------------------------------------
-- Klausa Panit pada tabel users
--
-- Melengkapi catatan tertunda dari migrasi 0005. Lingkup Panit
-- ditelusuri lewat penugasan_panit, TIDAK PERNAH lewat perbandingan
-- kolom unit (AM-6.1-14) — susunan tim ditetapkan per SPT, bukan sekali
-- di awal lalu berlaku selamanya.
-- ---------------------------------------------------------------------
create policy "users_baca_panit_lihat_pelaksana"
on public.users
for select
to authenticated
using (
  (select sipantau_auth.peran_saya()) = 'panit'
  and id in (
    select pp.pelaksana_id
    from public.penugasan_pelaksana pp
    where pp.penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
  )
);

-- =====================================================================
-- penugasan
-- =====================================================================

create policy "penugasan_baca_sesuai_lingkup"
on public.penugasan
for select
to authenticated
using (
  -- Kasubdit dan Akun Pemeliharaan: seluruh baris KECUALI draf milik
  -- orang lain.
  (
    (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
    and (status <> 'draf' or diterbitkan_oleh = (select auth.uid()))
  )
  -- Kanit: baris di unitnya, termasuk drafnya sendiri.
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  -- Panit: tanpa memandang dicabut_pada (BR-21). Draf tidak pernah
  -- punya penunjukan, jadi tidak perlu disaring lagi di sini.
  or id in (select sipantau_auth.penugasan_yang_saya_awasi())
  -- Pelaksana: tanpa memandang dicabut_pada (BR-27).
  or id in (select sipantau_auth.penugasan_yang_saya_laksanakan())
);

-- Tulis: hanya Kanit, terbatas unitnya sendiri.
create policy "penugasan_tambah_kanit"
on public.penugasan
for insert
to authenticated
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and unit_id = (select sipantau_auth.unit_saya())
);

create policy "penugasan_ubah_kanit"
on public.penugasan
for update
to authenticated
using (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and unit_id = (select sipantau_auth.unit_saya())
)
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and unit_id = (select sipantau_auth.unit_saya())
);

-- Kasubdit hanya untuk pembukaan kembali SPT yang sudah selesai.
-- Pembatasan "hanya kolom status" tidak dapat dinyatakan kebijakan RLS,
-- jadi ditegakkan pemicu trg_jaga_kolom_penugasan di bawah.
create policy "penugasan_ubah_kasubdit_buka_kembali"
on public.penugasan
for update
to authenticated
using (
  (select sipantau_auth.peran_saya()) = 'kasubdit'
  and status in ('selesai', 'dibatalkan')
)
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');

create or replace function public.fn_jaga_kolom_penugasan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select sipantau_auth.peran_saya()) = 'kasubdit' then
    -- Kasubdit boleh menyentuh status saja. Bila ia mengubah kolom
    -- lain, seluruh perubahannya ditolak.
    if new.judul is distinct from old.judul
       or new.nomor_spt is distinct from old.nomor_spt
       or new.unit_id is distinct from old.unit_id
       or new.tanggal_batas is distinct from old.tanggal_batas
       or new.uraian_tugas is distinct from old.uraian_tugas then
      raise exception 'KOLOM_TERKUNCI: Kasubdit hanya dapat membuka kembali penugasan, bukan menyuntingnya';
    end if;
  end if;

  -- Unit pemilik tidak pernah berpindah. Memindahkannya berarti
  -- memindahkan seluruh laporan dan rute di bawahnya ke lingkup baca
  -- orang lain sekaligus, tanpa satu pun jejak.
  if new.unit_id is distinct from old.unit_id then
    raise exception 'KOLOM_TERKUNCI: unit pemilik penugasan tidak dapat dipindahkan';
  end if;

  new.diubah_pada := now();
  return new;
end;
$$;

create trigger trg_jaga_kolom_penugasan
  before update on public.penugasan
  for each row
  execute function public.fn_jaga_kolom_penugasan();

-- =====================================================================
-- Tabel anak — baca mengikuti hak baca induknya
--
-- Ditulis sebagai subkueri ke public.penugasan, yang aman karena
-- kebijakan penugasan di atas TIDAK menyubkueri balik ke tabel anak
-- mana pun; ia memakai fungsi security definer. Di situlah lingkaran
-- rekursinya diputus.
-- =====================================================================

create policy "dasar_baca_ikut_induk"
on public.penugasan_dasar
for select
to authenticated
using (penugasan_id in (select id from public.penugasan));

create policy "dasar_tulis_kanit"
on public.penugasan_dasar
for all
to authenticated
using (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
)
with check (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
);

create policy "lokasi_baca_ikut_induk"
on public.penugasan_lokasi
for select
to authenticated
using (penugasan_id in (select id from public.penugasan));

create policy "lokasi_tulis_kanit"
on public.penugasan_lokasi
for all
to authenticated
using (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
)
with check (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
);

-- penugasan_pelaksana: setiap orang SELALU membaca baris miliknya
-- sendiri, di samping yang mengikuti hak baca induknya.
create policy "pelaksana_baca"
on public.penugasan_pelaksana
for select
to authenticated
using (
  pelaksana_id = (select auth.uid())
  or penugasan_id in (select id from public.penugasan)
);

create policy "pelaksana_tulis_kanit"
on public.penugasan_pelaksana
for insert
to authenticated
with check (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
);

create policy "pelaksana_ubah_kanit"
on public.penugasan_pelaksana
for update
to authenticated
using (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
  -- Kolom dibaca_pada (tanda terima) ditulis pemiliknya sendiri.
  or pelaksana_id = (select auth.uid())
)
with check (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
  or pelaksana_id = (select auth.uid())
);

create policy "panit_baca"
on public.penugasan_panit
for select
to authenticated
using (
  panit_id = (select auth.uid())
  or penugasan_id in (select id from public.penugasan)
);

create policy "panit_tulis_kanit"
on public.penugasan_panit
for insert
to authenticated
with check (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
);

create policy "panit_ubah_kanit"
on public.penugasan_panit
for update
to authenticated
using (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
)
with check (
  penugasan_id in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
);

-- =====================================================================
-- sesi_tugas — tolak-baku total sampai Modul 6.4 menetapkan bentuknya
-- =====================================================================
-- Tidak ada kebijakan sama sekali. RLS menyala tanpa kebijakan berarti
-- menolak semua, dan itu keadaan yang dikehendaki di sini.
