-- =====================================================================
-- 0044 — Pemberitahuan MENDESAK ikut sampai ke unit yang sedang Piket
--
-- Bagian ketiga dari empat yang diminta pemilik produk bersama modul
-- jadwal piket (0042/0043).
--
-- KENAPA DI SINI, BUKAN DI TIAP PEMICU. Penerima pemberitahuan
-- ditentukan di beberapa tempat terpisah — fn_notifikasi_spt_bermasalah
-- (0026), sesi menggantung dan penerbitan SPT (0021), dan kelak yang
-- belum ditulis. Menyunting satu per satu berarti aturan yang sama
-- disalin ke banyak tempat, dan yang berikutnya ditulis orang lain
-- akan melewatkannya diam-diam — persis kelas kegagalan yang
-- diperingatkan CLAUDE.md §11.
--
-- fn_buat_notifikasi SUDAH menerima p_mendesak, dan seluruh jalur
-- melewatinya. Menambahkan penerima di sini berarti aturannya berlaku
-- untuk setiap jenis mendesak yang ada sekarang DAN yang dibuat nanti,
-- tanpa seorang pun perlu mengingatnya.
--
-- SIFATNYA MENAMBAH, TIDAK PERNAH MENGURANGI. Penerima aslinya tetap
-- utuh; Kanit unit yang sedang Piket ditambahkan di sampingnya. Tidak
-- ada seorang pun yang kehilangan kabar karena perubahan ini.
--
-- Bila jadwal piket belum disusun, sub-kueri di bawah tidak
-- menghasilkan apa-apa dan perilakunya sama persis seperti sebelum
-- migrasi ini. Modul tambahan tidak boleh mengubah perilaku yang sudah
-- berjalan hanya karena datanya kosong.
-- =====================================================================

create or replace function public.fn_buat_notifikasi(
  p_jenis        text,
  p_penerima     uuid[],
  p_judul        text,
  p_isi          text,
  p_tujuan_jenis public.jenis_tujuan_notifikasi,
  p_tujuan_id    uuid,
  p_penugasan_id uuid default null,
  p_laporan_id   uuid default null,
  p_mendesak     boolean default false,
  p_pelaku       uuid default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  insert into public.notifikasi
    (penerima_id, jenis, judul, isi, tujuan_jenis, tujuan_id,
     penugasan_id, laporan_id, mendesak)
  select distinct u.id, p_jenis, p_judul, p_isi, p_tujuan_jenis, p_tujuan_id,
         p_penugasan_id, p_laporan_id, p_mendesak
    from public.users u
   -- Ketiga penyaring ini TIDAK BERUBAH dari 0020, dan sengaja tetap
   -- berlaku bagi penerima tambahan: Kanit piket yang akunnya nonaktif
   -- atau yang justru pelaku peristiwanya tetap tidak menerima apa pun.
   where u.aktif = true                              -- KP-6.9-05
     and u.peran <> 'pemeliharaan'                    -- KP-6.9-41
     and (p_pelaku is null or u.id <> p_pelaku)       -- KP-6.9-04, BR-74
     and (
       -- Penerima yang memang dituju pemanggil.
       u.id = any(p_penerima)
       -- ...ditambah Kanit unit yang sedang Piket, HANYA untuk yang
       -- mendesak. Jenis biasa tidak ikut: BR-75 membedakan keduanya,
       -- dan membanjiri unit piket dengan kabar rutin unit lain akan
       -- membuat yang mendesak justru tenggelam.
       or (
         p_mendesak
         and u.peran = 'kanit'
         and u.unit_id in (
           select j.unit_id from public.jadwal_piket j
            -- Asia/Jakarta, BUKAN current_date: server berjalan UTC,
            -- dan tanpa ini "hari ini" berganti pukul 07.00 WIB
            -- sehingga selama tujuh jam setiap hari kabar mendesak
            -- dikirim ke unit yang giliran piketnya sudah lewat
            -- (CLAUDE.md §5.5).
            where j.tanggal = (now() at time zone 'Asia/Jakarta')::date
              and j.keadaan = 'piket'
         )
       )
     );

  -- distinct di atas menanggung keadaan yang paling sering terjadi:
  -- Kanit unit piket yang KEBETULAN juga penerima aslinya. Ia menerima
  -- satu pemberitahuan, bukan dua.
  get diagnostics n = row_count;
  return n;
end;
$$;
