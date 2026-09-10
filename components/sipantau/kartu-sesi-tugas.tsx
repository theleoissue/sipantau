'use client'

import { DialogModal } from './dialog-modal'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { BackgroundGeolocation } from '@capgo/background-geolocation'
import { selesaiTugas, tandaiIzinTerputus, tandaiIzinPulih, mulaiTugasWeb, terbitkanTokenNative } from '@/app/(app)/tugas/aksi'
import { antrekan, jumlahTertunda, kirimAntrean } from '@/lib/gps/antrean'
import { penandaPerangkatWeb } from '@/lib/gps/penanda-perangkat'
import { penandaPerangkatNative } from '@/lib/gps/penanda-perangkat-native'
import type { SesiAktifSaya } from '@/lib/gps/tipe'
import { Ikon } from './ikon'

// Jeda antar-Titik. Diturunkan 20s -> 15s: masih jauh di bawah ambang
// "Aktif" (2 menit, KP-6.4-33) sekalipun beberapa Titik berturut-turut
// gagal terkirim, tapi peta pengawas jadi lebih cepat menyusul keadaan
// sebenarnya. Tidak diturunkan lebih jauh dengan sengaja — location_logs
// adalah tabel yang tumbuh paling cepat di sistem ini (Section 10.2),
// dan tiap penurunan berbanding lurus dengan lajunya.
const JEDA_KIRIM_TITIK_MS = 15_000

// mulaiTugasWeb/kirimTitikWeb (app/(app)/tugas/aksi.ts) TIDAK sungguh
// khusus web — keduanya cuma meneruskan penanda_perangkat apa adanya ke
// buka_sesi_tugas/kirim_titik, yang sejak migrasi 0031 tidak lagi
// membedakan asal penanda. Dipakai ulang apa adanya di sini untuk jalur
// Android sungguhan, bukan didup fungsi baru untuk hal yang sama.

function lamaBerjalan(dibukaPada: string): string {
  const menit = Math.floor((Date.now() - new Date(dibukaPada).getTime()) / 60_000)
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisaMenit = menit % 60
  return `${jam} jam ${sisaMenit} menit`
}

interface SptRingkas { id: string; nomor_spt: string | null; judul: string }

/**
 * BR-65 / KP-6.4-67: tombol Mulai Tugas TIDAK PERNAH dirender di bentuk
 * web SUNGGUHAN (Android nanti). Blok "Uji Coba: Mulai Tugas dari Web"
 * di bawah adalah PENGECUALIAN SENGAJA — migrasi 0031 mencabut lapis
 * kedua penegakannya atas permintaan eksplisit pemilik produk, sesudah
 * risikonya disampaikan lengkap: pelacakan lewat peramban berhenti
 * DIAM-DIAM begitu tab ditutup atau layar terkunci (tidak ada layanan
 * latar depan), dan itu bisa membuat Kanit salah menyimpulkan
 * Anggotanya kabur — persis kekeliruan yang coba dicegah BR-65
 * (docs/40-modul-6.4-gps.md baris 440-447). Dipakai untuk uji coba/
 * demo, BUKAN pengganti Langkah 4 (Bangun APK Android, CLAUDE.md §10).
 */
