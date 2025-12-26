/**
 * VEIR Pro Engine - Render Plan types
 * - RenderPlan is the single executable truth for preview + export.
 * - It is compiled from VEIRProject, normalized and deterministic.
 */

import type { TrackType } from '@/lib/veir/types'
import type { TimeUs } from './time'

export type RenderPlanVersion = 'veir-pro-v0'

export type RenderTimebase = 'us'

export type AudioSampleFormat = 'f32-planar'

export type VideoClipPlan = {
  clipId: string
  assetId: string
  trackId: string
  trackType: TrackType
  layer: number

  startUs: TimeUs
  endUs: TimeUs

  // Source in/out in microseconds; absent means [0..]
  sourceStartUs: TimeUs
  sourceEndUs: TimeUs | null

  transitionOut?: {
    durationUs: TimeUs
    type?: string
    easing?: string
  }
}

export type AudioClipPlan = {
  clipId: string
  assetId: string
  trackId: string
  // Whether audio comes from an audio asset or extracted from a video asset.
  sourceKind: 'audio-asset' | 'video-asset-audio'

  startUs: TimeUs
  endUs: TimeUs
  sourceStartUs: TimeUs
  sourceEndUs: TimeUs | null

  // Gains are linear (not dB).
  gain: number
  muted: boolean

  // Fade windows for pro-grade consistency.
  fadeInUs?: TimeUs
  fadeOutUs?: TimeUs

  // Optional: maintain pitch preference (engine may fallback).
  maintainPitch?: boolean
  timeWarp?: {
    mode?: 'constant' | 'ramp'
    segments?: Array<{ whenUs: { startUs: TimeUs; endUs: TimeUs }; speed: number; easing?: string }>
  }
}

export type AudioBusPlan = {
  busId: string
  kind: 'track' | 'master'
  // Linear gain
  gain: number
  muted: boolean
  // Optional ducking (sidechain)
  ducking?: {
    sidechainBusId: string
    amount: number // 0..1
    attackUs: TimeUs
    releaseUs: TimeUs
  }
}

export type AudioGraphPlan = {
  sampleRate: number
  channels: number
  format: AudioSampleFormat
  // Buses include master
  buses: AudioBusPlan[]
  // Clips routed into track buses
  clips: AudioClipPlan[]
  // Topology: clip -> bus routing
  routing: Array<{ clipId: string; busId: string; send: number }>
  masterBusId: string
}

export type RenderPlan = {
  version: RenderPlanVersion
  timebase: RenderTimebase

  meta: {
    fps: number
    durationUs: TimeUs
    frameCount: number

    audio: {
      sampleRate: number
      channels: number
      format: AudioSampleFormat
    }
  }

  video: {
    clips: VideoClipPlan[]
  }

  audio: AudioGraphPlan
}


