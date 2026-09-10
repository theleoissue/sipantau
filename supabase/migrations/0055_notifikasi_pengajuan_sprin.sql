-- =====================================================================
-- 0055 — Ajuan scan SPRIN sampai ke Kanit
--
-- Tiga celah yang ditemukan saat pemeriksaan 10 September 2026, semuanya
-- membuat ajuan bawahan berhenti tanpa satu pun galat:
--
-- 1. grant select pada pengajuan_sprin (0054). Diulang di sini apa adanya
--    supaya berkas ini cukup dijalankan sendirian bila 0054 belum sempat
--    dijalankan di basis data. grant bersifat idempoten.
--
-- 2. ajukan_scan_sprin dan kirim_ulang_scan_sprin (0053) TIDAK pernah
--    memanggil fn_buat_notifikasi. Barisnya tersimpan, jejak audit
--    tercatat, tetapi Kanit tidak diberi tahu apa pun — lonceng tidak
--    berbunyi dan tidak ada yang menandai. Bandingkan finalkan_lhp (0030)
--    yang sejak awal memberitahu Panit dan Kanit.
--
-- 3. putuskan_pengajuan_sprin juga diam. Pengaju tidak pernah tahu
--    ajuannya disetujui, ditolak, atau diminta diperbaiki — padahal
--    status 'perlu_perbaikan' menuntut dia mengirim ulang.
--
-- BR-74 tetap dihormati: pelaku tindakan tidak menerima pemberitahuan
-- atas perbuatannya sendiri (parameter p_pelaku).
-- =====================================================================

grant select on public.pengajuan_sprin to authenticated;

-- ---------------------------------------------------------------------
-- Daftar tertutup jenis notifikasi. Ditulis LENGKAP dengan seluruh nilai
-- lama (0029) ditambah dua yang baru — mengganti daftar dengan versi
-- yang lebih pendek akan melenyapkan nilai lain tanpa galat (CLAUDE.md
-- §11, sudah pernah terjadi).
-- ---------------------------------------------------------------------
alter table public.notifikasi drop constraint if exists chk_notifikasi_jenis;
alter table public.notifikasi add constraint chk_notifikasi_jenis check (jenis in (
  'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
  'spt_dicabut', 'spt_ditutup',
  'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
  'laporan_perlu_diperbaiki', 'laporan_disetujui',
  'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
  'akun_dinonaktifkan', 'kata_sandi_direset',
  'lhp_difinalkan',
  'sprin_diajukan', 'sprin_diputuskan'
));

-- Tujuan baru supaya notifikasi Kanit dapat disentuh langsung menuju
-- kotak persetujuan. Nilai enum baru tidak boleh DIPAKAI pada transaksi
-- yang sama dengan pembuatannya; di sini ia hanya muncul di dalam badan
-- fungsi, yang baru dijalankan pada transaksi lain, jadi aman.
alter type public.jenis_tujuan_notifikasi add value if not exists 'pengajuan_sprin';

-- ---------------------------------------------------------------------
-- Kanit aktif pada satu unit. Dipisah menjadi fungsi sendiri mengikuti
-- pola penerima_pengawas_spt (0020) — bukan disalin ke tiga tempat.
-- ---------------------------------------------------------------------
create or replace function public.penerima_kanit_unit(p_unit_id uuid)
returns uuid[]
language sql
security definer
set search_path = ''
as $$
  select coalesce(array_agg(u.id), array[]::uuid[])
    from public.users u
   where u.peran = 'kanit' and u.aktif and u.unit_id = p_unit_id;
$$;

