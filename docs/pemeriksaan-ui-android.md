# Pemeriksaan UI web dan Android — 9 September 2026

Perubahan di workspace; belum dipublikasikan ke server dan belum dipasang pada HP.

## Perbaikan

- Tombol panjang dapat membungkus teks. Area aksi pada layar kecil disusun dalam kisi dengan jarak konsisten dan target sentuh minimal 44 px.
- Kartu statistik menggunakan dua kolom di HP. Formulir, judul, nomor SPT, serta panel rute menyesuaikan lebar layar.
- Navigasi bawah memiliki tinggi dasar 70 px, ditambah area gestur. Header, laci, dialog dan halaman masuk menghormati area aman atas/bawah/samping.
- CSS membaca custom properties `--safe-area-inset-*` dari Capacitor dengan fallback `env()`. Viewport memakai `cover`; Android memakai `adjustResize`. Warna ikon sistem mengikuti latar halaman masuk/aplikasi.
- Seluruh delapan dialog memakai komponen modal native bersama, dengan gulir, fokus keyboard, Escape dan pengembalian fokus. Layar kata sandi satu kali tetap harus ditutup melalui tombolnya.
- Panel personel peta langsung dipindahkan keluar dari wadah peta yang memotongnya pada HP. Rute menunggu Leaflet siap, mempertahankan warna sesi ketika difilter, dan menyesuaikan ukuran setelah perubahan layout.
- Kontrol selesai tugas sekarang tombol “Selesaikan tugas”, sesuai perilaku ketuk sebenarnya. Unggah foto dapat diakses keyboard.
- Pencarian dan filter penugasan dikirim dalam satu pembaruan URL. Ada tombol Cari yang jelas.
- Dekorasi halaman masuk tidak lagi memperlebar area gulir; teks sekunder dibuat lebih gelap.
- `cap sync android` berhasil: konfigurasi native lokal kini mengikuti `https://www.sipantaujabar.my.id`, bukan alamat lama yang sebelumnya tersimpan pada aset hasil generate.

## Verifikasi

- `npx tsc --noEmit`: lulus.
- `npm run lint`: lulus.
- `npm run build`: lulus, termasuk kompilasi TypeScript dan pembuatan seluruh rute.
- `git diff --check`: lulus.
- Pengujian browser terisolasi menggunakan komponen asli dengan data fiktif: 320×740, 360×800, 393×852, 412×915, 800×360 dan 1280×800. Tidak ditemukan overflow horizontal pada tombol/formulir/kartu/panel yang diperiksa. Fixture sementara sudah dihapus.
- Simulasi nilai Capacitor atas 24 px dan bawah 34 px: header memperoleh padding 24 px dan bilah bawah menjadi 104 px dengan padding bawah 34 px.
- Dialog pada 360×360: isi dan tombol dapat digulir; Tab berputar dalam dialog; Escape menutup dan fokus kembali ke tombol pemicu.
- Pencarian “uji tampilan” diikuti pilihan Berjalan menghasilkan `?cari=uji+tampilan&saring=berjalan` dan mempertahankan nilai isian.
- Penanda rute muncul pada pemuatan awal tanpa harus memilih sesi lebih dahulu.
- Halaman masuk asli pada viewport 360 px: `scrollWidth` dan `clientWidth` sama-sama 360 px.

## Batas verifikasi dan tindak lanjut perangkat

Tidak ada HP/emulator pada keluaran `adb devices`. Pengujian halaman setelah login menggunakan komponen terisolasi; belum mencakup alur dengan data dan sesi operasional.

Build debug Android dicoba tetapi proses daemon Gradle berhenti sebelum kompilasi. APK baru belum dihasilkan. Konfigurasi hasil generate juga meminta Java 21, sedangkan JDK yang teridentifikasi di mesin ini adalah 11 dan 17. Perbaiki lingkungan build Android sebelum membuat APK pengganti.

Setelah web dipublikasikan dan APK baru tersedia, verifikasi pada HP: navigasi gestur dan tiga tombol, keyboard saat dialog terbuka, rotasi layar, ukuran font perangkat diperbesar, seluruh menu per peran, serta peta langsung dengan sesi aktif. APK memuat web dari `server.url`, sehingga perubahan workspace belum otomatis terlihat pada APK yang sudah terpasang.

Dasar penanganan area aman: [dokumentasi SystemBars Capacitor](https://github.com/ionic-team/capacitor/blob/main/core/system-bars.md), dicocokkan dengan implementasi paket Capacitor 8.5.1 yang terpasang.
