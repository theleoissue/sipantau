import { Ikon } from './ikon'

/**
 * Keadaan kosong untuk halaman yang rutenya sudah ada tetapi modulnya
 * belum dibangun. Bukan layar kosong tanpa keterangan (KP-6.1-21).
 *
 * Nadanya menyatakan keadaan, bukan meminta maaf berlebihan —
 * Prinsip Non-Menghakimi berlaku juga pada sistem terhadap dirinya.
 */
export function HalamanBelumDibangun({
  judul,
  modul,
  keterangan,
}: {
  judul: string
  modul: string
  keterangan?: string
}) {
  return (
    <>
      <div className="kh">
        <h1>{judul}</h1>
      </div>
      <div className="kosong">
        <Ikon nama="riwayat" />
        <h3>Belum tersedia</h3>
        <p>
          {keterangan ?? `Halaman ini bagian dari ${modul} dan sedang dibangun.`}
        </p>
      </div>
    </>
  )
}
