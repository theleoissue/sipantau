package id.go.jabar.polda.sipantau;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.TextView;
import androidx.activity.ComponentActivity;
import androidx.annotation.NonNull;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import com.google.common.util.concurrent.ListenableFuture;
import org.opencv.android.OpenCVLoader;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Kamera CameraX lokal. Tidak ada UI atau modul scanner Google Play. */
public class DokumenScannerActivity extends ComponentActivity {
  public static final String EXTRA_MAKS_HALAMAN="maksHalaman", EXTRA_HALAMAN="halaman", EXTRA_GALAT="galat";
  private final ExecutorService executor=Executors.newSingleThreadExecutor();
  private final ArrayList<String> halaman=new ArrayList<>();
  private ImageCapture capture; private TextView status; private Bingkai bingkai; private int batas, stabil; private boolean mengambil;
  private Point[] sudutTerakhir;

  @Override public void onCreate(Bundle b) {
    super.onCreate(b);
    if (!OpenCVLoader.initLocal()) { gagal("OPENCV_GAGAL_DIMUAT"); return; }
    batas=Math.max(1,Math.min(8,getIntent().getIntExtra(EXTRA_MAKS_HALAMAN,8)));
    FrameLayout root=new FrameLayout(this); root.setBackgroundColor(Color.BLACK);
    PreviewView preview=new PreviewView(this); preview.setScaleType(PreviewView.ScaleType.FILL_CENTER); root.addView(preview,new FrameLayout.LayoutParams(-1,-1));
    bingkai=new Bingkai(this); root.addView(bingkai,new FrameLayout.LayoutParams(-1,-1));
    status=new TextView(this); status.setTextColor(Color.WHITE); status.setTextSize(16); status.setGravity(Gravity.CENTER); status.setText("Arahkan kamera ke halaman SPRIN");
    root.addView(status,new FrameLayout.LayoutParams(-1,-2,Gravity.TOP|Gravity.CENTER_HORIZONTAL));
    Button foto=new Button(this); foto.setText("Ambil foto"); foto.setOnClickListener(v->ambil()); root.addView(foto,new FrameLayout.LayoutParams(-2,-2,Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL));
    Button selesai=new Button(this); selesai.setText("Selesai"); selesai.setOnClickListener(v->selesai()); root.addView(selesai,new FrameLayout.LayoutParams(-2,-2,Gravity.BOTTOM|Gravity.END));
    setContentView(root); mulai(preview);
  }
  private void mulai(PreviewView preview) {
    ListenableFuture<ProcessCameraProvider> f=ProcessCameraProvider.getInstance(this);
    f.addListener(()->{try { ProcessCameraProvider p=f.get(); Preview v=new Preview.Builder().build(); v.setSurfaceProvider(preview.getSurfaceProvider()); capture=new ImageCapture.Builder().setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY).build(); ImageAnalysis a=new ImageAnalysis.Builder().setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build(); a.setAnalyzer(executor,this::analisis); p.unbindAll(); p.bindToLifecycle(this,CameraSelector.DEFAULT_BACK_CAMERA,v,capture,a); } catch(Exception e){gagal("KAMERA_TIDAK_TERSEDIA");}},ContextCompat.getMainExecutor(this));
  }
  private void analisis(@NonNull ImageProxy img) { try { Point[] sudut=temukanDokumen(img); runOnUiThread(()->{bingkai.setSudut(sudut);if(sudut==null||mengambil){stabil=0;return;} stabil=stabil(sudut,sudutTerakhir)?stabil+1:1;sudutTerakhir=sudut;status.setText(stabil>=6?"Dokumen stabil — memindai…":"Tahan dokumen sampai bingkai hijau stabil");if(stabil>=6)ambil();}); } finally {img.close();} }
  private Point[] temukanDokumen(ImageProxy img) { int w=img.getWidth(),h=img.getHeight(),rs=img.getPlanes()[0].getRowStride();java.nio.ByteBuffer b=img.getPlanes()[0].getBuffer().duplicate();byte[] raw=new byte[w*h];for(int y=0;y<h;y++){b.position(y*rs);b.get(raw,y*w,w);}Mat abu=new Mat(h,w,CvType.CV_8UC1);abu.put(0,0,raw);Mat kecil=new Mat();double s=420.0/Math.max(w,h);Imgproc.resize(abu,kecil,new org.opencv.core.Size(w*s,h*s));Imgproc.GaussianBlur(kecil,kecil,new org.opencv.core.Size(5,5),0);Mat tepi=new Mat();Imgproc.Canny(kecil,tepi,50,150);List<MatOfPoint> ks=new ArrayList<>();Imgproc.findContours(tepi,ks,new Mat(),Imgproc.RETR_LIST,Imgproc.CHAIN_APPROX_SIMPLE);Point[] terbaik=null;double luas=0;for(MatOfPoint k:ks){MatOfPoint2f a=new MatOfPoint2f(k.toArray()),q=new MatOfPoint2f();Imgproc.approxPolyDP(a,q,Imgproc.arcLength(a,true)*.02,true);double l=Imgproc.contourArea(k);if(q.total()==4&&l>luas&&l>kecil.rows()*kecil.cols()*.2){terbaik=q.toArray();luas=l;}a.release();q.release();k.release();}abu.release();kecil.release();tepi.release();if(terbaik!=null)for(Point p:terbaik){p.x/=w*s;p.y/=h*s;}return terbaik; }
  private boolean stabil(Point[] a,Point[] b){if(b==null)return false;double d=0;for(int i=0;i<4;i++)d+=Math.hypot(a[i].x-b[i].x,a[i].y-b[i].y);return d<.04;}
  private void ambil() {
    if(mengambil||capture==null||halaman.size()>=batas)return; mengambil=true; status.setText("Memproses halaman…");
    File raw=new File(getCacheDir(),"sprin-"+System.nanoTime()+".jpg");
    capture.takePicture(new ImageCapture.OutputFileOptions.Builder(raw).build(),executor,new ImageCapture.OnImageSavedCallback(){
      @Override public void onImageSaved(@NonNull ImageCapture.OutputFileResults r){String hasil=bersihkan(raw);runOnUiThread(()->{halaman.add(Uri.fromFile(new File(hasil)).toString());mengambil=false;status.setText(halaman.size()+" halaman siap. Ambil halaman berikutnya atau tekan Selesai.");if(halaman.size()>=batas)selesai();});}
      @Override public void onError(@NonNull ImageCaptureException e){runOnUiThread(()->{mengambil=false;status.setText("Foto gagal. Coba lagi.");});}
    });
  }
  /** Perataan cahaya dan kontras lokal; dijalankan di thread kamera. */
  private String bersihkan(File raw){Mat src=Imgcodecs.imread(raw.getAbsolutePath());if(src.empty())return raw.getAbsolutePath();Mat abu=new Mat();Imgproc.cvtColor(src,abu,Imgproc.COLOR_BGR2GRAY);Mat latar=new Mat();Imgproc.GaussianBlur(abu,latar,new org.opencv.core.Size(31,31),0);Core.divide(abu,latar,abu,255);Imgproc.adaptiveThreshold(abu,abu,255,Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,Imgproc.THRESH_BINARY,31,9);File out=new File(getCacheDir(),"scan-"+System.nanoTime()+".jpg");Imgcodecs.imwrite(out.getAbsolutePath(),abu);src.release();abu.release();latar.release();raw.delete();return out.getAbsolutePath();}
  private void selesai(){Intent d=new Intent();d.putStringArrayListExtra(EXTRA_HALAMAN,halaman);setResult(Activity.RESULT_OK,d);finish();}
  private void gagal(String p){Intent d=new Intent();d.putExtra(EXTRA_GALAT,p);setResult(Activity.RESULT_FIRST_USER,d);finish();}
  @Override protected void onDestroy(){executor.shutdown();super.onDestroy();}
  private static class Bingkai extends View { private final Paint cat=new Paint(Paint.ANTI_ALIAS_FLAG); private Point[] s; Bingkai(android.content.Context c){super(c);cat.setStyle(Paint.Style.STROKE);cat.setStrokeWidth(7);cat.setColor(Color.rgb(0,220,180));} void setSudut(Point[] x){s=x;invalidate();} @Override protected void onDraw(Canvas c){if(s==null)return;Path p=new Path();p.moveTo((float)(s[0].x*getWidth()),(float)(s[0].y*getHeight()));for(int i=1;i<4;i++)p.lineTo((float)(s[i].x*getWidth()),(float)(s[i].y*getHeight()));p.close();c.drawPath(p,cat);} }
}
