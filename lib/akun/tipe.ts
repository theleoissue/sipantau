import type { Peran } from '@/lib/supabase/types'

/** Peran yang dapat dipilih lewat Tambah/Sunting Akun. Pemeliharaan
 *  SENGAJA di luar daftar ini — AM-6.6-06: "tidak dapat diberikan lewat
 *  antarmuka mana pun. Akun itu dibuat sekali saat penyiapan sistem." */
export const PERAN_DAPAT_DIPILIH: Peran[] = ['admin', 'kasubdit', 'kanit', 'panit', 'anggota']

export interface Akun {
  id: string
  nama: string
  nrp: string
  pangkat: string | null
  peran: Peran
  unit_id: string
  unit_nama: string
  aktif: boolean
  terakhir_masuk: string | null
}

export interface UnitRingkas {
  id: string
  nama: string
}
