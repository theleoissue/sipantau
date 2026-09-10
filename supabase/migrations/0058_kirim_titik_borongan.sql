-- =====================================================================
-- 0058 — Mengirim banyak Titik dalam satu permintaan
--
-- KEPUTUSAN PEMILIK PRODUK, 11 September 2026: perekaman dijalankan
-- serapat mungkin, tanpa interval adaptif.
--
-- Yang membatasi keputusan itu ternyata BUKAN baterai. Setiap Titik
-- selama ini satu pemanggilan Server Action tersendiri; pada jeda 15
-- detik, dua puluh petugas berdinas delapan jam sudah menghasilkan
-- sekitar 1,2 juta pemanggilan sebulan. Mempercepat jadi tiap 3 detik
-- akan melipatlimakannya — dan itu menabrak batas pemanggilan Vercel
-- jauh sebelum ada satu HP pun yang kehabisan daya.
--
-- Karena itu perekaman dan pengiriman DIPISAH: perangkat merekam rapat,
-- lalu antrean (lib/gps/antrean.ts) menyetorkannya berkelompok lewat
-- fungsi ini. Jumlah pemanggilan turun sebanding besar kelompoknya,
-- sementara kerapatan jejaknya tetap penuh.
--
-- Tidak ada aturan yang dilonggarkan di sini. Setiap elemen tetap
-- melewati fn_catat_titik satu per satu — lengkap dengan pemeriksaan
-- kepemilikan sesi, batas waktu, penilaian mutu, dan penolakan kiriman
-- kembar lewat antrean_id.
--
-- SATU TRANSAKSI, dan itu disengaja: bila satu Titik ditolak, seluruh
-- kelompok dibatalkan dan tidak ada yang tersimpan separuh. Antrean di
-- klien menahan kelompok itu dan mengirim ulang; karena antrean_id
-- dibuat perangkat dan bersifat tetap, percobaan ulang tidak pernah
-- menghasilkan baris kembar.
-- =====================================================================

create or replace function public.kirim_titik_borongan(p_titik jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_butir jsonb;
  v_jumlah integer := 0;
begin
  if jsonb_typeof(p_titik) <> 'array' then
    raise exception 'BENTUK_TIDAK_SAH: daftar Titik harus berupa larik';
  end if;

  -- Batas atas supaya satu permintaan tidak menahan transaksi terlalu
  -- lama. Klien memecah antrean sendiri; ini pagar terakhir.
  if jsonb_array_length(p_titik) > 200 then
    raise exception 'TERLALU_BANYAK: maksimal 200 Titik sekali kirim';
  end if;

  for v_butir in select * from jsonb_array_elements(p_titik)
  loop
    perform public.fn_catat_titik(
      (v_butir->>'sesi_id')::uuid,
      (v_butir->>'lat')::numeric,
      (v_butir->>'lng')::numeric,
      nullif(v_butir->>'akurasi_meter', '')::numeric,
      nullif(v_butir->>'kecepatan_mps', '')::numeric,
      nullif(v_butir->>'arah_derajat', '')::numeric,
      nullif(v_butir->>'baterai_persen', '')::smallint,
      coalesce(nullif(v_butir->>'sumber_lokasi', ''), 'gps')::public.sumber_lokasi_titik,
      (v_butir->>'antrean_id')::uuid,
      (v_butir->>'direkam_pada')::timestamptz,
      v_butir->>'penanda_perangkat',
      coalesce(nullif(v_butir->>'penanda_perangkat_asal', ''), v_butir->>'penanda_perangkat'),
      coalesce((v_butir->>'lokasi_tiruan')::boolean, false)
    );
    v_jumlah := v_jumlah + 1;
  end loop;

  return v_jumlah;
end;
$$;

revoke all on function public.kirim_titik_borongan(jsonb) from public;
grant execute on function public.kirim_titik_borongan(jsonb) to authenticated;
