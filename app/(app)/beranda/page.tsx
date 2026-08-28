import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { klienServer } from '@/lib/supabase/server'
import { LABEL_PERAN } from '@/lib/supabase/types'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Beranda — Si PANTAU' }

/**
 * Beranda berbeda isi untuk tiap peran, mengikuti lingkup data pada
 * matriks §2.3. Server Component: seluruh angka di sini tidak berubah
 * selama halaman terbuka (docs/CLAUDE.md §6.1).
 *
 * Kartu statistik masih menghitung dari tabel yang sudah ada. Angka
 * penugasan dan laporan menyusul bersama modulnya masing-masing —
 * SENGAJA tidak diisi angka karangan, karena angka yang salah pada
 * dashboard pimpinan lebih berbahaya daripada angka yang belum ada.
 */
export default async function Beranda() {
  const pengguna = await wajibkanSudahSiap()
  const supabase = await klienServer()

  const sapa =
    pengguna.peran === 'anggota' || pengguna.peran === 'panit'
      ? `Selamat bertugas, ${pengguna.nama}`
      : `Selamat datang, ${pengguna.nama}`

  const sub: Record<string, string> = {
    kasubdit: 'Ringkasan kegiatan penyelidikan lapangan pada seluruh unit Subdit IV.',
    kanit: 'Ringkasan kegiatan penyelidikan lapangan pada unit Anda.',
    panit: 'Penugasan yang Anda tanggungjawabi beserta perkembangannya.',
    anggota: 'Tugas dan laporan Anda hari ini.',
    pemeliharaan: 'Akun teknis untuk pemulihan akses dan pendampingan.',
  }

  // Lingkupnya sudah disaring aturan akses baris; kueri ini tidak perlu
  // menambahkan penyaring unit sendiri. Kalau ia perlu, berarti ada
  // kebijakan RLS yang kurang — dan itu yang wajib diperbaiki, bukan
  // ditambal di sini.
  const { count: jumlahPersonel } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('aktif', true)
    .neq('peran', 'pemeliharaan')

  const { count: jumlahUnit } = await supabase
    .from('unit')
    .select('id', { count: 'exact', head: true })
    .eq('aktif', true)

  return (
    <>
      <div className="kh">
        <div>
          <h1>{sapa}</h1>
          <p>{sub[pengguna.peran]}</p>
        </div>
      </div>

      <div className="k-stat">
        <div className="stat">
          <div className="lb">Peran Anda</div>
          <div className="vl" style={{ fontSize: 26 }}>
            {LABEL_PERAN[pengguna.peran]}
          </div>
          <div className="ket">NRP {pengguna.nrp}</div>
        </div>

        <div className="stat">
          <div className="lb">Personel terdaftar</div>
          <div className="vl">{jumlahPersonel ?? 0}</div>
          <div className="ket">dalam lingkup Anda</div>
        </div>

        {(pengguna.peran === 'kasubdit') && (
          <div className="stat">
            <div className="lb">Unit aktif</div>
            <div className="vl">{jumlahUnit ?? 0}</div>
            <div className="ket">di bawah Subdit IV</div>
          </div>
        )}
      </div>

      <div className="kartu" style={{ marginTop: 22 }}>
        <div className="kartu-h">
          <h3>Yang sedang dibangun</h3>
        </div>
        <div className="kartu-b">
          <div className="kosong" style={{ padding: '18px 0' }}>
            <Ikon nama="spt" />
            <h3>Modul penugasan menyusul</h3>
            <p>
              Autentikasi, peran, dan lingkup data sudah berjalan. Daftar
              penugasan, pelaporan, dan peta lapangan dibangun berikutnya
              di atas fondasi ini.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
