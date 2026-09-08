-- =====================================================================
-- 0052 — Menutup celah balapan pada finalkan_lhp()
--
-- Ditemukan saat pemeriksaan ulang 8 September 2026: finalkan_lhp (0030)
-- memeriksa status='draf' lewat SELECT biasa, lalu UPDATE terpisah tanpa
-- kunci maupun syarat status pada UPDATE itu sendiri. Di bawah READ
-- COMMITTED, dua pemanggilan finalkan_lhp() yang tumpang tindih untuk
-- LHP yang sama dapat SAMA-SAMA lolos pemeriksaan SELECT sebelum salah
-- satu commit — pola balapan yang sama dengan BR-70 (0049), meski di
-- sini pemanggilnya selalu satu pemilik yang sama (bukan lintas peran).
-- Celah keduanya: insert pada tabel anak (lhp_petugas dkk, RLS-nya
-- memeriksa status='draf' lewat subquery terpisah) dapat menyelip persis
-- di antara SELECT dan UPDATE tersebut.
--
-- PENUTUPNYA: satukan pemeriksaan dan penulisan jadi satu UPDATE atomik
-- dengan status='draf' di klausa WHERE-nya (pola sama seperti
-- fn_kunci_laporan/fn_kunci_lhp — bukan kunci baru, hanya memindahkan
-- syarat yang tadinya di SELECT terpisah ke WHERE UPDATE itu sendiri).
-- =====================================================================

create or replace function public.finalkan_lhp(p_lhp_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penugasan_id uuid;
begin
  update public.lhp
     set status = 'final'
   where id = p_lhp_id
     and disusun_oleh = (select auth.uid())
     and status = 'draf'
  returning penugasan_id into v_penugasan_id;

  if not found then
    raise exception 'TIDAK_DAPAT_DIFINALKAN: LHP tidak ditemukan, bukan milik Anda, atau sudah final';
  end if;

  perform public.catat_jejak_audit('finalkan_lhp', 'lhp', p_lhp_id);

  perform public.fn_buat_notifikasi(
    p_jenis        => 'lhp_difinalkan',
    p_penerima     => public.penerima_pengawas_spt(v_penugasan_id),
    p_judul        => 'LHP Ringkas difinalkan',
    p_isi          => 'Sebuah LHP Ringkas baru saja difinalkan dan siap ditinjau.',
    p_tujuan_jenis => 'lhp',
    p_tujuan_id    => p_lhp_id,
    p_penugasan_id => v_penugasan_id,
    p_pelaku       => (select auth.uid())
  );
end;
$$;
