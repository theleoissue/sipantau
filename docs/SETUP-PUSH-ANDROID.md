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
4. Buat nilai acak panjang dan simpan sebagai Edge Function secret
   `PUSH_WEBHOOK_SECRET`.
5. Pasang fungsi `kirim-notifikasi-dorong` **tanpa verifikasi JWT**, karena
   pemanggilnya adalah Database Webhook yang tidak membawa sesi pengguna —
   kewenangannya diperiksa lewat header rahasia, bukan JWT.

   Lewat CLI: `supabase functions deploy kirim-notifikasi-dorong --no-verify-jwt`

   **Lewat editor Dashboard** (jalur yang dipakai proyek ini, karena CLI-nya
   tidak pernah ter-link): editor hanya membawa SATU berkas, sehingga impor
   `../_shared/...` di `index.ts` tidak ikut terkirim dan fungsinya **gagal
   tayang tanpa pesan galat apa pun** — yang terlihat hanya HTTP 404
   "Requested function was not found", persis seperti belum pernah dipasang.
   Karena itu untuk jalur Dashboard wajib ditempel **versi satu berkas** yang
   isi `_shared`-nya sudah ditanam, lalu saklar "Verify JWT" dimatikan di
   setelan fungsinya. Bila saklar itu tidak tersedia, biarkan menyala dan
   pertahankan header `Authorization: Bearer <anon key>` yang diisikan
   Dashboard sendiri pada langkah 6 — gerbangnya puas dengan itu, sementara
   kewenangan sebenarnya tetap ditentukan `x-sipantau-webhook-secret`.

   Pastikan sungguh tayang, jangan ditebak:
   `curl -s -o /dev/null -w "%{http_code}" -X POST "$URL/functions/v1/kirim-notifikasi-dorong" -d '{}'`
   → `404` berarti tidak ada, `401` berarti hidup.

6. Di Supabase Dashboard, buat Database Webhook untuk `INSERT` pada tabel
   `public.notifikasi`. Tujuannya adalah Edge Function
   `kirim-notifikasi-dorong`. Tambahkan header
   `x-sipantau-webhook-secret` dengan nilai yang sama seperti langkah 4.
7. Jalankan workflow **Bangun APK Android**, pasang APK baru, masuk, dan
   izinkan pemberitahuan ketika dialog Android muncul.

Channel `Pemberitahuan penting` memakai prioritas tinggi, suara bawaan, dan
getar. Notifikasi foreground ditampilkan lewat Local Notifications; ketika
aplikasi berada di latar belakang, FCM menampilkannya langsung. Mengetuk
notifikasi membuka halaman tujuan di SiPANTAU.
