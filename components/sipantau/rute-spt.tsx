'use client'

import { useEffect, useRef, useState } from 'react'
import type { SesiRute, TitikRute } from '@/lib/gps/tipe'
import { LABEL_SEBAB_PENUTUPAN, bersihkanJejak, haluskanJejak, sederhanakanJejak } from '@/lib/gps/tipe'
import { Ikon } from './ikon'

const PALET = ['#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D']

function tanggalWaktu(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

function jarakTampil(meter: number | null): string {
  if (meter == null) return '—'
  return meter >= 1000 ? `${(meter / 1000).toFixed(1)} km` : `${Math.round(meter)} m`
}

/**
 * Layar Rute (KP-6.4-41..47). Statis, bukan Realtime — Rute adalah
 * riwayat, bukan posisi hidup, jadi cukup Client Component biasa untuk
 * Leaflet tanpa langganan apa pun (docs/CLAUDE.md §6.1 hanya mewajibkan
 * Realtime untuk data yang WAJIB berubah tanpa muat ulang).
 */
export function RuteSpt({
  sesi,
  titikPerSesi,
  lokasiSpt,
}: {
  sesi: SesiRute[]
  titikPerSesi: Record<string, TitikRute[]>
  lokasiSpt: { nama: string; lat: number | null; lng: number | null; radius_meter: number | null }[]
}) {
  const [pilihan, setPilihan] = useState<string>('semua')
  const [petaSiap, setPetaSiap] = useState(false)
  const elPeta = useRef<HTMLDivElement>(null)
  const peta = useRef<import('leaflet').Map | null>(null)
  const lapisan = useRef<import('leaflet').LayerGroup | null>(null)

  useEffect(() => {
    let batal = false
    import('leaflet').then(L => {
      if (batal || !elPeta.current || peta.current) return
      peta.current = L.map(elPeta.current, { zoomControl: true, attributionControl: true })
        .setView([-6.62, 107.35], 9)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap',
      }).addTo(peta.current)
      lapisan.current = L.layerGroup().addTo(peta.current)
      setPetaSiap(true)
    })
    return () => { batal = true; peta.current?.remove(); peta.current = null }
  }, [])

  useEffect(() => {
    if (!petaSiap || !peta.current || !lapisan.current) return
    import('leaflet').then(L => {
      const grup = lapisan.current
      const p = peta.current
      if (!grup || !p) return
      grup.clearLayers()
      const batas: [number, number][] = []

      // KP-6.4-44: titik lokasi SPT ikut digambar sebagai pembanding.
      lokasiSpt.forEach(l => {
        if (l.lat == null || l.lng == null) return
        L.circle([l.lat, l.lng], {
          radius: l.radius_meter ?? 300, color: '#64748B', weight: 1.5,
          fillOpacity: .08, dashArray: '4 4',
        }).addTo(grup).bindPopup(`<b>${l.nama}</b><br><small>Radius ${l.radius_meter ?? '—'} m</small>`)
        batas.push([l.lat, l.lng])
      })

      const sesiTampil = pilihan === 'semua' ? sesi : sesi.filter(s => s.id === pilihan)

      sesiTampil.forEach(s => {
        const warna = PALET[sesi.findIndex(asli => asli.id === s.id) % PALET.length]
        const titik = titikPerSesi[s.id] ?? []
        // KP-6.4-42: garis hanya menghubungkan Titik yang TIDAK diragukan.
        const wajar = titik.filter(t => !t.diragukan_sebab)

        // Goyangan GPS disaring HANYA untuk garisnya — titik awal/akhir
        // di bawah tetap memakai wajar[0]/wajar.at(-1) apa adanya, supaya
        // waktu mulai dan selesai yang ditampilkan adalah Titik
        // sungguhan pertama dan terakhir, bukan hasil saringan.
        const garisBersih = bersihkanJejak(wajar.map(t => [t.lat, t.lng]))
        if (garisBersih.length >= 2) {
          // Disederhanakan dulu, baru dilengkungkan — lihat peta-langsung.tsx.
          L.polyline(haluskanJejak(sederhanakanJejak(garisBersih)), { color: warna, weight: 3.5, opacity: .85 }).addTo(grup)
          garisBersih.forEach(g => batas.push(g))
        } else if (s.diringkas_pada && s.lat_awal != null && s.lat_akhir != null) {
          // KP-6.4-43: Titik satuan sudah disusutkan — garis kasar
          // putus-putus dari Ringkasan Rute yang tersisa.
          const garis: [number, number][] = [[s.lat_awal, s.lng_awal!], [s.lat_akhir, s.lng_akhir!]]
          L.polyline(garis, { color: warna, weight: 3, opacity: .6, dashArray: '6 6' }).addTo(grup)
          garis.forEach(g => batas.push(g))
        }

        if (wajar.length > 0) {
          const awal = wajar[0], akhir = wajar[wajar.length - 1]
          L.circleMarker([awal.lat, awal.lng], { radius: 6, color: warna, fillColor: '#fff', fillOpacity: 1, weight: 2 })
            .addTo(grup).bindPopup(`<b>${s.nama}</b><br>Mulai · ${tanggalWaktu(s.dibuka_pada)}`)
          L.circleMarker([akhir.lat, akhir.lng], { radius: 6, color: warna, fillColor: warna, fillOpacity: 1, weight: 2 })
            .addTo(grup).bindPopup(`<b>${s.nama}</b><br>${s.ditutup_pada ? 'Selesai · ' + tanggalWaktu(s.ditutup_pada) : 'Masih berjalan'}`)
        }
      })

      if (batas.length) p.fitBounds(batas, { padding: [40, 40], maxZoom: 15 })
    })
  }, [pilihan, sesi, titikPerSesi, lokasiSpt, petaSiap])

  useEffect(() => {
    if (!petaSiap || !elPeta.current) return
    const pengamat = new ResizeObserver(() => peta.current?.invalidateSize())
    pengamat.observe(elPeta.current)
    return () => pengamat.disconnect()
  }, [petaSiap])

  if (sesi.length === 0) {
    return (
      <div className="kosong" style={{ padding: '28px 0' }}>
        <Ikon nama="peta" />
        <h3>Belum ada kegiatan terekam</h3>
        <p>Rute muncul di sini setelah Sesi Tugas pertama dibuka pada penugasan ini.</p>
      </div>
    )
  }

  return (
    <div className="kisi rute-spt">
      <div id="peta-wadah">
        <div id="peta" ref={elPeta} />
      </div>

      <div className="peta-panel">
        <div className="kepala">
          <h4>Sesi</h4>
          <span>{sesi.length}</span>
        </div>
        <div className="daftar">
          <button type="button" aria-pressed={pilihan === 'semua'}
            className="peta-orang"
            style={{ fontWeight: pilihan === 'semua' ? 700 : 400 }}
            onClick={() => setPilihan('semua')}
          >
            <div className="meta"><div className="nm">Seluruh sesi sekaligus</div></div>
          </button>
          {sesi.map((s, i) => (
            <button type="button" aria-pressed={pilihan === s.id}
              key={s.id}
              className="peta-orang"
              style={{ borderLeft: `3px solid ${PALET[i % PALET.length]}`, fontWeight: pilihan === s.id ? 700 : 400 }}
              onClick={() => setPilihan(s.id)}
            >
              <div className="meta">
                <div className="nm">{s.nama}</div>
                <div className="st">
                  {tanggalWaktu(s.dibuka_pada)} · {jarakTampil(s.jarak_tempuh_meter)} · {s.jumlah_titik} titik
                </div>
                <div className="st">
                  {s.ditutup_pada ? (s.sebab_penutupan ? LABEL_SEBAB_PENUTUPAN[s.sebab_penutupan] : '—') : 'Sedang berjalan'}
                </div>
                {(titikPerSesi[s.id] ?? []).length === 0 && s.diringkas_pada && (
                  <div className="st" style={{ fontStyle: 'italic' }}>Titik sudah disusutkan · bentuk kasar</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
