-- =====================================================================
-- 0042 — jadwal_piket: giliran Piket, Cadangan, dan Lepas Dinas per unit
--
-- MODUL BARU, di luar PRD. Piket, regu, dan roster tidak pernah disebut
-- satu kali pun di docs/ maupun di kode sebelum ini (ditelusuri, nol
-- hasil). Dibangun atas permintaan pemilik produk 2 September 2026,
-- dengan acuan bentuk "JADWAL PIKET UNIT GAKKUM SATLANTAS POLRESTABES
-- BANDUNG" yang ia berikan.
--
-- BENTUKNYA BARIS PER HARI, BUKAN RUMUS. Ini keputusan sadar, dan
-- alasannya ada di dokumen acuan itu sendiri: selama 38 hari yang
-- tercatat, rotasinya berjalan murni 31 hari lalu MENYIMPANG dua kali —
-- 1 September mengulang persis 31 Agustus, dan 7 September melompat
-- satu langkah. Jadwal piket sungguhan disesuaikan tangan manusia.
-- Rumus tidak akan pernah dapat menghasilkan dua hari itu; baris yang
-- dapat disunting, dapat.
--
-- Akibat sampingannya menguntungkan: berapa unit yang ikut berotasi
-- menjadi DATA, bukan keputusan pemrograman. Dokumen acuan memakai tiga
-- regu; SiPANTAU punya empat unit. Keduanya tertampung tanpa satu baris
-- kode pun berubah.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'keadaan_piket') then
    -- Urutan nilai enum ini BUKAN sekadar daftar: ia urutan siklusnya.
    -- Dibaca dari dokumen acuan — tiap regu bergerak cadangan -> piket
    -- -> lepas_dinas -> cadangan, dan ketiganya bergeser serentak satu
    -- langkah tiap hari. Pembangkit di migrasi berikutnya bersandar
    -- pada urutan ini.
    create type public.keadaan_piket as enum
      ('cadangan', 'piket', 'lepas_dinas');
  end if;
end $$;

create table if not exists public.jadwal_piket (
  tanggal          date not null,
  unit_id          uuid not null references public.unit (id),
  keadaan          public.keadaan_piket not null,
  -- Menandai hari yang disetel tangan. Pembangkit TIDAK PERNAH menimpa
  -- baris bertanda ini — tanpa penanda tersebut, satu kali penyusunan
  -- ulang akan menghapus seluruh penyesuaian yang sudah dibuat, diam-
  -- diam dan tanpa jejak.
  disunting_manual boolean not null default false,
  catatan          text,
  dibuat_pada      timestamptz not null default now(),
  diubah_oleh      uuid references public.users (id),
  diubah_pada      timestamptz,

  primary key (tanggal, unit_id)
);

comment on table public.jadwal_piket is
  'Giliran Piket/Cadangan/Lepas Dinas, satu baris per unit per hari. Sengaja baris dan bukan rumus — jadwal sungguhan disesuaikan manual.';
comment on column public.jadwal_piket.disunting_manual is
  'Hari yang disetel tangan. Pembangkit jadwal tidak pernah menimpanya.';

create index if not exists idx_jadwal_piket_tanggal
  on public.jadwal_piket (tanggal);

alter table public.jadwal_piket enable row level security;

grant select on public.jadwal_piket to authenticated;
grant insert, update on public.jadwal_piket to authenticated;

-- ---------------------------------------------------------------------
-- Baca: SELURUH peran yang sudah masuk.
--
-- Jadwal piket bukan data perkara. Justru sebaliknya — gunanya hilang
-- bila hanya pimpinan yang dapat melihatnya: seorang Anggota perlu tahu
-- kapan gilirannya, dan seorang Panit perlu tahu unit mana yang sedang
-- Piket ketika ia butuh bantuan. Menyempitkannya ke unit sendiri akan
-- menyembunyikan justru bagian yang paling berguna.
--
-- Akun Pemeliharaan ikut membaca: ia tidak dikecualikan di sini karena
-- tidak ada yang perlu disembunyikan darinya pada tabel ini.
-- ---------------------------------------------------------------------
create policy "jadwal_piket_baca_semua"
on public.jadwal_piket
for select
to authenticated
using (true);

-- ---------------------------------------------------------------------
-- Tulis: Kasubdit saja.
--
-- ASUMSI YANG DINYATAKAN TERBUKA, bukan disembunyikan. PRD tidak pernah
-- membahas siapa pemilik jadwal piket, sebab modul ini memang di luar
-- PRD. Dipilih Kasubdit karena jadwal ini LINTAS UNIT: satu barisnya
-- menentukan giliran unit lain. Kanit yang lingkupnya hanya unitnya
-- sendiri (BR-07) tidak pantas menyetel giliran unit tetangganya, dan
-- Admin kewenangannya akun, bukan operasional.
--
-- Bila pemilik produk menghendaki Kanit ikut menyusun, kebijakan ini
-- yang diubah — bukan tersebar di banyak tempat.
-- ---------------------------------------------------------------------
create policy "jadwal_piket_tulis_kasubdit"
on public.jadwal_piket
for insert
to authenticated
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');

create policy "jadwal_piket_ubah_kasubdit"
on public.jadwal_piket
for update
to authenticated
using ((select sipantau_auth.peran_saya()) = 'kasubdit')
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');

-- Tidak ada kebijakan delete, dan tidak ada grant delete — sejalan
-- CLAUDE.md §5.1. Membatalkan sebuah hari dilakukan dengan mengubah
-- keadaannya, bukan menghapus barisnya, supaya jejaknya tidak lenyap.
