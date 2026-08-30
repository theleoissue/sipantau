-- =====================================================================
-- 0017 — Kebijakan RLS dan Realtime Modul 6.4 (GPS)
-- Sumber: docs/40-modul-6.4-gps.md Bagian 7 (9.2), P-18, P-21
-- =====================================================================
--
-- DUA ASIMETRI YANG DISENGAJA, DITULIS DI SINI SUPAYA TIDAK TERTUKAR
-- (peringatan berkas sumber, diulang tiga kali):
--
--   1. Klausa PANIT: location_logs & sesi_tugas MENGABAIKAN dicabut_pada
--      (pakai sipantau_auth.penugasan_yang_saya_awasi(), BR-21 — riwayat
--      bertahan selamanya). posisi_terkini MEMERIKSA dicabut_pada (pakai
--      ...penugasan_yang_saya_awasi_aktif(), BR-62 teramandemen —
--      pemantauan langsung berakhir bersama penunjukan).
--
--   2. Klausa REKAN PELAKSANA: location_logs & sesi_tugas memeriksa
--      dicabut_pada PADA PEMBACA saja (...penugasan_yang_saya_laksanakan_
--      aktif()). posisi_terkini memeriksa dicabut_pada PADA PEMBACA
--      *dan* PADA PEMILIK BARIS, karena tabel ini hanya berisi sesi yang
--      sedang berjalan dan visibilitasnya adalah kerja sama lapangan
--      yang berakhir seketika, bukan riwayat.
--
-- Menyalin satu klausa ke tempat yang salah lolos tanpa galat apa pun —
-- persis kegagalan senyap yang diperingatkan berkas sumber.
-- =====================================================================

grant select on public.sesi_tugas to authenticated;
grant select on public.posisi_terkini to authenticated;
grant select on public.titik_penanda to authenticated;
-- location_logs sudah diberi grant select pada 0015.

-- ---------------------------------------------------------------------
-- sesi_tugas — baca
-- ---------------------------------------------------------------------
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
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
);

-- Tidak ada kebijakan insert/update/delete: seluruh penulisan lewat
-- fn_buka_sesi_tugas dan fn_tutup_sesi_tugas (security definer, tidak
-- tunduk RLS). Tanpa grant insert/update kepada authenticated, upaya
-- menulis langsung ditolak sejak lapisan hak akses, sebelum RLS
-- sempat dievaluasi.

-- ---------------------------------------------------------------------
-- location_logs — baca (BR-21 Panit mengabaikan dicabut_pada, BR-62
-- rekan memeriksa dicabut_pada PEMBACA)
-- ---------------------------------------------------------------------
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
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
);

-- ---------------------------------------------------------------------
-- posisi_terkini — baca (P-21: Panit dan rekan MEMERIKSA dicabut_pada)
-- ---------------------------------------------------------------------
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
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
);

-- ---------------------------------------------------------------------
-- titik_penanda — baca (BR-61: HANYA Kanit unit pemilik, Kasubdit,
-- Pemeliharaan. Panit dan Anggota nol baris, termasuk lewat permintaan
-- langsung — KP-6.4-51)
-- ---------------------------------------------------------------------
create policy "titik_penanda_baca_terbatas"
on public.titik_penanda
for select
to authenticated
using (
  (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
);

-- =====================================================================
-- Realtime — posisi_terkini SAJA (P-18: kunci utama tanpa arti,
-- replica identity BAWAAN, tidak pernah diset penuh)
-- =====================================================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'posisi_terkini'
  ) then
    alter publication supabase_realtime add table public.posisi_terkini;
  end if;
end
$$;

-- Pemeriksaan negatif yang wajib tetap benar: JANGAN PERNAH menjalankan
-- `alter table public.posisi_terkini replica identity full` di sini
-- atau di migrasi mana pun sesudahnya (P-18, BR-anti-kebocoran). Kunci
-- utama sesi_tugas_id sudah cukup dan sengaja tanpa arti.
