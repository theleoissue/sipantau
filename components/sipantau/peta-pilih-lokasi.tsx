'use client'

import { useEffect, useRef, useState } from 'react'
import { Ikon } from './ikon'

interface TitikPeta {
  nama: string
  lat: string
  lng: string
}

interface HasilCari {
  lat: string
  lon: string
  display_name: string
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
 *  - Pencarian menampilkan hasil sebagai pin pratinjau. Pin itu BARU
 *    dipakai setelah pengguna mengetuknya, karena hasil geocoding nama
 *    tempat dapat berupa perkiraan area.
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
  const penandaHasil = useRef<import('leaflet').Marker | null>(null)
  const [cari, setCari] = useState('')
  const [mencari, setMencari] = useState(false)
  const [galatCari, setGalatCari] = useState<string | null>(null)
  const [hasilCari, setHasilCari] = useState<HasilCari[]>([])
  const [hasilTerpilih, setHasilTerpilih] = useState<HasilCari | null>(null)

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

  // Hasil pencarian hanya berupa pratinjau. Mengetuk pin inilah yang
  // menjadi persetujuan eksplisit untuk memakai koordinatnya.
  useEffect(() => {
    let batal = false
    import('leaflet').then(L => {
      if (batal || !peta.current) return
      penandaHasil.current?.remove()
      penandaHasil.current = null
      if (!hasilTerpilih) return

      const ikon = L.divIcon({
        className: 'peta-pin-pratinjau', iconSize: [34, 42], iconAnchor: [17, 42],
        html: '<div class="peta-pin-pratinjau-isi"><span></span></div>',
      })
      const marker = L.marker([Number(hasilTerpilih.lat), Number(hasilTerpilih.lon)], { icon: ikon })
        .addTo(peta.current)
        .bindTooltip('Ketuk pin ini untuk memakai lokasi', { direction: 'top', offset: [0, -36] })
      marker.on('click', () => {
        onUbahRef.current(aktifRef.current, Number(hasilTerpilih.lat).toFixed(6), Number(hasilTerpilih.lon).toFixed(6))
      })
      penandaHasil.current = marker
    })
    return () => { batal = true }
  }, [hasilTerpilih])

  async function cariLokasi() {
    if (!cari.trim()) return
    setMencari(true)
    setGalatCari(null)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=id&q=${encodeURIComponent(cari.trim())}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'id' } })
      const data = await res.json() as HasilCari[]
      if (data.length > 0 && peta.current) {
        pilihHasil(data[0])
        setHasilCari(data)
      } else {
        setHasilCari([])
        setHasilTerpilih(null)
        setGalatCari(`Lokasi "${cari}" tidak ditemukan. Coba nama lain.`)
      }
    } catch {
      setGalatCari('Pencarian lokasi gagal — periksa koneksi internet.')
    } finally {
      setMencari(false)
    }
  }

  function pilihHasil(hasil: HasilCari) {
    setHasilTerpilih(hasil)
    peta.current?.setView([Number(hasil.lat), Number(hasil.lon)], 16, { animate: true })
  }

  return (
    <div className="peta-pilih-lokasi">
      <div className="peta-pilih-lokasi-wadah">
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
        <div ref={elPeta} className="peta-pilih-lokasi-kanvas" />
      </div>
      {galatCari && <p style={{ color: 'var(--red)', fontSize: 12.5, marginTop: 6 }}>{galatCari}</p>}
      {hasilCari.length > 0 && (
        <div className="peta-hasil-cari" aria-label="Hasil pencarian lokasi">
          <p>Pilih hasil untuk melihat pin pratinjau, lalu ketuk pinnya di peta untuk memakai lokasi.</p>
          {hasilCari.map((hasil, i) => (
            <button key={`${hasil.lat}-${hasil.lon}`} type="button" onClick={() => pilihHasil(hasil)}
                    className={hasilTerpilih === hasil ? 'on' : undefined}>
              <span>{i + 1}</span>{hasil.display_name}
            </button>
          ))}
        </div>
      )}
      <p className="peta-pilih-lokasi-bantu">
        Pilih titik tugas di bawah agar aktif (emas). Klik peta untuk menjatuhkan pin, atau gunakan hasil pencarian sebagai pratinjau lalu ketuk pinnya untuk mengonfirmasi. Pin dapat diseret untuk penyesuaian halus.
      </p>
    </div>
  )
}
