/**
 * 视频合成器
 * 整合视频渲染、字幕、滤镜、音频处理
 */

import type {
  ComposerProject,
  Asset,
  VideoAsset,
  AudioAsset,
  ImageAsset,
  TextAsset,
  FilterEffect,
  AnimationEffect,
  TransitionEffect,
  ProgressCallback,
  RenderResult,
  TimeRange,
} from './types'
import { OfflineAudioRenderer } from './audio-mixer'

// ============================================
// 动画计算
// ============================================

interface AnimationState {
  opacity: number
  scale: number
  translateX: number
  translateY: number
  rotate: number
}

function calculateAnimationState(
  animation: AnimationEffect | undefined,
  progress: number, // 0-1
  duration: number
): AnimationState {
  const state: AnimationState = {
    opacity: 1,
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotate: 0,
  }

  if (!animation || animation.type === 'fade') {
    // 默认淡入淡出
    const enterDur = animation?.enterDuration ?? 0.3
    const exitDur = animation?.exitDuration ?? 0.2
    const enterProgress = Math.min(1, (progress * duration) / enterDur)
    const exitStart = 1 - exitDur / duration
    const exitProgress = progress > exitStart ? (progress - exitStart) / (1 - exitStart) : 0
    
    state.opacity = Math.min(enterProgress, 1 - exitProgress)
    return state
  }

  const enterDur = animation.enterDuration ?? 0.3
  const exitDur = animation.exitDuration ?? 0.2
  const enterProgress = Math.min(1, (progress * duration) / enterDur)
  const exitStart = 1 - exitDur / duration
  const exitProgress = progress > exitStart ? (progress - exitStart) / (1 - exitStart) : 0

  switch (animation.type) {
    case 'slide-up':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      state.translateY = enterProgress < 1 ? (1 - enterProgress) * 50 : -exitProgress * 30
      break

    case 'slide-down':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      state.translateY = enterProgress < 1 ? (enterProgress - 1) * 50 : exitProgress * 30
      break

    case 'zoom':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      state.scale = enterProgress < 1 ? 0.5 + enterProgress * 0.5 : 1 - exitProgress * 0.3
      break

    case 'bounce':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      if (enterProgress < 1) {
        const t = enterProgress
        state.scale = 0.3 + t * 0.7 + Math.sin(t * Math.PI * 3) * 0.15 * (1 - t)
        state.translateY = (1 - t) * 60
      }
      break

    case 'shake':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      if (enterProgress >= 1 && exitProgress === 0) {
        const t = (progress - enterDur / duration) * duration * 15
        state.translateX = Math.sin(t) * 3
      }
      break

    case 'pulse':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      if (enterProgress >= 1 && exitProgress === 0) {
        const t = (progress - enterDur / duration) * duration * 5
        state.scale = 1 + Math.sin(t) * 0.05
      }
      break

    case 'glow':
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
      break

    default:
      state.opacity = Math.min(enterProgress, 1 - exitProgress)
  }

  return state
}

// ============================================
// 滤镜处理
// ============================================

function applyFilters(ctx: CanvasRenderingContext2D, filters: FilterEffect[]): void {
  const filterStrings = filters.map((f) => {
    switch (f.type) {
      case 'brightness':
        return `brightness(${f.value}%)`
      case 'contrast':
        return `contrast(${f.value}%)`
      case 'saturate':
        return `saturate(${f.value}%)`
      case 'blur':
        return `blur(${f.value}px)`
      case 'grayscale':
        return `grayscale(${f.value}%)`
      case 'sepia':
        return `sepia(${f.value}%)`
      case 'hue-rotate':
        return `hue-rotate(${f.value}deg)`
      default:
        return ''
    }
  })
  ctx.filter = filterStrings.filter(Boolean).join(' ') || 'none'
}

// ============================================
// 转场处理
// ============================================

