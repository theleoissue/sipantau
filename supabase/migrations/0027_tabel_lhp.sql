-- =====================================================================
-- 0027 — Tabel Modul 6.8: LHP Ringkas Otomatis
-- Sumber: docs/00-fondasi.md §5.5, §6.8 (belum punya berkas modul
-- tersendiri — PETA.md menandainya "belum digali", tetapi CLAUDE.md
-- hanya menyatakan §6.1-6.4/6.6/6.9 di fondasi.md yang sudah digantikan
-- berkas modul; §6.8 TIDAK termasuk, jadi isi fondasi.md untuk bagian
-- ini masih berlaku).
--
-- BR-10: LHP Resmi Lengkap berada di luar cakupan sistem. Yang dibangun
-- di sini HANYA LHP Ringkas — draf terstruktur yang diekspor menjadi
-- bahan kirim manual ke pimpinan, bukan dokumen resmi kepolisian itu
-- sendiri.
--
-- BUTIR A-02 (docs/30-modul-6.3-pelaporan.md Lampiran A, docs/00-fondasi.md
-- §9.5): penyimpanan identitas pihak dan nomor pengenal pada layanan awan
-- pihak ketiga di luar negeri sebelumnya "belum terjawab, prioritas
-- tinggi". Pemilik produk sudah menjawab eksplisit dalam sesi ini:
-- disimpan penuh di Supabase, sudah disetujui institusi. Keputusan itu
-- yang membuat tabel lhp_pihak di bawah menyimpan nomor_pengenal apa
-- adanya, bukan disandikan atau dipisah ke server lain.
--
-- Peringatan data sensitif (fondasi.md baris 745-747): tabel-tabel di
-- sini memuat data paling sensitif dalam sistem. RLS-nya (0028) disusun
-- paling ketat di antara seluruh modul.
-- =====================================================================

create type public.status_lhp as enum ('draf', 'final');
create type public.peran_pihak_lhp as enum ('pelapor', 'terlapor');

-- ---------------------------------------------------------------------
-- lhp — induk. Satu SPT dapat memiliki lebih dari satu LHP (umumnya
-- satu per kegiatan, tidak dibatasi keras di sini — fondasi.md tidak
-- menyebut batasan jumlah).
--
-- dasar/waktu_kegiatan/tempat_kegiatan diisi TEKS terformat oleh
-- pemanggil (Server Action) saat mulai_lhp() dipanggil, bukan disusun
-- ulang di sini — pemformatan tanggal Indonesia sudah punya pola baku
-- di lapisan TypeScript (mis. beranda/page.tsx waktu()), tidak perlu
-- diduplikasi dalam plpgsql.
-- ---------------------------------------------------------------------
create table public.lhp (
  id                    uuid primary key default gen_random_uuid(),
  penugasan_id          uuid not null references public.penugasan (id),
  disusun_oleh          uuid not null references public.users (id),

  dasar                 text,   -- auto: nomor SPT
  waktu_kegiatan        text,   -- auto: Sesi Tugas
  tempat_kegiatan       text,   -- auto: lokasi SPT/koordinat

  perkara               text,
  dasar_hukum           text,
  kronologis            text,
  langkah               text,
  rencana_tindak_lanjut text,
  kesimpulan            text,
  catatan               text,

  status                public.status_lhp not null default 'draf',
  dibuat_pada           timestamptz not null default now(),
  diubah_pada           timestamptz not null default now()
);

create index idx_lhp_penugasan on public.lhp (penugasan_id);
create index idx_lhp_disusun_oleh on public.lhp (disusun_oleh, dibuat_pada desc);

alter table public.lhp enable row level security;
-- Tidak ada delete (CLAUDE.md §5.1) — draf yang tak jadi dipakai cukup
-- dibiarkan, tidak ada BR yang mensyaratkan penghapusan LHP.
grant select, insert, update on public.lhp to authenticated;

