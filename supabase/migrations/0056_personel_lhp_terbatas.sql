-- Daftar kandidat petugas LHP yang aman bagi penyusun. Anggota tidak
-- diberi hak membaca seluruh users; fungsi hanya membuka personel aktif
-- yang tercantum pada SPRIN induk LHP miliknya sendiri.
create or replace function public.personel_lhp_dapat_dipilih(p_lhp_id uuid)
returns table (
  id uuid,
  nama text,
  nrp text,
  pangkat text,
  peran text,
  aktif boolean,
  terakhir_masuk timestamptz,
  terlihat_pada timestamptz,
  unit_nama text
)
language sql
security definer
stable
set search_path = ''
as $$
  select distinct
    u.id,
    u.nama,
    u.nrp,
    u.pangkat,
    u.peran::text,
    u.aktif,
    u.terakhir_masuk,
    u.terakhir_terlihat,
    un.nama
  from public.lhp l
  join public.users u on u.id in (
    select pp.pelaksana_id
      from public.penugasan_pelaksana pp
     where pp.penugasan_id = l.penugasan_id and pp.dicabut_pada is null
    union
    select pn.panit_id
      from public.penugasan_panit pn
     where pn.penugasan_id = l.penugasan_id and pn.dicabut_pada is null
  )
  left join public.unit un on un.id = u.unit_id
  where l.id = p_lhp_id
    and l.disusun_oleh = (select auth.uid())
    and l.status = 'draf'
    and u.aktif
    and u.peran in ('anggota', 'panit', 'kanit')
  order by u.nama;
$$;

revoke execute on function public.personel_lhp_dapat_dipilih(uuid) from public;
grant execute on function public.personel_lhp_dapat_dipilih(uuid) to authenticated;

-- UI bukan batas keamanan. Cegah penyusun memasukkan akun di luar tim
-- SPRIN dengan memanggil tabel anak secara langsung.
create or replace function public.fn_jaga_petugas_lhp_tim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_penugasan uuid;
begin
  select penugasan_id into v_penugasan from public.lhp where id = new.lhp_id;
  if not exists (
    select 1 from public.users u
     where u.id = new.petugas_id
       and u.aktif
       and u.peran in ('anggota', 'panit', 'kanit')
       and (
         exists (select 1 from public.penugasan_pelaksana pp where pp.penugasan_id = v_penugasan and pp.pelaksana_id = u.id and pp.dicabut_pada is null)
         or exists (select 1 from public.penugasan_panit pn where pn.penugasan_id = v_penugasan and pn.panit_id = u.id and pn.dicabut_pada is null)
       )
  ) then
    raise exception 'BUKAN_TIM_SPT: petugas LHP harus berasal dari tim aktif SPRIN yang sama';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_jaga_petugas_lhp_tim on public.lhp_petugas;
create trigger trg_jaga_petugas_lhp_tim
before insert or update of petugas_id, lhp_id on public.lhp_petugas
for each row execute function public.fn_jaga_petugas_lhp_tim();
