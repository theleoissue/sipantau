-- =====================================================================
-- 0067 — Usulan SPRIN naik ke pimpinan; SPRIN yang sudah jadi turun lewat scan
--
-- APA YANG BERUBAH
--
-- Sampai 0063, usulan yang disetujui Kanit langsung mengisi wizard
-- terbitkan: Kanit menyetujui, lalu menerbitkan SPT dari ISI USULAN itu
-- sendiri. Padahal usulan hanyalah permintaan dari bawah. Surat
-- perintahnya ditandatangani pimpinan di luar SiPANTAU, dan isinya —
-- nomor, dasar, susunan tim, tanggal — bisa berbeda dari yang diusulkan.
-- SPT yang diterbitkan dari usulan membawa isi yang belum pernah
-- disahkan siapa pun.
--
-- KEPUTUSAN PEMILIK PRODUK, 13 September 2026
--
--   Alur     : usulan yang disetujui Kanit NAIK ke pimpinan. SPRIN yang
--              sudah ditandatangani TURUN kembali sebagai scan, dan scan
--              itulah yang dijadikan penugasan.
--   Pemindai : Kanit, Panit, atau Anggota, dengan aturan scan yang sudah
--              berlaku. Pindaian Panit/Anggota menunggu persetujuan Kanit;
--              pindaian Kanit langsung disetujui, sama seperti selama ini
--              Kanit memindai langsung di wizard tanpa persetujuan siapa pun.
--
-- PRD tidak mengenal peran di atas Kasubdit dan tidak menyebut
-- penandatangan. Karena itu "pimpinan" TIDAK dijadikan peran baru:
-- penandatanganannya terjadi di luar SiPANTAU, dan yang masuk kembali
-- hanyalah hasilnya — dokumen yang dipindai.
--
-- SIAPA DI ANTARA PANIT DAN ANGGOTA
--
-- Hanya pengusulnya. Aturan akses baris pengajuan_sprin membatasi Panit
-- dan Anggota pada ajuan miliknya sendiri, jadi Anggota lain memang tidak
-- dapat melihat usulan itu untuk memilihnya. Melonggarkan RLS hanya demi
-- fitur ini tidak sepadan. Kanit unit yang sama selalu dapat memindainya.
--
-- DUA KOLOM, DAN KENAPA DUA
--
--   usulan_id      pada baris scan   : scan ini SPRIN untuk usulan mana.
--   sprin_turun_id pada baris usulan : SPRIN mana yang sudah turun.
--
-- Kolom kedua tampak berlebihan, tetapi tanpanya pengusul tidak pernah
-- tahu SPRIN-nya sudah turun bila yang memindai Kanit: baris scan itu
-- milik Kanit, dan RLS tidak mengizinkan pengusul membacanya. Yang dapat
-- ia baca hanyalah usulannya sendiri — maka keterangan itu ditaruh di sana.
--
-- Tidak ada grant baru. Tabelnya sudah ber-grant select (0054/0055),
-- kolom baru ikut tercakup, dan seluruh penulisan tetap lewat fungsi
-- security definer. Wizard terbitkan tidak lagi menerima usulan sebagai
-- isian awal; itu ditegakkan di halaman buat (asal = 'scan'). BR-11
-- tetap: menerbitkan SPT sepenuhnya wewenang Kanit.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Nilai enum audit. Pola 0053/0063: nilai enum baru tidak boleh DIPAKAI
-- pada transaksi yang sama dengan pembuatannya. Di sini ia hanya muncul
-- di dalam badan fungsi, yang dijalankan pada transaksi lain.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                  where t.typname = 'jenis_tindakan_audit' and e.enumlabel = 'tautkan_sprin_turun') then
    alter type public.jenis_tindakan_audit add value 'tautkan_sprin_turun';
  end if;
end $$;

alter table public.pengajuan_sprin
  add column if not exists usulan_id uuid references public.pengajuan_sprin (id);
alter table public.pengajuan_sprin
  add column if not exists sprin_turun_id uuid references public.pengajuan_sprin (id);

alter table public.pengajuan_sprin drop constraint if exists chk_pengajuan_usulan_hanya_scan;
alter table public.pengajuan_sprin add constraint chk_pengajuan_usulan_hanya_scan
  check (usulan_id is null or asal = 'scan');

