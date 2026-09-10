/* eslint-disable @typescript-eslint/no-require-imports */
/* Uji komponen tanpa akun produksi. --preview menyajikan contoh data sintetis lokal. */
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const assert = require('node:assert/strict')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const h = React.createElement
const root = path.resolve(__dirname, '..')
function muat(file, mocks = {}) {
  const filename = path.join(root, file)
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.paths = module.paths
  const biasa = mod.require.bind(mod)
  mod.require = id => id in mocks ? mocks[id] : biasa(id)
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
  } }).outputText, filename)
  return mod.exports
}
const { sudutValid } = muat('lib/scan/validasi-sudut.ts')
assert.equal(sudutValid([{x:0,y:0},{x:100,y:0},{x:100,y:200},{x:0,y:200}]), true)
assert.equal(sudutValid([{x:0,y:0},{x:100,y:200},{x:100,y:0},{x:0,y:200}]), false)
assert.equal(sudutValid([{x:0,y:0},{x:0,y:0},{x:100,y:200},{x:0,y:200}]), false)
const { TabelResponsif } = muat('components/sipantau/tabel-responsif.tsx')
const tabel = renderToStaticMarkup(h(TabelResponsif, null,
  h('thead', null, h('tr', null, h('th', null, 'Nama'), false, h('th', null, 'Status'), h('th', null))),
  h('tbody', null, h('tr', null, h('td', null, 'Personel Contoh Dengan Nama Panjang, S.H.'), false,
    h('td', null, 'Sedang bertugas'), h('td', null, h('button', {className:'btn btn-o'}, 'Kelola anggota'))))))
assert.match(tabel, /data-label="Nama"/)
assert.match(tabel, /data-label="Status"/)
assert.match(tabel, /data-label="Tindakan"/)
const menu = muat('lib/auth/menu.ts')
const ikon = muat('components/sipantau/ikon.tsx')
const { BilahBawah } = muat('components/sipantau/bilah-bawah.tsx', {
  'next/link': {default: ({href, ...props}) => h('a', {...props, href})},
  'next/navigation': {usePathname: () => '/tugas'},
  '@/lib/auth/menu': menu,
  './ikon': ikon,
})
const nav = renderToStaticMarkup(h(BilahBawah, {peran:'anggota', sesiBerjalan:true}))
assert.equal((nav.match(/<a /g) || []).length, 5)
assert.match(nav, /sesi-berjalan/)
assert.match(nav, /Sedang Bertugas/)
const atasan = renderToStaticMarkup(h(BilahBawah, {peran:'kanit'}))
assert.equal((atasan.match(/<a /g) || []).length, 5)
assert.match(atasan, /bb-pusat/)
console.log('11 pemeriksaan komponen/validasi crop lulus.')
if (process.argv.includes('--preview')) {
  require('node:http').createServer((req,res) => {
    if (req.url === '/styles.css') { res.setHeader('Content-Type','text/css'); res.end(fs.readFileSync(path.join(root,'app/globals.css'),'utf8').replace(/^@import.*$/gm,'')); return }
    res.setHeader('Content-Type','text/html; charset=utf-8')
    res.end(`<!doctype html><html lang="id"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>Uji redesign — data contoh</title><body class="sudah-masuk"><div id="rangka"><header id="hd"><button class="ikon-btn" aria-label="Menu">${renderToStaticMarkup(h(ikon.Ikon,{nama:'menu'}))}</button><div class="jejak">Detail Penugasan</div></header><main id="utama"><div class="kh"><div><h1>Penugasan contoh</h1><p class="sub">Pratinjau komponen dengan data sintetis.</p></div></div><section class="kartu"><div class="kartu-h"><h3>Personel</h3><span class="isyarat">1 orang</span></div><div class="tw">${tabel}</div></section><details class="kartu bagian-lipat" style="margin-top:16px"><summary>Dasar penugasan <span>2 dasar</span></summary><div class="kartu-b">Isi dasar contoh, dapat dilipat kembali.</div></details><section class="kartu" style="margin-top:16px"><div class="kartu-h"><div><h3>Panit Penanggung Jawab</h3><p class="kartu-keterangan">Memimpin pelaksanaan di lapangan.</p></div><div class="tim-kartu-aksi"><span class="isyarat">1 orang</span><details class="kelola-tim-lipat"><summary class="btn btn-o">Kelola Panit</summary><div class="kelola-tim"><div class="kelola-tim-blok"><div class="kelola-tim-tambah"><select aria-label="Pilih Panit"><option>Pilih personel dengan nama panjang</option></select><button class="btn btn-p">Tunjuk</button></div></div></div></details></div></div><div class="kartu-b">Personel contoh</div></section><p class="spt-progres-label">Dibuka oleh 1 dari 5 pelaksana</p></main></div>${nav}</body></html>`)
  }).listen(3101,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:3101'))
}
