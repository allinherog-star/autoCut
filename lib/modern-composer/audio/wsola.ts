/**
 * WSOLA time-stretch (pitch-preserving) - minimal implementation
 * - Designed for offline rendering (non-realtime)
 * - Supports constant ratio and slowly-varying ratio (by providing ratio per step)
 *
 * References:
 * - Verhelst & Roelands "An overlap-add technique based on waveform similarity (WSOLA)"
 */

export type WsolaOptions = {
  sampleRate: number;
  channels: number;
  /** Window size in samples */
  windowSize?: number; // default 2048
  /** Analysis hop size in samples */
  analysisHop?: number; // default 512
  /** Search range (± samples) around expected analysis position */
  search?: number; // default 256
};

export type RatioAt = (outputTimeSeconds: number) => number;

export function wsolaTimeStretch(
  input: Float32Array[],
  outputLength: number,
  ratioAt: RatioAt,
  opts: WsolaOptions
): Float32Array[] {
  const channels = opts.channels;
  const sr = opts.sampleRate;
  const N = opts.windowSize ?? 2048;
  const Ha = opts.analysisHop ?? 512;
  const search = opts.search ?? 256;

  if (input.length !== channels) throw new Error('Invalid channel count');
  const inLen = input[0]?.length ?? 0;
  if (inLen === 0) return new Array(channels).fill(0).map(() => new Float32Array(outputLength));

  const out: Float32Array[] = new Array(channels).fill(0).map(() => new Float32Array(outputLength));
  // 关键：为 OLA 做逐样本归一化（可变 hop 时不能用常数增益补偿）
  // weights[i] 记录当前位置累计的窗口权重（不是权重平方），最终 out /= weights
  const weights = new Float32Array(outputLength);

  // Hann window
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
  }

  // Use mono mixdown for correlation to keep stereo coherence
  const mono = new Float32Array(inLen);
  if (channels === 1) {
    mono.set(input[0]);
  } else {
    for (let i = 0; i < inLen; i++) {
      let s = 0;
      for (let c = 0; c < channels; c++) s += input[c][i];
      mono[i] = s / channels;
    }
  }

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const dot = (a0: number, b0: number, len: number, x: Float32Array, y: Float32Array) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += x[a0 + i] * y[b0 + i];
    return s;
  };

  // Initial positions
  let outPos = 0;
  let inPos = 0;

  // Seed first frame
  // 边界检查：确保不越界访问输入数组
  const seedLen = Math.min(N, outputLength, inLen);
  for (let c = 0; c < channels; c++) {
    const src = input[c];
    for (let i = 0; i < seedLen; i++) {
      out[c][i] = (src[i] ?? 0) * win[i];
    }
  }
  for (let i = 0; i < seedLen; i++) weights[i] += win[i];
  outPos += Ha;
  inPos += Ha;


  // Main loop
  while (outPos + N < outputLength && inPos + N < inLen) {
    const outTime = outPos / sr;
    const ratio = clamp(ratioAt(outTime), 0.25, 4); // outputHop = ratio * analysisHop
    const Hs = Math.max(1, Math.round(Ha * ratio));

    // Choose best matching analysis position around expected inPos
    const refStart = clamp(inPos - Ha, 0, Math.max(0, inLen - N));
    const expected = clamp(inPos, 0, Math.max(0, inLen - N));
    const searchStart = clamp(expected - search, 0, Math.max(0, inLen - N));
    const searchEnd = clamp(expected + search, 0, Math.max(0, inLen - N));

    // Correlate last overlap region
    const overlapLen = Math.min(Ha, N);
    const outOverlapStart = outPos;
    // Build synthetic ref from output (mono)
    // For correlation, compare candidate input segment start with previous input ref segment
    // Use mono to compute normalized dot (avoid sqrt for speed; relative OK)
    let best = expected;
    let bestScore = -Infinity;

    // Simple normalization using energy
    const energy = (arr: Float32Array, start: number, len: number) => {
      let e = 0;
      for (let i = 0; i < len; i++) {
        const v = arr[start + i];
        e += v * v;
      }
      return e + 1e-9;
    };

    const refEnergy = energy(mono, refStart, overlapLen);
    for (let cand = searchStart; cand <= searchEnd; cand += 4) {
      const s = dot(refStart, cand, overlapLen, mono, mono);
      const candEnergy = energy(mono, cand, overlapLen);
      const score = s / Math.sqrt(refEnergy * candEnergy);
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }

    // Overlap-add windowed frame from best
    for (let c = 0; c < channels; c++) {
      const src = input[c];
      for (let i = 0; i < N; i++) {
        const o = outPos + i;
        if (o >= outputLength) break;
        // 边界检查：确保不越界访问输入数组
        const srcIdx = best + i;
        if (srcIdx >= inLen) break;
        out[c][o] += src[srcIdx] * win[i];
      }
    }
    for (let i = 0; i < N; i++) {
      const o = outPos + i;
      if (o >= outputLength) break;
      weights[o] += win[i];
    }


    // Advance
    outPos += Hs;
    inPos = best + Ha;
  }

  // Normalize: 逐样本除以累计窗口权重（支持可变 hop）
  for (let c = 0; c < channels; c++) {
    const ch = out[c];
    for (let i = 0; i < ch.length; i++) {
      const w = weights[i];
      let v = w > 1e-9 ? ch[i] / w : 0;
      // 使用软限幅（tanh-based soft clipping）避免硬削波失真
      // 只在接近饱和时才进行软限幅，保持正常音频不失真
      if (Math.abs(v) > 0.9) {
        // tanh 软限幅：将 >0.9 的部分平滑压缩到 0.95
        const sign = v > 0 ? 1 : -1;
        const excess = Math.abs(v) - 0.9;
        v = sign * (0.9 + 0.05 * Math.tanh(excess * 10));
      }
      ch[i] = v;
    }
  }

  return out;
}



