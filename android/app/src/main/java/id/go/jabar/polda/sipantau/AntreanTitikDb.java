package id.go.jabar.polda.sipantau;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Antrean Titik di perangkat, di dalam SQLite.
 *
 * Ini yang membuat perekaman bertahan pada keadaan yang TIDAK dapat
 * dijangkau antrean di JS: WebView menampilkan layar galat karena tidak
 * ada jaringan, halaman dimuat ulang, atau proses aplikasi dimatikan
 * sistem. Pada semua keadaan itu tidak ada satu baris JavaScript pun
 * yang berjalan — sementara layanan latar depan tetap hidup dan tetap
 * menulis ke sini.
 *
 * SQLite, bukan SharedPreferences: antreannya bisa ribuan baris pada
 * sesi panjang tanpa sinyal, dan menulis ulang seluruh berkas JSON tiap
 * Titik (cara Preferences) menjadi makin lambat seiring antrean tumbuh.
 */
public class AntreanTitikDb extends SQLiteOpenHelper {

  private static final String NAMA = "antrean_titik.db";
  private static final int VERSI = 1;
  private static final String TABEL = "titik";

  /**
   * Batas atas. Titik TIDAK PERNAH dibuang diam-diam saat penuh — yang
   * berhenti adalah penerimaan Titik baru, dan itu dilaporkan. Membuang
   * bukti tanpa suara persis kesalahan yang dihindari seluruh modul ini.
   */
  public static final int BATAS = 20000;

  public AntreanTitikDb(Context konteks) {
    super(konteks, NAMA, null, VERSI);
  }

  @Override
  public void onCreate(SQLiteDatabase db) {
    db.execSQL(
      "create table " + TABEL + " ("
      + "antrean_id text primary key,"
      + "lat real not null,"
      + "lng real not null,"
      + "akurasi real,"
      + "kecepatan real,"
      + "arah real,"
      + "baterai integer,"
      + "tiruan integer not null default 0,"
      + "ditangkap_pada integer not null"
      + ")");
    db.execSQL("create index idx_titik_urut on " + TABEL + " (ditangkap_pada)");
  }

  @Override
  public void onUpgrade(SQLiteDatabase db, int lama, int baru) {
    // Belum ada versi kedua. Sengaja TIDAK membuang tabelnya: isinya
    // rekaman lapangan yang belum terkirim.
  }

  /** Mengembalikan false bila antrean penuh. */
  public boolean simpan(String antreanId, double lat, double lng, Double akurasi,
                        Double kecepatan, Double arah, Integer baterai,
                        boolean tiruan, long ditangkapPada) {
    SQLiteDatabase db = getWritableDatabase();
    if (jumlah() >= BATAS) return false;
    ContentValues nilai = new ContentValues();
    nilai.put("antrean_id", antreanId);
    nilai.put("lat", lat);
    nilai.put("lng", lng);
    nilai.put("akurasi", akurasi);
    nilai.put("kecepatan", kecepatan);
    nilai.put("arah", arah);
    nilai.put("baterai", baterai);
    nilai.put("tiruan", tiruan ? 1 : 0);
    nilai.put("ditangkap_pada", ditangkapPada);
    // CONFLICT_IGNORE: antrean_id dibuat perangkat dan bersifat tetap,
    // jadi menyimpan ulang Titik yang sama tidak boleh menggandakannya.
    return db.insertWithOnConflict(TABEL, null, nilai, SQLiteDatabase.CONFLICT_IGNORE) != -1;
  }

  public int jumlah() {
    try (Cursor c = getReadableDatabase().rawQuery("select count(*) from " + TABEL, null)) {
      return c.moveToFirst() ? c.getInt(0) : 0;
    }
  }

  /**
   * Mengambil kelompok tertua. Dikembalikan sebagai JSON siap kirim,
   * lengkap dengan UMUR (bukan waktu mutlak) supaya jam perangkat yang
   * meleset tidak membuat seluruh Titiknya ditolak server.
   */
  public JSONArray ambil(int batas, long sekarang) throws Exception {
    JSONArray daftar = new JSONArray();
    try (Cursor c = getReadableDatabase().rawQuery(
        "select * from " + TABEL + " order by ditangkap_pada asc limit " + batas, null)) {
      while (c.moveToNext()) {
        JSONObject t = new JSONObject();
        t.put("antrean_id", c.getString(c.getColumnIndexOrThrow("antrean_id")));
        t.put("lat", c.getDouble(c.getColumnIndexOrThrow("lat")));
        t.put("lng", c.getDouble(c.getColumnIndexOrThrow("lng")));
        sisipkanAtauNull(t, c, "akurasi", "akurasi_meter");
        sisipkanAtauNull(t, c, "kecepatan", "kecepatan_mps");
        sisipkanAtauNull(t, c, "arah", "arah_derajat");
        int kolomBaterai = c.getColumnIndexOrThrow("baterai");
        t.put("baterai_persen", c.isNull(kolomBaterai) ? JSONObject.NULL : c.getInt(kolomBaterai));
        t.put("lokasi_tiruan", c.getInt(c.getColumnIndexOrThrow("tiruan")) == 1);
        long ditangkap = c.getLong(c.getColumnIndexOrThrow("ditangkap_pada"));
        t.put("usia_ms", Math.max(0, sekarang - ditangkap));
        daftar.put(t);
      }
    }
    return daftar;
  }

  private void sisipkanAtauNull(JSONObject t, Cursor c, String kolom, String kunci) throws Exception {
    int i = c.getColumnIndexOrThrow(kolom);
    t.put(kunci, c.isNull(i) ? JSONObject.NULL : c.getDouble(i));
  }

  /** Dipanggil HANYA sesudah server benar-benar menerima. */
  public void hapus(JSONArray terkirim) throws Exception {
    SQLiteDatabase db = getWritableDatabase();
    db.beginTransaction();
    try {
      for (int i = 0; i < terkirim.length(); i++) {
        db.delete(TABEL, "antrean_id = ?",
          new String[] { terkirim.getJSONObject(i).getString("antrean_id") });
      }
      db.setTransactionSuccessful();
    } finally {
      db.endTransaction();
    }
  }
}
