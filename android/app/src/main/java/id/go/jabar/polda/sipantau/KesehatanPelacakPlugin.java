package id.go.jabar.polda.sipantau;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Kesehatan pelacak: memeriksa hal-hal di luar kendali aplikasi yang
 * diam-diam mematikan perekaman.
 *
 * Ini menjawab risiko lapangan yang paling nyata di Indonesia. Xiaomi,
 * Oppo, Vivo, dan Realme sangat agresif membunuh layanan latar depan,
 * dan begitu prosesnya mati tidak ada satu pun kode kita yang berjalan —
 * antrean luring di JS pun ikut berhenti. Pustaka pelacak yang dipakai
 * menyatakan sendiri pengirimannya "best-effort: there is no on-disk
 * queue and no automatic retry", jadi Titik yang gagal terkirim saat
 * proses sudah mati memang hilang.
 *
 * Karena itu pertahanan yang benar bukan menambal sesudahnya, melainkan
 * menjaga prosesnya tetap hidup: mengecualikan aplikasi dari penghematan
 * baterai, dan menyalakan izin autostart.
 */
@CapacitorPlugin(name = "KesehatanPelacak")
public class KesehatanPelacakPlugin extends Plugin {

  /**
   * Daftar layar autostart per merek.
   *
   * TIDAK RESMI dan bisa berubah kapan saja — nama komponen ini tidak
   * pernah dijanjikan pabrikannya. Karena itu setiap percobaan dibungkus
   * try/catch dan selalu punya jalan mundur ke layar rincian aplikasi
   * bawaan Android, yang pasti ada di perangkat mana pun.
   */
  private static final String[][] LAYAR_AUTOSTART = {
    { "xiaomi",  "com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity" },
    { "redmi",   "com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity" },
    { "poco",    "com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity" },
    { "oppo",    "com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity" },
    { "realme",  "com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity" },
    { "vivo",    "com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity" },
    { "huawei",  "com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity" },
    { "honor",   "com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity" },
  };

  @PluginMethod
  public void periksa(PluginCall call) {
    JSObject hasil = new JSObject();
    hasil.put("pabrikan", Build.MANUFACTURER == null ? "" : Build.MANUFACTURER);
    hasil.put("model", Build.MODEL == null ? "" : Build.MODEL);
    hasil.put("versiAndroid", Build.VERSION.SDK_INT);
    hasil.put("hematBateraiDikecualikan", bateraiDikecualikan());
    hasil.put("adaLayarAutostart", komponenAutostart() != null);
    call.resolve(hasil);
  }

  /**
   * Membuka daftar penghematan baterai bawaan Android.
   *
   * SENGAJA memakai daftar pengaturan, bukan dialog permintaan langsung
   * (ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS): dialog itu menuntut
   * izin REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, yang kebijakan Google Play
   * batasi ketat. Daftar ini tidak menuntut izin apa pun dan tersedia di
   * setiap perangkat — hanya menambah satu ketukan bagi pengguna.
   */
  @PluginMethod
  public void bukaPengaturanBaterai(PluginCall call) {
    try {
      Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);
      call.resolve();
    } catch (Throwable galat) {
      bukaRincianAplikasi(call);
    }
  }

  @PluginMethod
  public void bukaPengaturanAutostart(PluginCall call) {
    ComponentName komponen = komponenAutostart();
    if (komponen != null) {
      try {
        Intent intent = new Intent();
        intent.setComponent(komponen);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
        return;
      } catch (Throwable diabaikan) {
        // Nama komponennya tidak resmi; kalau ditolak, jatuh ke bawah.
      }
    }
    bukaRincianAplikasi(call);
  }

  private boolean bateraiDikecualikan() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true;
    try {
      PowerManager daya = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
      return daya != null && daya.isIgnoringBatteryOptimizations(getContext().getPackageName());
    } catch (Throwable galat) {
      // Tidak dapat diperiksa BUKAN berarti aman. Dilaporkan sebagai
      // belum dikecualikan supaya petugas tetap diarahkan memeriksanya.
      return false;
    }
  }

  private ComponentName komponenAutostart() {
    String merek = Build.MANUFACTURER == null ? "" : Build.MANUFACTURER.toLowerCase();
    String merekLain = Build.BRAND == null ? "" : Build.BRAND.toLowerCase();
    for (String[] baris : LAYAR_AUTOSTART) {
      if (merek.contains(baris[0]) || merekLain.contains(baris[0])) {
        ComponentName komponen = new ComponentName(baris[1], baris[2]);
        // Diperiksa dulu keberadaannya: memanggil komponen yang tidak ada
        // melempar, dan versi ColorOS/MIUI berbeda memindahkan layarnya.
        Intent uji = new Intent().setComponent(komponen);
        if (getContext().getPackageManager().resolveActivity(uji, 0) != null) return komponen;
      }
    }
    return null;
  }

  private void bukaRincianAplikasi(PluginCall call) {
    try {
      Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      intent.setData(Uri.parse("package:" + getContext().getPackageName()));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);
      call.resolve();
    } catch (Throwable galat) {
      call.reject("PENGATURAN_TIDAK_DAPAT_DIBUKA");
    }
  }
}
