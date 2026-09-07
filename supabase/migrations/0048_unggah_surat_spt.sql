-- =====================================================================
-- 0048 — Jalur unggah pindaian surat perintah (berkas_surat_path)
--
-- Audit 5 September 2026 menemukan bahwa TIDAK ADA satu jalur pun,
-- di seluruh aplikasi, yang pernah mengisi kolom penugasan.berkas_
-- surat_path. Akibatnya BR-25/chk_selesai_wajib_berkas (0007) — yang
-- menolak status 'selesai' tanpa kolom itu terisi — membuat tutup_spt
-- MUSTAHIL dipakai sungguhan. Antarmuka bahkan sudah menampilkan pesan
-- "Lampirkan pindaian surat perintah tugas lebih dulu" (aksi-spt.tsx)
-- tanpa pernah menyediakan tempat melampirkannya.
--
-- Wadah 'surat-spt' sendiri sudah dibuat sejak migrasi 0001 (private)
-- tetapi tidak pernah diberi satu kebijakan RLS pun — jadi upload akan
-- ditolak default-deny meski UI-nya sudah ada. Bukan kebocoran (default
-- tertutup), tetapi membuat fitur ini benar-benar tidak berfungsi.
--
-- docs/20-modul-6.2-penugasan.md Bagian 5 (Addendum 6.2-T) hanya
-- menetapkan BATASAN PEMERIKSAAN-nya (sudah ada, 0007) — cara berkasnya
-- SAMPAI ke kolom itu tidak disebutkan sama sekali di PRD. Dirancang di
-- sini mengikuti pola yang SUDAH ADA untuk wadah 'dokumentasi' (0013):
-- unggah hanya oleh pihak yang berwenang menyunting induknya, baca
-- mengikuti hak baca induknya sendiri lewat RLS penugasan (bukan
-- disalin ulang di sini — pola yang sama dijelaskan komentar 0013).
-- =====================================================================

-- Susunan nama berkas: {penugasan_id}/{uuid}.{ekstensi} — satu tingkat
-- saja, beda dari 'dokumentasi' (dua tingkat) karena tidak ada entitas
-- perantara semacam laporan; surat perintah menempel langsung ke SPT.
create policy "surat_spt_unggah_kanit"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'surat-spt'
  and (storage.foldername(name))[1]::uuid in (
    select p.id from public.penugasan p
    where (select sipantau_auth.peran_saya()) = 'kanit'
      and p.unit_id = (select sipantau_auth.unit_saya())
      and p.status not in ('selesai', 'dibatalkan')
  )
);

-- Baca: mengikuti hak baca penugasan yang menaunginya, sama seperti
-- 'dokumentasi_baca_sesuai_laporan' mengikuti laporan_harian — subkueri
-- ke public.penugasan otomatis tersaring RLS tabel itu untuk pemanggil
-- yang sama, tanpa perlu mengulang syaratnya di sini.
create policy "surat_spt_baca_sesuai_lingkup"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'surat-spt'
  and (storage.foldername(name))[1]::uuid in (
    select id from public.penugasan
  )
);

-- ---------------------------------------------------------------------
-- unggah_surat_spt — Kanit pemilik unit, SPT belum tertutup/dibatalkan.
-- Nilai enum 'unggah_surat_spt' SUDAH terdaftar sejak 0007 (KP-6.2-61)
-- tetapi tidak pernah dipakai satu baris kode pun sampai fungsi ini.
--
-- p_berkas_path diperiksa cocok dengan p_id: kebijakan Storage di atas
-- sudah memastikan Kanit hanya bisa MENGUNGGAH ke folder SPT miliknya,
-- tetapi tidak ada yang mencegahnya memanggil fungsi ini dengan STRING
-- path yang ditulis tangan menunjuk folder SPT lain (mis. hasil tebakan
-- atau berkas yang kebetulan diketahui pathnya). Pemeriksaan di bawah
-- menutup itu — pertahanan berlapis, bukan berandai kebijakan Storage
-- sendirian cukup.
-- ---------------------------------------------------------------------
create or replace function public.unggah_surat_spt(p_id uuid, p_berkas_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit uuid := (select sipantau_auth.unit_saya());
begin
  if (select sipantau_auth.peran_saya()) <> 'kanit' then
    raise exception 'BUKAN_KANIT: hanya Kanit yang dapat melampirkan berkas surat perintah';
  end if;

  if p_berkas_path is null or length(trim(p_berkas_path)) = 0 then
    raise exception 'BERKAS_TIDAK_SAH: jalur berkas wajib diisi';
  end if;

  if split_part(p_berkas_path, '/', 1) <> p_id::text then
    raise exception 'BERKAS_TIDAK_SAH: jalur berkas tidak sesuai dengan penugasan ini';
  end if;

  update public.penugasan
     set berkas_surat_path = p_berkas_path
   where id = p_id and unit_id = v_unit and status not in ('selesai', 'dibatalkan');

  if not found then
    raise exception 'TIDAK_DITEMUKAN: penugasan tidak ditemukan, bukan milik unit Anda, atau sudah tertutup';
  end if;

  perform public.catat_jejak_audit('unggah_surat_spt', 'penugasan', p_id);
end;
$$;

revoke execute on function public.unggah_surat_spt(uuid, text) from public;
grant execute on function public.unggah_surat_spt(uuid, text) to authenticated;
