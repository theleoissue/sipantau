-- =====================================================================
-- Seed 001 — Daftar unit Subdit IV
-- =====================================================================
--
-- SUMBER: bagan "STRUKTUR ORGANISASI DITRESKRIMSUS POLDA JABAR",
-- Perpol Nomor 03 Tahun 2024. Subdit IV membawahi empat unit, Unit I
-- sampai Unit IV.
--
-- Butir A-06 (daftar resmi unit) dengan ini TERJAWAB untuk Subdit IV.
--
-- ---------------------------------------------------------------------
-- YANG MASIH KURANG: kode_klasifikasi
--
-- Kode klasifikasi surat dipakai menyusun nomor SPT dengan pola
--   SP.Gas.Lidik/<nomor agenda>/<bulan romawi>/RES.<kode>/<tahun>/<kesatuan>
--
-- Kode ini TIDAK dapat diturunkan dari data mana pun — ia berasal dari
-- tata naskah dinas dan harus diisi manual per unit. Baru Unit I yang
-- terisi (5.3), dan itu pun berasal dari contoh nomor SPT pada mockup,
-- bukan dari dokumen resmi.
--
-- Selama kode sebuah unit kosong, wizard penerbitan SPT tetap berjalan
-- tetapi kerangka nomor yang disodorkan akan berisi "RES.__" yang harus
-- diketik sendiri oleh Kanit.
-- ---------------------------------------------------------------------

insert into public.unit (nama, keterangan, urutan, kode_klasifikasi) values
  ('Unit I',   'Subdit IV Ditreskrimsus Polda Jawa Barat', 1, '5.3'),
  ('Unit II',  'Subdit IV Ditreskrimsus Polda Jawa Barat', 2, null),
  ('Unit III', 'Subdit IV Ditreskrimsus Polda Jawa Barat', 3, null),
  ('Unit IV',  'Subdit IV Ditreskrimsus Polda Jawa Barat', 4, null)
on conflict (nama) do update set
  keterangan = excluded.keterangan,
  urutan     = excluded.urutan;
