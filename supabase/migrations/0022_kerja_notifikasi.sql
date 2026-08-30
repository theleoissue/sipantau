-- =====================================================================
-- 0022 — Pekerjaan berjadwal Modul 6.9
-- Sumber: docs/60-modul-6.6-6.9-user-notif.md Bagian 6, BR-71
-- =====================================================================
--
-- Keduanya kurir perapi (BR-36, KP-6.9-27): berhentinya penjadwal tidak
-- membuat daftar pemberitahuan salah, hanya menunda pembersihannya.
-- =====================================================================

create or replace function public.kerja_susutkan_notifikasi()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.notifikasi
   where dibaca_pada is not null
     and dibaca_pada < now() - interval '90 days';
$$;

select cron.schedule('susutkan-notifikasi', '20 1 * * *',
  'select public.kerja_susutkan_notifikasi()');

create or replace function public.kerja_bersihkan_langganan_mati()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.langganan_dorong
   where aktif = false
     and diubah_pada < now() - interval '30 days';
$$;

select cron.schedule('bersihkan-langganan-mati', '30 1 * * 0',
  'select public.kerja_bersihkan_langganan_mati()');
