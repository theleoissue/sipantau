# Pemasangan SiPANTAU

Panduan sekali jalan. Ikuti berurutan, jangan dilompati — langkah
belakangan bersandar pada yang sebelumnya.

---

## Langkah 1 — Buat project Supabase

1. Buka <https://supabase.com/dashboard>, masuk dengan akun Anda
2. Klik **New project**
3. Isi:
   - **Name**: `sipantau`
   - **Database Password**: buat yang kuat, lalu **simpan di tempat aman**
     — kata sandi ini tidak dapat dilihat lagi setelah project jadi
   - **Region**: `Southeast Asia (Singapore)` — paling dekat ke Indonesia
4. Klik **Create new project**, tunggu sekitar dua menit sampai selesai

---

## Langkah 2 — Aktifkan PostGIS

1. Menu kiri → **Database** → **Extensions**
2. Cari `postgis`, nyalakan tombolnya
3. Cari `pg_cron`, nyalakan juga

> **Kalau `pg_cron` tidak ada di daftar**, lewati saja. Ia baru
> dibutuhkan pekerjaan berjadwal (Langkah 13 pada rencana pembangunan),
> bukan sekarang.

---

## Langkah 3 — Jalankan berkas migrasi

Menu kiri → **SQL Editor** → **New query**.

Buka berkas di bawah satu per satu dari folder `supabase/migrations/`,
salin **seluruh isinya**, tempel ke SQL Editor, klik **Run**.

> Kalau kelak jumlah berkas di folder itu lebih banyak daripada daftar di
> bawah, yang benar adalah **isi foldernya** — jalankan semuanya urut
> nomor. Daftar ini bisa tertinggal, folder tidak.

**Urutannya wajib dari atas ke bawah.** Setiap berkas dijalankan
sendiri-sendiri, jangan digabung.

| Urutan | Berkas | Isinya |
| --- | --- | --- |
| 1 | `0001_skema_dan_ekstensi.sql` | Ekstensi, skema fungsi bantu, wadah penyimpanan |
| 2 | `0002_tabel_unit.sql` | Tabel unit |
| 3 | `0003_tabel_users.sql` | Tabel users, perangkat, jejak audit |
| 4 | `0004_fungsi_sipantau_auth.sql` | Fungsi pembaca peran dan unit |
| 5 | `0005_rls_unit_users.sql` | Kebijakan hak akses |
| 6 | `0006_fungsi_masuk_dan_sandi.sql` | Fungsi masuk dan ganti kata sandi |
| 7 | `0007_tabel_penugasan.sql` | Tabel SPT beserta anaknya |
| 8 | `0008_rls_penugasan.sql` | Hak akses SPT |
| 9 | `0009_penjaga_kolom_pelaksana.sql` | Penjaga kolom pelaksana dan tanda terima |
| 10 | `0010_tabel_laporan.sql` | Tabel laporan harian, catatan, foto (kerangka) |
| 11 | `0011_fungsi_pemicu_laporan.sql` | Perhitungan lokasi PostGIS, penguncian, larangan tinjau sendiri |
| 12 | `0012_rls_laporan.sql` | Hak akses laporan, tampilan Belum Melapor & rekap tim |
| 13 | `0013_storage_dokumentasi.sql` | Kebijakan unggah foto ke wadah penyimpanan |
| 14 | `0014_perbaiki_lingkup_baca_users.sql` | Perbaikan: Kanit tidak lagi melihat baris Kasubdit |
| 15 | `0015_tabel_gps.sql` | Bentuk akhir sesi_tugas, tabel location_logs/posisi_terkini/titik_penanda |
| 16 | `0016_fungsi_gps.sql` | Buka/tutup Sesi Tugas, pengiriman Titik, penutupan otomatis |
| 17 | `0017_rls_gps.sql` | Hak akses GPS, publikasi Realtime posisi_terkini |
| 18 | `0018_kerja_gps.sql` | Penutup Sesi Menggantung dan penyusutan Titik berjadwal |
| 19 | `0019_tabel_notifikasi.sql` | Tabel notifikasi (bentuk akhir), langganan_dorong |
| 20 | `0020_fungsi_notifikasi.sql` | Fungsi pusat buat_notifikasi dan penentu penerima |
| 21 | `0021_sambung_notifikasi.sql` | Penyambungan pemicu notifikasi ke Modul 6.2/6.3/6.4 |
| 22 | `0022_kerja_notifikasi.sql` | Penyusutan pemberitahuan dan langganan mati berjadwal |
| 23 | `0023_lengkapi_penugasan.sql` | Kolom bermasalah, riwayat perpanjangan, tampilan penugasan_tampil (BR-64) |
| 24 | `0024_penjaga_siklus_spt.sql` | Penjaga transisi status, syarat terbit, anti-race pencabutan |
| 25 | `0025_fungsi_siklus_spt.sql` | Fungsi tutup/batal/buka-kembali/bermasalah/perpanjang/kelola tim |
| 26 | `0026_kerja_lewat_batas.sql` | Penanda Lewat Batas berjadwal, penjaga keaktifan project |

