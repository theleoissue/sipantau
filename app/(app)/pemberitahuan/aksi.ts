'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'
import { daftarNotifikasi } from '@/lib/notifikasi/kueri'
import type { Notifikasi } from '@/lib/notifikasi/tipe'

export interface HasilTindakan {
  galat?: string
}

/** KP-6.9-13: dipanggil tombol "Muat lebih banyak" — daftarNotifikasi
 *  sendiri sudah menerima offset/batas sejak awal ditulis, tetapi
 *  halaman Pemberitahuan tidak pernah memanggilnya dengan argumen apa
 *  pun sampai aksi ini ada, jadi baris ke-31 dan seterusnya tidak
 *  pernah terjangkau. Bukan kebocoran (RLS tetap menyaring milik
 *  sendiri), tetapi baris lama tidak terlihat siapa pun, termasuk
 *  pemiliknya sendiri. */
export async function muatNotifikasiLanjut(offset: number): Promise<Notifikasi[]> {
  return daftarNotifikasi(offset)
}

/** KP-6.9-09: dibaca_pada terisi saat dibuka. RLS + trg_notifikasi_
 *  hanya_tandai_baca (0019) memastikan hanya baris milik sendiri yang
 *  bisa disentuh dan hanya kolom ini yang benar-benar berubah. */
export async function tandaiSudahDibaca(id: string): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { error } = await supabase
    .from('notifikasi')
    .update({ dibaca_pada: new Date().toISOString() })
    .eq('id', id)
    .is('dibaca_pada', null)

  if (error) return { galat: `Gagal menandai sudah dibaca: ${error.message}` }
  revalidatePath('/pemberitahuan')
  return {}
}

/** KP-6.9-10: seluruh milik sendiri yang belum dibaca ditandai sekaligus. */
export async function tandaiSemuaSudahDibaca(): Promise<HasilTindakan> {
  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { galat: 'Sesi Anda sudah berakhir. Masuk kembali.' }

  const { error } = await supabase
    .from('notifikasi')
    .update({ dibaca_pada: new Date().toISOString() })
    .eq('penerima_id', user.id)
    .is('dibaca_pada', null)

  if (error) return { galat: `Gagal menandai semua sudah dibaca: ${error.message}` }
  revalidatePath('/pemberitahuan')
  return {}
}
