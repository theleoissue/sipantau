import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Berkas keluaran mandiri — dibutuhkan bila kelak dibungkus Capacitor.
  reactStrictMode: true,
  experimental: {
    // Scan SPRIN membawa beberapa halaman foto/PDF melalui Server Action.
    // Batas bawaan 1 MB terlalu kecil untuk dokumen hasil kamera.
    serverActions: { bodySizeLimit: '4mb' },
    // Halaman dinamis yang baru dibuka dipakai ulang dari cache router
    // selama 30 detik, sehingga kembali ke menu yang barusan dikunjungi
    // tampil seketika alih-alih menunggu server lagi. Bawaannya 0 sejak
    // Next 15 (dokumentasi staleTimes): setiap perpindahan menu, termasuk
    // bolak-balik antara dua menu yang sama, menembak server dari nol.
    //
    // Tiga puluh detik dengan sengaja, sama dengan JEDA_SEGARKAN_MS di
    // PenyegarOtomatis — angka paling basi yang mungkin terlihat tidak
    // bertambah dari yang sudah berlaku hari ini. Server Action yang
    // memanggil revalidatePath, dan setiap router.refresh(), tetap
    // membuang cache ini seketika; peta dan lonceng tidak terpengaruh
    // karena keduanya hidup lewat Realtime, bukan lewat render server.
    staleTimes: { dynamic: 30 },
  },
}

export default nextConfig
