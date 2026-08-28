-- =====================================================================
-- 0001 — Ekstensi, skema fungsi bantu, dan wadah penyimpanan
-- Sumber: docs/00-fondasi.md §4, docs/01-koreksi.md I.9, J.8 langkah 1
-- =====================================================================
--
-- CATATAN PEMASANGAN
--   Jalankan berkas ini paling awal di SQL Editor Supabase.
--   PostGIS dipakai Modul 6.3 (hitung jarak laporan ke titik SPT) dan
--   Modul 6.4 (rute). pg_cron dipakai pekerjaan berjadwal Modul 6.2.
-- =====================================================================

create extension if not exists postgis;
-- gen_random_uuid() sudah bawaan PostgreSQL 13+, pgcrypto tidak dibutuhkan.

-- ---------------------------------------------------------------------
-- Skema khusus fungsi bantu kewenangan (Addendum 6.1-T Bagian 1.2)
--
-- PENTING: JANGAN tambahkan skema ini ke daftar "Exposed schemas" pada
-- API Settings. Ia hanya boleh dievaluasi aturan akses baris, bukan
-- dipanggil langsung lewat REST oleh pemegang kunci publik.
-- ---------------------------------------------------------------------
create schema if not exists sipantau_auth;
grant usage on schema sipantau_auth to authenticated;

-- ---------------------------------------------------------------------
-- Wadah penyimpanan berkas (docs/01-koreksi.md I.9)
--
-- Tertutup. Akses berkas hanya lewat tautan bermasa berlaku terbatas:
-- 15 menit untuk penayangan biasa, 1 jam untuk berkas ekspor.
-- Susunan nama: {penugasan_id}/{laporan_id}/{uuid}.{ekstensi}
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('dokumentasi', 'dokumentasi', false)
on conflict (id) do nothing;

-- Wadah terpisah untuk berkas surat SPT yang dipindai (Modul 6.2).
insert into storage.buckets (id, name, public)
values ('surat-spt', 'surat-spt', false)
on conflict (id) do nothing;
