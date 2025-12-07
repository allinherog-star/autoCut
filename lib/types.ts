/**
 * AutoCut 类型定义
 */

// ============================================
// 通用类型
// ============================================

/** 尺寸变体 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** 颜色变体 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

/** 位置 */
export type Position = 'top' | 'bottom' | 'left' | 'right'

/** 对齐方式 */
export type Alignment = 'start' | 'center' | 'end'

// ============================================
// 项目模型
// ============================================

/** 项目状态 */
export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed'

/** 项目信息 */
export interface Project {
  id: string
  name: string
  status: ProjectStatus
  thumbnailUrl?: string
  duration: number // 毫秒
  createdAt: Date
  updatedAt: Date
  currentStep: EditingStep
}

// ============================================
// 剪辑步骤
// ============================================

/** 剪辑步骤枚举 */
export type EditingStep =
  | 'upload' // 上传素材
  | 'understand' // 理解视频
  | 'subtitle' // 字幕推荐
  | 'title' // 标题推荐
  | 'music' // 音乐卡点
  | 'effects' // 特效渲染
  | 'emotion' // 情绪增强
  | 'sync' // 音画同步
  | 'edit' // 剪辑微调
  | 'export' // 完成导出

/** 步骤配置 */
export interface StepConfig {
  id: EditingStep
  label: string
  description: string
  icon: string
}

// ============================================
// 媒体资源
// ============================================

/** 媒体类型 */
export type MediaType = 'video' | 'audio' | 'image' | 'text'

/** 媒体资源 */
export interface MediaAsset {
  id: string
  type: MediaType
  name: string
  url: string
  thumbnailUrl?: string
  duration?: number // 毫秒（视频/音频）
  width?: number // 像素（视频/图片）
  height?: number // 像素（视频/图片）
  fileSize: number // 字节
  mimeType: string
  createdAt: Date
}

/** 视频片段 */
export interface VideoClip {
  id: string
  assetId: string
  startTime: number // 毫秒
  endTime: number // 毫秒
  trackIndex: number
  position: number // 在轨道上的位置（毫秒）
  labels?: string[]
  isSelected?: boolean
  isDiscarded?: boolean
}

// ============================================
// 时间轴
// ============================================

/** 轨道类型 */
export type TrackType = 'video' | 'audio' | 'subtitle' | 'effect'

/** 轨道 */
export interface Track {
  id: string
  type: TrackType
  name: string
  isMuted: boolean
  isLocked: boolean
  clips: VideoClip[]
}

/** 时间轴状态 */
export interface TimelineState {
  tracks: Track[]
  currentTime: number
  duration: number
  zoom: number
  selectedClipIds: string[]
}

// ============================================
// 字幕
// ============================================

/** 字幕样式 */
export interface SubtitleStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  backgroundColor?: string
  position: 'top' | 'center' | 'bottom'
  alignment: Alignment
  hasOutline: boolean
  outlineColor?: string
  outlineWidth?: number
}

/** 字幕条目 */
export interface SubtitleEntry {
  id: string
  text: string
  startTime: number
  endTime: number
  style?: Partial<SubtitleStyle>
}

// ============================================
// 音频
// ============================================

/** 背景音乐 */
export interface BackgroundMusic {
  id: string
  name: string
  artist?: string
  url: string
  duration: number
  bpm?: number
  mood?: string[]
  genre?: string[]
}

/** 音效 */
export interface SoundEffect {
  id: string
  name: string
  category: string
  url: string
  duration: number
}

// ============================================
// 特效
// ============================================

/** 转场类型 */
export type TransitionType = 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur'

/** 转场配置 */
export interface Transition {
  id: string
  type: TransitionType
  duration: number
  easing?: string
}

/** 滤镜预设 */
export interface FilterPreset {
  id: string
  name: string
  thumbnailUrl: string
  settings: {
    brightness?: number
    contrast?: number
    saturation?: number
    hue?: number
    blur?: number
    vignette?: number
  }
}

// ============================================
// 导出配置
// ============================================

/** 分辨率预设 */
export type ResolutionPreset = '720p' | '1080p' | '2k' | '4k'

/** 帧率预设 */
export type FrameRatePreset = 24 | 25 | 30 | 50 | 60

/** 导出配置 */
export interface ExportConfig {
  resolution: ResolutionPreset
  frameRate: FrameRatePreset
  quality: 'low' | 'medium' | 'high' | 'ultra'
  format: 'mp4' | 'webm' | 'mov'
  includeSubtitles: boolean
  watermark?: {
    text?: string
    imageUrl?: string
    position: Position
    opacity: number
  }
}

// ============================================
// 用户偏好
// ============================================

/** 用户偏好设置 */
export interface UserPreferences {
  defaultSubtitleStyle: SubtitleStyle
  defaultExportConfig: ExportConfig
  favoriteTransitions: string[]
  favoriteFilters: string[]
  recentProjects: string[]
}