function applyTransition(
  ctx: CanvasRenderingContext2D,
  transition: TransitionEffect,
  progress: number, // 0-1
  width: number,
  height: number
): void {
  switch (transition.type) {
    case 'fade':
      ctx.globalAlpha = progress
      break

    case 'wipe-left':
      ctx.beginPath()
      ctx.rect(0, 0, width * progress, height)
      ctx.clip()
      break

    case 'wipe-right':
      ctx.beginPath()
      ctx.rect(width * (1 - progress), 0, width * progress, height)
      ctx.clip()
      break

    case 'wipe-up':
      ctx.beginPath()
      ctx.rect(0, height * (1 - progress), width, height * progress)
      ctx.clip()
      break

    case 'wipe-down':
      ctx.beginPath()
      ctx.rect(0, 0, width, height * progress)
      ctx.clip()
      break

    case 'zoom-in':
      const scale = 0.5 + progress * 0.5
      ctx.translate(width / 2, height / 2)
      ctx.scale(scale, scale)
      ctx.translate(-width / 2, -height / 2)
      ctx.globalAlpha = progress
      break

    case 'zoom-out':
      const scaleOut = 1.5 - progress * 0.5
      ctx.translate(width / 2, height / 2)
      ctx.scale(scaleOut, scaleOut)
      ctx.translate(-width / 2, -height / 2)
      ctx.globalAlpha = progress
      break

    case 'blur':
      ctx.filter = `blur(${(1 - progress) * 10}px)`
      ctx.globalAlpha = progress
      break
  }
}

// ============================================
// 主合成器类
// ============================================

export class VideoComposer {
  private project: ComposerProject
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private videoElements: Map<string, HTMLVideoElement> = new Map()
  private imageElements: Map<string, HTMLImageElement> = new Map()
  private audioRenderer: OfflineAudioRenderer

  constructor(project: ComposerProject) {
    this.project = project
    this.canvas = document.createElement('canvas')
    this.canvas.width = project.output.width
    this.canvas.height = project.output.height
    this.ctx = this.canvas.getContext('2d')!
    this.audioRenderer = new OfflineAudioRenderer()
  }

  /** 预加载所有资源 */
  async preload(onProgress?: ProgressCallback): Promise<void> {
    const assets = this.project.assets
    const total = assets.length
    let loaded = 0

    for (const asset of assets) {
      if (asset.type === 'video') {
        await this.loadVideo(asset)
      } else if (asset.type === 'image') {
        await this.loadImage(asset)
      }
      loaded++
      onProgress?.(Math.round((loaded / total) * 100), `加载资源 ${loaded}/${total}`)
    }
  }

