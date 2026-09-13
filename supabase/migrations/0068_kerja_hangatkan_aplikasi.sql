-- =====================================================================
-- 0068 — Menjaga fungsi Vercel tetap hangat
--
-- MASALAH YANG DIUKUR
--
-- SiPANTAU dirender di fungsi serverless Vercel. Fungsi yang lama tidak
-- menerima permintaan ditidurkan, dan permintaan pertama sesudahnya harus
-- menunggu fungsi itu dibangunkan. Diukur 13 September 2026 pada halaman
-- /masuk:
--
--   dingin  2,18 detik
--   hangat  0,46 detik
--
-- Di APK itulah jeda yang terasa saat aplikasi dibuka pagi hari, dan yang
-- sebelumnya tampil sebagai layar hitam. Splash kini menutupinya (APK
-- berikutnya), tetapi waktunya sendiri tidak berkurang.
--
-- KENAPA DARI BASIS DATA
--
-- Cron Vercel pada paket Hobby hanya boleh berjalan sekali sehari
-- (dokumentasi Vercel, "Usage & Pricing for Cron Jobs"), jadi tidak dapat
-- dipakai menjaga fungsi tetap hangat. pg_cron dan pg_net sudah aktif di
-- proyek ini — pg_net yang sama dipakai Database Webhook pemberitahuan
-- dorong — sehingga tidak ada layanan, ekstensi, maupun biaya baru.
--
-- YANG TIDAK DIJANJIKAN
--
-- Berapa lama Vercel membiarkan fungsi menganggur sebelum menidurkannya
-- tidak disebutkan di dokumentasinya. Empat menit adalah titik awal yang
-- WAJIB diukur ulang — bandingkan waktu buka pertama pagi hari sebelum
-- dan sesudah migrasi ini — bukan angka yang sudah terbukti. Deployment
-- baru tetap mulai dingin, dan lonjakan pengguna bersamaan tetap dapat
-- memicu instans baru.
--
-- YANG DIKETUK
--
-- /masuk: halaman terbuka, membalas 200 (14,7 KB), dan melewati proxy
-- serta render server yang sama dengan halaman lain. Alamat www dipakai
-- langsung; tanpa www Vercel membalas 308 dan ketukannya hanya mengenai
-- pengalihan. Tidak ada kredensial apa pun yang dikirim.
--
-- Ini bukan Fungsi Tepi dan tidak menyentuh data pengguna. Tanggapan
-- pg_net tersimpan sementara di net._http_response dan dibersihkan
-- pg_net sendiri sesuai batas umurnya.
-- =====================================================================

create or replace function public.kerja_hangatkan_aplikasi()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- pg_net ASINKRON: permintaan hanya diantrekan lalu dikirim pekerja
  -- latar belakang, jadi pg_cron tidak pernah tertahan menunggu Vercel
  -- bangun. Batas waktu longgar dengan sengaja — ketukan yang justru
  -- mengenai fungsi dingin memang butuh beberapa detik.
  perform net.http_get(
    url                  := 'https://www.sipantaujabar.my.id/masuk',
    params               := '{}'::jsonb,
    headers              := jsonb_build_object('user-agent', 'sipantau-penghangat/1'),
    timeout_milliseconds := 15000
  );
end;
$$;

-- Fungsi yang mengirim permintaan keluar tidak boleh dapat dipanggil siapa
-- pun lewat RPC — tanpa ini, satu pengguna, atau siapa saja yang memegang
-- kunci anon yang memang publik, dapat memakai basis data untuk menembaki
-- situs berulang-ulang. Hanya pg_cron (postgres) yang menjalankannya.
--
-- PostgreSQL memberi EXECUTE kepada PUBLIC secara bawaan pada setiap
-- fungsi baru. Enam fungsi kerja_ yang lebih dulu ada TIDAK pernah
-- mencabutnya dan di produksi masih dapat dieksekusi anon — diperiksa
-- 13 September 2026, dicatat sebagai temuan terpisah. Yang ini tidak
-- boleh mengulanginya: pencabutan dari PUBLIC menutup hak bawaannya, dan
-- pencabutan eksplisit dari anon serta authenticated menjaga seandainya
-- hak itu kelak diberikan langsung kepada peran tersebut.
revoke all on function public.kerja_hangatkan_aplikasi() from public;
revoke all on function public.kerja_hangatkan_aplikasi() from anon, authenticated;

select cron.schedule('hangatkan-aplikasi', '*/4 * * * *',
  'select public.kerja_hangatkan_aplikasi()');
