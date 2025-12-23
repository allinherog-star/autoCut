/**
 * Canvas 花字渲染类型定义
 * 基于 Canvas 2D/WebGL 的高性能花字渲染系统
 */

// ============================================
// Canvas 渲染配置
// ============================================

export interface CanvasRenderConfig {
  width: number
  height: number
  fps: number
  devicePixelRatio: number
  antialias: boolean
  transparent: boolean
}

// ============================================
// 粒子系统
// ============================================

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  scale: number
  alpha: number
  color: string
  life: number
  maxLife: number
  type: 'circle' | 'rect' | 'star' | 'emoji'
  emoji?: string
}

export interface ParticleSystem {
  particles: Particle[]
  gravity: number
  friction: number
  spawnRate: number
  maxParticles: number
}

// ============================================
// 背景效果
// ============================================

export interface RadialBurstConfig {
  rayCount: number
  color1: string
  color2: string
  rotation: number
  opacity: number
}

export interface SpeedLineConfig {
  count: number
  colors: string[]
  minLength: number
  maxLength: number
  minWidth: number
  maxWidth: number
  speed: number
}

export interface GradientBackground {
  type: 'linear' | 'radial'
  colors: string[]
  angle?: number // for linear
  centerX?: number // for radial
  centerY?: number // for radial
}

// ============================================
// 文字渲染
// ============================================

export interface TextStrokeLayer {
  color: string
  width: number
  blur?: number
}

export interface CanvasTextStyle {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number | string

  // 填充
  fillColor: string
  fillGradient?: {
    type: 'linear' | 'radial'
    colors: string[]
    angle?: number
  }

  // 描边（支持多层）
  strokes: TextStrokeLayer[]

  // 阴影
  shadows: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }[]

  // 发光
  glow?: {
    color: string
    blur: number
  }

  // 纹理
  texture?: 'none' | 'rough' | 'metallic' | 'soft'
}

// ============================================
// 形状渲染
// ============================================

export interface ExplosionShape {
  type: 'explosion' | 'star-burst' | 'speech-bubble' | 'cloud'
  width: number
  height: number
  color: string
  gradient?: {
    colors: string[]
    type: 'linear' | 'radial'
  }
  strokeColor?: string
  strokeWidth?: number
  roughness: number // 边缘粗糙度 0-1
}

// ============================================
// 涡旋底板配置
// ============================================

export interface SwirlPlateConfig {
  size: number           // 涡旋尺寸
  arms: number           // 涡旋臂数量 (默认 6)
  color: string          // 主色调
  glowIntensity: number  // 发光强度 0-1
  rotationSpeed: number  // 旋转速度 (度/秒)
}

// ============================================
// 脉冲光环配置
// ============================================

export interface PulseRingsConfig {
  count: number          // 光环数量
  color: string          // 光环颜色
  baseRadius: number     // 起始半径
  maxRadius: number      // 最大半径
  strokeWidth: number    // 线宽
  delay: number          // 各光环间延迟 (秒)
}

// ============================================
// 闪电飞散配置
// ============================================

export interface LightningBoltsConfig {
  count: number          // 闪电数量
  color: string          // 闪电颜色
  minLength: number      // 最小长度
  maxLength: number      // 最大长度
  segments: number       // 折线段数
  spreadDistance: number // 扩散距离
}

// ============================================
// 星芒粒子配置
// ============================================

export interface StarburstParticlesConfig {
  count: number          // 粒子数量
  colors: string[]       // 颜色列表
  minSize: number        // 最小尺寸
  maxSize: number        // 最大尺寸
  spreadDistance: number // 扩散距离
  starRatio: number      // 星形粒子比例 0-1
}


// ============================================
// 动画关键帧
// ============================================

export interface AnimationKeyframe {
  time: number // 0-1
  properties: {
    x?: number
    y?: number
    scale?: number
    scaleX?: number
    scaleY?: number
    rotation?: number
    alpha?: number
    blur?: number
    skewX?: number
    skewY?: number
  }
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic' | 'spring'
}

export interface AnimationTimeline {
  duration: number // 总时长（秒）
  keyframes: AnimationKeyframe[]
}

// ============================================
// 渲染层
// ============================================

export type RenderLayerType =
  | 'background'
  | 'radial-burst'
  | 'speed-lines'
  | 'particles-back'
  | 'shape'
  | 'text'
  | 'particles-front'
  | 'emoji-decoration'
  // 新增：霓虹脉冲旋风系列
  | 'swirl-plate'        // 涡旋底板
  | 'pulse-rings'        // 脉冲光环
  | 'lightning-bolts'    // 闪电飞散
  | 'starburst-particles' // 星芒粒子

export interface RenderLayer {
  id: string
  type: RenderLayerType
  zIndex: number
  visible: boolean
  opacity: number
  blendMode?: GlobalCompositeOperation

  // 渲染内容配置
  config: any // 根据 type 不同而不同

  // 动画配置
  animation?: AnimationTimeline
}

// ============================================
// 完整场景配置
// ============================================

export interface CanvasFancyTextScene {
  id: string
  name: string
  description: string

  // 渲染配置
  renderConfig: CanvasRenderConfig

  // 渲染层
  layers: RenderLayer[]

  // 总时长
  duration: number

  // 是否循环
  loop: boolean

  // 音效
  soundEffect?: string
}

// ============================================
// 渲染器接口
// ============================================

export interface ICanvasFancyTextRenderer {
  // 初始化
  init(canvas: HTMLCanvasElement, config: CanvasRenderConfig): void

  // 加载场景
  loadScene(scene: CanvasFancyTextScene): void

  // 播放控制
  play(): void
  pause(): void
  stop(): void
  seek(time: number): void

  // 渲染
  render(currentTime: number): void

  // 导出
  exportFrame(time: number): Blob
  exportVideo(format: 'webm' | 'mp4'): Promise<Blob>

  // 销毁
  destroy(): void
}








