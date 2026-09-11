import { Preferences } from '@capacitor/preferences'
import { kirimTitikBorongan, type TitikMasuk } from '@/app/(app)/tugas/aksi'
import {
  antrekanKe, kirimAntreanDari,
  type HasilKirimAntrean, type Penyimpanan, type TitikTersimpan,
} from './antrean-inti'

// =====================================================================
// Antrean Titik luring — penyambung antara inti (antrean-inti.ts) dengan
// penyimpanan perangkat dan Server Action.
//
// Sebelum berkas ini ada, Titik yang gagal terkirim HILANG: penangannya
// hanya memasang tulisan "Akan dicoba lagi" yang tidak pernah benar —
// tidak ada yang disimpan, tidak ada yang diulang. Jalur native pun
// tidak menolong; pustakanya sendiri mencatat "failed POSTs are logged
// and dropped".
//
// BATAS YANG DISADARI: ini antrean di dalam JS, jadi ia hanya menutup
// keadaan "aplikasi masih hidup, jaringan mati". Begitu proses aplikasi
// dimatikan sistem, tidak ada JS yang berjalan untuk mengantre —
// keadaan itu baru tertutup antrean di sisi native (Jalur A5), yang
// menuntut APK dibangun ulang.
// =====================================================================

const KUNCI = 'sipantau.antrean-titik'

export type { HasilKirimAntrean }

/** Titik yang menunggu giliran, lengkap supaya tetap sah setelah aplikasi dibuka ulang. */
export interface TitikAntre extends Omit<TitikMasuk, 'usiaMs'> {
  /**
   * Waktu tangkap menurut jam perangkat. Disimpan mutlak, lalu diubah
   * jadi umur tepat saat dikirim — lihat alasannya pada TitikMasuk.usiaMs.
   */
  ditangkapPada: number
}

const penyimpanan: Penyimpanan = {
  async baca() {
    try {
      const { value } = await Preferences.get({ key: KUNCI })
      if (!value) return []
      const isi = JSON.parse(value)
      return Array.isArray(isi) ? isi : []
    } catch {
      // Isi rusak tidak boleh membuat pelacakan berhenti total.
      return []
    }
  },
  async tulis(daftar) {
    await Preferences.set({ key: KUNCI, value: JSON.stringify(daftar) })
  },
}

export async function jumlahTertunda(): Promise<number> {
  return (await penyimpanan.baca()).length
}

/** Menaruh satu Titik di ujung antrean. Mengembalikan false bila antrean penuh. */
export function antrekan(titik: TitikAntre): Promise<boolean> {
  return antrekanKe(penyimpanan, titik as unknown as TitikTersimpan)
}

/**
 * Penolakan yang tidak akan pernah berubah sekeras apa pun diulang.
 * Selain ini — jaringan, migrasi belum dijalankan, server bermasalah —
 * Titik DIPERTAHANKAN. Daftar ini sengaja pendek dan tertutup: salah
 * menebak ke arah "buang" berarti bukti lapangan hilang.
 */
const PENOLAKAN_PERMANEN = [
  'SESI_TERTUTUP',
  'SESI_TIDAK_DITEMUKAN',
  'BUKAN_PEMEGANG',
  'WAKTU_TIDAK_MASUK_AKAL',
  'BENTUK_TIDAK_SAH',
  'TERLALU_BANYAK',
  'Sesi Tugas ini sudah berakhir',
]

function permanen(pesan: string): boolean {
  return PENOLAKAN_PERMANEN.some(k => pesan.includes(k))
}

let sedangMengalir = false

/** Mengosongkan antrean sejauh yang jaringan izinkan. Aman dipanggil bertindihan. */
export async function kirimAntrean(): Promise<HasilKirimAntrean> {
  if (sedangMengalir) return { terkirim: 0, tersisa: await jumlahTertunda() }
  sedangMengalir = true
  try {
    return await kirimAntreanDari(penyimpanan, async (kelompok, usia) => {
      // ditangkapPada tidak ikut dikirim: server menerima UMUR, bukan
      // waktu perangkat — lihat TitikMasuk.usiaMs.
      const hasil = await kirimTitikBorongan(kelompok.map((titik, i) => {
        const sisa = { ...(titik as unknown as TitikAntre) } as Partial<TitikAntre>
        delete sisa.ditangkapPada
        return { ...(sisa as Omit<TitikAntre, 'ditangkapPada'>), usiaMs: usia[i] }
      }))
      return { galat: hasil.galat, tolakPermanen: hasil.galat ? permanen(hasil.galat) : false }
    })
  } finally {
    sedangMengalir = false
  }
}
