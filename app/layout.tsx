import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TampilanPerangkat } from '@/components/sipantau/tampilan-perangkat'
import { NavigasiPerangkat } from '@/components/sipantau/navigasi-perangkat'

export const metadata: Metadata = {
  title: 'Si PANTAU — Sistem Pengawasan Anggota Terpadu',
  description:
    'Sistem Pengawasan Anggota Terpadu — Unit I Subdit IV Ditreskrimsus Polda Jawa Barat. Aplikasi internal.',
  // Aplikasi internal institusi, tidak diterbitkan ke toko aplikasi umum
  // dan tidak untuk diindeks mesin pencari (docs/00-fondasi.md §1.5).
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0F1C32',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  // Zoom TIDAK dikunci: sebagian pengguna membaca di bawah matahari
  // dan perlu memperbesar (docs/00-fondasi.md §10.5).
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body><TampilanPerangkat /><NavigasiPerangkat />{children}</body>
    </html>
  )
}
