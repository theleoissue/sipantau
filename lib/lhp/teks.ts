import type { LhpLengkap, JenisDasarPenugasan } from './tipe'

// =====================================================================
// Menyusun LHP Ringkas menjadi teks siap-bagi bergaya "Laporan
// Sementara" yang benar-benar dipakai unit ini — kop Kepada/Dari,
// salam pembuka-penutup, dan delapan bagian romawi (DASAR, TUGAS,
// PETUGAS, WAKTU DAN TEMPAT, HASIL YANG DICAPAI, KESIMPULAN, RENCANA
// TINDAK LANJUT, PENUTUP). Bentuk sebelumnya (14 bagian tanpa kop)
// tidak dipakai siapa pun di lapangan — diganti total, bukan ditambah
// cabang baru, atas permintaan pemilik produk, dicontohkan dari surat
// asli yang ia kirim 14 September 2026.
//
// "Kepada Yth" dan "SUBDIT IV" adalah konstanta institusi (aplikasi ini
// memang hanya melayani Subdit IV — lihat CLAUDE.md §1), bukan data per
// LHP. "Dari" diturunkan dari nama unit penugasan ("Unit I" -> "KANIT I
// SUBDIT IV"), bukan nama pribadi penyusun — LHP selalu disusun Anggota
// (docs/00-fondasi.md §7 baris 341), tetapi secara institusional
// dilaporkan atas nama Kanit unitnya.
//
// Fungsi murni, aman dipakai Client Component (tidak menyentuh apa pun
// yang bersentuhan server).
// =====================================================================

const LABEL_DASAR: Record<JenisDasarPenugasan, string> = {
  laporan_informasi: 'Laporan Informasi',
  laporan_polisi: 'Laporan Polisi',
  laporan_pengaduan: 'Laporan Pengaduan',
  surat_perintah_terdahulu: 'Surat Perintah Terdahulu',
  disposisi_pimpinan: 'Disposisi Pimpinan',
  lainnya: 'Dasar Lainnya',
}

function tanggalIndo(iso: string | null): string {
  if (!iso) return ''
  const tanggal = new Date(iso)
  if (Number.isNaN(tanggal.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(tanggal)
}

function isiAtauStrip(isi: string | null): string {
  return isi && isi.trim() ? isi.trim() : '(belum diisi)'
}

/** "Unit I" -> "I". Tidak mengasumsikan angka romawi tunggal — dipotong
 *  dari kata pertama saja, supaya nama unit lain tetap aman diproses. */
function romawiUnit(namaUnit: string | undefined | null): string {
  return (namaUnit ?? '').replace(/^unit\s*/i, '').trim() || '—'
}

export function susunTeksWa(lhp: LhpLengkap): string {
  const penugasan = lhp.penugasan
  const unit = romawiUnit(penugasan?.unit?.nama)

  // I. DASAR — dasar tertulis penugasan (biasanya Laporan Informasi),
  // lalu Surat Perintah Penyelidikan penugasan itu sendiri sebagai
  // butir terakhir. Sprin bukan baris penugasan_dasar tersendiri (lihat
  // catatan migrasi historis 13-14 Sept 2026): ia melekat langsung di
  // kolom nomor_spt/diterbitkan_pada milik penugasan.
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
    : isiAtauStrip(lhp.dasar)

  // III. PETUGAS — personel kepolisian, lalu pihak dinas/instansi lain
  // yang hadir (lhp_saksi: PPLH/PPNS, Petugas Pengambil Contoh Uji, dst)
  // sebagai sub-daftar terpisah, persis susunan surat asli.
  const petugas = [...lhp.lhp_petugas].sort((a, b) => a.urutan - b.urutan)
  const petugasTeks = petugas.length === 0
    ? '(belum ada petugas ditunjuk)'
    : petugas.map((p, i) => `${i + 1}. ${p.users?.pangkat ? `${p.users.pangkat} ` : ''}${p.users?.nama ?? '—'}${p.users?.nrp ? ` (NRP ${p.users.nrp})` : ''}`).join('\n')

  const saksiTerurut = [...lhp.lhp_saksi].sort((a, b) => a.urutan - b.urutan)
  const saksiTeks = saksiTerurut.length
    ? '\n\nPihak Dinas/Instansi Terkait :\n'
      + saksiTerurut.map((s, i) => `${i + 1}. Sdr. ${s.nama}${s.kedudukan ? ` (${s.kedudukan})` : ''}`).join('\n')
    : ''

  // IV. WAKTU DAN TEMPAT digabung satu paragraf, sesuai contoh asli.
  const waktuTempat = `${isiAtauStrip(lhp.waktu_kegiatan)} yang terjadi di ${isiAtauStrip(lhp.tempat_kegiatan)}.`

  return `Kepada Yth :
KASUBDIT IV/TIPIDTER DIT RESKRIMSUS POLDA JABAR

Dari :
KANIT ${unit} SUBDIT IV

Assalamu'alaikum Wr. Wb.

Mohon ijin Komandan melaporkan pelaksanaan Tugas yang dilaksanakan oleh Penyelidik Unit ${unit} Subdit IV Ditreskrimsus Polda Jabar terkait perkara dugaan tindak pidana ${isiAtauStrip(lhp.perkara ?? penugasan?.judul ?? null)} sbb :

I. DASAR

${dasarTeks}

II. TUGAS
${isiAtauStrip(penugasan?.uraian_tugas ?? null)}

III. PETUGAS
${petugasTeks}${saksiTeks}

IV. WAKTU DAN TEMPAT
${waktuTempat}

V. HASIL YANG DICAPAI
${isiAtauStrip(lhp.kronologis)}

VI. KESIMPULAN
${isiAtauStrip(lhp.kesimpulan)}

VII. RENCANA TINDAK LANJUT
${isiAtauStrip(lhp.rencana_tindak_lanjut)}

VIII. PENUTUP
Demikian Laporan sementara hasil kegiatan ${isiAtauStrip(lhp.perkara ?? penugasan?.judul ?? null)} yang disampaikan.

Dum, mohon jukrah.

Wassalamualaikum. Wr. Wb.`
}
