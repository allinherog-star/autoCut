/**
 * WASM TimeStretch Worker (ffmpeg.wasm backend)
 *
 * Important:
 * - Uses ffmpeg.wasm core-mt (same-origin assets under /public/ffmpeg-core)
 * - Implements pitch-preserving time-stretch using FFmpeg `atempo`.
 * - Supports time-varying ratio via piecewise-constant segmentation (offline export oriented).
 */

import type { WasmTimeStretchMessage, WasmTimeStretchResponse } from './worker-protocol'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let loaded = false
let loading: Promise<void> | null = null

function reply(msg: WasmTimeStretchResponse) {
  ;(self as any).postMessage(msg)
}

async function ensureFfmpegLoaded(coreBaseURL: string) {
  if (loaded) return
  if (loading) return await loading

  loading = (async () => {
    ffmpeg = new FFmpeg()
    // Quiet default; can be wired for debug
    // ffmpeg.on('log', ({ message }) => console.log('[ffmpeg]', message))

    const base = coreBaseURL.replace(/\/$/, '')
    const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript')
    const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm')
    const workerURL = await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript')

    await ffmpeg.load({ coreURL, wasmURL, workerURL })
    loaded = true
  })()

  await loading
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function interleavePlanar(planar: Float32Array, channels: number, frames: number): Float32Array {
  const out = new Float32Array(frames * channels)
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      out[i * channels + c] = planar[c * frames + i] ?? 0
    }
  }
  return out
}

function deinterleaveToPlanar(interleaved: Float32Array, channels: number, frames: number): Float32Array {
  const out = new Float32Array(channels * frames)
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      out[c * frames + i] = interleaved[i * channels + c] ?? 0
    }
  }
  return out
}

function buildAtempoFilter(tempo: number): string {
  // atempo supports 0.5..2.0 per instance; chain for wider range
  const parts: number[] = []
  let t = tempo
  while (t > 2.0) {
    parts.push(2.0)
    t /= 2.0
  }
  while (t < 0.5) {
    parts.push(0.5)
    t /= 0.5
  }
  parts.push(t)
  return parts.map((x) => `atempo=${x.toFixed(6)}`).join(',')
}

function segmentRatioCurve(ratioCurve: Float32Array, minSegFrames: number, maxSegFrames: number): Array<{ start: number; end: number; avgRatio: number }> {
  const segments: Array<{ start: number; end: number; avgRatio: number }> = []
  const n = ratioCurve.length
  let s = 0
  while (s < n) {
    let e = Math.min(n, s + maxSegFrames)
    // Start with a small window, then grow while variance is small.
    let sum = 0
    let cnt = 0
    let min = Infinity
    let max = -Infinity
    let cur = s
    const targetEnd = e
    for (; cur < targetEnd; cur++) {
      const r0 = ratioCurve[cur]!
      const r = clamp(Number.isFinite(r0) ? r0 : 1, 0.25, 4)
      sum += r
      cnt++
      if (r < min) min = r
      if (r > max) max = r
      const len = cur - s + 1
      if (len >= minSegFrames && (max - min) > 0.06) { // variance threshold
        // cut before it gets too variant
        cur--
        break
      }
    }
    const end = Math.max(s + 1, Math.min(n, cur + 1))
    const avgRatio = cnt > 0 ? sum / cnt : 1
    segments.push({ start: s, end, avgRatio })
    s = end
  }
  return segments
}

