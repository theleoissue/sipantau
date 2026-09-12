-- =====================================================================
-- Menunjuk kembali pelaksana yang pernah dicabut tidak memberi tahu
-- siapa pun — kegagalan senyap.
--
-- public.tambah_pelaksana (migrasi 0025) menulis begini:
--
--     insert into public.penugasan_pelaksana (...)
--     values (...)
--     on conflict (penugasan_id, pelaksana_id) do update
--        set dicabut_pada = null, dicabut_oleh = null, alasan_pencabutan = null
--      where public.penugasan_pelaksana.dicabut_pada is not null;
--
-- Untuk orang yang PERNAH ada di SPT itu lalu dicabut, barisnya sudah
-- ada, sehingga pernyataan itu dijalankan PostgreSQL sebagai UPDATE —
-- bukan INSERT. Akibatnya kedua pemicu diam bersamaan:
--
--   trg_notifikasi_pelaksana_ditugaskan  after INSERT  -> tidak berjalan
--   trg_notifikasi_pelaksana_dicabut     after UPDATE  -> berjalan, tetapi
--       syaratnya `dicabut_pada` BERUBAH JADI TERISI, sedangkan di sini ia
--       justru dikosongkan; jadi tidak melakukan apa-apa
--
-- Hasilnya nol baris notifikasi: lonceng dalam aplikasi tidak berbunyi,
-- pemberitahuan dorong tidak terkirim, dan tidak ada satu pun galat.
-- Petugas yang ditunjuk kembali tidak pernah tahu ia ditunjuk kembali.
--
-- Kekeliruan ini lolos karena penambahan pelaksana yang BELUM pernah ada
-- memakai jalur INSERT dan berperilaku benar — persis pola §11 CLAUDE.md:
-- "aturan diterapkan di satu tempat, tempat lain yang melanggar terlewat".
-- Uji U-NTF-13 pun memanggil INSERT mentah, bukan tambah_pelaksana, jadi
-- jalur konflik itu tidak pernah tersentuh.
--
-- Perbaikannya: pemicu yang sama juga mendengarkan UPDATE, dan hanya
-- bereaksi pada perpindahan "dicabut -> aktif kembali".
--
-- Nama fungsi dan pemicu SENGAJA tidak diubah. Urutan jalannya pemicu
-- ditentukan abjad namanya (§5.4); mengganti nama akan menggeser urutan
-- itu tanpa terlihat.
-- =====================================================================

create or replace function public.fn_notifikasi_pelaksana_ditugaskan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_spt record;
begin
  -- Pada UPDATE, satu-satunya hal yang berarti "ditugaskan" adalah
  -- pencabutan yang ditarik kembali. Perubahan lain pada baris ini
  -- (urutan, catatan) bukan penugasan baru dan tidak boleh berbunyi.
  if tg_op = 'UPDATE'
     and not (old.dicabut_pada is not null and new.dicabut_pada is null) then
    return new;
  end if;

  select status, nomor_spt, judul into v_spt
    from public.penugasan where id = new.penugasan_id;

  -- SPT masih draf: batch pelaksana awal diberi tahu sekaligus oleh
  -- trg_notifikasi_penugasan saat penerbitan, supaya tidak dua kali.
  if v_spt.status <> 'draf' then
    perform public.fn_buat_notifikasi(
      'spt_ditugaskan', array[new.pelaksana_id], 'Anda ditunjuk pada penugasan',
      v_spt.nomor_spt || ' — ' || v_spt.judul,
      'penugasan', new.penugasan_id, new.penugasan_id, null, true, (select auth.uid())
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notifikasi_pelaksana_ditugaskan on public.penugasan_pelaksana;

create trigger trg_notifikasi_pelaksana_ditugaskan
  after insert or update on public.penugasan_pelaksana
  for each row
  execute function public.fn_notifikasi_pelaksana_ditugaskan();
