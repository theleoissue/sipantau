-- =====================================================================
-- 0023 — Melengkapi Modul 6.2: kolom, tabel, dan tampilan yang belum
-- pernah dibangun sejak sesi pertama modul ini
-- Sumber: docs/20-modul-6.2-penugasan.md Bagian 3 & 4; docs/01-koreksi.md J.3
-- =====================================================================
--
-- DUDUK PERKARANYA (dicatat di sini karena bukan temuan kecil): sesi
-- pertama Modul 6.2 hanya membangun jalur terbitkan SPT. Empat syarat
-- minimum saat terbit, penjaga anti-race pencabutan, penanda Lewat
-- Batas berjadwal, dan tampilan penugasan_tampil TIDAK PERNAH dipasang
-- — bukan sengaja ditunda, sekadar belum sampai giliran. Berkas ini
-- dan tiga berkas sesudahnya menutupnya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Daftar resmi jenis masalah — A-11, "daftar sementara" pada berkas
-- sumber. Tujuh nilai, tertutup.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'jenis_masalah_spt') then
    create type public.jenis_masalah_spt as enum (
      'alamat_sasaran_fiktif', 'objek_tidak_ditemukan', 'informasi_tidak_sesuai',
      'kendala_keamanan', 'sasaran_berpindah', 'kendala_perangkat_jaringan', 'lainnya'
    );
  end if;
end
$$;

alter table public.penugasan
  add column if not exists jenis_masalah public.jenis_masalah_spt,
  add column if not exists uraian_masalah text;

-- BR-26: bermasalah wajib jenis + uraian. Kembali ke status lain
-- (berjalan, dsb.) tidak mewajibkan kolom ini tetap terisi — riwayatnya
-- sudah tercatat pada jejak audit saat penandaan terjadi, jadi TIDAK
-- dikosongkan otomatis saat kembali; ia jadi keterangan "penandaan
-- terakhir", bukan status penanda kini bermasalah atau tidak (status
-- itu sendiri sudah dibaca dari kolom status).
alter table public.penugasan
  add constraint chk_bermasalah_wajib_jenis_uraian check (
    status <> 'bermasalah'
    or (jenis_masalah is not null and uraian_masalah is not null and length(trim(uraian_masalah)) > 0)
  );

-- ---------------------------------------------------------------------
-- Riwayat perpanjangan batas waktu — KP-6.2-41: "tidak ada batas
-- berapa kali, dan seluruh riwayat terbaca pada rincian SPT". Tabel
-- tersendiri, bukan sekadar jejak_audit, karena ini eksplisit diminta
-- tampil sebagai daftar terstruktur di halaman rincian.
-- ---------------------------------------------------------------------
create table if not exists public.penugasan_perpanjangan (
  id            uuid primary key default gen_random_uuid(),
  penugasan_id  uuid not null references public.penugasan (id) on delete cascade,
  tanggal_lama  date,
  tanggal_baru  date not null,
  alasan        text not null,
  diubah_oleh   uuid references public.users (id),
  diubah_pada   timestamptz not null default now(),

  constraint chk_perpanjangan_wajib_alasan check (length(trim(alasan)) > 0)
);

create index if not exists idx_perpanjangan_penugasan
  on public.penugasan_perpanjangan (penugasan_id, diubah_pada desc);

alter table public.penugasan_perpanjangan enable row level security;
-- Hanya select — penyisipan lewat fn_perpanjang_batas (0025) saja,
-- security definer, tidak ada jalur lain.
grant select on public.penugasan_perpanjangan to authenticated;

create policy "perpanjangan_baca_ikut_induk"
on public.penugasan_perpanjangan
for select
to authenticated
using (penugasan_id in (select id from public.penugasan));

-- ---------------------------------------------------------------------
-- Jenis tindakan jejak audit — KP-6.2-61, sembilan nilai yang belum ada
-- (terbit_spt, tutup_spt, batal_spt, hapus_spt sudah ada sejak 0003).
-- ---------------------------------------------------------------------
do $$
declare
  v text;
begin
  foreach v in array array[
    'sunting_spt', 'buka_kembali_spt', 'tandai_bermasalah', 'kembalikan_dari_bermasalah',
    'perpanjang_batas', 'tambah_pelaksana', 'cabut_pelaksana', 'tunjuk_panit', 'cabut_panit'
  ]
  loop
    if not exists (
      select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'jenis_tindakan_audit' and e.enumlabel = v
    ) then
      execute format('alter type public.jenis_tindakan_audit add value %L', v);
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------
-- penugasan_tampil — bentuk yang SUDAH DIPERBAIKI docs/01-koreksi.md
-- J.3, BUKAN bentuk asli Addendum 6.2-T Bagian 7.2 yang memakai
-- current_date polos (BR-64: server berzona UTC, Kanit di WIB —
-- selisih tujuh jam membuat penanda Lewat Batas muncul sejak pukul
-- 17.00 WIB SEHARI SEBELUM batasnya sungguh lewat).
-- ---------------------------------------------------------------------
create or replace view public.penugasan_tampil
with (security_invoker = on)
as
select p.*,
       (p.tanggal_batas is not null
        and p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
        and p.status in ('baru', 'berjalan', 'bermasalah'))      as lewat_batas,
       (case when p.tanggal_batas is not null
             then (now() at time zone 'Asia/Jakarta')::date - p.tanggal_batas
             else null end)                                       as hari_terlampaui
  from public.penugasan p;

grant select on public.penugasan_tampil to authenticated;
