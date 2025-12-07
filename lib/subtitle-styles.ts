/**
 * 字幕样式系统
 * 包含丰富的字幕样式选项、预设模板、花字效果和动画配置
 */

// ============================================
// 字体配置
// ============================================

export interface FontConfig {
  name: string
  family: string
  weight: number[]
  preview: string // 预览文字
  category: 'sans' | 'serif' | 'display' | 'handwriting'
}

export const FONT_OPTIONS: FontConfig[] = [
  { name: '思源黑体', family: 'Noto Sans SC', weight: [400, 500, 700, 900], preview: '清晰百搭', category: 'sans' },
  { name: '思源宋体', family: 'Noto Serif SC', weight: [400, 600, 700, 900], preview: '优雅古典', category: 'serif' },
  { name: '阿里巴巴普惠体', family: 'Alibaba PuHuiTi', weight: [400, 500, 700], preview: '现代简约', category: 'sans' },
  { name: '站酷高端黑', family: 'ZCOOL QingKe HuangYou', weight: [400], preview: '潮流个性', category: 'display' },
  { name: '站酷快乐体', family: 'ZCOOL KuaiLe', weight: [400], preview: '活泼可爱', category: 'display' },
  { name: '霞鹜文楷', family: 'LXGW WenKai', weight: [400, 700], preview: '文艺书香', category: 'handwriting' },
  { name: '得意黑', family: 'Smiley Sans', weight: [400], preview: '潮酷有型', category: 'display' },
  { name: '演示悠然小楷', family: 'Yanshi Youran', weight: [400], preview: '古风书法', category: 'handwriting' },
]

// ============================================
// 标准字号配置
// ============================================

export interface FontSizeOption {
  value: number       // 字号像素值（内部使用）
  name: string        // 显示名称（用户友好）
  description: string // 描述/推荐场景
  category: 'small' | 'medium' | 'large' | 'xlarge'
}

// 手机竖屏标准字号 (基于 1080×1920 分辨率)
export const PHONE_FONT_SIZES: FontSizeOption[] = [
  { value: 36, name: '极小', description: '适合长文本、多行字幕', category: 'small' },
  { value: 42, name: '小', description: '信息密集型内容', category: 'small' },
  { value: 48, name: '较小', description: '标准字幕偏小', category: 'medium' },
  { value: 54, name: '标准', description: '清晰易读，通用选择', category: 'medium' },
  { value: 60, name: '中等', description: '短视频常用尺寸', category: 'medium' },
  { value: 66, name: '较大', description: '抖音/快手标准', category: 'large' },
  { value: 72, name: '大', description: '强调重点内容', category: 'large' },
  { value: 84, name: '特大', description: '冲击力强，吸引注意', category: 'xlarge' },
  { value: 96, name: '超大', description: '标题或特效文字', category: 'xlarge' },
  { value: 120, name: '巨大', description: '极致视觉冲击', category: 'xlarge' },
]

// 电脑横屏标准字号 (基于 1920×1080 分辨率)
export const PC_FONT_SIZES: FontSizeOption[] = [
  { value: 28, name: '极小', description: '适合长文本、多行字幕', category: 'small' },
  { value: 32, name: '小', description: '信息密集型内容', category: 'small' },
  { value: 36, name: '较小', description: '标准字幕偏小', category: 'medium' },
  { value: 42, name: '标准', description: 'B站/YouTube 常用', category: 'medium' },
  { value: 48, name: '中等', description: '清晰醒目', category: 'medium' },
  { value: 56, name: '较大', description: '强调重点内容', category: 'large' },
  { value: 64, name: '大', description: '视觉冲击力强', category: 'large' },
  { value: 72, name: '特大', description: '标题或特效文字', category: 'xlarge' },
  { value: 84, name: '超大', description: '极致视觉冲击', category: 'xlarge' },
]

// 获取字号推荐
export function getFontSizeRecommendation(device: 'phone' | 'pc'): number {
  return device === 'phone' ? 60 : 42
}

// 根据像素值获取字号名称
export function getFontSizeName(value: number, device: 'phone' | 'pc'): string {
  const sizes = device === 'phone' ? PHONE_FONT_SIZES : PC_FONT_SIZES
  const found = sizes.find(s => s.value === value)
  return found?.name || '自定义'
}

