/* eslint-disable @typescript-eslint/no-explicit-any -- OpenCV.js tidak menyediakan deklarasi API yang dapat dipakai. */

// Deteksi tepi dokumen + pelurusan perspektif + penghilang bayangan,
// meniru cara kerja CamScanner. Dijalankan sepenuhnya di klien lewat
// OpenCV.js (dimuat lazy dari /opencv-js, lihat app/opencv-js/route.ts
// untuk alasan kenapa lewat rute itu, bukan impor langsung).
//
// Foto SPRIN tidak pernah disimpan (lihat components/sipantau/scan-sprin.tsx)
// — pemrosesan ini murni supaya Gemini membaca lebih akurat, bukan
// menghasilkan arsip.

/** Sisi terpanjang hasil akhir. Sama dengan batas pemindai native. */
const SISI_MAKS = 1800

export type Titik = { x: number; y: number }
export type SudutDokumen = [Titik, Titik, Titik, Titik] // kiri-atas, kanan-atas, kanan-bawah, kiri-bawah

let cvPromise: Promise<any> | null = null

/** Memuat OpenCV.js sekali saja, dipakai bersama semua pemanggil. */
export function muatOpenCv(): Promise<any> {
  if (cvPromise) return cvPromise
  cvPromise = new Promise((selesai, gagal) => {
    const pakai = () => {
      const cv = (window as any).cv
      if (cv instanceof Promise) cv.then(selesai, gagal)
      else if (cv?.Mat) selesai(cv)
      else gagal(new Error('OpenCV tidak termuat dengan benar'))
    }
    if ((window as any).cv) { pakai(); return }
    const skrip = document.createElement('script')
    skrip.src = '/opencv-js'
    skrip.onload = pakai
    skrip.onerror = () => { skrip.remove(); gagal(new Error('Gagal memuat pustaka pemroses gambar')) }
    document.head.appendChild(skrip)
  }).catch(error => { cvPromise = null; throw error })
  return cvPromise
}

function urutkanSudut(titik: Titik[]): SudutDokumen {
  const jumlah = titik.map(p => p.x + p.y)
  const selisih = titik.map(p => p.x - p.y)
  return [
    titik[jumlah.indexOf(Math.min(...jumlah))],   // kiri-atas: x+y terkecil
    titik[selisih.indexOf(Math.max(...selisih))], // kanan-atas: x-y terbesar
    titik[jumlah.indexOf(Math.max(...jumlah))],   // kanan-bawah: x+y terbesar
    titik[selisih.indexOf(Math.min(...selisih))], // kiri-bawah: x-y terkecil
  ]
}

/**
 * Mencari kontur 4-sisi terbesar pada citra — diasumsikan tepi dokumen.
 * Mengembalikan null bila tidak ketemu kontur yang meyakinkan (dokumen
 * memenuhi setidaknya 20% area foto); pemanggil lalu jatuh ke sudut
 * bawaan supaya pengguna tetap bisa menyeretnya secara manual.
 */
