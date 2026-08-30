import type { LhpLengkap } from './tipe'

// =====================================================================
// Menyusun LHP Ringkas menjadi teks siap-bagi bergaya "Laporan
// Perkembangan" (format WA) — bagian romawi mengikuti persis contoh
// yang diberikan pemilik produk. Fungsi murni, aman dipakai Client
// Component (tidak menyentuh apa pun yang bersentuhan server).
//
// TIDAK menyertakan baris KEPADA/DARI/salam ke nama pejabat tertentu —
// data itu tidak ada di skema lhp (fondasi.md hanya menyebut "kepala
// surat dari templat institusi", bukan nama penerima per laporan).
// Ini LHP RINGKAS, bukan surat resmi lengkap (BR-10) — bagian
// pembuka/penutup dibuat netral, isi romawi yang jadi substansinya.
// =====================================================================

function baris(label: string, isi: string | null): string {
  return isi && isi.trim() ? isi.trim() : '—'
}

export function susunTeksWa(lhp: LhpLengkap): string {
  const petugas = [...lhp.lhp_petugas].sort((a, b) => a.urutan - b.urutan)
  const pelapor = lhp.lhp_pihak.filter(p => p.peran === 'pelapor')
  const terlapor = lhp.lhp_pihak.filter(p => p.peran === 'terlapor')

  const baganOrang = (daftar: typeof pelapor) =>
    daftar.length === 0
      ? '—'
      : daftar.map((p, i) => `${i + 1}. ${p.nama}${p.nomor_pengenal ? ` (${p.nomor_pengenal})` : ''}`).join('\n')

  return `LAPORAN PERKEMBANGAN PENYELIDIKAN
${lhp.penugasan?.nomor_spt ?? '—'}

Mohon ijin melaporkan perkembangan penanganan ${lhp.penugasan?.judul ?? 'perkara'}.

I. DASAR
${baris('Dasar', lhp.dasar)}

II. WAKTU
${baris('Waktu', lhp.waktu_kegiatan)}

III. TEMPAT/TKP
${baris('Tempat', lhp.tempat_kegiatan)}

IV. PERKARA
${baris('Perkara', lhp.perkara)}

V. PETUGAS
${petugas.length === 0 ? '—' : petugas.map((p, i) =>
  `${i + 1}. ${p.users?.nama ?? '—'}${p.users?.pangkat ? `, ${p.users.pangkat}` : ''}${p.users?.nrp ? ` (NRP ${p.users.nrp})` : ''}`
).join('\n')}

VI. PASAL/UNDANG-UNDANG
${baris('Pasal', lhp.dasar_hukum)}

VII. PELAPOR
${baganOrang(pelapor)}

VIII. TERLAPOR
${baganOrang(terlapor)}

IX. KRONOLOGIS SINGKAT/HASIL KEGIATAN/FAKTA-FAKTA DI LAPANGAN
${baris('Kronologis', lhp.kronologis)}

X. BARANG BUKTI
${lhp.lhp_barang_bukti.length === 0 ? '—' : lhp.lhp_barang_bukti.map(b => `- ${b.uraian}`).join('\n')}

XI. LANGKAH-LANGKAH YANG DILAKUKAN
${baris('Langkah', lhp.langkah)}

XII. RENCANA TINDAK LANJUT
${baris('Rencana', lhp.rencana_tindak_lanjut)}

XIII. KESIMPULAN
${baris('Kesimpulan', lhp.kesimpulan)}

XIV. CATATAN
${baris('Catatan', lhp.catatan)}

Demikian LHP Ringkas ini disusun untuk menjadi bahan laporan lebih lanjut.

${lhp.penyusun?.nama ?? '—'}${lhp.penyusun?.pangkat ? `, ${lhp.penyusun.pangkat}` : ''}${lhp.penyusun?.nrp ? `\nNRP ${lhp.penyusun.nrp}` : ''}`
}
