package id.go.jabar.polda.sipantau;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/** Menghidupkan kembali PelacakService hanya bila pengguna memang belum
 * menutup Sesi Tugas. Tidak pernah memulai perekaman baru sendiri. */
public class PemulihPelacakReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    String aksi = intent == null ? null : intent.getAction();
    if (!Intent.ACTION_BOOT_COMPLETED.equals(aksi)
        && !Intent.ACTION_MY_PACKAGE_REPLACED.equals(aksi)) return;
    try {
      PelacakService.pulihkan(context);
    } catch (Exception e) {
      // Pembatasan OEM dapat menolak peluncuran dari latar belakang.
      // Tanda sesi tetap disimpan agar layar kesehatan meminta pengguna
      // memulihkannya saat aplikasi berikutnya dibuka.
      Log.e("PemulihPelacak", "pelacak belum dapat dipulihkan", e);
    }
  }
}
