import type { CapacitorConfig } from '@capacitor/cli';

// SiPANTAU memakai Server Component + Server Action (docs/CLAUDE.md §6.1),
// jadi TIDAK BISA diekspor jadi berkas statis ke dalam APK — keduanya
// menuntut server Next.js sungguhan yang berjalan (Vercel), bukan berkas
// yang dibuka langsung dari penyimpanan HP. APK ini karena itu adalah
// pembungkus tipis: WebView-nya membuka alamat Vercel yang sudah hidup,
// bukan menyimpan salinan aplikasinya sendiri. webDir tetap wajib diisi
// Capacitor CLI meski isinya tidak pernah benar-benar dipakai (server.url
// di bawah yang menentukan apa yang sungguh dibuka).
const config: CapacitorConfig = {
  appId: 'id.go.jabar.polda.sipantau',
  appName: 'SiPANTAU',
  webDir: 'public',
  // Warna di balik WebView selama halaman belum tergambar. Tanpa ini
  // jeda antara splash dan halaman pertama tampil hitam. Sama dengan
  // --bg di globals.css, supaya kemunculan halaman tidak terlihat
  // sebagai kedipan warna. Terbawa ke APK hanya lewat `cap sync`.
  backgroundColor: '#F4F6F9',
  server: {
    // sipantaujabar.my.id (tanpa www) dialihkan Vercel ke www — dipakai
    // di sini alamat www langsung supaya WebView tidak menempuh satu
    // langkah pengalihan tambahan setiap kali dibuka.
    url: 'https://www.sipantaujabar.my.id',
    cleartext: false,
    // Halaman yang ditampilkan ketika alamat di atas tidak dapat dimuat.
    //
    // Tanpa ini WebView jatuh ke layar galat bawaan Chrome
    // ("ERR_INTERNET_DISCONNECTED") — layar yang tidak menyebut SiPANTAU
    // sama sekali, dan di lapangan mudah dibaca sebagai aplikasinya rusak
    // atau perekamannya berhenti. Keduanya tidak benar.
    //
    // Berkasnya diambil dari webDir ('public'), jadi ia ikut terbungkus
    // ke dalam APK dan tidak menuntut jaringan apa pun untuk tampil.
    // Catatan dokumentasi Capacitor: di Android halaman ini TIDAK punya
    // akses ke plugin, sehingga ia tidak dapat membaca jumlah Titik yang
    // tertahan di antrean perangkat.
    errorPath: 'luring.html',
  },
  // Disyaratkan @capgo/background-geolocation — tanpa ini pembaruan
  // lokasi berhenti begitu WebView masuk latar belakang (dokumentasi
  // pustaka, github.com/Cap-go/capacitor-background-geolocation).
  android: {
    useLegacyBridge: true,
  },
  plugins: {
    SystemBars: { insetsHandling: 'css' },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
