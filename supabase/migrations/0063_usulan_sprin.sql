-- =====================================================================
-- 0063 — Usulan SPRIN: meminta surat diterbitkan, bukan memindai yang sudah ada
--
-- APA YANG KURANG
--
-- pengajuan_sprin (0053) sudah punya seluruh rangka persetujuan: status,
-- catatan Kanit, pemberitahuan, dan yang disetujui mengisi wizard
-- terbitkan. Tetapi satu-satunya cara mengisinya adalah MEMOTRET SPRIN
-- yang sudah ada di kertas. Namanya "pengajuan", isinya seluruhnya
-- "scan".
--
-- Padahal arah kerja di lapangan sering kebalikannya: suratnya BELUM
-- ada, dan bawahan yang menemukan sesuatu perlu meminta atasan
-- menerbitkannya.
--
--   scan   : keputusan sudah diambil -> dimasukkan ke sistem
--   usulan : keputusan belum diambil -> dimintakan ke Kanit
--
-- Keduanya berakhir sama — Kanit memutuskan, lalu menerbitkan SPT —
-- sehingga berbagi satu tabel dan satu kotak masuk. Yang membedakannya
-- kolom asal, dan medan yang diisi.
--
-- MEDAN YANG SELAMA INI TIDAK ADA TEMPATNYA
--
-- data_scan memuat lima belas medan, dan semuanya menjawab "surat itu
-- bunyinya apa". TIDAK ADA satu pun tempat untuk menuliskan KENAPA
-- operasi ini perlu dilakukan. Pada scan itu memang benar — alasannya
-- ada di suratnya sendiri. Pada usulan, alasan itu justru seluruh isi
-- usulannya, dan tanpanya Kanit tidak punya bahan untuk memutuskan
-- apa pun.
--
-- KEPUTUSAN PEMILIK PRODUK, 11 September 2026
--
--   Isi formulir : ringkas — alasan dan pokoknya saja. Nomor, dasar
--                  hukum, dan klasifikasi tetap milik Kanit di wizard
--                  terbitkan; nomor SPT memang tidak pernah dibangkitkan
--                  sistem (modul 6.2), jadi pengusul tidak boleh
--                  mengisinya.
--   Pengusul     : Anggota dan Panit, sama seperti jalur scan.
--   Tarik        : boleh, selama Kanit belum memutuskan.
--
-- BR-11 tetap: menerbitkan SPT sepenuhnya wewenang Kanit. Usulan yang
-- disetujui TIDAK pernah menjadi penugasan dengan sendirinya — ia hanya
-- mengisi wizard, dan Kanit yang menekan terbit.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Nilai enum audit. Dipisah di depan dan memakai pola 0053: nilai enum
-- baru tidak boleh DIPAKAI pada transaksi yang sama dengan
-- pembuatannya. Di sini ia hanya muncul di dalam badan fungsi, yang
-- dijalankan pada transaksi lain.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                  where t.typname = 'jenis_tindakan_audit' and e.enumlabel = 'ajukan_usulan_sprin') then
    alter type public.jenis_tindakan_audit add value 'ajukan_usulan_sprin';
  end if;
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                  where t.typname = 'jenis_tindakan_audit' and e.enumlabel = 'tarik_pengajuan_sprin') then
    alter type public.jenis_tindakan_audit add value 'tarik_pengajuan_sprin';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- asal — membedakan dua hal yang bentuk persetujuannya sama.
--
-- Bawaan 'scan' supaya seluruh baris yang sudah ada tetap terbaca benar
-- tanpa disentuh: sebelum migrasi ini, satu-satunya cara membuat baris
-- di tabel ini memang lewat scan.
-- ---------------------------------------------------------------------
alter table public.pengajuan_sprin
  add column if not exists asal text not null default 'scan';

alter table public.pengajuan_sprin drop constraint if exists chk_pengajuan_asal;
alter table public.pengajuan_sprin add constraint chk_pengajuan_asal
  check (asal in ('scan', 'usulan'));

comment on column public.pengajuan_sprin.asal is
  'scan = SPRIN yang sudah ada, dipindai. usulan = permintaan agar SPRIN diterbitkan.';
comment on column public.pengajuan_sprin.data_scan is
  'Isi ajuan. Pada asal=scan: hasil pembacaan surat. Pada asal=usulan: alasan, objek, sasaran, uraian, lokasi, perkiraan waktu, usulan personel. nomor_spt TIDAK PERNAH diisi pengusul.';

-- ---------------------------------------------------------------------
-- Status 'ditarik'.
--
-- Daftar ditulis LENGKAP dengan seluruh nilai lama, bukan diganti versi
-- yang lebih pendek — mengganti daftar tertutup dengan versi pendek
-- melenyapkan nilai lain tanpa satu pun galat (CLAUDE.md §11).
-- ---------------------------------------------------------------------
alter table public.pengajuan_sprin drop constraint if exists pengajuan_sprin_status_check;
alter table public.pengajuan_sprin add constraint pengajuan_sprin_status_check
  check (status in ('diajukan', 'perlu_perbaikan', 'disetujui', 'ditolak', 'ditarik'));

