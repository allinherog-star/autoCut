/**
 * Canvas 视频合成器
 * 使用 Canvas 逐帧渲染视频 + 字幕，通过 MediaRecorder 编码输出
 * 
 * 优势：
 * - 完美支持中文字体
 * - 支持任何 CSS 动画效果
 * - 不依赖 FFmpeg 的字幕滤镜
 */

// 字幕样式
export interface SubtitleStyle {
  fontSize: number
  fontFamily?: string
  fontWeight?: number
  color: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  hasOutline: boolean
  outlineColor?: string
  outlineWidth?: number
  // 动画相关
  animationId?: string
}

// 字幕条目
export interface SubtitleItem {
  id: string
  text: string
  startTime: number
  endTime: number
  style: SubtitleStyle
}

// 视频片段
export interface VideoClip {
  videoUrl: string
  startTime: number
  endTime: number
  subtitles: SubtitleItem[]
}

// 合成配置
export interface ComposerConfig {
  width: number
  height: number
  fps: number
  videoBitrate?: number
}

// 进度回调
export type ProgressCallback = (progress: number, message: string) => void

/**
 * 计算动画效果
 */
function calculateAnimation(
  animationId: string | undefined,
  progress: number, // 0-1，字幕显示进度
  duration: number  // 字幕持续时间（秒）
): {
  opacity: number
  scale: number
  translateY: number
  rotate: number
} {
  const result = { opacity: 1, scale: 1, translateY: 0, rotate: 0 }
  
  if (!animationId || animationId === 'none') {
    return result
  }

  // 入场动画（前 0.3 秒）
  const fadeInDuration = Math.min(0.3, duration * 0.2)
  const fadeInProgress = Math.min(1, progress * duration / fadeInDuration)
  
  // 出场动画（后 0.2 秒）
  const fadeOutDuration = Math.min(0.2, duration * 0.1)
  const fadeOutStart = 1 - fadeOutDuration / duration
  const fadeOutProgress = progress > fadeOutStart 
    ? (progress - fadeOutStart) / (1 - fadeOutStart)
    : 0

  switch (animationId) {
    case 'fade':
      result.opacity = fadeInProgress < 1 ? fadeInProgress : (1 - fadeOutProgress)
      break
      
    case 'slide-up':
      result.opacity = fadeInProgress < 1 ? fadeInProgress : (1 - fadeOutProgress)
      result.translateY = fadeInProgress < 1 ? (1 - fadeInProgress) * 30 : -fadeOutProgress * 20
      break
      
    case 'zoom':
      result.opacity = fadeInProgress < 1 ? fadeInProgress : (1 - fadeOutProgress)
      result.scale = fadeInProgress < 1 ? 0.5 + fadeInProgress * 0.5 : 1 - fadeOutProgress * 0.2
      break
      
    case 'bounce':
      if (fadeInProgress < 1) {
        // 弹跳入场
        const t = fadeInProgress
        result.scale = 0.3 + t * 0.7 + Math.sin(t * Math.PI * 2) * 0.1 * (1 - t)
        result.translateY = (1 - t) * 40
        result.opacity = t
      } else {
        result.opacity = 1 - fadeOutProgress
      }
      break
      
    case 'shake':
      result.opacity = fadeInProgress < 1 ? fadeInProgress : (1 - fadeOutProgress)
      if (fadeInProgress >= 1 && fadeOutProgress === 0) {
        // 持续轻微抖动
        const shakeTime = (progress - fadeInDuration / duration) * duration
        result.translateY = Math.sin(shakeTime * 20) * 2
      }
      break
      
    case 'pulse':
      result.opacity = fadeInProgress < 1 ? fadeInProgress : (1 - fadeOutProgress)
      if (fadeInProgress >= 1 && fadeOutProgress === 0) {
        // 脉冲效果
        const pulseTime = (progress - fadeInDuration / duration) * duration
        result.scale = 1 + Math.sin(pulseTime * 4) * 0.03
      }
      break
      
    default:
      result.opacity = fadeInProgress < 1 ? fadeInProgress : (1 - fadeOutProgress)
  }
  
  return result
}

/**
 * 在 Canvas 上绘制字幕
 */
