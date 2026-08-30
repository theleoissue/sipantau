-- =====================================================================
-- 0021 — Menyambungkan titik pemicu Modul 6.2/6.3/6.4 ke fn_buat_notifikasi
-- Sumber: docs/60-modul-6.6-6.9-user-notif.md Bagian 8 (tabel jenis
-- per modul) — judul baku dan penerima DIKUTIP APA ADANYA, tidak boleh
-- diubah tanpa revisi PRD (catatan berkas sumber).
-- =====================================================================
--
-- CATATAN LINGKUP (dilaporkan, bukan ditebak — docs/CLAUDE.md §12):
-- Modul 6.2 pada proyek ini baru punya jalur terbitkan SPT; halaman
-- menutup SPT, menandai bermasalah, dan mencabut pelaksana/Panit BELUM
-- dibangun (tidak ada di app/(app)/penugasan/). Pemicu di bawah tetap
-- ditulis penuh dan benar terhadap KEJADIANNYA di basis data (status
-- berubah, dicabut_pada terisi) — begitu antarmuka penutupnya dibangun
-- kelak, pemberitahuan langsung berjalan tanpa migrasi tambahan.
--
-- `laporan_dikoreksi` SENGAJA TIDAK disambungkan: penerimanya adalah
-- "peninjau yang PERNAH MEMBACA laporan itu", dan sistem ini belum
-- punya mekanisme pencatatan siapa yang sudah membaca laporan mana
-- (bukan sekadar penamaan ulang — ini infrastruktur baru yang belum
-- diminta). Jenis ini tetap sah di daftar tertutup BR-68, hanya belum
-- ada pemanggilnya. Dicatat di sini supaya bukan temuan pemeriksaan
-- silang berikutnya.
-- =====================================================================

-- =====================================================================
-- Modul 6.2 — penugasan
-- =====================================================================

-- ---------------------------------------------------------------------
-- trg_notifikasi_penugasan — tiga jenis sekaligus, dari SATU transisi
-- status (AFTER UPDATE), supaya urutan kejadian yang sebenarnya cuma
-- satu perubahan tidak perlu diulang di banyak pemicu.
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
begin
  -- spt_diterbitkan: draf -> baru. Panit Penanggung Jawab.
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

    -- Pelaksana yang sudah tercantum sejak wizard (SPT masih draf saat
    -- itu, jadi belum diberi tahu) menerima spt_ditugaskan di sini,
    -- bersamaan dengan penerbitan.
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

  -- spt_bermasalah: berpindah KE bermasalah dari status lain. Kanit
  -- unit dan Kasubdit.
  if new.status = 'bermasalah' and old.status <> 'bermasalah' then
    select array_agg(id) into v_penerima
      from public.users
     where aktif = true
       and ((peran = 'kanit' and unit_id = new.unit_id) or peran = 'kasubdit');

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'spt_bermasalah', v_penerima, 'Penugasan ditandai bermasalah',
        new.nomor_spt || ' — ' || new.judul,
        'penugasan', new.id, new.id, null, true, v_pelaku
      );
    end if;
  end if;

  -- spt_ditutup: berpindah ke selesai/dibatalkan. Pelaksana yang belum
  -- dicabut.
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

create trigger trg_notifikasi_penugasan
  after update on public.penugasan
  for each row
  execute function public.fn_notifikasi_penugasan();

-- ---------------------------------------------------------------------
-- trg_notifikasi_pelaksana_ditugaskan — pelaksana DITAMBAHKAN pada SPT
-- yang SUDAH terbit (bukan yang masih draf — batch pelaksana wizard
-- awal ditangani trg_notifikasi_penugasan di atas, bersamaan dengan
-- penerbitan, supaya tidak dua kali diberi tahu).
-- ---------------------------------------------------------------------
create or replace function public.fn_notifikasi_pelaksana_ditugaskan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.status_spt;
  v_spt    record;
