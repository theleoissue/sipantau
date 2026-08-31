'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'
import type { Peran } from '@/lib/supabase/types'

// =====================================================================
// Seluruh penulisan akun lewat berkas ini (docs/CLAUDE.md §6.1).
//
// buat-akun, nonaktifkan-akun, reset-kata-sandi HARUS lewat Fungsi Tepi
// (supabase.functions.invoke) — fungsi basis data di baliknya sengaja
// hanya diberi hak eksekusi ke service_role (migrasi 0035), bukan
// authenticated, supaya wewenang & batas laju tidak bisa dilewati lewat
// panggilan RPC langsung dari sesi biasa.
//
// Sunting nama/pangkat/peran/unit dan Aktifkan Kembali TIDAK lewat
// Fungsi Tepi — Admin sudah menembus fn_jaga_kolom_users lewat sesinya
// sendiri (migrasi 0034), jadi pembaruan RLS biasa sudah cukup dan lebih
// sederhana daripada menambah Fungsi Tepi kelima.
// =====================================================================

export interface HasilAksi {
  galat?: string
  sukses?: string
}

export interface HasilKataSandi {
  galat?: string
  kataSandiSementara?: string
  userId?: string
}

/** Menerjemahkan galat Fungsi Tepi (FunctionsHttpError berbadan JSON
 *  {kode, keterangan}) menjadi kalimat yang dapat dibaca manusia. */
async function bacaGalatFungsiTepi(error: unknown, pesanBawaan: string): Promise<string> {
  const e = error as { context?: Response }
  if (e?.context) {
    try {
      const badan = await e.context.clone().json()
      if (typeof badan?.keterangan === 'string') return badan.keterangan
    } catch {
      // Badan bukan JSON — lanjut ke pesan bawaan.
    }
  }
  return pesanBawaan
}

interface IsianAkunBaru {
  nama: string
  nrp: string
  pangkat: string
  peran: Peran
  unit_id: string | null
}

export async function buatAkunAksi(isian: IsianAkunBaru): Promise<HasilKataSandi> {
  const supabase = await klienServer()
  const { data, error } = await supabase.functions.invoke('buat-akun', {
    body: {
      nama: isian.nama.trim(),
      nrp: isian.nrp.trim(),
      pangkat: isian.pangkat.trim(),
      peran: isian.peran,
      unit_id: isian.unit_id,
    },
  })

  if (error) return { galat: await bacaGalatFungsiTepi(error, 'Gagal membuat akun') }

  revalidatePath('/akun')
  return { kataSandiSementara: data.kata_sandi_sementara, userId: data.user_id }
}

interface IsianSuntingAkun {
  nama: string
  pangkat: string
  peran: Peran
  unit_id: string
}

/** KP-6.6-09/11/14. NRP dan email_sistem SENGAJA tidak dapat disunting
 *  di sini — KP-6.6-13 mensyaratkan email sistem autentikasi (auth.
 *  users.email) ikut berubah, itu di luar jangkauan pembaruan RLS biasa
 *  dan Fungsi Tepi untuk itu belum ada (daftar tertutup, CLAUDE.md §8).
 *  Dicatat sebagai celah terbuka, bukan ditebak jalan keluarnya. */
export async function suntingAkunAksi(akunId: string, isian: IsianSuntingAkun): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase
    .from('users')
    .update({
      nama: isian.nama.trim(),
      pangkat: isian.pangkat.trim(),
      peran: isian.peran,
      unit_id: isian.unit_id,
    })
    .eq('id', akunId)

  if (error) return { galat: `Gagal menyimpan perubahan: ${error.message}` }

  revalidatePath('/akun')
  return { sukses: 'Perubahan tersimpan' }
}

/** KP-6.6-21: akun nonaktif yang diaktifkan kembali dapat masuk lagi
 *  memakai kata sandi lamanya, wajib_ganti_sandi tidak disetel ulang —
 *  jadi cukup pembaruan kolom aktif biasa, bukan Fungsi Tepi. */
export async function aktifkanKembaliAksi(akunId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.from('users').update({ aktif: true }).eq('id', akunId)

  if (error) return { galat: `Gagal mengaktifkan kembali: ${error.message}` }

  revalidatePath('/akun')
  return { sukses: 'Akun diaktifkan kembali' }
}

export async function nonaktifkanAkunAksi(akunId: string): Promise<HasilAksi> {
  const supabase = await klienServer()
  const { error } = await supabase.functions.invoke('nonaktifkan-akun', {
    body: { user_id_sasaran: akunId },
  })

  if (error) return { galat: await bacaGalatFungsiTepi(error, 'Gagal menonaktifkan akun') }

  revalidatePath('/akun')
  return { sukses: 'Akun dinonaktifkan' }
}

export async function resetSandiAksi(akunId: string): Promise<HasilKataSandi> {
  const supabase = await klienServer()
  const { data, error } = await supabase.functions.invoke('reset-kata-sandi', {
    body: { user_id_sasaran: akunId },
  })

  if (error) return { galat: await bacaGalatFungsiTepi(error, 'Gagal mereset kata sandi') }

  revalidatePath('/akun')
  return { kataSandiSementara: data.kata_sandi_sementara }
}

