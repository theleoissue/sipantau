-- =====================================================================
-- 0069 — Mencabut hak eksekusi fungsi security definer yang bukan pintu RPC
--
-- TEMUAN
--
-- Diperiksa 13 September 2026 langsung ke basis data produksi:
-- 46 dari 91 fungsi security definer di skema public dapat dieksekusi
-- peran anon. ACL-nya seragam `=X/postgres` — hak EXECUTE bawaan
-- PostgreSQL kepada PUBLIC pada setiap fungsi baru, yang tidak pernah
-- dicabut migrasi pembuatnya. Tidak ada hibah langsung kepada anon
-- maupun authenticated; seluruhnya lewat PUBLIC.
--
-- Rangka uji pglite tidak pernah memeriksa hak eksekusi fungsi-fungsi
-- ini, jadi seluruh uji lulus. Uji penjaganya kini ada di
-- supabase/tests/uji-hak-fungsi.mjs, dan mencakup SELURUH fungsi security
-- definer — termasuk yang ditulis sesudah berkas ini.
--
-- YANG TERBUKTI DARI KODENYA (bukan dugaan)
--
-- Anon memegang kunci yang memang publik (terbundel di APK dan situs),
-- jadi setiap fungsi di bawah dapat dipanggil lewat /rest/v1/rpc/<nama>
-- tanpa masuk. Seluruh serangan di bawah membutuhkan UUID sasaran — itu
-- mempersempit, bukan menutup: bekas anggota yang akunnya sudah
-- dinonaktifkan tetap mengingat UUID yang pernah ia lihat.
--
--   fn_buat_notifikasi (0020)
--     Tidak memeriksa pemanggil sama sekali. Menyisipkan pemberitahuan
--     berjudul dan berisi bebas, termasuk mendesak = true, kepada setiap
--     UUID pengguna aktif yang disebut. Setiap baris baru memicu Database
--     Webhook dorong_notifikasi -> dorongan FCM bersuara ke HP penerima.
--     Pengguna authenticated mana pun dapat melakukan hal yang sama.
--
--   fn_catat_titik (0062)
--     Penjaga kepemilikannya `pengguna_id <> (select auth.uid())`. Bagi
--     anon auth.uid() bernilai NULL, perbandingan itu NULL, dan IF
--     menganggapnya salah — penjaganya dilewati. Pemegang UUID sebuah
--     Sesi Tugas yang masih terbuka dapat menyisipkan Titik palsu,
--     memindahkan posisi_terkini di peta pimpinan, dan menulis
--     users.terakhir_terlihat milik petugas itu. Pencabutan di bawah
--     menutup jalurnya; penjaga NULL-nya sendiri dicatat terpisah.
--
--   fn_tutup_sesi_tugas (0021)
--     Tidak memeriksa pemanggil. Menutup Sesi Tugas mana pun dengan sebab
--     dan ditutup_oleh sebebas pemanggil, menghapus posisi_terkini-nya,
--     dan untuk sebab keluar_aplikasi mengirim pemberitahuan MENDESAK ke
--     Kanit dan Panit SPT itu.
--
--   penerima_pengawas_spt, penerima_pelaksana_spt (0020)
--   penerima_kanit_unit (0055)
--     Tidak memeriksa pemanggil. Mengembalikan UUID Kanit, Panit, atau
--     pelaksana untuk UUID SPT/unit yang disebut — persis bahan yang
--     dibutuhkan fn_buat_notifikasi di atas. penerima_kanit_unit tidak
--     pernah terbuka bagi anon, tetapi 0055 sengaja memberinya kepada
--     authenticated padahal aplikasi tidak memanggilnya lewat RPC; ia hanya
--     dipanggil dari dalam empat fungsi security definer.
--
--   kerja_* (enam) dan fn_bersihkan_foto_yatim
--     Tidak memeriksa pemanggil, tetapi juga tidak menerima argumen: yang
--     dikerjakan persis yang dikerjakan penjadwal, hanya lebih awal.
--     Risikonya bukan kebocoran data melainkan beban — pemanggilan
--     berulang atas perulangan dan penghapusan yang berat.
--
--   34 fungsi pemicu
--     PostgreSQL menolak memanggil fungsi yang mengembalikan `trigger`
--     di luar pemicu ("trigger functions can only be called as
--     triggers"), jadi tidak dapat disalahgunakan lewat RPC. Tetap dicabut:
--     tidak ada alasan hak itu ada.
--
-- DAFTAR IZIN
--
-- Tidak satu pun dari 47 fungsi di bawah dipanggil aplikasi lewat
-- supabase.rpc() (app/, lib/, components/) maupun dari Fungsi Tepi
-- (supabase/functions/). Pintu RPC yang sah sudah benar haknya sejak
-- migrasinya masing-masing dan tidak disentuh berkas ini.
--
-- KENAPA PENCABUTAN INI TIDAK MEMUTUS APA PUN (diperiksa di produksi)
--
--   1. Pemicu. Hak EXECUTE atas fungsi pemicu hanya diperiksa saat
--      CREATE TRIGGER, tidak saat pemicunya berjalan. Dibuktikan uji
--      U-HAK-12: UPDATE oleh authenticated tetap dijaga pemicu yang
--      fungsinya sudah tidak dapat ia eksekusi.
--   2. Pemanggilan dari dalam fungsi security definer. Selama fungsi
--      pemanggil berjalan, current_user adalah pemiliknya (postgres), dan
--      hak pemilik tidak ikut tercabut. Seluruh pemanggil 12 fungsi non-
--      pemicu di bawah adalah fungsi security definer milik postgres —
--      dibuktikan U-HAK-13, U-HAK-14, dan seluruh berkas uji lain yang berjalan
--      sebagai authenticated.
--   3. pg_cron. Kedelapan pekerjaan terjadwal di cron.job berjalan dengan
--      username postgres, pemilik fungsinya. postgres di Supabase BUKAN
--      superuser, jadi yang menyelamatkannya adalah hak pemilik, bukan
--      kekebalan — dan hak itu tidak disentuh.
--   4. Kebijakan RLS, tampilan, nilai bawaan kolom, dan fungsi invoker —
--      yang dievaluasi sebagai pemanggil — tidak satu pun merujuk 47 fungsi
--      di bawah.
--
-- service_role tidak disentuh: hibah langsung kepadanya tidak memberi
-- apa pun yang tidak sudah dimilikinya lewat kunci itu.
--
-- Pola dua baris per fungsi mengikuti 0068: pencabutan dari PUBLIC
-- menutup hak bawaannya, pencabutan eksplisit dari anon dan authenticated
-- menjaga seandainya hak itu pernah diberikan langsung.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Fungsi yang dapat dipanggil lewat RPC — prioritas
-- ---------------------------------------------------------------------
revoke all on function public.fn_buat_notifikasi(text, uuid[], text, text, public.jenis_tujuan_notifikasi, uuid, uuid, uuid, boolean, uuid) from public;
revoke all on function public.fn_buat_notifikasi(text, uuid[], text, text, public.jenis_tujuan_notifikasi, uuid, uuid, uuid, boolean, uuid) from anon, authenticated;

revoke all on function public.fn_catat_titik(uuid, numeric, numeric, numeric, numeric, numeric, smallint, public.sumber_lokasi_titik, uuid, timestamptz, text, text, boolean) from public;
revoke all on function public.fn_catat_titik(uuid, numeric, numeric, numeric, numeric, numeric, smallint, public.sumber_lokasi_titik, uuid, timestamptz, text, text, boolean) from anon, authenticated;

revoke all on function public.fn_tutup_sesi_tugas(uuid, public.sebab_penutupan_sesi, uuid) from public;
revoke all on function public.fn_tutup_sesi_tugas(uuid, public.sebab_penutupan_sesi, uuid) from anon, authenticated;

revoke all on function public.penerima_pengawas_spt(uuid) from public;
revoke all on function public.penerima_pengawas_spt(uuid) from anon, authenticated;

revoke all on function public.penerima_pelaksana_spt(uuid) from public;
revoke all on function public.penerima_pelaksana_spt(uuid) from anon, authenticated;

-- Hibah 0055 kepada authenticated ikut dicabut di sini.
revoke all on function public.penerima_kanit_unit(uuid) from public;
revoke all on function public.penerima_kanit_unit(uuid) from anon, authenticated;

-- ---------------------------------------------------------------------
-- Pekerjaan berjadwal — hanya pg_cron (postgres) yang menjalankannya
-- ---------------------------------------------------------------------
revoke all on function public.fn_bersihkan_foto_yatim() from public;
revoke all on function public.fn_bersihkan_foto_yatim() from anon, authenticated;

revoke all on function public.kerja_bersihkan_langganan_mati() from public;
revoke all on function public.kerja_bersihkan_langganan_mati() from anon, authenticated;

revoke all on function public.kerja_jaga_keaktifan() from public;
revoke all on function public.kerja_jaga_keaktifan() from anon, authenticated;

revoke all on function public.kerja_periksa_lewat_batas() from public;
revoke all on function public.kerja_periksa_lewat_batas() from anon, authenticated;

revoke all on function public.kerja_susut_titik_lokasi() from public;
revoke all on function public.kerja_susut_titik_lokasi() from anon, authenticated;

revoke all on function public.kerja_susutkan_notifikasi() from public;
revoke all on function public.kerja_susutkan_notifikasi() from anon, authenticated;

revoke all on function public.kerja_tutup_sesi_menggantung() from public;
revoke all on function public.kerja_tutup_sesi_menggantung() from anon, authenticated;

-- ---------------------------------------------------------------------
-- Fungsi pemicu — tidak dapat dipanggil lewat RPC, tetap dicabut
-- ---------------------------------------------------------------------
revoke all on function public.fn_catat_sunting_spt() from public;
revoke all on function public.fn_catat_sunting_spt() from anon, authenticated;

revoke all on function public.fn_hitung_lokasi_laporan() from public;
revoke all on function public.fn_hitung_lokasi_laporan() from anon, authenticated;

revoke all on function public.fn_isi_sesi_tugas() from public;
revoke all on function public.fn_isi_sesi_tugas() from anon, authenticated;

revoke all on function public.fn_jaga_dasar_terakhir() from public;
revoke all on function public.fn_jaga_dasar_terakhir() from anon, authenticated;

revoke all on function public.fn_jaga_kasubdit_terakhir() from public;
revoke all on function public.fn_jaga_kasubdit_terakhir() from anon, authenticated;

revoke all on function public.fn_jaga_kolom_panit() from public;
revoke all on function public.fn_jaga_kolom_panit() from anon, authenticated;

revoke all on function public.fn_jaga_kolom_pelaksana() from public;
revoke all on function public.fn_jaga_kolom_pelaksana() from anon, authenticated;

revoke all on function public.fn_jaga_kolom_penugasan() from public;
revoke all on function public.fn_jaga_kolom_penugasan() from anon, authenticated;

revoke all on function public.fn_jaga_kolom_users() from public;
revoke all on function public.fn_jaga_kolom_users() from anon, authenticated;

revoke all on function public.fn_jaga_lokasi_berkoordinat_terakhir() from public;
revoke all on function public.fn_jaga_lokasi_berkoordinat_terakhir() from anon, authenticated;

revoke all on function public.fn_jaga_lokasi_terakhir() from public;
revoke all on function public.fn_jaga_lokasi_terakhir() from anon, authenticated;

revoke all on function public.fn_jaga_panit_terakhir() from public;
revoke all on function public.fn_jaga_panit_terakhir() from anon, authenticated;

revoke all on function public.fn_jaga_pelaksana_anggota_terakhir() from public;
revoke all on function public.fn_jaga_pelaksana_anggota_terakhir() from anon, authenticated;

revoke all on function public.fn_jaga_petugas_lhp_tim() from public;
revoke all on function public.fn_jaga_petugas_lhp_tim() from anon, authenticated;

revoke all on function public.fn_jaga_transisi_status_spt() from public;
revoke all on function public.fn_jaga_transisi_status_spt() from anon, authenticated;

revoke all on function public.fn_kunci_laporan() from public;
revoke all on function public.fn_kunci_laporan() from anon, authenticated;

revoke all on function public.fn_kunci_lhp() from public;
revoke all on function public.fn_kunci_lhp() from anon, authenticated;

revoke all on function public.fn_larang_tinjau_sendiri() from public;
revoke all on function public.fn_larang_tinjau_sendiri() from anon, authenticated;

revoke all on function public.fn_minta_perbaikan() from public;
revoke all on function public.fn_minta_perbaikan() from anon, authenticated;

revoke all on function public.fn_notifikasi_akun_nonaktif() from public;
revoke all on function public.fn_notifikasi_akun_nonaktif() from anon, authenticated;

revoke all on function public.fn_notifikasi_catatan() from public;
revoke all on function public.fn_notifikasi_catatan() from anon, authenticated;

revoke all on function public.fn_notifikasi_hanya_tandai_baca() from public;
revoke all on function public.fn_notifikasi_hanya_tandai_baca() from anon, authenticated;

revoke all on function public.fn_notifikasi_laporan_masuk() from public;
revoke all on function public.fn_notifikasi_laporan_masuk() from anon, authenticated;

revoke all on function public.fn_notifikasi_pelaksana_dicabut() from public;
revoke all on function public.fn_notifikasi_pelaksana_dicabut() from anon, authenticated;

revoke all on function public.fn_notifikasi_pelaksana_ditugaskan() from public;
revoke all on function public.fn_notifikasi_pelaksana_ditugaskan() from anon, authenticated;

revoke all on function public.fn_notifikasi_penugasan() from public;
revoke all on function public.fn_notifikasi_penugasan() from anon, authenticated;

revoke all on function public.fn_periksa_pelapor_aktif() from public;
revoke all on function public.fn_periksa_pelapor_aktif() from anon, authenticated;

revoke all on function public.fn_periksa_syarat_terbit() from public;
revoke all on function public.fn_periksa_syarat_terbit() from anon, authenticated;

revoke all on function public.fn_reset_penanda_lewat_batas() from public;
revoke all on function public.fn_reset_penanda_lewat_batas() from anon, authenticated;

revoke all on function public.fn_spt_baru_ke_berjalan() from public;
revoke all on function public.fn_spt_baru_ke_berjalan() from anon, authenticated;

revoke all on function public.fn_tandai_sunting() from public;
revoke all on function public.fn_tandai_sunting() from anon, authenticated;

revoke all on function public.fn_tutup_sesi_akun_nonaktif() from public;
revoke all on function public.fn_tutup_sesi_akun_nonaktif() from anon, authenticated;

revoke all on function public.fn_tutup_sesi_pelaksana_dicabut() from public;
revoke all on function public.fn_tutup_sesi_pelaksana_dicabut() from anon, authenticated;

revoke all on function public.fn_tutup_sesi_spt_selesai() from public;
revoke all on function public.fn_tutup_sesi_spt_selesai() from anon, authenticated;

-- ---------------------------------------------------------------------
-- Penjaga di tempat: gagal terlihat jelas saat dijalankan, bukan senyap.
--
-- Bila ada fungsi security definer di public yang masih dapat dieksekusi
-- anon — misalnya dibuat di produksi di luar migrasi, dengan tanda tangan
-- berbeda dari yang tertulis di atas — seluruh berkas ini batal dan
-- namanya disebut. Begitu pula bila hak pemilik atas pekerjaan terjadwal
-- ternyata ikut hilang, yang berarti pg_cron akan gagal diam-diam.
-- ---------------------------------------------------------------------
do $$
declare
  v_terbuka text;
  v_cron    text;
begin
  select string_agg(p.oid::regprocedure::text, ', ' order by p.proname)
    into v_terbuka
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.prosecdef
     and pg_catalog.has_function_privilege('anon', p.oid, 'execute');

  if v_terbuka is not null then
    raise exception 'MASIH_TERBUKA_ANON: %', v_terbuka;
  end if;

  select string_agg(p.oid::regprocedure::text, ', ' order by p.proname)
    into v_cron
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and (p.proname like 'kerja\_%' or p.proname = 'fn_bersihkan_foto_yatim')
     and not pg_catalog.has_function_privilege(p.proowner, p.oid, 'execute');

  if v_cron is not null then
    raise exception 'PEMILIK_KEHILANGAN_HAK: %', v_cron;
  end if;
end
$$;
