-- =====================================================================
-- 0037 — token_sesi_native: kredensial sempit untuk Pengiriman Native
--
-- LATAR BELAKANG
-- Pustaka pelacakan (@capgo/background-geolocation) mematikan layanan
-- latar depannya sendiri begitu aplikasi ditutup — kecuali "pengiriman
-- native" dinyalakan, yaitu ketika tiap Titik ikut dikirim langsung
-- dari kode native ke sebuah alamat, tanpa melewati WebView. Sumber
-- pustakanya menyatakannya terang-terangan pada handleOnDestroy():
-- layanan hanya dibiarkan hidup bila mode itu aktif.
--
-- Masalahnya: begitu proses aplikasi mati, TIDAK ADA sesi masuk yang
-- tersisa. Tidak ada auth.uid(), tidak ada token Supabase yang bisa
-- disegarkan (yang menyegarkan sudah ikut mati). Jadi pengiriman itu
-- membutuhkan kredensialnya sendiri yang berdiri lepas dari sesi masuk.
--
-- BENTUK KREDENSIALNYA — sengaja dibuat sesempit mungkin:
--   * Satu token untuk SATU Sesi Tugas. Bukan token pengguna.
--   * Hanya bisa menambah Titik pada sesi itu. Tidak bisa membaca
--     apa pun, tidak bisa menyentuh sesi lain, tidak bisa menutup sesi.
--   * Mati dengan sendirinya begitu sesinya ditutup — fn_catat_titik
--     sudah menolak Titik pada sesi tertutup (BR-01/KP-6.4-12), jadi
--     token basi tidak perlu dihapus untuk menjadi tidak berguna.
--   * penanda_perangkat DIIKAT saat token diterbitkan, bukan dikirim
--     ulang tiap Titik — pemegang token tidak dapat menyamar jadi
--     perangkat lain.
--
-- Yang disimpan adalah SIDIK (sha256), bukan tokennya sendiri. Bocornya
-- isi tabel ini tidak memberi siapa pun kemampuan mengirim Titik.
-- =====================================================================

create table if not exists public.token_sesi_native (
  sesi_tugas_id     uuid primary key references public.sesi_tugas (id),
  token_hash        bytea not null unique,
  penanda_perangkat text not null,
  dibuat_pada       timestamptz not null default now(),
  dipakai_pada      timestamptz
);

comment on table public.token_sesi_native is
  'Kredensial sempit sekali-pakai-per-sesi untuk Pengiriman Native GPS. Satu baris per Sesi Tugas. Tidak pernah dibaca klien mana pun.';
comment on column public.token_sesi_native.token_hash is
  'sha256 dari token, BUKAN tokennya. Token asli hanya pernah ada sekali, di dalam balasan terbitkan_token_sesi_native.';
comment on column public.token_sesi_native.penanda_perangkat is
  'Diikat saat penerbitan supaya Titik dari jalur native tidak dapat mengaku berasal dari perangkat lain.';

alter table public.token_sesi_native enable row level security;

-- TIDAK ADA grant, kepada peran mana pun — termasuk authenticated.
-- Ini keputusan sengaja, bukan kelalaian (CLAUDE.md §5.1 mensyaratkan
-- hak aksesnya dinyatakan di berkas yang sama; dinyatakan di sini
-- sebagai NOL). Tabel ini hanya disentuh dua fungsi security definer
-- pada migrasi 0038, dan tidak seorang pun berhak membacanya —
-- membaca sidik token tidak berguna, tetapi membiarkan jalurnya
-- terbuka menambah permukaan serang tanpa satu pun manfaat.
-- RLS menyala tanpa satu pun kebijakan = tertutup rapat bagi semua.
