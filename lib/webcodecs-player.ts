/**
 * WebCodecs 视频播放器
 * 用于浏览器端高性能视频解码和预览
 * 
 * 架构：
 * - MP4Box.js 负责解封装（demux）
 * - WebCodecs VideoDecoder 负责解码
 * - Canvas 2D 负责渲染 + 字幕叠加
 */

// ============================================
// 类型定义
// ============================================

/** 字幕样式 */
export interface SubtitleStyle {
  fontSize: number
  color: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  hasOutline: boolean
}

/** 字幕条目 */
export interface SubtitleItem {
  id: string
  text: string
  startTime: number  // 秒
  endTime: number    // 秒
  style: SubtitleStyle
}

/** 播放器状态 */
export type PlayerState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'seeking' | 'error'

/** 播放器事件回调 */
export interface PlayerCallbacks {
  onStateChange?: (state: PlayerState) => void
  onTimeUpdate?: (currentTime: number) => void
  onDurationChange?: (duration: number) => void
  onProgress?: (loaded: number, total: number) => void
  onError?: (error: Error) => void
}

/** 视频信息 */
export interface VideoInfo {
  width: number
  height: number
  duration: number  // 秒
  codec: string
  frameRate: number
}

/** 解码帧 */
interface DecodedFrame {
  timestamp: number  // 微秒
  frame: VideoFrame
}

// ============================================
// MP4Box 类型定义（简化版）
// ============================================

interface MP4Sample {
  number: number
  track_id: number
  timescale: number
  description_index: number
  dts: number
  cts: number
  duration: number
  is_sync: boolean
  is_leading: number
  depends_on: number
  is_depended_on: number
  has_redundancy: number
  degration_priority: number
  offset: number
  size: number
  data: Uint8Array
}

interface MP4Track {
  id: number
  type: string
  codec: string
  timescale: number
  duration: number
  nb_samples: number
  movie_duration: number
  movie_timescale: number
  video?: {
    width: number
    height: number
  }
  audio?: {
    sample_rate: number
    channel_count: number
  }
}

interface MP4Info {
  duration: number
  timescale: number
  isFragmented: boolean
  isProgressive: boolean
  hasIOD: boolean
  brands: string[]
  created: Date
  modified: Date
  tracks: MP4Track[]
  videoTracks: MP4Track[]
  audioTracks: MP4Track[]
}

interface MP4BoxFile {
  onReady?: (info: MP4Info) => void
  onError?: (error: string) => void
  onSamples?: (trackId: number, user: unknown, samples: MP4Sample[]) => void
  appendBuffer: (buffer: ArrayBuffer & { fileStart?: number }) => number
  start: () => void
  stop: () => void
  flush: () => void
  seek: (time: number, useRap?: boolean) => { offset: number; time: number }
  setExtractionOptions: (trackId: number, user: unknown, options: { nbSamples: number }) => void
  getTrackById: (id: number) => MP4Track | undefined
}

interface MP4BoxStatic {
  createFile: () => MP4BoxFile
}

// 动态加载 MP4Box
let mp4boxPromise: Promise<MP4BoxStatic> | null = null

async function loadMP4Box(): Promise<MP4BoxStatic> {
  if (mp4boxPromise) return mp4boxPromise
  
  mp4boxPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js'
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MP4Box = (window as any).MP4Box as MP4BoxStatic
      if (MP4Box) {
        resolve(MP4Box)
      } else {
        reject(new Error('MP4Box 加载失败'))
      }
    }
    script.onerror = () => reject(new Error('MP4Box 脚本加载失败'))
    document.head.appendChild(script)
  })
  
  return mp4boxPromise
}

// ============================================
// WebCodecs 播放器类
// ============================================