begin
  select status, nomor_spt, judul into v_spt
    from public.penugasan where id = new.penugasan_id;

  if v_spt.status <> 'draf' then
    perform public.fn_buat_notifikasi(
      'spt_ditugaskan', array[new.pelaksana_id], 'Anda ditunjuk pada penugasan',
      v_spt.nomor_spt || ' — ' || v_spt.judul,
      'penugasan', new.penugasan_id, new.penugasan_id, null, true, (select auth.uid())
    );
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_pelaksana_ditugaskan
  after insert on public.penugasan_pelaksana
  for each row
  execute function public.fn_notifikasi_pelaksana_ditugaskan();

-- ---------------------------------------------------------------------
-- trg_notifikasi_pelaksana_dicabut — spt_dicabut, hanya orang yang
-- dicabut sendiri.
-- ---------------------------------------------------------------------
create or replace function public.fn_notifikasi_pelaksana_dicabut()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_spt record;
begin
  if new.dicabut_pada is not null and old.dicabut_pada is null then
    select nomor_spt, judul into v_spt from public.penugasan where id = new.penugasan_id;

    perform public.fn_buat_notifikasi(
      'spt_dicabut', array[new.pelaksana_id], 'Penunjukan Anda dicabut',
      v_spt.nomor_spt || ' — ' || v_spt.judul,
      'penugasan', new.penugasan_id, new.penugasan_id, null, false, (select auth.uid())
    );
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_pelaksana_dicabut
  after update on public.penugasan_pelaksana
  for each row
  execute function public.fn_notifikasi_pelaksana_dicabut();

-- =====================================================================
-- Modul 6.3 — laporan
-- =====================================================================

create or replace function public.fn_notifikasi_laporan_masuk()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penerima uuid[];
  v_spt      record;
begin
  v_penerima := public.penerima_pengawas_spt(new.penugasan_id);
  select nomor_spt, judul into v_spt from public.penugasan where id = new.penugasan_id;

  if v_penerima is not null then
    perform public.fn_buat_notifikasi(
      'laporan_masuk', v_penerima, 'Laporan kegiatan masuk',
      v_spt.nomor_spt || ' — ' || v_spt.judul,
      'laporan', new.id, new.penugasan_id, new.id, false, new.pelapor_id
    );
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_laporan_masuk
  after insert on public.laporan_harian
  for each row
  execute function public.fn_notifikasi_laporan_masuk();

create or replace function public.fn_notifikasi_catatan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lap record;
begin
  select lh.penugasan_id, lh.pelapor_id, p.nomor_spt, p.judul
    into v_lap
    from public.laporan_harian lh
    join public.penugasan p on p.id = lh.penugasan_id
   where lh.id = new.laporan_id;

  perform public.fn_buat_notifikasi(
    case when new.jenis = 'minta_perbaikan' then 'laporan_perlu_diperbaiki' else 'catatan_diberikan' end,
    array[v_lap.pelapor_id],
    case when new.jenis = 'minta_perbaikan' then 'Laporan perlu diperbaiki' else 'Catatan pada laporan Anda' end,
    v_lap.nomor_spt || ' — ' || v_lap.judul,
    'laporan', new.laporan_id, v_lap.penugasan_id, new.laporan_id, true, new.peninjau_id
  );

  return new;
end;
$$;

create trigger trg_notifikasi_catatan
  after insert on public.catatan_laporan
  for each row
  execute function public.fn_notifikasi_catatan();

