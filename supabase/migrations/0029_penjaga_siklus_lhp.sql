-- =====================================================================
-- 0029 — Penjaga siklus LHP + pelebaran daftar tertutup notifikasi
-- Sumber: docs/00-fondasi.md §6.8, §6.9 (baris 1205)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Penguncian: begitu status 'final', tidak ada UPDATE apa pun yang
-- lolos — pola sama persis fn_kunci_laporan (0011). Transisi MASUK ke
-- 'final' (dilakukan finalkan_lhp(), 0030) tidak terblokir karena
-- pemicu memeriksa OLD.status, bukan NEW.status.
-- ---------------------------------------------------------------------
create or replace function public.fn_kunci_lhp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'final' then
    raise exception 'LHP_TERKUNCI: LHP sudah difinalkan, tidak dapat diubah';
  end if;

  new.diubah_pada := now();
  return new;
end;
$$;

create trigger trg_kunci_lhp
  before update on public.lhp
  for each row
  execute function public.fn_kunci_lhp();

-- ---------------------------------------------------------------------
-- Pelebaran daftar tertutup (BR-68/BR-72, 0019/0020).
--
-- BUKAN penambahan jenis baru di luar PRD: docs/00-fondasi.md §6.9
-- (baris 1205) SUDAH menyebut kejadian "LHP Ringkas difinalkan → Panit
-- dan Kanit pada unit terkait" sejak dokumen itu ditulis. Kejadian ini
-- tidak ikut masuk daftar chk_notifikasi_jenis saat Modul 6.9 dibangun
-- semata karena tabel lhp belum ada waktu itu (6.8 belum digali) — jadi
-- ini MELENGKAPI kejadian yang sudah didokumentasikan, bukan menebak
-- kejadian baru yang belum tercatat di mana pun.
--
-- ALTER TYPE ... ADD VALUE untuk jenis_tujuan_notifikasi TIDAK dipakai
-- dalam pernyataan lain pada berkas migrasi yang SAMA (batasan
-- PostgreSQL: nilai enum baru tidak boleh dipakai dalam transaksi yang
-- sama dengan pembuatannya) — pemakaiannya di finalkan_lhp() ditunda ke
-- 0030, berkas terpisah.
-- ---------------------------------------------------------------------
alter table public.notifikasi drop constraint if exists chk_notifikasi_jenis;
alter table public.notifikasi add constraint chk_notifikasi_jenis check (jenis in (
  'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
  'spt_dicabut', 'spt_ditutup',
  'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
  'laporan_perlu_diperbaiki', 'laporan_disetujui',
  'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
  'akun_dinonaktifkan', 'kata_sandi_direset',
  'lhp_difinalkan'
));

alter type public.jenis_tujuan_notifikasi add value if not exists 'lhp';

-- ---------------------------------------------------------------------
-- Pelebaran jenis_tindakan_audit (pola sama seperti 0007/0010/0015/0023)
-- — fondasi.md §9.6 secara eksplisit menyebut "finalisasi LHP" sebagai
-- tindakan yang wajib tercatat jejak auditnya. Sama seperti perluasan
-- di atas, ini MELENGKAPI kebutuhan yang sudah dituliskan, bukan
-- menambah kategori baru yang belum tercatat di mana pun.
-- ---------------------------------------------------------------------
do $$
declare
  v text;
begin
  foreach v in array array['mulai_lhp', 'finalkan_lhp']
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
