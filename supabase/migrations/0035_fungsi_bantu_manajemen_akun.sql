-- =====================================================================
-- 0035 — Fungsi bantu Manajemen Akun, dipanggil HANYA dari Fungsi Tepi
-- (buat-akun, nonaktifkan-akun, reset-kata-sandi) lewat klien
-- service_role — bukan dari sesi pengguna biasa.
-- =====================================================================
--
-- Prinsip CLAUDE.md §8: "Fungsi Tepi hanya untuk operasi yang
-- mensyaratkan kunci istimewa. Dilarang dipakai sebagai tempat
-- memindahkan logika yang seharusnya di RLS." Logika bisnis (siapa
-- boleh apa, BR-70, jejak audit) tetap di sini, di basis data — Fungsi
-- Tepi Deno hanya mengerjakan yang SUNGGUH butuh service_role: memanggil
-- Supabase Auth Admin API (buat pengguna, ubah kata sandi) dan
-- memverifikasi token JWT pemanggil.
--
-- KEWENANGAN DIPERIKSA DI SINI JUGA (bukan cuma di kode Deno) — lapis
-- kedua, pola yang sama seperti BR-65 (docs/40-modul-6.4-gps.md):
-- penyembunyian di satu tempat saja tidak pernah cukup sendirian.
--
-- p_pelaku_id WAJIB dikirim eksplisit sebagai parameter, BUKAN dibaca
-- dari auth.uid() — klien service_role tidak membawa sesi pengguna,
-- auth.uid() akan selalu NULL di sana. Fungsi Tepi Deno yang
-- memverifikasi identitas pelaku sungguhan lewat token JWT-nya sendiri
-- SEBELUM memanggil salah satu fungsi ini.
-- =====================================================================