-- ---------------------------------------------------------------------
-- laporan_disetujui — diperluas dari public.setujui_laporan (0011),
-- fungsi yang sama yang sudah memanggil catat_jejak_audit.
-- ---------------------------------------------------------------------
create or replace function public.setujui_laporan(p_laporan_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penugasan uuid;
  v_unit_saya uuid := (select sipantau_auth.unit_saya());
  v_unit_spt  uuid;
  v_pelapor   uuid;
  v_nomor_spt text;
  v_judul     text;
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat menyetujui laporan';
  end if;

  select penugasan_id, pelapor_id into v_penugasan, v_pelapor
    from public.laporan_harian where id = p_laporan_id;
  select unit_id, nomor_spt, judul into v_unit_spt, v_nomor_spt, v_judul
    from public.penugasan where id = v_penugasan;

  if v_unit_spt is distinct from v_unit_saya then
    raise exception 'DI_LUAR_UNIT: laporan ini bukan milik unit Anda';
  end if;

  update public.laporan_harian
     set status_laporan = 'disetujui',
         disetujui_oleh = (select auth.uid()),
         disetujui_pada = now()
   where id = p_laporan_id;

  perform public.catat_jejak_audit('setujui_laporan', 'laporan_harian', p_laporan_id);

  perform public.fn_buat_notifikasi(
    'laporan_disetujui', array[v_pelapor], 'Laporan disetujui',
    v_nomor_spt || ' — ' || v_judul,
    'laporan', p_laporan_id, v_penugasan, p_laporan_id, false, (select auth.uid())
  );
end;
$$;

-- =====================================================================
-- Modul 6.4 — GPS (tiga jenis yang sejak 0016 SENGAJA belum disisipkan,
-- lihat catatan "Notifikasi Kanit/Panit ... SENGAJA BELUM disisipkan"
-- pada migrasi itu — inilah pemenuhannya)
-- =====================================================================

-- ---------------------------------------------------------------------
-- sesi_ditutup_keluar_aplikasi DAN sesi_menggantung sama-sama berakhir
-- di fn_tutup_sesi_tugas, dari DUA jalur yang berbeda (P-04: manusia
-- keluar aplikasi vs kurir/penjadwal menggantung). Disambungkan DI SINI
-- SEKALI, bukan di tiap pemanggilnya, supaya kedua jalur penutupan
-- menggantung (self-heal fn_buka_sesi_tugas maupun kerja_tutup_sesi_
-- menggantung) tetap memberi tahu dengan cara yang sama persis —
-- persis kedisiplinan yang dituntut P-04 sendiri.
-- ---------------------------------------------------------------------
create or replace function public.fn_tutup_sesi_tugas(
  p_sesi_id     uuid,
  p_sebab       public.sebab_penutupan_sesi,
  p_ditutup_oleh uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jarak   numeric := 0;
  v_median  numeric;
  v_awal    record;
  v_akhir   record;
  v_prev_lat numeric;
  v_prev_lng numeric;
  v_titik   record;
  v_sesi    record;
  v_penerima uuid[];
begin
  select lat, lng into v_awal
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
   order by direkam_pada asc limit 1;

  select lat, lng into v_akhir
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
   order by direkam_pada desc limit 1;

  v_prev_lat := null;
  v_prev_lng := null;
  for v_titik in
    select lat, lng
      from public.location_logs
     where sesi_tugas_id = p_sesi_id and diragukan_sebab is null
     order by direkam_pada asc
  loop
    if v_prev_lat is not null then
      v_jarak := v_jarak + extensions.ST_Distance(
        extensions.ST_MakePoint(v_prev_lng, v_prev_lat)::extensions.geography,
        extensions.ST_MakePoint(v_titik.lng, v_titik.lat)::extensions.geography
      );
    end if;
    v_prev_lat := v_titik.lat;
    v_prev_lng := v_titik.lng;
  end loop;

  select percentile_cont(0.5) within group (order by akurasi_meter)
    into v_median
    from public.location_logs
   where sesi_tugas_id = p_sesi_id and akurasi_meter is not null;

  update public.sesi_tugas
     set ditutup_pada          = now(),
         sebab_penutupan       = p_sebab,
         ditutup_oleh          = p_ditutup_oleh,
         jarak_tempuh_meter    = v_jarak,
         akurasi_median_meter  = v_median,
         lat_awal              = v_awal.lat,
         lng_awal              = v_awal.lng,
         lat_akhir             = v_akhir.lat,
         lng_akhir             = v_akhir.lng,
         diringkas_pada        = now(),
         diubah_pada           = now()
   where id = p_sesi_id
     and ditutup_pada is null
  returning penugasan_id, pengguna_id into v_sesi;

  delete from public.posisi_terkini where sesi_tugas_id = p_sesi_id;

  if v_sesi.penugasan_id is not null and p_sebab in ('keluar_aplikasi', 'menggantung') then
    if p_sebab = 'keluar_aplikasi' then
      v_penerima := public.penerima_pengawas_spt(v_sesi.penugasan_id);
      if v_penerima is not null then
        perform public.fn_buat_notifikasi(
          'sesi_ditutup_keluar_aplikasi', v_penerima, 'Sesi tugas terhenti',
          'Pelacakan posisi terhenti karena aplikasi ditutup selama sesi berjalan.',
          'penugasan', v_sesi.penugasan_id, v_sesi.penugasan_id, null, true, v_sesi.pengguna_id
        );
      end if;
    else
      select array_agg(u.id) into v_penerima
        from public.users u
        join public.penugasan p on p.unit_id = u.unit_id
       where p.id = v_sesi.penugasan_id and u.peran = 'kanit' and u.aktif = true;

      perform public.fn_buat_notifikasi(
        'sesi_menggantung',
        array_cat(array[v_sesi.pengguna_id], coalesce(v_penerima, array[]::uuid[])),
        'Sesi tugas ditutup sistem',
        'Tidak ada pembaruan posisi selama lebih dari dua jam.',
        'penugasan', v_sesi.penugasan_id, v_sesi.penugasan_id, null, false, null
      );
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- izin_lokasi_terputus — diperluas dari tandai_izin_lokasi_terputus (0016)
-- ---------------------------------------------------------------------
create or replace function public.tandai_izin_lokasi_terputus(p_sesi_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sesi record;
  v_penerima uuid[];
begin
  update public.sesi_tugas
     set izin_dicabut_pada = now(), diubah_pada = now()
   where id = p_sesi_id
     and pengguna_id = (select auth.uid())
     and ditutup_pada is null
     and izin_dicabut_pada is null
  returning penugasan_id, pengguna_id into v_sesi;

  update public.posisi_terkini
     set izin_terputus = true, diubah_pada = now()
   where sesi_tugas_id = p_sesi_id;

  if v_sesi.penugasan_id is not null then
    v_penerima := public.penerima_pengawas_spt(v_sesi.penugasan_id);
    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'izin_lokasi_terputus', v_penerima, 'Pelacakan lokasi terhenti',
        'Izin lokasi tidak lagi diberikan selama Sesi Tugas berjalan.',
        'penugasan', v_sesi.penugasan_id, v_sesi.penugasan_id, null, true, v_sesi.pengguna_id
      );
    end if;
  end if;
end;
$$;

-- =====================================================================
-- Modul 6.6 (sebagian) — akun_dinonaktifkan
--
-- Ditempel pada kolom aktif itu sendiri, sama seperti trg_tutup_sesi_
-- akun_nonaktif (0016) — berjalan apa pun mekanismenya, bukan hanya
-- lewat Fungsi Tepi nonaktifkan-akun yang belum dibangun (Modul 6.6
-- sendiri belum jadi giliran, lihat catatan lingkup di atas berkas ini).
-- =====================================================================
create or replace function public.fn_notifikasi_akun_nonaktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penerima uuid[];
begin
  if new.aktif = false and old.aktif = true and new.unit_id is not null then
    select array_agg(id) into v_penerima
      from public.users
     where peran = 'kanit' and unit_id = new.unit_id and aktif = true and id <> new.id;

    if v_penerima is not null then
      perform public.fn_buat_notifikasi(
        'akun_dinonaktifkan', v_penerima, 'Akun personel dinonaktifkan',
        new.nama, 'akun', new.id, null, null, false, (select auth.uid())
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_akun_nonaktif
  after update on public.users
  for each row
  execute function public.fn_notifikasi_akun_nonaktif();
