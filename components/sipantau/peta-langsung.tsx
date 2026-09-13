'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { klienBrowser } from '@/lib/supabase/client'
import { ambilSemuaHalaman } from '@/lib/supabase/halaman'
import type { PosisiPeta } from '@/lib/gps/tipe'
import { statusSinyal, labelTerakhirTerlihat, jarakMeter, bersihkanTitikJejak, mutuAkurasi, arahDerajat, haluskanJejak, sederhanakanJejak, saringKalman, sedangDiam, AMBANG_GOYANGAN_METER } from '@/lib/gps/tipe'
import type { TitikJejak } from '@/lib/gps/tipe'

// Peta TIDAK lagi menggambar dari Titik mentah.
//
// Urutannya menentukan, dan ketiganya mengerjakan hal berbeda:
//
//   saringKalman     menimbang tiap pembacaan menurut akurasinya sendiri
//                    — yang 4 m hampir diikuti penuh, yang 30 m nyaris
//                    diabaikan. Inilah yang membuat garis meluncur
//                    alih-alih menyentak.
//   sederhanakanJejak membuang simpul yang tidak mengubah bentuk jalur.
//   haluskanJejak     melengkungkan sisanya.
//
// Menyederhanakan sebelum menyaring akan membuang justru pembacaan yang
// dibutuhkan penyaring untuk menimbang; melengkungkan sebelum
// menyederhanakan cuma menghasilkan lengkungan bergerigi yang rapat.
//
// Koordinat mentahnya tidak ke mana-mana: location_logs tetap memuat apa
// yang sungguh direkam perangkat, dan ini murni lapisan tampilan.
const jejakGambar = (t: TitikJejak[]) => haluskanJejak(sederhanakanJejak(saringKalman(t)))
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
  fokus,
}: {
  posisiAwal: PosisiPeta[]
  daftarSpt: { id: string; nomor_spt: string | null; judul: string }[]
  titikLokasi?: TitikLokasiPeta[]
  fokus?: { lat: number; lng: number }
}) {
  const [posisi, setPosisi] = useState<Map<string, PosisiPeta>>(
    () => new Map(posisiAwal.map(p => [p.sesi_tugas_id, p])),
  )
  const [filterSpt, setFilterSpt] = useState('semua')
  const [terputus, setTerputus] = useState(false)
  const [pembaruanTerakhir, setPembaruanTerakhir] = useState<Date>(new Date())
  const [tik, paksaRenderUlang] = useState(0)
  const [ikutiSesi, setIkutiSesi] = useState<string | null>(null)
  const [tampilkanJejak, setTampilkanJejak] = useState(true)
  const [petaMaksimal, setPetaMaksimal] = useState(false)
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
  const jejak = useRef<Map<string, TitikJejak[]>>(new Map())
  const garisJejak = useRef<Map<string, import('leaflet').Polyline>>(new Map())
  /** Arah terakhir yang meyakinkan per sesi — dipertahankan saat petugas berhenti. */
  const arahTerakhir = useRef<Map<string, number>>(new Map())
  // Titik yang jauh dari jejak tapi BELUM dikonfirmasi Titik berikutnya
  // — lihat bersihkanJejak() di lib/gps/tipe.ts untuk alasan lengkapnya.
  const calonJejak = useRef<Map<string, TitikJejak>>(new Map())
  // requestAnimationFrame yang sedang berjalan per sesi, supaya Titik
  // baru yang masuk SEBELUM animasi sebelumnya selesai membatalkan yang
  // lama dulu — tanpa ini dua animasi berebut posisi marker yang sama.
  const animasiAktif = useRef<Map<string, number>>(new Map())
  /**
   * Singgahan hasil gambar per sesi.
   *
   * Kuncinya IDENTITAS larik jejak, bukan isinya. Penambahan Titik selalu
   * membuat larik baru (`[...sudah, titikBaru]`), jadi perbandingan
   * rujukan sudah cukup dan tidak perlu membandingkan ribuan koordinat
   * untuk tahu apakah sesuatu berubah.
   */
  const hasilGambar = useRef<Map<string, { dari: TitikJejak[]; koor: [number, number][] }>>(new Map())
  /**
   * Ruas ujung yang sedang dianimasikan — garis terpisah, dua titik saja.
   *
   * Sebelumnya seluruh jejak dihitung ulang tiap frame, dan sejak
   * penyaring Kalman masuk itu berarti 11,8 ms untuk jejak 3.855 Titik:
   * 709 ms kerja per detik pada 60 fps, untuk SATU petugas. Dengan
   * beberapa petugas sekaligus utas utamanya habis dan petanya tersendat.
   * Memisahkan ujungnya membuat kerja per frame menjadi dua koordinat.
   */
  const garisUjung = useRef<Map<string, import('leaflet').Polyline>>(new Map())
  /**
   * Jejak TANPA Titik terakhir, disinggahkan terpisah.
   *
   * Memotong satu koordinat dari hasil gambar bukan hal yang sama dengan
   * memotong satu Titik jejak: satu Titik menjadi belasan koordinat
   * sesudah dilengkungkan. Kalau dipotong di sisi hasil, garisnya sampai
   * lebih dulu di tujuan sementara penandanya masih berjalan — persis
   * kebalikan dari maksud animasinya.
   */
  const hasilTanpaUjung = useRef<Map<string, { dari: TitikJejak[]; koor: [number, number][] }>>(new Map())

  /**
   * Menggeser penanda (dan ujung garis jejaknya) halus dari `dari` ke
   * `ke`, alih-alih melompat langsung — trik yang sama dipakai GMaps
   * dan Strava. Data GPS-nya TIDAK berubah (tetap satu Titik per ~15
   * detik); yang berubah cuma cara satu Titik itu ditampilkan.
   *
   * DURASI dipilih agak di bawah jeda pengiriman Titik yang wajar,
   * supaya animasi biasanya sempat selesai SEBELUM Titik berikutnya
   * datang — bukan disamakan persis, karena jalur native dan jalur web
   * tidak menjamin jeda yang identik. Titik yang datang lebih awal dari
   * itu tetap aman: animasi lama dibatalkan, yang baru mulai dari
   * posisi kunjung terakhir (bukan dari awal), jadi tidak pernah
   * terlihat melompat mundur.
   *
   * garisJejak menampilkan array DASAR (seluruh Titik kecuali yang
   * sedang dituju) ditambah satu titik ekor yang bergerak — jejak.current
   * sendiri sudah berisi tujuan akhirnya sejak Titik itu tiba (kebenaran
   * data selalu mutakhir; animasi ini murni lapisan tampilan).
   */
  const DURASI_ANIMASI_MS = 12_000

  /** jejakGambar yang hanya benar-benar menghitung bila jejaknya berubah. */
  const gambarTersinggah = useCallback((idSesi: string, dasar: TitikJejak[]): [number, number][] => {
    const ada = hasilGambar.current.get(idSesi)
    if (ada && ada.dari === dasar) return ada.koor
    const koor = jejakGambar(dasar)
    hasilGambar.current.set(idSesi, { dari: dasar, koor })
    return koor
  }, [])

  const animasiKe = useCallback((idSesi: string, dari: [number, number], ke: [number, number]) => {
    const sebelumnya = animasiAktif.current.get(idSesi)
    if (sebelumnya != null) cancelAnimationFrame(sebelumnya)

    const dasar = jejak.current.get(idSesi) ?? []
    const garis = garisJejak.current.get(idSesi)
    const ujung = garisUjung.current.get(idSesi)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      penanda.current.get(idSesi)?.setLatLng(ke)
      if (garis && dasar.length >= 1) garis.setLatLngs(gambarTersinggah(idSesi, dasar))
      ujung?.setLatLngs([])
      return
    }

    // DIHITUNG SEKALI, di luar putaran frame. Bagian jejak yang sudah
    // mapan tidak berubah sepanjang animasi; yang bergerak cuma ujungnya.
    // DIHITUNG SEKALI per Titik baru, bukan per frame. Dua kali penuh
    // sepanjang satu animasi dua belas detik — di awal dan di akhir —
    // alih-alih tujuh ratus kali.
    let koorTetap: [number, number][]
    if (dasar.length >= 2) {
      const singgah = hasilTanpaUjung.current.get(idSesi)
      if (singgah && singgah.dari === dasar) {
        koorTetap = singgah.koor
      } else {
        koorTetap = jejakGambar(dasar.slice(0, -1))
        hasilTanpaUjung.current.set(idSesi, { dari: dasar, koor: koorTetap })
      }
    } else {
      koorTetap = gambarTersinggah(idSesi, dasar)
    }
    const pangkal = koorTetap[koorTetap.length - 1]
    if (garis && koorTetap.length >= 1) garis.setLatLngs(koorTetap)

    const mulai = performance.now()
    const frame = (sekarang: number) => {
      const t = Math.min(1, (sekarang - mulai) / DURASI_ANIMASI_MS)
      const e = 1 - (1 - t) ** 3 // ease-out kubik — cepat di awal, melambat mendekati tujuan
      const lat = dari[0] + (ke[0] - dari[0]) * e
      const lng = dari[1] + (ke[1] - dari[1]) * e

      penanda.current.get(idSesi)?.setLatLng([lat, lng])
      // Dua koordinat. Itu saja kerja per frame-nya.
      if (ujung && pangkal) ujung.setLatLngs([pangkal, [lat, lng]])

      if (t < 1) {
        animasiAktif.current.set(idSesi, requestAnimationFrame(frame))
      } else {
        animasiAktif.current.delete(idSesi)
        // Selesai: ujung dilebur kembali ke jejak mapan, supaya tidak ada
        // ruas lurus yang tertinggal di depan kurva.
        const akhir = jejak.current.get(idSesi) ?? []
        if (garis && akhir.length >= 1) garis.setLatLngs(gambarTersinggah(idSesi, akhir))
        ujung?.setLatLngs([])
      }
    }
    animasiAktif.current.set(idSesi, requestAnimationFrame(frame))
  }, [gambarTersinggah])

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
        // Berhalaman: tanpa ini jejak berhenti pada Titik ke-1.000 dan
        // tidak pernah menyusul posisi petugas sekarang — terlihat
        // seperti perekaman yang mati di tengah jalan.
        const data = await ambilSemuaHalaman<Record<string, unknown>>((dari, sampai) =>
          supabase
            .from('location_logs')
            .select('lat, lng, akurasi_meter, direkam_pada, diragukan_sebab')
            .eq('sesi_tugas_id', p.sesi_tugas_id)
            .is('diragukan_sebab', null)
            .order('direkam_pada', { ascending: true })
            .range(dari, sampai))
        return [p.sesi_tugas_id, data.map(t => ({
          la: Number(t.lat),
          lo: Number(t.lng),
          akurasi: t.akurasi_meter == null ? null : Number(t.akurasi_meter),
          t: new Date(t.direkam_pada as string).getTime(),
        } as TitikJejak))] as const
      }),
    ).then(hasil => {
      if (batal) return
      for (const [id, titik] of hasil) jejak.current.set(id, bersihkanTitikJejak(titik))
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
        //
        // Goyangan DAN lompatan disaring DI SINI JUGA, bukan cuma pada
        // pengisian riwayat awal — versi satu-Titik dari bersihkanJejak()
        // di lib/gps/tipe.ts (baca komentar lengkapnya di sana: goyangan
        // kecil dibuang langsung, lompatan besar ditahan dulu sebagai
        // calon sampai Titik BERIKUTNYA menguatkannya). Penanda (marker)
        // TETAP bergerak mengikuti Titik mentah apa adanya di bawah —
        // cuma GARISNYA yang tertunda/tidak menambah segmen baru.
        const titikBaru: TitikJejak = {
          la: Number(baris.lat),
          lo: Number(baris.lng),
          akurasi: baris.akurasi_meter == null ? null : Number(baris.akurasi_meter),
          t: new Date(baris.direkam_pada as string).getTime(),
        }
        const sudah = jejak.current.get(idSesi) ?? []
        const terakhirDigambar = sudah[sudah.length - 1]

        // Perangkat menyatakan DIAM: tidak ada ruas baru, titik.
        //
        // Inilah sumber jaring garis di peta. Saat orang berdiri diam,
        // pembacaan GPS tetap datang tiap beberapa detik dan tersebar
        // puluhan meter — di dalam gedung sering jauh melewati ambang
        // goyangan 20 m, sehingga dua derau yang berurutan saling
        // menguatkan dan garis ditarik bolak-balik di antara keduanya.
        // Menaikkan ambang tidak menyelesaikannya; yang hilang adalah
        // pengetahuan bahwa orangnya memang tidak ke mana-mana.
        //
        // Titiknya TETAP tersimpan seluruhnya sebagai bukti. Yang tidak
        // dilakukan hanyalah mengarang perjalanan yang tidak terjadi.
        //
        // sedangDiam() sengaja hanya benar untuk 'diam' yang eksplisit:
        // null berarti tidak diketahui, dan ketidaktahuan tidak boleh
        // membekukan jejak siapa pun.
        const diam = sedangDiam(baris.aktivitas as PosisiPeta['aktivitas'])
        if (diam) {
          calonJejak.current.delete(idSesi)
        } else if (!terakhirDigambar) {
          jejak.current.set(idSesi, [titikBaru])
        } else if (jarakMeter([terakhirDigambar.la, terakhirDigambar.lo], [titikBaru.la, titikBaru.lo]) < AMBANG_GOYANGAN_METER) {
          calonJejak.current.delete(idSesi) // sudah kembali dekat — calon lama gugur
        } else {
          const calon = calonJejak.current.get(idSesi)
          if (calon && jarakMeter([calon.la, calon.lo], [titikBaru.la, titikBaru.lo]) < AMBANG_GOYANGAN_METER) {
            jejak.current.set(idSesi, [...sudah, calon, titikBaru])
            calonJejak.current.delete(idSesi)
          } else {
            calonJejak.current.set(idSesi, titikBaru)
          }
        }

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
            // Dibaca dari baris yang sama — kalau diambil lewat kueri
            // terpisah tiap Titik masuk, seluruh guna Realtime hilang.
            aktivitas: (baris.aktivitas as PosisiPeta['aktivitas']) ?? null,
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
    const animasi = animasiAktif.current
    import('leaflet').then(L => {
      if (batal || !elPeta.current || peta.current) return
      peta.current = L.map(elPeta.current, { zoomControl: false, attributionControl: true })
        .setView(fokus ? [fokus.lat, fokus.lng] : [-6.62, 107.35], fokus ? 17 : 9)
      peta.current.on('dragstart', () => setIkutiSesi(null))
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
      if (!fokus && titikLokasi.length > 0) {
        const batas = L.latLngBounds(titikLokasi.map(t => [t.lat, t.lng] as [number, number]))
        peta.current.fitBounds(batas, { padding: [40, 40], maxZoom: 13 })
      }
      setPetaSiap(true)
    })
    return () => {
      batal = true
      for (const raf of animasi.values()) cancelAnimationFrame(raf)
      animasi.clear()
      peta.current?.remove()
      peta.current = null
    }
    // Instance peta dibangun TEPAT SEKALI saat pemasangan (pola yang
    // sama dengan sorotPeta di bawah) — titikLokasi sengaja dibaca apa
    // adanya untuk pandangan AWAL saja, bukan disinkronkan berulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!petaSiap || !elPeta.current) return
    const pengamat = new ResizeObserver(() => peta.current?.invalidateSize())
    pengamat.observe(elPeta.current)
    return () => pengamat.disconnect()
  }, [petaSiap])

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
      // urusan halaman Rute. Animasi yang sedang berjalan untuk sesi
      // itu ikut dibatalkan — tanpa ini rAF-nya terus memanggil
      // setLatLng pada penanda yang sudah dihapus dari peta.
      for (const [id, garis] of garisJejak.current) {
        if (!idAktif.has(id)) {
          garis.remove(); garisJejak.current.delete(id); jejak.current.delete(id)
          garisUjung.current.get(id)?.remove(); garisUjung.current.delete(id)
          hasilGambar.current.delete(id); hasilTanpaUjung.current.delete(id)
          calonJejak.current.delete(id)
          const raf = animasiAktif.current.get(id)
          if (raf != null) { cancelAnimationFrame(raf); animasiAktif.current.delete(id) }
        }
      }

      for (const pos of daftar) {
        const wSpt = warnaSpt(pos.penugasan_id)
        const wCincin = WARNA_CINCIN[statusSinyal(pos.direkam_pada)]
        // Arah diambil dari dua Titik TERAKHIR yang benar-benar tergambar
        // dan hanya bila perpindahannya melampaui ambang goyangan —
        // memutar panah mengikuti getaran GPS saat petugas berdiri diam
        // justru membuatnya tampak berputar-putar tanpa sebab.
        const jejakArah = jejak.current.get(pos.sesi_tugas_id) ?? []
        const koor = (p: TitikJejak): [number, number] => [p.la, p.lo]
        const sblm = jejakArah.length >= 2 ? koor(jejakArah[jejakArah.length - 2]) : null
        const ujung = jejakArah.length >= 2 ? koor(jejakArah[jejakArah.length - 1]) : null
        const arah = sblm && ujung && jarakMeter(sblm, ujung) >= AMBANG_GOYANGAN_METER
          ? arahDerajat(sblm, ujung)
          : arahTerakhir.current.get(pos.sesi_tugas_id)
        if (arah != null) arahTerakhir.current.set(pos.sesi_tugas_id, arah)

        const panahHtml = arah == null
          ? ''
          : `<i class="penanda-arah" style="transform:rotate(${arah.toFixed(0)}deg)"></i>`
        const ikonHtml = `<div class="penanda-wadah">${panahHtml}<div class="penanda" style="background:${wSpt};border-color:${wCincin}"><span>${inisial(pos.nama)}</span></div></div>`
        const tujuan: [number, number] = [pos.lat, pos.lng]

        // Garis jejak SEBELUM penanda, supaya penanda (dan balonnya)
        // selalu tergambar DI ATAS garis, bukan tertutup olehnya.
        //
        // Kemunculan PERTAMA garis (belum ada sama sekali di peta ini,
        // entah baru muncul atau sudah diisi riwayat dari location_logs
        // saat halaman dibuka) digambar utuh langsung — tidak ada yang
        // perlu dianimasikan karena belum pernah tergambar sebelumnya.
        // Pemanjangan BERIKUTNYA (Titik baru masuk lewat Realtime)
        // diserahkan ke animasiKe() lewat cabang "bergerak" di bawah,
        // supaya ujung garis ikut bergeser halus bersama penandanya.
        const titikJejak = jejak.current.get(pos.sesi_tugas_id) ?? []
        if (!garisJejak.current.has(pos.sesi_tugas_id) && titikJejak.length >= 2) {
          const gaya = { color: wSpt, weight: 3.5, opacity: tampilkanJejak ? .85 : 0 }
          garisJejak.current.set(pos.sesi_tugas_id,
            L.polyline(gambarTersinggah(pos.sesi_tugas_id, titikJejak), gaya).addTo(p))
          // Ruas ujung dibuat berpasangan dan bergaya sama, supaya
          // pemisahannya tidak terlihat sebagai dua garis berbeda.
          garisUjung.current.set(pos.sesi_tugas_id, L.polyline([], gaya).addTo(p))
        }

        const ada = penanda.current.get(pos.sesi_tugas_id)
        if (ada) {
          const sekarang = ada.getLatLng()
          const bergerak = sekarang.lat !== tujuan[0] || sekarang.lng !== tujuan[1]
          ada.setIcon(L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 30], html: ikonHtml }))
          // Pembacaan berakurasi buruk TIDAK menyeret ikon. Titiknya tetap
          // tersimpan sebagai bukti dan cincin status tetap disegarkan di
          // atas — yang ditahan hanya perpindahannya, karena melompatkan
          // petugas ke tempat yang belum tentu benar lebih menyesatkan
          // daripada membiarkannya di posisi terakhir yang meyakinkan.
          // Ikonnya tetap "hidup": statusSinyal dihitung dari direkam_pada,
          // dan terakhir_terlihat pada users tetap maju.
          // Penanda ditahan pada dua keadaan yang berbeda sebabnya:
          // akurasi buruk (posisinya belum tentu benar) dan perangkat
          // menyatakan diam (posisinya benar, orangnya yang tidak
          // pindah). Keduanya sama-sama membuat perpindahan di layar
          // menyesatkan.
          if (bergerak && !sedangDiam(pos.aktivitas) && mutuAkurasi(pos.akurasi_meter) !== 'rendah') {
            animasiKe(pos.sesi_tugas_id, [sekarang.lat, sekarang.lng], tujuan)
          }
        } else {
          const mkr = L.marker(tujuan, {
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
          + `<small>${labelTerakhirTerlihat(pos.direkam_pada)}${pos.aktivitas ? ' · ' + pos.aktivitas : ''}${pos.akurasi_meter != null ? ' · ±' + Math.round(pos.akurasi_meter) + ' m' : ''}${pos.baterai_persen != null ? ' · ' + pos.baterai_persen + '% daya' : ''}${pos.izin_terputus ? '<br>Izin lokasi sedang terputus' : ''}</small>`
          + `</div>`
          + `</div>`,
        )
        if (ikutiSesi === pos.sesi_tugas_id) {
          const titikIkon = penanda.current.get(pos.sesi_tugas_id)?.getLatLng()
          if (titikIkon) p.panTo(titikIkon, { animate: true })
        }
      }
    })
    // tik sengaja terdaftar — balon info dan warna cincin pin memakai
    // labelTerakhirTerlihat()/statusSinyal() yang menua seiring waktu
    // nyata, bukan hanya saat posisi berubah (sama seperti daftar
    // "Sedang bertugas" di render biasa). Tanpa ini, keduanya beku
    // pada nilai saat titik GPS TERAKHIR masuk, tidak pernah mengejar
    // waktu berjalan sampai ada titik baru atau halaman dimuat ulang.
  }, [posisi, filterSpt, petaSiap, tik, animasiKe, gambarTersinggah, ikutiSesi, tampilkanJejak])

  useEffect(() => {
    for (const garis of garisJejak.current.values()) garis.setStyle({ opacity: tampilkanJejak ? .85 : 0 })
    for (const garis of garisUjung.current.values()) garis.setStyle({ opacity: tampilkanJejak ? .85 : 0 })
  }, [tampilkanJejak])

  useEffect(() => {
    document.body.classList.toggle('peta-layar-penuh-aktif', petaMaksimal)
    const id = window.setTimeout(() => peta.current?.invalidateSize(), 80)
    return () => {
      window.clearTimeout(id)
      document.body.classList.remove('peta-layar-penuh-aktif')
    }
  }, [petaMaksimal])

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

  const daftarTampil = [...posisi.values()].filter(x => filterSpt === 'semua' || x.penugasan_id === filterSpt)

  const sorotPeta = useCallback((idSesi: string, lat: number, lng: number) => {
    setIkutiSesi(idSesi)
    const titikIkon = penanda.current.get(idSesi)?.getLatLng()
    peta.current?.setView(titikIkon ?? [lat, lng], 17, { animate: true })
  }, [])

  const lihatSemua = useCallback(async () => {
    const p = peta.current
    if (!p) return
    setIkutiSesi(null)
    const L = await import('leaflet')
    const lokasi = titikLokasi.filter(t => filterSpt === 'semua' || t.penugasan_id === filterSpt)
    const orang = [...posisi.values()].filter(x => filterSpt === 'semua' || x.penugasan_id === filterSpt)
    const semua: [number, number][] = [
      ...lokasi.map(t => [t.lat, t.lng] as [number, number]),
      ...orang.map(t => [t.lat, t.lng] as [number, number]),
    ]
    if (semua.length === 1) p.setView(semua[0], 17, { animate: true })
    else if (semua.length > 1) p.fitBounds(L.latLngBounds(semua), { padding: [48, 48], maxZoom: 16, animate: true })
  }, [filterSpt, posisi, titikLokasi])

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

      <div className={`peta-langsung-wadah ${petaMaksimal ? 'peta-maksimal' : ''}`}>
        <div id="peta-wadah">
          <div id="peta" ref={elPeta} />
          <div className="peta-kontrol" aria-label="Kontrol peta">
            <div className="peta-kontrol-zoom">
              <button type="button" onClick={() => peta.current?.zoomIn()} aria-label="Perbesar peta" title="Perbesar">+</button>
              <button type="button" onClick={() => peta.current?.zoomOut()} aria-label="Perkecil peta" title="Perkecil">−</button>
            </div>
            <button type="button" className={`peta-jejak-kontrol ${tampilkanJejak ? 'on' : ''}`} aria-pressed={tampilkanJejak} onClick={e => setTampilkanJejak(e.currentTarget.getAttribute('aria-pressed') !== 'true')} aria-label={tampilkanJejak ? 'Sembunyikan jejak perjalanan' : 'Tampilkan jejak perjalanan'} title={tampilkanJejak ? 'Sembunyikan jejak' : 'Tampilkan jejak'}><Ikon nama="riwayat" /></button>
            <button type="button" onClick={lihatSemua} aria-label="Tampilkan semua petugas dan lokasi" title="Lihat semua"><Ikon nama="peta" /></button>
            <button type="button" className={petaMaksimal ? 'on' : ''} onClick={() => setPetaMaksimal(v => !v)} aria-label={petaMaksimal ? 'Keluar dari layar penuh' : 'Buka peta layar penuh'} title={petaMaksimal ? 'Tutup layar penuh' : 'Layar penuh'}><Ikon nama={petaMaksimal ? 'perkecil_layar' : 'perbesar_layar'} /></button>
          </div>
          {ikutiSesi && <button type="button" className="peta-ikuti-status" onClick={() => setIkutiSesi(null)}><span /> Mengikuti petugas <b>×</b></button>}
        </div>
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
                className={`peta-orang ${ikutiSesi === pos.sesi_tugas_id ? 'on' : ''}`}
                // Leaflet adalah pustaka imperatif — instance peta HARUS
                // disimpan sebagai ref (bukan state) supaya pembaruan
                // penanda tidak memicu Leaflet dibangun ulang tiap
                // render. sorotPeta hanya membaca ref itu di dalam
                // event handler klik yang sesungguhnya, tidak pernah
                // saat render, jadi aman meski aturan react-hooks/refs
                // tidak dapat membuktikannya secara statis.
                // eslint-disable-next-line react-hooks/refs
                onClick={() => sorotPeta(pos.sesi_tugas_id, pos.lat, pos.lng)}
                role="button"
                tabIndex={0}
                aria-pressed={ikutiSesi === pos.sesi_tugas_id}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') sorotPeta(pos.sesi_tugas_id, pos.lat, pos.lng) }}
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
                  <div className="peta-orang-info">
                    <span className={`aktivitas ${pos.aktivitas ?? 'tidak_diketahui'}`}>{pos.aktivitas?.replace('_', ' ') ?? 'Gerak belum diketahui'}</span>
                    {pos.akurasi_meter != null && <span>GPS ±{Math.round(pos.akurasi_meter)} m</span>}
                    {pos.baterai_persen != null && <span>Daya {pos.baterai_persen}%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
