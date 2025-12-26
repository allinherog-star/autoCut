import type { TimeUs } from '../time'

export type TimeStretchQuality = 'draft' | 'high'

export type RatioAtUs = (outputTimeUs: TimeUs) => number

export type TimeStretchInput = {
  sampleRate: number
  channels: number
  input: Float32Array[] // planar
  outputFrames: number
  ratioAt: RatioAtUs
  quality?: TimeStretchQuality
}

export type TimeStretchEngine = {
  readonly kind: 'wasm-worker' | 'js-fallback'
  init(): Promise<void>
  stretchPlanarF32(input: TimeStretchInput): Promise<Float32Array[]>
  destroy(): void
}


