-- =====================================================================
-- 0006 — Fungsi masuk, ganti kata sandi, dan pencatatan jejak audit
-- Sumber: docs/10-modul-6.1-auth.md KP-6.1-05, KP-6.1-09, §9.6
-- =====================================================================
--
-- Ketiga fungsi di bawah ada karena penjaga kolom pada 0005 sengaja
-- menolak perubahan wajib_ganti_sandi dan terakhir_masuk yang datang
-- dari jalur biasa. Inilah jalur resminya: sempit, tercatat, dan
-- memeriksa syaratnya sendiri.
--
-- Penanda sesi 'sipantau.jalur_resmi' disetel dengan cakupan transaksi
-- (argumen ketiga true), jadi ia padam sendiri begitu transaksinya
-- selesai. Tidak ada sisa yang terbawa ke permintaan berikutnya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Pencatat jejak audit
--
-- Dipanggil dari fungsi lain maupun dari Server Action. Ia mengisi
-- pelaku_id dan peran_pelaku sendiri dari sesi, sehingga pemanggil tidak
-- dapat mengaku sebagai orang lain.
-- ---------------------------------------------------------------------
create or replace function public.catat_jejak_audit(
  p_jenis         public.jenis_tindakan_audit,
  p_sasaran_tabel text default null,
  p_sasaran_id    uuid default null,
  p_keterangan    text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pelaku uuid := (select auth.uid());
  v_peran  public.peran_pengguna;
begin
  if v_pelaku is null then
    raise exception 'TANPA_SESI: jejak audit hanya dapat dicatat oleh pengguna yang sudah masuk';
  end if;

  select peran into v_peran from public.users where id = v_pelaku;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id, keterangan)
  values
    (v_pelaku, v_peran, p_jenis, p_sasaran_tabel, p_sasaran_id, p_keterangan);
end;
$$;

revoke execute on function public.catat_jejak_audit(
  public.jenis_tindakan_audit, text, uuid, text) from public;
grant execute on function public.catat_jejak_audit(
  public.jenis_tindakan_audit, text, uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- Dipanggil setelah Supabase Auth menerima kredensial (KP-6.1-05).
--
-- Mengembalikan baris users pemanggil supaya lapisan aplikasi tidak
-- perlu kueri kedua. Bila akun tidak aktif, ia menolak — sehingga
-- KP-6.1-03 ditegakkan di basis data, bukan hanya di layar.
-- ---------------------------------------------------------------------
create or replace function public.catat_masuk_berhasil()
returns public.users
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id   uuid := (select auth.uid());
  v_baris public.users;
begin
  if v_id is null then
    raise exception 'TANPA_SESI';
  end if;

  select * into v_baris from public.users where id = v_id;

  if not found then
    raise exception 'AKUN_TIDAK_DIKENAL';
  end if;

  if v_baris.aktif = false then
    raise exception 'AKUN_NONAKTIF';
  end if;

  perform set_config('sipantau.jalur_resmi', 'on', true);

  update public.users
     set terakhir_masuk = now()
   where id = v_id
  returning * into v_baris;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
  values
    (v_id, v_baris.peran, 'masuk_berhasil', 'users', v_id);

  return v_baris;
end;
$$;

revoke execute on function public.catat_masuk_berhasil() from public;
grant execute on function public.catat_masuk_berhasil() to authenticated;

-- ---------------------------------------------------------------------
-- Dipanggil setelah kata sandi baru berhasil disimpan ke Supabase Auth
-- (KP-6.1-09). Fungsi ini TIDAK menyentuh kata sandi itu sendiri — itu
-- urusan Supabase Auth — ia hanya memadamkan penanda wajib ganti.
--
-- Kata sandinya sendiri DILARANG ikut tercatat di jejak audit
-- (KP-6.1-38), jadi tidak ada parameter kata sandi di sini sama sekali.
-- ---------------------------------------------------------------------
create or replace function public.selesaikan_ganti_sandi_wajib()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id    uuid := (select auth.uid());
  v_peran public.peran_pengguna;
begin
  if v_id is null then
    raise exception 'TANPA_SESI';
  end if;

  select peran into v_peran from public.users where id = v_id and aktif = true;

  if not found then
    raise exception 'AKUN_NONAKTIF';
  end if;

  perform set_config('sipantau.jalur_resmi', 'on', true);

  update public.users
     set wajib_ganti_sandi = false
   where id = v_id;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
  values
    (v_id, v_peran, 'ganti_sandi', 'users', v_id);
end;
$$;

revoke execute on function public.selesaikan_ganti_sandi_wajib() from public;
grant execute on function public.selesaikan_ganti_sandi_wajib() to authenticated;

-- ---------------------------------------------------------------------
-- Dipanggil saat pengguna menekan Keluar (§9.6 jenis 'keluar').
-- ---------------------------------------------------------------------
create or replace function public.catat_keluar()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id    uuid := (select auth.uid());
  v_peran public.peran_pengguna;
begin
  if v_id is null then
    return; -- sudah tidak bersesi, tidak ada yang perlu dicatat
  end if;

  select peran into v_peran from public.users where id = v_id;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
  values
    (v_id, v_peran, 'keluar', 'users', v_id);

  delete from public.perangkat_masuk where user_id = v_id;
end;
$$;

revoke execute on function public.catat_keluar() from public;
grant execute on function public.catat_keluar() to authenticated;
