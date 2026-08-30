-- =====================================================================
-- 0015 — Tabel GPS: sesi_tugas (bentuk akhir), location_logs,
-- posisi_terkini, titik_penanda
-- Sumber: docs/40-modul-6.4-gps.md Bagian 3 (§5.7, 5.17, 5.21, 5.22)
-- =====================================================================
--
-- URUTAN: fungsi dan pemicu ada di 0016, RLS + Realtime di 0017,
-- pekerjaan berjadwal di 0018.
--
-- BR-66 (docs/40-modul-6.4-gps.md P-17): Supabase sejak Mei 2026 TIDAK
-- lagi otomatis mengekspos tabel baru ke Data API. Pendaftarannya
-- berjalan otomatis lewat SQL Editor (berbeda dari toggle dashboard),
-- tapi dicatat di sini SUPAYA KALAU sebuah tabel menjawab kosong
-- padahal barisnya ada, ini yang diperiksa LEBIH DAHULU sebelum
-- mencurigai RLS.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Daftar tertutup. BR-77: jangan diganti utuh oleh modul lain.
-- ---------------------------------------------------------------------
do $$
begin
  -- Tujuh nilai [FINAL]. Empat terakhir ditutup sistem (ditutup_oleh
  -- kosong), dua pertama ditutup manusia, pindah_perangkat ditutup
  -- sistem meski dipicu tindakan manusia di tempat lain.
  if not exists (select 1 from pg_type where typname = 'sebab_penutupan_sesi') then
    create type public.sebab_penutupan_sesi as enum (
      'manual', 'keluar_aplikasi', 'pindah_perangkat', 'menggantung',
      'spt_ditutup', 'dicabut_dari_spt', 'akun_dinonaktifkan'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'sumber_lokasi_titik') then
    create type public.sumber_lokasi_titik as enum ('gps', 'jaringan', 'fusi', 'tidak_diketahui');
  end if;

  -- Kosong (NULL) berarti titik wajar. Bukan daftar "penolakan" — titik
  -- tetap disimpan dan ditandai, tidak pernah dibuang (BR-57).
  if not exists (select 1 from pg_type where typname = 'sebab_diragukan_titik') then
    create type public.sebab_diragukan_titik as enum ('akurasi_buruk', 'lompatan_tidak_wajar', 'keduanya');
  end if;
end
$$;

-- Jenis tindakan audit milik modul ini, ditambahkan ke daftar yang
-- SUDAH ADA dari 0003 (BR-77 — jangan didefinisikan ulang).
do $$
declare
  v text;
