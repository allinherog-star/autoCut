/**
 * WASM Worker time-stretch engine (preferred path)
 * - Runs in WebWorker to avoid blocking UI
 * - Prefers a WASM implementation (provided at runtime), but is safe to fail and fallback.
 */

import type { TimeUs } from '../time'
import { timeUs } from '../time'
import type { TimeStretchEngine, TimeStretchInput } from './types'
import type { WasmTimeStretchMessage, WasmTimeStretchResponse } from './worker-protocol'

export type WasmWorkerEngineOptions = {
  coreBaseURL?: string
}

function safeRatio(r: number): number {
  if (!Number.isFinite(r)) return 1
  return Math.min(4, Math.max(0.25, r))
}

function makeRequestId(): string {
  const c = (globalThis as any).crypto
  if (c?.randomUUID) return c.randomUUID()
  // Deterministic uniqueness is not required; just avoid collisions in-flight.
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

export class WasmWorkerTimeStretchEngine implements TimeStretchEngine {
  readonly kind = 'wasm-worker' as const

  private worker: Worker | null = null
  private pending = new Map<string, { resolve: (v: Float32Array[]) => void; reject: (e: Error) => void }>()
  private inited = false

  constructor(private options: WasmWorkerEngineOptions) {}

  async init(): Promise<void> {
    if (this.inited) return
    if (typeof window === 'undefined') throw new Error('WasmWorkerTimeStretchEngine must run in browser')

    // Worker bundling: Next supports new Worker(new URL(..., import.meta.url))
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (ev: MessageEvent<WasmTimeStretchResponse>) => this.onMessage(ev.data)
    this.worker.onerror = (ev) => {
      // Reject all pending
      const err = new Error(ev.message || 'worker error')
      for (const [, p] of this.pending) p.reject(err)
      this.pending.clear()
    }

    await new Promise<void>((resolve, reject) => {
      const onInit = (msg: WasmTimeStretchResponse) => {
        if (msg.type === 'init-ok') {
          cleanup()
          resolve()
        }
        if (msg.type === 'init-error') {
          cleanup()
          reject(new Error(msg.error))
        }
      }
      const cleanup = () => {
        this.worker?.removeEventListener('message', handler as any)
      }
      const handler = (ev: MessageEvent<WasmTimeStretchResponse>) => {
        onInit(ev.data)
      }
      this.worker!.addEventListener('message', handler as any)
      this.post({ type: 'init', coreBaseURL: this.options.coreBaseURL })
    })

    this.inited = true
  }

  async stretchPlanarF32(req: TimeStretchInput): Promise<Float32Array[]> {
    if (!this.worker || !this.inited) throw new Error('engine not initialized')
    const { sampleRate, channels, input, outputFrames, ratioAt } = req

    const inputFrames = input[0]?.length ?? 0
    const packed = new Float32Array(channels * inputFrames)
    for (let c = 0; c < channels; c++) packed.set(input[c] ?? new Float32Array(inputFrames), c * inputFrames)

    // ratio curve sampled per output frame
    const ratioCurve = new Float32Array(outputFrames)
    for (let i = 0; i < outputFrames; i++) {
      const outTimeUs = timeUs(Math.round((i * 1_000_000) / sampleRate)) as TimeUs
      ratioCurve[i] = safeRatio(ratioAt(outTimeUs))
    }

    const requestId = makeRequestId()

    const p = new Promise<Float32Array[]>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject })
    })

    this.post({
      type: 'stretch',
      requestId,
      sampleRate,
      channels,
      inputPlanar: packed,
      inputFrames,
      outputFrames,
      ratioCurve,
    })

    return await p
  }

  destroy(): void {
    try {
      this.worker?.terminate()
    } catch {}
    this.worker = null
    this.pending.clear()
    this.inited = false
  }

  private post(msg: WasmTimeStretchMessage) {
    this.worker?.postMessage(msg)
  }

  private onMessage(msg: WasmTimeStretchResponse) {
    if (msg.type === 'stretch-ok') {
      const p = this.pending.get(msg.requestId)
      if (!p) return
      this.pending.delete(msg.requestId)
      const { channels, outputFrames, outputPlanar } = msg
      const out: Float32Array[] = []
      for (let c = 0; c < channels; c++) {
        out.push(outputPlanar.subarray(c * outputFrames, (c + 1) * outputFrames))
      }
      p.resolve(out)
      return
    }
    if (msg.type === 'stretch-error') {
      const p = this.pending.get(msg.requestId)
      if (!p) return
      this.pending.delete(msg.requestId)
      p.reject(new Error(msg.error))
    }
  }
}


