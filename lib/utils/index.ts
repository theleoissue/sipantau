import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...kelas: ClassValue[]) {
  return twMerge(clsx(kelas))
}

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Dipakai halaman rincian (mis. /penugasan/[id]) SEBELUM id dipakai
 * pada kueri apa pun. Kolom id di seluruh tabel berjenis uuid — bila
 * alamat diisi string yang bukan format itu sama sekali, PostgREST
 * melempar "invalid input syntax for type uuid" yang tertangkap
 * error.tsx (kegagalan sistem), padahal yang tepat adalah
 * not-found.tsx (alamat ini memang tidak ada) — dua pesan yang berbeda
 * maknanya bagi pengguna.
 */
export function idValid(id: string): boolean {
  return POLA_UUID.test(id)
}

/** Inisial untuk avatar. "AKP Tito Witular" -> "TW" */
export function inisial(nama: string): string {
  const kata = nama
    .replace(/^(AKBP|KOMPOL|AKP|IPTU|IPDA|AIPTU|AIPDA|BRIPKA|BRIGADIR|BRIPTU|BRIPDA)\s+/i, '')
    .trim()
    .split(/\s+/)
  if (kata.length === 0) return '?'
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase()
  return (kata[0][0] + kata[kata.length - 1][0]).toUpperCase()
}
