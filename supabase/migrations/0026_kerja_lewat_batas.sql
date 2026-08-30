-- =====================================================================
-- 0026 — Pekerjaan berjadwal Lewat Batas + perkuatan pemberitahuan
-- bermasalah + penjaga keaktifan project
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 2 (1.5); docs/01-koreksi.md J.3
-- =====================================================================

-- ---------------------------------------------------------------------
-- KP-6.2-33: pemberitahuan spt_bermasalah wajib memuat jenis masalah
-- DAN uraiannya. trg_notifikasi_penugasan (0021) baru mengirim nomor
-- dan judul SPT — diperluas di sini supaya jenis+uraian ikut termuat,
-- diambil dari kolom yang baru ditambahkan migrasi 0023.
-- ---------------------------------------------------------------------
create or replace function public.fn_notifikasi_penugasan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penerima uuid[];
  v_pelaku   uuid := (select auth.uid());
  v_label_masalah text;
begin
  if new.status = 'baru' and old.status = 'draf' then
    select array_agg(panit_id) into v_penerima
      from public.penugasan_panit
     where penugasan_id = new.id and dicabut_pada is null;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_diterbitkan', v_penerima, 'Penugasan baru diterbitkan',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;

    select array_agg(pelaksana_id) into v_penerima
      from public.penugasan_pelaksana
     where penugasan_id = new.id and dicabut_pada is null;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_ditugaskan', v_penerima, 'Anda ditunjuk pada penugasan',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;
  end if;

  if new.status = 'bermasalah' and old.status <> 'bermasalah' then
    select array_agg(id) into v_penerima
      from public.users
     where aktif = true
       and ((peran = 'kanit' and unit_id = new.unit_id) or peran = 'kasubdit');

    v_label_masalah := case new.jenis_masalah
      when 'alamat_sasaran_fiktif'        then 'Alamat atau sasaran fiktif'
      when 'objek_tidak_ditemukan'         then 'Objek tidak ditemukan di lokasi'
      when 'informasi_tidak_sesuai'        then 'Informasi awal tidak sesuai kenyataan'
      when 'kendala_keamanan'              then 'Situasi tidak memungkinkan karena alasan keamanan'
      when 'sasaran_berpindah'             then 'Sasaran berpindah tempat'
      when 'kendala_perangkat_jaringan'    then 'Kendala perangkat atau jaringan'
      else 'Lainnya'
    end;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_bermasalah', v_penerima, 'Penugasan ditandai bermasalah',
        new.nomor_spt || ' — ' || new.judul || '. ' || v_label_masalah || ': ' || coalesce(new.uraian_masalah, ''),
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;
  end if;

  if new.status in ('selesai', 'dibatalkan') and old.status not in ('selesai', 'dibatalkan') then
    v_penerima := public.penerima_pelaksana_spt(new.id);

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_ditutup', v_penerima, 'Penugasan ditutup',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, false, v_pelaku
      );
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- kerja_periksa_lewat_batas — bentuk yang diperbaiki docs/01-koreksi.md
-- J.3 (Asia/Jakarta, bukan current_date polos) DAN disesuaikan BR-72
-- (Modul 6.9, belum ada saat Addendum 6.2-T ditulis): memakai
-- fn_buat_notifikasi, bukan insert langsung ke notifikasi.
-- ---------------------------------------------------------------------
create or replace function public.kerja_periksa_lewat_batas()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sasaran record;
  n_kirim int := 0;
begin
  for v_sasaran in
    select p.id, p.nomor_spt, p.judul, p.tanggal_batas, p.diterbitkan_oleh
      from public.penugasan p
     where p.tanggal_batas is not null
       and p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
       and p.status in ('baru', 'berjalan', 'bermasalah')
       and p.lewat_batas_diberitahukan_pada is null
  loop
    if v_sasaran.diterbitkan_oleh is not null then
      perform public.fn_buat_notifikasi(
        'spt_lewat_batas', array[v_sasaran.diterbitkan_oleh], 'Batas waktu penugasan terlampaui',
        v_sasaran.nomor_spt || ' — ' || v_sasaran.judul ||
        '. Batas waktu ' || to_char(v_sasaran.tanggal_batas, 'DD Mon YYYY') ||
        ' sudah terlampaui dan status belum Selesai.',
        'penugasan', v_sasaran.id, v_sasaran.id, null, false, null
      );
    end if;

    update public.penugasan
       set lewat_batas_diberitahukan_pada = now()
     where id = v_sasaran.id;

    n_kirim := n_kirim + 1;
  end loop;
end;
$$;

select cron.schedule('periksa-lewat-batas', '5 0 * * *',
  'select public.kerja_periksa_lewat_batas()');

-- ---------------------------------------------------------------------
-- kerja_jaga_keaktifan — Addendum 6.2-T Bagian 1.6: project paket
-- gratis Supabase dijeda setelah tujuh hari tanpa aktivitas, dan pg_cron
-- ikut berhenti tanpa jejak galat apa pun bersamanya (persis P-04 GPS
-- yang sudah mengantisipasi ini). Pekerjaan ini tidak menghasilkan apa
-- pun selain satu pembacaan ringan — itulah gunanya.
-- ---------------------------------------------------------------------
create or replace function public.kerja_jaga_keaktifan()
returns void
language sql
security definer
set search_path = ''
as $$
  select count(*) from public.users where aktif = true;
$$;

select cron.schedule('jaga-keaktifan', '0 */6 * * *',
  'select public.kerja_jaga_keaktifan()');
