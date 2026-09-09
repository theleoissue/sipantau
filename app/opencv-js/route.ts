import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Disajikan lewat rute ini (bukan diimpor langsung dari komponen klien)
// supaya berkas 13MB-nya tidak pernah masuk hitungan bundel JS mana pun —
// browser memuatnya sendiri lewat tag <script> hanya saat dialog koreksi
// scan SPRIN dibuka, dan cache-nya abadi karena versi paket dikunci di
// package.json.
export async function GET() {
  const berkas = await readFile(
    join(process.cwd(), 'node_modules/@techstark/opencv-js/dist/opencv.js'),
  )
  return new Response(berkas, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
