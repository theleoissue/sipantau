import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...kelas: ClassValue[]) {
  return twMerge(clsx(kelas))
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
