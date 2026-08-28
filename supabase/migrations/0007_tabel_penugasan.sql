-- =====================================================================
-- 0007 — Tabel penugasan beserta keempat tabel anaknya
-- Sumber: docs/20-modul-6.2-penugasan.md §5.2, 5.3, 5.11, 5.15, 5.16, 5.17
-- =====================================================================
--
-- URUTAN: kebijakan RLS ada di 0008, bersama dua fungsi bantu lingkup
-- yang baru bisa dibuat setelah tabel-tabel di sini berdiri.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Daftar tertutup. BR-77: nilai di bawah TIDAK BOLEH diganti utuh oleh
-- modul mana pun. Menambah nilai baru dilakukan dengan ALTER TYPE,
-- bukan dengan menulis ulang daftarnya.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'jenis_kegiatan_spt') then
    create type public.jenis_kegiatan_spt as enum
      ('penyelidikan', 'pulbaket', 'pengamanan');
  end if;

  if not exists (select 1 from pg_type where typname = 'prioritas_spt') then
    create type public.prioritas_spt as enum ('normal', 'penting', 'urgent');
  end if;

  -- Enam nilai. Versi kerangka 0.2 menyebut empat; 'draf' dan
  -- 'dibatalkan' lahir dari keputusan pemilik produk pada penggalian
  -- Modul 6.2, dan butir lama itu dicabut.
  if not exists (select 1 from pg_type where typname = 'status_spt') then
    create type public.status_spt as enum
      ('draf', 'baru', 'berjalan', 'bermasalah', 'selesai', 'dibatalkan');
  end if;

  if not exists (select 1 from pg_type where typname = 'jenis_dasar_penugasan') then
    create type public.jenis_dasar_penugasan as enum (
      'laporan_informasi', 'laporan_polisi', 'laporan_pengaduan',
      'surat_perintah_terdahulu', 'disposisi_pimpinan', 'lainnya'
    );
  end if;
end
$$;

-- Menambah jenis tindakan audit milik Modul 6.2 ke daftar yang SUDAH
-- ADA dari 0003 — ditambahkan satu per satu, bukan didefinisikan ulang.
do $$
declare
  v text;
