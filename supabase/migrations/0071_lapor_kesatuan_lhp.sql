-- =====================================================================
-- 0071 — Kesatuan laporan lapangan dengan LHP Ringkas
--
-- MASALAH
--
-- "Kirim Laporan" (laporan_harian) dan "LHP Ringkas" (lhp, migrasi 0022)
-- adalah dua jalur terpisah yang menghasilkan dua dokumen berbeda untuk
-- kejadian yang sama, dan keduanya hanya boleh disusun Anggota
-- pelaksana. Pemilik produk meminta satu jalur saja (13-14 September
-- 2026): laporan yang dikirim dari lapangan langsung memuat Kesimpulan
-- dan Rencana Tindak Lanjut — bagian yang sebelumnya hanya ada di LHP
-- Ringkas — dan boleh dikirim juga oleh Panit penugasan atau Kanit
-- unitnya, tidak melulu Anggota pelaksana.
--
-- Berkas ini TIDAK mengubah atau menghapus tabel lhp — itu langkah
-- terpisah menyusul (pemindahan tampilan "LHP Ringkas" jadi riwayat
-- baca-saja dari laporan_harian). Di sini hanya menyiapkan skema dan
-- pemicu yang dibutuhkan formulir "Kirim Laporan" yang baru.
--
-- YANG DILAKUKAN
--
--   1. laporan_harian dapat kolom kesimpulan dan rencana_tindak_lanjut
--      (keduanya boleh kosong — laporan jenis pulbaket_awal/perkembangan
--      wajar belum punya kesimpulan).
--   2. laporan_harian dapat kolom posisi_pengirim (kanit/panit/kasubdit)
--      dan tujuan_surat (kasubdit_subdit_iv/direktur_reskrimsus) —
--      dipilih pengirim sendiri saat mengisi formulir (bebas, tidak
--      dipaksa mengikuti peran akun yang sedang login) dan disimpan
--      permanen, supaya laporan yang dibuka lagi nanti tetap
--      menampilkan Dari/Kepada yang sama seperti saat dikirim.
--   3. fn_periksa_pelapor_aktif (0011) diperluas: sebelumnya hanya
--      menerima Anggota pelaksana aktif pada penugasan itu; sekarang
--      Panit penugasan itu dan Kanit unit pemilik penugasan itu juga
--      boleh mengirim laporan atas penugasan tersebut.
--   4. fn_tandai_sunting (0011) diperluas: perubahan pada empat kolom
--      baru ikut dihitung sebagai penyuntingan (disunting_pada,
--      jumlah_suntingan), sama seperti uraian/kendala/status_kegiatan.
--      Kolom fakta lokasi (Celah 1) tetap dibekukan, tidak berubah.
-- =====================================================================

create type public.posisi_pengirim_laporan as enum ('kanit', 'panit', 'kasubdit');
create type public.tujuan_laporan as enum ('kasubdit_subdit_iv', 'direktur_reskrimsus');

alter table public.laporan_harian
  add column kesimpulan text,
  add column rencana_tindak_lanjut text,
  add column posisi_pengirim public.posisi_pengirim_laporan not null default 'kanit',
  add column tujuan_surat public.tujuan_laporan not null default 'kasubdit_subdit_iv';

-- Kolom baru mewarisi grant dan kebijakan RLS tabel yang sudah ada
-- (§5.1) — tidak ada grant baru untuk ditulis di sini.

create or replace function public.fn_periksa_pelapor_aktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.status_spt;
  v_boleh  boolean := false;
begin
  select status into v_status from public.penugasan where id = new.penugasan_id;

  if v_status not in ('baru', 'berjalan', 'bermasalah') then
    raise exception 'SPT_TERTUTUP: SPT ini tidak lagi menerima laporan';
  end if;

  -- Anggota pelaksana aktif pada penugasan ini (perilaku semula, 0011).
  if exists (
    select 1 from public.penugasan_pelaksana
     where penugasan_id = new.penugasan_id
       and pelaksana_id = new.pelapor_id
       and dicabut_pada is null
  ) then
    v_boleh := true;
  end if;

  -- Panit penanggung jawab penugasan ini.
  if not v_boleh and exists (
    select 1 from public.penugasan_panit
     where penugasan_id = new.penugasan_id
       and panit_id = new.pelapor_id
       and dicabut_pada is null
  ) then
    v_boleh := true;
  end if;

  -- Kanit unit pemilik penugasan ini. Dicek langsung lewat unit_id,
  -- bukan sipantau_auth.unit_saya() (fungsi itu membaca auth.uid() —
  -- benar untuk kebijakan RLS yang selalu berjalan sebagai pemanggil,
  -- tapi pemicu ini harus tetap benar dipanggil lewat jalur mana pun).
  if not v_boleh and exists (
    select 1
      from public.users u
      join public.penugasan p on p.unit_id = u.unit_id
     where u.id = new.pelapor_id
       and u.peran = 'kanit'
       and p.id = new.penugasan_id
  ) then
    v_boleh := true;
  end if;

  if not v_boleh then
    raise exception 'BUKAN_PELAKSANA: Anda bukan pelaksana, Panit, atau Kanit unit pada penugasan ini';
  end if;

  return new;
end;
$$;

create or replace function public.fn_tandai_sunting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.uraian                  is distinct from old.uraian
     or new.kendala               is distinct from old.kendala
     or new.status_kegiatan       is distinct from old.status_kegiatan
     or new.kesimpulan            is distinct from old.kesimpulan
     or new.rencana_tindak_lanjut is distinct from old.rencana_tindak_lanjut
     or new.posisi_pengirim       is distinct from old.posisi_pengirim
     or new.tujuan_surat          is distinct from old.tujuan_surat then
    new.disunting_pada   := now();
    new.jumlah_suntingan := old.jumlah_suntingan + 1;

    -- Celah 5: penyuntingan pelapor mengembalikan status yang sempat
    -- diminta perbaikan.
    if old.status_laporan = 'perlu_diperbaiki' then
      new.status_laporan := 'terkirim';
    end if;
  end if;

  -- Seluruh kolom fakta Celah 1 dibekukan (docs/01-koreksi.md I.5:
  -- daftar lengkap, bukan sebagian). Tidak boleh ikut berubah lewat
  -- jalur penyuntingan apa pun.
  new.lokasi_lat             := old.lokasi_lat;
  new.lokasi_lng             := old.lokasi_lng;
  new.akurasi_meter          := old.akurasi_meter;
  new.status_lokasi          := old.status_lokasi;
  new.lokasi_id_terdekat     := old.lokasi_id_terdekat;
  new.jarak_meter            := old.jarak_meter;
  new.lokasi_id              := old.lokasi_id;
  new.alasan_lokasi          := old.alasan_lokasi;
  new.alasan_lokasi_lainnya  := old.alasan_lokasi_lainnya;
  new.pelapor_id             := old.pelapor_id;
  new.penugasan_id           := old.penugasan_id;
  new.sesi_tugas_id          := old.sesi_tugas_id;
  new.penanda_perangkat      := old.penanda_perangkat;
  new.dikirim_pada           := old.dikirim_pada;

  return new;
end;
$$;
