'use client'

import { useEffect, useRef, useState } from 'react'
import { Ikon } from './ikon'

interface TitikPeta {
  nama: string
  lat: string
  lng: string
}

/**
 * Peta pemilih titik lokasi wizard Terbitkan — melengkapi KP-6.2-16
 * (tiga cara menetapkan koordinat: pin di peta, ketik lintang/bujur,
 * cari nama tempat). Acuan interaksi disalin dari
 * docs/sipantau-mockup-v2-sprin.html baris 2193-2278 (peta-tb):
 *
 *  - Klik di peta   → koordinat TITIK AKTIF pindah ke situ.
 *  - Seret pin      → koordinat titik itu sendiri yang berubah.
 *  - Klik pin lain  → titik itu jadi aktif.
 *  - Pencarian (Nominatim, countrycodes=id) HANYA menggeser pandangan
 *    peta — tidak langsung menjatuhkan pin. Hasil geocoding nama
 *    tempat sering hanya perkiraan area, bukan titik presisi; pengguna
 *    tetap yang mengonfirmasi titik pastinya lewat klik.
 *
 * Kotak lintang/bujur manual di wizard TETAP ada di luar komponen ini
 * (cara kedua dari tiga) — komponen ini murni menambahkan dua cara
 * yang belum ada, tidak menggantikan yang sudah ada.
 */
export function PetaPilihLokasi({
  titik,
  aktif,
  onAktifChange,
  onUbahKoordinat,
}: {
  titik: TitikPeta[]
  aktif: number
  onAktifChange: (i: number) => void
  onUbahKoordinat: (i: number, lat: string, lng: string) => void
}) {
  const elPeta = useRef<HTMLDivElement>(null)
  const peta = useRef<import('leaflet').Map | null>(null)
  const penanda = useRef<import('leaflet').Marker[]>([])
  const [cari, setCari] = useState('')
  const [mencari, setMencari] = useState(false)
  const [galatCari, setGalatCari] = useState<string | null>(null)

  // Bacaan terkini lewat ref supaya efek pemasangan-sekali di bawah
  // tidak perlu didaftarkan ulang tiap kali titik/aktif berubah —
  // pola sama seperti alasan peta-langsung.tsx membangun peta sekali.
  // Disinkronkan lewat useEffect (bukan langsung saat render) karena
  // menulis ref.current selama render dilarang aturan react-hooks/refs.
  const titikRef = useRef(titik)
  const aktifRef = useRef(aktif)
  const onAktifRef = useRef(onAktifChange)
  const onUbahRef = useRef(onUbahKoordinat)
  useEffect(() => {
    titikRef.current = titik
    aktifRef.current = aktif
    onAktifRef.current = onAktifChange
    onUbahRef.current = onUbahKoordinat
  })

  // Bangun peta SEKALI saat pemasangan.
  useEffect(() => {
    let batal = false
    import('leaflet').then(L => {
      if (batal || !elPeta.current || peta.current) return
      const t0 = titikRef.current[0]
      const punyaKoordinat = t0 && t0.lat && t0.lng
      peta.current = L.map(elPeta.current, { zoomControl: true, attributionControl: true })
        .setView(punyaKoordinat ? [Number(t0.lat), Number(t0.lng)] : [-6.9, 107.6], punyaKoordinat ? 13 : 9)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap',
      }).addTo(peta.current)

      peta.current.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        onUbahRef.current(aktifRef.current, e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6))
      })
    })
    return () => {
      batal = true
      peta.current?.remove()
      peta.current = null
    }
  }, [])

  // Gambar ulang seluruh pin tiap kali daftar titik/titik aktif berubah.
  useEffect(() => {
    let batal = false
    import('leaflet').then(L => {
      if (batal || !peta.current) return
      const p = peta.current

      for (const m of penanda.current) m.remove()
      penanda.current = []

      titik.forEach((t, i) => {
        if (!t.lat || !t.lng) return
        const warna = i === aktif ? '#F5A623' : '#94A3B8'
        const ikon = L.divIcon({
          className: '', iconSize: [26, 26], iconAnchor: [13, 13],
          html: `<div style="width:26px;height:26px;border-radius:50%;background:${warna};display:grid;place-items:center;font:700 12px 'Inter',sans-serif;color:#0F1C32;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">${i + 1}</div>`,
        })
        const m = L.marker([Number(t.lat), Number(t.lng)], { icon: ikon, draggable: true }).addTo(p)
        m.on('dragend', () => {
          const pos = m.getLatLng()
          onUbahRef.current(i, pos.lat.toFixed(6), pos.lng.toFixed(6))
        })
        m.on('click', () => onAktifRef.current(i))
        penanda.current.push(m)
      })
    })
    return () => { batal = true }
  }, [titik, aktif])

  async function cariLokasi() {
    if (!cari.trim()) return
    setMencari(true)
    setGalatCari(null)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(cari.trim())}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'id' } })
      const data = await res.json() as { lat: string; lon: string }[]
      if (data.length > 0 && peta.current) {
        peta.current.setView([Number(data[0].lat), Number(data[0].lon)], 14, { animate: true })
      } else {
        setGalatCari(`Lokasi "${cari}" tidak ditemukan. Coba nama lain.`)
      }
    } catch {
      setGalatCari('Pencarian lokasi gagal — periksa koneksi internet.')
    } finally {
      setMencari(false)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <div className="peta-cari">
          <input
            type="text" value={cari} placeholder="Cari lokasi, mis. Cikarang Barat…"
            onChange={e => setCari(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); cariLokasi() } }}
          />
          <button type="button" onClick={cariLokasi} disabled={mencari} aria-label="Cari lokasi">
            {mencari ? <span style={{ fontSize: 11 }}>…</span> : <Ikon nama="cari" />}
          </button>
        </div>
        <div ref={elPeta} style={{ height: 280, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line-2)' }} />
      </div>
      {galatCari && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 6 }}>{galatCari}</p>}
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
        Klik titik yang ingin ditandai di bawah supaya jadi aktif (ditandai emas di peta), lalu klik di peta untuk menjatuhkan pinnya. Pin dapat diseret untuk penyesuaian halus.
      </p>
    </div>
  )
}