-- ---------------------------------------------------------------------
-- fn_periksa_batas_laju — BR-51 ("ditegakkan di dalam basis data, bukan
-- di aplikasi"). jejak_audit sudah mencatat pelaku_id/jenis_tindakan/
-- dibuat_pada untuk setiap panggilan berhasil — dipakai apa adanya
-- sebagai penghitung, tanpa tabel baru.
-- ---------------------------------------------------------------------
create or replace function public.fn_periksa_batas_laju(
  p_pelaku_id uuid,
  p_jenis     public.jenis_tindakan_audit,
  p_batas     integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jumlah integer;
begin
  select count(*) into v_jumlah
    from public.jejak_audit
   where pelaku_id = p_pelaku_id
     and jenis_tindakan = p_jenis
     and waktu > now() - interval '1 hour';

  if v_jumlah >= p_batas then
    raise exception 'BATAS_LAJU: terlalu sering, coba lagi setelah beberapa saat (BR-51)';
  end if;
end;
$$;

revoke execute on function public.fn_periksa_batas_laju(uuid, public.jenis_tindakan_audit, integer)
  from public, authenticated;
grant execute on function public.fn_periksa_batas_laju(uuid, public.jenis_tindakan_audit, integer)
  to service_role;

-- ---------------------------------------------------------------------
-- admin_buat_akun — KP-6.6-01/04/06/07, AM-6.6-03. Baris auth.users
-- SUDAH dibuat Fungsi Tepi lewat Admin API sebelum memanggil ini;
-- fungsi ini HANYA menyisipkan baris public.users yang bersesuaian.
-- Trigger fn_jaga_kolom_users tidak berlaku (itu pemicu BEFORE UPDATE,
-- bukan INSERT) — tidak perlu jalur_resmi di sini.
-- ---------------------------------------------------------------------
create or replace function public.admin_buat_akun(
  p_pelaku_id uuid,
  p_akun_id   uuid,
  p_nama      text,
  p_nrp       text,
  p_email     text,
  p_pangkat   text,
  p_peran     public.peran_pengguna,
  p_unit_id   uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran_pelaku public.peran_pengguna;
begin
  select peran into v_peran_pelaku from public.users where id = p_pelaku_id and aktif = true;

  -- KP-6.6-35: Akun Pemeliharaan SENGAJA tidak termasuk di sini —
  -- kewenangannya terbatas pemulihan akses (reset sandi), bukan
  -- pembuatan akun.
  if v_peran_pelaku is distinct from 'admin' then
    raise exception 'BUKAN_ADMIN: hanya Admin yang dapat membuat akun';
  end if;

  perform public.fn_periksa_batas_laju(p_pelaku_id, 'buat_akun', 20);

  insert into public.users
    (id, nama, nrp, email_sistem, pangkat, peran, unit_id, wajib_ganti_sandi, aktif)
  values
    (p_akun_id, p_nama, p_nrp, p_email, p_pangkat, p_peran, p_unit_id, true, true);

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id, keterangan)
  values
    (p_pelaku_id, v_peran_pelaku, 'buat_akun', 'users', p_akun_id, p_nama);
end;
$$;

revoke execute on function public.admin_buat_akun(
  uuid, uuid, text, text, text, text, public.peran_pengguna, uuid) from public, authenticated;
grant execute on function public.admin_buat_akun(
  uuid, uuid, text, text, text, text, public.peran_pengguna, uuid) to service_role;

-- ---------------------------------------------------------------------
-- admin_nonaktifkan_akun — KP-6.6-15..20, W.3 (docs/01-koreksi.md):
-- HANYA menyetel aktif=false. Penutupan Sesi Tugas dan pemberitahuan
-- Kanit terjadi SENDIRI lewat trigger yang sudah ada
-- (fn_tutup_sesi_akun_nonaktif 0016, fn_notifikasi_akun_nonaktif 0021)
-- — TIDAK diduplikasi di sini. BR-70 ditegakkan trg_jaga_kasubdit_
-- terakhir (0033) otomatis, dari jalur manapun termasuk ini.
-- ---------------------------------------------------------------------
create or replace function public.admin_nonaktifkan_akun(
  p_pelaku_id uuid,
  p_sasaran_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran_pelaku public.peran_pengguna;
begin
  select peran into v_peran_pelaku from public.users where id = p_pelaku_id and aktif = true;

  if v_peran_pelaku is distinct from 'admin' then
    raise exception 'BUKAN_ADMIN: hanya Admin yang dapat menonaktifkan akun';
  end if;

  if not exists (select 1 from public.users where id = p_sasaran_id) then
    raise exception 'SASARAN_TIDAK_DITEMUKAN';
  end if;

  perform set_config('sipantau.jalur_resmi', 'on', true);

  -- BR-70 (trg_jaga_kasubdit_terakhir) menolak di sini sendiri bila ini
  -- Kasubdit aktif terakhir — pesannya menembus apa adanya ke pemanggil.
  update public.users set aktif = false where id = p_sasaran_id;

  delete from public.perangkat_masuk where user_id = p_sasaran_id;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
  values
    (p_pelaku_id, v_peran_pelaku, 'nonaktifkan_akun', 'users', p_sasaran_id);
end;
$$;

revoke execute on function public.admin_nonaktifkan_akun(uuid, uuid) from public, authenticated;
grant execute on function public.admin_nonaktifkan_akun(uuid, uuid) to service_role;

-- ---------------------------------------------------------------------
-- admin_reset_kata_sandi_selesai — Bagian 2.3 docs/10-modul-6.1-auth.md,
-- langkah 9-11. Kata sandi ITU SENDIRI sudah diubah Fungsi Tepi lewat
-- Admin API SEBELUM memanggil ini (BR-76: sandi tidak pernah tercatat
-- di jejak audit, jadi tidak jadi parameter di sini sama sekali).
--
-- Wewenang BR-15: Admin (siapa pun) dan Akun Pemeliharaan (siapa pun,
-- KP-6.6-33) atau Kanit (anggota/panit unitnya sendiri saja).
--
-- KP-6.6-26: berbeda dari akun_dinonaktifkan, TIDAK ADA pemicu yang
-- mengirim 'kata_sandi_direset' secara otomatis (tabel kata sandi
-- disimpan Supabase Auth, di luar jangkauan pemicu pada public.users) —
-- pemberitahuannya disisipkan langsung di sini.
-- ---------------------------------------------------------------------
create or replace function public.admin_reset_kata_sandi_selesai(
  p_pelaku_id  uuid,
  p_sasaran_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran_pelaku  public.peran_pengguna;
  v_unit_pelaku   uuid;
  v_nama_pelaku   text;
  v_peran_sasaran public.peran_pengguna;
  v_unit_sasaran  uuid;
begin
  select peran, unit_id, nama into v_peran_pelaku, v_unit_pelaku, v_nama_pelaku
    from public.users where id = p_pelaku_id and aktif = true;

  if v_peran_pelaku is null then
    raise exception 'PELAKU_TIDAK_AKTIF';
  end if;

  select peran, unit_id into v_peran_sasaran, v_unit_sasaran
    from public.users where id = p_sasaran_id;

  if v_peran_sasaran is null then
    raise exception 'SASARAN_TIDAK_DITEMUKAN';
  end if;

  if v_peran_pelaku in ('admin', 'pemeliharaan') then
    null; -- diizinkan untuk sasaran mana pun (BR-15)
  elsif v_peran_pelaku = 'kanit'
        and v_peran_sasaran in ('anggota', 'panit')
        and v_unit_sasaran = v_unit_pelaku then
    null; -- diizinkan, unit sendiri saja
  else
    raise exception 'TIDAK_BERWENANG: tidak berhak mereset kata sandi akun ini';
  end if;

  perform public.fn_periksa_batas_laju(p_pelaku_id, 'reset_sandi', 10);

  perform set_config('sipantau.jalur_resmi', 'on', true);

  update public.users set wajib_ganti_sandi = true where id = p_sasaran_id;

  delete from public.perangkat_masuk where user_id = p_sasaran_id;

  insert into public.jejak_audit
    (pelaku_id, peran_pelaku, jenis_tindakan, sasaran_tabel, sasaran_id)
  values
    (p_pelaku_id, v_peran_pelaku, 'reset_sandi', 'users', p_sasaran_id);

  perform public.fn_buat_notifikasi(
    'kata_sandi_direset', array[p_sasaran_id], 'Kata sandi Anda direset',
    'Direset oleh ' || coalesce(v_nama_pelaku, 'pengelola akun'),
    'akun', p_sasaran_id, null, null, true, p_pelaku_id
  );
end;
$$;

revoke execute on function public.admin_reset_kata_sandi_selesai(uuid, uuid) from public, authenticated;
grant execute on function public.admin_reset_kata_sandi_selesai(uuid, uuid) to service_role;
