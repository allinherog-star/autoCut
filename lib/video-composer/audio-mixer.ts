/**
 * 音频混合器
 * 使用 Web Audio API 处理音频轨道混合
 */

import type { AudioAsset, VideoAsset } from './types'

export class AudioMixer {
  private audioContext: AudioContext
  private masterGain: GainNode
  private sources: Map<string, AudioBufferSourceNode> = new Map()
  private audioBuffers: Map<string, AudioBuffer> = new Map()
  private destination: MediaStreamAudioDestinationNode

  constructor() {
    this.audioContext = new AudioContext()
    this.masterGain = this.audioContext.createGain()
    this.destination = this.audioContext.createMediaStreamDestination()
    this.masterGain.connect(this.destination)
  }

  /** 获取音频输出流 */
  getAudioStream(): MediaStream {
    return this.destination.stream
  }

  /** 加载音频文件 */
  async loadAudio(id: string, url: string): Promise<AudioBuffer> {
    if (this.audioBuffers.has(id)) {
      return this.audioBuffers.get(id)!
    }

    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    
    this.audioBuffers.set(id, audioBuffer)
    return audioBuffer
  }

  /** 从视频元素提取音频 */
  async loadAudioFromVideo(id: string, videoElement: HTMLVideoElement): Promise<void> {
    // 创建 MediaElementSource
    const source = this.audioContext.createMediaElementSource(videoElement)
    const gainNode = this.audioContext.createGain()
    
    source.connect(gainNode)
    gainNode.connect(this.masterGain)
  }

  /** 播放音频片段 */
  playAudioClip(
    id: string,
    buffer: AudioBuffer,
    startTime: number,
    offset: number = 0,
    duration?: number,
    volume: number = 1,
    fadeIn: number = 0,
    fadeOut: number = 0
  ): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer

    const gainNode = this.audioContext.createGain()
    source.connect(gainNode)
    gainNode.connect(this.masterGain)

    // 设置音量和淡入淡出
    const actualDuration = duration ?? (buffer.duration - offset)
    
    if (fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + startTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + startTime + fadeIn)
    } else {
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + startTime)
    }

    if (fadeOut > 0) {
      const fadeOutStart = startTime + actualDuration - fadeOut
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + fadeOutStart)
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + startTime + actualDuration)
    }

    source.start(this.audioContext.currentTime + startTime, offset, actualDuration)
    
    this.sources.set(id, source)
    return source
  }

  /** 停止所有音频 */
  stopAll(): void {
    this.sources.forEach((source) => {
      try {
        source.stop()
      } catch {}
    })
    this.sources.clear()
  }

  /** 设置主音量 */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime)
  }

  /** 获取当前时间 */
  getCurrentTime(): number {
    return this.audioContext.currentTime
  }

  /** 恢复音频上下文（用户交互后调用） */
  async resume(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /** 销毁 */
  destroy(): void {
    this.stopAll()
    this.audioBuffers.clear()
    this.audioContext.close()
  }
}

/**
 * 离线音频渲染器
 * 用于导出时的音频处理
 */
export class OfflineAudioRenderer {
  private sampleRate: number
  private channels: number

  constructor(sampleRate: number = 44100, channels: number = 2) {
    this.sampleRate = sampleRate
    this.channels = channels
  }

  /** 渲染音频轨道到 AudioBuffer */
  async renderAudioTracks(
    videoAssets: VideoAsset[],
    audioAssets: AudioAsset[],
    totalDuration: number,
    onProgress?: (progress: number) => void
  ): Promise<AudioBuffer> {
    const totalSamples = Math.ceil(totalDuration * this.sampleRate)
    const offlineContext = new OfflineAudioContext(
      this.channels,
      totalSamples,
      this.sampleRate
    )

    const loadPromises: Promise<void>[] = []

    // 加载并调度视频音频
    for (const video of videoAssets) {
      if (video.muted) continue
      
      const promise = (async () => {
        try {
          const response = await fetch(video.src)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer.slice(0))
          
          const source = offlineContext.createBufferSource()
          source.buffer = audioBuffer
          
          const gainNode = offlineContext.createGain()
          gainNode.gain.value = video.volume ?? 1
          
          source.connect(gainNode)
          gainNode.connect(offlineContext.destination)
          
          const clipDuration = video.clipEnd - video.clipStart
          source.start(video.timelineStart, video.clipStart, clipDuration)
        } catch (e) {
          console.warn(`[AudioRenderer] 无法加载视频音频: ${video.src}`, e)
        }
      })()
      
      loadPromises.push(promise)
    }

    // 加载并调度独立音频
    for (const audio of audioAssets) {
      const promise = (async () => {
        try {
          const response = await fetch(audio.src)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer.slice(0))
          
          const source = offlineContext.createBufferSource()
          source.buffer = audioBuffer
          
          const gainNode = offlineContext.createGain()
          const volume = audio.volume ?? 1
          
          // 设置淡入淡出
          if (audio.fadeIn && audio.fadeIn > 0) {
            gainNode.gain.setValueAtTime(0, audio.timelineStart)
            gainNode.gain.linearRampToValueAtTime(volume, audio.timelineStart + audio.fadeIn)
          } else {
            gainNode.gain.setValueAtTime(volume, audio.timelineStart)
          }
          
          if (audio.fadeOut && audio.fadeOut > 0) {
            const fadeOutStart = audio.timelineStart + audio.duration - audio.fadeOut
            gainNode.gain.setValueAtTime(volume, fadeOutStart)
            gainNode.gain.linearRampToValueAtTime(0, audio.timelineStart + audio.duration)
          }
          
          source.connect(gainNode)
          gainNode.connect(offlineContext.destination)
          
          source.start(audio.timelineStart, audio.clipStart, audio.duration)
        } catch (e) {
          console.warn(`[AudioRenderer] 无法加载音频: ${audio.src}`, e)
        }
      })()
      
      loadPromises.push(promise)
    }

    await Promise.all(loadPromises)
    onProgress?.(50)

    // 渲染音频
    const renderedBuffer = await offlineContext.startRendering()
    onProgress?.(100)
    
    return renderedBuffer
  }

  /** 将 AudioBuffer 转换为 WAV Blob */
  audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const samples = buffer.length
    const dataSize = samples * blockAlign
    const bufferSize = 44 + dataSize
    
    const arrayBuffer = new ArrayBuffer(bufferSize)
    const view = new DataView(arrayBuffer)
    
    // WAV 文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, bufferSize - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)
    
    // 写入音频数据
    const channelData: Float32Array[] = []
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i))
    }
    
    let offset = 44
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channelData[ch][i]))
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
        view.setInt16(offset, intSample, true)
        offset += 2
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }
}


















