-- =====================================================================
-- 0010 — Tabel laporan_harian, catatan_laporan, foto_dokumentasi
-- Sumber: docs/30-modul-6.3-pelaporan.md §5.4, 5.19, 5.5, Bagian 4
-- =====================================================================
--
-- URUTAN: fungsi dan pemicu ada di 0011 (butuh tabel ini berdiri dulu).
-- Kebijakan RLS dan tampilan ada di 0012 (butuh pemicu 0011 lebih dulu,
-- karena beberapa kebijakan menyandarkan diri pada perilaku pemicu).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Daftar tertutup. BR-77: jangan diganti utuh oleh modul lain.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'jenis_laporan_harian') then
    create type public.jenis_laporan_harian as enum
      ('pulbaket_awal', 'perkembangan', 'akhir');
  end if;

  if not exists (select 1 from pg_type where typname = 'status_kegiatan_laporan') then
    create type public.status_kegiatan_laporan as enum
      ('berjalan', 'selesai', 'bermasalah');
  end if;

  -- Tiga nilai, bukan dua (Aturan Modul 6.3.4 butir 3). Gagal merekam
  -- dan berhasil merekam di tempat lain adalah dua hal berbeda.
  if not exists (select 1 from pg_type where typname = 'status_lokasi_laporan') then
    create type public.status_lokasi_laporan as enum
      ('terverifikasi', 'di_luar_titik', 'tidak_terekam');
  end if;

  -- Tujuh nilai, butir A-05 [FINAL]. Jangan diganti utuh.
  if not exists (select 1 from pg_type where typname = 'alasan_lokasi_tidak_terekam') then
    create type public.alasan_lokasi_tidak_terekam as enum (
      'gps_tidak_tertangkap', 'daya_habis', 'izin_lokasi_mati',
      'area_terbatas', 'disusun_setelah_pulang', 'perangkat_rusak', 'lainnya'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'status_laporan_harian') then
    create type public.status_laporan_harian as enum
      ('terkirim', 'perlu_diperbaiki', 'disetujui', 'ditarik');
  end if;

  if not exists (select 1 from pg_type where typname = 'jenis_catatan_laporan') then
    create type public.jenis_catatan_laporan as enum ('catatan', 'minta_perbaikan');
  end if;

  if not exists (select 1 from pg_type where typname = 'sumber_foto') then
    create type public.sumber_foto as enum ('kamera', 'galeri');
  end if;
end
$$;

-- Jenis tindakan audit milik modul ini, ditambahkan ke daftar yang SUDAH
-- ADA dari 0003 (BR-77 — jangan didefinisikan ulang).
do $$
declare
  v text;
begin
  foreach v in array array[
    'sunting_laporan', 'tarik_laporan', 'setujui_laporan',
    'catat_laporan', 'minta_perbaikan_laporan', 'sunting_catatan_laporan'
  ]
  loop
    if not exists (
      select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'jenis_tindakan_audit' and e.enumlabel = v
    ) then
      execute format('alter type public.jenis_tindakan_audit add value %L', v);
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------
-- 5.20 Kolom tambahan pada penugasan (kewajiban lapor harian)
-- ---------------------------------------------------------------------
alter table public.penugasan
  add column if not exists wajib_lapor_harian boolean not null default true;

-- ---------------------------------------------------------------------
-- 5.4 Tabel laporan_harian
-- ---------------------------------------------------------------------
create table if not exists public.laporan_harian (
  id                    uuid primary key default gen_random_uuid(),
  penugasan_id          uuid not null references public.penugasan (id),
  pelapor_id            uuid not null references public.users (id),
  -- Sesi Tugas milik pelapor pada SPT YANG SAMA saat laporan dikirim.
  -- Diisi otomatis server (0011), boleh kosong (KP-6.3-06).
  sesi_tugas_id         uuid references public.sesi_tugas (id),
  jenis                 public.jenis_laporan_harian not null,
  uraian                text not null,
  kendala               text,
  status_kegiatan       public.status_kegiatan_laporan not null default 'berjalan',

  -- Kolom fakta lokasi. BEKU setelah INSERT (KP-6.3-26) — ditegakkan
  -- pemicu fn_tandai_sunting di 0011, bukan di sini.
  lokasi_lat            numeric,
  lokasi_lng            numeric,
  akurasi_meter         numeric,
  status_lokasi         public.status_lokasi_laporan,
  -- Titik yang DITUNJUK PELAPOR (boleh berbeda dari titik terdekat
  -- hitungan sistem — keduanya tersimpan berdampingan, KP-6.3-22/23).
  lokasi_id             uuid references public.penugasan_lokasi (id),
  -- Titik terdekat MENURUT HITUNGAN SISTEM (PostGIS), diisi server.
  lokasi_id_terdekat    uuid references public.penugasan_lokasi (id),
  jarak_meter           numeric,
  alasan_lokasi         public.alasan_lokasi_tidak_terekam,
  alasan_lokasi_lainnya text,
  -- TIDAK beku — narasi manusia, boleh diisi kapan saja (KP-6.3-18).
  keterangan_lokasi     text,

  status_laporan        public.status_laporan_harian not null default 'terkirim',
  disetujui_oleh        uuid references public.users (id),
  disetujui_pada        timestamptz,
  ditarik_pada           timestamptz,
  alasan_penarikan       text,
  disunting_pada        timestamptz,
  jumlah_suntingan      integer not null default 0,

  -- Wajib diisi klien (Addendum 6.1-T). Belum divalidasi silang ke
  -- perangkat_masuk — mekanisme Satu Perangkat per Akun sengaja belum
  -- dibangun penuh (lihat catatan di migrasi 0011).
  penanda_perangkat     text not null,
  dikirim_pada          timestamptz not null default now(),

  constraint chk_laporan_alasan_wajib_bila_tidak_terekam check (
    (status_lokasi = 'tidak_terekam' and alasan_lokasi is not null)
    or (status_lokasi <> 'tidak_terekam' and alasan_lokasi is null)
    or status_lokasi is null
  ),
  constraint chk_laporan_alasan_lainnya_wajib_uraian check (
    alasan_lokasi <> 'lainnya'
    or (alasan_lokasi_lainnya is not null and length(trim(alasan_lokasi_lainnya)) > 0)
  ),
  constraint chk_laporan_tarik_wajib_alasan check (
    status_laporan <> 'ditarik'
    or (alasan_penarikan is not null and length(trim(alasan_penarikan)) > 0)
  )
);

