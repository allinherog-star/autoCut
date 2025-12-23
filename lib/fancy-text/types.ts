/**
 * 花字模版类型系统
 * 定义花字的所有可控参数和渲染配置
 */

// ============================================
// 基础类型
// ============================================

/** 颜色类型（支持纯色和渐变） */
export interface ColorValue {
  type: 'solid' | 'linear-gradient' | 'radial-gradient'
  value: string // 纯色: '#FF0000', 渐变: 'linear-gradient(45deg, #FF0000, #00FF00)'
  colors?: string[] // 渐变色数组
  angle?: number // 渐变角度（线性渐变）
}

/** 描边配置 */
export interface StrokeConfig {
  enabled: boolean
  color: string
  width: number
}

/** 阴影配置 */
export interface ShadowConfig {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

/** 发光配置 */
export interface GlowConfig {
  enabled: boolean
  color: string
  blur: number
  spread: number
}

// ============================================
// 动画类型
// ============================================

/** 入场动画类型 */
export type EntranceAnimation =
  | 'none'
  | 'fade'
  | 'scale-bounce'
  | 'scale-pop'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'flash'
  | 'explode'
  | 'spring-shake'
  | 'typewriter'
  | 'char-scatter'
  | 'char-wave'
  | 'char-bounce'
  | 'rotate-in'
  | 'flip-in'
  | 'zoom-blur'
  | 'glitch'

/** 循环动画类型 */
export type LoopAnimation =
  | 'none'
  | 'breath-glow'
  | 'neon-flicker'
  | 'border-flow'
  | 'q-bounce'
  | 'float'
  | 'pulse'
  | 'swing'
  | 'shake'
  | 'rotate'
  | 'color-shift'
  | 'sparkle'

/** 退场动画类型 */
export type ExitAnimation =
  | 'none'
  | 'fade'
  | 'scale-shrink'
  | 'flip-out'
  | 'explode'
  | 'slide-out'
  | 'blur-out'
  | 'glitch-out'

/** 动画缓动函数 */
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | 'spring'

/** 动画配置 */
export interface AnimationConfig {
  entrance: EntranceAnimation
  entranceDuration: number // 秒
  entranceEasing: EasingFunction
  entranceDelay: number // 秒

  loop: LoopAnimation
  loopDuration: number // 单次循环时长（秒）
  loopDelay: number // 循环间隔（秒）

  exit: ExitAnimation
  exitDuration: number // 秒
  exitEasing: EasingFunction
}

// ============================================
// 装饰元素
// ============================================

/** 装饰元素类型 */
export type DecorationType =
  | 'sparkle'
  | 'particle'
  | 'emoji'
  | 'underline'
  | 'highlight-box'
  | 'speech-bubble'
  | 'fire'
  | 'ice'
  | 'electric'
  | 'star-burst'
  | 'confetti'

/** 装饰元素配置 */
export interface DecorationConfig {
  type: DecorationType
  enabled: boolean
  position: 'around' | 'behind' | 'front'
  color?: string
  size?: number
  count?: number // 粒子数量
  items?: string[] // emoji 列表
}

// ============================================
// 逐字参数
// ============================================

/** 单个字符的参数 */
export interface CharacterParams {
  charIndex: number
  offsetX: number // 水平偏移
  offsetY: number // 垂直偏移（高低）
  scale: number // 缩放（远近）
  rotation: number // 旋转角度
  colorOverride?: string // 颜色覆盖
  entranceDelay: number // 入场延迟（秒）
  fontSizeMultiplier: number // 字号倍数
}

/** 逐字参数配置 */
export interface PerCharacterConfig {
  enabled: boolean
  characters: CharacterParams[]
}

// ============================================
// 花字模版完整配置
// ============================================

/** 花字用途 */
export type FancyTextUsage =
  | 'title'
  | 'chapter_title'
  | 'guide'
  | 'emphasis'
  | 'person_intro'
  | 'detail_description'

/** 花字模版参数（整体） */
export interface FancyTextGlobalParams {
  // 文字内容
  text: string

  // 字体样式
  fontFamily: string
  fontSize: number
  fontWeight: number
  letterSpacing: number
  lineHeight: number

  // 颜色
  color: ColorValue