async function ffmpegAtempoTimeStretch(params: {
  sampleRate: number
  channels: number
  inputPlanar: Float32Array
  inputFrames: number
  outputFrames: number
  ratioCurve: Float32Array
}): Promise<Float32Array> {
  if (!ffmpeg || !loaded) throw new Error('ffmpeg not loaded')

  const { sampleRate, channels, inputPlanar, inputFrames, outputFrames, ratioCurve } = params
  const outPlanar = new Float32Array(channels * outputFrames)
  if (inputFrames <= 1 || outputFrames <= 0) return outPlanar

  // Segmentation (offline oriented)
  const minSeg = Math.max(2048, Math.floor(sampleRate * 0.25)) // >= 250ms
  const maxSeg = Math.max(minSeg, Math.floor(sampleRate * 2.0)) // <= 2s
  const segs = segmentRatioCurve(ratioCurve, minSeg, maxSeg)

  let inCursor = 0
  let outCursor = 0
  let segIndex = 0

  for (const seg of segs) {
    const outLen = seg.end - seg.start
    // output/input = ratio => input ~= output/ratio
    const ratio = clamp(seg.avgRatio, 0.25, 4)
    const inLen = Math.max(1, Math.min(inputFrames - inCursor, Math.round(outLen / ratio)))

    const inSegPlanar = new Float32Array(channels * inLen)
    for (let c = 0; c < channels; c++) {
      const srcBase = c * inputFrames + inCursor
      const dstBase = c * inLen
      inSegPlanar.set(inputPlanar.subarray(srcBase, srcBase + inLen), dstBase)
    }

    const inInterleaved = interleavePlanar(inSegPlanar, channels, inLen)
    // Write raw PCM
    const inName = `in_${segIndex}.f32le`
    const outName = `out_${segIndex}.f32le`
    await ffmpeg.writeFile(inName, new Uint8Array(inInterleaved.buffer))

    const tempo = 1 / ratio // atempo = tempo
    const filter = buildAtempoFilter(clamp(tempo, 0.125, 8))

    // Run ffmpeg: raw f32le -> atempo -> raw f32le
    await ffmpeg.exec([
      '-f', 'f32le',
      '-ar', String(sampleRate),
      '-ac', String(channels),
      '-i', inName,
      '-filter:a', filter,
      '-f', 'f32le',
      outName,
    ])

    const outBytes = await ffmpeg.readFile(outName)
    // Cleanup (best effort)
    try { await ffmpeg.deleteFile(inName) } catch {}
    try { await ffmpeg.deleteFile(outName) } catch {}

    const outInterleaved = new Float32Array(outBytes.buffer, outBytes.byteOffset, Math.floor(outBytes.byteLength / 4))
    // Convert to planar and copy to output window (trim/pad to expected outLen)
    const producedFrames = Math.floor(outInterleaved.length / channels)
    const takeFrames = Math.min(outLen, producedFrames, outputFrames - outCursor)
    const planarProduced = deinterleaveToPlanar(outInterleaved, channels, takeFrames)
    for (let c = 0; c < channels; c++) {
      outPlanar.set(
        planarProduced.subarray(c * takeFrames, (c + 1) * takeFrames),
        c * outputFrames + outCursor
      )
    }
    // If produced less than expected, remaining stays 0 (silence)

    inCursor += inLen
    outCursor += outLen
    segIndex++

    if (outCursor >= outputFrames || inCursor >= inputFrames) break
  }

  return outPlanar
}

;(self as any).onmessage = async (ev: MessageEvent<WasmTimeStretchMessage>) => {
  const msg = ev.data
  if (!msg || typeof msg !== 'object') return

  if (msg.type === 'init') {
    try {
      await ensureFfmpegLoaded(msg.coreBaseURL ?? '/ffmpeg-core')
      reply({ type: 'init-ok' })
    } catch (e) {
      reply({ type: 'init-error', error: (e as Error).message })
    }
    return
  }

  if (msg.type === 'stretch') {
    try {
      if (!loaded) throw new Error('ffmpeg not initialized')

      const outputPlanar = await ffmpegAtempoTimeStretch({
        sampleRate: msg.sampleRate,
        channels: msg.channels,
        inputPlanar: msg.inputPlanar,
        inputFrames: msg.inputFrames,
        outputFrames: msg.outputFrames,
        ratioCurve: msg.ratioCurve,
      })
      reply({
        type: 'stretch-ok',
        requestId: msg.requestId,
        outputPlanar,
        outputFrames: msg.outputFrames,
        channels: msg.channels,
      })
    } catch (e) {
      reply({ type: 'stretch-error', requestId: msg.requestId, error: (e as Error).message })
    }
  }
}