// ============================================
// 颜色预设
// ============================================

export interface ColorPreset {
  id: string
  name: string
  type: 'solid' | 'gradient'
  value: string // CSS 颜色值或渐变
  preview?: string // 预览用的背景色
}

export const TEXT_COLOR_PRESETS: ColorPreset[] = [
  { id: 'white', name: '纯白', type: 'solid', value: '#FFFFFF' },
  { id: 'yellow', name: '金黄', type: 'solid', value: '#FFD700' },
  { id: 'cyan', name: '青色', type: 'solid', value: '#00FFFF' },
  { id: 'pink', name: '粉红', type: 'solid', value: '#FF69B4' },
  { id: 'lime', name: '荧光绿', type: 'solid', value: '#32CD32' },
  { id: 'orange', name: '橙色', type: 'solid', value: '#FF8C00' },
  { id: 'purple', name: '紫色', type: 'solid', value: '#9370DB' },
  { id: 'red', name: '中国红', type: 'solid', value: '#DC143C' },
  // 渐变色
  { id: 'gradient-gold', name: '金色渐变', type: 'gradient', value: 'linear-gradient(90deg, #FFD700, #FFA500)' },
  { id: 'gradient-rainbow', name: '彩虹渐变', type: 'gradient', value: 'linear-gradient(90deg, #FF0000, #FF8C00, #FFD700, #32CD32, #00BFFF, #9370DB)' },
  { id: 'gradient-sunset', name: '日落渐变', type: 'gradient', value: 'linear-gradient(90deg, #FF6B6B, #FFE66D)' },
  { id: 'gradient-ocean', name: '海洋渐变', type: 'gradient', value: 'linear-gradient(90deg, #00C9FF, #92FE9D)' },
  { id: 'gradient-purple', name: '紫霞渐变', type: 'gradient', value: 'linear-gradient(90deg, #667eea, #764ba2)' },
  { id: 'gradient-fire', name: '火焰渐变', type: 'gradient', value: 'linear-gradient(90deg, #f12711, #f5af19)' },
]

export const OUTLINE_COLOR_PRESETS: ColorPreset[] = [
  { id: 'black', name: '黑色', type: 'solid', value: '#000000' },
  { id: 'dark-gray', name: '深灰', type: 'solid', value: '#333333' },
  { id: 'navy', name: '藏青', type: 'solid', value: '#000080' },
  { id: 'dark-red', name: '暗红', type: 'solid', value: '#8B0000' },
  { id: 'dark-purple', name: '暗紫', type: 'solid', value: '#4B0082' },
  { id: 'transparent', name: '无', type: 'solid', value: 'transparent' },
]

export const BACKGROUND_PRESETS: ColorPreset[] = [
  { id: 'transparent', name: '无背景', type: 'solid', value: 'transparent' },
  { id: 'black-60', name: '半透明黑', type: 'solid', value: 'rgba(0,0,0,0.6)' },
  { id: 'black-80', name: '深色背景', type: 'solid', value: 'rgba(0,0,0,0.8)' },
  { id: 'blur', name: '毛玻璃', type: 'solid', value: 'rgba(255,255,255,0.1)' },
  { id: 'white-20', name: '浅色背景', type: 'solid', value: 'rgba(255,255,255,0.2)' },
  { id: 'gradient-dark', name: '渐变背景', type: 'gradient', value: 'linear-gradient(90deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.8))' },
]

// ============================================
// 花字效果（装饰效果）
// ============================================

export interface DecorationEffect {
  id: string
  name: string
  description: string
  preview: string // 预览图或 emoji
  // CSS 样式
  textShadow?: string
  filter?: string
  backgroundClip?: string
  WebkitBackgroundClip?: string
  WebkitTextFillColor?: string
  border?: string
  borderRadius?: string
  padding?: string
  // 特殊效果标记
  hasGlow?: boolean
  has3D?: boolean
  hasStroke?: boolean
}

