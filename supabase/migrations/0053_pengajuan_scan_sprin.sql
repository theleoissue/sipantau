-- Scan dari Panit/Anggota tidak boleh langsung menjadi penugasan aktif.
-- Kanit meninjau hasil ekstraksi terlebih dahulu; hanya scan yang dilakukan
-- Kanit sendiri yang melalui wizard penerbitan langsung.
do $$ begin
  if not exists (select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='jenis_tindakan_audit' and e.enumlabel='ajukan_scan_sprin') then
    alter type public.jenis_tindakan_audit add value 'ajukan_scan_sprin';
  end if;
  if not exists (select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='jenis_tindakan_audit' and e.enumlabel='putuskan_pengajuan_sprin') then
    alter type public.jenis_tindakan_audit add value 'putuskan_pengajuan_sprin';
  end if;
  if not exists (select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='jenis_tindakan_audit' and e.enumlabel='kirim_ulang_scan_sprin') then
    alter type public.jenis_tindakan_audit add value 'kirim_ulang_scan_sprin';
  end if;
end $$;

create table public.pengajuan_sprin (
  id uuid primary key default gen_random_uuid(), unit_id uuid not null references public.unit(id),
  diajukan_oleh uuid not null references public.users(id), status text not null default 'diajukan'
    check (status in ('diajukan','perlu_perbaikan','disetujui','ditolak')),
  data_scan jsonb not null, catatan_kanit text, ditinjau_oleh uuid references public.users(id),
  dibuat_pada timestamptz not null default now(), ditinjau_pada timestamptz
);
create index idx_pengajuan_sprin_unit_status on public.pengajuan_sprin(unit_id, status, dibuat_pada desc);
create index idx_pengajuan_sprin_pengaju on public.pengajuan_sprin(diajukan_oleh, dibuat_pada desc);
alter table public.pengajuan_sprin enable row level security;
create policy "pengajuan_baca_pemilik_atau_kanit" on public.pengajuan_sprin for select to authenticated using (
  diajukan_oleh=(select auth.uid()) or exists (select 1 from public.users u where u.id=(select auth.uid()) and u.peran='kanit' and u.unit_id=pengajuan_sprin.unit_id)
);
create function public.ajukan_scan_sprin(p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_unit uuid;
begin
 select unit_id into v_unit from public.users where id=(select auth.uid()) and aktif and peran in ('anggota','panit');
 if v_unit is null then raise exception 'BUKAN_PENGAJU'; end if;
 insert into public.pengajuan_sprin(unit_id,diajukan_oleh,data_scan) values(v_unit,(select auth.uid()),p_data) returning id into v_id;
 perform public.catat_jejak_audit('ajukan_scan_sprin','pengajuan_sprin',v_id); return v_id;
end $$;
create function public.putuskan_pengajuan_sprin(p_id uuid,p_status text,p_catatan text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_status='perlu_perbaikan' and nullif(trim(p_catatan),'') is null then raise exception 'CATATAN_PERBAIKAN_WAJIB'; end if;
 update public.pengajuan_sprin q set status=p_status,catatan_kanit=nullif(trim(p_catatan),''),ditinjau_oleh=(select auth.uid()),ditinjau_pada=now()
 where q.id=p_id and p_status in ('perlu_perbaikan','disetujui','ditolak') and q.status in ('diajukan','perlu_perbaikan')
 and exists(select 1 from public.users u where u.id=(select auth.uid()) and u.peran='kanit' and u.unit_id=q.unit_id);
 if not found then raise exception 'BUKAN_KANIT_ATAU_TIDAK_DITEMUKAN'; end if;
 perform public.catat_jejak_audit('putuskan_pengajuan_sprin','pengajuan_sprin',p_id);
end $$;
create function public.kirim_ulang_scan_sprin(p_id uuid,p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.pengajuan_sprin q set data_scan=p_data,status='diajukan',catatan_kanit=null,ditinjau_oleh=null,ditinjau_pada=null,dibuat_pada=now()
 where q.id=p_id and q.diajukan_oleh=(select auth.uid()) and q.status='perlu_perbaikan';
 if not found then raise exception 'PENGAJUAN_TIDAK_DAPAT_DIKIRIM_ULANG'; end if;
 perform public.catat_jejak_audit('kirim_ulang_scan_sprin','pengajuan_sprin',p_id);
end $$;
revoke all on function public.ajukan_scan_sprin(jsonb) from public; grant execute on function public.ajukan_scan_sprin(jsonb) to authenticated;
revoke all on function public.putuskan_pengajuan_sprin(uuid,text,text) from public; grant execute on function public.putuskan_pengajuan_sprin(uuid,text,text) to authenticated;
revoke all on function public.kirim_ulang_scan_sprin(uuid,jsonb) from public; grant execute on function public.kirim_ulang_scan_sprin(uuid,jsonb) to authenticated;
