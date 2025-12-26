import { JsFallbackTimeStretchEngine } from './js-fallback'
import { WasmWorkerTimeStretchEngine } from './wasm-worker-engine'
import type { TimeStretchEngine } from './types'

export * from './types'

export async function createPreferredTimeStretchEngine(opts?: { coreBaseURL?: string }): Promise<TimeStretchEngine> {
  const coreBaseURL = opts?.coreBaseURL ?? '/ffmpeg-core'

  try {
    const engine = new WasmWorkerTimeStretchEngine({ coreBaseURL })
    await engine.init()
    return engine
  } catch (e) {
    console.warn('[VEIR Pro] WASM time-stretch unavailable; using JS fallback', e)
    const engine = new JsFallbackTimeStretchEngine()
    await engine.init()
    return engine
  }
}


