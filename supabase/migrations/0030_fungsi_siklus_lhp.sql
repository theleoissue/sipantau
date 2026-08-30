-- =====================================================================
-- 0030 — Fungsi siklus Modul 6.8 (LHP Ringkas)
-- Sumber: docs/00-fondasi.md §6.8
--
-- Pola diikuti persis dari 0011 (setujui_laporan/tarik_laporan) dan
-- 0025 (fungsi siklus SPT): tiap transisi fungsi sendiri, security
-- definer, memeriksa wewenangnya sendiri, mencatat jejak audit di
-- transaksi yang sama.
-- =====================================================================

-- ---------------------------------------------------------------------
-- mulai_lhp — membuat draf. HANYA pelaksana aktif SPT itu (BR-04 tidak
-- langsung berlaku di sini, tapi "Menyusun LHP Ringkas: Anggota saja"
-- pada RBAC fondasi.md baris 341 yang menegakkan).
--
-- p_dasar/p_waktu_kegiatan/p_tempat_kegiatan diterima sebagai teks
-- SUDAH terformat dari pemanggil (Server Action) — lihat catatan di
-- 0027. Semuanya boleh null bila sumbernya tidak tersedia (fondasi.md
-- §8.7: "Data pengisian otomatis tidak tersedia, misalnya Sesi Tugas
-- tidak pernah dibuka" — bukan galat, kolom cukup kosong untuk diisi
-- manual).
-- ---------------------------------------------------------------------
create or replace function public.mulai_lhp(
  p_penugasan_id    uuid,
  p_dasar           text default null,
  p_waktu_kegiatan  text default null,
  p_tempat_kegiatan text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lhp_id uuid;
begin
  if (select sipantau_auth.peran_saya()) <> 'anggota' then
    raise exception 'BUKAN_ANGGOTA: hanya Anggota yang dapat menyusun LHP Ringkas';
  end if;

  if not exists (
    select 1 from public.penugasan_pelaksana
     where penugasan_id = p_penugasan_id
       and pelaksana_id = (select auth.uid())
       and dicabut_pada is null
  ) then
    raise exception 'BUKAN_PELAKSANA: Anda bukan pelaksana aktif pada penugasan ini';
  end if;

  insert into public.lhp
    (penugasan_id, disusun_oleh, dasar, waktu_kegiatan, tempat_kegiatan)
  values
    (p_penugasan_id, (select auth.uid()), p_dasar, p_waktu_kegiatan, p_tempat_kegiatan)
  returning id into v_lhp_id;

  -- Daftar petugas terisi otomatis: Panit lebih dulu, lalu pelaksana
  -- (fondasi.md: "Daftar petugas, diambil dari Anggota pada SPT",
  -- "masih dapat disunting" — bukan dikunci di sini).
  insert into public.lhp_petugas (lhp_id, petugas_id, urutan)
  select v_lhp_id, panit_id, row_number() over (order by ditunjuk_pada)
    from public.penugasan_panit
   where penugasan_id = p_penugasan_id
     and dicabut_pada is null;

  insert into public.lhp_petugas (lhp_id, petugas_id, urutan)
  select v_lhp_id, pelaksana_id,
         (select coalesce(max(urutan), 0) from public.lhp_petugas where lhp_id = v_lhp_id)
           + row_number() over (order by urutan)
    from public.penugasan_pelaksana
   where penugasan_id = p_penugasan_id
     and dicabut_pada is null;

  perform public.catat_jejak_audit('mulai_lhp', 'lhp', v_lhp_id);

  return v_lhp_id;
end;
$$;

revoke execute on function public.mulai_lhp(uuid, text, text, text) from public;
grant execute on function public.mulai_lhp(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- finalkan_lhp — mengunci draf dan memberitahu Panit+Kanit unit terkait
-- (fondasi.md §6.9 baris 1205). Memakai kembali penerima_pengawas_spt
-- (0020, Panit+Kanit — fungsi yang sama dipakai laporan_harian), bukan
-- fungsi baru.
--
-- tujuan_jenis='lhp' dan tujuan_id=v_lhp_id (bukan penugasan_id) supaya
-- Fase 2 dapat menaut notifikasi langsung ke /lhp/{id}; penugasan_id
-- tetap disertakan sebagai penanda SPT terkait untuk penyaringan umum.
-- ---------------------------------------------------------------------
create or replace function public.finalkan_lhp(p_lhp_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penugasan_id uuid;
begin
  select penugasan_id into v_penugasan_id
    from public.lhp
   where id = p_lhp_id
     and disusun_oleh = (select auth.uid())
     and status = 'draf';

  if not found then
    raise exception 'TIDAK_DAPAT_DIFINALKAN: LHP tidak ditemukan, bukan milik Anda, atau sudah final';
  end if;

  update public.lhp set status = 'final' where id = p_lhp_id;

  perform public.catat_jejak_audit('finalkan_lhp', 'lhp', p_lhp_id);

  perform public.fn_buat_notifikasi(
    p_jenis        => 'lhp_difinalkan',
    p_penerima     => public.penerima_pengawas_spt(v_penugasan_id),
    p_judul        => 'LHP Ringkas difinalkan',
    p_isi          => 'Sebuah LHP Ringkas baru saja difinalkan dan siap ditinjau.',
    p_tujuan_jenis => 'lhp',
    p_tujuan_id    => p_lhp_id,
    p_penugasan_id => v_penugasan_id,
    p_pelaku       => (select auth.uid())
  );
end;
$$;

revoke execute on function public.finalkan_lhp(uuid) from public;
grant execute on function public.finalkan_lhp(uuid) to authenticated;
