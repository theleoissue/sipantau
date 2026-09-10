import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'

// Disajikan lewat rute ini (bukan diimpor langsung dari komponen klien)
// supaya berkas 12,7MB-nya tidak pernah masuk hitungan bundel JS mana pun —
// browser memuatnya sendiri lewat tag <script> saat halaman scan dibuka,
// dan cache-nya abadi karena versi paket dikunci di package.json.

const brotli = promisify(brotliCompress)
const gzipAsync = promisify(gzip)

const SUMBER = 'node_modules/@techstark/opencv-js/dist/opencv.js'

// Dimampatkan sekali lalu ditahan di memori: 12,7MB -> 3,1MB (brotli).
// Hanya bentuk yang benar-benar diminta yang dikerjakan, supaya permintaan
// pertama tidak membayar dua kompresi sekaligus.
const simpanan = new Map<string, Promise<Buffer>>()

function siapkan(bentuk: 'br' | 'gzip' | 'mentah'): Promise<Buffer> {
  const tersimpan = simpanan.get(bentuk)
  if (tersimpan) return tersimpan
  const kerja = (async () => {
    const mentah = await readFile(join(process.cwd(), SUMBER))
    if (bentuk === 'mentah') return mentah
    if (bentuk === 'gzip') return gzipAsync(mentah, { level: 6 })
    return brotli(mentah, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
  })()
  simpanan.set(bentuk, kerja)
  return kerja
}

export async function GET(permintaan: Request) {
  const diterima = permintaan.headers.get('accept-encoding') ?? ''
  const bentuk = diterima.includes('br') ? 'br' : diterima.includes('gzip') ? 'gzip' : 'mentah'
  const isi = await siapkan(bentuk)

  const kepala: Record<string, string> = {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
    Vary: 'Accept-Encoding',
  }
  if (bentuk !== 'mentah') kepala['Content-Encoding'] = bentuk

  return new Response(new Uint8Array(isi), { headers: kepala })
}
