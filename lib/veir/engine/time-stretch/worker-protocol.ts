export type WasmTimeStretchInitMessage = {
  type: 'init'
  coreBaseURL?: string
}

export type WasmTimeStretchStretchMessage = {
  type: 'stretch'
  requestId: string
  sampleRate: number
  channels: number
  // planar packed as [ch0...][ch1...]
  inputPlanar: Float32Array
  inputFrames: number
  outputFrames: number
  // ratio curve sampled per output frame (safe & deterministic)
  ratioCurve: Float32Array
}

export type WasmTimeStretchMessage = WasmTimeStretchInitMessage | WasmTimeStretchStretchMessage

export type WasmTimeStretchResponse =
  | { type: 'init-ok' }
  | { type: 'init-error'; error: string }
  | {
      type: 'stretch-ok'
      requestId: string
      // planar packed as [ch0...][ch1...]
      outputPlanar: Float32Array
      outputFrames: number
      channels: number
    }
  | { type: 'stretch-error'; requestId: string; error: string }


