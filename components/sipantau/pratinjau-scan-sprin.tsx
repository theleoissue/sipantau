'use client'

/* OpenCV.js memuat gambar secara asinkron di luar siklus React; referensi
   dipakai oleh handler drag/proses setelah gambar siap, bukan sebagai state UI. */
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/refs, react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from 'react'
import { DialogModal } from './dialog-modal'
import { Ikon } from './ikon'
import { sudutValid } from '@/lib/scan/validasi-sudut'
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
  const [skalaSentuh, setSkalaSentuh] = useState(1)
  const [pemrosesSiap, setPemrosesSiap] = useState(false)
  const sudahDisesuaikan = useRef(false)
  const gambar = useRef<HTMLImageElement | null>(null)
  const cvRef = useRef<any>(null)
  const svg = useRef<SVGSVGElement>(null)
  const seret = useRef<number | null>(null)
  useEffect(() => {
    const el = svg.current
    if (!el) return
    const ukur = () => {
      const matriks = el.getScreenCTM()
      if (matriks) setSkalaSentuh(1 / Math.abs(matriks.a))
    }
    const pengamat = new ResizeObserver(ukur)
    pengamat.observe(el); ukur()
    return () => pengamat.disconnect()
  }, [tahap])

  useEffect(() => {
    let batal = false
    const url = URL.createObjectURL(berkas)
    setFotoUrl(url)
    const img = new Image()
    img.onload = async () => {
      if (batal) return
      gambar.current = img
      setSudut(sudutBawaan(img.naturalWidth, img.naturalHeight))
      setTahap('sesuaikan')
      try {
        const cv = await muatOpenCv()
        if (batal) return
        cvRef.current = cv
        setPemrosesSiap(true)
        const terdeteksi = deteksiDokumen(cv, img)
        if (!sudahDisesuaikan.current) setSudut(terdeteksi ?? sudutBawaan(img.naturalWidth, img.naturalHeight))
        setTahap('sesuaikan')
      } catch {
        if (!batal) setGalat('Pemroses gambar belum siap. Periksa koneksi lalu coba muat ulang pemroses.')
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
    sudahDisesuaikan.current = true
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
    if (!sudut || !gambar.current || !pemrosesSiap) return
    if (!sudutValid(sudut)) { setGalat('Sudut saling bersilangan atau terlalu berdekatan. Sesuaikan kembali bingkainya.'); return }
    setGalat('')
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
          <button type="button" className="btn btn-o btn-sm pratinjau-scan-tutup" aria-label="Batalkan perapian halaman" title="Batal" onClick={onBatal} disabled={tahap === 'memproses'}>
            <Ikon nama="silang" />
          </button>
        </div>

        {tahap === 'memuat' && <p className="bantu">Menyiapkan pendeteksi tepi dokumen…</p>}
        {tahap === 'galat' && <p className="bantu" role="alert">{galat}</p>}

        {tahap === 'sesuaikan' && sudut && (
          <>
            <p className="bantu">Geser keempat sudut mengikuti tepi dokumen, lalu ketuk Luruskan.</p>
            <div className="pratinjau-scan-kanvas" style={{ aspectRatio: `${w * 1.12} / ${h + w * .12}` }}>
              <svg ref={svg} viewBox={`${-w * .06} ${-w * .06} ${w * 1.12} ${h + w * .12}`} preserveAspectRatio="xMidYMid meet"
                aria-label="Foto dan empat sudut pemotongan"
                onPointerMove={selamaSeret} onPointerUp={akhiriSeret} onPointerCancel={akhiriSeret}>
                <image href={fotoUrl} x="0" y="0" width={w} height={h} />
                <polygon points={sudut.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(37,99,235,.18)" stroke="#2563EB" strokeWidth={Math.max(3, w / 180)} />
                {sudut.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={26 * skalaSentuh} fill="transparent" onPointerDown={e => mulaiSeret(i, e)}
                      tabIndex={0} role="button" aria-label={`Sudut ${i + 1}. Gunakan tombol panah untuk menggeser.`}
                      onKeyDown={e => {
                        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
                        e.preventDefault()
                        sudahDisesuaikan.current = true
                        const jarak = (e.shiftKey ? 10 : 2) * skalaSentuh
                        const baru = [...sudut] as SudutDokumen
                        baru[i] = { x: Math.max(0, Math.min(w, p.x + (e.key === 'ArrowLeft' ? -jarak : e.key === 'ArrowRight' ? jarak : 0))), y: Math.max(0, Math.min(h, p.y + (e.key === 'ArrowUp' ? -jarak : e.key === 'ArrowDown' ? jarak : 0))) }
                        setSudut(baru)
                      }} />
                    <circle cx={p.x} cy={p.y} r={11 * skalaSentuh} fill="#2563EB" stroke="#fff" strokeWidth={2 * skalaSentuh} pointerEvents="none" />
                  </g>
                ))}
              </svg>
            </div>
            {galat && <p className="bantu" role="alert">{galat}</p>}
            {!pemrosesSiap && <button type="button" className="btn btn-o" onClick={async () => {
              setGalat('Memuat pemroses gambar…')
              try { cvRef.current = await muatOpenCv(); setPemrosesSiap(true); setGalat('') }
              catch { setGalat('Pemroses belum dapat dimuat. Periksa koneksi lalu coba lagi.') }
            }}>Muat ulang pemroses</button>}
            <button type="button" className="btn btn-o" onClick={() => { sudahDisesuaikan.current = true; setSudut(sudutBawaan(w, h)); setGalat('') }}>Atur ulang bingkai</button>
            <button type="button" className="btn btn-p" disabled={!pemrosesSiap} onClick={proses}>
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
