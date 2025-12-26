/**
 * VEIR Pro Engine - timebase helpers
 * - Internal timebase: integer microseconds (timeUs)
 * - Do NOT use float seconds for engine invariants (avoid drift).
 */

export type TimeUs = number & { readonly __brand: 'TimeUs' }

export function timeUs(v: number): TimeUs {
  // Keep as runtime number; brand for TS only.
  return v as TimeUs
}

export function secToUs(seconds: number): TimeUs {
  return timeUs(Math.round(seconds * 1_000_000))
}

export function usToSec(us: TimeUs): number {
  return (us as number) / 1_000_000
}

export function clampUs(v: TimeUs, min: TimeUs, max: TimeUs): TimeUs {
  const n = v as number
  return timeUs(Math.max(min as number, Math.min(max as number, n)))
}

export function frameIndexToTimeUs(frameIndex: number, fps: number): TimeUs {
  // Deterministic grid aligned to fps.
  return timeUs(Math.round((frameIndex * 1_000_000) / fps))
}

export function timeUsToFrameIndex(t: TimeUs, fps: number): number {
  return Math.round(((t as number) * fps) / 1_000_000)
}

export function samplesToTimeUs(sampleIndex: number, sampleRate: number): TimeUs {
  return timeUs(Math.round((sampleIndex * 1_000_000) / sampleRate))
}


