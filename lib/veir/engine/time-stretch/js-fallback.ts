/**
 * JS fallback time-stretch (non pitch-preserving)
 * - Deterministic
 * - Never explodes (NaN/Inf guarded)
 * - Prioritizes time correctness; pitch may shift.
 *
 * This is the safety net when WASM engine is not available or trips circuit breakers.
 */

import type { TimeUs } from '../time'
import { timeUs } from '../time'
import type { TimeStretchEngine, TimeStretchInput } from './types'

function safeRatio(r: number): number {
  if (!Number.isFinite(r)) return 1
  // ratio = outputHop / analysisHop ~= outputDuration / inputDuration, clamp
  return Math.min(4, Math.max(0.25, r))
}

export class JsFallbackTimeStretchEngine implements TimeStretchEngine {
  readonly kind = 'js-fallback' as const

  async init(): Promise<void> {
    // no-op
  }

  async stretchPlanarF32(req: TimeStretchInput): Promise<Float32Array[]> {
    const { sampleRate, channels, input, outputFrames, ratioAt } = req
    const out: Float32Array[] = new Array(channels).fill(0).map(() => new Float32Array(outputFrames))
    const inLen = input[0]?.length ?? 0
    if (inLen <= 1) return out

    const maxIdx = inLen - 1

    // We interpret ratioAt as time-varying output/input ratio. For a stable fallback,
    // we approximate input time by integrating 1/ratio over output time.
    //
    // inputTimeUs(t) = ∫ (1/ratioAtUs(u)) du
    let accInputUs = 0
    for (let i = 0; i < outputFrames; i++) {
      const outTimeUs = timeUs(Math.round((i * 1_000_000) / sampleRate)) as TimeUs
      const ratio = safeRatio(ratioAt(outTimeUs))
      // dt in us for one sample
      const dtUs = Math.round(1_000_000 / sampleRate)
      const inv = 1 / ratio
      accInputUs += inv * dtUs

      let x = (accInputUs / 1_000_000) * sampleRate
      if (!Number.isFinite(x)) x = 0
      if (x < 0) x = 0
      if (x > maxIdx) x = maxIdx
      const x0 = Math.floor(x)
      const x1 = Math.min(maxIdx, x0 + 1)
      const t = x - x0

      for (let c = 0; c < channels; c++) {
        const ch = input[c]!
        const s0 = ch[x0] ?? 0
        const s1 = ch[x1] ?? 0
        const v = s0 * (1 - t) + s1 * t
        out[c]![i] = Number.isFinite(v) ? v : 0
      }
    }

    return out
  }

  destroy(): void {
    // no-op
  }
}


