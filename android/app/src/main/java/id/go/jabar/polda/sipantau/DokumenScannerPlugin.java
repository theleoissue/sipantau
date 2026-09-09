package id.go.jabar.polda.sipantau;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;

/** Menjembatani JPEG hasil ML Kit ke halaman SiPANTAU. */
@CapacitorPlugin(name = "DokumenScanner")
public class DokumenScannerPlugin extends Plugin {
  @PluginMethod
  public void scan(PluginCall call) {
    int batas = Math.max(1, Math.min(8, call.getInt("pageLimit", 8)));
    Intent intent = new Intent(getContext(), DokumenScannerActivity.class);
    intent.putExtra(DokumenScannerActivity.EXTRA_MAKS_HALAMAN, batas);
    startActivityForResult(call, intent, "terimaHasil");
  }

  @ActivityCallback
  private void terimaHasil(PluginCall call, ActivityResult hasil) {
    if (call == null) return;
    if (hasil.getResultCode() == Activity.RESULT_CANCELED) {
      call.reject("PEMINDAIAN_DIBATALKAN");
      return;
    }
    Intent data = hasil.getData();
    if (hasil.getResultCode() != Activity.RESULT_OK || data == null) {
      call.reject(data == null ? "PEMINDAI_TIDAK_TERSEDIA" : data.getStringExtra(DokumenScannerActivity.EXTRA_GALAT));
      return;
    }
    ArrayList<String> uriHalaman = data.getStringArrayListExtra(DokumenScannerActivity.EXTRA_HALAMAN);
    if (uriHalaman == null || uriHalaman.isEmpty()) { call.reject("Tidak ada halaman hasil scan."); return; }

    // Kompres setelah scanner selesai pada thread kerja. Ukuran 1600px cukup
    // untuk teks SPRIN sekaligus menghindari base64 besar melambatkan WebView.
    new Thread(() -> {
      try {
        JSArray halaman = new JSArray();
        for (String nilai : uriHalaman) halaman.put(kecilkan(Uri.parse(nilai)));
        JSObject jawaban = new JSObject();
        jawaban.put("pages", halaman);
        call.resolve(jawaban);
      } catch (Exception galat) {
        call.reject("Hasil scan tidak dapat disiapkan.", galat);
      }
    }).start();
  }

  private String kecilkan(Uri uri) throws Exception {
    BitmapFactory.Options ukuran = new BitmapFactory.Options();
    ukuran.inJustDecodeBounds = true;
    try (InputStream masukan = getContext().getContentResolver().openInputStream(uri)) {
      BitmapFactory.decodeStream(masukan, null, ukuran);
    }
    int sampel = 1;
    int sisi = Math.max(ukuran.outWidth, ukuran.outHeight);
    while (sisi / sampel > 1600) sampel *= 2;
    BitmapFactory.Options opsi = new BitmapFactory.Options();
    opsi.inSampleSize = sampel;
    opsi.inPreferredConfig = Bitmap.Config.ARGB_8888;
    Bitmap bitmap;
    try (InputStream masukan = getContext().getContentResolver().openInputStream(uri)) {
      bitmap = BitmapFactory.decodeStream(masukan, null, opsi);
    }
    if (bitmap == null) throw new IllegalStateException("JPEG hasil scan kosong");
    ByteArrayOutputStream keluaran = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.JPEG, 78, keluaran);
    bitmap.recycle();
    return Base64.encodeToString(keluaran.toByteArray(), Base64.NO_WRAP);
  }
}
