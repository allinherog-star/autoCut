/**
 * 视频合成系统 - 类型定义
 * 
 * 支持：视频、音频、图片、字幕、滤镜、转场
 */

// ============================================
// 基础类型
// ============================================

/** 时间范围 */
export interface TimeRange {
  start: number  // 开始时间（秒）
  end: number    // 结束时间（秒）
}

/** 位置 */
export interface Position {
  x: number | string  // 像素或百分比
  y: number | string
}

/** 尺寸 */
export interface Size {
  width: number | string
  height: number | string
}

// ============================================
// 素材类型
// ============================================

/** 素材基类 */
export interface BaseAsset {
  id: string
  name?: string
  /** 在时间线上的位置 */
  timelineStart: number
  /** 素材持续时间 */
  duration: number
  /** 轨道索引（用于图层叠加） */
  track?: number
}

/** 视频素材 */
export interface VideoAsset extends BaseAsset {
  type: 'video'
  src: string
  /** 视频内的起始时间（用于裁剪） */
  clipStart: number
  /** 视频内的结束时间 */
  clipEnd: number
  /** 音量 (0-1) */
  volume?: number
  /** 是否静音 */
  muted?: boolean
  /** 播放速度 */
  speed?: number
  /** 滤镜 */
  filters?: FilterEffect[]
}

/** 音频素材 */
export interface AudioAsset extends BaseAsset {
  type: 'audio'
  src: string
  /** 音频内的起始时间 */
  clipStart: number
  /** 音量 (0-1) */
  volume?: number
  /** 淡入时长 */
  fadeIn?: number
  /** 淡出时长 */
  fadeOut?: number
}

/** 图片素材 */
export interface ImageAsset extends BaseAsset {
  type: 'image'
  src: string
  /** 位置 */
  position?: Position
  /** 尺寸 */
  size?: Size
  /** 透明度 (0-1) */
  opacity?: number
  /** 动画 */
  animation?: AnimationEffect
}

/** 文字/字幕素材 */
export interface TextAsset extends BaseAsset {
  type: 'text'
  content: string
  style: TextStyle
  /** 位置 */
  position?: Position
  /** 动画效果 */
  animation?: AnimationEffect
}

/** 素材联合类型 */
export type Asset = VideoAsset | AudioAsset | ImageAsset | TextAsset

// ============================================
// 样式定义
// ============================================

/** 文字样式 */
export interface TextStyle {
  fontSize: number
  fontFamily?: string
  fontWeight?: number
  color: string
  /** 背景色 */
  backgroundColor?: string
  /** 背景内边距 */
  backgroundPadding?: number
  /** 背景圆角 */
  backgroundRadius?: number
  /** 对齐方式 */
  textAlign?: 'left' | 'center' | 'right'
  /** 垂直位置 */
  verticalAlign?: 'top' | 'middle' | 'bottom'
  /** 描边 */
  stroke?: {
    color: string
    width: number
  }
  /** 阴影 */
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
  /** 渐变色 */
  gradient?: {
    type: 'linear' | 'radial'
    colors: string[]
    angle?: number
  }
}

// ============================================
// 效果定义
// ============================================

/** 滤镜效果 */
export interface FilterEffect {
  type: 'brightness' | 'contrast' | 'saturate' | 'blur' | 'grayscale' | 'sepia' | 'hue-rotate'
  value: number
}

/** 动画效果 */
export interface AnimationEffect {
  type: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 
        'zoom' | 'bounce' | 'shake' | 'pulse' | 'typewriter' | 'glow'
  /** 入场动画时长 */
  enterDuration?: number
  /** 出场动画时长 */
  exitDuration?: number
  /** 缓动函数 */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

/** 转场效果 */
export interface TransitionEffect {
  type: 'none' | 'fade' | 'dissolve' | 'wipe-left' | 'wipe-right' | 
        'wipe-up' | 'wipe-down' | 'zoom-in' | 'zoom-out' | 'blur'
  duration: number
}

// ============================================
// 项目定义
// ============================================

/** 合成项目 */
export interface ComposerProject {
  /** 项目ID */
  id: string
  /** 项目名称 */
  name: string
  /** 输出配置 */
  output: OutputConfig
  /** 所有素材 */
  assets: Asset[]
  /** 转场效果列表（按时间顺序） */
  transitions?: TransitionConfig[]
  /** 背景色 */
  backgroundColor?: string
  /** 背景音乐 */
  backgroundMusic?: AudioAsset
}

/** 输出配置 */
export interface OutputConfig {
  width: number
  height: number
  fps: number
  /** 视频比特率 (bps) */
  videoBitrate?: number
  /** 音频比特率 (bps) */
  audioBitrate?: number
  /** 输出格式 */
  format?: 'webm' | 'mp4'
}

/** 转场配置 */
export interface TransitionConfig {
  /** 转场发生的时间点 */
  time: number
  /** 转场效果 */
  effect: TransitionEffect
}

// ============================================
// 渲染状态
// ============================================

/** 渲染进度回调 */
export type ProgressCallback = (progress: number, message: string) => void

/** 渲染结果 */
export interface RenderResult {
  blob: Blob
  duration: number
  format: string
  size: number
}