export class WebCodecsPlayer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private videoUrl: string
  
  // MP4Box 相关
  private mp4box: MP4BoxFile | null = null
  private videoTrack: MP4Track | null = null
  
  // WebCodecs 相关
  private decoder: VideoDecoder | null = null
  private pendingFrames: DecodedFrame[] = []
  private isDecoderConfigured = false
  
  // 播放状态
  private state: PlayerState = 'idle'
  private videoInfo: VideoInfo | null = null
  private currentTime = 0
  private duration = 0
  private isPlaying = false
  private animationId: number | null = null
  private startTimestamp: number | null = null
  private startPlayTime = 0
  
  // 字幕
  private subtitles: SubtitleItem[] = []
  
  // 时间范围（用于片段预览）
  private clipStartTime = 0
  private clipEndTime = Infinity
  
  // 回调
  private callbacks: PlayerCallbacks = {}
  
  // 缓存
  private frameCache: Map<number, VideoFrame> = new Map()
  private maxCacheFrames = 30
  
  constructor(canvas: HTMLCanvasElement, videoUrl: string, callbacks?: PlayerCallbacks) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文')
    this.ctx = ctx
    this.videoUrl = videoUrl
    this.callbacks = callbacks || {}
  }
  
  // ============================================
  // 公共 API
  // ============================================
  
  /** 加载视频 */
  async load(): Promise<VideoInfo> {
    this.setState('loading')
    
    try {
      // 检查 WebCodecs 支持
      if (!('VideoDecoder' in window)) {
        throw new Error('当前浏览器不支持 WebCodecs API')
      }
      
      // 加载 MP4Box
      const MP4Box = await loadMP4Box()
      this.mp4box = MP4Box.createFile()
      
      // 设置 MP4Box 回调
      await this.setupMP4Box()
      
      // 下载并解析视频
      await this.fetchAndParseVideo()
      
      if (!this.videoInfo) {
        throw new Error('视频解析失败')
      }
      
      this.setState('ready')
      return this.videoInfo
      
    } catch (error) {
      this.setState('error')
      const err = error instanceof Error ? error : new Error(String(error))
      this.callbacks.onError?.(err)
      throw err
    }
  }
  
  /** 播放 */
  play(): void {
    if (this.state !== 'ready' && this.state !== 'paused') return
    
    this.isPlaying = true
    this.startTimestamp = null
    this.startPlayTime = this.currentTime
    this.setState('playing')
    this.renderLoop()
  }
  
  /** 暂停 */
  pause(): void {
    this.isPlaying = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.setState('paused')
  }
  
  /** 跳转到指定时间 */
  async seek(time: number): Promise<void> {
    const targetTime = Math.max(this.clipStartTime, Math.min(time, this.clipEndTime))
    this.currentTime = targetTime
    this.startPlayTime = targetTime
    this.startTimestamp = null
    
    // 清空待渲染帧
    this.clearPendingFrames()
    
    // 重新定位并解码
    if (this.mp4box && this.videoTrack) {
      this.mp4box.seek(targetTime, true)
      this.mp4box.start()
    }
    
    // 渲染当前帧
    await this.renderCurrentFrame()
    this.callbacks.onTimeUpdate?.(this.currentTime)
  }
  
  /** 设置字幕 */
  setSubtitles(subtitles: SubtitleItem[]): void {
    this.subtitles = subtitles
    // 如果暂停中，重新渲染以显示字幕
    if (this.state === 'paused' || this.state === 'ready') {
      this.renderCurrentFrame()
    }
  }
  
  /** 设置播放范围（用于片段预览） */
  setClipRange(startTime: number, endTime: number): void {
    this.clipStartTime = startTime
    this.clipEndTime = endTime
    this.currentTime = startTime
    this.seek(startTime)
  }
  
  /** 获取当前时间 */
  getCurrentTime(): number {
    return this.currentTime
  }
  
  /** 获取时长 */
  getDuration(): number {
    return Math.min(this.duration, this.clipEndTime) - this.clipStartTime
  }
  
  /** 获取状态 */
  getState(): PlayerState {
    return this.state
  }
  
  /** 获取视频信息 */
  getVideoInfo(): VideoInfo | null {
    return this.videoInfo
  }
  
  /** 销毁播放器 */
  destroy(): void {
    this.pause()
    this.clearPendingFrames()
    this.clearFrameCache()
    
    if (this.decoder) {
      try {
        this.decoder.close()
      } catch {
        // 忽略关闭错误
      }
      this.decoder = null
    }
    
    if (this.mp4box) {
      this.mp4box.stop()
      this.mp4box = null
    }
    
    this.setState('idle')
  }
  
  // ============================================
  // 私有方法
  // ============================================
  
  private setState(state: PlayerState): void {
    this.state = state
    this.callbacks.onStateChange?.(state)
  }
  
  private async setupMP4Box(): Promise<void> {
    if (!this.mp4box) return
    
    return new Promise((resolve, reject) => {
      this.mp4box!.onReady = (info: MP4Info) => {
        console.log('[WebCodecs] MP4 解析完成:', info)
        
        // 找到视频轨道
        const videoTrack = info.videoTracks[0]
        if (!videoTrack) {
          reject(new Error('视频中没有视频轨道'))
          return
        }
        
        this.videoTrack = videoTrack
        this.duration = info.duration / info.timescale
        
        // 设置视频信息
        this.videoInfo = {
          width: videoTrack.video?.width || 1920,
          height: videoTrack.video?.height || 1080,
          duration: this.duration,
          codec: videoTrack.codec,
          frameRate: videoTrack.nb_samples / (videoTrack.movie_duration / videoTrack.movie_timescale) || 30,
        }
        
        // 调整 Canvas 尺寸
        this.canvas.width = this.videoInfo.width
        this.canvas.height = this.videoInfo.height
        
        this.callbacks.onDurationChange?.(this.duration)
        
        // 配置解码器
        this.configureDecoder(videoTrack)
        
        // 设置提取选项
        this.mp4box!.setExtractionOptions(videoTrack.id, null, { nbSamples: 100 })
        
        resolve()
      }
      
      this.mp4box!.onError = (error: string) => {
        reject(new Error(error))
      }
      
      this.mp4box!.onSamples = (_trackId: number, _user: unknown, samples: MP4Sample[]) => {
        this.decodeSamples(samples)
      }
    })
  }
  
  private async fetchAndParseVideo(): Promise<void> {
    const response = await fetch(this.videoUrl)
    if (!response.ok) {
      throw new Error(`视频下载失败: ${response.status}`)
    }
    
    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0
    
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取视频流')
    }
    
    let offset = 0
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // 创建带 fileStart 属性的 buffer
      const buffer = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer & { fileStart?: number }
      buffer.fileStart = offset
      
      this.mp4box!.appendBuffer(buffer)
      offset += value.byteLength
      
      if (total > 0) {
        this.callbacks.onProgress?.(offset, total)
      }
    }
    
    this.mp4box!.flush()
  }
  
  private configureDecoder(track: MP4Track): void {
    // 关闭旧解码器
    if (this.decoder) {
      try {
        this.decoder.close()
      } catch {
        // 忽略
      }
    }
    
    this.decoder = new VideoDecoder({
      output: (frame) => this.handleDecodedFrame(frame),
      error: (error) => {
        console.error('[WebCodecs] 解码错误:', error)
        this.callbacks.onError?.(error)
      },
    })
    
    // 构建 codec 描述
    const config: VideoDecoderConfig = {
      codec: track.codec,
      codedWidth: track.video?.width || 1920,
      codedHeight: track.video?.height || 1080,
      hardwareAcceleration: 'prefer-hardware',
    }
    
    console.log('[WebCodecs] 解码器配置:', config)
    
    try {
      this.decoder.configure(config)
      this.isDecoderConfigured = true
    } catch (error) {
      console.error('[WebCodecs] 解码器配置失败:', error)
      // 回退到软件解码
      config.hardwareAcceleration = 'prefer-software'
      this.decoder.configure(config)
      this.isDecoderConfigured = true
    }
  }
  
  private decodeSamples(samples: MP4Sample[]): void {
    if (!this.decoder || !this.isDecoderConfigured) return
    
    for (const sample of samples) {
      const timestamp = (sample.cts / sample.timescale) * 1_000_000 // 转换为微秒
      
      const chunk = new EncodedVideoChunk({
        type: sample.is_sync ? 'key' : 'delta',
        timestamp,
        duration: (sample.duration / sample.timescale) * 1_000_000,
        data: sample.data,
      })
      
      try {
        this.decoder.decode(chunk)
      } catch (error) {
        console.warn('[WebCodecs] 解码样本失败:', error)
      }
    }
  }
  
  private handleDecodedFrame(frame: VideoFrame): void {
    const timestamp = frame.timestamp
    
    // 检查是否在播放范围内
    const timeInSeconds = timestamp / 1_000_000
    if (timeInSeconds < this.clipStartTime || timeInSeconds > this.clipEndTime) {
      frame.close()
      return
    }
    
    // 添加到待渲染队列
    this.pendingFrames.push({ timestamp, frame })
    
    // 保持队列有序（按时间戳）
    this.pendingFrames.sort((a, b) => a.timestamp - b.timestamp)
    
    // 限制队列长度，释放过多的帧
    while (this.pendingFrames.length > this.maxCacheFrames) {
      const oldFrame = this.pendingFrames.shift()
      oldFrame?.frame.close()
    }
  }
  
  private renderLoop = (): void => {
    if (!this.isPlaying) return
    
    const now = performance.now()
    
    if (this.startTimestamp === null) {
      this.startTimestamp = now
    }
    
    // 计算当前播放时间
    const elapsed = (now - this.startTimestamp) / 1000
    this.currentTime = this.startPlayTime + elapsed
    
    // 检查是否到达结束
    if (this.currentTime >= this.clipEndTime) {
      this.currentTime = this.clipEndTime
      this.pause()
      this.seek(this.clipStartTime) // 循环
      return
    }
    
    // 渲染当前帧
    this.renderCurrentFrame()
    
    // 更新时间
    this.callbacks.onTimeUpdate?.(this.currentTime)
    
    // 继续循环
    this.animationId = requestAnimationFrame(this.renderLoop)
  }
  
  private async renderCurrentFrame(): Promise<void> {
    const targetTimestamp = this.currentTime * 1_000_000 // 转换为微秒
    
    // 找到最接近当前时间的帧
    let bestFrame: DecodedFrame | null = null
    let bestDiff = Infinity
    
    for (const item of this.pendingFrames) {
      const diff = Math.abs(item.timestamp - targetTimestamp)
      if (diff < bestDiff) {
        bestDiff = diff
        bestFrame = item
      }
    }
    
    if (bestFrame) {
      this.renderFrame(bestFrame.frame)
    }
    
    // 渲染字幕
    this.renderSubtitles()
  }
  
  private renderFrame(frame: VideoFrame): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 绘制视频帧
    this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height)
  }
  
  private renderSubtitles(): void {
    // 找到当前时间的字幕
    const currentSubtitle = this.subtitles.find(
      sub => this.currentTime >= sub.startTime && this.currentTime <= sub.endTime
    )
    
    if (!currentSubtitle) return
    
    const { text, style } = currentSubtitle
    const { width, height } = this.canvas
    
    // 设置字体
    this.ctx.font = `${style.fontSize}px "Noto Sans SC", sans-serif`
    this.ctx.textAlign = style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center'
    this.ctx.textBaseline = 'middle'
    
    // 计算位置
    let x = width / 2
    if (style.alignment === 'left') x = 20
    if (style.alignment === 'right') x = width - 20
    
    let y = height - 50
    if (style.position === 'top') y = 50
    if (style.position === 'center') y = height / 2
    
    // 测量文字宽度
    const metrics = this.ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = style.fontSize * 1.2
    
    // 绘制背景
    if (style.backgroundColor) {
      this.ctx.fillStyle = style.backgroundColor
      const bgX = x - textWidth / 2 - 10
      const bgY = y - textHeight / 2
      const bgWidth = textWidth + 20
      const bgHeight = textHeight
      
      // 圆角矩形
      const radius = 4
      this.ctx.beginPath()
      this.ctx.moveTo(bgX + radius, bgY)
      this.ctx.lineTo(bgX + bgWidth - radius, bgY)
      this.ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius)
      this.ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius)
      this.ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight)
      this.ctx.lineTo(bgX + radius, bgY + bgHeight)
      this.ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius)
      this.ctx.lineTo(bgX, bgY + radius)
      this.ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY)
      this.ctx.closePath()
      this.ctx.fill()
    }
    
    // 绘制描边
    if (style.hasOutline) {
      this.ctx.strokeStyle = '#000000'
      this.ctx.lineWidth = 3
      this.ctx.lineJoin = 'round'
      this.ctx.strokeText(text, x, y)
    }
    
    // 绘制文字
    this.ctx.fillStyle = style.color
    this.ctx.fillText(text, x, y)
  }
  
  private clearPendingFrames(): void {
    for (const item of this.pendingFrames) {
      try {
        item.frame.close()
      } catch {
        // 忽略
      }
    }
    this.pendingFrames = []
  }
  
  private clearFrameCache(): void {
    for (const frame of this.frameCache.values()) {
      try {
        frame.close()
      } catch {
        // 忽略
      }
    }
    this.frameCache.clear()
  }
}

