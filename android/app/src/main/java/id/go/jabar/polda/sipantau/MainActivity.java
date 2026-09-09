package id.go.jabar.polda.sipantau;

import android.os.Bundle;
import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.app.AppPlugin;
import com.capacitorjs.plugins.camera.CameraPlugin;

public class MainActivity extends BridgeActivity {
  private static final int IZIN_KAMERA_AWAL = 4101;
  @Override
  public void onCreate(Bundle savedInstanceState) {
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
    super.onCreate(savedInstanceState);
    mintaIzinKameraAwal();
  }

  /** Meminta satu izin yang dibutuhkan pemindai sejak pembukaan pertama APK. */
  private void mintaIzinKameraAwal() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
      requestPermissions(new String[]{Manifest.permission.CAMERA}, IZIN_KAMERA_AWAL);
    }
  }
}
