import Link from 'next/link'
import type { PenugasanLengkap } from '@/lib/penugasan/kueri'
import { lewatBatas, hariTerlampaui } from '@/lib/penugasan/kueri'
import { inisial } from '@/lib/utils'

const WARNA_AVATAR = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626']

/** Kartu SPT, bentuknya disalin dari K.kartuSpt pada mockup. */
export function KartuSpt({ spt }: { spt: PenugasanLengkap }) {
  const lokasi = [...(spt.penugasan_lokasi ?? [])].sort((a, b) => a.urutan - b.urutan)
  const pelaksanaAktif = (spt.penugasan_pelaksana ?? []).filter(p => !p.dicabut_pada)
  const telat = lewatBatas(spt)

  const warnaMaju =
    spt.status === 'bermasalah' ? 'var(--red)'
    : spt.status === 'selesai'  ? 'var(--green)'
    : 'var(--gold)'

  // Berapa pelaksana yang sudah membuka SPT ini (tanda terima).
  // Bukan "berapa yang sudah melapor" — laporan milik Modul 6.3.
  const sudahBaca = pelaksanaAktif.filter(p => p.dibaca_pada).length
  const total = Math.max(pelaksanaAktif.length, 1)
  const persen = Math.round((sudahBaca / total) * 100)

  return (
    <Link href={`/penugasan/${spt.id}`} className="spt" style={{ textDecoration: 'none' }}>
      <div className="atas">
        <span className="spt-id">{spt.nomor_spt ?? 'Belum bernomor'}</span>
        <span className={`pr ${spt.prioritas}`}>{spt.prioritas}</span>
      </div>

      <h4>{spt.judul}</h4>

      <div className="titik-lok">
        {lokasi.slice(0, 2).map(l => (
          <div className="baris" key={l.id}>
            <span className="no">{l.urutan}</span>
            <span>{l.nama}</span>
          </div>
        ))}
        {lokasi.length > 2 && (
          <div className="sisa">dan {lokasi.length - 2} titik lainnya</div>
        )}
        {lokasi.length === 0 && (
          <div className="sisa">Titik lokasi belum diisi</div>
        )}
      </div>

      {/* Prinsip Non-Menghakimi: menyatakan fakta "sudah membuka",
          bukan menyimpulkan "belum melaksanakan". */}
      <div className="mj-baris">
        <div className="mj">
          <span style={{ width: `${persen}%`, background: warnaMaju }} />
        </div>
        <span className="num">{sudahBaca}/{pelaksanaAktif.length}</span>
      </div>

      <div className="bawah">
        <div className="av-tumpuk">
          {pelaksanaAktif.slice(0, 3).map((p, i) => (
            <div
              key={p.id}
              className="av av-sm"
              style={{ background: WARNA_AVATAR[i % WARNA_AVATAR.length], color: '#fff' }}
              title={p.users?.nama ?? ''}
            >
              {inisial(p.users?.nama ?? '?')}
            </div>
          ))}
          {pelaksanaAktif.length > 3 && (
            <div className="av av-sm av-lebih">+{pelaksanaAktif.length - 3}</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {telat && (
            <span className="lc bermasalah" title={`Batas waktu terlampaui ${hariTerlampaui(spt)} hari`}>
              lewat batas
            </span>
          )}
          <span className={`lc ${spt.status}`}>{spt.status}</span>
        </div>
      </div>
    </Link>
  )
}