  /** 加载视频 */
  private async loadVideo(asset: VideoAsset): Promise<HTMLVideoElement> {
    if (this.videoElements.has(asset.id)) {
      return this.videoElements.get(asset.id)!
    }

    const video = document.createElement('video')
    video.src = asset.src
    video.muted = true // 视频静音，音频单独处理
    video.playsInline = true
    video.preload = 'auto'

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error(`视频加载失败: ${asset.src}`))
    })

    this.videoElements.set(asset.id, video)
    return video
  }

  /** 加载图片 */
  private async loadImage(asset: ImageAsset): Promise<HTMLImageElement> {
    if (this.imageElements.has(asset.id)) {
      return this.imageElements.get(asset.id)!
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`图片加载失败: ${asset.src}`))
      img.src = asset.src
    })

    this.imageElements.set(asset.id, img)
    return img
  }

  /** 计算总时长 */
  getTotalDuration(): number {
    let maxEnd = 0
    for (const asset of this.project.assets) {
      const end = asset.timelineStart + asset.duration
      if (end > maxEnd) maxEnd = end
    }
    return maxEnd
  }

  /** 获取指定时间点的活动素材 */
  private getActiveAssets(time: number): Asset[] {
    return this.project.assets.filter((asset) => {
      return time >= asset.timelineStart && time < asset.timelineStart + asset.duration
    })
  }

  /** 渲染单帧 */
  async renderFrame(time: number): Promise<void> {
    const { width, height } = this.project.output
    const ctx = this.ctx

    // 清空画布
    ctx.fillStyle = this.project.backgroundColor || '#000000'
    ctx.fillRect(0, 0, width, height)

    // 获取活动素材并按轨道排序
    const activeAssets = this.getActiveAssets(time)
    activeAssets.sort((a, b) => (a.track ?? 0) - (b.track ?? 0))

    // 渲染每个素材
    for (const asset of activeAssets) {
      ctx.save()

      switch (asset.type) {
        case 'video':
          await this.renderVideo(asset, time)
          break
        case 'image':
          await this.renderImage(asset, time)
          break
        case 'text':
          this.renderText(asset, time)
          break
      }

      ctx.restore()
    }
  }

  /** 渲染视频 */
  private async renderVideo(asset: VideoAsset, time: number): Promise<void> {
    const video = this.videoElements.get(asset.id)
    if (!video) return

    const { width, height } = this.project.output
    const ctx = this.ctx

    // 计算视频内时间
    const localTime = time - asset.timelineStart
    const videoTime = asset.clipStart + localTime * (asset.speed ?? 1)
    
    // 设置视频时间
    video.currentTime = Math.min(videoTime, asset.clipEnd)

    // 等待视频帧就绪
    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        resolve()
      } else {
        const handler = () => {
          video.removeEventListener('seeked', handler)
          resolve()
        }
        video.addEventListener('seeked', handler)
      }
    })

    // 应用滤镜
    if (asset.filters && asset.filters.length > 0) {
      applyFilters(ctx, asset.filters)
    }

    // 绘制视频（保持比例居中）
    const videoRatio = video.videoWidth / video.videoHeight
    const canvasRatio = width / height
    let drawWidth = width
    let drawHeight = height
    let drawX = 0
    let drawY = 0

    if (videoRatio > canvasRatio) {
      drawHeight = width / videoRatio
      drawY = (height - drawHeight) / 2
    } else {
      drawWidth = height * videoRatio
      drawX = (width - drawWidth) / 2
    }

    ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight)
    ctx.filter = 'none'
  }

  /** 渲染图片 */
  private async renderImage(asset: ImageAsset, time: number): Promise<void> {
    const img = this.imageElements.get(asset.id)
    if (!img) return

    const { width, height } = this.project.output
    const ctx = this.ctx

    // 计算动画状态
    const localTime = time - asset.timelineStart
    const progress = localTime / asset.duration
    const animState = calculateAnimationState(asset.animation, progress, asset.duration)

    if (animState.opacity <= 0) return

    ctx.globalAlpha = animState.opacity * (asset.opacity ?? 1)

    // 计算位置和尺寸
    let x = 0
    let y = 0
    let w = img.width
    let h = img.height

    if (asset.position) {
      x = typeof asset.position.x === 'string' 
        ? (parseFloat(asset.position.x) / 100) * width 
        : asset.position.x
      y = typeof asset.position.y === 'string'
        ? (parseFloat(asset.position.y) / 100) * height
        : asset.position.y
    }

    if (asset.size) {
      w = typeof asset.size.width === 'string'
        ? (parseFloat(asset.size.width) / 100) * width
        : asset.size.width
      h = typeof asset.size.height === 'string'
        ? (parseFloat(asset.size.height) / 100) * height
        : asset.size.height
    }

    // 应用变换
    if (animState.scale !== 1 || animState.translateX !== 0 || animState.translateY !== 0) {
      ctx.translate(x + w / 2, y + h / 2)
      ctx.scale(animState.scale, animState.scale)
      ctx.translate(-w / 2 + animState.translateX, -h / 2 + animState.translateY)
      ctx.drawImage(img, 0, 0, w, h)
    } else {
      ctx.drawImage(img, x, y, w, h)
    }
  }

  /** 渲染文字 */
  private renderText(asset: TextAsset, time: number): void {
    const { width, height } = this.project.output
    const ctx = this.ctx
    const style = asset.style

    // 计算动画状态
    const localTime = time - asset.timelineStart
    const progress = localTime / asset.duration
    const animState = calculateAnimationState(asset.animation, progress, asset.duration)

    if (animState.opacity <= 0) return

    ctx.save()
    ctx.globalAlpha = animState.opacity

    // 设置字体
    const fontWeight = style.fontWeight ?? 400
    const fontFamily = style.fontFamily ?? 'Noto Sans SC, sans-serif'
    ctx.font = `${fontWeight} ${style.fontSize}px "${fontFamily}"`
    ctx.textAlign = style.textAlign ?? 'center'
    ctx.textBaseline = 'middle'

    // 计算位置
    let x = width / 2
    let y = height - 80

    if (asset.position) {
      x = typeof asset.position.x === 'string'
        ? (parseFloat(asset.position.x) / 100) * width
        : asset.position.x
      y = typeof asset.position.y === 'string'
        ? (parseFloat(asset.position.y) / 100) * height
        : asset.position.y
    } else {
      // 使用 verticalAlign
      switch (style.verticalAlign) {
        case 'top':
          y = 80
          break
        case 'middle':
          y = height / 2
          break
        case 'bottom':
        default:
          y = height - 80
      }
    }

    // 应用动画变换
    x += animState.translateX
    y += animState.translateY

    if (animState.scale !== 1 || animState.rotate !== 0) {
      ctx.translate(x, y)
      ctx.scale(animState.scale, animState.scale)
      ctx.rotate(animState.rotate * Math.PI / 180)
      ctx.translate(-x, -y)
    }

    // 测量文本
    const metrics = ctx.measureText(asset.content)
    const textWidth = metrics.width
    const textHeight = style.fontSize * 1.2

    // 绘制背景
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      const padding = style.backgroundPadding ?? 12
      const radius = style.backgroundRadius ?? 6
      let bgX = x - textWidth / 2 - padding
      if (style.textAlign === 'left') bgX = x - padding
      if (style.textAlign === 'right') bgX = x - textWidth - padding

      ctx.fillStyle = style.backgroundColor
      ctx.beginPath()
      ctx.roundRect(bgX, y - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding, radius)
      ctx.fill()
    }

    // 绘制阴影
    if (style.shadow) {
      ctx.shadowColor = style.shadow.color
      ctx.shadowBlur = style.shadow.blur
      ctx.shadowOffsetX = style.shadow.offsetX
      ctx.shadowOffsetY = style.shadow.offsetY
    }

    // 绘制描边
    if (style.stroke) {
      ctx.strokeStyle = style.stroke.color
      ctx.lineWidth = style.stroke.width * 2
      ctx.lineJoin = 'round'
      ctx.strokeText(asset.content, x, y)
    }

    // 绘制文字
    if (style.gradient) {
      const gradient = style.gradient.type === 'linear'
        ? ctx.createLinearGradient(x - textWidth / 2, y, x + textWidth / 2, y)
        : ctx.createRadialGradient(x, y, 0, x, y, textWidth / 2)
      
      const colors = style.gradient.colors
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color)
      })
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = style.color
    }

    ctx.fillText(asset.content, x, y)
    ctx.restore()
  }

  /** 渲染并导出视频 */
  async render(onProgress?: ProgressCallback): Promise<RenderResult> {
    const { width, height, fps, videoBitrate } = this.project.output
    const totalDuration = this.getTotalDuration()
    const totalFrames = Math.ceil(totalDuration * fps)

    onProgress?.(0, '预加载资源...')
    await this.preload((p, msg) => onProgress?.(p * 0.1, msg))

    onProgress?.(10, '准备录制...')

    // 创建视频流
    const stream = this.canvas.captureStream(fps)

    // 处理音频
    onProgress?.(15, '处理音频...')
    const videoAssets = this.project.assets.filter((a): a is VideoAsset => a.type === 'video')
    const audioAssets = this.project.assets.filter((a): a is AudioAsset => a.type === 'audio')
    
    let audioBlob: Blob | null = null
    if (videoAssets.some(v => !v.muted) || audioAssets.length > 0) {
      try {
        const audioBuffer = await this.audioRenderer.renderAudioTracks(
          videoAssets,
          audioAssets,
          totalDuration,
          (p) => onProgress?.(15 + p * 0.1, '渲染音频...')
        )
        audioBlob = this.audioRenderer.audioBufferToWav(audioBuffer)
        
        // 将音频添加到流
        const audioElement = new Audio(URL.createObjectURL(audioBlob))
        await audioElement.play().catch(() => {})
        audioElement.pause()
        audioElement.currentTime = 0
        
        // 创建音频源并连接到流
        const audioContext = new AudioContext()
        const source = audioContext.createMediaElementSource(audioElement)
        const destination = audioContext.createMediaStreamDestination()
        source.connect(destination)
        
        // 合并音频轨道到视频流
        destination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track)
        })
        
        // 开始播放音频
        audioElement.play()
      } catch (e) {
        console.warn('[Composer] 音频处理失败，将输出无声视频:', e)
      }
    }

    // 选择编码格式
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ]

    let mimeType = ''
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type
        break
      }
    }

    if (!mimeType) {
      throw new Error('浏览器不支持视频录制')
    }

    console.log('[Composer] 使用编码格式:', mimeType)

    // 创建录制器
    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: videoBitrate ?? 4000000,
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    // 开始录制
    recorder.start(100) // 每 100ms 收集一次数据

    // 逐帧渲染
    const frameInterval = 1000 / fps

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / fps
      await this.renderFrame(time)

      // 更新进度
      if (frame % Math.floor(fps) === 0) {
        const progress = 25 + (frame / totalFrames) * 65
        onProgress?.(progress, `渲染中 ${Math.round((frame / totalFrames) * 100)}%`)
      }

      // 控制渲染速度
      await new Promise((resolve) => setTimeout(resolve, frameInterval / 20))
    }

    // 停止录制
    onProgress?.(90, '编码中...')

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      recorder.stop()
    })

    // 创建输出 Blob
    const blob = new Blob(chunks, { type: mimeType })

    onProgress?.(100, '完成')

    return {
      blob,
      duration: totalDuration,
      format: mimeType.includes('webm') ? 'webm' : 'mp4',
      size: blob.size,
    }
  }

  /** 销毁 */
  destroy(): void {
    this.videoElements.forEach((video) => {
      video.src = ''
    })
    this.videoElements.clear()
    this.imageElements.clear()
  }
}

