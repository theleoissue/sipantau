-- =====================================================================
-- 0012 — Kebijakan RLS, tampilan, dan pembersih berjadwal Modul 6.3
-- Sumber: docs/30-modul-6.3-pelaporan.md Bagian 6 §9.2, Addendum 6.3-T
-- Celah 7-9 (dikoreksi)
-- =====================================================================
--
-- DUA TAMPILAN DI SINI PUNYA ATURAN security_invoker YANG BERBEDA, DAN
-- KEDUANYA DISENGAJA:
--
--   v_belum_lapor      security_invoker = ON  (docs/01-koreksi.md I.2)
--   rekap_laporan_tim  security_invoker = OFF (pengecualian BR-37 yang
--                      dinyatakan tegas di docs/CLAUDE.md §5.2)
--
-- rekap_laporan_tim BERBEDA dari contoh kode Addendum 6.3-T aslinya:
-- versi asli tidak menyaring dirinya sendiri sama sekali, sehingga
-- SIAPA PUN yang terautentikasi dapat membaca penugasan_id + pelapor_id
-- SELURUH SISTEM lintas unit lewat panggilan API langsung — bukan cuma
-- lewat aplikasi yang kebetulan menambahkan penyaring sendiri.
-- docs/CLAUDE.md §5.2 menegaskan tampilan berhak akses OWNER wajib
-- menyaring dirinya dengan auth.uid(); di bawah ini penerapannya.
-- =====================================================================

-- =====================================================================
-- laporan_harian
-- =====================================================================

-- Baca: pelapornya sendiri; Panit dengan penunjukan TANPA MEMANDANG
-- dicabut_pada (BR-21); Kanit unit pemilik; Kasubdit; Pemeliharaan.
-- SESAMA PELAKSANA TIDAK TERMASUK — mereka memakai rekap_laporan_tim.
create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  pelapor_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
       where unit_id = (select sipantau_auth.unit_saya())
    )
  )
  or penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
);

-- Tulis (insert): hanya pelaksana aktif SPT itu. Pemeriksaan penuhnya
-- (SPT masih menerima, benar-benar pelaksana) ada di pemicu 0011 —
-- kebijakan RLS ini cukup memastikan pengirimnya mengaku dirinya sendiri.
create policy "laporan_tambah_pelapor"
on public.laporan_harian
for insert
to authenticated
with check (pelapor_id = (select auth.uid()));

-- Tulis (update): pelapor sendiri selama belum terkunci (diperiksa
-- pemicu), ATAU Kanit unit pemilik untuk kolom persetujuan (diperiksa
-- fungsi setujui_laporan yang security definer).
create policy "laporan_ubah_pelapor"
on public.laporan_harian
for update
to authenticated
using (pelapor_id = (select auth.uid()))
with check (pelapor_id = (select auth.uid()));

create policy "laporan_ubah_kanit"
on public.laporan_harian
for update
to authenticated
using (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and penugasan_id in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
  )
)
with check (
  (select sipantau_auth.peran_saya()) = 'kanit'
  and penugasan_id in (
    select id from public.penugasan
     where unit_id = (select sipantau_auth.unit_saya())
  )
);

-- =====================================================================
-- catatan_laporan
-- =====================================================================

-- Baca: mengikuti hak baca laporan induknya.
create policy "catatan_baca_ikut_induk"
on public.catatan_laporan
for select
to authenticated
using (laporan_id in (select id from public.laporan_harian));

