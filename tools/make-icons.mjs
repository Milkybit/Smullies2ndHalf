// Genereert de PWA-iconen (vlam op donkergroen) zonder dependencies:
// een minimale PNG-encoder op node:zlib. Draaien met: npm run icons
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GROEN = [0x24, 0x38, 0x2f, 255]
const ACCENT = [0xc9, 0x8a, 0x2d, 255]
const LICHT = [0xfb, 0xfb, 0xf7, 255]

function crc32(buf) {
  let c, table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  c = -1
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(breedte, hoogte, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(breedte, 0)
  ihdr.writeUInt32BE(hoogte, 4)
  ihdr[8] = 8   // bitdiepte
  ihdr[9] = 6   // RGBA
  const rijen = Buffer.alloc(hoogte * (1 + breedte * 4))
  for (let y = 0; y < hoogte; y++) {
    const rij = y * (1 + breedte * 4)
    rijen[rij] = 0 // filter: none
    pixels.copy(rijen, rij + 1, y * breedte * 4, (y + 1) * breedte * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rijen, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Vlamvorm: druppel met scherpe punt boven en ronde onderkant.
// hoogte/breedte in genormaliseerde icoonruimte; tipY = y van de punt.
function inVlam(nx, ny, tipY, hoogte, halfBreedte) {
  const y = (ny - tipY) / hoogte
  if (y < 0 || y > 1) return false
  const splits = 0.6
  let w
  if (y < splits) {
    w = halfBreedte * (y / splits) ** 1.5
  } else {
    const t = (y - splits) / (1 - splits)
    w = halfBreedte * Math.sqrt(Math.max(0, 1 - t * t))
  }
  return Math.abs(nx) < w
}

function tekenIcoon(maat, metAchtergrond) {
  const px = Buffer.alloc(maat * maat * 4)
  const hoek = maat * 0.22
  for (let y = 0; y < maat; y++) {
    for (let x = 0; x < maat; x++) {
      // 2×2 supersampling tegen kartelranden
      let dekkingA = 0, dekkingB = 0, dekkingG = 0
      for (const [sx, sy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        const nx = (x + sx) / maat - 0.5
        const ny = (y + sy) / maat
        if (metAchtergrond) {
          const ax = Math.abs(x + sx - maat / 2) - (maat / 2 - hoek)
          const ay = Math.abs(y + sy - maat / 2) - (maat / 2 - hoek)
          const buiten = ax > 0 && ay > 0 && Math.hypot(ax, ay) > hoek
          if (!buiten) dekkingG++
        } else {
          dekkingG++
        }
        if (inVlam(nx, ny, 0.13, 0.72, 0.26)) dekkingA++
        if (inVlam(nx, ny, 0.47, 0.33, 0.125)) dekkingB++
      }
      const i = (y * maat + x) * 4
      let kleur = null, alpha = 0
      if (dekkingB > 0) { kleur = LICHT; alpha = dekkingB / 4 }
      else if (dekkingA > 0) { kleur = ACCENT; alpha = dekkingA / 4 }
      else if (dekkingG > 0) { kleur = GROEN; alpha = metAchtergrond ? dekkingG / 4 : 0 }
      if (kleur && alpha > 0) {
        // vlam mengen met de groene achtergrond
        const onder = dekkingG > 0 ? GROEN : [0, 0, 0, 0]
        px[i] = Math.round(kleur[0] * alpha + onder[0] * (1 - alpha))
        px[i + 1] = Math.round(kleur[1] * alpha + onder[1] * (1 - alpha))
        px[i + 2] = Math.round(kleur[2] * alpha + onder[2] * (1 - alpha))
        px[i + 3] = dekkingG > 0 ? 255 : Math.round(255 * alpha)
      }
    }
  }
  return png(maat, maat, px)
}

const map = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
mkdirSync(map, { recursive: true })
for (const maat of [180, 192, 512]) {
  writeFileSync(join(map, `icoon-${maat}.png`), tekenIcoon(maat, true))
  console.log(`icoon-${maat}.png`)
}
