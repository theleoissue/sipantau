-- =====================================================================
-- 0018 — Pekerjaan berjadwal Modul 6.4 (GPS)
-- Sumber: docs/40-modul-6.4-gps.md BR-54, BR-59 teramandemen (P-22)
-- =====================================================================
--
-- KEDUANYA DI BAWAH ADALAH KURIR, BUKAN SATU-SATUNYA JALAN (BR-36).
-- Penutupan Sesi Menggantung sudah tegak lewat fn_buka_sesi_tugas
-- (P-04, migrasi 0016) sebelum berkas ini ada. Pekerjaan pertama di
-- bawah hanya mempercepat penandaan bagi sesi yang pemiliknya TIDAK
-- pernah kembali membuka sesi baru — tanpa pekerjaan ini, sesi itu
-- tetap benar tertutup pada saatnya (saat pemiliknya Mulai Tugas lagi),
-- hanya lebih lambat terlihat oleh pengawas.
-- =====================================================================

-- ---------------------------------------------------------------------
-- kerja_tutup_sesi_menggantung — BR-54
--
-- Nama pekerjaan cron 'tutup-sesi-menggantung' DIKUTIP LANGSUNG oleh
-- butir uji U-6.4-02 pada berkas sumber
-- (`select cron.unschedule('tutup-sesi-menggantung')`) — TIDAK BOLEH
-- diganti nama tanpa mengubah butir ujinya juga.
-- ---------------------------------------------------------------------
create or replace function public.kerja_tutup_sesi_menggantung()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi record;
begin
  for v_sesi in
    select id from public.sesi_tugas
     where ditutup_pada is null
       and coalesce(titik_terakhir_pada, dibuka_pada) < now() - interval '2 hours'
  loop
    perform public.fn_tutup_sesi_tugas(v_sesi.id, 'menggantung', null);
  end loop;
end;
$$;

select cron.schedule('tutup-sesi-menggantung', '*/15 * * * *',
  'select public.kerja_tutup_sesi_menggantung()');

-- ---------------------------------------------------------------------
-- kerja_susut_titik_lokasi — BR-59 teramandemen (P-22)
--
-- Ambang GANDA, mana pun tercapai lebih dahulu:
--   1. Sembilan puluh hari sejak SPT-nya selesai/dibatalkan
--   2. Tiga ratus enam puluh lima hari sejak direkam_pada, TANPA
--      memandang status SPT (P-06 — SPT yang tidak pernah ditutup
--      tidak boleh membuat titiknya hidup abadi)
--
-- SYARAT TAMBAHAN YANG MEMBATALKAN KEDUANYA (P-22): Sesi Tugas induk
-- WAJIB SUDAH TERTUTUP. Titik milik sesi yang masih berjalan TIDAK
-- PERNAH disusutkan, berapa pun umurnya — "mustahil dalam praktik"
-- bukan penjagaan.
--
-- BUKAN perhitungan hari kalender (BR-64 tidak berlaku pada ekspresi
-- di bawah): ini perbandingan DUA WAKTU MUTLAK (timestamptz jarak instan
-- 90/365 hari), bukan penentuan batas hari lewat ::date atau
-- current_date. Tidak ada penyebutan zona waktu yang hilang di sini.
--
-- titik_penanda ikut terhapus lewat on delete cascade (5.9), tidak
-- perlu disebut terpisah.
-- ---------------------------------------------------------------------
create or replace function public.kerja_susut_titik_lokasi()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_terhapus bigint;
begin
  with sasaran as (
    select ll.id
      from public.location_logs ll
      join public.sesi_tugas st on st.id = ll.sesi_tugas_id
      left join public.penugasan p on p.id = ll.penugasan_id
     where st.ditutup_pada is not null
       and (
         (p.status in ('selesai', 'dibatalkan')
          and coalesce(p.ditutup_pada, p.dibatalkan_pada) < now() - interval '90 days')
         or
         (ll.direkam_pada < now() - interval '365 days')
       )
  )
  delete from public.location_logs where id in (select id from sasaran);

  get diagnostics v_terhapus = row_count;

  -- TIDAK memakai public.catat_jejak_audit(): fungsi itu mensyaratkan
  -- (select auth.uid()) tidak kosong dan menolak dengan TANPA_SESI bila
  -- kosong (0006) — tepat keadaan pekerjaan berjadwal ini, yang berjalan
  -- tanpa sesi pengguna sama sekali. Baris disisipkan langsung dengan
  -- pelaku_id dan peran_pelaku kosong, menandai tindakan sistem apa
  -- adanya, bukan mengaku sebagai seseorang.
  if v_terhapus > 0 then
    insert into public.jejak_audit (jenis_tindakan, sasaran_tabel, keterangan)
    values ('susut_titik', 'location_logs', format('%s titik disusutkan', v_terhapus));
  end if;
end;
$$;

select cron.schedule('susut-titik-lokasi', '30 2 * * *',
  'select public.kerja_susut_titik_lokasi()');
