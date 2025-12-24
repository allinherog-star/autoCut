export type DecodedAudio = {
  sampleRate: number;
  channels: number;
  /** per-channel PCM */
  pcm: Float32Array[];
};

/**
 * Decode audio from a URL using WebAudio (browser-only).
 */
export async function decodeAudioFromUrl(url: string): Promise<DecodedAudio> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
  const buf = await res.arrayBuffer();

  const AudioContextCtor =
    (globalThis as any).OfflineAudioContext || (globalThis as any).webkitOfflineAudioContext || (globalThis as any).AudioContext;
  if (!AudioContextCtor) throw new Error('WebAudio not available in this environment');

  // Use AudioContext for decodeAudioData; no need to actually render
  const ctx = new (globalThis as any).AudioContext();
  try {
    const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
      ctx.decodeAudioData(buf, resolve, reject);
    });

    const channels = audioBuffer.numberOfChannels;
    const pcm: Float32Array[] = [];
    for (let c = 0; c < channels; c++) {
      // copy to detach from underlying buffer
      const ch = audioBuffer.getChannelData(c);
      const out = new Float32Array(ch.length);
      out.set(ch);
      pcm.push(out);
    }

    return { sampleRate: audioBuffer.sampleRate, channels, pcm };
  } finally {
    try { await ctx.close?.(); } catch {}
  }
}


