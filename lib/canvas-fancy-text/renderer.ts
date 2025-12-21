/**
 * Canvas 花字渲染器
 * 高性能 Canvas 2D 渲染引擎
 */

import type {
  CanvasRenderConfig,
  CanvasFancyTextScene,
  RenderLayer,
  Particle,
  AnimationKeyframe,
  CanvasTextStyle,
  ExplosionShape,
  RadialBurstConfig,
  SpeedLineConfig,
  ICanvasFancyTextRenderer,
} from './types'

// ============================================
// 工具函数
// ============================================

/** 缓动函数 */
function easing(type: string, t: number): number {
  switch (type) {
    case 'linear':
      return t
    case 'easeIn':
      return t * t
    case 'easeOut':
      return t * (2 - t)
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    case 'bounce':
      if (t < 1 / 2.75) {
        return 7.5625 * t * t
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
      }
    case 'elastic':
      return Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1
    case 'spring':
      return 1 + Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3)
    default:
      return t
  }
}

/** 插值动画属性 */
function interpolateKeyframes(keyframes: AnimationKeyframe[], progress: number): any {
  if (keyframes.length === 0) return {}
  if (keyframes.length === 1) return keyframes[0].properties

  // 找到当前进度所在的关键帧区间
  let startFrame = keyframes[0]
  let endFrame = keyframes[keyframes.length - 1]

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
      startFrame = keyframes[i]
      endFrame = keyframes[i + 1]
      break
    }
  }

  // 计算区间内的进度
  const segmentDuration = endFrame.time - startFrame.time
  const segmentProgress = segmentDuration === 0 ? 0 : (progress - startFrame.time) / segmentDuration
  const easedProgress = easing(startFrame.easing || 'linear', segmentProgress)

  // 插值所有属性
  const result: any = {}
  const props = Object.keys({ ...startFrame.properties, ...endFrame.properties })

  for (const prop of props) {
    const startValue = (startFrame.properties as any)[prop] ?? 0
    const endValue = (endFrame.properties as any)[prop] ?? 0
    result[prop] = startValue + (endValue - startValue) * easedProgress
  }

  return result
}

/** 绘制粗糙边缘（手绘效果） */
function drawRoughPath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  roughness: number
) {
  if (points.length < 2) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    const offsetX = (Math.random() - 0.5) * roughness * 5
    const offsetY = (Math.random() - 0.5) * roughness * 5
    ctx.lineTo(points[i].x + offsetX, points[i].y + offsetY)
  }

  ctx.closePath()
}

// ============================================
// Canvas 渲染器
// ============================================

export class CanvasFancyTextRenderer implements ICanvasFancyTextRenderer {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private config!: CanvasRenderConfig
  private scene: CanvasFancyTextScene | null = null

  private isPlaying = false
  private currentTime = 0
  private startTime = 0
  private animationFrameId: number | null = null

  // 粒子系统
  private particles: Particle[] = []

  // ============================================
  // 初始化
  // ============================================

  init(canvas: HTMLCanvasElement, config: CanvasRenderConfig): void {
    this.canvas = canvas
    this.config = config

    // 设置 Canvas 尺寸
    canvas.width = config.width * config.devicePixelRatio
    canvas.height = config.height * config.devicePixelRatio
    canvas.style.width = `${config.width}px`
    canvas.style.height = `${config.height}px`

    const ctx = canvas.getContext('2d', {
      alpha: config.transparent,
      desynchronized: true, // 提升性能
    })

    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }

    this.ctx = ctx
    ctx.scale(config.devicePixelRatio, config.devicePixelRatio)

