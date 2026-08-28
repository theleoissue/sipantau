-- =====================================================================
-- 0009 — Penjaga kolom pada penugasan_pelaksana dan penugasan_panit
-- =====================================================================
--
-- CELAH YANG DITUTUP DI SINI.
--
-- Kebijakan "pelaksana_ubah_kanit" pada migrasi 0008 mengizinkan
-- seseorang mengubah BARIS miliknya sendiri, supaya tanda terima
-- (kolom dibaca_pada) dapat ditulis pemiliknya. Tetapi kebijakan RLS
-- hanya dapat membatasi BARIS MANA, tidak KOLOM MANA.
--
-- Akibatnya, tanpa pemicu di bawah, seorang pelaksana dapat mengirim
-- permintaan langsung ke basis data yang mengisi dicabut_pada pada
-- barisnya sendiri — mencabut dirinya dari penugasan, lengkap dengan
-- alasan karangannya sendiri. Berhasil, tanpa satu pun galat, dan
-- tercatat seolah Kanit yang melakukannya.
--
-- Pencabutan adalah kewenangan Kanit (Bagian 7 Modul 6.2). Pemicu ini
-- yang menegakkannya.
-- =====================================================================

create or replace function public.fn_jaga_kolom_pelaksana()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
begin
  -- Kanit unit pemilik boleh mengubah apa pun pada baris ini; kebijakan
  -- RLS sudah memastikan ia memang Kanit unit yang benar.
  if v_peran = 'kanit' then
    return new;
  end if;

  -- Selain Kanit, satu-satunya kolom yang boleh berubah adalah tanda
  -- terima miliknya sendiri.
  if new.penugasan_id      is distinct from old.penugasan_id
     or new.pelaksana_id   is distinct from old.pelaksana_id
     or new.urutan         is distinct from old.urutan
     or new.dicabut_pada   is distinct from old.dicabut_pada
     or new.dicabut_oleh   is distinct from old.dicabut_oleh
     or new.alasan_pencabutan is distinct from old.alasan_pencabutan then
    raise exception 'KOLOM_TERKUNCI: hanya Kanit yang dapat mengubah susunan pelaksana';
  end if;

  -- Tanda terima dicatat sekali, saat pelaksana pertama kali membuka
  -- rincian. Menulisnya ulang berarti memundurkan waktu yang sudah
  -- tercatat, dan itu memalsukan jejak.
  if old.dibaca_pada is not null
     and new.dibaca_pada is distinct from old.dibaca_pada then
    raise exception 'KOLOM_TERKUNCI: tanda terima sudah tercatat dan tidak dapat diubah';
  end if;

  return new;
end;
$$;

create trigger trg_jaga_kolom_pelaksana
  before update on public.penugasan_pelaksana
  for each row
  execute function public.fn_jaga_kolom_pelaksana();

-- ---------------------------------------------------------------------
-- Hal yang sama untuk penugasan_panit. Di sini tidak ada kolom yang
-- boleh disentuh selain oleh Kanit sama sekali, jadi penjaganya lebih
-- sederhana.
-- ---------------------------------------------------------------------
create or replace function public.fn_jaga_kolom_panit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'KOLOM_TERKUNCI: hanya Kanit yang dapat mengubah penunjukan Panit';
  end if;
  return new;
end;
$$;

create trigger trg_jaga_kolom_panit
  before update on public.penugasan_panit
  for each row
  execute function public.fn_jaga_kolom_panit();

-- ---------------------------------------------------------------------
-- Jalur resmi tanda terima (KP-6.2, tanda terima otomatis).
--
-- Dibuat sebagai fungsi tersendiri supaya lapisan aplikasi tidak perlu
-- menulis UPDATE mentah ke tabel penghubung, dan supaya pencatatannya
-- tetap satu arah: hanya mengisi yang masih kosong.
-- ---------------------------------------------------------------------
create or replace function public.catat_tanda_terima(p_penugasan_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.penugasan_pelaksana
     set dibaca_pada = now()
   where penugasan_id = p_penugasan_id
     and pelaksana_id = (select auth.uid())
     and dibaca_pada is null
     and dicabut_pada is null;
end;
$$;

revoke execute on function public.catat_tanda_terima(uuid) from public;
grant execute on function public.catat_tanda_terima(uuid) to authenticated;
