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