comment on column public.laporan_harian.status_lokasi is
  'Tiga nilai. BUKAN dua. Gagal merekam dan berhasil merekam di luar titik adalah dua hal berbeda (Aturan Modul 6.3.4 #3).';
comment on column public.laporan_harian.lokasi_id is
  'Titik pilihan PELAPOR. Berbeda dari lokasi_id_terdekat (hitungan sistem) — keduanya sengaja berdampingan, bukan salah satunya membatalkan yang lain.';

create index if not exists idx_laporan_penugasan on public.laporan_harian (penugasan_id);
create index if not exists idx_laporan_pelapor on public.laporan_harian (pelapor_id, dikirim_pada desc);
create index if not exists idx_laporan_status on public.laporan_harian (status_laporan);

alter table public.laporan_harian enable row level security;
grant select, insert, update on public.laporan_harian to authenticated;

-- ---------------------------------------------------------------------
-- 5.19 Tabel catatan_laporan
--
-- Menggantikan kolom lama catatan_peninjau/ditinjau_oleh: satu laporan
-- dapat menerima catatan dari BEBERAPA peninjau, tidak saling menimpa
-- (Aturan Modul 6.3.4 #11).
-- ---------------------------------------------------------------------
create table if not exists public.catatan_laporan (
  id             uuid primary key default gen_random_uuid(),
  laporan_id     uuid not null references public.laporan_harian (id),
  peninjau_id    uuid not null references public.users (id),
  jenis          public.jenis_catatan_laporan not null default 'catatan',
  isi            text not null,
  dibuat_pada    timestamptz not null default now(),
  disunting_pada timestamptz
);

create index if not exists idx_catatan_laporan on public.catatan_laporan (laporan_id, dibuat_pada);

alter table public.catatan_laporan enable row level security;
-- Tidak ada delete: catatan tidak pernah dihapus (BR-43).
grant select, insert, update on public.catatan_laporan to authenticated;

-- ---------------------------------------------------------------------
-- 5.5 Tabel foto_dokumentasi [KERANGKA — bentuk akhir Modul 6.7]
--
-- Empat kolom di bawah sudah pasti menurut §5.5 dan dicatat di sini
-- agar tidak terlewat: lat, lng, akurasi_meter, diambil_pada — SEMUANYA
-- milik foto itu SENDIRI, tidak pernah mewarisi koordinat laporan
-- induknya (BR-42). Kolase berkop, watermark tertanam di piksel, dan
-- galeri kelas-perusahaan adalah urusan Modul 6.7 yang ditunda
-- (docs/CLAUDE.md §10) — di sini foto hanya disimpan dan dikaitkan.
-- ---------------------------------------------------------------------
create table if not exists public.foto_dokumentasi (
  id            uuid primary key default gen_random_uuid(),
  laporan_id    uuid not null references public.laporan_harian (id),
  diunggah_oleh uuid not null references public.users (id),
  sumber        public.sumber_foto not null,
  berkas_path   text not null,
  keterangan    text,
  -- Milik foto ini sendiri. Boleh kosong untuk foto galeri.
  lat           numeric,
  lng           numeric,
  akurasi_meter numeric,
  diambil_pada  timestamptz,
  dibuat_pada   timestamptz not null default now()
);

create index if not exists idx_foto_laporan on public.foto_dokumentasi (laporan_id);

alter table public.foto_dokumentasi enable row level security;
-- Sesuai docs/01-koreksi.md J.2: select + insert saja. Foto tidak
-- diperbarui maupun dihapus lewat jalur biasa — penarikan mengikuti
-- status laporan induknya (Aturan Modul 6.3.4 #9), bukan baris sendiri.
grant select, insert on public.foto_dokumentasi to authenticated;