-- ---------------------------------------------------------------------
-- ajukan_scan_sprin — sama seperti 0053, ditambah pemberitahuan ke Kanit.
-- ---------------------------------------------------------------------
create or replace function public.ajukan_scan_sprin(p_data jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid; v_unit uuid; v_nama text; v_tujuan public.jenis_tujuan_notifikasi;
begin
  select unit_id, nama into v_unit, v_nama
    from public.users
   where id = (select auth.uid()) and aktif and peran in ('anggota', 'panit');
  if v_unit is null then raise exception 'BUKAN_PENGAJU'; end if;

  insert into public.pengajuan_sprin (unit_id, diajukan_oleh, data_scan)
  values (v_unit, (select auth.uid()), p_data)
  returning id into v_id;

  perform public.catat_jejak_audit('ajukan_scan_sprin', 'pengajuan_sprin', v_id);

  v_tujuan := 'pengajuan_sprin';
  perform public.fn_buat_notifikasi(
    p_jenis        => 'sprin_diajukan',
    p_penerima     => public.penerima_kanit_unit(v_unit),
    p_judul        => 'Hasil scan SPRIN menunggu persetujuan',
    p_isi          => coalesce(v_nama, 'Anggota') || ' mengirim hasil scan SPRIN untuk ditinjau.',
    p_tujuan_jenis => v_tujuan,
    p_tujuan_id    => v_id,
    p_pelaku       => (select auth.uid())
  );
  return v_id;
end
$$;

-- ---------------------------------------------------------------------
-- kirim_ulang_scan_sprin — perbaikan yang dikirim ulang juga memanggil
-- perhatian Kanit; tanpa ini perbaikan pengaju ikut menghilang.
-- ---------------------------------------------------------------------
create or replace function public.kirim_ulang_scan_sprin(p_id uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid; v_nama text; v_tujuan public.jenis_tujuan_notifikasi;
begin
  update public.pengajuan_sprin q
     set data_scan = p_data, status = 'diajukan', catatan_kanit = null,
         ditinjau_oleh = null, ditinjau_pada = null, dibuat_pada = now()
   where q.id = p_id
     and q.diajukan_oleh = (select auth.uid())
     and q.status = 'perlu_perbaikan'
  returning q.unit_id into v_unit;

  if not found then raise exception 'PENGAJUAN_TIDAK_DAPAT_DIKIRIM_ULANG'; end if;

  perform public.catat_jejak_audit('kirim_ulang_scan_sprin', 'pengajuan_sprin', p_id);

  select nama into v_nama from public.users where id = (select auth.uid());
  v_tujuan := 'pengajuan_sprin';
  perform public.fn_buat_notifikasi(
    p_jenis        => 'sprin_diajukan',
    p_penerima     => public.penerima_kanit_unit(v_unit),
    p_judul        => 'Perbaikan scan SPRIN dikirim ulang',
    p_isi          => coalesce(v_nama, 'Anggota') || ' mengirim ulang hasil scan SPRIN yang Anda minta diperbaiki.',
    p_tujuan_jenis => v_tujuan,
    p_tujuan_id    => p_id,
    p_pelaku       => (select auth.uid())
  );
end
$$;

-- ---------------------------------------------------------------------
-- putuskan_pengajuan_sprin — keputusan Kanit dikabarkan balik ke pengaju.
-- Tanpa tujuan sentuh: kotak persetujuan hanya boleh dibuka Kanit, dan
-- pengaju cukup diarahkan kalimatnya ke menu Scan SPRIN miliknya sendiri.
-- ---------------------------------------------------------------------
create or replace function public.putuskan_pengajuan_sprin(
  p_id uuid, p_status text, p_catatan text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pengaju uuid; v_judul text; v_isi text; v_tanpa public.jenis_tujuan_notifikasi;
begin
  if p_status = 'perlu_perbaikan' and nullif(trim(p_catatan), '') is null then
    raise exception 'CATATAN_PERBAIKAN_WAJIB';
  end if;

  update public.pengajuan_sprin q
     set status = p_status, catatan_kanit = nullif(trim(p_catatan), ''),
         ditinjau_oleh = (select auth.uid()), ditinjau_pada = now()
   where q.id = p_id
     and p_status in ('perlu_perbaikan', 'disetujui', 'ditolak')
     and q.status in ('diajukan', 'perlu_perbaikan')
     and exists (
       select 1 from public.users u
        where u.id = (select auth.uid()) and u.peran = 'kanit' and u.unit_id = q.unit_id
     )
  returning q.diajukan_oleh into v_pengaju;

  if not found then raise exception 'BUKAN_KANIT_ATAU_TIDAK_DITEMUKAN'; end if;

  perform public.catat_jejak_audit('putuskan_pengajuan_sprin', 'pengajuan_sprin', p_id);

  if p_status = 'disetujui' then
    v_judul := 'Scan SPRIN Anda disetujui';
    v_isi   := 'Kanit menyetujui hasil scan SPRIN yang Anda ajukan.';
  elsif p_status = 'ditolak' then
    v_judul := 'Scan SPRIN Anda ditolak';
    v_isi   := 'Kanit menolak hasil scan SPRIN yang Anda ajukan.';
  else
    v_judul := 'Scan SPRIN perlu diperbaiki';
    v_isi   := 'Kanit meminta perbaikan: ' || coalesce(nullif(trim(p_catatan), ''), '(tanpa catatan)')
               || '. Buka menu Scan SPRIN untuk mengirim ulang.';
  end if;

  v_tanpa := 'tanpa_tujuan';
  perform public.fn_buat_notifikasi(
    p_jenis        => 'sprin_diputuskan',
    p_penerima     => array[v_pengaju],
    p_judul        => v_judul,
    p_isi          => v_isi,
    p_tujuan_jenis => v_tanpa,
    p_tujuan_id    => null,
    p_pelaku       => (select auth.uid())
  );
end
$$;

revoke all on function public.penerima_kanit_unit(uuid) from public;
grant execute on function public.penerima_kanit_unit(uuid) to authenticated;
