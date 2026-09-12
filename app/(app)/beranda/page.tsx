import Link from 'next/link'
import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarPenugasan } from '@/lib/penugasan/kueri'
import { statDashboard, aktivitasTerbaru } from '@/lib/dashboard/kueri'
import { KartuSpt } from '@/components/sipantau/kartu-spt'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Beranda — Si PANTAU' }

const SAPA: Record<string, (nama: string) => string> = {
  anggota: nama => `Selamat bertugas, ${nama}`,
  panit: nama => `Selamat bertugas, ${nama}`,
  kanit: nama => `Selamat datang, ${nama}`,
  kasubdit: nama => `Selamat datang, ${nama}`,
  admin: nama => `Selamat datang, ${nama}`,
  pemeliharaan: nama => `Selamat datang, ${nama}`,
}

const SUB: Record<string, string> = {
  kasubdit: 'Ringkasan kegiatan penyelidikan lapangan pada seluruh unit Subdit IV.',
  admin: 'Ringkasan kegiatan penyelidikan lapangan pada seluruh unit Subdit IV.',
  kanit: 'Ringkasan kegiatan penyelidikan lapangan pada unit Anda.',
  panit: 'Penugasan yang Anda tanggungjawabi beserta perkembangannya.',
  anggota: 'Tugas dan laporan Anda hari ini.',
  pemeliharaan: 'Akun teknis untuk pemulihan akses dan pendampingan.',
}

function waktu(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

/**
 * Beranda berbeda isi untuk tiap peran, mengikuti lingkup data pada
 * matriks §2.3 (docs/00-fondasi.md §6.5, BR-11). Server Component:
 * seluruh angka di sini tidak berubah selama halaman terbuka
 * (docs/CLAUDE.md §6.1).
 *
 * "Pelacakan berjalan" dan kartu Sesi Tugas pada mockup SENGAJA belum
 * diporting — keduanya menyandarkan diri pada Modul 6.4 (GPS) yang
 * belum dibangun. Menambahkannya sekarang berarti kartu kosong yang
 * tidak pernah terisi, dan itu sendiri menyesatkan.
 */
export default async function Beranda() {
  const pengguna = await wajibkanSudahSiap()

  // Akun Pemeliharaan tidak pernah sampai ke halaman ini — berandanya
  // /pemeliharaan (KP-6.1-40) — tapi TypeScript tidak tahu itu, jadi
  // dijaga di sini juga.
  if (pengguna.peran === 'pemeliharaan') {
    return (
      <div className="kh"><div><h1>Akun Pemeliharaan</h1></div></div>
    )
  }

  const [stat, aktivitas, penugasanAktif] = await Promise.all([
    statDashboard(pengguna.peran),
    aktivitasTerbaru(),
    daftarPenugasan({ status: ['baru', 'berjalan', 'bermasalah'] }),
  ])

  const daftarTerbatas = penugasanAktif.slice(0, 4)

  return (
    <main className="beranda-dashboard">
      <div className="kh beranda-hero">
        <div>
          <span className="beranda-eyebrow">Ringkasan operasional</span>
          <h1>{SAPA[pengguna.peran](pengguna.nama)}</h1>
          <p className="sub">{SUB[pengguna.peran]}</p>
        </div>

        {/* BR-11: tombol aksi utama hanya muncul sesuai kewenangan peran. */}
        <div className="kh-aksi">
          {pengguna.peran === 'kasubdit' && (
            <Link href="/rekap" className="btn btn-o">
              <Ikon nama="unduh" />Rekap lintas unit
            </Link>
          )}
          {pengguna.peran === 'admin' && (
            <Link href="/akun" className="btn btn-o">
              <Ikon nama="orang" />Kelola akun
            </Link>
          )}
          {pengguna.peran === 'kanit' && (
            <Link href="/penugasan/terbitkan" className="btn btn-g">
              <Ikon nama="tambah" />Terbitkan penugasan
            </Link>
          )}
          {pengguna.peran === 'anggota' && (
            <Link href="/lapor" className="btn btn-g">
              <Ikon nama="lapor" />Kirim laporan
            </Link>
          )}
          {pengguna.peran === 'panit' && (
            <Link href="/laporan" className="btn btn-o">
              <Ikon nama="masuk_kotak" />Tinjau laporan
            </Link>
          )}
        </div>
      </div>

      <section className="beranda-statistik" aria-label="Ringkasan statistik">
        {stat.map(s => (
          <div className="stat beranda-stat" key={s.label} style={{ '--aksen': s.warna } as React.CSSProperties}>
            <div className="lb">{s.label}</div>
            <div className="vl">{s.nilai}</div>
            <div className="tr fl"><span className="lalu">{s.keterangan}</span></div>
          </div>
        ))}
      </section>

      <div className="kisi k-2 beranda-isi">
        <section className="kartu beranda-tugas">
          <div className="kartu-h">
            <div><span className="beranda-bagian">Prioritas Anda</span><h3>{pengguna.peran === 'anggota' ? 'Tugas berjalan' : 'Penugasan aktif'}</h3></div>
            <Link href="/penugasan" className="btn btn-o btn-sm">Lihat semua</Link>
          </div>
          <div className="kartu-b">
            {daftarTerbatas.length > 0 ? (
              <div className="kisi k-kartu">
                {daftarTerbatas.map(spt => <KartuSpt key={spt.id} spt={spt} />)}
              </div>
            ) : (
              <div className="kosong">
                <Ikon nama="spt" />
                <h3>Tidak ada penugasan aktif</h3>
                <p>Penugasan baru akan tampil di sini begitu diterbitkan.</p>
              </div>
            )}
          </div>
        </section>

        <section className="kartu beranda-aktivitas">
          <div className="kartu-h">
            <div><span className="beranda-bagian">Pembaruan</span><h3>Aktivitas terbaru</h3></div>
          </div>
          <div className="kartu-b rata umpan">
            {aktivitas.length > 0 ? aktivitas.map(a => (
              <Link href={`/laporan/${a.id}`} className="ui" key={a.id} style={{ textDecoration: 'none' }}>
                <div className="ic" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                  <Ikon nama="masuk_kotak" />
                </div>
                <div className="tx">
                  <p><b>{a.pelapor_nama}</b> — {a.uraian.slice(0, 70)}{a.uraian.length > 70 ? '…' : ''}</p>
                  <div className="t">
                    {a.nomor_spt && <span className="spt-id">{a.nomor_spt}</span>} · {waktu(a.dikirim_pada)}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="kosong">
                <Ikon nama="masuk_kotak" />
                <h3>Belum ada aktivitas</h3>
                <p>Kabar tentang laporan lapangan akan muncul di sini.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