-- Tulis (insert): Panit dengan penunjukan aktif pada SPT induk, Kanit
-- unit pemilik, Kasubdit. Larangan tinjau-sendiri ditegakkan pemicu.
create policy "catatan_tambah_peninjau"
on public.catatan_laporan
for insert
to authenticated
with check (
  peninjau_id = (select auth.uid())
  and (
    (select sipantau_auth.peran_saya()) = 'kasubdit'
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

-- Tulis (update): hanya penulisnya sendiri (BR-43 — tidak saling menimpa).
create policy "catatan_ubah_penulis"
on public.catatan_laporan
for update
to authenticated
using (peninjau_id = (select auth.uid()))
with check (peninjau_id = (select auth.uid()));

create or replace function public.fn_tandai_sunting_catatan()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.isi is distinct from old.isi then
    new.disunting_pada := now();
  end if;
  -- peninjau_id dan laporan_id tidak pernah berpindah setelah dibuat.
  new.peninjau_id := old.peninjau_id;
  new.laporan_id  := old.laporan_id;
  new.dibuat_pada := old.dibuat_pada;
  return new;
end;
$$;

create trigger trg_tandai_sunting_catatan
  before update on public.catatan_laporan
  for each row
  execute function public.fn_tandai_sunting_catatan();

-- =====================================================================
-- foto_dokumentasi
-- =====================================================================

-- Baca: mengikuti hak baca laporan induknya.
create policy "foto_baca_ikut_induk"
on public.foto_dokumentasi
for select
to authenticated
using (laporan_id in (select id from public.laporan_harian));

-- Tulis (insert): hanya pelapor laporan induk, dan hanya selama laporan
-- itu masih dapat disunting (KP-6.3-30) — diperiksa di sini karena
-- foto_dokumentasi tidak punya pemicu penjaga kunci sendiri.
create policy "foto_tambah_pelapor"
on public.foto_dokumentasi
for insert
to authenticated
with check (
  diunggah_oleh = (select auth.uid())
  and laporan_id in (
    select id from public.laporan_harian
     where pelapor_id = (select auth.uid())
       and status_laporan in ('terkirim', 'perlu_diperbaiki')
  )
);

-- =====================================================================
-- v_belum_lapor
--
-- security_invoker = ON (docs/01-koreksi.md I.2) — BUKAN pengecualian
-- BR-37. Dengan invoker=on, RLS pada penugasan_pelaksana dan penugasan
-- di baliknya SUDAH MENGHASILKAN penyaringan yang tepat dengan
-- sendirinya: Kanit membaca unitnya, Kasubdit seluruhnya, pelaksana
-- hanya barisnya sendiri (dan itu tidak berbahaya — ia memang berhak
-- tahu dirinya belum melapor).
--
-- ZONA WAKTU (BR-64): dibandingkan dengan tanggal Asia/Jakarta, bukan
-- current_date polos. Servernya UTC; tanpa ini SPT yang batasnya hari
-- ini akan salah tanda sejak pukul 17.00 WIB kemarin.
--
-- CATATAN: koreksi I.2 pada dokumen sumber menyebut kolom `direkam_pada`
-- (dari Antrean Luring, Addendum 6.3-K). Antrean Luring TERMASUK yang
-- DITUNDA secara eksplisit (docs/CLAUDE.md §10), jadi kolom itu belum
-- ada di skema ini — dipakai `dikirim_pada` yang memang ada di §5.4.
-- =====================================================================
create or replace view public.v_belum_lapor
with (security_invoker = on)
as
select pp.penugasan_id,
       pp.pelaksana_id,
       p.unit_id,
       p.nomor_spt
  from public.penugasan_pelaksana pp
  join public.penugasan p on p.id = pp.penugasan_id
 where p.status in ('baru', 'berjalan', 'bermasalah')
   and p.wajib_lapor_harian = true
   and pp.dicabut_pada is null
   and not exists (
     select 1
       from public.laporan_harian lh
      where lh.penugasan_id = pp.penugasan_id
        and lh.pelapor_id   = pp.pelaksana_id
        and lh.status_laporan <> 'ditarik'
        and (lh.dikirim_pada at time zone 'Asia/Jakarta')::date
          = (now() at time zone 'Asia/Jakarta')::date
   );

grant select on public.v_belum_lapor to authenticated;

-- =====================================================================
-- rekap_laporan_tim
--
-- security_invoker = OFF, DENGAN penyaringan diri lewat auth.uid()
-- (docs/CLAUDE.md §5.2 — satu-satunya pengecualian yang diizinkan, dan
-- wajib menyaring dirinya sendiri). Hanya mengekspos TIGA kolom: isi
-- laporan tidak pernah terbaca sesama pelaksana (KP-6.3-58).
-- =====================================================================
create or replace view public.rekap_laporan_tim
with (security_invoker = off)
as
select lh.penugasan_id, lh.pelapor_id, lh.dikirim_pada
  from public.laporan_harian lh
 where lh.status_laporan <> 'ditarik'
   and exists (
     select 1 from public.penugasan_pelaksana pp
      where pp.penugasan_id = lh.penugasan_id
        and pp.pelaksana_id = (select auth.uid())
        and pp.dicabut_pada is null
   );

grant select on public.rekap_laporan_tim to authenticated;

-- =====================================================================
-- Celah 9 — Foto yatim dibersihkan berjadwal
--
-- Nama fungsi wadah 'dokumentasi' sudah dideklarasikan di migrasi 0001.
-- Kolom berkas_path (BUKAN jalur_berkas — docs/01-koreksi.md I.1).
-- =====================================================================
create or replace function public.fn_bersihkan_foto_yatim()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects
   where bucket_id = 'dokumentasi'
     and created_at < now() - interval '24 hours'
     and name not in (
       select f.berkas_path from public.foto_dokumentasi f
        where f.berkas_path is not null
     );
end;
$$;

-- Dijadwalkan hanya bila pg_cron tersedia. Kalau belum diaktifkan di
-- Supabase, baris ini gagal terlihat jelas saat migrasi dijalankan —
-- itu memang yang diinginkan, bukan gagal senyap.
select cron.schedule('bersih-foto-yatim', '0 2 * * *',
  'select public.fn_bersihkan_foto_yatim()');
