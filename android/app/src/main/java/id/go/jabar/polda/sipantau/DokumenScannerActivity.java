package id.go.jabar.polda.sipantau;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.*;
import androidx.activity.ComponentActivity;
import androidx.annotation.NonNull;
import androidx.camera.core.*;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.exifinterface.media.ExifInterface;
import com.google.common.util.concurrent.ListenableFuture;
import org.opencv.android.OpenCVLoader;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.*;

/** Pemindai dokumen lokal berbasis CameraX dan OpenCV. */
public class DokumenScannerActivity extends ComponentActivity {
  public static final String EXTRA_MAKS_HALAMAN="maksHalaman", EXTRA_HALAMAN="halaman", EXTRA_GALAT="galat";
  private static final int STABIL_MINIMUM=7;
  private final ExecutorService executor=Executors.newSingleThreadExecutor();
  private final ArrayList<String> halaman=new ArrayList<>();
  private ImageCapture capture; private Camera kamera; private TextView status, ringkasan; private Button tombolSelesai, tombolFlash; private LinearLayout thumbnail;
  private Bingkai bingkai; private int batas, stabil; private boolean mengambil, menungguHalamanBerikutnya, flashMenyala, opencvSiap;
  private Point[] sudutTerakhir, sudutUntukFoto;

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    // Kamera harus selalu dapat dibuka. OpenCV meningkatkan auto-crop, tetapi
    // kegagalannya tidak boleh memblokir pengambilan foto SPRIN.
    try { opencvSiap=OpenCVLoader.initLocal(); } catch(Throwable ignored) { opencvSiap=false; }
    batas=Math.max(1,Math.min(8,getIntent().getIntExtra(EXTRA_MAKS_HALAMAN,8)));
    FrameLayout root=new FrameLayout(this);root.setBackgroundColor(Color.BLACK);
    PreviewView preview=new PreviewView(this);preview.setScaleType(PreviewView.ScaleType.FILL_CENTER);root.addView(preview,new FrameLayout.LayoutParams(-1,-1));
    bingkai=new Bingkai(this);root.addView(bingkai,new FrameLayout.LayoutParams(-1,-1));
    LinearLayout atas=new LinearLayout(this);atas.setGravity(Gravity.CENTER_VERTICAL);atas.setPadding(dp(14),dp(18),dp(14),0);
    Button tutup=new Button(this);tutup.setText("×");tutup.setTextSize(28);tutup.setOnClickListener(v->batal());atas.addView(tutup,new LinearLayout.LayoutParams(dp(58),dp(54)));
    status=new TextView(this);status.setTextColor(Color.WHITE);status.setTextSize(16);status.setGravity(Gravity.CENTER);status.setText(opencvSiap?"Arahkan kamera ke seluruh halaman SPRIN":"Kamera siap. Tekan Ambil foto untuk memindai.");atas.addView(status,new LinearLayout.LayoutParams(0,dp(54),1));
    tombolFlash=new Button(this);tombolFlash.setText("Lampu");tombolFlash.setOnClickListener(v->ubahFlash());atas.addView(tombolFlash,new LinearLayout.LayoutParams(dp(88),dp(54)));root.addView(atas,new FrameLayout.LayoutParams(-1,-2,Gravity.TOP));
    HorizontalScrollView strip=new HorizontalScrollView(this);strip.setHorizontalScrollBarEnabled(false);thumbnail=new LinearLayout(this);thumbnail.setPadding(dp(16),0,dp(16),0);strip.addView(thumbnail);FrameLayout.LayoutParams stripLetak=new FrameLayout.LayoutParams(-1,dp(76),Gravity.BOTTOM);stripLetak.setMargins(0,0,0,dp(102));root.addView(strip,stripLetak);
    ringkasan=new TextView(this);ringkasan.setTextColor(Color.WHITE);ringkasan.setTextSize(14);ringkasan.setGravity(Gravity.CENTER);ringkasan.setText("0 / "+batas+" halaman");FrameLayout.LayoutParams rp=new FrameLayout.LayoutParams(-1,dp(26),Gravity.BOTTOM);rp.setMargins(0,0,0,dp(78));root.addView(ringkasan,rp);
    Button foto=new Button(this);foto.setText("Ambil foto");foto.setOnClickListener(v->ambil());FrameLayout.LayoutParams fp=new FrameLayout.LayoutParams(-2,-2,Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL);fp.setMargins(0,0,0,30);root.addView(foto,fp);
    tombolSelesai=new Button(this);tombolSelesai.setText("Selesai");tombolSelesai.setEnabled(false);tombolSelesai.setOnClickListener(v->selesai());FrameLayout.LayoutParams sp=new FrameLayout.LayoutParams(-2,-2,Gravity.BOTTOM|Gravity.END);sp.setMargins(0,0,24,30);root.addView(tombolSelesai,sp);
    setContentView(root);mulai(preview);
  }
  private void mulai(PreviewView preview){
    ListenableFuture<ProcessCameraProvider> future=ProcessCameraProvider.getInstance(this);
    future.addListener(()->{try{
      ProcessCameraProvider provider=future.get(); int rotasi=preview.getDisplay()==null?0:preview.getDisplay().getRotation();
      Preview p=new Preview.Builder().setTargetRotation(rotasi).build();p.setSurfaceProvider(preview.getSurfaceProvider());
      capture=new ImageCapture.Builder().setTargetRotation(rotasi).setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY).build();
      ImageAnalysis a=new ImageAnalysis.Builder().setTargetRotation(rotasi).setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build();a.setAnalyzer(executor,this::analisis);
      provider.unbindAll();kamera=provider.bindToLifecycle(this,CameraSelector.DEFAULT_BACK_CAMERA,p,capture,a);
    }catch(Exception e){gagal("KAMERA_TIDAK_TERSEDIA");}},ContextCompat.getMainExecutor(this));
  }
  private void analisis(@NonNull ImageProxy gambar){try{
    if(!opencvSiap)return;
    Point[] sudut=temukanDokumen(gambar);
    runOnUiThread(()->{bingkai.setSudut(sudut);if(sudut==null){stabil=0;menungguHalamanBerikutnya=false;return;}if(mengambil)return;if(menungguHalamanBerikutnya){status.setText("Halaman tersimpan. Arahkan ke halaman berikutnya.");return;}stabil=stabil(sudut,sudutTerakhir)?stabil+1:1;sudutTerakhir=salin(sudut);sudutUntukFoto=salin(sudut);if(stabil>=STABIL_MINIMUM){status.setText("Dokumen stabil — memindai halaman…");ambil();}else status.setText("Tahan halaman sampai bingkai hijau stabil");});
  }catch(Throwable galat){opencvSiap=false;runOnUiThread(()->{bingkai.setSudut(null);status.setText("Kamera siap. Tekan Ambil foto untuk memindai.");});}finally{gambar.close();}}
  /** Mengembalikan sudut TL, TR, BR, BL dalam koordinat 0..1. */
  private Point[] temukanDokumen(ImageProxy gambar){
    int w=gambar.getWidth(),h=gambar.getHeight(),stride=gambar.getPlanes()[0].getRowStride();ByteBuffer buffer=gambar.getPlanes()[0].getBuffer().duplicate();byte[] piksel=new byte[w*h];for(int y=0;y<h;y++){buffer.position(y*stride);buffer.get(piksel,y*w,w);}
    Mat abu=new Mat(h,w,CvType.CV_8UC1);abu.put(0,0,piksel);double skala=480d/Math.max(w,h);Mat kecil=new Mat();Imgproc.resize(abu,kecil,new Size(w*skala,h*skala));Imgproc.GaussianBlur(kecil,kecil,new Size(5,5),0);Mat tepi=new Mat();Imgproc.Canny(kecil,tepi,45,135);
    List<MatOfPoint> kontur=new ArrayList<>();Imgproc.findContours(tepi,kontur,new Mat(),Imgproc.RETR_LIST,Imgproc.CHAIN_APPROX_SIMPLE);Point[] hasil=null;double terbesar=0;
    for(MatOfPoint bentuk:kontur){MatOfPoint2f asal=new MatOfPoint2f(bentuk.toArray()),dekat=new MatOfPoint2f();Imgproc.approxPolyDP(asal,dekat,Imgproc.arcLength(asal,true)*.02,true);double luas=Imgproc.contourArea(bentuk);if(dekat.total()==4&&luas>terbesar&&luas>kecil.rows()*kecil.cols()*.18){hasil=dekat.toArray();terbesar=luas;}asal.release();dekat.release();bentuk.release();}
    abu.release();kecil.release();tepi.release();if(hasil==null)return null;for(Point p:hasil){p.x/=w*skala;p.y/=h*skala;putarKeTampilan(p,gambar.getImageInfo().getRotationDegrees());}return urutkan(hasil);
  }
  /** CameraX memberi koordinat frame sensor; samakan dengan JPEG berorientasi tegak dan overlay. */
  private void putarKeTampilan(Point p,int derajat){double x=p.x,y=p.y;if(derajat==90){p.x=1-y;p.y=x;}else if(derajat==180){p.x=1-x;p.y=1-y;}else if(derajat==270){p.x=y;p.y=1-x;}}
  private Point[] urutkan(Point[] titik){Point[] r=new Point[4];for(Point p:titik){double jumlah=p.x+p.y,beda=p.x-p.y;if(r[0]==null||jumlah<r[0].x+r[0].y)r[0]=p;if(r[2]==null||jumlah>r[2].x+r[2].y)r[2]=p;if(r[1]==null||beda>r[1].x-r[1].y)r[1]=p;if(r[3]==null||beda<r[3].x-r[3].y)r[3]=p;}return r;}
  private boolean stabil(Point[] a,Point[] b){if(b==null)return false;double d=0;for(int i=0;i<4;i++)d+=Math.hypot(a[i].x-b[i].x,a[i].y-b[i].y);return d<.035;}
  private Point[] salin(Point[] sumber){if(sumber==null)return null;Point[] r=new Point[sumber.length];for(int i=0;i<sumber.length;i++)r[i]=new Point(sumber[i].x,sumber[i].y);return r;}
  private void ambil(){
    if(mengambil||capture==null||halaman.size()>=batas)return;mengambil=true;stabil=0;status.setText("Memproses halaman…");Point[] sudut=salin(sudutUntukFoto);File mentah=new File(getCacheDir(),"sprin-"+System.nanoTime()+".jpg");
    capture.takePicture(new ImageCapture.OutputFileOptions.Builder(mentah).build(),executor,new ImageCapture.OnImageSavedCallback(){
      @Override public void onImageSaved(@NonNull ImageCapture.OutputFileResults hasil){String bersih=bersihkan(mentah,sudut);runOnUiThread(()->{halaman.add(Uri.fromFile(new File(bersih)).toString());tambahThumbnail(bersih);mengambil=false;menungguHalamanBerikutnya=true;tombolSelesai.setEnabled(true);ringkasan.setText(halaman.size()+" / "+batas+" halaman");status.setText(halaman.size()+" halaman siap. Arahkan ke halaman berikutnya atau tekan Selesai.");if(halaman.size()>=batas)selesai();});}
      @Override public void onError(@NonNull ImageCaptureException e){runOnUiThread(()->{mengambil=false;status.setText("Foto gagal. Coba lagi.");});}
    });
  }
  /** Crop perspektif, perataan cahaya, dan kontras halaman dalam satu proses lokal. */
  private String bersihkan(File mentah,Point[] normal){if(!opencvSiap)return mentah.getAbsolutePath();try{Mat sumber=Imgcodecs.imread(mentah.getAbsolutePath());if(sumber.empty())return mentah.getAbsolutePath();putarSesuaiExif(sumber,mentah);Mat jadi=cropPerspektif(sumber,normal);Mat abu=new Mat();Imgproc.cvtColor(jadi,abu,Imgproc.COLOR_BGR2GRAY);Mat latar=new Mat();Imgproc.GaussianBlur(abu,latar,new Size(31,31),0);Core.divide(abu,latar,abu,255);Imgproc.adaptiveThreshold(abu,abu,255,Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,Imgproc.THRESH_BINARY,31,9);File keluar=new File(getCacheDir(),"scan-"+System.nanoTime()+".jpg");Imgcodecs.imwrite(keluar.getAbsolutePath(),abu);sumber.release();jadi.release();abu.release();latar.release();mentah.delete();return keluar.getAbsolutePath();}catch(Throwable galat){opencvSiap=false;return mentah.getAbsolutePath();}}
  private Mat cropPerspektif(Mat sumber,Point[] normal){if(normal==null||normal.length!=4)return kecilkan(sumber,1800);Point[] p=new Point[4];for(int i=0;i<4;i++)p[i]=new Point(normal[i].x*sumber.cols(),normal[i].y*sumber.rows());double lebar=Math.max(Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y),Math.hypot(p[2].x-p[3].x,p[2].y-p[3].y));double tinggi=Math.max(Math.hypot(p[3].x-p[0].x,p[3].y-p[0].y),Math.hypot(p[2].x-p[1].x,p[2].y-p[1].y));if(lebar<200||tinggi<200)return kecilkan(sumber,1800);MatOfPoint2f asal=new MatOfPoint2f(p),tujuan=new MatOfPoint2f(new Point(0,0),new Point(lebar-1,0),new Point(lebar-1,tinggi-1),new Point(0,tinggi-1));Mat trans=Imgproc.getPerspectiveTransform(asal,tujuan);Mat hasil=new Mat();Imgproc.warpPerspective(sumber,hasil,trans,new Size(lebar,tinggi),Imgproc.INTER_CUBIC,Core.BORDER_REPLICATE,Scalar.all(0));asal.release();tujuan.release();trans.release();Mat ringkas=kecilkan(hasil,1800);hasil.release();return ringkas;}
  private Mat kecilkan(Mat sumber,int maksimum){double f=Math.min(1d,maksimum/(double)Math.max(sumber.cols(),sumber.rows()));if(f==1d)return sumber.clone();Mat hasil=new Mat();Imgproc.resize(sumber,hasil,new Size(sumber.cols()*f,sumber.rows()*f));return hasil;}
  private void putarSesuaiExif(Mat gambar,File berkas){try{int o=new ExifInterface(berkas.getAbsolutePath()).getAttributeInt(ExifInterface.TAG_ORIENTATION,ExifInterface.ORIENTATION_NORMAL);if(o==ExifInterface.ORIENTATION_ROTATE_90)Core.rotate(gambar,gambar,Core.ROTATE_90_CLOCKWISE);else if(o==ExifInterface.ORIENTATION_ROTATE_180)Core.rotate(gambar,gambar,Core.ROTATE_180);else if(o==ExifInterface.ORIENTATION_ROTATE_270)Core.rotate(gambar,gambar,Core.ROTATE_90_COUNTERCLOCKWISE);}catch(IOException ignored){}}
  private void tambahThumbnail(String lokasi){ImageView gambar=new ImageView(this);gambar.setImageURI(Uri.fromFile(new File(lokasi)));gambar.setScaleType(ImageView.ScaleType.CENTER_CROP);gambar.setBackgroundColor(Color.WHITE);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(dp(48),dp(64));lp.setMargins(0,0,dp(8),0);thumbnail.addView(gambar,lp);}
  private void ubahFlash(){if(kamera==null||!kamera.getCameraInfo().hasFlashUnit())return;flashMenyala=!flashMenyala;kamera.getCameraControl().enableTorch(flashMenyala);tombolFlash.setText(flashMenyala?"Lampu aktif":"Lampu");}
  private void batal(){Intent data=new Intent();data.putExtra(EXTRA_GALAT,"PEMINDAIAN_DIBATALKAN");setResult(Activity.RESULT_CANCELED,data);finish();}
  private int dp(int nilai){return Math.round(nilai*getResources().getDisplayMetrics().density);}
  private void selesai(){Intent data=new Intent();data.putStringArrayListExtra(EXTRA_HALAMAN,halaman);setResult(Activity.RESULT_OK,data);finish();}
  private void gagal(String kode){Intent data=new Intent();data.putExtra(EXTRA_GALAT,kode);setResult(Activity.RESULT_FIRST_USER,data);finish();}
  @Override protected void onDestroy(){executor.shutdown();super.onDestroy();}
  private static class Bingkai extends View{private final Paint cat=new Paint(Paint.ANTI_ALIAS_FLAG);private Point[] sudut;Bingkai(android.content.Context c){super(c);cat.setStyle(Paint.Style.STROKE);cat.setStrokeWidth(7);cat.setColor(Color.rgb(0,220,180));}void setSudut(Point[] nilai){sudut=nilai;invalidate();}@Override protected void onDraw(Canvas c){if(sudut==null)return;Path p=new Path();p.moveTo((float)(sudut[0].x*getWidth()),(float)(sudut[0].y*getHeight()));for(int i=1;i<4;i++)p.lineTo((float)(sudut[i].x*getWidth()),(float)(sudut[i].y*getHeight()));p.close();c.drawPath(p,cat);}}
}