export function deteksiDokumen(cv: any, gambar: HTMLImageElement): SudutDokumen | null {
  const src = cv.imread(gambar)
  try {
    const skalaKerja = 500 / Math.max(src.cols, src.rows)
    const kecil = new cv.Mat()
    cv.resize(src, kecil, new cv.Size(Math.round(src.cols * skalaKerja), Math.round(src.rows * skalaKerja)))
    const luasKecil = kecil.cols * kecil.rows
    const abu = new cv.Mat(); cv.cvtColor(kecil, abu, cv.COLOR_RGBA2GRAY)
    const blur = new cv.Mat(); cv.GaussianBlur(abu, blur, new cv.Size(5, 5), 0)
    const tepi = new cv.Mat(); cv.Canny(blur, tepi, 50, 150)
    const kernel = cv.Mat.ones(5, 5, cv.CV_8U)
    cv.dilate(tepi, tepi, kernel)
    const kontur = new cv.MatVector(); const hierarki = new cv.Mat()
    cv.findContours(tepi, kontur, hierarki, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

    let terbaik: any = null, areaTerbesar = 0
    for (let i = 0; i < kontur.size(); i++) {
      const c = kontur.get(i)
      const area = cv.contourArea(c)
      if (area < 0.2 * luasKecil) { c.delete(); continue }
      const peri = cv.arcLength(c, true)
      const approx = new cv.Mat()
      cv.approxPolyDP(c, approx, 0.02 * peri, true)
      if (approx.rows === 4 && cv.isContourConvex(approx) && area > areaTerbesar) {
        areaTerbesar = area
        if (terbaik) terbaik.delete()
        terbaik = approx
      } else approx.delete()
      c.delete()
    }

    let hasil: SudutDokumen | null = null
    if (terbaik) {
      const titik: Titik[] = []
      for (let i = 0; i < 4; i++) titik.push({ x: terbaik.intAt(i * 2) / skalaKerja, y: terbaik.intAt(i * 2 + 1) / skalaKerja })
      terbaik.delete()
      hasil = urutkanSudut(titik)
    }
    ;[kecil, abu, blur, tepi, kernel, hierarki].forEach(m => m.delete())
    kontur.delete()
    return hasil
  } finally { src.delete() }
}

/** Sudut bawaan (persegi panjang dengan sedikit margin) untuk fallback deteksi gagal. */
export function sudutBawaan(lebar: number, tinggi: number): SudutDokumen {
  const mx = lebar * 0.06, my = tinggi * 0.06
  return [{ x: mx, y: my }, { x: lebar - mx, y: my }, { x: lebar - mx, y: tinggi - my }, { x: mx, y: tinggi - my }]
}

/**
 * Meluruskan perspektif sesuai empat sudut lalu meratakan pencahayaan:
 * setiap kanal warna dibagi versi blur besar dirinya sendiri (estimasi
 * bayangan/latar), yang menghilangkan bayangan tidak rata sekaligus
 * mencerahkan — teknik baku pada aplikasi pemindai dokumen.
 */
export function luruskanDanCerahkan(cv: any, gambar: HTMLImageElement, sudut: SudutDokumen): HTMLCanvasElement {
  const src = cv.imread(gambar)
  const [tl, tr, br, bl] = sudut
  const lebarAtas = Math.hypot(tr.x - tl.x, tr.y - tl.y)
  const lebarBawah = Math.hypot(br.x - bl.x, br.y - bl.y)
  const tinggiKiri = Math.hypot(bl.x - tl.x, bl.y - tl.y)
  const tinggiKanan = Math.hypot(br.x - tr.x, br.y - tr.y)
  let outW = Math.max(1, Math.round(Math.max(lebarAtas, lebarBawah)))
  let outH = Math.max(1, Math.round(Math.max(tinggiKiri, tinggiKanan)))

  // Batasi sisi terpanjang. Teks SPRIN masih terbaca jelas pada 1800px —
  // batas yang sama dipakai pemindai native — sementara biaya warp dan
  // perataan cahaya turun kuadratik terhadap ukuran. Tanpa ini, foto
  // 12MP dari galeri diproses mentah-mentah.
  const skala = Math.min(1, SISI_MAKS / Math.max(outW, outH))
  outW = Math.max(1, Math.round(outW * skala))
  outH = Math.max(1, Math.round(outH * skala))

  const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y])
  const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outW, 0, outW, outH, 0, outH])
  const M = cv.getPerspectiveTransform(srcTri, dstTri)
  const lurus = new cv.Mat()
  cv.warpPerspective(src, lurus, M, new cv.Size(outW, outH))

  const rgb = new cv.Mat(); cv.cvtColor(lurus, rgb, cv.COLOR_RGBA2RGB)
  const bg = new cv.Mat()
  const ukuranKernel = (Math.max(21, Math.round(Math.min(outW, outH) / 8)) | 1)

  // Latar ditaksir pada salinan 1/8, bukan pada gambar penuh. Blur kernel
  // raksasa berbiaya O(lebar x tinggi x kernel) dan sendirian memakan 89%
  // waktu pemrosesan (terukur 4.236 dari 4.772 ms). Karena yang dicari
  // hanya gradasi cahaya — yang berubah halus — menaksirnya pada salinan
  // kecil lalu membesarkannya kembali memberi hasil yang praktis sama:
  // 34x lebih cepat dengan selisih rata-rata 0,05 dari 255.
  const kecil = new cv.Mat(), latarKecil = new cv.Mat()
  cv.resize(rgb, kecil,
    new cv.Size(Math.max(1, Math.round(outW / 8)), Math.max(1, Math.round(outH / 8))),
    0, 0, cv.INTER_AREA)
  cv.GaussianBlur(kecil, latarKecil,
    new cv.Size(Math.max(3, Math.round(ukuranKernel / 8)) | 1, Math.max(3, Math.round(ukuranKernel / 8)) | 1), 0)
  cv.resize(latarKecil, bg, new cv.Size(outW, outH), 0, 0, cv.INTER_LINEAR)
  kecil.delete(); latarKecil.delete()
  const rgbF = new cv.Mat(), bgF = new cv.Mat(), normF = new cv.Mat()
  rgb.convertTo(rgbF, cv.CV_32F)
  bg.convertTo(bgF, cv.CV_32F)
  cv.divide(rgbF, bgF, normF, 255)
  const norm = new cv.Mat()
  normF.convertTo(norm, cv.CV_8U)

  const kanvas = document.createElement('canvas')
  cv.imshow(kanvas, norm)
  ;[src, srcTri, dstTri, M, lurus, rgb, bg, rgbF, bgF, normF, norm].forEach(m => m.delete())
  return kanvas
}
