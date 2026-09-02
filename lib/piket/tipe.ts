// Tipe murni jadwal piket (migrasi 0042/0043).

/** Urutannya BUKAN sekadar daftar — ini urutan siklus rotasinya, sama
 *  persis dengan enum keadaan_piket di basis data. Tiap unit bergerak
 *  cadangan -> piket -> lepas_dinas -> cadangan, dan seluruh unit
 *  bergeser serentak satu langkah tiap hari. */
export const SIKLUS_KEADAAN = ['cadangan', 'piket', 'lepas_dinas'] as const
export type KeadaanPiket = (typeof SIKLUS_KEADAAN)[number]

/** Huruf pada dokumen resmi. Dipakai di sel tabel yang sempit; nama
 *  panjangnya tetap tersedia lewat LABEL_KEADAAN untuk keterangan dan
 *  pembaca layar. */
export const HURUF_KEADAAN: Record<KeadaanPiket, string> = {
  piket: 'P',
  cadangan: 'C',
  lepas_dinas: 'LD',
}

export const LABEL_KEADAAN: Record<KeadaanPiket, string> = {
  piket: 'Piket',
  cadangan: 'Cadangan',
  lepas_dinas: 'Lepas Dinas',
}

export interface SelJadwal {
  tanggal: string
  unit_id: string
  keadaan: KeadaanPiket
  disunting_manual: boolean
  catatan: string | null
}

export interface UnitRingkas {
  id: string
  nama: string
  urutan: number
}

/** Hari kalender Asia/Jakarta dalam bentuk YYYY-MM-DD.
 *
 *  Server berjalan UTC. Tanpa zona ini "hari ini" berganti pukul 07.00
 *  WIB, dan penanda hari ini pada tabel jadwal akan menyorot kolom yang
 *  salah selama tujuh jam setiap hari — tanpa satu pun galat
 *  (CLAUDE.md §5.5). */
export function hariIniJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date())
}

/** Jumlah hari dalam sebuah bulan. Hari ke-0 bulan berikutnya adalah
 *  hari terakhir bulan ini — cara baku yang benar juga untuk Februari
 *  tahun kabisat. */
export function jumlahHari(tahun: number, bulan: number): number {
  return new Date(tahun, bulan, 0).getDate()
}

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/** Huruf hari untuk kepala kolom. Dihitung dari tanggal sebagai waktu
 *  lokal (bukan UTC) supaya tidak bergeser satu hari. */
export function hurufHari(tahun: number, bulan: number, hari: number): string {
  return ['M', 'S', 'S', 'R', 'K', 'J', 'S'][new Date(tahun, bulan - 1, hari).getDay()]
}

/** Sabtu atau Minggu. Dipakai menandai kolom akhir pekan — dokumen
 *  acuan tidak membedakannya, tetapi pengawas tetap perlu melihatnya
 *  saat menyusun. */
export function akhirPekan(tahun: number, bulan: number, hari: number): boolean {
  const h = new Date(tahun, bulan - 1, hari).getDay()
  return h === 0 || h === 6
}
