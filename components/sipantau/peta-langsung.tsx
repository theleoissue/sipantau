'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { klienBrowser } from '@/lib/supabase/client'
import type { PosisiPeta } from '@/lib/gps/tipe'
import { statusSinyal, labelTerakhirTerlihat } from '@/lib/gps/tipe'
import { inisial } from '@/lib/utils'
import { Ikon } from './ikon'

const PALET_SPT = ['#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D']
function warnaSpt(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALET_SPT[h % PALET_SPT.length]
}
const WARNA_CINCIN: Record<string, string> = { aktif: '#059669', pantau: '#D97706', lama: '#94A3B8' }

/**
 * Client Component + Realtime (docs/CLAUDE.md §6.1) — Server Component
 * tidak dapat berlangganan pembaruan hidup, jadi peta wajib di sini.
 * posisiAwal hanyalah potret saat halaman dibuka; sesudahnya seluruh
 * pembaruan datang lewat kanal Realtime pada posisi_terkini.
 *
 * P-18: peristiwa DELETE dari Realtime hanya membawa sesi_tugas_id
 * (kunci utama tanpa arti, replica identity bawaan) — cukup untuk
 * menghapus penanda dari peta, tidak membocorkan siapa pun.
 */
interface TitikLokasiPeta {
  penugasan_id: string
  nomor_spt: string | null
  judul: string
  nama: string
  lat: number
  lng: number
  radius_meter: number | null
}