  // 效果
  stroke: StrokeConfig
  shadow: ShadowConfig
  glow: GlowConfig

  // 变换
  rotation: number
  skewX: number
  skewY: number

  // 动画
  animation: AnimationConfig

  // 装饰
  decorations: DecorationConfig[]

  // 音效
  soundEffect?: string

  // 时长
  totalDuration: number // 总展示时长（秒）
}

/** 花字模版完整定义 */
export interface FancyTextTemplate {
  id: string
  name: string
  description: string
  thumbnail?: string
  previewUrl?: string

  // 用途标签
  usage?: FancyTextUsage

  // 视觉风格标签
  visualStyles: string[]

  // 参数
  globalParams: FancyTextGlobalParams
  perCharacter: PerCharacterConfig

  // 元数据
  source: 'system' | 'user' | 'ai'
  renderer?: 'css' | 'canvas' | 'react' // 渲染引擎
  canvasPresetId?: string // Canvas 预设 ID
  componentPath?: string  // React 组件路径（react-component 渲染器）
  colorPresets?: ColorPreset[] // 配色预设（react-component 渲染器）
  createdAt: string
  updatedAt: string
  compat?: {
    renderer?: 'fancy-text' | 'canvas-fancy-text' | 'react-component'
    scenePath?: string
    componentPath?: string
  }
}

/** 配色预设 */
export interface ColorPreset {
  id: string
  name: string
  [key: string]: string // 允许任意颜色配置字段
}

/** 渲染参数（用户输入） */
export interface FancyTextRenderParams {
  text: string
  globalOverrides?: Partial<FancyTextGlobalParams>
  characterOverrides?: Partial<CharacterParams>[]
}

// ============================================
// 动画关键帧
// ============================================

/** 动画关键帧 */
export interface AnimationKeyframe {
  offset: number // 0-1
  properties: {
    opacity?: number
    scale?: number
    scaleX?: number
    scaleY?: number
    rotation?: number
    translateX?: number
    translateY?: number
    blur?: number
    skewX?: number
    skewY?: number
  }
  easing?: EasingFunction
}

/** 动画定义 */
export interface AnimationDefinition {
  name: string
  label: string
  description: string
  keyframes: AnimationKeyframe[]
  defaultDuration: number
}

// ============================================
// 字体风格预设
// ============================================

export type FontStylePreset =
  | 'handwritten'
  | 'pop'
  | 'variety-bold'
  | 'fun-bold'
  | 'bouncy'
  | 'cyber-neon'
  | 'cute-round'
  | 'firework-brush'
  | 'chalk'
  | 'serif-elegant'
  | 'pixel'
  | 'brush-script'

export interface FontStyleConfig {
  preset: FontStylePreset
  label: string
  fontFamily: string
  fontWeight: number
  letterSpacing: number
  defaultColor: ColorValue
  defaultStroke?: Partial<StrokeConfig>
  defaultShadow?: Partial<ShadowConfig>
  defaultGlow?: Partial<GlowConfig>
}

// ============================================
// 视觉风格预设
// ============================================

export type VisualStylePreset =
  | 'funny'
  | 'dramatic'
  | 'silly'
  | 'hilarious'
  | 'inspiring'
  | 'healing'
  | 'glowing'
  | 'tech'
  | 'variety-show'
  | 'magic'
  | 'fire'
  | 'ink'
  | 'graffiti'
  | 'retro'
  | 'minimalist'
  | 'cute'

export interface VisualStyleConfig {
  preset: VisualStylePreset
  label: string
  emoji: string
  suggestedColors: ColorValue[]
  suggestedAnimations: {
    entrance: EntranceAnimation[]
    loop: LoopAnimation[]
    exit: ExitAnimation[]
  }
  suggestedDecorations: DecorationType[]
}

// ============================================
// 质感预设
// ============================================

export type TexturePreset =
  | 'metallic'
  | 'glass'
  | 'neon'
  | 'gradient'
  | 'fluffy'
  | 'cyber'
  | 'film'
  | 'spray-paint'
  | 'particle'
  | '3d'

export interface TextureConfig {
  preset: TexturePreset
  label: string
  icon: string
  cssFilter?: string
  defaultColor: ColorValue
  defaultGlow?: Partial<GlowConfig>
  defaultShadow?: Partial<ShadowConfig>
}

