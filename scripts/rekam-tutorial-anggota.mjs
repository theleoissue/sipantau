import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const baseUrl = (process.env.TUTORIAL_BASE_URL ?? 'https://www.sipantaujabar.my.id').replace(/\/$/, '')
const nrp = process.env.TUTORIAL_ANGGOTA_NRP
const password = process.env.TUTORIAL_ANGGOTA_PASSWORD

if (!nrp || !password) throw new Error('Secret TUTORIAL_ANGGOTA_NRP dan TUTORIAL_ANGGOTA_PASSWORD wajib tersedia.')

await mkdir('artefak/tutorial-anggota', { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: 'artefak/tutorial-anggota', size: { width: 1280, height: 720 } },
})
const page = await context.newPage()
const video = page.video()

async function jeda(ms = 1800) { await page.waitForTimeout(ms) }
async function buka(path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  await jeda()
}

try {
  await buka('/masuk')
  await page.getByLabel('NRP').fill(nrp)
  await page.getByLabel('Kata sandi').fill(password)
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL(/\/beranda/, { timeout: 20_000 })
  await jeda(3000)

  // Hanya membuka halaman. Script tidak membuat laporan, tidak memulai
  // Sesi Tugas, dan tidak mengubah data operasional apa pun.
  await buka('/penugasan')
  const tugas = page.locator('a[href^="/penugasan/"][href*="-"]').first()
  if (await tugas.count()) {
    await tugas.click()
    await page.waitForLoadState('networkidle')
    await jeda(2200)
  }
  await buka('/tugas')
  await buka('/lapor')
  await buka('/peta')
  await jeda(2800)
} finally {
  await context.close()
  await video?.saveAs('artefak/tutorial-anggota/tutorial-anggota.webm')
  await browser.close()
}
