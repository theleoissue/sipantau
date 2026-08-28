import { redirect } from 'next/navigation'

// proxy.ts sudah mengalihkan '/' ke beranda peran bagi yang sudah masuk.
// Baris ini menangani sisanya.
export default function Akar() {
  redirect('/masuk')
}
