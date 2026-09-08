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
  server: {
    // sipantaujabar.my.id (tanpa www) dialihkan Vercel ke www — dipakai
    // di sini alamat www langsung supaya WebView tidak menempuh satu
    // langkah pengalihan tambahan setiap kali dibuka.
    url: 'https://www.sipantaujabar.my.id',
    cleartext: false,
  },
  // Disyaratkan @capgo/background-geolocation — tanpa ini pembaruan
  // lokasi berhenti begitu WebView masuk latar belakang (dokumentasi
  // pustaka, github.com/Cap-go/capacitor-background-geolocation).
  android: {
    useLegacyBridge: true,
  },
  plugins: {
    SystemBars: { insetsHandling: 'css' },
  },
};

export default config;
