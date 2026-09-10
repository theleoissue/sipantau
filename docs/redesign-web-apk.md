# Redesign web dan APK

Kesepakatan 10 September 2026. Navigasi mobile berlaku untuk web pada layar
kecil dan WebView APK; desktop mempertahankan sidebar.

## Tahap pertama: fondasi navigasi

- [x] Anggota: Beranda, Penugasan, Sesi Tugas, Peta Tim, Kirim Laporan.
- [x] Panit: Beranda, Penugasan, Sesi Tugas, Peta Tim, Tinjau Laporan.
- [x] Sesi Tugas menjadi tombol tengah; hanya membuka halaman tugas.
- [x] Atasan tetap memakai navigasi standar.
- [x] Ikon menu hamburger dan judul halaman sesuai konteks.
- [x] Sidebar hanya menandai satu tujuan aktif, termasuk Persetujuan Scan.
- [x] Back Android memprioritaskan modal dan laci sebelum riwayat halaman.
- [x] Tujuan cadangan detail penugasan/LHP kembali ke daftar terkait.
- [x] Ruang bawah untuk tombol tengah serta penyembunyian bilah saat keyboard menutupi layar.
- [x] Hapus pemaksaan semua tombol kepala kartu menjadi selebar layar.
- [x] Verifikasi komponen dengan data sintetis di browser pada lebar 320, 360, 768, dan 1280 px.
- [ ] Verifikasi perangkat Android fisik dan halaman dengan akun nyata.
- [x] Indikator hijau Sesi Tugas berdasarkan sesi server yang benar-benar berjalan, dengan pembacaan ringan di klien, penyegaran saat aplikasi kembali terlihat, dan pembaruan realtime.

## Tahap berikutnya

- [x] Audit draft: laporan dipisahkan per akun, menolak pemulihan ke SPT yang tidak tersedia, dan tidak dipulihkan ulang saat penyegaran data. Penugasan baru tetap menawarkan mulai kosong/pulihkan; sisa debounce disimpan saat navigasi/pagehide. LHP memiliki cadangan narasi per penyusun/dokumen dengan pilihan pemulihan.
- [x] Tabel Personel, Akun, Rekap dan Rute Saya menjadi kartu berlabel di mobile. LHP sudah memiliki kartu mobile; tabel dokumen cetak tetap mengikuti format surat.
- [x] Detail penugasan: tindakan status dan dasar dapat dilipat; rekam kegiatan memakai laporan yang benar-benar tersedia melalui RLS.
- [x] Panel Kelola memenuhi lebar kartu saat dibuka dan daftar ringkas disembunyikan; verifikasi dengan data contoh di mobile/desktop.
- [x] Progress berarti jumlah pelaksana yang telah membuka penugasan, BUKAN laporan lokasi. Label sudah diperbaiki sesuai kode.
- [x] Riwayat dan LHP tetap dapat diakses lewat sidebar; tidak menambah tujuan baru pada navigasi bawah.
- [x] Modal memakai safe area dan batas tinggi; crop tetap manual dengan tombol X, ruang di tepi gambar, ukuran target sentuh konsisten, reset bingkai, serta validasi sudut.
- [x] Scanner menampilkan tahap proses, ukuran total, daftar berkas yang bisa diurutkan/dihapus, dan penolakan ukuran sebelum upload. Foto tampil untuk disesuaikan sambil OpenCV dimuat; kegagalan memuat dapat dicoba ulang.
- [x] Audit target sentuhan, fokus keyboard, layar pendek dan safe area: titik crop dapat digeser dengan keyboard, menu memiliki tombol tutup dan fokus kembali, animasi mengikuti reduced motion.

Validasi sesi lanjutan: build produksi Next.js dan seluruh `npm run uji` lulus;
`npm run uji:ui` menguji 11 kasus komponen/menu/validasi crop. Lint menyisakan
satu peringatan img untuk pratinjau JPEG lokal. Pratinjau browser memakai
komponen tabel/navigasi asli dan data sintetis, bukan pengujian alur login,
GPS, kamera native, atau hasil Gemini pada perangkat nyata.

Tidak ada migrasi SQL atau perubahan native Android pada sesi redesign ini.
Cadangan lokal tidak menggantikan penyimpanan server. Revisi SPT yang sudah
terbit tetap disimpan lewat tombol Simpan resmi; jangan menganggap seluruh
isian formulir atau lampiran kamera sudah dicadangkan otomatis.
