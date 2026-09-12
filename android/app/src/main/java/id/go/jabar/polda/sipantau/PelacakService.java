package id.go.jabar.polda.sipantau;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

/**
 * Layanan latar depan perekam posisi — milik sendiri, bukan pustaka.
 *
 * KENAPA DIBANGUN SENDIRI
 *
 * Susunan sebelumnya menaruh dua pekerjaan di dalam WebView: menangkap
 * Titik dan menyetorkannya. Keduanya berhenti serentak pada keadaan yang
 * justru paling sering terjadi di lapangan — begitu jaringan hilang,
 * WebView menampilkan halaman galat bawaan peramban, dan sejak itu TIDAK
 * ADA satu baris JavaScript pun yang berjalan. Antrean yang dibangun
 * untuk menyelamatkan Titik saat sinyal putus ternyata ikut mati persis
 * ketika ia paling dibutuhkan.
 *
 * Pustaka pelacak yang dipakai juga menyatakan sendiri pengirimannya
 * "best-effort: there is no on-disk queue and no automatic retry", dan
 * tidak menyediakan satu pun cara mengambil Titik yang tertahan.
 *
 * Maka perekaman dipindahkan seluruhnya ke luar WebView:
 *
 *   FusedLocationProvider -> AntreanTitikDb (SQLite) -> pengunggah
 *
 * Ketiganya berjalan di dalam proses layanan latar depan. Halaman boleh
 * tampil, boleh galat, boleh tertutup sama sekali; tidak satu pun
 * mengubah apa yang terekam.
 *
 * SATU-SATUNYA jalur perekaman di Android. Sisi JS tidak lagi menangkap
 * maupun mengirim Titik selama layanan ini hidup — dua jalur yang
 * merekam bersamaan persis yang dulu memaksa adanya penjaga ganda
 * berbasis jendela waktu, dan penjaga itu membuang Titik diam-diam
 * begitu kerapatan perekaman berubah.
 */
public class PelacakService extends Service {

  private static final String TAG = "PelacakService";
  private static final String SALURAN = "sipantau_pelacak";
  private static final int ID_NOTIFIKASI = 1917;

  public static final String PREF = "sipantau_pelacak";
  private static final String K_URL = "url";
  private static final String K_KUNCI = "kunci";
  private static final String K_TOKEN = "token";
  private static final String K_SESI = "sesi";
  private static final String K_JALAN = "jalan";

  /**
   * Kerapatan perekaman. Keputusan pemilik produk 11 September 2026:
   * serapat mungkin, tanpa interval adaptif.
   */
  private static final long JEDA_REKAM_MS = 3_000L;
  private static final long JEDA_KIRIM_MS = 30_000L;

  /**
   * Sepadan dengan batas 200 di kirim_titik_native_borongan, disisakan
   * jauh di bawahnya supaya satu kelompok tidak pernah ditolak hanya
   * karena kebesaran.
   */
  private static final int BESAR_KELOMPOK = 50;

  /**
   * Galat yang TIDAK akan pernah membaik dengan dicoba ulang. Hanya untuk
   * daftar ini antrean boleh dikosongkan; galat lain apa pun membuat
   * Titik DITAHAN. Ini disengaja: menahan Titik yang mustahil terkirim
   * memenuhi antrean, sementara membuang Titik yang sebenarnya masih
   * bisa terkirim menghapus bukti lapangan tanpa suara. Yang kedua jauh
   * lebih buruk.
   */
  private static final String[] TOLAK_PERMANEN = {
    "TOKEN_TIDAK_SAH", "SESI_TERTUTUP", "SESI_TIDAK_DITEMUKAN", "BUKAN_PEMEGANG",
    "WAKTU_TIDAK_MASUK_AKAL", "BENTUK_TIDAK_SAH", "TERLALU_BANYAK"
  };

  private FusedLocationProviderClient penyedia;
  private LocationCallback penerima;
  private AntreanTitikDb antrean;
  private HandlerThread utas;
  private Handler kerja;
  private volatile boolean sedangMengirim = false;

