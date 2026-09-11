-- =====================================================================
-- 0061 — Metadata hasil pencarian tempat
--
-- Koordinat yang disetujui tetap lat/lng biasa. Metadata ini menyimpan
-- asal serta jejak verifikasinya; Google tidak pernah menjadi sumber
-- kebenaran tanpa persetujuan Kanit.
-- =====================================================================

alter table public.penugasan_lokasi
  add column if not exists google_place_id text,
  add column if not exists nama_resmi text,
  add column if not exists alamat_resmi text,
  add column if not exists sumber_koordinat text,
  add column if not exists skor_kecocokan numeric,
  add column if not exists status_verifikasi text not null default 'belum_diverifikasi',
  add column if not exists diverifikasi_oleh uuid references public.users(id),
  add column if not exists diverifikasi_pada timestamptz;

alter table public.penugasan_lokasi
  add constraint chk_lokasi_sumber_koordinat
    check (sumber_koordinat is null or sumber_koordinat in
      ('manual', 'google_places', 'google_geocoding', 'openstreetmap')),
  add constraint chk_lokasi_skor_kecocokan
    check (skor_kecocokan is null or skor_kecocokan between 0 and 1),
  add constraint chk_lokasi_status_verifikasi
    check (status_verifikasi in ('belum_diverifikasi', 'perlu_diperiksa', 'terverifikasi')),
  add constraint chk_lokasi_verifikasi_berpasangan
    check ((diverifikasi_oleh is null) = (diverifikasi_pada is null));

create index if not exists idx_lokasi_google_place_id
  on public.penugasan_lokasi (google_place_id)
  where google_place_id is not null;

comment on column public.penugasan_lokasi.google_place_id is
  'Identitas kandidat Google Places yang disetujui; bukan pengganti koordinat mentah.';
comment on column public.penugasan_lokasi.status_verifikasi is
  'Hasil otomatis selalu perlu diperiksa sampai pengguna menyetujui kandidat.';
