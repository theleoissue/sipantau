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
5. Deploy fungsi `kirim-notifikasi-dorong` tanpa verifikasi JWT, karena fungsi
   ini diverifikasi memakai header rahasia webhook:

   `supabase functions deploy kirim-notifikasi-dorong --no-verify-jwt`

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