export const DECORATION_EFFECTS: DecorationEffect[] = [
  {
    id: 'none',
    name: '无效果',
    description: '清晰简洁的基础样式',
    preview: '✓',
  },
  {
    id: 'soft-glow',
    name: '柔光',
    description: '柔和的光晕效果，温馨氛围',
    preview: '🌟',
    textShadow: '0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.5), 0 0 24px rgba(255,255,255,0.3)',
    hasGlow: true,
  },
  {
    id: 'neon-glow',
    name: '霓虹灯',
    description: '赛博朋克霓虹效果',
    preview: '💜',
    textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff00de, 0 0 20px #ff00de, 0 0 35px #ff00de',
    hasGlow: true,
  },
  {
    id: 'pop-3d',
    name: '3D立体',
    description: '醒目的立体凸起效果',
    preview: '🎯',
    textShadow: '0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25)',
    has3D: true,
  },
  {
    id: 'retro-shadow',
    name: '复古阴影',
    description: '80年代复古风格',
    preview: '📺',
    textShadow: '3px 3px 0 #ff6b6b, 6px 6px 0 #4ecdc4',
    has3D: true,
  },
  {
    id: 'long-shadow',
    name: '长投影',
    description: '扁平化设计长阴影',
    preview: '📐',
    textShadow: '1px 1px rgba(0,0,0,0.1), 2px 2px rgba(0,0,0,0.1), 3px 3px rgba(0,0,0,0.1), 4px 4px rgba(0,0,0,0.1), 5px 5px rgba(0,0,0,0.1), 6px 6px rgba(0,0,0,0.1), 7px 7px rgba(0,0,0,0.1), 8px 8px rgba(0,0,0,0.1)',
  },
  {
    id: 'emboss',
    name: '浮雕质感',
    description: '凹凸浮雕立体感',
    preview: '🏛️',
    textShadow: '-1px -1px 1px rgba(255,255,255,0.3), 1px 1px 1px rgba(0,0,0,0.5)',
    has3D: true,
  },
  {
    id: 'fire-glow',
    name: '火焰光芒',
    description: '热烈燃烧的火焰效果',
    preview: '🔥',
    textShadow: '0 0 4px #fff, 0 0 11px #fff, 0 0 19px #fff, 0 0 40px #ff0000, 0 0 80px #ff0000, 0 0 90px #ff0000, 0 0 100px #ff0000',
    hasGlow: true,
  },
  {
    id: 'ice-crystal',
    name: '冰晶效果',
    description: '冰冷透亮的结晶感',
    preview: '❄️',
    textShadow: '0 0 3px #fff, 0 0 5px #00f7ff, 0 0 10px #00f7ff, 0 0 20px #00f7ff, 1px 1px 2px rgba(0,0,0,0.3)',
    hasGlow: true,
  },
  {
    id: 'golden-luxury',
    name: '奢华金',
    description: '高级质感的金色效果',
    preview: '👑',
    textShadow: '0 1px 0 #cda000, 0 2px 0 #b89500, 0 3px 0 #a38600, 1px 4px 3px rgba(0,0,0,0.4)',
    has3D: true,
  },
]

// ============================================
// 动画效果
// ============================================

export interface AnimationEffect {
  id: string
  name: string
  description: string
  preview: string
  // 入场动画
  enterAnimation?: string
  enterDuration?: number // ms
  // 出场动画
  exitAnimation?: string
  exitDuration?: number
  // 持续动画（循环）
  loopAnimation?: string
  loopDuration?: number
}

