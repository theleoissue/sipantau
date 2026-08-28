-- =====================================================================
-- Seed 002 — Personel Unit I Subdit IV Ditreskrimsus Polda Jawa Barat
-- =====================================================================
--
-- SUMBER: berkas "DAFTAR ANGGOTA UNIT I SUBDIT IV DAN PEJABAT
-- DITRESKRIMSUS", dilengkapi bagan struktur organisasi Perpol Nomor 03
-- Tahun 2024 untuk Kanit Unit II, III, dan IV.
--
-- Nama ditulis huruf kapital mengikuti bentuk pada daftar resminya.
--
-- JALANKAN SETELAH akun-akunnya ada di Authentication > Users. Berkas
-- ini TIDAK membuat akun — ia menghubungkan akun yang sudah ada dengan
-- nama, pangkat, peran, dan unitnya. Untuk membuat ke-21 akunnya
-- sekaligus, pakai skrip `supabase/seed/buat-akun.mjs` (jauh lebih
-- cepat dan tidak rawan salah ketik daripada 21 kali klik Add user).
--
-- ---------------------------------------------------------------------
-- PEMETAAN JABATAN KE PERAN SISTEM
--
--   KASUBDIT        -> kasubdit   lingkup seluruh unit Subdit IV
--   KANIT           -> kanit      satu-satunya yang menerbitkan SPT
--   PANIT I/II/III  -> panit      lingkupnya ditentukan penunjukan per
--                                 SPT, BUKAN unitnya (BR-21)
--   BANIT           -> anggota    pelaksana lapangan
--
-- DIREKTUR dan WADIR TIDAK dimasukkan. Sistem ini hanya mengenal empat
-- peran, dan yang tertinggi adalah Kasubdit (docs/00-fondasi.md §2.1).
-- Memasukkan keduanya menuntut peran baru di atas Kasubdit, dan itu
-- perubahan PRD, bukan perubahan data. Bila pimpinan memang perlu
-- melihat sistem, jalan yang tersedia sekarang adalah memberi mereka
-- peran kasubdit — laporkan dulu ke pemilik produk sebelum melakukannya.
-- ---------------------------------------------------------------------

insert into public.users (id, nama, nrp, email_sistem, pangkat, peran, unit_id, wajib_ganti_sandi)
select
  a.id,
  d.nama,
  d.nrp,
  d.nrp || '@sipantau.internal',
  d.pangkat,
  d.peran::public.peran_pengguna,
  case when d.unit is null then null
       else (select id from public.unit where nama = d.unit) end,
  true   -- Kata sandi awal bersifat sementara dan wajib diganti (BR-18)
from (values
  -- ---- Kasubdit IV: lingkup seluruh unit ----
  ('83101429', 'OLMA FRIDOKI, S.H., S.I.K., M.H.',   'AKBP',     'kasubdit', 'Unit I'),

  -- ---- Kanit Unit I (pemilik produk) ----
  ('89120541', 'TITO WITULAR, S.E., M.H.',           'AKP',      'kanit',    'Unit I'),

  -- ---- Panit Unit I ----
  ('82080373', 'AGUNG RAHMATULLOH, S.H.',            'AKP',      'panit',    'Unit I'),
  ('79090418', 'AHMAD FAUZI, S.H.',                  'IPTU',     'panit',    'Unit I'),
  ('92080083', 'RADEN AGUNG PAMUJI, S.H., M.M.',     'IPDA',     'panit',    'Unit I'),

  -- ---- Banit Unit I (peran anggota) ----
  ('76050662', 'DEDI RUSTANDI, S.H., M.H.',          'AIPTU',    'anggota',  'Unit I'),
  ('84041750', 'RANGGA WIJAYA, S.H.',                'AIPDA',    'anggota',  'Unit I'),
  ('87010193', 'SANIEF ZAINAL, S.H.',                'AIPDA',    'anggota',  'Unit I'),
  ('93060056', 'DANI RAMDANI, S.H.',                 'BRIGADIR', 'anggota',  'Unit I'),
  ('94070195', 'BOBBY JULIANDA SAPUTRA, S.H.',       'BRIGADIR', 'anggota',  'Unit I'),
  ('93110719', 'YOGI ABDUL ROHMAN, S.H.',            'BRIGADIR', 'anggota',  'Unit I'),
  ('95100387', 'ADILLA NUR MUSLIMAH, S.I.Kom.',      'BRIGADIR', 'anggota',  'Unit I'),
  ('95050966', 'ARIK AGUNG RISANTO, S.H.',           'BRIGADIR', 'anggota',  'Unit I'),
  ('95100783', 'DEDE VERRY DASPIANTO, S.H.',         'BRIGADIR', 'anggota',  'Unit I'),
  ('96120409', 'PRIMAN PRATAMA, S.E.',               'BRIGADIR', 'anggota',  'Unit I'),
  ('97120227', 'ELSA SELVIA NADIANA, S.H.',          'BRIPTU',   'anggota',  'Unit I'),
  ('98060329', 'HEDDY FERDIANSYAH',                  'BRIPTU',   'anggota',  'Unit I'),

  -- ---- Kanit unit lain, dari bagan struktur ----
  -- Personel di bawah mereka belum didata. Ketiganya tetap disemai
  -- supaya isolasi lingkup data antar unit dapat diuji sungguhan.
  ('79020096', 'TRI WAHYU WIDODO, S.H.',             'AKP',      'kanit',    'Unit II'),
  ('73040181', 'Dr. H. PRIBADI ATMA, S.Pd., M.H.',   'KOMPOL',   'kanit',    'Unit III'),
  ('69120298', 'AJI SUSANTO, S.H., M.H.',            'KOMPOL',   'kanit',    'Unit IV'),

  -- ---- Akun Pemeliharaan ----
  -- Akun teknis, bukan peran kelima, tidak melekat pada unit mana pun
  -- (docs/10-modul-6.1-auth.md §2.5). Keberadaannya beserta nama
  -- pemegangnya WAJIB tercatat pada dokumen serah terima proyek —
  -- butir A-08 pada Lampiran A.
  ('00000000', 'AKUN PEMELIHARAAN',                  null,       'pemeliharaan', null)
) as d(nrp, nama, pangkat, peran, unit)
join auth.users a on a.email = d.nrp || '@sipantau.internal'
on conflict (id) do update set
  nama    = excluded.nama,
  pangkat = excluded.pangkat,
  peran   = excluded.peran,
  unit_id = excluded.unit_id;

-- ---------------------------------------------------------------------
-- Pemeriksaan. Kolom "lengkap" wajib bernilai true.
--
-- Bila kurang, berarti ada akun yang belum dibuat di Authentication >
-- Users, atau NRP-nya salah ketik sehingga alamatnya tidak berjodoh.
-- ---------------------------------------------------------------------
select
  count(*)                                       as total_akun,
  count(*) filter (where peran = 'kasubdit')     as kasubdit,
  count(*) filter (where peran = 'kanit')        as kanit,
  count(*) filter (where peran = 'panit')        as panit,
  count(*) filter (where peran = 'anggota')      as anggota,
  count(*) filter (where peran = 'pemeliharaan') as pemeliharaan,
  count(*) = 21                                  as lengkap
from public.users;
