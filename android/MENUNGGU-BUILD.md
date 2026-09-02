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