Setiap berkas harus menjawab **Success. No rows returned**. Kalau ada
yang merah, **berhenti** dan kirimkan pesan galatnya — jangan lanjut ke
berkas berikutnya.

Terakhir, jalankan berkas seed: `supabase/seed/001_unit.sql`.

---

## Langkah 4 — JANGAN buka skema `sipantau_auth` ke API

Menu kiri → **Project Settings** → **API** → bagian **Exposed schemas**.

Pastikan isinya **hanya** `public` dan `graphql_public`. Bila
`sipantau_auth` ada di sana, **hapus**.

> Skema itu berisi fungsi yang menentukan siapa boleh melihat apa. Ia
> harus dapat dievaluasi aturan akses baris dari dalam basis data, tetapi
> tidak boleh dapat dipanggil langsung dari luar oleh pemegang kunci
> publik.

---

## Langkah 5 — Ambil kunci dan isikan ke aplikasi

Menu kiri → **Project Settings** → **API**. Salin dua nilai:

- **Project URL** — berbentuk `https://xxxxxxxx.supabase.co`
- **anon public** — teks panjang berawalan `eyJ...`

Buat berkas bernama `.env.local` di folder proyek (sejajar dengan
`package.json`), isinya:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> `.env.local` **tidak pernah ikut** ke GitHub — sudah dikecualikan lewat
> `.gitignore`. Kunci untuk Vercel diisi terpisah di Langkah 8.

Sampai di sini aplikasi sudah dapat dijalankan di komputer Anda dengan
`npm run dev`, walaupun belum ada akun yang bisa masuk. Itu Langkah 6.

---

## Langkah 6 — Buat akun untuk 21 personel

Ada 21 akun. Membuatnya satu per satu lewat dashboard berarti 21 kali
mengetik alamat berpola `<nrp>@sipantau.internal` — satu digit salah dan
orangnya tidak akan muncul di sistem, tanpa pesan galat apa pun. Jadi
pakai skrip.

**1. Ambil kunci service_role.** Menu kiri → **Project Settings** →
**API** → bagian **service_role** (bertanda *secret*). Salin.

**2. Tambahkan sementara ke `.env.local`:**

```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**3. Jalankan skripnya** dari folder proyek:

```bash
node supabase/seed/buat-akun.mjs
```

Keluarannya mendaftar tiap akun: DIBUAT, ADA, atau GAGAL. Semua akun
berkata sandi awal `Gantisaya123` dan wajib diganti saat masuk pertama.

**4. Setelah selesai, hapus lagi baris `SUPABASE_SERVICE_ROLE_KEY`** dari
`.env.local`. Kunci itu melewati seluruh aturan akses baris — aplikasi
tidak membutuhkannya, hanya skrip ini yang butuh, dan hanya sekali.

**5. Sambungkan dengan data personelnya.** Kembali ke **SQL Editor**,
jalankan `supabase/seed/002_personel.sql`. Periksa hasilnya: kolom
**`lengkap` wajib bernilai `true`** dan jumlahnya 21.

> **Soal "email" ini.** Supabase mensyaratkan email sebagai identitas
> masuk. Personel tidak semuanya punya email institusi yang aktif, dan
> yang mereka hafal adalah NRP. Jadi aplikasi meminta **NRP saja**, lalu
> menyusun alamat `<nrp>@sipantau.internal` di belakang layar. Alamat itu
> tidak pernah muncul di layar, tidak pernah dikirimi surat, dan
> domainnya memang tidak ada. Pengguna cukup tahu NRP-nya.

### Kalau lebih suka manual

Menu **Authentication** → **Users** → **Add user** → **Create new user**,
lalu buat satu per satu dengan alamat `<nrp>@sipantau.internal` dan kata
sandi `Gantisaya123`. **Centang "Auto Confirm User"** — tanpa itu akunnya
tidak dapat masuk. Daftar NRP-nya ada di `supabase/seed/002_personel.sql`.

---

## Langkah 7 — Kirim ke GitHub

Lewat GitHub Desktop, seperti biasa:

1. Buka GitHub Desktop
2. Tulis pesan commit, misalnya `SiPANTAU: fondasi auth dan penugasan`
3. Klik **Commit to main**
4. Klik **Push origin**

---

## Langkah 8 — Isikan kunci di Vercel

1. Buka <https://vercel.com>, pilih project SiPANTAU
2. **Settings** → **Environment Variables**
3. Tambahkan dua baris yang sama seperti `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Pilih scope **Production, Preview, and Development** untuk keduanya
5. **Deployments** → deployment paling atas → menu titik tiga →
   **Redeploy**

