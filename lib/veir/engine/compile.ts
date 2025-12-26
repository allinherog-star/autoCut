/**
 * VEIR Pro Engine - compiler
 * - VEIRProject -> RenderPlan (deterministic)
 * - This file intentionally only compiles structure/time windows (no decoding).
 */

import type { VEIRProject, ClipTransition, Track } from '@/lib/veir/types'
import { secToUs, timeUs, type TimeUs } from './time'
import type { AudioClipPlan, AudioGraphPlan, RenderPlan, VideoClipPlan } from './types'

export type CompileOptions = {
  audio?: {
    sampleRate?: number
    channels?: number
  }
}

function transitionDurationUs(t?: ClipTransition): TimeUs {
  const d = typeof t?.duration === 'number' && Number.isFinite(t.duration) ? Math.max(0, t.duration) : 0
  return secToUs(d)
}

export function compileVEIRToRenderPlan(project: VEIRProject, options?: CompileOptions): RenderPlan {
  const fps = project.meta.fps
  const durationUs = secToUs(project.meta.duration)
  const frameCount = Math.ceil(project.meta.duration * fps)

  const sampleRate = options?.audio?.sampleRate ?? 48_000
  const channels = options?.audio?.channels ?? 2

  const videoClips: VideoClipPlan[] = []
  const audioClips: AudioClipPlan[] = []

  // Build neighbor map per track (needed for crossfade windows)
  const neighbors = new Map<string, { prev?: any; next?: any; track: Track }>()
  for (const track of project.timeline.tracks) {
    const sorted = [...track.clips].sort((a, b) => a.time.start - b.time.start)
    for (let i = 0; i < sorted.length; i++) {
      neighbors.set(`${track.id}:${sorted[i]!.id}`, { prev: sorted[i - 1], next: sorted[i + 1], track })
    }
  }

  for (const track of project.timeline.tracks) {
    for (const clip of track.clips) {
      const asset = project.assets.assets[clip.asset]
      if (!asset) continue

      const startUs = secToUs(clip.time.start)
      const endUs = secToUs(clip.time.end)
      const sourceStartUs = secToUs(clip.sourceRange?.start ?? 0)
      const sourceEndUs =
        typeof clip.sourceRange?.end === 'number' && Number.isFinite(clip.sourceRange.end)
          ? secToUs(clip.sourceRange.end)
          : null

      if (track.type === 'video' || track.type === 'pip') {
        videoClips.push({
          clipId: clip.id,
          assetId: clip.asset,
          trackId: track.id,
          trackType: track.type,
          layer: track.layer,
          startUs,
          endUs,
          sourceStartUs,
          sourceEndUs,
          transitionOut: clip.transitionOut
            ? {
                durationUs: transitionDurationUs(clip.transitionOut),
                type: clip.transitionOut.type,
                easing: clip.transitionOut.easing,
              }
            : undefined,
        })

        // For pro engine: treat video clips as potential audio sources too (extract later)
        if (asset.type === 'video') {
          const override = (project.adjustments?.clipOverrides?.[clip.id] as any) || {}
          const audioAdj = override.audio || {}
          const videoAdj = override.video || {}
          const timeWarp = (audioAdj.timeWarp || videoAdj.timeWarp) as any

          const neighbor = neighbors.get(`${track.id}:${clip.id}`)
          const fadeInUs = transitionDurationUs(neighbor?.prev?.transitionOut)
          const fadeOutUs = transitionDurationUs(clip.transitionOut)

          audioClips.push({
            clipId: clip.id,
            assetId: clip.asset,
            trackId: track.id,
            sourceKind: 'video-asset-audio',
            startUs,
            endUs,
            sourceStartUs,
            sourceEndUs,
            gain: 1,
            muted: false,
            fadeInUs: fadeInUs > 0 ? fadeInUs : undefined,
            fadeOutUs: fadeOutUs > 0 ? fadeOutUs : undefined,
            maintainPitch: typeof audioAdj.maintainPitch === 'boolean' ? audioAdj.maintainPitch : true,
            timeWarp: normalizeTimeWarpToUs(timeWarp, clip.time.end - clip.time.start),
          })
        }
      }

      if (track.type === 'audio' && asset.type === 'audio') {
        const override = (project.adjustments?.clipOverrides?.[clip.id] as any) || {}
        const audioAdj = override.audio || {}
        const timeWarp = audioAdj.timeWarp as any

        const neighbor = neighbors.get(`${track.id}:${clip.id}`)
        const fadeInUs = transitionDurationUs(neighbor?.prev?.transitionOut)
        const fadeOutUs = transitionDurationUs(clip.transitionOut)

        audioClips.push({
          clipId: clip.id,
          assetId: clip.asset,
          trackId: track.id,
          sourceKind: 'audio-asset',
          startUs,
          endUs,
          sourceStartUs,
          sourceEndUs,
          gain: 0.7,
          muted: false,
          fadeInUs: fadeInUs > 0 ? fadeInUs : undefined,
          fadeOutUs: fadeOutUs > 0 ? fadeOutUs : undefined,
          maintainPitch: typeof audioAdj.maintainPitch === 'boolean' ? audioAdj.maintainPitch : true,
          timeWarp: normalizeTimeWarpToUs(timeWarp, clip.time.end - clip.time.start),
        })
      }
    }
  }

  // Normalize + deterministic ordering
  videoClips.sort((a, b) => (a.layer - b.layer) || ((a.startUs as number) - (b.startUs as number)) || a.clipId.localeCompare(b.clipId))
  audioClips.sort((a, b) => ((a.startUs as number) - (b.startUs as number)) || a.clipId.localeCompare(b.clipId))

  // Minimal audio graph v0: one master bus, and per-track buses.
  const trackBusIds = new Map<string, string>()
  for (const c of audioClips) {
    if (!trackBusIds.has(c.trackId)) trackBusIds.set(c.trackId, `bus:${c.trackId}`)
  }
  const masterBusId = 'bus:master'

  const buses = [
    ...Array.from(trackBusIds.values()).map((id) => ({
      busId: id,
      kind: 'track' as const,
      gain: 1,
      muted: false,
    })),
    { busId: masterBusId, kind: 'master' as const, gain: 1, muted: false },
  ]

  const routing = audioClips.map((c) => ({
    clipId: c.clipId,
    busId: trackBusIds.get(c.trackId)!,
    send: 1,
  }))

  // Route each track bus to master (implicit in v0; evaluator will mix buses into master).
  const audio: AudioGraphPlan = {
    sampleRate,
    channels,
    format: 'f32-planar',
    buses,
    clips: audioClips,
    routing,
    masterBusId,
  }

  return {
    version: 'veir-pro-v0',
    timebase: 'us',
    meta: {
      fps,
      durationUs,
      frameCount,
      audio: { sampleRate, channels, format: 'f32-planar' },
    },
    video: { clips: videoClips },
    audio,
  }
}

function normalizeTimeWarpToUs(timeWarp: any, clipDurationSec: number) {
  if (!timeWarp || typeof timeWarp !== 'object') return undefined
  const mode = typeof timeWarp.mode === 'string' ? timeWarp.mode : 'constant'
  const segments = Array.isArray(timeWarp.segments) ? timeWarp.segments : []
  const out: any[] = []

  for (const s of segments) {
    const when = s?.when
    const start = typeof when?.start === 'number' && Number.isFinite(when.start) ? Math.max(0, when.start) : undefined
    const end = typeof when?.end === 'number' && Number.isFinite(when.end) ? Math.min(clipDurationSec, when.end) : undefined
    const speed = typeof s?.speed === 'number' && Number.isFinite(s.speed) ? Math.min(4, Math.max(0.1, s.speed)) : undefined
    if (start === undefined || end === undefined || speed === undefined) continue
    if (end <= start) continue
    out.push({
      whenUs: { startUs: secToUs(start), endUs: secToUs(end) },
      speed,
      easing: s?.easing,
    })
  }

  return { mode, segments: out.length ? out : undefined }
}


