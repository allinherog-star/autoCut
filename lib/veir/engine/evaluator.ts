/**
 * VEIR Pro Engine - evaluator (minimal v0)
 * - Produces deterministic time grids for video frames and audio chunks.
 * - Rendering/mixing is implemented in later tasks; evaluator provides schedules now.
 */

import type { RenderPlan } from './types'
import { frameIndexToTimeUs, samplesToTimeUs, timeUs, type TimeUs } from './time'

export type VideoFrameScheduleItem = {
  frameIndex: number
  timeUs: TimeUs
}

export type AudioChunkScheduleItem = {
  startSample: number
  frameCount: number
  startTimeUs: TimeUs
}

export type EvaluationSchedule = {
  videoFrames: VideoFrameScheduleItem[]
  audioChunks: AudioChunkScheduleItem[]
}

export type EvaluateOptions = {
  audioChunkFrames?: number
}

export function buildEvaluationSchedule(plan: RenderPlan, opts?: EvaluateOptions): EvaluationSchedule {
  const fps = plan.meta.fps
  const frameCount = plan.meta.frameCount

  const videoFrames: VideoFrameScheduleItem[] = []
  for (let i = 0; i < frameCount; i++) {
    videoFrames.push({ frameIndex: i, timeUs: frameIndexToTimeUs(i, fps) })
  }

  const audioChunkFrames = opts?.audioChunkFrames ?? 2048
  const sampleRate = plan.audio.sampleRate
  const totalSamples = Math.ceil((plan.meta.durationUs as number) * sampleRate / 1_000_000)
  const audioChunks: AudioChunkScheduleItem[] = []

  for (let s = 0; s < totalSamples; s += audioChunkFrames) {
    const n = Math.min(audioChunkFrames, totalSamples - s)
    audioChunks.push({ startSample: s, frameCount: n, startTimeUs: samplesToTimeUs(s, sampleRate) })
  }

  return { videoFrames, audioChunks }
}