export const ANIMATION_EFFECTS: AnimationEffect[] = [
  {
    id: 'none',
    name: '无动画',
    description: '静态显示',
    preview: '⏸️',
  },
  {
    id: 'fade',
    name: '淡入淡出',
    description: '柔和的透明度变化',
    preview: '🌫️',
    enterAnimation: 'fadeIn',
    enterDuration: 300,
    exitAnimation: 'fadeOut',
    exitDuration: 300,
  },
  {
    id: 'slide-up',
    name: '向上滑入',
    description: '从下方滑入画面',
    preview: '⬆️',
    enterAnimation: 'slideInUp',
    enterDuration: 400,
    exitAnimation: 'slideOutUp',
    exitDuration: 300,
  },
  {
    id: 'slide-down',
    name: '向下滑入',
    description: '从上方滑入画面',
    preview: '⬇️',
    enterAnimation: 'slideInDown',
    enterDuration: 400,
    exitAnimation: 'slideOutDown',
    exitDuration: 300,
  },
  {
    id: 'zoom',
    name: '缩放',
    description: '由小变大出现',
    preview: '🔍',
    enterAnimation: 'zoomIn',
    enterDuration: 350,
    exitAnimation: 'zoomOut',
    exitDuration: 250,
  },
  {
    id: 'bounce',
    name: '弹跳',
    description: '活泼的弹跳效果',
    preview: '🏀',
    enterAnimation: 'bounceIn',
    enterDuration: 500,
    exitAnimation: 'bounceOut',
    exitDuration: 300,
  },
  {
    id: 'typewriter',
    name: '打字机',
    description: '逐字显示效果',
    preview: '⌨️',
    enterAnimation: 'typewriter',
    enterDuration: 1000,
  },
  {
    id: 'shake',
    name: '抖动',
    description: '强调性抖动效果',
    preview: '📳',
    enterAnimation: 'shakeIn',
    enterDuration: 500,
  },
  {
    id: 'pulse',
    name: '脉冲呼吸',
    description: '持续脉冲效果',
    preview: '💓',
    enterAnimation: 'fadeIn',
    enterDuration: 300,
    loopAnimation: 'pulse',
    loopDuration: 1500,
  },
  {
    id: 'swing',
    name: '摇摆',
    description: '左右摇摆效果',
    preview: '🎪',
    enterAnimation: 'swingIn',
    enterDuration: 600,
  },
  {
    id: 'flip',
    name: '翻转',
    description: '3D翻转出现',
    preview: '🔄',
    enterAnimation: 'flipIn',
    enterDuration: 500,
    exitAnimation: 'flipOut',
    exitDuration: 400,
  },
  {
    id: 'glitch',
    name: '故障风',
    description: '赛博朋克故障效果',
    preview: '📺',
    enterAnimation: 'glitchIn',
    enterDuration: 400,
    loopAnimation: 'glitch',
    loopDuration: 2000,
  },
]

// ============================================
// 完整的字幕样式接口
// ============================================

export interface EnhancedSubtitleStyle {
  // 基础属性
  fontSize: number
  fontFamily: string
  fontWeight: number
  letterSpacing: number // 字间距
  
  // 颜色
  color: string
  colorType: 'solid' | 'gradient'
  gradientColors?: string[] // 渐变色数组
  gradientAngle?: number // 渐变角度
  
  // 背景
  backgroundColor: string
  backgroundBlur?: number // 毛玻璃模糊度
  backgroundPadding?: { x: number; y: number }
  backgroundBorderRadius?: number
  
  // 描边
  hasOutline: boolean
  outlineColor: string
  outlineWidth: number
  
  // 阴影
  hasShadow: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  
  // 位置和对齐
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  marginBottom: number // 底部边距百分比
  marginTop: number // 顶部边距百分比
  
  // 花字效果
  decorationId: string
  
  // 动画效果
  animationId: string
}

// 默认样式
export const DEFAULT_SUBTITLE_STYLE: EnhancedSubtitleStyle = {
  fontSize: 64,
  fontFamily: 'Noto Sans SC',
  fontWeight: 500,
  letterSpacing: 2,
  
  color: '#FFFFFF',
  colorType: 'solid',
  
  backgroundColor: 'rgba(0,0,0,0.6)',
  backgroundPadding: { x: 16, y: 8 },
  backgroundBorderRadius: 8,
  
  hasOutline: false,
  outlineColor: '#000000',
  outlineWidth: 0,
  
  hasShadow: true,
  shadowColor: 'rgba(0,0,0,0.8)',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  
  position: 'bottom',
  alignment: 'center',
  marginBottom: 8,
  marginTop: 5,
  
  decorationId: 'none',
  animationId: 'fade',
}

// ============================================
// 样式预设模板
// ============================================

export interface StylePreset {
  id: string
  name: string
  description: string
  category: 'popular' | 'platform' | 'mood' | 'creative'
  preview: string // emoji 或缩略图
  style: Partial<EnhancedSubtitleStyle>
}

