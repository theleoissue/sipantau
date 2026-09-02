import { LABEL_KEADAAN, type KeadaanPiket } from '@/lib/piket/tipe'

/**
 * Lencana keadaan piket sebuah unit hari ini.
 *
 * Server Component murni — tidak ada keadaan, tidak ada interaksi, jadi
 * tidak ada alasan mengirimnya ke peramban sebagai kode klien.
 *
 * Mengembalikan null bila unitnya tidak ada di jadwal hari ini. Itu
 * keadaan yang WAJAR, bukan galat: jadwal piket modul tambahan, dan
 * seluruh sistem berjalan penuh tanpa pernah ada satu baris pun di
 * dalamnya. Yang tidak boleh terjadi adalah beranda atau peta ikut mati
 * hanya karena jadwalnya belum disusun.
 */
export function LencanaPiket({ keadaan }: { keadaan: KeadaanPiket | undefined }) {
  if (!keadaan) return null
  return (
    <span className={`lencana-piket k-${keadaan}`} title={`Hari ini: ${LABEL_KEADAAN[keadaan]}`}>
      {LABEL_KEADAAN[keadaan]}
    </span>
  )
}
