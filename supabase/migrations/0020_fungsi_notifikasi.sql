-- =====================================================================
-- 0020 — Fungsi pusat pembuat pemberitahuan Modul 6.9
-- Sumber: docs/60-modul-6.6-6.9-user-notif.md Bagian 4
-- =====================================================================
--
-- BR-72: pemberitahuan hanya lahir dari fungsi terpusat di sini. Tidak
-- ada modul yang menyisipkan baris notifikasi secara langsung — 0021
-- menyambungkan titik pemicu di Modul 6.2/6.3/6.4 lewat PEMANGGILAN ke
-- fn_buat_notifikasi, bukan lewat insert masing-masing.
-- =====================================================================

create or replace function public.fn_buat_notifikasi(
  p_jenis        text,
  p_penerima     uuid[],
  p_judul        text,
  p_isi          text,
  p_tujuan_jenis public.jenis_tujuan_notifikasi,
  p_tujuan_id    uuid,
  p_penugasan_id uuid default null,
  p_laporan_id   uuid default null,
  p_mendesak     boolean default false,
  p_pelaku       uuid default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  insert into public.notifikasi
    (penerima_id, jenis, judul, isi, tujuan_jenis, tujuan_id,
     penugasan_id, laporan_id, mendesak)
  select distinct u.id, p_jenis, p_judul, p_isi, p_tujuan_jenis, p_tujuan_id,
         p_penugasan_id, p_laporan_id, p_mendesak
    from unnest(p_penerima) as t(id)
    join public.users u on u.id = t.id
   where u.aktif = true                              -- KP-6.9-05
     and u.peran <> 'pemeliharaan'                    -- KP-6.9-41
     and (p_pelaku is null or u.id <> p_pelaku);       -- KP-6.9-04, BR-74

  get diagnostics n = row_count;
  return n;
end;
$$;

-- Tidak ada grant execute untuk authenticated (BR-72/KP-6.9-30):
-- dipanggil dari dalam fungsi security definer lain saja, dijalankan
-- sebagai pemilik tabel.

-- ---------------------------------------------------------------------
-- Fungsi bantu penentu penerima — dua bentuk yang paling sering
-- dipakai. Keduanya menegakkan BR-69 lewat dicabut_pada is null.
-- ---------------------------------------------------------------------
create or replace function public.penerima_pengawas_spt(p_penugasan_id uuid)
returns uuid[]
language sql
stable
security definer
set search_path = ''
as $$
  select array_agg(distinct id) from (
    select u.id
      from public.penugasan p
      join public.users u on u.unit_id = p.unit_id and u.peran = 'kanit'
     where p.id = p_penugasan_id
    union
    select pp.panit_id
      from public.penugasan_panit pp
     where pp.penugasan_id = p_penugasan_id
       and pp.dicabut_pada is null
  ) s;
$$;

create or replace function public.penerima_pelaksana_spt(p_penugasan_id uuid)
returns uuid[]
language sql
stable
security definer
set search_path = ''
as $$
  select array_agg(pelaksana_id)
    from public.penugasan_pelaksana
   where penugasan_id = p_penugasan_id
     and dicabut_pada is null;
$$;
