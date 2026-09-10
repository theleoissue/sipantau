// Sisa daya perangkat, untuk kolom baterai_persen yang sudah ada sejak
// migrasi 0015 tetapi selama ini selalu diisi null.
//
// Dipakai bukan untuk hiasan: tanpa angka ini tidak pernah ada bukti
// berapa sebenarnya biaya baterai satu Sesi Tugas, sehingga setiap
// keputusan soal kerapatan perekaman hanya bisa ditebak. Dengan kolom
// ini terisi, pertanyaan itu dijawab dinas sungguhan.
//
// Battery Status API tersedia di Chrome dan di WebView Android yang
// dipakai APK, tetapi TIDAK di semua peramban. Kalau tidak ada, hasilnya
// null — persis keadaan sebelumnya, jadi tidak ada yang rusak.

interface StatusBaterai { level: number }

export async function bateraiPersen(): Promise<number | null> {
  try {
    const nav = navigator as Navigator & { getBattery?: () => Promise<StatusBaterai> }
    if (typeof nav.getBattery !== 'function') return null
    const status = await nav.getBattery()
    if (typeof status?.level !== 'number') return null
    return Math.max(0, Math.min(100, Math.round(status.level * 100)))
  } catch {
    return null
  }
}
