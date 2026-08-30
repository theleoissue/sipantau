-- =====================================================================
-- 0031 — Mengizinkan Sesi Tugas dibuka dari bentuk web (override BR-65)
-- =====================================================================
--
-- BR-65 (docs/40-modul-6.4-gps.md baris 449-469) SENGAJA melarang ini,
-- dua lapis: tombol disembunyikan di antarmuka, DAN fungsi ini menolak
-- penanda perangkat berawalan 'web-' tanpa kecuali. Alasannya tertulis
-- eksplisit di dokumen sumber: pelacakan lewat peramban berhenti diam-
-- diam begitu layar terkunci (tidak ada layanan latar depan), dan Kanit
-- bisa salah menyimpulkan Anggotanya kabur — "jenis kekeliruan yang
-- paling merusak kepercayaan", bertentangan dengan Prinsip 0.6.
--
-- Migrasi ini mencabut lapis kedua atas PERMINTAAN EKSPLISIT pemilik
-- produk, sesudah risiko di atas disampaikan lengkap dan dipahami —
-- bukan tebakan, bukan default. Dipakai untuk uji coba/demo, BUKAN
-- pengganti Langkah 4 (Bangun APK Android) yang tetap tertunda.
--
-- Penanda 'web-' TETAP dipertahankan pada baris yang tersimpan (tidak
-- diseragamkan dengan Android) — kelak berguna membedakan sumber sesi
-- tanpa perlu migrasi baru lagi.
-- =====================================================================

create or replace function public.buka_sesi_tugas(
  p_penugasan_id      uuid,
  p_lat               numeric,
  p_lng               numeric,
  p_akurasi_meter     numeric,
  p_penanda_perangkat text
)
returns public.sesi_tugas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pengguna   uuid := (select auth.uid());
  v_peran      text := (select sipantau_auth.peran_saya());
  v_pelaksana  record;
  v_lama       record;
  v_baru       public.sesi_tugas;
  v_status     public.status_spt;
begin
  if v_pengguna is null then
    raise exception 'TANPA_SESI';
  end if;

  -- BR-17 / KP-6.4-54: Akun Pemeliharaan tidak dapat membuka Sesi Tugas.
  if v_peran is null or v_peran = 'pemeliharaan' then
    raise exception 'PERAN_TIDAK_BERHAK: Akun ini tidak dapat membuka Sesi Tugas';
  end if;

  -- BR-65 lapis kedua DICABUT di sini (lihat catatan berkas di atas).
  -- Satu-satunya syarat yang tersisa: penanda tidak boleh kosong.
  if p_penanda_perangkat is null or length(trim(p_penanda_perangkat)) = 0 then
    raise exception 'PENANDA_PERANGKAT_KOSONG';
  end if;

  select status into v_status from public.penugasan where id = p_penugasan_id;
  if not found then
    raise exception 'SPT_TIDAK_DITEMUKAN';
  end if;
  if v_status not in ('baru', 'berjalan', 'bermasalah') then
    raise exception 'SPT_TIDAK_MENERIMA: SPT ini tidak sedang berjalan';
  end if;

  select * into v_pelaksana
    from public.penugasan_pelaksana
   where penugasan_id = p_penugasan_id and pelaksana_id = v_pengguna
   for update;

  if not found or v_pelaksana.dicabut_pada is not null then
    raise exception 'BUKAN_PELAKSANA: Anda bukan pelaksana aktif pada SPT ini';
  end if;

  select * into v_lama
    from public.sesi_tugas
   where pengguna_id = v_pengguna and ditutup_pada is null
   for update;

  if found then
    if coalesce(v_lama.titik_terakhir_pada, v_lama.dibuka_pada) < now() - interval '2 hours' then
      perform public.fn_tutup_sesi_tugas(v_lama.id, 'menggantung', null);
    else
      raise exception 'SESI_BERJALAN: Anda masih dalam Sesi Tugas untuk penugasan %, dibuka %',
        v_lama.penugasan_id, v_lama.dibuka_pada;
    end if;
  end if;

  insert into public.sesi_tugas
    (penugasan_id, pengguna_id, penanda_perangkat, jumlah_titik)
  values
    (p_penugasan_id, v_pengguna, p_penanda_perangkat, 0)
  returning * into v_baru;

  perform public.fn_catat_titik(
    p_sesi_id           => v_baru.id,
    p_lat               => p_lat,
    p_lng               => p_lng,
    p_akurasi_meter     => p_akurasi_meter,
    p_kecepatan_mps     => null,
    p_arah_derajat      => null,
    p_baterai_persen    => null,
    p_sumber_lokasi     => 'gps',
    p_antrean_id        => gen_random_uuid(),
    p_direkam_pada      => now(),
    p_penanda_perangkat => p_penanda_perangkat,
    p_penanda_perangkat_asal => p_penanda_perangkat,
    p_lokasi_tiruan     => false
  );

  perform public.catat_jejak_audit('buka_sesi_tugas', 'sesi_tugas', v_baru.id);

  select * into v_baru from public.sesi_tugas where id = v_baru.id;
  return v_baru;
end;
$$;

revoke execute on function public.buka_sesi_tugas(uuid, numeric, numeric, numeric, text) from public;
grant execute on function public.buka_sesi_tugas(uuid, numeric, numeric, numeric, text) to authenticated;