// ============================================
// 工具函数
// ============================================

/** 检查 WebCodecs 支持 */
export function isWebCodecsSupported(): boolean {
  return 'VideoDecoder' in window && 'VideoEncoder' in window
}

/** 获取支持的编解码器 */
export async function getSupportedCodecs(): Promise<{ decode: string[]; encode: string[] }> {
  const decodeCodecs: string[] = []
  const encodeCodecs: string[] = []
  
  const testCodecs = [
    'avc1.42001E',  // H.264 Baseline
    'avc1.4D001E',  // H.264 Main
    'avc1.64001E',  // H.264 High
    'hvc1.1.6.L93.B0',  // H.265/HEVC
    'vp8',
    'vp09.00.10.08',  // VP9
    'av01.0.04M.08',  // AV1
  ]
  
  for (const codec of testCodecs) {
    try {
      const decodeSupport = await VideoDecoder.isConfigSupported({
        codec,
        codedWidth: 1920,
        codedHeight: 1080,
      })
      if (decodeSupport.supported) {
        decodeCodecs.push(codec)
      }
    } catch {
      // 不支持
    }
    
    try {
      const encodeSupport = await VideoEncoder.isConfigSupported({
        codec,
        width: 1920,
        height: 1080,
        bitrate: 5_000_000,
      })
      if (encodeSupport.supported) {
        encodeCodecs.push(codec)
      }
    } catch {
      // 不支持
    }
  }
  
  return { decode: decodeCodecs, encode: encodeCodecs }
}















