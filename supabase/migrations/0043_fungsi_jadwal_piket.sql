-- =====================================================================
-- 0043 — Pembangkit dan pembaca jadwal piket
--
-- susun_jadwal_piket  mengisi rentang tanggal dengan rotasi, TANPA
--                     pernah menimpa hari yang disunting tangan
-- piket_pada          membaca keadaan seluruh unit pada satu tanggal
-- unit_piket_hari_ini pintasan: unit mana yang sedang Piket sekarang
-- =====================================================================


-- ---------------------------------------------------------------------
-- susun_jadwal_piket
--
-- p_unit dan p_awal berpasangan menurut urutan: p_awal[i] adalah keadaan
-- p_unit[i] pada hari p_mulai. Hari-hari sesudahnya bergeser satu
-- langkah mengikuti urutan enum keadaan_piket (cadangan -> piket ->
-- lepas_dinas -> cadangan), persis seperti dokumen acuan.
--
-- Berapa unit yang ikut TIDAK ditentukan di sini. Tiga unit menghasilkan
-- pola dokumen acuan (tiap hari satu Piket, satu Cadangan, satu Lepas
-- Dinas); empat unit menghasilkan satu keadaan yang dipakai dua unit
-- pada hari yang sama. Keduanya sah — yang menentukan pemakainya, bukan
-- fungsi ini.
-- ---------------------------------------------------------------------
create or replace function public.susun_jadwal_piket(
  p_mulai  date,
  p_sampai date,
  p_unit   uuid[],
  p_awal   public.keadaan_piket[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_keadaan public.keadaan_piket[] := enum_range(null::public.keadaan_piket);
  v_jml     integer;
  v_hari    integer;
  v_i       integer;
  v_awal_ke integer;
  v_ditulis integer := 0;
begin
  if (select sipantau_auth.peran_saya()) <> 'kasubdit' then
    raise exception 'TIDAK_BERWENANG: hanya Kasubdit yang menyusun jadwal piket';
  end if;

  if p_unit is null or array_length(p_unit, 1) is null then
    raise exception 'MASUKAN_TIDAK_LENGKAP: daftar unit kosong';
  end if;
  if array_length(p_unit, 1) <> array_length(p_awal, 1) then
    raise exception 'MASUKAN_TIDAK_LENGKAP: jumlah unit dan keadaan awal tidak sama';
  end if;
  if p_sampai < p_mulai then
    raise exception 'MASUKAN_TIDAK_LENGKAP: tanggal akhir mendahului tanggal mulai';
  end if;
  -- Pagar kewarasan. Menyusun bertahun-tahun sekaligus hampir pasti
  -- salah ketik, dan biayanya baris sebanyak hari x unit.
  if p_sampai - p_mulai > 366 then
    raise exception 'MASUKAN_TIDAK_LENGKAP: rentang lebih dari satu tahun';
  end if;

  v_jml := array_length(v_keadaan, 1);

  for v_i in 1 .. array_length(p_unit, 1) loop
    -- Letak keadaan awal unit ini di dalam siklus.
    select i into v_awal_ke
      from generate_subscripts(v_keadaan, 1) i
     where v_keadaan[i] = p_awal[v_i];

    for v_hari in 0 .. (p_sampai - p_mulai) loop
      insert into public.jadwal_piket (tanggal, unit_id, keadaan)
      values (
        p_mulai + v_hari,
        p_unit[v_i],
        -- -1 lalu +1 di sekeliling mod: indeks larik PostgreSQL mulai
        -- dari 1, sedangkan mod menghasilkan 0..n-1.
        v_keadaan[ ((v_awal_ke - 1 + v_hari) % v_jml) + 1 ]
      )
      on conflict (tanggal, unit_id) do update
         set keadaan = excluded.keadaan
       -- INILAH penjaga yang membuat penyusunan ulang aman: hari yang
       -- pernah disetel tangan tidak ikut ditimpa. Tanpa baris ini,
       -- satu kali menyusun ulang akan menghapus seluruh penyesuaian
       -- tanpa jejak dan tanpa peringatan.
       where public.jadwal_piket.disunting_manual = false;

      v_ditulis := v_ditulis + 1;
    end loop;
  end loop;

  return v_ditulis;
end;
$$;

revoke execute on function public.susun_jadwal_piket(
  date, date, uuid[], public.keadaan_piket[]) from public;
grant execute on function public.susun_jadwal_piket(
  date, date, uuid[], public.keadaan_piket[]) to authenticated;


-- ---------------------------------------------------------------------
-- piket_pada — keadaan seluruh unit pada satu tanggal.
--
-- Bukan security definer: pembacaan jadwal memang terbuka bagi seluruh
-- peran (kebijakan jadwal_piket_baca_semua), jadi tidak ada alasan
-- melewati RLS di sini.
-- ---------------------------------------------------------------------
create or replace function public.piket_pada(p_tanggal date)
returns table (unit_id uuid, unit_nama text, keadaan public.keadaan_piket)
language sql
stable
security invoker
set search_path = ''
as $$
  select j.unit_id, u.nama, j.keadaan
    from public.jadwal_piket j
    join public.unit u on u.id = j.unit_id
   where j.tanggal = p_tanggal
   order by u.urutan;
$$;

grant execute on function public.piket_pada(date) to authenticated;


-- ---------------------------------------------------------------------
-- unit_piket_hari_ini — pintasan yang dipakai tampilan dan, nanti,
-- pengarahan pemberitahuan mendesak.
--
-- Asia/Jakarta, BUKAN current_date. Server berjalan UTC; tanpa zona ini
-- "hari ini" berganti pukul 07.00 WIB dan jadwal piket meleset satu hari
-- setiap hari, tanpa satu pun galat (CLAUDE.md §5.5 dan §11).
-- ---------------------------------------------------------------------
create or replace function public.unit_piket_hari_ini()
returns setof uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select unit_id
    from public.jadwal_piket
   where tanggal = (now() at time zone 'Asia/Jakarta')::date
     and keadaan = 'piket';
$$;

grant execute on function public.unit_piket_hari_ini() to authenticated;
