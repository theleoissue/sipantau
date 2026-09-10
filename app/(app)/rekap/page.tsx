import { rekapLintasUnit } from '@/lib/personel/kueri'
import { Ikon } from '@/components/sipantau/ikon'
import { TabelResponsif } from '@/components/sipantau/tabel-responsif'

export const metadata = { title: 'Rekap Lintas Unit — Si PANTAU' }

/**
 * Eksklusif Kasubdit (BR-07) — sudah dijaga proxy.ts dan RLS, halaman
 * ini tinggal menyajikan datanya.
 *
 * Ekspor ke PDF/Word (tombol "Unduh" pada mockup) TIDAK diikutkan —
 * itu Modul 6.10 yang ditunda (docs/CLAUDE.md §10: "ekspor data").
 */
export default async function HalamanRekap() {
  const rekap = await rekapLintasUnit()

  return (
    <>
      <div className="kh">
        <div>
          <h1>Rekap Lintas Unit</h1>
          <p className="sub">Ringkasan kegiatan tiap unit di bawah Subdit IV.</p>
        </div>
      </div>

      <section className="kartu">
        <div className="kartu-h">
          <h3>Ringkasan per unit</h3>
        </div>
        <div className="kartu-b rata tw">
          {rekap.length === 0 ? (
            <div className="kosong" style={{ padding: '24px 0' }}>
              <Ikon nama="grafik" />
              <h3>Belum ada unit aktif</h3>
            </div>
          ) : (
            <TabelResponsif>
              <thead>
                <tr>
                  <th>Unit</th><th>Personel aktif</th><th>Penugasan aktif</th>
                  <th>Laporan hari ini</th><th>Bermasalah</th>
                </tr>
              </thead>
              <tbody>
                {rekap.map(u => (
                  <tr key={u.unit_id}>
                    <td className="sel-utama">{u.nama_unit}</td>
                    <td>{u.personel_aktif}</td>
                    <td>{u.penugasan_aktif}</td>
                    <td>{u.laporan_hari_ini}</td>
                    <td>
                      {u.bermasalah > 0 ? (
                        <span className="lc bermasalah">{u.bermasalah}</span>
                      ) : (
                        <span style={{ color: 'var(--ink-3)' }}>0</span>
                      )}
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