begin
  foreach v in array array[
    'sunting_spt', 'buka_kembali_spt', 'tandai_bermasalah',
    'kembalikan_dari_bermasalah', 'perpanjang_batas',
    'tambah_pelaksana', 'cabut_pelaksana',
    'tunjuk_panit', 'cabut_panit', 'unggah_surat_spt'
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
-- 5.2 Tabel penugasan
-- ---------------------------------------------------------------------
create table if not exists public.penugasan (
  id                 uuid primary key default gen_random_uuid(),
  -- Boleh kosong selama masih draf. Unik se-sistem: nomor berasal dari
  -- surat fisik dan diketik manusia — sistem tidak pernah membangkitkan
  -- nomor agenda sendiri (BR-23).
  nomor_spt          text unique,
  jenis_kegiatan     public.jenis_kegiatan_spt not null default 'penyelidikan',
  judul              text        not null,
  objek              text,
  sasaran            text,
  uraian_tugas       text,
  nomor_lp           text,          -- boleh kosong: pulbaket awal kerap belum punya
  sumber_informasi   text,          -- boleh kosong: ada perkara yang tidak dituliskan
  unit_id            uuid        not null references public.unit (id),
  prioritas          public.prioritas_spt not null default 'normal',
  status             public.status_spt    not null default 'draf',
  tanggal_mulai      date,
  tanggal_batas      date,
  berkas_surat_path  text,
  diterbitkan_oleh   uuid references public.users (id),
  ditugaskan_oleh    uuid references public.users (id),
  diterbitkan_pada   timestamptz,
  ditutup_oleh       uuid references public.users (id),
  ditutup_pada       timestamptz,
  dibatalkan_oleh    uuid references public.users (id),
  dibatalkan_pada    timestamptz,
  alasan_pembatalan  text,
  -- Penanda pemberitahuan lewat batas, supaya pekerjaan berjadwal tidak
  -- mengirim pemberitahuan yang sama berulang kali.
  lewat_batas_diberitahukan_pada timestamptz,
  dibuat_pada        timestamptz not null default now(),
  diubah_pada        timestamptz not null default now(),

  -- BR-25: tidak dapat berpindah ke selesai sebelum berkas pindaian
  -- surat perintah dilampirkan.
  constraint chk_spt_selesai_wajib_berkas check (
    status <> 'selesai' or berkas_surat_path is not null
  ),

  -- Pembatalan wajib disertai alasan.
  constraint chk_spt_batal_wajib_alasan check (
    status <> 'dibatalkan'
    or (alasan_pembatalan is not null and length(trim(alasan_pembatalan)) > 0)
  ),

  -- Batas tidak boleh mendahului mulai.
  constraint chk_spt_batas_setelah_mulai check (
    tanggal_batas is null or tanggal_mulai is null
    or tanggal_batas >= tanggal_mulai
  )
);

create index if not exists idx_penugasan_unit_status
  on public.penugasan (unit_id, status);
create index if not exists idx_penugasan_diterbitkan_oleh
  on public.penugasan (diterbitkan_oleh);

alter table public.penugasan enable row level security;
grant select, insert, update on public.penugasan to authenticated;

-- ---------------------------------------------------------------------
-- 5.15 penugasan_dasar — minimal satu baris sebelum SPT boleh terbit
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_dasar (
  id           uuid primary key default gen_random_uuid(),
  penugasan_id uuid not null references public.penugasan (id) on delete cascade,
  urutan       integer not null default 1,
  jenis        public.jenis_dasar_penugasan not null,
  nomor        text,
  tanggal      date,
  keterangan   text,
  dibuat_pada  timestamptz not null default now(),

  constraint chk_dasar_lainnya_wajib_keterangan check (
    jenis <> 'lainnya'
    or (keterangan is not null and length(trim(keterangan)) > 0)
  )
);

create index if not exists idx_dasar_penugasan
  on public.penugasan_dasar (penugasan_id, urutan);

alter table public.penugasan_dasar enable row level security;
-- DELETE ikut diberikan: pemicu penjaga "jangan sampai nol" pada tabel
-- ini adalah pemicu BEFORE DELETE, artinya baris memang harus dapat
-- dihapus satu-satu oleh Kanit. Berbeda dari penugasan_pelaksana dan
-- penugasan_panit yang murni cabut-lunak.
grant select, insert, update, delete on public.penugasan_dasar to authenticated;

-- ---------------------------------------------------------------------
-- 5.16 penugasan_lokasi — titik-titik SPT, berurutan
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_lokasi (
  id           uuid primary key default gen_random_uuid(),
  penugasan_id uuid not null references public.penugasan (id) on delete cascade,
  urutan       integer not null default 1,
  nama         text    not null,
  alamat       text,
  keterangan   text,
  -- Boleh kosong, dan itu BUKAN kekurangan data: ada tempat yang memang
  -- tidak dapat dijatuhi pin, misalnya wilayah negara lain pada perkara
  -- lintas batas.
  lat          numeric,
  lng          numeric,
  radius_meter integer default 300,
  dibuat_pada  timestamptz not null default now(),

  constraint chk_lokasi_radius check (
    radius_meter is null or radius_meter between 100 and 2000
  ),
  -- Koordinat selalu berpasangan: satu tanpa yang lain tidak berarti apa-apa.
  constraint chk_lokasi_koordinat_berpasangan check (
    (lat is null and lng is null) or (lat is not null and lng is not null)
  ),
  -- Radius hanya bermakna pada titik berkoordinat.
  constraint chk_lokasi_radius_hanya_berkoordinat check (
    lat is not null or radius_meter is null
  )
);

create index if not exists idx_lokasi_penugasan
  on public.penugasan_lokasi (penugasan_id, urutan);

alter table public.penugasan_lokasi enable row level security;
grant select, insert, update, delete on public.penugasan_lokasi to authenticated;

-- ---------------------------------------------------------------------
-- 5.3 penugasan_pelaksana
--
-- Baris TIDAK DIHAPUS, hanya ditandai dicabut, agar laporan dan rute
-- yang sudah terekam tetap punya induk yang sah (BR-27).
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_pelaksana (
  id                uuid primary key default gen_random_uuid(),
  penugasan_id      uuid not null references public.penugasan (id) on delete cascade,
  pelaksana_id      uuid not null references public.users (id),
  urutan            integer not null default 1,
  ditugaskan_pada   timestamptz not null default now(),
  -- Tanda terima. Terisi otomatis saat pelaksana pertama kali membuka
  -- rincian SPT ini — bukan tombol terpisah.
  dibaca_pada       timestamptz,
  dicabut_pada      timestamptz,
  dicabut_oleh      uuid references public.users (id),
  alasan_pencabutan text,

  unique (penugasan_id, pelaksana_id),

  constraint chk_pelaksana_cabut_wajib_alasan check (
    dicabut_pada is null
    or (alasan_pencabutan is not null and length(trim(alasan_pencabutan)) > 0)
  )
);

create index if not exists idx_pelaksana_orang
  on public.penugasan_pelaksana (pelaksana_id);
create index if not exists idx_pelaksana_penugasan
  on public.penugasan_pelaksana (penugasan_id, urutan);

alter table public.penugasan_pelaksana enable row level security;
grant select, insert, update on public.penugasan_pelaksana to authenticated;

-- ---------------------------------------------------------------------
-- 5.11 penugasan_panit — dasar seluruh aturan akses baris peran Panit
--
-- Baris tidak dihapus meskipun SPT sudah ditutup, agar Panit tetap
-- dapat membaca riwayat penugasan yang pernah ia awasi (BR-21).
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_panit (
  id                uuid primary key default gen_random_uuid(),
  penugasan_id      uuid not null references public.penugasan (id) on delete cascade,
  panit_id          uuid not null references public.users (id),
  ditunjuk_oleh     uuid references public.users (id),
  ditunjuk_pada     timestamptz not null default now(),
  dicabut_pada      timestamptz,
  dicabut_oleh      uuid references public.users (id),
  alasan_pencabutan text,

  unique (penugasan_id, panit_id),

  constraint chk_panit_cabut_wajib_alasan check (
    dicabut_pada is null
    or (alasan_pencabutan is not null and length(trim(alasan_pencabutan)) > 0)
  )
);

-- Indeks WAJIB sejak awal, bukan setelah sistem terasa lambat: seluruh
-- lingkup data Panit menelusuri tabel ini pada tiap kueri
-- (Addendum 6.1-T §1.4).
create index if not exists idx_penugasan_panit_panit
  on public.penugasan_panit (panit_id, penugasan_id);

alter table public.penugasan_panit enable row level security;
grant select, insert, update on public.penugasan_panit to authenticated;

-- ---------------------------------------------------------------------
-- 5.17 sesi_tugas [KERANGKA — bentuk akhirnya ditetapkan Modul 6.4]
--
-- Dibentuk di sini karena Modul 6.2 sudah membutuhkannya untuk
-- menegakkan BR-24 dan untuk memeriksa jejak sebelum penghapusan
-- permanen (BR-29).
--
-- Sengaja TIDAK diberi grant apa pun: kebijakan penuhnya baru digali
-- di Modul 6.4, dan tabel yang setengah terbuka lebih berbahaya
-- daripada tabel yang tertutup rapat.
-- ---------------------------------------------------------------------
create table if not exists public.sesi_tugas (
  id              uuid primary key default gen_random_uuid(),
  penugasan_id    uuid not null references public.penugasan (id),
  pengguna_id     uuid not null references public.users (id),
  dibuka_pada     timestamptz not null default now(),
  ditutup_pada    timestamptz,
  -- Daftar tujuh nilai difinalkan Modul 6.4. Ditulis sebagai text di
  -- sini justru supaya Modul 6.4 dapat menetapkan daftarnya sendiri
  -- tanpa berbenturan dengan daftar setengah jadi buatan modul ini
  -- (BR-77).
  sebab_penutupan text,
  dibuat_pada     timestamptz not null default now()
);

-- BR-24: satu orang hanya memegang satu Sesi Tugas aktif pada satu
-- waktu, lintas seluruh SPT. Ditegakkan indeks unik parsial — bukan
-- diperiksa di aplikasi, karena dua permintaan yang tiba hampir
-- bersamaan akan lolos dari pemeriksaan aplikasi.
create unique index if not exists idx_sesi_tugas_satu_aktif
  on public.sesi_tugas (pengguna_id) where ditutup_pada is null;

create index if not exists idx_sesi_tugas_penugasan
  on public.sesi_tugas (penugasan_id);

alter table public.sesi_tugas enable row level security;
-- Tidak ada grant. Disengaja — lihat catatan di atas.
