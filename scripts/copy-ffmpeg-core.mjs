import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'esm')
const destDir = path.join(projectRoot, 'public', 'ffmpeg-core')

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function copyFile(from, to) {
  ensureDir(path.dirname(to))
  fs.copyFileSync(from, to)
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.warn('[copy-ffmpeg-core] source not found, skip:', srcDir)
    process.exit(0)
  }

  ensureDir(destDir)

  const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js']
  for (const f of files) {
    const from = path.join(srcDir, f)
    const to = path.join(destDir, f)
    if (!fs.existsSync(from)) {
      console.warn('[copy-ffmpeg-core] missing:', from)
      continue
    }
    copyFile(from, to)
  }

  console.log('[copy-ffmpeg-core] copied core-mt assets to', destDir)
}

main()