function drawSubtitle(
  ctx: CanvasRenderingContext2D,
  subtitle: SubtitleItem,
  canvasWidth: number,
  canvasHeight: number,
  currentTime: number
): void {
  const style = subtitle.style
  const duration = subtitle.endTime - subtitle.startTime
  const progress = (currentTime - subtitle.startTime) / duration
  
  if (progress < 0 || progress > 1) return
  
  // 计算动画
  const anim = calculateAnimation(style.animationId, progress, duration)
  
  if (anim.opacity <= 0) return
  
  ctx.save()
  
  // 设置字体
  const fontWeight = style.fontWeight || 400
  const fontFamily = style.fontFamily || 'Noto Sans SC, sans-serif'
  ctx.font = `${fontWeight} ${style.fontSize}px "${fontFamily}"`
  ctx.textAlign = style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center'
  ctx.textBaseline = 'middle'
  
  // 计算位置
  let x = canvasWidth / 2
  if (style.alignment === 'left') x = 40
  if (style.alignment === 'right') x = canvasWidth - 40
  
  let y = canvasHeight - 80 // 默认底部
  if (style.position === 'top') y = 80
  if (style.position === 'center') y = canvasHeight / 2
  
  // 应用动画变换
  y += anim.translateY
  ctx.globalAlpha = anim.opacity
  
  if (anim.scale !== 1 || anim.rotate !== 0) {
    ctx.translate(x, y)
    ctx.scale(anim.scale, anim.scale)
    ctx.rotate(anim.rotate * Math.PI / 180)
    ctx.translate(-x, -y)
  }
  
  // 测量文本
  const metrics = ctx.measureText(subtitle.text)
  const textWidth = metrics.width
  const textHeight = style.fontSize * 1.2
  
  // 绘制背景
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    const padding = 12
    let bgX = x - textWidth / 2 - padding
    if (style.alignment === 'left') bgX = x - padding
    if (style.alignment === 'right') bgX = x - textWidth - padding
    
    ctx.fillStyle = style.backgroundColor
    ctx.beginPath()
    ctx.roundRect(bgX, y - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding, 6)
    ctx.fill()
  }
  
  // 绘制描边
  if (style.hasOutline) {
    ctx.strokeStyle = style.outlineColor || '#000000'
    ctx.lineWidth = (style.outlineWidth || 2) * 2
    ctx.lineJoin = 'round'
    ctx.strokeText(subtitle.text, x, y)
  }
  
  // 绘制文字
  ctx.fillStyle = style.color
  ctx.fillText(subtitle.text, x, y)
  
  ctx.restore()
}

/**
 * 合成带字幕的视频
 */
export async function composeVideoWithSubtitles(
  clips: VideoClip[],
  config: ComposerConfig,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const { width, height, fps } = config
  
  onProgress?.(0, '准备合成...')
  
  // 创建 Canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  
  // 创建离屏视频元素
  const videos: HTMLVideoElement[] = []
  
  // 预加载所有视频
  onProgress?.(5, '加载视频...')
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i]
    const video = document.createElement('video')
    video.src = clip.videoUrl
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error(`视频 ${i + 1} 加载失败`))
    })
    
    videos.push(video)
    onProgress?.(5 + (i + 1) / clips.length * 15, `加载视频 ${i + 1}/${clips.length}`)
  }
  
  // 计算总时长
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.endTime - clip.startTime), 0)
  const totalFrames = Math.ceil(totalDuration * fps)
  
  onProgress?.(20, '开始录制...')
  
  // 创建 MediaRecorder
  const stream = canvas.captureStream(fps)
  
  // 尝试使用 VP9 或 VP8 编码
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4'
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
  
  const chunks: Blob[] = []
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: config.videoBitrate || 2500000
  })
  
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data)
    }
  }
  
  // 开始录制
  recorder.start()
  
  // 逐帧渲染
  const frameInterval = 1000 / fps
  let currentClipIndex = 0
  let clipStartTime = 0
  let globalTime = 0
  
  for (let frame = 0; frame < totalFrames; frame++) {
    const clip = clips[currentClipIndex]
    const video = videos[currentClipIndex]
    const clipDuration = clip.endTime - clip.startTime
    const localTime = globalTime - clipStartTime
    
    // 检查是否需要切换到下一个片段
    if (localTime >= clipDuration && currentClipIndex < clips.length - 1) {
      clipStartTime = globalTime
      currentClipIndex++
      continue
    }
    
    // 设置视频时间
    video.currentTime = clip.startTime + localTime
    
    // 等待视频帧
    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        resolve()
      } else {
        video.onseeked = () => resolve()
      }
    })
    
    // 清空画布
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制视频帧（保持比例居中）
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
    
    // 绘制字幕
    const currentVideoTime = clip.startTime + localTime
    for (const subtitle of clip.subtitles) {
      if (currentVideoTime >= subtitle.startTime && currentVideoTime <= subtitle.endTime) {
        drawSubtitle(ctx, subtitle, width, height, currentVideoTime)
      }
    }
    
    // 更新进度
    globalTime += 1 / fps
    
    if (frame % fps === 0) {
      const progress = 20 + (frame / totalFrames) * 70
      onProgress?.(progress, `渲染中 ${Math.round(frame / totalFrames * 100)}%`)
    }
    
    // 等待下一帧
    await new Promise(resolve => setTimeout(resolve, frameInterval / 10))
  }
  
  // 停止录制
  onProgress?.(90, '编码中...')
  
  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve()
    recorder.stop()
  })
  
  // 合并数据
  const blob = new Blob(chunks, { type: mimeType })
  
  onProgress?.(100, '完成')
  
  console.log('[Composer] 输出大小:', (blob.size / 1024 / 1024).toFixed(2), 'MB')
  
  return blob
}

/**
 * 简化版：合成单个视频片段
 */
export async function composeSimpleVideo(
  videoUrl: string,
  subtitles: SubtitleItem[],
  startTime: number,
  endTime: number,
  onProgress?: ProgressCallback
): Promise<string> {
  const clip: VideoClip = {
    videoUrl,
    startTime,
    endTime,
    subtitles
  }
  
  const blob = await composeVideoWithSubtitles(
    [clip],
    { width: 1280, height: 720, fps: 30 },
    onProgress
  )
  
  return URL.createObjectURL(blob)
}