begin
  foreach v in array array[
    'buka_sesi_tugas', 'tutup_sesi_tugas', 'buka_peta_langsung',
    'buka_rute_spt', 'ekspor_rute', 'susut_titik'
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
-- 5.17 sesi_tugas — dari [KERANGKA] (migrasi 0007) ke [FINAL]
--
-- ALTER, bukan create ulang: indeks unik parsial idx_sesi_tugas_satu_
-- aktif sudah final sejak Addendum 6.2-T dan TIDAK BOLEH dirancang
-- ulang (docs/40-modul-6.4-gps.md §5.17).
-- ---------------------------------------------------------------------
alter table public.sesi_tugas
  alter column sebab_penutupan type public.sebab_penutupan_sesi
    using sebab_penutupan::public.sebab_penutupan_sesi;

alter table public.sesi_tugas
  add column if not exists ditutup_oleh          uuid references public.users (id),
  add column if not exists penanda_perangkat     text,
  add column if not exists izin_dicabut_pada     timestamptz,
  add column if not exists izin_dipulihkan_pada  timestamptz,
  add column if not exists titik_terakhir_pada   timestamptz,
  add column if not exists jumlah_titik          integer not null default 0,
  add column if not exists jarak_tempuh_meter    numeric,
  add column if not exists akurasi_median_meter  numeric,
  add column if not exists polyline_terkode      text,
  add column if not exists lat_awal              numeric,
  add column if not exists lng_awal              numeric,
  add column if not exists lat_akhir             numeric,
  add column if not exists lng_akhir             numeric,
  add column if not exists diringkas_pada        timestamptz,
  add column if not exists diubah_pada           timestamptz not null default now();

-- penanda_perangkat wajib terisi HANYA untuk baris baru (P-09). Baris
-- lama dari 0007 (kalau ada) tidak dipaksa mundur mengisi kolom yang
-- belum ada saat itu — dalam praktik belum ada satu sesi pun dibuka
-- sungguhan, karena Mulai Tugas baru mungkin sejak migrasi ini berdiri.
alter table public.sesi_tugas
  alter column penanda_perangkat set not null;

comment on column public.sesi_tugas.ditutup_oleh is
  'Kosong berarti ditutup SISTEM. Empat sebab (menggantung, spt_ditutup, dicabut_dari_spt, akun_dinonaktifkan) selalu kosong di sini.';
comment on column public.sesi_tugas.polyline_terkode is
  'SENGAJA BELUM DIISI pada tahap ini — pengodean polyline ditunda; ringkasan_rute lain (jarak, titik awal/akhir) tetap dihitung penuh saat penutupan. Lihat catatan di fn_tutup_sesi_tugas.';

create index if not exists idx_sesi_tugas_menggantung
  on public.sesi_tugas (titik_terakhir_pada) where ditutup_pada is null;

-- ---------------------------------------------------------------------
-- 5.7 location_logs — pengganti utuh versi 0.2
-- ---------------------------------------------------------------------
create table if not exists public.location_logs (
  id                      uuid primary key default gen_random_uuid(),
  sesi_tugas_id           uuid not null references public.sesi_tugas (id),
  penugasan_id            uuid not null references public.penugasan (id),
  pengguna_id             uuid not null references public.users (id),
  lat                     numeric not null,
  lng                     numeric not null,
  geom                    extensions.geography(Point, 4326)
                            generated always as (
                              extensions.ST_MakePoint(lng, lat)::extensions.geography
                            ) stored,
  akurasi_meter           numeric,
  kecepatan_mps           numeric,
  arah_derajat            numeric,
  baterai_persen          smallint,
  sumber_lokasi           public.sumber_lokasi_titik not null default 'gps',
  diragukan_sebab         public.sebab_diragukan_titik,
  antrean_id              uuid not null,
  direkam_pada            timestamptz not null,
  diterima_pada           timestamptz not null default now(),
  diterima_terlambat      boolean not null default false,
  penanda_perangkat       text not null,
  penanda_perangkat_asal  text,

  constraint chk_baterai_persen check (baterai_persen is null or baterai_persen between 0 and 100)
);

comment on column public.location_logs.pengguna_id is
  'MENGGANTIKAN anggota_id (P-02). Boleh berperan anggota, panit, atau kanit — sesi dapat dipegang siapa pun yang jadi pelaksana.';
comment on column public.location_logs.penanda_perangkat_asal is
  'Perangkat tempat titik DIREKAM. Boleh beda dari penanda_perangkat (perangkat yang MENGIRIM) bila antrean terkirim dari perangkat baru setelah ganti perangkat (P-05).';
comment on column public.location_logs.diragukan_sebab is
  'NULL = titik wajar. Titik diragukan TETAP DISIMPAN dan tetap terbaca — hanya tidak dipakai menggambar garis rute maupun dihitung ke jarak tempuh (BR-57).';

create index if not exists idx_location_logs_sesi_waktu
  on public.location_logs (sesi_tugas_id, direkam_pada);
create index if not exists idx_location_logs_penugasan_waktu
  on public.location_logs (penugasan_id, direkam_pada);
create index if not exists idx_location_logs_geom
  on public.location_logs using gist (geom);
create unique index if not exists uq_location_logs_antrean_id
  on public.location_logs (antrean_id);
create index if not exists idx_location_logs_susut
  on public.location_logs (direkam_pada);

alter table public.location_logs enable row level security;
-- Hanya select (Bagian 7 §9.2). Penyisipan TIDAK lewat grant+RLS
-- langsung — satu-satunya jalan masuk adalah fn_catat_titik (0016),
-- karena penanda lokasi tiruan (titik_penanda) harus ditulis dalam
-- transaksi yang sama dan datanya tidak boleh singgah sebagai kolom di
-- sini (lihat alasan pada Section 5.22 dan titik_penanda di bawah).
-- Pembaruan dan penghapusan tertutup bagi SELURUH peran.
grant select on public.location_logs to authenticated;

-- ---------------------------------------------------------------------
-- 5.21 posisi_terkini — tabel baru
--
-- replica identity DIBIARKAN BAWAAN (default), TIDAK diset full.
-- Peristiwa DELETE lewat Realtime hanya membawa primary key
-- (sesi_tugas_id, UUID tanpa arti) — bukan kelalaian, itu justru
-- pertahanan P-18/P-21 terhadap kebocoran lewat event penghapusan yang
-- tidak tersaring RLS.
-- ---------------------------------------------------------------------
create table if not exists public.posisi_terkini (
  sesi_tugas_id   uuid primary key references public.sesi_tugas (id),
  penugasan_id    uuid not null references public.penugasan (id),
  pengguna_id     uuid not null unique references public.users (id),
  unit_id         uuid not null references public.unit (id),
  lat             numeric not null,
  lng             numeric not null,
  akurasi_meter   numeric,
  baterai_persen  smallint,
  sumber_lokasi   public.sumber_lokasi_titik not null default 'gps',
  izin_terputus   boolean not null default false,
  direkam_pada    timestamptz not null,
  dibuat_pada     timestamptz not null default now(),
  diubah_pada     timestamptz not null default now()
);

comment on table public.posisi_terkini is
  'Satu baris per Sesi Tugas BERJALAN. Di-upsert tiap Titik masuk, DIHAPUS saat sesi ditutup. Bukan arsip — tidak pernah dibaca sebagai riwayat.';
comment on column public.posisi_terkini.pengguna_id is
  'UNIK: menegakkan kembali BR-27 (satu Sesi Tugas aktif per orang) pada lapisan ini.';

alter table public.posisi_terkini enable row level security;
-- Tertutup bagi SELURUH peran (Bagian 7 §9.2). Hanya pemicu security
-- definer yang menulisnya — karena itu TIDAK ADA grant insert/update/
-- delete kepada authenticated, hanya select.
grant select on public.posisi_terkini to authenticated;

-- ---------------------------------------------------------------------
-- 5.22 titik_penanda — tabel baru
--
-- Tabel TERPISAH, bukan kolom pada location_logs (alasan tertulis di
-- docs/40-modul-6.4-gps.md §5.22): Postgres tidak dapat membedakan
-- Kanit dari Panit lewat grant per kolom, karena keduanya memakai satu
-- peran basis data yang sama (authenticated). Satu-satunya cara
-- menegakkan "hanya Kanit dan Kasubdit boleh membaca" tanpa bersandar
-- pada penyembunyian antarmuka adalah baris tersendiri dengan
-- kebijakannya sendiri.
-- ---------------------------------------------------------------------
create table if not exists public.titik_penanda (
  location_log_id uuid primary key references public.location_logs (id) on delete cascade,
  penugasan_id    uuid not null references public.penugasan (id),
  unit_id         uuid not null references public.unit (id),
  lokasi_tiruan   boolean not null default true,
  dibuat_pada     timestamptz not null default now()
);

alter table public.titik_penanda enable row level security;
-- SENGAJA TIDAK ADA GRANT SAMA SEKALI (BR-61, docs/01-koreksi.md J.2
-- pola yang sama untuk pembatasan_laju). Hanya fungsi security definer
-- dari dalam basis data yang menyentuhnya.
