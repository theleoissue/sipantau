-- =====================================================================
-- 0045 — Menandai Sesi Tugas yang dibuka di luar jadwal piket
--
-- Bagian keempat dari empat yang diminta pemilik produk bersama modul
-- jadwal piket (0042/0043).
--
-- MENANDAI, BUKAN MENGHALANGI — dan ini keputusan yang disengaja,
-- bukan setengah jalan. Mengunci Sesi Tugas pada jadwal piket sempat
-- dipertimbangkan terbuka bersama pemilik produk dan DITOLAK, sebab
-- akibatnya menghilangkan bukti: SPT dapat terbit kapan saja dan
-- penyelidikan tidak mengikuti jadwal piket, sehingga anggota yang
-- mendapat perintah mendadak pada hari Lepas Dinas-nya tidak akan dapat
-- merekam posisi sama sekali. Ditambah, jadwal yang telat diperbarui
-- akan menghentikan SELURUH perekaman tanpa seorang pun berbuat salah.
--
-- Bentuk ini memberi penegakan yang nyata — terlihat, tercatat, dapat
-- ditanyakan — tanpa sekalipun menghentikan perekaman. Sejalan Prinsip
-- Non-Menghakimi (CLAUDE.md §7.3): sistem menyajikan fakta, manusia
-- yang menilai.
--
-- BR-77 ditelusuri lebih dulu: 'di_luar_jadwal' tidak pernah ada di
-- kolom, migrasi, maupun kode mana pun sebelum ini.
-- =====================================================================

alter table public.sesi_tugas
  add column if not exists di_luar_jadwal boolean not null default false;

comment on column public.sesi_tugas.di_luar_jadwal is
  'Sesi dibuka pada hari unit pemegangnya berstatus Lepas Dinas. Fakta saat sesi dibuka, tidak pernah menghalangi pembukaannya.';


-- ---------------------------------------------------------------------
-- fn_tandai_sesi_luar_jadwal
--
-- PEMICU, BUKAN sisipan ke dalam buka_sesi_tugas. Fungsi itu 94 baris
-- dan sudah ditulis ulang sekali (0031); menyalinnya lagi hanya untuk
-- satu penetapan kolom berarti dua salinan aturan yang panjang, dan
-- yang berikutnya menyentuhnya akan bekerja dari salinan yang mana pun
-- kebetulan ia buka. Pemicu berdiri sendiri, tidak menyentuh satu baris
-- pun milik modul GPS yang sudah selesai.
--
-- Tidak ada pemicu lain pada sesi_tugas, jadi urutan abjad (CLAUDE.md
-- §5.4) tidak menjadi persoalan di sini.
--
-- NILAINYA DIBEKUKAN SAAT SESI DIBUKA, dan tidak ikut berubah bila
-- jadwal disunting belakangan. Itu memang yang dikehendaki: yang
-- dicatat adalah apa yang jadwalnya katakan PADA SAAT orang itu memulai
-- tugasnya — itulah yang dapat ditanyakan kepadanya. Jadwal yang
-- dikoreksi sebulan kemudian tidak mengubah keadaan saat itu.
-- ---------------------------------------------------------------------
create or replace function public.fn_tandai_sesi_luar_jadwal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.di_luar_jadwal := exists (
    select 1
      from public.jadwal_piket j
      join public.users u on u.id = new.pengguna_id
     where j.unit_id = u.unit_id
       -- Asia/Jakarta, BUKAN current_date (CLAUDE.md §5.5). Server
       -- berjalan UTC: tanpa ini, sesi yang dibuka antara pukul 00.00
       -- dan 07.00 WIB dinilai terhadap jadwal HARI SEBELUMNYA — dan
       -- justru jam-jam itulah piket malam berlangsung.
       and j.tanggal = (now() at time zone 'Asia/Jakarta')::date
       and j.keadaan = 'lepas_dinas'
  );
  return new;
end;
$$;

drop trigger if exists trg_tandai_sesi_luar_jadwal on public.sesi_tugas;
create trigger trg_tandai_sesi_luar_jadwal
before insert on public.sesi_tugas
for each row execute function public.fn_tandai_sesi_luar_jadwal();

-- Tidak ada grant update pada sesi_tugas bagi authenticated (0017),
-- jadi penanda ini tidak dapat dihapus sendiri oleh yang ditandainya.
-- Seluruh penulisan ke tabel ini lewat fungsi security definer.
