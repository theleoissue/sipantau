-- =====================================================================
-- 0013 — Kebijakan akses wadah penyimpanan `dokumentasi`
-- Sumber: docs/01-koreksi.md I.9, docs/30-modul-6.3-pelaporan.md §5.5
-- =====================================================================
--
-- Susunan nama berkas: {penugasan_id}/{laporan_id}/{uuid}.{ekstensi}
-- (ditetapkan migrasi 0001). Kebijakan di bawah mengurai bagian kedua
-- dari path itu (laporan_id) dan mencocokkannya ke baris laporan_harian
-- yang pelapornya adalah pemanggil.
--
-- storage.foldername(name) mengembalikan array segmen path SEBELUM nama
-- berkas; foldername(name)[2] adalah laporan_id (indeks 1 = penugasan_id,
-- indeks 2 = laporan_id, mengikuti urutan 1-basis PostgreSQL).
-- =====================================================================

create policy "dokumentasi_unggah_pelapor"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[2]::uuid in (
    select id from public.laporan_harian
     where pelapor_id = (select auth.uid())
       and status_laporan in ('terkirim', 'perlu_diperbaiki')
  )
);

-- Baca: mengikuti hak baca laporan yang menaunginya — sama seperti
-- kebijakan tabel foto_dokumentasi, disalin ke lapisan Storage karena
-- keduanya independen (RLS tabel tidak otomatis melindungi berkas fisik).
create policy "dokumentasi_baca_sesuai_laporan"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dokumentasi'
  and (storage.foldername(name))[2]::uuid in (
    select id from public.laporan_harian
  )
);
