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
- [ ] Verifikasi visual desktop, tablet, mobile browser, dan perangkat Android.
- [ ] Indikator hijau Sesi Tugas berdasarkan sesi server yang benar-benar berjalan.

## Tahap berikutnya

- [ ] Audit pemulihan draft dan isolasi formulir baru dari isi sebelumnya.
- [ ] Tinjau seluruh tabel agar nyaman sebagai kartu di mobile.
- [ ] Prioritaskan status dan tindakan di detail penugasan; lipat bagian tambahan.
- [ ] Verifikasi Panit/Pelaksana dan panel Kelola tidak menduplikasi daftar.
- [ ] Verifikasi arti pembilang/penyebut progress di kode sebelum mengganti label.
- [ ] Rapikan akses sekunder Riwayat dan LHP tanpa menambah duplikasi navigasi.
- [ ] Samakan ukuran modal, pemilih lokasi, scanner, dan crop; pertahankan crop manual.
- [ ] Perjelas tahapan proses scanner/Gemini dan kegagalan tiap tahap.
- [ ] Audit target sentuhan, fokus keyboard, kontras, layar pendek dan safe area.

Validasi kode tahap pertama: TypeScript dan 50 pengujian akses rute lulus.
Pengujian perangkat belum dilakukan; jangan menyatakan seluruh redesign selesai.
