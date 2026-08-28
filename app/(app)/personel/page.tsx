import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarPersonel } from '@/lib/personel/kueri'
import { LABEL_PERAN } from '@/lib/supabase/types'
import { inisial } from '@/lib/utils'
import { Ikon } from '@/components/sipantau/ikon'

export const metadata = { title: 'Status Personel — Si PANTAU' }

const WARNA_AVATAR = ['#7C3AED', '#F5A623', '#2563EB', '#059669']

function waktuMasuk(iso: string | null): string {
  if (!iso) return 'Belum pernah masuk'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

/**
 * Daftar personel dalam lingkup pengguna. TIDAK menampilkan status
 * "sedang bertugas" atau posisi terakhir — keduanya milik Modul 6.4
 * (GPS) yang belum dibangun, dan kolom terakhir_terlihat pada tabel
 * users belum pernah terisi. Menampilkannya sekarang berarti
 * menyajikan data kosong yang terlihat seperti fakta, dan Prinsip
 * Non-Menghakimi (0.6) berlaku juga terhadap diamnya sistem sendiri.
 *
 * Yang ditampilkan: identitas, peran, unit, status akun, dan waktu
 * masuk terakhir — seluruhnya sudah benar-benar terekam.
 */
export default async function HalamanPersonel() {
  const pengguna = await wajibkanSudahSiap()
  const daftar = await daftarPersonel()

  return (
    <>
      <div className="kh">
        <div>
          <h1>Status Personel</h1>
          <p className="sub">
            {pengguna.peran === 'kasubdit'
              ? 'Personel pada seluruh unit di bawah Subdit IV.'
              : 'Personel pada unit Anda.'}
          </p>
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>Daftar personel</h3>
          <span className="isyarat">{daftar.length} orang</span>
        </div>
        <div className="kartu-b rata tw">
          {daftar.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="orang" />
              <h3>Belum ada personel</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama</th><th>Peran</th>
                  {pengguna.peran === 'kasubdit' && <th>Unit</th>}
                  <th>Status akun</th><th>Terakhir masuk</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="av av-sm" style={{ background: WARNA_AVATAR[i % WARNA_AVATAR.length], color: '#fff' }}>
                          {inisial(p.nama)}
                        </div>
                        <div>
                          <div className="sel-utama">{p.nama}</div>
                          {p.pangkat && <div className="sel-sub">{p.pangkat}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{LABEL_PERAN[p.peran as keyof typeof LABEL_PERAN]}</td>
                    {pengguna.peran === 'kasubdit' && <td>{p.unit?.nama ?? '—'}</td>}
                    <td>
                      <span className={`lc ${p.aktif ? 'selesai' : 'dibatalkan'}`}>
                        {p.aktif ? 'aktif' : 'nonaktif'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-2)' }}>
                      {waktuMasuk(p.terakhir_masuk)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}
