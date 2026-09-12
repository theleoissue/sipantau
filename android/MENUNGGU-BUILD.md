# Menunggu build APK

Daftar perubahan yang **sudah ada di kode** tetapi **belum sampai ke HP**,
karena menyentuh bagian native sehingga tidak cukup dengan menutup dan
membuka ulang aplikasi.

## Kenapa berkas ini ada

Sebagian besar perubahan SiPANTAU sampai ke HP tanpa build ulang: APK
hanyalah pembungkus WebView yang menunjuk ke penempatan Vercel
(`capacitor.config.ts` → `server.url`), jadi perubahan halaman, Server
Action, maupun opsi yang dikirim dari JS cukup diambil dengan menutup
penuh lalu membuka lagi aplikasinya.

Yang **tidak** ikut cara itu: sumber daya native (`android/app/src/main/res`),
`AndroidManifest.xml`, plugin Capacitor baru, dan `capacitor.config.ts`.
Semuanya terkunci di dalam APK sejak dibangun.

Tanpa catatan ini, perbedaan itu mudah menipu: perubahan sudah dikomit,
sudah tayang di web, tetapi di HP tidak terjadi apa-apa — dan mudah
disalahartikan sebagai perbaikannya yang gagal, bukan APK-nya yang belum
dibangun ulang.

## Yang menunggu

| Komit | Perubahan | Akibat sebelum dibangun ulang |
| --- | --- | --- |
| `3be94d9`, `870999e` | **PelacakService** — layanan latar depan perekam posisi milik sendiri (FusedLocationProvider + antrean SQLite + pengunggah dengan percobaan ulang), beserta `PelacakPlugin`, izin lokasi dan layanan latar depan di manifest, dan `play-services-location` | Perekaman masih sepenuhnya di dalam WebView. Akibatnya sudah terlihat di lapangan: begitu jaringan hilang, WebView menampilkan halaman galat bawaan peramban dan **tidak ada satu baris JavaScript pun yang berjalan** — penangkapan Titik berhenti dan antrean tidak bisa dikuras. Sampai APK dibangun ulang, halaman memakai jalur pustaka lama |
| menyusul | **Halaman luring** (`public/luring.html` + `server.errorPath` di `capacitor.config.ts`) | WebView masih jatuh ke layar galat bawaan Chrome saat sinyal putus — layar yang tidak menyebut SiPANTAU sama sekali, dan di lapangan mudah dibaca sebagai aplikasinya rusak atau perekamannya berhenti |
| menyusul | **Pemberitahuan dorong Android** (`@capacitor/push-notifications`, `@capacitor/local-notifications`, channel suara/getar, dan konfigurasi Firebase) | Lonceng dalam aplikasi tetap realtime ketika halaman hidup, tetapi pemberitahuan belum muncul atau berdering saat aplikasi tertutup |
| menyusul | **Pemulihan PelacakService sesudah reboot/pembaruan APK** (`PemulihPelacakReceiver` + `RECEIVE_BOOT_COMPLETED`) | Android belum mencoba menghidupkan kembali sesi yang masih berjalan setelah perangkat dinyalakan ulang atau APK diperbarui |
| menyusul | **Pratinjau hasil pindai SPRIN** — tiap halaman ditampilkan seukuran layar sesudah dipotret, dengan pilihan Pakai atau Ulangi; thumbnail dapat ditekan untuk memeriksa ulang atau menghapus halaman (DokumenScannerActivity) | Hasil satu halaman hanya terlihat sebagai thumbnail 48x64 dp. Halaman buram baru ketahuan sesudah Gemini gagal membacanya, dan saat itu petugas sudah meninggalkan tempatnya |
| menyusul | **Kerapatan perekaman adaptif** — diam 15 detik, berjalan 5, berkendara 3, tidak diketahui tetap 3 (`PelacakService.setelUlangJeda`). Membalik keputusan 11 September 2026 yang menetapkan serapat mungkin tanpa interval adaptif; pembalikannya dicatat di berkasnya. | Perekaman tetap 3 detik pada akurasi tertinggi sepanjang sesi. Untuk tugas delapan jam itu menguras baterai, dan baterai habis berarti perekaman berhenti sama sekali |
| menyusul | **Pengenalan gerak dari sensor** (`ACTIVITY_RECOGNITION` di manifes, langganan Activity Recognition di `PelacakService`, `PelacakPlugin.mintaIzinGerak`) beserta kolom `sumber` dan `aktivitas` pada antrean SQLite perangkat (versi tabel 1 → 2) | Keadaan diam/berjalan/berkendara masih disimpulkan dari kecepatan GPS. Saat petugas berdiri diam di dalam gedung dan posisi melompat, kecepatan turunan membacanya berkendara — dan peta menggambar jaring garis bolak-balik antar-derau. `sumber_lokasi` juga masih tercatat `gps` untuk seluruh Titik native, padahal penyedianya fusi |

Dikosongkan 11 September 2026 sesudah APK dibangun dan dipasang. Enam
baris sebelumnya — ikon notifikasi, ikon peluncur, `server.url` ke
`www.sipantaujabar.my.id`, plugin `DokumenScanner`, urutan
`registerPlugin`, dan plugin `KesehatanPelacak` — semuanya **sudah ada di
HP** dan tidak lagi menunggu apa pun.

## Cara membangun

Tab **Actions** di GitHub → alur **Bangun APK Android** → **Run workflow**.
Sengaja dipicu manual, bukan pada setiap dorongan kode (lihat keterangan
di `.github/workflows/build-apk.yml`). Hasilnya diunduh dari artefak
`sipantau-debug-apk`.

Gunakan **Run workflow**, bukan **Re-run jobs** pada jalannya yang lama —
"Re-run" memakai commit yang sama seperti jalannya semula, jadi
perubahan terbaru tidak ikut.

## Sesudah dibangun dan dipasang

Kosongkan tabel di atas, sisakan kepalanya. Berkas ini hanya berguna
selama isinya tepat.
