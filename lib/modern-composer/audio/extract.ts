import { Input, UrlSource, ALL_FORMATS, AudioBufferSink } from 'mediabunny';

export type DecodedPcm = {
  sampleRate: number;
  channels: number;
  pcm: Float32Array[];
};

function concatFloat32(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((s, a) => s + a.length, 0);
  const out = new Float32Array(total);
  let off = 0;
  for (const a of chunks) {
    out.set(a, off);
    off += a.length;
  }
  return out;
}

/**
 * Decode audio PCM from a media URL (mp4/webm/mov...) using mediabunny demux+decode.
 * - Decodes the first audio track only.
 * - Returns planar float32 PCM.
 */
export async function decodePcmFromMediaUrl(
  url: string,
  opts?: { startTime?: number; endTime?: number }
): Promise<DecodedPcm | null> {
  const start = Math.max(0, opts?.startTime ?? 0);
  const end = opts?.endTime ?? Infinity;

  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(url, {
      // Ensure CORS is enabled on the server or use same-origin URLs
      requestInit: { mode: 'cors' },
    }),
  });

  try {
    const audioTracks = await input.getAudioTracks();
    const track = audioTracks[0];
    if (!track) return null;

    const sink = new AudioBufferSink(track);
    const buffers = sink.buffers(start, end);

    // Collect per-channel chunks
    const chunks: Float32Array[][] = [];
    let sampleRate = 48000;
    let channels = 2;

    for await (const wrapped of buffers) {
      const buf = wrapped.buffer;
      sampleRate = buf.sampleRate;
      channels = buf.numberOfChannels;

      while (chunks.length < channels) chunks.push([]);
      for (let c = 0; c < channels; c++) {
        const data = buf.getChannelData(c);
        const copy = new Float32Array(data.length);
        copy.set(data);
        chunks[c].push(copy);
      }
    }

    if (chunks.length === 0) return null;
    const pcm = chunks.map(concatFloat32);

    return { sampleRate, channels, pcm };
  } finally {
    try { (input as any).dispose?.(); } catch {}
    try { (input as any)[Symbol.dispose]?.(); } catch {}
  }
}


