-- =====================================================================
-- 0028 — Kebijakan RLS Modul 6.8 (LHP Ringkas)
-- Sumber: docs/00-fondasi.md §7 (RBAC baris 341-345), §9.2 (baris 1369)
--
-- RBAC yang ditegakkan di bawah:
--   Menyusun/menulis  — Anggota saja, miliknya sendiri
--   Melihat           — Kasubdit semua unit, Kanit unit sendiri,
--                        Panit tim/SPT yang diawasinya, Anggota sendiri
--
-- CATATAN INTERPRETASI (bukan tebakan diam-diam, ditulis eksplisit):
-- Baris "Melihat LHP Ringkas" pada fondasi.md TIDAK menyebut pengecualian
-- untuk status draf (berbeda dari tabel penugasan yang eksplisit
-- menyembunyikan draf dari Kasubdit). Saya artikan pimpinan dalam
-- lingkupnya TETAP dapat melihat LHP berstatus draf — sama seperti
-- laporan_harian yang terlihat pengawas sejak dikirim, bukan menunggu
-- status akhir. Bila ini keliru, tinggal tambah syarat status='final'
-- pada klausa kasubdit/kanit/panit di bawah.
-- =====================================================================

-- ---------------------------------------------------------------------
-- lhp
-- ---------------------------------------------------------------------
create policy "lhp_baca_sesuai_lingkup"
on public.lhp
for select
to authenticated
using (
  disusun_oleh = (select auth.uid())
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

-- Tulis (insert): pengaman kedua di lapisan RLS. Jalur yang sesungguhnya
-- adalah fungsi mulai_lhp() (0030, security definer) yang MEMERIKSA
-- peran dan status pelaksana aktif — kebijakan ini sekadar memastikan
-- baris yang masuk mengaku pemiliknya sendiri, seandainya ada jalur
-- insert langsung dari klien.
create policy "lhp_tambah_penyusun"
on public.lhp
for insert
to authenticated
with check (disusun_oleh = (select auth.uid()));

-- Tulis (update): Anggota penyusun sendiri. Penguncian setelah status
-- 'final' ditegakkan pemicu (0029), bukan di sini — RLS tidak dapat
-- membaca OLD.status dengan mudah dalam bentuk yang sama.
create policy "lhp_ubah_penyusun"
on public.lhp
for update
to authenticated
using (disusun_oleh = (select auth.uid()))
with check (disusun_oleh = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Tabel anak — baca mengikuti induk, tulis hanya penyusun SELAGI masih
-- draf (fondasi.md: "Penyimpanan sebagai draf sebelum difinalkan").
-- ---------------------------------------------------------------------

create policy "lhp_petugas_baca_ikut_induk"
on public.lhp_petugas
for select
to authenticated
using (lhp_id in (select id from public.lhp));

create policy "lhp_petugas_tulis_penyusun"
on public.lhp_petugas
for all
to authenticated
using (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_petugas.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
)
with check (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_petugas.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
);

create policy "lhp_pihak_baca_ikut_induk"
on public.lhp_pihak
for select
to authenticated
using (lhp_id in (select id from public.lhp));

create policy "lhp_pihak_tulis_penyusun"
on public.lhp_pihak
for all
to authenticated
using (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_pihak.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
)
with check (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_pihak.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
);

create policy "lhp_saksi_baca_ikut_induk"
on public.lhp_saksi
for select
to authenticated
using (lhp_id in (select id from public.lhp));

create policy "lhp_saksi_tulis_penyusun"
on public.lhp_saksi
for all
to authenticated
using (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_saksi.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
)
with check (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_saksi.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
);

create policy "lhp_barang_bukti_baca_ikut_induk"
on public.lhp_barang_bukti
for select
to authenticated
using (lhp_id in (select id from public.lhp));

create policy "lhp_barang_bukti_tulis_penyusun"
on public.lhp_barang_bukti
for all
to authenticated
using (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_barang_bukti.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
)
with check (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_barang_bukti.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
);

-- ---------------------------------------------------------------------
-- lhp_foto — baca ikut induk; tulis hanya penyusun (draf) DAN foto yang
-- dilampirkan wajib berasal dari laporan pada SPT YANG SAMA (mencegah
-- foto SPT/unit lain ikut terseret lewat tautan langsung).
-- ---------------------------------------------------------------------

create policy "lhp_foto_baca_ikut_induk"
on public.lhp_foto
for select
to authenticated
using (lhp_id in (select id from public.lhp));

create policy "lhp_foto_tambah_penyusun"
on public.lhp_foto
for insert
to authenticated
with check (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_foto.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
  and exists (
    select 1
      from public.foto_dokumentasi f
      join public.laporan_harian lh on lh.id = f.laporan_id
      join public.lhp l2 on l2.id = lhp_foto.lhp_id
     where f.id = lhp_foto.foto_id
       and lh.penugasan_id = l2.penugasan_id
  )
);

create policy "lhp_foto_hapus_penyusun"
on public.lhp_foto
for delete
to authenticated
using (
  exists (
    select 1 from public.lhp l
     where l.id = lhp_foto.lhp_id
       and l.disusun_oleh = (select auth.uid())
       and l.status = 'draf'
  )
);
