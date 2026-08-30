-- =====================================================================
-- 0034 — Jalur resmi untuk peran/unit_id/aktif (dipanggil dari Fungsi
-- Tepi lewat service_role, bukan sesi pengguna biasa)
-- =====================================================================
--
-- fn_jaga_kolom_users (0033) mengunci peran/unit_id/aktif memakai
-- sipantau_auth.peran_saya() — yang membaca auth.uid(). Fungsi Tepi
-- (buat-akun, nonaktifkan-akun, reset-kata-sandi, migrasi 0035)
-- memanggil lewat KLIEN service_role, BUKAN sesi pengguna: auth.uid()
-- di sana selalu NULL, sehingga v_peran juga NULL.
--
-- TANPA perubahan ini, perilakunya kebetulan LOLOS lewat penanganan
-- NULL plpgsql (NULL dalam kondisi IF diperlakukan seperti FALSE) —
-- bukan disengaja, dan persis "kegagalan senyap yang berhasil tanpa
-- satu pun galat" yang diperingatkan docs/CLAUDE.md §11. Diperbaiki di
-- sini memakai penanda 'sipantau.jalur_resmi' yang SUDAH menjadi
-- konvensi proyek ini sejak 0006 (KP-6.1-09) — jalur sempit, tercatat,
-- memeriksa syaratnya sendiri, bukan celah umum.
--
-- Fungsi keamanan di 0035 SENDIRI yang memeriksa wewenang pelaku
-- (admin/pemeliharaan) sebelum menyalakan penanda ini — penanda ini
-- BUKAN celah baru, ia hanya dapat dinyalakan dari dalam fungsi
-- security definer yang sudah memeriksa sendiri.
-- =====================================================================

create or replace function public.fn_jaga_kolom_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
  v_resmi boolean := coalesce(current_setting('sipantau.jalur_resmi', true), '') = 'on';
begin
  if v_peran = 'admin' then
    return new;
  end if;

  if new.peran is distinct from old.peran
     or new.unit_id is distinct from old.unit_id then
    if not v_resmi then
      raise exception 'KOLOM_TERKUNCI: peran dan unit hanya dapat diubah Admin';
    end if;
  end if;

  if new.nrp is distinct from old.nrp
     or new.email_sistem is distinct from old.email_sistem then
    raise exception 'KOLOM_TERKUNCI: NRP tidak dapat diubah';
  end if;

  if new.aktif is distinct from old.aktif
     and v_peran <> 'pemeliharaan'
     and not v_resmi then
    raise exception 'KOLOM_TERKUNCI: status aktif hanya dapat diubah Admin atau Akun Pemeliharaan';
  end if;

  if v_peran = 'kanit' and new.id <> (select auth.uid()) then
    if new.nama              is distinct from old.nama
       or new.pangkat        is distinct from old.pangkat
       or new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: Kanit hanya dapat menyalakan penggantian kata sandi';
    end if;
  end if;

  if new.foto_acuan_wajah is distinct from old.foto_acuan_wajah then
    raise exception 'KOLOM_TERKUNCI: foto_acuan_wajah belum boleh diisi';
  end if;

  if not v_resmi then
    if new.wajib_ganti_sandi is distinct from old.wajib_ganti_sandi
       and v_peran not in ('kanit', 'pemeliharaan') then
      raise exception 'KOLOM_TERKUNCI: wajib_ganti_sandi hanya berubah lewat penggantian kata sandi yang sah';
    end if;

    if new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: terakhir_masuk hanya diisi sistem saat masuk';
    end if;
  end if;

  new.diubah_pada := now();
  return new;
end;
$$;