export const STYLE_PRESETS: StylePreset[] = [
  // ========== 热门平台风格 ==========
  {
    id: 'douyin-classic',
    name: '抖音经典',
    description: '醒目大字，短视频标配',
    category: 'platform',
    preview: '📱',
    style: {
      fontSize: 68,
      fontFamily: 'Noto Sans SC',
      fontWeight: 700,
      letterSpacing: 3,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      outlineColor: '#000000',
      outlineWidth: 2,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 10,
      decorationId: 'none',
      animationId: 'slide-up',
    },
  },
  {
    id: 'bilibili-standard',
    name: 'B站标准',
    description: '黑底白字，清晰百搭',
    category: 'platform',
    preview: '📺',
    style: {
      fontSize: 52,
      fontFamily: 'Noto Sans SC',
      fontWeight: 500,
      letterSpacing: 2,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'rgba(0,0,0,0.75)',
      backgroundPadding: { x: 14, y: 6 },
      backgroundBorderRadius: 4,
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 8,
      decorationId: 'none',
      animationId: 'fade',
    },
  },
  {
    id: 'xiaohongshu-cute',
    name: '小红书风',
    description: '圆角色块，清新可爱',
    category: 'platform',
    preview: '📕',
    style: {
      fontSize: 48,
      fontFamily: 'Noto Sans SC',
      fontWeight: 500,
      letterSpacing: 2,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'rgba(254,44,85,0.9)',
      backgroundPadding: { x: 16, y: 8 },
      backgroundBorderRadius: 20,
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 12,
      decorationId: 'none',
      animationId: 'zoom',
    },
  },
  {
    id: 'youtube-cc',
    name: 'YouTube CC',
    description: '国际字幕标准风格',
    category: 'platform',
    preview: '▶️',
    style: {
      fontSize: 46,
      fontFamily: 'Noto Sans SC',
      fontWeight: 400,
      letterSpacing: 1,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backgroundPadding: { x: 10, y: 4 },
      backgroundBorderRadius: 2,
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 5,
      decorationId: 'none',
      animationId: 'fade',
    },
  },
  // ========== 场景风格 ==========
  {
    id: 'movie-subtitle',
    name: '电影字幕',
    description: '经典影视剧字幕风格',
    category: 'mood',
    preview: '🎬',
    style: {
      fontSize: 44,
      fontFamily: 'Noto Sans SC',
      fontWeight: 400,
      letterSpacing: 3,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      outlineColor: '#000000',
      outlineWidth: 1,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowBlur: 3,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 5,
      decorationId: 'none',
      animationId: 'fade',
    },
  },
  {
    id: 'vlog-fresh',
    name: 'Vlog清新',
    description: '生活记录，温馨自然',
    category: 'mood',
    preview: '🌿',
    style: {
      fontSize: 48,
      fontFamily: 'LXGW WenKai',
      fontWeight: 400,
      letterSpacing: 2,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'rgba(76,175,80,0.85)',
      backgroundPadding: { x: 14, y: 6 },
      backgroundBorderRadius: 16,
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 10,
      decorationId: 'none',
      animationId: 'fade',
    },
  },
  {
    id: 'gaming-hype',
    name: '游戏热血',
    description: '电竞解说，激情澎湃',
    category: 'mood',
    preview: '🎮',
    style: {
      fontSize: 72,
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      letterSpacing: 4,
      color: '#FFD700',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      outlineColor: '#000000',
      outlineWidth: 3,
      hasShadow: true,
      shadowColor: 'rgba(255,100,0,0.6)',
      shadowBlur: 15,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      position: 'center',
      alignment: 'center',
      decorationId: 'fire-glow',
      animationId: 'shake',
    },
  },
  {
    id: 'romantic-soft',
    name: '浪漫温柔',
    description: '婚礼、情感、温馨场景',
    category: 'mood',
    preview: '💕',
    style: {
      fontSize: 50,
      fontFamily: 'LXGW WenKai',
      fontWeight: 400,
      letterSpacing: 3,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      hasShadow: true,
      shadowColor: 'rgba(255,182,193,0.5)',
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 12,
      decorationId: 'soft-glow',
      animationId: 'fade',
    },
  },
  {
    id: 'news-formal',
    name: '新闻播报',
    description: '正式严肃，信息传递',
    category: 'mood',
    preview: '📰',
    style: {
      fontSize: 44,
      fontFamily: 'Noto Sans SC',
      fontWeight: 500,
      letterSpacing: 2,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'rgba(0,51,102,0.9)',
      backgroundPadding: { x: 16, y: 6 },
      backgroundBorderRadius: 0,
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 5,
      decorationId: 'none',
      animationId: 'fade',
    },
  },
  // ========== 创意风格 ==========
  {
    id: 'neon-cyber',
    name: '霓虹赛博',
    description: '赛博朋克霓虹灯效果',
    category: 'creative',
    preview: '🌃',
    style: {
      fontSize: 64,
      fontFamily: 'Noto Sans SC',
      fontWeight: 700,
      letterSpacing: 4,
      color: '#ff00de',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 10,
      decorationId: 'neon-glow',
      animationId: 'pulse',
    },
  },
  {
    id: 'pop-cartoon',
    name: '卡通波普',
    description: '活力四射的漫画风格',
    category: 'creative',
    preview: '💥',
    style: {
      fontSize: 60,
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      letterSpacing: 2,
      color: '#FFFF00',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      outlineColor: '#000000',
      outlineWidth: 3,
      hasShadow: true,
      shadowColor: '#FF0000',
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      position: 'center',
      alignment: 'center',
      decorationId: 'retro-shadow',
      animationId: 'bounce',
    },
  },
  {
    id: 'retro-80s',
    name: '80年代复古',
    description: 'VHS录像带怀旧感',
    category: 'creative',
    preview: '📼',
    style: {
      fontSize: 56,
      fontFamily: 'Noto Sans SC',
      fontWeight: 700,
      letterSpacing: 4,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      outlineColor: '#000000',
      outlineWidth: 2,
      hasShadow: true,
      shadowColor: '#00ffff',
      shadowBlur: 0,
      shadowOffsetX: 3,
      shadowOffsetY: 0,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 8,
      decorationId: 'retro-shadow',
      animationId: 'glitch',
    },
  },
  {
    id: 'minimal-clean',
    name: '极简清爽',
    description: '简约现代，高级质感',
    category: 'creative',
    preview: '✨',
    style: {
      fontSize: 44,
      fontFamily: 'Noto Sans SC',
      fontWeight: 300,
      letterSpacing: 4,
      color: '#FFFFFF',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 3,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 8,
      decorationId: 'none',
      animationId: 'fade',
    },
  },
  {
    id: 'golden-luxury',
    name: '奢华金字',
    description: '华丽金色，高端大气',
    category: 'creative',
    preview: '👑',
    style: {
      fontSize: 60,
      fontFamily: 'Noto Serif SC',
      fontWeight: 700,
      letterSpacing: 3,
      color: '#FFD700',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      outlineColor: '#8B4513',
      outlineWidth: 2,
      hasShadow: true,
      shadowColor: 'rgba(139,69,19,0.5)',
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 10,
      decorationId: 'golden-luxury',
      animationId: 'zoom',
    },
  },
  {
    id: 'ice-cool',
    name: '冰酷效果',
    description: '冰冷透亮，科技感',
    category: 'creative',
    preview: '❄️',
    style: {
      fontSize: 58,
      fontFamily: 'Noto Sans SC',
      fontWeight: 600,
      letterSpacing: 3,
      color: '#00f7ff',
      colorType: 'solid',
      backgroundColor: 'transparent',
      hasOutline: false,
      hasShadow: false,
      position: 'bottom',
      alignment: 'center',
      marginBottom: 10,
      decorationId: 'ice-crystal',
      animationId: 'fade',
    },
  },
]

