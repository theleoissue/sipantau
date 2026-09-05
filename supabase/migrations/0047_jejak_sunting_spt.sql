-- =====================================================================
-- 0047 — KP-6.2-39: jejak audit untuk suntingan SPT sesudah terbit
--
-- KP-6.2-39 (docs/20-modul-6.2-penugasan.md:370): "Bila SPT disunting
-- setelah terbit, maka perubahan tercatat pada jejak audit lengkap
-- dengan nama kolom, nilai lama, dan nilai baru."
--
-- Nilai enum 'sunting_spt' sudah lama ada — didaftarkan 0007 dan
-- diulang 0023 — tetapi tidak ada satu baris kode pun di seluruh
-- basis data maupun aplikasi yang pernah menuliskannya. Bukan
-- catatannya yang kurang lengkap: catatannya nol. Digabung dengan
-- celah yang ditutup 0046, akibatnya sebuah SPT dapat berubah dan
-- tidak ada cara membuktikan bahwa ia pernah berubah.
--
-- KENAPA PEMICU, BUKAN DITAMBAHKAN KE SERVER ACTION.
-- Penyuntingan SPT tidak melewati satu pintu. Kebijakan
-- penugasan_ubah_kanit (0008) memberi Kanit hak UPDATE langsung, jadi
-- jalurnya sebanyak cara orang memanggil PostgREST. Mencatat di satu
-- Server Action berarti mencatat satu jalur dan membiarkan sisanya —
-- pola kegagalan yang sudah tercatat di CLAUDE.md §11 ("aturan
-- diterapkan di satu tempat, tempat lain yang melanggar terlewat").
--
-- KOLOM YANG DIPANTAU. Hanya kolom isi surat. Yang sengaja di luar:
--   status  — sudah punya tindakan auditnya sendiri (terbit_spt,
--             tutup_spt, batal_spt, buka_kembali_spt, tandai_bermasalah,
--             kembalikan_dari_bermasalah) di KP-6.2-61
--   unit_id — tidak pernah dapat berubah sama sekali (0008/0046)
--   kolom sistem (diubah_pada, lewat_batas_diberitahukan_pada,
--             diterbitkan_pada/oleh) — bukan suntingan manusia
--
-- tanggal_batas TETAP dipantau meskipun perpanjang_batas (0025) sudah
-- mencatat 'perpanjang_batas' dan baris penugasan_perpanjangan.
-- Sebabnya: hak UPDATE langsung Kanit membuat tanggal_batas dapat
-- berubah TANPA melewati fungsi itu, dan jalur itulah yang justru perlu
-- tertangkap. Konsekuensinya perpanjangan resmi menghasilkan dua baris
-- jejak — itu diterima: KP-6.2-61 menjamin "satu baris" sebagai batas
-- bawah, bukan sebagai keharusan tunggal, dan hanya baris sunting_spt
-- yang memuat nilai lama dan nilai baru sebagaimana dituntut KP-6.2-39.
--
-- old.status = 'draf' DILEWATI. Draf belum terbit; menyuntingnya adalah
-- penyusunan biasa, bukan perubahan atas surat yang sudah berlaku.
--
-- auth.uid() null DILEWATI. Pekerjaan pg_cron (kerja_periksa_lewat_batas,
-- 0026) menyentuh penugasan tanpa sesi siapa pun; catat_jejak_audit
-- (0006) melempar TANPA_SESI dalam keadaan itu, yang akan menggagalkan
-- pekerjaan berjadwal. Kolom yang disentuhnya bukan kolom pantauan,
-- jadi penjaga ini cuma sabuk pengaman kedua.
-- =====================================================================

create or replace function public.fn_catat_sunting_spt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lama   jsonb := to_jsonb(old);
  v_baru   jsonb := to_jsonb(new);
  v_kolom  text;
  v_bagian text[] := '{}';
begin
  if old.status = 'draf' then
    return new;
  end if;

  if (select auth.uid()) is null then
    return new;
  end if;

  foreach v_kolom in array array[
    'judul', 'jenis_kegiatan', 'nomor_spt', 'objek', 'sasaran',
    'uraian_tugas', 'nomor_lp', 'sumber_informasi', 'prioritas',
    'tanggal_mulai', 'tanggal_batas'
  ] loop
    if (v_lama -> v_kolom) is distinct from (v_baru -> v_kolom) then
      v_bagian := v_bagian || format(
        '%s: %s -> %s',
        v_kolom,
        coalesce(v_lama ->> v_kolom, '(kosong)'),
        coalesce(v_baru ->> v_kolom, '(kosong)'));
    end if;
  end loop;

  if array_length(v_bagian, 1) is null then
    return new;
  end if;

  perform public.catat_jejak_audit(
    'sunting_spt', 'penugasan', new.id, array_to_string(v_bagian, '; '));

  return new;
end;
$$;

-- AFTER, bukan BEFORE: jejak hanya ditulis bila suntingannya benar-benar
-- lolos seluruh penjaga sebelumnya (trg_jaga_kolom_penugasan, 0046).
-- Awalan trg_ wajib (§5.4) — urutan pemicu ditentukan abjad namanya.
create trigger trg_catat_sunting_spt
  after update on public.penugasan
  for each row
  execute function public.fn_catat_sunting_spt();
