-- =====================================================================
-- 0025 — Fungsi tindakan siklus hidup SPT
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 4 (6.2.3), KP-6.2-61
-- =====================================================================
--
-- Pola yang dipakai konsisten dengan setujui_laporan/tarik_laporan
-- (Modul 6.3) dan buka_sesi_tugas (Modul 6.4): satu fungsi per
-- tindakan, security definer, memeriksa kewenangannya sendiri, mencatat
-- jejak audit dalam transaksi yang sama. Klien TIDAK PERNAH melakukan
-- UPDATE mentah untuk tindakan-tindakan ini — konsisten, bukan karena
-- RLS tidak mengizinkannya (penugasan_ubah_kanit di 0008 sebenarnya
-- cukup longgar), tetapi karena satu titik penegakan lebih aman
-- daripada mengandalkan setiap Server Action mengingat sendiri jejak
-- audit dan pemberitahuan mana yang wajib menyertainya.
--
-- CATATAN LINGKUP (dilaporkan, bukan ditebak — docs/CLAUDE.md §12):
-- BR-68 menyatakan jenis notifikasi adalah daftar TERTUTUP enam belas
-- nilai. KP-6.2-50 (buka kembali) dan bagian pencabutan Panit menuntut
-- pemberitahuan, tetapi TIDAK ADA jenis yang cocok pada daftar tertutup
-- itu (spt_ditutup dipakai untuk selesai/dibatalkan, bukan pembukaan
-- kembali). Menambah nilai ketujuh belas secara sepihak di sini
-- melanggar BR-68 sendiri ("penambahan wajib lewat revisi PRD
-- tercatat"). Kedua tindakan itu TETAP tercatat penuh pada jejak audit
-- (buka_kembali_spt, cabut_panit) tetapi SENGAJA TIDAK mengirim
-- pemberitahuan sampai ada revisi PRD yang menambah jenisnya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- terbitkan_draf — mempublikasikan draf yang sudah tersimpan.
-- Empat syarat minimum ditegakkan trg_periksa_syarat_terbit (0024),
-- bukan diulang di sini.
-- ---------------------------------------------------------------------
create or replace function public.terbitkan_draf(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menerbitkan penugasan';
  end if;

  update public.penugasan
     set status = 'baru', diterbitkan_pada = now()
   where id = p_id and unit_id = v_unit and status = 'draf';

  if not found then
    raise exception 'TIDAK_DITEMUKAN: draf tidak ditemukan atau bukan milik unit Anda';
  end if;

  perform public.catat_jejak_audit('terbit_spt', 'penugasan', p_id);
end;
$$;

revoke execute on function public.terbitkan_draf(uuid) from public;
grant execute on function public.terbitkan_draf(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- tandai_spt_bermasalah — KP-6.2-32: pelaksana ATAU Panit Penanggung
-- Jawab aktif, bukan hanya Kanit.
--
-- EC-6.2 "dua orang menandai bermasalah hampir bersamaan": penandaan
-- PERTAMA yang menetapkan status dan jenis/uraiannya; yang berikutnya
-- (SPT sudah bermasalah) tidak ditolak dan tidak menimpa jenis/uraian
-- yang sudah tercatat — hanya menambah pemberitahuan susulan berisi
-- keterangan tambahannya, sejalan "tetap tersimpan sebagai catatan
-- tambahan, tidak ditolak".
-- ---------------------------------------------------------------------
create or replace function public.tandai_spt_bermasalah(
  p_id uuid,
  p_jenis_masalah public.jenis_masalah_spt,
  p_uraian text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pengguna uuid := (select auth.uid());
  v_status   public.status_spt;
  v_unit     uuid;
  v_nomor    text;
  v_judul    text;
  v_penerima uuid[];
begin
  if length(trim(coalesce(p_uraian, ''))) = 0 then
    raise exception 'URAIAN_WAJIB: uraian masalah wajib diisi';
  end if;

  if not (
    exists (select 1 from public.penugasan_pelaksana
             where penugasan_id = p_id and pelaksana_id = v_pengguna and dicabut_pada is null)
    or exists (select 1 from public.penugasan_panit
             where penugasan_id = p_id and panit_id = v_pengguna and dicabut_pada is null)
  ) then
    raise exception 'BUKAN_TIM: hanya pelaksana atau Panit Penanggung Jawab aktif yang dapat menandai bermasalah';
  end if;

  select status, unit_id, nomor_spt, judul into v_status, v_unit, v_nomor, v_judul
    from public.penugasan where id = p_id;

  if v_status = 'bermasalah' then
    -- Sudah bermasalah: catatan tambahan, bukan penetapan ulang.
    select array_agg(id) into v_penerima
      from public.users where peran = 'kanit' and unit_id = v_unit and aktif = true;
    v_penerima := array_cat(coalesce(v_penerima, array[]::uuid[]),
      coalesce(public.penerima_pengawas_spt(p_id), array[]::uuid[]));

    perform public.fn_buat_notifikasi(
      'spt_bermasalah', v_penerima, 'Penugasan ditandai bermasalah',
      v_nomor || ' — ' || v_judul || '. Keterangan tambahan: ' || trim(p_uraian),
      'penugasan', p_id, p_id, null, true, v_pengguna
    );
    perform public.catat_jejak_audit('tandai_bermasalah', 'penugasan', p_id, trim(p_uraian));
    return;
  end if;

  update public.penugasan
     set status = 'bermasalah', jenis_masalah = p_jenis_masalah, uraian_masalah = trim(p_uraian)
   where id = p_id;

  perform public.catat_jejak_audit('tandai_bermasalah', 'penugasan', p_id, trim(p_uraian));
end;
$$;

revoke execute on function public.tandai_spt_bermasalah(uuid, public.jenis_masalah_spt, text) from public;
grant execute on function public.tandai_spt_bermasalah(uuid, public.jenis_masalah_spt, text) to authenticated;

-- ---------------------------------------------------------------------
-- kembalikan_dari_bermasalah — Kanit unit pemilik saja. Alasan wajib
-- (KP-6.2-35).
-- ---------------------------------------------------------------------
create or replace function public.kembalikan_dari_bermasalah(p_id uuid, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
begin
  if length(trim(coalesce(p_alasan, ''))) = 0 then
    raise exception 'ALASAN_WAJIB: alasan pengembalian wajib diisi';
  end if;
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat mengembalikan status';
  end if;

  update public.penugasan
     set status = 'berjalan'
   where id = p_id and unit_id = v_unit and status = 'bermasalah';

  if not found then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan, bukan milik unit Anda, atau bukan berstatus bermasalah';
  end if;

  perform public.catat_jejak_audit('kembalikan_dari_bermasalah', 'penugasan', p_id, trim(p_alasan));
end;
$$;

revoke execute on function public.kembalikan_dari_bermasalah(uuid, text) from public;
grant execute on function public.kembalikan_dari_bermasalah(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- tutup_spt — KP-6.2-44..46. Daftar "belum beres" (Sesi Tugas terbuka,
-- LHP belum masuk, pelaksana belum melapor) dihitung dan ditampilkan
-- di ANTARMUKA saja (kueri baca biasa) — di sini TIDAK diperiksa sama
-- sekali, karena KP-6.2-44 eksplisit: tetap mengizinkan penutupan.
-- Syarat berkas surat sudah ditegakkan chk_spt_selesai_wajib_berkas
-- (0007); trg_tutup_sesi_spt_selesai (0016) dan trg_notifikasi_
-- penugasan (0021) berjalan otomatis lewat UPDATE di bawah.
-- ---------------------------------------------------------------------
create or replace function public.tutup_spt(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
  v_pengguna uuid := (select auth.uid());
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menutup penugasan';
  end if;

  update public.penugasan
     set status = 'selesai', ditutup_oleh = v_pengguna, ditutup_pada = now()
   where id = p_id and unit_id = v_unit and status in ('baru', 'berjalan', 'bermasalah');

  if not found then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan, bukan milik unit Anda, atau sudah tertutup';
  end if;

  perform public.catat_jejak_audit('tutup_spt', 'penugasan', p_id);
end;
$$;

revoke execute on function public.tutup_spt(uuid) from public;
grant execute on function public.tutup_spt(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- batalkan_spt — alasan wajib sudah ditegakkan chk_spt_batal_wajib_
-- alasan (0007); diperiksa juga di sini agar pesan galatnya jelas
-- sebelum menyentuh basis data.
-- ---------------------------------------------------------------------
create or replace function public.batalkan_spt(p_id uuid, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
  v_pengguna uuid := (select auth.uid());
begin
  if length(trim(coalesce(p_alasan, ''))) = 0 then
    raise exception 'ALASAN_WAJIB: alasan pembatalan wajib diisi';
  end if;
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat membatalkan penugasan';
  end if;

  update public.penugasan
     set status = 'dibatalkan', dibatalkan_oleh = v_pengguna, dibatalkan_pada = now(),
         alasan_pembatalan = trim(p_alasan)
   where id = p_id and unit_id = v_unit and status <> 'dibatalkan';

  if not found then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan, bukan milik unit Anda, atau sudah dibatalkan';
  end if;

  perform public.catat_jejak_audit('batal_spt', 'penugasan', p_id, trim(p_alasan));
end;
$$;

revoke execute on function public.batalkan_spt(uuid, text) from public;
grant execute on function public.batalkan_spt(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- buka_kembali_spt — KP-6.2-50/51: Kanit unit pemilik ATAU Kasubdit,
-- hanya dari status selesai (dibatalkan tidak pernah dapat dibuka
-- kembali — trg_jaga_transisi_status_spt sudah menolaknya juga, ini
-- pemeriksaan kedua yang lebih ramah pesannya).
-- ---------------------------------------------------------------------
create or replace function public.buka_kembali_spt(p_id uuid, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
  v_unit  uuid := (select sipantau_auth.unit_saya());
begin
  if length(trim(coalesce(p_alasan, ''))) = 0 then
    raise exception 'ALASAN_WAJIB: alasan pembukaan kembali wajib diisi';
  end if;
  if v_peran not in ('kanit', 'kasubdit') then
    raise exception 'TIDAK_BERWENANG: hanya Kanit unit pemilik atau Kasubdit yang dapat membuka kembali';
  end if;

  update public.penugasan
     set status = 'berjalan'
   where id = p_id and status = 'selesai'
     and (v_peran = 'kasubdit' or unit_id = v_unit);

  if not found then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan, bukan berstatus selesai, atau bukan milik unit Anda';
  end if;

  perform public.catat_jejak_audit('buka_kembali_spt', 'penugasan', p_id, trim(p_alasan));
end;
$$;

revoke execute on function public.buka_kembali_spt(uuid, text) from public;
grant execute on function public.buka_kembali_spt(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- perpanjang_batas — KP-6.2-41: alasan wajib, tanpa batas jumlah,
-- riwayat lengkap tersimpan permanen di penugasan_perpanjangan.
-- ---------------------------------------------------------------------
create or replace function public.perpanjang_batas(p_id uuid, p_tanggal_baru date, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
  v_lama date;
begin
  if length(trim(coalesce(p_alasan, ''))) = 0 then
    raise exception 'ALASAN_WAJIB: alasan perpanjangan wajib diisi';
  end if;
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat mengubah batas waktu';
  end if;

  select tanggal_batas into v_lama from public.penugasan
   where id = p_id and unit_id = v_unit
     and status in ('baru', 'berjalan', 'bermasalah')
   for update;

  if not found then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan, bukan milik unit Anda, atau sudah tertutup';
  end if;

  update public.penugasan set tanggal_batas = p_tanggal_baru where id = p_id;

  insert into public.penugasan_perpanjangan
    (penugasan_id, tanggal_lama, tanggal_baru, alasan, diubah_oleh)
  values (p_id, v_lama, p_tanggal_baru, trim(p_alasan), (select auth.uid()));

  perform public.catat_jejak_audit('perpanjang_batas', 'penugasan', p_id, trim(p_alasan));
end;
$$;

revoke execute on function public.perpanjang_batas(uuid, date, text) from public;
grant execute on function public.perpanjang_batas(uuid, date, text) to authenticated;

-- ---------------------------------------------------------------------
-- Susunan tim — cabut/tambah pelaksana, tunjuk/cabut Panit. Keempatnya
-- Kanit unit pemilik saja. Penjaga minimum (0024) menolak yang akan
-- menghabiskan syarat BR-33.
-- ---------------------------------------------------------------------
create or replace function public.cabut_pelaksana(p_relasi_id uuid, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
  v_spt  uuid;
begin
  if length(trim(coalesce(p_alasan, ''))) = 0 then
    raise exception 'ALASAN_WAJIB: alasan pencabutan wajib diisi';
  end if;
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat mencabut pelaksana';
  end if;

  select pp.penugasan_id into v_spt
    from public.penugasan_pelaksana pp
    join public.penugasan p on p.id = pp.penugasan_id
   where pp.id = p_relasi_id and p.unit_id = v_unit;

  if v_spt is null then
    raise exception 'TIDAK_DITEMUKAN: baris pelaksana tidak ditemukan atau bukan milik unit Anda';
  end if;

  update public.penugasan_pelaksana
     set dicabut_pada = now(), dicabut_oleh = (select auth.uid()), alasan_pencabutan = trim(p_alasan)
   where id = p_relasi_id;

  perform public.catat_jejak_audit('cabut_pelaksana', 'penugasan_pelaksana', p_relasi_id, trim(p_alasan));
end;
$$;

revoke execute on function public.cabut_pelaksana(uuid, text) from public;
grant execute on function public.cabut_pelaksana(uuid, text) to authenticated;

create or replace function public.tambah_pelaksana(p_id uuid, p_pelaksana_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
  v_urutan int;
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menambah pelaksana';
  end if;
  if not exists (select 1 from public.penugasan where id = p_id and unit_id = v_unit) then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan atau bukan milik unit Anda';
  end if;
  if not exists (select 1 from public.users where id = p_pelaksana_id and unit_id = v_unit and aktif = true) then
    raise exception 'BUKAN_PERSONEL_UNIT: hanya personel aktif unit Anda yang dapat ditambahkan';
  end if;

  select coalesce(max(urutan), 0) + 1 into v_urutan
    from public.penugasan_pelaksana where penugasan_id = p_id;

  insert into public.penugasan_pelaksana (penugasan_id, pelaksana_id, urutan)
  values (p_id, p_pelaksana_id, v_urutan)
  on conflict (penugasan_id, pelaksana_id) do update
     set dicabut_pada = null, dicabut_oleh = null, alasan_pencabutan = null
   where public.penugasan_pelaksana.dicabut_pada is not null;

  perform public.catat_jejak_audit('tambah_pelaksana', 'penugasan_pelaksana', p_id);
end;
$$;

revoke execute on function public.tambah_pelaksana(uuid, uuid) from public;
grant execute on function public.tambah_pelaksana(uuid, uuid) to authenticated;

create or replace function public.tunjuk_panit(p_id uuid, p_panit_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menunjuk Panit Penanggung Jawab';
  end if;
  if not exists (select 1 from public.penugasan where id = p_id and unit_id = v_unit) then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan atau bukan milik unit Anda';
  end if;
  if not exists (select 1 from public.users where id = p_panit_id and unit_id = v_unit and peran = 'panit' and aktif = true) then
    raise exception 'BUKAN_PANIT_UNIT: hanya Panit aktif unit Anda yang dapat ditunjuk';
  end if;

  insert into public.penugasan_panit (penugasan_id, panit_id, ditunjuk_oleh)
  values (p_id, p_panit_id, (select auth.uid()))
  on conflict (penugasan_id, panit_id) do update
     set dicabut_pada = null, dicabut_oleh = null, alasan_pencabutan = null,
         ditunjuk_oleh = (select auth.uid()), ditunjuk_pada = now()
   where public.penugasan_panit.dicabut_pada is not null;

  perform public.catat_jejak_audit('tunjuk_panit', 'penugasan_panit', p_id);
end;
$$;

revoke execute on function public.tunjuk_panit(uuid, uuid) from public;
grant execute on function public.tunjuk_panit(uuid, uuid) to authenticated;

create or replace function public.cabut_panit(p_relasi_id uuid, p_alasan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
  v_spt  uuid;
begin
  if length(trim(coalesce(p_alasan, ''))) = 0 then
    raise exception 'ALASAN_WAJIB: alasan pencabutan wajib diisi';
  end if;
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat mencabut Panit';
  end if;

  select pp.penugasan_id into v_spt
    from public.penugasan_panit pp
    join public.penugasan p on p.id = pp.penugasan_id
   where pp.id = p_relasi_id and p.unit_id = v_unit;

  if v_spt is null then
    raise exception 'TIDAK_DITEMUKAN: baris Panit tidak ditemukan atau bukan milik unit Anda';
  end if;

  update public.penugasan_panit
     set dicabut_pada = now(), dicabut_oleh = (select auth.uid()), alasan_pencabutan = trim(p_alasan)
   where id = p_relasi_id;

  perform public.catat_jejak_audit('cabut_panit', 'penugasan_panit', p_relasi_id, trim(p_alasan));
end;
$$;

revoke execute on function public.cabut_panit(uuid, text) from public;
grant execute on function public.cabut_panit(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- hapus_spt_permanen — KP-6.2-48/49: hanya bila belum pernah ada
-- laporan, foto (bagian dari laporan), rute, atau Sesi Tugas.
-- ---------------------------------------------------------------------
create or replace function public.hapus_spt_permanen(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit  uuid := (select sipantau_auth.unit_saya());
  v_nomor text;
  v_judul text;
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menghapus penugasan';
  end if;

  select nomor_spt, judul into v_nomor, v_judul
    from public.penugasan where id = p_id and unit_id = v_unit;

  if v_judul is null then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan atau bukan milik unit Anda';
  end if;

  if exists (select 1 from public.laporan_harian where penugasan_id = p_id) then
    raise exception 'SUDAH_ADA_KEGIATAN: penugasan ini sudah memiliki laporan, tidak dapat dihapus permanen';
  end if;
  if exists (select 1 from public.sesi_tugas where penugasan_id = p_id) then
    raise exception 'SUDAH_ADA_KEGIATAN: penugasan ini sudah memiliki Sesi Tugas, tidak dapat dihapus permanen';
  end if;

  perform public.catat_jejak_audit('hapus_spt', 'penugasan', p_id, v_nomor || ' — ' || v_judul);

  delete from public.penugasan where id = p_id;
end;
$$;

revoke execute on function public.hapus_spt_permanen(uuid) from public;
grant execute on function public.hapus_spt_permanen(uuid) to authenticated;
