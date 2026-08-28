-- =====================================================================
-- Seed lengkap — unit + personel dalam satu jalan
-- Aman dijalankan berkali-kali (ON CONFLICT menjaga tidak dobel).
-- =====================================================================

-- ---- 1. Unit ----
insert into public.unit (nama, keterangan, urutan, kode_klasifikasi) values
  ('Unit I',   'Subdit IV Ditreskrimsus Polda Jawa Barat', 1, '5.3'),
  ('Unit II',  'Subdit IV Ditreskrimsus Polda Jawa Barat', 2, null),
  ('Unit III', 'Subdit IV Ditreskrimsus Polda Jawa Barat', 3, null),
  ('Unit IV',  'Subdit IV Ditreskrimsus Polda Jawa Barat', 4, null)
on conflict (nama) do update set
  keterangan = excluded.keterangan,
  urutan     = excluded.urutan;

-- ---- 2. Personel ----
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
  true
from (values
  ('83101429', 'OLMA FRIDOKI, S.H., S.I.K., M.H.',   'AKBP',     'kasubdit', 'Unit I'),
  ('89120541', 'TITO WITULAR, S.E., M.H.',           'AKP',      'kanit',    'Unit I'),
  ('82080373', 'AGUNG RAHMATULLOH, S.H.',            'AKP',      'panit',    'Unit I'),
  ('79090418', 'AHMAD FAUZI, S.H.',                  'IPTU',     'panit',    'Unit I'),
  ('92080083', 'RADEN AGUNG PAMUJI, S.H., M.M.',     'IPDA',     'panit',    'Unit I'),
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
  ('79020096', 'TRI WAHYU WIDODO, S.H.',             'AKP',      'kanit',    'Unit II'),
  ('73040181', 'Dr. H. PRIBADI ATMA, S.Pd., M.H.',   'KOMPOL',   'kanit',    'Unit III'),
  ('69120298', 'AJI SUSANTO, S.H., M.H.',            'KOMPOL',   'kanit',    'Unit IV'),
  ('00000000', 'AKUN PEMELIHARAAN',                  null,       'pemeliharaan', null)
) as d(nrp, nama, pangkat, peran, unit)
join auth.users a on a.email = d.nrp || '@sipantau.internal'
on conflict (id) do update set
  nama    = excluded.nama,
  pangkat = excluded.pangkat,
  peran   = excluded.peran,
  unit_id = excluded.unit_id;

-- ---- 3. Pemeriksaan ----
select
  count(*)                                       as total_akun,
  count(*) filter (where peran = 'kasubdit')     as kasubdit,
  count(*) filter (where peran = 'kanit')        as kanit,
  count(*) filter (where peran = 'panit')        as panit,
  count(*) filter (where peran = 'anggota')      as anggota,
  count(*) filter (where peran = 'pemeliharaan') as pemeliharaan,
  count(*) = 21                                  as lengkap
from public.users;
