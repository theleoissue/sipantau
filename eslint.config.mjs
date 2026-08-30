// eslint-config-next 16 sudah mengekspor flat config secara langsung,
// jadi FlatCompat tidak dibutuhkan (dan justru bentrok dengan ESLint 9).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const konfigurasi = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      // Perkakas uji berjalan di Node polos, bukan di dalam Next.js.
      'supabase/tests/**',
      // Fungsi Tepi berjalan di Deno (global Deno, impor URL) — bukan
      // bagian aplikasi Next.js, punya konvensi sendiri.
      'supabase/functions/**',
    ],
  },
]

export default konfigurasi
