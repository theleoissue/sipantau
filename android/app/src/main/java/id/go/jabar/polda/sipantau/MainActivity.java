package id.go.jabar.polda.sipantau;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.app.AppPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Didaftarkan eksplisit agar tombol Back tetap bekerja pada APK
    // yang dibangun sebelum berkas plugin otomatis Capacitor dibuat.
    registerPlugin(AppPlugin.class);
  }
}
