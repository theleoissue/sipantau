-- =====================================================================
-- 0046 — KP-6.2-07: nomor_spt dan tanggal_mulai terkunci sesudah terbit
--
-- KP-6.2-07 (docs/20-modul-6.2-penugasan.md:313) berbunyi: "Bila SPT
-- sudah terbit, maka kolom nomor_spt, unit_id, dan tanggal_mulai tidak
-- dapat lagi disunting oleh SIAPA PUN."
--
-- Yang benar-benar terkunci di basis data selama ini hanya unit_id.
-- nomor_spt dan tanggal_mulai memang disebut di fn_jaga_kolom_penugasan
-- (0008), tetapi HANYA di dalam cabang `peran_saya() = 'kasubdit'` —
-- sehingga Kanit, satu-satunya peran yang punya hak update penuh atas
-- SPT unitnya, melewatinya begitu saja. Dibuktikan sebelum migrasi ini
-- ditulis, sebagai Kanit atas SPT berstatus 'berjalan':
--
--   update public.penugasan set nomor_spt = 'SP/999/PALSU' where id = ...
--   -> tidak ada galat, nilainya benar-benar berubah
--
-- Antarmuka memang menolaknya (perbaruiDraf hanya melayani status
-- 'draf'), tetapi penolakan itu ada di lapisan aplikasi, dan CLAUDE.md
-- §9 menyatakan lapisan itu tidak boleh dihitung sebagai penjaga:
-- pemegang sesi Kanit dapat bicara langsung ke PostgREST dan
-- melewatinya. Nomor sebuah surat perintah yang sudah dicetak dan
-- ditandatangani karena itu dapat diganti tanpa satu pun galat.
--
-- BATAS PENGUNCIAN — old.status <> 'draf', bukan new.status.
-- terbitkan_draf (0025) memindahkan status draf -> baru dalam satu
-- UPDATE dan TIDAK menyentuh nomor_spt (diperiksa sebelum menulis ini).
-- Memakai old.status membuat penerbitan tetap lolos sekaligus mengunci
-- setiap suntingan sesudahnya. Status tidak pernah kembali ke 'draf' —
-- buka_kembali_spt mengembalikan ke 'berjalan' — jadi kunci ini tidak
-- pernah terbuka lagi seumur hidup SPT.
--
-- YANG SENGAJA TIDAK IKUT DIKUNCI: judul, uraian_tugas, objek, sasaran,
-- prioritas, tanggal_batas. KP-6.2-07 menyebut tiga kolom saja, dan
-- KP-6.2-39 justru mengandaikan SPT MASIH dapat disunting sesudah
-- terbit — yang dituntutnya adalah jejak audit, bukan larangan. Jejak
-- itu dipasang migrasi 0047.
-- =====================================================================

create or replace function public.fn_jaga_kolom_penugasan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- KP-6.2-07 — mengikat SELURUH peran, termasuk Kanit pemilik unit.
  -- Ditulis paling atas supaya tidak pernah tersembunyi di dalam cabang
  -- peran mana pun; itulah persis cara celah ini lahir sebelumnya.
  if old.status <> 'draf' then
    if new.nomor_spt is distinct from old.nomor_spt then
      raise exception 'KOLOM_TERKUNCI: nomor SPT tidak dapat diubah sesudah penugasan terbit';
    end if;
    if new.tanggal_mulai is distinct from old.tanggal_mulai then
      raise exception 'KOLOM_TERKUNCI: tanggal mulai tidak dapat diubah sesudah penugasan terbit';
    end if;
  end if;

  if (select sipantau_auth.peran_saya()) = 'kasubdit' then
    -- Kasubdit boleh menyentuh status saja. Bila ia mengubah kolom
    -- lain, seluruh perubahannya ditolak.
    if new.judul is distinct from old.judul
       or new.nomor_spt is distinct from old.nomor_spt
       or new.unit_id is distinct from old.unit_id
       or new.tanggal_batas is distinct from old.tanggal_batas
       or new.uraian_tugas is distinct from old.uraian_tugas then
      raise exception 'KOLOM_TERKUNCI: Kasubdit hanya dapat membuka kembali penugasan, bukan menyuntingnya';
    end if;
  end if;

  -- Unit pemilik tidak pernah berpindah. Memindahkannya berarti
  -- memindahkan seluruh laporan dan rute di bawahnya ke lingkup baca
  -- orang lain sekaligus, tanpa satu pun jejak.
  if new.unit_id is distinct from old.unit_id then
    raise exception 'KOLOM_TERKUNCI: unit pemilik penugasan tidak dapat dipindahkan';
  end if;

  new.diubah_pada := now();
  return new;
end;
$$;

-- Pemicu trg_jaga_kolom_penugasan (0008) tetap terpasang apa adanya —
-- create or replace pada fungsinya sudah cukup, dan mengganti pemicunya
-- justru akan mengubah urutan jalannya terhadap pemicu lain (§5.4).
