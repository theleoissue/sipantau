-- =====================================================================
-- 0039 — Kolom jabatan pada akun + pengaturan pejabat penanda tangan
--
-- Keduanya dituntut lampiran Surat Perintah resmi (contoh dokumen
-- sungguhan diberikan pemilik produk, 1 September 2026):
--
--   * Lampiran "DAFTAR NAMA PENYELIDIK" berkolom Jabatan, berisi
--     "KANIT I SUBDIT IV", "PANIT II UNIT I SUBDIT IV", "BANIT I
--     SUBDIT IV". Tidak dapat diturunkan dari peran+unit: nomor urut
--     Panit (I vs II) tidak ada di mana pun pada model data.
--
--   * Surat ditandatangani "a.n. DIREKTUR RESERSE KRIMINAL KHUSUS
--     POLDA JABAR / WADIR / Selaku Penyidik" — pejabat yang TIDAK ADA
--     di model data sama sekali (sistem hanya mengenal Kasubdit, Kanit,
--     Panit, Anggota, Admin, Pemeliharaan). Disimpan sebagai pengaturan
--     tetap satu baris, bukan diketik ulang tiap kali SPT diterbitkan.
-- =====================================================================

-- BR-77: ditelusuri lebih dulu — 'jabatan' TIDAK pernah ada di kolom
-- mana pun maupun migrasi mana pun sebelum ini.
alter table public.users add column if not exists jabatan text;

comment on column public.users.jabatan is
  'Jabatan resmi sebagaimana tercetak pada lampiran Surat Perintah, mis. "BANIT I SUBDIT IV". Dikunci hanya untuk Admin (fn_jaga_kolom_users).';


-- ---------------------------------------------------------------------
-- fn_jaga_kolom_users — ditulis ulang HANYA untuk mengunci jabatan.
-- Sisanya identik dengan versi 0034; badan fungsi disalin apa adanya
-- karena PostgreSQL tidak mengenal penambalan sebagian.
-- ---------------------------------------------------------------------
create or replace function public.fn_jaga_kolom_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_peran text := (select sipantau_auth.peran_saya());
  v_resmi boolean := coalesce(current_setting('sipantau.jalur_resmi', true), '') = 'on';
begin
  if v_peran = 'admin' then
    return new;
  end if;

  -- jabatan IKUT DIKUNCI di sini sejak 0039: ia tercetak pada lampiran
  -- Surat Perintah sebagai jabatan resmi pemegang perintah. Pemicu ini
  -- memakai daftar-larangan, jadi tanpa baris ini kolom baru otomatis
  -- boleh diubah pemiliknya sendiri lewat users_ubah_diri_sendiri —
  -- artinya siapa pun dapat menuliskan jabatannya sendiri di surat dinas.
  -- Ikut jalur_resmi yang sama supaya fungsi Manajemen Akun tetap bisa
  -- mengisinya atas nama Admin.
  if new.peran is distinct from old.peran
     or new.unit_id is distinct from old.unit_id
     or new.jabatan is distinct from old.jabatan then
    if not v_resmi then
      raise exception 'KOLOM_TERKUNCI: peran, unit, dan jabatan hanya dapat diubah Admin';
    end if;
  end if;

  if new.nrp is distinct from old.nrp
     or new.email_sistem is distinct from old.email_sistem then
    raise exception 'KOLOM_TERKUNCI: NRP tidak dapat diubah';
  end if;

  if new.aktif is distinct from old.aktif
     and v_peran <> 'pemeliharaan'
     and not v_resmi then
    raise exception 'KOLOM_TERKUNCI: status aktif hanya dapat diubah Admin atau Akun Pemeliharaan';
  end if;

  if v_peran = 'kanit' and new.id <> (select auth.uid()) then
    if new.nama              is distinct from old.nama
       or new.pangkat        is distinct from old.pangkat
       or new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: Kanit hanya dapat menyalakan penggantian kata sandi';
    end if;
  end if;

  if new.foto_acuan_wajah is distinct from old.foto_acuan_wajah then
    raise exception 'KOLOM_TERKUNCI: foto_acuan_wajah belum boleh diisi';
  end if;

  if not v_resmi then
    if new.wajib_ganti_sandi is distinct from old.wajib_ganti_sandi
       and v_peran not in ('kanit', 'pemeliharaan') then
      raise exception 'KOLOM_TERKUNCI: wajib_ganti_sandi hanya berubah lewat penggantian kata sandi yang sah';
    end if;

    if new.terakhir_masuk is distinct from old.terakhir_masuk then
      raise exception 'KOLOM_TERKUNCI: terakhir_masuk hanya diisi sistem saat masuk';
    end if;
  end if;

  new.diubah_pada := now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- pengaturan_surat — satu baris, berisi identitas pejabat penanda
-- tangan dan kota penerbitan. Dikunci satu baris oleh chk_baris_tunggal
-- supaya tidak pernah ada dua sumber kebenaran yang saling bertentangan.
-- ---------------------------------------------------------------------
create table if not exists public.pengaturan_surat (
  id                 boolean primary key default true,
  kota               text not null default 'Bandung',
  atas_nama          text not null default 'a.n. DIREKTUR RESERSE KRIMINAL KHUSUS POLDA JABAR',
  jabatan            text not null default 'WADIR',
  keterangan_jabatan text not null default 'Selaku Penyidik',
  nama               text,
  pangkat            text,
  nrp                text,
  diubah_pada        timestamptz not null default now(),
  diubah_oleh        uuid references public.users (id),
  constraint chk_baris_tunggal check (id)
);

comment on table public.pengaturan_surat is
  'Identitas pejabat penanda tangan Surat Perintah. Selalu tepat satu baris (chk_baris_tunggal).';

insert into public.pengaturan_surat (id) values (true) on conflict (id) do nothing;

alter table public.pengaturan_surat enable row level security;

-- Dibaca SIAPA PUN yang sudah masuk: setiap peran yang boleh membuka
-- halaman cetak Surat Perintah membutuhkannya untuk menyusun blok tanda
-- tangan. Isinya bukan data perkara, hanya identitas pejabat yang memang
-- tercetak di setiap surat.
grant select on public.pengaturan_surat to authenticated;
grant update on public.pengaturan_surat to authenticated;

create policy pengaturan_surat_baca on public.pengaturan_surat
  for select to authenticated using (true);

-- Ditulis Admin saja — sama seperti seluruh kewenangan Manajemen Akun
-- sejak migrasi 0033. Tidak ada insert maupun delete bagi siapa pun:
-- barisnya sudah ada sejak migrasi ini dan tidak boleh bertambah.
create policy pengaturan_surat_ubah_admin on public.pengaturan_surat
  for update to authenticated
  using ((select sipantau_auth.peran_saya()) = 'admin')
  with check ((select sipantau_auth.peran_saya()) = 'admin');
