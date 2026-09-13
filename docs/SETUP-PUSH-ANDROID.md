# Menyalakan pemberitahuan dorong Android

Kode klien dan pengantar FCM sudah tersedia. Langkah berikut perlu dilakukan
oleh pemilik proyek karena berisi kredensial Google/Firebase yang tidak boleh
dikomit.

1. Buka Firebase Console dan tambahkan aplikasi Android dengan package
   `id.go.jabar.polda.sipantau` pada proyek Google yang dipakai SiPANTAU.
2. Unduh `google-services.json`, ubah menjadi Base64, lalu simpan sebagai
   GitHub Actions secret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64`.
3. Buat service account yang boleh mengirim Firebase Cloud Messaging. Simpan
   seluruh JSON-nya sebagai Supabase Edge Function secret
   `FIREBASE_SERVICE_ACCOUNT_JSON`.
4. Buat nilai acak panjang (misalnya `openssl rand -hex 32`). Simpan nilai
   yang **sama** di dua tempat:

   - Edge Function secret `PUSH_WEBHOOK_SECRET`
   - Supabase Vault, lewat SQL Editor:

     ```sql
     select vault.create_secret(
       '<nilai>',
       'sipantau_push_webhook_secret',
       'Header x-sipantau-webhook-secret untuk kirim-notifikasi-dorong');
     ```

     Bila rahasianya sudah ada dan hendak dirotasi:

     ```sql
     select vault.update_secret(
       (select id from vault.secrets where name = 'sipantau_push_webhook_secret'),
       '<nilai baru>');
     ```

5. Pasang fungsi `kirim-notifikasi-dorong` **tanpa verifikasi JWT**. Pemicunya
   (langkah 6) sengaja tidak mengirim header `Authorization`, jadi dengan
   verifikasi JWT menyala setiap dorongan ditolak gerbang. Kewenangan
   diperiksa lewat header rahasia, bukan JWT.

   Lewat CLI: `supabase functions deploy kirim-notifikasi-dorong --no-verify-jwt`

   **Lewat editor Dashboard** (jalur yang dipakai proyek ini, karena CLI-nya
   tidak pernah ter-link): editor hanya membawa SATU berkas, sehingga impor
   `../_shared/...` di `index.ts` tidak ikut terkirim dan fungsinya **gagal
   tayang tanpa pesan galat apa pun** — yang terlihat hanya HTTP 404
   "Requested function was not found", persis seperti belum pernah dipasang.
   Karena itu untuk jalur Dashboard wajib ditempel **versi satu berkas** yang
   isi `_shared`-nya sudah ditanam, lalu saklar "Verify JWT" dimatikan di
   setelan fungsinya.

   Pastikan sungguh tayang dan verifikasi JWT sungguh mati, jangan ditebak:
   `curl -s -X POST "$URL/functions/v1/kirim-notifikasi-dorong" -d '{}'`
   → `{"galat":"TIDAK_BERWENANG"}` berarti hidup dan jawabannya datang dari
   kode fungsi. Pesan lain soal JWT/authorization berarti gerbang masih
   memeriksa JWT. `404` berarti tidak ada.

6. **Jangan membuat Database Webhook di Dashboard.** Pemicunya,
   `trg_dorong_notifikasi`, dipasang migrasi
   `0070_dorong_notifikasi_lewat_vault.sql`, yang menolak berjalan bila
   rahasia Vault pada langkah 4 belum ada. Database Webhook Dashboard
   menyimpan header — termasuk kunci yang diisikan tombol "Add auth header
   with service key" — sebagai teks biasa di definisi pemicu, yang terbaca
   siapa pun yang dapat menjalankan SQL.
7. Jalankan workflow **Bangun APK Android**, pasang APK baru, masuk, dan
   izinkan pemberitahuan ketika dialog Android muncul.

Channel `Pemberitahuan penting` memakai prioritas tinggi, suara bawaan, dan
getar. Notifikasi foreground ditampilkan lewat Local Notifications; ketika
aplikasi berada di latar belakang, FCM menampilkannya langsung. Mengetuk
notifikasi membuka halaman tujuan di SiPANTAU.

## Peralihan dari Database Webhook lama (sekali jalan, 13 September 2026)

Produksi sebelumnya memakai Database Webhook `dorong_notifikasi` yang
membawa kunci `service_role` legacy dan rahasia webhook di definisinya.
Rahasia lama itu **tidak boleh dipakai ulang**. Urutannya:

1. Pasang Fungsi Tepi versi baru (versi satu berkas). Ia tetap menerima
   kiriman webhook lama karena hanya membutuhkan `record.id`.
2. Buat nilai rahasia **baru**, lalu jalankan `vault.create_secret`
   (langkah 4 di atas).
3. Setel `PUSH_WEBHOOK_SECRET` ke nilai baru. Sejak saat ini webhook lama
   ditolak 401, jadi langsung lanjut ke butir 4.
4. Jalankan `0070_dorong_notifikasi_lewat_vault.sql` di SQL Editor.
5. Periksa:

   ```sql
   -- wajib nol
   select count(*) from pg_trigger
    where not tgisinternal
      and pg_get_triggerdef(oid) ~* '(eyJ|authorization|bearer|secret|apikey)';
   -- wajib satu baris, tgenabled = 'O'
   select tgname, tgenabled from pg_trigger
    where tgrelid = 'public.notifikasi'::regclass and tgname = 'trg_dorong_notifikasi';
   ```

   Lalu picu satu pemberitahuan mendesak dan pastikan dorongannya sampai,
   atau lihat `status_code` terbaru di `net._http_response`.

Kunci `service_role` legacy yang sempat tertulis **masih berlaku** sesudah
peralihan ini. Kunci itu dimatikan lewat tugas terpisah: aplikasi dipindah ke
kunci `sb_publishable` dan `sb_secret`, lalu kunci legacy dinonaktifkan.
