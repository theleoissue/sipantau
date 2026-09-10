-- =====================================================================
-- 0057 — Klasifikasi aktivitas: diam, berjalan, berkendara
--
-- Dihitung dari kecepatan, DI SERVER, sebagai TAMPILAN — bukan kolom
-- tersimpan dan bukan Activity Recognition di perangkat. Tiga alasan:
--
-- 1. Berlaku surut. Seluruh Titik yang sudah terlanjur tersimpan ikut
--    terklasifikasi tanpa backfill sama sekali.
-- 2. Tidak bisa melenceng. Kolom tersimpan bisa basi terhadap data
--    mentahnya begitu ambangnya disetel ulang; tampilan tidak pernah.
-- 3. Tidak menuntut APK dibangun ulang. Activity Recognition milik
--    Android lebih akurat dan memang layak menyusul (Jalur A6), tetapi
--    ia kode native — dan pelacakan tidak boleh menunggu itu.
--
-- KETERUSTERANGAN SOAL KETELITIAN: ini klasifikasi PER TITIK dari satu
-- angka kecepatan, bukan pengenalan gerak sungguhan. Ia cukup untuk
-- memilah segmen berkendara — kegunaan utamanya, sebagai prasyarat map
-- matching yang HANYA boleh dijalankan pada segmen kendaraan — tetapi ia
-- akan salah pada kasus batas: berjalan cepat menuruni tanjakan, atau
-- kendaraan yang merayap di kemacetan. Penghalusan antar-Titik menyusul
-- bersama pekerjaan segmen.
--
-- Titik yang DIRAGUKAN tidak diklasifikasi. Posisinya sendiri belum
-- tepercaya, jadi kecepatan yang diturunkan darinya lebih tidak
-- tepercaya lagi — dan menebak di atas tebakan bukan data.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'jenis_aktivitas_titik') then
    create type public.jenis_aktivitas_titik as enum
      ('diam', 'berjalan', 'berkendara', 'tidak_diketahui');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- Jarak dihitung sendiri (Haversine), BUKAN lewat PostGIS.
--
-- Tampilan di bawah ber-security_invoker, jadi ia berjalan dengan hak
-- pemanggil — dan menyentuh extensions.ST_Distance dari sana menuntut
-- peran aplikasi punya hak pakai skema extensions. Fungsi GPS yang lama
-- tidak pernah menagih itu karena semuanya security definer. Daripada
-- menggantungkan tampilan ini pada hak yang tidak kita kendalikan,
-- rumusnya ditulis langsung: selisihnya jauh di bawah ketelitian GPS itu
-- sendiri, dan bentuknya sama dengan jarakMeter() di lib/gps/tipe.ts.
-- ---------------------------------------------------------------------
create or replace function public.jarak_meter(
  p_lat1 numeric, p_lng1 numeric, p_lat2 numeric, p_lng2 numeric
)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select (6371000 * 2 * atan2(
    sqrt(
      sin(radians(p_lat2 - p_lat1) / 2) ^ 2
      + cos(radians(p_lat1)) * cos(radians(p_lat2))
        * sin(radians(p_lng2 - p_lng1) / 2) ^ 2
    ),
    sqrt(
      1 - (
        sin(radians(p_lat2 - p_lat1) / 2) ^ 2
        + cos(radians(p_lat1)) * cos(radians(p_lat2))
          * sin(radians(p_lng2 - p_lng1) / 2) ^ 2
      )
    )
  ))::numeric;
$$;

-- Ambang dalam meter per detik.
--   0,5 m/s  = 1,8 km/j  — di bawah ini goyangan GPS, bukan langkah.
--   2,8 m/s  = 10 km/j   — di atas ini tidak lagi masuk akal sebagai
--                          jalan kaki, sekalipun berlari.
create or replace function public.aktivitas_dari_kecepatan(p_mps numeric)
returns public.jenis_aktivitas_titik
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mps is null then 'tidak_diketahui'::public.jenis_aktivitas_titik
    when p_mps < 0.5   then 'diam'
    when p_mps < 2.8   then 'berjalan'
    else 'berkendara'
  end;
$$;

-- ---------------------------------------------------------------------
-- Kecepatan yang dipakai adalah yang DILAPORKAN perangkat bila ada,
-- kalau tidak diturunkan dari jarak dan selisih waktu ke Titik tepercaya
-- SEBELUMNYA. Peramban kerap mengembalikan speed kosong, jadi tanpa
-- penurunan ini sebagian besar Titik web tidak akan terklasifikasi.
--
-- security_invoker WAJIB (CLAUDE.md §5.2): tanpa itu tampilan berjalan
-- sebagai pemiliknya dan MELEWATI seluruh RLS location_logs diam-diam.
-- ---------------------------------------------------------------------
create or replace view public.titik_aktivitas
with (security_invoker = on)
as
with tepercaya as (
  select
    ll.*,
    lag(ll.lat)          over w as lat_sebelum,
    lag(ll.lng)          over w as lng_sebelum,
    lag(ll.direkam_pada) over w as waktu_sebelum
  from public.location_logs ll
  where ll.diragukan_sebab is null
  window w as (partition by ll.sesi_tugas_id order by ll.direkam_pada)
),
berkecepatan as (
  select
    t.*,
    (case
      when t.kecepatan_mps is not null then t.kecepatan_mps
      when t.waktu_sebelum is null then null
      when extract(epoch from (t.direkam_pada - t.waktu_sebelum)) <= 0 then null
      else public.jarak_meter(t.lat_sebelum, t.lng_sebelum, t.lat, t.lng)
           / extract(epoch from (t.direkam_pada - t.waktu_sebelum))
    end)::numeric as kecepatan_efektif_mps
  from tepercaya t
)
select
  b.id,
  b.sesi_tugas_id,
  b.penugasan_id,
  b.pengguna_id,
  b.lat,
  b.lng,
  b.akurasi_meter,
  b.direkam_pada,
  b.kecepatan_efektif_mps,
  public.aktivitas_dari_kecepatan(b.kecepatan_efektif_mps) as aktivitas
from berkecepatan b
union all
-- Titik diragukan tetap TAMPIL — ia bukti, bukan sampah — hanya tidak
-- diklasifikasi.
select
  ll.id,
  ll.sesi_tugas_id,
  ll.penugasan_id,
  ll.pengguna_id,
  ll.lat,
  ll.lng,
  ll.akurasi_meter,
  ll.direkam_pada,
  null::numeric,
  'tidak_diketahui'::public.jenis_aktivitas_titik
from public.location_logs ll
where ll.diragukan_sebab is not null;

grant select on public.titik_aktivitas to authenticated;

revoke all on function public.jarak_meter(numeric,numeric,numeric,numeric) from public;
grant execute on function public.jarak_meter(numeric,numeric,numeric,numeric) to authenticated;

revoke all on function public.aktivitas_dari_kecepatan(numeric) from public;
grant execute on function public.aktivitas_dari_kecepatan(numeric) to authenticated;
