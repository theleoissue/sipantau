import { wajibkanSudahSiap } from '@/lib/auth/pengguna'
import { daftarPersonel } from '@/lib/personel/kueri'
import { LABEL_PERAN } from '@/lib/supabase/types'
import { statusSinyal, labelTerakhirTerlihat } from '@/lib/gps/tipe'
import { inisial } from '@/lib/utils'
import { Ikon } from '@/components/sipantau/ikon'
import { TabelResponsif } from '@/components/sipantau/tabel-responsif'

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
 * Daftar personel dalam lingkup pengguna.
 *
 * "Kehadiran" (kolom baru, migrasi 0036) BEDA dari "Status akun":
 * status akun (aktif/nonaktif) berarti boleh/tidaknya masuk sistem,
 * berubah hanya lewat Admin (BR-12) — hampir selalu "aktif". Kehadiran
 * berarti kapan orang ini terakhir terlihat lewat Titik GPS, tiga warna
 * tanpa kalimat menghakimi (KP-6.4-33..36): hijau "Aktif" (<2 menit),
 * kuning "Terakhir terlihat N menit lalu" (2-15 menit), abu-abu untuk
 * selain itu — termasuk yang belum pernah sama sekali.
 */
export default async function HalamanPersonel() {
  // Independen — daftarPersonel() tidak menerima argumen, lingkupnya
  // disaring RLS sendiri, tidak perlu menunggu pengguna lebih dulu.
  const [pengguna, daftar] = await Promise.all([
    wajibkanSudahSiap(),
    daftarPersonel(),
  ])

  return (
    <>
      <div className="kh">
        <div>
          <h1>Status Personel</h1>
          <p className="sub">
            {(pengguna.peran === 'kasubdit' || pengguna.peran === 'admin')
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
            <TabelResponsif>
              <thead>
                <tr>
                  <th>Nama</th><th>Peran</th>
                  {(pengguna.peran === 'kasubdit' || pengguna.peran === 'admin') && <th>Unit</th>}
                  <th>Kehadiran</th><th>Status akun</th><th>Terakhir masuk</th>
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
                    {(pengguna.peran === 'kasubdit' || pengguna.peran === 'admin') && <td>{p.unit?.nama ?? '—'}</td>}
                    <td>
                      {p.terlihat_pada ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                          <span className={`th ${statusSinyal(p.terlihat_pada)}`} />
                          {labelTerakhirTerlihat(p.terlihat_pada)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Belum pernah terlihat</span>
                      )}
                    </td>
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
            </TabelResponsif>
          )}
        </div>
      </section>
    </>
  )
}
