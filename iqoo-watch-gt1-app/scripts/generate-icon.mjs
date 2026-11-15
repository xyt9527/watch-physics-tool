// 生成 114x114 应用图标 icon.png（无需第三方图像库）
// 运行：node scripts/generate-icon.mjs
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SIZE = 114

const BG = [24, 144, 255, 255] // #1890ff
const WHITE = [255, 255, 255, 255]
const DARK = [15, 17, 21, 255]

function inRoundedRect(x, y, x0, y0, w, h, r) {
  if (x < x0 || x >= x0 + w || y < y0 || y >= y0 + h) return false
  const cx = x < x0 + r ? x0 + r : x >= x0 + w - r ? x0 + w - r : x
  const cy = y < y0 + r ? y0 + r : y >= y0 + h - r ? y0 + h - r : y
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

const pixels = new Uint8Array(SIZE * SIZE * 4)
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4
    let c = BG
    if (inRoundedRect(x, y, 33, 28, 48, 58, 10)) c = WHITE
    if (x >= 40 && x < 74 && y >= 35 && y < 45) c = DARK
    const cols = [40, 52, 64]
    const rows = [52, 64]
    for (const rx of cols) {
      for (const ry of rows) {
        if (inRoundedRect(x, y, rx, ry, 9, 9, 3)) c = DARK
      }
    }
    pixels[i] = c[0]
    pixels[i + 1] = c[1]
    pixels[i + 2] = c[2]
    pixels[i + 3] = c[3]
  }
}

// PNG 编码
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type RGBA
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  const rowStart = y * (SIZE * 4 + 1)
  raw[rowStart] = 0 // filter: none
  raw.set(pixels.subarray(y * SIZE * 4, (y + 1) * SIZE * 4), rowStart + 1)
}
const idat = zlib.deflateSync(raw)

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
])

const out = path.join(__dirname, '..', 'src', 'assets', 'images', 'icon.png')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, png)
console.log('icon written:', out, png.length, 'bytes')
