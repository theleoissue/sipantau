'use client'

/* OpenCV.js memuat gambar secara asinkron di luar siklus React; referensi
   dipakai oleh handler drag/proses setelah gambar siap, bukan sebagai state UI. */
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/refs, react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from 'react'
import { DialogModal } from './dialog-modal'
import { Ikon } from './ikon'
import {
  deteksiDokumen, luruskanDanCerahkan, muatOpenCv, sudutBawaan,
  type SudutDokumen, type Titik,
} from '@/lib/scan/pemroses-dokumen'

type Tahap = 'memuat' | 'sesuaikan' | 'memproses' | 'pratinjau' | 'galat'

/**
 * Koreksi satu halaman SPRIN sebelum dikirim ke Gemini: deteksi tepi
 * dokumen otomatis (boleh digeser manual bila meleset), luruskan
 * perspektifnya, lalu hilangkan bayangan/cerahkan — meniru cara kerja
 * aplikasi pemindai dokumen. Hasilnya dipakai menggantikan foto mentah,
 * bukan disimpan sebagai arsip (lihat scan-sprin.tsx).
 */
export function PratinjauScanSprin({ berkas, onSelesai, onBatal }: {
  berkas: File
  onSelesai: (hasil: File) => void
  onBatal: () => void
}) {
  const [tahap, setTahap] = useState<Tahap>('memuat')
  const [galat, setGalat] = useState('')
  const [sudut, setSudut] = useState<SudutDokumen | null>(null)
  const [fotoUrl, setFotoUrl] = useState('')
  const [hasilKanvas, setHasilKanvas] = useState<HTMLCanvasElement | null>(null)
  const [hasilUrl, setHasilUrl] = useState('')
  const gambar = useRef<HTMLImageElement | null>(null)
  const cvRef = useRef<any>(null)
  const svg = useRef<SVGSVGElement>(null)
  const seret = useRef<number | null>(null)

  useEffect(() => {
    let batal = false
    const url = URL.createObjectURL(berkas)
    setFotoUrl(url)
    const img = new Image()
    img.onload = async () => {
      if (batal) return
      gambar.current = img
      try {
        const cv = await muatOpenCv()
        if (batal) return
        cvRef.current = cv
        const terdeteksi = deteksiDokumen(cv, img)
        setSudut(terdeteksi ?? sudutBawaan(img.naturalWidth, img.naturalHeight))
        setTahap('sesuaikan')
      } catch {
        if (!batal) { setGalat('Pustaka pemroses gambar gagal dimuat. Periksa koneksi internet.'); setTahap('galat') }
      }
    }
    img.onerror = () => { if (!batal) { setGalat('Foto tidak dapat dibaca.'); setTahap('galat') } }
    img.src = url
    return () => { batal = true; URL.revokeObjectURL(url) }
  }, [berkas])

  function keTitikGambar(clientX: number, clientY: number): Titik {
    const el = svg.current!
    const titik = el.createSVGPoint()
    titik.x = clientX; titik.y = clientY
    const p = titik.matrixTransform(el.getScreenCTM()!.inverse())
    const w = gambar.current!.naturalWidth, h = gambar.current!.naturalHeight
    return { x: Math.min(Math.max(p.x, 0), w), y: Math.min(Math.max(p.y, 0), h) }
  }

  function mulaiSeret(i: number, e: React.PointerEvent) {
    e.preventDefault()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    seret.current = i
  }
  function selamaSeret(e: React.PointerEvent) {
    if (seret.current === null || !sudut) return
    const baru = [...sudut] as SudutDokumen
    baru[seret.current] = keTitikGambar(e.clientX, e.clientY)
    setSudut(baru)
  }
  function akhiriSeret() { seret.current = null }

  function proses() {
    if (!sudut || !gambar.current) return
    setTahap('memproses')
    // Beri kesempatan React menggambar status "Memproses…" dulu — warp +
    // normalisasi pencahayaan cukup berat untuk foto beresolusi penuh.
    window.setTimeout(() => {
      try {
        const kanvas = luruskanDanCerahkan(cvRef.current, gambar.current!, sudut)
        setHasilKanvas(kanvas)
        // Sekali di sini, bukan di dalam JSX: toDataURL berjalan sinkron
        // dan memblokir UI, jadi memanggilnya saat render membuatnya
        // terhitung ulang setiap kali komponen ini digambar ulang.
        setHasilUrl(kanvas.toDataURL('image/jpeg', 0.85))
        setTahap('pratinjau')
      } catch {
        setGalat('Foto gagal diproses. Coba sesuaikan ulang sudutnya atau potret ulang.')
        setTahap('galat')
      }
    }, 30)
  }

  function konfirmasi() {
    hasilKanvas!.toBlob(blob => {
      if (!blob) { setGalat('Hasil tidak dapat disiapkan. Coba lagi.'); setTahap('galat'); return }
      onSelesai(new File([blob], berkas.name.replace(/\.\w+$/, '') + '-rapi.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.85)
  }

  const w = gambar.current?.naturalWidth ?? 1, h = gambar.current?.naturalHeight ?? 1

  return (
    <DialogModal label="Sesuaikan hasil scan" terkunci={tahap === 'memproses'} onTutup={onBatal}>
      <div className="pratinjau-scan">
        <div className="pratinjau-scan-kepala">
          <strong>Rapikan halaman</strong>
          <button type="button" className="btn btn-o btn-sm" onClick={onBatal} disabled={tahap === 'memproses'}>
            <Ikon nama="silang" />Batal
          </button>
        </div>

        {tahap === 'memuat' && <p className="bantu">Menyiapkan pendeteksi tepi dokumen…</p>}
        {tahap === 'galat' && <p className="bantu" role="alert">{galat}</p>}

        {tahap === 'sesuaikan' && sudut && (
          <>
            <p className="bantu">Geser keempat sudut mengikuti tepi dokumen, lalu ketuk Luruskan.</p>
            <div className="pratinjau-scan-kanvas">
              <img src={fotoUrl} alt="" draggable={false} />
              <svg ref={svg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet"
                onPointerMove={selamaSeret} onPointerUp={akhiriSeret} onPointerCancel={akhiriSeret}>
                <polygon points={sudut.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(37,99,235,.18)" stroke="#2563EB" strokeWidth={Math.max(2, w / 220)} />
                {sudut.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={Math.max(14, w / 45)}
                    fill="#2563EB" stroke="#fff" strokeWidth={Math.max(2, w / 300)}
                    onPointerDown={e => mulaiSeret(i, e)} />
                ))}
              </svg>
            </div>
            <button type="button" className="btn btn-p" onClick={proses}>
              <Ikon nama="centang" />Luruskan &amp; cerahkan
            </button>
          </>
        )}

        {tahap === 'memproses' && <p className="bantu">Meluruskan dan mencerahkan halaman…</p>}

        {tahap === 'pratinjau' && hasilKanvas && (
          <>
            <div className="pratinjau-scan-hasil">
              <img src={hasilUrl} alt="Hasil setelah diluruskan dan dicerahkan" />
            </div>
            <div className="pratinjau-scan-aksi">
              <button type="button" className="btn btn-o" onClick={() => setTahap('sesuaikan')}>
                <Ikon nama="silang" />Sesuaikan lagi
              </button>
              <button type="button" className="btn btn-p" onClick={konfirmasi}>
                <Ikon nama="centang" />Pakai halaman ini
              </button>
            </div>
          </>
        )}
      </div>
    </DialogModal>
  )
}