alter table public.pengajuan_sprin drop constraint if exists chk_pengajuan_turun_hanya_usulan;
alter table public.pengajuan_sprin add constraint chk_pengajuan_turun_hanya_usulan
  check (sprin_turun_id is null or asal = 'usulan');

create index if not exists idx_pengajuan_sprin_usulan
  on public.pengajuan_sprin (usulan_id) where usulan_id is not null;

comment on column public.pengajuan_sprin.usulan_id is
  'Hanya pada asal=scan: usulan yang dipenuhi SPRIN ini (0067). NULL = scan biasa, bukan SPRIN yang turun untuk usulan.';
comment on column public.pengajuan_sprin.sprin_turun_id is
  'Hanya pada asal=usulan: scan SPRIN terakhir yang ditautkan (0067). Disimpan di usulan supaya pengusul tetap tahu SPRIN-nya sudah turun walau yang memindai Kanit — baris scan itu tidak terbaca pengusul lewat RLS.';

-- ---------------------------------------------------------------------
-- ajukan_sprin_turun — memindai SPRIN yang sudah ditandatangani untuk
-- sebuah usulan yang sudah disetujui.
-- ---------------------------------------------------------------------
create or replace function public.ajukan_sprin_turun(p_usulan_id uuid, p_data jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pelaku record;
  v_usulan record;
  v_turun  text;
  v_id     uuid;
  v_kanit  boolean;
  v_judul  text;
  v_tujuan public.jenis_tujuan_notifikasi;
begin
  select id, peran, unit_id, nama into v_pelaku
    from public.users
   where id = (select auth.uid()) and aktif
     and peran in ('kanit', 'panit', 'anggota');
  if not found then
    raise exception 'BUKAN_PENAUT: hanya Kanit, Panit, atau Anggota aktif yang dapat memindai SPRIN';
  end if;

  -- FOR UPDATE: dua orang yang memindai SPRIN yang sama hampir bersamaan
  -- tidak boleh sama-sama lolos penjaga SPRIN_SUDAH_TURUN di bawah.
  select * into v_usulan from public.pengajuan_sprin
   where id = p_usulan_id
   for update;
  if not found then
    raise exception 'USULAN_TIDAK_DITEMUKAN: usulan tidak ditemukan pada unit Anda';
  end if;
  if v_usulan.asal <> 'usulan' or v_usulan.unit_id <> v_pelaku.unit_id then
    raise exception 'USULAN_TIDAK_DITEMUKAN: usulan tidak ditemukan pada unit Anda';
  end if;

  if v_usulan.status <> 'disetujui' then
    raise exception 'USULAN_BELUM_DISETUJUI: SPRIN hanya dapat ditautkan ke usulan yang sudah disetujui Kanit';
  end if;

  v_kanit := v_pelaku.peran = 'kanit';
  if not v_kanit and v_usulan.diajukan_oleh <> v_pelaku.id then
    raise exception 'BUKAN_PENAUT: hanya pengusul atau Kanit unit ini yang dapat memindai SPRIN untuk usulan ini';
  end if;

  -- Pindaian yang ditolak atau ditarik membebaskan usulannya lagi.
  -- Yang masih menunggu, sedang diperbaiki, atau sudah disetujui tidak.
  if v_usulan.sprin_turun_id is not null then
    select status into v_turun from public.pengajuan_sprin where id = v_usulan.sprin_turun_id;
    if v_turun in ('diajukan', 'perlu_perbaikan', 'disetujui') then
      raise exception 'SPRIN_SUDAH_TURUN: SPRIN untuk usulan ini sudah dipindai';
    end if;
  end if;

  if v_kanit then
    insert into public.pengajuan_sprin
      (unit_id, diajukan_oleh, data_scan, asal, usulan_id, status, ditinjau_oleh, ditinjau_pada)
    values
      (v_usulan.unit_id, v_pelaku.id, p_data, 'scan', v_usulan.id, 'disetujui', v_pelaku.id, now())
    returning id into v_id;
  else
    insert into public.pengajuan_sprin (unit_id, diajukan_oleh, data_scan, asal, usulan_id)
    values (v_usulan.unit_id, v_pelaku.id, p_data, 'scan', v_usulan.id)
    returning id into v_id;
  end if;

  update public.pengajuan_sprin set sprin_turun_id = v_id where id = v_usulan.id;

  perform public.catat_jejak_audit('tautkan_sprin_turun', 'pengajuan_sprin', v_id);

  v_judul := coalesce(nullif(btrim(v_usulan.data_scan->>'judul'), ''), 'tanpa judul');

  if v_kanit then
    -- Tujuan kosong dengan sengaja: baris scan milik Kanit tidak terbaca
    -- pengusul, jadi tautan ke sana hanya membuka halaman kosong.
    v_tujuan := 'tanpa_tujuan';
    perform public.fn_buat_notifikasi(
      p_jenis        => 'sprin_diputuskan',
      p_penerima     => array[v_usulan.diajukan_oleh],
      p_judul        => 'SPRIN untuk usulan Anda sudah turun',
      p_isi          => 'SPRIN yang ditandatangani pimpinan untuk usulan "' || v_judul
                        || '" sudah dipindai Kanit dan siap dijadikan penugasan.',
      p_tujuan_jenis => v_tujuan,
      p_tujuan_id    => null,
      p_pelaku       => v_pelaku.id
    );
  else
    v_tujuan := 'pengajuan_sprin';
    perform public.fn_buat_notifikasi(
      p_jenis        => 'sprin_diajukan',
      p_penerima     => public.penerima_kanit_unit(v_usulan.unit_id),
      p_judul        => 'SPRIN hasil usulan sudah turun',
      p_isi          => coalesce(v_pelaku.nama, 'Anggota') || ' memindai SPRIN yang sudah ditandatangani untuk usulan "'
                        || v_judul || '". Periksa sebelum dijadikan penugasan.',
      p_tujuan_jenis => v_tujuan,
      p_tujuan_id    => v_id,
      p_pelaku       => v_pelaku.id
    );
  end if;

  return v_id;
end
$$;

revoke all on function public.ajukan_sprin_turun(uuid, jsonb) from public;
grant execute on function public.ajukan_sprin_turun(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- putuskan_pengajuan_sprin — ditulis ulang utuh dari 0063. Yang berubah
-- HANYA kalimat persetujuan usulan: pengusul perlu tahu usulannya naik ke
-- pimpinan dan apa yang harus dilakukan sesudah SPRIN turun. Kalimat
-- lama ("Kanit menyetujui usulan sprin yang Anda ajukan") membuatnya
-- menunggu penugasan yang tidak akan pernah terbit dari usulan itu.
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
  v_asal text; v_sebutan text; v_menu text;
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
  returning q.diajukan_oleh, q.asal into v_pengaju, v_asal;

  if not found then raise exception 'BUKAN_KANIT_ATAU_TIDAK_DITEMUKAN'; end if;

  perform public.catat_jejak_audit('putuskan_pengajuan_sprin', 'pengajuan_sprin', p_id);

  -- Pengaju scan diminta mengirim ulang hasil pembacaannya; pengusul
  -- diminta memperbaiki usulannya. Mengarahkan keduanya ke menu yang
  -- sama membuat separuhnya membuka layar yang keliru.
  if v_asal = 'usulan' then
    v_sebutan := 'Usulan SPRIN';
    v_menu    := 'Buka menu Usulan SPRIN untuk mengirim ulang.';
  else
    v_sebutan := 'Scan SPRIN';
    v_menu    := 'Buka menu Scan SPRIN untuk mengirim ulang.';
  end if;

  if p_status = 'disetujui' then
    v_judul := v_sebutan || ' Anda disetujui';
    if v_asal = 'usulan' then
      v_isi := 'Kanit menyetujui usulan Anda dan meneruskannya ke pimpinan untuk ditandatangani. '
               || 'Setelah SPRIN turun, pindai lewat menu Usulan SPRIN supaya tertaut ke usulan ini.';
    else
      v_isi := 'Kanit menyetujui ' || lower(v_sebutan) || ' yang Anda ajukan.';
    end if;
  elsif p_status = 'ditolak' then
    v_judul := v_sebutan || ' Anda ditolak';
    v_isi   := 'Kanit menolak ' || lower(v_sebutan) || ' yang Anda ajukan.';
  else
    v_judul := v_sebutan || ' perlu diperbaiki';
    v_isi   := 'Kanit meminta perbaikan: ' || coalesce(nullif(trim(p_catatan), ''), '(tanpa catatan)')
               || '. ' || v_menu;
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

revoke all on function public.putuskan_pengajuan_sprin(uuid, text, text) from public;
grant execute on function public.putuskan_pengajuan_sprin(uuid, text, text) to authenticated;
