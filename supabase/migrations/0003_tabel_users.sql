-- =====================================================================
-- 0003 — Tabel users, perangkat_masuk, jejak_audit
-- Sumber: docs/10-modul-6.1-auth.md §5.1, §5.12, §5.13 [FINAL]
-- =====================================================================
--
-- URUTAN: kebijakan RLS ketiga tabel ini ada di 0005. Lihat catatan
-- pada 0002 untuk alasannya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Daftar tertutup peran. Lima nilai, termasuk Akun Pemeliharaan yang
-- BUKAN peran kelima melainkan akun teknis (docs/10-modul-6.1 §2.5).
--
-- BR-77: sebelum menambah nilai ke enum ini, telusuri dulu apakah sudah
-- ada. Daftar ini tidak boleh diganti utuh oleh modul mana pun.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'peran_pengguna') then
    create type public.peran_pengguna as enum
      ('kasubdit', 'kanit', 'panit', 'anggota', 'pemeliharaan');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 5.1 Tabel users
--
-- id WAJIB bernilai sama dengan id pada auth.users bawaan Supabase.
-- Tanpa kesamaan ini seluruh aturan akses baris kehilangan pegangannya.
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id                   uuid primary key references auth.users (id) on delete restrict,
  nama                 text                  not null,
  nrp                  text                  not null unique,
  email_sistem         text                  not null unique,
  pangkat              text,
  peran                public.peran_pengguna not null,
  unit_id              uuid references public.unit (id),
  aktif                boolean               not null default true,
  wajib_ganti_sandi    boolean               not null default true,
  terakhir_masuk       timestamptz,
  foto_acuan_wajah     text,
  sedang_bertugas      boolean               not null default false,
  posisi_terakhir_lat  numeric,
  posisi_terakhir_lng  numeric,
  terakhir_terlihat    timestamptz,
  dibuat_pada          timestamptz           not null default now(),
  diubah_pada          timestamptz           not null default now(),

  -- Akun Pemeliharaan tidak melekat pada unit mana pun; keempat peran
  -- organisasi wajib punya unit (docs/10-modul-6.1 §5.1).
  constraint chk_users_unit_sesuai_peran check (
    (peran = 'pemeliharaan' and unit_id is null)
    or (peran <> 'pemeliharaan' and unit_id is not null)
  ),

  -- Email sintetis <nrp>@sipantau.internal. Dibangkitkan sistem, tidak
  -- pernah ditampilkan, tidak pernah dikirimi surat elektronik (AM-6.1-01).
  constraint chk_users_email_sintetis check (
    email_sistem = lower(nrp) || '@sipantau.internal'
  )
);

comment on column public.users.email_sistem is
  'Teknis semata. DILARANG ditampilkan di antarmuka, dipakai sebagai alamat kirim, atau dijadikan jalur pemulihan kata sandi.';
comment on column public.users.foto_acuan_wajah is
  'Disediakan KOSONG. Jangan diisi dan jangan dibaca modul mana pun sampai fitur verifikasi wajah disetujui tertulis (AM-6.1-17).';
comment on column public.users.terakhir_masuk is
  'Waktu berhasil masuk terakhir. JANGAN dicampur dengan terakhir_terlihat (koordinat).';

create index if not exists idx_users_unit
  on public.users (unit_id) where aktif = true;
create index if not exists idx_users_nrp on public.users (nrp);

alter table public.users enable row level security;
grant select, update on public.users to authenticated;

-- ---------------------------------------------------------------------
-- 5.12 Tabel perangkat_masuk — satu Perangkat Terdaftar per akun (BR-16)
--
-- Sengaja TIDAK diberi hak akses apa pun kepada authenticated
-- (docs/01-koreksi.md J.2). Seluruh penulisannya lewat fungsi
-- security definer dan pemicu. Tidak ada layar yang membacanya langsung;
-- membukanya berarti memberi tahu setiap pengguna perangkat apa yang
-- dipakai rekan-rekannya, tanpa ada yang membutuhkannya.
-- ---------------------------------------------------------------------
create table if not exists public.perangkat_masuk (
  user_id              uuid primary key references public.users (id) on delete cascade,
  penanda_perangkat    text        not null,
  keterangan_perangkat text,
  masuk_pada           timestamptz not null default now()
);

alter table public.perangkat_masuk enable row level security;
-- Tidak ada grant. Disengaja.

-- ---------------------------------------------------------------------
-- 5.13 Tabel jejak_audit — hanya-tambah (BR-22)
--
-- Baris tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran
-- mana pun, termasuk Akun Pemeliharaan. Karena itu grant-nya hanya
-- select + insert, tanpa update dan tanpa delete.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'jenis_tindakan_audit') then
    create type public.jenis_tindakan_audit as enum (
      'masuk_berhasil', 'keluar', 'geser_perangkat',
      'ganti_sandi', 'reset_sandi',
      'ubah_peran', 'nonaktifkan_akun', 'aktifkan_akun',
      'akses_pemeliharaan',
      'terbit_spt', 'tutup_spt', 'batal_spt', 'hapus_spt',
      'finalisasi_lhp', 'ekspor_dokumen'
    );
  end if;
end
$$;

create table if not exists public.jejak_audit (
  id             uuid primary key default gen_random_uuid(),
  pelaku_id      uuid references public.users (id),
  peran_pelaku   public.peran_pengguna,
  jenis_tindakan public.jenis_tindakan_audit not null,
  sasaran_tabel  text,
  sasaran_id     uuid,
  keterangan     text,
  waktu          timestamptz not null default now()
);

comment on column public.jejak_audit.peran_pelaku is
  'Disalin saat tindakan agar riwayat tetap terbaca meski peran pelaku berubah kemudian.';
comment on column public.jejak_audit.keterangan is
  'DILARANG memuat kata sandi dalam bentuk apa pun (KP-6.1-38).';

create index if not exists idx_jejak_audit_waktu on public.jejak_audit (waktu desc);
create index if not exists idx_jejak_audit_pelaku on public.jejak_audit (pelaku_id, waktu desc);
create index if not exists idx_jejak_audit_sasaran on public.jejak_audit (sasaran_tabel, sasaran_id);

alter table public.jejak_audit enable row level security;
grant select, insert on public.jejak_audit to authenticated;
