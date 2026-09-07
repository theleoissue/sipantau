-- =====================================================================
-- 0049 — BR-70: menutup celah balapan pada pemeriksaan Kasubdit terakhir
--
-- Ditandai PRD sendiri sebagai belum terjawab
-- (docs/60-modul-6.6-6.9-user-notif.md Bagian 12, butir 5: "Penguncian
-- baris saat dua penonaktifan bersamaan ... BR-70 menghitung lintas
-- baris"), dan dikonfirmasi nyata lewat pembacaan kode saat audit
-- 5 September 2026.
--
-- fn_jaga_kasubdit_terakhir (0033) memeriksa keberadaan Kasubdit aktif
-- LAIN lewat SELECT biasa, tanpa penguncian. Di bawah READ COMMITTED
-- (bawaan PostgreSQL), dua transaksi yang masing-masing menyunting
-- BARIS BERBEDA — dua Kasubdit terakhir yang berbeda — dapat SAMA-SAMA
-- lolos: masing-masing membaca baris yang lain sebagai masih aktif,
-- karena keduanya belum saling melihat commit satu sama lain. Bila
-- keduanya lalu commit, hasilnya nol Kasubdit aktif — persis yang
-- hendak dicegah BR-70.
--
-- PENUTUPNYA: tambahkan `for update` pada SELECT itu. Baris yang sudah
-- dikunci UPDATE lain (kasubdit lain yang SEDANG diproses transaksi
-- bersamaan) membuat pembacaan ini MENUNGGU sampai transaksi itu
-- selesai, lalu membaca ulang keadaan TERBARUNYA — bukan keadaan lama
-- yang sudah basi. Ini perilaku baku `SELECT ... FOR UPDATE` di bawah
-- READ COMMITTED, bukan logika tambahan yang perlu ditulis manual.
--
-- KONSEKUENSI YANG DITERIMA SADAR: bila dua transaksi saling menunggu
-- baris satu sama lain (mis. Txn A mengunci lalu menunggu baris yang
-- sedang diubah Txn B, sementara Txn B menunggu baris yang sedang
-- diubah Txn A), PostgreSQL akan mendeteksi kebuntuan dan MEMBATALKAN
-- salah satunya dengan galat deadlock — bukan pesan BR-70 yang rapi.
-- Ini dibiarkan: yang dijamin BR-70 adalah sistem TIDAK PERNAH berakhir
-- tanpa Kasubdit aktif, bukan bahwa setiap percobaan pasti mendapat
-- pesan galat yang enak dibaca. Kejadian ini pun hanya mungkin saat
-- dua Admin (atau lebih) menonaktifkan/mengganti peran dua Kasubdit
-- berbeda dalam hitungan milidetik yang sama — jauh lebih jarang
-- daripada kasus yang justru ingin dicegah.
-- =====================================================================

create or replace function public.fn_jaga_kasubdit_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.peran = 'kasubdit' and old.aktif = true
     and (new.peran is distinct from 'kasubdit'::public.peran_pengguna or new.aktif = false) then
    if not exists (
      select 1 from public.users
       where peran = 'kasubdit' and aktif = true and id <> old.id
       for update
    ) then
      raise exception 'BR_70_KASUBDIT_TERAKHIR: sistem tidak boleh berada tanpa satu pun akun kasubdit aktif';
    end if;
  end if;
  return new;
end;
$$;

-- Pemicu trg_jaga_kasubdit_terakhir (0033) tetap terpasang apa adanya —
-- create or replace pada fungsinya sudah cukup.