// ============================================
// 工具函数
// ============================================

/**
 * 将 EnhancedSubtitleStyle 转换为 CSS 样式对象
 */
export function styleToCSS(style: EnhancedSubtitleStyle, scale: number = 1): React.CSSProperties {
  const css: React.CSSProperties = {
    fontSize: `${Math.round(style.fontSize * scale)}px`,
    fontFamily: `"${style.fontFamily}", "Noto Sans SC", sans-serif`,
    fontWeight: style.fontWeight,
    letterSpacing: `${style.letterSpacing * scale}px`,
    lineHeight: 1.4,
  }

  // 文字颜色/渐变
  if (style.colorType === 'gradient' && style.gradientColors && style.gradientColors.length >= 2) {
    const angle = style.gradientAngle ?? 90
    css.background = `linear-gradient(${angle}deg, ${style.gradientColors.join(', ')})`
    css.WebkitBackgroundClip = 'text'
    css.WebkitTextFillColor = 'transparent'
    css.backgroundClip = 'text'
  } else {
    css.color = style.color
  }

  // 背景
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    css.backgroundColor = style.backgroundColor
    if (style.backgroundPadding) {
      css.padding = `${style.backgroundPadding.y * scale}px ${style.backgroundPadding.x * scale}px`
    }
    if (style.backgroundBorderRadius) {
      css.borderRadius = `${style.backgroundBorderRadius * scale}px`
    }
    if (style.backgroundBlur) {
      css.backdropFilter = `blur(${style.backgroundBlur}px)`
    }
  }

  // 描边和阴影
  const shadows: string[] = []
  
  if (style.hasOutline && style.outlineWidth > 0) {
    const ow = style.outlineWidth * scale
    const oc = style.outlineColor
    // 使用 8 方向描边
    shadows.push(
      `${-ow}px ${-ow}px 0 ${oc}`,
      `${ow}px ${-ow}px 0 ${oc}`,
      `${-ow}px ${ow}px 0 ${oc}`,
      `${ow}px ${ow}px 0 ${oc}`,
      `0 ${-ow}px 0 ${oc}`,
      `0 ${ow}px 0 ${oc}`,
      `${-ow}px 0 0 ${oc}`,
      `${ow}px 0 0 ${oc}`
    )
  }

  if (style.hasShadow) {
    shadows.push(
      `${style.shadowOffsetX * scale}px ${style.shadowOffsetY * scale}px ${style.shadowBlur * scale}px ${style.shadowColor}`
    )
  }

  // 应用花字效果的阴影
  const decoration = DECORATION_EFFECTS.find(d => d.id === style.decorationId)
  if (decoration?.textShadow) {
    shadows.push(decoration.textShadow)
  }

  if (shadows.length > 0) {
    css.textShadow = shadows.join(', ')
  }

  // 花字效果的其他样式
  if (decoration?.border) css.border = decoration.border
  if (decoration?.borderRadius) css.borderRadius = decoration.borderRadius
  if (decoration?.padding) css.padding = decoration.padding
  if (decoration?.filter) css.filter = decoration.filter

  return css
}

