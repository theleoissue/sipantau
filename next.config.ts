import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Berkas keluaran mandiri — dibutuhkan bila kelak dibungkus Capacitor.
  reactStrictMode: true,
  experimental: {
    // Scan SPRIN membawa beberapa halaman foto/PDF melalui Server Action.
    // Batas bawaan 1 MB terlalu kecil untuk dokumen hasil kamera.
    serverActions: { bodySizeLimit: '4mb' },
  },
}

export default nextConfig
