package id.go.jabar.polda.sipantau;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import com.google.android.gms.tasks.Task;
import com.google.mlkit.common.MlKitException;
import com.google.mlkit.vision.documentscanner.GmsDocumentScanner;
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions;
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning;
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult;
import java.util.ArrayList;

/**
 * Aktivitas kecil pembungkus ML Kit. Activity Result API diperlukan karena
 * scanner diluncurkan lewat IntentSender, sedangkan bridge Capacitor hanya
 * dapat meluncurkan Intent biasa. Semua deteksi tepi dan pembersihan tetap
 * dikerjakan ML Kit di perangkat, bukan di WebView.
 */
public class DokumenScannerActivity extends ComponentActivity {
  public static final String EXTRA_MAKS_HALAMAN = "maksHalaman";
  public static final String EXTRA_HALAMAN = "halaman";
  public static final String EXTRA_GALAT = "galat";

  private ActivityResultLauncher<IntentSenderRequest> peluncur;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    peluncur = registerForActivityResult(
      new ActivityResultContracts.StartIntentSenderForResult(), this::selesaiMemindai
    );

    int batas = Math.max(1, Math.min(8, getIntent().getIntExtra(EXTRA_MAKS_HALAMAN, 8)));
    GmsDocumentScannerOptions opsi = new GmsDocumentScannerOptions.Builder()
      .setGalleryImportAllowed(false)
      .setPageLimit(batas)
      // Hanya JPEG: PDF tidak dipakai oleh Gemini dan pembuatannya menambah waktu.
      .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG)
      .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
      .build();
    GmsDocumentScanner scanner = GmsDocumentScanning.getClient(opsi);
    Task<android.content.IntentSender> mulai = scanner.getStartScanIntent(this);
    mulai.addOnSuccessListener(pengirim -> peluncur.launch(new IntentSenderRequest.Builder(pengirim).build()));
    mulai.addOnFailureListener(this::gagal);
  }

  private void selesaiMemindai(ActivityResult hasil) {
    if (hasil.getResultCode() != Activity.RESULT_OK || hasil.getData() == null) {
      setResult(Activity.RESULT_CANCELED);
      finish();
      return;
    }
    GmsDocumentScanningResult dokumen = GmsDocumentScanningResult.fromActivityResultIntent(hasil.getData());
    if (dokumen == null || dokumen.getPages() == null || dokumen.getPages().isEmpty()) {
      gagal("Tidak ada halaman yang dihasilkan pemindai.");
      return;
    }
    ArrayList<String> halaman = new ArrayList<>();
    for (GmsDocumentScanningResult.Page halamanScan : dokumen.getPages()) {
      halaman.add(halamanScan.getImageUri().toString());
    }
    Intent data = new Intent();
    data.putStringArrayListExtra(EXTRA_HALAMAN, halaman);
    setResult(Activity.RESULT_OK, data);
    finish();
  }

  private void gagal(Exception galat) {
    String pesan = "PEMINDAI_GAGAL";
    if (galat instanceof MlKitException) {
      // Kode ML Kit: 200/14 muncul saat modul Play services baru sedang
      // diunduh; 18 berarti perangkat memang tidak memenuhi syarat.
      switch (((MlKitException) galat).getErrorCode()) {
        case 200:
        case 14:
          pesan = "PEMINDAI_SEDANG_DIUNDUH";
          break;
        case 207:
          pesan = "PERBARUI_PLAY_SERVICES";
          break;
        case 18:
          pesan = "PEMINDAI_TIDAK_DIDUKUNG";
          break;
        case 202:
          pesan = "IZIN_KAMERA_GOOGLE_DITOLAK";
          break;
        default:
          pesan = "PEMINDAI_GAGAL:" + ((MlKitException) galat).getErrorCode();
      }
    }
    Intent data = new Intent();
    data.putExtra(EXTRA_GALAT, pesan);
    setResult(Activity.RESULT_FIRST_USER, data);
    finish();
  }

  private void gagal(String pesan) {
    gagal(new Exception(pesan));
  }
}