export function PetaLangsung({
  posisiAwal,
  daftarSpt,
  titikLokasi = [],
}: {
  posisiAwal: PosisiPeta[]
  daftarSpt: { id: string; nomor_spt: string | null; judul: string }[]
  titikLokasi?: TitikLokasiPeta[]
}) {
  const [posisi, setPosisi] = useState<Map<string, PosisiPeta>>(
    () => new Map(posisiAwal.map(p => [p.sesi_tugas_id, p])),
  )
  const [filterSpt, setFilterSpt] = useState('semua')
  const [terputus, setTerputus] = useState(false)
  const [pembaruanTerakhir, setPembaruanTerakhir] = useState<Date>(new Date())
  const [tik, paksaRenderUlang] = useState(0)
  // Menandai peta+lokasiLayer sudah selesai dibangun. WAJIB ada: import
  // 'leaflet' pada efek pembangunan peta dan efek penanda/lokasi
  // masing-masing async sendiri-sendiri, jadi tanpa penanda ini efek
  // penanda dapat selesai lebih dulu, melihat peta.current masih null,
  // berhenti diam-diam, dan tidak pernah mencoba lagi karena
  // dependensinya (titikLokasi) tidak pernah berubah lagi setelahnya.
  const [petaSiap, setPetaSiap] = useState(false)

  const elPeta = useRef<HTMLDivElement>(null)
  const peta = useRef<import('leaflet').Map | null>(null)
  const penanda = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const lokasiLayer = useRef<import('leaflet').LayerGroup | null>(null)

  // Jejak yang tumbuh hidup selagi Sesi Tugas berjalan — beda dari
  // Rute (riwayat) di rincian SPT, yang cuma termuat sekali saat
  // halaman dibuka. Ref, bukan state: berubah tiap Titik masuk (bisa
  // sangat sering dengan banyak personel aktif), dan tidak perlu
  // memicu render ulang React — efek gambar-ulang di bawah membaca
  // ref ini secara langsung.
  const jejak = useRef<Map<string, [number, number][]>>(new Map())
  const garisJejak = useRef<Map<string, import('leaflet').Polyline>>(new Map())

  // Status Terakhir terlihat menua seiring waktu meski tidak ada
  // pembaruan data — perlu render ulang berkala supaya warnanya benar
  // (KP-6.4-33..35), bukan hanya saat posisi berubah.
  useEffect(() => {
    const id = setInterval(() => paksaRenderUlang(v => v + 1), 20_000)
    return () => clearInterval(id)
  }, [])

  // Mengisi jejak sesi yang SUDAH berjalan saat halaman pertama dibuka
  // — tanpa ini, garisnya baru mulai terlihat dari Titik pertama yang
  // masuk SETELAH halaman dibuka, padahal sesinya sendiri mungkin
  // sudah berjalan berjam-jam. location_logs dibaca langsung (bukan
  // lewat titikSesi() di lib/gps/kueri.ts — itu server-only, memakai
  // klienServer yang menyeret next/headers, tidak boleh masuk bundel
  // klien), dengan penyaring diragukan_sebab yang sama seperti Rute
  // (riwayat) di rute-spt.tsx.
  //
  // KP-6.4-42 hanya diterapkan DI SINI (pengisian awal), TIDAK pada
  // Titik yang menyusul lewat Realtime di bawah — payload posisi_terkini
  // tidak membawa kolom diragukan_sebab sama sekali (tabel itu memang
  // tidak punya kolom itu), jadi tidak ada yang bisa disaring di jalur
  // hidup tanpa kueri tambahan per Titik, yang meniadakan tujuan
  // memakai Realtime. Diterima sebagai penyederhanaan sadar: kalau
  // suatu Titik ternyata diragukan, itu baru diketahui SESUDAHNYA (dari
  // Titik berikutnya), dan tinjauan resmi lewat halaman Rute tetap
  // menyaringnya dengan benar — jejak hidup ini sekadar gambaran
  // "sedang terjadi", bukan catatan resmi.
  useEffect(() => {
    let batal = false
    const supabase = klienBrowser()
    Promise.all(
      posisiAwal.map(async p => {
        const { data } = await supabase
          .from('location_logs')
          .select('lat, lng, diragukan_sebab')
          .eq('sesi_tugas_id', p.sesi_tugas_id)
          .is('diragukan_sebab', null)
          .order('direkam_pada', { ascending: true })
        return [p.sesi_tugas_id, (data ?? []).map(t => [Number(t.lat), Number(t.lng)] as [number, number])] as const
      }),
    ).then(hasil => {
      if (batal) return
      for (const [id, titik] of hasil) jejak.current.set(id, titik)
      // Memaksa efek gambar-ulang berjalan sekali lagi sekarang juga —
      // tanpa ini, jejak yang baru saja diisi tidak tergambar sampai
      // pembaruan berikutnya (Titik baru masuk, atau pencacang 20 detik).
      setPosisi(p => new Map(p))
    })
    return () => { batal = true }
    // Sengaja HANYA sekali saat pemasangan (posisiAwal adalah potret,
    // bukan sesuatu yang disinkronkan berulang) — sesi yang muncul
    // BELAKANGAN lewat Realtime mulai jejaknya dari titik pertama yang
    // sungguh terlihat komponen ini, tidak perlu pengisian riwayat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const supabase = klienBrowser()

    // Pelengkap satu baris untuk sesi yang BARU SAJA muncul lewat
    // Realtime — payload postgres_changes tidak pernah membawa data
    // gabungan tabel lain (KP-6.4-...), jadi nama pengguna dan nomor
    // SPT diambil terpisah sekali per sesi begitu ia pertama terlihat,
    // memakai bentuk select yang sama seperti posisiPetaAwal() (lib/
    // gps/kueri.ts) supaya hasilnya konsisten.
    async function isiSusulanNamaDanSpt(sesiId: string) {
      const { data } = await supabase
        .from('posisi_terkini')
        .select('pengguna:pengguna_id ( nama ), penugasan:penugasan_id ( nomor_spt, judul )')
        .eq('sesi_tugas_id', sesiId)
        .maybeSingle()
      if (!data) return
      const pengguna = data.pengguna as unknown as { nama: string } | null
      const penugasan = data.penugasan as unknown as { nomor_spt: string | null; judul: string } | null
      setPosisi(prev => {
        const ada = prev.get(sesiId)
        if (!ada) return prev
        const n = new Map(prev)
        n.set(sesiId, {
          ...ada,
          nama: pengguna?.nama ?? ada.nama,
          nomor_spt: penugasan?.nomor_spt ?? ada.nomor_spt,
          judul: penugasan?.judul ?? ada.judul,
        })
        return n
      })
    }

    const kanal = supabase
      .channel('posisi-terkini-peta')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posisi_terkini' }, payload => {
        setPembaruanTerakhir(new Date())
        if (payload.eventType === 'DELETE') {
          const lama = payload.old as { sesi_tugas_id?: string }
          if (lama?.sesi_tugas_id) {
            jejak.current.delete(lama.sesi_tugas_id)
            setPosisi(prev => {
              const n = new Map(prev)
              n.delete(lama.sesi_tugas_id!)
              return n
            })
          }
          return
        }
        const baris = payload.new as Record<string, unknown>
        const idSesi = baris.sesi_tugas_id as string

        // Menambah ke garis yang tumbuh — posisi_terkini di-UPSERT TEPAT
        // SEKALI per Titik (kunci utamanya sesi_tugas_id, lihat migrasi
        // 0015), jadi setiap kejadian di sini adalah SATU Titik baru,
        // bukan penyalinan baris yang sudah ada.
        const titikBaru: [number, number] = [Number(baris.lat), Number(baris.lng)]
        const sudah = jejak.current.get(idSesi) ?? []
        jejak.current.set(idSesi, [...sudah, titikBaru])

        let perluIsiSusulan = false
        setPosisi(prev => {
          const n = new Map(prev)
          const ada = n.get(idSesi)
          // Bukan cuma sesi yang BENAR-BENAR baru — sesi yang sudah
          // tercatat tapi susulannya belum pernah berhasil (nama masih
          // "—", mis. percobaan pertama kena kedahuluan sebelum baris
          // penugasan/pengguna sungguh terbaca) ikut dicoba lagi di
          // setiap Titik berikutnya, bukan cuma sekali seumur sesi.
          perluIsiSusulan = !ada || ada.nama === '—'
          n.set(idSesi, {
            sesi_tugas_id: idSesi,
            penugasan_id: baris.penugasan_id as string,
            pengguna_id: baris.pengguna_id as string,
            unit_id: baris.unit_id as string,
            lat: Number(baris.lat),
            lng: Number(baris.lng),
            akurasi_meter: baris.akurasi_meter == null ? null : Number(baris.akurasi_meter),
            baterai_persen: baris.baterai_persen as number | null,
            sumber_lokasi: baris.sumber_lokasi as PosisiPeta['sumber_lokasi'],
            izin_terputus: baris.izin_terputus as boolean,
            direkam_pada: baris.direkam_pada as string,
            // Realtime tidak membawa nama/SPT (tidak digabung tabel
            // lain) — dipertahankan dari potret awal atau pembaruan
            // sebelumnya. Sesi yang BENAR-BENAR baru (belum pernah
            // terlihat sama sekali di peta ini) diisi susulan di bawah.
            nama: ada?.nama ?? '—',
            nomor_spt: ada?.nomor_spt ?? null,
            judul: ada?.judul ?? '',
          })
          return n
        })

        // Sesi baru (mis. Mulai Tugas baru saja ditekan) tidak pernah
        // ada di potret awal halaman — tanpa ini penanda tampil dengan
        // nama "—" dan nomor SPT jatuh ke UUID penugasan_id mentah
        // sampai halaman dimuat ulang. Dicoba lagi tiap Titik masuk
        // SELAMA belum berhasil (lihat perluIsiSusulan di atas), lalu
        // berhenti dengan sendirinya begitu nama sungguh terisi.
        if (perluIsiSusulan) isiSusulanNamaDanSpt(idSesi)
      })
      .subscribe(status => setTerputus(status !== 'SUBSCRIBED'))

    return () => { supabase.removeChannel(kanal) }
  }, [])

  useEffect(() => {
    let batal = false
    import('leaflet').then(L => {
      if (batal || !elPeta.current || peta.current) return
      peta.current = L.map(elPeta.current, { zoomControl: true, attributionControl: true })
        .setView([-6.62, 107.35], 9)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap',
      }).addTo(peta.current)
      lokasiLayer.current = L.layerGroup().addTo(peta.current)

      // Pandangan awal mengikuti titik lokasi SPT yang sungguh ada,
      // bukan sekadar tengah Jawa Barat yang tidak berarti apa-apa bagi
      // pengawas. Posisi personel (bila ada) tidak ikut menentukan
      // pandangan awal ini — itu berubah tiap Titik masuk, dan
      // memindah pandangan setiap kali akan mengganggu pengawas yang
      // sedang melihat.
      if (titikLokasi.length > 0) {
        const batas = L.latLngBounds(titikLokasi.map(t => [t.lat, t.lng] as [number, number]))
        peta.current.fitBounds(batas, { padding: [40, 40], maxZoom: 13 })
      }
      setPetaSiap(true)
    })
    return () => {
      batal = true
      peta.current?.remove()
      peta.current = null
    }
    // Instance peta dibangun TEPAT SEKALI saat pemasangan (pola yang
    // sama dengan sorotPeta di bawah) — titikLokasi sengaja dibaca apa
    // adanya untuk pandangan AWAL saja, bukan disinkronkan berulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!peta.current) return
    import('leaflet').then(L => {
      const p = peta.current
      if (!p) return

      const daftar = [...posisi.values()].filter(x => filterSpt === 'semua' || x.penugasan_id === filterSpt)
      const idAktif = new Set(daftar.map(x => x.sesi_tugas_id))

      for (const [id, m] of penanda.current) {
        if (!idAktif.has(id)) { m.remove(); penanda.current.delete(id) }
      }
      // Garis jejak ikut dibuang begitu sesinya tidak lagi aktif —
      // sama seperti penanda. Riwayatnya tetap ada (location_logs
      // permanen), cuma tidak digambar hidup lagi di peta ini; itu
      // urusan halaman Rute.
      for (const [id, garis] of garisJejak.current) {
        if (!idAktif.has(id)) { garis.remove(); garisJejak.current.delete(id); jejak.current.delete(id) }
      }

      for (const pos of daftar) {
        const wSpt = warnaSpt(pos.penugasan_id)
        const wCincin = WARNA_CINCIN[statusSinyal(pos.direkam_pada)]
        const ikonHtml = `<div class="penanda" style="background:${wSpt};border-color:${wCincin}"><span>${inisial(pos.nama)}</span></div>`

        // Garis jejak SEBELUM penanda, supaya penanda (dan balonnya)
        // selalu tergambar DI ATAS garis, bukan tertutup olehnya.
        const titikJejak = jejak.current.get(pos.sesi_tugas_id) ?? []
        if (titikJejak.length >= 2) {
          const garisAda = garisJejak.current.get(pos.sesi_tugas_id)
          if (garisAda) {
            garisAda.setLatLngs(titikJejak)
          } else {
            const garisBaru = L.polyline(titikJejak, { color: wSpt, weight: 3.5, opacity: .85 }).addTo(p)
            garisJejak.current.set(pos.sesi_tugas_id, garisBaru)
          }
        }

        const ada = penanda.current.get(pos.sesi_tugas_id)
        if (ada) {
          ada.setLatLng([pos.lat, pos.lng])
          ada.setIcon(L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 30], html: ikonHtml }))
        } else {
          const mkr = L.marker([pos.lat, pos.lng], {
            icon: L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 30], html: ikonHtml }),
          }).addTo(p)
          penanda.current.set(pos.sesi_tugas_id, mkr)
        }
        penanda.current.get(pos.sesi_tugas_id)!.bindPopup(
          `<div style="display:flex;gap:8px;align-items:flex-start">`
          + `<div class="av av-sm" style="background:${wSpt};color:#fff;flex-shrink:0">${inisial(pos.nama)}</div>`
          + `<div>`
          + `<b>${pos.nama}</b><br>`
          + `<span style="color:${wSpt}">●</span> ${pos.nomor_spt ?? pos.penugasan_id}${pos.judul ? ' — ' + pos.judul : ''}<br>`
          + `<small>${labelTerakhirTerlihat(pos.direkam_pada)}${pos.baterai_persen != null ? ' · ' + pos.baterai_persen + '% daya' : ''}${pos.izin_terputus ? '<br>Izin lokasi sedang terputus' : ''}</small>`
          + `</div>`
          + `</div>`,
        )
      }
    })
    // tik sengaja terdaftar — balon info dan warna cincin pin memakai
    // labelTerakhirTerlihat()/statusSinyal() yang menua seiring waktu
    // nyata, bukan hanya saat posisi berubah (sama seperti daftar
    // "Sedang bertugas" di render biasa). Tanpa ini, keduanya beku
    // pada nilai saat titik GPS TERAKHIR masuk, tidak pernah mengejar
    // waktu berjalan sampai ada titik baru atau halaman dimuat ulang.
  }, [posisi, filterSpt, petaSiap, tik])

  // Titik lokasi SPT — penanda TETAP, tidak berubah lewat Realtime
  // (bukan posisi personel). BR-67: koordinat digambar apa adanya,
  // lingkaran radiusnya sekadar acuan visual, bukan yang menentukan
  // status lokasi laporan (itu dihitung server, Modul 6.3).
  useEffect(() => {
    if (!peta.current || !lokasiLayer.current) return
    import('leaflet').then(L => {
      const grup = lokasiLayer.current
      if (!grup) return
      grup.clearLayers()

      const daftar = titikLokasi.filter(t => filterSpt === 'semua' || t.penugasan_id === filterSpt)
      for (const t of daftar) {
        const w = warnaSpt(t.penugasan_id)
        L.circle([t.lat, t.lng], {
          radius: t.radius_meter ?? 300, color: w, weight: 1.5, fillColor: w, fillOpacity: 0.08,
        }).addTo(grup)
        L.circleMarker([t.lat, t.lng], {
          radius: 6, color: w, weight: 2, fillColor: '#fff', fillOpacity: 1,
        }).addTo(grup).bindPopup(
          `<b>${t.nama}</b><br><span style="color:${w}">●</span> ${t.nomor_spt ?? t.penugasan_id} — ${t.judul}<br><small>Lokasi tujuan penugasan, radius ${t.radius_meter ?? '—'} m</small>`,
        )
      }
    })
  }, [titikLokasi, filterSpt, petaSiap])

  // Pandangan peta MENGIKUTI penyaring: pilih satu penugasan → peta
  // otomatis berpindah ke titik lokasinya (dan posisi personel yang
  // sedang aktif di sana bila ada); pilih "semua" → zoom out mencakup
  // seluruh titik lagi. Efek TERPISAH dari efek pembangunan peta (yang
  // hanya sekali saat pemasangan) — ini boleh berjalan berulang setiap
  // filterSpt berganti, itulah intinya.
  useEffect(() => {
    if (!petaSiap || !peta.current) return
    import('leaflet').then(L => {
      const p = peta.current
      if (!p) return

      const lokasiRelevan = titikLokasi.filter(t => filterSpt === 'semua' || t.penugasan_id === filterSpt)
      const posisiRelevan = [...posisi.values()].filter(x => filterSpt === 'semua' || x.penugasan_id === filterSpt)
      const titikBatas: [number, number][] = [
        ...lokasiRelevan.map(t => [t.lat, t.lng] as [number, number]),
        ...posisiRelevan.map(x => [x.lat, x.lng] as [number, number]),
      ]

      if (titikBatas.length === 0) return
      if (titikBatas.length === 1) {
        p.setView(titikBatas[0], 15, { animate: true })
      } else {
        p.fitBounds(L.latLngBounds(titikBatas), { padding: [40, 40], maxZoom: 15, animate: true })
      }
    })
    // posisi sengaja TIDAK didaftarkan sebagai dependensi — pandangan
    // hanya perlu mengikuti PERGANTIAN penyaring, bukan setiap
    // pembaruan posisi Realtime (itu akan mengganggu pengawas yang
    // sedang menggeser/memperbesar peta secara manual).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSpt, petaSiap, titikLokasi])

  const daftarTampil = [...posisi.values()].filter(x => filterSpt === 'semua' || x.penugasan_id === filterSpt)

  const sorotPeta = useCallback((lat: number, lng: number) => {
    peta.current?.setView([lat, lng], 15, { animate: true })
  }, [])

  return (
    <>
      <div className="peta-filter-bar">
        <label htmlFor="filter-spt">Penugasan</label>
        <select id="filter-spt" value={filterSpt} onChange={e => setFilterSpt(e.target.value)}>
          <option value="semua">Semua penugasan ({daftarSpt.length})</option>
          {daftarSpt.map(s => (
            <option key={s.id} value={s.id}>
              {s.nomor_spt ?? s.id} — {s.judul.slice(0, 40)}{s.judul.length > 40 ? '…' : ''}
            </option>
          ))}
        </select>
        {terputus && (
          <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-3)' }}>
            Pembaruan tertunda · data terakhir {pembaruanTerakhir.toLocaleTimeString('id-ID')}
          </span>
        )}
      </div>

      <div id="peta-wadah">
        <div id="peta" ref={elPeta} />
        <div className="peta-panel">
          <div className="kepala">
            <h4>Sedang bertugas</h4>
            <span>{daftarTampil.length}</span>
          </div>
          <div className="daftar">
            {daftarTampil.length === 0 ? (
              <div className="kosong" style={{ padding: '20px 14px' }}>
                <Ikon nama="peta" />
                <h3>Belum ada Sesi Tugas berjalan</h3>
              </div>
            ) : daftarTampil.map(pos => (
              <div
                key={pos.sesi_tugas_id}
                className="peta-orang"
                // Leaflet adalah pustaka imperatif — instance peta HARUS
                // disimpan sebagai ref (bukan state) supaya pembaruan
                // penanda tidak memicu Leaflet dibangun ulang tiap
                // render. sorotPeta hanya membaca ref itu di dalam
                // event handler klik yang sesungguhnya, tidak pernah
                // saat render, jadi aman meski aturan react-hooks/refs
                // tidak dapat membuktikannya secara statis.
                // eslint-disable-next-line react-hooks/refs
                onClick={() => sorotPeta(pos.lat, pos.lng)}
              >
                <div
                  className="av av-sm"
                  style={{ background: warnaSpt(pos.penugasan_id), color: '#fff' }}
                >
                  {inisial(pos.nama)}
                </div>
                <div className="meta">
                  <div className="nm">{pos.nama}</div>
                  <div className="st">{labelTerakhirTerlihat(pos.direkam_pada)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