export function KartuSesiTugas({
  sesi,
  sptTersedia,
}: {
  sesi: SesiAktifSaya | null
  sptTersedia: SptRingkas[]
}) {
  const router = useRouter()
  useEffect(() => { window.dispatchEvent(new Event('sipantau:sesi-berubah')) }, [sesi?.id])
  const [tanya, setTanya] = useState(false)
  const [proses, mulai] = useTransition()
  const [galat, setGalat] = useState<string | null>(null)
  const izinTerputus = sesi ? sesi.izin_dicabut_pada !== null && sesi.izin_dipulihkan_pada === null : false

  // Jeda sesaat sebelum kontrol "geser selesai tugas" mulai menanggapi
  // sentuhan — begitu Mulai Tugas berhasil, tampilan berganti total dari
  // tombol itu ke kartu ini, dan sentuhan yang masih menyentuh layar
  // sepersekian detik kemudian bisa jatuh tepat di kontrol geser yang
  // baru muncul menggantikannya (posisinya berdekatan di tata letak).
  // Tanpa jeda ini, dialog "Selesaikan Sesi Tugas?" bisa muncul sendiri
  // tepat setelah sesi baru saja dibuka.
  const [siapAkhiri, setSiapAkhiri] = useState(false)
  useEffect(() => {
    // Kontrol geser hanya dirender saat sesi ada, dan alur aplikasi
    // selalu kembali ke "belum ada sesi" sebelum sesi baru dibuka
    // (tidak pernah langsung berpindah sesi-ke-sesi) — jadi siapAkhiri
    // sudah pasti false dari sononya di sini, tidak perlu disetel
    // ulang secara sinkron.
    if (!sesi) return
    const id = setTimeout(() => setSiapAkhiri(true), 1200)
    return () => clearTimeout(id)
    // Sengaja hanya sesi.id, bukan seluruh objek sesi — objek ini
    // berubah tiap router.refresh() (mis. jumlah_titik bertambah),
    // padahal jeda ini hanya perlu diulang saat SESI-nya benar-benar
    // baru, bukan tiap kali datanya menyegarkan diri.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesi?.id])

  const [sptDipilih, setSptDipilih] = useState('')
  const [memulai, setMemulai] = useState(false)
  const [galatMulai, setGalatMulai] = useState<string | null>(null)

  const iniSesiWeb = sesi?.penanda_perangkat.startsWith('web-') ?? false
  const [jumlahTerkirim, setJumlahTerkirim] = useState(0)
  const [tertunda, setTertunda] = useState(0)
  const [galatKirim, setGalatKirim] = useState<string | null>(null)
  const idPengawas = useRef<number | null>(null)
  const sedangMengirim = useRef(false)
  const terakhirKirim = useRef(0)

  /** Mengosongkan antrean sejauh yang jaringan izinkan, lalu melaporkan apa adanya. */
  const alirkan = useCallback(async () => {
    const hasil = await kirimAntrean()
    setTertunda(hasil.tersisa)
    if (hasil.terkirim > 0) setJumlahTerkirim(n => n + hasil.terkirim)
    if (hasil.galat === 'jaringan') {
      // Kalimat ini menggantikan "Akan dicoba lagi" yang dulu tidak
      // pernah benar: tidak ada yang disimpan dan tidak ada yang diulang.
      setGalatKirim(
        `Jaringan terputus. ${hasil.tersisa} titik tersimpan di perangkat dan akan terkirim sendiri begitu sinyal kembali.`,
      )
    } else if (hasil.galat) {
      setGalatKirim(hasil.galat)
    } else {
      setGalatKirim(null)
    }
  }, [])

  // Antrean dari sesi sebelumnya ikut dihitung dan dialirkan: aplikasi
  // bisa saja ditutup dalam keadaan masih menyimpan Titik.
  useEffect(() => {
    if (!sesi) return
    void jumlahTertunda().then(setTertunda)
    const saatOnline = () => { void alirkan() }
    window.addEventListener('online', saatOnline)
    // Sinyal seluler yang menguat tidak selalu memicu peristiwa 'online',
    // jadi tetap ada percobaan berkala — dilewati saat peramban sendiri
    // tahu masih luring, supaya tidak membakar baterai percuma.
    const timer = window.setInterval(() => {
      if (navigator.onLine !== false) void alirkan()
    }, 60_000)
    return () => {
      window.removeEventListener('online', saatOnline)
      window.clearInterval(timer)
    }
  }, [sesi, alirkan])

  // Selama sesi WEB ini berjalan (dan komponennya tetap terpasang di
  // tab ini — BR-65 mengingatkan: berhenti begitu tab ditutup), kirim
  // Titik berkala lewat watchPosition. Dijeda manual JEDA_KIRIM_TITIK_MS
  // supaya tidak mengirim di setiap pembaruan GPS mentah.
  useEffect(() => {
    if (!sesi || !iniSesiWeb || !navigator.geolocation) return

    idPengawas.current = navigator.geolocation.watchPosition(
      async pos => {
        const kini = Date.now()
        if (sedangMengirim.current || kini - terakhirKirim.current < JEDA_KIRIM_TITIK_MS) return
        sedangMengirim.current = true
        terakhirKirim.current = kini
        // try/finally WAJIB: kirimTitikWeb adalah Server Action, dan
        // Server Action MELEMPAR (bukan mengembalikan galat) begitu
        // jaringan putus — hal yang lumrah terjadi di lapangan. Tanpa
        // finally, sedangMengirim tersangkut true SELAMANYA dan seluruh
        // Titik sesudahnya dibuang diam-diam: perangkat tetap merekam,
        // pengawas melihat "Terakhir terlihat" membeku, dan tidak ada
        // satu pun pesan galat yang muncul di mana pun.
        try {
          // Titik DISIMPAN dulu, baru dikirim. Urutan ini yang membuat
          // jaringan putus tidak lagi menghapus rekaman.
          await antrekan({
            sesiId: sesi.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            akurasiMeter: pos.coords.accuracy ?? null,
            kecepatanMps: pos.coords.speed ?? null,
            arahDerajat: pos.coords.heading ?? null,
            penandaPerangkat: penandaPerangkatWeb(),
            antreanId: crypto.randomUUID(),
            ditangkapPada: pos.timestamp,
            // Peramban tidak melaporkan lokasi tiruan; hanya jalur native
            // yang tahu. Jangan mengaku tahu di sini.
            lokasiTiruan: false,
          })
          await alirkan()
        } finally {
          sedangMengirim.current = false
        }
      },
      () => setGalatKirim('Izin lokasi ditolak atau tidak tersedia — Titik berhenti terekam.'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    )

    return () => {
      if (idPengawas.current !== null) navigator.geolocation.clearWatch(idPengawas.current)
    }
    // sesi.id, bukan objek sesi — alasan sama seperti pengawas native
    // di bawah: objek sesi berganti identitas tiap penyegaran data,
    // dan itu memasang ulang watchPosition tanpa perlu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesi?.id, iniSesiWeb])

  // Sesi ANDROID SUNGGUHAN (penanda BUKAN 'web-', dan berjalan di dalam
  // APK Capacitor) — pengganti watchPosition di atas: BackgroundGeolocation
  // punya layanan latar depan sungguhan (foregroundServiceType="location"),
  // jadi terus jalan walau WebView dibekukan sistem saat layar terkunci.
  // Jeda pengiriman sama persis (JEDA_KIRIM_TITIK_MS) — logikanya identik
  // dengan jalur web, cuma sumber titiknya beda.
  useEffect(() => {
    // Gerbangnya Capacitor.isNativePlatform(), BUKAN penanda yang cuma
    // dinyalakan saat tombol Mulai Tugas ditekan di sesi layar ini.
    // Dengan penanda semacam itu, membuka kembali APK yang sesinya
    // MASIH berjalan (aplikasi ditutup lalu dibuka lagi) tidak pernah
    // menyalakan pengawas — layanan latar depan tidak hidup, lonceng
    // pemberitahuan tidak muncul, dan tidak satu pun Titik terekam,
    // padahal kartu di layar tetap menampilkan "Sesi Tugas berjalan".
    if (!sesi || iniSesiWeb || !Capacitor.isNativePlatform()) return
    let batal = false

    async function nyalakanPengawas() {
      // Pengiriman Native: satu-satunya cara pelacakan bertahan setelah
      // aplikasi DITUTUP. Sumber pustakanya menyatakannya sendiri pada
      // handleOnDestroy() — layanan latar depan dimatikan begitu
      // aplikasi dibongkar, KECUALI mode pengiriman native aktif, yang
      // menyala hanya bila opsi url terisi. Dengan url terisi, layanan
      // itu dijaga hidup sistem (START_STICKY) dan tetap mengirim Titik
      // walau proses aplikasi sudah tidak ada lagi.
      let opsiKirim: { url?: string; headers?: Record<string, string> } = {}
      try {
        const penanda = await penandaPerangkatNative()
        const r = await terbitkanTokenNative(sesi!.id, penanda)
        if (batal) return
        if (r.token) {
          opsiKirim = {
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/titik-native`,
            headers: {
              // Kunci anon, bukan rahasia: ia memang sudah terbuka di
              // sisi klien, dan di sini perannya cuma melewati gerbang
              // Fungsi Tepi. Yang menjadi kredensial sesungguhnya adalah
              // x-sipantau-token di bawahnya.
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'x-sipantau-token': r.token,
            },
          }
        }
      } catch {
        // Gagal menerbitkan token BUKAN alasan untuk tidak melacak sama
        // sekali. Pengawas tetap dinyalakan tanpa pengiriman native —
        // pelacakan berjalan normal selama aplikasi masih hidup, hanya
        // tidak bertahan setelah aplikasi ditutup.
      }
      if (batal) return

      await BackgroundGeolocation.start(
      {
        ...opsiKirim,
        backgroundTitle: 'SiPANTAU sedang melacak Sesi Tugas',
        // backgroundMessage WAJIB ada: tanpa ini pustaka hanya menjamin
        // pembaruan saat aplikasi di depan layar (dokumentasi pustaka
        // sendiri) — layanan latar depan berikut pemberitahuannya tidak
        // dinyalakan sama sekali.
        backgroundMessage: 'Ketuk untuk kembali ke aplikasi. Jangan hentikan selama masih bertugas.',
        requestPermissions: true,
        stale: false,
        // Laju diatur di sisi native, bukan lagi hanya disaring di JS:
        // sebelumnya perangkat memancarkan pembaruan tiap ~1 detik dan
        // JS membuang hampir semuanya — radio menyala terus tanpa satu
        // pun Titik tambahan tersimpan. distanceFilter sengaja 0 supaya
        // personel yang berjaga di tempat TETAP mengirim denyut berkala
        // (kalau tidak, ia terbaca "hilang" hanya karena tidak bergerak).
        distanceFilter: 0,
        minIntervalMs: JEDA_KIRIM_TITIK_MS,
      },
      (lokasi, error) => {
        if (batal || !lokasi) return
        if (error) { setGalatKirim(error.message); return }
        // JALUR INI TIDAK PERNAH LAGI DIBUNGKAM.
        //
        // Bentuk sebelumnya berhenti mengirim begitu token native
        // berhasil diterbitkan, dengan anggapan kode native sudah
        // mengirimnya sendiri. Anggapan itu SALAH dan berakibat parah:
        // token terbit hanya membuktikan migrasinya terpasang, sama
        // sekali BUKAN membuktikan Fungsi Tepi titik-native sudah
        // di-deploy dan menjawab. Pustakanya tidak punya percobaan ulang
        // dan tidak melaporkan kegagalan POST kembali ke JS ("failed
        // POSTs are logged and dropped"), jadi ketika alamat itu
        // menjawab 404 seluruh Titik lenyap TANPA satu pun tanda —
        // posisi di peta membeku sepanjang sesi, dan baru berpindah
        // ketika sesi ditutup lalu dibuka lagi (titik pembuka sesi
        // lewat Server Action, bukan jalur native). Persis yang
        // dilaporkan dari lapangan.
        //
        // Sekarang JS selalu mengirim — ia jalur yang andal dan
        // melaporkan galatnya. Pengiriman native tinggal sebagai
        // pelapis untuk keadaan yang JS memang tidak bisa capai:
        // proses aplikasi sudah mati. Gandanya dicegah di basis data
        // (kirim_titik_native, migrasi 0040), bukan dengan membungkam
        // jalur yang justru paling dapat dipercaya.
        const kini = Date.now()
        if (sedangMengirim.current || kini - terakhirKirim.current < JEDA_KIRIM_TITIK_MS) return
        sedangMengirim.current = true
        terakhirKirim.current = kini
        // Rantai .then TANPA .catch (bentuk sebelumnya) menyangkutkan
        // sedangMengirim di true selamanya begitu satu pengiriman
        // ditolak — lihat keterangan panjang pada jalur web di atas.
        penandaPerangkatNative()
          .then(penanda =>
            // Disimpan dulu, baru dialirkan — sama seperti jalur web.
            antrekan({
              sesiId: sesi!.id,
              lat: lokasi.latitude,
              lng: lokasi.longitude,
              akurasiMeter: lokasi.accuracy,
              kecepatanMps: lokasi.speed,
              // Ketiganya SUDAH dilaporkan pustaka sejak awal dan punya
              // kolomnya masing-masing di basis data, tetapi dulu dibuang:
              // arah_derajat dikirim null dan lokasi_tiruan dipaksa false,
              // sehingga rotasi ikon tidak punya data dan deteksi GPS
              // palsu tidak pernah sekali pun menyala.
              arahDerajat: lokasi.bearing,
              lokasiTiruan: lokasi.simulated,
              penandaPerangkat: penanda,
              antreanId: crypto.randomUUID(),
              ditangkapPada: lokasi.time ?? Date.now(),
            }),
          )
          .then(alirkan)
          .finally(() => { sedangMengirim.current = false })
      },
      )
    }

    nyalakanPengawas()

    return () => { batal = true; BackgroundGeolocation.stop() }
    // sesi.id, BUKAN objek sesi: objek itu berganti identitas tiap kali
    // data sesi disegarkan (jumlah_titik bertambah), dan setiap
    // pergantian menjalankan ulang efek ini — artinya stop() lalu
    // start() berulang kali, sehingga pemberitahuan latar depan
    // berkedip mati-hidup dan ada jeda kosong tanpa perekaman di
    // antaranya. Yang benar: cukup sekali per Sesi Tugas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesi?.id, iniSesiWeb])

  async function mulaiTugasDariAndroid() {
    if (!sptDipilih) return
    setGalatMulai(null)
    setMemulai(true)

    // Penjaga sekali-pakai LOKAL (bukan status React) — BackgroundGeolocation
    // bisa memanggil callback ini berkali-kali begitu lokasi terus mengalir,
    // dan status React dibaca dari closure render saat start() dipanggil,
    // TIDAK ikut berubah membaca nilai terbaru di dalam callback native ini.
    let sudahDiproses = false

    await BackgroundGeolocation.start(
      // stale:true di sini SENGAJA beda dari watcher berkelanjutan di
      // bawah — ini cuma untuk titik PEMBUKA sesi (kecepatan dibuka
      // lebih penting daripada presisi satu titik ini), sementara jejak
      // Rute sesudahnya tetap menuntut titik segar terus-menerus
      // (BR-67). Tanpa ini, GPS dingin di lapangan terbuka bisa
      // menunda pembukaan sesi puluhan detik menunggu kunci satelit.
      { requestPermissions: true, stale: true },
      (lokasi, error) => {
        // Panggilan PERTAMA saja yang dipakai untuk membuka Sesi Tugas —
        // BackgroundGeolocation.start tetap berjalan sesudahnya, useEffect
        // di atas yang mengambil alih pengiriman titik berkelanjutan begitu
        // `sesi` terisi lewat router.refresh() (bukan dua watcher sekaligus,
        // sebab watcher milik useEffect baru menyala setelah sesi ada —
        // pemanggilan start() kedua di situ menggantikan yang di sini).
        if (sudahDiproses) return
        if (error || !lokasi) {
          sudahDiproses = true
          setMemulai(false)
          setGalatMulai(error?.message ?? 'Lokasi tidak tersedia. Aktifkan GPS dan coba lagi.')
          return
        }
        sudahDiproses = true
        setMemulai(false)
        // Hentikan watcher sekali-pakai ini SEBELUM menyegarkan halaman —
        // begitu `sesi` terisi, useEffect di atas menyalakan watcher
        // berkelanjutannya sendiri. Tanpa ini ada dua watcher native
        // berjalan sekaligus.
        BackgroundGeolocation.stop().then(() =>
          penandaPerangkatNative()
        ).then(penanda =>
          mulaiTugasWeb(sptDipilih, lokasi.latitude, lokasi.longitude, lokasi.accuracy, penanda)
        ).then(r => {
          if (r.galat) setGalatMulai(r.galat)
          else router.refresh()
        })
      },
    )
  }

  function mulaiTugasDariWeb() {
    if (!sptDipilih || !navigator.geolocation) return
    setGalatMulai(null)
    setMemulai(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        mulai(async () => {
          const r = await mulaiTugasWeb(
            sptDipilih, pos.coords.latitude, pos.coords.longitude,
            pos.coords.accuracy ?? null, penandaPerangkatWeb(),
          )
          setMemulai(false)
          if (r.galat) setGalatMulai(r.galat)
          else router.refresh()
        })
      },
      () => { setMemulai(false); setGalatMulai('Izin lokasi ditolak. Aktifkan izin lokasi peramban untuk memulai.') },
      { enableHighAccuracy: true, timeout: 20_000 },
    )
  }

  if (!sesi) {
    // Di dalam APK Android sungguhan: alur resmi, tanpa peringatan
    // "uji coba" — BackgroundGeolocation punya layanan latar depan
    // sungguhan (bukan watchPosition WebView yang berhenti begitu layar
    // terkunci, itulah alasan BR-65 melarang jalur web di lapangan).
    if (Capacitor.isNativePlatform()) {
      return (
        <div className="sesi-kartu">
          <div className="lb">Sesi tugas</div>
          <div className="nilai">Belum ada sesi berjalan</div>
          <div className="ket">
            Pilih penugasan lalu Mulai Tugas untuk membuka Sesi Tugas dan
            mulai merekam posisi.
          </div>

          {sptTersedia.length === 0 ? (
            <div className="sesi-syarat">
              <Ikon nama="satelit" />
              <span>Tidak ada penugasan yang menerima Sesi Tugas saat ini.</span>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <select
                value={sptDipilih} onChange={e => setSptDipilih(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 8, marginBottom: 8 }}
              >
                <option value="">Pilih penugasan…</option>
                {sptTersedia.map(s => (
                  <option key={s.id} value={s.id}>{s.nomor_spt ?? s.judul} — {s.judul.slice(0, 40)}</option>
                ))}
              </select>
              <button
                type="button" className="btn btn-g"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!sptDipilih || memulai}
                onClick={mulaiTugasDariAndroid}
              >
                <Ikon nama="satelit" />
                {memulai ? 'Meminta izin lokasi…' : 'Mulai Tugas'}
              </button>
              {galatMulai && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 8 }}>{galatMulai}</p>}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="sesi-kartu">
        <div className="lb">Sesi tugas</div>
        <div className="nilai">Belum ada sesi berjalan</div>
        <div className="ket">
          Sesi Tugas dan perekaman posisi hanya dapat dimulai dari aplikasi
          Android SiPANTAU terpasang. Bentuk web tetap dapat membaca
          penugasan, mengirim laporan, dan melihat Rute — perekaman
          posisinya sendiri memerlukan layanan latar depan yang tidak
          tersedia bagi halaman web.
        </div>
        <div className="sesi-syarat">
          <Ikon nama="satelit" />
          <span>Berkas pemasangan Android belum tersedia — menyusul pada tahap berikutnya.</span>
        </div>

        {sptTersedia.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,.25)' }}>
            <div className="sesi-syarat" style={{ color: '#FDE68A', marginBottom: 10 }}>
              <Ikon nama="awas" />
              <span>
                Uji coba: Mulai Tugas dari web. Perekaman berhenti diam-diam
                begitu tab ini ditutup atau layar terkunci — bukan untuk
                dipakai sungguhan di lapangan.
              </span>
            </div>
            <select
              value={sptDipilih} onChange={e => setSptDipilih(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 8, marginBottom: 8 }}
            >
              <option value="">Pilih penugasan…</option>
              {sptTersedia.map(s => (
                <option key={s.id} value={s.id}>{s.nomor_spt ?? s.judul} — {s.judul.slice(0, 40)}</option>
              ))}
            </select>
            <button
              type="button" className="btn btn-o btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', width: '100%', justifyContent: 'center' }}
              disabled={!sptDipilih || memulai}
              onClick={mulaiTugasDariWeb}
            >
              {memulai ? 'Meminta izin lokasi…' : 'Mulai Tugas (uji coba web)'}
            </button>
            {galatMulai && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 8 }}>{galatMulai}</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sesi-kartu jalan">
      <div className="lb">Sesi tugas berjalan</div>
      <div className="nilai">{lamaBerjalan(sesi.dibuka_pada)}</div>
      <div className="ket">
        Pelacakan aktif sejak Mulai Tugas · {sesi.jumlah_titik} titik terekam
      </div>
      <span className="spt-ket">
        {sesi.nomor_spt ?? sesi.penugasan_id} — {sesi.judul.slice(0, 44)}
        {sesi.judul.length > 44 ? '…' : ''}
      </span>

      {iniSesiWeb && (
        <div className="sesi-syarat" style={{ color: '#FDE68A' }}>
          <Ikon nama="awas" />
          <span>
            Sesi uji coba web — jaga tab ini tetap terbuka dan layar
            menyala. {jumlahTerkirim > 0 && `${jumlahTerkirim} titik terkirim dari tab ini.`}
          </span>
        </div>
      )}
      {galatKirim && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 8 }}>{galatKirim}</p>}

      {/* Jumlah tertunda ditampilkan APA ADANYA. Tanpa ini, petugas tidak
          punya cara tahu ada rekaman yang belum sampai ke server. */}
      {tertunda > 0 && (
        <div className="sesi-syarat" style={{ color: '#FDE68A' }}>
          <Ikon nama="riwayat" />
          <span>
            {tertunda} titik menunggu dikirim. Tersimpan di perangkat dan
            akan terkirim sendiri begitu jaringan pulih — jangan tutup
            aplikasi sebelum angkanya nol.
          </span>
        </div>
      )}

      {izinTerputus && (
        <div className="sesi-syarat" style={{ color: '#FDE68A' }}>
          <Ikon nama="awas" />
          <span>
            Izin lokasi sedang terputus. Sesi tetap terbuka; pulihkan izin di
            pengaturan perangkat agar posisi kembali terekam.
          </span>
        </div>
      )}

      {galat && <p style={{ color: '#FCA5A5', fontSize: 12.5, marginTop: 10 }}>{galat}</p>}

      <button type="button" className="btn sesi-selesai" disabled={!siapAkhiri || proses}
        onClick={() => setTanya(true)}>
        <Ikon nama="stop" /> Selesaikan tugas
      </button>

      {process.env.NODE_ENV !== 'production' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="btn btn-o btn-sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}
            disabled={proses}
            onClick={() => mulai(async () => {
              const r = izinTerputus ? await tandaiIzinPulih(sesi.id) : await tandaiIzinTerputus(sesi.id)
              if (r.galat) setGalat(r.galat)
            })}
          >
            {izinTerputus ? 'Tandai izin pulih' : 'Tandai izin terputus'}
          </button>
        </div>
      )}

      {tanya && (
        <DialogModal label="Selesaikan Sesi Tugas?" terkunci={proses} onTutup={() => setTanya(false)}>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 24,
            maxWidth: 380, width: '100%', boxShadow: 'var(--sh-lg)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 650, color: 'var(--ink)' }}>
              Selesaikan Sesi Tugas?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 10 }}>
              Perekaman posisi akan berhenti seketika. Rute yang sudah
              terekam tersimpan utuh dan dapat dibuka kembali kapan pun.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-o" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setTanya(false)} disabled={proses}
              >
                Batal
              </button>
              <button
                className="btn btn-d" style={{ flex: 1, justifyContent: 'center' }}
                disabled={proses}
                onClick={() => mulai(async () => {
                  // Antrean dikosongkan DULU. Titik yang menyusul sesudah
                  // sesi tertutup memang tetap diterima (migrasi 0056),
                  // tetapi mengirimnya selagi sesi masih terbuka membuat
                  // posisi_terkini ikut terisi benar sampai detik terakhir.
                  await alirkan()
                  const r = await selesaiTugas(sesi.id)
                  if (r.galat) { setGalat(r.galat); setTanya(false) }
                })}
              >
                {proses ? 'Menyelesaikan…' : 'Ya, selesaikan'}
              </button>
            </div>
          </div>
        </DialogModal>
      )}
    </div>
  )
}