// ============================================
// 简化 API
// ============================================

/**
 * 快速合成：单视频 + 字幕
 */
export async function quickCompose(
  videoUrl: string,
  subtitles: Array<{
    text: string
    startTime: number
    endTime: number
    style?: Partial<import('./types').TextStyle>
    animation?: AnimationEffect
  }>,
  options?: {
    startTime?: number
    endTime?: number
    width?: number
    height?: number
    fps?: number
  },
  onProgress?: ProgressCallback
): Promise<string> {
  const { startTime = 0, endTime, width = 1280, height = 720, fps = 30 } = options ?? {}

  // 创建项目
  const project: ComposerProject = {
    id: 'quick-compose',
    name: 'Quick Compose',
    output: { width, height, fps },
    assets: [],
    backgroundColor: '#000000',
  }

  // 计算视频时长
  const videoDuration = endTime ? endTime - startTime : 10

  // 添加视频素材
  const videoAsset: VideoAsset = {
    id: 'main-video',
    type: 'video',
    src: videoUrl,
    timelineStart: 0,
    duration: videoDuration,
    clipStart: startTime,
    clipEnd: endTime ?? startTime + videoDuration,
    volume: 1,
    muted: false,
  }
  project.assets.push(videoAsset)

  // 添加字幕素材
  subtitles.forEach((sub, index) => {
    const textAsset: TextAsset = {
      id: `subtitle-${index}`,
      type: 'text',
      content: sub.text,
      timelineStart: sub.startTime - startTime,
      duration: sub.endTime - sub.startTime,
      style: {
        fontSize: sub.style?.fontSize ?? 48,
        fontFamily: sub.style?.fontFamily ?? 'Noto Sans SC',
        fontWeight: sub.style?.fontWeight ?? 500,
        color: sub.style?.color ?? '#FFFFFF',
        backgroundColor: sub.style?.backgroundColor,
        textAlign: 'center',
        verticalAlign: 'bottom',
        stroke: {
          color: '#000000',
          width: 2,
        },
      },
      animation: sub.animation ?? { type: 'fade' },
    }
    project.assets.push(textAsset)
  })

  // 渲染
  const composer = new VideoComposer(project)
  try {
    const result = await composer.render(onProgress)
    return URL.createObjectURL(result.blob)
  } finally {
    composer.destroy()
  }
}