> Redeploy manual ini hanya dibutuhkan **sekali**, yaitu bila deployment
> pertama terlanjur dibuat sebelum kunci diisi. Setelah itu setiap push
> ke `main` otomatis memicu deploy baru.

---

## Langkah 9 — Coba masuk

Buka alamat Vercel Anda. Masuk memakai:

- **NRP**: `89120541` (Kanit Unit I — Tito Witular)
- **Kata sandi**: `Gantisaya123`

Yang seharusnya terjadi: Anda diarahkan ke halaman **Ganti Kata Sandi**
lebih dulu, karena kata sandi awal bersifat sementara dan wajib diganti.
Setelah diganti, Anda masuk ke beranda Kanit.

Coba juga masuk sebagai `83101429` (Kasubdit) dan bandingkan menunya —
menunya **wajib berbeda**. Kasubdit punya menu "Rekap Lintas Unit" dan
"Manajemen Akun"; Kanit punya "Kelola Penugasan" dan "Sesi Tugas".
Kalau sama, ada yang salah dan tolong beri tahu saya.

---


## Yang sudah bisa dicoba, dan yang belum

Sampai titik ini yang terbangun baru **Modul 6.1 (autentikasi)** dan
**Modul 6.2 (penugasan/SPT)**. Yang lain masih halaman "Belum tersedia",
dan itu memang keadaan yang benar — bukan galat.

**Sudah bisa dicoba:**

| Yang dicoba | Caranya |
| --- | --- |
| Masuk dengan NRP | 21 akun, kata sandi awal `Gantisaya123` |
| Ganti kata sandi wajib | Otomatis muncul saat masuk pertama |
| Menu berbeda per peran | Bandingkan sidebar `89120541` (Kanit) dan `83101429` (Kasubdit) |
| Terbitkan SPT | Masuk sebagai `89120541`, menu Kelola Penugasan → Terbitkan |
| Wizard 4 langkah | Keterangan → Dasar → Titik Lokasi → Susunan Tim |
| Cetak SPRIN | Buka SPT yang sudah terbit → tombol Cetak SPRIN |
| Lingkup data antar unit | Masuk sebagai `79020096` (Kanit II) — SPT Unit I tidak boleh terlihat |
| Lingkup Panit | Masuk sebagai `79090418` (Panit II) — hanya SPT tempat ia ditunjuk |
| Tanda terima | Masuk sebagai Anggota pelaksana, buka SPT-nya, lalu periksa daftar pelaksana |
| Tampilan HP | Buka di HP: bilah bawah muncul menggantikan sidebar |

**Yang sengaja belum ada:**

Peta lapangan, Sesi Tugas, GPS, kirim laporan, foto, manajemen akun,
pemberitahuan. Menu-menunya sudah ada supaya navigasinya terasa utuh,
tetapi isinya menyusul di modul berikutnya.

**Dua hal yang paling perlu Anda periksa:**

1. **Menu tiap peran wajib berbeda.** Kalau Anggota melihat menu
   "Manajemen Akun" atau "Terbitkan Penugasan", itu masalah serius —
   beri tahu saya segera.
2. **Kanit tidak boleh melihat unit lain.** Masuk sebagai Kanit II
   (`79020096`) lalu periksa: penugasan Unit I wajib tidak terlihat
   sama sekali.
3. **Panit hanya melihat SPT tempat ia ditunjuk**, bukan seluruh SPT
   unitnya. Terbitkan SPT dengan Panit I sebagai penanggung jawab, lalu
   masuk sebagai Panit II (`79090418`) — SPT itu wajib tidak terlihat.
   Ini aturan yang paling sering salah diterapkan (BR-21).

---

## Kalau ada yang gagal

Kirimkan **tangkapan layar pesan galatnya**. Jangan diutak-atik dulu —
pesan galat yang utuh jauh lebih cepat saya baca daripada gejalanya.

Tiga galat yang paling mungkin muncul dan artinya:

| Pesan | Artinya |
| --- | --- |
| `permission denied for table ...` | Hak akses belum diberikan — ada berkas migrasi yang belum dijalankan |
| Berhasil tapi datanya kosong | Kebalikannya: hak akses ada, tetapi aturan akses baris menyaring semuanya. Biasanya peran atau unit akun belum terisi benar |
| `relation ... does not exist` | Urutan migrasi terlewat |

Ketiganya berbeda sebab dan berbeda pula perbaikannya, jadi menyebutkan
pesannya apa adanya sangat membantu.