-- ---------------------------------------------------------------------
-- ajukan_usulan_sprin
--
-- Sengaja fungsi tersendiri, bukan parameter tambahan pada
-- ajukan_scan_sprin. Keduanya memang mirip, tetapi menyatukannya berarti
-- satu fungsi yang harus memutuskan medan mana yang wajib berdasarkan
-- sebuah penanda — dan pemeriksaan yang bercabang seperti itu paling
-- sering menjadi tempat aturan terlewat diam-diam.
-- ---------------------------------------------------------------------
create or replace function public.ajukan_usulan_sprin(p_data jsonb)
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

  -- Alasan WAJIB, dan ini satu-satunya medan yang dipaksa ada.
  --
  -- Bukan kerewelan formulir: tanpa alasan, yang sampai ke Kanit hanyalah
  -- rancangan surat tanpa keterangan kenapa ia perlu diterbitkan, dan
  -- tidak ada yang dapat diputuskan atas dasar itu. Medan lain boleh
  -- kosong karena memang belum tentu diketahui saat usulan dibuat.
  if nullif(btrim(coalesce(p_data->>'alasan', '')), '') is null then
    raise exception 'ALASAN_WAJIB: usulan wajib menyebutkan alasan atau pertimbangan';
  end if;

  -- nomor_spt dibuang, tidak sekadar diabaikan. Nomor berasal dari buku
  -- agenda Bagian Administrasi di luar SiPANTAU dan "sistem tidak pernah
  -- membangkitkannya sendiri" (modul 6.2) — membiarkan nomor kiriman
  -- pengusul lolos ke wizard membuat Kanit mengira nomor itu sudah sah.
  insert into public.pengajuan_sprin (unit_id, diajukan_oleh, data_scan, asal)
  values (v_unit, (select auth.uid()), (p_data - 'nomor_spt'), 'usulan')
  returning id into v_id;

  perform public.catat_jejak_audit('ajukan_usulan_sprin', 'pengajuan_sprin', v_id);

  v_tujuan := 'pengajuan_sprin';
  perform public.fn_buat_notifikasi(
    p_jenis        => 'sprin_diajukan',
    p_penerima     => public.penerima_kanit_unit(v_unit),
    p_judul        => 'Usulan SPRIN menunggu keputusan',
    p_isi          => coalesce(v_nama, 'Anggota') || ' mengusulkan penerbitan SPRIN baru.',
    p_tujuan_jenis => v_tujuan,
    p_tujuan_id    => v_id,
    p_pelaku       => (select auth.uid())
  );
  return v_id;
end
$$;

revoke all on function public.ajukan_usulan_sprin(jsonb) from public;
grant execute on function public.ajukan_usulan_sprin(jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- tarik_pengajuan_sprin
--
-- Hanya pengajunya sendiri, dan hanya selama Kanit belum memutuskan.
-- Yang sudah disetujui atau ditolak TIDAK dapat ditarik: keputusan yang
-- sudah diambil adalah bagian dari jejak, bukan sesuatu yang boleh
-- dihapus belakangan oleh pihak yang diputuskan.
--
-- Menarik BUKAN menghapus. Barisnya tetap ada beserta jejak auditnya —
-- di seluruh tabel sistem ini tidak ada satu pun delete (CLAUDE.md §5.1).
-- ---------------------------------------------------------------------
create or replace function public.tarik_pengajuan_sprin(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.pengajuan_sprin q
     set status = 'ditarik', ditinjau_pada = now()
   where q.id = p_id
     and q.diajukan_oleh = (select auth.uid())
     and q.status in ('diajukan', 'perlu_perbaikan');

  if not found then
    raise exception 'TIDAK_DAPAT_DITARIK: ajuan ini bukan milik Anda atau sudah diputuskan';
  end if;

  perform public.catat_jejak_audit('tarik_pengajuan_sprin', 'pengajuan_sprin', p_id);
end
$$;

revoke all on function public.tarik_pengajuan_sprin(uuid) from public;
grant execute on function public.tarik_pengajuan_sprin(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- putuskan_pengajuan_sprin — kalimatnya mengikuti asal ajuan.
--
-- Ditulis ulang UTUH dari versi 0055, bukan ditambal: create or replace
-- mengganti seluruh badan fungsi, sehingga berangkat dari versi lama
-- akan melenyapkan apa pun yang ditambahkan sesudahnya tanpa galat.
--
-- Yang berubah hanya kalimat pemberitahuan. Penjaga status
-- ('diajukan', 'perlu_perbaikan') dibiarkan apa adanya, dan itu sekaligus
-- membuat ajuan yang sudah ditarik tidak dapat diputuskan lagi.
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
    v_isi   := 'Kanit menyetujui ' || lower(v_sebutan) || ' yang Anda ajukan.';
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