  @Override
  public void onCreate() {
    super.onCreate();
    antrean = new AntreanTitikDb(this);
    utas = new HandlerThread("pelacak-kerja");
    utas.start();
    kerja = new Handler(utas.getLooper());
    penyedia = LocationServices.getFusedLocationProviderClient(this);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int idMulai) {
    SharedPreferences p = getSharedPreferences(PREF, Context.MODE_PRIVATE);

    // Intent bernilai null berarti sistem menghidupkan ulang layanan ini
    // sesudah prosesnya dimatikan (START_STICKY). Pengaturannya diambil
    // dari simpanan, bukan dari Intent yang memang tidak ada — inilah
    // yang membuat perekaman pulih sendiri tanpa petugas menyentuh HP.
    if (intent != null && intent.getStringExtra("token") != null) {
      p.edit()
        .putString(K_URL, intent.getStringExtra("url"))
        .putString(K_KUNCI, intent.getStringExtra("kunci"))
        .putString(K_TOKEN, intent.getStringExtra("token"))
        .putString(K_SESI, intent.getStringExtra("sesi"))
        .putBoolean(K_JALAN, true)
        .apply();
    }

    if (!p.getBoolean(K_JALAN, false) || p.getString(K_TOKEN, null) == null) {
      stopSelf();
      return START_NOT_STICKY;
    }

    mulaiLatarDepan();
    mulaiMerekam();
    kerja.removeCallbacks(putaranKirim);
    kerja.postDelayed(putaranKirim, 2_000L);
    return START_STICKY;
  }

  // -------------------------------------------------------------- notifikasi

  private void mulaiLatarDepan() {
    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel s = new NotificationChannel(
        SALURAN, "Perekaman posisi", NotificationManager.IMPORTANCE_LOW);
      s.setDescription("Tanda bahwa Sesi Tugas sedang berjalan.");
      s.setShowBadge(false);
      nm.createNotificationChannel(s);
    }

    Intent buka = new Intent(this, MainActivity.class);
    buka.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    PendingIntent ketuk = PendingIntent.getActivity(
      this, 0, buka, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

    // Prinsip Non-Menghakimi: notifikasi menyatakan fakta bahwa sesi
    // sedang berjalan, bukan menilai petugasnya.
    Notification n = new NotificationCompat.Builder(this, SALURAN)
      .setContentTitle("Sesi Tugas berjalan")
      .setContentText("Posisi direkam selama sesi belum ditutup.")
      .setSmallIcon(android.R.drawable.ic_menu_mylocation)
      .setOngoing(true)
      .setContentIntent(ketuk)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build();

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(ID_NOTIFIKASI, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
    } else {
      startForeground(ID_NOTIFIKASI, n);
    }
  }

  // --------------------------------------------------------------- perekaman

  private void mulaiMerekam() {
    if (penerima != null) return;

    LocationRequest permintaan = new LocationRequest.Builder(
        Priority.PRIORITY_HIGH_ACCURACY, JEDA_REKAM_MS)
      .setMinUpdateIntervalMillis(JEDA_REKAM_MS)
      // Menunggu kunci akurat menahan Titik pertama sampai puluhan detik.
      // Titik kasar yang datang cepat lebih berguna: mutunya sudah
      // dinilai basis data lewat akurasi_meter, bukan dibuang di sini.
      .setWaitForAccurateLocation(false)
      .setMinUpdateDistanceMeters(0f)
      .build();

    penerima = new LocationCallback() {
      @Override
      public void onLocationResult(LocationResult hasil) {
        for (Location l : hasil.getLocations()) {
          simpan(l);
        }
      }
    };

    try {
      // Izin lokasi sudah diminta sisi JS sebelum layanan ini dijalankan.
      penyedia.requestLocationUpdates(permintaan, penerima, utas.getLooper());
    } catch (SecurityException e) {
      Log.e(TAG, "izin lokasi belum diberikan", e);
      stopSelf();
    }
  }

