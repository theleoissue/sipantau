import 'leaflet/dist/leaflet.css'
import { notFound, redirect } from 'next/navigation'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { satuPenugasan, personelDapatDipilih } from '@/lib/penugasan/kueri'
import { WizardTerbitkan, type DrafAwal } from '../wizard'

export const metadata = { title: 'Sunting Draf Penugasan — Si PANTAU' }

/**
 * Menyunting draf yang sudah tersimpan — perbaikan atas tautan
 * "Sunting" yang sebelumnya menunjuk ke halaman yang belum pernah
 * dibangun (404). Draf memakai wizard yang sama persis dengan
 * pembuatan baru, hanya terisi datanya dan menyimpan lewat
 * perbaruiDraf() (app/(app)/penugasan/aksi.ts), bukan simpanPenugasan().
 *
 * Rutenya dijaga proxy.ts (kanit-only, mengikuti pola
 * /penugasan/terbitkan) — pemeriksaan status draf + kepemilikan unit
 * di sini tetap dilakukan karena RLS mengizinkan Kanit mengubah SPT
 * unitnya SENDIRI pada status apa pun, bukan hanya draf; halaman ini
 * hanya untuk draf.
 */
export default async function HalamanSuntingDraf({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [pengguna, spt, personel] = await Promise.all([
    wajibkanSudahSiap(),
    satuPenugasan(id),
    personelDapatDipilih(),
  ])

  if (!spt) notFound()
  if (spt.status !== 'draf') redirect(`/penugasan/${id}`)
  if (pengguna.peran !== 'kanit' || spt.unit_id !== pengguna.unit_id) redirect(`/penugasan/${id}`)

  const draf: DrafAwal = {
    id: spt.id,
    nomor_spt: spt.nomor_spt,
    jenis_kegiatan: spt.jenis_kegiatan,
    judul: spt.judul,
    objek: spt.objek,
    sasaran: spt.sasaran,
    uraian_tugas: spt.uraian_tugas,
    nomor_lp: spt.nomor_lp,
    sumber_informasi: spt.sumber_informasi,
    prioritas: spt.prioritas,
    tanggal_mulai: spt.tanggal_mulai,
    tanggal_batas: spt.tanggal_batas,
    dasar: [...(spt.penugasan_dasar ?? [])]
      .sort((a, b) => a.urutan - b.urutan)
      .map(d => ({ jenis: d.jenis, nomor: d.nomor ?? '', tanggal: d.tanggal ?? '', keterangan: d.keterangan ?? '' })),
    lokasi: [...(spt.penugasan_lokasi ?? [])]
      .sort((a, b) => a.urutan - b.urutan)
      .map(l => ({
        nama: l.nama, alamat: l.alamat ?? '', keterangan: l.keterangan ?? '',
        lat: l.lat != null ? String(l.lat) : '', lng: l.lng != null ? String(l.lng) : '',
        radius: l.radius_meter != null ? String(l.radius_meter) : '300',
      })),
  }

  return (
    <WizardTerbitkan
      personel={personel}
      kodeKlasifikasi={spt.unit?.kode_klasifikasi ?? null}
      namaUnit={spt.unit?.nama ?? 'unit Anda'}
      draf={draf}
    />
  )
}
