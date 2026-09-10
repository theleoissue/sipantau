/** Empat sudut harus membentuk bidang cembung tanpa garis bersilangan. */
export function sudutValid(titik: readonly { x: number; y: number }[]): boolean {
  if (titik.length !== 4 || titik.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return false
  const arah = titik.map((a, i) => {
    const b = titik[(i + 1) % 4], c = titik[(i + 2) % 4]
    return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
  })
  return arah.every(n => n > 1) || arah.every(n => n < -1)
}
