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
    super.onCreate(savedInstanceState);
    // Didaftarkan eksplisit agar tombol Back tetap bekerja pada APK
    // yang dibangun sebelum berkas plugin otomatis Capacitor dibuat.
    registerPlugin(AppPlugin.class);
    registerPlugin(CameraPlugin.class);
    registerPlugin(DokumenScannerPlugin.class);
    mintaIzinKameraAwal();
  }

  /** Meminta satu izin yang dibutuhkan pemindai sejak pembukaan pertama APK. */
  private void mintaIzinKameraAwal() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
      requestPermissions(new String[]{Manifest.permission.CAMERA}, IZIN_KAMERA_AWAL);
    }
  }
}