  private void simpan(Location l) {
    try {
      boolean tiruan = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
        ? l.isMock() : l.isFromMockProvider();

      // antrean_id dibuat DI SINI dan tidak pernah berubah. Itu yang
      // membuat percobaan ulang tidak menghasilkan baris kembar, dan
      // yang menggantikan penjaga berbasis jendela waktu.
      boolean masuk = antrean.simpan(
        UUID.randomUUID().toString(),
        l.getLatitude(),
        l.getLongitude(),
        l.hasAccuracy() ? (double) l.getAccuracy() : null,
        l.hasSpeed() ? (double) l.getSpeed() : null,
        l.hasBearing() ? (double) l.getBearing() : null,
        bateraiPersen(),
        tiruan,
        System.currentTimeMillis());

      if (!masuk) Log.w(TAG, "antrean penuh, Titik tidak diterima");
    } catch (Exception e) {
      Log.e(TAG, "gagal menyimpan Titik", e);
    }
  }

  private Integer bateraiPersen() {
    try {
      BatteryManager bm = (BatteryManager) getSystemService(Context.BATTERY_SERVICE);
      int n = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
      return (n >= 0 && n <= 100) ? Integer.valueOf(n) : null;
    } catch (Exception e) {
      return null;
    }
  }

  // -------------------------------------------------------------- pengiriman

  private final Runnable putaranKirim = new Runnable() {
    @Override
    public void run() {
      kirimSekali();
      kerja.postDelayed(this, JEDA_KIRIM_MS);
    }
  };

  private void kirimSekali() {
    if (sedangMengirim) return;
    sedangMengirim = true;
    try {
      SharedPreferences p = getSharedPreferences(PREF, Context.MODE_PRIVATE);
      String url = p.getString(K_URL, null);
      String kunci = p.getString(K_KUNCI, null);
      String token = p.getString(K_TOKEN, null);
      if (url == null || token == null) return;

      // Satu kelompok per putaran, bukan seluruh antrean sekaligus.
      // Antrean panjang sesudah berjam-jam tanpa sinyal terkuras
      // bertahap, dan kegagalan di tengah tidak mengulang semuanya.
      JSONArray kelompok = antrean.ambil(BESAR_KELOMPOK, System.currentTimeMillis());
      if (kelompok.length() == 0) return;

      JSONObject badan = new JSONObject();
      badan.put("titik", kelompok);

      String jawaban = pos(url, kunci, token, badan.toString());

      if (jawaban == null) {
        // Permintaannya tidak sampai. Titik DITAHAN — inilah seluruh
        // alasan antrean ini ada.
        return;
      }

      if (jawaban.equals("OK")) {
        antrean.hapus(kelompok);
        return;
      }

      if (permanen(jawaban)) {
        // Ditolak selamanya. Menahannya hanya menyumbat antrean untuk
        // Titik yang masih punya harapan terkirim.
        Log.w(TAG, "kelompok ditolak permanen: " + jawaban);
        antrean.hapus(kelompok);
        return;
      }

      Log.w(TAG, "kelompok ditahan, akan dicoba lagi: " + jawaban);
    } catch (Exception e) {
      Log.e(TAG, "gagal mengirim kelompok", e);
    } finally {
      sedangMengirim = false;
    }
  }

  private static boolean permanen(String jawaban) {
    for (String k : TOLAK_PERMANEN) {
      if (jawaban.contains(k)) return true;
    }
    return false;
  }