-- ---------------------------------------------------------------------
-- Tabel anak — bagian yang jumlah barisnya berubah-ubah (fondasi.md
-- baris 728-740). Semua punya `urutan` mengikuti konvensi
-- penugasan_dasar/penugasan_lokasi, supaya urutan tampil di ekspor
-- dapat disusun ulang tanpa mengandalkan waktu insert.
-- ---------------------------------------------------------------------

-- Daftar petugas pelaksana. Terisi otomatis dari Panit + pelaksana aktif
-- SPT (mulai_lhp(), 0030), masih dapat disunting Anggota penyusun.
create table public.lhp_petugas (
  id          uuid primary key default gen_random_uuid(),
  lhp_id      uuid not null references public.lhp (id) on delete cascade,
  petugas_id  uuid not null references public.users (id),
  urutan      smallint not null default 0,
  dibuat_pada timestamptz not null default now()
);

create index idx_lhp_petugas_lhp on public.lhp_petugas (lhp_id, urutan);

alter table public.lhp_petugas enable row level security;
grant select, insert, update, delete on public.lhp_petugas to authenticated;

-- Daftar pelapor dan terlapor. Nama dan nomor pengenal berupa pihak DI
-- LUAR sistem (bukan users) — bukan FK, teks apa adanya sesuai formulir.
create table public.lhp_pihak (
  id              uuid primary key default gen_random_uuid(),
  lhp_id          uuid not null references public.lhp (id) on delete cascade,
  peran           public.peran_pihak_lhp not null,
  nama            text not null,
  nomor_pengenal  text,
  keterangan      text,
  urutan          smallint not null default 0,
  dibuat_pada     timestamptz not null default now()
);

create index idx_lhp_pihak_lhp on public.lhp_pihak (lhp_id, urutan);

alter table public.lhp_pihak enable row level security;
grant select, insert, update, delete on public.lhp_pihak to authenticated;

-- Daftar saksi yang diperiksa beserta kedudukannya.
create table public.lhp_saksi (
  id          uuid primary key default gen_random_uuid(),
  lhp_id      uuid not null references public.lhp (id) on delete cascade,
  nama        text not null,
  kedudukan   text,
  keterangan  text,
  urutan      smallint not null default 0,
  dibuat_pada timestamptz not null default now()
);

create index idx_lhp_saksi_lhp on public.lhp_saksi (lhp_id, urutan);

alter table public.lhp_saksi enable row level security;
grant select, insert, update, delete on public.lhp_saksi to authenticated;

-- Daftar barang bukti beserta keterangannya.
create table public.lhp_barang_bukti (
  id          uuid primary key default gen_random_uuid(),
  lhp_id      uuid not null references public.lhp (id) on delete cascade,
  uraian      text not null,
  keterangan  text,
  urutan      smallint not null default 0,
  dibuat_pada timestamptz not null default now()
);

create index idx_lhp_barang_bukti_lhp on public.lhp_barang_bukti (lhp_id, urutan);

alter table public.lhp_barang_bukti enable row level security;
grant select, insert, update, delete on public.lhp_barang_bukti to authenticated;

-- ---------------------------------------------------------------------
-- lhp_foto — penghubung ke foto YANG SUDAH ADA di foto_dokumentasi
-- (fondasi.md: "Pelampiran foto dokumentasi" / "Foto dokumentasi yang
-- sudah diunggah, terisi otomatis"). BUKAN penyesuaian skema
-- foto_dokumentasi: kolom laporan_id di sana NOT NULL dan sudah
-- berjalan (0010) — melonggarkannya berisiko ke RLS/kode laporan yang
-- sudah selesai. Tabel penghubung ini keputusan desain saya sendiri,
-- di luar yang dituliskan literal di PRD, dipilih karena tidak
-- menyentuh sama sekali yang sudah berjalan.
-- ---------------------------------------------------------------------
create table public.lhp_foto (
  lhp_id      uuid not null references public.lhp (id) on delete cascade,
  foto_id     uuid not null references public.foto_dokumentasi (id),
  dibuat_pada timestamptz not null default now(),
  primary key (lhp_id, foto_id)
);

alter table public.lhp_foto enable row level security;
grant select, insert, delete on public.lhp_foto to authenticated;
