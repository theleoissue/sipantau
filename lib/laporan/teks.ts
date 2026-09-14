import type { LaporanLengkap } from './tipe'

// =====================================================================
// Menyusun laporan lapangan (laporan_harian) menjadi teks siap-bagi
// bergaya "Laporan Sementara" — kop Kepada/Dari, salam pembuka-penutup,
// dan delapan bagian romawi. Sama persis strukturnya dengan
// lib/lhp/teks.ts (yang sekarang jadi riwayat baca-saja, 0071), tapi
// membaca dari laporan_harian: Dari/Kepada disimpan permanen per
// laporan (posisi_pengirim/tujuan_surat), bukan diturunkan dari nama
// unit — pengirimnya sendiri yang memilih saat mengisi formulir.
//
// Bagian I-IV (Dasar/Tugas/Petugas/Waktu&Tempat) diambil dari
// penugasan, tidak diketik ulang pelapor. V. HASIL YANG DICAPAI memakai
// kolom uraian yang sudah ada; VI-VII memakai kolom baru
// kesimpulan/rencana_tindak_lanjut.
//
// Fungsi murni, aman dipakai Client Component.
// =====================================================================

const LABEL_DASAR: Record<string, string> = {
  laporan_informasi: 'Laporan Informasi',
  laporan_polisi: 'Laporan Polisi',
  laporan_pengaduan: 'Laporan Pengaduan',
  surat_perintah_terdahulu: 'Surat Perintah Terdahulu',
  disposisi_pimpinan: 'Disposisi Pimpinan',
  lainnya: 'Dasar Lainnya',
}

const LABEL_KEPADA: Record<string, string> = {
  kasubdit_subdit_iv: 'KASUBDIT IV/TIPIDTER DIT RESKRIMSUS POLDA JABAR',
  direktur_reskrimsus: 'DIREKTUR RESERSE KRIMINAL KHUSUS POLDA JABAR',
}

function tanggalIndo(iso: string | null): string {
  if (!iso) return ''
  const tanggal = new Date(iso)
  if (Number.isNaN(tanggal.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(tanggal)
}

function isiAtauStrip(isi: string | null | undefined): string {
  return isi && isi.trim() ? isi.trim() : '(belum diisi)'
}

/** "Unit I" -> "I". */
function romawiUnit(namaUnit: string | undefined | null): string {
  return (namaUnit ?? '').replace(/^unit\s*/i, '').trim() || '—'
}

export function susunTeksWaLaporan(laporan: LaporanLengkap): string {
  const penugasan = laporan.penugasan
  const unit = romawiUnit(penugasan?.unit?.nama)

  const kepada = LABEL_KEPADA[laporan.tujuan_surat] ?? LABEL_KEPADA.kasubdit_subdit_iv
  const dari = laporan.posisi_pengirim === 'kasubdit'
    ? 'KASUBDIT IV SUBDIT IV'
    : `${laporan.posisi_pengirim.toUpperCase()} ${unit} SUBDIT IV`

  // I. DASAR
  const dasarList: string[] = []
  const dasarTerurut = [...(penugasan?.penugasan_dasar ?? [])].sort((a, b) => a.urutan - b.urutan)
  for (const d of dasarTerurut) {
    const label = LABEL_DASAR[d.jenis] ?? 'Dasar'
    dasarList.push(`Nomor : ${d.nomor ?? '—'}${d.tanggal ? `, tanggal ${tanggalIndo(d.tanggal)}` : ''} (${label})`)
  }
  if (penugasan?.nomor_spt) {
    dasarList.push(`Surat Perintah Penyelidikan Nomor : ${penugasan.nomor_spt}${penugasan.diterbitkan_pada ? `, tanggal ${tanggalIndo(penugasan.diterbitkan_pada)}` : ''}.`)
  }
  const dasarTeks = dasarList.length
    ? dasarList.map((d, i) => `${i + 1}. ${d}`).join('\n')
    : '(belum diisi)'

  // III. PETUGAS — Panit lalu Anggota pelaksana aktif.
  const panitAktif = (penugasan?.penugasan_panit ?? []).filter(p => !p.dicabut_pada)
  const pelaksanaAktif = (penugasan?.penugasan_pelaksana ?? []).filter(p => !p.dicabut_pada)
  const semuaPetugas = [...panitAktif.map(p => p.users), ...pelaksanaAktif.map(p => p.users)].filter((u): u is NonNullable<typeof u> => !!u)
  const petugasTeks = semuaPetugas.length === 0
    ? '(belum ada petugas ditunjuk)'
    : semuaPetugas.map((u, i) => `${i + 1}. ${u.pangkat ? `${u.pangkat} ` : ''}${u.nama}${u.nrp ? ` (NRP ${u.nrp})` : ''}`).join('\n')

  // IV. WAKTU DAN TEMPAT
  const waktu = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(laporan.dikirim_pada))
  const tempat = laporan.lokasi_pilihan?.nama ?? laporan.lokasi_terdekat?.nama ?? laporan.keterangan_lokasi ?? penugasan?.judul ?? '(lokasi belum diketahui)'
  const waktuTempat = `${waktu} WIB yang terjadi di ${tempat}.`

  return `Kepada Yth :
${kepada}

Dari :
${dari}

Assalamu'alaikum Wr. Wb.

Mohon ijin Komandan melaporkan pelaksanaan Tugas yang dilaksanakan oleh Penyelidik Unit ${unit} Subdit IV Ditreskrimsus Polda Jabar terkait perkara dugaan tindak pidana ${isiAtauStrip(penugasan?.judul)} sbb :

I. DASAR

${dasarTeks}

II. TUGAS
${isiAtauStrip(penugasan?.uraian_tugas)}

III. PETUGAS
${petugasTeks}

IV. WAKTU DAN TEMPAT
${waktuTempat}

V. HASIL YANG DICAPAI
${isiAtauStrip(laporan.uraian)}

VI. KESIMPULAN
${isiAtauStrip(laporan.kesimpulan)}

VII. RENCANA TINDAK LANJUT
${isiAtauStrip(laporan.rencana_tindak_lanjut)}

VIII. PENUTUP
Demikian Laporan sementara hasil kegiatan ${isiAtauStrip(penugasan?.judul)} yang disampaikan.

Dum, mohon jukrah.

Wassalamualaikum. Wr. Wb.`
}
