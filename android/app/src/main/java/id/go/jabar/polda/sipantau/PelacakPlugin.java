package id.go.jabar.polda.sipantau;

import android.Manifest;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Jembatan ke PelacakService — tipis dengan sengaja.
 *
 * Halaman hanya menyalakan, mematikan, dan menanyakan keadaan. Ia TIDAK
 * mengirim Titik dan tidak menyentuh antrean, karena seluruh nilai
 * layanan itu justru terletak pada kemampuannya bekerja saat halaman
 * sedang tidak berjalan sama sekali. Menaruh sepotong pun tanggung jawab
 * perekaman di sini akan mengembalikan cacat yang dibereskan A5.
 */
@CapacitorPlugin(
  name = "Pelacak",
  permissions = {
    @Permission(alias = "gerak", strings = { Manifest.permission.ACTIVITY_RECOGNITION })
  }
)
public class PelacakPlugin extends Plugin {

  @PluginMethod
  public void mulai(PluginCall call) {
    String url = call.getString("url");
    String kunci = call.getString("kunci");
    String token = call.getString("token");
    String sesi = call.getString("sesi");

    if (url == null || token == null || sesi == null) {
      call.reject("MASUKAN_TIDAK_LENGKAP: url, token, dan sesi wajib ada");
      return;
    }

    try {
      PelacakService.mulai(getContext(), url, kunci, token, sesi);
      call.resolve(keadaan());
    } catch (Exception e) {
      // Android 12 ke atas menolak layanan latar depan yang dimulai dari
      // latar belakang. Kegagalannya dilaporkan apa adanya supaya
      // halaman dapat jatuh kembali ke perekaman sisi JS, bukan diam
      // seolah perekaman berjalan.
      call.reject("GAGAL_MULAI: " + e.getMessage());
    }
  }

  /**
   * Izin pengenalan gerak. SENGAJA terpisah dari mulai(): menolaknya
   * tidak boleh menggagalkan perekaman, dan menggabungkannya akan
   * membuat satu penolakan izin tambahan menghentikan Sesi Tugas.
   */
  @PluginMethod
  public void mintaIzinGerak(PluginCall call) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
        || getPermissionState("gerak") == PermissionState.GRANTED) {
      call.resolve(keadaan());
      return;
    }
    requestPermissionForAlias("gerak", call, "sesudahIzinGerak");
  }

  @PermissionCallback
  private void sesudahIzinGerak(PluginCall call) {
    // Ditolak pun bukan galat: layanan tetap merekam, hanya keadaan
    // geraknya yang kembali disimpulkan dari kecepatan.
    call.resolve(keadaan());
  }

  @PluginMethod
  public void berhenti(PluginCall call) {
    PelacakService.berhenti(getContext());
    call.resolve(keadaan());
  }

  @PluginMethod
  public void status(PluginCall call) {
    call.resolve(keadaan());
  }

  private JSObject keadaan() {
    JSObject hasil = new JSObject();
    hasil.put("berjalan", PelacakService.sedangJalan(getContext()));
    // Sesi mana yang sedang direkam WAJIB ikut dilaporkan. Tanpa itu
    // halaman tidak bisa membedakan "layanan sudah merekam sesi ini"
    // dari "layanan masih merekam sesi kemarin yang belum sempat
    // dihentikan", dan keduanya menuntut tindakan yang berlawanan.
    hasil.put("sesi", PelacakService.sesiBerjalan(getContext()));
    int tertahan;
    try {
      tertahan = new AntreanTitikDb(getContext()).jumlah();
    } catch (Exception e) {
      tertahan = -1;
    }
    hasil.put("tertahan", tertahan);
    return hasil;
  }
}
