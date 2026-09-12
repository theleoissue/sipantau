# Catatan arah: aplikasi Android native dan peta Google

Status: **bahan keputusan, belum menjadi spesifikasi dan belum diimplementasikan**.

## Alasan dipertimbangkan

SiPANTAU sedang dipertimbangkan untuk beralih dari antarmuka Next.js di
Capacitor WebView menuju aplikasi Android native. Tujuannya adalah memperoleh
integrasi yang lebih kuat dengan layanan latar depan, kamera, izin perangkat,
penyimpanan luring, dan peta native. Sampai keputusan migrasi dibuat, tumpukan
teknologi aktif tetap mengikuti `CLAUDE.md`.

## Susunan peta yang dipertimbangkan

- Maps SDK for Android untuk menampilkan peta native di APK.
- Google Places tetap digunakan untuk pencarian perusahaan, gedung, dan alamat.
- Fused Location Provider dan foreground service tetap menjadi mesin perekam
  lokasi; Maps SDK bukan mesin pelacak.
- Koordinat GPS mentah tetap disimpan sebagai fakta utama dan tidak pernah
  ditimpa oleh hasil penghalusan.
- Roads API `Route Traveled` dipakai sebagai lapisan tampilan opsional hanya
  untuk segmen berkendara.
- Segmen berjalan kaki, di dalam gedung, kawasan pabrik, hutan, saluran, dan
  lokasi di luar jalan tidak ditempelkan ke jalan.
- Pengawas dapat membandingkan jejak asli dengan jejak mengikuti jalan.

## Kendali biaya

- Pemanggilan Roads dilakukan setelah titik dikumpulkan, maksimal 100 titik per
  permintaan, bukan satu permintaan per titik.
- Hasil map matching disimpan agar perjalanan yang sama tidak diproses ulang.
- Roads tidak dipanggil ketika petugas diam atau berjalan kaki.
- Kuota gratis Roads saat catatan ini dibuat adalah 5.000 permintaan per SKU per
  bulan. Pemakaian setelah batas gratis mengikuti harga Google Maps Platform.
- Untuk sepuluh petugas, sasaran desain adalah tetap di bawah batas gratis
  dengan klasifikasi moda, batching, cache, dan pemrosesan hanya pada segmen
  kendaraan.
- Billing alert dan batas kuota harian wajib dipasang sebelum Roads diaktifkan.

## Urutan bila migrasi disetujui

1. Bekukan kontrak API dan model data yang dipakai web saat ini.
2. Pisahkan domain, autentikasi, pelaporan, dan pelacakan dari komponen UI web.
3. Bangun aplikasi Android native bertahap, dimulai dari sesi tugas dan antrean
   lokasi luring.
4. Tambahkan Maps SDK for Android tanpa Roads dan ukur stabilitas perangkat.
5. Tambahkan map matching selektif pada segmen kendaraan serta pengendalian
   biaya.
6. Pertahankan web sebagai konsol pengawas dan administrasi.

Migrasi tidak perlu dilakukan sekaligus. Bagian yang paling diuntungkan oleh
native adalah pelacakan, kamera, dan pekerjaan luring; konsol pimpinan tetap
lebih sesuai dijalankan sebagai web.
