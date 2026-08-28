# SiPANTAU — PRD Gabungan v0.7

**Sistem Pengawasan Anggota Terpadu · Unit I Subdit IV Ditreskrimsus Polda Jawa Barat**

Isi: PRD dasar 0.2 + Modul 6.1, 6.2, 6.3, 6.4, 6.6, 6.9, 6.10 (ketujuhnya final)
+ empat addendum + tiga berita acara pemeriksaan silang.
Modul 6.5, 6.7, dan 6.8 belum digali.

---

## Cara membaca berkas ini

**Urutan kekuatan, dari yang paling menang bila terjadi pertentangan:**

| Urutan | Bagian | Isi |
| --- | --- | --- |
| 1 | **Bagian W** | Koreksi Pemeriksaan Silang v0.7 |
| 2 | **Bagian J** | Koreksi Pemeriksaan Silang v0.6 |
| 3 | **Bagian I** | Koreksi Pemeriksaan Silang v0.5 |
| 4 | Bagian L | Modul 6.6 dan 6.9 |
| 5 | Bagian K | Modul 6.4 |
| 6 | Bagian H | Addendum 6.3-K |
| 7 | Bagian G | Addendum 6.3-T |
| 8 | Bagian F | Modul 6.3 |
| 9 | Bagian E | Addendum 6.2-T |
| 10 | Bagian D | Modul 6.2 |
| 11 | Bagian C | Addendum 6.1-T |
| 12 | Bagian B | Modul 6.1 |
| 13 | Bagian A | PRD dasar 0.2 |

Section 6.1, 6.2, 6.3, 6.4, 6.6, dan 6.9 pada Bagian A berstatus kerangka dan sudah
digantikan seluruhnya.

**Sebelum membangun apa pun, baca ketiga berita acara.** Pemeriksaan v0.5 menemukan
empat belas titik, v0.6 menemukan tujuh, v0.7 menemukan enam. Sepuluh di antaranya
memblokir, dan sebagian besar berupa kegagalan senyap yang tidak menimbulkan pesan galat.

**Pola yang berulang dan wajib diwaspadai.** Tiga kali sudah terjadi sesuatu dinyatakan
baru padahal sudah ada pada modul yang telah selesai: kolom `penugasan.ditutup_pada`
(T-13), nilai `akun_dinonaktifkan` (W-01), dan kelengkapan daftar jenis pemberitahuan
(W-02). BR-77 ditetapkan untuk menahannya.

**Penomoran yang berlaku.**

| Hal | Keadaan |
| --- | --- |
| Aturan global | BR-01 sampai BR-77. Aturan berikutnya mulai **BR-78** |
| Penggeseran | Addendum 6.2-T Bagian 0 menggeser penomoran aturan Modul 6.2. Bila membaca Bagian D, terjemahkan menurut tabel pada Bagian E Bagian 0.2 |
| Rujukan usang | Bagian G masih memakai satu rujukan berpenomoran lama; koreksinya pada Bagian I butir I.6 |
| Modul fungsional | Sepuluh. Modul 6.10 lahir dari Bagian H |
| Selesai | 6.1, 6.2, 6.3, 6.4, 6.6, 6.9, 6.10 |
| Belum digali | 6.5 Dashboard, 6.7 Foto & Kolase, 6.8 LHP Ringkas |
| Jenis pemberitahuan | Tujuh belas, daftar tertutup. Lihat Bagian L Bagian 8 dan koreksi Bagian W.2 |
| Sebab penutupan sesi | Tujuh, daftar tertutup dan final. Lihat Bagian K |

**Berkas tersendiri yang masih harus dibuat.** Pemasangan Pemberitahuan: tujuh belas
titik pemanggilan `buat_notifikasi` yang tersebar di Modul 6.2, 6.3, 6.4, dan 6.6.
Dikerjakan setelah seluruh modul selesai, sebelum penyatuan final. Lihat Bagian W.4.

---
---

# BERITA ACARA PEMERIKSAAN SILANG — v0.7

**Tanggal: 11 Agustus 2026 · Pemeriksaan atas Modul 6.6 dan 6.9 terhadap seluruh berkas yang berlaku**

Pemeriksaan menemukan enam titik. Dua memblokir, dan keduanya berjenis sama: **sesuatu yang dinyatakan baru padahal sudah ada**. Ini pengulangan ketiga dari pola yang sama — T-13 pada pemeriksaan v0.5, lalu berulang di sini dua kali sekaligus.

Seluruh koreksinya ada pada **Bagian W** di akhir dokumen ini. Bagian W memiliki kekuatan tertinggi, di atas Bagian J, Bagian I, dan seluruh berkas modul.

---

## Ringkasan temuan v0.7

| Kode | Temuan | Tingkat | Koreksi |
| --- | --- | --- | --- |
| W-01 | Modul 6.6 menyatakan menambah nilai `akun_dinonaktifkan` ke `sebab_penutupan`, padahal nilai itu sudah ada dan daftarnya sudah berstatus final | **Memblokir** | W.1 |
| W-02 | Daftar tertutup jenis pemberitahuan hanya mencakup tiga dari tujuh sebab penutupan Sesi Tugas | **Memblokir** | W.2 |
| W-03 | Q-05 menyusun ulang urutan langkah Fungsi Tepi `nonaktifkan-akun` tanpa memeriksa apakah Modul 6.4 sudah menetapkan pelaksananya | Penting | W.3 |
| W-04 | Sebelas butir calon addendum Modul 6.6 dan 6.9 menyentuh modul yang sudah dinyatakan selesai | Penting | W.4 |
| W-05 | Judul baku `spt_ditutup` menyesatkan karena dipakai untuk dua keadaan yang berbeda | Sedang | W.5 |
| W-06 | Pemberitahuan `sesi_menggantung` menyebut pemilik sesi sebagai penerima, padahal ia mungkin tidak dapat menerimanya | Ringan | W.6 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-68 sampai BR-76 | Bersih. BR tertinggi sebelumnya BR-67 |
| Penomoran KP-6.6 dan KP-6.9 | Bersih, belum pernah dipakai |
| Nama tabel `langganan_dorong` | Bersih |
| Nama fungsi `buat_notifikasi`, `penerima_pengawas_spt`, `penerima_pelaksana_spt` | Bersih |
| Nama pemicu `trg_notifikasi_hanya_tandai_baca` | Bersih, berawalan `trg_` sesuai Bagian I.8 |
| Amandemen BR-51 | Sah. Modul 6.4 juga mengamandemennya, dan keduanya menambah operasi berbeda tanpa bertabrakan |
| Penerapan BR-64 zona waktu | Diterapkan pada pengelompokan daftar pemberitahuan |
| Penerapan BR-66 hak akses | Diterapkan pada kedua tabel |
| Daftar Fungsi Tepi | Tidak bertambah. Modul 6.6 memakai dua yang sudah ada |
| Sisa `current_date` polos | Tidak ada yang baru. Yang tersisa pada berkas lama sudah tercakup Bagian J.3 |

---
---

# BAGIAN W — KOREKSI PEMERIKSAAN SILANG v0.7

**Status: [FINAL] · Kekuatan tertinggi dalam dokumen ini**

## W.1 Nilai `akun_dinonaktifkan` sudah ada — W-01

### Duduk perkaranya

Modul 6.6 butir Q-05 menutup dengan kalimat:

> Nilai `akun_dinonaktifkan` ditambahkan ke daftar `sebab_penutupan` pada tabel `sesi_tugas` yang difinalkan Modul 6.4.

Dan daftar langkah setelahnya memuat perintah nomor 2: *"Tambahkan nilai `akun_dinonaktifkan` ke daftar `sebab_penutupan` pada Modul 6.4."*

Modul 6.4 sudah memuat nilai itu. Daftarnya bahkan sudah berstatus **[FINAL]** dengan tujuh nilai lengkap beserta rujukan aturannya:

| Nilai | Kapan dipakai | Rujukan |
| --- | --- | --- |
| `manual` | Pemegang sesi menekan Selesai Tugas | — |
| `keluar_aplikasi` | Pemegang sesi keluar dari aplikasi saat sesi berjalan | BR-19 |
| `pindah_perangkat` | Akun yang sama masuk di perangkat lain | BR-16, BR-25 |
| `menggantung` | Lewat dua jam tanpa pembaruan posisi | BR-54 |
| `spt_ditutup` | Kanit menutup atau membatalkan SPT saat sesi berjalan | BR-38 |
| `dicabut_dari_spt` | Pemegang sesi dicabut dari daftar pelaksana saat sesi berjalan | BR-30 |
| `akun_dinonaktifkan` | Akun dinonaktifkan saat sesi berjalan | BR-20 |

### Mengapa ini memblokir, bukan sekadar mubazir

Bila daftar itu bertipe enum, menambahkan nilai yang sudah ada akan gagal seketika. Bila bertipe batasan pemeriksaan, penggantian daftar dengan versi Modul 6.6 yang lebih pendek akan **menghapus enam nilai lain** — dan penghapusan itu berhasil tanpa galat, lalu seluruh penutupan sesi selain `akun_dinonaktifkan` akan ditolak.

Kegagalannya berpindah dari saat pemasangan ke saat pemakaian, dan itu bentuk yang jauh lebih sulit ditelusuri.

### Ketetapan

> **Perbaikan pada Modul 6.6 butir Q-05.** Hapus kalimat tentang penambahan nilai `sebab_penutupan`. Nilai itu sudah ada dan daftarnya sudah final.
>
> **Perbaikan pada Modul 6.6 daftar langkah.** Hapus perintah nomor 2 seluruhnya.
>
> Daftar tujuh nilai pada Modul 6.4 adalah yang berlaku. Modul mana pun dilarang menambah, mengurangi, atau menyusun ulang daftar itu tanpa revisi tercatat sesuai kebiasaan yang berlaku bagi daftar tertutup.

Yang **tetap berlaku** dari Q-05 adalah pokok persoalannya, dan itu memang temuan sah: Addendum 6.1-T menetapkan langkah Fungsi Tepi `nonaktifkan-akun` tanpa menyebut penutupan Sesi Tugas. Yang keliru hanya cara menyelesaikannya. Lihat W.3.

### Pola yang berulang tiga kali

Ini kejadian ketiga dari jenis yang sama.

| Kejadian | Yang diklaim baru | Kenyataannya |
| --- | --- | --- |
| T-13, pemeriksaan v0.5 | Kolom `penugasan.ditutup_pada` | Sudah ada sejak Modul 6.2, dengan makna yang tidak sama |
| W-01, pemeriksaan ini | Nilai `akun_dinonaktifkan` | Sudah ada di Modul 6.4, daftarnya sudah final |
| W-02, pemeriksaan ini | Daftar jenis pemberitahuan yang dianggap lengkap | Hanya mencakup tiga dari tujuh sebab |

Sebabnya sama pada ketiganya: modul yang digali belakangan menetapkan sesuatu yang bersinggungan dengan modul yang sudah selesai, tanpa membuka kembali modul itu untuk memastikan. Pemeriksaan mandiri modul tidak akan pernah menangkapnya, karena tiap modul memeriksa dirinya sendiri.

> **BR-77.** Sebelum menyatakan sebuah kolom, nilai enum, tabel, atau daftar tertutup sebagai baru, wajib ditelusuri lebih dahulu apakah ia sudah ada pada modul yang telah dinyatakan selesai. Yang ditemukan sudah ada tidak boleh ditambahkan ulang, tidak boleh pula diganti daftarnya secara utuh — yang berlaku adalah daftar pada modul yang lebih dahulu menetapkannya.

## W.2 Daftar jenis pemberitahuan tidak menutup seluruh sebab — W-02

### Duduk perkaranya

Modul 6.9 menetapkan daftar tertutup enam belas jenis pemberitahuan, dan menyatakan tiga di antaranya menutup calon addendum Modul 6.4 butir 16. Ketiga jenis itu:

- `sesi_ditutup_keluar_aplikasi`
- `izin_lokasi_terputus`
- `sesi_menggantung`

Sebab penutupan Sesi Tugas ada **tujuh**. Empat sisanya tidak memiliki jenis pemberitahuan sama sekali.

| Sebab | Ada pemberitahuan? | Akibat |
| --- | --- | --- |
| `manual` | Tidak perlu | Ditutup pemiliknya sendiri, ia sudah tahu |
| `keluar_aplikasi` | Ya | — |
| `menggantung` | Ya | — |
| `pindah_perangkat` | **Tidak** | Sesi tertutup paksa, tidak seorang pun diberi tahu |
| `spt_ditutup` | Tidak langsung | Ada `spt_ditutup`, tetapi ia mengabarkan SPT ditutup, bukan bahwa sesinya ikut terhenti |
| `dicabut_dari_spt` | Tidak langsung | Ada `spt_dicabut`, dengan persoalan yang sama |
| `akun_dinonaktifkan` | Tidak bagi pemiliknya | Ia tidak dapat masuk lagi, sehingga pemberitahuan memang tidak sampai. Ini sah |

Yang paling perlu ditutup adalah **`pindah_perangkat`**. Keadaannya begini: seorang pelaksana sedang bertugas di lapangan, lalu akunnya dipakai masuk di perangkat lain — entah oleh dirinya sendiri di perangkat cadangan, entah oleh orang lain. Sesi di perangkat lama tertutup paksa, pelacakan berhenti, dan penanda posisinya hilang dari peta pengawas.

Tidak seorang pun diberi tahu. Pengawas melihat penanda lenyap tanpa keterangan, dan pemegang perangkat lama tidak tahu pelacakannya sudah berhenti sampai ia membuka aplikasi.

### Ketetapan

Daftar tertutup bertambah satu jenis menjadi **tujuh belas**.

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `sesi_ditutup_pindah_perangkat` | Sesi ditutup dengan sebab `pindah_perangkat` | Pemilik sesi, Kanit unit, Panit Penanggung Jawab | Ya | Sesi tugas berpindah perangkat |

Isinya menyebut kejadian tanpa menduga sebabnya, sesuai Prinsip 0.6: *"Sesi tugas pada perangkat sebelumnya berakhir karena akun ini dipakai masuk di perangkat lain."* Bukan *"Akun Anda dipakai orang lain"*, karena sistem tidak mengetahui siapa yang memakainya.

Batasan pemeriksaan pada tabel `notifikasi` diperbarui:

```sql
alter table public.notifikasi
  drop constraint chk_notifikasi_jenis;

alter table public.notifikasi
  add constraint chk_notifikasi_jenis check (jenis in (
    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
    'spt_dicabut', 'spt_ditutup',
    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
    'laporan_perlu_diperbaiki', 'laporan_disetujui',
    'sesi_ditutup_keluar_aplikasi', 'sesi_ditutup_pindah_perangkat',
    'izin_lokasi_terputus', 'sesi_menggantung',
    'akun_dinonaktifkan', 'kata_sandi_direset'
  ));
```

Untuk `spt_ditutup` dan `dicabut_dari_spt`, jenis yang sudah ada dinilai memadai dengan satu syarat: **isinya wajib menyebutkan bahwa Sesi Tugas yang sedang berjalan ikut berakhir**, bila memang ada sesi yang tertutup karenanya. Menambah jenis terpisah akan membuat seseorang menerima dua pemberitahuan untuk satu kejadian.

> **Kriteria tambahan KP-6.9-42.** Bila SPT ditutup atau seorang pelaksana dicabut sementara ia sedang dalam Sesi Tugas, maka isi pemberitahuan `spt_ditutup` atau `spt_dicabut` yang ia terima menyebutkan bahwa Sesi Tugasnya ikut berakhir dan Rutenya tersimpan.

> **Butir uji U-W-01.** Masuk di perangkat kedua sementara Sesi Tugas berjalan di perangkat pertama. Pemilik sesi, Kanit unit, dan Panit Penanggung Jawab masing-masing wajib menerima satu pemberitahuan.

## W.3 Pelaksana penutupan sesi saat akun dinonaktifkan — W-03

### Duduk perkaranya

Q-05 menyusun tujuh langkah Fungsi Tepi `nonaktifkan-akun`, dengan penutupan Sesi Tugas sebagai langkah ketiga.

Modul 6.4 sudah menetapkan bahwa `akun_dinonaktifkan` adalah salah satu dari empat sebab yang **ditutup sistem**, sehingga `ditutup_oleh` kosong. Yang belum ditetapkan di kedua berkas adalah **apa** yang benar-benar menjalankannya: Fungsi Tepi, pemicu pada tabel `users`, atau pekerjaan berjadwal.

Perbedaannya nyata. Bila diserahkan kepada Fungsi Tepi, penonaktifan yang terjadi lewat jalur lain — misalnya pembaruan langsung oleh Akun Pemeliharaan — tidak akan menutup sesinya. Bila diserahkan kepada pemicu, seluruh jalur tertutup dengan sendirinya.

### Ketetapan

Penutupan sesi dijalankan **pemicu pada tabel `users`**, bukan Fungsi Tepi.

```sql
create or replace function public.fn_tutup_sesi_saat_akun_nonaktif()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.aktif = true and new.aktif = false then
    update public.sesi_tugas
       set ditutup_pada    = now(),
           sebab_penutupan = 'akun_dinonaktifkan'
     where pengguna_id  = new.id
       and ditutup_pada is null;

    new.sedang_bertugas := false;
  end if;
  return new;
end;
$$;

create trigger trg_tutup_sesi_saat_akun_nonaktif
  before update on public.users
  for each row
  execute function public.fn_tutup_sesi_saat_akun_nonaktif();
```

Langkah ketiga pada daftar Q-05 karena itu **dihapus dari Fungsi Tepi**. Fungsi Tepi tetap mengerjakan enam langkah lainnya; penutupan sesi terjadi dengan sendirinya sebagai akibat pembaruan kolom `aktif`, dari jalur mana pun pembaruan itu datang.

Urutan pemicu perlu diperhatikan: nama `trg_tutup_sesi_saat_akun_nonaktif` mendahului nama pemicu lain pada tabel `users` menurut abjad, dan itu memang yang dikehendaki.

## W.4 Calon addendum menyentuh modul yang sudah selesai — W-04

Sebelas butir calon addendum Modul 6.6 dan 6.9 didaftar pada Bagian 12 berkas itu. Butir nomor 6 menyentuh Modul 6.2, 6.3, dan 6.4 yang ketiganya sudah dinyatakan selesai: enam belas titik pemanggilan `buat_notifikasi` tersebar di sana dan tidak satu pun sudah ditulis.

Butir 11 punya persoalan sama: pekerjaan berjadwal penutup sesi menggantung berada di Modul 6.4 dan belum memanggil pembuat pemberitahuan.

Ini bukan kekeliruan berkas itu — ia justru mencatatnya sendiri. Yang perlu ditetapkan adalah cara mengerjakannya, karena "menggali addendum Modul 6.9" tidak dapat menyentuh berkas modul lain.

> **Ketetapan.** Butir 6 dan 11 tidak dikerjakan sebagai addendum modul mana pun, melainkan sebagai **satu berkas tersendiri berjudul Pemasangan Pemberitahuan**, digarap setelah seluruh modul selesai dan sebelum penyatuan final. Berkas itu memuat tujuh belas titik pemanggilan lengkap dengan penerima, judul, dan isinya, disusun menurut modul asalnya.
>
> Sembilan butir lainnya tetap menjadi calon Addendum 6.6-T dan 6.9-T sebagaimana biasa.

Alasannya sederhana: pemanggilan pemberitahuan adalah pekerjaan lintas modul yang bentuknya baru dapat ditulis setelah seluruh kejadian pemicunya diketahui. Mengerjakannya sekarang berarti menuliskannya dua kali.

## W.5 Judul baku `spt_ditutup` menyesatkan — W-05

Jenis `spt_ditutup` dipicu oleh dua keadaan yang berbeda: status berpindah ke `selesai`, dan status berpindah ke `dibatalkan`. Judul bakunya satu, yaitu "Penugasan ditutup".

Bagi pelaksana, kedua keadaan itu sangat berbeda. Yang pertama berarti pekerjaannya selesai; yang kedua berarti pekerjaannya dihentikan. Judul yang sama untuk keduanya membuat pelaksana harus membuka rinciannya untuk mengetahui mana yang terjadi.

> **Ketetapan.** Judul `spt_ditutup` ditentukan saat pembuatan berdasarkan status akhirnya: **"Penugasan selesai"** bila berpindah ke `selesai`, dan **"Penugasan dibatalkan"** bila berpindah ke `dibatalkan`. Nilai `jenis` tetap satu, karena keduanya membuka layar yang sama dan dapat dimatikan bersama.

Ini pengecualian atas AM-6.9-03 yang menetapkan judul diambil dari daftar baku. Pengecualiannya sempit dan dinyatakan: judul boleh dipilih dari dua kemungkinan yang keduanya sudah baku, bukan disusun bebas oleh pemanggil.

## W.6 Penerima `sesi_menggantung` — W-06

Daftar menyebut penerima `sesi_menggantung` adalah pemilik sesi dan Kanit unit.

Sesi menggantung terjadi karena dua jam berlalu tanpa pembaruan posisi. Penyebab yang paling mungkin adalah perangkatnya mati, kehabisan daya, atau kehilangan sinyal — dan pada ketiganya, pemberitahuan tidak akan sampai saat itu juga.

Ini tidak salah. Pemberitahuan tetap menunggu di daftar dan terbaca saat ia membuka aplikasi kembali, dan justru itu gunanya: ia perlu tahu bahwa sesinya sudah ditutup sistem, agar tidak mengira masih terlacak.

> **Ketetapan.** Penerima tetap sebagaimana tertulis. Ditambahkan satu catatan pada Bagian 8 bahwa pemberitahuan ini memang diperkirakan sampai terlambat, dan itu perilaku yang dikehendaki. Ditambahkan pula **Panit Penanggung Jawab** sebagai penerima, karena ia yang memantau langsung dan penanda posisi yang lenyap dari peta adalah urusannya.

---

## W.7 Ringkasan perubahan atas Modul 6.6 dan 6.9

| Letak | Perubahan |
| --- | --- |
| Q-05, kalimat penutup | Dihapus. Nilai `akun_dinonaktifkan` sudah ada |
| Q-05, langkah ketiga Fungsi Tepi | Dipindahkan ke pemicu pada tabel `users` |
| Daftar langkah, perintah nomor 2 | Dihapus |
| Bagian 8, jumlah jenis | Enam belas menjadi **tujuh belas** |
| Bagian 8, jenis baru | `sesi_ditutup_pindah_perangkat` |
| Bagian 8, judul `spt_ditutup` | Dua kemungkinan, dipilih menurut status akhir |
| Bagian 8, penerima `sesi_menggantung` | Ditambah Panit Penanggung Jawab |
| Bagian 12, butir 6 dan 11 | Dipindahkan ke berkas Pemasangan Pemberitahuan tersendiri |
| Section 5.20, batasan `chk_notifikasi_jenis` | Diperbarui dengan tujuh belas nilai |
| Kriteria baru | KP-6.9-42 |
| Aturan baru | BR-77 |

## W.8 Butir uji tambahan

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-W-01 | Masuk di perangkat kedua saat Sesi Tugas berjalan di perangkat pertama | Tiga pihak menerima pemberitahuan `sesi_ditutup_pindah_perangkat` |
| U-W-02 | Nonaktifkan akun lewat pembaruan langsung, bukan lewat Fungsi Tepi | Sesi tetap tertutup, membuktikan pemicu yang bekerja |
| U-W-03 | Periksa daftar `sebab_penutupan` setelah seluruh berkas ditempel | Tetap tujuh nilai, tidak berkurang |
| U-W-04 | Tutup SPT yang punya pelaksana sedang bersesi | Isi pemberitahuan menyebut sesinya ikut berakhir |
| U-W-05 | Batalkan SPT | Judul pemberitahuan berbunyi Penugasan dibatalkan, bukan Penugasan ditutup |

---

## Penutup berita acara v0.7

Dua temuan memblokir, dan keduanya adalah pengulangan pola yang sudah pernah ditemukan sebelumnya: sesuatu dinyatakan baru padahal sudah ada. Kejadian pertama pada pemeriksaan v0.5, dan kini dua sekaligus.

Yang membedakan W-01 dari T-13 adalah bentuk kegagalannya. T-13 akan gagal berisik, karena basis data menolak kolom yang sudah ada. W-01 dapat gagal senyap: bila daftar tertutup diganti dengan versi yang lebih pendek, penggantiannya berhasil tanpa galat, dan enam nilai lain lenyap. Baru ketika seseorang menekan Selesai Tugas, penutupan sesi ditolak — dan pada saat itu tidak ada yang menghubungkannya dengan pemasangan yang berlangsung dua minggu sebelumnya.

BR-77 ditetapkan untuk menahan pola ini. Tetapi aturan saja tidak cukup, karena ketiga kejadian sebelumnya juga terjadi meski Prinsip 0.1 sudah melarang mengarang asumsi. Yang benar-benar menangkapnya adalah pemeriksaan silang yang dijalankan ulang setiap kali ada berkas baru, dan itu perlu tetap dikerjakan sampai penyatuan final.


---
---

# BERITA ACARA PEMERIKSAAN SILANG — v0.6

**Tanggal: 2 Agustus 2026 · Pemeriksaan atas Modul 6.4 terhadap seluruh berkas yang sudah berlaku**

Modul 6.4 masuk dengan pemeriksaan mandiri dan pemeriksaan tabrakan yang sudah dikerjakan sendiri di dalamnya, dan dua di antaranya menangkap kekeliruan yang **luput dari pemeriksaan silang v0.5**. Keduanya dicatat di bawah sebagai pengakuan, bukan sekadar keterangan.

Pemeriksaan ini menemukan tujuh titik yang belum tertutup. Satu di antaranya membalik penilaian sebuah temuan Modul 6.4 sendiri setelah diverifikasi terhadap dokumentasi layanan, dan satu lagi memperluas jangkauan sebuah aturan yang baru lahir di Modul 6.4 tetapi belum diterapkan ke seluruh tempat yang melanggarnya.

Seluruh koreksinya ada pada **Bagian J** di akhir dokumen ini. Bagian J memiliki kekuatan tertinggi, di atas Bagian I dan di atas seluruh berkas modul.

---

## Yang ditangkap Modul 6.4 dan luput dari pemeriksaan v0.5

| Kode | Yang luput | Akibat bila tidak tertangkap |
| --- | --- | --- |
| P-01 | Tiga kebijakan akses baris Addendum 6.1-T menyebut `laporan_harian.anggota_id`, kolom yang sudah dicabut Modul 6.2 | Pemeriksaan v0.5 menyisir tabrakan nama kolom pada `foto_dokumentasi` tetapi tidak pada `laporan_harian`. Ketiga kebijakan akan ditolak saat dibuat |
| P-16 | Bentuk `v_belum_lapor` pada Bagian I.2 memakai `direkam_pada::date = current_date` tanpa zona waktu | Bagian I.2 disusun pemeriksaan v0.5 sendiri. Di server berzona UTC, batas hari bergeser tujuh jam: laporan pukul 06.00 WIB terhitung hari kemarin, pukul 23.00 WIB terhitung hari besok. Salah tiap hari, tanpa satu pun galat |

Keduanya berjenis sama dengan yang dicari pemeriksaan v0.5, dan tetap lolos. Ini menegaskan bahwa pemeriksaan silang bukan langkah yang dijalankan sekali lalu selesai — ia perlu diulang setiap kali ada berkas baru, termasuk terhadap hasil pemeriksaan sebelumnya.

---

## Ringkasan temuan v0.6

| Kode | Temuan | Tingkat | Koreksi |
| --- | --- | --- | --- |
| V-01 | P-17 menggambarkan gejala kegagalan secara keliru; terverifikasi sebaliknya terhadap dokumentasi layanan | Penting | J.1 |
| V-02 | Daftar tabel pada P-17 salah hitung, kurang satu tabel, dan tidak menyinggung tampilan sama sekali | **Memblokir** | J.2 |
| V-03 | BR-64 dinyatakan tetapi hanya satu dari empat tempat yang melanggarnya diperbaiki | **Memblokir senyap** | J.3 |
| V-04 | P-10 muncul pada Riwayat Koreksi tanpa seksi di Bagian 0 | Sedang | J.4 |
| V-05 | P-11 sampai P-15 dilewati tanpa keterangan | Ringan | J.5 |
| V-06 | Klaim jumlah temuan tidak konsisten antara pembuka dan Riwayat Koreksi | Ringan | J.6 |
| V-07 | Tampilan tidak memiliki hak baca eksplisit, kecuali satu | **Memblokir** | J.7 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-54 sampai BR-67 | Tidak bertabrakan. BR tertinggi sebelumnya BR-53 |
| Amandemen BR-51 | Sah. BR-51 mensyaratkan penambahan lewat revisi PRD tercatat, dan Modul 6.4 menyatakan dirinya sebagai revisi itu |
| Amandemen BR-59 dan BR-62 | Sah. Keduanya lahir di Modul 6.4 sendiri |
| Nama tabel `posisi_terkini` dan `titik_penanda` | Tidak menabrak nama mana pun pada v0.5 |
| Penomoran KP-6.4-01 sampai KP-6.4-72 | Tidak bertabrakan |
| Keputusan memisahkan `posisi_terkini` dari `location_logs` | Beralasan. Tabel dengan pertumbuhan tercepat tidak dijadikan sumber pembacaan waktu nyata |

---
---

# BAGIAN J — KOREKSI PEMERIKSAAN SILANG v0.6

**Status: [FINAL] · Kekuatan tertinggi dalam dokumen ini**

## J.1 Gejala kegagalan pada P-17 — V-01

### Duduk perkaranya

P-17 menetapkan BR-66 tentang pendaftaran tabel ke Data API. Fakta dasarnya benar dan sudah diverifikasi: perubahan itu menjadi bawaan bagi project baru sejak 30 Mei 2026 dan diberlakukan pada seluruh project pada 30 Oktober 2026.

Yang keliru adalah penggambaran gejalanya. P-17 menulis bahwa tabel yang belum didaftarkan *"menjawab permintaan klien dengan hasil kosong atau tidak ditemukan — persis seperti tabel yang aturan akses barisnya menolak"*, lalu menyimpulkan pembangun akan memeriksa kebijakan akses baris berjam-jam tanpa hasil.

Dokumentasi layanan menyatakan sebaliknya. Bila hak akses tidak ada, lapisan Data API mengembalikan **galat yang jelas, bukan kegagalan senyap**, disertai petunjuk yang menyebutkan peran mana yang kurang hak apa, lengkap dengan bentuk perintah pemberian hak yang dibutuhkan.

### Mengapa koreksi ini penting, bukan sekadar meluruskan kalimat

Penilaian yang keliru mengubah cara menanganinya. P-17 memerintahkan: *"Kegagalan membaca sebuah tabel baru wajib diperiksa terhadap pendaftaran ini lebih dahulu, sebelum aturan akses baris dicurigai."*

Perintah itu lahir dari anggapan bahwa kedua kegagalan terlihat sama. Karena kenyataannya tidak sama — yang satu bergalat jelas dengan petunjuk, yang lain diam — perintah itu justru menyesatkan ke arah berlawanan. Pembangun yang menemui hasil kosong tanpa galat akan membuang waktu memeriksa hak akses, padahal hasil kosong tanpa galat justru gejala khas aturan akses baris yang menolak.

### Ketetapan

> **BR-66 (bentuk yang berlaku).** Setiap tabel dan tampilan yang perlu dibaca atau ditulis klien wajib diberi hak akses secara eksplisit sebagai bagian dari pernyataan yang sama dengan pembuatannya, bukan sebagai langkah terpisah yang dikerjakan belakangan. Pemberian hak dan penyusunan aturan akses baris adalah dua lapisan berbeda dan keduanya wajib ada.
>
> **Cara membedakan dua kegagalan yang mirip:**
>
> | Gejala | Sebab | Tempat memeriksa |
> | --- | --- | --- |
> | Galat disertai petunjuk yang menyebutkan peran dan hak yang kurang | Hak akses belum diberikan | Pernyataan pemberian hak |
> | Jawaban berhasil tetapi kosong, tanpa galat | Aturan akses baris menolak seluruh baris | Kebijakan akses baris |
> | Galat tabel tidak ditemukan | Tabel memang belum ada, atau namanya keliru | Skema |
>
> Ketiganya berbeda dan tidak boleh disamakan.

Tingkat P-17 diturunkan dari **memblokir operasional** menjadi **langkah pembangunan biasa**. Ia tetap wajib dikerjakan, tetapi kelalaiannya akan ketahuan pada percobaan pertama, bukan setelah berjam-jam.

Butir uji U-6.4-05 tetap berlaku dengan satu penyesuaian: yang dicari bukan tabel yang menjawab kosong, melainkan tabel yang **bergalat**. Tabel yang menjawab kosong justru menunjukkan hak aksesnya sudah ada dan yang bekerja adalah aturan akses baris.

## J.2 Daftar tabel pada P-17 — V-02

### Duduk perkaranya

Tiga kekeliruan pada satu daftar.

**Pertama, hitungannya salah.** Tertulis "Sebelas tabel yang wajib didaftarkan", lalu tujuh belas nama disebutkan.

**Kedua, satu tabel hilang.** `foto_dokumentasi` tidak ada dalam daftar. Tabel itu sudah dipakai sejak Modul 6.3 — setiap foto yang diunggah pelaksana menyisipkan satu baris ke sana dari sisi klien. Tanpa hak akses, seluruh pengunggahan foto gagal. Ini yang membuat temuan ini memblokir, bukan sekadar tidak rapi.

**Ketiga, tampilan tidak disinggung sama sekali.** Lihat J.7.

### Ketetapan

Daftar yang berlaku, disusun menurut peran yang membutuhkannya. Peran `anon` tidak pernah diberi hak apa pun pada tabel mana pun, karena SiPANTAU tidak memiliki jalur tanpa masuk.

**Tabel yang dibaca dan ditulis klien**

```sql
grant select, insert, update on public.laporan_harian    to authenticated;
grant select, insert, update on public.catatan_laporan   to authenticated;
grant select, insert         on public.foto_dokumentasi  to authenticated;
grant select, insert         on public.location_logs     to authenticated;
grant select, insert, update on public.sesi_tugas        to authenticated;
grant select, insert, update on public.penugasan         to authenticated;
grant select, insert, update on public.penugasan_dasar   to authenticated;
grant select, insert, update on public.penugasan_lokasi  to authenticated;
grant select, insert, update on public.penugasan_pelaksana to authenticated;
grant select, insert, update on public.penugasan_panit   to authenticated;
grant select, update         on public.notifikasi        to authenticated;
grant select, update         on public.users             to authenticated;
```

**Tabel yang hanya dibaca klien**

```sql
grant select on public.unit           to authenticated;
grant select on public.jejak_audit    to authenticated;
grant select on public.laporan_versi  to authenticated;
grant select on public.catatan_versi  to authenticated;
grant select on public.posisi_terkini to authenticated;
```

**Tabel yang sengaja tidak diberi hak apa pun**

```sql
-- Tidak ada pernyataan pemberian hak untuk kedua tabel ini.
-- Keduanya hanya disentuh fungsi ber-security definer dari dalam basis data.
--   public.pembatasan_laju
--   public.titik_penanda
--   public.perangkat_masuk
```

`perangkat_masuk` ditambahkan ke kelompok terakhir, berbeda dari daftar asli P-17. Penulisannya seluruhnya lewat Fungsi Tepi dan pemicu, dan tidak ada satu pun layar yang membacanya langsung. Membukanya berarti memberi tahu setiap pengguna perangkat apa saja yang dipakai rekan-rekannya, tanpa ada yang membutuhkannya.

Tidak ada `delete` pada satu tabel pun. Seluruh penghapusan berjalan lewat fungsi ber-`security definer` yang memeriksa syaratnya sendiri, sesuai BR-12 dan BR-32.

> **Butir uji U-J-01.** Unggah satu foto sebagai pelaksana pada basis data yang seluruh hak aksesnya sudah dipasang. Bila gagal dengan galat hak akses pada `foto_dokumentasi`, berarti daftar ini belum diterapkan penuh.

## J.3 Jangkauan BR-64 — V-03

### Duduk perkaranya

Ini temuan terpenting pada pemeriksaan v0.6.

P-16 menetapkan BR-64: setiap perhitungan yang menyangkut hari kalender wajib dilakukan pada zona waktu `Asia/Jakarta`. Aturannya benar dan alasannya kuat. Tetapi P-16 hanya memperbaiki **satu** tempat, yaitu `v_belum_lapor`.

Penelusuran atas seluruh berkas yang berlaku menemukan **tiga tempat lain** yang melanggar aturan yang sama:

| Tempat | Bentuk yang melanggar | Berkas asal |
| --- | --- | --- |
| `kerja_periksa_lewat_batas` | `p.tanggal_batas < current_date` | Addendum 6.2-T Bagian 1.5 |
| `penugasan_tampil`, kolom `lewat_batas` | `p.tanggal_batas < current_date` | Addendum 6.2-T Bagian 7.2 |
| `penugasan_tampil`, kolom `hari_terlampaui` | `current_date - p.tanggal_batas` | Addendum 6.2-T Bagian 7.2 |

Ketiganya membandingkan kolom bertipe tanggal dengan `current_date`, dan `current_date` mengikuti zona waktu basis data. Pada server berzona UTC, hasilnya bergeser tujuh jam.

Akibatnya nyata dan senyap sekaligus. Sebuah SPT yang batas waktunya hari ini akan **ditandai lewat batas sejak pukul 17.00 WIB kemarin**, karena pada saat itu server sudah berganti tanggal. Kanit melihat penanda merah pada penugasan yang sebenarnya masih punya sisa waktu satu hari penuh. Pemberitahuan lewat batas juga terkirim sehari lebih awal. Tidak ada galat, tidak ada yang mencurigai apa pun — angkanya sekadar meleset satu hari, setiap hari.

Aturan yang dinyatakan tetapi tidak diterapkan ke seluruh tempat yang melanggarnya adalah bentuk kegagalan tersendiri, dan mudah terjadi justru ketika aturannya lahir di modul yang berbeda dari tempat pelanggarannya.

### Ketetapan

Ketiga tempat diperbaiki. Bentuk yang berlaku bagi `penugasan_tampil`, menggantikan bentuk pada Addendum 6.2-T Bagian 7.2:

```sql
create or replace view public.penugasan_tampil
with (security_invoker = on)
as
select p.*,
       (p.tanggal_batas is not null
        and p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
        and p.status in ('baru', 'berjalan', 'bermasalah'))      as lewat_batas,
       ((now() at time zone 'Asia/Jakarta')::date - p.tanggal_batas)
                                                                 as hari_terlampaui
  from public.penugasan p;

grant select on public.penugasan_tampil to authenticated;
```

Bentuk yang berlaku bagi `kerja_periksa_lewat_batas`, menggantikan klausa penyaring pada Addendum 6.2-T Bagian 1.5:

```sql
     where p.tanggal_batas < (now() at time zone 'Asia/Jakarta')::date
       and p.status in ('baru', 'berjalan', 'bermasalah')
       and p.lewat_batas_diberitahukan_pada is null
```

> **Perluasan BR-64.** Aturan ini berlaku surut terhadap seluruh berkas yang sudah dinyatakan selesai, bukan hanya terhadap modul yang lahir sesudahnya. Sebelum sesi coding dimulai, seluruh kemunculan `current_date` dan `now()::date` pada dokumen wajib ditelusuri dan dipastikan sudah didahului `at time zone 'Asia/Jakarta'`. Empat tempat sudah ditemukan dan diperbaiki; penelusuran tetap wajib diulang setiap kali modul baru masuk.

> **Butir uji U-J-02.** Setel jam sistem ke pukul 18.00 WIB, buat SPT yang batas waktunya hari ini, lalu buka daftar penugasan. Penanda Lewat Batas **tidak boleh** muncul. Bila muncul, salah satu dari ketiga tempat di atas belum diperbaiki.

## J.4 Seksi P-10 yang hilang — V-04

Riwayat Koreksi Modul 6.4 memuat baris P-10 berbunyi *"BR-61 tidak dapat ditegakkan lewat hak akses per kolom → tabel `titik_penanda` terpisah"*. Tidak ada seksi P-10 pada Bagian 0.

Substansinya tidak hilang — tabel `titik_penanda` berdiri lengkap pada Section 5.22. Yang hilang adalah penjelasan mengapa keputusan itu diambil, yaitu bahwa Postgres tidak dapat membatasi hak baca sampai tingkat kolom dengan cara yang dibutuhkan BR-61, sehingga kolom yang lingkup bacanya berbeda harus dipisahkan ke tabel tersendiri.

> **Ketetapan.** Alasan itu dicatat sebagai pengantar Section 5.22, bukan sebagai seksi P-10 baru. Baris P-10 pada Riwayat Koreksi tetap dipertahankan karena keputusannya memang diambil, dengan keterangan bahwa uraiannya berada di Section 5.22.

## J.5 P-11 sampai P-15 — V-05

Penomoran melompat dari P-10 ke P-16 tanpa keterangan. Dari susunannya, lompatan itu tampak disengaja untuk memisahkan temuan sebelum penggalian dari temuan sesudahnya.

> **Ketetapan.** Lompatan dipertahankan, dan sebabnya dicatat pada pengantar Bagian 0: P-01 sampai P-10 adalah temuan sebelum penggalian, P-16 sampai P-22 adalah temuan sesudahnya. Nomor P-11 sampai P-15 tidak pernah dipakai dan tidak boleh dipakai kelak, sesuai kebiasaan yang sudah berlaku bagi kode BR dan KP.

## J.6 Klaim jumlah temuan — V-06

Pembuka menyebut enam belas temuan, yang cocok dengan jumlah seksi. Riwayat Koreksi memuat tujuh belas baris karena memuat P-10 yang tidak berseksi.

> **Ketetapan.** Jumlah yang berlaku adalah **tujuh belas temuan**, karena P-10 adalah keputusan yang benar-benar diambil dan berbuah tabel tersendiri. Pembuka dan Riwayat Revisi diperbaiki dari "enam belas" menjadi "tujuh belas". Jumlah seksi tetap enam belas, dan itu bukan ketidaksesuaian setelah J.4 menjelaskan letaknya.

## J.7 Hak baca tampilan — V-07

### Duduk perkaranya

P-17 menyusun daftar tabel yang wajib diberi hak akses, tetapi tidak menyinggung tampilan sama sekali.

Tampilan adalah relasi, sama seperti tabel, dan hak bacanya diatur dengan cara yang sama. Penelusuran atas seluruh berkas menemukan hanya **satu** tampilan yang memiliki pernyataan pemberian hak, yaitu `rekap_laporan_tim` pada Bagian I.A.4. Lima tampilan lain tidak memilikinya.

Akibatnya seragam: seluruh layar yang membaca tampilan itu gagal, dan kegagalannya bergalat jelas sesuai J.1 — jadi akan ketahuan cepat, tetapi tetap memblokir sampai diperbaiki.

### Ketetapan

```sql
grant select on public.penugasan_tampil     to authenticated;
grant select on public.v_belum_lapor        to authenticated;
grant select on public.rekap_laporan_tim    to authenticated;  -- sudah ada di Bagian I
grant select on public.kesehatan_sistem     to authenticated;
grant select on public.kesehatan_penjadwal  to authenticated;
```

Ditambah tampilan apa pun yang lahir dari Modul 6.4 untuk peta dan rute.

**Dua tampilan kesehatan diberi hak kepada seluruh peran terautentikasi, bukan hanya Kasubdit.** Ini disengaja dan bukan kelalaian. Pembatasan siapa yang boleh melihatnya ditegakkan di lapisan antarmuka menurut BR-11 dan di lapisan aturan akses baris tabel di baliknya, bukan dengan menahan hak baca tampilannya. Menahan hak baca akan menghasilkan galat yang membingungkan bagi peran lain, sedangkan menyembunyikan menunya sudah cukup dan sesuai dengan cara seluruh sistem ini bekerja.

Perlu dicatat satu batas yang tidak dapat dihindari: `kesehatan_penjadwal` membaca skema `cron`, dan peran terautentikasi tidak memiliki hak baca ke sana. Tampilan itu karena itu akan menjawab kosong bagi siapa pun, termasuk Kasubdit, kecuali hak bacanya diberikan secara khusus atau tampilan itu diubah menjadi fungsi ber-`security definer`.

> **Ketetapan tambahan.** `kesehatan_penjadwal` diubah dari tampilan menjadi fungsi ber-`security definer` yang memeriksa sendiri bahwa pemanggilnya berperan Kasubdit. Ini satu-satunya cara membacanya tanpa membuka skema `cron` kepada seluruh pengguna. Bentuk akhirnya ditetapkan saat Modul 6.5 digali, karena di sanalah ia ditampilkan.

Dicatat sebagai butir tertunda pada Modul 6.5.

---

## J.8 Urutan pengerjaan yang diperbarui

Menggantikan bagian yang bertumpang tindih pada Bagian I.15.

| No | Langkah | Rujukan |
| --- | --- | --- |
| 1 | Pasang PostGIS dan pg_cron, buat wadah penyimpanan `dokumentasi` | Bagian I.9, A.5 |
| 2 | Kerjakan seluruh temuan Bagian 0 Modul 6.4, terutama P-01, P-16, dan P-17 | Modul 6.4 |
| 3 | Bangun seluruh tabel dengan pemberian hak akses **di dalam pernyataan yang sama** | J.1, J.2 |
| 4 | Telusuri seluruh kemunculan `current_date` pada dokumen, pastikan sudah berzona `Asia/Jakarta` | J.3 |
| 5 | Pasang seluruh batasan pemeriksaan dan indeks unik parsial | Bagian I, Addendum 6.2-T |
| 6 | Pasang seluruh fungsi dan pemicu dalam bentuk yang sudah dikeraskan | Bagian I.3, I.4, I.5 |
| 7 | Aktifkan aturan akses baris dan susun kebijakannya, diuji dengan empat akun berbeda peran | Section 9 |
| 8 | Bangun seluruh tampilan dengan `security_invoker` yang dinyatakan tegas dan hak bacanya | J.7, Bagian I.2 |
| 9 | Pasang pekerjaan berjadwal | Addendum 6.2-T Bagian 1 |
| 10 | Bangun sisi aplikasi | Seluruh modul |

## J.9 Butir uji tambahan

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-J-01 | Unggah foto sebagai pelaksana | Hak akses `foto_dokumentasi` sudah diberikan |
| U-J-02 | Setel jam ke 18.00 WIB, buat SPT berbatas hari ini, buka daftar | Penanda Lewat Batas tidak muncul |
| U-J-03 | Baca kelima tampilan sebagai Anggota | Tidak ada yang bergalat hak akses |
| U-J-04 | Jalankan pekerjaan lewat batas pada pukul 18.00 WIB | Tidak ada pemberitahuan terkirim untuk SPT yang batasnya hari ini |
| U-J-05 | Coba baca `pembatasan_laju` dan `titik_penanda` dari klien | Keduanya bergalat hak akses, bukan menjawab kosong |

---

## Penutup berita acara v0.6

Tiga temuan memblokir. Satu di antaranya, jangkauan BR-64, berjenis yang belum pernah muncul pada pemeriksaan sebelumnya: bukan aturan yang keliru, bukan pula aturan yang bertabrakan, melainkan **aturan yang benar tetapi tidak diterapkan ke seluruh tempat yang melanggarnya**. Ini mudah terjadi ketika aturan lahir di satu modul sedangkan pelanggarannya berada di modul lain yang sudah dinyatakan selesai, dan tidak akan tertangkap oleh pemeriksaan mandiri modul mana pun — karena tiap modul memeriksa dirinya sendiri, bukan yang di belakangnya.

Satu temuan lain membalik penilaian Modul 6.4 sendiri setelah diverifikasi terhadap dokumentasi layanan. Ini pantas dicatat bukan karena keliru menilai adalah hal buruk, melainkan karena penilaian yang keliru tentang **bagaimana sesuatu gagal** menghasilkan perintah penanganan yang menyesatkan ke arah berlawanan. Menuliskan gejala secara tepat sama pentingnya dengan menemukan celahnya.

Dan dua temuan Modul 6.4 sendiri, P-01 dan P-16, lolos dari pemeriksaan silang v0.5 yang sudah dijalankan dengan sengaja mencari jenis yang sama persis. Kesimpulannya bukan bahwa pemeriksaan itu gagal, melainkan bahwa satu putaran tidak pernah cukup. Setiap berkas baru mewajibkan putaran baru, termasuk terhadap hasil putaran sebelumnya.


---
---

# BERITA ACARA PEMERIKSAAN SILANG — v0.5

**Tanggal: 2 Agustus 2026 · Pemeriksaan atas delapan berkas penyusun PRD**

Pemeriksaan dilakukan atas seluruh berkas yang menyusun dokumen ini, mencakup penomoran aturan, penamaan tabel dan kolom, urutan pemicu basis data, deklarasi tampilan, dan pengerasan fungsi. Empat belas titik ditemukan. Satu di antaranya gugur setelah diverifikasi, lima memblokir pembangunan, dan delapan sisanya perlu diperbaiki sebelum modul berikutnya digali.

Seluruh koreksinya ada pada **Bagian I** di akhir dokumen ini, dan Bagian I memiliki kekuatan tertinggi bila bertentangan dengan bagian mana pun di atasnya.

---

## Ringkasan temuan

| Kode | Temuan | Tingkat | Koreksi |
| --- | --- | --- | --- |
| T-01 | Nama kolom berkas foto bertabrakan antara PRD dasar dan Addendum 6.3-T | **Memblokir** | I.1 |
| T-02 | Tampilan `v_belum_lapor` tidak mendeklarasikan `security_invoker` sehingga melewati seluruh aturan akses baris | **Memblokir** | I.2 |
| T-03 | Fungsi `fn_minta_perbaikan` akan gagal saat dipanggil Panit karena berjalan dengan hak pemanggil | **Memblokir** | I.3 |
| T-04 | Delapan fungsi Addendum 6.3-T tidak mengunci `search_path` | **Memblokir** | I.4 |
| T-05 | Daftar kolom beku pada prosa tidak sama dengan yang benar-benar ditegakkan kode | Penting | I.5 |
| T-06 | Addendum 6.3-T merujuk BR-24 dengan penomoran sebelum penggeseran | Penting | I.6 |
| T-07 | Rujukan BR-21 pada KP-6.3-49 | **Gugur** | I.7 |
| T-08 | Penamaan pemicu Addendum 6.3-K tidak seragam sehingga urutan jalannya tidak sebagaimana dimaksud | Sedang | I.8 |
| T-09 | Wadah penyimpanan berkas foto belum dideklarasikan di mana pun | Sedang | I.9 |
| T-10 | Nama kolom waktu pembuatan belum dibakukan padahal sudah dirujuk fungsi | Sedang | I.10 |
| T-11 | Jumlah modul berubah menjadi sepuluh, belum tercermin pada Checklist | Ringan | I.11 |
| T-12 | Pemeriksaan baris kosong pada fungsi hitung lokasi memakai bentuk yang rapuh | Ringan | I.12 |
| T-13 | Addendum 6.3-K menambahkan kolom `penugasan.ditutup_pada` padahal sudah ada sejak Modul 6.2, dengan makna yang tidak sama | **Memblokir** | I.13 |
| T-14 | Kolom antrean pada `laporan_harian` ditulis sebagai `ALTER TABLE`, bertentangan dengan urutan pembangunan yang menyatukannya sejak awal | Ringan | I.14 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-01 sampai BR-53 | Tidak ada tabrakan tersisa. Penggeseran pada Addendum 6.2-T sudah menyelesaikan bentrokan lama, dan BR-38 sampai BR-53 tidak beririsan |
| Penomoran KP tiap modul | Tidak ada tabrakan. KP-6.3 berhenti di 64 lalu dilanjut 65 oleh Addendum 6.3-K |
| Urutan pemicu `BEFORE INSERT` pada `laporan_harian` | Aman. Ketiga pemicu Addendum 6.3-T saling bebas |
| Tampilan `penugasan_tampil` dan `kesehatan_penjadwal` | Keduanya sudah `security_invoker = on` sesuai BR-37 |
| Aturan Antrean Luring terhadap aturan satu perangkat per akun | Tidak bertabrakan. Pemisahan dua kolom perangkat pada Addendum 6.3-K menyelesaikannya |

---
---

# BAGIAN I — KOREKSI HASIL PEMERIKSAAN SILANG

**Status: [FINAL] · Kekuatan tertinggi dalam dokumen ini**

## I.1 Nama kolom berkas foto — T-01

### Duduk perkaranya

Section 5.6 PRD dasar menamai kolom penunjuk berkas `berkas_path`. Addendum 6.3-T Celah 9 memakai `jalur_berkas` pada fungsi pembersih foto yatim. Keduanya menunjuk hal yang sama dengan nama berbeda.

Akibatnya bukan sekadar tidak rapi. Fungsi `fn_bersihkan_foto_yatim` menyaring dengan `name NOT IN (SELECT jalur_berkas FROM foto_dokumentasi)`. Bila kolom itu tidak ada, fungsi gagal setiap kali dijalankan, dan karena ia berjalan sebagai pekerjaan berjadwal tengah malam, kegagalannya tidak akan terlihat siapa pun. Berkas yatim menumpuk diam-diam.

### Ketetapan

Nama yang berlaku adalah **`berkas_path`**, karena ia lebih dahulu ada dan sudah terdaftar pada model data induk. Perbaikan pada Addendum 6.3-T Celah 9:

```sql
create or replace function public.fn_bersihkan_foto_yatim()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects
   where bucket_id = 'dokumentasi'
     and created_at < now() - interval '24 hours'
     and name not in (
       select f.berkas_path
         from public.foto_dokumentasi f
        where f.berkas_path is not null
     );
end;
$$;
```

Penambahan `where f.berkas_path is not null` bukan sekadar kehati-hatian. Dalam SQL, `not in` terhadap kumpulan yang memuat satu saja nilai kosong akan menghasilkan kumpulan hampa — artinya **tidak satu pun berkas terhapus**, tanpa galat apa pun. Ini kegagalan senyap kedua yang tersembunyi di dalam fungsi yang sama.

## I.2 Tampilan `v_belum_lapor` — T-02

### Duduk perkaranya

Addendum 6.3-T Celah 7 membuat tampilan tanpa menyebutkan `security_invoker` sama sekali. Nilai bawaan PostgreSQL untuk pengaturan itu adalah mati, yang berarti tampilan berjalan dengan hak pemiliknya dan **seluruh aturan akses baris pada ketiga tabel di baliknya dilewati**.

Section 9.2 Modul 6.3 menyatakan tampilan ini terbaca oleh Kanit unit pemilik dan Kasubdit. Kenyataannya, tanpa deklarasi dan tanpa penyaringan diri, setiap pengguna yang berhasil masuk dapat membaca daftar seluruh pelaksana yang belum melapor di seluruh unit.

Ini setingkat dengan temuan A.4 pada Addendum 6.3-K, tetapi luput dari sana karena di sana yang diperiksa hanya tampilan yang **sengaja** dimatikan pengamanannya. Yang ini tidak sengaja — dan justru itu yang membuatnya lebih berbahaya.

### Ketetapan

Berbeda dengan `rekap_laporan_tim`, tampilan ini **tidak memerlukan pengecualian BR-37**. Dengan `security_invoker = on`, aturan akses baris ketiga tabel di baliknya justru menghasilkan penyaringan yang tepat dengan sendirinya: Kanit membaca unitnya, Kasubdit membaca seluruhnya, dan pelaksana hanya melihat barisnya sendiri, yang tidak berbahaya karena ia memang berhak tahu dirinya belum melapor.

```sql
create or replace view public.v_belum_lapor
with (security_invoker = on)
as
select pp.penugasan_id,
       pp.pelaksana_id,
       p.unit_id,
       p.nomor_spt
  from public.penugasan_pelaksana pp
  join public.penugasan p on p.id = pp.penugasan_id
 where p.status in ('baru', 'berjalan', 'bermasalah')
   and p.wajib_lapor_harian = true
   and pp.dicabut_pada is null
   and not exists (
     select 1
       from public.laporan_harian lh
      where lh.penugasan_id = pp.penugasan_id
        and lh.pelapor_id   = pp.pelaksana_id
        and lh.status_laporan <> 'ditarik'
        and lh.direkam_pada::date = current_date
   );
```

Dua perubahan lain menyertainya. Kolom `unit_id` dan `nomor_spt` ditambahkan karena Modul 6.9 akan membutuhkannya untuk menentukan penerima pemberitahuan tanpa harus membaca ulang tabel `penugasan`. Dan `dikirim_pada` diganti `direkam_pada` sesuai BR-45 — tanpa penggantian ini, seorang Anggota yang menulis laporan sore hari di area tanpa sinyal akan tercatat belum melapor meski laporannya sudah tiba.

> **Butir uji U-I-01.** Masuk sebagai Anggota dari unit lain, lalu baca `v_belum_lapor`. Hasilnya wajib hanya memuat barisnya sendiri, bukan baris orang lain dan bukan baris unit lain.

## I.3 Fungsi `fn_minta_perbaikan` — T-03

### Duduk perkaranya

Fungsi ini melakukan pembaruan pada `laporan_harian` ketika seorang peninjau menyisipkan catatan berjenis minta perbaikan. Ia ditulis tanpa `security definer`, sehingga berjalan dengan hak pemanggilnya.

Pemanggilnya adalah Panit. Menurut Section 9.2, hak tulis pada `laporan_harian` hanya dimiliki pelapornya sendiri dan Kanit untuk kolom persetujuan. **Panit tidak memiliki hak tulis sama sekali.**

Akibatnya, setiap kali Panit meminta perbaikan, penyisipan catatannya akan gagal seluruhnya — bukan hanya perpindahan statusnya. Fitur ini tidak akan pernah berjalan sekali pun.

Kegagalan yang sama mengintai `fn_periksa_pelapor_aktif` dan `fn_larang_tinjau_sendiri`, yang membaca tabel di luar lingkup pemanggilnya.

### Ketetapan

```sql
create or replace function public.fn_minta_perbaikan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.jenis = 'minta_perbaikan' then
    update public.laporan_harian
       set status_laporan = 'perlu_diperbaiki'
     where id = new.laporan_id
       and status_laporan not in ('disetujui', 'ditarik');
  end if;
  return new;
end;
$$;
```

Ini menerbitkan pertanyaan yang harus dijawab sekalian: pembaruan di atas berjalan dengan hak pemilik, sehingga ia melewati aturan akses baris. Yang menjaga agar Panit tidak dapat mengubah sembarang laporan adalah pemicu `trg_larang_tinjau_sendiri` dan kebijakan penyisipan pada `catatan_laporan`. Keduanya wajib ada sebelum fungsi ini dipasang, bukan sesudahnya.

## I.4 Pengerasan seluruh fungsi Addendum 6.3-T — T-04

Addendum 6.1-T menetapkan setiap fungsi yang berjalan dengan hak pemilik wajib mengunci `search_path` menjadi kosong. Alasannya, tanpa penguncian itu seseorang yang dapat membuat skema baru dapat menyisipkan tabel bernama sama dan membuat fungsi membaca tabel yang keliru.

Kedelapan fungsi Addendum 6.3-T ditulis tanpa penguncian itu, dan tujuh di antaranya juga tanpa `security definer`.

### Ketetapan

| Fungsi | `security definer` | `set search_path = ''` | Alasan |
| --- | --- | --- | --- |
| `fn_hitung_lokasi_laporan` | Ya | Ya | Membaca `penugasan_lokasi` di luar lingkup pelapor |
| `fn_kunci_laporan` | Ya | Ya | Membaca status `penugasan` |
| `fn_isi_sesi_tugas` | Ya | Ya | Membaca `sesi_tugas` |
| `fn_tandai_sunting` | Tidak | Ya | Hanya menyentuh baris yang sedang diubah |
| `fn_minta_perbaikan` | Ya | Ya | Menulis ke tabel di luar hak pemanggil, lihat I.3 |
| `fn_larang_tinjau_sendiri` | Ya | Ya | Membaca `laporan_harian` milik orang lain |
| `fn_bersihkan_foto_yatim` | Ya | Ya | Sudah `security definer`, kurang `search_path` |
| `fn_periksa_pelapor_aktif` | Ya | Ya | Membaca `penugasan` dan `penugasan_pelaksana` |

Seluruh nama tabel di dalam kedelapan fungsi wajib ditulis lengkap dengan skemanya, misalnya `public.penugasan`, bukan `penugasan` saja. Dengan `search_path` kosong, nama tanpa skema tidak akan ditemukan dan fungsi gagal.

## I.5 Daftar kolom beku — T-05

### Duduk perkaranya

Prosa Addendum 6.3-T Celah 1 menyebut empat belas kolom beku. Kode `fn_tandai_sunting` hanya benar-benar mengembalikan sepuluh. Empat yang disebut tetapi tidak ditegakkan: `alasan_lokasi`, `alasan_lokasi_lainnya`, `penanda_perangkat`, dan `dikirim_pada`.

Kolom `jenis` juga semestinya beku — Modul 6.3 menyatakan yang dapat disunting hanya `uraian`, `kendala`, dan `status_kegiatan` — tetapi tidak disebut pada daftar mana pun. Ditambah empat kolom baru dari Addendum 6.3-K, daftar sesungguhnya menjadi sembilan belas.

Yang tidak ditegakkan berarti dapat diubah. Seorang pelapor yang mengirim permintaan pembaruan langsung ke basis data dapat mengganti alasan lokasinya, atau lebih buruk, mengganti penanda perangkatnya.

### Ketetapan

```sql
create or replace function public.fn_tandai_sunting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.uraian          is distinct from old.uraian
  or new.kendala         is distinct from old.kendala
  or new.status_kegiatan is distinct from old.status_kegiatan then
    new.disunting_pada   := now();
    new.jumlah_suntingan := coalesce(old.jumlah_suntingan, 0) + 1;

    if old.status_laporan = 'perlu_diperbaiki' then
      new.status_laporan := 'terkirim';
    end if;
  end if;

  -- Sembilan belas kolom beku. Daftar ini lengkap; menambah kolom fakta
  -- baru pada laporan_harian mewajibkan menambahkannya di sini juga.
  new.penugasan_id           := old.penugasan_id;
  new.pelapor_id             := old.pelapor_id;
  new.sesi_tugas_id          := old.sesi_tugas_id;
  new.jenis                  := old.jenis;
  new.lokasi_lat             := old.lokasi_lat;
  new.lokasi_lng             := old.lokasi_lng;
  new.akurasi_meter          := old.akurasi_meter;
  new.status_lokasi          := old.status_lokasi;
  new.lokasi_id              := old.lokasi_id;
  new.lokasi_id_terdekat     := old.lokasi_id_terdekat;
  new.jarak_meter            := old.jarak_meter;
  new.alasan_lokasi          := old.alasan_lokasi;
  new.alasan_lokasi_lainnya  := old.alasan_lokasi_lainnya;
  new.penanda_perangkat      := old.penanda_perangkat;
  new.penanda_perangkat_asal := old.penanda_perangkat_asal;
  new.antrean_id             := old.antrean_id;
  new.direkam_pada           := old.direkam_pada;
  new.dikirim_pada           := old.dikirim_pada;
  new.diterima_terlambat     := old.diterima_terlambat;

  return new;
end;
$$;
```

Perhatikan bahwa `keterangan_lokasi` sengaja **tidak** dibekukan. Kolom itu berisi keterangan pelapor tentang keberadaannya bila laporannya terekam di luar titik, dan itu tulisan manusia, bukan fakta yang direkam sistem.

Perpindahan status dari perlu diperbaiki ke terkirim juga dipindahkan ke dalam blok yang sama, karena pada bentuk aslinya ia diperiksa dua kali dengan syarat yang sedikit berbeda.

## I.6 Rujukan BR-24 pada Addendum 6.3-T — T-06

Celah 3 menulis bahwa sesi aktif pada SPT lain sah menurut BR-24. Setelah penggeseran penomoran pada Addendum 6.2-T Bagian 0.2, BR-24 berbunyi tentang Fungsi Tepi dan kunci istimewa — bukan tentang Sesi Tugas.

Aturan yang dimaksud adalah **BR-27**: satu Sesi Tugas aktif per orang, lintas seluruh SPT.

> **Perbaikan.** Pada Addendum 6.3-T Celah 3, ganti rujukan BR-24 menjadi BR-27.

Ini persis jenis kekeliruan yang diperingatkan Addendum 6.2-T Bagian 0.4: berkas yang digali pada waktu berbeda memakai penomoran yang berlaku saat itu, tanpa mengetahui penomorannya sudah bergeser.

## I.7 Rujukan BR-21 pada KP-6.3-49 — T-07, GUGUR

Addendum 6.3-K butir A.6 menyisakan rujukan ini untuk diverifikasi. Verifikasi sudah dilakukan.

BR-21 berbunyi: lingkup data Panit ditentukan oleh penugasan tempat ia ditunjuk, bukan oleh unitnya, dan penunjukan yang sudah berakhir tetap memberi hak baca atas riwayat penugasan tersebut.

KP-6.3-49 menyatakan Panit yang sudah dicabut tetap dapat membaca laporan tetapi tidak dapat memberi catatan baru. Bagian pertama persis BR-21.

> **Ketetapan.** Rujukan BR-21 pada KP-6.3-49 **benar dan tidak diubah**. Butir A.6 pada Addendum 6.3-K dinyatakan selesai, dan butir uji U-6.3-14 dicabut.

Bagian kedua kriteria itu — larangan memberi catatan baru — berasal dari keputusan penggalian Modul 6.2 dan tidak memiliki kode aturan tersendiri. Itu tidak menjadikannya kurang mengikat, tetapi bila kelak dirujuk dari modul lain, sebaiknya diangkat menjadi aturan bernomor.

## I.8 Penamaan pemicu Addendum 6.3-K — T-08

### Duduk perkaranya

PostgreSQL menjalankan pemicu dengan peristiwa yang sama menurut urutan abjad namanya. Addendum 6.3-T menamai seluruh pemicunya dengan awalan `trg_`. Addendum 6.3-K menamai dua pemicunya tanpa awalan itu: `periksa_wewenang_setuju` dan `rekam_versi_laporan`.

Akibatnya keduanya berjalan **sebelum** seluruh pemicu Addendum 6.3-T, termasuk sebelum `trg_kunci_laporan` yang memeriksa apakah laporan sudah terkunci. Perekaman versi karena itu terjadi lebih dahulu daripada pemeriksaan kunci.

Ini tidak sampai merusak data, karena penolakan oleh pemicu mana pun membatalkan seluruh transaksi termasuk baris versi yang sempat tersisip. Tetapi ia menyalahi maksud rancangannya, dan menggantungkan kebenaran pada perilaku pembatalan transaksi adalah bentuk kerapuhan yang tidak perlu.

### Ketetapan

Kedua pemicu diganti namanya menjadi `trg_periksa_wewenang_setuju` dan `trg_rekam_versi_laporan`. Urutan yang dihasilkan:

| Urutan | Pemicu | Tugas |
| --- | --- | --- |
| 1 | `trg_kunci_laporan` | Menolak bila laporan atau SPT sudah terkunci |
| 2 | `trg_larang_tinjau_sendiri` | Peristiwa berbeda, pada tabel catatan |
| 3 | `trg_minta_perbaikan` | Peristiwa berbeda, pada tabel catatan |
| 4 | `trg_periksa_wewenang_setuju` | Memeriksa siapa yang berhak menyetujui |
| 5 | `trg_rekam_versi_laporan` | Menyimpan salinan nilai lama |
| 6 | `trg_tandai_sunting` | Menaikkan penghitung dan membekukan kolom fakta |

Pemeriksaan kunci kini berjalan lebih dahulu, sebagaimana dimaksud semula.

> **Aturan penamaan, ditambahkan pada Section 0.5.** Seluruh pemicu diberi nama berawalan `trg_` dan seluruh fungsi pemicu berawalan `fn_`. Penamaan bukan sekadar kerapian: urutan jalannya pemicu ditentukan abjad nama, sehingga penamaan yang tidak seragam mengubah urutan tanpa terlihat.

## I.9 Wadah penyimpanan berkas — T-09

Fungsi `fn_bersihkan_foto_yatim` menyebut wadah bernama `dokumentasi`. Nama itu tidak dideklarasikan di berkas mana pun, dan Section 9.3 hanya menyebut berkas foto tidak boleh terbuka bagi siapa pun yang mengetahui tautannya.

### Ketetapan

Satu wadah tertutup bernama **`dokumentasi`**, dibuat sebelum Modul 6.3 dibangun.

```sql
insert into storage.buckets (id, name, public)
values ('dokumentasi', 'dokumentasi', false)
on conflict (id) do nothing;
```

Susunan nama berkas di dalamnya: `{penugasan_id}/{laporan_id}/{uuid}.{ekstensi}`. Susunan ini dipilih agar penghapusan seluruh berkas milik satu SPT dapat dilakukan dengan satu awalan, yang akan dibutuhkan Modul 6.10 saat mengekspor dan saat SPT dihapus permanen menurut BR-32.

Akses berkas diberikan lewat tautan bermasa berlaku terbatas, tidak pernah lewat tautan tetap. Masa berlakunya lima belas menit untuk penayangan biasa dan satu jam untuk berkas ekspor.

## I.10 Nama kolom waktu pembuatan — T-10

Section 5 PRD dasar mewajibkan setiap tabel memiliki kolom waktu pembuatan tetapi tidak membakukan namanya. Fungsi `fn_nilai_kiriman_tertunda` pada Addendum 6.3-K sudah merujuk `penugasan.dibuat_pada`, dan tabel `notifikasi` pada Addendum 6.2-T juga memakainya.

> **Ketetapan.** Nama baku adalah `dibuat_pada` untuk waktu pembuatan dan `diubah_pada` untuk waktu perubahan terakhir. Berlaku bagi seluruh tabel tanpa kecuali, termasuk yang sudah terlanjur ditulis dengan nama lain.

Tabel yang memakai nama lain untuk maksud yang sama tetap dibiarkan bila namanya membawa arti tambahan: `dikirim_pada` pada laporan bukan sekadar waktu pembuatan baris, melainkan waktu laporan tiba, dan itu berbeda dari `direkam_pada`.

## I.11 Jumlah modul — T-11

Addendum 6.3-K memperkenalkan Section 6.10 untuk Ekspor Data dan Pembatasan Laju. Jumlah modul fungsional karena itu menjadi sepuluh, bukan sembilan.

| Modul | Status |
| --- | --- |
| 6.1 Autentikasi & Peran | Final |
| 6.2 Manajemen Penugasan | Final |
| 6.3 Pelaporan Kegiatan Harian & Foto | Final |
| 6.4 GPS Tracking & Peta Waktu Nyata | Belum digali |
| 6.5 Dashboard & Monitoring | Belum digali |
| 6.6 Manajemen User | Belum digali |
| 6.7 Dokumentasi Foto & Kolase | Belum digali |
| 6.8 LHP Ringkas Otomatis | Belum digali |
| 6.9 Notifikasi | Belum digali |
| **6.10 Ekspor Data & Pembatasan Laju** | **Baru, sudah bersisi** |

Modul 6.10 lahir sudah dengan kriteria penerimaannya sendiri, sehingga ia tidak menambah pekerjaan penggalian. Yang perlu diperbarui hanya Checklist Progres.

## I.12 Pemeriksaan baris kosong pada hitung lokasi — T-12

`fn_hitung_lokasi_laporan` memeriksa ketiadaan titik lokasi dengan `IF titik IS NULL`. Pada tipe rekaman, bentuk itu bernilai benar hanya bila **seluruh** medannya kosong. Ia kebetulan bekerja untuk keadaan sekarang, tetapi akan diam-diam meleset bila kelak baris ditemukan dengan sebagian medan kosong.

> **Ketetapan.** Ganti menjadi `IF NOT FOUND THEN`, yang memeriksa tepat apa yang dimaksud, yaitu apakah pernyataan sebelumnya menemukan baris.

## I.13 Kolom `penugasan.ditutup_pada` sudah ada — T-13

### Duduk perkaranya

Addendum 6.3-K Bagian B.1 menulis: *"Ini menuntut satu kolom baru pada tabel `penugasan`"* lalu mengeluarkan `alter table public.penugasan add column ditutup_pada timestamptz;`.

Modul 6.2 Section 5.2, baris yang mendefinisikan tabel `penugasan`, sudah memuat kolom ini sejak awal:

```
| ditutup_oleh | uuid | Kanit yang menutup ke status selesai |
| ditutup_pada | timestamptz | Waktu penutupan |
```

Dijalankan apa adanya, `ALTER TABLE ... ADD COLUMN ditutup_pada` akan gagal dengan galat kolom sudah ada — kegagalan yang justru berteriak dan mudah ditemukan. Yang lebih berbahaya adalah bila seseorang menghapus baris `ALTER TABLE` itu karena melihat kolomnya sudah ada, lalu menganggap perkaranya selesai. Ia belum selesai, karena maknanya berbeda.

Kolom lama pada Modul 6.2 hanya terisi ketika SPT ditutup lewat jalur **selesai** — tertulis eksplisit "Kanit yang menutup **ke status selesai**". Penutupan lewat jalur **dibatalkan** memakai pasangan kolom terpisah yang juga sudah ada sejak Modul 6.2: `dibatalkan_oleh` dan `dibatalkan_pada`.

Sementara itu BR-47 pada Addendum 6.3-K butuh mengetahui apakah SPT sudah **tertutup dengan cara apa pun** — selesai maupun dibatalkan — sebelum atau sesudah sebuah laporan ditulis. Bila fungsi `fn_nilai_kiriman_tertunda` dan pemicu `trg_periksa_pelapor_aktif` hanya membaca `ditutup_pada` sebagaimana tertulis, SPT yang **dibatalkan** tidak akan pernah terdeteksi tertutup. Laporan yang ditulis sebelum pembatalan lalu tiba sesudahnya akan diproses seolah SPT masih hidup, padahal BR-47 dimaksudkan menandainya diterima terlambat, bukan memprosesnya seperti biasa.

### Ketetapan

Tidak ada kolom baru. Yang dipakai adalah kolom yang sudah ada, digabung.

> **Perbaikan pada Addendum 6.3-K Bagian B.1.** Hapus seluruhnya pernyataan `alter table public.penugasan add column ditutup_pada timestamptz`. Kolom itu tidak pernah ditambahkan.
>
> Pada pemicu `fn_nilai_kiriman_tertunda` dan pada perubahan `trg_periksa_pelapor_aktif`, setiap rujukan `p.ditutup_pada` diganti menjadi ungkapan gabungan:
>
> ```sql
> coalesce(p.ditutup_pada, p.dibatalkan_pada)
> ```

Bentuk lengkap perubahan pada `trg_periksa_pelapor_aktif` yang berlaku:

```sql
and (p.status in ('baru','berjalan','bermasalah')
     or coalesce(p.ditutup_pada, p.dibatalkan_pada) > new.direkam_pada)
```

Dan pada `fn_nilai_kiriman_tertunda`, bagian yang merujuk waktu penerbitan tidak berubah, tetapi setiap pemeriksaan tambahan yang hendak dilakukan terhadap waktu penutupan wajib memakai bentuk gabungan yang sama, bukan `p.ditutup_pada` saja.

Baris pada tabel C.2 (Perubahan model data) Addendum 6.3-K yang berbunyi *"penugasan — Satu kolom baru: ditutup_pada"* dinyatakan tidak berlaku.

> **Butir uji U-I-07.** Buat SPT, tulis laporan dari perangkat yang lalu dimatikan jaringannya, batalkan SPT tersebut, baru sambungkan kembali jaringan agar laporan yang tertunda terkirim. Laporan wajib diterima dan ditandai diterima terlambat, persis seperti bila SPT ditutup lewat jalur selesai. Bila laporan diproses seolah SPT masih hidup, perbaikan ini belum diterapkan dengan benar.

## I.14 Kolom antrean ditulis sebagai `ALTER TABLE` — T-14

Addendum 6.3-K Bagian B.1 menyajikan keempat kolom antrean (`antrean_id`, `direkam_pada`, `diterima_terlambat`, `penanda_perangkat_asal`) dalam bentuk `ALTER TABLE ... ADD COLUMN`, seolah tabel `laporan_harian` sudah berdiri lebih dahulu tanpanya.

Ini tidak salah secara teknis untuk sistem yang belum berjalan — tabelnya memang belum pernah dibangun sungguhan, sehingga tidak ada risiko galat seperti T-13. Tetapi ia bertentangan dengan urutan pembangunan yang sama-sama tertulis pada berkas yang sama, yang menyatakan tabel ini dibangun **lengkap sejak awal** dengan seluruh kolom antrean sudah tercantum pada `create table`.

> **Ketetapan.** Bentuk `ALTER TABLE` pada Bagian B.1 dibaca sebagai **daftar kolom yang wajib ada**, bukan sebagai urutan perintah yang benar-benar dijalankan berurutan. Saat membangun, keempat kolom itu, ditambah kolom `penanda_perangkat` yang sudah ada dari Addendum 6.1-T, ditulis langsung sebagai bagian dari satu pernyataan `create table public.laporan_harian`, mengikuti I.13 pada Addendum 6.3-K Bagian C.4 poin 3.

---

## I.15 Urutan pengerjaan setelah koreksi

Menggantikan urutan pada Addendum 6.3-K Bagian C.4 pada bagian yang bertumpang tindih.

| No | Langkah | Rujukan |
| --- | --- | --- |
| 1 | Pasang ekstensi PostGIS | A.5 |
| 2 | Buat wadah penyimpanan `dokumentasi` | I.9 |
| 3 | Bangun `laporan_harian` lengkap dengan empat kolom antrean sejak awal | B.1 |
| 4 | Tambahkan `ditutup_pada` pada `penugasan` beserta pemicu pengisinya | B.1 |
| 5 | Pasang kedelapan fungsi Addendum 6.3-T dalam bentuk yang sudah dikeraskan | I.3, I.4, I.5, I.12 |
| 6 | Pasang pemicu Addendum 6.3-K dengan nama berawalan `trg_` | I.8 |
| 7 | Bangun `laporan_versi` dan `catatan_versi`, cabut hak tulisnya | B.2 |
| 8 | Bangun `v_belum_lapor` dengan `security_invoker = on` | I.2 |
| 9 | Bangun `rekap_laporan_tim` dengan penyaringan diri | A.4 |
| 10 | Bangun `pembatasan_laju` dan pasang pemanggilannya | B.4 |
| 11 | Bangun Fungsi Tepi `ekspor-unit` | B.3 |
| 12 | Bangun Antrean Luring pada sisi aplikasi | B.1 |

## I.16 Butir uji tambahan

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-I-01 | Baca `v_belum_lapor` sebagai Anggota unit lain | Hanya barisnya sendiri yang tampil |
| U-I-02 | Sisipkan catatan minta perbaikan sebagai Panit | Berhasil, dan status laporan berpindah |
| U-I-03 | Kosongkan `berkas_path` satu baris foto, jalankan pembersih foto yatim | Berkas lain tetap terhapus, tidak lumpuh seluruhnya |
| U-I-04 | Kirim permintaan pembaruan langsung ke basis data yang mengubah `penanda_perangkat` | Nilainya tidak berubah |
| U-I-05 | Sunting laporan lalu periksa urutan baris versi | Nomor versi berurutan tanpa lompatan |
| U-I-06 | Setujui laporan lalu coba menyuntingnya | Ditolak `trg_kunci_laporan`, bukan oleh pemicu lain |
| U-I-07 | Tulis laporan luring, batalkan SPT-nya, baru sambungkan jaringan | Laporan diterima dan ditandai diterima terlambat, sama seperti jalur selesai |

---

## Penutup berita acara

Lima temuan memblokir pembangunan. Empat di antaranya berupa kegagalan senyap yang tidak akan menampilkan pesan galat saat sistem berjalan: nama kolom yang keliru pada pekerjaan berjadwal, tampilan yang melewati aturan akses tanpa pernah menimbulkan galat, fungsi yang gagal hanya ketika dipanggil peran tertentu, dan kolom yang dinyatakan beku tetapi sebenarnya masih dapat diubah. Temuan kelima berbeda sifatnya — ia justru akan gagal secara berisik, kolom yang diklaim baru ternyata sudah ada dan pernyataan pembuatannya akan ditolak basis data seketika. Yang membuatnya tetap layak dicatat setara dengan yang lain adalah akibat sampingannya: kolom lama yang sudah ada itu maknanya tidak sepenuhnya sama dengan yang dibutuhkan, dan penyelesaian yang tergesa — sekadar menghapus baris yang gagal — akan meninggalkan cacat senyap kedua di baliknya.

Ini pola yang pantas dicatat untuk penggalian modul berikutnya. Kekeliruan yang berteriak akan ditemukan pada hari pertama pengujian. Yang berbahaya adalah yang diam, dan pemeriksaan silang antar berkas adalah satu-satunya cara menemukannya sebelum sistem dipakai.

Satu temuan gugur setelah diverifikasi. Itu juga pantas dicatat: dugaan tidak sama dengan temuan, dan menuliskan cara memutuskannya, sebagaimana dilakukan Addendum 6.3-K butir A.6, lebih baik daripada menebak ke arah mana pun.


---
---

# BAGIAN A — PRD DASAR (Versi Kerangka 0.2)

**DOKUMEN KEBUTUHAN PRODUK**

**SiPANTAU**

Sistem Pengawasan Anggota Terpadu

dalam Pelaksanaan Penyelidikan Lapangan

**Unit I Subdit IV Ditreskrimsus Polda Jawa Barat**

**Versi kerangka 0.2**

Dokumen kerja · Disusun untuk dikonsumsi AI Agent Code

*Bersifat internal --- tidak untuk disebarluaskan*

**Kendali Dokumen**

  ---------------------- ------------------------------------------------------------------------------------------------------------------
  **Nama produk**        SiPANTAU --- Sistem Pengawasan Anggota Terpadu

  **Pemilik produk**     Kanit I Subdit IV / Tipidter Ditreskrimsus Polda Jawa Barat (Action Leader Pelatihan Kepemimpinan Administrator)

  **Lingkup pengguna**   Subdit IV Ditreskrimsus Polda Jawa Barat

  **Versi dokumen**      0.2 (kerangka penuh)

  **Status**             Kerangka --- belum digali per modul

  **Pembaca utama**      AI Agent Code (pembangun sistem)

  **Pembaca sekunder**   Developer, pemilik produk

  **Bahasa**             Indonesia
  ---------------------- ------------------------------------------------------------------------------------------------------------------

**Riwayat Revisi**

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Versi**   **Status**   **Perubahan**
  ----------- ------------ ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0.1         Digantikan   Kerangka awal 12 section. Tiga peran (Kanit, Panit, Anggota). Belum memuat modul dokumentasi foto, kolase, dan LHP.

  0.2         Berlaku      Peran menjadi empat (Kasubdit, Kanit, Panit, Anggota) dengan lingkup dan wewenang final. Ditambah Modul 6.7 (Dokumentasi Foto & Kolase Berkop), Modul 6.8 (LHP Ringkas Otomatis), dan Modul 6.9 (Notifikasi). Ditetapkan konsep tiga lapis pelaporan. Ditambah Prinsip Ekstensibilitas dan Prinsip Non-Menghakimi pada Section 0. Butir konfirmasi klien didaftar pada Lampiran A.
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+---------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Cara memakai dokumen ini**                                                                                                                                  |
|                                                                                                                                                               |
| Dokumen ini adalah kerangka. Setiap section sudah memiliki tempat yang jelas untuk setiap keputusan, tetapi belum digali sampai tingkat terkecil.             |
|                                                                                                                                                               |
| Tahap berikutnya adalah menggali satu modul dalam satu waktu (lihat Section 6.0), lalu menyatukan hasilnya kembali ke dokumen ini sehingga menjadi PRD final. |
|                                                                                                                                                               |
| Dokumen ini boleh diubah kapan saja. Penambahan modul di masa depan cukup menambah nomor baru pada Section 6 tanpa menulis ulang section lain.                |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Daftar Isi**

  -------- --------------------------------------------------------------
  **0**    Meta & Panduan Baca

  **1**    Ringkasan Produk

  **2**    Pengguna & Peran

  **3**    Glosarium & Istilah Baku

  **4**    Arsitektur Sistem & Tech Stack

  **5**    Model Data

  **6**    Modul Fungsional

  **7**    Business Rules Global

  **8**    Edge Case & Error State

  **9**    Keamanan & Row Level Security

  **10**   Kebutuhan Non-Fungsional

  **11**   Alur Aplikasi & Packaging

  **12**   Di Luar Cakupan

  **A**    Lampiran A --- Butir yang Perlu Dikonfirmasi ke Klien

  **B**    Lampiran B --- Daftar Keputusan yang Sudah Final
  -------- --------------------------------------------------------------

**0. Meta & Panduan Baca**

Section ini mengatur bagaimana seluruh dokumen dibaca dan diterjemahkan menjadi kode. Aturan di sini berlaku untuk semua section berikutnya.

**0.1 Pembaca dokumen**

Dokumen ini ditulis untuk dikonsumsi AI Agent Code, bukan pembaca awam. Konsekuensinya, seluruh isi ditulis eksplisit dan tidak boleh menyisakan ruang tafsir. Setiap aturan harus dapat diterjemahkan langsung menjadi logika kode tanpa perlu menebak maksud penulis.

Bila menemukan bagian yang belum cukup jelas untuk diimplementasikan, AI Agent tidak boleh mengarang asumsi sendiri. Bagian tersebut harus dilaporkan sebagai pertanyaan terbuka, bukan diisi dengan perkiraan.

**0.2 Konsistensi istilah**

Gunakan hanya istilah baku yang terdaftar pada Section 3. Sinonim dilarang karena berisiko dibaca sebagai entitas berbeda. Contoh: selalu tulis "Anggota", jangan diganti menjadi "user", "personel", atau "member". Konsistensi ini berlaku pada nama tabel, nama variabel, label antarmuka, dan isi dokumen.

**0.3 Prioritas bila terjadi konflik**

Jika ada dua aturan yang bertentangan, urutan kekuatannya adalah sebagai berikut, dari yang paling menang:

-   Business Rules Global (Section 7)

-   Keamanan & Row Level Security (Section 9)

-   Deskripsi modul (Section 6)

-   Bagian naratif lain

Aturan pada Section 7 dan 9 tidak boleh dilanggar oleh implementasi modul mana pun.

**0.4 Penanda status**

Setiap section diberi penanda agar jelas mana yang sudah matang dan mana yang belum:

  ------------------------------------------------------------------------------------------------------------------
  **Penanda**                  **Arti**
  ---------------------------- -------------------------------------------------------------------------------------
  \[KERANGKA\]                 Struktur sudah ada, isi belum digali. Belum boleh dijadikan dasar implementasi.

  \[DETAIL\]                   Sudah digali, sedang ditinjau. Boleh dijadikan dasar implementasi dengan hati-hati.

  \[FINAL\]                    Sudah disepakati dan terkunci. Boleh langsung diimplementasikan.

  \[PERLU KONFIRMASI KLIEN\]   Menunggu jawaban pemilik produk. Implementasi ditunda sampai terjawab.
  ------------------------------------------------------------------------------------------------------------------

Pada versi 0.2 ini, seluruh Section 6 masih berstatus \[KERANGKA\], kecuali butir-butir yang sudah dinyatakan final dan didaftar pada Lampiran B.

**0.5 Prinsip Ekstensibilitas**

Sistem wajib dibangun modular. Prinsip ini mengikat dan berlaku untuk seluruh implementasi:

-   **Batas modul jelas.** Setiap modul memiliki tanggung jawab tunggal dan tidak mencampuri urusan modul lain.

-   **Penambahan tidak merusak.** Menambah fitur atau modul baru di masa depan tidak boleh mengharuskan penulisan ulang modul yang sudah berjalan.

-   **Skema database bersifat incremental.** Perubahan dilakukan dengan menambah tabel atau kolom baru, bukan membongkar dan menyusun ulang skema yang sudah berisi data.

-   **Komponen antarmuka berdiri sendiri.** Satu halaman atau satu bagian antarmuka dibangun sebagai komponen terpisah agar dapat diubah tanpa merembet.

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Alasan prinsip ini ditegaskan**                                                                                                                                                                                                                                 |
|                                                                                                                                                                                                                                                                   |
| Pemilik produk merencanakan penambahan fitur secara bertahap setelah sistem berjalan. Modularitas tidak muncul dengan sendirinya, ia harus disengaja sejak baris kode pertama. Bila diabaikan, penambahan fitur kecil dapat memaksa pembangunan ulang menyeluruh. |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**0.6 Prinsip Non-Menghakimi**

Sistem menyajikan data dan fakta apa adanya. Sistem tidak menyimpulkan pelanggaran, tidak memberi skor, dan tidak melabeli seseorang sebagai bermasalah. Penilaian sepenuhnya dilakukan manusia, yaitu Panit, Kanit, atau Kasubdit sesuai kewenangannya.

Prinsip ini berlaku lintas modul dan memengaruhi cara data ditampilkan. Contoh penerapannya:

-   Status lokasi ditulis "Terakhir terlihat 40 menit lalu", bukan "Anggota tidak melaksanakan tugas".

-   Laporan tanpa koordinat ditandai "Lokasi tidak terekam" disertai alasan yang dipilih Anggota, bukan ditolak atau dicap palsu.

-   Foto dari galeri dilabeli "Foto lampiran" secara netral, bukan "tidak sah".

**0.7 Cara memberi dokumen ini kepada AI Agent**

Saat membangun sistem, jangan berikan seluruh dokumen sekaligus lalu meminta seluruh sistem dibuat dalam satu langkah. Cara yang benar:

-   Berikan Section 0 sampai 5 sebagai konteks tetap. Bagian ini menjelaskan aturan main, peran, arsitektur, dan model data.

-   Tambahkan satu modul dari Section 6 yang sedang dikerjakan.

-   Sertakan Section 7 dan 9 karena keduanya mengikat semua modul.

-   Nyatakan secara eksplisit: ambil gaya visual dari prototype HTML yang sudah ada, jangan membuat desain baru dari nol.

-   Nyatakan secara eksplisit: jangan mengubah modul lain yang sudah selesai.

**1. Ringkasan Produk**

**1.1 Visi produk**

SiPANTAU menjadikan seluruh kegiatan penyelidikan lapangan terekam, terpantau, dan dapat dipertanggungjawabkan secara digital, sekaligus meringankan pekerjaan administratif Anggota di lapangan.

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Catatan strategis**                                                                                                                                                                                                                        |
|                                                                                                                                                                                                                                              |
| Visi ini sengaja memuat dua sisi. Sisi pertama adalah kepentingan pimpinan, yaitu pengawasan. Sisi kedua adalah kepentingan Anggota, yaitu pelaporan yang lebih ringan lewat LHP Ringkas otomatis.                                           |
|                                                                                                                                                                                                                                              |
| Keseimbangan ini penting untuk tingkat adopsi. Sistem yang hanya menguntungkan pimpinan cenderung ditolak pemakainya. Sistem yang juga meringankan Anggota akan dipakai secara sukarela, dan data pengawasan ikut terekam sebagai akibatnya. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**1.2 Pernyataan masalah**

Pengawasan Panit dan Kanit terhadap Anggota dalam pelaksanaan tugas penyelidikan lapangan belum berjalan maksimal pada fungsi pengendalian, supervisi, dan monitoring. Dalam sejumlah kegiatan penyelidikan tertutup, perwira yang ditunjuk tidak melekat langsung dengan Anggota di lapangan.

Kondisi tersebut membuka peluang penyalahgunaan wewenang, antara lain kegiatan di luar objek dan sasaran surat perintah tugas, serta permintaan sejumlah uang kepada pihak yang berkaitan dengan perkara. Akibatnya muncul pengaduan masyarakat yang mencoreng nama baik institusi.

Selain itu, pelaporan berjalan melalui percakapan pesan singkat. Laporan tersebut tidak terekam sebagai arsip sistem, sulit ditelusuri kembali, dan tidak memiliki bukti waktu maupun lokasi.

**Data pendukung**

  ------------------------------------------------------------------------------------------------------------------------------
  **Indikator**                                                                        **Angka**
  ------------------------------------------------------------------------------------ -----------------------------------------
  Pelanggaran Anggota dalam penanganan penyelidikan lapangan (Januari s.d. Mei 2026)   5 perkara

  Pengaduan masyarakat terhadap Subdit IV                                              6 laporan

  Jumlah personel Subdit IV berdasarkan kondisi riil                                   57 orang (Pamen 3, Pama 11, Bintara 43)
  ------------------------------------------------------------------------------------------------------------------------------

**1.3 Tujuan produk**

  ----------------------------------------------------------------------------------------------------------------------------------
  **No**   **Tujuan**                            **Wujud dalam sistem**
  -------- ------------------------------------- -----------------------------------------------------------------------------------
  1        Digitalisasi surat perintah tugas     SPT diterbitkan, disimpan, dan ditelusuri di dalam sistem (Modul 6.2)

  2        Pelaporan yang terekam                Seluruh laporan masuk sistem, tidak ada jalur di luar sistem (Modul 6.3, BR-04)

  3        Pemantauan posisi saat bertugas       Tracking selama Sesi Tugas dan peta waktu nyata (Modul 6.4)

  4        Bukti kegiatan yang kredibel          Foto berstempel waktu dan koordinat dari kamera aplikasi (Modul 6.7)

  5        Meringankan pekerjaan administratif   LHP Ringkas dibuat dari formulir, lalu diekspor menjadi dokumen resmi (Modul 6.8)

  6        Mempercepat keputusan pimpinan        Dashboard sesuai lingkup masing-masing peran (Modul 6.5)
  ----------------------------------------------------------------------------------------------------------------------------------

**1.4 Metrik keberhasilan**

Ukuran berikut dipakai untuk menilai apakah sistem berhasil, bukan sekadar selesai dibangun. Angka target diisi bersama pemilik produk saat modul digali.

  ------------------------------------------------------------------------------------------------------------------------------------------------------
  **Metrik**                                        **Cara ukur**                                                              **Target**
  ------------------------------------------------- -------------------------------------------------------------------------- -------------------------
  Porsi pelaporan yang melalui sistem               Jumlah laporan di sistem dibanding total laporan yang diketahui pimpinan   Diisi saat modul digali

  Kelengkapan jejak lokasi per SPT                  Persentase SPT yang memiliki rute Tracking                                 Diisi saat modul digali

  Porsi laporan berstatus terverifikasi di lokasi   Perbandingan laporan terverifikasi dan laporan tanpa lokasi                Diisi saat modul digali

  Waktu pimpinan mengetahui perkembangan            Selisih waktu kejadian lapangan dan waktu laporan diterima                 Diisi saat modul digali

  Pemakaian LHP Ringkas                             Jumlah LHP yang dibuat lewat sistem per bulan                              Diisi saat modul digali
  ------------------------------------------------------------------------------------------------------------------------------------------------------

**1.5 Batasan proyek**

-   **Sifat aplikasi.** Internal institusi, tidak dipublikasikan ke toko aplikasi umum.

-   **Distribusi.** Berkas aplikasi Android dibagikan langsung ke Anggota, dipasang secara manual.

-   **Sumber daya.** Dikerjakan dengan sumber daya terbatas, sehingga layanan yang dipilih mengutamakan yang tidak berbiaya pada tahap pengembangan.

-   **Waktu.** Mengikuti jadwal aksi perubahan pemilik produk. Tanggal rinci diisi saat perencanaan pelaksanaan.

-   **Platform.** Fokus Android dan peramban. Versi iOS tidak dibuat pada tahap ini.

**2. Pengguna & Peran**

Sistem mengenal empat peran. Peran menentukan menu yang muncul, tindakan yang boleh dilakukan, dan yang paling penting, seberapa luas data yang boleh dilihat.

**2.1 Daftar peran**

  ----------------------------------------------------------------------------
  **Peran**      **Posisi**           **Lingkup data**
  -------------- -------------------- ----------------------------------------
  **Kasubdit**   Pimpinan Subdit IV   Seluruh unit di bawah Subdit IV

  **Kanit**      Kepala Unit          Unit yang dipimpinnya saja

  **Panit**      Perwira Unit         Tim di dalam unitnya

  **Anggota**    Pelaksana lapangan   Penugasan dan laporan miliknya sendiri
  ----------------------------------------------------------------------------

**2.2 Deskripsi dan konteks tiap peran**

**Kasubdit**

Pimpinan tertinggi dalam lingkup sistem. Menggunakan sistem terutama untuk memantau kinerja seluruh unit dan menyiapkan rekapitulasi. Dua kewenangan bersifat eksklusif miliknya, yaitu manajemen akun pengguna dan rekapitulasi lintas unit. Kasubdit tidak menerbitkan SPT.

Perangkat yang dipakai umumnya komputer atau tablet di ruang kerja, sehingga tampilan untuk peran ini diutamakan pada layar lebar.

**Kanit**

Kepala unit dan satu-satunya peran yang berwenang menerbitkan SPT. Memantau seluruh kegiatan penyelidikan di unitnya, meninjau laporan, dan menutup penugasan yang telah selesai. Kanit tidak dapat melihat data unit lain dan tidak dapat mengelola akun pengguna.

Perangkat yang dipakai bervariasi antara komputer di ruang kerja dan telepon genggam saat berada di luar kantor, sehingga tampilan harus nyaman pada kedua ukuran layar.

**Panit**

Perwira unit yang berperan sebagai pengawas dan peninjau. Membaca laporan yang masuk dari Anggota, memberi catatan atau arahan, dan memantau posisi tim saat bertugas. Panit tidak menerbitkan SPT.

**Anggota**

Pelaksana penyelidikan di lapangan dan pemakai paling sering. Membuka Sesi Tugas, mengirim laporan kegiatan harian, mengambil foto dokumentasi, dan menyusun LHP Ringkas setelah kegiatan selesai. Hanya dapat melihat penugasan dan laporan miliknya sendiri.

Perangkat yang dipakai adalah telepon genggam di lapangan, sering dalam kondisi sinyal lemah, cahaya terang, dan baterai terbatas. Seluruh tampilan untuk peran ini dirancang mengutamakan layar kecil.

**2.3 Matriks hak akses**

Tabel ini mengikat. Implementasi Row Level Security pada Section 9 harus sejalan dengan isinya.

  ----------------------------------------------------------------------------------------------------------------------------
  **Kemampuan**                          **Kasubdit**         **Kanit**            **Panit**          **Anggota**
  -------------------------------------- -------------------- -------------------- ------------------ ------------------------
  Melihat dashboard                      Semua unit           Unit sendiri         Tim unit           Milik sendiri

  Menerbitkan SPT                        Tidak                **Ya (eksklusif)**   Tidak              Tidak

  Menugaskan Anggota ke SPT              Tidak                Perlu konfirmasi     Perlu konfirmasi   Tidak

  Melihat daftar SPT                     Semua unit           Unit sendiri         Unit sendiri       Yang ditujukan padanya

  Mengubah dan menutup SPT               Tidak                Ya (unit sendiri)    Tidak              Tidak

  Membuka dan menutup Sesi Tugas         Tidak                Tidak                Tidak              **Ya**

  Mengirim Pelaporan Kegiatan Harian     Tidak                Tidak                Tidak              **Ya**

  Meninjau dan memberi catatan laporan   Semua unit           Unit sendiri         Tim unit           Tidak

  Menyusun LHP Ringkas                   Tidak                Tidak                Tidak              **Ya**

  Melihat LHP Ringkas                    Semua unit           Unit sendiri         Tim unit           Milik sendiri

  Mengekspor LHP ke PDF dan Word         Ya                   Ya                   Ya                 Miliknya sendiri

  Melihat peta Tracking waktu nyata      Semua unit           Unit sendiri         Tim unit           Posisi sendiri

  Melihat rute per SPT                   Semua unit           Unit sendiri         Tim unit           Rute sendiri

  Mengekspor Kolase foto                 Ya                   Ya                   Ya                 Tidak

  Rekapitulasi lintas unit               **Ya (eksklusif)**   Tidak                Tidak              Tidak

  Manajemen akun pengguna                **Ya (eksklusif)**   Tidak                Tidak              Tidak
  ----------------------------------------------------------------------------------------------------------------------------

**2.4 Hierarki dan pewarisan lingkup data**

Lingkup data bersifat menurun. Peran yang lebih tinggi melihat seluruh data peran di bawahnya dalam lingkupnya, tetapi tidak otomatis mewarisi kewenangan tindakan.

  ------------------------------------------------------------------------------------------------------------------------------------------
  **Peran**         **Melihat data milik**                                **Catatan penting**
  ----------------- ----------------------------------------------------- ------------------------------------------------------------------
  Kasubdit          Seluruh unit, seluruh Kanit, Panit, dan Anggota       Lingkup data paling luas, tetapi tidak berwenang menerbitkan SPT

  Kanit             Unitnya sendiri: Panit dan Anggota di unit tersebut   Tidak dapat melihat unit lain sekalipun sebagai pembanding

  Panit             Anggota dalam timnya di unit yang sama                Tidak dapat menerbitkan SPT

  Anggota           Hanya miliknya sendiri                                Tidak dapat melihat penugasan atau laporan Anggota lain
  ------------------------------------------------------------------------------------------------------------------------------------------

+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Perbedaan lingkup data dan kewenangan tindakan**                                                                                                                                       |
|                                                                                                                                                                                          |
| Kedua hal ini terpisah dan tidak boleh dicampur saat implementasi. Kasubdit memiliki lingkup data terluas, tetapi kewenangan menerbitkan SPT justru hanya ada pada Kanit.                |
|                                                                                                                                                                                          |
| Artinya, pemeriksaan izin harus dilakukan dua kali: pertama memeriksa apakah peran boleh melakukan tindakan tersebut, kedua memeriksa apakah data yang disentuh berada dalam lingkupnya. |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**2.5 Butir yang belum ditetapkan**

+-------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\] Penugasan Anggota ke SPT**                                                           |
|                                                                                                                   |
| SPT diterbitkan oleh Kanit. Belum ditetapkan siapa yang menentukan Anggota mana yang masuk ke dalam SPT tersebut. |
|                                                                                                                   |
| Kemungkinan pertama, Kanit sekaligus menetapkan Anggota saat menerbitkan SPT.                                     |
|                                                                                                                   |
| Kemungkinan kedua, Kanit menerbitkan SPT dan Panit yang membagi Anggota ke dalamnya.                              |
|                                                                                                                   |
| Ditunda ke penggalian Modul 6.2. Sampai terjawab, implementasi bagian ini ditahan.                                |
+-------------------------------------------------------------------------------------------------------------------+

**3. Glosarium & Istilah Baku**

Setiap istilah di bawah ini memiliki satu makna tunggal. Dilarang memakai sinonim di bagian mana pun, termasuk pada nama tabel, nama variabel, dan label antarmuka. Bila sebuah istilah baru muncul saat penggalian modul, istilah tersebut wajib didaftarkan di sini terlebih dahulu.

**3.1 Istilah peran**

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**      **Definisi tunggal**
  ---------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kasubdit**     Peran tertinggi dalam sistem. Pimpinan Subdit IV. Lingkup data seluruh unit. Pemegang eksklusif manajemen akun pengguna dan rekapitulasi lintas unit. Tidak menerbitkan SPT.

  **Kanit**        Kepala Unit. Lingkup data unitnya sendiri. Satu-satunya peran yang berwenang menerbitkan SPT.

  **Panit**        Perwira Unit. Pengawas dan peninjau laporan di dalam unitnya. Tidak menerbitkan SPT.

  **Anggota**      Pelaksana penyelidikan di lapangan. Lingkup data miliknya sendiri. Dilarang diganti dengan kata user, personel, atau member.
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.2 Istilah penugasan dan kegiatan**

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**         **Definisi tunggal**
  ------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **SPT**             Surat Perintah Tugas. Satu penugasan penyelidikan yang diterbitkan Kanit. Memuat objek, sasaran, lokasi, prioritas, jangka waktu, dan daftar Anggota pelaksana.

  **Sesi Tugas**      Periode antara Anggota menekan Mulai Tugas hingga menekan Selesai Tugas. Tracking hanya berjalan di dalam periode ini. Satu Sesi Tugas selalu terikat pada satu SPT.

  **Mulai Tugas**     Tindakan Anggota membuka Sesi Tugas. Ditolak bila GPS tidak aktif atau izin lokasi tidak diberikan.

  **Selesai Tugas**   Tindakan Anggota menutup Sesi Tugas. Menghentikan Tracking.

  **Prioritas**       Tingkat kepentingan SPT. Tiga nilai: Normal, Penting, Urgent.

  **Status SPT**      Kondisi penugasan. Empat nilai: Baru, Berjalan, Selesai, Bermasalah.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.3 Istilah lokasi**

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**                   **Definisi tunggal**
  ----------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Tracking**                  Pengiriman koordinat posisi Anggota ke sistem selama Sesi Tugas berlangsung. Tidak berjalan di luar Sesi Tugas.

  **Rute**                      Kumpulan titik koordinat yang terkumpul selama satu Sesi Tugas, tersimpan terikat pada SPT yang bersangkutan.

  **Terverifikasi di lokasi**   Status laporan atau foto yang koordinatnya berhasil direkam dan dianggap sah oleh sistem.

  **Lokasi tidak terekam**      Status laporan yang dikirim tanpa koordinat sah. Wajib disertai alasan yang dipilih Anggota. Bukan penolakan dan bukan tuduhan.

  **Terakhir terlihat**         Selisih waktu antara sekarang dan koordinat terakhir yang diterima sistem dari seorang Anggota.

  **Soft gate**                 Istilah internal dokumen ini untuk mekanisme boleh mengirim tetapi ditandai. Istilah ini tidak boleh muncul di antarmuka. Yang tampil bagi pemakai adalah label Lokasi tidak terekam.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.4 Istilah dokumentasi dan pelaporan**

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Istilah**                       **Definisi tunggal**
  --------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Foto lapangan terverifikasi**   Foto yang diambil langsung dari kamera di dalam aplikasi. Otomatis diberi tanda air berisi waktu, koordinat, dan nama lokasi.

  **Foto lampiran**                 Foto yang dipilih dari galeri perangkat. Tanpa tanda air karena waktu dan lokasinya tidak dapat dijamin. Label bersifat netral, bukan penilaian.

  **Tanda air**                     Teks berisi waktu, koordinat, dan nama lokasi yang ditanamkan pada gambar sebelum gambar dikompresi dan diunggah.

  **Kolase**                        Satu gambar gabungan berisi beberapa foto yang disusun dalam kisi, diberi kepala institusi di bagian atas. Dibuat sesuai permintaan, bukan otomatis saat pengiriman laporan.

  **Pelaporan Kegiatan Harian**     Laporan singkat berkala dari lapangan selama SPT berjalan. Lapis pertama pelaporan.

  **LHP Ringkas**                   Laporan Hasil Penyelidikan versi ringkas. Disusun Anggota melalui formulir terstruktur, lalu diekspor menjadi dokumen PDF berkop dan Word. Lapis kedua pelaporan. Merupakan keluaran resmi terakhir di dalam sistem.

  **LHP Resmi Lengkap**             Dokumen penyidikan penuh yang disusun manual oleh Anggota di luar sistem. Lapis ketiga pelaporan. Berada di luar cakupan sistem.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**3.5 Tiga lapis pelaporan**

Konsep ini mengikat dan menjadi dasar pemisahan Modul 6.3, Modul 6.8, dan Section 12.

  -------------------------------------------------------------------------------------------------------------------------------------
  **Lapis**   **Nama**                    **Waktu terjadi**                               **Posisi terhadap sistem**
  ----------- --------------------------- ----------------------------------------------- ---------------------------------------------
  1           Pelaporan Kegiatan Harian   Selama SPT berjalan, berulang                   Di dalam sistem (Modul 6.3)

  2           LHP Ringkas                 Setelah kegiatan selesai, sekali per kegiatan   Di dalam sistem (Modul 6.8)

  3           LHP Resmi Lengkap           Setelah LHP Ringkas, bila perkara berlanjut     Di luar sistem, disusun manual (Section 12)
  -------------------------------------------------------------------------------------------------------------------------------------

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Mengapa lapis ketiga sengaja dikeluarkan**                                                                                                                                                             |
|                                                                                                                                                                                                          |
| LHP Resmi Lengkap adalah dokumen penyidikan penuh yang menuntut pertimbangan hukum penyidik. Memasukkannya ke sistem akan membuat cakupan membengkak jauh melampaui waktu dan sumber daya yang tersedia. |
|                                                                                                                                                                                                          |
| AI Agent dilarang membangun fitur apa pun yang menyerupai penyusunan LHP Resmi Lengkap, sekalipun terlihat sebagai lanjutan alami dari Modul 6.8.                                                        |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**4. Arsitektur Sistem & Tech Stack**

**4.1 Gambaran arsitektur**

Sistem terdiri atas satu aplikasi sisi klien yang berkomunikasi dengan satu layanan backend terkelola, ditambah layanan peta pihak ketiga yang bersifat baca saja.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Lapisan**                **Peran dalam sistem**
  -------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------
  Aplikasi klien             Seluruh antarmuka pemakai. Dijalankan di peramban, dipasang sebagai aplikasi web progresif, atau dibungkus menjadi berkas aplikasi Android.

  Layanan backend            Autentikasi, basis data, penyimpanan berkas foto, dan pembaruan data waktu nyata. Tidak ada server aplikasi terpisah yang ditulis manual.

  Layanan peta               Penyedia ubin peta. Hanya dipakai untuk menampilkan latar peta. Tidak ada data penyelidikan yang dikirim ke layanan ini.

  Pelacakan latar belakang   Komponen pada bungkus aplikasi Android yang menjaga pengiriman koordinat tetap berjalan saat layar terkunci.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**4.2 Tumpukan teknologi**

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Lapisan**                **Teknologi**                                        **Alasan pemilihan**
  -------------------------- ---------------------------------------------------- -----------------------------------------------------------------------------------------------------------------
  Antarmuka                  Next.js dengan React dan TypeScript                  Satu kerangka kerja untuk halaman dan komponen, mendukung pemisahan modul yang rapi

  Penataan visual            Tailwind CSS                                         Penataan berbasis kelas, cepat dan konsisten dengan prototype yang sudah ada

  Backend dan basis data     Supabase (PostgreSQL)                                Menyediakan autentikasi, basis data, penyimpanan berkas, dan pembaruan waktu nyata tanpa menulis server sendiri

  Peta                       Leaflet dengan OpenStreetMap                         Ringan, tanpa biaya, cukup untuk kebutuhan menampilkan posisi dan rute

  Pembacaan posisi           Geolocation API peramban                             Tersedia langsung di peramban, dipakai untuk Tracking saat aplikasi aktif

  Pelacakan latar belakang   Capacitor dengan pengaya background geolocation      Menjaga pengiriman koordinat saat aplikasi tidak berada di layar depan

  Pembungkus aplikasi        Aplikasi web progresif dan berkas aplikasi Android   Dapat dipasang ke layar utama atau dibagikan sebagai berkas pemasangan

  Penempatan antarmuka       Vercel                                               Penempatan otomatis dari repositori, tanpa biaya pada skala ini

  Penempatan backend         Supabase Cloud                                       Terkelola penuh, tidak perlu mengurus server
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**4.3 Aturan pengambilan gaya visual**

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Aturan mengikat**                                                                                                                                                               |
|                                                                                                                                                                                   |
| Gaya visual diambil dari prototype HTML yang sudah tersedia: palet warna, jarak antar elemen, bentuk kartu, gaya lencana status, gaya tabel, dan tata letak bilah samping.        |
|                                                                                                                                                                                   |
| AI Agent dilarang membuat arah desain baru dari nol, mengganti palet warna, atau mengubah tata letak dasar tanpa permintaan eksplisit.                                            |
|                                                                                                                                                                                   |
| Bila muncul komponen yang belum ada di prototype, komponen tersebut dibuat mengikuti kaidah visual yang sudah berlaku di prototype, bukan mengikuti gaya bawaan pustaka mana pun. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**4.4 Kebijakan penanganan foto**

Urutan pemrosesan foto dari kamera aplikasi bersifat mengikat dan tidak boleh diubah urutannya:

-   Foto diambil melalui kamera di dalam aplikasi.

-   Sistem membaca koordinat dan waktu pada saat pengambilan.

-   Tanda air ditanamkan pada gambar.

-   Gambar dikompresi hingga paling besar 300 kilobita.

-   Gambar diunggah ke penyimpanan berkas.

Untuk foto dari galeri, langkah kedua dan ketiga dilewati karena waktu dan lokasi tidak dapat dijamin. Kompresi tetap dilakukan.

**4.5 Batasan arsitektur yang perlu diperhatikan**

-   **Tidak ada server aplikasi manual.** Seluruh logika data ditegakkan lewat aturan basis data dan aturan akses baris, bukan lewat kode server terpisah. Konsekuensinya, aturan keamanan pada Section 9 menjadi sangat menentukan.

-   **Ketergantungan pada layanan terkelola.** Bila layanan backend mengalami gangguan, seluruh sistem terpengaruh. Penanganan kondisi luring dibahas pada Section 8.2.

-   **Batas kuota layanan gratis.** Volume titik koordinat berpotensi cepat membesar. Strategi penyimpanan dan penyusutan data dibahas pada Section 5.9 dan Section 10.2.

**5. Model Data**

Section ini mendaftar seluruh entitas beserta kolom utamanya. Daftar kolom bersifat indikatif pada versi kerangka ini dan akan difinalkan saat modul terkait digali. Tipe data ditulis dalam istilah PostgreSQL.

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Aturan penamaan**                                                                                                                                                                   |
|                                                                                                                                                                                       |
| Nama tabel dan kolom ditulis dalam huruf kecil dengan pemisah garis bawah, memakai istilah Indonesia yang sama dengan Glosarium. Contoh: penugasan, laporan_harian, foto_dokumentasi. |
|                                                                                                                                                                                       |
| Setiap tabel wajib memiliki kolom identitas unik, kolom waktu pembuatan, dan kolom waktu perubahan terakhir. Ketiganya tidak diulang pada daftar di bawah agar tabel tetap ringkas.   |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**5.1 Tabel users**

Menyimpan seluruh akun pengguna dari empat peran, sekaligus posisi terakhir yang diketahui.

  --------------------------------------------------------------------------------------------------------------------------
  **Kolom**             **Tipe**       **Keterangan**
  --------------------- -------------- -------------------------------------------------------------------------------------
  nama                  text           Nama lengkap beserta gelar bila ada

  nrp                   text           Nomor registrasi pokok, unik

  pangkat               text           Pangkat kepolisian

  peran                 enum           Salah satu dari: kasubdit, kanit, panit, anggota

  unit                  text           Unit tempat pengguna bertugas

  aktif                 boolean        Penanda akun aktif atau dinonaktifkan

  sedang_bertugas       boolean        Menyala saat Sesi Tugas berjalan

  posisi_terakhir_lat   numeric        Lintang koordinat terakhir yang diterima

  posisi_terakhir_lng   numeric        Bujur koordinat terakhir yang diterima

  terakhir_terlihat     timestamptz    Waktu koordinat terakhir diterima, dasar penghitungan status hijau, kuning, abu-abu
  --------------------------------------------------------------------------------------------------------------------------

**5.2 Tabel penugasan**

Menyimpan SPT. Hanya Kanit yang boleh membuat baris pada tabel ini.

  ------------------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- --------------------------------------------------------------------
  nomor_spt          text           Nomor surat perintah tugas, unik

  judul              text           Judul penyelidikan

  objek              text           Objek penyelidikan

  sasaran            text           Sasaran kegiatan

  lokasi             text           Lokasi penugasan dalam bentuk teks

  lokasi_lat         numeric        Lintang titik sasaran, dipakai menghitung kedekatan lokasi laporan

  lokasi_lng         numeric        Bujur titik sasaran

  unit               text           Unit pemilik penugasan, menentukan siapa yang boleh melihat

  prioritas          enum           normal, penting, urgent

  status             enum           baru, berjalan, selesai, bermasalah

  tanggal_mulai      date           Awal berlakunya penugasan

  tanggal_batas      date           Batas waktu penugasan

  diterbitkan_oleh   uuid           Mengacu ke users, wajib berperan kanit
  ------------------------------------------------------------------------------------------------------

**5.3 Tabel penugasan_anggota**

Menghubungkan satu SPT dengan beberapa Anggota. Satu SPT dapat memuat lebih dari satu Anggota, dan satu Anggota dapat terlibat dalam lebih dari satu SPT.

  --------------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- ----------------------------------------------------------------
  penugasan_id       uuid           Mengacu ke penugasan

  anggota_id         uuid           Mengacu ke users, wajib berperan anggota

  sesi_aktif         boolean        Menyala saat Anggota ini sedang dalam Sesi Tugas untuk SPT ini

  sesi_mulai         timestamptz    Waktu Mulai Tugas terakhir

  sesi_selesai       timestamptz    Waktu Selesai Tugas terakhir
  --------------------------------------------------------------------------------------------------

**5.4 Tabel laporan_harian**

Lapis pertama pelaporan. Laporan singkat berkala dari lapangan.

  -----------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- -------------------------------------------------------
  penugasan_id       uuid           SPT yang dilaporkan

  anggota_id         uuid           Pengirim laporan

  jenis              enum           pulbaket awal, perkembangan, akhir

  uraian             text           Uraian kegiatan

  kendala            text           Kendala di lapangan, boleh kosong

  status_kegiatan    enum           berjalan, selesai, bermasalah

  lokasi_lat         numeric        Koordinat saat laporan dikirim, boleh kosong

  lokasi_lng         numeric        Koordinat saat laporan dikirim, boleh kosong

  status_lokasi      enum           terverifikasi, tidak_terekam

  alasan_lokasi      text           Wajib diisi bila status_lokasi bernilai tidak_terekam

  catatan_peninjau   text           Catatan dari Panit, Kanit, atau Kasubdit

  ditinjau_oleh      uuid           Mengacu ke users
  -----------------------------------------------------------------------------------------

**5.5 Tabel lhp**

Lapis kedua pelaporan. Formulir terstruktur yang menjadi dasar dokumen ekspor. Sebagian kolom terisi otomatis dari penugasan dan Sesi Tugas.

  -------------------------------------------------------------------------------------------
  **Kolom**               **Tipe**       **Keterangan**
  ----------------------- -------------- ----------------------------------------------------
  penugasan_id            uuid           SPT yang menjadi dasar

  disusun_oleh            uuid           Anggota penyusun

  dasar                   text           Dasar penugasan, terisi otomatis dari nomor SPT

  waktu_kegiatan          text           Waktu pelaksanaan, terisi otomatis dari Sesi Tugas

  tempat_kegiatan         text           Tempat atau lokasi kejadian

  perkara                 text           Uraian singkat perkara

  dasar_hukum             text           Pasal atau undang-undang yang disangkakan

  kronologis              text           Uraian hasil kegiatan dan fakta lapangan

  langkah                 text           Langkah yang telah dilakukan

  rencana_tindak_lanjut   text           Rencana berikutnya

  kesimpulan              text           Kesimpulan sementara

  catatan                 text           Catatan tambahan, boleh kosong

  status                  enum           draf, final
  -------------------------------------------------------------------------------------------

Bagian yang jumlahnya berubah-ubah tidak disimpan sebagai kolom teks, melainkan sebagai tabel anak agar dapat ditambah dan dikurangi:

  --------------------------------------------------------------------------------------------------------------
  **Tabel anak**       **Isi**
  -------------------- -----------------------------------------------------------------------------------------
  lhp_petugas          Daftar petugas pelaksana. Terisi otomatis dari Anggota pada SPT, masih dapat disunting.

  lhp_pihak            Daftar pelapor dan terlapor. Memuat peran pihak, nama, dan data pengenal bila ada.

  lhp_saksi            Daftar saksi yang diperiksa beserta kedudukannya.

  lhp_barang_bukti     Daftar barang bukti beserta keterangannya.
  --------------------------------------------------------------------------------------------------------------

+---------------------------------------------------------------------------------------------------------------------------------------------------+
| **Peringatan data sensitif**                                                                                                                      |
|                                                                                                                                                   |
| Tabel lhp dan tabel anaknya memuat data paling sensitif dalam sistem, antara lain identitas terlapor, nomor pengenal, dan uraian perkara.         |
|                                                                                                                                                   |
| Aturan akses baris untuk kelompok tabel ini harus disusun paling ketat. Rinciannya dibahas pada Section 9.                                        |
|                                                                                                                                                   |
| Terdapat butir kebijakan yang masih menunggu jawaban pemilik produk mengenai penyimpanan data ini pada layanan awan. Lihat Lampiran A butir A-02. |
+---------------------------------------------------------------------------------------------------------------------------------------------------+

**5.6 Tabel foto_dokumentasi**

  ----------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- ------------------------------------------------------------
  laporan_id         uuid           Laporan harian yang menaungi, boleh kosong

  lhp_id             uuid           LHP yang menaungi, boleh kosong

  penugasan_id       uuid           SPT terkait, selalu terisi

  diunggah_oleh      uuid           Anggota pengunggah

  sumber             enum           kamera, galeri

  berkas_path        text           Lokasi berkas pada penyimpanan

  keterangan         text           Keterangan foto

  tanda_air_waktu    timestamptz    Waktu pengambilan, terisi hanya untuk sumber kamera

  tanda_air_lat      numeric        Lintang saat pengambilan, terisi hanya untuk sumber kamera

  tanda_air_lng      numeric        Bujur saat pengambilan, terisi hanya untuk sumber kamera

  tanda_air_lokasi   text           Nama lokasi hasil penerjemahan koordinat
  ----------------------------------------------------------------------------------------------

**5.7 Tabel location_logs**

Menyimpan titik-titik Rute selama Sesi Tugas. Tabel dengan pertumbuhan paling cepat, sehingga memerlukan perhatian khusus pada indeks dan penyusutan data.

  ------------------------------------------------------------------------------------------------------------
  **Kolom**          **Tipe**       **Keterangan**
  ------------------ -------------- --------------------------------------------------------------------------
  penugasan_id       uuid           SPT pemilik Rute. Wajib terisi, tidak ada titik tanpa konteks penugasan.

  anggota_id         uuid           Pemilik titik

  lat                numeric        Lintang

  lng                numeric        Bujur

  akurasi            numeric        Perkiraan galat dalam meter

  direkam_pada       timestamptz    Waktu titik direkam di perangkat

  diterima_pada      timestamptz    Waktu titik diterima sistem, dapat berbeda bila pengiriman tertunda
  ------------------------------------------------------------------------------------------------------------

**5.8 Hubungan antar entitas**

  ---------------------------------------------------------------------------------------------------------------
  **Hubungan**                         **Jenis**        **Catatan**
  ------------------------------------ ---------------- ---------------------------------------------------------
  users ke penugasan                   satu ke banyak   Melalui kolom diterbitkan_oleh, hanya untuk peran kanit

  penugasan ke penugasan_anggota       satu ke banyak   Satu SPT dapat memuat beberapa Anggota

  users ke penugasan_anggota           satu ke banyak   Satu Anggota dapat terlibat di beberapa SPT

  penugasan ke laporan_harian          satu ke banyak   Beberapa laporan per SPT

  penugasan ke lhp                     satu ke banyak   Umumnya satu LHP per kegiatan, tidak dibatasi keras

  lhp ke tabel anak lhp                satu ke banyak   Petugas, pihak, saksi, dan barang bukti

  laporan_harian ke foto_dokumentasi   satu ke banyak   Beberapa foto per laporan

  lhp ke foto_dokumentasi              satu ke banyak   Foto dapat dilampirkan pada LHP

  penugasan ke location_logs           satu ke banyak   Rute selalu terikat pada SPT
  ---------------------------------------------------------------------------------------------------------------

**5.9 Kebijakan penyimpanan dan penyusutan data**

-   **Rute disimpan per penugasan.** Tidak ada pelacakan terus-menerus tanpa konteks. Setiap titik wajib memiliki penugasan_id.

-   **Foto disimpan satuan.** Foto tidak digabung saat pengiriman. Kolase dibentuk hanya saat diminta dan tidak mengubah berkas asli.

-   **Penyusutan location_logs.** Diperlukan aturan pengarsipan atau penghapusan titik lama agar volume terkendali. Ambang waktu dan mekanismenya ditetapkan saat Modul 6.4 digali.

-   **Data laporan dan LHP tidak dihapus otomatis.** Keduanya merupakan arsip kegiatan dan hanya dapat dihapus melalui tindakan yang tercatat pada jejak audit.

**6. Modul Fungsional**

Seluruh modul pada section ini masih berstatus \[KERANGKA\]. Yang tercantum di bawah adalah lingkup tanggung jawab tiap modul dan butir-butir yang sudah diputuskan. Rincian akan diisi saat modul digali satu per satu.

**6.0 Kerangka penggalian tiap modul**

Saat digali, setiap modul disusun memakai kerangka yang sama agar tidak ada bagian yang terlewat:

  ------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Bagian**                       **Isi yang harus ada**
  -------------------------------- ---------------------------------------------------------------------------------------------------------------------------
  Deskripsi                        Tanggung jawab modul dalam satu paragraf. Apa yang termasuk dan apa yang bukan urusannya.

  Cerita pengguna                  Ditulis dengan pola: sebagai \[peran\], saya ingin \[tindakan\], agar \[manfaat\]. Satu cerita untuk setiap kemampuan.

  Kriteria penerimaan              Kondisi terukur yang membuat modul dianggap benar. Ditulis dengan pola: bila \[kondisi\], maka \[hasil yang diharapkan\].

  Aturan modul                     Aturan yang hanya berlaku di modul ini. Aturan lintas modul ditulis di Section 7.

  Antarmuka dan kondisi tampilan   Halaman yang terlibat, kondisi kosong, kondisi memuat, kondisi galat, dan perbedaan tampilan antar peran.

  Edge case modul                  Kondisi tepi khusus modul ini. Kondisi tepi lintas modul ditulis di Section 8.

  Ketergantungan                   Modul lain yang harus selesai lebih dulu.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------

**6.1 Autentikasi & Peran**

Mengatur masuknya pengguna ke sistem dan penentuan peran. Menjadi fondasi seluruh modul lain karena setiap tampilan dan setiap akses data bergantung pada peran yang terdeteksi.

**Lingkup**

-   Masuk dan keluar sistem

-   Pembacaan peran dan unit pengguna yang sedang masuk

-   Perlindungan halaman berdasarkan peran, termasuk penanganan pengguna yang mencoba membuka halaman di luar kewenangannya

-   Pengelolaan sesi masuk, termasuk masa berlaku dan pembaruan otomatis

**Butir yang sudah final**

-   Terdapat empat peran: Kasubdit, Kanit, Panit, Anggota

-   Menu dan tombol yang tidak sesuai kewenangan tidak ditampilkan sama sekali, bukan ditampilkan dalam keadaan nonaktif

**Ketergantungan**

Tidak bergantung pada modul lain. Seluruh modul lain bergantung padanya, sehingga modul ini dikerjakan pertama.

**6.2 Manajemen Penugasan (SPT)**

Mengatur penerbitan, penyuntingan, dan penutupan SPT beserta penunjukan Anggota pelaksana.

**Lingkup**

-   Penerbitan SPT baru oleh Kanit

-   Penunjukan Anggota ke dalam SPT

-   Penyuntingan dan penutupan SPT

-   Daftar SPT dengan penyaring dan pencarian, mengikuti lingkup data tiap peran

-   Halaman rincian SPT, memuat keterangan penugasan, daftar Anggota pelaksana, dan rekam kegiatan

**Butir yang sudah final**

-   Hanya Kanit yang berwenang menerbitkan SPT

-   Prioritas memiliki tiga nilai: Normal, Penting, Urgent

-   Status memiliki empat nilai: Baru, Berjalan, Selesai, Bermasalah

-   Satu SPT dapat memuat lebih dari satu Anggota

**Butir yang menunggu keputusan**

+---------------------------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\]**                                                                                                        |
|                                                                                                                                       |
| Siapa yang menunjuk Anggota ke dalam SPT: Kanit sendiri saat menerbitkan, atau Panit setelah SPT terbit. Lihat Lampiran A butir A-01. |
+---------------------------------------------------------------------------------------------------------------------------------------+

**6.3 Pelaporan Kegiatan Harian & Foto**

Lapis pertama pelaporan. Laporan singkat berkala yang dikirim Anggota dari lapangan selama SPT berjalan, agar pimpinan mengetahui perkembangan tanpa menunggu kegiatan selesai.

**Lingkup**

-   Formulir laporan singkat: jenis laporan, uraian kegiatan, kendala, status kegiatan

-   Pelampiran foto pada laporan

-   Penetapan status lokasi laporan

-   Peninjauan laporan dan pemberian catatan oleh Panit, Kanit, atau Kasubdit

-   Riwayat laporan milik Anggota yang bersangkutan

**Butir yang sudah final**

-   Laporan dengan koordinat sah ditandai Terverifikasi di lokasi

-   Laporan tanpa koordinat sah tetap boleh dikirim, tetapi Anggota wajib memilih alasan, dan laporan ditandai Lokasi tidak terekam beserta alasannya

-   Tidak ada jalur pelaporan di luar sistem. Percakapan pesan singkat tidak diakui sebagai pelaporan resmi

-   Sistem tidak menolak dan tidak menuduh. Penilaian dilakukan manusia

**Yang perlu ditetapkan saat penggalian**

-   Daftar pilihan alasan saat lokasi tidak terekam

-   Ambang jarak yang membuat sebuah koordinat dianggap berada di lokasi tugas

-   Apakah laporan yang sudah terkirim dapat disunting, dan bila ya, dalam batas waktu berapa lama

**6.4 GPS Tracking & Peta Waktu Nyata**

Mengatur perekaman posisi Anggota selama Sesi Tugas dan penyajiannya di peta bagi pimpinan. Modul dengan aturan terbanyak dan kondisi tepi paling rumit.

**Lingkup**

-   Tombol Mulai Tugas dan Selesai Tugas pada sisi Anggota

-   Pengiriman koordinat selama Sesi Tugas, termasuk saat aplikasi berada di latar belakang

-   Penyimpanan Rute terikat pada SPT

-   Peta waktu nyata pada sisi pimpinan, menampilkan posisi Anggota yang sedang bertugas

-   Penelusuran Rute suatu SPT setelah kegiatan selesai

-   Penyajian status Terakhir terlihat

**Butir yang sudah final**

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Aturan**                      **Ketetapan**
  ------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Kapan Tracking berjalan         Hanya selama Sesi Tugas aktif. Di luar itu tidak ada perekaman posisi sama sekali.

  Syarat Mulai Tugas              GPS wajib aktif dan izin lokasi wajib diberikan. Bila tidak, Sesi Tugas tidak dapat dibuka.

  Frekuensi pengiriman            Gabungan jarak dan waktu. Koordinat dikirim bila perpindahan melebihi 25 meter, atau bila sudah lewat 30 detik sejak pengiriman terakhir, mana yang lebih dulu tercapai.

  Penyimpanan Rute                Per penugasan. Setiap titik wajib memiliki penugasan_id.

  Penentuan siapa yang bertugas   Ditentukan Anggota sendiri melalui tombol, bukan menyala otomatis.
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Penyajian status Terakhir terlihat**

  ----------------------------------------------------------------------------
  **Warna**      **Rentang waktu**     **Teks yang ditampilkan**
  -------------- --------------------- ---------------------------------------
  **Hijau**      Kurang dari 2 menit   Aktif

  **Kuning**     2 sampai 15 menit     Terakhir terlihat sekian menit lalu

  **Abu-abu**    Lebih dari 15 menit   Terakhir terlihat sekian waktu lalu
  ----------------------------------------------------------------------------

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Penerapan Prinsip Non-Menghakimi pada modul ini**                                                                                                                                          |
|                                                                                                                                                                                              |
| Status abu-abu tidak boleh diberi teks yang menyimpulkan kelalaian. Sistem hanya menyampaikan berapa lama koordinat terakhir diterima.                                                       |
|                                                                                                                                                                                              |
| Penyebab koordinat berhenti masuk bisa bermacam-macam: sinyal hilang, baterai habis, perangkat dimatikan, atau memang izin dicabut. Sistem tidak berwenang memilih penyebab mana yang benar. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Yang perlu ditetapkan saat penggalian**

-   Ambang waktu penyusutan data titik koordinat

-   Perlakuan terhadap titik dengan akurasi sangat rendah

-   Perlakuan terhadap indikasi lokasi palsu

-   Perlakuan bila Sesi Tugas tidak pernah ditutup Anggota

**6.5 Dashboard & Monitoring**

Menyajikan ringkasan keadaan sesuai lingkup masing-masing peran. Merupakan halaman pertama yang dilihat setiap pengguna setelah masuk.

**Lingkup**

-   Kartu ringkasan angka, berbeda isi untuk tiap peran

-   Daftar penugasan yang sedang berjalan

-   Umpan aktivitas terbaru

-   Peta posisi Anggota yang sedang bertugas

-   Ringkasan status personel

-   Rekapitulasi lintas unit, khusus Kasubdit

**Butir yang sudah final**

-   Isi dashboard mengikuti lingkup data pada matriks Section 2.3

-   Tombol penerbitan SPT hanya muncul pada dashboard Kanit

-   Menu dan rekapitulasi lintas unit hanya muncul pada dashboard Kasubdit

**6.6 Manajemen User**

Pengelolaan akun seluruh pengguna sistem. Kewenangan eksklusif Kasubdit.

**Lingkup**

-   Penambahan akun baru

-   Penyuntingan data akun, termasuk peran dan unit

-   Penonaktifan akun

-   Daftar akun beserta waktu akses terakhir

**Butir yang sudah final**

-   Hanya Kasubdit yang dapat membuka modul ini

-   Akun tidak dihapus, melainkan dinonaktifkan, agar riwayat laporan dan penugasan tetap utuh

**6.7 Dokumentasi Foto & Kolase Berkop**

Mengatur pengambilan, penandaan, penyimpanan, dan penyusunan foto dokumentasi lapangan.

**Lingkup**

-   Pengambilan foto melalui kamera aplikasi beserta penanaman tanda air

-   Pemilihan foto dari galeri perangkat

-   Kompresi sebelum pengunggahan

-   Penayangan foto satuan dengan tampilan layar penuh

-   Penyusunan dan pengunduhan Kolase berkop institusi

**Butir yang sudah final**

  -----------------------------------------------------------------------------------------------------------------------------------
  **Aturan**                     **Ketetapan**
  ------------------------------ ----------------------------------------------------------------------------------------------------
  Cara penyimpanan               Foto disimpan satuan dan tetap dapat dilihat terpisah. Kolase tidak menggantikan berkas asli.

  Foto dari kamera aplikasi      Diberi tanda air berisi waktu, koordinat, dan nama lokasi. Dilabeli Foto lapangan terverifikasi.

  Foto dari galeri               Tanpa tanda air. Dilabeli Foto lampiran secara netral.

  Jumlah minimum foto kamera     Tidak ada. Anggota bebas melampirkan foto dari sumber mana pun. Sistem cukup menandai sumbernya.

  Waktu pembuatan Kolase         Sesuai permintaan, melalui tindakan Ekspor Kolase. Bukan otomatis saat laporan dikirim.

  Kepala Kolase                  Memakai kop institusi Ditreskrimsus Polda Jawa Barat pada bagian atas gambar.

  Tata letak foto dalam Kolase   Foto ditampilkan utuh tanpa pemotongan. Sel kisi berukuran seragam, ruang sisa diisi latar netral.
  -----------------------------------------------------------------------------------------------------------------------------------

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Alasan foto tidak dipotong dalam Kolase**                                                                                                                                                                  |
|                                                                                                                                                                                                              |
| Foto penyelidikan sering memuat keterangan penting di tepi bingkai, misalnya papan nama, nomor kendaraan, atau keadaan sekitar. Pemotongan otomatis berisiko menghilangkan justru bagian yang menjadi bukti. |
|                                                                                                                                                                                                              |
| Ruang kosong yang timbul dinilai sebagai harga yang jauh lebih murah dibanding kehilangan keterangan.                                                                                                        |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**Yang perlu ditetapkan saat penggalian**

-   Susunan kisi Kolase menurut jumlah foto

-   Berkas kop institusi dan ukurannya

-   Format keluaran Kolase

-   Tata letak dan ukuran teks tanda air pada foto

**6.8 LHP Ringkas Otomatis**

Lapis kedua pelaporan. Anggota mengisi formulir terstruktur, sistem menyusunnya menjadi dokumen resmi yang siap dikirim ke pimpinan. Modul ini merupakan nilai tambah terbesar bagi Anggota karena menggantikan pengetikan dokumen secara manual.

**Lingkup**

-   Formulir terstruktur mengikuti kerangka LHP yang berlaku

-   Pengisian otomatis sebagian bagian dari data yang sudah ada di sistem

-   Bagian dengan jumlah baris berubah-ubah, dapat ditambah dan dikurangi

-   Penyimpanan sebagai draf sebelum difinalkan

-   Pelampiran foto dokumentasi

-   Ekspor menjadi dokumen PDF berkop dan dokumen Word

**Pembagian pengisian**

  ------------------------------------------------------------------------------------------------
  **Terisi otomatis dari sistem**                           **Diisi Anggota**
  --------------------------------------------------------- --------------------------------------
  Dasar penugasan, diambil dari nomor SPT                   Uraian perkara

  Waktu kegiatan, diambil dari Sesi Tugas                   Dasar hukum yang disangkakan

  Tempat kegiatan, diambil dari lokasi SPT atau koordinat   Pihak pelapor dan terlapor

  Daftar petugas, diambil dari Anggota pada SPT             Uraian kronologis dan fakta lapangan

  Kepala surat dan bagian penutup, dari templat institusi   Daftar saksi yang diperiksa

  Foto dokumentasi yang sudah diunggah                      Daftar barang bukti

                                                            Langkah yang telah dilakukan

                                                            Rencana tindak lanjut

                                                            Kesimpulan dan catatan
  ------------------------------------------------------------------------------------------------

**Butir yang sudah final**

-   Format ekspor: PDF berkop resmi dan Word, keduanya tersedia

-   Bagian petugas, pihak, saksi, dan barang bukti bersifat dinamis, jumlah barisnya dapat ditambah dan dikurangi

-   Daftar petugas terisi otomatis dari Anggota pada SPT, tetapi masih dapat disunting

-   LHP Resmi Lengkap tidak dibuat di sistem ini

**Butir yang menunggu keputusan**

+------------------------------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\]**                                                                                                           |
|                                                                                                                                          |
| Penyimpanan data sensitif penyelidikan pada layanan awan pihak ketiga yang servernya berada di luar negeri. Lihat Lampiran A butir A-02. |
|                                                                                                                                          |
| Butir ini dibahas bersamaan dengan penggalian Modul 6.8 dan Section 9.                                                                   |
+------------------------------------------------------------------------------------------------------------------------------------------+

**6.9 Notifikasi**

Menyampaikan kejadian penting kepada pengguna yang berkepentingan, agar tidak perlu memeriksa sistem secara berkala.

**Lingkup**

-   Pemberitahuan di dalam aplikasi, ditandai dengan lonceng dan penghitung

-   Daftar pemberitahuan dan penandaan sudah dibaca

-   Ruang untuk pemberitahuan dorong pada aplikasi Android, bila dibutuhkan pada tahap lanjut

**Kejadian yang memicu pemberitahuan**

  ---------------------------------------------------------------------------------
  **Kejadian**                                **Penerima**
  ------------------------------------------- -------------------------------------
  SPT baru diterbitkan dan Anggota ditunjuk   Anggota yang ditunjuk

  Laporan Kegiatan Harian masuk               Panit dan Kanit pada unit terkait

  Catatan peninjau diberikan pada laporan     Anggota penyusun laporan

  SPT ditandai bermasalah                     Kanit unit terkait dan Kasubdit

  LHP Ringkas difinalkan                      Panit dan Kanit pada unit terkait

  Batas waktu SPT terlampaui                  Anggota pelaksana, Panit, dan Kanit
  ---------------------------------------------------------------------------------

Pemberitahuan mengikuti lingkup data. Pengguna tidak boleh menerima pemberitahuan mengenai data yang tidak berhak ia lihat.

**7. Business Rules Global**

Aturan pada section ini berlaku lintas modul dan memiliki kekuatan tertinggi. Bila deskripsi modul mana pun bertentangan dengan aturan di bawah, aturan di bawah yang berlaku. Setiap aturan diberi kode agar dapat dirujuk dari modul lain.

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kode**   **Aturan**                                                                                                                                           **Modul terkait**
  ---------- ---------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------
  BR-01      Tracking hanya berjalan selama Sesi Tugas aktif. Di luar Sesi Tugas, sistem tidak merekam posisi Anggota sama sekali.                                6.4

  BR-02      Tindakan Mulai Tugas ditolak bila GPS tidak aktif atau izin lokasi tidak diberikan.                                                                  6.4

  BR-03      Laporan tetap boleh dikirim tanpa koordinat sah, tetapi Anggota wajib memilih alasan, dan laporan ditandai Lokasi tidak terekam beserta alasannya.   6.3

  BR-04      Tidak ada jalur pelaporan di luar sistem. Percakapan pesan singkat tidak diakui sebagai pelaporan resmi.                                             6.3, 6.8

  BR-05      Sistem menyajikan data apa adanya dan tidak menyimpulkan pelanggaran. Penilaian dilakukan manusia sesuai kewenangannya.                              Seluruh modul

  BR-06      SPT hanya dapat diterbitkan oleh Kanit.                                                                                                              6.2

  BR-07      Manajemen akun pengguna dan rekapitulasi lintas unit hanya dapat diakses Kasubdit.                                                                   6.5, 6.6

  BR-08      Foto dari kamera aplikasi wajib diberi tanda air waktu dan koordinat. Foto dari galeri dilabeli Foto lampiran tanpa tanda air.                       6.7

  BR-09      Kolase dibuat sesuai permintaan dan tidak mengubah berkas foto asli. Foto tetap tersimpan satuan.                                                    6.7

  BR-10      LHP Resmi Lengkap berada di luar cakupan sistem dan tidak boleh dibangun.                                                                            6.8, Section 12

  BR-11      Menu, tombol, dan tindakan yang berada di luar kewenangan peran tidak ditampilkan, bukan ditampilkan dalam keadaan nonaktif.                         Seluruh modul

  BR-12      Akun pengguna tidak dihapus, melainkan dinonaktifkan, agar riwayat penugasan dan laporan tetap utuh.                                                 6.6

  BR-13      Setiap titik koordinat wajib terikat pada satu SPT. Tidak ada perekaman posisi tanpa konteks penugasan.                                              6.4

  BR-14      Pemberitahuan mengikuti lingkup data. Pengguna tidak menerima pemberitahuan mengenai data yang tidak berhak ia lihat.                                6.9
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+-------------------------------------------------------------------------------------------------------------------------------------------+
| **Cara menambah aturan baru**                                                                                                             |
|                                                                                                                                           |
| Aturan baru diberi kode berikutnya secara berurutan dan tidak menggunakan kembali kode yang sudah dipakai, sekalipun aturan lama dicabut. |
|                                                                                                                                           |
| Aturan yang dicabut ditandai sebagai dicabut beserta alasannya, bukan dihapus dari daftar, agar riwayat keputusan tetap dapat ditelusuri. |
+-------------------------------------------------------------------------------------------------------------------------------------------+

**8. Edge Case & Error State**

Daftar kondisi tepi yang wajib memiliki penanganan tertulis. Pada versi kerangka ini yang dicantumkan adalah daftar kondisinya. Penanganan rinci ditetapkan saat modul terkait digali. AI Agent dilarang menentukan penanganan sendiri untuk kondisi yang belum memiliki ketetapan.

**8.1 Posisi dan GPS**

-   Sinyal posisi hilang di tengah Sesi Tugas

-   Izin lokasi dicabut pengguna saat Sesi Tugas sedang berjalan

-   Perangkat mati atau kehabisan daya saat bertugas

-   Koordinat diterima dengan akurasi sangat rendah

-   Terdapat indikasi pemakaian lokasi palsu

-   Sesi Tugas tidak pernah ditutup oleh Anggota

-   Perangkat mengirim koordinat dengan waktu yang jauh berbeda dari waktu server

**8.2 Jaringan**

-   Pengguna menekan kirim laporan dalam keadaan tanpa jaringan

-   Pengunggahan foto terputus di tengah jalan

-   Titik koordinat menumpuk saat jaringan hilang, lalu terkirim sekaligus saat jaringan pulih

-   Layanan backend tidak dapat dijangkau

**8.3 Foto**

-   Berkas melebihi batas ukuran meski sudah dikompresi

-   Format berkas tidak didukung

-   Penanaman tanda air gagal karena koordinat belum tersedia saat pengambilan

-   Kompresi gagal pada perangkat berkemampuan rendah

-   Penyusunan Kolase diminta pada laporan yang belum memiliki foto

**8.4 Kejadian bersamaan**

-   Dua pembaruan posisi tiba pada saat hampir bersamaan

-   SPT disunting Kanit saat Anggota sedang dalam Sesi Tugas untuk SPT tersebut

-   Dua peninjau memberi catatan pada laporan yang sama secara bersamaan

-   Anggota membuka Sesi Tugas pada dua perangkat sekaligus

**8.5 Sesi masuk dan peran**

-   Sesi masuk kedaluwarsa saat pengguna sedang mengisi formulir panjang

-   Peran pengguna diubah Kasubdit saat pengguna tersebut sedang masuk

-   Akun dinonaktifkan saat pengguna sedang dalam Sesi Tugas

-   Pengguna mencoba membuka halaman di luar kewenangannya melalui tautan langsung

**8.6 Keutuhan data**

-   SPT hendak dihapus padahal sudah memiliki laporan, foto, atau Rute

-   Anggota dikeluarkan dari SPT padahal sudah mengirim laporan untuk SPT tersebut

-   LHP dibuat untuk SPT yang sudah ditutup

-   Data rujukan hilang, misalnya penugasan yang diacu tidak lagi ditemukan

**8.7 LHP**

-   Bagian dinamis dikirim dalam keadaan kosong

-   Data pengisian otomatis tidak tersedia, misalnya Sesi Tugas tidak pernah dibuka

-   Ekspor dokumen gagal di tengah proses

-   Draf ditinggalkan dalam waktu lama tanpa difinalkan

-   Isi formulir melebihi ruang yang tersedia pada tata letak dokumen ekspor

**9. Keamanan & Row Level Security**

Karena sistem tidak memiliki server aplikasi yang ditulis manual, penegakan hak akses sepenuhnya bergantung pada aturan akses baris di tingkat basis data. Section ini karena itu bersifat menentukan, bukan pelengkap.

**9.1 Prinsip**

-   **Penolakan sebagai bawaan.** Setiap tabel dimulai dengan keadaan tidak dapat diakses siapa pun, lalu izin dibuka satu per satu sesuai kebutuhan.

-   **Dua lapis pemeriksaan.** Pemeriksaan kewenangan tindakan dan pemeriksaan lingkup data dilakukan terpisah, sesuai catatan pada Section 2.4.

-   **Aturan mengikuti matriks.** Seluruh aturan akses baris wajib sejalan dengan matriks hak akses pada Section 2.3. Bila terjadi perbedaan, matriks yang berlaku dan aturan diperbaiki.

-   **Perlindungan tidak boleh hanya di antarmuka.** Menyembunyikan tombol tidak dianggap sebagai pengamanan. Setiap pembatasan wajib ditegakkan juga di tingkat basis data.

**9.2 Aturan akses per tabel**

Disusun rinci saat penggalian. Kerangka arahnya sebagai berikut:

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Tabel**               **Arah aturan**
  ----------------------- ------------------------------------------------------------------------------------------------------------------------------------------------
  users                   Pengguna dapat membaca datanya sendiri. Pimpinan membaca data dalam lingkupnya. Penulisan dan penonaktifan hanya oleh Kasubdit.

  penugasan               Pembacaan mengikuti lingkup unit. Penulisan hanya oleh Kanit pada unitnya sendiri.

  penugasan_anggota       Anggota membaca barisnya sendiri. Pimpinan membaca dalam lingkupnya. Penulisan mengikuti keputusan butir A-01.

  laporan_harian          Anggota menulis dan membaca laporannya sendiri. Pimpinan membaca dan memberi catatan dalam lingkupnya.

  lhp dan tabel anaknya   Aturan paling ketat. Anggota menulis dan membaca LHP miliknya. Pimpinan membaca dalam lingkupnya. Perlu penetapan siapa yang boleh mengekspor.

  foto_dokumentasi        Mengikuti hak akses laporan atau LHP yang menaunginya.

  location_logs           Anggota membaca Rute miliknya. Pimpinan membaca dalam lingkupnya. Penulisan hanya oleh Anggota pemilik selama Sesi Tugas aktif.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**9.3 Penyimpanan berkas foto**

Berkas foto tidak boleh dapat diakses siapa pun yang mengetahui tautannya. Akses berkas mengikuti hak akses laporan atau LHP yang menaunginya, dan diberikan melalui tautan bermasa berlaku terbatas.

**9.4 Data lokasi dan data perkara**

Dua kelompok data ini memerlukan perlakuan khusus. Data lokasi mengungkap pergerakan seseorang, sedangkan data perkara memuat identitas pihak dan uraian dugaan tindak pidana. Keduanya hanya boleh dibuka kepada peran yang berkepentingan dalam lingkupnya, dan setiap pembukaan yang bersifat luas dicatat pada jejak audit.

**9.5 Butir kebijakan yang menunggu jawaban**

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **\[PERLU KONFIRMASI KLIEN\] Penyimpanan data sensitif pada layanan awan**                                                                                                                                                                                |
|                                                                                                                                                                                                                                                           |
| Sistem direncanakan memakai layanan basis data terkelola yang servernya berada di luar wilayah Indonesia. Modul LHP Ringkas memuat identitas pihak, nomor pengenal, dan uraian perkara.                                                                   |
|                                                                                                                                                                                                                                                           |
| Pemilik produk perlu memastikan apakah penyimpanan data tersebut pada layanan pihak ketiga di luar negeri diperbolehkan menurut ketentuan yang berlaku di lingkungan institusi.                                                                           |
|                                                                                                                                                                                                                                                           |
| Butir ini dicatat sebagai kehati-hatian, bukan sebagai penghalang. Bila terdapat batasan, tersedia beberapa arah penyelesaian: penyandian kolom tertentu, pemisahan data paling sensitif, atau pemasangan layanan basis data pada server milik institusi. |
|                                                                                                                                                                                                                                                           |
| Sampai butir ini terjawab, pembangunan Modul 6.8 dapat berjalan pada bagian yang tidak menyimpan data pengenal, sedangkan penyimpanan data pengenal ditahan.                                                                                              |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**9.6 Jejak audit**

Sistem mencatat tindakan penting beserta pelaku dan waktunya. Daftar tindakan yang dicatat ditetapkan saat penggalian, sekurang-kurangnya mencakup penerbitan dan penutupan SPT, penonaktifan akun, perubahan peran, finalisasi LHP, dan pengeksporan dokumen.

**10. Kebutuhan Non-Fungsional**

Kebutuhan yang tidak berupa fitur, tetapi menentukan apakah sistem dapat dipakai dalam keadaan sebenarnya di lapangan.

**10.1 Kinerja**

  ---------------------------------------------------------------------------------------------------------------------------------
  **Aspek**                                **Sasaran**
  ---------------------------------------- ----------------------------------------------------------------------------------------
  Waktu muat halaman utama                 Ditetapkan saat penggalian, mengingat sebagian pengguna memakai jaringan seluler lemah

  Jeda pembaruan posisi di peta            Sedapat mungkin mengikuti frekuensi pengiriman koordinat

  Jumlah Anggota bertugas bersamaan        Perkiraan awal mengikuti jumlah personel Subdit IV

  Waktu penyusunan Kolase dan ekspor LHP   Ditetapkan saat penggalian modul terkait
  ---------------------------------------------------------------------------------------------------------------------------------

**10.2 Volume data**

Tabel titik koordinat merupakan tabel dengan pertumbuhan tercepat. Perkiraan kasar: seorang Anggota yang bertugas selama satu hari kerja dapat menghasilkan ratusan hingga seribu titik. Bila puluhan Anggota bertugas bersamaan, pertumbuhan harian mencapai puluhan ribu baris.

Karena itu diperlukan pembatasan yang disengaja: Rute hanya disimpan per penugasan, terdapat aturan penyusutan data lama, dan indeks disusun agar penelusuran Rute tetap cepat. Ambang dan mekanismenya ditetapkan saat Modul 6.4 digali.

**10.3 Kesesuaian perangkat**

-   **Versi Android minimum.** Ditetapkan saat penggalian, dengan mempertimbangkan perangkat yang benar-benar dipakai Anggota.

-   **Perangkat berkemampuan rendah.** Kompresi foto dan penyusunan Kolase harus tetap berjalan, meski lebih lambat.

-   **Keragaman ketelitian posisi.** Ketelitian GPS antar perangkat berbeda jauh. Sistem tidak boleh berasumsi seluruh perangkat memberi koordinat setelitinya.

-   **Pengelolaan daya yang agresif.** Sejumlah merek perangkat menghentikan proses latar belakang secara sepihak. Diperlukan panduan pengaturan bagi Anggota, lihat Section 11.3.

**10.4 Daya dan kuota**

Frekuensi gabungan jarak dan waktu dipilih justru untuk menekan pemakaian daya dan kuota. Saat Anggota diam mengamati satu titik, koordinat tidak dikirim berulang-ulang. Dampak sebenarnya terhadap daya diukur saat pengujian di perangkat nyata, bukan diperkirakan di atas kertas.

**10.5 Kemudahan pemakaian**

-   Seluruh antarmuka memakai Bahasa Indonesia

-   Sasaran sentuh berukuran cukup besar untuk dipakai sambil berdiri di lapangan

-   Kontras warna cukup untuk dibaca di bawah cahaya matahari langsung

-   Tampilan mengutamakan layar telepon genggam pada seluruh halaman yang dipakai Anggota

-   Bagian yang dipakai pimpinan tetap nyaman pada layar lebar

**11. Alur Aplikasi & Packaging**

Mengatur bagaimana aplikasi sampai ke tangan Anggota dan bagaimana Anggota menyiapkan perangkatnya. Bagian ini kerap diabaikan padahal menjadi penyebab paling sering kegagalan pemakaian di lapangan.

**11.1 Penyebaran aplikasi**

-   Berkas pemasangan Android dibagikan langsung kepada Anggota melalui saluran internal

-   Anggota perlu mengizinkan pemasangan dari sumber di luar toko aplikasi

-   Aplikasi tidak diterbitkan di toko aplikasi umum

-   Tersedia pula bentuk aplikasi web progresif yang dapat dipasang ke layar utama tanpa berkas pemasangan

**11.2 Urutan permintaan izin**

Urutan berikut bersifat mengikat karena menentukan keberhasilan Tracking:

-   Izin lokasi saat aplikasi dipakai, diminta pada pemakaian pertama

-   Izin lokasi sepanjang waktu, diminta saat Anggota pertama kali membuka Sesi Tugas, disertai penjelasan singkat alasannya

-   Izin kamera, diminta saat Anggota pertama kali mengambil foto

-   Izin penyimpanan, diminta hanya bila diperlukan untuk mengunduh hasil ekspor

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Batasan sistem operasi yang tidak dapat dihindari**                                                                                                                                         |
|                                                                                                                                                                                               |
| Izin lokasi sepanjang waktu tidak dapat diberikan dari dalam aplikasi. Pengguna harus memilihnya sendiri melalui pengaturan sistem.                                                           |
|                                                                                                                                                                                               |
| Karena itu diperlukan panduan bergambar bagi Anggota. Tanpa panduan, banyak pengguna berhenti pada pilihan izin hanya saat aplikasi dipakai, sehingga Tracking latar belakang tidak berjalan. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**11.3 Pengaturan penghematan daya**

Sebagian perangkat menghentikan proses latar belakang untuk menghemat daya, sehingga pengiriman koordinat terputus meski Sesi Tugas masih berjalan. Diperlukan panduan penonaktifan penghematan daya khusus untuk aplikasi ini, disertai langkah terpisah untuk merek yang dikenal paling agresif.

**11.4 Pengenalan bagi Anggota**

Pada pemakaian pertama, Anggota dituntun melalui langkah singkat: pengenalan tombol Mulai Tugas, cara mengirim laporan, cara mengambil foto, dan penjelasan bahwa Tracking hanya berjalan selama Sesi Tugas. Penjelasan terakhir penting untuk menjaga kepercayaan.

**11.5 Pembaruan aplikasi**

-   Pembaruan bagian antarmuka pada bentuk web berlaku langsung tanpa tindakan pengguna

-   Pembaruan pada bentuk aplikasi Android memerlukan pembagian berkas baru dan pemasangan ulang

-   Diperlukan penanda versi di dalam aplikasi agar mudah diketahui siapa yang masih memakai versi lama

**12. Di Luar Cakupan**

Daftar berikut bersifat mengikat. AI Agent dilarang membangun hal-hal di bawah ini sekalipun tampak sebagai kelanjutan yang wajar dari modul yang sedang dikerjakan. Bila muncul kebutuhan yang menyerupai salah satu butir ini, kebutuhan tersebut dilaporkan sebagai usulan, bukan langsung dibangun.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Tidak dibangun**                                     **Alasan**
  ------------------------------------------------------ -----------------------------------------------------------------------------------------------------
  LHP Resmi Lengkap                                      Dokumen penyidikan penuh yang menuntut pertimbangan hukum penyidik. Disusun manual di luar sistem.

  Penilaian atau pemeringkatan Anggota secara otomatis   Bertentangan dengan Prinsip Non-Menghakimi pada Section 0.6.

  Percakapan atau forum di dalam aplikasi                Menambah cakupan tanpa menjawab masalah utama. Komunikasi tetap memakai saluran yang ada.

  Penyambungan ke sistem institusi lain                  Memerlukan izin dan koordinasi di luar kendali proyek pada tahap ini.

  Versi iOS                                              Perangkat Anggota didominasi Android. Ditunda ke tahap berikutnya.

  Penerbitan di toko aplikasi umum                       Aplikasi bersifat internal. Penerbitan publik menambah persyaratan yang tidak sebanding manfaatnya.

  Pelacakan posisi di luar Sesi Tugas                    Bertentangan dengan BR-01 dan BR-13. Tidak boleh dibangun dalam bentuk apa pun.

  Penolakan laporan karena lokasi tidak terekam          Bertentangan dengan BR-03. Laporan tetap harus dapat dikirim.
  ------------------------------------------------------------------------------------------------------------------------------------------------------------

**Lampiran A --- Butir yang Perlu Dikonfirmasi ke Klien**

Daftar pertanyaan terbuka yang menunggu jawaban pemilik produk. Selama belum terjawab, bagian yang bergantung padanya tidak diimplementasikan.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kode**   **Butir**                                     **Pertanyaan**                                                                                                                      **Dampak bila tidak terjawab**
  ---------- --------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------
  A-01       Penunjukan Anggota ke SPT                     Siapa yang menentukan Anggota mana yang masuk ke dalam SPT: Kanit saat menerbitkan, atau Panit setelah SPT terbit                   Aturan akses baris pada tabel penugasan_anggota tidak dapat disusun. Modul 6.2 tertahan sebagian.

  A-02       Penyimpanan data sensitif pada layanan awan   Apakah identitas pihak, nomor pengenal, dan uraian perkara boleh disimpan pada layanan pihak ketiga yang servernya di luar negeri   Penyimpanan data pengenal pada Modul 6.8 tertahan. Perlu arah penyelesaian alternatif bila tidak diperbolehkan.

  A-03       Angka target metrik keberhasilan              Berapa angka sasaran untuk tiap metrik pada Section 1.4                                                                             Keberhasilan sistem tidak dapat diukur secara obyektif.

  A-04       Berkas kop institusi                          Berkas gambar kop untuk Kolase dan templat kop untuk dokumen LHP                                                                    Modul 6.7 dan 6.8 tidak dapat menghasilkan keluaran akhir.

  A-05       Daftar alasan lokasi tidak terekam            Pilihan alasan apa saja yang disediakan bagi Anggota                                                                                Modul 6.3 tidak dapat menerapkan BR-03 sepenuhnya.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Lampiran B --- Daftar Keputusan yang Sudah Final**

Ringkasan seluruh keputusan yang sudah terkunci pada versi 0.2. Butir-butir ini tidak perlu ditanyakan ulang saat penggalian modul, dan hanya dapat diubah melalui revisi dokumen yang tercatat pada Riwayat Revisi.

**B.1 Peran dan kewenangan**

-   Terdapat empat peran: Kasubdit, Kanit, Panit, Anggota

-   Kasubdit melihat seluruh unit; Kanit melihat unitnya sendiri; Panit melihat timnya; Anggota melihat miliknya sendiri

-   Menerbitkan SPT adalah kewenangan eksklusif Kanit

-   Manajemen akun pengguna dan rekapitulasi lintas unit adalah kewenangan eksklusif Kasubdit

-   Panit berperan sebagai pengawas dan peninjau, bukan penerbit penugasan

**B.2 Posisi dan Sesi Tugas**

-   Tracking berjalan hanya selama Sesi Tugas

-   Sesi Tugas dibuka dan ditutup Anggota melalui tombol, tidak menyala otomatis

-   Mulai Tugas mensyaratkan GPS aktif dan izin lokasi diberikan

-   Koordinat dikirim bila perpindahan melebihi 25 meter atau sudah lewat 30 detik sejak pengiriman terakhir, mana yang lebih dulu

-   Rute disimpan per penugasan, tidak ada pelacakan tanpa konteks

-   Status kehadiran ditulis sebagai Terakhir terlihat dengan tiga tingkat warna, tanpa menyimpulkan penyebabnya

**B.3 Pelaporan**

-   Terdapat tiga lapis pelaporan; lapis pertama dan kedua di dalam sistem, lapis ketiga di luar sistem

-   Laporan dengan koordinat sah ditandai Terverifikasi di lokasi

-   Laporan tanpa koordinat sah tetap dapat dikirim, wajib disertai alasan, ditandai Lokasi tidak terekam

-   Tidak ada jalur pelaporan di luar sistem

-   LHP Ringkas diekspor ke PDF berkop dan Word

-   Bagian petugas, pihak, saksi, dan barang bukti pada LHP bersifat dinamis

**B.4 Foto dan dokumentasi**

-   Foto disimpan satuan, bukan digabung saat pengiriman

-   Foto dari kamera aplikasi diberi tanda air waktu dan koordinat, dilabeli Foto lapangan terverifikasi

-   Foto dari galeri tanpa tanda air, dilabeli Foto lampiran

-   Tidak ada jumlah minimum foto dari kamera

-   Kolase dibuat sesuai permintaan, memakai kop institusi, foto ditampilkan utuh tanpa pemotongan

-   Foto dikompresi hingga paling besar 300 kilobita sebelum diunggah

**B.5 Teknologi dan penyebaran**

-   Antarmuka memakai Next.js dengan React dan TypeScript serta Tailwind CSS

-   Backend dan basis data memakai Supabase

-   Peta memakai Leaflet dengan OpenStreetMap

-   Pelacakan latar belakang memakai Capacitor

-   Disebarkan sebagai aplikasi web progresif dan berkas pemasangan Android internal, tidak melalui toko aplikasi umum

-   Gaya visual diambil dari prototype HTML yang sudah ada, tanpa membuat arah desain baru

**B.6 Prinsip yang mengikat**

-   Prinsip Ekstensibilitas: sistem dibangun modular, penambahan fitur tidak boleh memaksa penulisan ulang modul lain

-   Prinsip Non-Menghakimi: sistem menyajikan data, manusia yang menilai

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Akhir dokumen versi kerangka 0.2**                                                                                                                                                                            |
|                                                                                                                                                                                                                 |
| Langkah berikutnya adalah menggali satu modul dari Section 6 sampai tingkat terkecil memakai kerangka pada Section 6.0, lalu menyatukan hasilnya kembali ke dokumen ini.                                        |
|                                                                                                                                                                                                                 |
| Urutan penggalian yang disarankan mengikuti ketergantungan antar modul: 6.1 lebih dahulu karena menjadi fondasi, disusul 6.2 sebagai inti alur kerja, lalu 6.4 yang memiliki aturan dan kondisi tepi terbanyak. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+


---
---

# BAGIAN B — MODUL 6.1 AUTENTIKASI & PERAN

# SiPANTAU — Revisi PRD v0.3

**Hasil penggalian Modul 6.1 (Autentikasi & Peran) beserta perubahan section yang terdampak**

Tanggal: 31 Juli 2026 · Menggantikan bagian terkait pada versi kerangka 0.2

---

## Cara memakai berkas ini

Berkas ini memuat enam bagian pengganti. Tempel masing-masing menggantikan bagian lama dengan nomor yang sama pada PRD utama, lalu naikkan versi dokumen menjadi 0.3 dan catat pada Riwayat Revisi.

| Urutan tempel | Bagian | Sifat perubahan |
| --- | --- | --- |
| 1 | Section 2.3, 2.4, 2.5 | Ditulis ulang — lingkup Panit dan jalur reset kata sandi berubah |
| 2 | Section 3.1, 3.2 (tambahan), 3.6 (baru) | Penambahan istilah baku |
| 3 | Section 5.1, 5.10–5.14 (baru) | Kolom baru dan lima tabel baru |
| 4 | Section 6.1 | Ditulis ulang penuh — inti berkas ini |
| 5 | Section 7 | BR-07 direvisi, BR-15 sampai BR-21 ditambahkan |
| 6 | Section 9.2, 9.6 | Aturan akses baris dan jejak audit |
| 7 | Lampiran A dan B | A-01 dicoret, A-06 sampai A-08 ditambahkan |

> **Peringatan urutan.** Section 7 dan 9 memiliki kekuatan lebih tinggi daripada Section 6 menurut aturan Section 0.3. Bila salah satu tidak ikut ditempel, Modul 6.1 akan bertentangan dengan dokumen induknya dan AI Agent akan mengikuti aturan lama.

---

## Riwayat Revisi — baris tambahan

| Versi | Status | Perubahan |
| --- | --- | --- |
| 0.3 | Berlaku | Modul 6.1 digali penuh dan berstatus [FINAL]. Lingkup data Panit diubah dari berbasis unit menjadi berbasis penugasan. Panit memperoleh kewenangan membuka Sesi Tugas dan mengirim Laporan Kegiatan Harian. Kanit memperoleh kewenangan mereset kata sandi dalam unitnya. Ditambahkan Akun Pemeliharaan. Ditetapkan aturan satu perangkat per akun. Ditambahkan lima tabel: unit, penugasan_panit, perangkat_masuk, jejak_audit, dan kolom-kolom baru pada users. Butir A-01 terjawab. |

---
---

# 1. Pengganti Section 2.3, 2.4, dan 2.5

## 2.3 Matriks hak akses

**[FINAL]**

Tabel ini mengikat. Implementasi Row Level Security pada Section 9 harus sejalan dengan isinya.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Melihat dashboard | Semua unit | Unit sendiri | Penugasan yang diawasinya | Milik sendiri |
| Menerbitkan SPT | Tidak | **Ya (eksklusif)** | Tidak | Tidak |
| Menugaskan Panit dan Anggota ke SPT | Tidak | **Ya (eksklusif)** | Tidak | Tidak |
| Melihat daftar SPT | Semua unit | Unit sendiri | Yang ia awasi saja | Yang ditujukan padanya |
| Mengubah dan menutup SPT | Tidak | Ya (unit sendiri) | Tidak | Tidak |
| Membuka dan menutup Sesi Tugas | Tidak | Tidak | **Ya** | **Ya** |
| Mengirim Pelaporan Kegiatan Harian | Tidak | Tidak | **Ya** | **Ya** |
| Meninjau dan memberi catatan laporan | Semua unit | Unit sendiri | Penugasan yang diawasinya | Tidak |
| Menyusun LHP Ringkas | Tidak | Tidak | **Tidak** | **Ya** |
| Melihat LHP Ringkas | Semua unit | Unit sendiri | Penugasan yang diawasinya | Milik sendiri |
| Mengekspor LHP ke PDF dan Word | Ya | Ya | Penugasan yang diawasinya | Miliknya sendiri |
| Melihat peta Tracking waktu nyata | Semua unit | Unit sendiri | Penugasan yang diawasinya | Posisi sendiri |
| Melihat rute per SPT | Semua unit | Unit sendiri | Penugasan yang diawasinya | Rute sendiri |
| Mengekspor Kolase foto | Ya | Ya | Penugasan yang diawasinya | Tidak |
| Rekapitulasi lintas unit | **Ya (eksklusif)** | Tidak | Tidak | Tidak |
| Manajemen akun pengguna | **Ya (eksklusif)** | Tidak | Tidak | Tidak |
| Mereset kata sandi | Semua pengguna | Anggota dan Panit di unitnya | Tidak | Tidak |
| Mengelola daftar unit | **Ya (eksklusif)** | Tidak | Tidak | Tidak |

### Perubahan dari versi 0.2 dan alasannya

| Yang berubah | Sebelumnya | Sekarang | Alasan |
| --- | --- | --- | --- |
| Panit membuka Sesi Tugas | Tidak | Ya | Panit kerap ikut turun ke lapangan. Keputusan pemilik produk. |
| Panit mengirim Laporan Harian | Tidak | Ya | Konsekuensi langsung dari kewenangan Sesi Tugas. |
| Panit menyusun LHP Ringkas | Tidak | Tetap tidak | LHP Ringkas disusun Anggota. Ditegaskan pemilik produk. |
| Lingkup data Panit | Seluruh unit | Penugasan yang diawasinya | Tim bersifat dinamis per penugasan, bukan struktur tetap. |
| Kanit mereset kata sandi | Tidak | Ya, terbatas unitnya | Kasubdit tidak selalu aktif memakai sistem. Tanpa ini, pemulihan akun macet. |
| Menugaskan Anggota ke SPT | Belum ditetapkan | Kanit | Jawaban butir A-01. |

## 2.4 Hierarki dan pewarisan lingkup data

**[FINAL]**

Struktur organisasi yang dipakai sistem:

```
Kasubdit
  └── memegang beberapa Unit
        └── setiap Unit diketuai satu Kanit
              ├── beberapa Panit
              └── beberapa Anggota
```

Lingkup data bersifat menurun untuk Kasubdit dan Kanit. Untuk Panit, lingkup data **tidak** mengikuti struktur organisasi melainkan mengikuti penugasan.

| Peran | Melihat data milik | Catatan penting |
| --- | --- | --- |
| Kasubdit | Seluruh unit, seluruh Kanit, Panit, dan Anggota | Lingkup data paling luas, tetapi tidak berwenang menerbitkan SPT |
| Kanit | Unitnya sendiri: seluruh Panit dan Anggota di unit tersebut | Tidak dapat melihat unit lain sekalipun sebagai pembanding |
| Panit | Hanya penugasan tempat ia ditunjuk sebagai Panit Penanggung Jawab, beserta seluruh Anggota di dalamnya | **Tidak** melihat penugasan lain di unitnya. Riwayat penugasan lama yang pernah ia awasi tetap terbaca selamanya. |
| Anggota | Hanya miliknya sendiri | Tidak dapat melihat penugasan atau laporan Anggota lain |

> **Mengapa lingkup Panit tidak mengikuti unit**
>
> Susunan tim ditetapkan Kanit setiap kali SPT diterbitkan, bukan sekali di awal lalu berlaku selamanya. Satu SPT dapat memiliki lebih dari satu Panit Penanggung Jawab, dan seorang Panit dapat mengawasi beberapa SPT sekaligus.
>
> Konsekuensinya, pertanyaan "Anggota siapa saja yang berada di bawah Panit ini" tidak memiliki jawaban tetap. Jawabannya hanya ada dalam konteks satu penugasan tertentu. Karena itu aturan akses baris untuk Panit wajib menelusuri tabel `penugasan_panit`, bukan membandingkan kolom `unit`.

> **Perbedaan lingkup data dan kewenangan tindakan**
>
> Kedua hal ini terpisah dan tidak boleh dicampur saat implementasi. Kasubdit memiliki lingkup data terluas, tetapi kewenangan menerbitkan SPT justru hanya ada pada Kanit. Panit kini memiliki dua kedudukan sekaligus: pengawas atas penugasan yang diawasinya, dan pelaksana atas Sesi Tugas yang ia buka sendiri.
>
> Artinya, pemeriksaan izin dilakukan dua kali: pertama memeriksa apakah peran boleh melakukan tindakan tersebut, kedua memeriksa apakah data yang disentuh berada dalam lingkupnya.

## 2.5 Akun Pemeliharaan

**[FINAL]**

Di luar empat peran organisasi, sistem mengenal satu akun teknis bernama **Akun Pemeliharaan**. Akun ini bukan jabatan dan tidak melekat pada unit mana pun.

| Aspek | Ketetapan |
| --- | --- |
| Jumlah | Tepat satu di seluruh sistem |
| Tujuan | Pemulihan akses saat seluruh jalur normal buntu, dan pendampingan teknis |
| Lingkup data | Seluruh tabel tanpa kecuali, termasuk LHP, laporan harian, foto dokumentasi, dan titik koordinat |
| Pemegang | Pemilik produk (Kanit I) dan developer, keduanya |
| Kewenangan tindakan | Mereset kata sandi, mengaktifkan kembali akun, membaca seluruh data. **Tidak** menerbitkan SPT, **tidak** membuka Sesi Tugas, **tidak** menyusun LHP |
| Pencatatan | Seluruh tindakan wajib masuk jejak audit dan tidak dapat dihapus dari dalam aplikasi |
| Penampakan | Tidak muncul pada daftar personel, tidak dapat dipilih sebagai pelaksana SPT, tidak muncul pada peta |
| Serah terima | Hanya Kasubdit yang dapat mengganti kredensialnya, dan penggantian tercatat pada jejak audit |

> **Catatan untuk pemilik produk**
>
> Lingkup akses penuh pada akun ini adalah keputusan pemilik produk, tercatat pada Lampiran B butir B.7. Karena akun ini dapat membaca identitas pihak dan uraian perkara, keberadaannya sebaiknya tercatat tertulis pada dokumen serah terima proyek, lengkap dengan nama pemegangnya. Butir A-08 pada Lampiran A menampung hal ini.

---
---

# 2. Tambahan Section 3 — Glosarium

## 3.1 Istilah peran — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Panit Penanggung Jawab** | Panit yang ditunjuk Kanit untuk mengawasi satu SPT tertentu. Satu SPT dapat memiliki lebih dari satu Panit Penanggung Jawab. Penunjukan berlaku per SPT, bukan permanen. |
| **Akun Pemeliharaan** | Akun teknis tunggal di luar empat peran organisasi, dipakai untuk pemulihan akses dan pendampingan teknis. Bukan jabatan. Dilarang disebut sebagai peran kelima, akun admin, atau superuser. |

## 3.2 Istilah penugasan dan kegiatan — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Tim** | Susunan Panit Penanggung Jawab dan Anggota pelaksana pada satu SPT. Tim melekat pada SPT, bukan pada unit, dan disusun ulang setiap kali SPT baru diterbitkan. Dilarang dipakai untuk menyebut isi satu unit secara keseluruhan. |

## 3.6 Istilah autentikasi — bagian baru

Bagian ini ditambahkan karena kata "sesi" sebelumnya dipakai untuk dua hal berbeda. Pemisahan ini mengikat.

| Istilah | Definisi tunggal |
| --- | --- |
| **Sesi Masuk** | Keadaan seorang pengguna terautentikasi pada satu perangkat. Dimulai saat berhasil masuk, berakhir saat keluar, saat akun dinonaktifkan, atau saat digeser oleh Sesi Masuk baru di perangkat lain. **Tidak ada hubungannya dengan pelacakan posisi.** |
| **Sesi Tugas** | Rentang waktu seorang Anggota atau Panit sedang melaksanakan kegiatan lapangan untuk satu SPT, dibuka dan ditutup melalui tombol. Hanya selama Sesi Tugas posisi direkam. Istilah ini sudah berlaku sejak versi 0.2 dan maknanya tidak berubah. |
| **Kata Sandi Sementara** | Kata sandi yang ditetapkan pembuat akun atau pereset, berlaku tepat satu kali masuk, dan wajib diganti pengguna sebelum dapat memakai sistem. |
| **Kunci Aplikasi** | Lapisan pengaman lokal berupa PIN enam angka atau sidik jari yang ditanyakan saat aplikasi dibuka kembali. Berjalan sepenuhnya di perangkat dan tidak menggantikan Sesi Masuk. |
| **Perangkat Terdaftar** | Satu perangkat yang sedang memegang Sesi Masuk aktif untuk sebuah akun. Setiap akun hanya memiliki satu pada satu waktu. |

---
---

# 3. Pengganti Section 5.1 dan Section 5.10 sampai 5.14

## 5.1 Tabel users

**[FINAL]**

Menyimpan seluruh akun pengguna dari empat peran serta Akun Pemeliharaan, sekaligus posisi terakhir yang diketahui.

Kolom identitas unik tabel ini **wajib bernilai sama** dengan identitas pengguna pada sistem autentikasi bawaan Supabase. Tanpa kesamaan ini, seluruh aturan akses baris pada Section 9 kehilangan pegangannya.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Identitas unik. **Wajib sama** dengan id pada tabel autentikasi Supabase |
| nama | text | Nama lengkap beserta gelar bila ada |
| nrp | text | Nomor registrasi pokok, unik, dipakai sebagai identitas masuk |
| email_sistem | text | Email sintetis berbentuk `<nrp>@sipantau.internal`, dibangkitkan sistem, unik. Tidak pernah ditampilkan kepada pengguna dan tidak pernah dikirimi surat elektronik |
| pangkat | text | Pangkat kepolisian |
| peran | enum | Salah satu dari: kasubdit, kanit, panit, anggota, pemeliharaan |
| unit_id | uuid | Mengacu ke tabel unit. Bernilai kosong hanya untuk peran pemeliharaan |
| aktif | boolean | Penanda akun aktif atau dinonaktifkan |
| wajib_ganti_sandi | boolean | Bernilai benar setelah akun dibuat atau kata sandinya direset. Selama bernilai benar, pengguna hanya boleh membuka halaman penggantian kata sandi |
| terakhir_masuk | timestamptz | Waktu keberhasilan masuk terakhir. Dipakai Modul 6.6. **Tidak boleh** dicampur dengan terakhir_terlihat |
| foto_acuan_wajah | text | **Disediakan kosong.** Tempat berkas foto acuan bila fitur verifikasi wajah kelak dibangun. Sampai fitur itu disetujui, kolom ini tidak diisi dan tidak dibaca modul mana pun |
| sedang_bertugas | boolean | Menyala saat Sesi Tugas berjalan |
| posisi_terakhir_lat | numeric | Lintang koordinat terakhir yang diterima |
| posisi_terakhir_lng | numeric | Bujur koordinat terakhir yang diterima |
| terakhir_terlihat | timestamptz | Waktu koordinat terakhir diterima, dasar penghitungan status hijau, kuning, abu-abu |

> **Mengapa ada email sintetis**
>
> Sistem autentikasi Supabase mensyaratkan email sebagai identitas. Personel tidak seluruhnya memiliki email institusi yang aktif, dan yang mereka hafal adalah NRP. Karena itu antarmuka meminta NRP, lalu sistem menyusun email sintetis di belakang layar sebelum meneruskannya ke Supabase.
>
> Kolom ini bersifat teknis semata. Dilarang menampilkannya di antarmuka mana pun, dilarang memakainya sebagai alamat pengiriman, dan dilarang menjadikannya jalur pemulihan kata sandi.

## 5.10 Tabel unit

**[FINAL]**

Daftar unit di bawah Subdit IV. Dibuat sebagai tabel tersendiri, bukan teks bebas, karena salah ketik pada nama unit akan langsung merusak pembatasan lingkup data.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| nama | text | Nama unit, unik. Contoh: Unit I |
| keterangan | text | Uraian singkat, boleh kosong |
| aktif | boolean | Unit tidak dihapus melainkan dinonaktifkan, sejalan dengan BR-12 |
| urutan | integer | Menentukan urutan tampil pada daftar |

**Data awal.** Sampai daftar resmi diterima dari pemilik produk, tabel diisi empat baris sementara: Unit I, Unit II, Unit III, Unit IV. Baris-baris ini ditandai sebagai data sementara pada berkas seed dan wajib diganti sebelum peluncuran. Lihat Lampiran A butir A-06.

## 5.11 Tabel penugasan_panit

**[FINAL]**

Menghubungkan satu SPT dengan Panit Penanggung Jawabnya. Tabel ini menjadi dasar seluruh aturan akses baris untuk peran Panit.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| panit_id | uuid | Mengacu ke users, wajib berperan panit |
| ditunjuk_oleh | uuid | Mengacu ke users, wajib berperan kanit |
| ditunjuk_pada | timestamptz | Waktu penunjukan |

Pasangan penugasan_id dan panit_id bersifat unik. Baris pada tabel ini **tidak dihapus** meskipun SPT sudah ditutup, agar Panit tetap dapat membaca riwayat penugasan yang pernah ia awasi.

## 5.12 Tabel perangkat_masuk

**[FINAL]**

Menyimpan satu Perangkat Terdaftar per akun, sebagai dasar penegakan aturan satu perangkat.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| user_id | uuid | Mengacu ke users, unik. Satu baris per akun |
| penanda_perangkat | text | Penanda perangkat yang dibangkitkan aplikasi saat pertama dipasang dan disimpan di perangkat |
| keterangan_perangkat | text | Merek dan model perangkat, untuk ditampilkan pada pesan pemberitahuan |
| masuk_pada | timestamptz | Waktu Sesi Masuk ini dimulai |

## 5.13 Tabel jejak_audit

**[FINAL]**

Mencatat tindakan penting beserta pelaku dan waktunya. Tabel ini bersifat hanya-tambah: baris tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran mana pun, termasuk Akun Pemeliharaan.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| pelaku_id | uuid | Mengacu ke users |
| peran_pelaku | enum | Peran pelaku saat tindakan dilakukan, disalin agar riwayat tetap terbaca meski peran berubah kemudian |
| jenis_tindakan | enum | Lihat Section 9.6 |
| sasaran_tabel | text | Nama tabel yang disentuh |
| sasaran_id | uuid | Identitas baris yang disentuh |
| keterangan | text | Uraian singkat, tanpa memuat kata sandi dalam bentuk apa pun |
| waktu | timestamptz | Waktu tindakan |

## 5.14 Kolom tambahan pada tabel penugasan

Satu kolom ditambahkan untuk menampung keputusan butir A-01:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| ditugaskan_oleh | uuid | Mengacu ke users, wajib berperan kanit. Sama dengan diterbitkan_oleh pada keadaan biasa, dipisah agar tetap terbaca bila kelak kewenangan penunjukan dialihkan |

---
---

# 4. Pengganti Section 6.1 — Autentikasi & Peran

**Status: [FINAL]**

## 6.1.1 Deskripsi

Modul ini mengatur cara pengguna masuk ke sistem, cara sistem mengenali peran dan lingkup datanya, serta cara sesi masuk dipelihara dan diakhiri. Yang termasuk urusannya: halaman masuk berbasis NRP, penggantian Kata Sandi Sementara, Kunci Aplikasi lokal, penegakan aturan satu perangkat, pembacaan peran dan unit, perlindungan halaman terhadap akses di luar kewenangan, penanganan perubahan peran dan penonaktifan akun saat pengguna sedang aktif, serta pengakhiran Sesi Masuk.

Yang **bukan** urusannya: pembuatan dan penyuntingan akun, yang menjadi milik Modul 6.6; pengelolaan daftar unit, yang juga milik Modul 6.6; pembukaan dan penutupan Sesi Tugas beserta pelacakan posisi, yang menjadi milik Modul 6.4; dan penyimpanan draf laporan yang belum terkirim, yang menjadi milik Modul 6.3. Modul ini hanya berkewajiban tidak merusak draf tersebut saat Sesi Masuk berakhir.

Modul ini tidak bergantung pada modul mana pun dan seluruh modul lain bergantung padanya. Karena itu ia dikerjakan pertama.

## 6.1.2 Cerita pengguna

| Kode | Cerita |
| --- | --- |
| CP-6.1-01 | Sebagai Anggota, saya ingin masuk memakai NRP dan kata sandi, agar saya tidak perlu mengingat alamat surat elektronik yang tidak pernah saya pakai. |
| CP-6.1-02 | Sebagai pengguna baru, saya ingin diminta mengganti kata sandi pada saat pertama kali masuk, agar kata sandi yang diberikan atasan tidak terus dipakai. |
| CP-6.1-03 | Sebagai Anggota, saya ingin tetap dalam keadaan masuk meski aplikasi saya tutup dan buka berkali-kali sepanjang hari, agar saya tidak kehilangan waktu di lapangan hanya untuk masuk ulang. |
| CP-6.1-04 | Sebagai Anggota, saya ingin aplikasi terkunci PIN atau sidik jari saat dibuka kembali, agar isi perkara tidak terbaca orang lain bila telepon saya hilang atau dipinjam. |
| CP-6.1-05 | Sebagai Kanit, saya ingin mereset kata sandi Anggota dan Panit di unit saya, agar personel yang lupa kata sandi dapat kembali bertugas tanpa menunggu pimpinan Subdit. |
| CP-6.1-06 | Sebagai Kasubdit, saya ingin mereset kata sandi pengguna mana pun, agar tidak ada akun yang terkunci permanen. |
| CP-6.1-07 | Sebagai Kasubdit, saya ingin peran seorang pengguna yang saya ubah langsung berlaku tanpa memaksanya keluar, agar pekerjaannya tidak terputus. |
| CP-6.1-08 | Sebagai pengguna, saya ingin tidak melihat menu yang bukan kewenangan saya, agar tampilan tetap ringkas dan saya tidak menebak-nebak. |
| CP-6.1-09 | Sebagai pengguna, saya ingin dikembalikan ke halaman saya sendiri bila saya membuka tautan yang bukan hak saya, agar saya tidak berhadapan dengan layar galat yang membingungkan. |
| CP-6.1-10 | Sebagai Anggota, saya ingin dapat keluar kapan saja meski sedang dalam Sesi Tugas, agar saya tidak terjebak di lapangan menunggu persetujuan siapa pun. |
| CP-6.1-11 | Sebagai Kanit, saya ingin diberi tahu bila seorang pelaksana keluar aplikasi saat Sesi Tugasnya masih berjalan, agar saya mengetahui keadaan sebenarnya dan dapat menilai sendiri. |
| CP-6.1-12 | Sebagai Anggota yang berganti telepon, saya ingin cukup masuk di telepon baru tanpa mengurus apa pun di telepon lama, agar pergantian perangkat tidak menghambat tugas. |
| CP-6.1-13 | Sebagai pemegang Akun Pemeliharaan, saya ingin dapat memulihkan akses saat seluruh jalur normal buntu, agar sistem tidak pernah terkunci total. |

## 6.1.3 Kriteria penerimaan

Ditulis dengan pola: bila kondisi, maka hasil yang diharapkan.

### Masuk ke sistem

| Kode | Kriteria |
| --- | --- |
| KP-6.1-01 | Bila pengguna memasukkan NRP dan kata sandi yang cocok pada akun berstatus aktif, maka Sesi Masuk terbentuk dan pengguna diarahkan ke beranda perannya. |
| KP-6.1-02 | Bila NRP tidak terdaftar **atau** kata sandi salah, maka ditampilkan satu pesan yang sama untuk kedua keadaan: "NRP atau kata sandi tidak sesuai." Sistem dilarang menyatakan mana yang salah. |
| KP-6.1-03 | Bila akun berstatus tidak aktif, maka masuk ditolak dengan pesan "Akun ini sedang tidak aktif. Hubungi Kanit unit Anda." Kolom terakhir_masuk tidak diperbarui. |
| KP-6.1-04 | Bila NRP dimasukkan dengan spasi di awal atau akhir, maka spasi dibuang sebelum diproses dan masuk tetap berhasil. |
| KP-6.1-05 | Bila proses masuk berhasil, maka kolom terakhir_masuk diperbarui dan satu baris jejak audit bertipe masuk_berhasil dicatat. |
| KP-6.1-06 | Bila jaringan terputus saat tombol Masuk ditekan, maka ditampilkan pesan "Tidak dapat menghubungi server. Periksa jaringan Anda." dan isian NRP tetap terisi. Kata sandi dikosongkan. |

### Kata Sandi Sementara

| Kode | Kriteria |
| --- | --- |
| KP-6.1-07 | Bila akun memiliki wajib_ganti_sandi bernilai benar, maka setelah masuk pengguna langsung diarahkan ke halaman penggantian kata sandi dan tidak dapat membuka halaman lain mana pun. |
| KP-6.1-08 | Bila pengguna pada keadaan tersebut mencoba membuka halaman lain melalui tautan langsung, maka ia dikembalikan ke halaman penggantian kata sandi. |
| KP-6.1-09 | Bila kata sandi baru berhasil disimpan, maka wajib_ganti_sandi menjadi salah, pengguna diarahkan ke beranda perannya, dan satu baris jejak audit bertipe ganti_sandi dicatat. |
| KP-6.1-10 | Bila kata sandi baru sama persis dengan Kata Sandi Sementara, maka penggantian ditolak dengan pesan "Kata sandi baru harus berbeda dari yang diberikan kepada Anda." |
| KP-6.1-11 | Bila kata sandi baru kurang dari delapan karakter, maka penggantian ditolak dan syaratnya ditampilkan. |

### Kunci Aplikasi

| Kode | Kriteria |
| --- | --- |
| KP-6.1-12 | Bila pengguna berhasil masuk untuk pertama kalinya di sebuah perangkat, maka ia ditawari memasang Kunci Aplikasi. Tawaran dapat dilewati dan dapat dipasang kemudian melalui halaman pengaturan. |
| KP-6.1-13 | Bila Kunci Aplikasi terpasang dan aplikasi kembali ke layar depan setelah lebih dari dua menit di latar belakang, maka layar kunci ditampilkan sebelum isi aplikasi terlihat. |
| KP-6.1-14 | Bila perangkat mendukung sidik jari dan pengguna mengizinkannya, maka sidik jari ditawarkan lebih dulu, dengan PIN selalu tersedia sebagai jalur cadangan. |
| KP-6.1-15 | Bila PIN dimasukkan salah lima kali berturut-turut, maka layar kunci digantikan permintaan kata sandi akun. Akun **tidak** dikunci dan **tidak** dinonaktifkan. |
| KP-6.1-16 | Bila Sesi Tugas sedang berjalan, maka Kunci Aplikasi tidak menghentikan pengiriman koordinat. Pelacakan berjalan di lapisan yang berbeda. |

### Peran dan perlindungan halaman

| Kode | Kriteria |
| --- | --- |
| KP-6.1-17 | Bila pengguna membuka halaman di luar kewenangan perannya melalui tautan langsung, maka ia dialihkan ke beranda perannya disertai pesan sekilas "Halaman itu di luar kewenangan Anda." Sistem dilarang menampilkan halaman galat yang membenarkan keberadaan halaman tersebut. |
| KP-6.1-18 | Bila sebuah menu atau tombol berada di luar kewenangan peran, maka unsur tersebut tidak dirender sama sekali, bukan dirender dalam keadaan nonaktif. |
| KP-6.1-19 | Bila lapisan tampilan gagal menyembunyikan sesuatu, maka aturan akses baris pada basis data tetap menolak permintaannya. Penyembunyian di antarmuka tidak dianggap pengamanan. |
| KP-6.1-20 | Bila seorang Panit membuka daftar SPT, maka yang tampil hanya SPT tempat ia tercatat pada penugasan_panit, termasuk yang sudah ditutup. |
| KP-6.1-21 | Bila seorang Panit belum pernah ditunjuk pada SPT mana pun, maka berandanya menampilkan kondisi kosong yang menjelaskan keadaan, bukan layar kosong tanpa keterangan. |

### Perubahan peran dan penonaktifan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.1-22 | Bila peran atau unit pengguna diubah saat ia sedang masuk, maka token disegarkan diam-diam, menu menyesuaikan di tempat, dan sebuah penanda kecil muncul berbunyi "Kewenangan Anda baru saja diperbarui." Pengguna **tidak** dikeluarkan. |
| KP-6.1-23 | Bila pengguna berada di halaman yang menjadi di luar kewenangannya akibat perubahan tersebut, maka ia dialihkan ke beranda peran barunya. |
| KP-6.1-24 | Bila akun dinonaktifkan saat pengguna sedang masuk, maka Sesi Masuk diakhiri dalam waktu paling lama lima belas detik dan pengguna dikembalikan ke halaman masuk dengan pesan "Akun ini sedang tidak aktif. Hubungi Kanit unit Anda." |
| KP-6.1-25 | Bila akun dinonaktifkan saat Sesi Tugas berjalan, maka Sesi Tugas ditutup, seluruh titik koordinat dan laporan yang sudah terkirim tetap tersimpan utuh, dan penutupan ditandai "Sesi ditutup karena akun dinonaktifkan". |

### Keluar dan Sesi Tugas

| Kode | Kriteria |
| --- | --- |
| KP-6.1-26 | Bila pengguna menekan Keluar, maka permintaan dikonfirmasi lebih dulu, dan setelah dikonfirmasi Sesi Masuk berakhir tanpa persetujuan siapa pun. |
| KP-6.1-27 | Bila pengguna keluar saat Sesi Tugas berjalan, maka Sesi Tugas ditutup otomatis, Rute sampai detik itu tersimpan utuh, penutupan ditandai "Sesi ditutup karena keluar aplikasi" beserta waktunya, dan Kanit unit serta seluruh Panit Penanggung Jawab penugasan tersebut menerima pemberitahuan. |
| KP-6.1-28 | Bila keadaan pada KP-6.1-27 terjadi, maka dialog konfirmasi memberi tahu lebih dulu bahwa Sesi Tugas akan ditutup, sehingga pengguna dapat membatalkan. |
| KP-6.1-29 | Bila pengguna keluar, maka draf laporan yang belum terkirim di perangkat itu **tidak** dihapus dan tersedia kembali setelah pengguna yang sama masuk lagi di perangkat yang sama. |

### Satu perangkat per akun

| Kode | Kriteria |
| --- | --- |
| KP-6.1-30 | Bila sebuah akun berhasil masuk di perangkat baru sementara perangkat lama masih memegang Sesi Masuk, maka Sesi Masuk lama berakhir dan baris perangkat_masuk diperbarui menunjuk perangkat baru. Masuk di perangkat baru **tidak** ditolak. |
| KP-6.1-31 | Bila perangkat lama kemudian dipakai, maka ia menampilkan halaman masuk dengan pesan "Akun Anda dipakai masuk di perangkat lain." tanpa nada menuduh. |
| KP-6.1-32 | Bila pergeseran perangkat terjadi saat Sesi Tugas berjalan di perangkat lama, maka Sesi Tugas ditutup, Rute tersimpan utuh, ditandai "Sesi ditutup karena masuk di perangkat lain", dan Kanit serta Panit Penanggung Jawab diberi tahu. |
| KP-6.1-33 | Bila pergeseran perangkat terjadi, maka satu baris jejak audit bertipe geser_perangkat dicatat, memuat keterangan kedua perangkat. |

### Reset kata sandi

| Kode | Kriteria |
| --- | --- |
| KP-6.1-34 | Bila Kanit mereset kata sandi seorang Anggota atau Panit di unitnya, maka sistem menerima tindakan itu, menyalakan wajib_ganti_sandi, dan menampilkan Kata Sandi Sementara satu kali di layar untuk disampaikan secara lisan. |
| KP-6.1-35 | Bila Kanit mencoba mereset kata sandi pengguna di luar unitnya, atau kata sandi sesama Kanit, atau kata sandi Kasubdit, maka permintaan ditolak di tingkat basis data. |
| KP-6.1-36 | Bila Kasubdit mereset kata sandi pengguna mana pun, maka permintaan diterima. |
| KP-6.1-37 | Bila kata sandi direset, maka seluruh Sesi Masuk akun tersebut diakhiri dan baris perangkat_masuk-nya dihapus. |
| KP-6.1-38 | Bila kata sandi direset, maka satu baris jejak audit bertipe reset_sandi dicatat memuat pelaku dan sasaran. Kata sandi itu sendiri dilarang ikut tercatat. |
| KP-6.1-39 | Bila sistem menampilkan Kata Sandi Sementara, maka ia ditampilkan sekali dan tidak dapat dilihat ulang. Bila hilang, reset diulang. |

### Akun Pemeliharaan

| Kode | Kriteria |
| --- | --- |
| KP-6.1-40 | Bila Akun Pemeliharaan masuk, maka berandanya adalah halaman pemeliharaan berisi daftar akun dan tombol reset, bukan dashboard peran mana pun. |
| KP-6.1-41 | Bila Akun Pemeliharaan melakukan tindakan apa pun, termasuk membaca data perkara, maka satu baris jejak audit dicatat. |
| KP-6.1-42 | Bila daftar personel, pemilihan pelaksana SPT, peta, atau rekapitulasi dirender, maka Akun Pemeliharaan tidak muncul di dalamnya. |
| KP-6.1-43 | Bila Akun Pemeliharaan mencoba menerbitkan SPT, membuka Sesi Tugas, atau menyusun LHP Ringkas, maka permintaan ditolak di tingkat basis data. |

## 6.1.4 Aturan modul

| Kode | Aturan |
| --- | --- |
| AM-6.1-01 | Identitas masuk adalah NRP. Email sintetis dibangkitkan sistem, tidak pernah ditampilkan, dan tidak pernah menjadi jalur pemulihan. |
| AM-6.1-02 | Pesan kegagalan masuk selalu sama untuk NRP tidak terdaftar dan kata sandi salah. Membedakan keduanya membocorkan NRP mana yang terdaftar. |
| AM-6.1-03 | Kata sandi minimal delapan karakter. Tidak ada syarat huruf besar, angka, atau lambang. Syarat rumit pada pengguna lapangan menghasilkan kata sandi yang dituliskan di kertas. |
| AM-6.1-04 | Kata Sandi Sementara wajib diganti sebelum sistem dapat dipakai. Tidak ada jalan melewatinya. |
| AM-6.1-05 | Kunci Aplikasi bersifat lokal di perangkat. PIN tidak dikirim ke server dan tidak dapat dipulihkan dari server. Melupakan PIN diselesaikan dengan masuk ulang memakai kata sandi akun. |
| AM-6.1-06 | Kunci Aplikasi bukan pengaman data. Ia hanya menghalangi mata orang lain pada perangkat yang sama. Pengamanan sesungguhnya tetap pada aturan akses baris. |
| AM-6.1-07 | Sesi Masuk tidak berakhir sendiri karena waktu. Ia berakhir hanya karena pengguna keluar, akun dinonaktifkan, kata sandi direset, atau digeser perangkat lain. |
| AM-6.1-08 | Satu akun memegang satu Perangkat Terdaftar. Masuk di perangkat baru selalu menang atas yang lama. Menolak perangkat baru berisiko mengunci personel yang teleponnya rusak atau hilang. |
| AM-6.1-09 | Peran dan unit dibaca dari basis data, bukan dari apa pun yang tersimpan di perangkat. Nilai yang tersimpan di perangkat hanya untuk mempercepat tampilan dan tidak pernah menjadi dasar keputusan izin. |
| AM-6.1-10 | Perubahan peran diberlakukan melalui penyegaran token diam-diam. Pengguna tidak dikeluarkan. |
| AM-6.1-11 | Penonaktifan akun mengakhiri Sesi Masuk. Ini akibat teknis, bukan pilihan kebijakan: basis data akan menolak seluruh permintaan akun tersebut sehingga menahannya di dalam aplikasi hanya menghasilkan layar galat beruntun. |
| AM-6.1-12 | Seluruh pesan mengikuti Prinsip Non-Menghakimi pada Section 0.6. Pesan menyatakan keadaan, bukan menuduh. "Akun Anda dipakai masuk di perangkat lain", bukan "Anda melanggar aturan perangkat". |
| AM-6.1-13 | Kegagalan masuk berulang tidak mengunci akun. Sistem bersandar pada pembatasan laju bawaan Supabase. Mengunci akun berisiko melumpuhkan personel di lapangan pada saat genting. |
| AM-6.1-14 | Lingkup data Panit ditelusuri melalui penugasan_panit, tidak pernah melalui perbandingan kolom unit. |
| AM-6.1-15 | Akun Pemeliharaan memiliki lingkup baca penuh, namun tidak memiliki kewenangan tindakan operasional. Ia dapat membaca dan memulihkan, tidak dapat menerbitkan maupun melaksanakan. |
| AM-6.1-16 | Baris jejak audit tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran mana pun, termasuk Akun Pemeliharaan. |
| AM-6.1-17 | Kolom foto_acuan_wajah disediakan kosong dan tidak dibaca maupun ditulis modul mana pun sampai fitur verifikasi wajah disetujui secara tertulis. Mengisinya lebih awal berarti menyimpan data biometrik tanpa dasar. |

## 6.1.5 Antarmuka dan kondisi tampilan

Gaya visual seluruh halaman di bawah diambil dari prototype HTML sesuai Section 4.3. Prototype belum memuat halaman masuk, sehingga halaman-halaman berikut disusun mengikuti kaidah visual yang sudah berlaku di prototype: palet warna, bentuk kartu, jarak antar unsur, dan gaya tombol. Dilarang membuat arah desain baru.

### Halaman Masuk

| Aspek | Ketetapan |
| --- | --- |
| Isi | Lambang, nama sistem, isian NRP, isian kata sandi dengan tombol perlihatkan, tombol Masuk |
| Lambang | Placeholder bertuliskan SiPANTAU dengan gaya prototype. **Dilarang** membuat tiruan lambang institusi. Berkas resmi menunggu butir A-04 |
| Yang tidak ada | Tautan daftar akun baru, tautan lupa kata sandi, pilihan ingat saya |
| Kondisi memuat | Tombol Masuk berubah menjadi keadaan menunggu dan tidak dapat ditekan dua kali |
| Kondisi galat | Pesan muncul di atas tombol, berwarna sesuai gaya peringatan prototype. Isian NRP dipertahankan, kata sandi dikosongkan |
| Tanpa jaringan | Pesan tersendiri yang membedakan gangguan jaringan dari kesalahan kredensial |
| Ukuran layar | Diutamakan layar telepon genggam. Pada layar lebar, kartu masuk berada di tengah dengan lebar terbatas |

Tidak disediakan tautan lupa kata sandi karena tidak ada email sungguhan yang dapat dikirimi. Sebagai gantinya, di bawah tombol Masuk terdapat satu baris keterangan: "Lupa kata sandi? Hubungi Kanit unit Anda."

### Halaman Penggantian Kata Sandi Wajib

| Aspek | Ketetapan |
| --- | --- |
| Kapan muncul | Segera setelah masuk bila wajib_ganti_sandi bernilai benar |
| Isi | Keterangan singkat alasannya, isian kata sandi baru, isian ulangi kata sandi baru, tombol Simpan |
| Yang tidak ada | Tombol lewati, tombol kembali, menu navigasi. Halaman ini buntu sampai kata sandi diganti |
| Kondisi galat | Syarat panjang dan syarat berbeda dari sebelumnya ditampilkan di bawah isian terkait |

### Layar Kunci Aplikasi

| Aspek | Ketetapan |
| --- | --- |
| Kapan muncul | Aplikasi kembali dari latar belakang setelah lebih dari dua menit, bila Kunci Aplikasi terpasang |
| Isi | Enam kotak angka, tombol angka besar sesuai kaidah sasaran sentuh Section 10.5, ikon sidik jari bila didukung |
| Setelah lima kali salah | Berganti menjadi permintaan kata sandi akun, bukan penguncian |
| Saat Sesi Tugas berjalan | Terdapat baris keterangan "Sesi Tugas Anda tetap berjalan" agar pengguna tidak menduga pelacakan terhenti |

### Beranda tiap peran

| Peran | Beranda setelah masuk |
| --- | --- |
| Kasubdit | Dashboard lintas unit |
| Kanit | Dashboard unitnya |
| Panit | Daftar SPT yang ia awasi |
| Anggota | Daftar SPT yang ditujukan padanya, dengan aksi Mulai Tugas paling menonjol |
| Akun Pemeliharaan | Halaman pemeliharaan berisi daftar akun dan tombol reset |

Aksi Mulai Tugas pada beranda Anggota memakai kendali geser, bukan tombol tekan, untuk mencegah tersenggol di dalam saku. Rincian kendali ini ditetapkan pada Modul 6.4; Modul 6.1 hanya menetapkan penempatannya di beranda.

### Kondisi kosong

| Halaman | Kondisi kosong |
| --- | --- |
| Beranda Panit tanpa SPT | "Belum ada penugasan yang Anda awasi. Penugasan akan muncul di sini begitu Kanit menunjuk Anda sebagai penanggung jawab." |
| Beranda Anggota tanpa SPT | "Belum ada penugasan untuk Anda saat ini." |
| Halaman pemeliharaan tanpa akun | Tidak berlaku. Sekurang-kurangnya dua akun selalu ada |

### Perbedaan antar peran

Menu yang dirender per peran, sesuai KP-6.1-18. Unsur yang tidak tercantum tidak dirender sama sekali.

| Menu | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Dashboard | Ya | Ya | Ya | Ya |
| Daftar SPT | Ya | Ya | Ya | Ya |
| Terbitkan SPT | — | Ya | — | — |
| Peta Tracking | Ya | Ya | Ya | Ya |
| Laporan | Ya | Ya | Ya | Ya |
| LHP Ringkas | Ya | Ya | Ya | Ya |
| Mulai Tugas | — | — | Ya | Ya |
| Manajemen User | Ya | — | — | — |
| Daftar Unit | Ya | — | — | — |
| Reset Kata Sandi | Ya | Ya | — | — |
| Rekapitulasi Lintas Unit | Ya | — | — | — |
| Pengaturan dan Keluar | Ya | Ya | Ya | Ya |

## 6.1.6 Edge case modul

| Kode | Kondisi | Penanganan |
| --- | --- | --- |
| EC-6.1-01 | Sesi Masuk berakhir saat pengguna sedang mengisi formulir panjang | Isian yang belum terkirim tetap tersimpan di perangkat. Setelah pengguna yang sama masuk lagi di perangkat yang sama, isian dipulihkan. Mekanisme penyimpanannya milik Modul 6.3; Modul 6.1 hanya dilarang menghapus penyimpanan lokal saat Sesi Masuk berakhir |
| EC-6.1-02 | Peran diubah saat pengguna sedang masuk | Token disegarkan diam-diam, menu menyesuaikan, penanda kecil muncul. Bila halaman yang sedang dibuka menjadi di luar kewenangan, dialihkan ke beranda peran baru |
| EC-6.1-03 | Akun dinonaktifkan saat Sesi Tugas berjalan | Sesi Tugas ditutup, Rute dan laporan tersimpan utuh, ditandai "Sesi ditutup karena akun dinonaktifkan", pengguna dikembalikan ke halaman masuk |
| EC-6.1-04 | Pengguna membuka halaman di luar kewenangannya lewat tautan langsung | Dialihkan ke beranda perannya dengan pesan sekilas. Tidak ditampilkan halaman galat. Tidak dicatat sebagai pelanggaran, sesuai Prinsip 0.6 |
| EC-6.1-05 | Masuk di perangkat kedua saat perangkat pertama masih aktif | Perangkat kedua menang. Perangkat pertama keluar dengan pesan netral. Bila Sesi Tugas sedang berjalan di perangkat pertama, berlaku KP-6.1-32 |
| EC-6.1-06 | Perangkat hilang atau rusak, pengguna masuk di perangkat pengganti | Berjalan sendirinya lewat aturan pergeseran perangkat. Tidak ada tindakan tambahan yang diperlukan |
| EC-6.1-07 | Aplikasi dipasang ulang sehingga penanda perangkat berubah | Dianggap perangkat baru. Kunci Aplikasi hilang dan perlu dipasang ulang. Data pengguna tidak terpengaruh |
| EC-6.1-08 | Kanit lupa kata sandinya sendiri | Diselesaikan Kasubdit. Bila Kasubdit tidak dapat dihubungi, diselesaikan Akun Pemeliharaan |
| EC-6.1-09 | Kasubdit lupa kata sandinya sendiri | Hanya dapat diselesaikan Akun Pemeliharaan. Inilah alasan utama akun tersebut ada |
| EC-6.1-10 | Kredensial Akun Pemeliharaan hilang | Tidak dapat dipulihkan dari dalam aplikasi. Perlu penanganan langsung di panel Supabase. Ditulis pada berkas serah terima proyek |
| EC-6.1-11 | Kata sandi direset saat pengguna sedang dalam Sesi Tugas | Sesi Masuk berakhir, Sesi Tugas ditutup, Rute tersimpan utuh, ditandai "Sesi ditutup karena kata sandi direset" |
| EC-6.1-12 | Jam perangkat tidak akurat sehingga token dianggap kedaluwarsa | Ditampilkan pesan yang menyarankan mengaktifkan waktu otomatis pada pengaturan perangkat, bukan pesan galat umum |
| EC-6.1-13 | Panit ditunjuk pada SPT saat ia sedang membuka aplikasi | SPT baru muncul pada daftarnya tanpa perlu masuk ulang |
| EC-6.1-14 | Panit dicabut dari SPT yang sedang berjalan | Baris pada penugasan_panit **tidak** dihapus melainkan ditandai berakhir, agar laporan yang sudah ia tinjau tetap dapat ditelusuri. Rinciannya ditetapkan pada Modul 6.2 |
| EC-6.1-15 | Unit tempat seorang pengguna bertugas dinonaktifkan | Pengguna tetap dapat masuk dan tetap melihat datanya sendiri. Kanit unit tersebut kehilangan kemampuan menerbitkan SPT baru. Penanganan penuh milik Modul 6.6 |
| EC-6.1-16 | Dua peninjau mengubah peran pengguna yang sama secara bersamaan | Perubahan terakhir yang menang, dan keduanya tercatat pada jejak audit |

## 6.1.7 Ketergantungan

**Modul ini tidak bergantung pada modul mana pun.** Ia dikerjakan pertama.

Yang bergantung padanya, dan tidak boleh dimulai sebelum modul ini selesai:

| Modul | Yang dibutuhkannya dari 6.1 |
| --- | --- |
| 6.2 Manajemen Penugasan | Pembacaan peran untuk membatasi penerbitan SPT pada Kanit |
| 6.3 Pelaporan Harian | Identitas pengirim laporan dan lingkup datanya |
| 6.4 GPS Tracking | Identitas pemilik titik koordinat dan aturan penutupan Sesi Tugas saat Sesi Masuk berakhir |
| 6.5 Dashboard | Penentuan lingkup data yang ditampilkan |
| 6.6 Manajemen User | Tabel users, unit, dan jejak audit yang dibentuk modul ini |
| 6.7 Kolase | Hak akses foto yang menaunginya |
| 6.8 LHP Ringkas | Pembatasan penyusunan LHP pada Anggota |
| 6.9 Notifikasi | Lingkup data penerima pemberitahuan, sesuai BR-14 |

Yang dibutuhkan dari luar sebelum modul ini dapat dianggap selesai seluruhnya: berkas lambang institusi (butir A-04) dan daftar resmi unit (butir A-06). Keduanya dapat diganti belakangan tanpa mengubah kode, sehingga tidak menahan pembangunan.

---
---

# 5. Perubahan Section 7 — Business Rules Global

## BR-07 direvisi

| Kode | Aturan lama | Aturan baru |
| --- | --- | --- |
| BR-07 | Manajemen akun pengguna dan rekapitulasi lintas unit hanya dapat diakses Kasubdit | **Manajemen akun pengguna, pengelolaan daftar unit, dan rekapitulasi lintas unit hanya dapat diakses Kasubdit. Mereset kata sandi dipisahkan sebagai kewenangan tersendiri dan diatur pada BR-15.** |

## Aturan tambahan

| Kode | Aturan | Modul terkait |
| --- | --- | --- |
| BR-15 | Mereset kata sandi dapat dilakukan Kasubdit terhadap pengguna mana pun, dan Kanit terhadap Anggota dan Panit di unitnya sendiri. Kanit tidak dapat mereset kata sandi sesama Kanit maupun Kasubdit. | 6.1, 6.6 |
| BR-16 | Satu akun hanya memegang satu Sesi Masuk aktif pada satu perangkat. Masuk di perangkat baru mengakhiri Sesi Masuk di perangkat lama, dan tidak pernah ditolak. | 6.1 |
| BR-17 | Sistem memiliki tepat satu Akun Pemeliharaan dengan lingkup baca penuh atas seluruh tabel, tanpa kewenangan menerbitkan SPT, membuka Sesi Tugas, maupun menyusun LHP. Seluruh tindakannya tercatat pada jejak audit. Akun ini tidak muncul pada daftar personel, pemilihan pelaksana, peta, maupun rekapitulasi. | 6.1, 6.5, 6.6 |
| BR-18 | Kata sandi yang ditetapkan pembuat akun atau pereset bersifat sementara dan wajib diganti pengguna sebelum sistem dapat dipakai. | 6.1, 6.6 |
| BR-19 | Keluar aplikasi tidak memerlukan persetujuan siapa pun. Bila dilakukan saat Sesi Tugas berjalan, Sesi Tugas ditutup, Rute tersimpan utuh, penutupan ditandai beserta sebabnya, dan Kanit serta Panit Penanggung Jawab diberi tahu. | 6.1, 6.4, 6.9 |
| BR-20 | Perubahan peran atau unit diberlakukan melalui pembaruan di tempat tanpa mengeluarkan pengguna. Penonaktifan akun mengakhiri Sesi Masuk. | 6.1, 6.6 |
| BR-21 | Lingkup data Panit ditentukan oleh penugasan tempat ia ditunjuk sebagai Panit Penanggung Jawab, bukan oleh unitnya. Penunjukan yang sudah berakhir tetap memberi hak baca atas riwayat penugasan tersebut. | 6.1, 6.2, 6.5 |
| BR-22 | Baris jejak audit bersifat hanya-tambah. Tidak dapat diubah maupun dihapus dari dalam aplikasi oleh peran mana pun, termasuk Akun Pemeliharaan. | Seluruh modul |

> **Catatan penomoran.** BR-15 sampai BR-22 melanjutkan penomoran dari BR-14 sesuai aturan penambahan pada Section 7. Tidak ada kode lama yang dipakai ulang.

---
---

# 6. Perubahan Section 9 — Keamanan & Row Level Security

## 9.2 Aturan akses per tabel

**[FINAL] untuk tabel yang menjadi urusan Modul 6.1**

| Tabel | Baca | Tulis |
| --- | --- | --- |
| users | Pengguna membaca barisnya sendiri. Kasubdit membaca seluruh baris. Kanit membaca baris pengguna di unitnya. Panit membaca baris Anggota pada penugasan yang diawasinya. Akun Pemeliharaan membaca seluruh baris | Kasubdit menulis seluruh kolom. Kanit dan Akun Pemeliharaan hanya menulis kolom wajib_ganti_sandi pada sasaran yang diizinkan BR-15. Pengguna menulis kolom kata sandinya sendiri. Kolom peran dan unit_id hanya dapat ditulis Kasubdit |
| unit | Seluruh pengguna terautentikasi membaca baris aktif | Hanya Kasubdit |
| penugasan_panit | Panit membaca barisnya sendiri. Kanit membaca baris pada penugasan di unitnya. Kasubdit dan Akun Pemeliharaan membaca seluruh baris | Hanya Kanit, terbatas pada penugasan di unitnya sendiri |
| perangkat_masuk | Pengguna membaca barisnya sendiri. Akun Pemeliharaan membaca seluruh baris | Pengguna menulis barisnya sendiri. Kasubdit, Kanit sesuai BR-15, dan Akun Pemeliharaan dapat menghapus baris milik orang lain sebagai akibat reset kata sandi |
| jejak_audit | Kasubdit dan Akun Pemeliharaan membaca seluruh baris. Kanit membaca baris yang pelakunya atau sasarannya berada di unitnya | Seluruh pengguna terautentikasi dapat menambah. **Tidak ada** yang dapat mengubah maupun menghapus |

Untuk tabel penugasan, laporan_harian, lhp, foto_dokumentasi, dan location_logs, arah aturannya tetap seperti Section 9.2 versi 0.2, dengan satu perubahan mengikat: **seluruh klausa untuk peran Panit yang sebelumnya membandingkan kolom unit wajib diganti menjadi penelusuran ke tabel penugasan_panit.** Rincian penuh disusun saat modul terkait digali.

> **Peringatan implementasi**
>
> Aturan akses untuk Panit menyentuh dua tabel sekaligus, sehingga rawan menghasilkan kueri yang lambat bila tidak diindeks. Wajib dibuat indeks pada kolom penugasan_id dan panit_id di tabel penugasan_panit sejak awal, bukan setelah sistem terasa lambat.

## 9.6 Jejak audit

**[FINAL]**

Jenis tindakan yang wajib tercatat:

| Jenis | Kapan dicatat |
| --- | --- |
| masuk_berhasil | Setiap keberhasilan masuk |
| keluar | Setiap pengakhiran Sesi Masuk oleh pengguna |
| geser_perangkat | Sesi Masuk berpindah perangkat |
| ganti_sandi | Pengguna mengganti kata sandinya sendiri |
| reset_sandi | Kata sandi direset pihak lain. Kata sandinya sendiri dilarang tercatat |
| ubah_peran | Peran atau unit seorang pengguna diubah |
| nonaktifkan_akun | Akun dinonaktifkan |
| aktifkan_akun | Akun diaktifkan kembali |
| akses_pemeliharaan | Setiap tindakan Akun Pemeliharaan, termasuk pembacaan data perkara |
| terbit_spt, tutup_spt, finalisasi_lhp, ekspor_dokumen | Ditetapkan pada penggalian modul terkait |

Kegagalan masuk **tidak** dicatat pada jejak audit. Mencatatnya berarti menyimpan daftar percobaan yang sebagian besar hanyalah salah ketik, dan berpotensi dibaca sebagai tuduhan, bertentangan dengan Prinsip 0.6.

---
---

# 7. Perubahan Lampiran A dan B

## Lampiran A — daftar diperbarui

| Kode | Butir | Status |
| --- | --- | --- |
| ~~A-01~~ | ~~Penunjukan Anggota ke SPT~~ | **Terjawab.** Kanit menunjuk Panit Penanggung Jawab dan Anggota pelaksana saat menerbitkan SPT. Dipindahkan ke Lampiran B butir B.1 |
| A-02 | Penyimpanan data sensitif pada layanan awan | Belum terjawab |
| A-03 | Angka target metrik keberhasilan | Belum terjawab |
| A-04 | Berkas kop dan lambang institusi | Belum terjawab. Kini juga dibutuhkan halaman masuk Modul 6.1, saat ini memakai placeholder |
| A-05 | Daftar alasan lokasi tidak terekam | Belum terjawab |
| **A-06** | **Daftar resmi unit di bawah Subdit IV** | **Baru.** Nama resmi setiap unit beserta urutannya. Saat ini terisi empat baris sementara dan wajib diganti sebelum peluncuran |
| **A-07** | **Kesediaan Kasubdit memakai sistem** | **Baru.** Manajemen akun dan rekapitulasi lintas unit bersifat eksklusif Kasubdit. Bila peran ini nominal saja, kedua fungsi tersebut mati sejak hari pertama dan perlu jalan keluar |
| **A-08** | **Pencatatan tertulis Akun Pemeliharaan** | **Baru.** Keberadaan akun berakses penuh beserta nama pemegangnya perlu tercatat pada dokumen serah terima proyek, sebagai perlindungan bagi kedua pihak saat terjadi pergantian personel |
| **A-09** | **Panit dan daftar SPT se-unit** | **Baru, [PERLU KONFIRMASI KLIEN].** Saat ini Panit hanya melihat SPT yang ia awasi, sehingga Panit tanpa penugasan aktif melihat halaman kosong. Bila pemilik produk menghendaki Panit tetap melihat daftar ringkas SPT se-unit sebagai bacaan, perubahannya sebatas satu klausa pada aturan akses baris |

## Lampiran B — butir tambahan

### B.1 Peran dan kewenangan — tambahan

- Kanit menunjuk Panit Penanggung Jawab dan Anggota pelaksana saat menerbitkan SPT
- Panit dapat membuka Sesi Tugas dan mengirim Laporan Kegiatan Harian, tetapi tidak menyusun LHP Ringkas dan tidak menerbitkan SPT
- Posisi Panit ikut direkam selama Sesi Tugasnya berjalan, sama seperti Anggota
- Lingkup data Panit ditentukan penugasan yang diawasinya, bukan unitnya
- Panit tetap dapat membaca riwayat penugasan yang pernah ia awasi setelah penugasan ditutup
- Kanit dapat mereset kata sandi Anggota dan Panit di unitnya sendiri
- Pengelolaan daftar unit adalah kewenangan eksklusif Kasubdit

### B.7 Autentikasi — bagian baru

- Identitas masuk adalah NRP, bukan surat elektronik. Email sintetis dibangkitkan sistem di belakang layar
- Kata sandi awal ditetapkan pembuat akun dan wajib diganti pada keberhasilan masuk pertama
- Kata sandi minimal delapan karakter, tanpa syarat kerumitan lain
- Tidak tersedia jalur lupa kata sandi mandiri. Pemulihan melalui Kanit, Kasubdit, atau Akun Pemeliharaan
- Sesi Masuk tidak berakhir karena waktu
- Satu akun memegang satu perangkat. Perangkat baru selalu menang atas yang lama
- Kunci Aplikasi berupa PIN enam angka atau sidik jari, bersifat lokal di perangkat
- Verifikasi wajah **tidak** dibangun pada tahap ini. Kolom foto_acuan_wajah disediakan kosong sebagai tempat fitur tersebut kelak
- Swafoto berwatermark saat Mulai Tugas **tidak** dibangun pada tahap ini
- Terdapat satu Akun Pemeliharaan berakses baca penuh, dipegang pemilik produk dan developer, seluruh tindakannya tercatat pada jejak audit
- Dua akun disemai manual saat pemasangan: satu Kasubdit dan satu Kanit Reskrim
- Kegagalan masuk berulang tidak mengunci akun

### B.8 Di luar cakupan — tambahan pada Section 12

| Tidak dibangun | Alasan |
| --- | --- |
| Pencocokan wajah otomatis | Menuntut deteksi kehidupan, akurasi anjlok pada cahaya matahari dan perangkat kelas bawah, serta menimbulkan kewajiban perlindungan data biometrik. Ditunda ke tahap berikutnya |
| Pendaftaran akun mandiri | Akun dibuat Kasubdit. Tidak ada jalur pendaftaran sendiri dalam bentuk apa pun |
| Pemulihan kata sandi lewat surat elektronik atau pesan singkat | Tidak ada alamat surat elektronik sungguhan, dan pesan singkat menimbulkan biaya per pesan di luar anggaran |
| Penguncian akun akibat kegagalan masuk berulang | Berisiko melumpuhkan personel di lapangan. Bersandar pada pembatasan laju bawaan layanan |

---

## Yang perlu Anda kerjakan setelah menempel berkas ini

1. Naikkan versi PRD menjadi 0.3 pada Kendali Dokumen dan Riwayat Revisi
2. Ubah penanda status Modul 6.1 dari [KERANGKA] menjadi [FINAL]
3. Perbarui Checklist Progres: centang Tahap 2 baris 6.1, dan coret butir A-01 pada Tahap 1
4. Ekspor ulang ke Word dan Markdown agar keduanya sinkron
5. Kejar ke pemilik produk: butir A-04, A-06, A-07, A-08, dan A-09

Modul berikutnya yang tepat digali adalah **6.2 Manajemen Penugasan (SPT)**, karena tabel `penugasan_panit` sudah terbentuk di sini dan penunjukan tim menjadi urusannya.


---
---

# BAGIAN C — ADDENDUM 6.1-T SPESIFIKASI TEKNIS

# SiPANTAU — Addendum 6.1-T

**Spesifikasi Teknis Implementasi Modul 6.1**

Tanggal: 31 Juli 2026 · Pelengkap berkas Revisi PRD v0.3 · Status: [FINAL]

---

## Mengapa addendum ini ada

Berkas Revisi v0.3 menetapkan perilaku modul secara lengkap menurut kerangka Section 6.0, tetapi pada tiga titik ia menyatakan hasil akhir tanpa menyebutkan jalur teknis yang menghasilkannya. Menurut Section 0.1, bagian yang belum cukup jelas untuk diimplementasikan tidak boleh diisi perkiraan oleh AI Agent. Ketiga titik itu ditutup di sini.

| Celah | Kriteria terdampak | Ditutup pada |
| --- | --- | --- |
| Bagaimana perubahan peran menjadi berlaku | KP-6.1-22, KP-6.1-23 | Bagian 1 |
| Lewat jalur apa reset kata sandi dieksekusi | KP-6.1-34 sampai KP-6.1-39, BR-15 | Bagian 2 |
| Bagaimana perangkat lama dipaksa keluar | KP-6.1-30 sampai KP-6.1-33, BR-16 | Bagian 3 |

Addendum ini ditempel sebagai **Section 6.1.8** pada PRD, ditambah lima perubahan pada section lain yang didaftar di Bagian 5.

> **Dua koreksi terhadap berkas v0.3.** Rumusan KP-6.1-22 dan penjelasan BR-16 pada berkas v0.3 mengandung asumsi teknis yang keliru. Keduanya diganti di Bagian 4. Berkas v0.3 tetap berlaku untuk seluruh butir lainnya.

---
---

# Bagian 1 — Peran dan lingkup data dibaca dari mana

## 1.1 Keputusan pokok

**Peran dan unit tidak disimpan di dalam token.** Seluruh pemeriksaan kewenangan di tingkat basis data membaca tabel `users` melalui fungsi bantu.

Ada dua rancangan yang lazim dipakai pada Supabase, dan pilihan di antara keduanya menentukan seluruh perilaku KP-6.1-22:

| | Rancangan A — peran di dalam token | Rancangan B — peran dibaca tiap kueri |
| --- | --- | --- |
| Cara kerja | Peran ditanamkan sebagai klaim tambahan pada JWT lewat custom access token hook. Aturan akses baris membaca klaim itu | Aturan akses baris memanggil fungsi bantu yang menyelidik tabel `users` |
| Kecepatan | Sedikit lebih cepat, tidak ada pembacaan tabel | Ada satu pembacaan tabel, dapat ditekan (lihat 1.4) |
| Ketepatan waktu | **Basi.** Peran lama tetap berlaku sampai token disegarkan, bawaannya sampai satu jam | **Seketika.** Perubahan berlaku pada kueri berikutnya |
| Kerumitan | Perlu hook, perlu pemaksaan penyegaran token, perlu penanganan token basi | Tidak ada mekanisme tambahan |
| Risiko kelas kesalahan | Seluruh kelas kesalahan "token basi": pengguna masih memegang kewenangan yang sudah dicabut | Tidak ada |

**Rancangan B dipilih.** Alasannya bukan kerapian melainkan keamanan: pada Rancangan A, seorang pengguna yang perannya baru saja diturunkan tetap memegang kewenangan lamanya sampai tokennya kedaluwarsa. Pada sistem yang memuat data perkara, jendela selebar itu tidak dapat diterima. Rancangan B juga membuat KP-6.1-22 terpenuhi tanpa mekanisme apa pun: tidak ada token yang perlu disegarkan karena peran memang tidak pernah ada di dalamnya.

Konsekuensi yang wajib dicatat: rumusan "token disegarkan diam-diam" pada KP-6.1-22 versi v0.3 **keliru dan dicabut**. Penggantinya ada di Bagian 4.

## 1.2 Skema fungsi bantu

Fungsi bantu ditempatkan pada skema tersendiri yang **tidak** didaftarkan sebagai Exposed Schema pada pengaturan API, agar tidak dapat dipanggil langsung lewat REST oleh pemegang kunci publik, namun tetap dapat dievaluasi oleh aturan akses baris.

```sql
-- Skema khusus fungsi bantu kewenangan.
-- JANGAN tambahkan skema ini ke daftar "Exposed schemas" pada API Settings.
create schema if not exists sipantau_auth;
grant usage on schema sipantau_auth to authenticated;
```

### Fungsi 1 — peran pengguna yang sedang masuk

```sql
create or replace function sipantau_auth.peran_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select peran::text
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

grant execute on function sipantau_auth.peran_saya() to authenticated;
```

### Fungsi 2 — unit pengguna yang sedang masuk

```sql
create or replace function sipantau_auth.unit_saya()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select unit_id
  from public.users
  where id = (select auth.uid())
    and aktif = true
$$;

grant execute on function sipantau_auth.unit_saya() to authenticated;
```

### Fungsi 3 — daftar penugasan yang diawasi, untuk peran Panit

```sql
create or replace function sipantau_auth.penugasan_yang_saya_awasi()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select penugasan_id
  from public.penugasan_panit
  where panit_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.penugasan_yang_saya_awasi() to authenticated;
```

### Fungsi 4 — penanda Perangkat Terdaftar

```sql
create or replace function sipantau_auth.perangkat_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select penanda_perangkat
  from public.perangkat_masuk
  where user_id = (select auth.uid())
$$;

grant execute on function sipantau_auth.perangkat_saya() to authenticated;
```

> **Tiga hal yang wajib ada pada setiap fungsi di atas, dan sering terlewat**
>
> `security definer` — fungsi dijalankan dengan hak pembuatnya sehingga melewati aturan akses baris tabel `users`. Tanpa ini, kebijakan pada tabel `users` yang memanggil `peran_saya()` akan memanggil dirinya sendiri dan menghasilkan galat rekursi tak berhingga. Ini kesalahan paling sering pada pola ini.
>
> `stable` — memberi tahu PostgreSQL bahwa hasilnya tidak berubah dalam satu pernyataan, sehingga boleh disimpan sementara.
>
> `set search_path = ''` — mengunci jalur pencarian nama. Konsekuensinya seluruh nama tabel wajib ditulis lengkap dengan skemanya, seperti `public.users`. Tanpa ini, fungsi ber-`security definer` dapat disalahgunakan lewat penyisipan skema.

## 1.3 Cara memakainya di aturan akses baris

Contoh kebijakan pembacaan tabel `users`, menggantikan arah aturan pada Section 9.2:

```sql
alter table public.users enable row level security;

create policy "users_baca_sesuai_lingkup"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and unit_id = (select sipantau_auth.unit_saya())
  )
);
```

Contoh kebijakan untuk peran Panit pada tabel yang terikat penugasan:

```sql
create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  anggota_id = (select auth.uid())
  or (select sipantau_auth.peran_saya()) in ('kasubdit', 'pemeliharaan')
  or (
    (select sipantau_auth.peran_saya()) = 'kanit'
    and penugasan_id in (
      select id from public.penugasan
      where unit_id = (select sipantau_auth.unit_saya())
    )
  )
  or (
    (select sipantau_auth.peran_saya()) = 'panit'
    and penugasan_id in (select sipantau_auth.penugasan_yang_saya_awasi())
  )
);
```

## 1.4 Menekan biaya pembacaan

Tiga hal ini mengikat, bukan saran:

1. **Bungkus setiap panggilan fungsi bantu dalam `(select ...)`.** Bentuk `(select sipantau_auth.peran_saya())` membuat PostgreSQL menghitungnya satu kali per pernyataan, bukan satu kali per baris. Menuliskannya tanpa pembungkus pada tabel berisi puluhan ribu baris titik koordinat akan terasa sangat lambat.
2. **Pakai bentuk himpunan untuk lingkup Panit,** yaitu `penugasan_id in (select ...)`, bukan fungsi berparameter yang dipanggil per baris.
3. **Indeks wajib dibuat sejak awal,** bukan setelah sistem terasa lambat:

```sql
create index if not exists idx_penugasan_panit_panit
  on public.penugasan_panit (panit_id, penugasan_id);

create index if not exists idx_users_unit
  on public.users (unit_id) where aktif = true;

create index if not exists idx_laporan_penugasan
  on public.laporan_harian (penugasan_id);

create index if not exists idx_location_logs_penugasan
  on public.location_logs (penugasan_id, waktu desc);
```

## 1.5 Lapisan antarmuka

Basis data sudah tepat waktu dengan sendirinya. Yang belum adalah tampilan: menu di layar masih menampilkan susunan lama sampai aplikasi tahu ada perubahan. Tiga lapis penanganan:

**Lapis 1 — Realtime.** Aplikasi menyimak barisnya sendiri pada tabel `users`.

```sql
alter publication supabase_realtime add table public.users;
```

```javascript
supabase
  .channel('kewenangan-saya')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
    (payload) => {
      simpanKeStorePeran(payload.new)          // menu digambar ulang
      if (!payload.new.aktif) keluarPaksa()      // penonaktifan, lihat KP-6.1-24
      else tampilkanPenanda('Kewenangan Anda baru saja diperbarui.')
    })
  .subscribe()
```

**Lapis 2 — Pembacaan ulang saat aplikasi kembali ke depan.** Realtime dapat putus tanpa pemberitahuan di jaringan lemah. Setiap kali aplikasi kembali dari latar belakang dan setiap kali pengguna berpindah halaman, baris `users` miliknya dibaca ulang.

**Lapis 3 — Basis data sebagai penentu.** Bila kedua lapis di atas gagal dan menu lama masih terlihat, penekanan tombolnya tetap ditolak aturan akses baris. Tampilan yang basi menghasilkan pesan galat, bukan kebocoran kewenangan. Inilah alasan Rancangan B dipilih.

> **Catatan tentang Realtime dan aturan akses baris.** Aliran `postgres_changes` menghormati aturan akses baris. Pengguna hanya menerima perubahan pada baris yang boleh ia baca. Karena kebijakan `users_baca_sesuai_lingkup` mengizinkan pengguna membaca barisnya sendiri, penyimakan di atas berjalan tanpa izin tambahan.

---
---

# Bagian 2 — Jalur eksekusi reset kata sandi

## 2.1 Duduk perkaranya

Mengubah kata sandi **pengguna lain** hanya dapat dilakukan lewat Admin API Supabase, yang mensyaratkan kunci `service_role`. Kunci itu memberi akses penuh ke seluruh basis data dan melewati seluruh aturan akses baris. Menaruhnya di aplikasi klien berarti membagikannya kepada siapa pun yang memasang berkas aplikasi Android tersebut.

Sementara itu Section 4.5 menyatakan tidak ada server aplikasi manual. Keduanya perlu didamaikan, dan pendamainya adalah **Fungsi Tepi Supabase**.

## 2.2 Amandemen Section 4.5

Butir pertama Section 4.5 diganti menjadi:

> **Tidak ada server aplikasi manual.** Seluruh logika data ditegakkan lewat aturan basis data dan aturan akses baris, bukan lewat kode server terpisah yang ditulis dan di-hosting sendiri.
>
> Pengecualian tunggal adalah **Fungsi Tepi**, yaitu fungsi tanpa server yang merupakan bagian dari layanan backend terkelola yang sama dan disebarkan dari project yang sama. Fungsi Tepi **hanya** boleh dipakai untuk operasi yang secara teknis mensyaratkan kunci `service_role` dan karena itu tidak mungkin dijalankan dari klien. Fungsi Tepi dilarang dipakai sebagai tempat memindahkan logika bisnis yang seharusnya berada pada aturan akses baris.

Daftar tertutup operasi yang boleh memakai Fungsi Tepi:

| Fungsi | Modul | Alasan mensyaratkan kunci istimewa |
| --- | --- | --- |
| `reset-kata-sandi` | 6.1 | Mengubah kata sandi pengguna lain |
| `buat-akun` | 6.6 | Membuat pengguna baru pada sistem autentikasi |
| `nonaktifkan-akun` | 6.6 | Menonaktifkan akun sekaligus mengakhiri sesinya |

Penambahan di luar daftar ini memerlukan revisi PRD yang tercatat.

## 2.3 Spesifikasi Fungsi Tepi `reset-kata-sandi`

**Masukan**

```json
{ "user_id_sasaran": "uuid" }
```

**Keluaran berhasil**

```json
{ "kata_sandi_sementara": "Kn7pRx4mTq2w" }
```

**Urutan langkah, mengikat**

| No | Langkah | Catatan |
| --- | --- | --- |
| 1 | Baca token pemanggil dari kepala `Authorization`, sahkan identitasnya | Memakai klien ber-kunci publik, bukan `service_role` |
| 2 | Tolak bila token tidak sah | Kode 401 |
| 3 | Dengan klien ber-`service_role`, baca baris `users` milik pemanggil: peran, unit_id, aktif | |
| 4 | Tolak bila pemanggil tidak aktif | Kode 403 |
| 5 | Baca baris `users` milik sasaran: peran, unit_id | Tolak bila tidak ditemukan, kode 404 |
| 6 | **Periksa kewenangan menurut BR-15** | Rinciannya di bawah |
| 7 | Bangkitkan Kata Sandi Sementara | Aturannya di bawah |
| 8 | Ubah kata sandi sasaran lewat Admin API | |
| 9 | Setel `wajib_ganti_sandi = true` pada baris sasaran | |
| 10 | Hapus baris `perangkat_masuk` milik sasaran | Perangkat lama kehilangan hak tulis seketika, lihat Bagian 3 |
| 11 | Sisipkan baris `jejak_audit` bertipe `reset_sandi` | **Tanpa** memuat kata sandinya |
| 12 | Kembalikan Kata Sandi Sementara | Ditampilkan sekali, lihat KP-6.1-39 |

**Pemeriksaan kewenangan pada langkah 6**

```
peran_pemanggil = 'kasubdit'      → diizinkan untuk sasaran mana pun
peran_pemanggil = 'pemeliharaan'  → diizinkan untuk sasaran mana pun
peran_pemanggil = 'kanit'         → diizinkan HANYA bila
                                      peran_sasaran ∈ {'anggota','panit'}
                                      DAN unit_id_sasaran = unit_id_pemanggil
selain itu                        → tolak, kode 403
```

**Aturan pembangkitan Kata Sandi Sementara**

- Panjang dua belas karakter
- Hanya huruf dan angka, tanpa lambang
- **Karakter yang mudah tertukar dibuang:** angka nol, huruf O besar, angka satu, huruf I besar, huruf l kecil. Kata sandi ini disampaikan secara lisan atau lewat pesan singkat, dan satu karakter salah dengar berarti satu reset ulang
- Dibangkitkan dengan pembangkit acak kriptografis, bukan `Math.random()`

**Syarat keamanan yang mengikat**

- Kunci `service_role` disimpan sebagai rahasia Fungsi Tepi. **Dilarang** berada di berkas `.env` sisi klien, dilarang memakai awalan `NEXT_PUBLIC_`, dilarang masuk ke repositori
- Fungsi memeriksa sendiri kewenangan pemanggil dengan membaca basis data. **Dilarang** memercayai peran atau unit yang dikirim dalam badan permintaan
- Kata sandi dilarang muncul di catatan log dalam bentuk apa pun

## 2.4 Butir yang wajib diuji, bukan diasumsikan

Dokumentasi Supabase menyatakan bahwa sebuah sesi berakhir ketika penggunanya mengubah kata sandi. Yang **belum pasti** adalah apakah perubahan kata sandi yang dilakukan lewat Admin API oleh pihak lain memberi akibat yang sama.

Karena itu addendum ini **tidak** bersandar pada perilaku tersebut. Yang menjamin perangkat lama berhenti menulis adalah langkah 10, yaitu penghapusan baris `perangkat_masuk`, dipadu penegakan pada Bagian 3.4. Perilaku pengakhiran sesi diperlakukan sebagai bonus yang perlu diperiksa saat pengujian, dan dicatat sebagai butir uji U-6.1-07.

---
---

# Bagian 3 — Mekanisme pemaksaan keluar di perangkat lama

## 3.1 Dua kenyataan yang membatasi rancangan

**Pertama, pilihan bawaan tidak tersedia.** Supabase memiliki pengaturan "Single session per user" yang persis menjawab BR-16, tetapi <cite index="16-1">pengaturan tersebut termasuk fasilitas berbayar pada paket Pro</cite>. Selain itu <cite index="12-1">pemeriksaannya baru dijalankan ketika sesi disegarkan, bukan seketika saat masuk di perangkat lain</cite>. Proyek ini berjalan pada paket tanpa biaya sesuai Section 4.2, sehingga BR-16 wajib ditegakkan sendiri.

**Kedua, token tidak dapat dicabut seketika.** Ini sifat JWT dan berlaku di seluruh layanan yang memakainya. <cite index="5-1">Saat sesi diakhiri, seluruh refresh token dihancurkan, tetapi access token yang sudah beredar tetap sah sampai waktu kedaluwarsanya yang tertulis di dalam token itu sendiri</cite>. Artinya, apa pun yang dilakukan, ada jendela waktu ketika perangkat lama masih memegang token yang sah.

Kesimpulannya: pencabutan token **tidak boleh** menjadi satu-satunya pengaman. Ia dipakai, tetapi penegakan yang menentukan berada di basis data.

## 3.2 Empat lapis

| Lapis | Fungsi | Kecepatan | Dapat gagal? |
| --- | --- | --- | --- |
| 1. Pencatatan | Menetapkan perangkat mana yang sah | Seketika | Tidak |
| 2. Pencabutan token | Mematikan kemampuan memperpanjang sesi | Seketika untuk refresh token | Tidak |
| 3. Deteksi di perangkat lama | Memberi tahu pengguna dan menutup Sesi Tugas dengan rapi | Beberapa detik | **Ya**, bila jaringan mati |
| 4. Penegakan basis data | Menolak penulisan dari perangkat yang bukan Perangkat Terdaftar | Seketika | Tidak |

Lapis 3 memberi pengalaman yang baik. Lapis 4 yang memberi jaminan.

## 3.3 Lapis 1 dan 2 — di perangkat baru, tepat setelah masuk

```javascript
// Penanda perangkat dibangkitkan sekali saat pemasangan pertama,
// lalu disimpan permanen di perangkat.
// BUKAN pengenal perangkat keras: dibatasi Android dan menyentuh ranah privasi.
async function penandaPerangkat() {
  let p = await Preferences.get({ key: 'penanda_perangkat' })
  if (!p.value) {
    p = { value: crypto.randomUUID() }
    await Preferences.set({ key: 'penanda_perangkat', value: p.value })
  }
  return p.value
}

// Dijalankan segera setelah masuk berhasil.
async function daftarkanPerangkat(userId) {
  const penanda = await penandaPerangkat()

  // LAPIS 1 — baris ini adalah satu-satunya sumber kebenaran
  // tentang perangkat mana yang sedang sah.
  await supabase.from('perangkat_masuk').upsert({
    user_id: userId,
    penanda_perangkat: penanda,
    keterangan_perangkat: await keteranganPerangkat(),
    masuk_pada: new Date().toISOString()
  }, { onConflict: 'user_id' })

  // LAPIS 2 — cabut refresh token seluruh sesi lain,
  // sesi perangkat ini sendiri dipertahankan.
  await supabase.auth.signOut({ scope: 'others' })

  await catatJejakAudit('geser_perangkat', { penanda_baru: penanda })
}
```

Dua catatan penting tentang `scope: 'others'`:

- <cite index="5-1">Cakupan ini mengakhiri seluruh sesi selain sesi yang sedang berjalan</cite>, jadi perangkat baru tidak ikut terlempar keluar. Cakupan bawaannya adalah `global` yang justru akan mengeluarkan perangkat baru itu sendiri — **wajib ditulis eksplisit.**
- <cite index="2-1">Pada cakupan ini tidak ada peristiwa keluar yang dibangkitkan</cite>, sehingga perangkat lama **tidak** akan tahu dari penyimak peristiwa autentikasi. Ia baru menyadari saat gagal memperpanjang sesi. Inilah alasan Lapis 3 diperlukan.

## 3.4 Lapis 4 — penegakan di basis data

Ini bagian yang paling menentukan dan paling mudah terlewat. Karena access token perangkat lama masih sah untuk sementara waktu, penulisan darinya harus ditolak oleh basis data, bukan oleh aplikasi.

**Kolom tambahan.** Setiap tabel operasional yang ditulis dari lapangan memuat penanda perangkat penulisnya:

```sql
alter table public.location_logs
  add column penanda_perangkat text not null;

alter table public.laporan_harian
  add column penanda_perangkat text not null;
```

Kolom ini sekaligus berguna sebagai keterangan asal data saat menelusuri kejadian di kemudian hari.

**Kebijakan penulisan.**

```sql
create policy "location_logs_tulis_hanya_dari_perangkat_terdaftar"
on public.location_logs
for insert
to authenticated
with check (
  anggota_id = (select auth.uid())
  and penanda_perangkat = (select sipantau_auth.perangkat_saya())
);

create policy "laporan_tulis_hanya_dari_perangkat_terdaftar"
on public.laporan_harian
for insert
to authenticated
with check (
  anggota_id = (select auth.uid())
  and penanda_perangkat = (select sipantau_auth.perangkat_saya())
);
```

Akibatnya berlaku seketika dan tidak bergantung pada apa pun:

- Perangkat lama menyisipkan titik koordinat → ditolak, sebab penandanya sudah tidak cocok
- Perangkat lama mengirim laporan → ditolak
- Baris `perangkat_masuk` dihapus akibat reset kata sandi → seluruh penulisan ditolak, sebab fungsi `perangkat_saya()` mengembalikan nilai kosong
- Perangkat lama membaca data → **masih bisa**, sampai access token-nya kedaluwarsa. Yang terbaca hanyalah data milik pengguna itu sendiri, sehingga risikonya diterima. Dicatat pada Section 8.5 sebagai kondisi tepi yang diketahui

## 3.5 Lapis 3 — deteksi di perangkat lama

```javascript
// Perangkat menyimak barisnya sendiri pada perangkat_masuk.
supabase
  .channel('perangkat-saya')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'perangkat_masuk', filter: `user_id=eq.${userId}` },
    async (payload) => {
      const penandaLokal = await penandaPerangkat()
      const digeser = payload.eventType === 'DELETE'
                   || payload.new.penanda_perangkat !== penandaLokal
      if (digeser) await tanganiPergeseran(payload.eventType)
    })
  .subscribe()

async function tanganiPergeseran(jenis) {
  // Urutannya mengikat: tutup Sesi Tugas dulu agar Rute tersimpan utuh.
  if (sedangDalamSesiTugas()) {
    await tutupSesiTugas({
      sebab: jenis === 'DELETE'
        ? 'Sesi ditutup karena kata sandi direset'
        : 'Sesi ditutup karena masuk di perangkat lain'
    })
  }
  await supabase.auth.signOut({ scope: 'local' })
  tampilkanHalamanMasuk('Akun Anda dipakai masuk di perangkat lain.')
}
```

Cadangan bila Realtime putus: pemeriksaan yang sama dijalankan setiap kali aplikasi kembali dari latar belakang, dengan membaca satu baris `perangkat_masuk`. Bila baris tidak ada atau penandanya berbeda, `tanganiPergeseran` dipanggil.

```sql
alter publication supabase_realtime add table public.perangkat_masuk;
```

## 3.6 Masa berlaku access token

| Pilihan | Jendela perangkat lama masih dapat membaca | Akibat |
| --- | --- | --- |
| 3600 detik (bawaan) | Sampai satu jam | Penyegaran paling jarang, paling hemat kuota dan daya |
| 900 detik | Sampai lima belas menit | Penyegaran empat kali lebih sering |

**Tetap pada 3600 detik.** Jendela tersebut hanya memengaruhi pembacaan data milik pengguna itu sendiri, sedangkan seluruh penulisan sudah tertutup Lapis 4. Memperpendeknya berarti menambah percobaan penyegaran pada perangkat lapangan yang justru sering kehilangan sinyal, dengan imbalan yang kecil.

Bila kelak pemilik produk menghendaki jendela lebih sempit, perubahannya hanya satu angka pada pengaturan Auth dan tidak menyentuh kode.

## 3.7 Akibat yang diterima

Seorang pengguna yang berganti-ganti antara dua perangkat harus masuk ulang setiap kali berpindah. Ini akibat langsung BR-16 dan bukan cacat. Bila di kemudian hari ternyata memberatkan, jalan keluarnya adalah meninjau ulang BR-16, bukan menambal mekanismenya.

---
---

# Bagian 4 — Koreksi terhadap berkas Revisi v0.3

## 4.1 KP-6.1-22 diganti

| | Rumusan |
| --- | --- |
| ~~Lama~~ | ~~Bila peran atau unit pengguna diubah saat ia sedang masuk, maka token disegarkan diam-diam, menu menyesuaikan di tempat, dan sebuah penanda kecil muncul.~~ |
| **Baru** | **Bila peran atau unit pengguna diubah saat ia sedang masuk, maka kewenangannya di tingkat basis data berlaku seketika pada kueri berikutnya tanpa penyegaran token apa pun, sebab peran tidak disimpan di dalam token. Menu di layar digambar ulang begitu perubahan baris `users` diterima lewat Realtime atau lewat pembacaan ulang saat aplikasi kembali ke depan, disertai penanda kecil berbunyi "Kewenangan Anda baru saja diperbarui." Pengguna tidak dikeluarkan.** |

## 4.2 Kriteria penerimaan tambahan

| Kode | Kriteria |
| --- | --- |
| KP-6.1-44 | Bila tampilan menu belum sempat menyesuaikan setelah perubahan peran dan pengguna menekan tombol yang sudah bukan kewenangannya, maka basis data menolak permintaan itu dan pengguna menerima pesan bahwa kewenangannya telah berubah, bukan galat teknis. |
| KP-6.1-45 | Bila Fungsi Tepi `reset-kata-sandi` dipanggil oleh peran yang tidak berwenang menurut BR-15, maka fungsi menolak dengan kode 403 meski pemanggil mengirim peran palsu di badan permintaan. |
| KP-6.1-46 | Bila perangkat yang bukan Perangkat Terdaftar mengirim titik koordinat atau laporan, maka basis data menolaknya, terlepas dari apakah token perangkat itu masih sah. |
| KP-6.1-47 | Bila Realtime terputus dan perangkat lama tidak menerima pemberitahuan pergeseran, maka pemeriksaan saat aplikasi kembali ke depan tetap mendeteksinya dan menjalankan penanganan yang sama. |

## 4.3 Aturan global tambahan

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-23 | Peran dan unit tidak disimpan di dalam token autentikasi. Seluruh pemeriksaan kewenangan di tingkat basis data membaca tabel `users` melalui fungsi bantu ber-`security definer` pada skema yang tidak diekspos ke API. | Seluruh modul |
| BR-24 | Fungsi Tepi hanya boleh dipakai untuk operasi yang mensyaratkan kunci `service_role`. Pemeriksaan kewenangan wajib ditegakkan ulang di dalam fungsi tersebut dengan membaca basis data, bukan memercayai isi permintaan. Kunci `service_role` dilarang berada di sisi klien dalam bentuk apa pun. | 6.1, 6.6 |
| BR-25 | Setiap penulisan ke tabel operasional wajib menyertakan penanda perangkat, dan ditolak basis data bila tidak cocok dengan Perangkat Terdaftar pemiliknya. | 6.1, 6.3, 6.4 |

## 4.4 Perubahan Section 5

| Tabel | Perubahan |
| --- | --- |
| `location_logs` | Kolom baru `penanda_perangkat text not null` |
| `laporan_harian` | Kolom baru `penanda_perangkat text not null` |

## 4.5 Tambahan Section 8.5 — kondisi tepi yang diketahui

- Perangkat yang sudah digeser masih dapat **membaca** data milik penggunanya sendiri sampai access token-nya kedaluwarsa. Penulisan sudah tertutup sejak detik pergeseran. Diterima sebagai batas yang melekat pada JWT, bukan cacat implementasi.

## 4.6 Tambahan Section 3.6 — Glosarium

| Istilah | Definisi tunggal |
| --- | --- |
| **Fungsi Tepi** | Fungsi tanpa server yang berjalan di dalam layanan backend terkelola dan disebarkan dari project yang sama. Dipakai hanya untuk operasi yang mensyaratkan kunci istimewa. Bukan server aplikasi terpisah. Dilarang disebut sebagai backend, API, atau server. |
| **Penanda Perangkat** | Untai acak yang dibangkitkan aplikasi sekali saat pemasangan pertama dan disimpan di perangkat. Bukan pengenal perangkat keras. |

---
---

# Bagian 5 — Daftar tempel dan urutan pengerjaan

## 5.1 Tempel ke PRD

| Urutan | Tujuan | Isi |
| --- | --- | --- |
| 1 | Section 4.5 butir pertama | Amandemen pada 2.2 |
| 2 | Section 3.6 | Dua istilah pada 4.6 |
| 3 | Section 5.4 dan 5.7 | Kolom pada 4.4 |
| 4 | Section 6.1.8 (baru) | Bagian 1, 2, dan 3 berkas ini seluruhnya |
| 5 | Section 6.1.3 | Ganti KP-6.1-22, tambah KP-6.1-44 sampai 47 |
| 6 | Section 7 | BR-23, BR-24, BR-25 |
| 7 | Section 8.5 | Butir pada 4.5 |

## 5.2 Urutan pengerjaan saat sesi coding

Urutan ini mengikat karena setiap langkah bersandar pada langkah sebelumnya.

| No | Langkah | Selesai bila |
| --- | --- | --- |
| 1 | Buat skema `sipantau_auth` dan empat fungsi bantu | Fungsi dapat dipanggil dari SQL Editor dan mengembalikan nilai yang benar |
| 2 | Buat tabel `unit`, `users`, `perangkat_masuk`, `jejak_audit` beserta indeks | Skema terbentuk, data semai masuk |
| 3 | Aktifkan aturan akses baris pada keempat tabel dan tulis kebijakannya | Uji dengan tiga akun berbeda peran, masing-masing hanya melihat yang seharusnya |
| 4 | Halaman masuk berbasis NRP dan alur email sintetis | Masuk berhasil, `terakhir_masuk` terisi |
| 5 | Penggantian Kata Sandi Sementara | Halaman buntu sampai kata sandi diganti |
| 6 | Pendaftaran perangkat dan `signOut({ scope: 'others' })` | Baris `perangkat_masuk` terbentuk dan berpindah dengan benar |
| 7 | Penyimakan Realtime pada `users` dan `perangkat_masuk` | Perubahan peran terlihat di layar tanpa muat ulang |
| 8 | Fungsi Tepi `reset-kata-sandi` | Kanit dapat mereset di unitnya, ditolak di luar unitnya |
| 9 | Kunci Aplikasi PIN dan sidik jari | Terkunci setelah dua menit di latar belakang |
| 10 | Perlindungan halaman dan pengalihan | Tautan langsung ke halaman terlarang mengalihkan, bukan menampilkan galat |

## 5.3 Butir uji yang wajib dijalankan di perangkat sungguhan

Bukan di peramban komputer. Sebagian hanya muncul pada perangkat Android sungguhan dengan jaringan yang tidak stabil.

| Kode | Butir uji | Yang dibuktikan |
| --- | --- | --- |
| U-6.1-01 | Ubah peran seorang pengguna dari Kasubdit sementara pengguna itu sedang membuka aplikasi | Menu berubah tanpa keluar, dan tombol lama sudah ditolak basis data |
| U-6.1-02 | Nonaktifkan akun yang sedang dalam Sesi Tugas | Sesi Tugas tertutup, Rute utuh, pengguna kembali ke halaman masuk |
| U-6.1-03 | Masuk di telepon kedua sementara telepon pertama masih terbuka | Telepon pertama keluar dengan pesan netral |
| U-6.1-04 | Ulangi U-6.1-03 dengan telepon pertama dalam keadaan mode pesawat, lalu nyalakan jaringannya | Deteksi tetap terjadi saat jaringan kembali, dan penulisan tertunda ditolak |
| U-6.1-05 | Kanit mereset kata sandi Anggota di unit lain | Ditolak dengan kode 403 |
| U-6.1-06 | Panggil Fungsi Tepi langsung dari luar aplikasi dengan peran palsu di badan permintaan | Ditolak |
| U-6.1-07 | Periksa apakah sesi sasaran benar-benar berakhir setelah kata sandinya direset | Menentukan apakah langkah pada 2.4 perlu penanganan tambahan |
| U-6.1-08 | Buka aplikasi setelah tiga jam tanpa dipakai | Masih dalam keadaan masuk, sesuai AM-6.1-07 |
| U-6.1-09 | Panit tanpa penugasan membuka aplikasi | Kondisi kosong tampil, bukan layar kosong atau galat |
| U-6.1-10 | Sisipkan titik koordinat lewat alat luar dengan penanda perangkat yang salah | Ditolak basis data |

---

## Penutup

Setelah addendum ini ditempel, Modul 6.1 tidak lagi menyisakan titik yang mengharuskan AI Agent menebak. Setiap kriteria penerimaan memiliki jalur teknis yang tertulis, dan setiap jalur teknis memiliki batas yang dinyatakan terus terang, termasuk yang tidak dapat diatasi seperti masa berlaku access token.

Satu butir sengaja dibiarkan terbuka dan ditandai sebagai butir uji, bukan asumsi: perilaku pengakhiran sesi setelah reset kata sandi lewat Admin API. Rancangan ini tidak bersandar padanya, sehingga hasil pengujian apa pun tidak akan membatalkan apa yang sudah dibangun.


---
---

# BAGIAN D — MODUL 6.2 MANAJEMEN PENUGASAN

# SiPANTAU — Revisi PRD: Modul 6.2 Manajemen Penugasan (SPT)

**Tanggal: 1 Agustus 2026 · Status: [FINAL] · Menggantikan Section 6.2 versi kerangka 0.2**

Berkas ini disusun mengikuti kerangka Section 6.0 dan meneruskan pola berkas Revisi v0.3 milik Modul 6.1. Isinya: pengganti Section 6.2 secara utuh, ditambah perubahan pada Section 2, 3, 5, 7, 8, 9, serta Lampiran A dan B yang menjadi akibatnya.

Prioritas konflik mengikuti Section 0.3. Bila berkas ini bertentangan dengan versi 0.2, berkas ini yang berlaku. Bila bertentangan dengan Addendum 6.1-T, Addendum 6.1-T yang berlaku karena ia menyentuh fondasi autentikasi.

---

## Cara memakai berkas ini

| Bagian berkas ini | Ditempel ke PRD sebagai |
| --- | --- |
| Bagian 1 | Pengganti Section 2.3 (dua baris matriks) |
| Bagian 2 | Tambahan Section 3.1, 3.2, dan 3.7 baru |
| Bagian 3 | Pengganti Section 5.2 dan 5.3, tambahan Section 5.15 sampai 5.18, amandemen 5.10 dan 5.11 |
| Bagian 4 | Pengganti Section 6.2 secara utuh |
| Bagian 5 | Tambahan Section 7 (BR-23 sampai BR-31) |
| Bagian 6 | Tambahan Section 8.8 baru |
| Bagian 7 | Tambahan Section 9.2 |
| Bagian 8 | Perubahan Lampiran A dan B |
| Bagian 9 | Bukan untuk ditempel — daftar celah yang akan ditutup Addendum 6.2-T |

---

## Riwayat Revisi — baris tambahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.4 | 1 Agu 2026 | Modul 6.2 digali sampai final. Matriks 2.3 diamandemen: Kanit dapat menjadi pelaksana. Status SPT bertambah dari empat menjadi enam nilai. Tiga tabel baru: penugasan_dasar, penugasan_lokasi, sesi_tugas. Butir A-10 terjawab, empat butir konfirmasi baru muncul |

---
---

# Bagian 1 — Perubahan Section 2.3 Matriks Hak Akses

Dua baris berubah. Sisanya tetap seperti berkas Revisi v0.3.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Membuka dan menutup Sesi Tugas | Tidak | **Ya, bila dicantumkan sebagai pelaksana** | Ya, bila dicantumkan sebagai pelaksana | Ya |
| Mengirim Pelaporan Kegiatan Harian | Tidak | **Ya, bila dicantumkan sebagai pelaksana** | Ya, bila dicantumkan sebagai pelaksana | Ya |

### Alasan perubahan

Pada Surat Perintah Tugas yang sesungguhnya, nama Kanit tercantum sebagai petugas nomor satu pada daftar pelaksana. Matriks versi sebelumnya menutup kemungkinan itu, sehingga sistem akan memaksa kenyataan lapangan berbohong: Kanit yang benar-benar turun tidak punya cara mencatat kegiatannya, dan rutenya tidak terekam sama sekali.

Yang **tidak** berubah:

- Menyusun LHP Ringkas tetap hanya kewenangan Anggota. Kanit maupun Panit yang turun ke lapangan tetap tidak menyusun LHP. Bahan dari Sesi Tugas mereka masuk ke LHP yang disusun Anggota dalam SPT yang sama.
- Kehadiran Kanit atau Panit pada daftar pelaksana **tidak** menggantikan syarat minimal satu pelaksana berperan Anggota (BR-30).
- Lingkup data tidak melebar. Kanit tetap membaca unitnya, Panit tetap membaca penugasan yang diawasinya.

---
---

# Bagian 2 — Tambahan Section 3 Glosarium

## 3.1 Istilah peran — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Pelaksana** | Orang yang dicantumkan pada sebuah SPT untuk melaksanakan kegiatan lapangan. Dapat berperan Anggota, Panit, atau Kanit. Menggantikan pemakaian kata "Anggota pelaksana" pada versi 0.2, yang kini menjadi terlalu sempit. |

## 3.2 Istilah penugasan dan kegiatan — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Nomor Agenda** | Bagian nomor urut pada nomor SPT, berasal dari buku agenda Bagian Administrasi di luar SiPANTAU. Boleh memuat sufiks huruf untuk surat susulan, contoh 850.a. Sistem tidak pernah membangkitkannya sendiri. |
| **Dasar Penugasan** | Surat, laporan, atau disposisi yang menjadi landasan terbitnya sebuah SPT. Satu SPT dapat memiliki lebih dari satu, dan jenisnya berbeda-beda. |
| **Titik Lokasi** | Satu tempat yang tercantum pada SPT, bernomor urut. Titik Lokasi boleh memiliki koordinat, boleh pula hanya berupa keterangan tempat tanpa koordinat. Yang berkoordinat menjadi dasar penghitungan kedekatan laporan pada Modul 6.3. |
| **Lewat Batas** | Penanda tampilan pada SPT yang tanggal batasnya sudah terlampaui sementara statusnya belum Selesai maupun Dibatalkan. Penanda, bukan status. |

## 3.7 Istilah siklus hidup SPT — bagian baru

| Istilah | Definisi tunggal |
| --- | --- |
| **Draf** | SPT yang sedang disusun Kanit dan belum terbit. Tidak terlihat oleh siapa pun selain penyusunnya. Tidak memicu pemberitahuan apa pun. |
| **Terbitkan** | Tindakan Kanit yang memindahkan SPT dari Draf ke Baru. Sejak saat itu SPT terlihat oleh tim, tercatat pada jejak audit, dan sebagian kolomnya terkunci. |
| **Dibatalkan** | Status akhir bagi SPT yang terbit keliru. Berbeda dari Selesai: Dibatalkan berarti kegiatannya tidak pernah dianggap berlangsung. Wajib disertai alasan tertulis. |
| **Ditandai Bermasalah** | Tindakan manusia, bukan sistem, yang memindahkan status SPT ke Bermasalah disertai jenis masalah dan uraian wajib. |

---
---

# Bagian 3 — Perubahan Model Data

## 5.2 Tabel penugasan — pengganti utuh

**[FINAL]**

Menyimpan SPT. Hanya Kanit yang boleh membuat baris pada tabel ini.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| nomor_spt | text | Nomor surat perintah tugas, unik se-sistem. Diketik Kanit mengikuti surat fisik. Boleh kosong selama status masih draf |
| jenis_kegiatan | enum | penyelidikan, pulbaket, pengamanan. Menentukan awalan nomor SPT yang disodorkan sistem |
| judul | text | Judul penyelidikan |
| objek | text | Objek penyelidikan |
| sasaran | text | Sasaran kegiatan |
| uraian_tugas | text | Uraian naratif tugas yang diperintahkan |
| nomor_lp | text | Nomor Laporan Polisi. **Boleh kosong** — pulbaket awal kerap belum memilikinya |
| sumber_informasi | text | **Boleh kosong** — ada perkara yang sumbernya tidak dituliskan |
| unit_id | uuid | Mengacu ke unit. Menentukan siapa yang boleh melihat |
| prioritas | enum | normal, penting, urgent |
| status | enum | draf, baru, berjalan, bermasalah, selesai, dibatalkan |
| tanggal_mulai | date | Awal berlakunya penugasan |
| tanggal_batas | date | Batas waktu penugasan |
| berkas_surat_path | text | Jalur berkas pindaian surat asli pada Storage. Boleh kosong sampai menjelang penutupan, lihat BR-25 |
| diterbitkan_oleh | uuid | Mengacu ke users, wajib berperan kanit |
| ditugaskan_oleh | uuid | Mengacu ke users, wajib berperan kanit. Sama dengan diterbitkan_oleh pada keadaan biasa |
| diterbitkan_pada | timestamptz | Waktu tombol Terbitkan ditekan. Menjadi dasar bulan romawi pada nomor SPT |
| ditutup_oleh | uuid | Kanit yang menutup ke status selesai |
| ditutup_pada | timestamptz | Waktu penutupan |
| dibatalkan_oleh | uuid | Kanit atau Kasubdit yang membatalkan |
| dibatalkan_pada | timestamptz | Waktu pembatalan |
| alasan_pembatalan | text | Wajib terisi bila status bernilai dibatalkan |

**Kolom yang dicabut dari versi 0.2:** `lokasi`, `lokasi_lat`, `lokasi_lng`. Ketiganya pindah ke tabel `penugasan_lokasi` karena satu SPT dapat memuat lebih dari satu tempat.

> **Catatan amandemen.** Versi kerangka 0.2 menyatakan status SPT memiliki empat nilai. Kini enam. Dua nilai tambahan, `draf` dan `dibatalkan`, lahir dari keputusan pemilik produk pada penggalian ini. Butir "Status memiliki empat nilai" pada Section 6.2 versi 0.2 dicabut.

## 5.3 Tabel penugasan_pelaksana — pengganti tabel penugasan_anggota

**[FINAL]**

Menghubungkan satu SPT dengan orang-orang yang melaksanakannya. Diganti namanya dari `penugasan_anggota` karena pelaksana kini dapat berperan Anggota, Panit, maupun Kanit.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| pelaksana_id | uuid | Mengacu ke users. Boleh berperan anggota, panit, atau kanit |
| urutan | integer | Urutan tampil pada daftar petugas, mengikuti urutan pada surat fisik |
| ditugaskan_pada | timestamptz | Waktu pencantuman |
| dibaca_pada | timestamptz | Waktu pelaksana pertama kali membuka rincian SPT ini. Boleh kosong. Inilah tanda terima |
| dicabut_pada | timestamptz | Boleh kosong. Terisi berarti pelaksana sudah dikeluarkan dari SPT |
| dicabut_oleh | uuid | Kanit yang mencabut |
| alasan_pencabutan | text | Wajib terisi bila dicabut_pada terisi |

Pasangan `penugasan_id` dan `pelaksana_id` bersifat unik. **Baris tidak dihapus**, hanya ditandai dicabut, agar laporan dan rute yang sudah terekam tetap punya induk yang sah (BR-27).

**Kolom yang dicabut dari versi 0.2:** `sesi_aktif`, `sesi_mulai`, `sesi_selesai`. Ketiganya pindah ke tabel `sesi_tugas` — lihat 5.17 beserta alasannya.

## 5.10 Tabel unit — amandemen

Satu kolom ditambahkan pada tabel yang sudah bertanda [FINAL] di Modul 6.1:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| kode_klasifikasi | text | Kode klasifikasi surat milik unit, contoh RES.5.3. Dipakai menyusun nomor SPT. Tidak dapat diturunkan dari data mana pun, diisi saat pemasangan |

## 5.11 Tabel penugasan_panit — amandemen

Tiga kolom ditambahkan pada tabel yang sudah bertanda [FINAL] di Modul 6.1:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| dicabut_pada | timestamptz | Boleh kosong. Terisi berarti penunjukan sebagai Panit Penanggung Jawab sudah berakhir |
| dicabut_oleh | uuid | Kanit yang mencabut |
| alasan_pencabutan | text | Wajib terisi bila dicabut_pada terisi |

Ketentuan Modul 6.1 bahwa baris tidak pernah dihapus tetap berlaku dan kini punya wujud teknisnya. Akibat kolom ini terhadap aturan akses baris dijelaskan pada Bagian 7 dan menjadi salah satu celah yang ditutup Addendum 6.2-T.

## 5.15 Tabel penugasan_dasar — tabel baru

**[FINAL]**

Menyimpan landasan terbitnya SPT. Dibuat sebagai tabel tersendiri karena satu SPT lazim memiliki beberapa dasar dengan jenis berbeda.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| urutan | integer | Urutan tampil, mengikuti penomoran pada surat |
| jenis | enum | laporan_informasi, laporan_polisi, laporan_pengaduan, surat_perintah_terdahulu, disposisi_pimpinan, lainnya |
| nomor | text | Nomor surat atau laporan yang dijadikan dasar |
| tanggal | date | Tanggal surat atau laporan tersebut |
| keterangan | text | Uraian singkat, boleh kosong. Wajib terisi bila jenis bernilai lainnya |

Setiap SPT wajib memiliki sekurang-kurangnya satu baris pada tabel ini sebelum dapat diterbitkan.

## 5.16 Tabel penugasan_lokasi — tabel baru

**[FINAL]**

Menyimpan tempat-tempat yang tercantum pada SPT, berurutan.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | Mengacu ke penugasan |
| urutan | integer | Nomor titik: 1, 2, 3, dan seterusnya. Menentukan penamaan Titik 1, Titik 2 di antarmuka |
| nama | text | Nama tempat, contoh Bandara Internasional Kertajati |
| alamat | text | Alamat lengkap dalam bentuk teks, boleh kosong |
| keterangan | text | Peran titik ini dalam perkara, contoh lokasi pemeriksaan, lokasi transaksi. Boleh kosong |
| lat | numeric | Lintang. **Boleh kosong** |
| lng | numeric | Bujur. **Boleh kosong** |
| radius_meter | integer | Ambang jarak titik ini, bawaan 300, rentang 100 sampai 2000. Kosong bila titik tanpa koordinat |

Ketentuan:

- Sekurang-kurangnya satu titik wajib memiliki koordinat sebelum SPT dapat diterbitkan. Tanpa itu, Modul 6.3 tidak punya pembanding untuk menetapkan status lokasi laporan.
- Titik tanpa koordinat diperbolehkan dan bukan kekurangan data. Ada tempat yang memang tidak dapat dijatuhi pin, misalnya wilayah negara lain pada perkara lintas batas.
- Titik yang sudah pernah dirujuk sebuah laporan tidak boleh dihapus, hanya boleh disunting. Lihat KP-6.2-42.

## 5.17 Tabel sesi_tugas — tabel baru

**[KERANGKA]** — bentuk akhirnya ditetapkan pada Modul 6.4. Dibentuk di sini karena Modul 6.2 sudah membutuhkannya.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | SPT yang sedang dikerjakan |
| pengguna_id | uuid | Pemegang sesi. Boleh berperan anggota, panit, atau kanit |
| dibuka_pada | timestamptz | Waktu Mulai Tugas |
| ditutup_pada | timestamptz | Waktu Selesai Tugas. Kosong berarti sesi masih berjalan |
| sebab_penutupan | enum | Ditetapkan pada Modul 6.4. Sekurang-kurangnya memuat nilai untuk penutupan manual dan penutupan akibat keluar aplikasi (BR-19) |

> **Mengapa tabel tersendiri, bukan kolom pada tabel penghubung.** Versi 0.2 menyimpan keadaan sesi sebagai tiga kolom pada `penugasan_anggota`, sehingga hanya sesi terakhir yang tersimpan. Satu SPT berlangsung berhari-hari dan orang yang sama membuka lalu menutup sesi berkali-kali; dengan rancangan lama, rute hari pertama hilang begitu sesi hari kedua dibuka. Sejak Modul 6.1 memberi Panit kewenangan membuka Sesi Tugas dan penggalian ini menambahkan Kanit, rancangan lama juga akan menuntut kolom kembar di tiga tabel penghubung yang berbeda.
>
> Tabel tersendiri sekaligus memberi tempat penegakan aturan satu sesi aktif per orang (BR-24), yang tidak mungkin ditegakkan bila keadaannya tersebar di beberapa tabel.

## 5.18 Perubahan tabel laporan_harian

**[KERANGKA]** — difinalkan pada Modul 6.3. Dua perubahan sudah pasti dan dicatat di sini agar tidak terlewat:

| Perubahan | Alasan |
| --- | --- |
| Kolom `anggota_id` diganti nama menjadi `pelapor_id` | Pelapor kini dapat berperan Anggota, Panit, atau Kanit |
| Kolom baru `lokasi_id` uuid, boleh kosong, mengacu ke penugasan_lokasi | Menandai laporan ini dibuat di titik yang mana |

## 5.8 Hubungan antar entitas — pengganti

```
unit
 └── penugasan
       ├── penugasan_dasar        (jamak, minimal 1)
       ├── penugasan_lokasi       (jamak, minimal 1 berkoordinat)
       ├── penugasan_panit        (jamak, minimal 1 aktif)
       ├── penugasan_pelaksana    (jamak, minimal 1 berperan anggota)
       ├── sesi_tugas             (jamak, milik 6.4)
       ├── laporan_harian         (jamak, milik 6.3)
       └── lhp                    (milik 6.8)
```

---
---

# Bagian 4 — Pengganti Section 6.2 secara utuh

**Status: [FINAL]**

## 6.2.1 Deskripsi

Modul ini mengatur seluruh daur hidup Surat Perintah Tugas di dalam sistem: penyusunan draf, penerbitan oleh Kanit, penyusunan tim, penyuntingan, perpanjangan, penandaan bermasalah, penutupan, pembatalan, serta penyajian daftar dan riwayat sesuai lingkup data tiap peran. Modul ini adalah tempat lahirnya seluruh konteks yang dipakai modul lain — tidak ada laporan, titik koordinat, foto, maupun LHP yang boleh ada tanpa SPT yang menaunginya.

Yang **bukan** urusan modul ini: pembukaan dan penutupan Sesi Tugas beserta perekaman posisi (Modul 6.4), isi dan peninjauan laporan harian (Modul 6.3), penyusunan LHP (Modul 6.8), serta pengiriman pemberitahuan (Modul 6.9). Modul ini hanya menetapkan **kapan** pemberitahuan harus terpicu, bukan bagaimana ia dikirim.

Satu hal yang sengaja tidak dilakukan modul ini: **menerbitkan nomor surat**. SiPANTAU bukan sistem persuratan. Nomor agenda hidup di buku agenda Bagian Administrasi, dan sistem hanya menyodorkan kerangka nomor lalu menerima apa yang diketik Kanit.

## 6.2.2 Cerita pengguna

**Kanit**

- Sebagai Kanit, saya ingin menyusun SPT secara bertahap sebagai draf, agar saya dapat menyicilnya sambil menunggu nomor agenda keluar tanpa mengirim penugasan setengah jadi kepada tim.
- Sebagai Kanit, saya ingin sistem menyodorkan kerangka nomor SPT yang sudah terisi bulan, tahun, kode klasifikasi, dan kesatuan, agar saya cukup mengetik nomor agendanya saja.
- Sebagai Kanit, saya ingin mencantumkan beberapa dasar penugasan sekaligus, agar SPT di sistem sama isinya dengan surat fisik.
- Sebagai Kanit, saya ingin menandai beberapa titik lokasi berurutan pada peta, agar tim tahu tempat mana yang menjadi sasaran pertama, kedua, dan seterusnya.
- Sebagai Kanit, saya ingin menunjuk Panit Penanggung Jawab dan pelaksana dalam satu formulir, agar susunan tim selesai bersamaan dengan terbitnya SPT.
- Sebagai Kanit, saya ingin mencantumkan nama saya sendiri sebagai pelaksana bila saya ikut turun, agar kegiatan saya di lapangan ikut terekam.
- Sebagai Kanit, saya ingin memperpanjang batas waktu disertai alasan, agar perpanjangan tercatat dan tidak terlihat seperti manipulasi tanggal.
- Sebagai Kanit, saya ingin menutup SPT yang sudah rampung, agar daftar penugasan aktif tetap bersih.
- Sebagai Kanit, saya ingin membatalkan SPT yang keliru terbit disertai alasan, agar kekeliruan tercatat dan tidak sekadar hilang.
- Sebagai Kanit, saya ingin mengetahui siapa dari tim yang belum membuka SPT-nya, agar saya dapat menghubunginya langsung.

**Panit**

- Sebagai Panit, saya ingin melihat hanya penugasan yang saya awasi, agar perhatian saya tidak terpecah pada perkara yang bukan tanggung jawab saya.
- Sebagai Panit, saya ingin menandai penugasan sebagai bermasalah disertai uraian, agar Kanit tahu keadaannya tanpa perlu saya telepon.
- Sebagai Panit, saya ingin tetap dapat membaca penugasan lama yang pernah saya awasi, agar saya punya rujukan saat menangani perkara serupa.

**Anggota**

- Sebagai Anggota, saya ingin melihat daftar penugasan yang ditujukan kepada saya beserta batas waktunya, agar saya tahu apa yang harus dikerjakan hari ini.
- Sebagai Anggota, saya ingin membaca rincian penugasan lengkap dengan titik lokasi dan uraian tugas, agar saya paham apa yang diperintahkan sebelum berangkat.
- Sebagai Anggota, saya ingin menandai penugasan sebagai bermasalah ketika alamatnya ternyata fiktif, agar keadaan itu tercatat resmi dan bukan sekadar cerita lisan.

**Kasubdit**

- Sebagai Kasubdit, saya ingin melihat seluruh penugasan lintas unit dengan penyaring per unit, agar saya dapat menimbang beban kerja tiap unit.

## 6.2.3 Kriteria penerimaan

### Penyusunan draf dan penerbitan

| Kode | Kriteria |
| --- | --- |
| KP-6.2-01 | Bila pengguna berperan selain Kanit membuka halaman Penugasan, maka tombol Terbitkan Penugasan tidak ditampilkan sama sekali |
| KP-6.2-02 | Bila Kanit menyimpan formulir penugasan tanpa menekan Terbitkan, maka SPT tersimpan berstatus draf dan tidak terlihat oleh siapa pun selain Kanit penyusunnya |
| KP-6.2-03 | Bila SPT berstatus draf, maka tidak ada pemberitahuan yang terkirim kepada siapa pun |
| KP-6.2-04 | Bila Kanit menekan Terbitkan sementara salah satu dari empat syarat belum terpenuhi — minimal satu dasar penugasan, minimal satu titik lokasi berkoordinat, minimal satu Panit Penanggung Jawab, minimal satu pelaksana berperan Anggota — maka penerbitan ditolak dan sistem menyebutkan syarat mana yang kurang |
| KP-6.2-05 | Bila Kanit menekan Terbitkan sementara nomor SPT masih kosong, maka penerbitan ditolak |
| KP-6.2-06 | Bila SPT berhasil diterbitkan, maka statusnya menjadi baru, kolom diterbitkan_pada terisi waktu server, dan seluruh Panit Penanggung Jawab beserta pelaksana menerima pemberitahuan |
| KP-6.2-07 | Bila SPT sudah terbit, maka kolom nomor_spt, unit_id, dan tanggal_mulai tidak dapat lagi disunting oleh siapa pun |
| KP-6.2-08 | Bila Kanit menerbitkan SPT untuk unit selain unitnya sendiri, maka tindakan ditolak di tingkat basis data, bukan hanya di antarmuka |

### Nomor SPT

| Kode | Kriteria |
| --- | --- |
| KP-6.2-09 | Bila Kanit membuka formulir penugasan baru dan memilih jenis kegiatan, maka sistem menyodorkan kerangka nomor dengan bagian nomor agenda dikosongkan, dan bagian lainnya terisi dari jenis kegiatan, bulan berjalan dalam angka romawi, kode klasifikasi unit, tahun berjalan, dan nama kesatuan |
| KP-6.2-10 | Bila Kanit mengetik nomor agenda, maka sistem menerima angka dengan sufiks huruf opsional, contoh 850 maupun 850.a |
| KP-6.2-11 | Bila Kanit menimpa seluruh nomor dengan bentuk yang tidak sesuai pola, maka sistem menampilkan peringatan tetapi **tetap mengizinkan** penyimpanan, sejalan dengan BR-05 |
| KP-6.2-12 | Bila nomor SPT yang diketik sudah dipakai SPT lain di seluruh sistem, maka penyimpanan ditolak dan sistem menyebutkan SPT mana yang sudah memakainya, sepanjang SPT tersebut berada dalam lingkup data pengguna |
| KP-6.2-13 | Bila SPT yang sudah dipakai berada di luar lingkup data pengguna, maka sistem hanya menyatakan nomor sudah terpakai tanpa menyebutkan rinciannya |

### Dasar penugasan dan titik lokasi

| Kode | Kriteria |
| --- | --- |
| KP-6.2-14 | Bila Kanit menambah dasar penugasan, maka ia mengisi jenis, nomor, dan tanggal, dan dapat menambah baris berikutnya tanpa batas |
| KP-6.2-15 | Bila jenis dasar bernilai lainnya, maka kolom keterangan wajib terisi |
| KP-6.2-16 | Bila Kanit menambah titik lokasi, maka ia dapat menetapkan koordinatnya dengan tiga cara: menjatuhkan pin di peta, mengetik lintang dan bujur, atau mencari nama tempat |
| KP-6.2-17 | Bila Kanit menambah titik lokasi tanpa koordinat, maka titik tetap tersimpan sebagai keterangan tempat dan tidak dipakai menghitung kedekatan laporan |
| KP-6.2-18 | Bila titik lokasi memiliki koordinat, maka radius bawaannya 300 meter dan dapat diubah dalam rentang 100 sampai 2000 meter |
| KP-6.2-19 | Bila Kanit mengubah urutan titik lokasi, maka penomoran Titik 1, Titik 2, dan seterusnya ikut berubah pada seluruh tampilan, sedangkan laporan yang sudah tertaut tetap menunjuk titik yang sama |

### Susunan tim

| Kode | Kriteria |
| --- | --- |
| KP-6.2-20 | Bila Kanit menyusun tim, maka daftar orang yang dapat dipilih hanya memuat pengguna aktif di unitnya sendiri, dan tidak pernah memuat Akun Pemeliharaan |
| KP-6.2-21 | Bila Kanit mencantumkan dirinya sendiri sebagai pelaksana, maka pencantuman diterima dan ia memperoleh kemampuan membuka Sesi Tugas serta mengirim laporan harian pada SPT tersebut saja |
| KP-6.2-22 | Bila seorang Panit dicantumkan sekaligus sebagai Panit Penanggung Jawab dan sebagai pelaksana pada SPT yang sama, maka keduanya diterima, tetapi tombol beri catatan tidak ditampilkan pada laporan miliknya sendiri |
| KP-6.2-23 | Bila Kanit mencabut seorang pelaksana, maka ia wajib mengisi alasan, baris tidak dihapus melainkan ditandai dicabut, dan laporan, foto, serta rute yang sudah terekam tetap ada |
| KP-6.2-24 | Bila seorang pelaksana dicabut, maka SPT tersebut hilang dari daftar aktifnya, tetapi tetap terbaca pada riwayatnya dengan penanda dicabut beserta tanggalnya |
| KP-6.2-25 | Bila Kanit mencabut Panit Penanggung Jawab terakhir pada sebuah SPT, maka pencabutan ditolak dengan keterangan bahwa SPT harus selalu memiliki sekurang-kurangnya satu Panit Penanggung Jawab aktif |
| KP-6.2-26 | Bila Kanit mencabut pelaksana berperan Anggota terakhir pada sebuah SPT, maka pencabutan ditolak dengan keterangan serupa |
| KP-6.2-27 | Bila seorang Panit dicabut penunjukannya, maka ia tidak lagi menerima pemberitahuan dan tidak dapat memberi catatan baru pada laporan di SPT tersebut, tetapi tetap dapat membacanya |
| KP-6.2-28 | Bila pelaksana membuka rincian SPT untuk pertama kalinya, maka kolom dibaca_pada terisi waktu server tanpa tindakan tambahan dari pengguna |
| KP-6.2-29 | Bila Kanit membuka daftar pelaksana, maka setiap orang menampilkan penanda sudah membuka atau belum membuka beserta waktunya |

### Status dan perpindahannya

| Kode | Kriteria |
| --- | --- |
| KP-6.2-30 | Bila laporan harian pertama masuk pada sebuah SPT berstatus baru, maka statusnya berpindah ke berjalan tanpa campur tangan siapa pun |
| KP-6.2-31 | Bila Sesi Tugas dibuka pada SPT berstatus baru, maka status **tidak** berubah, dan kartu SPT menampilkan lencana terpisah berisi jumlah sesi tugas yang sedang berjalan |
| KP-6.2-32 | Bila pelaksana atau Panit Penanggung Jawab menandai SPT sebagai bermasalah, maka ia wajib memilih jenis masalah dan mengisi uraian, dan status berpindah ke bermasalah |
| KP-6.2-33 | Bila SPT ditandai bermasalah, maka Kanit dan seluruh Panit Penanggung Jawab menerima pemberitahuan berisi jenis masalah dan uraiannya |
| KP-6.2-34 | Bila SPT berstatus bermasalah, maka pelaksana **tetap** dapat membuka Sesi Tugas dan mengirim laporan. Bermasalah adalah keterangan keadaan, bukan penghentian kegiatan |
| KP-6.2-35 | Bila Kanit mengembalikan SPT dari bermasalah, maka status kembali ke berjalan dan alasan pengembalian wajib diisi |
| KP-6.2-36 | Bila tanggal batas terlampaui sementara status belum selesai maupun dibatalkan, maka SPT menampilkan penanda Lewat Batas dan Kanit menerima pemberitahuan. Status **tidak** berubah dengan sendirinya |
| KP-6.2-37 | Bila sistem hendak menandai sebuah SPT sebagai bermasalah tanpa tindakan manusia, maka itu adalah cacat. Status bermasalah hanya berasal dari manusia |

### Penyuntingan dan perpanjangan

| Kode | Kriteria |
| --- | --- |
| KP-6.2-38 | Bila SPT berstatus baru, berjalan, atau bermasalah, maka Kanit dapat menyunting judul, objek, sasaran, uraian tugas, jenis kegiatan, nomor LP, sumber informasi, prioritas, dasar penugasan, titik lokasi, dan susunan tim |
| KP-6.2-39 | Bila SPT disunting setelah terbit, maka perubahan tercatat pada jejak audit lengkap dengan nama kolom, nilai lama, dan nilai baru |
| KP-6.2-40 | Bila SPT disunting sementara ada Sesi Tugas yang sedang berjalan untuk SPT tersebut, maka penyuntingan tetap diizinkan dan pemegang sesi menerima pemberitahuan Penugasan diperbarui |
| KP-6.2-41 | Bila Kanit mengubah tanggal batas, maka alasan wajib diisi, tidak ada batas berapa kali perpanjangan boleh dilakukan, dan seluruh riwayat perpanjangan terbaca pada rincian SPT |
| KP-6.2-42 | Bila Kanit menghapus titik lokasi yang sudah dirujuk sebuah laporan, maka penghapusan ditolak. Titik tersebut hanya dapat disunting |
| KP-6.2-43 | Bila SPT berstatus selesai atau dibatalkan, maka seluruh kolom terkunci dan tidak ada tombol sunting yang ditampilkan |

### Penutupan, pembatalan, pembukaan kembali

| Kode | Kriteria |
| --- | --- |
| KP-6.2-44 | Bila Kanit menekan Tutup Penugasan, maka sistem menampilkan daftar hal yang belum beres — Sesi Tugas yang masih terbuka, LHP Ringkas yang belum masuk, pelaksana yang belum pernah melapor — lalu **tetap mengizinkan** penutupan bila Kanit melanjutkan |
| KP-6.2-45 | Bila SPT hendak ditutup sementara berkas surat perintah belum dilampirkan, maka penutupan ditolak sampai berkas diunggah |
| KP-6.2-46 | Bila SPT ditutup, maka seluruh Sesi Tugas yang masih terbuka pada SPT tersebut ikut ditutup dan rutenya tersimpan utuh |
| KP-6.2-47 | Bila Kanit membatalkan SPT, maka alasan pembatalan wajib diisi, status menjadi dibatalkan, dan seluruh tim menerima pemberitahuan |
| KP-6.2-48 | Bila SPT belum pernah memiliki laporan, foto, rute, maupun Sesi Tugas, maka Kanit dapat menghapusnya secara permanen. Selain keadaan itu, satu-satunya jalan adalah pembatalan |
| KP-6.2-49 | Bila SPT dihapus permanen, maka penghapusannya tetap tercatat pada jejak audit lengkap dengan nomor SPT dan judulnya |
| KP-6.2-50 | Bila Kanit unit pemilik atau Kasubdit membuka kembali SPT berstatus selesai, maka status kembali ke berjalan, alasan wajib diisi, dan seluruh tim menerima pemberitahuan |
| KP-6.2-51 | Bila SPT berstatus dibatalkan, maka ia tidak dapat dibuka kembali dalam bentuk apa pun |

### Daftar, riwayat, lingkup data

| Kode | Kriteria |
| --- | --- |
| KP-6.2-52 | Bila pengguna membuka halaman Penugasan, maka yang tampil hanya SPT berstatus baru, berjalan, dan bermasalah |
| KP-6.2-53 | Bila pengguna membuka submenu Riwayat, maka yang tampil adalah SPT berstatus selesai dan dibatalkan, dengan penyaring bawaan enam bulan ke belakang dan tanpa batas jangkauan bila penyaring dilonggarkan |
| KP-6.2-54 | Bila Kanit membuka daftar, maka ia melihat seluruh SPT unitnya termasuk drafnya sendiri, dan tidak pernah melihat draf Kanit lain |
| KP-6.2-55 | Bila Panit membuka daftar, maka ia hanya melihat SPT tempat ia ditunjuk sebagai Panit Penanggung Jawab, baik penunjukan yang masih aktif maupun yang sudah dicabut |
| KP-6.2-56 | Bila Anggota membuka daftar, maka ia hanya melihat SPT tempat ia dicantumkan sebagai pelaksana |
| KP-6.2-57 | Bila Kasubdit membuka daftar, maka ia melihat seluruh SPT lintas unit dan memperoleh penyaring tambahan berupa unit |
| KP-6.2-58 | Bila seorang Panit belum pernah ditunjuk pada satu SPT pun, maka menu Penugasan tidak ditampilkan padanya. Begitu ia pernah ditunjuk sekali, menu tampil seterusnya |
| KP-6.2-59 | Bila daftar ditampilkan tanpa penyaring, maka urutannya prioritas menurun, lalu tanggal batas terdekat di atas, lalu yang terbaru |
| KP-6.2-60 | Bila pengguna mengetik pada kotak pencarian, maka sistem menyisir nomor SPT, judul, objek, sasaran, nama titik lokasi, serta nama dan NRP anggota tim, terbatas pada data dalam lingkupnya |

### Jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.2-61 | Bila terjadi salah satu tindakan berikut, maka satu baris jejak audit tercatat: terbit_spt, sunting_spt, tutup_spt, batal_spt, hapus_spt, buka_kembali_spt, tandai_bermasalah, kembalikan_dari_bermasalah, perpanjang_batas, tambah_pelaksana, cabut_pelaksana, tunjuk_panit, cabut_panit |
| KP-6.2-62 | Bila SPT masih berstatus draf, maka penyuntingannya **tidak** dicatat pada jejak audit. Draf belum menjadi dokumen |

## 6.2.4 Aturan modul

1. **Sistem tidak menerbitkan nomor surat.** Bagian nomor agenda selalu berasal dari manusia. Kerangka nomor yang disodorkan sistem adalah bantuan pengetikan, bukan penomoran resmi.
2. **Tim melekat pada SPT.** Tidak ada susunan tim yang berlaku permanen di tingkat unit. Setiap SPT menyusun timnya sendiri dari awal.
3. **Tidak ada baris penghubung yang dihapus.** Pencabutan Panit maupun pelaksana selalu berupa penandaan, tidak pernah berupa penghapusan baris, agar laporan dan rute yang sudah terekam tidak kehilangan induknya.
4. **Empat syarat minimum saat terbit**: satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab, satu pelaksana berperan Anggota. Keempatnya wajib bertahan selama SPT hidup, sehingga pencabutan yang akan melanggarnya ditolak.
5. **Status berpindah karena kejadian, bukan karena jam.** Satu-satunya perpindahan yang berjalan sendiri adalah baru menjadi berjalan akibat laporan pertama. Selebihnya berasal dari tindakan manusia. Lewatnya batas waktu hanya menerbitkan penanda dan pemberitahuan.
6. **Bermasalah adalah keterangan, bukan sanksi.** Penandaannya tidak menghentikan kegiatan, tidak mengunci apa pun, dan tidak boleh dirumuskan sebagai tuduhan pada teks antarmuka mana pun, sejalan dengan Prinsip 0.6.
7. **Draf bukan dokumen.** Selama berstatus draf, SPT tidak terlihat siapa pun selain penyusunnya, tidak memicu pemberitahuan, dan tidak tercatat pada jejak audit.
8. **Kewenangan tindakan dan lingkup data diperiksa terpisah.** Kanit boleh menerbitkan SPT, tetapi hanya untuk unitnya. Kasubdit melihat semuanya, tetapi tidak boleh menerbitkan apa pun. Pemeriksaan dilakukan dua kali, sejalan dengan Section 2.4.
9. **Menjadi pelaksana tidak menambah lingkup data.** Kanit yang mencantumkan dirinya sebagai pelaksana memperoleh kemampuan membuka Sesi Tugas dan melapor pada SPT itu, bukan hak baca yang lebih luas.
10. **Tidak ada yang meninjau laporannya sendiri**, berapa pun tinggi perannya.

## 6.2.5 Antarmuka dan kondisi tampilan

### Halaman Daftar Penugasan

Bagian atas memuat judul yang berbeda tiap peran, tombol tindakan, kotak pencarian, tiga tombol cepat (Lewat Batas, Bermasalah, Belum Ada Laporan), dan baris penyaring.

| Peran | Judul | Tombol tindakan |
| --- | --- | --- |
| Kanit | Penugasan Unit | Terbitkan Penugasan, Unduh Rekap |
| Kasubdit | Seluruh Penugasan | Unduh Rekap |
| Panit | Penugasan yang Saya Awasi | tidak ada |
| Anggota | Tugas Saya | tidak ada |

Penyaring: status, prioritas, rentang tanggal, Panit Penanggung Jawab (Kanit dan Kasubdit saja), unit (Kasubdit saja). Pemuatan bertahap 20 baris dengan tombol Muat Lagi.

Kartu SPT memuat: nomor SPT, judul, lencana prioritas, lencana status, nama titik lokasi pertama, tanggal batas, jumlah laporan masuk dibanding jumlah pelaksana, deretan foto kecil anggota tim, serta dua penanda kondisional — Lewat Batas berwarna merah dan lencana jumlah Sesi Tugas berjalan.

### Formulir Penerbitan Penugasan

Empat langkah, dapat disimpan sebagai draf kapan saja pada langkah mana pun:

1. **Keterangan penugasan** — jenis kegiatan, nomor SPT (kerangka tersodor), judul, objek, sasaran, uraian tugas, nomor LP, sumber informasi, prioritas, tanggal mulai, tanggal batas.
2. **Dasar penugasan** — daftar yang dapat ditambah baris, minimal satu.
3. **Titik lokasi** — peta Leaflet dengan daftar titik bernomor di sampingnya. Setiap titik dapat diatur dengan pin, ketikan koordinat, atau pencarian nama tempat, dan memiliki pengatur radius. Minimal satu titik berkoordinat.
4. **Susunan tim** — dua daftar terpisah, Panit Penanggung Jawab dan pelaksana, keduanya memilih dari personel aktif di unit. Nama Kanit sendiri muncul sebagai pilihan pada daftar pelaksana.

Berkas surat diunggah dari halaman rincian, bukan dari formulir ini, karena surat fisik kerap ditandatangani belakangan.

### Halaman Rincian Penugasan

Bagian atas: nomor SPT, judul, lencana prioritas dan status, tombol tindakan sesuai peran.

Badan halaman: keterangan penugasan, daftar dasar penugasan, peta dengan seluruh titik bernomor beserta lingkaran radiusnya, daftar Panit Penanggung Jawab, daftar pelaksana beserta penanda sudah atau belum membuka, rekam kegiatan, riwayat perpanjangan, serta kotak berkas surat perintah.

| Peran | Tombol yang tampil |
| --- | --- |
| Kanit pemilik unit | Sunting, Kelola Tim, Perpanjang Batas, Unggah Surat, Tutup Penugasan, Batalkan, Hapus (hanya bila belum ada jejak kegiatan sama sekali) |
| Kasubdit | Buka Kembali (hanya pada status selesai) |
| Panit Penanggung Jawab aktif | Tandai Bermasalah |
| Panit yang sudah dicabut | tidak ada, halaman hanya terbaca |
| Pelaksana | Tandai Bermasalah, Mulai Tugas (milik Modul 6.4) |

### Kondisi kosong

| Keadaan | Yang ditampilkan |
| --- | --- |
| Kanit belum pernah menerbitkan SPT | Ajakan menerbitkan penugasan pertama beserta tombolnya |
| Anggota belum punya penugasan aktif | Keterangan bahwa belum ada penugasan yang ditujukan kepadanya, tanpa nada menyalahkan |
| Panit belum pernah ditunjuk sama sekali | Menu Penugasan tidak ditampilkan |
| Panit pernah ditunjuk tetapi tidak ada yang aktif | Daftar kosong disertai ajakan membuka submenu Riwayat |
| Penyaring tidak menghasilkan apa pun | Ajakan melonggarkan penyaring beserta tombol Tampilkan Semua |
| Riwayat kosong pada rentang enam bulan | Ajakan melebarkan rentang tanggal |

### Kondisi memuat dan galat

- Daftar memakai kerangka abu-abu tiga kartu selama memuat, bukan pemutar lingkaran.
- Peta pada formulir menampilkan kotak abu-abu dengan tulisan Memuat peta bila ubin OpenStreetMap belum tiba.
- Bila pengunggahan berkas surat terputus, berkas lama tetap utuh dan sistem menawarkan mengulang, tanpa membatalkan penyuntingan lain yang sedang berjalan.
- Bila layanan tidak terjangkau saat menekan Terbitkan, isian formulir tidak hilang dan tetap dapat disimpan sebagai draf lokal.

### Perbedaan antar peran

Menu, tombol, dan penyaring yang berada di luar kewenangan tidak ditampilkan sama sekali, bukan ditampilkan dalam keadaan nonaktif (BR-11). Draf hanya terlihat oleh Kanit penyusunnya, termasuk tidak terlihat oleh Kasubdit maupun Akun Pemeliharaan pada tampilan daftar biasa.

## 6.2.6 Edge case modul

| Kondisi | Penanganan |
| --- | --- |
| Nomor SPT yang diketik ternyata sudah dipakai | Penyimpanan ditolak. Bila SPT pemakainya berada dalam lingkup pengguna, sistem menyebutkan nomor dan judulnya. Bila di luar lingkup, sistem hanya menyatakan nomor sudah terpakai |
| Tanggal batas lebih awal daripada tanggal mulai | Penyimpanan ditolak dengan keterangan singkat |
| Perpanjangan memundurkan tanggal batas ke masa lalu | Diizinkan, karena koreksi salah ketik juga perlu jalan. Alasan tetap wajib dan tercatat |
| Kanit dipindah unit setelah menerbitkan SPT | SPT tetap milik unit lamanya. Kanit yang berpindah kehilangan akses ke SPT tersebut. Kanit baru di unit itu mewarisi kewenangan penuh atasnya |
| Pelaksana dinonaktifkan akunnya saat SPT berjalan | Baris pelaksana tidak dicabut dan laporannya tetap terhitung. Nama ditampilkan dengan penanda akun nonaktif |
| Panit Penanggung Jawab dinonaktifkan akunnya | SPT dianggap kehilangan Panit aktif. Kanit menerima pemberitahuan agar menunjuk pengganti. Kegiatan tidak dihentikan |
| Dua orang menandai bermasalah hampir bersamaan | Penandaan pertama yang menetapkan status. Penandaan kedua tetap tersimpan sebagai catatan tambahan, tidak ditolak |
| Kanit menyunting SPT saat Panit sedang menulis catatan pada laporan di SPT yang sama | Keduanya berjalan. Tidak ada penguncian tingkat halaman |
| Draf ditinggalkan berbulan-bulan | Tidak dihapus dan tidak kedaluwarsa. Ditandai pada daftar draf dengan umurnya |
| SPT dibuka kembali padahal LHP-nya sudah diekspor | Diizinkan. Berkas ekspor yang terlanjur keluar tidak ditarik. Pembukaan kembali tercatat pada jejak audit |
| Titik lokasi disunting setelah laporan tertaut padanya | Diizinkan. Status lokasi laporan lama **tidak** dihitung ulang, karena penilaian saat itu dilakukan atas keadaan saat itu |
| Kanit menghapus SPT permanen tepat saat pelaksana membuka Sesi Tugas | Penghapusan ditolak karena syarat belum pernah ada Sesi Tugas tidak lagi terpenuhi |
| Berkas surat diunggah dua kali | Berkas terakhir menggantikan yang sebelumnya. Penggantian tercatat pada jejak audit |
| Kanit mencantumkan dirinya sebagai pelaksana lalu perannya diturunkan menjadi Panit | Pencantuman tetap sah. Ia tetap dapat melaksanakan tugas, karena kemampuan itu memang melekat pada pencantuman, bukan pada peran |

## 6.2.7 Ketergantungan

**Bergantung pada Modul 6.1 yang harus sudah selesai**, untuk pembacaan peran dan unit lewat fungsi bantu `sipantau_auth`, tabel `users` dan `unit`, tabel `penugasan_panit`, serta tabel `jejak_audit`.

Yang bergantung pada modul ini:

| Modul | Yang dibutuhkannya dari 6.2 |
| --- | --- |
| 6.3 Pelaporan Harian | SPT sebagai induk laporan, daftar pelaksana sebagai penentu siapa yang boleh melapor, titik lokasi beserta radiusnya sebagai pembanding status lokasi |
| 6.4 GPS Tracking | SPT sebagai konteks wajib tiap titik koordinat (BR-13), tabel sesi_tugas, dan aturan satu sesi aktif per orang |
| 6.5 Dashboard | Status, prioritas, dan lingkup data SPT sebagai bahan seluruh angka ringkasan |
| 6.7 Kolase | SPT sebagai pengelompok foto |
| 6.8 LHP Ringkas | Keterangan penugasan, dasar, titik lokasi, dan daftar petugas sebagai bagian terisi otomatis |
| 6.9 Notifikasi | Sebelas kejadian pemicu yang didaftar pada modul ini |

Yang dibutuhkan dari luar sebelum modul ini dianggap selesai seluruhnya: kode klasifikasi surat tiap unit (butir A-12) dan daftar resmi jenis masalah (butir A-11). Keduanya dapat diganti belakangan tanpa mengubah kode.

---
---

# Bagian 5 — Tambahan Section 7 Business Rules Global

| Kode | Aturan | Modul terkait |
| --- | --- | --- |
| BR-23 | Nomor SPT berasal dari surat fisik dan diketik manusia. Sistem hanya menyodorkan kerangka nomor dan tidak pernah membangkitkan nomor agenda sendiri. Nomor bersifat unik se-sistem | 6.2 |
| BR-24 | Satu orang hanya memegang satu Sesi Tugas aktif pada satu waktu, lintas seluruh SPT. Keterlibatan pada beberapa SPT sekaligus tetap diizinkan | 6.2, 6.4 |
| BR-25 | SPT tidak dapat berpindah ke status selesai sebelum berkas pindaian surat perintah dilampirkan | 6.2 |
| BR-26 | Status bermasalah hanya dapat ditetapkan manusia, disertai jenis masalah dan uraian wajib. Sistem tidak pernah menetapkannya sendiri, termasuk saat batas waktu terlampaui | 6.2, 6.5 |
| BR-27 | Pencabutan Panit Penanggung Jawab maupun pelaksana dari sebuah SPT tidak menghapus laporan, foto, maupun rute yang sudah terekam, dan tidak menghapus baris penghubungnya | 6.2, 6.3, 6.4 |
| BR-28 | Tidak seorang pun dapat memberi catatan peninjau pada laporan yang ia kirim sendiri, berapa pun perannya | 6.2, 6.3 |
| BR-29 | SPT hanya dapat dihapus permanen bila belum pernah memiliki laporan, foto, rute, maupun Sesi Tugas. Selain keadaan itu, satu-satunya jalan adalah pembatalan disertai alasan | 6.2 |
| BR-30 | Sepanjang hidupnya, setiap SPT yang sudah terbit wajib memiliki sekurang-kurangnya satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab aktif, dan satu pelaksana berperan Anggota | 6.2 |
| BR-31 | Kanit dan Panit dapat menjadi pelaksana bila dicantumkan pada SPT, dan memperoleh kemampuan membuka Sesi Tugas serta mengirim laporan harian pada SPT tersebut saja. Kewenangan menyusun LHP Ringkas tetap hanya pada Anggota | 6.2, 6.3, 6.4, 6.8 |

> **Catatan penomoran.** BR-23 sampai BR-31 melanjutkan penomoran dari BR-22 sesuai aturan penambahan pada Section 7. Tidak ada kode lama yang dipakai ulang.

---
---

# Bagian 6 — Tambahan Section 8.8 Penugasan

Daftar kondisi tepi lintas modul yang lahir dari Modul 6.2. Penanganan rincinya ada pada 6.2.6.

- Nomor SPT bentrok dengan SPT di luar lingkup data pengguna
- Kanit dipindah unit setelah menerbitkan SPT
- Panit Penanggung Jawab terakhir dinonaktifkan akunnya
- SPT dibuka kembali setelah LHP-nya diekspor
- Titik lokasi disunting setelah dirujuk laporan
- Draf ditinggalkan berbulan-bulan tanpa diterbitkan
- Penghapusan permanen berbenturan dengan pembukaan Sesi Tugas pada saat hampir bersamaan

---
---

# Bagian 7 — Tambahan Section 9.2 Aturan Akses per Tabel

**[FINAL] untuk tabel yang menjadi urusan Modul 6.2**

| Tabel | Baca | Tulis |
| --- | --- | --- |
| penugasan | Kasubdit dan Akun Pemeliharaan membaca seluruh baris kecuali draf milik orang lain. Kanit membaca baris di unitnya termasuk drafnya sendiri. Panit membaca baris yang ada penunjukannya pada penugasan_panit, tanpa memandang dicabut_pada. Pelaksana membaca baris yang ada pencantumannya pada penugasan_pelaksana, tanpa memandang dicabut_pada | Hanya Kanit, terbatas unitnya sendiri. Kasubdit hanya boleh mengubah kolom status pada perkara pembukaan kembali |
| penugasan_dasar | Mengikuti hak baca atas baris penugasan induknya | Hanya Kanit pemilik unit, dan hanya selama status bukan selesai maupun dibatalkan |
| penugasan_lokasi | Mengikuti hak baca atas baris penugasan induknya | Sama seperti penugasan_dasar |
| penugasan_pelaksana | Mengikuti hak baca atas baris penugasan induknya. Setiap orang selalu membaca baris miliknya sendiri | Hanya Kanit pemilik unit, kecuali kolom dibaca_pada yang ditulis pemiliknya sendiri |
| sesi_tugas | Ditetapkan pada Modul 6.4 | Ditetapkan pada Modul 6.4 |

> **Dua hal yang wajib diperhatikan saat implementasi**
>
> Pertama, klausa baca untuk Panit dan pelaksana **mengabaikan** `dicabut_pada`, sedangkan klausa tulis **memeriksanya**. Menyamakan keduanya adalah kesalahan yang paling mungkin terjadi di modul ini, dan akibatnya persis melanggar BR-21: Panit kehilangan riwayat yang seharusnya terbaca selamanya.
>
> Kedua, draf tidak boleh bocor. Klausa baca untuk Kasubdit harus menyertakan pengecualian `status <> 'draf' OR diterbitkan_oleh = uid`. Tanpa itu, catatan yang belum jadi terbaca oleh atasan sebelum pemiliknya selesai berpikir.
>
> Indeks yang wajib dibuat sejak awal: `penugasan(unit_id, status)`, `penugasan_pelaksana(pelaksana_id)`, `penugasan_lokasi(penugasan_id, urutan)`, dan indeks unik parsial pada `sesi_tugas(pengguna_id) WHERE ditutup_pada IS NULL`.

## Tambahan jenis tindakan pada Section 9.6

`terbit_spt`, `sunting_spt`, `tutup_spt`, `batal_spt`, `hapus_spt`, `buka_kembali_spt`, `tandai_bermasalah`, `kembalikan_dari_bermasalah`, `perpanjang_batas`, `tambah_pelaksana`, `cabut_pelaksana`, `tunjuk_panit`, `cabut_panit`, `unggah_surat_spt`.

Penyuntingan draf tidak dicatat.

---
---

# Bagian 8 — Perubahan Lampiran A dan B

## Lampiran A — daftar diperbarui

| Kode | Butir | Status |
| --- | --- | --- |
| A-02 | Penyimpanan data sensitif pada layanan awan | **Belum terjawab, prioritas naik.** Contoh dokumen perkara yang diterima memuat identitas pelapor, terlapor, NIK, dan nomor paspor. Isi sekelas itulah yang akan tersimpan di Supabase Cloud |
| A-03 | Angka target metrik keberhasilan | Belum terjawab |
| A-04 | Berkas kop dan lambang institusi | Belum terjawab |
| A-05 | Daftar alasan lokasi tidak terekam | Belum terjawab |
| A-06 | Daftar resmi unit di bawah Subdit IV | Belum terjawab |
| A-07 | Kesediaan Kasubdit memakai sistem | Belum terjawab |
| A-08 | Pencatatan tertulis Akun Pemeliharaan | Belum terjawab |
| ~~A-09~~ | ~~Panit dan daftar SPT se-unit~~ | **Terjawab.** Menu Penugasan disembunyikan hanya bagi Panit yang belum pernah ditunjuk sama sekali. Dipindahkan ke Lampiran B butir B.9 |
| ~~A-10~~ | ~~Format nomor SPT~~ | **Terjawab.** Pola terbaca dari contoh surat yang diterima. Dipindahkan ke Lampiran B butir B.9 |
| **A-11** | **Daftar resmi jenis masalah** | **Baru.** Untuk pilihan saat menandai SPT bermasalah. Daftar sementara yang dipakai: alamat atau sasaran fiktif, objek tidak ditemukan di lokasi, informasi awal tidak sesuai kenyataan, situasi tidak memungkinkan karena alasan keamanan, sasaran berpindah tempat, kendala perangkat atau jaringan, lainnya |
| **A-12** | **Kode klasifikasi surat tiap unit** | **Baru.** Nilai sebenarnya untuk kolom kode_klasifikasi pada tabel unit. Contoh yang diterima memakai RES.5.3 untuk SPT penyelidikan; perlu dipastikan nilainya untuk tiap unit dan untuk jenis kegiatan selain penyelidikan |
| **A-13** | **Kelengkapan daftar jenis kegiatan** | **Baru.** Saat ini tiga nilai: penyelidikan, pulbaket, pengamanan. Perlu dipastikan tidak ada jenis lain yang lazim dipakai, karena jenis kegiatan menentukan awalan nomor SPT |
| **A-14** | **Kesediaan Kanit tercantum sebagai pelaksana** | **Baru.** Matriks 2.3 diubah agar Kanit dapat membuka Sesi Tugas dan posisinya ikut terlacak. Perlu dipastikan pemilik produk memang menghendaki posisinya sendiri direkam saat bertugas |

## Lampiran B — butir tambahan

### B.9 Penugasan — bagian baru

- Nomor SPT diketik manusia mengikuti surat fisik, unik se-sistem, dengan kerangka yang disodorkan sistem
- Nomor agenda berasal dari buku agenda Bagian Administrasi dan tidak pernah dibangkitkan SiPANTAU
- Status SPT memiliki enam nilai: Draf, Baru, Berjalan, Bermasalah, Selesai, Dibatalkan
- Perpindahan Baru menjadi Berjalan dipicu masuknya laporan pertama, bukan pembukaan Sesi Tugas
- Lewatnya batas waktu hanya menerbitkan penanda dan pemberitahuan, tidak mengubah status
- Bermasalah hanya ditetapkan manusia disertai jenis masalah dan uraian wajib
- Satu SPT wajib memiliki minimal satu Panit Penanggung Jawab, satu pelaksana berperan Anggota, satu dasar penugasan, dan satu titik lokasi berkoordinat
- Kanit dan Panit dapat dicantumkan sebagai pelaksana; penyusunan LHP Ringkas tetap hanya oleh Anggota
- Dasar penugasan bersifat jamak dengan jenis yang berbeda-beda
- Titik lokasi bersifat jamak dan berurutan; laporan menandai berada di titik yang mana
- Radius bawaan tiap titik berkoordinat adalah 300 meter, dapat diubah antara 100 dan 2000 meter
- Penutupan SPT hanya oleh Kanit, kapan saja, dengan peringatan berisi daftar yang belum beres
- SPT tidak dapat ditutup sebelum berkas surat perintah dilampirkan
- Perpanjangan batas waktu diubah langsung Kanit, alasan wajib, tanpa batas jumlah
- Pembukaan kembali SPT selesai dapat dilakukan Kanit unit pemilik dan Kasubdit; SPT dibatalkan tidak dapat dibuka kembali
- Penghapusan permanen hanya bila belum ada jejak kegiatan sama sekali
- Daftar Penugasan memuat yang aktif saja; submenu Riwayat memuat yang selesai dan dibatalkan dengan penyaring bawaan enam bulan
- Tanda terima tercatat otomatis saat pelaksana membuka rincian SPT
- Menu Penugasan disembunyikan bagi Panit yang belum pernah ditunjuk sama sekali
- Prototype menyesuaikan PRD bila keduanya bertentangan

---

## Yang perlu Anda kerjakan setelah menempel berkas ini

1. Naikkan versi PRD menjadi 0.4 pada Kendali Dokumen dan Riwayat Revisi
2. Ubah penanda status Modul 6.2 dari [KERANGKA] menjadi [FINAL]
3. Ganti nama tabel `penugasan_anggota` menjadi `penugasan_pelaksana` di seluruh dokumen, termasuk Section 5.8 dan Section 9.2 versi 0.2
4. Perbarui Checklist Progres: centang Tahap 2 baris 6.2, coret A-09 dan A-10 pada Tahap 1, tambahkan A-11 sampai A-14
5. Kejar ke pemilik produk: A-02 (naik prioritas), A-11, A-12, A-13, A-14
6. Perbarui prototype: hilangkan tombol Terbitkan Penugasan pada peran Panit, ubah judul dan lingkupnya

---
---

# Bagian 9 — Bukan untuk ditempel: celah untuk Addendum 6.2-T

Pemeriksaan yang sama seperti pada Modul 6.1 sudah dijalankan atas seluruh isi berkas ini. Delapan titik menyatakan hasil akhir tanpa menyebutkan jalur teknis yang menghasilkannya. Sesuai Section 0.1, tidak satu pun boleh diisi perkiraan oleh AI Agent. Kedelapannya didaftar di sini dan akan ditutup pada Addendum 6.2-T.

| No | Celah | Kriteria terdampak |
| --- | --- | --- |
| 1 | Bagaimana aturan satu Sesi Tugas aktif per orang ditegakkan sehingga tidak bisa ditembus dua permintaan yang tiba bersamaan | BR-24 |
| 2 | Lewat jalur apa status berpindah dari baru ke berjalan, mengingat pemicunya adalah penyisipan baris pada tabel milik Modul 6.3 | KP-6.2-30 |
| 3 | Bagaimana tanda terima tercatat, mengingat membuka halaman adalah operasi baca sedangkan yang diinginkan adalah tulis | KP-6.2-28 |
| 4 | Bagaimana larangan menutup SPT tanpa berkas surat ditegakkan di tingkat basis data, bukan hanya di antarmuka | BR-25, KP-6.2-45 |
| 5 | Bagaimana empat syarat minimum bertahan sepanjang hidup SPT, mengingat pelanggarannya terjadi lewat penghapusan baris di tabel lain | BR-30, KP-6.2-25, KP-6.2-26 |
| 6 | Bagaimana pemberitahuan batas waktu mendekat terpicu, mengingat arsitektur pada Section 4 belum memiliki penjadwal sama sekali | KP-6.2-36 |
| 7 | Bagaimana penanda Lewat Batas dihitung: kolom turunan yang disimpan, atau perhitungan saat kueri | KP-6.2-36 |
| 8 | Bagaimana syarat penghapusan permanen diperiksa lintas lima tabel dalam satu tindakan yang tidak bisa disisipi | BR-29, KP-6.2-48 |

Celah nomor 6 adalah yang paling besar akibatnya. Ia bukan hanya urusan Modul 6.2 — pemberitahuan berjadwal juga dibutuhkan Modul 6.4 dan 6.9. Selama belum ada penjadwal, seluruh pemberitahuan yang tidak dipicu tindakan manusia tidak akan pernah terkirim, dan itu tidak akan terlihat sebagai galat di mana pun.


---
---

# BAGIAN E — ADDENDUM 6.2-T SPESIFIKASI TEKNIS

# SiPANTAU — Addendum 6.2-T

**Spesifikasi Teknis Implementasi Modul 6.2**

Tanggal: 1 Agustus 2026 · Pelengkap berkas Revisi Modul 6.2 · Status: [FINAL]

---

## Mengapa addendum ini ada

Berkas Revisi Modul 6.2 menetapkan perilaku modul secara lengkap menurut kerangka Section 6.0, lalu mendaftar sendiri delapan titik yang menyatakan hasil akhir tanpa menyebutkan jalur teknis yang menghasilkannya. Menurut Section 0.1, bagian yang belum cukup jelas untuk diimplementasikan tidak boleh diisi perkiraan oleh AI Agent. Kedelapan titik itu ditutup di sini, ditambah satu perkara yang tidak terdaftar pada berkas tersebut tetapi wajib dibereskan lebih dulu: bentrokan penomoran Business Rules.

| Celah | Kriteria terdampak | Ditutup pada |
| --- | --- | --- |
| Bentrokan penomoran BR-23 sampai BR-25 | Seluruh rujukan silang | Bagian 0 |
| Penjadwal belum ada dalam arsitektur | KP-6.2-36, dan seluruh pemberitahuan berjadwal | Bagian 1 |
| Penegakan satu Sesi Tugas aktif per orang | BR-27 | Bagian 2 |
| Perpindahan status baru menjadi berjalan | KP-6.2-30 | Bagian 3 |
| Pencatatan tanda terima saat rincian dibuka | KP-6.2-28 | Bagian 4 |
| Larangan menutup SPT tanpa berkas surat | BR-28, KP-6.2-45 | Bagian 5 |
| Empat syarat minimum bertahan seumur SPT | BR-33, KP-6.2-04, KP-6.2-25, KP-6.2-26 | Bagian 6 |
| Cara menghitung penanda Lewat Batas | KP-6.2-36 | Bagian 7 |
| Pemeriksaan penghapusan permanen lintas tabel | BR-32, KP-6.2-48 | Bagian 8 |

Addendum ini ditempel sebagai **Section 6.2.8** pada PRD, ditambah perubahan pada section lain yang didaftar di Bagian 10.

> **Satu peringatan yang bukan berasal dari daftar celah.** Pemeriksaan atas layanan penjadwal menemukan satu perilaku yang berpotensi mematikan seluruh pemberitahuan berjadwal tanpa jejak galat apa pun. Perinciannya ada di 1.6 dan wajib dibaca sebelum sesi coding dimulai.

---
---

# Bagian 0 — Koreksi penomoran Business Rules

## 0.1 Duduk perkaranya

Addendum 6.1-T menambahkan BR-23, BR-24, dan BR-25. Berkas Revisi Modul 6.2 juga menambahkan BR-23 sampai BR-31. Tiga kode karena itu menunjuk dua aturan yang berlainan sekaligus.

Ini bukan perkara kerapian. Section 0.3 menetapkan Business Rules Global sebagai pemenang tertinggi saat terjadi konflik, dan seluruh modul merujuknya lewat kode. Kode yang bercabang dua membuat rujukan menjadi mustahil dinilai benar atau salah.

## 0.2 Ketetapan

**Addendum 6.1-T mempertahankan BR-23 sampai BR-25**, karena ia lebih dahulu ada dan menyentuh fondasi autentikasi yang sudah dirujuk banyak tempat. **Seluruh aturan Modul 6.2 digeser tiga angka.**

| Kode lama pada berkas Modul 6.2 | Kode baru | Pokok aturan |
| --- | --- | --- |
| BR-23 | **BR-26** | Nomor SPT diketik manusia, sistem tidak membangkitkan nomor agenda |
| BR-24 | **BR-27** | Satu Sesi Tugas aktif per orang, lintas seluruh SPT |
| BR-25 | **BR-28** | SPT tidak dapat selesai sebelum berkas surat dilampirkan |
| BR-26 | **BR-29** | Status bermasalah hanya ditetapkan manusia |
| BR-27 | **BR-30** | Pencabutan tidak menghapus laporan, foto, rute, maupun baris penghubung |
| BR-28 | **BR-31** | Tidak seorang pun meninjau laporannya sendiri |
| BR-29 | **BR-32** | Penghapusan permanen hanya bila belum ada jejak kegiatan |
| BR-30 | **BR-33** | Empat syarat minimum bertahan seumur SPT |
| BR-31 | **BR-34** | Kanit dan Panit dapat menjadi pelaksana |

## 0.3 Rujukan di dalam berkas Modul 6.2 yang ikut berubah

Penggantian tidak boleh dilakukan dengan cari-ganti buta, karena sebagian rujukan menunjuk aturan milik Modul 6.1 yang **tidak** berubah. Daftar berikut sudah dipilah:

| Letak | Tertulis | Menjadi |
| --- | --- | --- |
| 5.17, catatan tabel sesi_tugas | BR-19 | **tetap BR-19** — milik Modul 6.1 |
| 5.3, catatan tabel penugasan_pelaksana | BR-27 | **BR-30** |
| 6.2.4 butir 4 | BR-30 | **BR-33** |
| 6.2.7, ketergantungan Modul 6.4 | BR-13 | **tetap BR-13** — milik versi 0.2 |
| Bagian 7, catatan aturan akses | BR-21 | **tetap BR-21** — milik Modul 6.1 |
| Bagian 9, daftar celah | BR-24, BR-25, BR-29, BR-30 | **BR-27, BR-28, BR-32, BR-33** |

Seluruh rujukan pada addendum ini sudah memakai penomoran baru.

## 0.4 Aturan pencegah agar tidak terulang

Ditambahkan pada Section 7 sebagai catatan penomoran:

> Sebelum menambahkan aturan baru, periksa lebih dahulu kode tertinggi yang sudah dipakai **pada seluruh berkas revisi dan addendum yang berlaku**, bukan hanya pada dokumen induk. Modul yang digali bersamaan berpotensi memakai kode yang sama tanpa saling mengetahui.

---
---

# Bagian 1 — Penjadwal

## 1.1 Mengapa ini yang paling besar akibatnya

Berkas Modul 6.2 menyebut celah ini sebagai yang paling besar akibatnya, dan penilaian itu tepat. Alasannya bukan karena pemberitahuan batas waktu penting, melainkan karena **ketiadaannya tidak menimbulkan galat**.

Bila sebuah tombol rusak, pengguna melapor pada hari itu juga. Bila pemberitahuan berjadwal tidak pernah terkirim, tidak ada yang menyadarinya. Kanit hanya merasa sistemnya sepi. Tidak ada layar merah, tidak ada catatan galat, tidak ada apa pun yang dapat ditelusuri. Kegagalan jenis ini yang paling lama hidup di dalam sistem.

Kebutuhan penjadwal juga tidak berhenti di Modul 6.2. Modul 6.4 membutuhkannya untuk mendeteksi Sesi Tugas yang menggantung, dan Modul 6.9 membutuhkannya untuk seluruh pemberitahuan yang tidak dipicu tindakan manusia. Keputusan diambil sekali di sini agar tidak diambil ulang tiga kali dengan hasil berbeda.

## 1.2 Ketetapan

Penjadwalan memakai **pg_cron**, modul penjadwal yang berjalan di dalam basis data terkelola yang sama. <cite index="7-1">Supabase Cron adalah modul Postgres yang memakai ekstensi pg_cron, dan pekerjaannya dapat dibuat lewat SQL maupun antarmuka Dashboard, dengan rentang jadwal dari tiap detik sampai tahunan</cite>. <cite index="5-1">Per 2026 setiap project Supabase membawa pg_cron pada paket gratis, pro, maupun team</cite>, sehingga tidak ada halangan biaya.

Pilihan ini tidak melanggar Section 4.5. pg_cron bukan server aplikasi terpisah, melainkan ekstensi yang hidup di dalam basis data yang sudah dipakai. Ia tidak perlu disebarkan, tidak perlu diurus, dan tidak menambah tempat baru yang harus dijaga.

### Amandemen Section 4.5

Butir pertama Section 4.5 sudah diamandemen Addendum 6.1-T untuk memberi tempat bagi Fungsi Tepi. Kini ditambahkan satu kalimat:

> Pengecualian kedua adalah **Penjadwal Basis Data**, yaitu ekstensi penjadwal yang berjalan di dalam basis data terkelola yang sama. Penjadwal Basis Data dipakai untuk pekerjaan berulang yang tidak dipicu tindakan manusia. Ia bukan server aplikasi dan tidak disebarkan secara terpisah.

<cite index="7-1">Batas yang dianjurkan: tidak lebih dari delapan pekerjaan berjalan bersamaan, dan tiap pekerjaan tidak lebih dari sepuluh menit.</cite> SiPANTAU jauh di bawah batas itu.

## 1.3 Pemasangan

```sql
create extension if not exists pg_cron;
```

Tidak diperlukan `pg_net` untuk keperluan SiPANTAU. Seluruh pekerjaan berjadwal pada sistem ini berupa perintah SQL yang bekerja di dalam basis data, bukan panggilan ke alamat luar. Menambahkan pemanggilan HTTP hanya akan menambah titik yang dapat gagal tanpa memberi manfaat.

## 1.4 Tabel notifikasi

**[KERANGKA]** — bentuk akhirnya ditetapkan pada Modul 6.9. Dibentuk di sini karena Modul 6.2 sudah membutuhkannya, mengikuti pola yang sama seperti tabel `sesi_tugas` yang dibentuk pada Modul 6.2 untuk kebutuhan Modul 6.4.

```sql
create table if not exists public.notifikasi (
  id            uuid primary key default gen_random_uuid(),
  penerima_id   uuid not null references public.users(id),
  jenis         text not null,
  penugasan_id  uuid references public.penugasan(id) on delete cascade,
  judul         text not null,
  isi           text,
  dibaca_pada   timestamptz,
  dibuat_pada   timestamptz not null default now()
);

create index if not exists idx_notifikasi_penerima_belum_dibaca
  on public.notifikasi (penerima_id, dibuat_pada desc)
  where dibaca_pada is null;
```

Daftar nilai `jenis` ditetapkan pada Modul 6.9. Yang dipakai addendum ini: `spt_lewat_batas`.

## 1.5 Pekerjaan berjadwal

### Kolom penanda agar pemberitahuan tidak berulang

Sebuah pekerjaan harian yang menyisir SPT lewat batas akan mengirim pemberitahuan yang sama setiap hari bila tidak ditahan. Penahannya satu kolom:

```sql
alter table public.penugasan
  add column if not exists lewat_batas_diberitahukan_pada timestamptz;
```

Kolom ini juga dikosongkan kembali setiap kali batas waktu diperpanjang, sehingga perpanjangan yang kembali terlampaui tetap memberi tahu.

### Pekerjaan 1 — pemberitahuan SPT lewat batas

```sql
create or replace function public.kerja_periksa_lewat_batas()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  n_kirim int := 0;
begin
  with sasaran as (
    select p.id, p.nomor_spt, p.judul, p.tanggal_batas, p.diterbitkan_oleh
      from public.penugasan p
     where p.tanggal_batas < current_date
       and p.status in ('baru', 'berjalan', 'bermasalah')
       and p.lewat_batas_diberitahukan_pada is null
  ),
  terkirim as (
    insert into public.notifikasi (penerima_id, jenis, penugasan_id, judul, isi)
    select s.diterbitkan_oleh,
           'spt_lewat_batas',
           s.id,
           'Batas waktu penugasan terlampaui',
           s.nomor_spt || ' — ' || s.judul ||
           '. Batas waktu ' || to_char(s.tanggal_batas, 'DD Mon YYYY') ||
           ' sudah terlampaui dan status belum Selesai.'
      from sasaran s
    returning penugasan_id
  )
  update public.penugasan
     set lewat_batas_diberitahukan_pada = now()
   where id in (select penugasan_id from terkirim);

  get diagnostics n_kirim = row_count;
  raise notice 'kerja_periksa_lewat_batas: % pemberitahuan', n_kirim;
end;
$$;

select cron.schedule(
  'periksa-lewat-batas',
  '5 0 * * *',                        -- 00:05 UTC, sekitar 07:05 WIB
  $$ select public.kerja_periksa_lewat_batas() $$
);
```

Tiga hal yang disengaja pada fungsi di atas:

Pertama, seluruhnya berjalan dalam **satu pernyataan** memakai `with`. Penyisipan pemberitahuan dan penandaan kolom terjadi bersamaan, sehingga tidak mungkin ada keadaan pemberitahuan terkirim tetapi penandanya gagal, atau sebaliknya.

Kedua, statusnya dibatasi pada tiga nilai. SPT berstatus `draf` tidak pernah diberitahukan karena belum menjadi dokumen. SPT `selesai` dan `dibatalkan` sudah tidak relevan.

Ketiga, penerimanya adalah `diterbitkan_oleh`, bukan seluruh tim. KP-6.2-36 menyebut Kanit sebagai penerima. Bila kelak pemilik produk menghendaki Panit Penanggung Jawab ikut menerima, penambahannya satu blok `insert` lagi pada fungsi yang sama.

### Pengosongan penanda saat batas diperpanjang

```sql
create or replace function public.trg_reset_penanda_lewat_batas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.tanggal_batas is distinct from old.tanggal_batas then
    new.lewat_batas_diberitahukan_pada := null;
  end if;
  return new;
end;
$$;

create trigger reset_penanda_lewat_batas
  before update on public.penugasan
  for each row
  execute function public.trg_reset_penanda_lewat_batas();
```

### Pekerjaan 2 — penjaga keaktifan project

Alasannya ada di 1.6. Pekerjaan ini tidak menghasilkan apa pun selain satu pembacaan ringan, dan itulah gunanya.

```sql
create or replace function public.kerja_jaga_keaktifan()
returns void
language sql
security definer
set search_path = ''
as $$
  select count(*) from public.users where aktif = true;
$$;

select cron.schedule(
  'jaga-keaktifan',
  '0 */6 * * *',                      -- tiap enam jam
  $$ select public.kerja_jaga_keaktifan() $$
);
```

### Pekerjaan yang akan ditambahkan modul lain

| Pekerjaan | Modul | Keterangan |
| --- | --- | --- |
| Deteksi Sesi Tugas menggantung | 6.4 | Sesi yang tidak ditutup melewati ambang waktu tertentu |
| Penyusutan `location_logs` | 6.4 | Section 5.9 menetapkan perlunya, ambangnya ditetapkan di 6.4 |
| Pemberitahuan berkala lain | 6.9 | Ditetapkan saat modul digali |

## 1.6 Peringatan: pekerjaan berjadwal dapat berhenti tanpa jejak

Ini temuan yang wajib diketahui sebelum sesi coding dimulai, dan bukan berasal dari daftar celah berkas Modul 6.2.

<cite index="5-1">pg_cron hanya menyala selama basis data sehat, sehingga gangguan layanan, project paket gratis yang dijeda, atau tercapainya batas sambungan akan menjeda seluruh jadwal tanpa peringatan apa pun — riwayat jalannya sekadar berlubang.</cite>

Yang paling mungkin menimpa SiPANTAU adalah penjedaan project. <cite index="10-1">Pada paket gratis, project yang tidak aktif lebih dari tujuh hari akan dijeda.</cite> Selama masa libur panjang atau jeda antar-perkara, project berpotensi tertidur, dan begitu tertidur seluruh pemberitahuan berhenti. Ketika kegiatan kembali berjalan, tidak ada yang memberi tahu bahwa ada sepekan pemberitahuan yang hilang.

Tiga penanganan, dan ketiganya dipakai bersama:

**Pertama, Pekerjaan 2 pada 1.5.** Satu pembacaan tiap enam jam sudah cukup membuat project terhitung aktif. Ini penangkal yang paling murah dan langsung menghilangkan sebab yang paling mungkin terjadi.

**Kedua, penanda kesehatan yang terlihat manusia.** Dashboard Kasubdit menampilkan waktu keberhasilan terakhir tiap pekerjaan berjadwal, dibaca dari `cron.job_run_details`. Bila angkanya lebih tua dari yang wajar, itu terlihat sebagai keterangan, bukan sebagai galat. Ini menerapkan Prinsip 0.6 pada kesehatan sistem: yang disajikan adalah fakta, penilaiannya pada manusia.

```sql
create or replace view public.kesehatan_penjadwal
with (security_invoker = on)
as
select j.jobname                                as nama_pekerjaan,
       j.schedule                               as jadwal,
       max(d.end_time) filter (where d.status = 'succeeded')
                                                as berhasil_terakhir,
       count(*) filter (where d.status = 'failed'
                          and d.start_time > now() - interval '7 days')
                                                as gagal_sepekan
  from cron.job j
  left join cron.job_run_details d on d.jobid = j.jobid
 group by j.jobname, j.schedule;
```

**Ketiga, pengakuan terus terang pada dokumen.** Ketiadaan pemberitahuan tidak boleh dianggap sama dengan ketiadaan kejadian. Penanda Lewat Batas pada Bagian 7 sengaja dihitung saat kueri, bukan bersandar pada pekerjaan berjadwal, justru agar penanda tetap benar meski pemberitahuannya tidak terkirim.

> **Butir uji U-6.2-09.** Jedakan pekerjaan berjadwal dengan `select cron.unschedule('periksa-lewat-batas')`, lampaui batas waktu sebuah SPT, lalu buka daftar penugasan. Penanda Lewat Batas wajib tetap muncul. Bila ia ikut hilang, berarti ada ketergantungan yang tidak seharusnya ada.

---
---

# Bagian 2 — Satu Sesi Tugas aktif per orang

## 2.1 Duduk perkaranya

BR-27 menetapkan satu orang hanya memegang satu Sesi Tugas aktif pada satu waktu, lintas seluruh SPT. Memeriksanya di aplikasi tidak cukup: dua permintaan yang tiba pada saat hampir bersamaan sama-sama membaca "belum ada sesi aktif", lalu sama-sama menyisipkan baris. Keduanya lolos, aturan bocor, dan bocornya tidak akan pernah terlihat sampai ada dua rute berjalan bersamaan untuk orang yang sama.

## 2.2 Penegakan

Berkas Modul 6.2 sudah menyebut indeks unik parsial pada bagian aturan akses. Di sini bentuk dan akibatnya ditetapkan.

```sql
create unique index if not exists uq_sesi_tugas_satu_aktif_per_orang
  on public.sesi_tugas (pengguna_id)
  where ditutup_pada is null;
```

Indeks unik parsial ditegakkan basis data pada tingkat penyisipan baris. Dua permintaan bersamaan tidak mungkin sama-sama lolos: yang kedua ditolak dengan galat pelanggaran keunikan, kode `23505`. Tidak ada jendela waktu sekecil apa pun di antara pemeriksaan dan penyisipan, karena keduanya adalah satu tindakan yang sama.

## 2.3 Penanganan di aplikasi

Galat keunikan bukan galat teknis bagi pengguna, melainkan keterangan keadaan. Ia wajib diterjemahkan.

```javascript
const { error } = await supabase.from('sesi_tugas').insert({
  penugasan_id: penugasanId,
  pengguna_id: userId,
  dibuka_pada: new Date().toISOString()
})

if (error?.code === '23505') {
  // Cari tahu sesi mana yang sedang terbuka, lalu sebutkan.
  const { data: sesi } = await supabase
    .from('sesi_tugas')
    .select('penugasan_id, dibuka_pada, penugasan(nomor_spt, judul)')
    .is('ditutup_pada', null)
    .single()

  tampilkanKeterangan(
    `Anda masih dalam Sesi Tugas untuk ${sesi.penugasan.nomor_spt}. ` +
    `Tutup sesi itu lebih dahulu sebelum membuka yang baru.`
  )
  return
}
```

Menyebutkan SPT mana yang sedang terbuka adalah bagian yang menentukan. Tanpa itu, pengguna di lapangan hanya tahu ia ditolak, tidak tahu apa yang harus dilakukan.

## 2.4 Perbedaan dengan keterlibatan pada beberapa SPT

BR-27 membatasi **sesi**, bukan **keterlibatan**. Seorang Anggota tetap boleh dicantumkan sebagai pelaksana pada lima SPT sekaligus. Yang dibatasi adalah berapa yang sedang ia kerjakan pada satu saat. Indeks di atas menegakkan tepat itu dan tidak menyentuh tabel `penugasan_pelaksana` sama sekali.

---
---

# Bagian 3 — Perpindahan status baru menjadi berjalan

## 3.1 Duduk perkaranya

KP-6.2-30 menetapkan status berpindah dari `baru` ke `berjalan` begitu laporan harian pertama masuk, tanpa campur tangan siapa pun. Pemicunya berada di tabel milik Modul 6.3, sedangkan yang berubah adalah tabel milik Modul 6.2.

Menyerahkannya kepada aplikasi salah karena dua sebab. Pertama, aplikasi dapat gagal di antara dua panggilan, meninggalkan laporan yang masuk pada SPT yang masih berstatus `baru`. Kedua, pengirim laporan adalah Anggota, dan Anggota tidak memiliki hak tulis atas tabel `penugasan` — memberinya hak itu demi satu kolom akan membuka pintu yang jauh lebih lebar daripada yang dibutuhkan.

## 3.2 Penegakan

```sql
create or replace function public.trg_laporan_pertama_menjalankan_spt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.penugasan
     set status = 'berjalan'
   where id = new.penugasan_id
     and status = 'baru';
  return new;
end;
$$;

create trigger laporan_pertama_menjalankan_spt
  after insert on public.laporan_harian
  for each row
  execute function public.trg_laporan_pertama_menjalankan_spt();
```

Tiga sifat yang membuat pemicu ini aman:

**Bersyarat `status = 'baru'`.** Laporan kedua, ketiga, dan seterusnya tidak mengubah apa pun karena syaratnya tidak lagi terpenuhi. Pemicu ini idempoten dengan sendirinya, tanpa perlu penanda tambahan.

**Tidak menyentuh status lain.** SPT yang sedang `bermasalah` tidak dikembalikan ke `berjalan` oleh laporan yang masuk. KP-6.2-35 menetapkan pengembalian dari `bermasalah` sebagai tindakan Kanit disertai alasan, dan pemicu ini tidak boleh mendahuluinya.

**`security definer`.** Pemicu berjalan dengan hak pembuatnya, sehingga Anggota pengirim laporan tidak perlu memiliki hak tulis atas tabel `penugasan`. Tanpa ini, penyisipan laporan akan ditolak aturan akses baris `penugasan` dan gagal seluruhnya.

## 3.3 Yang sengaja tidak dilakukan

KP-6.2-31 menetapkan pembukaan Sesi Tugas **tidak** mengubah status. Karena itu tidak ada pemicu serupa pada tabel `sesi_tugas`. Ini disengaja: orang dapat membuka sesi lalu batal berangkat, sedangkan laporan yang masuk adalah bukti kegiatan benar-benar berlangsung.

---
---

# Bagian 4 — Pencatatan tanda terima

## 4.1 Duduk perkaranya

KP-6.2-28 menetapkan kolom `dibaca_pada` terisi saat pelaksana membuka rincian SPT untuk pertama kalinya, tanpa tindakan tambahan. Membuka halaman adalah operasi baca, sedangkan yang diinginkan adalah tulis. Basis data tidak dapat menulis karena dibaca; sesuatu harus memintanya.

## 4.2 Penegakan

Sebuah fungsi yang dipanggil aplikasi setelah rincian berhasil dimuat.

```sql
create or replace function public.catat_tanda_terima(p_penugasan_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.penugasan_pelaksana
     set dibaca_pada = now()
   where penugasan_id = p_penugasan_id
     and pelaksana_id = (select auth.uid())
     and dibaca_pada is null
     and dicabut_pada is null;
$$;

grant execute on function public.catat_tanda_terima(uuid) to authenticated;
```

Empat syarat pada klausa `where` masing-masing menutup satu kemungkinan:

| Syarat | Yang ditutupnya |
| --- | --- |
| `pelaksana_id = auth.uid()` | Tidak seorang pun dapat mencatatkan tanda terima atas nama orang lain, sekalipun ia mengirim identitas orang lain pada parameter |
| `dibaca_pada is null` | Pembukaan kedua dan seterusnya tidak menimpa waktu pembukaan pertama. Yang dicatat adalah kapan pertama kali dibuka |
| `dicabut_pada is null` | Pelaksana yang sudah dicabut tetap dapat membaca riwayatnya (BR-30), tetapi pembacaan itu bukan tanda terima |
| Tidak ada baris cocok | Kanit, Panit Penanggung Jawab, dan Kasubdit yang membuka rincian tidak mencatatkan apa pun. Fungsi berhasil tanpa mengubah apa pun, bukan gagal |

Baris terakhir itu disengaja. Fungsi dipanggil setiap kali rincian dibuka oleh siapa pun, dan bagi yang bukan pelaksana ia sekadar tidak berbuat apa-apa. Aplikasi tidak perlu memeriksa peran lebih dahulu.

## 4.3 Pemanggilan dari aplikasi

```javascript
// Dipanggil sekali setelah rincian SPT berhasil dimuat.
// Kegagalannya tidak boleh mengganggu tampilan.
async function catatTandaTerima(penugasanId) {
  const { error } = await supabase.rpc('catat_tanda_terima', {
    p_penugasan_id: penugasanId
  })
  if (error) console.warn('Tanda terima tidak tercatat:', error.message)
}
```

Kegagalannya sengaja tidak ditampilkan kepada pengguna. Pelaksana yang membuka SPT-nya di daerah bersinyal buruk tidak perlu diganggu pesan galat tentang catatan administratif; yang penting baginya adalah isi penugasan sudah terbaca. Bila panggilan gagal, tanda terima akan tercatat pada pembukaan berikutnya.

## 4.4 Mengapa bukan lewat hak tulis kolom

Postgres memungkinkan pemberian hak tulis pada satu kolom saja, dipadu kebijakan akses baris. Cara itu berjalan, tetapi menyebarkan aturan ke dua tempat sekaligus, dan membuat kolom `dibaca_pada` menjadi kolom yang dapat diisi nilai apa pun oleh pemiliknya, termasuk waktu yang bukan sekarang. Fungsi di atas menutup keduanya: waktunya selalu dari server, dan aturannya berada di satu tempat.

---
---

# Bagian 5 — Syarat penutupan dan pembatalan

## 5.1 Duduk perkaranya

BR-28 menetapkan SPT tidak dapat berpindah ke `selesai` sebelum berkas pindaian surat perintah dilampirkan. KP-6.2-47 menetapkan pembatalan wajib disertai alasan. Keduanya kini hanya dijaga antarmuka, dan antarmuka bukan pengaman.

## 5.2 Penegakan

Keduanya berupa syarat pada satu baris yang sama, sehingga tidak memerlukan pemicu. Batasan pemeriksaan sudah cukup, dan lebih baik daripada pemicu karena bersifat menyatakan, bukan menjalankan.

```sql
alter table public.penugasan
  add constraint chk_selesai_wajib_berkas
  check (
    status <> 'selesai'
    or (berkas_surat_path is not null and length(trim(berkas_surat_path)) > 0)
  );

alter table public.penugasan
  add constraint chk_batal_wajib_alasan
  check (
    status <> 'dibatalkan'
    or (alasan_pembatalan is not null and length(trim(alasan_pembatalan)) > 0)
  );

alter table public.penugasan
  add constraint chk_batas_tidak_mendahului_mulai
  check (tanggal_batas is null or tanggal_mulai is null or tanggal_batas >= tanggal_mulai);
```

Bentuk `status <> 'nilai' or syarat` adalah cara menuliskan "bila statusnya begini, maka syaratnya wajib". Ia membiarkan seluruh status lain lewat tanpa diperiksa, dan hanya menggigit pada status yang dimaksud.

Batasan ketiga menutup satu kondisi tepi yang sudah didaftar berkas Modul 6.2 tetapi belum punya penegakan: tanggal batas yang lebih awal daripada tanggal mulai.

## 5.3 Yang tidak dijaga batasan ini

KP-6.2-44 menetapkan penutupan **tetap diizinkan** meski masih ada Sesi Tugas terbuka, LHP yang belum masuk, atau pelaksana yang belum pernah melapor. Ketiganya adalah peringatan, bukan larangan. Batasan pemeriksaan sengaja tidak menyentuhnya, dan tidak boleh ditambahkan kelak dengan alasan kerapian. Menutup SPT yang belum rampung adalah keputusan Kanit, bukan urusan basis data.

## 5.4 Penanganan galat di aplikasi

Pelanggaran batasan pemeriksaan menghasilkan kode `23514` beserta nama batasannya. Nama itu diterjemahkan:

```javascript
const PESAN_BATASAN = {
  chk_selesai_wajib_berkas:
    'Lampirkan pindaian surat perintah tugas sebelum menutup penugasan.',
  chk_batal_wajib_alasan:
    'Alasan pembatalan wajib diisi.',
  chk_batas_tidak_mendahului_mulai:
    'Tanggal batas tidak boleh lebih awal daripada tanggal mulai.'
}

if (error?.code === '23514') {
  const nama = Object.keys(PESAN_BATASAN).find(k => error.message.includes(k))
  tampilkanKeterangan(PESAN_BATASAN[nama] ?? 'Data belum memenuhi syarat.')
}
```

---
---

# Bagian 6 — Empat syarat minimum bertahan seumur SPT

## 6.1 Duduk perkaranya

BR-33 menetapkan empat syarat wajib bertahan sepanjang hidup SPT: satu dasar penugasan, satu titik lokasi berkoordinat, satu Panit Penanggung Jawab aktif, dan satu pelaksana berperan Anggota. Ini yang paling sulit di antara delapan celah, karena tiga sebab sekaligus.

Pertama, syaratnya melintasi empat tabel, sehingga batasan pemeriksaan tidak dapat dipakai — ia hanya melihat satu baris.

Kedua, pelanggarannya terjadi lewat perubahan di tabel **lain**. Baris `penugasan` tidak disentuh sama sekali ketika seseorang mencabut pelaksana terakhir.

Ketiga, dua pencabutan yang tiba bersamaan masing-masing melihat masih ada dua yang tersisa, lalu keduanya lolos, dan yang tersisa menjadi nol. Menghitung saja tidak cukup.

## 6.2 Pemeriksaan saat penerbitan

Berlaku sekali, pada perpindahan `draf` ke `baru`.

```sql
create or replace function public.trg_periksa_syarat_terbit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kurang text[] := '{}';
  n int;
begin
  if not (new.status = 'baru' and old.status = 'draf') then
    return new;
  end if;

  if new.nomor_spt is null or length(trim(new.nomor_spt)) = 0 then
    kurang := kurang || 'nomor SPT';
  end if;

  select count(*) into n
    from public.penugasan_dasar where penugasan_id = new.id;
  if n = 0 then kurang := kurang || 'dasar penugasan'; end if;

  select count(*) into n
    from public.penugasan_lokasi
   where penugasan_id = new.id and lat is not null and lng is not null;
  if n = 0 then kurang := kurang || 'titik lokasi berkoordinat'; end if;

  select count(*) into n
    from public.penugasan_panit
   where penugasan_id = new.id and dicabut_pada is null;
  if n = 0 then kurang := kurang || 'Panit Penanggung Jawab'; end if;

  select count(*) into n
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.id
     and pp.dicabut_pada is null
     and u.peran = 'anggota';
  if n = 0 then kurang := kurang || 'pelaksana berperan Anggota'; end if;

  if array_length(kurang, 1) > 0 then
    raise exception 'SYARAT_TERBIT_KURANG: %', array_to_string(kurang, ', ');
  end if;

  return new;
end;
$$;

create trigger periksa_syarat_terbit
  before update on public.penugasan
  for each row
  execute function public.trg_periksa_syarat_terbit();
```

Pesan galatnya sengaja memuat **seluruh** syarat yang kurang, bukan yang pertama ditemukan. KP-6.2-04 menetapkan sistem menyebutkan syarat mana yang kurang, dan menyebutkannya satu per satu akan memaksa Kanit mencoba lima kali untuk mengetahui lima kekurangan.

## 6.3 Pemeriksaan saat pencabutan

Berlaku setiap kali `dicabut_pada` diisi. Di sinilah penguncian baris induk menjadi penting.

```sql
create or replace function public.trg_jaga_pelaksana_anggota_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (new.dicabut_pada is not null and old.dicabut_pada is null) then
    return new;
  end if;

  -- Penguncian baris induk. Inilah yang menyerialkan dua pencabutan
  -- yang tiba bersamaan: yang kedua menunggu sampai yang pertama selesai,
  -- lalu menghitung ulang dan melihat keadaan yang sudah berubah.
  select status into st
    from public.penugasan
   where id = new.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_pelaksana pp
    join public.users u on u.id = pp.pelaksana_id
   where pp.penugasan_id = new.penugasan_id
     and pp.dicabut_pada is null
     and pp.id <> new.id
     and u.peran = 'anggota';

  if sisa = 0 then
    raise exception 'PELAKSANA_ANGGOTA_TERAKHIR';
  end if;

  return new;
end;
$$;

create trigger jaga_pelaksana_anggota_terakhir
  before update on public.penugasan_pelaksana
  for each row
  execute function public.trg_jaga_pelaksana_anggota_terakhir();
```

Bentuk yang sama diterapkan pada `penugasan_panit` dengan nama `trg_jaga_panit_terakhir`, tanpa gabungan ke tabel `users` karena seluruh barisnya sudah pasti berperan Panit.

**Penguncian baris induk adalah bagian yang tidak boleh dihilangkan.** Tanpa `for update`, dua pencabutan bersamaan sama-sama menghitung satu yang tersisa, sama-sama lolos, dan SPT kehilangan seluruh pelaksananya. Dengan penguncian, yang kedua menunggu sampai yang pertama menuntaskan transaksinya, lalu menghitung ulang dan melihat kenyataan yang sudah berubah.

## 6.4 Pemeriksaan saat penghapusan dasar dan titik lokasi

```sql
create or replace function public.trg_jaga_dasar_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  select status into st
    from public.penugasan
   where id = old.penugasan_id
     for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return old;
  end if;

  select count(*) into sisa
    from public.penugasan_dasar
   where penugasan_id = old.penugasan_id
     and id <> old.id;

  if sisa = 0 then
    raise exception 'DASAR_PENUGASAN_TERAKHIR';
  end if;

  return old;
end;
$$;

create trigger jaga_dasar_terakhir
  before delete on public.penugasan_dasar
  for each row
  execute function public.trg_jaga_dasar_terakhir();
```

Untuk `penugasan_lokasi` diperlukan dua pemicu terpisah:

**Pemicu penghapusan** dengan bentuk sama seperti di atas, tetapi menghitung hanya titik berkoordinat, ditambah satu pemeriksaan lagi yang menegakkan KP-6.2-42: titik yang sudah dirujuk laporan tidak boleh dihapus.

```sql
select count(*) into n
  from public.laporan_harian where lokasi_id = old.id;
if n > 0 then
  raise exception 'TITIK_SUDAH_DIRUJUK_LAPORAN';
end if;
```

**Pemicu penyuntingan**, karena syaratnya dapat dilanggar tanpa menghapus apa pun. Mengosongkan koordinat titik berkoordinat terakhir melanggar BR-33 sama persis dengan menghapusnya:

```sql
create or replace function public.trg_jaga_lokasi_berkoordinat_terakhir()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  sisa int;
begin
  if not (old.lat is not null and new.lat is null) then
    return new;
  end if;

  select status into st
    from public.penugasan where id = new.penugasan_id for update;

  if st in ('draf', 'selesai', 'dibatalkan') then
    return new;
  end if;

  select count(*) into sisa
    from public.penugasan_lokasi
   where penugasan_id = new.penugasan_id
     and id <> new.id
     and lat is not null and lng is not null;

  if sisa = 0 then
    raise exception 'LOKASI_BERKOORDINAT_TERAKHIR';
  end if;

  return new;
end;
$$;
```

Pemicu terakhir ini adalah contoh mengapa daftar celah perlu diperiksa dua kali. Berkas Modul 6.2 menyebut celahnya sebagai "pelanggaran terjadi lewat penghapusan baris di tabel lain", padahal pengosongan kolom melanggarnya tanpa penghapusan sama sekali.

## 6.5 Ringkasan pemicu

| Pemicu | Tabel | Peristiwa | Menjaga |
| --- | --- | --- | --- |
| `periksa_syarat_terbit` | penugasan | sebelum update | Keempat syarat saat terbit |
| `jaga_pelaksana_anggota_terakhir` | penugasan_pelaksana | sebelum update | Minimal satu Anggota aktif |
| `jaga_panit_terakhir` | penugasan_panit | sebelum update | Minimal satu Panit aktif |
| `jaga_dasar_terakhir` | penugasan_dasar | sebelum delete | Minimal satu dasar |
| `jaga_lokasi_terakhir` | penugasan_lokasi | sebelum delete | Minimal satu titik berkoordinat, dan titik belum dirujuk laporan |
| `jaga_lokasi_berkoordinat_terakhir` | penugasan_lokasi | sebelum update | Koordinat titik terakhir tidak dikosongkan |

---
---

# Bagian 7 — Penanda Lewat Batas

## 7.1 Ketetapan

**Dihitung saat kueri, tidak disimpan.**

Kolom turunan yang disimpan akan menuntut sesuatu memperbaruinya setiap hari, dan sesuatu itu adalah pekerjaan berjadwal. Bagian 1.6 sudah menunjukkan pekerjaan berjadwal dapat berhenti tanpa jejak. Bila penanda ikut bersandar padanya, kegagalan penjadwal akan membuat penanda diam-diam salah, dan tidak ada yang menyadarinya.

Perhitungan saat kueri tidak dapat salah karena tidak bergantung pada apa pun selain tanggal hari ini.

## 7.2 Penegakan

Kolom berbangkit tidak dapat dipakai karena `current_date` tidak bersifat tetap, dan Postgres hanya menerima ungkapan tetap pada kolom berbangkit. Yang dipakai adalah tampilan.

```sql
create or replace view public.penugasan_tampil
with (security_invoker = on)
as
select p.*,
       (p.tanggal_batas is not null
        and p.tanggal_batas < current_date
        and p.status in ('baru', 'berjalan', 'bermasalah')) as lewat_batas,
       (current_date - p.tanggal_batas)                     as hari_terlampaui
  from public.penugasan p;
```

**`security_invoker = on` wajib ditulis.** Tanpa itu, tampilan berjalan dengan hak pembuatnya, dan seluruh aturan akses baris tabel `penugasan` terlewati — setiap pengguna akan membaca seluruh SPT lintas unit, termasuk draf milik orang lain. Ini kebocoran paling parah yang dapat terjadi pada modul ini, dan penyebabnya cuma satu baris yang lupa ditulis.

Aplikasi membaca `penugasan_tampil` untuk keperluan tampilan, dan tetap menulis ke `penugasan`.

## 7.3 Hubungan dengan pemberitahuan

Penanda dan pemberitahuan sengaja dipisah:

| | Sumber | Bila penjadwal berhenti |
| --- | --- | --- |
| Penanda Lewat Batas | Perhitungan saat kueri | Tetap benar |
| Pemberitahuan lewat batas | Pekerjaan berjadwal | Tidak terkirim |

Pemisahan ini yang membuat kegagalan penjadwal menjadi kehilangan kenyamanan, bukan kehilangan kebenaran. Kanit yang membuka daftar tetap melihat mana yang lewat batas; yang hilang hanya dorongan untuk membukanya.

---
---

# Bagian 8 — Penghapusan permanen

## 8.1 Duduk perkaranya

BR-32 mengizinkan penghapusan permanen hanya bila SPT belum pernah memiliki laporan, foto, rute, maupun Sesi Tugas. Pemeriksaannya melintasi beberapa tabel, dan di antara pemeriksaan terakhir dengan penghapusan terdapat jendela waktu ketika seorang pelaksana dapat membuka Sesi Tugas. Berkas Modul 6.2 sudah menyebut kondisi tepi ini pada 6.2.6.

## 8.2 Penegakan

Satu fungsi yang memeriksa, mencatat, dan menghapus dalam satu transaksi.

```sql
create or replace function public.hapus_penugasan_permanen(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
  n int;
begin
  -- Penguncian baris induk sampai transaksi selesai.
  select * into p
    from public.penugasan
   where id = p_id
     for update;

  if not found then
    raise exception 'PENUGASAN_TIDAK_DITEMUKAN';
  end if;

  -- Kewenangan diperiksa ulang di sini, tidak dipercayakan kepada pemanggil.
  if (select sipantau_auth.peran_saya()) <> 'kanit'
     or p.unit_id is distinct from (select sipantau_auth.unit_saya()) then
    raise exception 'TIDAK_BERWENANG';
  end if;

  select count(*) into n from public.sesi_tugas where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: Sesi Tugas'; end if;

  select count(*) into n from public.location_logs where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: rute'; end if;

  select count(*) into n from public.laporan_harian where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: laporan'; end if;

  select count(*) into n from public.foto_dokumentasi where penugasan_id = p_id;
  if n > 0 then raise exception 'ADA_JEJAK: foto'; end if;

  -- Jejak audit dicatat SEBELUM penghapusan, selagi datanya masih ada.
  insert into public.jejak_audit (pelaku_id, jenis, ringkasan, rincian)
  values (
    (select auth.uid()),
    'hapus_spt',
    coalesce(p.nomor_spt, '(tanpa nomor)') || ' — ' || coalesce(p.judul, '(tanpa judul)'),
    jsonb_build_object(
      'penugasan_id', p.id,
      'nomor_spt',    p.nomor_spt,
      'judul',        p.judul,
      'unit_id',      p.unit_id,
      'status',       p.status
    )
  );

  delete from public.penugasan where id = p_id;
end;
$$;

grant execute on function public.hapus_penugasan_permanen(uuid) to authenticated;
```

Empat hal yang menentukan pada fungsi di atas:

**Penguncian di awal.** `for update` menahan baris `penugasan` sampai transaksi selesai. Ini yang menutup jendela waktu, tetapi hanya bila pihak lain juga meminta kunci yang sama — lihat 8.3.

**Kewenangan diperiksa ulang.** Fungsi ber-`security definer` melewati aturan akses baris, sehingga ia wajib memeriksa sendiri. Ini mengikuti pola yang sama dengan Fungsi Tepi pada BR-24.

**Jejak audit sebelum penghapusan.** KP-6.2-49 menetapkan penghapusan tetap tercatat lengkap dengan nomor dan judulnya. Setelah baris terhapus, keduanya tidak dapat dibaca lagi.

**Urutan pemeriksaan dari yang paling mungkin.** Sesi Tugas diperiksa lebih dahulu karena itulah jejak yang paling awal muncul. Pesan galat menyebut jejak jenis apa yang ditemukan, sehingga Kanit tahu mengapa ditolak.

## 8.3 Syarat yang mengikat Modul 6.4

Penguncian pada 8.2 hanya bekerja bila pihak yang membuka Sesi Tugas ikut meminta kunci pada baris `penugasan` yang sama. Menyisipkan baris ke `sesi_tugas` tidak menyentuh baris `penugasan` sama sekali, sehingga tanpa syarat tambahan kedua tindakan berjalan tanpa saling melihat.

> **Mengikat untuk Modul 6.4.** Fungsi pembukaan Sesi Tugas wajib mengambil kunci baris induk sebelum menyisipkan:
>
> ```sql
> perform 1 from public.penugasan where id = p_penugasan_id for update;
> ```
>
> Tanpa baris itu, penghapusan permanen dan pembukaan Sesi Tugas dapat berjalan bersamaan, dan kondisi tepi terakhir pada 6.2.6 kembali terbuka.

## 8.4 Tabel yang belum ada

`foto_dokumentasi` menjadi urusan Modul 6.7 dan `lhp` menjadi urusan Modul 6.8. Selama keduanya belum ada, baris pemeriksaannya dihapus sementara dan **wajib ditambahkan kembali** begitu tabelnya lahir. Ini dicatat sebagai butir uji U-6.2-08 agar tidak terlupa.

---
---

# Bagian 9 — Koreksi dan tambahan

## 9.1 Kriteria penerimaan tambahan

| Kode | Kriteria |
| --- | --- |
| KP-6.2-63 | Bila dua permintaan membuka Sesi Tugas untuk orang yang sama tiba pada saat hampir bersamaan, maka tepat satu berhasil dan yang lain menerima keterangan berisi nomor SPT yang sesinya sedang terbuka |
| KP-6.2-64 | Bila laporan kedua dan seterusnya masuk pada SPT yang sudah berstatus berjalan, maka statusnya tidak berubah dan tidak ada tindakan tambahan yang berjalan |
| KP-6.2-65 | Bila laporan masuk pada SPT berstatus bermasalah, maka statusnya tetap bermasalah dan tidak dikembalikan ke berjalan oleh sistem |
| KP-6.2-66 | Bila pencatatan tanda terima gagal karena jaringan, maka rincian SPT tetap tampil utuh tanpa pesan galat, dan tanda terima tercatat pada pembukaan berikutnya |
| KP-6.2-67 | Bila dua pencabutan pelaksana Anggota tiba pada saat hampir bersamaan sementara hanya tersisa dua, maka tepat satu berhasil dan yang lain ditolak dengan keterangan pelaksana Anggota terakhir |
| KP-6.2-68 | Bila koordinat pada titik lokasi berkoordinat terakhir dikosongkan lewat penyuntingan, maka penyuntingan ditolak dengan keterangan yang sama seperti bila titik itu dihapus |
| KP-6.2-69 | Bila pekerjaan berjadwal berhenti berjalan, maka penanda Lewat Batas tetap tampil benar pada seluruh daftar dan rincian |
| KP-6.2-70 | Bila penghapusan permanen dan pembukaan Sesi Tugas untuk SPT yang sama tiba pada saat hampir bersamaan, maka tepat satu berhasil, dan bila yang berhasil adalah pembukaan sesi maka penghapusan ditolak dengan keterangan ada jejak Sesi Tugas |
| KP-6.2-71 | Bila SPT dihapus permanen, maka baris jejak audit memuat nomor SPT dan judulnya, terbaca setelah SPT tersebut tidak ada lagi |

## 9.2 Aturan global tambahan

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-35 | Aturan yang melintasi lebih dari satu baris atau lebih dari satu tabel ditegakkan lewat pemicu basis data yang mengunci baris induknya, bukan lewat pemeriksaan di aplikasi. Pemeriksaan di aplikasi hanya untuk memberi keterangan lebih awal, bukan sebagai pengaman | Seluruh modul |
| BR-36 | Pekerjaan berulang yang tidak dipicu tindakan manusia dijalankan Penjadwal Basis Data. Tidak ada keadaan sistem yang kebenarannya bergantung pada berjalannya pekerjaan berjadwal; penjadwal hanya boleh mengirim pemberitahuan dan merapikan data, tidak boleh menjadi satu-satunya sumber sebuah penanda | 6.2, 6.4, 6.9 |
| BR-37 | Setiap tampilan basis data wajib dibuat dengan `security_invoker = on`, sehingga aturan akses baris tabel di baliknya tetap berlaku bagi pembacanya | Seluruh modul |

## 9.3 Tambahan Section 3 Glosarium

| Istilah | Definisi tunggal |
| --- | --- |
| **Penjadwal Basis Data** | Ekstensi penjadwal yang berjalan di dalam basis data terkelola yang sama, dipakai untuk pekerjaan berulang yang tidak dipicu tindakan manusia. Bukan server terpisah. Dilarang disebut sebagai worker, cron server, atau background service |
| **Pekerjaan Berjadwal** | Satu tugas yang dijalankan Penjadwal Basis Data pada waktu tertentu secara berulang |

## 9.4 Perubahan Section 5

| Tabel | Perubahan |
| --- | --- |
| `penugasan` | Kolom baru `lewat_batas_diberitahukan_pada timestamptz`, boleh kosong |
| `notifikasi` | Tabel baru, berstatus [KERANGKA], difinalkan pada Modul 6.9 |
| Tampilan `penugasan_tampil` | Baru. Bukan tabel. Menambahkan kolom hitungan `lewat_batas` dan `hari_terlampaui` |
| Tampilan `kesehatan_penjadwal` | Baru. Bukan tabel. Dibaca hanya oleh Kasubdit |

## 9.5 Tambahan Section 8.8

- Pekerjaan berjadwal berhenti berjalan tanpa jejak galat, akibat project dijeda atau gangguan layanan
- Koordinat pada titik berkoordinat terakhir dikosongkan lewat penyuntingan, bukan lewat penghapusan
- Dua pencabutan pada baris berbeda tiba bersamaan sementara syarat minimum hanya berjarak satu

## 9.6 Tambahan Section 9.6 jenis tindakan jejak audit

Tidak ada tambahan. Seluruh tindakan pada addendum ini sudah tercakup daftar yang ditetapkan berkas Modul 6.2.

---
---

# Bagian 10 — Daftar tempel dan urutan pengerjaan

## 10.1 Tempel ke PRD

| Urutan | Tujuan | Isi |
| --- | --- | --- |
| 1 | Section 7, seluruh aturan Modul 6.2 | Penomoran ulang pada Bagian 0.2, dan catatan pencegah pada 0.4 |
| 2 | Seluruh berkas Revisi Modul 6.2 | Penggantian rujukan menurut Bagian 0.3 |
| 3 | Section 4.5 | Amandemen Penjadwal Basis Data pada 1.2 |
| 4 | Section 3 | Dua istilah pada 9.3 |
| 5 | Section 5 | Perubahan pada 9.4 |
| 6 | Section 6.2.8 (baru) | Bagian 1 sampai 8 berkas ini seluruhnya |
| 7 | Section 6.2.3 | KP-6.2-63 sampai KP-6.2-71 |
| 8 | Section 7 | BR-35, BR-36, BR-37 |
| 9 | Section 8.8 | Butir pada 9.5 |

## 10.2 Urutan pengerjaan saat sesi coding

Mengikat, karena tiap langkah bersandar pada langkah sebelumnya.

| No | Langkah | Selesai bila |
| --- | --- | --- |
| 1 | Buat tabel `penugasan`, `penugasan_dasar`, `penugasan_lokasi`, `penugasan_pelaksana`, `sesi_tugas`, `notifikasi` beserta indeks | Skema terbentuk, data semai masuk |
| 2 | Pasang tiga batasan pemeriksaan pada Bagian 5 | Menutup SPT tanpa berkas ditolak dari SQL Editor |
| 3 | Pasang indeks unik parsial `sesi_tugas` | Penyisipan sesi kedua untuk orang sama ditolak dengan kode 23505 |
| 4 | Pasang seluruh pemicu pada Bagian 6 | Penerbitan tanpa syarat lengkap ditolak; pencabutan terakhir ditolak |
| 5 | Pasang pemicu perpindahan status pada Bagian 3 | Penyisipan laporan pertama mengubah status dari SQL Editor |
| 6 | Aktifkan aturan akses baris dan tulis kebijakannya | Diuji dengan empat akun berbeda peran |
| 7 | Buat tampilan `penugasan_tampil` | Dibaca oleh dua peran berbeda, hasilnya berbeda sesuai lingkup |
| 8 | Buat fungsi `catat_tanda_terima` dan `hapus_penugasan_permanen` | Keduanya menolak pemanggil yang tidak berwenang |
| 9 | Pasang `pg_cron`, kedua pekerjaan berjadwal, dan tampilan kesehatan | Pekerjaan tercatat pada `cron.job`, jalannya terlihat pada `cron.job_run_details` |
| 10 | Halaman daftar, formulir penerbitan empat langkah, halaman rincian | Sesuai 6.2.5 |
| 11 | Penerjemahan seluruh kode galat menjadi keterangan berbahasa Indonesia | Tidak ada kode galat mentah yang sampai ke layar |

## 10.3 Butir uji

Sebagian menuntut dua sesi berjalan bersamaan; jalankan dari dua peramban atau dua perangkat.

| Kode | Butir uji | Yang dibuktikan |
| --- | --- | --- |
| U-6.2-01 | Buka Sesi Tugas untuk SPT A, lalu tanpa menutupnya buka Sesi Tugas untuk SPT B | Ditolak, dan keterangannya menyebut SPT A |
| U-6.2-02 | Kirim laporan pertama pada SPT berstatus Baru | Status berpindah ke Berjalan tanpa muat ulang |
| U-6.2-03 | Kirim laporan pada SPT berstatus Bermasalah | Status tetap Bermasalah |
| U-6.2-04 | Buka rincian SPT sebagai pelaksana, tutup, buka lagi | `dibaca_pada` terisi sekali dan tidak berubah pada pembukaan kedua |
| U-6.2-05 | Cabut pelaksana Anggota dari dua peramban bersamaan, sisakan dua | Tepat satu berhasil |
| U-6.2-06 | Kosongkan koordinat titik berkoordinat terakhir lewat penyuntingan | Ditolak |
| U-6.2-07 | Baca `penugasan_tampil` sebagai Anggota | Hanya SPT miliknya yang tampil, membuktikan `security_invoker` bekerja |
| U-6.2-08 | Setelah Modul 6.7 dan 6.8 selesai, periksa `hapus_penugasan_permanen` | Pemeriksaan `foto_dokumentasi` dan `lhp` sudah ditambahkan kembali |
| U-6.2-09 | Jedakan pekerjaan berjadwal, lampaui batas sebuah SPT, buka daftar | Penanda Lewat Batas tetap muncul |
| U-6.2-10 | Hapus SPT permanen dari satu peramban sementara peramban lain membuka Sesi Tugas untuk SPT itu | Tepat satu berhasil, tidak ada keadaan setengah jadi |
| U-6.2-11 | Terbitkan SPT dengan seluruh syarat kurang | Pesan galat menyebut kelima kekurangan sekaligus, bukan satu per satu |
| U-6.2-12 | Perpanjang batas SPT yang sudah pernah diberitahukan lewat batas, lalu lampaui lagi | Pemberitahuan terkirim lagi, membuktikan penanda dikosongkan |

---

## Penutup

Setelah addendum ini ditempel, Modul 6.2 tidak lagi menyisakan titik yang mengharuskan AI Agent menebak. Delapan celah tertutup, satu bentrokan penomoran dibereskan, dan satu celah yang tidak terdaftar pada berkas asalnya — pengosongan koordinat titik terakhir lewat penyuntingan — ditemukan saat penelusuran dan ikut ditutup.

Dua hal sengaja dinyatakan terus terang alih-alih ditutupi. Pertama, pekerjaan berjadwal dapat berhenti tanpa jejak, dan karena itu tidak ada satu pun kebenaran sistem yang digantungkan padanya. Kedua, pemeriksaan penghapusan permanen belum lengkap selama tabel foto dan LHP belum ada; kekurangan itu dicatat sebagai butir uji, bukan diperkirakan bentuknya sekarang.

Satu syarat yang mengikat modul lain juga dinyatakan di sini agar tidak terlewat: fungsi pembukaan Sesi Tugas pada Modul 6.4 wajib mengunci baris induknya. Tanpa itu, satu kondisi tepi yang sudah ditutup addendum ini akan kembali terbuka.


---
---

# BAGIAN F — MODUL 6.3 PELAPORAN KEGIATAN HARIAN & FOTO

# SiPANTAU — Revisi PRD: Modul 6.3 Pelaporan Kegiatan Harian & Foto

**Tanggal: 1 Agustus 2026 · Status: [FINAL] · Menggantikan Section 6.3 versi kerangka 0.2**

Berkas ini kompilasi utuh Modul 6.3 setelah seluruh ronde penggalian selesai dan sepuluh celah teknisnya ditutup Addendum 6.3-T. Disusun mengikuti kerangka Section 6.0, melanjutkan pola berkas Modul 6.1 dan 6.2. Prioritas konflik mengikuti Section 0.3. Bila berkas ini bertentangan dengan Addendum 6.1-T, 6.2-T, atau 6.3-T, ketiga addendum itu yang berlaku.

---

## Cara memakai berkas ini

| Bagian | Ditempel ke PRD sebagai |
| --- | --- |
| Bagian 1 | Tambahan Section 3.2 dan 3.8 baru |
| Bagian 2 | Pengganti Section 5.4, tambahan 5.19 sampai 5.21, amandemen 5.2 dan 5.5 |
| Bagian 3 | Pengganti Section 6.3 secara utuh |
| Bagian 4 | Tambahan Section 7 (BR-38 sampai BR-44) |
| Bagian 5 | Tambahan Section 8.9 baru |
| Bagian 6 | Tambahan Section 9.2 dan 9.6 |
| Bagian 7 | Perubahan Lampiran A dan B |
| Bagian 8 | Perubahan Section 2.3 (satu baris) |
| Bagian 9 | Ringkasan Addendum 6.3-T sebagai referensi silang |

## Riwayat Revisi — baris tambahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.5 | 1 Agu 2026 | Modul 6.3 digali sampai final. Butir A-05 terjawab. Status lokasi bertambah menjadi tiga nilai. Tabel `catatan_laporan` baru. Tabel `laporan_harian` ditulis ulang seluruhnya. Kolom koordinat pindah ke tiap foto. A-15 dikunci final: hanya Kanit menyetujui, satu tingkat, tidak wajib |
| 0.5-T | 1 Agu 2026 | Addendum 6.3-T menutup sepuluh celah teknis modul (kalkulasi lokasi PostGIS, penguncian ganda, pengisian sesi otomatis, pembekuan kolom fakta, view kehadiran tim, garbage collection foto yatim, view dinamis Belum Melapor) |

---
---

# Bagian 1 — Tambahan Section 3 Glosarium

## 3.2 Istilah penugasan dan kegiatan — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Laporan Harian** | Satu baris laporan kegiatan yang dikirim seorang pelaksana dari lapangan. Lapis pertama pelaporan. Bukan LHP |
| **Titik Terdekat** | Titik Lokasi SPT yang jaraknya paling kecil dari koordinat sebuah laporan. Dihitung sistem sebagai fakta, bukan sebagai penilaian |
| **Terekam di Luar Titik** | Keadaan laporan yang koordinatnya berhasil direkam tetapi berada di luar radius seluruh Titik Lokasi SPT. Bukan pelanggaran, bukan kegagalan |

## 3.8 Istilah pelaporan — bagian baru

| Istilah | Definisi tunggal |
| --- | --- |
| **Draf Laporan** | Isian laporan yang belum dikirim. Tersimpan di perangkat pelapor saja dan tidak pernah menyentuh basis data. Tidak terbaca siapa pun, termasuk pimpinan |
| **Tarik Laporan** | Tindakan pelapor membatalkan laporannya sendiri. Barisnya tetap ada dan tetap terbaca peninjau, ditandai ditarik beserta alasan. Bukan penghapusan |
| **Setujui** | Tindakan Kanit yang mengunci sebuah laporan. Sesudahnya laporan tidak dapat disunting maupun ditarik oleh siapa pun |
| **Minta Perbaikan** | Jenis catatan peninjau yang memindahkan laporan ke keadaan Perlu Diperbaiki. Pelapor memperbaiki laporan yang sama, bukan mengirim laporan baru |
| **Kewajiban Lapor Harian** | Ketentuan bahwa tiap pelaksana mengirim sekurang-kurangnya satu laporan per hari kalender selama SPT hidup. Dinyalakan atau dimatikan Kanit per SPT |

---
---

# Bagian 2 — Perubahan Model Data

## 5.4 Tabel laporan_harian — pengganti utuh

**[FINAL]**

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| penugasan_id | uuid | SPT yang dilaporkan |
| pelapor_id | uuid | Pengirim. Menggantikan `anggota_id`. Wajib tercantum aktif pada `penugasan_pelaksana` saat laporan dikirim |
| sesi_tugas_id | uuid | Sesi Tugas milik pelapor yang sedang berjalan **pada SPT yang sama** saat laporan dikirim. Diisi otomatis server (Addendum 6.3-T Celah 3), boleh kosong |
| jenis | enum | pulbaket_awal, perkembangan, akhir |
| uraian | text | Uraian kegiatan. Wajib |
| kendala | text | Kendala di lapangan. Boleh kosong |
| status_kegiatan | enum | berjalan, selesai, bermasalah. Keterangan pada laporan ini saja |
| lokasi_lat | numeric | Koordinat saat laporan dikirim. Boleh kosong. **Beku setelah INSERT** |
| lokasi_lng | numeric | Sama. **Beku setelah INSERT** |
| akurasi_meter | numeric | Ketelitian yang dilaporkan perangkat. Boleh kosong. Hanya disimpan dan ditampilkan. **Beku setelah INSERT** |
| status_lokasi | enum | **terverifikasi, di_luar_titik, tidak_terekam.** Dihitung server saat INSERT (Addendum 6.3-T Celah 1). **Beku** |
| lokasi_id | uuid | Titik Lokasi yang **ditunjuk pelapor**. Mengacu `penugasan_lokasi`. Boleh kosong. **Beku setelah INSERT** |
| lokasi_id_terdekat | uuid | Titik Lokasi terdekat **menurut hitungan sistem** (PostGIS). Boleh kosong. **Beku setelah INSERT** |
| jarak_meter | numeric | Jarak ke titik terdekat. Boleh kosong. **Beku setelah INSERT** |
| alasan_lokasi | enum | Tujuh nilai butir A-05. Wajib bila `status_lokasi = tidak_terekam`, dilarang terisi selain itu. **Beku** |
| alasan_lokasi_lainnya | text | Wajib bila `alasan_lokasi = lainnya`. **Beku** |
| keterangan_lokasi | text | **Opsional.** Tempat pelapor menerangkan keberadaannya bila `status_lokasi = di_luar_titik`. Tidak pernah diwajibkan |
| status_laporan | enum | terkirim, perlu_diperbaiki, disetujui, ditarik |
| disetujui_oleh | uuid | Kanit yang menyetujui. Boleh kosong |
| disetujui_pada | timestamptz | Boleh kosong |
| ditarik_pada | timestamptz | Boleh kosong |
| alasan_penarikan | text | Wajib bila `ditarik_pada` terisi |
| disunting_pada | timestamptz | Waktu penyuntingan terakhir isi (uraian/kendala/status_kegiatan) oleh pelapor. Boleh kosong. Diisi trigger, tidak bisa dipalsukan klien (Addendum 6.3-T Celah 4) |
| jumlah_suntingan | integer | Bawaan 0. Naik hanya saat isi milik pelapor berubah, bukan setiap UPDATE |
| penanda_perangkat | text | **Tidak boleh kosong.** Milik Addendum 6.1-T, jangan dirancang ulang |
| dikirim_pada | timestamptz | Waktu server saat baris disisipkan |

**Kolom yang dicabut dari versi 0.2:** `anggota_id` (berganti nama), `catatan_peninjau` dan `ditinjau_oleh` (pindah ke tabel `catatan_laporan`).

**Tidak ada kolom untuk versi lama.** Sesuai keputusan Q18, perbaikan menimpa isi yang sama dan laporan tetap satu baris. Yang tersimpan hanyalah penanda bahwa laporan pernah disunting beserta jumlahnya.

### Nilai enum alasan_lokasi — butir A-05, [FINAL]

| Nilai | Label |
| --- | --- |
| gps_tidak_tertangkap | Sinyal GPS tidak tertangkap di dalam gedung |
| daya_habis | Perangkat kehabisan daya saat kegiatan |
| izin_lokasi_mati | Izin lokasi tertolak atau tidak aktif |
| area_terbatas | Kegiatan di area terbatas yang melarang perangkat |
| disusun_setelah_pulang | Laporan disusun setelah meninggalkan lokasi |
| perangkat_rusak | Perangkat rusak atau tertinggal |
| lainnya | Lainnya — uraian wajib diisi |

## 5.19 Tabel catatan_laporan — tabel baru

**[FINAL]**

Menggantikan kolom `catatan_peninjau` dan `ditinjau_oleh`. Satu laporan dapat menerima catatan dari beberapa peninjau, dan catatan Kanit tidak lagi menimpa catatan Panit.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| laporan_id | uuid | Laporan yang dikomentari |
| peninjau_id | uuid | Penulis catatan. **Tidak boleh sama dengan `pelapor_id` laporan induknya** (BR-31). Ditegakkan trigger, bukan CHECK constraint (Addendum 6.3-T Celah 6) |
| jenis | enum | catatan, minta_perbaikan |
| isi | text | Isi catatan. Wajib |
| dibuat_pada | timestamptz | Waktu server |
| disunting_pada | timestamptz | Boleh kosong |

Catatan tidak pernah dihapus. Peninjau hanya boleh menyunting catatannya sendiri, dan penyuntingan meninggalkan penanda.

## 5.20 Tabel penugasan — kolom tambahan

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| wajib_lapor_harian | boolean | Bawaan `true`. Dimatikan Kanit bila SPT tidak menuntut laporan tiap hari |

Satuannya tetap: **sekali per hari kalender, per orang**. Karena satuannya tetap, satu kolom boolean sudah cukup dan tidak diperlukan kolom angka.

## 5.5 Tabel foto_dokumentasi — perubahan

**[KERANGKA]** — difinalkan pada Modul 6.7. Empat kolom sudah pasti dan dicatat di sini agar tidak terlewat:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| lat | numeric | Koordinat **milik foto ini sendiri**. Boleh kosong |
| lng | numeric | Sama. Boleh kosong |
| akurasi_meter | numeric | Boleh kosong |
| diambil_pada | timestamptz | Waktu pengambilan menurut perangkat. Boleh kosong untuk foto galeri |

Foto **tidak pernah** mewarisi koordinat laporan induknya. Foto tanpa koordinat tetap tanpa koordinat (BR-42).

Penarikan foto tidak memerlukan kolom sendiri: foto mengikuti keadaan laporan induknya. Modul 6.7 dan 6.8 wajib menyaring foto milik laporan berstatus `ditarik`.

## 5.8 Hubungan antar entitas — tambahan

```
penugasan
 └── laporan_harian
       ├── catatan_laporan     (jamak, boleh kosong)
       └── foto_dokumentasi    (jamak, boleh kosong, tiap foto punya titiknya sendiri)
 └── penugasan_lokasi
       ↑ ditunjuk oleh laporan_harian.lokasi_id
       ↑ dihitung ke laporan_harian.lokasi_id_terdekat
 └── sesi_tugas
       ↑ ditunjuk oleh laporan_harian.sesi_tugas_id (boleh kosong)
```

---
---

# Bagian 3 — Pengganti Section 6.3 secara utuh

**Status: [FINAL]**

## 6.3.1 Deskripsi

Modul ini mengatur lapis pertama pelaporan: laporan singkat berkala yang dikirim pelaksana dari lapangan selama SPT hidup, beserta foto yang melekat padanya, penetapan status lokasi, dan peninjauan oleh pimpinan.

Modul ini adalah tempat sistem paling dekat menyentuh perilaku orang, dan karena itu tempat Prinsip 0.6 paling mudah dilanggar. Seluruh rancangan di bawah bertumpu pada satu sikap: **sistem menyajikan fakta, manusia menilai**. Sistem mencatat jarak, waktu, dan titik terdekat; sistem tidak pernah menyimpulkan bahwa seseorang tidak bekerja.

Ada tiga rancangan yang menegakkan sikap itu di tingkat basis data:

- **Status lokasi memiliki tiga nilai**, bukan dua. Koordinat berhasil direkam di tempat lain adalah fakta yang berbeda dari koordinat yang gagal tertangkap sama sekali, dan menyamakan keduanya membuat catatan menjadi salah.
- **Akurasi GPS ikut disimpan** supaya cap Terverifikasi tidak menjadi klaim yang tidak bisa dipertanggungjawabkan. Koordinat dengan ketelitian 800 meter dan yang 8 meter tidak layak dinilai sama.
- **Kalkulasi status lokasi berlangsung di server**, bukan di ponsel pelapor. Klien hanya mengirim koordinat mentah; sisanya dihitung PostGIS (Addendum 6.3-T Celah 1).

Yang **bukan** urusan modul ini: cara foto diambil, diberi watermark, dikompresi, dan dirangkai jadi kolase (Modul 6.7); perekaman rute dan pembukaan Sesi Tugas (Modul 6.4); penyusunan LHP (Modul 6.8); pengiriman pemberitahuan (Modul 6.9). Modul ini menetapkan **kapan** pemberitahuan terpicu, bukan bagaimana ia sampai.

## 6.3.2 Cerita pengguna

**Pelaksana** — berperan Anggota, Panit, atau Kanit

- Sebagai pelaksana, saya ingin mengirim laporan singkat dari lapangan dalam waktu kurang dari dua menit, agar melapor tidak terasa lebih berat daripada bekerja.
- Sebagai pelaksana, saya ingin menyicil isian laporan sebagai draf di ponsel saya, agar saya bisa mulai menulis sambil menunggu dan menyelesaikannya nanti tanpa pimpinan melihat setengah jadinya.
- Sebagai pelaksana, saya ingin tetap bisa mengirim laporan ketika GPS tidak tertangkap, agar kegiatan yang sudah saya lakukan tidak hilang hanya karena urusan sinyal.
- Sebagai pelaksana, saya ingin memilih sendiri sedang berada di titik yang mana ketika tebakan sistem meleset, agar catatan yang tersimpan sesuai kenyataan.
- Sebagai pelaksana, saya ingin melampirkan foto dari beberapa tempat dalam satu laporan dan melihat titik-titiknya di peta, agar pimpinan mengerti alur pergerakan saya tanpa saya jelaskan panjang lebar.
- Sebagai pelaksana, saya ingin memperbaiki salah ketik pada laporan yang sudah terkirim, agar nama dan alamat yang keliru tidak ikut terbawa ke berkas resmi.
- Sebagai pelaksana, saya ingin menarik laporan yang salah kirim ke SPT lain, agar tidak mengotori berkas perkara yang tidak ada hubungannya.

**Panit**

- Sebagai Panit, saya ingin melihat laporan masuk dari SPT yang saya awasi dalam satu daftar, agar saya tidak perlu membuka SPT satu per satu.
- Sebagai Panit, saya ingin memberi catatan pada laporan, agar arahan saya tercatat dan tidak hilang di percakapan pesan singkat.
- Sebagai Panit, saya ingin meminta laporan diperbaiki ketika uraiannya terlalu tipis, agar berkasnya layak dipakai saat penyusunan LHP.

**Kanit**

- Sebagai Kanit, saya ingin melihat siapa yang belum melapor hari ini, agar saya menghubungi orangnya, bukan menunggu.
- Sebagai Kanit, saya ingin menyetujui laporan yang sudah benar, agar isinya terkunci dan tidak berubah lagi setelah dipakai sebagai bahan.
- Sebagai Kanit, saya ingin mematikan kewajiban lapor harian pada SPT yang memang tidak menuntutnya, agar penanda Belum Melapor tidak menyala tanpa alasan.

**Kasubdit**

- Sebagai Kasubdit, saya ingin membaca laporan lintas unit, agar saya menilai jalannya perkara tanpa meminta rekapan manual.

## 6.3.3 Kriteria penerimaan

### Pengiriman laporan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-01 | Bila pengguna bukan pelaksana aktif pada sebuah SPT, maka SPT itu tidak muncul pada pilihan penugasan di formulir laporan, dan penyisipan barisnya ditolak di tingkat basis data |
| KP-6.3-02 | Bila SPT berstatus baru, berjalan, atau bermasalah, maka laporan dapat dikirim, **tanpa memandang** apakah tanggal batas sudah terlampaui |
| KP-6.3-03 | Bila tanggal batas SPT sudah terlampaui, maka kepala formulir menampilkan peringatan Lewat Batas dan pengiriman **tetap** diizinkan |
| KP-6.3-04 | Bila SPT berstatus selesai atau dibatalkan, maka SPT itu hilang dari pilihan dan laporan baru tidak dapat masuk |
| KP-6.3-05 | Bila laporan dikirim sementara pelapor sedang memegang Sesi Tugas berjalan pada SPT yang sama, maka `sesi_tugas_id` terisi sesi tersebut oleh server |
| KP-6.3-06 | Bila laporan dikirim di luar Sesi Tugas, atau sesi aktif pelapor sedang untuk SPT lain, maka `sesi_tugas_id` dibiarkan kosong dan laporan **tidak** diberi penanda kurang sah |
| KP-6.3-07 | Bila laporan dikirim dari perangkat yang bukan Perangkat Terdaftar, maka penyisipan ditolak sesuai kebijakan Addendum 6.1-T |
| KP-6.3-08 | Bila laporan pertama pada sebuah SPT berstatus baru masuk, maka status SPT berpindah ke berjalan lewat pemicu yang sudah ditetapkan Addendum 6.2-T Bagian 3. Modul ini **tidak** membuat pemicu kedua |
| KP-6.3-09 | Bila laporan berjenis akhir masuk, maka layar Kanit menampilkan saran bahwa SPT tampaknya siap ditutup. Saran, bukan perintah, dan tidak mengubah status apa pun |
| KP-6.3-10 | Bila pelapor mengirim laporan berjenis apa pun, maka tidak ada urutan jenis yang dipaksakan dan laporan akhir boleh lebih dari satu |

### Draf

| Kode | Kriteria |
| --- | --- |
| KP-6.3-11 | Bila pelapor menekan Simpan Draf, maka isian tersimpan di perangkatnya sendiri dan **tidak ada baris** yang masuk ke basis data |
| KP-6.3-12 | Bila draf tersimpan, maka tidak ada pemberitahuan terkirim, tidak ada peninjau yang dapat membacanya, dan status SPT tidak berubah |
| KP-6.3-13 | Bila pelapor membuka kembali formulir laporan untuk SPT yang punya draf, maka isian terisi ulang dari draf tersebut |
| KP-6.3-14 | Bila draf sudah berhasil dikirim, maka draf lokalnya dihapus |
| KP-6.3-15 | Bila aplikasi dipasang ulang atau data aplikasi dibersihkan, maka draf hilang, dan pelapor sudah diberi tahu tentang hal ini pada teks bantuan di dekat tombol Simpan Draf |

### Status lokasi

| Kode | Kriteria |
| --- | --- |
| KP-6.3-16 | Bila koordinat berhasil direkam, maka server menghitung jarak ke seluruh Titik Lokasi SPT memakai PostGIS, menetapkan yang terdekat pada `lokasi_id_terdekat`, dan menyimpan jaraknya pada `jarak_meter`. Perhitungan tidak boleh dilakukan di klien |
| KP-6.3-17 | Bila jarak ke titik terdekat berada dalam radius titik tersebut, maka `status_lokasi` bernilai terverifikasi dan `lokasi_id` terisi titik itu sebagai tebakan awal |
| KP-6.3-18 | Bila koordinat berhasil direkam tetapi berada di luar radius seluruh titik, maka `status_lokasi` bernilai di_luar_titik dengan label Terekam di luar titik. Alasan **tidak** diwajibkan, dan tidak ada kalimat yang menyiratkan pelanggaran |
| KP-6.3-19 | Bila koordinat tidak berhasil direkam, maka `status_lokasi` bernilai tidak_terekam dan pelapor wajib memilih satu dari tujuh alasan A-05 |
| KP-6.3-20 | Bila alasan yang dipilih bernilai lainnya, maka uraian wajib diisi |
| KP-6.3-21 | Bila laporan tidak memiliki koordinat, maka pengiriman **tetap** diizinkan. Tidak ada keadaan apa pun yang membuat laporan ditolak karena urusan lokasi (BR-03) |
| KP-6.3-22 | Bila pelapor menimpa tebakan sistem dan memilih titik lain, maka `lokasi_id` terisi pilihannya sementara `lokasi_id_terdekat` dan `jarak_meter` tetap menyimpan hitungan sistem. Keduanya tersimpan berdampingan tanpa yang satu membatalkan yang lain |
| KP-6.3-23 | Bila `lokasi_id` pilihan pelapor berbeda dari `lokasi_id_terdekat`, maka tampilan rincian menyajikan keduanya sebagai keterangan datar. Sistem tidak menyatakan mana yang benar |
| KP-6.3-24 | Bila perangkat melaporkan ketelitian koordinat, maka angkanya disimpan pada `akurasi_meter` dan ditampilkan di sebelah status lokasi |
| KP-6.3-25 | Bila SPT tidak memiliki satu pun titik berkoordinat, maka seluruh laporan padanya bernilai di_luar_titik tanpa perhitungan. Keadaan ini tidak seharusnya terjadi karena BR-33, tetapi sistem tetap tidak boleh gagal karenanya |
| KP-6.3-26 | Bila laporan sudah tersimpan, maka seluruh kolom lokasi (`lokasi_lat`, `lokasi_lng`, `akurasi_meter`, `status_lokasi`, `lokasi_id_terdekat`, `jarak_meter`, `alasan_lokasi`, `lokasi_id`) **tidak dapat lagi diubah** oleh siapa pun lewat jalur mana pun |

### Foto

| Kode | Kriteria |
| --- | --- |
| KP-6.3-27 | Bila foto diambil lewat kamera aplikasi, maka koordinat, ketelitian, dan waktu pengambilan tersimpan **pada foto itu sendiri** |
| KP-6.3-28 | Bila foto diambil dari galeri, maka foto tersimpan tanpa koordinat dan **tidak** diberi koordinat pinjaman dari laporan induknya (BR-42) |
| KP-6.3-29 | Bila laporan dibuka, maka foto berkoordinat ditampilkan sebagai pin bernomor di atas peta kecil, dan foto tanpa koordinat dikumpulkan di bawahnya dalam kelompok bertajuk Tanpa titik lokasi |
| KP-6.3-30 | Bila laporan masih dapat disunting, maka foto masih dapat ditambahkan padanya |
| KP-6.3-31 | Bila laporan ditarik, maka seluruh fotonya ikut dianggap ditarik dan tidak lagi muncul sebagai bahan Kolase maupun LHP |
| KP-6.3-32 | Bila unggahan foto berhasil sementara baris laporan induknya gagal tersimpan, maka foto yatim tersebut dibersihkan pekerjaan berjadwal harian (Addendum 6.3-T Celah 9) |

### Penyuntingan, penarikan, persetujuan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-33 | Bila laporan berstatus terkirim atau perlu_diperbaiki, maka pelapornya dapat menyuntingnya kapan saja. Kolom yang dapat disunting hanya `uraian`, `kendala`, dan `status_kegiatan` |
| KP-6.3-34 | Bila laporan disunting, maka isinya tertimpa, `disunting_pada` diperbarui dan `jumlah_suntingan` bertambah satu oleh trigger — bukan oleh nilai yang dikirim klien (Addendum 6.3-T Celah 4). Tampilan menyertakan penanda pernah disunting beserta waktunya |
| KP-6.3-35 | Bila Kanit menekan Setujui, maka laporan berstatus disetujui dan terkunci: tidak dapat disunting, tidak dapat ditarik, oleh siapa pun termasuk Kasubdit dan pelapornya |
| KP-6.3-36 | Bila SPT ditutup atau dibatalkan, maka seluruh laporan di dalamnya ikut terkunci meskipun belum pernah disetujui. Penguncian ditegakkan trigger yang memeriksa status SPT induk saat UPDATE (Addendum 6.3-T Celah 2) |
| KP-6.3-37 | Bila laporan tidak pernah disetujui sampai SPT ditutup, maka laporan itu **tetap sah** dan tetap terhitung pada seluruh rekap. Persetujuan bukan syarat keabsahan |
| KP-6.3-38 | Bila pelapor menarik laporannya, maka alasan wajib diisi, baris tetap ada, dan peninjau tetap dapat membacanya dengan penanda ditarik |
| KP-6.3-39 | Bila laporan ditarik, maka ia tidak terhitung pada rekap jumlah laporan, tidak memenuhi Kewajiban Lapor Harian, dan tidak menjadi bahan LHP |
| KP-6.3-40 | Bila laporan pertama pada sebuah SPT ditarik, maka status SPT **tetap** berjalan dan tidak dikembalikan ke baru |
| KP-6.3-41 | Bila laporan salah dikirim ke SPT yang keliru, maka jalannya adalah menarik lalu mengirim ulang. Tidak ada pemindahan laporan antar-SPT |
| KP-6.3-42 | Bila laporan sudah berstatus disetujui atau ditarik, maka tidak ada tombol sunting, tarik, maupun tambah foto yang ditampilkan |

### Peninjauan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-43 | Bila peninjau membuka laporan yang **ia kirim sendiri**, maka tombol beri catatan tidak ditampilkan dan penyisipan catatannya ditolak di tingkat basis data lewat trigger, bukan CHECK (BR-31, Addendum 6.3-T Celah 6) |
| KP-6.3-44 | Bila beberapa peninjau memberi catatan pada satu laporan, maka seluruh catatan tersimpan dan terbaca berurutan menurut waktu. Tidak ada catatan yang menimpa catatan lain |
| KP-6.3-45 | Bila peninjau memilih jenis minta perbaikan, maka status laporan berpindah ke perlu_diperbaiki lewat trigger AFTER INSERT pada catatan_laporan (Addendum 6.3-T Celah 5), dan pelapor menerima pemberitahuan |
| KP-6.3-46 | Bila pelapor menyunting laporan berstatus perlu_diperbaiki lalu menyimpannya, maka status kembali ke terkirim dan peninjau yang meminta perbaikan menerima pemberitahuan |
| KP-6.3-47 | Bila peninjau menyunting catatannya sendiri, maka catatan lama tertimpa dan penanda pernah disunting muncul. Catatan tidak dapat dihapus |
| KP-6.3-48 | Bila peninjau hendak menyunting catatan milik peninjau lain, maka tindakan ditolak |
| KP-6.3-49 | Bila Panit sudah dicabut penunjukannya dari sebuah SPT, maka ia tetap dapat membaca laporan di SPT itu tetapi tidak dapat memberi catatan baru (BR-21) |

### Kewajiban lapor harian

| Kode | Kriteria |
| --- | --- |
| KP-6.3-50 | Bila Kanit menerbitkan SPT, maka `wajib_lapor_harian` bernilai benar secara bawaan dan dapat dimatikan kapan saja |
| KP-6.3-51 | Bila kewajiban menyala, maka setiap pelaksana yang belum mengirim laporan sah pada satu hari kalender diberi penanda Belum Melapor pada daftar hari itu. Penanda dihitung dinamis oleh view SQL, bukan disimpan di tabel (Addendum 6.3-T Celah 7) |
| KP-6.3-52 | Bila seorang pelaksana belum melapor sampai akhir hari, maka pelaksana itu dan Panit Penanggung Jawab menerima pemberitahuan lewat pekerjaan berjadwal yang membaca view tersebut |
| KP-6.3-53 | Bila kewajiban terlewat, maka **tidak ada** fungsi yang dikunci, tidak ada tombol yang mati, dan tidak ada kalimat yang menyatakan lalai, malas, atau tidak bekerja |
| KP-6.3-54 | Bila kewajiban dimatikan Kanit, maka penanda Belum Melapor tidak pernah muncul pada SPT tersebut |
| KP-6.3-55 | Bila hari itu jatuh pada hari libur atau akhir pekan, maka perhitungan tetap berjalan. Tidak ada pengecualian kalender |
| KP-6.3-56 | Bila pekerjaan berjadwal berhenti, maka penanda Belum Melapor tetap tampil benar di antarmuka Kanit karena dihitung ulang tiap kali halaman dibuka. Hanya pemberitahuannya yang telat |

### Lingkup data dan riwayat

| Kode | Kriteria |
| --- | --- |
| KP-6.3-57 | Bila pengguna membuka sebuah laporan, maka isinya hanya terbaca oleh pengirimnya, Panit Penanggung Jawab SPT itu, Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan |
| KP-6.3-58 | Bila sesama pelaksana membuka SPT yang sama, maka mereka melihat **bahwa** rekannya sudah melapor beserta waktunya, tetapi tidak melihat isi laporannya. Diselesaikan lewat view `rekap_laporan_tim` dengan `security_invoker = off` yang hanya mengekspos tiga kolom (Addendum 6.3-T Celah 8) |
| KP-6.3-59 | Bila Anggota membuka Riwayat Laporan, maka yang tampil hanya laporannya sendiri, termasuk yang sudah ditarik |
| KP-6.3-60 | Bila Panit membuka daftar laporan, maka yang tampil hanya laporan dari SPT yang ia awasi, dengan yang belum bercatatan berada di urutan atas |
| KP-6.3-61 | Bila Kasubdit membuka daftar laporan, maka ia melihat laporan lintas unit dan memperoleh penyaring unit |
| KP-6.3-62 | Bila daftar ditampilkan tanpa penyaring, maka urutannya terbaru di atas |

### Jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.3-63 | Bila terjadi salah satu tindakan berikut, maka satu baris jejak audit tercatat: `sunting_laporan`, `tarik_laporan`, `setujui_laporan`, `catat_laporan`, `minta_perbaikan_laporan`, `sunting_catatan_laporan` |
| KP-6.3-64 | Bila laporan dikirim, maka **tidak** ada baris jejak audit tersendiri. Baris laporannya sendiri sudah menjadi catatan lengkap dengan waktu, pengirim, dan penanda perangkat |

## 6.3.4 Aturan modul

1. **Tidak ada laporan yang ditolak karena urusan lokasi.** Ini pagar tertinggi di modul ini. Setiap rancangan yang berujung pada penolakan pengiriman karena koordinat adalah pelanggaran BR-03, sekeras apa pun alasannya terdengar masuk akal.
2. **Sistem menyajikan tiga fakta, tidak menyimpulkan satu pun kesimpulan.** Fakta itu: koordinat beserta ketelitiannya, titik terdekat beserta jaraknya, dan titik yang ditunjuk pelapor. Ketiganya ditampilkan berdampingan. Sistem tidak menulis kalimat semacam tidak sesuai penugasan atau di luar wilayah tugas.
3. **Ada tiga keadaan lokasi, bukan dua.** Gagal merekam dan berhasil merekam di tempat lain adalah dua hal berbeda, dan menyamakannya membuat catatan menjadi salah.
4. **Kalkulasi kritis berlangsung di server, bukan di klien.** Ini pagar teknis yang menopang seluruh nilai pembuktian modul. Ponsel pelapor hanya mengirim koordinat mentah; jarak, titik terdekat, dan status lokasi diputuskan PostGIS di server.
5. **Kolom fakta dibekukan setelah tercatat.** Yang berubah setelahnya hanya kolom yang memang berupa narasi manusia — `uraian`, `kendala`, `status_kegiatan`, catatan peninjau.
6. **Draf tidak pernah menyentuh basis data.** Selain melindungi setengah jadi dari mata pimpinan, ini juga yang menjaga pemicu Addendum 6.2-T tidak menjalankan SPT sebelum ada yang benar-benar dilaporkan.
7. **Laporan tidak pernah dihapus.** Koreksi lewat penyuntingan, pembatalan lewat penarikan. Angka rekap kemarin dan hari ini harus selalu bisa dijelaskan.
8. **Penguncian berasal dari dua arah**: persetujuan Kanit, dan penutupan SPT. Sesudah terkunci, tidak ada peran yang dapat membukanya kembali selain lewat pembukaan kembali SPT pada Modul 6.2.
9. **Foto membawa titiknya sendiri.** Satu laporan dapat merangkum kegiatan di beberapa tempat, dan memaksakan satu koordinat untuk semuanya akan menghapus justru bagian yang paling berguna bagi LHP.
10. **Kewajiban lapor harian tidak pernah mengunci apa pun.** Ia hanya menerbitkan penanda dan pemberitahuan. Sistem pengawasan yang menghukum akan dihindari penggunanya, dan sistem yang dihindari tidak mengawasi apa-apa.
11. **Peninjauan bersifat menumpuk, bukan menimpa.** Catatan Panit dan catatan Kanit berdiri sendiri-sendiri.
12. **Isi laporan bukan konsumsi sesama pelaksana.** Rekan setim cukup tahu bahwa laporan sudah masuk.

## 6.3.5 Antarmuka dan kondisi tampilan

Gaya visual mengikuti prototype: kartu `.card` dengan `.card-h` dan `.card-b`, kelompok isian `.fg` dengan label bertanda `.req`, area unggah `.drop`, deretan `.thumbs`, baris daftar `.rst`, lencana `.bd`, tombol `.btn-g` untuk tindakan utama dan `.btn-o` untuk tindakan sekunder, kotak catatan berlatar `var(--amber-bg)` dengan garis kiri `var(--gold)`. Tidak ada komponen baru yang diperkenalkan modul ini kecuali peta kecil pada rincian laporan, yang memakai Leaflet dengan gaya yang sama seperti peta pada Modul 6.2.

### Halaman Kirim Laporan

Dicapai lewat tombol mengambang di beranda pelaksana, seperti pada prototype. Isian berurutan:

1. **Penugasan** — hanya SPT tempat pengguna tercantum sebagai pelaksana aktif dan berstatus baru, berjalan, atau bermasalah. Bila SPT terpilih sudah lewat batas, muncul pita peringatan di atas formulir.
2. **Jenis laporan** dan **status kegiatan** berdampingan. Memilih status kegiatan bermasalah **tidak** langsung menyimpan; sistem membuka penuntun Tandai Bermasalah milik Modul 6.2 supaya jenis masalah dan uraiannya terisi lewat satu pintu yang sama.
3. **Lokasi** — kotak yang menampilkan hasil pembacaan GPS beserta ketelitiannya, titik terdekat beserta jaraknya, dan pemilih titik yang sudah terisi tebakan sistem. Bila koordinat gagal terbaca, kotak berubah menjadi pemilih alasan tujuh baris.
4. **Uraian kegiatan** — wajib.
5. **Kendala di lapangan** — boleh kosong.
6. **Foto dokumentasi** — dua tombol berbeda, Ambil Foto dan Pilih dari Galeri, bukan satu area unggah gabungan. Perbedaan keduanya menentukan status foto, jadi pilihannya harus terlihat sebagai dua jalan berbeda sejak awal.
7. Tombol **Simpan Draf** dan **Kirim Laporan**.

Panel Sebelum Mengirim pada prototype dipertahankan, tetapi butir ketiganya diganti. Kalimat "Laporan yang terkirim tidak dapat diubah" sudah tidak benar; penggantinya menerangkan bahwa laporan masih dapat diperbaiki sampai disetujui Kanit.

### Halaman Rincian Laporan

Kepala: nomor SPT, jenis laporan, nama pengirim, waktu kirim, lencana status laporan, dan bila ada, penanda pernah disunting.

Badan: kotak lokasi berisi tiga fakta berdampingan; peta kecil dengan pin bernomor untuk tiap foto berkoordinat; foto tanpa koordinat dalam kelompok terpisah di bawah peta; uraian; kendala; lalu daftar catatan peninjau berurutan menurut waktu.

| Peran | Tombol yang tampil |
| --- | --- |
| Pelapor, selama belum terkunci | Sunting, Tambah Foto, Tarik Laporan |
| Panit Penanggung Jawab aktif | Beri Catatan, Minta Perbaikan |
| Kanit unit pemilik | Beri Catatan, Minta Perbaikan, **Setujui** |
| Kasubdit | Beri Catatan |
| Pelaksana lain di SPT yang sama | tidak ada, dan isi laporan tidak terbuka |

### Daftar laporan

| Peran | Judul | Isi |
| --- | --- | --- |
| Anggota | Riwayat Laporan | Laporannya sendiri, termasuk yang ditarik |
| Panit | Review Laporan | Laporan dari SPT yang ia awasi, yang belum bercatatan di atas |
| Kanit | Semua Laporan | Seluruh laporan di unitnya, dengan rekap Belum Melapor Hari Ini di kepala halaman |
| Kasubdit | Semua Laporan | Lintas unit, dengan penyaring unit |

Penyaring: SPT, jenis laporan, status laporan, status lokasi, rentang tanggal, pelapor. Pencarian menyisir uraian dan kendala dalam lingkup data pengguna.

### Kondisi kosong

| Keadaan | Yang ditampilkan |
| --- | --- |
| Anggota belum pernah melapor | Ajakan mengirim laporan pertama beserta tombolnya |
| Panit belum menerima laporan apa pun | Keterangan bahwa laporan akan tampil begitu dikirim dari lapangan |
| Laporan tanpa foto | Keterangan datar bahwa tidak ada foto dilampirkan, tanpa nada menegur |
| Laporan tanpa catatan peninjau | Keterangan bahwa belum ada catatan |
| Seluruh pelaksana sudah melapor hari ini | Kalimat afirmatif singkat, bukan ruang kosong |

### Kondisi memuat dan galat

- Kotak lokasi menampilkan keadaan mencari sinyal selama pembacaan GPS berjalan, dengan tombol Lewati yang langsung membuka pemilih alasan. Pelapor tidak pernah terkunci menunggu GPS.
- Bila unggahan foto terputus, laporan tetap dapat dikirim tanpa foto itu, dan foto dapat ditambahkan kemudian.
- Bila pengiriman gagal karena jaringan, isian tidak hilang dan otomatis tersimpan sebagai draf lokal.
- Bila penyuntingan ditolak karena laporan baru saja disetujui Kanit, pesan yang muncul menerangkan sebabnya, bukan sekadar galat.

## 6.3.6 Edge case modul

| Kondisi | Penanganan |
| --- | --- |
| Pelapor dicabut dari SPT setelah mengirim laporan | Laporan tetap ada dan tetap terhitung. Pelapor tetap dapat membacanya, tetapi tidak dapat menyuntingnya lagi |
| Kanit menyetujui laporan tepat saat pelapor menekan simpan suntingan | Yang tiba lebih dulu di basis data menang. Bila persetujuan menang, penyuntingan ditolak trigger `trg_kunci_laporan` disertai keterangan |
| SPT ditutup saat pelapor sedang mengisi formulir | Pengiriman ditolak trigger `trg_periksa_pelapor_aktif`, isian tidak hilang, dan pelapor diberi tahu SPT sudah ditutup |
| Koordinat tiba terlambat, sesudah laporan dikirim | Tidak ada penyisipan koordinat susulan. Laporan tetap tidak_terekam. Kolom lokasi sudah dibekukan trigger `trg_tandai_sunting` |
| Jam perangkat dimundurkan pelapor | Seluruh waktu yang disimpan berasal dari server. Waktu perangkat hanya dipakai pada `diambil_pada` milik foto, dan itu ditampilkan sebagai waktu menurut perangkat |
| Laporan ditarik sesudah dipakai sebagai bahan LHP | Penarikan tetap diizinkan. LHP yang sudah tersusun tidak berubah sendiri; Modul 6.8 wajib menandai bahan yang ditarik saat LHP dibuka kembali |
| Dua peninjau meminta perbaikan hampir bersamaan | Keduanya tersimpan sebagai catatan. Status berpindah sekali saja, dan `UPDATE` kedua tidak berbahaya karena bersyarat `status_laporan NOT IN ('disetujui','ditarik')` |
| Pelapor menyunting laporan berkali-kali dalam satu menit | Diizinkan tanpa batas. `jumlah_suntingan` bertambah tiap kali |
| Titik Lokasi disunting Kanit sesudah ada laporan menunjuknya | Status lokasi laporan lama **tidak** dihitung ulang, sejalan dengan kondisi tepi yang sama pada Modul 6.2 |
| Pelaksana punya dua SPT aktif dan melapor di salah satunya | Kewajiban Lapor Harian dihitung **per SPT**, bukan per orang secara keseluruhan. Melapor di SPT A tidak menggugurkan kewajiban di SPT B |
| Foto berhasil terunggah tetapi baris laporannya gagal tersimpan | Pekerjaan `pg_cron` tengah malam menghapus objek Storage yang tidak tercatat di `foto_dokumentasi` dan berumur lebih dari 24 jam |
| Pelapor menarik seluruh laporannya di sebuah SPT | SPT tetap berstatus berjalan. Rekap menampilkan nol laporan sah, dan itu memang keadaan sebenarnya |

## 6.3.7 Ketergantungan

**Bergantung pada:**

| Modul / Berkas | Yang dibutuhkan |
| --- | --- |
| 6.1 + Addendum 6.1-T | Fungsi bantu `sipantau_auth`, penanda Perangkat Terdaftar, kebijakan insert `laporan_harian` |
| 6.2 + Addendum 6.2-T | Tabel `penugasan`, `penugasan_pelaksana`, `penugasan_lokasi` beserta radiusnya, status SPT, penuntun Tandai Bermasalah, pemicu perpindahan status baru→berjalan |
| 6.4 | Tabel `sesi_tugas` untuk pengisian `sesi_tugas_id`. Modul ini tetap berjalan bila kolom itu selalu kosong |
| **Addendum 6.3-T** | **Sepuluh trigger, satu view, dan satu pekerjaan berjadwal yang menutup celah teknis modul ini. Modul ini tidak berjalan tanpanya** |
| Ekstensi PostGIS | Wajib aktif pada Supabase project. Modul ini tidak berjalan tanpanya |

**Yang bergantung pada modul ini:**

| Modul | Yang dibutuhkannya |
| --- | --- |
| 6.5 Dashboard | Hitungan laporan masuk, laporan menunggu tinjauan, dan view `v_belum_lapor` |
| 6.7 Kolase | Foto beserta koordinat dan waktunya, serta penyaringan foto milik laporan yang ditarik |
| 6.8 LHP Ringkas | Uraian, kendala, status lokasi, dan foto sebagai bahan utama; `sesi_tugas_id` sebagai penaut ke potongan rute |
| 6.9 Notifikasi | Lima kejadian pemicu: laporan masuk, catatan diberikan, perbaikan diminta, laporan disetujui, kewajiban harian terlewat |

---
---

# Bagian 4 — Tambahan Section 7 Business Rules Global

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-38 | Laporan dapat dikirim selama SPT berstatus baru, berjalan, atau bermasalah, tanpa memandang tanggal batas. Sesudah selesai atau dibatalkan, tidak ada laporan baru yang dapat masuk | 6.3 |
| BR-39 | Laporan tidak pernah dihapus. Koreksi dilakukan lewat penyuntingan, pembatalan lewat penarikan. Laporan yang ditarik tetap tersimpan dan tetap terbaca peninjau | 6.3, 6.5, 6.8 |
| BR-40 | Laporan dapat disunting pelapornya sampai disetujui Kanit atau sampai SPT ditutup. Sesudah salah satu terjadi, laporan terkunci bagi siapa pun. Persetujuan tidak wajib dan bukan syarat keabsahan | 6.3 |
| BR-41 | Status lokasi laporan memiliki tiga nilai: terverifikasi, terekam di luar titik, dan tidak terekam. Sistem menyimpan jarak, ketelitian, titik terdekat, dan titik pilihan pelapor sebagai fakta berdampingan, dan tidak pernah menyimpulkan kepatuhan | 6.3, 6.5, 6.8 |
| BR-42 | Setiap foto membawa koordinat dan waktu pengambilannya sendiri. Foto tanpa koordinat tidak pernah diberi koordinat pinjaman dari laporan induknya | 6.3, 6.7, 6.8 |
| BR-43 | Catatan peninjau tidak pernah dihapus dan tidak pernah saling menimpa. Peninjau hanya dapat menyunting catatannya sendiri | 6.3 |
| BR-44 | Kewajiban Lapor Harian yang terlewat hanya menerbitkan penanda dan pemberitahuan. Tidak ada fungsi yang dikunci dan tidak ada kalimat yang menyatakan kelalaian | 6.3, 6.5, 6.9 |

---
---

# Bagian 5 — Tambahan Section 8.9 Pelaporan

- Koordinat tiba sesudah laporan terkirim
- Laporan ditarik sesudah dipakai sebagai bahan LHP
- Persetujuan Kanit dan penyuntingan pelapor tiba hampir bersamaan
- Foto terunggah sementara baris laporannya gagal tersimpan
- SPT ditutup saat formulir laporan sedang diisi
- SPT tidak memiliki satu pun titik berkoordinat saat laporan masuk

---
---

# Bagian 6 — Tambahan Section 9

## 9.2 Aturan akses per tabel

| Tabel | Baca | Tulis |
| --- | --- | --- |
| `laporan_harian` | Pelapornya sendiri; Panit yang punya penunjukan pada SPT itu, tanpa memandang `dicabut_pada`; Kanit unit pemilik; Kasubdit; Akun Pemeliharaan. **Sesama pelaksana tidak termasuk** | Penyisipan hanya oleh pelaksana aktif SPT itu dari Perangkat Terdaftar. Pembaruan hanya oleh pelapornya sendiri selama belum terkunci, kecuali kolom persetujuan yang hanya ditulis Kanit unit pemilik. Trigger membekukan seluruh kolom fakta dan kolom lokasi |
| `catatan_laporan` | Mengikuti hak baca laporan induknya | Penyisipan oleh Panit dengan penunjukan aktif, Kanit unit pemilik, dan Kasubdit. Trigger `trg_larang_tinjau_sendiri` menolak bila `peninjau_id = pelapor_id` laporan induk. Pembaruan hanya oleh penulisnya sendiri. Penghapusan tertutup bagi semua peran |
| `rekap_laporan_tim` (view) | Seluruh pelaksana aktif suatu SPT. Hanya kolom `penugasan_id`, `pelapor_id`, `dikirim_pada` — isi laporan tidak terekspos | Tidak dapat ditulis |
| `v_belum_lapor` (view) | Kanit unit pemilik dan Kasubdit. Dihitung dinamis, tidak disimpan | Tidak dapat ditulis |

## 9.6 Jenis tindakan jejak audit — tambahan

`sunting_laporan`, `tarik_laporan`, `setujui_laporan`, `catat_laporan`, `minta_perbaikan_laporan`, `sunting_catatan_laporan`.

Pengiriman laporan tidak dicatat tersendiri.

---
---

# Bagian 7 — Perubahan Lampiran A dan B

## Lampiran A

| Kode | Butir | Status |
| --- | --- | --- |
| A-02 | Data sensitif pada layanan awan | Belum terjawab, prioritas tinggi |
| A-03 | Angka target metrik | Belum terjawab |
| A-04 | Kop dan lambang institusi | Belum terjawab |
| ~~A-05~~ | ~~Daftar alasan lokasi tidak terekam~~ | **Terjawab.** Tujuh nilai, lihat 5.4. Dipindahkan ke Lampiran B butir B.10 |
| A-06 | Daftar resmi unit | Belum terjawab |
| A-07 | Kesediaan Kasubdit memakai sistem | Belum terjawab |
| A-08 | Pencatatan Akun Pemeliharaan | Belum terjawab |
| A-11 | Daftar resmi jenis masalah | Belum terjawab |
| A-12 | Kode klasifikasi surat tiap unit | Belum terjawab |
| A-13 | Kelengkapan daftar jenis kegiatan | Belum terjawab |
| A-14 | Kesediaan Kanit tercantum sebagai pelaksana | Belum terjawab |
| ~~A-15~~ | ~~Mekanisme persetujuan laporan~~ | **Dikunci sebagai final untuk pembangunan.** Hanya Kanit menyetujui, satu tingkat, tidak wajib, penutupan SPT ikut mengunci. Bila Pak Tito nanti menghendaki alur berbeda, perubahannya terbatas pada satu trigger `fn_kunci_laporan` dan satu baris matriks 2.3 |
| A-16 | Kesediaan kewajiban lapor harian berjalan pada hari libur | Belum terjawab. Sistem sekarang tanpa pengecualian kalender |

## Lampiran B — butir tambahan

### B.10 Pelaporan harian — bagian baru

- Laporan boleh dikirim selama SPT berstatus baru, berjalan, atau bermasalah, tanpa memandang tanggal batas; tertutup sesudah selesai atau dibatalkan
- Laporan boleh dikirim tanpa Sesi Tugas berjalan; bila ada sesi untuk SPT yang sama, laporan tertaut padanya lewat pengisian otomatis di server
- Draf laporan tersimpan di perangkat pelapor saja dan tidak pernah menyentuh basis data
- Status lokasi memiliki tiga nilai: Terverifikasi, Terekam di luar titik, Tidak terekam
- Tujuh alasan Lokasi tidak terekam: sinyal GPS tidak tertangkap di dalam gedung, perangkat kehabisan daya, izin lokasi tertolak atau tidak aktif, area terbatas yang melarang perangkat, laporan disusun setelah meninggalkan lokasi, perangkat rusak atau tertinggal, dan lainnya dengan uraian wajib
- Kalkulasi status lokasi berlangsung di server memakai PostGIS, bukan di klien
- Sistem menebak titik terdekat, pelapor boleh menimpanya, dan keduanya tersimpan berdampingan
- Ketelitian GPS ikut disimpan dan ditampilkan, tidak dipakai menolak apa pun
- Kolom fakta laporan (lokasi, ketelitian, status, titik terdekat, pelapor, penugasan, sesi, perangkat, waktu) dibekukan setelah tersimpan
- Laporan boleh disunting sampai disetujui Kanit atau sampai SPT ditutup; perbaikan menimpa laporan yang sama tanpa menyimpan versi lama
- Yang dapat disunting hanya uraian, kendala, dan status kegiatan
- Laporan tidak pernah dihapus; pembatalan berbentuk Tarik Laporan disertai alasan
- Laporan yang salah SPT diselesaikan dengan menarik lalu mengirim ulang
- Menarik laporan pertama tidak mengembalikan status SPT ke Baru
- Persetujuan laporan hanya oleh Kanit, satu tingkat, tidak wajib
- Catatan peninjau berdiri sendiri-sendiri pada tabel terpisah dan tidak saling menimpa
- Peninjau dapat meminta perbaikan; pelapor memperbaiki laporan yang sama
- Foto boleh ditambahkan setelah laporan terkirim selama laporan belum terkunci
- Setiap foto membawa koordinat dan waktunya sendiri; foto galeri tetap tanpa koordinat dan dikelompokkan terpisah
- Foto ikut dianggap ditarik bila laporan induknya ditarik
- Tidak ada urutan jenis laporan yang dipaksakan; laporan akhir boleh lebih dari satu dan hanya memunculkan saran kepada Kanit
- Kewajiban lapor harian sekali per hari kalender per orang per SPT, menyala secara bawaan, dapat dimatikan Kanit, tanpa pengecualian hari libur
- Kewajiban yang terlewat hanya menerbitkan penanda dan pemberitahuan, tanpa penguncian apa pun
- Penanda Belum Melapor dihitung dinamis dari view SQL, bukan dari penjadwal
- Isi laporan tidak terbaca sesama pelaksana; mereka hanya melihat bahwa rekannya sudah melapor lewat view kehadiran terpisah

---
---

# Bagian 8 — Perubahan Section 2.3 Matriks Hak Akses

Satu baris ditambahkan, satu baris diperjelas.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Memberi catatan pada laporan | Ya | Ya, unitnya | Ya, pada SPT yang diawasi | Tidak |
| **Menyetujui laporan** | **Tidak** | **Ya, unitnya** | **Tidak** | **Tidak** |

---
---

# Bagian 9 — Rujukan ke Addendum 6.3-T

Sepuluh celah teknis yang muncul pada penggalian modul ini sudah ditutup Addendum 6.3-T sebagai berkas terpisah. Ringkas silang untuk kemudahan pembacaan:

| Celah | Ditutup dengan | Kriteria terdampak |
| --- | --- | --- |
| 1 | Trigger `trg_hitung_lokasi` + PostGIS `ST_Distance` | KP-6.3-16 sampai KP-6.3-18, BR-41 |
| 2 | Trigger `trg_kunci_laporan` yang memeriksa status SPT induk | BR-40, KP-6.3-35, KP-6.3-36 |
| 3 | Trigger `trg_isi_sesi_tugas` bersyarat `penugasan_id` sama | KP-6.3-05, KP-6.3-06 |
| 4 | Trigger `trg_tandai_sunting` yang membekukan kolom fakta dan hanya mencatat suntingan isi | KP-6.3-33, KP-6.3-34, KP-6.3-26 |
| 5 | Trigger `trg_minta_perbaikan` AFTER INSERT pada catatan | KP-6.3-45, KP-6.3-46 |
| 6 | Trigger `trg_larang_tinjau_sendiri` (bukan CHECK constraint) | BR-31, KP-6.3-43 |
| 7 | View `v_belum_lapor` yang dihitung dinamis; `pg_cron` hanya kurir | KP-6.3-51 sampai KP-6.3-56 |
| 8 | View `rekap_laporan_tim` dengan `security_invoker = off` | KP-6.3-58 |
| 9 | Pekerjaan `pg_cron` harian membersihkan foto yatim | KP-6.3-32 |
| 10 | Trigger `trg_periksa_pelapor_aktif` yang sekaligus memeriksa status SPT | KP-6.3-01, KP-6.3-04 |

Modul ini tidak berjalan tanpa Addendum 6.3-T.

---

## Yang perlu Anda kerjakan setelah menempel berkas ini

1. Naikkan versi PRD menjadi 0.5 pada Kendali Dokumen dan Riwayat Revisi
2. Ubah penanda status Modul 6.3 dari [KERANGKA] menjadi [FINAL]
3. Perbarui Checklist Progres: centang Tahap 2 baris 6.3, coret A-05 dan A-15 pada Tahap 1, tambahkan A-16
4. Kejar ke pemilik produk: A-02 (naik prioritas), A-11, A-12, A-13, A-14, A-16
5. Pastikan Addendum 6.3-T ikut dilampirkan setiap kali PRD ini dikonsumsi AI Agent


---
---

# BAGIAN G — ADDENDUM 6.3-T SPESIFIKASI TEKNIS

# SiPANTAU — Addendum 6.3-T: Spesifikasi Teknis Modul Pelaporan Harian

**Tanggal: 1 Agustus 2026 · Status: [FINAL] · Menutup sepuluh celah pada Modul 6.3**

Seluruh keputusan di bawah diambil langsung mengikuti standar sistem pencatatan bukti kelas perusahaan (audit trail tak terbantahkan, kalkulasi kritis di server, hak baca minimal). Tidak menunggu konfirmasi bertahap. Bagian yang tetap butuh persetujuan Pak Tito hanya ditandai di paling akhir — dan berkas ini tetap berjalan penuh tanpa itu.

---

## Prinsip yang dipakai konsisten di semua sepuluh celah

1. **Klien tidak pernah dipercaya untuk apa pun yang menjadi fakta pembuktian.** Koordinat mentah boleh dikirim klien; kesimpulan dari koordinat itu (jarak, status, titik terdekat) selalu dihitung ulang di server dan menimpa apa pun yang dikirim klien.
2. **Kolom yang mewakili kejadian pada satu waktu tertentu dibekukan setelah tercatat.** Yang berubah setelahnya hanya kolom yang memang berupa narasi manusia.
3. **Setiap trigger memeriksa perubahan kolom, bukan sekadar kejadian UPDATE.** Mencegah efek samping saling menimpa antar-trigger.
4. **View untuk mengekspos data terbatas selalu memakai owner privilege (security_invoker OFF)**, bukan invoker privilege — supaya RLS ketat di tabel dasar tetap utuh sementara view yang dikendalikan sendiri boleh menampilkan potongan tersaring.

---

## Celah 1 — Kalkulasi lokasi di server

**Keputusan:** Kalkulasi terjadi satu kali, saat `INSERT`, tidak pernah pada `UPDATE`.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE FUNCTION fn_hitung_lokasi_laporan() RETURNS trigger AS $$
DECLARE
  titik RECORD;
BEGIN
  IF NEW.lokasi_lat IS NULL OR NEW.lokasi_lng IS NULL THEN
    NEW.status_lokasi := 'tidak_terekam';
    RETURN NEW;
  END IF;

  SELECT id, radius_meter,
         ST_Distance(
           ST_MakePoint(lng, lat)::geography,
           ST_MakePoint(NEW.lokasi_lng, NEW.lokasi_lat)::geography
         ) AS jarak
  INTO titik
  FROM penugasan_lokasi
  WHERE penugasan_id = NEW.penugasan_id AND lat IS NOT NULL
  ORDER BY jarak ASC LIMIT 1;

  IF titik IS NULL THEN
    NEW.status_lokasi := 'di_luar_titik';
    RETURN NEW;
  END IF;

  NEW.lokasi_id_terdekat := titik.id;
  NEW.jarak_meter := titik.jarak;
  NEW.status_lokasi := CASE WHEN titik.jarak <= titik.radius_meter
                             THEN 'terverifikasi' ELSE 'di_luar_titik' END;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hitung_lokasi
  BEFORE INSERT ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_hitung_lokasi_laporan();
```

**Kolom beku setelah `INSERT`:** `lokasi_lat`, `lokasi_lng`, `akurasi_meter`, `status_lokasi`, `lokasi_id_terdekat`, `jarak_meter`, `alasan_lokasi`, `alasan_lokasi_lainnya`, `lokasi_id` (pilihan pelapor), `pelapor_id`, `penugasan_id`, `sesi_tugas_id`, `penanda_perangkat`, `dikirim_pada`. Ditegakkan lewat pemeriksaan kolom pada Celah 4.

---

## Celah 2 — Penguncian ganda: persetujuan dan penutupan SPT

**Keputusan A-15 (final untuk keperluan pembangunan):** dipertahankan seperti usulan sebelumnya — hanya Kanit menyetujui, tidak wajib, penutupan SPT ikut mengunci semua. Ini pola standar di sistem kepolisian/enterprise manapun: persetujuan bertingkat tunggal, bukan berjenjang, karena Panit sudah punya jalur sendiri lewat catatan dan permintaan perbaikan.

```sql
CREATE FUNCTION fn_kunci_laporan() RETURNS trigger AS $$
DECLARE status_spt text;
BEGIN
  IF OLD.status_laporan IN ('disetujui', 'ditarik') THEN
    RAISE EXCEPTION 'Laporan sudah terkunci, tidak dapat diubah';
  END IF;

  SELECT status INTO status_spt FROM penugasan WHERE id = OLD.penugasan_id;
  IF status_spt IN ('selesai', 'dibatalkan') THEN
    RAISE EXCEPTION 'SPT sudah ditutup, laporan ikut terkunci';
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kunci_laporan
  BEFORE UPDATE ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_kunci_laporan();
```

Berjalan sebagai trigger **pertama** secara alfabetis (`trg_kunci_laporan` mendahului `trg_tandai_sunting` di bawah) sehingga tidak ada kolom yang sempat berubah sebelum pemeriksaan kunci dijalankan.

---

## Celah 3 — Pengisian `sesi_tugas_id` otomatis, terikat SPT yang sama

```sql
CREATE FUNCTION fn_isi_sesi_tugas() RETURNS trigger AS $$
BEGIN
  SELECT id INTO NEW.sesi_tugas_id
  FROM sesi_tugas
  WHERE pengguna_id = auth.uid()
    AND penugasan_id = NEW.penugasan_id
    AND ditutup_pada IS NULL
  LIMIT 1;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_isi_sesi_tugas
  BEFORE INSERT ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_isi_sesi_tugas();
```

Klien tidak pernah mengirim `sesi_tugas_id` dalam payload. Sesi aktif di SPT lain (sah menurut BR-24, karena satu orang boleh terlibat banyak SPT) tidak akan tertaut secara keliru karena `penugasan_id` disyaratkan sama.

---

## Celah 4 — Penanda penyuntingan, hanya untuk perubahan isi milik pelapor

```sql
CREATE FUNCTION fn_tandai_sunting() RETURNS trigger AS $$
BEGIN
  IF NEW.uraian IS DISTINCT FROM OLD.uraian
     OR NEW.kendala IS DISTINCT FROM OLD.kendala
     OR NEW.status_kegiatan IS DISTINCT FROM OLD.status_kegiatan THEN
    NEW.disunting_pada := now();
    NEW.jumlah_suntingan := OLD.jumlah_suntingan + 1;
  END IF;

  -- Kolom beku Celah 1 tidak boleh ikut berubah lewat jalur penyuntingan
  NEW.lokasi_lat := OLD.lokasi_lat;
  NEW.lokasi_lng := OLD.lokasi_lng;
  NEW.akurasi_meter := OLD.akurasi_meter;
  NEW.status_lokasi := OLD.status_lokasi;
  NEW.lokasi_id_terdekat := OLD.lokasi_id_terdekat;
  NEW.jarak_meter := OLD.jarak_meter;
  NEW.lokasi_id := OLD.lokasi_id;
  NEW.pelapor_id := OLD.pelapor_id;
  NEW.penugasan_id := OLD.penugasan_id;
  NEW.sesi_tugas_id := OLD.sesi_tugas_id;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tandai_sunting
  BEFORE UPDATE ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_tandai_sunting();
```

Persetujuan Kanit, penarikan, dan perpindahan ke `perlu_diperbaiki` (Celah 5) semuanya berupa `UPDATE` yang **tidak** menyentuh `uraian`/`kendala`/`status_kegiatan`, jadi tidak pernah keliru tercatat sebagai suntingan pelapor.

---

## Celah 5 — Perpindahan ke `perlu_diperbaiki`

```sql
CREATE FUNCTION fn_minta_perbaikan() RETURNS trigger AS $$
BEGIN
  IF NEW.jenis = 'minta_perbaikan' THEN
    UPDATE laporan_harian
    SET status_laporan = 'perlu_diperbaiki'
    WHERE id = NEW.laporan_id AND status_laporan NOT IN ('disetujui', 'ditarik');
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_minta_perbaikan
  AFTER INSERT ON catatan_laporan
  FOR EACH ROW EXECUTE FUNCTION fn_minta_perbaikan();
```

Dan sebaliknya — penyuntingan pelapor mengembalikan status:

```sql
-- ditambahkan pada fn_tandai_sunting, di akhir sebelum RETURN NEW
IF OLD.status_laporan = 'perlu_diperbaiki'
   AND (NEW.uraian IS DISTINCT FROM OLD.uraian OR NEW.kendala IS DISTINCT FROM OLD.kendala) THEN
  NEW.status_laporan := 'terkirim';
END IF;
```

---

## Celah 6 — Larangan meninjau laporan sendiri, lewat trigger bukan CHECK

```sql
CREATE FUNCTION fn_larang_tinjau_sendiri() RETURNS trigger AS $$
DECLARE pemilik uuid;
BEGIN
  SELECT pelapor_id INTO pemilik FROM laporan_harian WHERE id = NEW.laporan_id;
  IF pemilik = NEW.peninjau_id THEN
    RAISE EXCEPTION 'Tidak dapat meninjau laporan sendiri';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_larang_tinjau_sendiri
  BEFORE INSERT ON catatan_laporan
  FOR EACH ROW EXECUTE FUNCTION fn_larang_tinjau_sendiri();
```

---

## Celah 7 — "Belum Melapor" dihitung dinamis, penjadwal hanya kurir

```sql
CREATE VIEW v_belum_lapor AS
SELECT pp.penugasan_id, pp.pelaksana_id
FROM penugasan_pelaksana pp
JOIN penugasan p ON p.id = pp.penugasan_id
WHERE p.status IN ('baru', 'berjalan', 'bermasalah')
  AND p.wajib_lapor_harian = true
  AND pp.dicabut_pada IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM laporan_harian lh
    WHERE lh.penugasan_id = pp.penugasan_id
      AND lh.pelapor_id = pp.pelaksana_id
      AND lh.status_laporan <> 'ditarik'
      AND lh.dikirim_pada::date = current_date
  );
```

Pekerjaan `pg_cron` malam hari hanya membaca `v_belum_lapor` lalu menembakkan pemberitahuan (Modul 6.9). Kalau `pg_cron` berhenti, tampilan Kanit tetap benar karena dihitung ulang tiap kali halaman dibuka — hanya pemberitahuannya yang telat, bukan datanya yang salah.

---

## Celah 8 — Kehadiran rekan tanpa membocorkan isi

```sql
CREATE VIEW rekap_laporan_tim
WITH (security_invoker = off) AS
SELECT penugasan_id, pelapor_id, dikirim_pada
FROM laporan_harian
WHERE status_laporan <> 'ditarik';

GRANT SELECT ON rekap_laporan_tim TO authenticated;
```

`security_invoker = off` (bawaan) membuat *view* berjalan dengan hak akses pemiliknya sehingga RLS ketat di `laporan_harian` tetap utuh, sementara *view* ini sendiri hanya membocorkan tiga kolom yang memang boleh dilihat sesama pelaksana.

---

## Celah 9 — Foto yatim dibersihkan berjadwal

```sql
CREATE FUNCTION fn_bersihkan_foto_yatim() RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'dokumentasi'
    AND created_at < now() - interval '24 hours'
    AND name NOT IN (SELECT jalur_berkas FROM foto_dokumentasi);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('bersih-foto-yatim', '0 2 * * *', 'SELECT fn_bersihkan_foto_yatim()');
```

Berjalan tengah malam, terpisah dari pemeriksaan lain, dan tidak memengaruhi laporan yang sudah tersimpan sah.

---

## Celah 10 — Pemeriksaan gabungan saat pengiriman laporan

```sql
CREATE FUNCTION fn_periksa_pelapor_aktif() RETURNS trigger AS $$
DECLARE status_spt text;
BEGIN
  SELECT status INTO status_spt FROM penugasan WHERE id = NEW.penugasan_id;
  IF status_spt NOT IN ('baru', 'berjalan', 'bermasalah') THEN
    RAISE EXCEPTION 'SPT tidak lagi menerima laporan';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM penugasan_pelaksana
    WHERE penugasan_id = NEW.penugasan_id
      AND pelaksana_id = NEW.pelapor_id
      AND dicabut_pada IS NULL
  ) THEN
    RAISE EXCEPTION 'Bukan pelaksana aktif pada SPT ini';
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_periksa_pelapor_aktif
  BEFORE INSERT ON laporan_harian
  FOR EACH ROW EXECUTE FUNCTION fn_periksa_pelapor_aktif();
```

## Urutan eksekusi trigger `BEFORE INSERT` pada `laporan_harian`

PostgreSQL menjalankan trigger dengan event sama secara alfabetis menurut nama:

1. `trg_hitung_lokasi` (Celah 1)
2. `trg_isi_sesi_tugas` (Celah 3)
3. `trg_periksa_pelapor_aktif` (Celah 10)

Ketiganya independen satu sama lain sehingga urutan ini aman. `trg_kunci_laporan` berjalan lebih dulu daripada `trg_tandai_sunting` pada event `UPDATE` karena alfabet — juga aman, sebab pemeriksaan kunci tidak bergantung pada hasil penandaan sunting.

---

## Yang tetap perlu dikonfirmasi Pak Tito, tidak menghambat pembangunan

- **A-15** — mekanisme persetujuan laporan dipakai final seperti tertulis di Celah 2. Kalau beliau menghendaki alur berbeda (misalnya Panit ikut menyetujui sebelum Kanit), yang berubah hanya `fn_kunci_laporan` dan satu baris pada matriks 2.3 — tidak menyentuh sembilan celah lainnya.
- **A-16** — kewajiban lapor harian tanpa pengecualian hari libur, sudah tertanam di `v_belum_lapor` (`p.wajib_lapor_harian = true` tanpa pengecualian kalender).

Berkas ini siap dipakai AI Agent untuk membangun Modul 6.3 sepenuhnya. Modul 6.4 (GPS Tracking) berikutnya akan mengisi bentuk akhir `sesi_tugas.sebab_penutupan` yang masih [KERANGKA].


---
---

# BAGIAN H — ADDENDUM 6.3-K KOREKSI & PENINGKATAN

# SiPANTAU — Addendum 6.3-K

**Koreksi Modul 6.3 dan Peningkatan Lintas Modul**

Tanggal: 2 Agustus 2026 · Status: [FINAL] · Pelengkap berkas Modul 6.3 dan Addendum 6.3-T

---

## Apa isi berkas ini

Dua hal yang sengaja disatukan dalam satu berkas agar tidak menambah dokumen yang harus dijaga, tetapi dipisah tegas karena jangkauannya berbeda.

**Bagian A — Koreksi Modul 6.3.** Enam temuan pada pemeriksaan berkas Modul 6.3. Satu di antaranya memblokir pembangunan karena bertabrakan dengan aturan global yang sudah berlaku.

**Bagian B — Peningkatan Lintas Modul.** Enam kemampuan yang menaikkan sistem ke tingkat yang wajar bagi perangkat lunak institusi. Seluruh aturannya masuk Section 7 sebagai BR bernomor, sehingga tetap ditemukan dari modul mana pun — bukan terkubur di berkas yang hanya dibuka saat mengerjakan Modul 6.3.

| | Pokok | Ditutup pada |
| --- | --- | --- |
| A-1 | Tabrakan dengan BR-37 tentang `security_invoker` | A.1 |
| A-2 | Laporan Kanit tidak dapat disetujui siapa pun | A.2 |
| A-3 | Tidak ada riwayat versi pada sistem yang tujuannya akuntabilitas | A.3 |
| A-4 | `rekap_laporan_tim` berpotensi membocorkan data lintas unit | A.4 |
| A-5 | PostGIS belum tercatat pada Section 4 | A.5 |
| A-6 | Rujukan BR-21 pada KP-6.3-49 perlu diverifikasi | A.6 |
| B-1 | Antrean Luring | B.1 |
| B-2 | Riwayat Versi (rancangan teknis penuh) | B.2 |
| B-3 | Ekspor Data Institusi | B.3 |
| B-4 | Pembatasan Laju | B.4 |
| B-5 | Pemantauan Kesehatan Sistem | B.5 |
| B-6 | Pencadangan Berkala | B.6 |

**Penomoran.** Aturan tertinggi yang sudah dipakai adalah BR-44. Berkas ini memakai BR-45 sampai BR-53, ditambah satu amandemen pada BR-37. Kriteria penerimaan Modul 6.3 tertinggi adalah KP-6.3-64; berkas ini memakai KP-6.3-65 dan seterusnya.

---
---

# BAGIAN A — KOREKSI MODUL 6.3

## A.1 Tabrakan dengan BR-37

### Duduk perkaranya

Modul 6.3 memakai `security_invoker = off` pada view `rekap_laporan_tim`. BR-37 dari Addendum 6.2-T berbunyi mutlak:

> Setiap tampilan basis data wajib dibuat dengan `security_invoker = on`, sehingga aturan akses baris tabel di baliknya tetap berlaku bagi pembacanya.

Menurut Section 0.3, Business Rules menang atas deskripsi modul. AI Agent yang patuh akan menolak membangun view itu, atau membangunnya dengan `on` sehingga fiturnya mati diam-diam — pelaksana tidak membaca apa pun karena aturan akses baris memblokirnya, dan tidak ada galat yang muncul.

Niat rancangan Modul 6.3 sendiri sah. Ia justru **ingin** melewati aturan akses baris, supaya tiga kolom sempit dapat dibuka kepada rekan setim yang tidak berhak membaca tabel induknya. Yang keliru bukan rancangannya, melainkan BR-37 yang ditulis tanpa memberi ruang bagi keadaan ini.

### Amandemen BR-37

Menggantikan bunyi lama secara utuh:

> **BR-37.** Setiap tampilan basis data dibuat dengan `security_invoker = on`. Pengecualian hanya diberikan kepada tampilan yang sengaja membuka sebagian kolom kepada peran yang tidak berhak membaca tabel induknya. Tampilan pengecualian wajib memenuhi tiga syarat sekaligus: menyaring dirinya sendiri memakai `auth.uid()` di dalam klausa `where`, membuka hanya kolom yang benar-benar diperlukan, dan terdaftar pada daftar tertutup di bawah. Penambahan di luar daftar wajib melalui revisi PRD yang tercatat.
>
> **Daftar tertutup tampilan pengecualian:** `rekap_laporan_tim`.

Bentuk ini mengikuti pola yang sudah dipakai Addendum 6.1-T untuk Fungsi Tepi: bukan melarang, bukan pula membuka lebar, melainkan membuka satu pintu bernama dengan syarat yang diperiksa.

---

## A.2 Laporan Kanit tidak dapat disetujui

### Duduk perkaranya

Tiga aturan yang masing-masing benar menghasilkan jalan buntu bila ditemukan bersamaan:

- BR-34 mengizinkan Kanit menjadi pelaksana dan mengirim laporan
- Matriks Modul 6.3 Bagian 8 menetapkan hanya Kanit yang dapat menyetujui laporan
- BR-31 melarang siapa pun meninjau laporannya sendiri

Akibatnya laporan yang dikirim Kanit tidak memiliki satu pun peran yang dapat menyetujuinya. Ini tidak fatal karena persetujuan memang tidak wajib dan laporan tetap sah menurut KP-6.3-37. Yang menjadi persoalan adalah akibat sampingannya: laporan Kanit tetap dapat disunting sampai SPT ditutup, sementara laporan bawahannya dapat dikunci lebih awal. Kebalikan dari yang semestinya.

### Ketetapan

Kewenangan Kasubdit dibuka, tetapi **dipersempit setajam mungkin**. Membukanya secara umum akan membuat Kasubdit dapat menyetujui laporan Anggota, melangkahi Kanit, dan mengaburkan garis komando yang dijaga sejak Modul 6.1.

> **BR-52.** Kasubdit dapat menyetujui sebuah laporan hanya bila pelapornya berperan Kanit. Laporan dari pelapor berperan lain tetap menjadi kewenangan Kanit unit pemilik. Larangan meninjau laporan sendiri tetap berlaku bagi Kasubdit.

### Perubahan matriks Section 2.3

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Menyetujui laporan | **Ya, hanya bila pelapornya Kanit** | Ya, unitnya, kecuali laporannya sendiri | Tidak | Tidak |

### Penegakan

```sql
create or replace function public.fn_periksa_wewenang_setuju()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  peran_pelapor text;
  peran_penyetuju text;
  unit_pelapor uuid;
begin
  if new.status_laporan is not distinct from old.status_laporan
     or new.status_laporan <> 'disetujui' then
    return new;
  end if;

  if new.disetujui_oleh = new.pelapor_id then
    raise exception 'TIDAK_BOLEH_SETUJUI_SENDIRI';
  end if;

  select u.peran into peran_pelapor
    from public.users u where u.id = new.pelapor_id;
  select u.peran into peran_penyetuju
    from public.users u where u.id = new.disetujui_oleh;

  if peran_penyetuju = 'kasubdit' then
    if peran_pelapor <> 'kanit' then
      raise exception 'KASUBDIT_HANYA_SETUJUI_LAPORAN_KANIT';
    end if;
    return new;
  end if;

  if peran_penyetuju = 'kanit' then
    select p.unit_id into unit_pelapor
      from public.penugasan p where p.id = new.penugasan_id;
    if unit_pelapor is distinct from (select sipantau_auth.unit_saya()) then
      raise exception 'BUKAN_UNIT_ANDA';
    end if;
    return new;
  end if;

  raise exception 'TIDAK_BERWENANG_MENYETUJUI';
end;
$$;

create trigger periksa_wewenang_setuju
  before update on public.laporan_harian
  for each row
  execute function public.fn_periksa_wewenang_setuju();
```

Perhatikan urutan pemeriksaannya. Larangan menyetujui laporan sendiri diperiksa **lebih dahulu** daripada peran, sehingga seorang Kanit yang mencoba menyetujui laporannya sendiri ditolak dengan alasan yang tepat, bukan dengan alasan kewenangan.

---

## A.3 Riwayat versi

### Duduk perkaranya

Keputusan Q18 menetapkan penyuntingan menimpa isi lama, menyisakan `disunting_pada` dan `jumlah_suntingan`. Untuk sistem yang alasan keberadaannya adalah mencegah penyalahgunaan wewenang, ini lubang yang mendasar.

Urutan kejadian yang mungkin: pelapor mengirim laporan, Panit membacanya, pelapor menulis ulang seluruh uraiannya, dan Panit tidak memiliki cara mengetahui apa yang berubah. Yang tersisa hanya angka penghitung.

Penawar yang ada sekarang adalah tombol Setujui milik Kanit yang mengunci laporan. Tetapi KP-6.3-37 menegaskan persetujuan tidak wajib, sehingga dalam praktiknya sebagian besar laporan akan tetap terbuka untuk disunting sampai SPT ditutup.

### Ketetapan

Riwayat versi dipasang, dan **berlaku dua arah**. Menyimpan riwayat laporan Anggota tanpa menyimpan riwayat catatan pimpinan akan berat sebelah, dan justru catatan pimpinan yang lebih menentukan nasib orang.

Versi lama **terbaca peninjau** langsung di halaman rincian, bukan disembunyikan di jejak audit. Peninjau adalah pihak yang paling membutuhkannya, dan menyembunyikannya di tempat yang hanya dibuka saat ada masalah membuat fiturnya nyaris tak berguna.

Rancangan teknis penuhnya ada pada B.2, karena mekanismenya sama dan dipakai lintas modul.

---

## A.4 `rekap_laporan_tim` wajib menyaring dirinya sendiri

### Duduk perkaranya

Dengan `security_invoker = off`, tampilan berjalan dengan hak pemiliknya dan aturan akses baris **sepenuhnya dilewati**. Bila tampilan tidak menyaring dirinya sendiri, setiap pengguna terautentikasi dapat membaca metadata seluruh laporan lintas unit: siapa melapor, kapan, pada SPT mana. Ini kebocoran terparah yang mungkin terjadi pada modul ini, dan penyebabnya cuma satu klausa yang lupa ditulis.

### Bentuk yang mengikat

```sql
create or replace view public.rekap_laporan_tim
with (security_invoker = off)
as
select l.penugasan_id,
       l.pelapor_id,
       l.dikirim_pada
  from public.laporan_harian l
 where l.status_laporan <> 'ditarik'
   -- Penyaringan diri. Tanpa baris ini seluruh isi tabel terbuka.
   and exists (
     select 1
       from public.penugasan_pelaksana pp
      where pp.penugasan_id = l.penugasan_id
        and pp.pelaksana_id = (select auth.uid())
        and pp.dicabut_pada is null
   );

revoke all on public.rekap_laporan_tim from public, anon;
grant select on public.rekap_laporan_tim to authenticated;
```

Tiga hal yang tidak boleh diubah: klausa `exists` yang menyaring berdasarkan keanggotaan pemanggil, ketiadaan kolom `uraian` dan `kendala` pada daftar `select`, dan pencabutan hak baca dari peran `anon`.

> **Butir uji U-6.3-13.** Masuk sebagai Anggota yang tidak terlibat pada SPT mana pun, lalu baca `rekap_laporan_tim`. Hasilnya wajib kosong. Bila muncul satu baris pun, penyaringan dirinya tidak bekerja dan tampilan itu harus dimatikan sampai diperbaiki.

---

## A.5 PostGIS pada Section 4

Modul 6.3 menjadikan PostGIS ketergantungan keras, tetapi Section 4.2 belum menyebutnya. Baris berikut ditambahkan:

| Lapisan | Teknologi | Alasan pemilihan |
| --- | --- | --- |
| Perhitungan jarak | Ekstensi PostGIS pada basis data | Menghitung jarak antara koordinat laporan dan Titik Lokasi SPT di sisi server. Dipilih ketimbang rumus jarak yang ditulis sendiri karena penanganan sistem koordinat dan kelengkungan buminya sudah teruji |

Pemasangannya, dijalankan sekali sebelum tabel `laporan_harian` dibuat:

```sql
create extension if not exists postgis;
```

Ditambahkan pula pada Section 10.3 sebagai catatan penyiapan: PostGIS wajib aktif sebelum Modul 6.3 dibangun, dan kegagalan mengaktifkannya akan membuat seluruh perhitungan status lokasi gagal, bukan sekadar tidak akurat.

---

## A.6 Rujukan BR-21 pada KP-6.3-49

KP-6.3-49 merujuk BR-21 untuk aturan bahwa Panit yang sudah dicabut penunjukannya tetap dapat membaca laporan tetapi tidak dapat memberi catatan baru.

Berkas Addendum 6.2-T Bagian 0.3 mencatat BR-21 sebagai milik Modul 6.1 dan tidak ikut digeser. Sementara itu aturan tentang akibat pencabutan tercatat sebagai BR-30 hasil penggeseran dari BR-27 lama.

Rujukan ini **tidak dapat diverifikasi tanpa membuka daftar Section 7 yang berlaku**, dan berkas ini tidak menebak. Yang ditetapkan adalah cara memutuskannya:

> Buka Section 7 pada PRD gabungan yang berlaku. Bila BR-21 berbunyi tentang hak baca Panit setelah pencabutan, rujukan KP-6.3-49 sudah benar dan tidak perlu diubah. Bila BR-21 berbunyi tentang hal lain, ganti rujukan KP-6.3-49 menjadi BR-30. Perbaikan ini wajib dilakukan sebelum Modul 6.3 dibangun.

Dicatat sebagai butir uji U-6.3-14.

---
---

# BAGIAN B — PENINGKATAN LINTAS MODUL

## B.1 Antrean Luring

### Mengapa ini yang paling bernilai

Objek penyelidikan Tipidter adalah tambang, kawasan hutan, gudang, dan pabrik. Tempat-tempat itu justru yang sinyalnya paling buruk. Rancangan sekarang menyimpan draf di perangkat, tetapi **mengirim** tetap menuntut sinyal. Anggota yang selesai bekerja di area mati sinyal harus menunggu, dan bila perangkatnya kehabisan daya lebih dulu, pekerjaan yang sudah dilakukan hilang tanpa jejak.

### Ketetapan

> **BR-45.** Laporan yang gagal terkirim karena jaringan masuk Antrean Luring pada perangkat pelapor dan terkirim otomatis begitu jaringan pulih. Seluruh penilaian yang menyangkut waktu — Kewajiban Lapor Harian, urutan tampilan, dan rekap harian — memakai `direkam_pada`, yaitu waktu perangkat saat pelapor menekan kirim, bukan waktu laporan tiba di server.

Butir terakhir itu yang menentukan keadilannya. Anggota yang menulis laporan pukul empat sore di tambang lalu baru mendapat sinyal pukul sebelas malam tidak boleh tercatat belum melapor pada hari itu.

> **BR-46.** Setiap kiriman laporan membawa penanda antrean unik yang dibuat aplikasi satu kali saat pelapor menekan kirim. Pengiriman ulang dengan penanda yang sama tidak menghasilkan baris kedua.

Ini menutup kegagalan yang paling mudah terjadi dan paling sulit disadari: jaringan putus setelah server menerima laporan tetapi sebelum aplikasi menerima jawabannya. Aplikasi menyimpulkan gagal dan mengirim ulang, lalu laporan yang sama masuk dua kali.

> **BR-47.** Laporan dari Antrean Luring tetap diterima meskipun SPT sudah ditutup atau pelapornya sudah dicabut dari SPT, selama `direkam_pada` berada dalam masa keduanya masih berlaku. Laporan semacam itu ditandai diterima terlambat. Menolaknya berarti menghukum orang atas keadaan yang di luar kendalinya.

> **BR-48.** Laporan yang mengendap di Antrean Luring lebih dari tujuh hari sejak `direkam_pada` tidak dikirim otomatis. Aplikasi memberi tahu pelapor dan menyediakan pilihan mengirim ulang secara sadar atau membuangnya.

### Perubahan tabel `laporan_harian`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `antrean_id` | uuid | **Unik.** Dibuat aplikasi. Penangkal kiriman kembar |
| `direkam_pada` | timestamptz | Waktu perangkat saat pelapor menekan kirim. Wajib. **Beku setelah INSERT** |
| `dikirim_pada` | timestamptz | Waktu server saat baris masuk. Sudah ada. **Beku** |
| `diterima_terlambat` | boolean | Dihitung pemicu. Benar bila selisih kedua waktu melebihi lima menit |
| `penanda_perangkat` | text | Perangkat yang **benar-benar mengirim**. Wajib Perangkat Terdaftar saat pengiriman |
| `penanda_perangkat_asal` | text | Perangkat tempat laporan **ditulis**. Boleh berbeda. Boleh kosong bila sama |

Pemisahan dua kolom perangkat terakhir yang membuat Antrean Luring dapat hidup berdampingan dengan aturan satu perangkat per akun dari Addendum 6.1-T. Bila pelapor berganti perangkat sebelum antreannya terkirim, laporan tetap dapat dikirim dari perangkat barunya yang sah, sementara perangkat tempat laporan itu ditulis tetap tercatat sebagai fakta. Bukan pelanggaran, bukan penolakan.

```sql
alter table public.laporan_harian
  add column antrean_id             uuid not null,
  add column direkam_pada           timestamptz not null,
  add column diterima_terlambat     boolean not null default false,
  add column penanda_perangkat_asal text;

create unique index uq_laporan_antrean_id
  on public.laporan_harian (antrean_id);
```

### Pemicu penilai keterlambatan dan penjaga kewajaran waktu

```sql
create or replace function public.fn_nilai_kiriman_tertunda()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  terbit timestamptz;
begin
  if new.direkam_pada > now() + interval '5 minutes' then
    raise exception 'WAKTU_PERANGKAT_DI_MASA_DEPAN';
  end if;

  if new.direkam_pada < now() - interval '7 days' then
    raise exception 'KIRIMAN_KEDALUWARSA';
  end if;

  select p.dibuat_pada into terbit
    from public.penugasan p where p.id = new.penugasan_id;
  if new.direkam_pada < terbit then
    raise exception 'WAKTU_MENDAHULUI_PENUGASAN';
  end if;

  new.diterima_terlambat :=
    (new.dikirim_pada - new.direkam_pada) > interval '5 minutes';

  return new;
end;
$$;

create trigger nilai_kiriman_tertunda
  before insert on public.laporan_harian
  for each row
  execute function public.fn_nilai_kiriman_tertunda();
```

Tiga pemeriksaan waktu di atas menutup pemalsuan yang paling gampang: memundurkan jam perangkat agar laporan terlihat dikirim pada hari kemarin. Batas tujuh hari sekaligus menegakkan BR-48 di sisi server, sehingga aplikasi yang bermasalah tetap tidak dapat menyusupkan laporan lama.

### Perubahan pemicu pemeriksa pelaksana aktif

Pemicu `trg_periksa_pelapor_aktif` dari Addendum 6.3-T menolak laporan bila SPT sudah tidak berstatus hidup atau pelapor sudah dicabut. Pemeriksaan itu kini dilakukan **terhadap keadaan pada saat `direkam_pada`**, bukan keadaan sekarang:

```sql
-- Pelaksana dianggap aktif bila belum dicabut, ATAU dicabut sesudah
-- laporan ditulis.
and (pp.dicabut_pada is null or pp.dicabut_pada > new.direkam_pada)

-- SPT dianggap hidup bila statusnya masih hidup, ATAU ditutup sesudah
-- laporan ditulis.
and (p.status in ('baru','berjalan','bermasalah')
     or p.ditutup_pada > new.direkam_pada)
```

Ini menuntut satu kolom baru pada tabel `penugasan`:

```sql
alter table public.penugasan
  add column ditutup_pada timestamptz;
```

Diisi pemicu saat status berpindah ke `selesai` atau `dibatalkan`. Tanpa kolom ini, sistem tidak memiliki cara mengetahui apakah SPT ditutup sebelum atau sesudah laporan ditulis, dan BR-47 tidak dapat ditegakkan.

### Perubahan tampilan `v_belum_lapor`

Satu penggantian, dan ini yang membuat seluruh BR-45 bermakna:

```sql
-- Salah:  where l.dikirim_pada::date = tanggal_diperiksa
-- Benar:
   where l.direkam_pada::date = tanggal_diperiksa
```

### Rancangan sisi aplikasi

| Perkara | Ketetapan |
| --- | --- |
| Tempat penyimpanan | IndexedDB pada perangkat. Bukan penyimpanan sederhana, karena foto disimpan sebagai berkas biner |
| Isi antrean | Seluruh isian laporan **beserta fotonya** |
| Batas antrean | Sepuluh laporan tertunda. Melewati itu, aplikasi memperingatkan bahwa penyimpanan perangkat mulai penuh dan menyarankan mencari sinyal |
| Pengiriman ulang | Otomatis saat jaringan pulih, berurutan menurut `direkam_pada`, satu per satu |
| Kegagalan berulang | Setelah lima percobaan gagal berturut-turut, laporan itu dilewati dan pelapor diberi tahu. Antrean tidak boleh macet karena satu laporan bermasalah |
| Penanda di layar | Lencana berisi jumlah laporan tertunda, terlihat di beranda pelaksana. Bukan disembunyikan |
| Umur tujuh hari | Aplikasi memeriksa saat dibuka; yang lewat batas dipindahkan ke daftar terpisah dengan dua pilihan, kirim ulang atau buang |

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-65 | Bila pengiriman gagal karena jaringan, maka laporan beserta fotonya masuk Antrean Luring dan pelapor menerima keterangan bahwa laporannya akan terkirim saat sinyal pulih |
| KP-6.3-66 | Bila jaringan pulih, maka antrean terkirim otomatis berurutan menurut `direkam_pada` tanpa tindakan pelapor |
| KP-6.3-67 | Bila laporan yang sama terkirim dua kali karena percobaan ulang, maka hanya satu baris yang tersimpan dan percobaan kedua ditolak dengan tenang tanpa pesan galat kepada pelapor |
| KP-6.3-68 | Bila laporan ditulis pukul empat sore dan tiba pukul sebelas malam pada hari yang sama, maka Kewajiban Lapor Harian hari itu terpenuhi |
| KP-6.3-69 | Bila laporan ditulis sebelum SPT ditutup tetapi tiba sesudahnya, maka laporan tetap diterima dan ditandai diterima terlambat |
| KP-6.3-70 | Bila pelapor berganti perangkat sebelum antreannya terkirim, maka laporan tetap dapat dikirim dari perangkat barunya, dan perangkat asalnya tercatat pada kolom terpisah |
| KP-6.3-71 | Bila laporan mengendap lebih dari tujuh hari, maka ia tidak terkirim otomatis dan pelapor diberi dua pilihan, kirim ulang atau buang |
| KP-6.3-72 | Bila jam perangkat dimundurkan sehingga `direkam_pada` mendahului penerbitan SPT, maka penyisipan ditolak |
| KP-6.3-73 | Bila jumlah laporan tertunda mencapai sepuluh, maka aplikasi memperingatkan dan menyarankan mencari sinyal, tetapi **tidak** menghalangi pembuatan laporan berikutnya |
| KP-6.3-74 | Bila satu laporan gagal terkirim lima kali berturut-turut, maka laporan itu dilewati dan laporan berikutnya tetap diproses |

---

## B.2 Riwayat Versi

### Ketetapan

> **BR-49.** Setiap penyuntingan isi laporan maupun catatan peninjau menyimpan salinan nilai lama beserta waktu dan pelakunya. Salinan versi tidak pernah dihapus dan terbaca oleh setiap peran yang berhak membaca laporan induknya. Yang disimpan hanya kolom yang memang berupa tulisan manusia; kolom fakta tidak pernah berubah sehingga tidak memerlukan versi.

### Tabel `laporan_versi`

```sql
create table public.laporan_versi (
  id              uuid primary key default gen_random_uuid(),
  laporan_id      uuid not null references public.laporan_harian(id) on delete cascade,
  versi           integer not null,
  uraian          text,
  kendala         text,
  status_kegiatan text,
  disunting_oleh  uuid not null references public.users(id),
  disimpan_pada   timestamptz not null default now(),
  unique (laporan_id, versi)
);

create index idx_laporan_versi_laporan
  on public.laporan_versi (laporan_id, versi desc);
```

### Tabel `catatan_versi`

```sql
create table public.catatan_versi (
  id             uuid primary key default gen_random_uuid(),
  catatan_id     uuid not null references public.catatan_laporan(id) on delete cascade,
  versi          integer not null,
  isi            text not null,
  disunting_oleh uuid not null references public.users(id),
  disimpan_pada  timestamptz not null default now(),
  unique (catatan_id, versi)
);
```

### Pemicu perekam versi

Menyimpan nilai **lama**, bukan yang baru. Versi nomor satu adalah isi asli saat laporan pertama dikirim.

```sql
create or replace function public.fn_rekam_versi_laporan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.uraian          is not distinct from old.uraian
 and new.kendala         is not distinct from old.kendala
 and new.status_kegiatan is not distinct from old.status_kegiatan then
    return new;
  end if;

  insert into public.laporan_versi
    (laporan_id, versi, uraian, kendala, status_kegiatan, disunting_oleh)
  values
    (old.id, coalesce(old.jumlah_suntingan, 0) + 1,
     old.uraian, old.kendala, old.status_kegiatan,
     (select auth.uid()));

  return new;
end;
$$;

create trigger rekam_versi_laporan
  before update on public.laporan_harian
  for each row
  execute function public.fn_rekam_versi_laporan();
```

Pemicu ini dipasang **sebelum** `trg_tandai_sunting` dari Addendum 6.3-T, karena ia membaca `old.jumlah_suntingan` yang belum dinaikkan. Urutan pemicu di PostgreSQL mengikuti abjad nama pemicunya, sehingga penamaan `rekam_versi_laporan` dan `tandai_sunting` sudah menghasilkan urutan yang benar. **Jangan mengganti nama keduanya tanpa memeriksa ulang urutannya.**

Bentuk yang sama diterapkan pada `catatan_laporan` dengan nama `rekam_versi_catatan`.

### Aturan akses

```sql
alter table public.laporan_versi enable row level security;

create policy baca_versi_mengikuti_induk on public.laporan_versi
for select to authenticated
using (
  exists (
    select 1 from public.laporan_harian l
     where l.id = laporan_versi.laporan_id
       -- Menumpang kebijakan baca laporan induk yang sudah berlaku.
  )
);

revoke insert, update, delete on public.laporan_versi from authenticated;
```

Pencabutan hak tulis dari peran aplikasi adalah bagian yang menentukan. Baris versi hanya boleh lahir dari pemicu yang berjalan dengan hak pembuatnya. Tidak seorang pun, termasuk Akun Pemeliharaan lewat jalur biasa, dapat menyisipkan atau mengubah riwayat versi.

### Tampilan

Pada halaman rincian laporan, di bawah uraian, muncul baris keterangan bila laporan pernah disunting: sebuah tautan bertuliskan jumlah suntingan yang bila dibuka menampilkan daftar versi berurutan dari yang terbaru. Tiap versi menampilkan waktu, penyuntingnya, dan isinya. Tidak ada pembandingan otomatis antar versi — menampilkan dua teks berdampingan sudah cukup dan jauh lebih sederhana daripada membangun penanda perbedaan kata per kata.

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.3-75 | Bila pelapor menyunting uraian, kendala, atau status kegiatan, maka nilai lamanya tersimpan sebagai satu baris versi beserta waktu dan penyuntingnya |
| KP-6.3-76 | Bila penyuntingan tidak mengubah satu pun dari ketiga kolom itu, maka tidak ada baris versi yang lahir |
| KP-6.3-77 | Bila peninjau membuka laporan yang pernah disunting, maka ia dapat membaca seluruh versi sebelumnya langsung dari halaman rincian |
| KP-6.3-78 | Bila peninjau menyunting catatannya sendiri, maka isi lamanya tersimpan sebagai versi dengan cara yang sama |
| KP-6.3-79 | Bila siapa pun mencoba menyisipkan, mengubah, atau menghapus baris versi lewat jalur biasa, maka tindakan ditolak |
| KP-6.3-80 | Bila laporan dihapus permanen bersama SPT-nya sesuai BR-32, maka baris versinya ikut terhapus |

---

## B.3 Ekspor Data Institusi

### Mengapa ini perlu ada

Seluruh data sistem berada pada layanan pihak ketiga. Bila proyek berhenti, kontrak pengembangan selesai, atau layanan bermasalah, institusi tidak memiliki cara mengambil datanya sendiri. Perangkat lunak institusi selalu menyediakan jalan keluar, dan ketiadaannya adalah bentuk ketergantungan yang tidak semestinya.

### Ketetapan

> **BR-50.** Kasubdit dapat mengekspor data seluruh unit dan Kanit dapat mengekspor data unitnya sendiri. Berkas ekspor memuat data teks lengkap beserta daftar tautan berkas foto, bukan berkas fotonya sendiri. Setiap pengeksporan tercatat pada jejak audit beserta pelaku, waktu, dan lingkupnya.

Tiga keputusan di dalamnya, masing-masing dengan alasannya.

**Kanit ikut diberi wewenang.** Bila hanya Kasubdit yang dapat mengekspor, seluruh jalan keluar data bergantung pada satu orang. Itu justru bentuk kerapuhan yang hendak dihindari fitur ini.

**Foto tidak ikut.** Satu unit dengan ratusan foto berukuran ratusan megabita, dan penyusunannya hampir pasti terputus di tengah jalan pada batas waktu yang tersedia. Yang diekspor adalah tautan; foto diunduh terpisah bila memang diperlukan.

**Setiap ekspor tercatat.** Berkas hasil ekspor memuat identitas terlapor dan uraian dugaan tindak pidana, lalu mengambang sebagai berkas biasa di komputer siapa pun yang mengunduhnya. Ini bersinggungan langsung dengan butir A-02 yang masih terbuka. Pencatatan tidak mencegah penyalahgunaan, tetapi membuatnya dapat ditelusuri.

### Jalur teknis

Ekspor memerlukan pembacaan lintas tabel dalam jumlah besar dan penyusunan berkas, sehingga tidak dapat dijalankan sebagai kueri biasa dari aplikasi. Ia menjadi **Fungsi Tepi keempat**.

Addendum 6.1-T menetapkan daftar Fungsi Tepi bersifat tertutup dan penambahan di luar daftar wajib melalui revisi PRD yang tercatat. Berkas ini adalah revisi tersebut.

> **Amandemen daftar Fungsi Tepi.** Ditambahkan operasi keempat: `ekspor-unit`. Sebagaimana ketiga operasi sebelumnya, ia wajib memeriksa sendiri kewenangan pemanggilnya dari basis data dan tidak boleh mempercayai isi permintaan.

Alur kerjanya: fungsi memeriksa kewenangan, memeriksa pembatasan laju, membaca data dalam lingkup yang diizinkan, menyusun berkas JSON, mengunggahnya ke wadah penyimpanan tertutup, mencatat jejak audit, lalu mengembalikan tautan bermasa berlaku satu jam. Tautan yang kedaluwarsa tidak dapat dipakai kembali, dan berkasnya dihapus pekerjaan berjadwal setelah dua puluh empat jam.

### Isi berkas ekspor

| Bagian | Isi |
| --- | --- |
| `meta` | Waktu ekspor, pelaku, lingkup unit, versi sistem |
| `unit` | Data unit beserta kode klasifikasinya |
| `pengguna` | Nama, NRP, pangkat, peran, unit, status aktif. **Tanpa kata sandi dalam bentuk apa pun** |
| `penugasan` | Seluruh SPT beserta dasar, titik lokasi, pelaksana, dan Panit |
| `laporan` | Seluruh laporan beserta status lokasi dan catatan peninjau |
| `laporan_versi` | Seluruh riwayat versi |
| `lhp` | Seluruh LHP beserta bagian dinamisnya |
| `foto` | Keterangan, koordinat, waktu, dan **tautan** tiap foto |
| `jejak_audit` | Seluruh baris dalam lingkup |
| `rute` | Titik koordinat yang belum disusutkan, per SPT |

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.10-01 | Bila Kasubdit meminta ekspor, maka berkas memuat seluruh unit |
| KP-6.10-02 | Bila Kanit meminta ekspor, maka berkas memuat unitnya sendiri saja |
| KP-6.10-03 | Bila Panit atau Anggota memanggil fungsi ekspor secara langsung, maka permintaan ditolak |
| KP-6.10-04 | Bila ekspor berhasil, maka satu baris jejak audit tercatat berisi pelaku, waktu, dan lingkupnya |
| KP-6.10-05 | Bila berkas ekspor selesai, maka tautannya berlaku satu jam dan berkasnya terhapus setelah dua puluh empat jam |
| KP-6.10-06 | Bila berkas ekspor dibuka, maka tidak ada kata sandi maupun turunannya di dalamnya |
| KP-6.10-07 | Bila seorang pengguna sudah mengekspor tiga kali dalam satu hari, maka permintaan keempat ditolak dengan keterangan batas harian |

---

## B.4 Pembatasan Laju

### Ketetapan

> **BR-51.** Operasi sensitif dibatasi jumlah pemanggilannya per satuan waktu, ditegakkan di dalam basis data dan bukan di aplikasi. Daftar operasi bersifat tertutup; penambahan wajib melalui revisi PRD yang tercatat.

### Daftar tertutup

| Operasi | Batas | Jendela | Alasan |
| --- | --- | --- | --- |
| `reset_kata_sandi` | 10 | 1 jam | Akun Kanit yang diretas dapat mengunci-ulang banyak akun di unitnya |
| `ekspor_data` | 3 | 1 hari | Berkas ekspor memuat data perkara dan berat disusun |
| `hapus_spt_permanen` | 5 | 1 hari | Tindakan yang tidak dapat dibatalkan |
| `masuk_gagal` | 5 | 15 menit | Penebakan kata sandi secara berulang |

### Tabel dan fungsi

```sql
create table public.pembatasan_laju (
  kunci_pelaku  text not null,
  operasi       text not null,
  jendela_mulai timestamptz not null,
  hitungan      integer not null default 0,
  primary key (kunci_pelaku, operasi, jendela_mulai)
);

create or replace function public.periksa_batas_laju(
  p_kunci    text,
  p_operasi  text,
  p_batas    integer,
  p_jendela  interval
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  mulai timestamptz := date_trunc('minute', now())
                     - (extract(epoch from now())::bigint
                        % extract(epoch from p_jendela)::bigint) * interval '1 second';
  kini integer;
begin
  insert into public.pembatasan_laju (kunci_pelaku, operasi, jendela_mulai, hitungan)
  values (p_kunci, p_operasi, mulai, 1)
  on conflict (kunci_pelaku, operasi, jendela_mulai)
  do update set hitungan = public.pembatasan_laju.hitungan + 1
  returning hitungan into kini;

  if kini > p_batas then
    raise exception 'BATAS_LAJU_TERLAMPAUI: % (% per %)', p_operasi, p_batas, p_jendela;
  end if;
end;
$$;
```

Penyisipan dan penaikan hitungan berlangsung dalam **satu pernyataan**. Ini yang membuat dua pemanggilan bersamaan tidak dapat sama-sama lolos — yang kedua melihat hitungan yang sudah naik, bukan hitungan lama.

Kolom `kunci_pelaku` bertipe teks, bukan uuid, karena `masuk_gagal` terjadi sebelum pengguna dikenali. Untuk operasi itu kuncinya adalah NRP yang dicoba, sedangkan untuk tiga operasi lain kuncinya adalah identitas pengguna.

Baris lama dibersihkan pekerjaan berjadwal harian, menghapus yang jendelanya lebih tua dari tujuh hari.

### Kriteria penerimaan

| Kode | Kriteria |
| --- | --- |
| KP-6.10-08 | Bila sebuah operasi sensitif dipanggil melebihi batasnya dalam satu jendela, maka pemanggilan berikutnya ditolak dengan keterangan berapa batasnya dan kapan dapat dicoba lagi |
| KP-6.10-09 | Bila dua pemanggilan tiba pada saat hampir bersamaan tepat di ambang batas, maka tepat satu yang lolos |
| KP-6.10-10 | Bila jendela berganti, maka hitungan dimulai dari nol tanpa tindakan apa pun |
| KP-6.10-11 | Bila percobaan masuk gagal lima kali dalam lima belas menit untuk satu NRP, maka percobaan berikutnya ditolak sementara, dan keterangannya tidak mengungkapkan apakah NRP itu terdaftar |

Butir terakhir penting dan mudah terlewat: pesan penolakan tidak boleh membedakan antara NRP yang salah dan kata sandi yang salah, karena perbedaan itu sendiri sudah memberi tahu penyerang mana NRP yang terdaftar.

---

## B.5 Pemantauan Kesehatan Sistem

### Ketetapan

> **BR-53.** Keadaan kesehatan sistem disajikan sebagai keterangan datar berisi angka dan waktu, tanpa kalimat yang menyimpulkan bahwa sistem sedang bermasalah. Prinsip 0.6 berlaku terhadap sistem sebagaimana ia berlaku terhadap orang.

Alasannya bukan sekadar kesamaan bentuk. Penanda yang berteriak merah setiap kali ada satu pekerjaan tertunda akan diabaikan dalam sepekan, dan penanda yang diabaikan sama saja dengan tidak ada.

### Tampilan

```sql
create or replace view public.kesehatan_sistem
with (security_invoker = on)
as
select
  (select max(end_time) from cron.job_run_details
    where status = 'succeeded')                      as pekerjaan_berhasil_terakhir,
  (select count(*) from cron.job_run_details
    where status = 'failed'
      and start_time > now() - interval '7 days')    as pekerjaan_gagal_sepekan,
  (select count(*) from public.laporan_harian
    where diterima_terlambat
      and dikirim_pada > now() - interval '7 days')  as laporan_terlambat_sepekan,
  (select count(*) from public.location_logs
    where diterima_pada > now() - interval '1 day')  as titik_rute_sehari,
  (select max(dibuat_pada) from public.jejak_audit
    where jenis = 'ekspor_data')                     as ekspor_terakhir,
  (select count(*) from public.laporan_harian
    where status_laporan = 'terkirim'
      and dikirim_pada < now() - interval '7 days')  as laporan_belum_ditinjau_lebih_sepekan;
```

Ditampilkan pada dashboard Kasubdit sebagai kartu keterangan, bukan sebagai peringatan. Kanit tidak memerlukannya.

---

## B.6 Pencadangan Berkala

### Ketetapan

Layanan basis data terkelola menyediakan pencadangan otomatis, tetapi masa simpannya pada paket dasar terbatas dan tidak berada di bawah kendali institusi. Karena itu ditetapkan satu tata cara yang sederhana dan tidak menuntut infrastruktur tambahan:

| Perkara | Ketetapan |
| --- | --- |
| Cara | Memakai fitur Ekspor Data pada B.3 |
| Kekerapan | Sekurang-kurangnya satu kali setiap bulan |
| Pelaku | Kasubdit atau pemegang Akun Pemeliharaan |
| Tempat simpan | Penyimpanan luring milik institusi, bukan komputer perorangan |
| Bukti | Baris jejak audit dari pengeksporan itu sendiri sudah menjadi buktinya |

Fitur ekspor karena itu memiliki dua kegunaan sekaligus: jalan keluar bila sistem ditinggalkan, dan pencadangan berkala selama sistem berjalan. Tidak diperlukan mekanisme kedua.

Ditambahkan pada Section 10 sebagai butir 10.7, dan dicatat pada Section 11.5 sebagai bagian dari tata cara pemeliharaan.

---
---

# Bagian C — Ringkasan Perubahan

## C.1 Business Rules baru

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-45 | Antrean Luring; seluruh penilaian waktu memakai `direkam_pada` | 6.3, 6.5 |
| BR-46 | Penanda antrean unik; pengiriman ulang tidak menghasilkan baris kedua | 6.3 |
| BR-47 | Laporan tertunda tetap diterima meski SPT sudah ditutup, ditandai diterima terlambat | 6.3 |
| BR-48 | Laporan yang mengendap lebih dari tujuh hari tidak terkirim otomatis | 6.3 |
| BR-49 | Riwayat versi laporan dan catatan; terbaca peninjau; tidak dapat ditulis siapa pun | 6.3, 6.8 |
| BR-50 | Ekspor data oleh Kasubdit dan Kanit; tanpa berkas foto; tercatat jejak audit | 6.10 |
| BR-51 | Pembatasan laju pada daftar tertutup operasi sensitif | Seluruh modul |
| BR-52 | Kasubdit menyetujui laporan hanya bila pelapornya berperan Kanit | 6.3 |
| BR-53 | Kesehatan sistem disajikan sebagai keterangan datar | 6.5 |

**Amandemen:** BR-37 memperoleh pengecualian bersyarat dengan daftar tertutup.

## C.2 Perubahan model data

| Tabel | Perubahan |
| --- | --- |
| `laporan_harian` | Empat kolom baru: `antrean_id` (unik), `direkam_pada`, `diterima_terlambat`, `penanda_perangkat_asal` |
| `penugasan` | Satu kolom baru: `ditutup_pada` |
| `laporan_versi` | Tabel baru |
| `catatan_versi` | Tabel baru |
| `pembatasan_laju` | Tabel baru |
| `rekap_laporan_tim` | Ditulis ulang dengan penyaringan diri |
| `v_belum_lapor` | `dikirim_pada` diganti `direkam_pada` |
| `kesehatan_sistem` | Tampilan baru |

## C.3 Daftar tempel ke PRD

| Urutan | Tujuan | Isi |
| --- | --- | --- |
| 1 | Section 7 | Amandemen BR-37, lalu BR-45 sampai BR-53 |
| 2 | Section 2.3 | Baris Menyetujui laporan pada A.2 |
| 3 | Section 4.2 | Baris PostGIS pada A.5 |
| 4 | Section 4.5 | Penambahan Fungsi Tepi keempat `ekspor-unit` pada B.3 |
| 5 | Section 5 | Seluruh perubahan model data pada C.2 |
| 6 | Section 6.3 | KP-6.3-65 sampai KP-6.3-80; perbaikan rujukan KP-6.3-49 |
| 7 | Section 6.10 (baru) | B.3 dan B.4 beserta KP-6.10-01 sampai KP-6.10-11 |
| 8 | Section 9.7 (baru) | Pembatasan Laju pada B.4 |
| 9 | Section 10.7 (baru) | Pencadangan Berkala pada B.6 |
| 10 | Section 11.5 | Tata cara pencadangan bulanan |

## C.4 Urutan pengerjaan

Mengikat, karena tiap langkah bersandar pada yang sebelumnya.

| No | Langkah |
| --- | --- |
| 1 | Pasang ekstensi PostGIS sebelum tabel `laporan_harian` dibuat |
| 2 | Bangun `laporan_harian` sudah lengkap dengan empat kolom antrean sejak awal |
| 3 | Tambahkan kolom `ditutup_pada` pada `penugasan` beserta pemicu pengisinya |
| 4 | Pasang seluruh pemicu Addendum 6.3-T, lalu pemicu berkas ini |
| 5 | Periksa urutan abjad pemicu `rekam_versi_laporan` dan `tandai_sunting` |
| 6 | Bangun `laporan_versi` dan `catatan_versi` beserta pencabutan hak tulisnya |
| 7 | Bangun `rekap_laporan_tim` dengan penyaringan diri, lalu jalankan U-6.3-13 |
| 8 | Bangun `pembatasan_laju`, pasang pemanggilannya pada seluruh Fungsi Tepi |
| 9 | Bangun Fungsi Tepi `ekspor-unit` |
| 10 | Bangun Antrean Luring pada sisi aplikasi |
| 11 | Bangun tampilan kesehatan sistem pada dashboard Kasubdit |

## C.5 Butir uji

| Kode | Butir uji |
| --- | --- |
| U-6.3-13 | Baca `rekap_laporan_tim` sebagai Anggota yang tidak terlibat SPT mana pun; hasilnya wajib kosong |
| U-6.3-14 | Periksa bunyi BR-21 pada Section 7 yang berlaku; perbaiki rujukan KP-6.3-49 bila perlu |
| U-6.3-15 | Matikan jaringan, kirim laporan berisi tiga foto, nyalakan jaringan; laporan tiba lengkap |
| U-6.3-16 | Matikan jaringan saat pengiriman sedang berjalan, ulangi pengiriman; hanya satu baris tersimpan |
| U-6.3-17 | Ubah jam perangkat mundur dua hari, kirim laporan; ditolak bila mendahului penerbitan SPT |
| U-6.3-18 | Tulis laporan, tutup SPT-nya, baru sambungkan jaringan; laporan diterima dan ditandai terlambat |
| U-6.3-19 | Sunting laporan tiga kali, buka sebagai Panit; ketiga versi lama terbaca |
| U-6.3-20 | Coba sisipkan baris ke `laporan_versi` sebagai Kasubdit; ditolak |
| U-6.3-21 | Setujui laporan Kanit sebagai Kasubdit; berhasil. Setujui laporan Anggota sebagai Kasubdit; ditolak |
| U-6.3-22 | Panggil ekspor empat kali dalam sehari; panggilan keempat ditolak |
| U-6.3-23 | Salah kata sandi enam kali untuk satu NRP; percobaan keenam ditolak tanpa mengungkap keterdaftaran NRP |
| U-6.3-24 | Buka berkas ekspor, cari kolom kata sandi; tidak ada |

---

## Penutup

Enam temuan pada Modul 6.3 tertutup. Satu di antaranya, tabrakan dengan BR-37, akan memblokir pembangunan bila tidak diperbaiki lebih dulu; satu lagi, rujukan BR-21, sengaja tidak ditebak melainkan diberi cara memutuskannya.

Enam kemampuan lintas modul ditambahkan. Yang paling menentukan adalah Antrean Luring, bukan karena paling rumit, melainkan karena paling sesuai dengan tempat sistem ini akan dipakai. Objek penyelidikan yang menjadi sasaran unit ini justru berada di tempat yang sinyalnya paling buruk, dan sistem yang menuntut sinyal untuk menerima laporan akan gagal tepat pada saat ia paling dibutuhkan.

Dua hal yang baru terlihat saat merancang dan tidak ada pada pembicaraan awal ikut ditutup: laporan kembar akibat pengiriman ulang, dan tabrakan antara Antrean Luring dengan aturan satu perangkat per akun. Keduanya diselesaikan dengan menambah kolom, bukan dengan melonggarkan aturan yang sudah berlaku.

Satu perkara sengaja dibiarkan terbuka. Butir A-02 tentang penyimpanan data perkara pada layanan pihak ketiga kini bertambah bobotnya, karena fitur ekspor menghasilkan berkas berisi identitas terlapor yang dapat berpindah ke mana saja. Pencatatan jejak audit pada setiap pengeksporan tidak menyelesaikan perkara itu, hanya membuatnya dapat ditelusuri. Jawaban sesungguhnya tetap harus datang dari pemilik produk.


---
---

# BAGIAN K — MODUL 6.4 GPS TRACKING & PETA WAKTU NYATA

# SiPANTAU — Section 6.4 UTUH: GPS Tracking & Peta Waktu Nyata

**Status: [FINAL] · Disusun 2 Agustus 2026 · Berkas tunggal, tanpa lapisan**

Berkas ini adalah Modul 6.4 dalam bentuk utuh. Berkas Revisi Modul 6.4 dan Addendum 6.4-K sudah
**dilebur ke dalamnya** dan keduanya tidak lagi berlaku sebagai berkas terpisah. Tidak ada lapisan
koreksi di dalam berkas ini; setiap ketetapan berdiri di tempatnya sendiri dalam bentuk terakhir
yang berlaku.

Ia menggantikan Section 6.4 pada PRD dasar secara utuh, memfinalkan tabel `sesi_tugas` yang lahir
berstatus [KERANGKA] di Modul 6.2, dan memfinalkan `location_logs` yang sejak versi 0.2 belum
pernah disentuh.

---

## Cara memakai berkas ini

Untuk sesi coding, lampirkan Section 0 sampai 5 dari PRD sebagai konteks tetap, lalu berkas ini
sebagai modul yang sedang dikerjakan, sesuai Section 0.7.

**Bagian 0 wajib dikerjakan lebih dahulu.** Isinya enam belas temuan pra dan pasca penggalian,
tujuh di antaranya memblokir dan lima berupa kegagalan senyap. Tiga di antaranya menyentuh Modul
6.1, 6.2, dan 6.3 yang sudah dinyatakan selesai, sehingga tidak dapat ditunda sampai giliran Modul
6.4 tiba.

**Revisi masa coding.** Bila kelak ditemukan kekeliruan, yang direvisi adalah berkas ini di
tempatnya, bukan lapisan baru di belakangnya. Jejaknya dicatat pada Riwayat Koreksi di bagian
akhir. Kode BR dan KP tidak pernah dipakai ulang, sekalipun aturannya dicabut.

## Penomoran yang berlaku

| Hal | Rentang |
| --- | --- |
| Aturan global yang lahir di modul ini | BR-54 sampai BR-67 |
| Amandemen atas aturan yang sudah ada | BR-51, BR-59, BR-62 |
| **Aturan berikutnya dimulai dari** | **BR-68** |
| Kriteria penerimaan | KP-6.4-01 sampai KP-6.4-72 |
| Butir uji | U-6.4-01 sampai U-6.4-11 |
| Tabel baru | 5.21 `posisi_terkini`, 5.22 `titik_penanda` |
| Calon Addendum 6.4-T | 22 butir |

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.6 | 2 Agu 2026 | Modul 6.4 digali penuh. `sesi_tugas` dan `location_logs` difinalkan. `posisi_terkini` dan `titik_penanda` lahir. Enam belas temuan ditutup. Addendum 6.4-K dilebur, tidak lagi berdiri sendiri |

---
---

# Bagian 0 — Temuan yang wajib dikerjakan lebih dahulu

## P-01 Kebijakan akses baris menyebut kolom yang sudah tidak ada — MEMBLOKIR

### Duduk perkaranya

Addendum 6.1-T memuat tiga kebijakan akses baris yang menyebut `laporan_harian.anggota_id`:
satu kebijakan baca pada Bagian 1.3, dan dua kebijakan tulis pada Bagian 3.4.

Kolom itu sudah tidak ada. Modul 6.2 Section 5.18 menggantinya menjadi `pelapor_id`, dan Modul
6.3 Section 5.4 mencabutnya secara eksplisit dengan alasan yang tertulis: pelapor kini dapat
berperan Anggota, Panit, maupun Kanit.

Kegagalannya berisik — kebijakan ditolak saat dibuat. Yang berbahaya justru penyelesaian
tergesanya, dan bentuknya persis seperti T-13: melakukan cari-ganti buta `anggota_id` menjadi
`pelapor_id` akan **ikut mengubah `location_logs.anggota_id`**, padahal kolom itu perlu keputusan
makna, bukan penggantian nama. Lihat P-02.

### Ketetapan

Pada Addendum 6.1-T Bagian 1.3 dan Bagian 3.4, seluruh rujukan `laporan_harian.anggota_id`
diganti menjadi `pelapor_id`. Rujukan `location_logs.anggota_id` **tidak** ikut diganti menjadi
`pelapor_id`; ia diganti menjadi `pengguna_id` menurut P-02, dengan alasan yang berbeda.

```sql
create policy "laporan_baca_sesuai_lingkup"
on public.laporan_harian
for select
to authenticated
using (
  pelapor_id = (select auth.uid())
  or ...
);
```

> **Butir uji U-6.4-01.** Pasang ketiga kebijakan Addendum 6.1-T apa adanya pada basis data
> kosong yang sudah memuat tabel `laporan_harian` bentuk final. Ketiganya wajib gagal. Bila ada
> yang berhasil, berarti tabelnya dibangun dengan kolom lama dan Modul 6.3 belum diterapkan benar.

## P-02 `location_logs.anggota_id` bernama keliru — MEMBLOKIR SENYAP

### Duduk perkaranya

Sejak BR-31, Kanit dan Panit yang dicantumkan sebagai pelaksana memperoleh kewenangan membuka
Sesi Tugas. Pemilik titik koordinat karena itu dapat berperan anggota, panit, maupun kanit.
Kolom `anggota_id` menyatakan hal yang tidak benar, dan kebijakan tulisnya ikut berbunyi
`anggota_id = (select auth.uid())`.

Sistem tetap berjalan dengan nama yang keliru — itulah kesenyapannya. Yang rusak adalah
keseragaman istilah: `sesi_tugas.pengguna_id`, `laporan_harian.pelapor_id`, dan
`location_logs.anggota_id` adalah tiga nama untuk satu maksud yang sama. Section 0.2 melarangnya
dengan alasan yang tepat: sinonim berisiko dibaca sebagai entitas berbeda.

### Ketetapan

Nama yang berlaku adalah **`pengguna_id`**, mengikuti `sesi_tugas`, bukan `pelapor_id`. Alasannya
tegas: `pelapor_id` membawa makna pelaporan, sedangkan titik koordinat bukan laporan. Yang
disimpan adalah keberadaan seseorang, dan `sesi_tugas` sudah lebih dahulu memakai istilah yang
netral untuk maksud itu.

## P-03 `location_logs` tidak dapat memisahkan sesi — MEMBLOKIR SENYAP

### Duduk perkaranya

Section 5.17 menuliskan alasan tabel `sesi_tugas` dilahirkan: satu SPT berlangsung berhari-hari
dan orang yang sama membuka lalu menutup sesi berkali-kali. Tetapi `location_logs` hanya memiliki
`penugasan_id`.

Akibatnya rute hari pertama dan rute hari ketiga menyatu menjadi satu garis yang melompat
semalaman melintasi kota. Penelusuran rute per sesi mustahil, ringkasan per sesi tidak dapat
dihitung, dan penyusutan data kehilangan pegangan yang paling wajar.

### Ketetapan

Kolom **`sesi_tugas_id` ditambahkan dan bersifat wajib**. Kolom `penugasan_id` **tetap
dipertahankan** meski kini dapat diturunkan darinya, karena dua alasan: BR-13 berbunyi harfiah
bahwa setiap titik wajib terikat pada satu SPT, dan indeks `(penugasan_id, direkam_pada)`
dibutuhkan untuk menggambar rute gabungan satu SPT tanpa menyusuri tabel sesi lebih dahulu.

Keduanya wajib konsisten, dan konsistensinya ditegakkan pemicu, bukan diandaikan. Lihat
Bagian 3 Section 5.7.

## P-04 Sesi menggantung mengunci pemiliknya bila penjadwal berhenti — MEMBLOKIR

### Duduk perkaranya

Tiga ketetapan yang masing-masing benar, bertemu menjadi jebakan:

1. Sesi menggantung ditutup otomatis setelah dua jam tanpa pembaruan posisi, dikerjakan pg_cron
2. Indeks unik parsial `sesi_tugas(pengguna_id) WHERE ditutup_pada IS NULL` sudah final
3. BR-36 melarang kebenaran sistem bergantung pada berjalannya penjadwal

Addendum 6.2-T Bagian 1.6 sudah memperingatkan bahwa penjadwal **benar-benar berhenti** pada
project paket gratis yang dijeda tujuh hari, dan berhentinya tidak menimbulkan galat apa pun.

Bila itu terjadi, sesi menggantung tidak pernah tertutup. Indeks unik lalu menolak setiap upaya
orang itu membuka sesi baru, dengan galat `23505` yang oleh aplikasi diterjemahkan menjadi
"Anda masih dalam Sesi Tugas untuk SPT sekian". Anggota yang kehabisan daya hari Jumat tidak
dapat Mulai Tugas hari Senin, dan tidak ada satu pun keterangan yang menjelaskan sebabnya.

Kemampuan seseorang memulai tugas dengan demikian bergantung pada berjalannya penjadwal. Itu
tepat yang dilarang BR-36.

### Ketetapan

Penutupan sesi menggantung **tidak boleh menjadi tugas penjadwal semata**. Fungsi pembukaan Sesi
Tugas menutup sendiri sesi basi milik pemanggilnya sebelum menyisipkan, di dalam kunci baris yang
sudah diwajibkan Addendum 6.2-T Bagian 8.3.

Penjadwal turun pangkat menjadi kurir pemberitahuan dan perapi data, persis seperti perlakuan
terhadap penanda Lewat Batas pada Addendum 6.2-T Bagian 7 dan penanda Belum Melapor pada
Addendum 6.3-T Celah 7. Pola itu sudah terbukti dua kali; berkas ini memakainya untuk ketiga
kalinya, bukan menciptakan pola baru.

Bentuk fungsinya ada pada calon Addendum 6.4-T butir 1, karena ia menyatakan jalur teknis, bukan
aturan bisnis.

> **Butir uji U-6.4-02.** Buka Sesi Tugas, matikan perangkat, jedakan pekerjaan berjadwal dengan
> `select cron.unschedule('tutup-sesi-menggantung')`, tunggu lewat dua jam, lalu buka Sesi Tugas
> baru dari perangkat lain. Pembukaan wajib berhasil dan sesi lama wajib tertutup dengan sebab
> menggantung. Bila ditolak `23505`, berarti penutupan masih bersandar pada penjadwal.

## P-05 Titik yang mengantre luring ditolak setelah ganti perangkat — PENTING, SENYAP

### Duduk perkaranya

BR-25 menuntut setiap penulisan ke tabel operasional membawa penanda perangkat yang cocok dengan
Perangkat Terdaftar pemiliknya. Addendum 6.3-K sudah memecahkan benturan ini untuk laporan lewat
pemisahan `penanda_perangkat` dan `penanda_perangkat_asal`.

`location_logs` hanya memiliki satu kolom penanda perangkat.

Akibatnya, orang yang berganti perangkat sebelum antrean titiknya terkirim, atau yang kata
sandinya direset sehingga baris `perangkat_masuk`-nya terhapus, kehilangan seluruh titik yang
belum sempat naik. Ditolak basis data, tanpa pesan yang sampai ke siapa pun. Rutenya berlubang,
dan lubang itu terbaca sebagai tidak bertugas.

### Ketetapan

`location_logs` menerima kolom `penanda_perangkat_asal`, mengikuti bentuk dan alasan yang sama
persis dengan `laporan_harian`. Bukan pelanggaran, bukan penolakan — perangkat tempat titik
direkam tetap tercatat sebagai fakta, sementara yang diperiksa Perangkat Terdaftar adalah
perangkat yang benar-benar mengirim.

## P-06 Retensi tidak pernah dimulai bila SPT tidak pernah ditutup — PENTING

### Duduk perkaranya

Retensi sembilan puluh hari dihitung sejak SPT selesai atau dibatalkan. SPT yang tidak pernah
ditutup tidak pernah memulai hitungan, dan Section 8.8 sudah mencatat draf yang ditinggalkan
berbulan-bulan sebagai kondisi tepi nyata. Titiknya hidup abadi di tabel yang Section 10.2 sebut
tumbuh paling cepat.

### Ketetapan

Ambang kedua yang tidak bergantung status SPT: **titik yang `direkam_pada`-nya lebih tua dari
tiga ratus enam puluh lima hari disusutkan tanpa memandang status SPT induknya.** Yang mana pun
yang lebih dahulu tercapai antara ambang ini dan sembilan puluh hari sejak penutupan, itulah yang
berlaku.

Angka satu tahun dipilih karena ia melampaui masa hidup wajar sebuah SPT penyelidikan sekaligus
menutup kemungkinan tabel tumbuh tanpa batas akibat SPT yang terlupakan. Ringkasan rute pada
`sesi_tugas` tetap ada selamanya, sehingga yang hilang adalah titik satuannya, bukan sejarahnya.

## P-07 `sesi_tugas` belum memiliki kolom waktu baku — SEDANG

### Ketetapan

`sesi_tugas` menerima `dibuat_pada` dan `diubah_pada` sesuai I.10 yang berlaku bagi seluruh tabel
tanpa kecuali. Keduanya berbeda maksud dari `dibuka_pada` dan `ditutup_pada`: yang pertama waktu
baris dibuat dan diubah, yang kedua waktu peristiwa lapangan.

Pada `location_logs`, kolom `diterima_pada` **dipertahankan** dan tidak diganti `dibuat_pada`,
karena namanya membawa arti tambahan — waktu titik tiba di sistem, yang berbeda dari
`direkam_pada` dan menjadi dasar penilaian keterlambatan. Ini persis pengecualian yang dibuka
I.10 untuk `dikirim_pada` pada laporan. Keputusan ini ditulis di sini justru agar tidak menjadi
temuan pemeriksaan silang berikutnya.

## P-08 `laporan_harian.sesi_tugas_id` kosong setelah penutupan otomatis — SEDANG

### Duduk perkaranya

Addendum 6.3-T Celah 3 mengisi `laporan_harian.sesi_tugas_id` dari sesi yang sedang berjalan pada
SPT yang sama. Begitu Modul 6.4 memberi sistem kemampuan menutup sesi otomatis, laporan yang
dikirim setelah penutupan otomatis akan berisi kolom kosong.

### Ketetapan

Ini **perilaku yang diharapkan, bukan cacat data**. Modul 6.3 sudah menetapkan laporan boleh
dikirim kapan saja selama SPT hidup, tanpa mensyaratkan Sesi Tugas berjalan. Kolom kosong berarti
laporan disusun di luar sesi, dan itu keadaan yang sah.

Modul 6.8 dilarang memperlakukan kolom kosong pada kolom itu sebagai kekurangan data, dan dilarang
menyimpulkan apa pun darinya. Dicatat pada Section 8.10 dan pada Lampiran B.11.

## P-09 `sesi_tugas` tidak memuat penanda perangkat — SEDANG

### Duduk perkaranya

BR-25 berbunyi "setiap penulisan ke tabel operasional". `sesi_tugas` ditulis dari lapangan oleh
pemegang sesi dan belum pernah diputuskan masuk atau tidak ke dalam cakupan aturan itu.

### Ketetapan

Masuk. `sesi_tugas` menerima `penanda_perangkat text not null` dengan kebijakan penulisan yang
sama seperti `location_logs` dan `laporan_harian`. Tanpa itu, perangkat yang sudah digeser masih
dapat membuka Sesi Tugas selama access token-nya belum kedaluwarsa, dan seluruh lapisan
penegakan Addendum 6.1-T Bagian 3.4 bocor lewat pintu yang belum dijaga.

## P-16 Zona waktu pada seluruh perhitungan hari kalender — MEMBLOKIR

### Duduk perkaranya

Bagian I butir I.2 menetapkan bentuk final tampilan `v_belum_lapor`, dan di dalamnya terdapat:

```sql
and lh.direkam_pada::date = current_date
```

Penulisan `timestamptz::date` memakai pengaturan zona waktu sesi basis data. Basis data terkelola
berjalan pada **UTC**, sedangkan seluruh pemakainya berada di **WIB, yaitu UTC+7**.

Akibatnya, "hari kalender" menurut sistem bergulir pada **pukul tujuh pagi WIB**, bukan tengah
malam:

| Yang terjadi di lapangan | Yang dicatat sistem |
| --- | --- |
| Anggota mengirim laporan pukul 05.30 WIB hari Selasa | Tercatat sebagai laporan hari **Senin** |
| Anggota mengirim laporan pukul 23.00 WIB hari Senin | Tercatat hari Senin — benar, kebetulan |
| Anggota belum melapor sepanjang Senin, melapor 06.00 Selasa | Kewajiban Senin tetap terpenuhi, kewajiban Selasa dianggap belum |

Tidak ada galat. Penanda Belum Melapor sekadar salah, tiap hari, bagi setiap orang, selamanya.
Ini kegagalan senyap dengan jangkauan paling luas di seluruh dokumen: ia menyentuh Kewajiban Lapor
Harian pada Modul 6.3, rekap harian pada Modul 6.5, dan setiap perhitungan harian yang akan lahir
di Modul 6.8.

Modul 6.4 mewarisinya utuh, karena seluruh penilaian waktunya memakai `direkam_pada` yang bertipe
sama.

### Ketetapan

> **BR-64.** Setiap perhitungan yang menyangkut hari kalender, tanggal, atau batas harian wajib
> dilakukan pada zona waktu **`Asia/Jakarta`**, tidak pernah pada zona waktu bawaan basis data.
> Penulisan `timestamptz::date` tanpa penyebutan zona waktu dilarang di seluruh sistem, termasuk
> pada tampilan, pemicu, fungsi, pekerjaan berjadwal, dan kueri sisi aplikasi.

Bentuk yang berlaku bagi `v_belum_lapor`, menggantikan bentuk pada Bagian I.2:

```sql
create or replace view public.v_belum_lapor
with (security_invoker = on)
as
select pp.penugasan_id,
       pp.pelaksana_id,
       p.unit_id,
       p.nomor_spt
  from public.penugasan_pelaksana pp
  join public.penugasan p on p.id = pp.penugasan_id
 where p.status in ('baru', 'berjalan', 'bermasalah')
   and p.wajib_lapor_harian = true
   and pp.dicabut_pada is null
   and not exists (
     select 1
       from public.laporan_harian lh
      where lh.penugasan_id = pp.penugasan_id
        and lh.pelapor_id   = pp.pelaksana_id
        and lh.status_laporan <> 'ditarik'
        and (lh.direkam_pada at time zone 'Asia/Jakarta')::date
          = (now() at time zone 'Asia/Jakarta')::date
   );
```

**Yang sengaja tidak dilakukan.** Mengubah zona waktu bawaan project menjadi `Asia/Jakarta`
tampak lebih ringkas, tetapi ditolak karena tiga alasan: ia mengubah perilaku setiap kueri yang
sudah ditulis tanpa satu pun tanda terlihat, ia tidak berlaku bagi sambungan yang menyetel zona
waktunya sendiri, dan ia membuat kebenaran sistem bergantung pada satu pengaturan yang dapat
berubah tanpa jejak. Penyebutan eksplisit lebih panjang tetapi tidak dapat bocor diam-diam.

> **Butir uji U-6.4-03.** Setel jam perangkat ke pukul 05.00 WIB, kirim laporan, lalu baca
> `v_belum_lapor`. Baris pengirim wajib **hilang** dari daftar belum melapor. Bila masih ada,
> perbaikan ini belum diterapkan.

> **Butir uji U-6.4-04.** Sisir seluruh berkas dengan pencarian teks `::date`. Setiap kemunculan
> wajib didahului `at time zone 'Asia/Jakarta'`. Ini butir uji terhadap dokumen, bukan terhadap
> sistem, dan dijalankan sebelum sesi coding dimulai.

## P-17 Pendaftaran tabel ke Data API — MEMBLOKIR OPERASIONAL

### Duduk perkaranya

Layanan basis data terkelola yang dipakai sudah mengubah perilaku bawaannya: tabel baru pada
skema publik **tidak lagi terekspos ke Data API secara otomatis**. Ketentuan itu menjadi bawaan
bagi project baru sejak 30 Mei 2026 dan diberlakukan pada seluruh project pada 30 Oktober 2026.

Project SiPANTAU dibuat pada Agustus 2026, sehingga ia project baru dan aturan baru berlaku
penuh.

Yang membuatnya berbahaya bukan aturannya, melainkan **gejalanya**. Tabel yang belum didaftarkan
menjawab permintaan klien dengan hasil kosong atau tidak ditemukan — persis seperti tabel yang
aturan akses barisnya menolak. Pembangun akan memeriksa kebijakan RLS berjam-jam, menuliskan ulang
klausanya, dan mencurigai fungsi bantu peran, padahal seluruhnya sudah benar sejak awal.

Tidak satu pun berkas dalam dokumen ini menyebutkan langkah pendaftaran itu.

### Ketetapan

> **BR-66.** Setiap tabel baru wajib didaftarkan secara sadar ke Data API sebagai langkah
> tersendiri yang tercatat pada urutan pembangunan, terpisah dari pembuatan tabelnya dan terpisah
> dari penyusunan aturan akses barisnya. Kegagalan membaca sebuah tabel baru **wajib diperiksa
> terhadap pendaftaran ini lebih dahulu**, sebelum aturan akses baris dicurigai.

Sebelas tabel yang wajib didaftarkan: `users`, `unit`, `perangkat_masuk`, `jejak_audit`,
`penugasan`, `penugasan_dasar`, `penugasan_lokasi`, `penugasan_pelaksana`, `penugasan_panit`,
`sesi_tugas`, `location_logs`, `posisi_terkini`, `laporan_harian`, `catatan_laporan`,
`laporan_versi`, `catatan_versi`, `notifikasi`.

Dua tabel yang **sengaja tidak didaftarkan**, karena tidak boleh disentuh klien sama sekali:
`pembatasan_laju` dan `titik_penanda`. Keduanya hanya dibaca dan ditulis fungsi ber-`security
definer` dari dalam basis data.

> **Butir uji U-6.4-05.** Setelah seluruh tabel berdiri, baca satu baris dari tiap tabel memakai
> kunci publik sebagai pengguna yang berhak. Tabel yang menjawab kosong sementara barisnya ada di
> basis data berarti belum terdaftar. Jalankan **sebelum** menyusun satu pun kebijakan akses.

Bentuk perintah pendaftarannya diverifikasi terhadap dokumentasi layanan pada saat pembangunan,
bukan disalin dari dokumen ini, karena ketentuannya sedang dalam masa peralihan sampai Oktober
2026. Dicatat sebagai calon Addendum 6.4-T butir 17.

## P-18 Peristiwa penghapusan pada Realtime tidak disaring — PENTING

### Duduk perkaranya

Kebijakan akses baris **tidak diterapkan pada pernyataan penghapusan** dalam mekanisme perubahan
Postgres, karena basis data tidak punya cara memastikan seseorang berhak atas baris yang sudah
tidak ada.

Rancangan Bagian 3 Section 5.21 menghapus baris `posisi_terkini` saat sesi ditutup. Peristiwa penghapusan
itu karena itu disiarkan kepada **seluruh** pelanggan tabel, bukan hanya yang berhak.

### Ketetapan

Perilaku ini **dipertahankan**, karena ia justru dibutuhkan: penanda di peta harus hilang dari
layar setiap pengawas yang berhak, dan penyiaran tanpa penyaringan menjamin tidak ada penanda
hantu yang tertinggal.

Yang dikunci adalah batas kebocorannya:

1. **`replica identity` pada `posisi_terkini` dibiarkan bawaan**, tidak disetel penuh. Dengan
   demikian peristiwa penghapusan hanya membawa kunci utamanya.
2. **Kunci utamanya adalah `sesi_tugas_id`**, sebuah UUID acak tanpa arti. Yang terbaca pelanggan
   yang tidak berhak hanyalah bahwa *sebuah* sesi entah milik siapa telah berakhir. Tidak ada nama,
   tidak ada unit, tidak ada koordinat.
3. **Larangan yang mengikat:** kunci utama tabel mana pun yang masuk publikasi Realtime tidak boleh
   pernah berisi keterangan bermakna. Nomor SPT, NRP, dan nama dilarang menjadi kunci utama pada
   tabel yang dilanggani.

> **Butir uji U-6.4-06.** Berlangganan `posisi_terkini` sebagai Anggota unit lain, lalu tutup sesi
> milik orang di unit yang berbeda. Pelanggan wajib menerima peristiwa penghapusan berisi UUID saja,
> tanpa satu pun kolom lain. Bila kolom lain ikut terkirim, `replica identity` sudah disetel penuh
> dan wajib dikembalikan.

## P-19 Sesi Tugas tidak dapat dibuka dari aplikasi web — MEMBLOKIR SENYAP

### Duduk perkaranya

Section 11.1 menawarkan dua bentuk aplikasi yang setara: berkas pemasangan Android dan aplikasi
web progresif. Tidak satu pun aturan menyatakan bahwa Sesi Tugas hanya dapat dibuka dari yang
pertama.

Padahal perekaman posisi saat layar mati menuntut layanan latar depan beserta pemberitahuan
menetap, dan peramban tidak memilikinya dalam bentuk apa pun. Bukan karena kurang diatur, melainkan
karena sistem operasi memang tidak menyediakannya bagi halaman web.

Jalannya kegagalan:

1. Anggota memasang bentuk web ke layar utama, sebagaimana Section 11.1 mempersilakannya
2. Tombol geser Mulai Tugas muncul, karena tidak ada aturan yang menyembunyikannya
3. Sesi terbuka, Titik pertama terkirim, semuanya tampak berjalan
4. Layar mati. Pengiriman berhenti
5. Dua jam kemudian sesi ditutup dengan sebab menggantung

Anggota merasa sudah bertugas seharian. Kanit melihat penanda abu-abu sejak pagi. Tidak ada galat,
tidak ada peringatan, dan tidak seorang pun mengetahui sebabnya sampai berminggu-minggu kemudian —
saat itu pun dugaannya kemungkinan besar tertuju pada orangnya, bukan pada bentuk aplikasinya.
Justru inilah jenis kekeliruan yang paling merusak kepercayaan, dan yang paling bertentangan
dengan Prinsip 0.6.

### Ketetapan

> **BR-65.** Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang. Pada bentuk web,
> tombol Mulai Tugas **disembunyikan**, bukan ditampilkan dalam keadaan nonaktif (BR-11), dan
> digantikan keterangan singkat beserta tautan pemasangan berkas Android. Seluruh kemampuan lain —
> membaca penugasan, mengirim laporan, mengunggah foto, membaca rute — tetap tersedia penuh pada
> bentuk web.

Penegakannya berlapis dua, mengikuti pola yang sudah dipakai Addendum 6.1-T:

**Lapis pertama, di antarmuka.** Aplikasi memeriksa apakah ia berjalan di dalam wadah Android.
Bila tidak, tombol tidak dirender sama sekali.

**Lapis kedua, di basis data.** Kolom `sesi_tugas.penanda_perangkat` yang sudah ditetapkan P-09
diperluas maknanya: penanda perangkat yang dibuat oleh bentuk web membawa awalan yang dapat
dikenali, dan fungsi pembuka sesi menolaknya. Tanpa lapis kedua, penyembunyian tombol hanyalah
penyembunyian di antarmuka, yang dilarang Section 9.1.

**Yang tidak dilakukan.** Bentuk web tidak dilarang bagi Anggota. Melarangnya akan menghukum orang
yang perangkatnya sedang rusak dan meminjam komputer untuk sekadar mengirim laporan — dan Modul 6.3
sudah menetapkan laporan boleh dikirim tanpa Sesi Tugas berjalan.

## P-20 Arah gerak tidak terekam — SEDANG

Bagian 3 Section 5.7 memuat `kecepatan_mps` tetapi tidak memuat arah. Tanpanya penanda peta tidak dapat
diputar mengikuti arah gerak, dan rute yang digambar kehilangan keterangan yang diberikan perangkat
secara cuma-cuma bersama koordinat.

### Ketetapan

Satu kolom `arah_derajat` ditambahkan pada `location_logs`, sudah tercantum pada Bagian 3
Section 5.7.

Kolom yang sama **tidak** ditambahkan ke `posisi_terkini`, melainkan diturunkan di sisi tampilan
dari dua titik terakhir. Alasannya tercatat pada B.1: setiap kolom pada tabel yang dilanggani
menambah muatan yang dikirim ke setiap pelanggan pada setiap perubahan, dan arah dapat dihitung
tanpa biaya.

## P-21 Panit yang sudah dicabut tetap memantau posisi langsung — SEDANG

### Duduk perkaranya

Bagian 7 di bawah menyamakan aturan baca `posisi_terkini` dengan `location_logs`. Akibatnya
Panit yang penunjukannya sudah dicabut tetap melihat posisi langsung anak buahnya, selamanya,
karena BR-21 memerintahkan hak baca riwayat bertahan.

BR-21 memang benar untuk riwayat: Panit perlu dapat membuka kembali penugasan lama yang pernah ia
awasi, dan itu tidak berakhir bersama penunjukannya. Tetapi **pemantauan langsung bukan riwayat.**
Ia kemampuan operasional yang melekat pada tugas yang sedang berjalan, dan tugas itu sudah
berakhir.

### Ketetapan

> **Amandemen BR-62.** Hak baca `location_logs` bagi Panit bertahan selamanya sesuai BR-21. Hak
> baca `posisi_terkini` **berakhir** saat `dicabut_pada` terisi, bagi Panit maupun bagi sesama
> pelaksana. Pemisahan ini berlaku juga bagi peta waktu nyata secara keseluruhan: yang sudah
> dicabut membaca ke belakang, tidak memantau ke depan.

Bentuk klausa yang berlaku bagi `posisi_terkini`:

| Peran | Syarat |
| --- | --- |
| Pemegang sesi sendiri | Selalu |
| Sesama pelaksana | `dicabut_pada is null` pada barisnya sendiri **dan** pada baris pemegang sesi |
| Panit | Punya baris pada `penugasan_panit` dengan `dicabut_pada is null` |
| Kanit | Unitnya sendiri |
| Kasubdit dan Akun Pemeliharaan | Seluruhnya |

> **Peringatan implementasi.** Klausa Panit pada `location_logs` **mengabaikan** `dicabut_pada`,
> sedangkan klausa Panit pada `posisi_terkini` **memeriksanya**. Kedua tabel bersebelahan dan
> kebijakannya mirip. Menyalin yang satu ke yang lain adalah kesalahan yang paling mungkin terjadi
> pada penutupan modul ini.

> **Butir uji U-6.4-07.** Cabut penunjukan seorang Panit dari sebuah SPT yang sedang berjalan
> sesinya. Ia wajib tetap dapat membuka rute SPT itu, dan wajib **tidak lagi** melihat penanda pada
> peta waktu nyata.

## P-22 Penyusutan dapat menghapus titik sesi yang masih berjalan — SEDANG

BR-59 menetapkan ambang tiga ratus enam puluh lima hari sejak `direkam_pada` tanpa memandang status
SPT. Sebuah sesi yang tidak pernah ditutup selama lebih dari setahun mustahil dalam praktik —
penutupan menggantung terjadi setelah dua jam — tetapi tidak ada apa pun yang menjaganya, dan
"mustahil dalam praktik" bukan penjagaan.

### Ketetapan

> **Amandemen BR-59.** Titik hanya dapat disusutkan bila Sesi Tugas induknya **sudah tertutup**.
> Titik milik sesi yang masih berjalan tidak pernah disusutkan, berapa pun umurnya. Kedua ambang
> lainnya tetap berlaku sebagaimana adanya.

Syarat ini juga menutup lubang yang lebih halus: tanpa penjagaan itu, pekerjaan berjadwal dapat
menghapus titik yang baru saja disisipkan seandainya jam perangkat pengirimnya jauh mundur — dan
pemeriksaan waktu KP-6.4-21 memang menolak yang terlalu jauh, tetapi ambangnya berbeda.

---
---

# Bagian 1 — Tambahan Section 3 Glosarium

## 3.3 Istilah lokasi — baris tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Titik** | Satu baris `location_logs`. Merekam keberadaan seorang pemegang Sesi Tugas pada satu saat, beserta ketelitian dan keadaan perangkatnya |
| **Posisi Terkini** | Titik terakhir yang diterima sistem dari sebuah Sesi Tugas yang masih berjalan. Disimpan terpisah agar peta tidak perlu menyisir seluruh Rute |
| **Titik Diragukan** | Titik yang tetap disimpan tetapi tidak dipakai menggambar garis maupun menghitung jarak, karena ketelitiannya buruk atau perpindahannya tidak wajar. Bukan tuduhan, bukan penolakan |
| **Ringkasan Rute** | Angka dan bentuk kasar sebuah Rute yang disimpan permanen pada `sesi_tugas`, sehingga tetap ada setelah titik satuannya disusutkan |
| **Antrean Titik** | Titik yang tertahan di perangkat karena tanpa jaringan, terkirim otomatis begitu jaringan pulih. Mengikuti pola Antrean Luring pada BR-45 sampai BR-48 |

## 3.9 Istilah Sesi Tugas — bagian baru

| Istilah | Definisi tunggal |
| --- | --- |
| **Sesi Tugas** | Rentang waktu antara Mulai Tugas dan Selesai Tugas untuk satu SPT oleh satu orang. Satu-satunya keadaan di mana posisi direkam. Satu orang memegang paling banyak satu Sesi Tugas berjalan (BR-27) |
| **Sesi Menggantung** | Sesi Tugas yang tidak menerima pembaruan posisi selama lebih dari dua jam. Ditutup sistem dengan sebab yang tercatat. Bukan pernyataan tentang perilaku pemegangnya |
| **Sebab Penutupan** | Keterangan mengapa sebuah Sesi Tugas berakhir. Tujuh nilai tertutup, lihat Section 5.17. Bersifat fakta, tidak satu pun bermuatan penilaian |
| **Izin Terputus** | Keadaan Sesi Tugas yang masih berjalan tetapi izin lokasinya dicabut pengguna di tengah jalan. Sesi tidak ditutup; keadaannya ditandai dan pengawasnya diberi tahu |

---
---

# Bagian 2 — Perubahan Section 2.3 Matriks Hak Akses

Dua baris berubah, satu baris ditambahkan. Sisanya tetap seperti bentuk yang berlaku setelah
Modul 6.2 dan Addendum 6.3-K.

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Melihat peta Tracking waktu nyata | Semua unit | Unit sendiri | Penugasan yang diawasinya | Posisi sendiri **dan rekan pelaksana aktif pada SPT yang sama** |
| Melihat rute per SPT | Semua unit | Unit sendiri | Penugasan yang diawasinya | Rute sendiri **dan rute rekan pelaksana aktif pada SPT yang sama** |
| Melihat penanda titik dari lokasi tiruan | **Ya** | Ya (unit sendiri) | **Tidak** | **Tidak** |

### Alasan perubahan

**Rekan satu SPT saling melihat posisi.** Ini keputusan pemilik produk dan sengaja **berbeda**
dari keputusan Modul 6.3 yang menutup isi laporan dari sesama pelaksana. Perbedaannya beralasan
dan wajib dituliskan supaya pemeriksaan silang berikutnya tidak membacanya sebagai
ketidakkonsistenan:

- **Isi laporan** adalah bahan pengawasan. Yang berkepentingan membacanya adalah peninjau, dan
  membukanya kepada rekan tidak menambah kemampuan siapa pun menyelesaikan tugas.
- **Posisi rekan** adalah bahan koordinasi. Tim yang menyisir kawasan tambang atau gudang perlu
  tahu di mana rekannya berada, dan tanpa itu mereka akan memakai saluran luar sistem — yang
  bertentangan dengan semangat BR-04.

**Lingkupnya sempit dan berakhir.** Yang terbuka hanya SPT yang sama, dan hanya selama ia masih
tercantum aktif sebagai pelaksana. Begitu `dicabut_pada` terisi, pembacaan posisi rekan tertutup
seketika. Ini **berbeda** dari BR-21 yang memberi Panit hak baca riwayat selamanya, dan
perbedaannya juga beralasan: hak Panit melekat pada tugas pengawasan yang tidak berakhir bersama
penunjukannya, sedangkan hak rekan melekat pada kerja sama lapangan yang memang berakhir.

**Penanda lokasi tiruan tidak terbuka bagi Panit.** Ia paling dekat dengan tuduhan di antara
seluruh data modul ini, sehingga pembacaannya dibatasi pada peran yang berwenang menilai menurut
Section 0.6. Konsekuensi teknisnya besar dan tidak boleh diselesaikan dengan menyembunyikan kolom
di antarmuka — lihat P-10 pada Bagian 11 dan Section 5.22.

---
---

# Bagian 3 — Perubahan Model Data

## 5.7 Tabel location_logs — pengganti utuh

**[FINAL]**

Menyimpan titik-titik Rute. Tabel dengan pertumbuhan tercepat di seluruh sistem, sehingga setiap
kolom di bawah dipertimbangkan terhadap biayanya.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Kunci utama |
| sesi_tugas_id | uuid | **Baru.** Sesi pemilik titik. Wajib terisi. Menyelesaikan P-03 |
| penugasan_id | uuid | SPT pemilik Rute. Wajib terisi (BR-13). Dipertahankan meski dapat diturunkan dari sesi, karena BR-13 berbunyi harfiah dan indeksnya dibutuhkan |
| pengguna_id | uuid | Pemilik titik. **Mengganti `anggota_id`** (P-02). Boleh berperan anggota, panit, atau kanit |
| lat | numeric | Lintang |
| lng | numeric | Bujur |
| geom | geography(Point,4326) | Dibangkitkan dari lat dan lng. Dipakai menghitung jarak dan mencocokkan ke `penugasan_lokasi` |
| akurasi_meter | numeric | Perkiraan galat. **Diganti nama dari `akurasi`** agar seragam dengan `laporan_harian.akurasi_meter` (Section 0.2) |
| kecepatan_mps | numeric | Kecepatan yang dilaporkan perangkat. Boleh kosong |
| arah_derajat | numeric | Arah gerak dalam derajat, nol berarti utara. Boleh kosong, karena perangkat tidak melaporkannya saat diam (P-20) |
| baterai_persen | smallint | Daya tersisa saat titik direkam. Boleh kosong |
| sumber_lokasi | enum | gps, jaringan, fusi, tidak_diketahui |
| diragukan_sebab | enum | Kosong berarti titik wajar. Nilai: akurasi_buruk, lompatan_tidak_wajar, keduanya |
| antrean_id | uuid | **Unik.** Dibuat aplikasi satu kali per titik. Penangkal kiriman kembar, sejalan BR-46 |
| direkam_pada | timestamptz | Waktu perangkat saat titik diambil. Dasar seluruh penilaian waktu (BR-45) |
| diterima_pada | timestamptz | Waktu server saat baris masuk. Dipertahankan namanya, lihat P-07 |
| diterima_terlambat | boolean | Dihitung pemicu. Benar bila selisih kedua waktu melebihi lima menit |
| penanda_perangkat | text | Perangkat yang **benar-benar mengirim**. Wajib Perangkat Terdaftar saat pengiriman (BR-25) |
| penanda_perangkat_asal | text | Perangkat tempat titik **direkam**. Boleh berbeda, boleh kosong bila sama. Menyelesaikan P-05 |

**Kolom yang dicabut dari versi 0.2:** `anggota_id` (berganti nama menjadi `pengguna_id`),
`akurasi` (berganti nama menjadi `akurasi_meter`).

**Kolom yang sengaja tidak ada di sini:** penanda lokasi tiruan. Ia berada pada tabel terpisah
`titik_penanda`, dan alasannya bukan kerapian melainkan penegakan hak akses. Lihat Section 5.22.

### Indeks yang wajib dibuat sejak awal

```sql
create index idx_location_logs_sesi_waktu
  on public.location_logs (sesi_tugas_id, direkam_pada);

create index idx_location_logs_penugasan_waktu
  on public.location_logs (penugasan_id, direkam_pada);

create index idx_location_logs_geom
  on public.location_logs using gist (geom);

create unique index uq_location_logs_antrean_id
  on public.location_logs (antrean_id);

create index idx_location_logs_susut
  on public.location_logs (direkam_pada);
```

Indeks yang menyusul pada tabel berisi puluhan juta baris jauh lebih mahal daripada indeks yang
ada sejak baris pertama. Ini bukan pengoptimalan yang ditunda, melainkan bagian dari pembangunan.

## 5.17 Tabel sesi_tugas — pengganti utuh

**[FINAL]** — menggantikan bentuk [KERANGKA] pada Modul 6.2 Section 5.17.

Disimpan **permanen** dan tidak pernah ikut disusutkan. Setelah titik satuannya hilang, baris
inilah satu-satunya yang masih dapat menjawab pertanyaan tentang kegiatan tahun lalu.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Kunci utama |
| penugasan_id | uuid | SPT yang sedang dikerjakan |
| pengguna_id | uuid | Pemegang sesi. Boleh berperan anggota, panit, atau kanit |
| dibuka_pada | timestamptz | Waktu Mulai Tugas, menurut jam perangkat |
| ditutup_pada | timestamptz | Waktu Selesai Tugas. Kosong berarti sesi masih berjalan |
| sebab_penutupan | enum | Kosong selama sesi berjalan. Tujuh nilai tertutup, lihat di bawah |
| ditutup_oleh | uuid | Pengguna yang menutup. **Kosong berarti ditutup sistem** |
| penanda_perangkat | text | Perangkat pembuka sesi (BR-25, P-09) |
| izin_dicabut_pada | timestamptz | Terisi bila izin lokasi dicabut saat sesi berjalan. Boleh kosong |
| izin_dipulihkan_pada | timestamptz | Terisi bila izin diberikan kembali sebelum sesi berakhir |
| titik_terakhir_pada | timestamptz | Disalin dari titik terbaru. Dasar penghitungan Sesi Menggantung dan status Terakhir terlihat |
| jumlah_titik | integer | Bawaan nol. Dinaikkan pemicu |
| jarak_tempuh_meter | numeric | Diisi saat penutupan. Menghitung hanya titik yang tidak diragukan |
| akurasi_median_meter | numeric | Diisi saat penutupan. Keterangan mutu rekaman, bukan penilaian |
| polyline_terkode | text | Bentuk kasar Rute dalam sandi polyline. Diisi saat penutupan |
| lat_awal, lng_awal | numeric | Titik pertama sesi |
| lat_akhir, lng_akhir | numeric | Titik terakhir sesi |
| diringkas_pada | timestamptz | Waktu ringkasan disusun. Kosong berarti ringkasan belum jadi |
| dibuat_pada | timestamptz | Waktu baris dibuat (I.10, P-07) |
| diubah_pada | timestamptz | Waktu baris terakhir diubah (I.10, P-07) |

### Nilai enum sebab_penutupan — [FINAL]

Tujuh nilai, daftar tertutup. Tidak satu pun bermuatan penilaian; ketujuhnya menyebut keadaan.

| Nilai | Kapan dipakai | Rujukan |
| --- | --- | --- |
| `manual` | Pemegang sesi menekan Selesai Tugas | — |
| `keluar_aplikasi` | Pemegang sesi keluar dari aplikasi saat sesi berjalan | BR-19 |
| `pindah_perangkat` | Akun yang sama masuk di perangkat lain, sehingga perangkat lama tidak lagi berhak menulis | BR-16, BR-25 |
| `menggantung` | Lewat dua jam tanpa pembaruan posisi | BR-54 |
| `spt_ditutup` | Kanit menutup atau membatalkan SPT saat sesi masih berjalan | BR-38 |
| `dicabut_dari_spt` | Pemegang sesi dicabut dari daftar pelaksana saat sesi berjalan | BR-30 |
| `akun_dinonaktifkan` | Akun dinonaktifkan saat sesi berjalan | BR-20 |

Empat nilai terakhir ditutup sistem, sehingga `ditutup_oleh` kosong. Dua nilai pertama ditutup
manusia. Nilai `pindah_perangkat` juga ditutup sistem, meski dipicu tindakan manusia di tempat
lain — yang mencatat bukan orangnya melainkan pergeseran perangkat.

> **Mengapa `pindah_perangkat` wajib ada, bukan disamakan dengan `keluar_aplikasi`.** Perangkat
> lama tidak selalu tahu dirinya sudah digeser; Addendum 6.1-T Bagian 3.5 menempatkan deteksinya
> sebagai lapis ketiga yang dapat terlambat. Sesi yang tidak ditutup akan tetap memblokir
> pembukaan sesi baru di perangkat baru lewat indeks unik. Menyamakannya dengan keluar aplikasi
> membuat sebab yang sesungguhnya hilang dari catatan.

### Indeks

Indeks unik parsial `uq_sesi_tugas_satu_aktif_per_orang` sudah ditetapkan Addendum 6.2-T
Bagian 2 dan **tidak dirancang ulang**. Yang ditambahkan:

```sql
create index idx_sesi_tugas_penugasan
  on public.sesi_tugas (penugasan_id, dibuka_pada desc);

create index idx_sesi_tugas_menggantung
  on public.sesi_tugas (titik_terakhir_pada)
  where ditutup_pada is null;
```

Indeks parsial kedua membuat penyisiran sesi menggantung menyentuh hanya baris yang masih
berjalan — puluhan baris, bukan puluhan ribu.

## 5.21 Tabel posisi_terkini — tabel baru

**[FINAL]**

Satu baris per Sesi Tugas yang sedang berjalan. Di-*upsert* setiap kali titik baru masuk, dan
**dihapus** saat sesi ditutup. Isinya tidak pernah lebih banyak dari jumlah orang yang sedang
bertugas.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| sesi_tugas_id | uuid | Kunci utama |
| penugasan_id | uuid | Menentukan siapa yang berhak melihat |
| pengguna_id | uuid | Unik. Menegakkan kembali BR-27 pada lapisan ini |
| unit_id | uuid | Disalin dari penugasan. Mencegah peta membaca ulang tabel `penugasan` untuk menyaring lingkup |
| lat, lng | numeric | Posisi terakhir |
| akurasi_meter | numeric | Ketelitian titik terakhir |
| baterai_persen | smallint | Daya saat titik terakhir |
| sumber_lokasi | enum | Sama seperti pada titik |
| izin_terputus | boolean | Benar bila izin lokasi sedang dicabut. Bawaan salah |
| direkam_pada | timestamptz | Waktu perangkat saat titik terakhir. **Dasar status Terakhir terlihat** |
| dibuat_pada | timestamptz | Waktu baris dibuat (I.10) |
| diubah_pada | timestamptz | Waktu titik terakhir tiba (I.10) |

### Mengapa tabel tersendiri

Peta pimpinan berlangganan tabel ini, bukan `location_logs`. Tiga akibatnya:

- **Kejadian waktu nyata turun drastis.** Satu baris berubah per orang, bukan satu baris baru per
  titik. Tiga puluh orang bertugas menghasilkan tiga puluh baris yang diperbarui, bukan ribuan
  baris baru per jam.
- **Status Terakhir terlihat menjadi pembacaan satu baris.** Tanpa tabel ini, setiap penyegaran
  peta harus mencari titik terbaru tiap orang di dalam tabel terbesar sistem.
- **Penyusutan tidak menyentuh peta.** `location_logs` dapat disusutkan sebebas apa pun tanpa
  memengaruhi tampilan peta, karena keduanya tidak lagi saling bergantung.

### Peristiwa penghapusan dan replica identity

Aturan akses baris **tidak diterapkan pada pernyataan penghapusan** dalam mekanisme perubahan
Postgres, karena basis data tidak punya cara memastikan seseorang berhak atas baris yang sudah
tidak ada. Baris `posisi_terkini` dihapus setiap kali sesi ditutup, sehingga peristiwa itu
disiarkan kepada seluruh pelanggan tabel, bukan hanya yang berhak.

Perilaku ini **dipertahankan**, karena justru dibutuhkan: penanda di peta harus hilang dari layar
setiap pengawas, dan penyiaran tanpa penyaringan menjamin tidak ada penanda hantu yang tertinggal.
Yang dikunci adalah batas kebocorannya.

1. **`replica identity` dibiarkan bawaan**, tidak disetel penuh. Peristiwa penghapusan karena itu
   hanya membawa kunci utamanya.
2. **Kunci utamanya `sesi_tugas_id`**, sebuah UUID acak tanpa arti. Yang terbaca pelanggan yang
   tidak berhak hanyalah bahwa sebuah sesi entah milik siapa telah berakhir — tanpa nama, tanpa
   unit, tanpa koordinat.
3. **Larangan yang mengikat:** kunci utama tabel mana pun yang masuk publikasi Realtime tidak
   boleh berisi keterangan bermakna. Nomor SPT, NRP, dan nama dilarang menjadi kunci utama pada
   tabel yang dilanggani.

### Yang sengaja tidak ada di tabel ini

Penanda lokasi tiruan **tidak** disalin ke sini. Alasannya menentukan dan mudah terlewat: tabel
ini dilanggani lewat Realtime, dan Realtime mengirim **seluruh baris** kepada setiap pelanggan
yang lolos aturan akses baris. Panit dan sesama pelaksana berhak melihat posisi rekan, sehingga
mereka lolos. Bila kolom itu ada di sini, ia ikut terkirim kepada mereka — bocor tanpa pernah
ditampilkan di layar mana pun, dan tanpa satu pun galat.

Ini bentuk kegagalan senyap yang sama persis dengan T-02, hanya lewat pintu yang berbeda.

Akibat yang diterima: penanda lokasi tiruan muncul saat rute ditelusuri, bukan pada peta waktu
nyata. Diterima sebagai batas rancangan, dicatat pada Section 8.10.

## 5.22 Tabel titik_penanda — tabel baru

**[FINAL]**

Menyimpan satu-satunya keterangan pada modul ini yang pembacaannya dibatasi lebih sempit daripada
titiknya sendiri.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| location_log_id | uuid | Kunci utama, mengacu ke `location_logs` |
| penugasan_id | uuid | Disalin. Dipakai aturan akses baris tanpa perlu menggabung tabel |
| unit_id | uuid | Disalin dari penugasan. Dipakai aturan akses baris |
| lokasi_tiruan | boolean | Benar bila perangkat melaporkan titik berasal dari penyedia lokasi tiruan |
| dibuat_pada | timestamptz | I.10 |

Baris hanya dibuat bila `lokasi_tiruan` bernilai benar. Titik wajar tidak menghasilkan baris di
sini sama sekali, sehingga tabel ini tetap kecil.

> **Mengapa tabel terpisah, bukan satu kolom pada `location_logs`.** PostgreSQL mengenal hak akses
> per kolom, tetapi hak itu melekat pada peran basis data, bukan pada peran aplikasi. Pada
> Supabase seluruh pengguna yang berhasil masuk memakai satu peran basis data yang sama, yaitu
> `authenticated`. Karena itu `grant select (kolom)` **tidak dapat** membedakan Kanit dari Panit.
>
> Aturan akses baris bekerja per baris, bukan per kolom. Satu-satunya cara menegakkan keputusan
> "hanya Kanit dan Kasubdit yang melihat" tanpa bersandar pada penyembunyian di antarmuka adalah
> memindahkan keterangannya ke baris tersendiri yang punya aturannya sendiri.
>
> Menyembunyikannya di antarmuka saja melanggar Section 9.1 butir keempat, yang menyatakan
> menyembunyikan tombol tidak dianggap pengamanan.

## 5.8 Hubungan antar entitas — tambahan

```
penugasan
  └── sesi_tugas                (jamak, milik 6.4)
        ├── location_logs       (jamak, disusutkan)
        │     └── titik_penanda (nol atau satu, akses lebih sempit)
        └── posisi_terkini      (nol atau satu, hanya selama sesi berjalan)
```

`location_logs` mengacu ke `sesi_tugas` **dan** ke `penugasan`. Keduanya wajib menunjuk SPT yang
sama, dan kesamaannya ditegakkan pemicu, bukan diandaikan. Bentuknya ada pada calon Addendum
6.4-T butir 3.

## 5.9 Kebijakan penyimpanan dan penyusutan data — pengganti

- **Rute disimpan per penugasan dan per sesi.** Setiap titik wajib memiliki `penugasan_id`
  (BR-13) dan `sesi_tugas_id` (BR-55).
- **Penyusutan `location_logs`.** Titik dihapus bila salah satu tercapai lebih dahulu: sembilan
  puluh hari sejak SPT-nya selesai atau dibatalkan, atau tiga ratus enam puluh lima hari sejak
  `direkam_pada` tanpa memandang status SPT (P-06).
- **`sesi_tugas` tidak pernah disusutkan.** Ringkasan Rute di dalamnya menggantikan titik satuan
  yang sudah hilang.
- **`posisi_terkini` bukan arsip.** Barisnya dihapus saat sesi ditutup dan tidak pernah dibaca
  sebagai riwayat.
- **`titik_penanda` ikut terhapus bersama titiknya**, lewat `on delete cascade`.
- **Data laporan dan LHP tidak dihapus otomatis.** Tidak berubah dari versi 0.2.

---
---

# Bagian 4 — Pengganti Section 6.4 secara utuh

**Status: [FINAL]**

## 6.4.1 Deskripsi

Modul ini mengatur perekaman posisi selama Sesi Tugas dan penyajiannya bagi pihak yang berhak.
Tanggung jawabnya berhenti pada tiga hal: membuka dan menutup Sesi Tugas, mengumpulkan serta
menyimpan Titik selama sesi berjalan, dan menyajikan posisi itu di peta beserta status Terakhir
terlihat.

**Yang bukan urusannya.** Penerbitan dan penutupan SPT milik Modul 6.2. Isi laporan dan titik
lokasi laporan milik Modul 6.3. Susunan halaman ringkasan dan kartu angka milik Modul 6.5.
Pengiriman pemberitahuan milik Modul 6.9 — modul ini hanya menyisipkan baris ke tabel
`notifikasi` dan tidak menentukan bagaimana ia sampai ke penerimanya.

Modul ini juga **tidak menyimpulkan apa pun**. Ia tidak menghitung kepatuhan, tidak menandai
kelalaian, dan tidak memberi nilai kepada siapa pun. Setiap keterangan yang dihasilkannya berupa
fakta bertanggal: kapan sesi dibuka, kapan titik terakhir diterima, berapa jauh jaraknya, dan
apa sebab sesi berakhir. Penilaian atas fakta-fakta itu sepenuhnya urusan manusia (Section 0.6,
BR-05).

## 6.4.2 Cerita pengguna

| Sebagai | Saya ingin | Agar |
| --- | --- | --- |
| Anggota | menekan satu tombol geser untuk Mulai Tugas | saya tidak perlu mengisi apa pun sebelum berangkat |
| Anggota | tahu dengan pasti kapan posisi saya direkam dan kapan tidak | saya percaya sistem ini tidak mengikuti saya di luar jam tugas |
| Anggota | posisi saya tetap terekam meski aplikasi berada di latar belakang | saya dapat memakai kamera dan aplikasi lain sambil bertugas |
| Anggota | titik yang tertahan tanpa sinyal tetap terkirim setelah saya kembali | rute saya tidak berlubang gara-gara lokasi yang memang tidak bersinyal |
| Anggota | melihat rute saya sendiri persis seperti yang dilihat pimpinan | tidak ada data tentang saya yang tidak saya ketahui |
| Anggota | melihat posisi rekan pada SPT yang sama | kami dapat membagi wilayah tanpa saling menelepon |
| Panit | melihat posisi seluruh pelaksana pada penugasan yang saya awasi | saya dapat mengarahkan mereka tanpa harus hadir di tempat |
| Kanit | melihat siapa saja yang sedang bertugas di unit saya beserta posisinya | saya tahu keadaan lapangan tanpa menunggu laporan masuk |
| Kanit | menelusuri rute sebuah SPT setelah kegiatannya selesai | saya dapat memeriksa kesesuaian kegiatan dengan sasaran surat perintah |
| Kanit | tahu mengapa seseorang berhenti mengirim posisi | saya tidak salah menduga, dan saya dapat menanyakannya dengan tepat |
| Kasubdit | melihat peta seluruh unit dalam satu tampilan | saya memperoleh gambaran menyeluruh tanpa membuka satu per satu |
| Anggota | Sesi Tugas saya yang terlupa tertutup tidak menghalangi tugas berikutnya | saya tidak terkunci gara-gara baterai habis kemarin |

## 6.4.3 Kriteria penerimaan

### Membuka Sesi Tugas

| Kode | Kriteria |
| --- | --- |
| KP-6.4-01 | Bila pengguna tercantum sebagai pelaksana aktif pada sebuah SPT berstatus baru, berjalan, atau bermasalah, maka tombol geser Mulai Tugas tersedia pada halaman rincian SPT tersebut |
| KP-6.4-02 | Bila GPS perangkat tidak aktif atau izin lokasi belum diberikan, maka Mulai Tugas ditolak disertai keterangan langkah yang perlu dilakukan, bukan sekadar penolakan (BR-02) |
| KP-6.4-03 | Bila pengguna sudah memegang Sesi Tugas berjalan pada SPT lain, maka pembukaan ditolak disertai nomor SPT yang sedang terbuka dan waktu pembukaannya (BR-27) |
| KP-6.4-04 | Bila pengguna memiliki Sesi Tugas berjalan yang tidak menerima pembaruan posisi lebih dari dua jam, maka pembukaan sesi baru **berhasil**, dan sesi lama ditutup dengan sebab menggantung dalam transaksi yang sama |
| KP-6.4-05 | Bila Sesi Tugas berhasil dibuka, maka satu Titik pertama dikirim seketika tanpa menunggu ambang jarak maupun ambang waktu |
| KP-6.4-06 | Bila pengguna membuka Sesi Tugas dari perangkat yang bukan Perangkat Terdaftar miliknya, maka penulisan ditolak basis data (BR-25) |
| KP-6.4-07 | Bila SPT sedang dihapus permanen pada saat hampir bersamaan, maka salah satu dari kedua tindakan gagal dan tidak ada keadaan setengah jadi (Addendum 6.2-T Bagian 8.3) |
| KP-6.4-08 | Bila pengguna membuka Sesi Tugas untuk pertama kalinya, maka permintaan izin lokasi sepanjang waktu ditampilkan lebih dahulu disertai penjelasan singkat alasannya (Section 11.2) |

### Pengiriman Titik

| Kode | Kriteria |
| --- | --- |
| KP-6.4-09 | Bila perpindahan sejak Titik terakhir melebihi dua puluh lima meter, maka Titik baru dikirim |
| KP-6.4-10 | Bila sudah lewat tiga puluh detik sejak pengiriman terakhir, maka Titik baru dikirim meski pengguna tidak berpindah |
| KP-6.4-11 | Bila aplikasi berada di latar belakang, maka pengiriman Titik tetap berjalan dengan ambang yang sama |
| KP-6.4-12 | Bila tidak ada Sesi Tugas berjalan, maka tidak satu pun Titik dikirim atau disimpan, dalam keadaan apa pun (BR-01) |
| KP-6.4-13 | Bila sebuah Titik masuk, maka `sesi_tugas.titik_terakhir_pada` dan baris `posisi_terkini` diperbarui dalam transaksi yang sama |
| KP-6.4-14 | Bila ketelitian sebuah Titik lebih buruk dari seratus meter, maka Titik tetap disimpan dan ditandai diragukan dengan sebab akurasi buruk |
| KP-6.4-15 | Bila sebuah Titik menyiratkan kecepatan melebihi seratus lima puluh kilometer per jam terhadap Titik wajar sebelumnya, maka Titik tetap disimpan dan ditandai diragukan dengan sebab lompatan tidak wajar |
| KP-6.4-16 | Bila sebuah Titik ditandai diragukan, maka ia tidak dipakai menggambar garis Rute dan tidak ikut dihitung dalam jarak tempuh, tetapi tetap terbaca sebagai baris data |
| KP-6.4-17 | Bila perangkat melaporkan Titik berasal dari penyedia lokasi tiruan, maka satu baris `titik_penanda` dibuat, dan barisnya hanya terbaca Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan |

### Antrean Titik

| Kode | Kriteria |
| --- | --- |
| KP-6.4-18 | Bila jaringan tidak tersedia, maka Titik disimpan di perangkat dan dikirim otomatis begitu jaringan pulih |
| KP-6.4-19 | Bila Titik yang sama dikirim ulang karena jawaban server tidak sampai, maka tidak ada baris kedua yang tersimpan (sejalan BR-46) |
| KP-6.4-20 | Bila Titik tiba lebih dari lima menit setelah `direkam_pada`, maka ia ditandai diterima terlambat dan tetap masuk pada urutan waktunya, bukan pada waktu tibanya (BR-45) |
| KP-6.4-21 | Bila `direkam_pada` sebuah Titik berada di masa depan lebih dari lima menit, atau mendahului `dibuka_pada` sesinya, maka Titik ditolak |
| KP-6.4-22 | Bila Titik mengendap di perangkat lebih dari empat puluh delapan jam sejak `direkam_pada`, maka ia tidak dikirim otomatis dan dibuang tanpa mengganggu pengiriman Titik yang lebih baru |
| KP-6.4-23 | Bila pengguna berganti perangkat sebelum antreannya terkirim, maka Titik tetap dapat dikirim dari perangkat barunya yang sah, dan perangkat asalnya tercatat sebagai fakta |

### Menutup Sesi Tugas

| Kode | Kriteria |
| --- | --- |
| KP-6.4-24 | Bila pengguna menggeser tombol Selesai Tugas, maka sesi ditutup dengan sebab manual dan pengiriman Titik berhenti seketika |
| KP-6.4-25 | Bila pengguna keluar dari aplikasi saat sesi berjalan, maka sesi ditutup dengan sebab keluar aplikasi tanpa memerlukan persetujuan siapa pun, Rute tersimpan utuh, dan Kanit serta Panit Penanggung Jawab diberi tahu (BR-19) |
| KP-6.4-26 | Bila akun yang sama masuk di perangkat lain, maka sesi ditutup dengan sebab pindah perangkat |
| KP-6.4-27 | Bila sesi tidak menerima pembaruan posisi selama lebih dari dua jam, maka sesi ditutup dengan sebab menggantung, baik oleh pekerjaan berjadwal maupun oleh pembukaan sesi berikutnya, mana yang lebih dahulu terjadi |
| KP-6.4-28 | Bila Kanit menutup atau membatalkan SPT saat masih ada sesi berjalan padanya, maka sesi-sesi itu ditutup dengan sebab SPT ditutup |
| KP-6.4-29 | Bila pelaksana dicabut dari SPT saat sesinya berjalan, maka sesinya ditutup dengan sebab dicabut dari SPT, dan Rute yang sudah terekam tetap tersimpan (BR-30) |
| KP-6.4-30 | Bila sebuah sesi ditutup dengan sebab apa pun, maka Ringkasan Rute disusun dalam transaksi yang sama dan barisnya di `posisi_terkini` dihapus |
| KP-6.4-31 | Bila sebuah sesi ditutup, maka baris `sesi_tugas` tidak pernah dihapus, termasuk saat titik-titiknya disusutkan |

### Peta waktu nyata dan status Terakhir terlihat

| Kode | Kriteria |
| --- | --- |
| KP-6.4-32 | Bila pengguna membuka peta, maka yang tampil hanya pemegang Sesi Tugas berjalan dalam lingkup datanya, bukan seluruh personel |
| KP-6.4-33 | Bila Titik terakhir diterima kurang dari dua menit lalu, maka penanda berwarna hijau bertulis Aktif |
| KP-6.4-34 | Bila Titik terakhir diterima antara dua dan lima belas menit lalu, maka penanda berwarna kuning bertulis Terakhir terlihat sekian menit lalu |
| KP-6.4-35 | Bila Titik terakhir diterima lebih dari lima belas menit lalu, maka penanda berwarna abu-abu bertulis Terakhir terlihat sekian waktu lalu |
| KP-6.4-36 | Bila status berwarna abu-abu, maka tidak satu pun kalimat pada tampilan menyebutkan sebab, kelalaian, atau dugaan (Section 0.6, BR-05) |
| KP-6.4-37 | Bila daya perangkat pada Titik terakhir tercatat, maka angkanya ditampilkan sebagai keterangan datar berdampingan dengan waktu, tanpa kalimat penafsir |
| KP-6.4-38 | Bila izin lokasi sedang terputus pada sebuah sesi, maka keadaan itu ditampilkan sebagai keterangan tersendiri, bukan digabungkan ke dalam warna status |
| KP-6.4-39 | Bila seluruh perhitungan waktu status dilakukan, maka yang dipakai adalah `direkam_pada`, bukan waktu tiba di server (BR-45) |
| KP-6.4-40 | Bila peta terbuka dan Titik baru masuk, maka penanda berpindah tanpa memuat ulang halaman |

### Penelusuran Rute

| Kode | Kriteria |
| --- | --- |
| KP-6.4-41 | Bila pengguna membuka Rute sebuah SPT, maka tersedia pilihan menampilkan seluruh sesi sekaligus atau satu sesi saja |
| KP-6.4-42 | Bila sebuah sesi ditampilkan, maka garisnya hanya menghubungkan Titik yang tidak diragukan |
| KP-6.4-43 | Bila Titik satuan sebuah sesi sudah disusutkan, maka Ringkasan Rute tetap dapat ditampilkan berupa garis kasar beserta angkanya |
| KP-6.4-44 | Bila Rute ditampilkan, maka titik-titik lokasi SPT dari `penugasan_lokasi` ikut digambar sebagai pembanding |
| KP-6.4-45 | Bila sebuah SPT belum pernah memiliki Sesi Tugas, maka halaman Rute menampilkan kondisi kosong yang menyatakan belum ada kegiatan terekam, bukan galat |
| KP-6.4-46 | Bila pengguna berperan Anggota membuka menu Rute Saya, maka ia melihat seluruh sesinya sendiri lintas SPT, termasuk yang sudah selesai |
| KP-6.4-47 | Bila Rute diekspor, maka pengeksporannya tercatat pada jejak audit (Section 9.4) |

### Lingkup data dan jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.4-48 | Bila pengguna berperan Anggota, maka ia membaca Titik miliknya sendiri dan Titik rekan pelaksana aktif pada SPT yang sama, dan tidak lebih dari itu |
| KP-6.4-49 | Bila seorang pelaksana sudah dicabut dari SPT, maka pembacaan posisi rekan pada SPT itu tertutup baginya seketika, sedangkan Rute miliknya sendiri tetap terbaca |
| KP-6.4-50 | Bila pengguna berperan Panit, maka ia membaca Titik pada penugasan tempat ia ditunjuk, tanpa memandang `dicabut_pada` (BR-21) |
| KP-6.4-51 | Bila pengguna berperan Panit, maka baris `titik_penanda` tidak terbaca olehnya dalam bentuk apa pun, termasuk lewat permintaan langsung ke basis data |
| KP-6.4-52 | Bila peta waktu nyata dibuka, maka pembukaannya tercatat pada jejak audit dengan jenis tindakan tersendiri (Section 9.4) |
| KP-6.4-53 | Bila Akun Pemeliharaan membaca data lokasi, maka pembacaannya tercatat sebagaimana tindakan lainnya (BR-17) |
| KP-6.4-54 | Bila Akun Pemeliharaan mencoba membuka Sesi Tugas, maka ditolak (BR-17) |
| KP-6.4-55 | Bila pengiriman Titik melampaui batas laju yang ditetapkan, maka pengiriman berikutnya ditolak sampai jendelanya berganti (BR-51) |

### Izin dan daya

| Kode | Kriteria |
| --- | --- |
| KP-6.4-56 | Bila izin lokasi dicabut saat Sesi Tugas berjalan, maka sesi **tetap terbuka**, ditandai izin terputus, dan Kanit serta Panit Penanggung Jawab diberi tahu |
| KP-6.4-57 | Bila izin lokasi diberikan kembali sebelum sesi berakhir, maka penandanya dilepas dan pengiriman Titik berjalan kembali tanpa membuka sesi baru |
| KP-6.4-58 | Bila izin terputus berlanjut sampai dua jam tanpa Titik masuk, maka sesi ditutup dengan sebab menggantung, mengikuti aturan yang sama dengan sebab lain |
| KP-6.4-59 | Bila perangkat menghentikan proses latar belakang, maka aplikasi menampilkan panduan pengaturan penghematan daya yang sesuai dengan mereknya (Section 11.3) |
| KP-6.4-60 | Bila Sesi Tugas berjalan, maka pemberitahuan sistem yang menetap ditampilkan sepanjang sesi dan tidak dapat disingkirkan pengguna |

### Gerakan penanda pada peta

| Kode | Kriteria |
| --- | --- |
| KP-6.4-61 | Bila Titik baru diterima, maka penanda pada peta berpindah lewat gerakan berkelanjutan dari kedudukan lama ke kedudukan baru, bukan berpindah seketika |
| KP-6.4-62 | Bila penanda sedang bergerak, maka ia diputar mengikuti arah yang dihitung dari dua kedudukan terakhir |
| KP-6.4-63 | Bila Titik terakhir sudah lebih tua dari dua menit, maka gerakan berhenti dan penanda diam pada kedudukan terakhirnya. Penanda tidak pernah bergerak menuju kedudukan yang diperkirakan sistem |

Butir terakhir menutup godaan yang sering muncul: memperkirakan posisi berikutnya agar penanda
tampak terus bergerak. Itu menampilkan sesuatu yang tidak pernah diterima sistem, dan bertentangan
dengan Prinsip 0.6 pada tingkat yang paling dasar.

### Bentuk aplikasi dan syarat pelacakan latar belakang

| Kode | Kriteria |
| --- | --- |
| KP-6.4-64 | Bila izin lokasi latar belakang belum diberikan, maka aplikasi tidak menjalankan layanan latar depan sama sekali, dan Mulai Tugas ditolak dengan keterangan langkah yang perlu dilakukan |
| KP-6.4-65 | Bila layanan latar depan berhenti sementara Sesi Tugas masih berjalan, maka pada pembukaan aplikasi berikutnya pengguna diberi tahu bahwa pelacakan sempat terhenti, disertai tombol menyalakannya kembali. Keterangannya menyebut kejadian, tidak menyebut sebab |
| KP-6.4-66 | Bila aplikasi mendeteksi pengiriman Titik terhenti lebih dari lima menit padahal Sesi Tugas berjalan dan izin masih diberikan, maka panduan pengaturan penghematan daya sesuai merek perangkat ditampilkan |
| KP-6.4-67 | Bila pengguna membuka SiPANTAU dalam bentuk web, maka tombol Mulai Tugas tidak dirender sama sekali, digantikan keterangan dan tautan pemasangan berkas Android |
| KP-6.4-68 | Bila permintaan pembukaan sesi datang dari penanda perangkat bentuk web, maka basis data menolaknya, tanpa bergantung pada penyembunyian tombol |

### Zona waktu, pencabutan, dan penyusutan

| Kode | Kriteria |
| --- | --- |
| KP-6.4-69 | Bila perhitungan hari kalender dilakukan di mana pun dalam sistem, maka ia memakai zona waktu `Asia/Jakarta` |
| KP-6.4-70 | Bila Panit sudah dicabut penunjukannya, maka ia tetap membaca rute SPT itu dan tidak lagi melihat penanda pada peta waktu nyata |
| KP-6.4-71 | Bila Sesi Tugas masih berjalan, maka Titik miliknya tidak pernah disusutkan, berapa pun umurnya |
| KP-6.4-72 | Bila baris `posisi_terkini` dihapus, maka peristiwa yang disiarkan hanya memuat kunci utamanya |

## 6.4.4 Aturan modul

1. Tidak ada perekaman posisi di luar Sesi Tugas, dalam bentuk apa pun, termasuk untuk keperluan
   diagnosis atau pengujian di lingkungan produksi.
2. Sesi Tugas dibuka dan ditutup oleh manusia. Sistem hanya menutup, tidak pernah membuka.
3. Setiap penutupan wajib memiliki sebab dari daftar tertutup. Tidak ada penutupan tanpa sebab.
4. Ambang dua puluh lima meter dan tiga puluh detik bersifat mengikat dan tidak boleh diubah
   diam-diam oleh kode. Perubahan ambang menuntut revisi PRD yang tercatat.
5. Titik tidak pernah ditolak karena mutunya. Yang buruk ditandai, bukan dibuang — kecuali
   ketiga pemeriksaan waktu pada KP-6.4-21, yang menolak karena datanya tidak dapat dipercaya
   sama sekali, bukan karena mutunya rendah.
6. Ringkasan Rute disusun tepat satu kali, saat penutupan, dan tidak pernah dihitung ulang.
7. Modul ini tidak pernah menutup SPT, tidak pernah mengubah statusnya, dan tidak pernah
   menyentuh tabel milik Modul 6.2 selain membaca dan mengunci barisnya.
8. Seluruh keterangan waktu di antarmuka ditulis relatif dan netral. Tidak ada kata yang
   menyatakan seseorang tidak bertugas, terlambat, atau menghilang.
9. Setiap perhitungan hari kalender memakai zona waktu `Asia/Jakarta` secara eksplisit. Penulisan
   `timestamptz::date` tanpa penyebutan zona waktu dilarang, termasuk di dalam fungsi dan pemicu.
10. Koordinat disajikan apa adanya. Rute tidak pernah ditempelkan ke jaringan jalan, tidak pernah
    diluruskan, dan tidak pernah disesuaikan terhadap titik lokasi SPT.
11. Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang. Bentuk web menyembunyikan
    tombolnya dan tetap memiliki seluruh kemampuan lain.

## 6.4.5 Antarmuka dan kondisi tampilan

### Kartu Sesi Tugas pada halaman rincian SPT — sisi pelaksana

Tombol geser ala Shopee Food menjadi aksi utamanya, sesuai keputusan Modul 6.1. Geser ke kanan
untuk Mulai Tugas, geser ke kanan lagi untuk Selesai Tugas. Tidak ada dialog konfirmasi tambahan;
gerakan menggeser sudah menjadi konfirmasinya.

Di bawah tombol, tiga baris keterangan saat sesi berjalan: lama sesi berjalan, jumlah Titik
terkirim, dan jumlah Titik yang masih mengantre. Baris ketiga muncul hanya bila antreannya tidak
kosong.

### Layar Peta — sisi pengawas

Peta Leaflet dengan penanda per pemegang sesi. Menekan penanda membuka lembar bawah berisi nama,
nomor SPT, status Terakhir terlihat, daya perangkat, dan tombol menuju Rute sesi berjalan.

Penyaring di atas peta: unit (hanya bagi Kasubdit), SPT, dan status warna. Daftar di samping peta
pada layar lebar, menjadi lembar tarik pada layar telepon.

### Layar Rute

Garis rute per sesi dengan warna berbeda, disertai penanda titik lokasi SPT sebagai pembanding.
Panel samping memuat daftar sesi beserta waktu, sebab penutupan, jarak tempuh, dan jumlah Titik.
Sesi yang titiknya sudah disusutkan ditampilkan dengan garis putus-putus beserta keterangan bahwa
yang tergambar adalah bentuk kasarnya.

### Layar Rute Saya — sisi pelaksana

Isinya persis sama dengan yang dilihat pengawas atas dirinya, tanpa satu pun bagian yang
disembunyikan. Ini disengaja: orang yang dilacak berhak melihat seluruh data tentang dirinya, dan
keterbukaan itu yang membuat sistem ini dipakai secara sukarela, sebagaimana catatan strategis
pada Section 1.1.

### Kondisi kosong

| Keadaan | Yang ditampilkan |
| --- | --- |
| Tidak ada yang bertugas dalam lingkup pengguna | Peta tetap tampil pada wilayah unit, disertai keterangan bahwa belum ada Sesi Tugas berjalan |
| SPT belum pernah memiliki sesi | Halaman Rute menyatakan belum ada kegiatan terekam |
| Sesi berjalan tetapi belum ada Titik masuk | Penanda belum muncul, disertai keterangan menunggu posisi pertama |
| Anggota belum pernah membuka sesi | Rute Saya menyatakan belum ada riwayat, disertai penjelasan bahwa perekaman hanya berjalan selama Sesi Tugas |

### Kondisi memuat dan galat

| Keadaan | Yang ditampilkan |
| --- | --- |
| Peta sedang memuat | Kerangka peta dengan penanda pudar, bukan layar kosong |
| Sambungan waktu nyata terputus | Keterangan datar bahwa pembaruan tertunda, disertai waktu pembaruan terakhir. Data lama tetap ditampilkan, tidak dikosongkan |
| Pembukaan sesi ditolak `23505` | Nomor dan judul SPT yang sedang terbuka, beserta jalan keluarnya (Addendum 6.2-T Bagian 2.3) |
| Pembukaan sesi ditolak karena perangkat | Keterangan bahwa akun sedang aktif di perangkat lain, disertai arahan masuk ulang |
| Batas laju terlampaui | Keterangan berapa batasnya dan kapan dapat dicoba lagi (KP-6.10-08) |

### Perbedaan antar peran

| Peran | Yang terlihat |
| --- | --- |
| Kasubdit | Peta seluruh unit, seluruh Rute, penanda lokasi tiruan, ringkasan lintas unit |
| Kanit | Peta unitnya, Rute unitnya, penanda lokasi tiruan pada unitnya |
| Panit | Peta dan Rute pada penugasan yang ia awasi. Tanpa penanda lokasi tiruan |
| Anggota | Posisi dan Rute sendiri, ditambah rekan pelaksana aktif pada SPT yang sama. Tanpa penanda lokasi tiruan |
| Akun Pemeliharaan | Membaca seluruhnya, tidak dapat membuka Sesi Tugas, tidak muncul di peta (BR-17) |

## 6.4.6 Edge case modul

| Kondisi | Penanganan |
| --- | --- |
| Sinyal posisi hilang di tengah sesi | Tidak ada tindakan. Status berpindah warna dengan sendirinya karena `direkam_pada` menua |
| Izin lokasi dicabut di tengah sesi | Sesi tetap terbuka, ditandai izin terputus, pengawas diberi tahu (KP-6.4-56) |
| Perangkat mati atau kehabisan daya | Sesi menggantung setelah dua jam. Daya terakhir yang tercatat membantu menjelaskan tanpa menuduh |
| Titik berakurasi sangat rendah | Disimpan, ditandai diragukan, tidak menggambar garis |
| Indikasi lokasi tiruan | Dicatat sebagai fakta pada tabel terpisah. Tidak pernah menghasilkan penolakan maupun kesimpulan |
| Sesi tidak pernah ditutup pengguna | Ditutup sistem dengan sebab menggantung, lewat penjadwal maupun lewat pembukaan sesi berikutnya |
| Waktu perangkat jauh berbeda dari server | Tiga pemeriksaan pada KP-6.4-21 menolak yang tidak masuk akal, sisanya diterima apa adanya |
| Titik menumpuk saat jaringan hilang lalu terkirim sekaligus | Antrean Titik, dengan penanda unik penangkal kembar |
| Dua pembaruan posisi tiba hampir bersamaan | Keduanya masuk. `posisi_terkini` di-*upsert* dengan syarat `direkam_pada` lebih baru, sehingga yang lebih lama tidak menimpa yang lebih baru |
| Sesi dibuka pada dua perangkat sekaligus | Mustahil. Indeks unik parsial menolak yang kedua sebelum sampai ke aplikasi |
| SPT disunting saat sesi berjalan | Dibiarkan. Sesi tidak terganggu, sesuai keputusan Modul 6.2 |
| Titik lokasi SPT dihapus setelah rute digambar | Rute tidak terpengaruh. `location_logs` tidak mengacu ke `penugasan_lokasi` sama sekali |
| Akun dinonaktifkan saat sesi berjalan | Sesi ditutup dengan sebabnya sendiri, Rute tersimpan utuh (BR-20) |
| Laporan masuk setelah sesi ditutup otomatis | `sesi_tugas_id` kosong. Sah dan diharapkan, lihat P-08 |
| Penjadwal berhenti berhari-hari | Tidak ada yang terkunci. Penutupan sesi menggantung tetap terjadi lewat jalur pembukaan sesi (P-04) |

## 6.4.7 Ketergantungan

| Modul | Sifat ketergantungan |
| --- | --- |
| 6.1 Autentikasi & Peran | Wajib selesai lebih dahulu. Fungsi bantu peran dan unit, Perangkat Terdaftar, dan BR-16 sampai BR-25 menjadi fondasi seluruh aturan akses modul ini |
| 6.2 Manajemen Penugasan | Wajib selesai lebih dahulu. `penugasan`, `penugasan_pelaksana`, `penugasan_panit`, indeks unik parsial `sesi_tugas`, dan syarat penguncian baris induk pada Bagian 8.3 |
| 6.3 Pelaporan Harian | Berkaitan dua arah. `laporan_harian.sesi_tugas_id` diisi dari sesi yang berjalan, dan Antrean Titik meniru pola Antrean Luring |
| 6.5 Dashboard | Bergantung pada modul ini. Peta pada dashboard membaca `posisi_terkini` |
| 6.8 LHP Ringkas | Bergantung pada modul ini. Ringkasan Rute menjadi bahan isian otomatis |
| 6.9 Notifikasi | Bergantung pada modul ini. Modul ini menyisipkan baris `notifikasi`, modul 6.9 yang mengantarkannya |
| 6.10 Ekspor & Pembatasan Laju | Berkaitan. Pengiriman Titik masuk daftar tertutup pembatasan laju |

---
---

# Bagian 5 — Tambahan Section 7 Business Rules Global

| Kode | Aturan | Modul terkait |
| --- | --- | --- |
| BR-54 | Sesi Tugas yang tidak menerima pembaruan posisi lebih dari dua jam ditutup sistem dengan sebab menggantung. Penutupan itu **tidak boleh bergantung pada berjalannya penjadwal**; jalur kedua yang tidak bersandar pada penjadwal wajib ada, sejalan BR-36 | 6.4 |
| BR-55 | Setiap Titik wajib terikat pada satu Sesi Tugas, dan sesi itu wajib menunjuk SPT yang sama dengan `penugasan_id` Titik tersebut. Kesamaannya ditegakkan basis data, bukan diandaikan | 6.4 |
| BR-56 | Setiap penutupan Sesi Tugas wajib memiliki sebab dari daftar tertutup tujuh nilai. Baris `sesi_tugas` tidak pernah dihapus dan tidak pernah disusutkan | 6.4, 6.5, 6.8 |
| BR-57 | Titik tidak pernah ditolak karena mutunya. Titik berketelitian buruk atau berperpindahan tidak wajar tetap disimpan dan ditandai. Penolakan hanya berlaku bagi Titik yang waktunya tidak dapat dipercaya | 6.4 |
| BR-58 | Ringkasan Rute disusun tepat satu kali saat penutupan sesi dan disimpan permanen. Penyusutan Titik tidak boleh menghilangkan sejarah sebuah Sesi Tugas | 6.4, 6.8 |
| BR-59 | Titik disusutkan bila salah satu tercapai lebih dahulu: sembilan puluh hari sejak SPT selesai atau dibatalkan, atau tiga ratus enam puluh lima hari sejak `direkam_pada` tanpa memandang status SPT | 6.4 |
| BR-60 | Titik yang tertahan tanpa jaringan mengikuti pola Antrean Luring BR-45 sampai BR-48, dengan ambang kedaluwarsa empat puluh delapan jam, bukan tujuh hari | 6.4 |
| BR-61 | Keterangan bahwa sebuah Titik berasal dari penyedia lokasi tiruan hanya terbaca Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan. Penegakannya wajib pada tingkat baris basis data; penyembunyian di antarmuka tidak dianggap pengamanan | 6.4, 6.5 |
| BR-62 | Pelaksana aktif sebuah SPT saling membaca posisi dan Rute pada SPT tersebut. Hak itu berakhir seketika saat `dicabut_pada` terisi, berbeda dari hak baca Panit yang bertahan selamanya menurut BR-21 | 6.4, 6.5 |
| BR-63 | Pembukaan peta waktu nyata, penelusuran Rute suatu SPT, dan pengeksporan Rute dicatat pada jejak audit sebagai pembukaan data lokasi yang bersifat luas | 6.4, 6.5, 6.10 |

| BR-64 | Setiap perhitungan yang menyangkut hari kalender, tanggal, atau batas harian wajib dilakukan pada zona waktu `Asia/Jakarta`, tidak pernah pada zona waktu bawaan basis data. Penulisan `timestamptz::date` tanpa penyebutan zona waktu dilarang di seluruh sistem, termasuk pada tampilan, pemicu, fungsi, pekerjaan berjadwal, dan kueri sisi aplikasi | Seluruh modul |
| BR-65 | Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang. Pada bentuk web tombolnya disembunyikan, bukan ditampilkan nonaktif (BR-11), dan digantikan keterangan beserta tautan pemasangan. Seluruh kemampuan lain tetap tersedia penuh pada bentuk web | 6.1, 6.4 |
| BR-66 | Setiap tabel baru wajib didaftarkan secara sadar ke Data API sebagai langkah tersendiri yang tercatat pada urutan pembangunan, terpisah dari pembuatan tabelnya dan dari penyusunan aturan aksesnya. Kegagalan membaca tabel baru wajib diperiksa terhadap pendaftaran ini lebih dahulu, sebelum aturan akses baris dicurigai | Seluruh modul |
| BR-67 | Koordinat disajikan apa adanya. Rute tidak pernah ditempelkan, diluruskan, atau disesuaikan terhadap jaringan jalan maupun terhadap titik lokasi SPT, baik pada penyimpanan maupun pada penyajian | 6.4, 6.5, 6.8 |

> **Catatan penomoran.** BR-54 sampai BR-67 melanjutkan dari BR-53 sesuai aturan penambahan pada
> Section 7 dan pemeriksaan yang diwajibkan Addendum 6.2-T Bagian 0.4. Tidak ada kode lama yang
> dipakai ulang. **Modul berikutnya mulai dari BR-68.**

## Amandemen atas aturan yang sudah ada

| Kode | Yang berubah | Alasan |
| --- | --- | --- |
| BR-51 | Daftar tertutup operasi yang dibatasi lajunya bertambah satu baris, lihat di bawah | Penambahan wajib lewat revisi PRD yang tercatat, dan revisi itu adalah berkas ini |
| BR-59 | Ditambahkan syarat: Titik hanya dapat disusutkan bila Sesi Tugas induknya **sudah tertutup**. Titik milik sesi yang masih berjalan tidak pernah disusutkan, berapa pun umurnya. Kedua ambang lainnya tetap berlaku | P-22. "Mustahil dalam praktik" bukan penjagaan |
| BR-62 | Dipisahkan: hak baca `location_logs` bertahan setelah pencabutan sesuai BR-21, sedangkan hak baca `posisi_terkini` **berakhir** saat pencabutan, bagi Panit maupun sesama pelaksana | P-21. Riwayat selamanya masuk akal; pemantauan langsung selamanya tidak |

**Amandemen BR-51.** Daftar tertutup operasi yang dibatasi lajunya bertambah satu baris. Karena
BR-51 mensyaratkan penambahan lewat revisi PRD yang tercatat, revisi itu adalah berkas ini.

| Operasi | Batas | Jendela | Alasan |
| --- | --- | --- | --- |
| `kirim_titik` | 600 | 5 menit | Melindungi kuota dari klien rusak. Angka ini memberi ruang bagi pengosongan antrean lima jam sekaligus, sementara pemakaian wajar hanya sepuluh per lima menit |

---
---

# Bagian 6 — Tambahan Section 8.10 Pelacakan posisi

Daftar kondisi tepi lintas modul yang lahir dari Modul 6.4. Penanganan rincinya ada pada 6.4.6.

- Sesi Tugas menggantung sementara penjadwal sedang berhenti
- Izin lokasi dicabut lalu diberikan kembali dalam satu sesi yang sama
- Titik tiba setelah sesinya sudah ditutup sistem
- Titik tiba setelah SPT-nya ditutup atau dibatalkan
- Antrean Titik terkirim dari perangkat yang berbeda dari perangkat perekamnya
- Ringkasan Rute disusun untuk sesi yang tidak pernah menerima satu Titik pun
- Dua Titik dengan `direkam_pada` yang sama persis tiba bersamaan
- Titik satuan sudah disusutkan sementara LHP yang merujuknya baru disusun kemudian
- Laporan harian masuk tanpa `sesi_tugas_id` karena sesinya sudah tertutup otomatis

---
---

# Bagian 7 — Tambahan Section 9

## 9.2 Aturan akses per tabel

**[FINAL] untuk tabel yang menjadi urusan Modul 6.4**

| Tabel | Baca | Tulis |
| --- | --- | --- |
| `sesi_tugas` | Pemegangnya sendiri; pelaksana aktif SPT yang sama; Panit dengan penunjukan pada SPT itu tanpa memandang `dicabut_pada`; Kanit unit pemilik; Kasubdit; Akun Pemeliharaan | Penyisipan hanya lewat fungsi pembuka sesi, oleh pelaksana aktif dari Perangkat Terdaftar. Pembaruan tidak pernah dilakukan klien secara langsung — seluruhnya lewat fungsi dan pemicu ber-`security definer` |
| `location_logs` | Pemiliknya sendiri; pelaksana **aktif** SPT yang sama (BR-62); Panit dengan penunjukan tanpa memandang `dicabut_pada` (BR-21); Kanit unit pemilik; Kasubdit; Akun Pemeliharaan | Penyisipan hanya oleh pemiliknya sendiri, dari Perangkat Terdaftar, dan hanya bila sesi yang dirujuk masih berjalan dan miliknya. Pembaruan dan penghapusan tertutup bagi seluruh peran |
| `posisi_terkini` | Pemegang sesi sendiri; pelaksana yang **belum dicabut** pada SPT yang sama; Panit dengan penunjukan yang **belum dicabut**; Kanit unit pemilik; Kasubdit; Akun Pemeliharaan. Berbeda dari `location_logs`, tabel ini **memeriksa** `dicabut_pada` bagi Panit (BR-62 teramandemen) | Tertutup bagi seluruh peran. Hanya pemicu ber-`security definer` yang menulisnya |
| `titik_penanda` | **Hanya** Kanit unit pemilik, Kasubdit, dan Akun Pemeliharaan (BR-61) | Tertutup bagi seluruh peran. Hanya pemicu yang menulisnya |

> **Tiga hal yang wajib diperhatikan saat implementasi**
>
> Pertama, klausa baca `location_logs` untuk **rekan pelaksana memeriksa `dicabut_pada`**,
> sedangkan klausa baca untuk **Panit mengabaikannya**. Keduanya berada dalam satu kebijakan yang
> sama dan mudah tertukar. Tertukar ke satu arah melanggar BR-21, tertukar ke arah lain melanggar
> BR-62. Ini kesalahan paling mungkin di modul ini.
>
> Dan yang kedua kalinya mudah tertukar: pada `posisi_terkini`, klausa Panit **memeriksa**
> `dicabut_pada`, kebalikan dari `location_logs`. Kedua tabel bersebelahan dan kebijakannya mirip.
> Menyalin yang satu ke yang lain adalah kesalahan yang paling mungkin terjadi pada penutupan
> modul ini.
>
> Kedua, `posisi_terkini` adalah **tabel**, bukan tampilan, sehingga BR-37 tidak berlaku padanya.
> Yang berlaku aturan akses baris biasa. Tetapi ia dilanggani lewat Realtime, dan aturan akses
> barisnya dievaluasi bagi setiap pelanggan. Menambahkan tabel ke publikasi tanpa menguji aturan
> aksesnya dari peran yang tidak berhak menghasilkan kebocoran yang tidak menimbulkan galat apa
> pun — jenis kegagalan yang sama dengan T-02.
>
> Ketiga, `titik_penanda` tidak boleh digabungkan ke dalam kueri yang sama dengan `location_logs`
> untuk peran yang tidak berhak. Penggabungan yang aturannya benar akan menghasilkan baris kosong,
> bukan galat — sehingga kekeliruan di sini terlihat seperti data yang memang tidak ada.

## 9.4 Data lokasi dan data perkara — amandemen

Kalimat berikut ditambahkan pada akhir Section 9.4:

> Pembukaan data lokasi yang bersifat luas dicatat pada jejak audit. Yang termasuk luas adalah
> pembukaan peta waktu nyata, penelusuran Rute suatu SPT, dan pengeksporan Rute. Pembacaan
> seseorang atas Rutenya sendiri **tidak** dicatat, karena ia bukan pembukaan yang meluas dan
> pencatatannya hanya akan menghasilkan bising tanpa manfaat pengawasan.

## 9.6 Jenis tindakan jejak audit — tambahan

`buka_sesi_tugas`, `tutup_sesi_tugas`, `buka_peta_langsung`, `buka_rute_spt`, `ekspor_rute`,
`susut_titik`.

Penyisipan Titik **tidak** dicatat tersendiri. Ribuan baris jejak audit per hari akan menenggelamkan
tindakan yang benar-benar perlu ditelusuri, dan Titik itu sendiri sudah merupakan catatannya.

---
---

# Bagian 8 — Perubahan Section 4, 10, dan 11

## 4.2 Tumpukan teknologi — baris tambahan

| Bagian | Pilihan | Catatan |
| --- | --- | --- |
| Pembaruan waktu nyata | Supabase Realtime | Berlangganan **hanya** tabel `posisi_terkini`. `location_logs` sengaja tidak dimasukkan ke publikasi |

## 4.5 Batasan arsitektur — butir tambahan

> **Publikasi waktu nyata bersifat menentukan.** Tabel yang masuk publikasi Realtime mengirimkan
> seluruh isi barisnya kepada setiap pelanggan yang lolos aturan akses baris. Karena itu keputusan
> tentang kolom mana yang boleh berada pada tabel yang dilanggani adalah keputusan keamanan,
> bukan keputusan rancangan data. Lihat Section 5.21.

## 10.1 Kinerja — angka yang sebelumnya ditunda

| Aspek | Sasaran |
| --- | --- |
| Jeda pembaruan posisi di peta | Paling lama tiga detik sejak Titik diterima basis data |
| Waktu muat peta berisi tiga puluh penanda | Paling lama dua detik pada jaringan seluler 4G |
| Waktu tampil Rute satu sesi berisi seribu Titik | Paling lama tiga detik |
| Jumlah pemegang sesi bersamaan yang wajib tertangani | Enam puluh |

## 10.2 Volume data — angka yang sebelumnya ditunda

Seorang pemegang sesi selama delapan jam menghasilkan paling banyak sembilan ratus enam puluh
Titik bila ia bergerak terus-menerus, dan jauh lebih sedikit bila ia diam mengamati. Enam puluh
orang bertugas bersamaan menghasilkan paling banyak sekitar lima puluh delapan ribu baris per
hari kerja.

Dengan retensi BR-59, tabel mengendap pada kisaran beberapa juta baris — masih jauh di bawah
batas layanan terkelola, dan itulah alasan penyusutan ditetapkan sekarang, bukan nanti.

## 10.3 Kesesuaian perangkat — angka yang sebelumnya ditunda

Versi Android minimum: **Android 8.0**. Alasannya bukan selera melainkan batas teknis — pelacakan
latar belakang yang dapat diandalkan menuntut layanan latar depan beserta pemberitahuan menetap,
dan perilakunya baru seragam sejak versi tersebut.

## 11.2 Urutan permintaan izin — penegasan

Urutan yang sudah mengikat tidak berubah. Yang ditambahkan adalah bentuk permintaannya, mengikuti
pola aplikasi ojol sesuai keputusan yang sudah terkunci:

1. Layar penjelasan **sebelum** dialog sistem muncul, memuat satu kalimat alasan dan satu kalimat
   yang menegaskan perekaman hanya berjalan selama Sesi Tugas
2. Dialog sistem untuk izin lokasi saat aplikasi dipakai
3. Layar kedua yang menerangkan mengapa pilihan Izinkan sepanjang waktu diperlukan, disertai
   gambar langkah membukanya di pengaturan sistem
4. Tombol yang membuka halaman pengaturan aplikasi secara langsung, bukan sekadar menyuruh
   pengguna mencarinya sendiri

## 11.3 Pengaturan penghematan daya — penegasan

Panduan disajikan **saat dibutuhkan**, yaitu ketika aplikasi mendeteksi pengiriman Titik terhenti
padahal sesi berjalan, bukan hanya sekali pada pemakaian pertama. Panduan menyesuaikan merek
perangkat yang terdeteksi.

## 11.6 Syarat teknis pelacakan latar belakang — bagian baru

Bagian ini bukan aturan bisnis melainkan syarat yang bila terlewat membuat seluruh Modul 6.4 tidak
berjalan.

### Izin yang wajib dideklarasikan

`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`,
`FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, dan `POST_NOTIFICATIONS`. Layanannya
dideklarasikan dengan jenis `location`.

Sejak Android 14, jenis layanan latar depan wajib dinyatakan di manifes beserta izin yang sesuai
bagi jenis tersebut. Yang paling berbahaya: bila aplikasi belum memperoleh izin lokasi latar
belakang lalu mencoba menjalankan layanan latar depan berjenis lokasi, sistem melempar galat
keamanan dan **aplikasi mati seketika**.

> **KP-6.4-64.** Bila izin lokasi latar belakang belum diberikan, maka aplikasi tidak menjalankan
> layanan latar depan sama sekali, dan Mulai Tugas ditolak dengan keterangan langkah yang perlu
> dilakukan.

### Batasan yang tidak dapat dihindari

Layanan latar depan hanya dapat dinyalakan saat aplikasi berada di depan. Ini kebetulan sejalan
dengan rancangan — Mulai Tugas memang ditekan saat Anggota membuka aplikasi — tetapi ia menutup
satu kemungkinan yang mungkin terpikir kemudian: menyalakan kembali pelacakan dari latar belakang
setelah layanannya mati bukanlah hal yang dapat dilakukan aplikasi sendiri.

> **KP-6.4-65.** Bila layanan latar depan berhenti sementara Sesi Tugas masih berjalan, maka pada
> pembukaan aplikasi berikutnya pengguna diberi tahu bahwa pelacakan sempat terhenti, disertai
> tombol menyalakannya kembali. Keterangannya menyebut kejadian, tidak menyebut sebab.

### Ambang tiga puluh detik saat layar mati

Ambang itu **tidak dapat** ditegakkan memakai penjadwal pekerjaan sistem operasi, yang jarak
terpendeknya lima belas menit, maupun memakai alarm, yang ditahan saat perangkat tidur. Satu-satunya
tempat ia dapat berjalan adalah di dalam layanan latar depan itu sendiri, memakai pendengar lokasi
miliknya.

Ini bukan pilihan rancangan melainkan batas sistem operasi, dan ia menentukan pilihan plugin.

### Pemilihan plugin

Dua pilihan yang masuk akal untuk anggaran proyek ini, keduanya tanpa biaya lisensi:

| Plugin | Kelebihan | Yang perlu diperhitungkan |
| --- | --- | --- |
| `@capacitor-community/background-geolocation` | Sudah mendukung Capacitor v7 dan sudah memperbaiki pelacakan latar belakang untuk Android 14. Titik diterima di lapisan JavaScript, sehingga pengiriman memakai pustaka klien yang sama dengan seluruh aplikasi | Bergantung pada hidupnya lapisan web. Bila prosesnya dimatikan, pengiriman berhenti sampai aplikasi dibuka kembali |
| `@capgo/background-geolocation` | Layanannya dipertahankan dan dijalankan ulang sistem, sehingga pengiriman berlanjut meski aplikasi digeser keluar dari daftar aplikasi terbaru. Titik dapat dikirim langsung dari lapisan native | Pengiriman native berada di luar pustaka klien, sehingga penyegaran token autentikasi wajib diurus sendiri di sisi native. Menambah satu tempat yang dapat gagal |

**Yang saya sarankan:** mulai dengan yang pertama, karena ia menyatu dengan sisa aplikasi dan tidak
menambah penanganan token. Pindah ke yang kedua **hanya bila** pengujian di perangkat sungguhan
menunjukkan pengiriman terlalu sering terhenti. Keputusan itu diambil berdasarkan hasil pengujian,
bukan di atas kertas — sejalan dengan Section 10.4 yang sudah menetapkan dampak daya diukur, bukan
diperkirakan.

### Merek yang menghentikan proses latar belakang secara sepihak

Sejumlah merek menghentikan layanan latar depan di luar aturan Android. Panduan pengaturannya
disajikan **saat dibutuhkan**, yaitu ketika aplikasi mendeteksi pengiriman terhenti padahal sesi
berjalan, bukan hanya sekali pada pemakaian pertama.

> **KP-6.4-66.** Bila aplikasi mendeteksi pengiriman Titik terhenti lebih dari lima menit padahal
> Sesi Tugas berjalan dan izin masih diberikan, maka panduan pengaturan penghematan daya sesuai
> merek perangkat ditampilkan.

---
---

# Bagian 9 — Perubahan Section 12 Di Luar Cakupan

| Tidak dibangun | Alasan |
| --- | --- |
| Penempelan rute ke jaringan jalan | Bertentangan dengan BR-67. Rute yang menyimpang — masuk halaman gudang, berhenti di tepi kebun, memotong kawasan tambang — justru keterangan yang paling bernilai bagi penyelidikan. Menempelkannya menghapus tepat bagian yang paling perlu dilihat |
| Perkiraan posisi di antara dua Titik | Menampilkan kedudukan yang tidak pernah diterima sistem. Bertentangan dengan Prinsip 0.6 |
| Pembukaan Sesi Tugas dari bentuk web | Bertentangan dengan BR-65. Peramban tidak memiliki layanan latar depan, sehingga pelacakan berhenti begitu layar mati tanpa satu pun tanda |

---
---

# Bagian 10 — Perubahan Lampiran A dan B

## Lampiran A — butir tambahan

| Kode | Butir | Pertanyaan | Dampak bila tidak terjawab |
| --- | --- | --- | --- |
| A-17 | Rekan pelaksana saling melihat posisi | Apakah pimpinan menyetujui bahwa sesama pelaksana pada satu SPT saling melihat posisi dan Rute, mengingat data lokasi termasuk yang dilindungi Section 9.4 | Aturan akses `location_logs` dan `posisi_terkini` disusun dengan lingkup yang lebih luas daripada Modul 6.3. Bila ditolak, klausa rekan dicabut tanpa mengubah bagian lain |
| A-18 | Perlakuan atas indikasi lokasi tiruan | Apakah Kanit menghendaki pemberitahuan aktif saat penanda muncul, atau cukup terlihat saat Rute ditelusuri | Modul 6.9 tidak dapat menetapkan apakah jenis pemberitahuan ini ada. Bawaan yang dipakai sementara: tanpa pemberitahuan aktif |
| A-19 | Kanit sebagai pelaksana terlihat di peta | Apakah pimpinan berkeberatan bahwa Kanit yang dicantumkan sebagai pelaksana muncul pada peta yang dibaca Panit di unitnya sendiri | Bawaan yang dipakai sementara: muncul, sejalan dengan BR-31 yang menyamakan kedudukan seluruh pelaksana. Bila berkeberatan, klausa penyaring ditambahkan tanpa mengubah bagian lain |

## Lampiran B — butir tambahan

### B.11 Pelacakan posisi — bagian baru

- Perekaman posisi berjalan hanya selama Sesi Tugas dan tidak pernah di luar itu
- Rute disimpan terikat pada SPT sekaligus pada sesi yang menghasilkannya
- Sesi Tugas menggantung ditutup sistem setelah dua jam, lewat dua jalur yang saling menggantikan
- Sebab penutupan memiliki tujuh nilai tertutup, seluruhnya berupa keadaan dan bukan penilaian
- Titik berketelitian buruk atau berperpindahan tidak wajar ditandai, tidak dibuang
- Indikasi lokasi tiruan disimpan sebagai fakta pada tabel dengan akses lebih sempit
- Ringkasan Rute disimpan permanen pada `sesi_tugas` dan menggantikan Titik yang sudah disusutkan
- Peta waktu nyata disuapi `posisi_terkini`, bukan `location_logs`
- Sesama pelaksana aktif satu SPT saling melihat posisi; haknya berakhir saat pencabutan
- Pemegang sesi melihat seluruh data tentang dirinya persis seperti yang dilihat pengawasnya
- Laporan yang masuk di luar Sesi Tugas berisi `sesi_tugas_id` kosong, dan itu keadaan yang sah
- Seluruh perhitungan hari kalender memakai zona waktu `Asia/Jakarta`, bukan zona waktu bawaan
- Sesi Tugas hanya dapat dibuka dari aplikasi Android terpasang; bentuk web menyembunyikan tombolnya
- Rute tidak pernah ditempelkan ke jaringan jalan dan posisi tidak pernah diperkirakan
- Panit yang sudah dicabut tetap membaca rute, tidak lagi memantau peta waktu nyata

---
---

# Bagian 11 — Pemeriksaan mandiri: calon Addendum 6.4-T

**Bukan untuk ditempel ke PRD.** Ini hasil pemeriksaan atas berkas ini sendiri: bagian mana yang
menyatakan hasil akhir tanpa menjelaskan jalur teknisnya. **Dua puluh dua titik ditemukan.**
Jumlahnya naik dari sepuluh pada Modul 6.3, sesuai pola yang sudah tercatat pada Checklist.

| No | Yang dinyatakan tanpa jalur teknis | Rujukan | Mengapa tidak boleh diasumsikan |
| --- | --- | --- | --- |
| 1 | Fungsi pembuka Sesi Tugas yang menutup sendiri sesi basi milik pemanggil | P-04, KP-6.4-04 | Wajib menggabungkan `for update` pada `penugasan` (Addendum 6.2-T 8.3), penutupan sesi lama, penyusunan ringkasannya, dan penyisipan sesi baru — seluruhnya dalam satu transaksi. Urutan salah menghasilkan galat `23505` yang menyesatkan |
| 2 | Pembaruan `posisi_terkini` dan `titik_terakhir_pada` saat Titik masuk | KP-6.4-13 | Butuh `on conflict do update` bersyarat `direkam_pada` lebih baru, jika tidak Titik antrean yang tiba belakangan akan menimpa posisi terkini dengan posisi lama |
| 3 | Kesamaan `penugasan_id` dan `sesi_tugas_id` | BR-55 | Kunci asing tidak dapat menegakkan kesamaan lintas dua kolom. Wajib pemicu |
| 4 | Penandaan Titik diragukan | KP-6.4-14, KP-6.4-15 | Pemeriksaan lompatan menuntut pembacaan Titik wajar sebelumnya pada sesi yang sama. Bentuk kueri yang salah membuat setiap penyisipan menyapu indeks |
| 5 | Tiga pemeriksaan waktu Titik | KP-6.4-21 | Meniru `fn_nilai_kiriman_tertunda`, tetapi pembandingnya `sesi_tugas.dibuka_pada`, bukan `penugasan.dibuat_pada` |
| 6 | Penyusunan Ringkasan Rute | KP-6.4-30, BR-58 | Jarak tempuh lewat PostGIS, akurasi median, dan penyandian polyline. Perlu ditetapkan mana yang dihitung di basis data dan mana di aplikasi |
| 7 | Satu fungsi penutup sesi yang dipanggil enam jalur berbeda | Section 5.17 | Enam pemanggil dengan sebab berbeda. Menuliskannya enam kali menjamin keenamnya lambat laun berbeda perilaku |
| 8 | Penutupan sesi saat SPT ditutup dan saat pelaksana dicabut | KP-6.4-28, KP-6.4-29 | Pemicunya hidup di tabel milik Modul 6.2, dan urutannya terhadap pemicu yang sudah ada di sana belum diperiksa |
| 9 | Pekerjaan berjadwal penutup sesi menggantung dan penyusut Titik | BR-54, BR-59 | Wajib memenuhi BR-36: penjadwal hanya salah satu dari dua jalur, bukan satu-satunya |
| 10 | Aturan akses baris keempat tabel | Bagian 7 | Klausa rekan aktif dan klausa Panit berada dalam satu kebijakan dengan perlakuan `dicabut_pada` yang berlawanan |
| 11 | Larangan klien menulis `posisi_terkini` | Bagian 7 | Menutup penulisan sambil tetap membiarkan pemicu menulis menuntut `security definer` beserta pencabutan hak yang benar |
| 12 | Pemanggilan pembatasan laju pada pengiriman Titik | BR-51 amandemen | **Berbeda dari tiga operasi lain.** Ketiganya berjalan lewat Fungsi Tepi, sedangkan Titik disisipkan langsung lewat PostgREST. Pemanggilan `periksa_batas_laju` karena itu harus dari pemicu, dan akibatnya terhadap penyisipan massal belum ditetapkan |
| 13 | Pengosongan Antrean Titik secara massal | KP-6.4-18, KP-6.4-19 | Penyisipan banyak baris dengan `on conflict (antrean_id) do nothing`. Perlu ditetapkan bagaimana kegagalan sebagian dilaporkan ke aplikasi |
| 14 | Pemasukan `posisi_terkini` ke publikasi Realtime | Section 4.2 | Beserta butir uji yang membuktikan aturan aksesnya benar-benar berlaku bagi pelanggan yang tidak berhak |
| 15 | Urutan abjad pemicu pada `location_logs` | Bagian I.8 | Empat pemicu `BEFORE INSERT` pada satu tabel. Urutannya menentukan, dan penamaan yang tidak dirancang mengubahnya tanpa terlihat |
| 16 | Pembuatan baris `notifikasi` dari modul ini | KP-6.4-25, KP-6.4-56 | Nilai `jenis` yang dipakai belum terdaftar, dan Modul 6.9 belum digali |
| 17 | Bentuk perintah pendaftaran tabel ke Data API | P-17 | Ketentuannya sedang dalam masa peralihan sampai Oktober 2026, sehingga wajib diverifikasi terhadap dokumentasi saat pembangunan, bukan disalin dari dokumen ini |
| 18 | Pengenalan bentuk web pada penanda perangkat | P-19, KP-6.4-68 | Awalan yang dipakai, cara membangkitkannya, dan cara fungsi pembuka sesi menolaknya |
| 19 | Penjagaan sesi berjalan pada pekerjaan penyusutan | P-22 | Klausa penggabungan ke `sesi_tugas` beserta biayanya pada tabel terbesar sistem |
| 20 | Penyisiran zona waktu atas seluruh kueri yang sudah tertulis | P-16 | Termasuk yang berada di dalam fungsi dan pemicu, bukan hanya pada tampilan |
| 21 | Deteksi berhentinya layanan latar depan dari sisi aplikasi | KP-6.4-65 | Cara membedakan layanan yang mati dari perangkat yang sekadar tanpa sinyal |
| 22 | Perhitungan arah gerak di sisi tampilan | P-20, KP-6.4-62 | Dari dua kedudukan terakhir, termasuk perlakuan saat keduanya berimpit |

---
---

# Bagian 12 — Pemeriksaan tabrakan dengan yang sudah ada

Selain sembilan temuan Bagian 0, rancangan berkas ini diperiksa terhadap kolom, tabel, dan aturan
yang sudah berdiri. Enam titik ditemukan, tiga di antaranya sengaja menyimpang dan karena itu
dinyatakan di sini agar tidak terbaca sebagai kekeliruan pada pemeriksaan silang berikutnya.

| Kode | Titik | Sifat | Ketetapan |
| --- | --- | --- | --- |
| P-10 | Penegakan BR-61 lewat hak akses per kolom **tidak mungkin** | Batas teknis | Pada Supabase seluruh pengguna memakai satu peran basis data `authenticated`, sehingga `grant select (kolom)` tidak dapat membedakan Kanit dari Panit. Diselesaikan dengan tabel `titik_penanda` (Section 5.22), bukan dengan penyembunyian di antarmuka yang dilarang Section 9.1 |
| P-11 | `akurasi` diganti nama menjadi `akurasi_meter` | Menyimpang dari versi 0.2, disengaja | Section 0.2 melarang sinonim, dan `laporan_harian` sudah memakai `akurasi_meter`. Perubahan aman karena tabel belum pernah dibangun |
| P-12 | `diterima_pada` dipertahankan, tidak menjadi `dibuat_pada` | Menyimpang dari I.10, disengaja | I.10 sendiri membuka pengecualian bagi nama yang membawa arti tambahan, dan `diterima_pada` menjadi dasar penilaian keterlambatan. Sama persis dengan alasan `dikirim_pada` dipertahankan pada laporan |
| P-13 | Hak baca rekan **berakhir** saat pencabutan, hak baca Panit **tidak** | Menyimpang dari pola BR-21, disengaja | Dinyatakan pada Bagian 2 beserta alasannya. Tanpa pernyataan ini, pemeriksaan silang berikutnya akan membacanya sebagai penerapan BR-21 yang keliru |
| P-14 | `posisi_terkini` menyalin `unit_id` dari `penugasan` | Redundansi disengaja | Tanpa salinan, setiap penyaringan lingkup peta menggabung tabel `penugasan` pada setiap kejadian waktu nyata. Nilainya tidak pernah berubah selama SPT hidup, sehingga risiko ketidakcocokan mendekati nol |
| P-15 | Section 12 melarang pelacakan di luar Sesi Tugas | Diperiksa, bersih | `posisi_terkini` dihapus saat sesi ditutup, sehingga tidak ada baris posisi yang bertahan di luar sesi. Tidak melanggar BR-01 maupun BR-13 |

## Yang diperiksa dan ternyata bersih

| Aspek | Hasil |
| --- | --- |
| Penomoran BR-54 sampai BR-67 | Tidak ada tabrakan. Kode tertinggi sebelumnya BR-53, sudah diperiksa terhadap seluruh berkas dan addendum sesuai Addendum 6.2-T Bagian 0.4 |
| Amandemen BR-51, BR-59, BR-62 | Ketiganya amandemen, bukan kode baru. Tidak ada kode yang dipakai ulang |
| Penomoran KP-6.4-01 sampai KP-6.4-72 | Ruang kode 6.4 belum pernah dipakai, tidak ada lompatan |
| Penomoran butir uji U-6.4-01 sampai U-6.4-11 | Tidak beririsan dengan U-6.2, U-6.3, maupun U-I |
| Indeks unik parsial `sesi_tugas` | Tidak dirancang ulang. Dipakai apa adanya dari Addendum 6.2-T Bagian 2 |
| Pengisian otomatis `laporan_harian.sesi_tugas_id` | Tidak terputus. Kolom yang dibaca `fn_isi_sesi_tugas` — `pengguna_id`, `penugasan_id`, `ditutup_pada` — seluruhnya tetap ada pada bentuk final `sesi_tugas` |
| Syarat `for update` Addendum 6.2-T Bagian 8.3 | Dipatuhi dan diperluas, lihat calon addendum butir 1 |
| BR-37 terhadap tabel baru | Tidak berlaku. Keempat tabel baru adalah tabel, bukan tampilan. Modul ini tidak membuat satu pun tampilan |
| BR-45 terhadap `location_logs` | Sudah terpenuhi sejak versi 0.2. Kolom `direkam_pada` sudah ada dan menjadi dasar seluruh penilaian waktu |
| Penyusutan terhadap `laporan_harian.sesi_tugas_id` | Tidak menghasilkan rujukan yatim, karena `sesi_tugas` tidak pernah dihapus |
| `titik_penanda` terhadap penyusutan | Ikut terhapus lewat `on delete cascade`, tidak meninggalkan baris tanpa induk |
| BR-64 terhadap BR-45 | Tidak bertentangan. BR-45 menetapkan **kolom mana** yang dipakai menilai waktu, BR-64 menetapkan **zona waktu mana** yang dipakai membacanya |
| BR-65 terhadap Section 11.1 dan BR-11 | Tidak mencabut bentuk web, hanya membatasi satu kemampuan, dan tombolnya disembunyikan bukan dinonaktifkan |
| BR-67 terhadap Addendum 6.3-T Celah 1 | Tidak bertentangan. Perhitungan jarak laporan ke titik SPT tetap berjalan; yang dilarang adalah **menggeser** koordinatnya |
| Amandemen BR-62 terhadap BR-21 | Tidak mencabut BR-21. Riwayat tetap terbaca selamanya; yang berakhir hanya pemantauan langsung |
| Amandemen BR-59 terhadap BR-58 | Sejalan. Ringkasan Rute tetap permanen, dan titik satuannya kini terjaga selama sesinya berjalan |
| `arah_derajat` terhadap daftar kolom beku | Tidak berlaku. Daftar kolom beku milik `laporan_harian`, dan `location_logs` tertutup bagi pembaruan oleh peran mana pun |

## Yang belum dapat diperiksa

Urutan pemicu pada `penugasan` — pemicu penutup sesi yang lahir dari KP-6.4-28 hidup berdampingan
dengan pemicu Modul 6.2 pada tabel yang sama. Pemeriksaannya menuntut daftar lengkap pemicu
`penugasan` beserta peristiwanya, dan itu pekerjaan Addendum 6.4-T butir 8, bukan berkas ini.

Ini disebutkan terus terang mengikuti catatan penutup Berita Acara: dugaan tidak sama dengan
temuan, dan menuliskan cara memutuskannya lebih baik daripada menebak ke arah mana pun.

---
---

# Bagian 13 — Butir uji Modul 6.4

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-6.4-01 | Pasang ketiga kebijakan Addendum 6.1-T apa adanya pada basis data yang sudah memuat `laporan_harian` bentuk final | Ketiganya gagal. Bila ada yang berhasil, tabelnya dibangun dengan kolom lama |
| U-6.4-02 | Buka sesi, matikan perangkat, jedakan pekerjaan berjadwal, tunggu lewat dua jam, buka sesi baru dari perangkat lain | Berhasil, dan sesi lama tertutup dengan sebab menggantung |
| U-6.4-03 | Kirim laporan pada pukul 05.00 WIB, lalu baca `v_belum_lapor` | Baris pengirim hilang dari daftar belum melapor |
| U-6.4-04 | Sisir seluruh dokumen mencari `::date` tanpa penyebutan zona waktu | Tidak ada satu pun tersisa. Dijalankan sebelum sesi coding dimulai |
| U-6.4-05 | Baca satu baris tiap tabel memakai kunci publik sebagai pengguna yang berhak | Tidak ada tabel yang menjawab kosong padahal barisnya ada. Dijalankan sebelum menyusun satu pun kebijakan akses |
| U-6.4-06 | Berlangganan `posisi_terkini` sebagai Anggota unit lain, lalu tutup sesi milik orang di unit berbeda | Peristiwa penghapusan hanya memuat UUID, tanpa kolom lain |
| U-6.4-07 | Cabut penunjukan Panit saat sesinya berjalan | Rute tetap terbaca, penanda pada peta waktu nyata hilang |
| U-6.4-08 | Buka SiPANTAU dari peramban, cari tombol Mulai Tugas, lalu kirim permintaan pembukaan sesi langsung ke basis data dari sana | Tombol tidak ada, dan permintaan langsungnya ditolak |
| U-6.4-09 | Cabut izin lokasi latar belakang, tekan Mulai Tugas | Ditolak dengan keterangan langkahnya. Aplikasi tidak mati |
| U-6.4-10 | Buka Sesi Tugas, matikan layar satu jam, periksa jumlah Titik | Titik terus bertambah mengikuti ambang yang berlaku |
| U-6.4-11 | Ulangi U-6.4-10 pada perangkat merek yang dikenal agresif menghentikan proses latar belakang | Bila terhenti, panduan penghematan daya muncul dengan sendirinya |

---
---

# Bagian 14 — Riwayat Koreksi

Menggantikan lapisan addendum. Yang disimpan cukup keterangan perubahannya; teks lamanya tidak
diulang, karena bentuk yang berlaku sudah berdiri di tempatnya masing-masing di atas.

| Kode | Yang keliru | Menjadi | Sifat kegagalannya |
| --- | --- | --- | --- |
| P-01 | Tiga kebijakan Addendum 6.1-T menyebut `laporan_harian.anggota_id` | Diganti `pelapor_id`; `location_logs` diperlakukan terpisah | Berisik saat kebijakan dibuat, tetapi penyelesaian tergesanya menimbulkan cacat kedua |
| P-02 | `location_logs.anggota_id` keliru sejak Kanit dan Panit boleh memegang sesi | Diganti `pengguna_id` | Senyap. Sistem jalan dengan nama yang menyesatkan |
| P-03 | Rute tidak dapat dipisah per sesi | Kolom `sesi_tugas_id` ditambahkan | Senyap. Rute berhari-hari menyatu jadi satu garis |
| P-04 | Sesi menggantung mengunci pemiliknya bila penjadwal berhenti | Fungsi pembuka sesi menutup sendiri sesi basi milik pemanggilnya | Senyap sampai seseorang tidak dapat Mulai Tugas tanpa sebab yang jelas |
| P-05 | Titik antrean ditolak setelah ganti perangkat | Kolom `penanda_perangkat_asal` ditambahkan | Senyap. Rute berlubang, dan lubangnya terbaca sebagai tidak bertugas |
| P-06 | Retensi tidak pernah dimulai bila SPT tidak ditutup | Ambang kedua, tiga ratus enam puluh lima hari | Pertumbuhan tabel tanpa batas |
| P-07 | `sesi_tugas` tanpa kolom waktu baku | `dibuat_pada` dan `diubah_pada` ditambahkan | Pelanggaran I.10 |
| P-08 | `sesi_tugas_id` kosong pada laporan di luar sesi | Dinyatakan sebagai keadaan yang sah | Berisiko dibaca modul lain sebagai cacat data |
| P-09 | `sesi_tugas` tanpa penanda perangkat | Kolom ditambahkan | Lapisan penegakan BR-25 bocor lewat pintu yang belum dijaga |
| P-10 | BR-61 tidak dapat ditegakkan lewat hak akses per kolom | Tabel `titik_penanda` terpisah | Batas teknis, bukan kekeliruan |
| P-16 | Perhitungan hari kalender memakai zona waktu bawaan | BR-64, seluruhnya memakai `Asia/Jakarta` | Senyap. Angka salah tiap hari, tanpa satu pun galat |
| P-17 | Tabel baru tidak otomatis terekspos ke Data API | BR-66 dan langkah tersendiri pada urutan pembangunan | Gejalanya menyerupai kesalahan aturan akses, sehingga menyesatkan |
| P-18 | Peristiwa penghapusan Realtime tidak disaring | Dipertahankan, batas kebocorannya dikunci | Batas teknis yang dipahami, bukan kekeliruan |
| P-19 | Sesi Tugas dapat dibuka dari bentuk web | BR-65, hanya dari aplikasi Android terpasang | Senyap. Fitur utama diam-diam tidak berjalan bagi sebagian pemakai |
| P-20 | Arah gerak tidak terekam | Kolom `arah_derajat` ditambahkan | Kekurangan tampilan |
| P-21 | Panit yang dicabut tetap memantau posisi langsung | BR-62 diamandemen, `posisi_terkini` memeriksa `dicabut_pada` | Lingkup data lebih luas dari yang dimaksud |
| P-22 | Penyusutan dapat menghapus titik sesi yang berjalan | BR-59 diamandemen | Tidak terjaga apa pun, meski mustahil dalam praktik |

Tujuh temuan memblokir. Lima berupa kegagalan senyap, dan kelimanya berbeda sifat: nama kolom yang
keliru, aturan yang saling mengunci, angka yang salah tanpa galat, gejala yang menyesatkan yang
memperbaikinya, dan fitur yang diam-diam tidak berjalan bagi sebagian pemakai.

Yang terakhir tidak ditemukan lewat pemeriksaan dokumen. Ia muncul karena pemilik produk
menanyakan hal yang paling mendasar — apakah ini benar-benar berjalan saat layar mati. Itu pola
yang layak dibawa ke modul berikutnya: pemeriksaan dokumen menemukan yang tidak konsisten,
pertanyaan tentang apa yang sebenarnya terjadi di tangan pemakai menemukan yang tidak berjalan.

---

## Yang perlu dikerjakan setelah menempel berkas ini

| Urutan | Langkah |
| --- | --- |
| 1 | Kerjakan Bagian 0 lebih dahulu. P-01, P-16, dan P-17 menyentuh modul yang sudah dinyatakan selesai dan tidak dapat ditunda |
| 2 | Tempelkan Bagian 1 sampai 10 ke tempatnya masing-masing pada PRD |
| 3 | Naikkan versi PRD menjadi 0.6 dan perbarui Riwayat Revisi |
| 4 | Perbarui Checklist Progres: Modul 6.4 selesai, **aturan berikutnya mulai BR-68**, artefak `sesi_tugas` dan `location_logs` dicentang, butir A-17 sampai A-19 ditambahkan |
| 5 | Gali Addendum 6.4-T memakai dua puluh dua butir pada Bagian 11 |
| 6 | Barulah lanjut ke Modul 6.7 sesuai urutan yang sudah ditetapkan |


---
---

# BAGIAN L — MODUL 6.6 MANAJEMEN USER & MODUL 6.9 NOTIFIKASI

# SiPANTAU — Modul 6.6 & 6.9 UTUH

**Manajemen User · Notifikasi**

Status: [FINAL] · Disusun 11 Agustus 2026 · Berkas tunggal, tanpa lapisan

Berkas ini menggantikan Section 6.6 dan Section 6.9 pada PRD dasar secara utuh. Keduanya digali bersamaan karena sama-sama ringan dan tidak saling bergantung, tetapi disusun sebagai dua bagian terpisah dan aturannya tidak dicampur.

Modul 6.6 sebagian besar sudah ditetapkan Addendum 6.1-T — dua Fungsi Tepi, Akun Pemeliharaan, aturan satu perangkat, dan aturan akses baris tabel `users`. Yang digali di sini adalah alur kerja dan antarmukanya. Modul 6.9 memfinalkan tabel `notifikasi` yang lahir berstatus [KERANGKA] di Addendum 6.2-T, beserta daftar lengkap nilai `jenis` yang sampai kini tersebar di lima modul tanpa pernah dikumpulkan.

---

## Penomoran yang berlaku

| Hal | Rentang |
| --- | --- |
| Aturan global yang lahir di berkas ini | BR-68 sampai BR-76 |
| Amandemen atas aturan yang sudah ada | BR-51 |
| **Aturan berikutnya dimulai dari** | **BR-77** |
| Kriteria penerimaan Modul 6.6 | KP-6.6-01 sampai KP-6.6-38 |
| Kriteria penerimaan Modul 6.9 | KP-6.9-01 sampai KP-6.9-41 |
| Butir uji | U-6.6-01 sampai U-6.6-06, U-6.9-01 sampai U-6.9-08 |
| Tabel baru | 5.23 `langganan_dorong` |
| Calon Addendum | 11 butir, Bagian 12 |

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 0.7 | 11 Agu 2026 | Modul 6.6 dan 6.9 digali. Tabel `notifikasi` difinalkan beserta enam belas nilai `jenis`. Tabel `langganan_dorong` lahir. Delapan temuan pra-penggalian ditutup |

---
---

# Bagian 0 — Temuan yang wajib dikerjakan lebih dahulu

Delapan temuan muncul saat menelusuri kedua modul terhadap berkas yang sudah berlaku. Tiga memblokir.

## Q-01 Jenis pemberitahuan tersebar di lima modul tanpa daftar — MEMBLOKIR

### Duduk perkaranya

Kolom `notifikasi.jenis` bertipe teks bebas. Addendum 6.2-T menyebut satu nilai, `spt_lewat_batas`, lalu menyerahkan daftar lengkapnya ke Modul 6.9. Sementara itu Modul 6.4 sudah menyisipkan baris pemberitahuan pada dua keadaan — sesi ditutup karena keluar aplikasi (KP-6.4-25) dan izin lokasi terputus (KP-6.4-56) — tanpa menyebutkan nilai `jenis` yang dipakai. Modul 6.4 sendiri mencatatnya sebagai calon addendum butir 16.

Modul 6.2 dan 6.3 juga memicu pemberitahuan pada beberapa keadaan, juga tanpa menyebut nilainya.

Tipe teks bebas tanpa daftar berarti setiap modul akan memilih nama sendiri. Satu kejadian yang sama berpotensi punya dua nama, dan penyaringan berdasarkan jenis tidak akan pernah dapat dipercaya. Ini pelanggaran Section 0.2 tentang larangan sinonim, hanya saja terjadi pada nilai data, bukan pada nama tabel.

### Ketetapan

> **BR-68.** Nilai `notifikasi.jenis` berasal dari daftar tertutup yang ditetapkan Modul 6.9. Penambahan nilai baru wajib melalui revisi PRD yang tercatat, dan wajib menyertakan penerima, pemicu, serta judul bakunya. Modul lain dilarang menyisipkan baris pemberitahuan dengan nilai di luar daftar.

Penegakannya bukan lewat tipe enum, melainkan lewat batasan pemeriksaan. Alasannya: menambah nilai pada enum Postgres tidak dapat dibatalkan di dalam transaksi, sedangkan batasan pemeriksaan dapat diganti dengan satu pernyataan.

```sql
alter table public.notifikasi
  add constraint chk_notifikasi_jenis
  check (jenis in (
    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
    'spt_dicabut', 'spt_ditutup',
    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
    'laporan_perlu_diperbaiki', 'laporan_disetujui',
    'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
    'akun_dinonaktifkan', 'kata_sandi_direset'
  ));
```

Daftar lengkap beserta penerima dan pemicunya ada pada Bagian 8.

## Q-02 Tabel `notifikasi` tidak dapat menampung pemberitahuan tanpa SPT — MEMBLOKIR

### Duduk perkaranya

Bentuk tabel dari Addendum 6.2-T hanya memiliki satu kolom rujukan, yaitu `penugasan_id`. Dua jenis pemberitahuan pada daftar Q-01 tidak berkaitan dengan SPT mana pun: `akun_dinonaktifkan` dan `kata_sandi_direset` berasal dari Modul 6.6.

Kolom `penugasan_id` memang boleh kosong, sehingga penyisipannya tidak akan gagal. Yang gagal adalah **pembukaannya**: pengguna menekan pemberitahuan, aplikasi mencoba membuka rincian SPT, dan tidak ada SPT yang dituju. Kegagalannya berpindah dari saat penyimpanan ke saat pemakaian, dan itu jenis yang lebih sulit ditemukan.

### Ketetapan

Ditambahkan dua kolom yang menyatakan tujuan secara umum, menggantikan ketergantungan pada satu kolom rujukan.

```sql
alter table public.notifikasi
  add column tujuan_jenis text,
  add column tujuan_id    uuid,
  add column laporan_id   uuid references public.laporan_harian(id) on delete cascade;

alter table public.notifikasi
  add constraint chk_notifikasi_tujuan
  check (tujuan_jenis is null or tujuan_jenis in ('penugasan', 'laporan', 'akun', 'tanpa_tujuan'));
```

Kolom `penugasan_id` dan `laporan_id` dipertahankan sebagai kunci asing sungguhan, karena keduanya memberi penghapusan berantai yang dibutuhkan: pemberitahuan tentang SPT yang dihapus permanen ikut terhapus tanpa perlu pekerjaan pembersih. Pasangan `tujuan_jenis` dan `tujuan_id` dipakai aplikasi untuk menentukan layar mana yang dibuka.

## Q-03 Pemberitahuan tidak mengikuti lingkup data setelah pencabutan — MEMBLOKIR SENYAP

### Duduk perkaranya

BR-14 menetapkan pemberitahuan mengikuti lingkup data. BR-21 menetapkan lingkup Panit ditentukan penugasan tempat ia ditunjuk, dan penunjukan yang berakhir tetap memberi hak baca atas riwayatnya. Bagian J butir J.7 memisahkan lebih jauh: hak baca riwayat bertahan, hak pemantauan langsung berakhir saat pencabutan.

Pemberitahuan berdiri di antara keduanya dan belum pernah ditetapkan masuk yang mana. Bila mengikuti hak baca riwayat, seorang Panit yang sudah dicabut dari sebuah SPT akan terus menerima pemberitahuan setiap kali ada laporan masuk pada SPT itu — berbulan-bulan setelah ia tidak lagi ada urusan dengannya.

Kesenyapannya terletak pada bentuk kegagalannya. Tidak ada galat, tidak ada data yang salah. Yang terjadi hanya seseorang menerima kabar yang bukan lagi urusannya, dan tidak seorang pun akan melaporkannya sebagai kerusakan.

### Ketetapan

> **BR-69.** Pemberitahuan mengikuti lingkup **pemantauan langsung**, bukan lingkup baca riwayat. Penerima ditentukan pada saat pemberitahuan dibuat, dan yang sudah dicabut dari sebuah penugasan tidak lagi menerima pemberitahuan tentangnya. Pemberitahuan yang sudah telanjur masuk sebelum pencabutan tetap terbaca, karena ia sudah menjadi riwayat.

Penegakannya berada pada fungsi pembuat pemberitahuan, bukan pada aturan akses baris. Aturan akses baris `notifikasi` cukup sederhana: seseorang membaca pemberitahuan yang ditujukan kepadanya.

## Q-04 Kasubdit dapat menonaktifkan dirinya sendiri hingga sistem terkunci — PENTING

### Duduk perkaranya

Contoh isian Modul 6.6 yang saya susun jauh sebelum penggalian ini memuat aturan bahwa sistem tidak boleh berada dalam keadaan tanpa satu pun akun Kasubdit aktif. Aturan itu tidak pernah masuk ke berkas mana pun yang berlaku.

Akun Pemeliharaan sebenarnya sudah menutup kemungkinan terkunci total. Tetapi Akun Pemeliharaan dimaksudkan sebagai jalan pemulihan darurat yang pemakaiannya tercatat penuh pada jejak audit, bukan sebagai penambal keteledoran yang dapat dicegah.

### Ketetapan

> **BR-70.** Sistem tidak boleh berada dalam keadaan tanpa satu pun akun berperan kasubdit yang aktif. Penonaktifan yang akan menghasilkan keadaan itu ditolak. Akun Pemeliharaan tidak dihitung sebagai penggantinya.

## Q-05 Penonaktifan akun tidak menghentikan Sesi Tugas — PENTING

### Duduk perkaranya

Addendum 6.3-K sudah menetapkan bahwa akun yang dinonaktifkan saat berada dalam Sesi Tugas akan ditutup paksa sesinya. Ketetapan itu tertulis pada bagian edge case, bukan pada spesifikasi Fungsi Tepi `nonaktifkan-akun` di Addendum 6.1-T.

Fungsi Tepi itulah yang benar-benar dijalankan. Selama penutupan sesi tidak tertulis di dalamnya, ia tidak akan terjadi, dan seorang yang akunnya sudah nonaktif akan tercatat selamanya sedang bertugas.

### Ketetapan

Fungsi Tepi `nonaktifkan-akun` bertambah dua langkah, dan seluruhnya berjalan dalam satu transaksi:

| Urutan | Langkah |
| --- | --- |
| 1 | Periksa kewenangan pemanggil |
| 2 | Periksa BR-70, tolak bila akan menghabiskan Kasubdit aktif terakhir |
| 3 | Tutup Sesi Tugas yang masih berjalan milik akun itu, sebab penutupan `akun_dinonaktifkan` |
| 4 | Setel `aktif` menjadi salah dan `sedang_bertugas` menjadi salah |
| 5 | Akhiri seluruh sesi masuknya |
| 6 | Sisipkan pemberitahuan `akun_dinonaktifkan` kepada Kanit unitnya |
| 7 | Catat jejak audit |

Nilai `akun_dinonaktifkan` ditambahkan ke daftar `sebab_penutupan` pada tabel `sesi_tugas` yang difinalkan Modul 6.4.

## Q-06 Penghitung pemberitahuan belum dibaca tidak dibatasi — SEDANG

Indeks parsial dari Addendum 6.2-T sudah menyiapkan pembacaan cepat pemberitahuan yang belum dibaca. Yang belum ditetapkan adalah apa yang terjadi ketika jumlahnya menjadi sangat besar.

Seorang Kanit dengan dua puluh SPT berjalan berpotensi menerima ratusan pemberitahuan dalam sepekan. Penghitung bertuliskan angka tiga digit tidak menyampaikan apa pun selain rasa tertinggal.

> **Ketetapan.** Penghitung pada lonceng berhenti pada angka sembilan puluh sembilan, di atas itu ditulis sebagai lebih dari sembilan puluh sembilan. Daftar pemberitahuan dimuat bertahap tiga puluh baris sekali muat.

## Q-07 Pemberitahuan tidak pernah disusutkan — SEDANG

Tabel `notifikasi` tumbuh terus tanpa ambang penyusutan. Ia jauh lebih lambat daripada `location_logs`, tetapi tetap tumbuh selamanya.

> **BR-71.** Pemberitahuan yang sudah dibaca dan berumur lebih dari sembilan puluh hari dihapus pekerjaan berjadwal. Pemberitahuan yang belum dibaca tidak pernah dihapus berapa pun umurnya, karena penghapusannya akan menghilangkan kabar yang belum pernah sampai.

Angka sembilan puluh hari disamakan dengan retensi `location_logs` agar tidak ada dua ambang berbeda yang harus diingat.

## Q-08 Zona waktu pada pengelompokan pemberitahuan — SEDANG

BR-64 mewajibkan seluruh perhitungan hari kalender memakai zona `Asia/Jakarta`. Daftar pemberitahuan dikelompokkan menurut hari, dan pengelompokan itu adalah perhitungan hari kalender.

> **Ketetapan.** Pengelompokan daftar pemberitahuan memakai `(dibuat_pada at time zone 'Asia/Jakarta')::date`. Ini penerapan BR-64, bukan aturan baru — dan pantas dicatat sebagai contoh jenis pelanggaran yang ditemukan V-03 pada Bagian J: aturan yang benar tetapi mudah terlewat di tempat baru.

---
---

# Bagian 1 — Section 6.6 Manajemen User

## 6.6.1 Deskripsi

Modul ini mengatur seluruh daur hidup akun pengguna: penambahan, penyuntingan, penonaktifan, dan pemulihan akses. Kewenangannya eksklusif milik Kasubdit, kecuali reset kata sandi yang juga dimiliki Kanit dalam lingkup unitnya.

Modul ini **tidak** menangani proses masuk dan keluar sistem, penentuan peran saat sesi berjalan, maupun pengikatan perangkat. Ketiganya milik Modul 6.1. Yang menjadi urusan modul ini adalah data akun itu sendiri beserta cara mengelolanya.

Sebagian besar mekanismenya sudah ditetapkan Addendum 6.1-T. Yang digali di sini adalah alur kerja, antarmuka, dan keadaan tepi yang muncul saat pengelolaan akun bersinggungan dengan modul lain yang sudah berjalan.

## 6.6.2 Cerita pengguna

| Kode | Cerita |
| --- | --- |
| CP-6.6-01 | Sebagai Kasubdit, saya ingin menambah akun bagi personel yang baru bergabung, agar ia dapat segera memakai sistem tanpa menunggu siapa pun |
| CP-6.6-02 | Sebagai Kasubdit, saya ingin mengubah peran seseorang ketika ia berpindah jabatan, agar hak aksesnya mengikuti tugasnya yang sekarang |
| CP-6.6-03 | Sebagai Kasubdit, saya ingin memindahkan seseorang ke unit lain, agar mutasi tercermin pada sistem tanpa membuat akun baru |
| CP-6.6-04 | Sebagai Kasubdit, saya ingin menonaktifkan akun personel yang purnabakti atau pindah kesatuan, agar ia tidak lagi dapat masuk, tanpa kehilangan riwayat pekerjaannya |
| CP-6.6-05 | Sebagai Kasubdit, saya ingin melihat kapan tiap akun terakhir masuk, agar saya tahu akun mana yang tidak pernah dipakai |
| CP-6.6-06 | Sebagai Kasubdit, saya ingin mencari akun berdasarkan nama atau NRP, agar saya tidak menelusuri daftar panjang satu per satu |
| CP-6.6-07 | Sebagai Kanit, saya ingin mereset kata sandi anggota saya yang lupa, agar ia dapat kembali bertugas hari itu juga tanpa menunggu Kasubdit |
| CP-6.6-08 | Sebagai Kanit, saya ingin melihat daftar personel unit saya beserta perannya, agar saya tahu siapa saja yang dapat saya tunjuk pada SPT |
| CP-6.6-09 | Sebagai personel yang baru dibuatkan akun, saya ingin diberi tahu kata sandi awal saya dengan cara yang tidak berisiko, agar saya dapat masuk untuk pertama kali |
| CP-6.6-10 | Sebagai pemegang Akun Pemeliharaan, saya ingin memulihkan akses ketika seluruh jalur normal buntu, agar sistem tidak pernah terkunci total |

## 6.6.3 Kriteria penerimaan

### Penambahan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.6-01 | Bila Kasubdit mengisi formulir tambah akun dengan seluruh kolom wajib terisi dan NRP belum terpakai, maka akun tersimpan berstatus aktif dan langsung dapat dipakai masuk |
| KP-6.6-02 | Bila NRP yang dimasukkan sudah dipakai akun lain yang aktif, maka penyimpanan ditolak dengan keterangan bahwa NRP sudah terpakai, disertai nama pemiliknya |
| KP-6.6-03 | Bila NRP yang dimasukkan pernah dipakai akun yang kini nonaktif, maka sistem meminta penegasan sebelum melanjutkan, dan menyebutkan siapa pemilik lamanya |
| KP-6.6-04 | Bila akun berhasil dibuat, maka `wajib_ganti_sandi` bernilai benar, sehingga pemakaian pertama dipaksa mengganti kata sandi (Modul 6.1) |
| KP-6.6-05 | Bila akun berhasil dibuat, maka kata sandi awal ditampilkan **satu kali** di layar Kasubdit dan tidak pernah dapat dilihat kembali |
| KP-6.6-06 | Bila peran yang dipilih adalah pemeliharaan, maka kolom unit dikosongkan dan tidak dapat diisi |
| KP-6.6-07 | Bila peran yang dipilih bukan pemeliharaan, maka unit wajib diisi dan hanya dapat dipilih dari unit yang berstatus aktif |
| KP-6.6-08 | Bila email sintetis yang terbentuk dari NRP sudah ada pada sistem autentikasi meski barisnya tidak ada pada tabel pengguna, maka pembuatan ditolak dengan keterangan bahwa akun perlu dipulihkan, bukan dibuat |

### Penyuntingan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.6-09 | Bila Kasubdit mengubah peran seseorang, maka perubahan berlaku pada permintaan berikutnya yang dikirim orang itu, tanpa mengeluarkannya dari sistem (Addendum 6.1-T) |
| KP-6.6-10 | Bila peran diubah dari kanit menjadi peran lain sementara ia masih tercatat sebagai penerbit SPT yang berjalan, maka perubahan **tetap diizinkan**, dan SPT itu tetap mencantumkannya sebagai penerbit |
| KP-6.6-11 | Bila unit seseorang diubah sementara ia masih menjadi pelaksana pada SPT unit lamanya, maka perubahan tetap diizinkan dan keanggotaannya pada SPT itu tidak dicabut otomatis |
| KP-6.6-12 | Bila NRP diubah, maka riwayat laporan, SPT, dan jejak audit miliknya tetap terhubung, karena seluruh rujukan memakai identitas internal |
| KP-6.6-13 | Bila NRP diubah, maka email sintetisnya ikut berubah mengikuti NRP baru, dan NRP lama tidak lagi dapat dipakai masuk |
| KP-6.6-14 | Bila Kasubdit mengubah data akunnya sendiri, maka perubahan diizinkan kecuali pada kolom peran dan aktif |

### Penonaktifan akun

| Kode | Kriteria |
| --- | --- |
| KP-6.6-15 | Bila akun dinonaktifkan, maka ia tidak lagi dapat masuk, sementara seluruh laporan, SPT, dan LHP yang pernah dibuatnya tetap tampil apa adanya |
| KP-6.6-16 | Bila akun yang sedang berada dalam Sesi Tugas dinonaktifkan, maka Sesi Tugas ditutup dengan sebab penonaktifan akun, Rute yang sudah terkumpul tersimpan utuh, dan pelacakan berhenti (Q-05) |
| KP-6.6-17 | Bila akun dinonaktifkan, maka seluruh sesi masuknya diakhiri sehingga perangkat yang sedang terbuka kehilangan akses pada permintaan berikutnya |
| KP-6.6-18 | Bila penonaktifan akan menghasilkan keadaan tanpa satu pun Kasubdit aktif, maka tindakan ditolak dengan keterangan bahwa harus tersisa sekurang-kurangnya satu (BR-70) |
| KP-6.6-19 | Bila Kasubdit menonaktifkan akunnya sendiri sementara masih ada Kasubdit aktif lain, maka tindakan diizinkan setelah penegasan yang menjelaskan akibatnya |
| KP-6.6-20 | Bila akun dinonaktifkan, maka Kanit unitnya menerima pemberitahuan `akun_dinonaktifkan` |
| KP-6.6-21 | Bila akun nonaktif diaktifkan kembali, maka ia dapat masuk lagi memakai kata sandi lamanya, dan `wajib_ganti_sandi` tidak disetel ulang |

### Reset kata sandi

| Kode | Kriteria |
| --- | --- |
| KP-6.6-22 | Bila Kasubdit mereset kata sandi siapa pun, maka kata sandi baru ditampilkan satu kali dan `wajib_ganti_sandi` bernilai benar |
| KP-6.6-23 | Bila Kanit mereset kata sandi personel di unitnya yang berperan anggota atau panit, maka tindakan diterima (BR-15) |
| KP-6.6-24 | Bila Kanit mencoba mereset kata sandi personel unit lain, atau yang berperan kanit maupun kasubdit, maka tindakan ditolak |
| KP-6.6-25 | Bila reset kata sandi dilakukan lebih dari sepuluh kali dalam satu jam oleh pemanggil yang sama, maka permintaan berikutnya ditolak dengan keterangan batas dan waktu dapat dicoba lagi (BR-51) |
| KP-6.6-26 | Bila kata sandi seseorang direset, maka yang bersangkutan menerima pemberitahuan `kata_sandi_direset` yang menyebut siapa yang meresetnya |
| KP-6.6-27 | Bila kata sandi direset, maka seluruh sesi masuk yang sedang berjalan milik akun itu diakhiri |

### Daftar dan pencarian

| Kode | Kriteria |
| --- | --- |
| KP-6.6-28 | Bila Kasubdit membuka daftar akun, maka seluruh akun dari seluruh unit tampil, termasuk yang nonaktif, dengan penanda yang membedakannya |
| KP-6.6-29 | Bila Kanit membuka daftar personel, maka hanya personel unitnya yang tampil, dan tombol tambah maupun nonaktifkan tidak muncul sama sekali (BR-11) |
| KP-6.6-30 | Bila kata kunci pencarian dimasukkan, maka daftar tersaring seketika berdasarkan nama atau NRP tanpa memuat ulang halaman |
| KP-6.6-31 | Bila daftar ditampilkan, maka kolom terakhir masuk memakai waktu nisbi, dan akun yang belum pernah masuk ditulis belum pernah masuk, bukan tanda hubung |
| KP-6.6-32 | Bila akun berstatus nonaktif ditampilkan, maka barisnya diredupkan dan tidak dapat dipilih untuk penugasan mana pun |

### Akun Pemeliharaan

| Kode | Kriteria |
| --- | --- |
| KP-6.6-33 | Bila Akun Pemeliharaan membuka daftar akun, maka ia dapat mereset kata sandi siapa pun tanpa batasan peran maupun unit |
| KP-6.6-34 | Bila Akun Pemeliharaan melakukan tindakan apa pun pada modul ini, maka satu baris jejak audit dicatat, termasuk untuk tindakan membaca |
| KP-6.6-35 | Bila Akun Pemeliharaan mencoba menambah akun baru atau menonaktifkan akun, maka tindakan ditolak. Kewenangannya terbatas pada pemulihan akses |

### Jejak audit

| Kode | Kriteria |
| --- | --- |
| KP-6.6-36 | Bila peran atau unit seseorang diubah, maka jejak audit mencatat nilai lama dan nilai barunya, bukan sekadar bahwa perubahan terjadi |
| KP-6.6-37 | Bila akun dibuat, dinonaktifkan, atau diaktifkan kembali, maka jejak audit mencatat pelaku, sasaran, dan waktunya |
| KP-6.6-38 | Bila kata sandi direset, maka jejak audit mencatat siapa mereset kata sandi siapa, **tanpa** memuat kata sandinya dalam bentuk apa pun |

## 6.6.4 Aturan modul

| Kode | Aturan |
| --- | --- |
| AM-6.6-01 | Kolom wajib saat menambah akun: nama, NRP, pangkat, peran, dan unit kecuali untuk peran pemeliharaan |
| AM-6.6-02 | Satu NRP hanya boleh dipakai satu akun aktif. NRP milik akun nonaktif boleh dipakai ulang setelah penegasan |
| AM-6.6-03 | Kata sandi awal dibangkitkan sistem sepanjang dua belas aksara, memuat huruf dan angka, tanpa aksara yang mudah tertukar seperti angka nol dan huruf O |
| AM-6.6-04 | Kata sandi awal ditampilkan satu kali dan tidak pernah disimpan dalam bentuk yang dapat dibaca kembali |
| AM-6.6-05 | Peran kasubdit hanya dapat diberikan atau dicabut oleh kasubdit lain yang aktif |
| AM-6.6-06 | Peran pemeliharaan tidak dapat diberikan lewat antarmuka mana pun. Akun itu dibuat sekali saat penyiapan sistem |
| AM-6.6-07 | Akun tidak pernah dihapus, hanya dinonaktifkan (BR-12) |
| AM-6.6-08 | Unit tidak pernah dihapus, hanya dinonaktifkan. Unit yang dinonaktifkan tidak dapat dipilih untuk akun baru, sementara akun yang sudah ada di dalamnya tetap berjalan |

## 6.6.5 Antarmuka dan kondisi tampilan

**Halaman Daftar Akun.** Tabel berisi nama, NRP, pangkat, peran, unit, status, dan waktu terakhir masuk. Kolom pencarian di atas tabel. Penyaring peran dan unit di sampingnya. Tombol Tambah Akun di kanan atas, hanya bagi Kasubdit.

**Halaman Tambah dan Sunting Akun.** Formulir sesuai AM-6.6-01. Tombol Nonaktifkan hanya muncul pada mode sunting dan diletakkan terpisah dari tombol simpan, dengan warna yang membedakannya.

**Layar kata sandi awal.** Muncul sekali setelah akun dibuat atau kata sandi direset. Menampilkan NRP dan kata sandi dalam aksara besar yang mudah dibacakan. Satu tombol untuk menyalin, satu tombol untuk menutup. Peringatan bahwa layar ini tidak dapat dibuka kembali ditulis sebelum tombol tutup, bukan sesudahnya.

**Kondisi kosong.** Daftar akun hanya kosong pada pemasangan pertama; keterangannya mengajak menambah akun pertama. Hasil pencarian yang kosong menampilkan keterangan bahwa tidak ada yang cocok beserta tombol menghapus penyaring.

**Kondisi memuat.** Kerangka baris abu-abu berkedip mengikuti gaya prototype, bukan layar putih.

**Kondisi galat.** Kegagalan penyimpanan ditampilkan pada formulir tanpa menutupnya, sehingga isian yang sudah diketik tidak hilang.

**Perbedaan antar peran.**

| Peran | Yang terlihat |
| --- | --- |
| Kasubdit | Seluruh halaman, seluruh tombol |
| Kanit | Daftar personel unitnya, hanya tombol Reset Kata Sandi |
| Panit | Menu tidak muncul sama sekali |
| Anggota | Menu tidak muncul sama sekali |
| Pemeliharaan | Daftar seluruh akun, hanya tombol Reset Kata Sandi |

## 6.6.6 Edge case modul

| Kode | Keadaan | Perlakuan |
| --- | --- | --- |
| EC-6.6-01 | Akun dinonaktifkan saat sedang dalam Sesi Tugas | Sesi ditutup dengan sebab penonaktifan, Rute tersimpan utuh (Q-05) |
| EC-6.6-02 | Akun dinonaktifkan saat memiliki laporan berstatus perlu diperbaiki | Laporan tetap ada dan tetap terbaca. Ia tidak akan pernah diperbaiki, dan itu keadaan yang sah |
| EC-6.6-03 | Akun dinonaktifkan saat masih tercantum sebagai pelaksana pada SPT berjalan | Penonaktifan diizinkan. Kanit unit diberi tahu agar dapat menunjuk penggantinya |
| EC-6.6-04 | Penonaktifan akan menghabiskan Kasubdit aktif terakhir | Ditolak (BR-70) |
| EC-6.6-05 | Penonaktifan akan menghabiskan Panit Penanggung Jawab terakhir pada sebuah SPT | Penonaktifan **tetap diizinkan**. Syarat minimum SPT dijaga saat pencabutan penunjukan, bukan saat penonaktifan akun. Kanit diberi tahu |
| EC-6.6-06 | Dua Kasubdit menonaktifkan satu sama lain pada saat hampir bersamaan | Penguncian baris menyerialkannya; yang kedua menghitung ulang dan ditolak BR-70 |
| EC-6.6-07 | Kata sandi direset sementara yang bersangkutan sedang mengisi formulir laporan | Sesinya berakhir pada permintaan berikutnya. Antrean Luring yang sudah terbentuk tetap tersimpan di perangkat dan terkirim setelah ia masuk kembali |
| EC-6.6-08 | NRP diubah sementara yang bersangkutan sedang masuk | Sesi berjalan tidak terganggu, tetapi masuk berikutnya harus memakai NRP baru |
| EC-6.6-09 | Unit dinonaktifkan sementara masih ada personel aktif di dalamnya | Diizinkan. Personel tetap berjalan, unit tidak lagi dapat dipilih untuk akun baru |
| EC-6.6-10 | Pembuatan akun gagal setelah pengguna terbentuk pada sistem autentikasi tetapi sebelum barisnya tersimpan | Fungsi Tepi membatalkan pembuatan pengguna itu sebelum mengembalikan galat. Tanpa ini, NRP akan tersandera dan tidak dapat dipakai ulang (KP-6.6-08) |

## 6.6.7 Ketergantungan

| Modul | Hubungan |
| --- | --- |
| 6.1 Autentikasi | Modul ini bergantung padanya. Dua Fungsi Tepi, tabel users, dan aturan aksesnya lahir di sana |
| 6.4 GPS Tracking | Modul ini memanggil penutupan Sesi Tugas saat akun dinonaktifkan |
| 6.9 Notifikasi | Modul ini menyisipkan dua jenis pemberitahuan |
| 6.2 Penugasan | Tidak bergantung, tetapi penonaktifan akun berakibat pada SPT yang berjalan |

---
---

# Bagian 2 — Section 6.9 Notifikasi

## 6.9.1 Deskripsi

Modul ini menyampaikan kejadian penting kepada pengguna yang berkepentingan, agar mereka tidak perlu memeriksa sistem secara berkala.

Ia **tidak** menentukan kejadian apa saja yang layak diberitahukan — itu ditetapkan modul yang memiliki kejadiannya. Yang menjadi urusan modul ini adalah menampung, mengantarkan, menampilkan, dan menyusutkan pemberitahuan, serta memastikan tidak seorang pun menerima kabar yang bukan haknya.

Modul ini adalah tempat berkumpulnya sesuatu yang sampai kini tersebar: enam belas jenis pemberitahuan yang lahir di lima modul berbeda, yang sebelumnya tidak pernah didaftar di satu tempat.

## 6.9.2 Cerita pengguna

| Kode | Cerita |
| --- | --- |
| CP-6.9-01 | Sebagai Anggota, saya ingin tahu segera ketika saya ditunjuk pada SPT baru, agar saya dapat bersiap tanpa menunggu diberi tahu lewat jalur lain |
| CP-6.9-02 | Sebagai Panit, saya ingin tahu ketika laporan masuk pada SPT yang saya tanggung jawabi, agar saya dapat meninjaunya pada hari yang sama |
| CP-6.9-03 | Sebagai Kanit, saya ingin tahu ketika sebuah SPT ditandai bermasalah, agar saya dapat turun tangan sebelum berlarut |
| CP-6.9-04 | Sebagai Kanit, saya ingin tahu ketika Sesi Tugas anggota saya terputus di lapangan, agar saya dapat menghubunginya |
| CP-6.9-05 | Sebagai Anggota, saya ingin tahu ketika Panit memberi catatan pada laporan saya, agar saya dapat menanggapinya |
| CP-6.9-06 | Sebagai pengguna mana pun, saya ingin melihat pemberitahuan yang belum saya baca dengan jelas, agar saya tahu mana yang sudah saya lewatkan |
| CP-6.9-07 | Sebagai pengguna mana pun, saya ingin membuka pemberitahuan dan langsung sampai ke layar yang dimaksud, agar saya tidak mencarinya sendiri |
| CP-6.9-08 | Sebagai Anggota di lapangan, saya ingin menerima pemberitahuan penting meski aplikasi sedang tidak saya buka, agar saya tidak terlambat mengetahuinya |

## 6.9.3 Kriteria penerimaan

### Pembuatan dan penerima

| Kode | Kriteria |
| --- | --- |
| KP-6.9-01 | Bila sebuah kejadian pemicu terjadi, maka satu baris pemberitahuan dibuat untuk **tiap** penerima yang berhak, bukan satu baris bersama |
| KP-6.9-02 | Bila nilai `jenis` yang disisipkan berada di luar daftar tertutup, maka penyisipan ditolak basis data (BR-68) |
| KP-6.9-03 | Bila penerima yang seharusnya sudah dicabut dari penugasan terkait, maka pemberitahuan tidak dibuat untuknya (BR-69) |
| KP-6.9-04 | Bila pelaku kejadian adalah orang yang sama dengan calon penerima, maka pemberitahuan tidak dibuat untuknya. Tidak seorang pun diberi tahu tentang perbuatannya sendiri |
| KP-6.9-05 | Bila akun penerima berstatus nonaktif, maka pemberitahuan tidak dibuat untuknya |
| KP-6.9-06 | Bila kejadian menyangkut sebuah SPT, maka baris pemberitahuan memuat `penugasan_id` sehingga penghapusan SPT ikut menghapusnya |
| KP-6.9-07 | Bila kejadian tidak menyangkut SPT mana pun, maka `tujuan_jenis` bernilai akun atau tanpa tujuan, dan aplikasi tidak mencoba membuka rincian SPT (Q-02) |

### Pembacaan dan penandaan

| Kode | Kriteria |
| --- | --- |
| KP-6.9-08 | Bila pengguna membuka daftar pemberitahuan, maka yang belum dibaca ditampilkan berbeda dari yang sudah dibaca |
| KP-6.9-09 | Bila pengguna membuka sebuah pemberitahuan, maka `dibaca_pada` terisi dan penghitung pada lonceng berkurang seketika |
| KP-6.9-10 | Bila pengguna menekan tandai semua sudah dibaca, maka seluruh pemberitahuan miliknya yang belum dibaca ditandai sekaligus |
| KP-6.9-11 | Bila pemberitahuan sudah pernah dibaca lalu dibuka lagi, maka `dibaca_pada` tidak berubah. Yang dicatat adalah kapan pertama kali dibaca |
| KP-6.9-12 | Bila jumlah yang belum dibaca melebihi sembilan puluh sembilan, maka penghitung ditulis sebagai lebih dari sembilan puluh sembilan (Q-06) |
| KP-6.9-13 | Bila daftar dibuka, maka tiga puluh baris dimuat lebih dahulu dan sisanya menyusul saat digulir |
| KP-6.9-14 | Bila daftar ditampilkan, maka pemberitahuan dikelompokkan menurut hari pada zona `Asia/Jakarta` (Q-08) |
| KP-6.9-15 | Bila pengguna menekan sebuah pemberitahuan, maka aplikasi membuka layar sesuai `tujuan_jenis` dan `tujuan_id` |
| KP-6.9-16 | Bila tujuan pemberitahuan sudah tidak ada, misalnya SPT-nya dihapus permanen, maka pemberitahuan itu juga sudah terhapus dan tidak pernah tampil |

### Pengantaran waktu nyata

| Kode | Kriteria |
| --- | --- |
| KP-6.9-17 | Bila pemberitahuan baru masuk sementara aplikasi terbuka, maka penghitung lonceng bertambah tanpa memuat ulang halaman |
| KP-6.9-18 | Bila sambungan waktu nyata terputus, maka penghitung diperbarui saat aplikasi dibuka kembali. Tidak ada pemberitahuan yang hilang karena terputusnya sambungan |
| KP-6.9-19 | Bila pengguna membuka aplikasi di dua perangkat, maka aturan satu perangkat Modul 6.1 berlaku dan hanya perangkat terakhir yang menerima |

### Pemberitahuan dorong

| Kode | Kriteria |
| --- | --- |
| KP-6.9-20 | Bila pengguna memasang aplikasi Android dan memberi izin, maka pemberitahuan berjenis mendesak dikirim sebagai pemberitahuan dorong meski aplikasi tertutup |
| KP-6.9-21 | Bila pengguna menolak izin pemberitahuan, maka seluruh pemberitahuan tetap masuk ke daftar dalam aplikasi. Penolakan izin tidak pernah menghilangkan pemberitahuan |
| KP-6.9-22 | Bila pemberitahuan dorong ditekan, maka aplikasi terbuka langsung pada layar tujuannya |
| KP-6.9-23 | Bila pengguna memakai bentuk web, maka pemberitahuan dorong tidak dikirim dan hanya daftar dalam aplikasi yang berjalan |
| KP-6.9-24 | Bila jenis pemberitahuan tidak ditandai mendesak, maka ia tidak dikirim sebagai dorongan, hanya masuk daftar |

### Penyusutan

| Kode | Kriteria |
| --- | --- |
| KP-6.9-25 | Bila pemberitahuan sudah dibaca dan berumur lebih dari sembilan puluh hari, maka ia dihapus pekerjaan berjadwal (BR-71) |
| KP-6.9-26 | Bila pemberitahuan belum dibaca, maka ia tidak pernah dihapus berapa pun umurnya |
| KP-6.9-27 | Bila pekerjaan berjadwal berhenti berjalan, maka daftar pemberitahuan tetap benar. Yang tertunda hanya pembersihannya (BR-36) |

### Lingkup dan keamanan

| Kode | Kriteria |
| --- | --- |
| KP-6.9-28 | Bila pengguna membaca tabel pemberitahuan, maka hanya baris yang ditujukan kepadanya yang terbaca |
| KP-6.9-29 | Bila pengguna mencoba menandai pemberitahuan milik orang lain sebagai sudah dibaca, maka tindakan ditolak |
| KP-6.9-30 | Bila pengguna mencoba menyisipkan baris pemberitahuan dari klien, maka tindakan ditolak. Pemberitahuan hanya lahir dari fungsi di dalam basis data |
| KP-6.9-31 | Bila isi pemberitahuan disusun, maka ia tidak memuat data yang tidak berhak dibaca penerimanya. Judul menyebut nomor SPT, isi tidak pernah memuat uraian laporan |

### Isi dan bahasa

| Kode | Kriteria |
| --- | --- |
| KP-6.9-32 | Bila pemberitahuan disusun, maka judulnya menyatakan kejadian dan isinya menyatakan keterangannya, keduanya tanpa menyimpulkan atau menuduh (Prinsip 0.6) |
| KP-6.9-33 | Bila Sesi Tugas terputus, maka pemberitahuan berbunyi bahwa pelacakan terhenti, bukan bahwa yang bersangkutan meninggalkan tugas |
| KP-6.9-34 | Bila SPT ditandai bermasalah, maka pemberitahuan menyebut penandaan itu terjadi dan siapa yang menandainya, tanpa mengulang alasannya |
| KP-6.9-35 | Bila pemberitahuan menyebut waktu, maka waktunya ditulis nisbi untuk yang kurang dari sehari dan sebagai tanggal untuk yang lebih lama |

### Pengaturan pengguna

| Kode | Kriteria |
| --- | --- |
| KP-6.9-36 | Bila pengguna membuka pengaturan pemberitahuan, maka ia dapat mematikan dorongan untuk jenis yang tidak mendesak |
| KP-6.9-37 | Bila pengguna mencoba mematikan dorongan untuk jenis mendesak, maka pilihan itu tidak tersedia. Kabar tentang tugas yang sedang berjalan tidak dapat dimatikan |
| KP-6.9-38 | Bila pengguna mematikan sebuah jenis, maka pemberitahuannya tetap masuk daftar dalam aplikasi. Yang dimatikan hanya dorongannya |
| KP-6.9-39 | Bila pengguna berganti perangkat, maka pengaturannya ikut karena tersimpan pada akun, bukan pada perangkat |
| KP-6.9-40 | Bila pengguna belum pernah mengatur apa pun, maka seluruh jenis mendesak menyala dan jenis tidak mendesak menyala |
| KP-6.9-41 | Bila Akun Pemeliharaan masuk, maka ia tidak menerima pemberitahuan apa pun, karena ia bukan bagian dari alur kerja |

## 6.9.4 Aturan modul

| Kode | Aturan |
| --- | --- |
| AM-6.9-01 | Pemberitahuan dibuat lewat satu fungsi terpusat, tidak pernah lewat penyisipan langsung dari modul mana pun |
| AM-6.9-02 | Fungsi pembuat menentukan penerima berdasarkan lingkup pemantauan langsung pada saat pembuatan (BR-69) |
| AM-6.9-03 | Judul pemberitahuan diambil dari daftar baku pada Bagian 8, tidak disusun bebas oleh pemanggil |
| AM-6.9-04 | Isi pemberitahuan boleh disusun pemanggil, tetapi tidak pernah memuat uraian laporan, kronologis, maupun identitas pihak dalam perkara |
| AM-6.9-05 | Pemberitahuan tidak pernah dapat dihapus pengguna. Yang dapat dilakukan hanya menandainya sudah dibaca |

## 6.9.5 Antarmuka dan kondisi tampilan

**Lonceng pada bilah atas.** Menampilkan penghitung yang belum dibaca. Menekannya membuka panel melayang berisi sepuluh pemberitahuan terbaru dan tautan ke halaman penuh.

**Halaman Pemberitahuan.** Daftar bertingkat menurut hari, dengan kepala kelompok bertuliskan Hari ini, Kemarin, lalu tanggal. Yang belum dibaca ditandai titik berwarna dan latar sedikit berbeda. Tombol tandai semua sudah dibaca di kanan atas.

**Halaman Pengaturan Pemberitahuan.** Daftar jenis yang dapat dimatikan, dikelompokkan menurut modul asalnya. Jenis mendesak ditampilkan dengan penanda bahwa ia tidak dapat dimatikan, bukan disembunyikan — pengguna berhak tahu apa saja yang akan sampai kepadanya.

**Kondisi kosong.** Belum ada pemberitahuan sama sekali menampilkan keterangan bahwa kabar tentang penugasan dan laporan akan muncul di sini.

**Kondisi memuat.** Kerangka baris berkedip, bukan pemutar berputar.

**Perbedaan antar peran.** Tidak ada. Seluruh peran memakai halaman yang sama; yang berbeda hanya isinya, yang sudah dijaga lingkup data.

## 6.9.6 Edge case modul

| Kode | Keadaan | Perlakuan |
| --- | --- | --- |
| EC-6.9-01 | Penerima dicabut dari SPT tepat setelah pemberitahuan dibuat | Pemberitahuan tetap terbaca. Ia sudah menjadi riwayat (BR-69) |
| EC-6.9-02 | SPT dihapus permanen sementara pemberitahuannya belum dibaca | Pemberitahuan ikut terhapus lewat penghapusan berantai |
| EC-6.9-03 | Akun penerima dinonaktifkan sebelum pemberitahuannya dibaca | Baris tetap ada dan tidak dihapus. Bila akun diaktifkan kembali, ia masih menerimanya |
| EC-6.9-04 | Satu kejadian menghasilkan penerima yang sama dua kali, misalnya seseorang Panit Penanggung Jawab sekaligus pelaksana | Fungsi pembuat menyaring duplikat. Satu orang menerima satu baris |
| EC-6.9-05 | Puluhan pemberitahuan lahir sekaligus, misalnya SPT dengan banyak pelaksana | Seluruhnya disisipkan dalam satu pernyataan, bukan satu per satu |
| EC-6.9-06 | Sambungan waktu nyata terputus lama | Penghitung diperbarui saat aplikasi dibuka. Tidak ada yang hilang |
| EC-6.9-07 | Izin pemberitahuan dicabut pengguna di pengaturan perangkat | Dorongan berhenti, daftar dalam aplikasi tetap berjalan |
| EC-6.9-08 | Penanda perangkat untuk dorongan menjadi tidak berlaku | Baris langganan dibersihkan pekerjaan berjadwal. Kegagalan pengiriman dorongan tidak pernah menggagalkan pembuatan pemberitahuan |

## 6.9.7 Ketergantungan

| Modul | Hubungan |
| --- | --- |
| 6.2, 6.3, 6.4, 6.6 | Keempatnya memicu pemberitahuan. Modul ini yang mengantarkannya |
| 6.5 Dashboard | Menampilkan lonceng dan penghitung |
| 6.1 Autentikasi | Aturan satu perangkat menentukan ke mana dorongan dikirim |

---
---

# Bagian 3 — Model Data

## 5.20 Tabel notifikasi — bentuk final

Menggantikan bentuk kerangka pada Addendum 6.2-T Bagian 1.4.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Identitas unik |
| penerima_id | uuid | Mengacu ke users. Satu baris untuk satu penerima |
| jenis | text | Salah satu dari enam belas nilai pada Bagian 8. Ditegakkan batasan pemeriksaan |
| judul | text | Diambil dari daftar baku, tidak disusun bebas |
| isi | text | Keterangan singkat. Tidak pernah memuat uraian laporan atau identitas pihak |
| tujuan_jenis | text | penugasan, laporan, akun, atau tanpa_tujuan. Menentukan layar yang dibuka |
| tujuan_id | uuid | Identitas sasaran sesuai tujuan_jenis |
| penugasan_id | uuid | Kunci asing sungguhan. Memberi penghapusan berantai |
| laporan_id | uuid | Kunci asing sungguhan. Memberi penghapusan berantai |
| mendesak | boolean | Menentukan apakah dikirim sebagai dorongan |
| dibaca_pada | timestamptz | Kosong selama belum dibaca |
| dibuat_pada | timestamptz | Waktu pembuatan |

```sql
alter table public.notifikasi
  add column tujuan_jenis text,
  add column tujuan_id    uuid,
  add column laporan_id   uuid references public.laporan_harian(id) on delete cascade,
  add column mendesak     boolean not null default false;

alter table public.notifikasi
  add constraint chk_notifikasi_jenis check (jenis in (
    'spt_diterbitkan', 'spt_ditugaskan', 'spt_lewat_batas', 'spt_bermasalah',
    'spt_dicabut', 'spt_ditutup',
    'laporan_masuk', 'laporan_dikoreksi', 'catatan_diberikan',
    'laporan_perlu_diperbaiki', 'laporan_disetujui',
    'sesi_ditutup_keluar_aplikasi', 'izin_lokasi_terputus', 'sesi_menggantung',
    'akun_dinonaktifkan', 'kata_sandi_direset'
  )),
  add constraint chk_notifikasi_tujuan check (
    tujuan_jenis is null or tujuan_jenis in ('penugasan', 'laporan', 'akun', 'tanpa_tujuan')
  );

create index if not exists idx_notifikasi_penyusutan
  on public.notifikasi (dibaca_pada)
  where dibaca_pada is not null;

grant select, update on public.notifikasi to authenticated;
```

Hanya `select` dan `update` yang diberikan. Tidak ada `insert`, karena pemberitahuan hanya lahir dari fungsi di dalam basis data (KP-6.9-30). Tidak ada `delete`, karena pengguna tidak pernah menghapusnya (AM-6.9-05).

## 5.23 Tabel langganan_dorong — tabel baru

Menyimpan penanda perangkat untuk pengantaran pemberitahuan dorong, beserta pengaturan jenis yang dimatikan pengguna.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | uuid | Identitas unik |
| pengguna_id | uuid | Mengacu ke users |
| penanda_perangkat | text | Penanda perangkat dari Modul 6.1, menghubungkan langganan dengan perangkat yang sah |
| penanda_dorong | text | Penanda yang dipakai layanan pengantaran |
| jenis_dimatikan | text[] | Daftar jenis yang dimatikan pengguna. Jenis mendesak diabaikan bila muncul di sini |
| aktif | boolean | Dimatikan saat pengantaran gagal berulang |
| dibuat_pada | timestamptz | Waktu pembuatan |
| diubah_pada | timestamptz | Waktu perubahan terakhir |

```sql
create table public.langganan_dorong (
  id                uuid primary key default gen_random_uuid(),
  pengguna_id       uuid not null references public.users(id) on delete cascade,
  penanda_perangkat text not null,
  penanda_dorong    text not null,
  jenis_dimatikan   text[] not null default '{}',
  aktif             boolean not null default true,
  dibuat_pada       timestamptz not null default now(),
  diubah_pada       timestamptz not null default now()
);

create unique index uq_langganan_dorong_perangkat
  on public.langganan_dorong (pengguna_id, penanda_perangkat);

grant select, insert, update on public.langganan_dorong to authenticated;
```

Pengaturan disimpan pada tabel ini, bukan pada `users`, agar KP-6.9-39 terpenuhi dengan sendirinya: pengaturan melekat pada akun dan ikut berpindah perangkat, sementara penanda dorongnya tidak.

## Hubungan antar entitas — tambahan

| Hubungan | Jenis | Catatan |
| --- | --- | --- |
| users ke notifikasi | satu ke banyak | Lewat penerima_id |
| penugasan ke notifikasi | satu ke banyak | Penghapusan berantai |
| laporan_harian ke notifikasi | satu ke banyak | Penghapusan berantai |
| users ke langganan_dorong | satu ke banyak | Satu baris per perangkat |

---
---

# Bagian 4 — Fungsi pembuat pemberitahuan

Satu fungsi terpusat, dipanggil seluruh modul. Ia menegakkan BR-69, KP-6.9-04, dan KP-6.9-05 di satu tempat, sehingga tidak ada modul yang perlu mengingatnya sendiri.

```sql
create or replace function public.buat_notifikasi(
  p_jenis        text,
  p_penerima     uuid[],
  p_judul        text,
  p_isi          text,
  p_tujuan_jenis text,
  p_tujuan_id    uuid,
  p_penugasan_id uuid default null,
  p_laporan_id   uuid default null,
  p_mendesak     boolean default false,
  p_pelaku       uuid default null
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  insert into public.notifikasi
    (penerima_id, jenis, judul, isi, tujuan_jenis, tujuan_id,
     penugasan_id, laporan_id, mendesak)
  select distinct u.id, p_jenis, p_judul, p_isi, p_tujuan_jenis, p_tujuan_id,
         p_penugasan_id, p_laporan_id, p_mendesak
    from unnest(p_penerima) as t(id)
    join public.users u on u.id = t.id
   where u.aktif = true                              -- KP-6.9-05
     and u.peran <> 'pemeliharaan'                    -- KP-6.9-41
     and (p_pelaku is null or u.id <> p_pelaku);      -- KP-6.9-04

  get diagnostics n = row_count;
  return n;
end;
$$;
```

Kata `distinct` menegakkan EC-6.9-04 tanpa perlu penyaringan tambahan di pihak pemanggil. Penyisipan berlangsung dalam satu pernyataan, memenuhi EC-6.9-05.

Penentuan siapa penerimanya tetap menjadi urusan pemanggil, karena hanya ia yang tahu konteks kejadiannya. Yang dipusatkan di sini adalah penyaringan yang berlaku bagi seluruh kejadian.

## Fungsi bantu penentu penerima

Tiga bentuk yang paling sering dipakai, disediakan agar pemanggil tidak menyusun kueri yang sama berulang-ulang. Ketiganya menegakkan BR-69 dengan memeriksa `dicabut_pada`.

```sql
-- Pengawas sebuah SPT: Kanit unit ditambah Panit Penanggung Jawab yang aktif
create or replace function public.penerima_pengawas_spt(p_penugasan_id uuid)
returns uuid[]
language sql
security definer
set search_path = ''
as $$
  select array_agg(distinct id) from (
    select u.id
      from public.penugasan p
      join public.users u on u.unit_id = p.unit_id and u.peran = 'kanit'
     where p.id = p_penugasan_id
    union
    select pp.panit_id
      from public.penugasan_panit pp
     where pp.penugasan_id = p_penugasan_id
       and pp.dicabut_pada is null
  ) s;
$$;

-- Pelaksana sebuah SPT yang belum dicabut
create or replace function public.penerima_pelaksana_spt(p_penugasan_id uuid)
returns uuid[]
language sql
security definer
set search_path = ''
as $$
  select array_agg(pelaksana_id)
    from public.penugasan_pelaksana
   where penugasan_id = p_penugasan_id
     and dicabut_pada is null;
$$;
```

---
---

# Bagian 5 — Aturan akses baris

## notifikasi

```sql
alter table public.notifikasi enable row level security;

create policy notifikasi_baca_milik_sendiri on public.notifikasi
for select to authenticated
using (penerima_id = (select auth.uid()));

create policy notifikasi_tandai_milik_sendiri on public.notifikasi
for update to authenticated
using (penerima_id = (select auth.uid()))
with check (penerima_id = (select auth.uid()));
```

Kebijakan pembaruan sengaja tidak membatasi kolom mana yang boleh diubah, karena hak `update` di tingkat tabel sudah dibatasi lewat pemicu berikut. Tanpa pemicu ini, seseorang dapat mengubah judul atau isi pemberitahuannya sendiri — tidak berbahaya bagi orang lain, tetapi merusak keandalan riwayat.

```sql
create or replace function public.fn_notifikasi_hanya_tandai_baca()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.penerima_id  := old.penerima_id;
  new.jenis        := old.jenis;
  new.judul        := old.judul;
  new.isi          := old.isi;
  new.tujuan_jenis := old.tujuan_jenis;
  new.tujuan_id    := old.tujuan_id;
  new.penugasan_id := old.penugasan_id;
  new.laporan_id   := old.laporan_id;
  new.mendesak     := old.mendesak;
  new.dibuat_pada  := old.dibuat_pada;

  -- Yang pertama dicatat, itu yang berlaku (KP-6.9-11)
  if old.dibaca_pada is not null then
    new.dibaca_pada := old.dibaca_pada;
  end if;

  return new;
end;
$$;

create trigger trg_notifikasi_hanya_tandai_baca
  before update on public.notifikasi
  for each row
  execute function public.fn_notifikasi_hanya_tandai_baca();
```

## langganan_dorong

```sql
alter table public.langganan_dorong enable row level security;

create policy langganan_milik_sendiri on public.langganan_dorong
for all to authenticated
using (pengguna_id = (select auth.uid()))
with check (pengguna_id = (select auth.uid()));
```

## users — tambahan untuk Modul 6.6

Kebijakan baca dan tulis tabel `users` sudah ditetapkan Addendum 6.1-T. Yang ditambahkan di sini hanya satu: Kasubdit dapat memperbarui baris siapa pun dalam rangka penyuntingan akun.

```sql
create policy users_sunting_oleh_kasubdit on public.users
for update to authenticated
using ((select sipantau_auth.peran_saya()) = 'kasubdit')
with check ((select sipantau_auth.peran_saya()) = 'kasubdit');
```

Penonaktifan tidak berjalan lewat kebijakan ini melainkan lewat Fungsi Tepi, karena ia perlu mengakhiri sesi masuk yang hanya dapat dilakukan dengan kunci istimewa.

---
---

# Bagian 6 — Pekerjaan berjadwal

```sql
create or replace function public.kerja_susutkan_notifikasi()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.notifikasi
   where dibaca_pada is not null
     and dibaca_pada < now() - interval '90 days';
$$;

select cron.schedule(
  'susutkan-notifikasi',
  '20 1 * * *',                       -- 01:20 UTC, sekitar 08:20 WIB
  $$ select public.kerja_susutkan_notifikasi() $$
);

create or replace function public.kerja_bersihkan_langganan_mati()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.langganan_dorong
   where aktif = false
     and diubah_pada < now() - interval '30 days';
$$;

select cron.schedule(
  'bersihkan-langganan-mati',
  '30 1 * * 0',                       -- sepekan sekali
  $$ select public.kerja_bersihkan_langganan_mati() $$
);
```

Keduanya hanya merapikan. Tidak ada kebenaran sistem yang bergantung padanya, sesuai BR-36.

---
---

# Bagian 7 — Aturan global baru

| Kode | Aturan | Modul |
| --- | --- | --- |
| BR-68 | Nilai `notifikasi.jenis` berasal dari daftar tertutup Modul 6.9. Penambahan wajib lewat revisi PRD tercatat beserta penerima, pemicu, dan judul bakunya | Seluruh modul |
| BR-69 | Pemberitahuan mengikuti lingkup pemantauan langsung, bukan lingkup baca riwayat. Yang sudah dicabut tidak lagi menerima. Yang sudah masuk sebelum pencabutan tetap terbaca | 6.9 |
| BR-70 | Sistem tidak boleh berada dalam keadaan tanpa satu pun akun kasubdit yang aktif. Akun Pemeliharaan tidak dihitung sebagai penggantinya | 6.6 |
| BR-71 | Pemberitahuan yang sudah dibaca dan berumur lebih dari sembilan puluh hari dihapus. Yang belum dibaca tidak pernah dihapus | 6.9 |
| BR-72 | Pemberitahuan hanya lahir dari fungsi terpusat di dalam basis data. Tidak ada modul yang menyisipkan baris `notifikasi` secara langsung | Seluruh modul |
| BR-73 | Isi pemberitahuan tidak pernah memuat uraian laporan, kronologis, maupun identitas pihak dalam perkara. Ia menyebut kejadian dan sasarannya, bukan isinya | 6.9 |
| BR-74 | Tidak seorang pun menerima pemberitahuan tentang perbuatannya sendiri | 6.9 |
| BR-75 | Jenis pemberitahuan yang ditandai mendesak tidak dapat dimatikan pengguna. Yang tidak mendesak dapat dimatikan dorongannya, tetapi tetap masuk daftar dalam aplikasi | 6.9 |
| BR-76 | Kata sandi awal maupun hasil reset ditampilkan satu kali dan tidak pernah disimpan dalam bentuk yang dapat dibaca kembali, termasuk pada jejak audit | 6.6 |

## Amandemen BR-51

Daftar tertutup operasi yang dibatasi lajunya bertambah satu baris.

| Operasi | Batas | Jendela | Alasan |
| --- | --- | --- | --- |
| `buat_akun` | 20 | 1 jam | Pembuatan akun massal yang tidak wajar patut tertahan, sementara dua puluh cukup untuk pendaftaran satu unit sekaligus |

`nonaktifkan_akun` sengaja **tidak** dibatasi. Penonaktifan massal yang tidak wajar sudah tertahan BR-70 pada titik yang paling menentukan, dan membatasinya berisiko menghalangi tindakan yang justru mendesak.

---
---

# Bagian 8 — Daftar tertutup jenis pemberitahuan

Enam belas jenis, dikelompokkan menurut modul asalnya. Kolom mendesak menentukan apakah ia dikirim sebagai dorongan dan apakah dapat dimatikan pengguna.

## Dari Modul 6.2 Penugasan

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `spt_diterbitkan` | SPT berpindah dari draf ke baru | Panit Penanggung Jawab | Ya | Penugasan baru diterbitkan |
| `spt_ditugaskan` | Seseorang ditunjuk sebagai pelaksana | Pelaksana yang ditunjuk | Ya | Anda ditunjuk pada penugasan |
| `spt_lewat_batas` | Pekerjaan berjadwal harian | Kanit penerbit | Tidak | Batas waktu penugasan terlampaui |
| `spt_bermasalah` | Status ditandai bermasalah | Kanit unit, Kasubdit | Ya | Penugasan ditandai bermasalah |
| `spt_dicabut` | Penunjukan pelaksana dicabut | Pelaksana yang dicabut | Tidak | Penunjukan Anda dicabut |
| `spt_ditutup` | Status berpindah ke selesai atau dibatalkan | Pelaksana yang belum dicabut | Tidak | Penugasan ditutup |

## Dari Modul 6.3 Pelaporan

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `laporan_masuk` | Laporan baru tersimpan | Panit Penanggung Jawab, Kanit unit | Tidak | Laporan kegiatan masuk |
| `laporan_dikoreksi` | Laporan disunting setelah pernah dibaca peninjau | Peninjau yang pernah membacanya | Tidak | Laporan disunting |
| `catatan_diberikan` | Catatan peninjau tersimpan | Pelapor | Ya | Catatan pada laporan Anda |
| `laporan_perlu_diperbaiki` | Catatan berjenis minta perbaikan | Pelapor | Ya | Laporan perlu diperbaiki |
| `laporan_disetujui` | Laporan disetujui | Pelapor | Tidak | Laporan disetujui |

## Dari Modul 6.4 GPS Tracking

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `sesi_ditutup_keluar_aplikasi` | Sesi ditutup karena pengguna keluar aplikasi (KP-6.4-25) | Kanit unit, Panit Penanggung Jawab | Ya | Sesi tugas terhenti |
| `izin_lokasi_terputus` | Izin lokasi dicabut saat sesi berjalan (KP-6.4-56) | Kanit unit, Panit Penanggung Jawab | Ya | Pelacakan lokasi terhenti |
| `sesi_menggantung` | Pekerjaan berjadwal menutup sesi yang dua jam tanpa pembaruan | Pemilik sesi, Kanit unit | Tidak | Sesi tugas ditutup sistem |

Ketiganya menutup calon addendum butir 16 pada Modul 6.4. Nilai yang dipakai sudah tetap dan tidak boleh diganti.

## Dari Modul 6.6 Manajemen User

| Jenis | Pemicu | Penerima | Mendesak | Judul baku |
| --- | --- | --- | --- | --- |
| `akun_dinonaktifkan` | Akun dinonaktifkan | Kanit unit yang bersangkutan | Tidak | Akun personel dinonaktifkan |
| `kata_sandi_direset` | Kata sandi direset orang lain | Pemilik akun | Ya | Kata sandi Anda direset |

Keduanya bertujuan `akun`, bukan `penugasan`, dan tidak memiliki `penugasan_id`. Inilah yang menuntut Q-02.

## Catatan penyusunan judul

Seluruh judul menyatakan kejadian, bukan penilaian. Perhatikan `izin_lokasi_terputus` berjudul "Pelacakan lokasi terhenti", bukan "Anggota mematikan lokasi" — sebab sistem tidak mengetahui apakah izin dicabut dengan sengaja, perangkatnya bermasalah, atau pembaruan sistem mengubah pengaturannya. Menyebut kejadian selalu benar; menyebut sebab belum tentu (Prinsip 0.6, KP-6.9-33).

---
---

# Bagian 9 — Perubahan Section lain

## Section 2.3 Matriks hak akses — baris tambahan

| Kemampuan | Kasubdit | Kanit | Panit | Anggota |
| --- | --- | --- | --- | --- |
| Menambah akun | Ya, eksklusif | Tidak | Tidak | Tidak |
| Menyunting akun | Ya, eksklusif | Tidak | Tidak | Tidak |
| Menonaktifkan akun | Ya, eksklusif | Tidak | Tidak | Tidak |
| Mereset kata sandi | Ya, siapa pun | Ya, anggota dan panit di unitnya | Tidak | Tidak |
| Melihat daftar akun | Seluruh unit | Unitnya, hanya baca | Tidak | Tidak |
| Menerima pemberitahuan | Sesuai lingkupnya | Sesuai lingkupnya | Sesuai penugasannya | Sesuai penugasannya |
| Mengatur pemberitahuan | Ya | Ya | Ya | Ya |

Akun Pemeliharaan tidak dimasukkan ke matriks karena ia bukan peran organisasi. Kewenangannya ditetapkan KP-6.6-33 sampai KP-6.6-35.

## Section 3 Glosarium — istilah tambahan

| Istilah | Definisi tunggal |
| --- | --- |
| **Pemberitahuan** | Satu baris kabar tentang sebuah kejadian, ditujukan kepada satu orang. Dilarang disebut notifikasi dalam prosa, meski nama tabelnya `notifikasi` |
| **Jenis Pemberitahuan** | Salah satu dari enam belas nilai pada daftar tertutup Bagian 8 |
| **Pemberitahuan Mendesak** | Jenis yang dikirim sebagai dorongan dan tidak dapat dimatikan pengguna |
| **Dorongan** | Pengantaran pemberitahuan ke perangkat saat aplikasi tidak sedang dibuka. Hanya pada aplikasi Android terpasang |
| **Kata Sandi Awal** | Kata sandi yang dibangkitkan sistem saat akun dibuat atau direset. Ditampilkan satu kali |

## Section 8 Edge case — bagian tambahan 8.11 dan 8.12

**8.11 Pengelolaan akun**

- Akun dinonaktifkan saat berada dalam Sesi Tugas
- Penonaktifan akan menghabiskan Kasubdit aktif terakhir
- Pembuatan akun gagal setelah pengguna terbentuk pada sistem autentikasi
- NRP diubah sementara yang bersangkutan sedang masuk
- Unit dinonaktifkan sementara masih berisi personel aktif

**8.12 Pemberitahuan**

- Penerima dicabut tepat setelah pemberitahuan dibuat
- Satu kejadian menghasilkan penerima yang sama dua kali
- Sambungan waktu nyata terputus lama
- Penanda dorong menjadi tidak berlaku
- Puluhan pemberitahuan lahir sekaligus

## Section 9.6 Jejak audit — jenis tambahan

`buat_akun`, `sunting_akun`, `nonaktifkan_akun`, `aktifkan_akun`, `ubah_peran`, `ubah_unit`, `reset_kata_sandi`.

Jenis `ubah_peran` dan `ubah_unit` dipisahkan dari `sunting_akun` karena keduanya mengubah lingkup data seseorang, dan itu berbeda sifatnya dari mengubah pangkat atau memperbaiki ejaan nama.

## Section 4.2 Tumpukan teknologi — baris tambahan

| Lapisan | Teknologi | Alasan pemilihan |
| --- | --- | --- |
| Pemberitahuan dorong | Layanan pengantaran pemberitahuan pada Capacitor | Satu-satunya jalan mengantarkan kabar saat aplikasi tertutup. Hanya pada bentuk Android terpasang, sejalan dengan BR-65 |

## Section 12 Di luar cakupan — butir tambahan

| Tidak dibangun | Alasan |
| --- | --- |
| Pemberitahuan lewat surat elektronik | Email sintetis pada sistem ini tidak pernah dikirimi surat, sesuai ketetapan Modul 6.1 |
| Pemberitahuan lewat pesan singkat | Menuntut layanan berbayar dan nomor yang terdaftar, keduanya di luar cakupan |
| Penghapusan pemberitahuan oleh pengguna | Pemberitahuan adalah riwayat kabar, bukan surat yang dapat dibuang |
| Peran kelima atau peran khusus di luar empat peran organisasi | Akun Pemeliharaan bukan peran; menambahnya akan merusak seluruh matriks hak akses |

---
---

# Bagian 10 — Perubahan Lampiran

## Lampiran A — butir tambahan

| Kode | Butir | Pertanyaan | Dampak bila tidak terjawab |
| --- | --- | --- | --- |
| A-20 | Jumlah akun Kasubdit | Apakah akan ada lebih dari satu akun berperan kasubdit | BR-70 tetap berjalan, tetapi bila hanya ada satu, ia tidak akan pernah dapat dinonaktifkan lewat jalur normal |
| A-21 | Cara menyampaikan kata sandi awal | Apakah Kasubdit menyampaikannya secara lisan, tertulis, atau cara lain | Mempengaruhi apakah layar kata sandi awal perlu dapat dicetak |

## Lampiran B — bagian tambahan

**B.12 Pengelolaan akun**

- Akun tidak pernah dihapus, hanya dinonaktifkan
- Sistem selalu menyisakan sekurang-kurangnya satu Kasubdit aktif
- Kata sandi awal ditampilkan satu kali dan tidak pernah tersimpan terbaca
- Kanit dapat mereset kata sandi anggota dan panit di unitnya
- Penonaktifan akun menutup Sesi Tugas yang sedang berjalan

**B.13 Pemberitahuan**

- Enam belas jenis pada daftar tertutup, penambahan lewat revisi PRD tercatat
- Pemberitahuan mengikuti lingkup pemantauan langsung, bukan lingkup baca riwayat
- Tidak seorang pun diberi tahu tentang perbuatannya sendiri
- Jenis mendesak tidak dapat dimatikan pengguna
- Yang sudah dibaca disusutkan setelah sembilan puluh hari; yang belum dibaca tidak pernah dihapus
- Isi pemberitahuan tidak pernah memuat uraian laporan atau identitas pihak dalam perkara

---
---

# Bagian 11 — Butir uji

| Kode | Butir uji | Membuktikan |
| --- | --- | --- |
| U-6.6-01 | Nonaktifkan akun satu-satunya Kasubdit aktif | Ditolak dengan keterangan BR-70 |
| U-6.6-02 | Nonaktifkan akun yang sedang dalam Sesi Tugas | Sesi tertutup dengan sebab penonaktifan, Rute tersimpan utuh |
| U-6.6-03 | Reset kata sandi sebelas kali dalam satu jam | Percobaan kesebelas ditolak |
| U-6.6-04 | Reset kata sandi personel unit lain sebagai Kanit | Ditolak |
| U-6.6-05 | Buat akun dengan NRP yang emailnya sudah ada pada sistem autentikasi | Ditolak dengan keterangan pemulihan, bukan galat mentah |
| U-6.6-06 | Buka jejak audit setelah reset kata sandi | Tercatat siapa mereset siapa, tanpa kata sandinya |
| U-6.9-01 | Sisipkan baris notifikasi berjenis di luar daftar | Ditolak batasan pemeriksaan |
| U-6.9-02 | Sisipkan baris notifikasi langsung dari klien | Ditolak, tidak ada hak insert |
| U-6.9-03 | Terbitkan SPT sebagai Kanit yang sekaligus Panit Penanggung Jawabnya | Ia tidak menerima pemberitahuan atas perbuatannya sendiri |
| U-6.9-04 | Cabut Panit dari SPT, lalu kirim laporan pada SPT itu | Panit yang dicabut tidak menerima pemberitahuan |
| U-6.9-05 | Buka pemberitahuan dua kali | `dibaca_pada` tidak berubah pada pembukaan kedua |
| U-6.9-06 | Ubah judul pemberitahuan lewat permintaan langsung ke basis data | Nilainya tidak berubah |
| U-6.9-07 | Baca tabel notifikasi sebagai pengguna lain | Tidak ada baris milik orang lain yang terbaca |
| U-6.9-08 | Hapus SPT permanen yang punya pemberitahuan belum dibaca | Pemberitahuannya ikut terhapus |

---
---

# Bagian 12 — Pemeriksaan mandiri: calon Addendum

Sebelas butir yang menyatakan hasil akhir tanpa menjelaskan jalur teknisnya, atau yang menuntut keputusan yang belum dapat diambil sekarang.

| No | Butir | Kriteria terkait | Yang belum jelas |
| --- | --- | --- | --- |
| 1 | Pengakhiran seluruh sesi masuk saat akun dinonaktifkan | KP-6.6-17 | Bentuk pemanggilannya pada Fungsi Tepi belum ditetapkan, dan perilaku sesi setelahnya belum diverifikasi. Serupa butir uji U-6.1-07 yang masih terbuka |
| 2 | Pembangkitan kata sandi awal | AM-6.6-03 | Fungsi pembangkitnya, tempat berjalannya, dan cara menampilkannya sekali tanpa tersimpan |
| 3 | Pembatalan pembuatan pengguna saat penyisipan barisnya gagal | EC-6.6-10 | Urutan langkah pada Fungsi Tepi belum ditetapkan |
| 4 | Perubahan email sintetis saat NRP diubah | KP-6.6-13 | Menyentuh sistem autentikasi, kemungkinan menuntut Fungsi Tepi kelima. Daftar Fungsi Tepi tertutup, sehingga ini menuntut revisi tercatat |
| 5 | Penguncian baris saat dua penonaktifan bersamaan | EC-6.6-06 | Baris mana yang dikunci belum ditetapkan, karena BR-70 menghitung lintas baris |
| 6 | Pemanggilan `buat_notifikasi` dari tiap modul pemicu | Seluruh Bagian 8 | Enam belas titik pemanggilan belum ditulis satu per satu, dan sebagiannya berada di modul yang sudah dinyatakan selesai |
| 7 | Pengantaran dorongan | KP-6.9-20 sampai KP-6.9-24 | Layanan yang dipakai, cara memperoleh penanda, dan penanganan kegagalan pengiriman |
| 8 | Penyaringan jenis yang dimatikan saat mengirim dorongan | KP-6.9-38 | Tempat penyaringan dilakukan belum ditetapkan |
| 9 | Sambungan waktu nyata untuk penghitung lonceng | KP-6.9-17 | Tabel `notifikasi` perlu didaftarkan ke layanan waktu nyata, dan penyaringan per penerima belum ditetapkan |
| 10 | Pemuatan bertahap tiga puluh baris | KP-6.9-13 | Cara penomoran halaman belum ditetapkan |
| 11 | Pemberitahuan `sesi_menggantung` | Bagian 8 | Pekerjaan berjadwal penutup sesi menggantung berada di Modul 6.4 dan belum memanggil pembuat pemberitahuan |

Butir 6 yang paling menuntut perhatian. Ia menyentuh Modul 6.2, 6.3, dan 6.4 yang seluruhnya sudah dinyatakan selesai, sehingga tidak dapat dikerjakan sebagai bagian dari modul ini saja.

---
---

# Bagian 13 — Pemeriksaan tabrakan dengan yang sudah ada

| Yang diperiksa | Hasil |
| --- | --- |
| Penomoran BR-68 sampai BR-76 | Bersih. BR tertinggi sebelumnya BR-67 |
| Penomoran KP-6.6 dan KP-6.9 | Bersih. Keduanya belum pernah dipakai |
| Nama tabel `langganan_dorong` | Bersih |
| Nama fungsi `buat_notifikasi`, `penerima_pengawas_spt`, `penerima_pelaksana_spt` | Bersih |
| Nama pemicu `trg_notifikasi_hanya_tandai_baca` | Bersih, dan berawalan `trg_` sesuai Bagian I.8 |
| Kolom baru pada `notifikasi` | Tidak menabrak. Bentuk lamanya berstatus kerangka |
| Amandemen BR-51 | Sah. BR-51 mensyaratkan penambahan lewat revisi tercatat, dan berkas ini adalah revisi itu |
| Penerapan BR-64 zona waktu | Diterapkan pada pengelompokan daftar (Q-08) |
| Penerapan BR-66 hak akses | Diterapkan pada kedua tabel dan seluruh fungsi |
| Penerapan BR-37 security_invoker | Tidak ada tampilan yang lahir di modul ini |
| Penerapan aturan penamaan `trg_` dan `fn_` | Diterapkan |
| Nilai `sebab_penutupan` baru | `akun_dinonaktifkan` ditambahkan ke daftar Modul 6.4. Perlu ditempel ke sana |

## Yang belum dapat diperiksa

| Perkara | Sebab |
| --- | --- |
| Kesesuaian dengan Modul 6.5 | Belum digali. Lonceng dan penghitung akan tampil di sana |
| Kesesuaian dengan Modul 6.7 dan 6.8 | Belum digali. Keduanya mungkin menambah jenis pemberitahuan, dan penambahan itu wajib lewat revisi tercatat sesuai BR-68 |

---

## Yang perlu dikerjakan setelah menempel berkas ini

| Urutan | Langkah |
| --- | --- |
| 1 | Tempelkan Bagian 0 sampai 10 ke tempatnya masing-masing pada PRD |
| 2 | Tambahkan nilai `akun_dinonaktifkan` ke daftar `sebab_penutupan` pada Modul 6.4 |
| 3 | Naikkan versi PRD menjadi 0.7 dan perbarui Riwayat Revisi |
| 4 | Perbarui Checklist: 6.6 dan 6.9 selesai, **aturan berikutnya mulai BR-77**, butir A-20 dan A-21 ditambahkan |
| 5 | Gali Addendum untuk kedua modul memakai sebelas butir Bagian 12, atau tunda ke satu addendum gabungan setelah 6.5 selesai |
| 6 | Lanjut ke Modul 6.5, yang kini dapat merujuk lonceng dan penghitung tanpa tempat kosong |
