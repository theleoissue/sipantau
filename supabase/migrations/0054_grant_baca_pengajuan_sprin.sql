-- 0053 mengaktifkan RLS dan kebijakan SELECT pada pengajuan_sprin tapi
-- lupa grant tabelnya sendiri ke authenticated (§5.1) — setiap select
-- langsung dari klien gagal permission denied, disembunyikan oleh
-- destructuring `{ data }` tanpa memeriksa error.
grant select on public.pengajuan_sprin to authenticated;
