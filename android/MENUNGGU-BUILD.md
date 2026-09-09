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
| `3264e5d` | Ikon notifikasi pelacakan (siluet putih), nama saluran Bahasa Indonesia, warna emas SiPANTAU | Notifikasi masih memakai ikon peluncur berwarna. Menurut README pustaka pelacakan, ikon salah tipe membuat notifikasi **dapat digeser hilang padahal seharusnya tidak**, sentuhan padanya membuka pengaturan alih-alih aplikasi, dan tulisannya bisa keliru. Saluran masih bernama "Background Tracking" |
| menyusul | Ikon peluncur APK dari lambang resmi SI PANTAU — ikon lawas seluruh kerapatan, lapisan depan ikon adaptif, dan warna latarnya | Ikon aplikasi di HP masih memakai bawaan Capacitor (bola dunia putih), bukan lambang SI PANTAU |
| `(baris ini)` | `capacitor.config.ts` → `server.url` pindah ke `https://www.sipantaujabar.my.id` (pemindahan akun GitHub + Vercel, 5 September 2026) | APK yang sudah terpasang di HP masih menunjuk `sipantau-seven.vercel.app` — akan menjadi layar kosong begitu alamat lama benar-benar mati. Sudah disunting di kode; **belum** ikut sampai HP sampai dibangun ulang |
| `dc8dd98`…`95e124d` | Plugin Capacitor baru `DokumenScanner` (pemindai dokumen native berbasis ML Kit/CameraX, `DokumenScannerPlugin.java` + `DokumenScannerActivity.java`), terdaftar di `MainActivity.java` dan `AndroidManifest.xml` | Plugin belum ada sama sekali di APK yang terpasang — tombol "Scan dokumen" di halaman Scan SPRIN memanggil `registerPlugin('DokumenScanner')` yang tidak menemukan implementasi native apa pun, sehingga SELALU gagal dengan pesan "Pemindai dokumen tidak dapat dibuka" (kegagalan seragam, bukan galat kamera/izin sungguhan) sampai APK dibangun ulang |

## Pemindahan alamat — 5 September 2026

Akun GitHub dan Vercel lama diblokir. Repo GitHub sudah hilang; alamat
Vercel lama (`sipantau-seven.vercel.app`) masih menjawab 200 saat catatan
ini ditulis, tetapi tidak dapat lagi menerima penempatan baru karena
repo sumbernya tidak ada.

Domain baru `sipantaujabar.my.id` sudah didaftarkan, diarahkan ke
proyek Vercel yang baru, dan **sudah dibuktikan menjawab** —
`https://sipantaujabar.my.id/masuk` membuka halaman masuk sungguhan.
Vercel mengalihkan alamat tanpa `www` ke `www.sipantaujabar.my.id`,
jadi `capacitor.config.ts` langsung menunjuk ke alamat `www` supaya
WebView tidak menempuh satu langkah pengalihan tambahan setiap dibuka.

Yang membuat ini berbeda dari baris tertunda lainnya: APK adalah
pembungkus WebView yang menunjuk satu alamat, dan alamat itu **dipanggang
ke dalam APK saat dibangun**. Begitu alamat lama benar-benar mati,
seluruh APK yang sudah terpasang di HP anggota menjadi layar kosong
serentak — bukan sebagian fitur yang tidak jalan, melainkan aplikasinya
tidak terbuka sama sekali.

Karena itu diputuskan memakai **domain sendiri**, bukan alamat
`*.vercel.app` yang baru: dengan domain sendiri, perpindahan akun Vercel
berikutnya cukup diselesaikan lewat DNS, dan APK di lapangan tidak perlu
disentuh sama sekali. Alamat `*.vercel.app` menuntut pembangunan dan
pemasangan ulang APK di setiap HP pada setiap perpindahan.

Urutannya mengikat, dan tidak boleh dibalik:

1. Domain didaftarkan dan diarahkan ke proyek Vercel yang baru
2. Domain itu sudah benar-benar menjawab — diperiksa lebih dulu, bukan
   dianggap sudah jalan
3. Baru `capacitor.config.ts` disunting ke domain itu
4. Baru APK dibangun ulang dan dipasang di seluruh HP

Membangun APK sebelum domainnya menjawab menghasilkan APK yang menunjuk
ke alamat mati, dan itu baru ketahuan sesudah terpasang di HP orang.

Sekali pemasangan ulang ini tetap tidak terhindarkan — APK yang sekarang
ada di lapangan menunjuk ke alamat lama. Yang dibeli oleh domain sendiri
adalah pemasangan ulang **berikutnya**, bukan yang ini.

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