/**
 * 获取动画类名
 */
export function getAnimationClass(animationId: string, phase: 'enter' | 'exit' | 'loop'): string {
  const animation = ANIMATION_EFFECTS.find(a => a.id === animationId)
  if (!animation) return ''
  
  switch (phase) {
    case 'enter':
      return animation.enterAnimation || ''
    case 'exit':
      return animation.exitAnimation || ''
    case 'loop':
      return animation.loopAnimation || ''
    default:
      return ''
  }
}

/**
 * 获取动画时长
 */
export function getAnimationDuration(animationId: string, phase: 'enter' | 'exit' | 'loop'): number {
  const animation = ANIMATION_EFFECTS.find(a => a.id === animationId)
  if (!animation) return 300
  
  switch (phase) {
    case 'enter':
      return animation.enterDuration || 300
    case 'exit':
      return animation.exitDuration || 300
    case 'loop':
      return animation.loopDuration || 1000
    default:
      return 300
  }
}

/**
 * 合并样式（用于应用预设）
 */
export function mergeStyles(
  base: EnhancedSubtitleStyle,
  preset: Partial<EnhancedSubtitleStyle>
): EnhancedSubtitleStyle {
  return { ...base, ...preset }
}

/**
 * 将旧版 SubtitleStyle 转换为 EnhancedSubtitleStyle
 */
export function upgradeStyle(oldStyle: {
  fontSize: number
  color: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  hasOutline: boolean
}): EnhancedSubtitleStyle {
  return {
    ...DEFAULT_SUBTITLE_STYLE,
    fontSize: oldStyle.fontSize,
    color: oldStyle.color,
    backgroundColor: oldStyle.backgroundColor,
    position: oldStyle.position,
    alignment: oldStyle.alignment,
    hasOutline: oldStyle.hasOutline,
  }
}

