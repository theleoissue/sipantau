-- =====================================================================
-- 0032 — Menambah peran 'admin' dan nilai jejak audit terkait
-- =====================================================================
--
-- KEPUTUSAN SADAR MENGUBAH PRD, bukan tebakan diam-diam. PRD sistem ini
-- (docs/60-modul-6.6-6.9-user-notif.md baris 948) eksplisit menyatakan
-- "Peran kelima atau peran khusus di luar empat peran organisasi" wajib
-- dihindari — "Akun Pemeliharaan bukan peran; menambahnya akan merusak
-- seluruh matriks hak akses." Pemilik produk sudah diberi tahu isi
-- larangan ini secara lengkap (termasuk KP-6.6-35: Akun Pemeliharaan
-- sengaja dilarang membuat/menonaktifkan akun) dan tetap memilih
-- melanjutkan.
--
-- Peran 'admin' MENGGANTIKAN Kasubdit khusus untuk Manajemen Akun
-- (Modul 6.6) — Kasubdit kehilangan kewenangan itu, tetap memegang
-- Rekap Lintas Unit dan seluruh hak lihat lintas-unit lainnya. Admin
-- mendapat hak lihat lintas-unit yang SAMA PERSIS dengan Kasubdit di
-- seluruh sistem, ditambah Manajemen Akun eksklusif. Rincian transfer
-- kebijakan RLS ada di migrasi 0033 (berkas terpisah — nilai enum baru
-- tidak boleh dipakai dalam transaksi yang sama dengan pembuatannya).
-- =====================================================================

alter type public.peran_pengguna add value if not exists 'admin';

-- ---------------------------------------------------------------------
-- jenis_tindakan_audit: KP-6.6-36/37/38 mensyaratkan jejak audit untuk
-- pembuatan akun, penyuntingan akun, dan perubahan unit — 'reset_sandi',
-- 'ubah_peran', 'nonaktifkan_akun', 'aktifkan_akun' SUDAH ada sejak
-- 0003 (BR-77: ditelusuri dulu, bukan diasumsikan baru). Tiga nilai di
-- bawah ini yang benar-benar belum ada.
-- ---------------------------------------------------------------------
do $$
declare
  v text;
begin
  foreach v in array array['buat_akun', 'sunting_akun', 'ubah_unit']
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