    // 抗锯齿
    if (config.antialias) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }
  }

  // ============================================
  // 场景管理
  // ============================================

  loadScene(scene: CanvasFancyTextScene): void {
    this.scene = scene
    this.currentTime = 0
    this.particles = []
  }

  // ============================================
  // 播放控制
  // ============================================

  play(): void {
    if (this.isPlaying) return
    this.isPlaying = true
    this.startTime = performance.now() - this.currentTime * 1000
    this.animate()
  }

  pause(): void {
    this.isPlaying = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  stop(): void {
    this.pause()
    this.currentTime = 0
  }

  seek(time: number): void {
    this.currentTime = time
    this.startTime = performance.now() - time * 1000
    this.render(time)
  }

  private animate = (): void => {
    if (!this.isPlaying) return

    const now = performance.now()
    this.currentTime = (now - this.startTime) / 1000

    // 循环处理
    if (this.scene && this.currentTime >= this.scene.duration) {
      if (this.scene.loop) {
        this.currentTime = 0
        this.startTime = now
      } else {
        this.pause()
        return
      }
    }

    this.render(this.currentTime)
    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  // ============================================
  // 渲染
  // ============================================

  render(currentTime: number): void {
    if (!this.scene) return

    const { ctx, config } = this
    const { width, height } = config

    // 清空画布
    if (config.transparent) {
      ctx.clearRect(0, 0, width, height)
    } else {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)
    }

    // 按 zIndex 排序渲染层
    const sortedLayers = [...this.scene.layers].sort((a, b) => a.zIndex - b.zIndex)

    for (const layer of sortedLayers) {
      if (!layer.visible) continue

      // 保存上下文状态
      ctx.save()

      // 设置混合模式
      if (layer.blendMode) {
        ctx.globalCompositeOperation = layer.blendMode
      }

      // 设置透明度
      ctx.globalAlpha = layer.opacity

      // 计算动画进度
      let animProps: any = {}
      if (layer.animation) {
        const progress = Math.min(1, currentTime / layer.animation.duration)
        animProps = interpolateKeyframes(layer.animation.keyframes, progress)
      }

      // 应用变换
      if (animProps.x !== undefined || animProps.y !== undefined) {
        ctx.translate(animProps.x || 0, animProps.y || 0)
      }
      if (animProps.rotation !== undefined) {
        ctx.rotate((animProps.rotation * Math.PI) / 180)
      }
      if (animProps.scale !== undefined) {
        ctx.scale(animProps.scale, animProps.scale)
      } else {
        if (animProps.scaleX !== undefined) ctx.scale(animProps.scaleX, 1)
        if (animProps.scaleY !== undefined) ctx.scale(1, animProps.scaleY)
      }
      if (animProps.alpha !== undefined) {
        ctx.globalAlpha *= animProps.alpha
      }

      // 渲染不同类型的层
      this.renderLayer(layer, currentTime, animProps)

      // 恢复上下文状态
      ctx.restore()
    }
  }

  private renderLayer(layer: RenderLayer, currentTime: number, animProps: any): void {
    switch (layer.type) {
      case 'background':
        this.renderBackground(layer.config)
        break
      case 'radial-burst':
        this.renderRadialBurst(layer.config)
        break
      case 'speed-lines':
        this.renderSpeedLines(layer.config, currentTime)
        break
      case 'shape':
        this.renderExplosionShape(layer.config)
        break
      case 'text':
        this.renderText(layer.config)
        break
      case 'particles-back':
      case 'particles-front':
        this.renderParticles(layer.config, currentTime)
        break
      case 'emoji-decoration':
        this.renderEmojiDecoration(layer.config)
        break
    }
  }

  // ============================================
  // 背景渲染
  // ============================================

  private renderBackground(config: any): void {
    const { ctx } = this
    const { width, height } = this.config

    if (config.type === 'linear') {
      const angle = config.angle || 135
      const rad = (angle * Math.PI) / 180
      const x1 = width / 2 - Math.cos(rad) * width
      const y1 = height / 2 - Math.sin(rad) * height
      const x2 = width / 2 + Math.cos(rad) * width
      const y2 = height / 2 + Math.sin(rad) * height

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      config.colors.forEach((color: string, i: number) => {
        gradient.addColorStop(i / (config.colors.length - 1), color)
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else if (config.type === 'radial') {
      const centerX = config.centerX || width / 2
      const centerY = config.centerY || height / 2
      const radius = Math.max(width, height)

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      config.colors.forEach((color: string, i: number) => {
        gradient.addColorStop(i / (config.colors.length - 1), color)
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
  }

  // ============================================
  // 放射线渲染
  // ============================================

  private renderRadialBurst(config: RadialBurstConfig): void {
    const { ctx } = this
    const { width, height } = this.config
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.sqrt(width * width + height * height) / 2

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((config.rotation * Math.PI) / 180)

    for (let i = 0; i < config.rayCount; i++) {
      const angle = (i / config.rayCount) * Math.PI * 2
      const color = i % 2 === 0 ? config.color1 : config.color2

      ctx.fillStyle = color
      ctx.globalAlpha = config.opacity * (i % 2 === 0 ? 1 : 0.6)

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(
        Math.cos(angle - 0.05) * maxRadius,
        Math.sin(angle - 0.05) * maxRadius
      )
      ctx.lineTo(
        Math.cos(angle + 0.05) * maxRadius,
        Math.sin(angle + 0.05) * maxRadius
      )
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  // ============================================
  // 速度线渲染
  // ============================================

  private renderSpeedLines(config: SpeedLineConfig, currentTime: number): void {
    const { ctx } = this
    const { width, height } = this.config
    const centerX = width / 2
    const centerY = height / 2

    for (let i = 0; i < config.count; i++) {
      const seed = i * 7
      const angle = (seed % 360) * (Math.PI / 180)
      const distance = 80 + ((seed * 3) % 60)
      const length = config.minLength + ((seed * 5) % (config.maxLength - config.minLength))
      const lineWidth = config.minWidth + ((seed * 2) % (config.maxWidth - config.minWidth))
      const color = config.colors[i % config.colors.length]

      const progress = (currentTime * config.speed + seed * 0.1) % 1
      const startX = centerX + Math.cos(angle) * distance * progress
      const startY = centerY + Math.sin(angle) * distance * progress
      const endX = startX + Math.cos(angle) * length
      const endY = startY + Math.sin(angle) * length

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, 'transparent')

      ctx.strokeStyle = gradient
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.globalAlpha = 0.6 * (1 - progress)

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    }
  }

  // ============================================
  // 爆炸形状渲染
  // ============================================

  private renderExplosionShape(config: ExplosionShape): void {
    const { ctx } = this
    const { width, height } = this.config
    const centerX = width / 2
    const centerY = height / 2

    // 生成爆炸形状的波浪边缘点
    const points: { x: number; y: number }[] = []
    const segments = 32
    const radiusX = config.width / 2
    const radiusY = config.height / 2

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const wave = Math.sin(angle * 6) * 15 * config.roughness
      const r = 1 + wave / Math.max(radiusX, radiusY)
      points.push({
        x: centerX + Math.cos(angle) * radiusX * r,
        y: centerY + Math.sin(angle) * radiusY * r,
      })
    }

    // 绘制形状
    ctx.save()

    if (config.gradient) {
      const gradient = ctx.createLinearGradient(
        centerX,
        centerY - radiusY,
        centerX,
        centerY + radiusY
      )
      config.gradient.colors.forEach((color, i) => {
        gradient.addColorStop(i / (config.gradient!.colors.length - 1), color)
      })
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = config.color
    }

    drawRoughPath(ctx, points, config.roughness)
    ctx.fill()

    // 描边
    if (config.strokeColor && config.strokeWidth) {
      ctx.strokeStyle = config.strokeColor
      ctx.lineWidth = config.strokeWidth
      ctx.stroke()
    }

    // 阴影
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 6

    ctx.restore()
  }

  // ============================================
  // 文字渲染
  // ============================================

  private renderText(config: CanvasTextStyle): void {
    const { ctx } = this
    const { width, height } = this.config
    const centerX = width / 2
    const centerY = height / 2

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`

    // 绘制多层描边（从外到内）
    for (let i = config.strokes.length - 1; i >= 0; i--) {
      const stroke = config.strokes[i]
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      if (stroke.blur) {
        ctx.shadowColor = stroke.color
        ctx.shadowBlur = stroke.blur
      } else {
        ctx.shadowBlur = 0
      }

      ctx.strokeText(config.text, centerX, centerY)
    }

    // 绘制阴影
    config.shadows.forEach((shadow) => {
      ctx.shadowColor = shadow.color
      ctx.shadowBlur = shadow.blur
      ctx.shadowOffsetX = shadow.offsetX
      ctx.shadowOffsetY = shadow.offsetY
    })

    // 绘制填充
    if (config.fillGradient) {
      const gradient = config.fillGradient.type === 'linear'
        ? ctx.createLinearGradient(centerX, centerY - config.fontSize / 2, centerX, centerY + config.fontSize / 2)
        : ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, config.fontSize)

      config.fillGradient.colors.forEach((color, i) => {
        gradient.addColorStop(i / (config.fillGradient!.colors.length - 1), color)
      })

      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = config.fillColor
    }

    ctx.fillText(config.text, centerX, centerY)

    // 发光效果
    if (config.glow) {
      ctx.shadowColor = config.glow.color
      ctx.shadowBlur = config.glow.blur
      ctx.fillText(config.text, centerX, centerY)
    }

    ctx.restore()
  }

  // ============================================
  // 粒子渲染
  // ============================================

  private renderParticles(config: any, currentTime: number): void {
    const { ctx } = this
    const { width, height } = this.config
    const centerX = width / 2
    const centerY = height / 2

    // 默认值
    const shapes = config.shapes || ['circle']
    const colors = config.colors || ['#ffffff']
    const count = config.count || 10
    const minSize = config.minSize || 5
    const maxSize = config.maxSize || 15

    // 确定粒子形状绘制函数
    const drawShape = (x: number, y: number, size: number, color: string, shape: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      if (shape === 'circle') {
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      } else {
        ctx.rect(x - size / 2, y - size / 2, size, size)
      }
      ctx.fill()
    }

    for (let i = 0; i < count; i++) {
      // 确定性随机生成
      const seed = i * 13
      const shape = shapes[i % shapes.length]
      const color = colors[i % colors.length]

      // 随机参数
      const speed = 100 + (seed % 200)
      const angle = (seed % 360) * (Math.PI / 180)
      const size = minSize + (seed % (maxSize - minSize || 1))

      // 运动计算 (基于时间的确定性位置)
      // 假设从中心向外发射
      const loopDuration = 2 // 粒子循环周期
      const timeOffset = (seed % 100) / 100 * loopDuration
      const t = (currentTime + timeOffset) % loopDuration
      const progress = t / loopDuration

      // 缓动
      const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic

      const distance = speed * easeProgress * 2 // 扩散距离
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      // 旋转
      const rotation = (seed + currentTime * 90) * (Math.PI / 180)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = ctx.globalAlpha * (1 - progress) // 逐渐消失
      drawShape(0, 0, size, color, shape)
      ctx.restore()
    }
  }

  private renderEmojiDecoration(config: any): void {
    const { ctx } = this
    const { width, height } = this.config
    const centerX = width / 2
    const centerY = height / 2
    const { emojis, positions } = config

    emojis.forEach((emoji: string, i: number) => {
      // 循环使用位置配置
      const pos = positions[i % positions.length]

      // 计算位置（相对于中心）
      const x = centerX + pos.x
      const y = centerY + pos.y

      ctx.save()
      ctx.font = `${pos.size}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 简单的入场延迟效果（如果需要的话，也可以在 layer animation 中做）
      // 这里直接绘制
      ctx.fillText(emoji, x, y)
      ctx.restore()
    })
  }

  // ============================================
  // 导出
  // ============================================

  exportFrame(time: number): Blob {
    this.render(time)
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!)
      })
    }) as any
  }

  async exportVideo(format: 'webm' | 'mp4'): Promise<Blob> {
    // 使用 MediaRecorder 或 WebCodecs 导出视频
    // 这里需要完整实现
    throw new Error('Not implemented yet')
  }

  // ============================================
  // 销毁
  // ============================================

  destroy(): void {
    this.pause()
    this.scene = null
    this.particles = []
  }
}