  /**
   * Mengembalikan "OK" bila server menerima, isi galat bila server
   * menolak, dan null bila permintaannya sendiri tidak sampai.
   *
   * Ketiganya WAJIB dibedakan: hanya yang pertama boleh menghapus Titik,
   * dan menyamakan "tidak sampai" dengan "ditolak" berarti membuang
   * rekaman lapangan setiap kali sinyal putus.
   */
  private static String pos(String url, String kunci, String token, String badan) {
    HttpURLConnection c = null;
    try {
      c = (HttpURLConnection) new URL(url).openConnection();
      c.setRequestMethod("POST");
      c.setConnectTimeout(15_000);
      c.setReadTimeout(30_000);
      c.setDoOutput(true);
      c.setRequestProperty("Content-Type", "application/json");
      if (kunci != null) c.setRequestProperty("Authorization", "Bearer " + kunci);
      c.setRequestProperty("x-sipantau-token", token);

      OutputStream o = c.getOutputStream();
      try {
        o.write(badan.getBytes("UTF-8"));
      } finally {
        o.close();
      }

      int kode = c.getResponseCode();
      if (kode >= 200 && kode < 300) return "OK";

      // 5xx dan 429 gangguan sesaat, bukan penolakan isi. Titiknya
      // ditahan, bukan dibuang.
      if (kode >= 500 || kode == 429) return null;

      String isi = baca(c);
      return "HTTP " + kode + " " + (isi == null ? "" : isi);
    } catch (Exception e) {
      return null;
    } finally {
      if (c != null) c.disconnect();
    }
  }

  private static String baca(HttpURLConnection c) {
    InputStream i = null;
    try {
      i = c.getErrorStream() != null ? c.getErrorStream() : c.getInputStream();
      if (i == null) return null;
      ByteArrayOutputStream b = new ByteArrayOutputStream();
      byte[] penampung = new byte[4096];
      int n;
      while ((n = i.read(penampung)) != -1) b.write(penampung, 0, n);
      return new String(b.toByteArray(), "UTF-8");
    } catch (Exception e) {
      return null;
    } finally {
      if (i != null) {
        try { i.close(); } catch (Exception abaikan) { /* sudah tertutup */ }
      }
    }
  }

  // ------------------------------------------------------------------ kendali

  public static void mulai(Context konteks, String url, String kunci, String token, String sesi) {
    Intent i = new Intent(konteks, PelacakService.class);
    i.putExtra("url", url);
    i.putExtra("kunci", kunci);
    i.putExtra("token", token);
    i.putExtra("sesi", sesi);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      konteks.startForegroundService(i);
    } else {
      konteks.startService(i);
    }
  }

  /** Memulihkan sesi yang memang masih bertanda berjalan sesudah reboot
   *  atau pembaruan APK. Seluruh kredensial diambil oleh onStartCommand
   *  dari SharedPreferences; receiver tidak memegang salinannya. */
  public static void pulihkan(Context konteks) {
    if (!sedangJalan(konteks)) return;
    Intent i = new Intent(konteks, PelacakService.class);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      konteks.startForegroundService(i);
    } else {
      konteks.startService(i);
    }
  }

  public static void berhenti(Context konteks) {
    // Tanda "jalan" dimatikan LEBIH DULU supaya sistem yang menghidupkan
    // ulang layanan ini sesudah dimatikan langsung berhenti sendiri.
    konteks.getSharedPreferences(PREF, Context.MODE_PRIVATE)
      .edit().putBoolean(K_JALAN, false).apply();
    konteks.stopService(new Intent(konteks, PelacakService.class));
  }

  /** Sesi Tugas yang sedang direkam, atau null bila tidak ada. */
  public static String sesiBerjalan(Context konteks) {
    SharedPreferences p = konteks.getSharedPreferences(PREF, Context.MODE_PRIVATE);
    return p.getBoolean(K_JALAN, false) ? p.getString(K_SESI, null) : null;
  }

  public static boolean sedangJalan(Context konteks) {
    return konteks.getSharedPreferences(PREF, Context.MODE_PRIVATE)
      .getBoolean(K_JALAN, false);
  }

  @Override
  public void onDestroy() {
    if (penerima != null) penyedia.removeLocationUpdates(penerima);
    kerja.removeCallbacks(putaranKirim);

    // Percobaan kirim terakhir sebelum benar-benar mati. Kalaupun gagal,
    // antreannya ada di SQLite dan akan terkuras pada sesi berikutnya.
    kerja.post(new Runnable() {
      @Override
      public void run() {
        kirimSekali();
        utas.quitSafely();
      }
    });
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }
}
