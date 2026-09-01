'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Menyegarkan data Server Component tanpa memuat ulang halaman.
 *
 * MASALAH YANG DITUTUP. Hanya dua tempat di seluruh aplikasi yang
 * sungguh hidup lewat Realtime: peta posisi dan penghitung lonceng.
 * Sisanya — jumlah Titik pada kartu Sesi Tugas, daftar penugasan,
 * statistik beranda, status personel — hanya terbaca ulang ketika
 * halaman berpindah. Akibatnya paling terasa di APK: WebView tetap
 * hidup di latar belakang, jadi begitu aplikasi dibuka kembali
 * layarnya menampilkan angka yang sama persis seperti saat
 * ditinggalkan, betapapun lamanya. Satu-satunya jalan keluar yang
 * tersedia bagi pengguna adalah masuk ulang — itulah yang selama ini
 * terjadi di lapangan.
 *
 * router.refresh() menjalankan ulang Server Component rute yang sedang
 * terbuka DAN MEMPERTAHANKAN keadaan komponen klien: isian formulir
 * yang belum dikirim, dialog yang sedang terbuka, dan penyaring yang
 * sedang aktif tidak ikut hilang. Karena itu ia aman dipanggil berkala,
 * berbeda dari location.reload().
 *
 * Yang TIDAK dikerjakan di sini: peta posisi. Ia sudah berlangganan
 * postgres_changes sungguhan dan menyimpan keadaannya sendiri, jadi
 * penyegaran ini tidak menyentuhnya sama sekali.
 */

/** Jeda penyegaran berkala selagi layar terlihat.
 *
 *  Tiga puluh detik: cukup rapat supaya angka tidak pernah terasa basi
 *  (Titik masuk tiap 15 detik, jadi paling lama dua Titik tertinggal),
 *  tetapi tidak seagresif yang membuat setiap perangkat menembak
 *  serangkaian kueri sepanjang hari. Penyegaran saat layar kembali
 *  terlihat — di bawah — yang sebenarnya paling menentukan; jeda ini
 *  sekadar penjaga bagi orang yang membiarkan satu halaman terbuka
 *  lama tanpa menyentuhnya.
 */
const JEDA_SEGARKAN_MS = 30_000

export function PenyegarOtomatis() {
  const router = useRouter()
  // Ref, bukan state: nilainya dibaca di dalam penangan peristiwa dan
  // tidak boleh memicu render ulang saat berubah. Diisi 0 lebih dulu,
  // BUKAN Date.now() — memanggil fungsi tak-murni saat render melanggar
  // aturan kemurnian React; nilai sungguhnya disetel di dalam efek.
  const terakhirSegar = useRef(0)

  useEffect(() => {
    terakhirSegar.current = Date.now()

    // Jangan menembak dua penyegaran berdempetan ketika layar kembali
    // terlihat tepat setelah pencacah berkala baru saja jalan.
    const segarkan = () => {
      terakhirSegar.current = Date.now()
      router.refresh()
    }

    const pencacah = setInterval(() => {
      // document.hidden: perangkat di saku tidak perlu menembak kueri.
      // Ini yang membedakan penyegaran berkala yang wajar dari yang
      // menghabiskan baterai dan kuota tanpa seorang pun melihat.
      if (!document.hidden) segarkan()
    }, JEDA_SEGARKAN_MS)

    // INI BAGIAN YANG PALING MENENTUKAN. Android membangunkan WebView
    // tanpa memuat ulang apa pun, jadi tanpa penangan ini aplikasi yang
    // kembali dibuka menampilkan data sebasi apa pun ia ditinggalkan.
    // visibilitychange dipakai, BUKAN plugin daur hidup Capacitor —
    // WebView memang membangkitkannya sendiri saat aplikasi masuk dan
    // keluar latar belakang, sehingga tidak perlu plugin native baru
    // dan tidak perlu APK dibangun ulang.
    const saatTerlihat = () => {
      if (document.hidden) return
      // Baru kembali sedetik lalu tidak perlu ditembak lagi.
      if (Date.now() - terakhirSegar.current < 2_000) return
      segarkan()
    }

    document.addEventListener('visibilitychange', saatTerlihat)
    // Peramban meja: berpindah tab tidak selalu mengubah visibility,
    // tetapi selalu mengubah fokus jendela.
    window.addEventListener('focus', saatTerlihat)

    return () => {
      clearInterval(pencacah)
      document.removeEventListener('visibilitychange', saatTerlihat)
      window.removeEventListener('focus', saatTerlihat)
    }
  }, [router])

  return null
}
