package id.go.jabar.polda.sipantau;

import android.os.Bundle;
import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.camera.CameraPlugin;

public class MainActivity extends BridgeActivity {
  private static final int IZIN_KAMERA_AWAL = 4101;

  /**
   * Batas paling lama splash ditahan.
   *
   * Penahanannya menunggu halaman benar-benar tampil, dan pada jaringan
   * lapangan itu bisa tidak pernah terjadi — sinyal hilang tepat saat
   * aplikasi dibuka, atau server yang sedang bangun dari tidur memakan
   * waktu lama. Splash yang ditahan tanpa batas terlihat persis seperti
   * aplikasi yang macet. Empat detik cukup untuk menutupi bangun-tidur
   * server yang wajar, dan sesudahnya WebView sendiri yang menampilkan
   * keadaannya (termasuk luring.html bila memang tidak ada jaringan).
   */
  private static final long BATAS_TAHAN_SPLASH_MS = 4_000L;

  /** Dibaca tiap frame oleh SplashScreen dan ditulis dari utas WebView. */
  private volatile boolean halamanTampil = false;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    // PALING AWAL, sebelum super.onCreate — syarat SplashScreen.
    //
    // Sebelumnya splash sistem hilang begitu aktivitas menggambar frame
    // pertamanya, yaitu WebView yang masih kosong. Selama halaman dari
    // Vercel belum tiba, yang tampil hanyalah latar kosong: layar hitam
    // satu sampai dua detik saat APK dibuka. Sekarang splash bertahan
    // sampai halaman pertama sungguh terlihat.
    SplashScreen splash = SplashScreen.installSplashScreen(this);
    splash.setKeepOnScreenCondition(() -> !halamanTampil);

    // WAJIB sebelum super.onCreate: BridgeActivity.onCreate memanggil
    // load(), dan di situlah Bridge dibuat dari daftar plugin yang ADA
    // SAAT ITU. registerPlugin sesudahnya hanya menyentuh builder yang
    // tidak dipakai lagi, sehingga pluginnya diam-diam tidak terdaftar
    // dan pemanggilan dari JS ditolak "not implemented".
    //
    // capacitor.plugins.json hanya memuat plugin dari paket npm yang
    // terpasang — DokumenScanner plugin lokal, jadi HANYA baris ini yang
    // mendaftarkannya. Salah urutan berarti pemindai dokumen tidak pernah
    // bisa dibuka sama sekali.
    registerPlugin(AppPlugin.class);
    registerPlugin(CameraPlugin.class);
    registerPlugin(DokumenScannerPlugin.class);
    registerPlugin(KesehatanPelacakPlugin.class);
    registerPlugin(PelacakPlugin.class);
    super.onCreate(savedInstanceState);
    lepasSplashSaatHalamanTampil();
    mintaIzinKameraAwal();
  }

  /**
   * onPageCommitVisible, bukan onPageLoaded. Yang kedua menunggu SELURUH
   * sumber daya halaman selesai termuat — gambar, skrip, huruf — padahal
   * yang dibutuhkan hanya saat isi pertama sudah dapat dilihat. Galat
   * juga melepas splash: halaman galat dan luring.html pun layak dilihat,
   * sedangkan splash yang tertahan di atasnya tidak.
   */
  private void lepasSplashSaatHalamanTampil() {
    if (bridge == null) {
      // BridgeActivity.onCreate berhenti lebih awal bila WebView tidak
      // tersedia di perangkat. Tidak ada halaman yang akan pernah tampil,
      // jadi splash tidak boleh menunggunya.
      halamanTampil = true;
      return;
    }
    bridge.addWebViewListener(new WebViewListener() {
      @Override
      public void onPageCommitVisible(WebView view, String url) {
        halamanTampil = true;
      }

      @Override
      public void onReceivedError(WebView webView) {
        halamanTampil = true;
      }

      @Override
      public void onReceivedHttpError(WebView webView) {
        halamanTampil = true;
      }
    });
    new Handler(Looper.getMainLooper()).postDelayed(() -> halamanTampil = true, BATAS_TAHAN_SPLASH_MS);
  }

  /** Meminta satu izin yang dibutuhkan pemindai sejak pembukaan pertama APK. */
  private void mintaIzinKameraAwal() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
      requestPermissions(new String[]{Manifest.permission.CAMERA}, IZIN_KAMERA_AWAL);
    }
  }
}
