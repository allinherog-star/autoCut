/**
 * 统一图标配置
 * 使用 lucide-react 图标库，保持全局一致的图标风格
 * 参考 Icons8 的简洁线性风格
 */

import {
  // 平台图标
  Smartphone,
  Tv2,
  BookOpen,
  Video,
  MessageCircle,
  
  // 行业图标
  UtensilsCrossed,
  Plane,
  GraduationCap,
  Laptop,
  Sparkles,
  Shirt,
  Dumbbell,
  Music,
  Drama,
  Gamepad2,
  Home,
  Briefcase,
  Heart,
  Cat,
  Baby,
  Car,
  Sofa,
  Wheat,
  Clapperboard,
  Laugh,
  
  // 场景/时机图标
  Anchor,
  ArrowLeftRight,
  Flame,
  Flag,
  Sunrise,
  Package,
  UserCircle,
  Lightbulb,
  Theater,
  AudioLines,
  Layers,
  
  // 情绪图标
  Smile,
  HeartHandshake,
  Leaf,
  TrendingUp,
  AlertCircle,
  Zap,
  Users,
  RefreshCw,
  HeartPulse,
  Glasses,
  
  // 通用图标
  type LucideIcon,
} from 'lucide-react'

// ============================================
// 类型定义
// ============================================

export interface TagIconConfig {
  icon: LucideIcon
  color: string  // Tailwind text color class
}

// ============================================
// 平台图标映射（含颜色）
// ============================================

export const PLATFORM_ICONS: Record<string, TagIconConfig> = {
  '抖音': { icon: Smartphone, color: 'text-slate-100' },
  'B站': { icon: Tv2, color: 'text-pink-400' },
  '小红书': { icon: BookOpen, color: 'text-red-400' },
  '快手': { icon: Video, color: 'text-orange-400' },
  '视频号': { icon: MessageCircle, color: 'text-emerald-400' },
}

// ============================================
// 视频类型图标映射（与上传页面 VIDEO_TYPES 保持一致）
// ============================================

export const INDUSTRY_ICONS: Record<string, TagIconConfig> = {
  // 日常记录类
  'Vlog': { icon: Video, color: 'text-sky-400' },
  '旅游旅拍': { icon: Plane, color: 'text-cyan-400' },
  '生活小妙招': { icon: Lightbulb, color: 'text-yellow-400' },
  
  // 探店体验类
  '美食探店': { icon: UtensilsCrossed, color: 'text-orange-400' },
  '睡寝探店': { icon: Home, color: 'text-violet-400' },
  
  // 时尚生活类
  '时尚穿搭': { icon: Shirt, color: 'text-pink-400' },
  '健身减脂': { icon: Dumbbell, color: 'text-emerald-400' },
  
  // 知识教程类
  '课程教程': { icon: GraduationCap, color: 'text-blue-400' },
  '知识科普': { icon: Lightbulb, color: 'text-purple-400' },
  '职场攻略': { icon: Briefcase, color: 'text-slate-400' },
  '效率工具': { icon: Zap, color: 'text-amber-400' },
  
  // 种草带货类
  '安利种草': { icon: Leaf, color: 'text-green-400' },
  '评测对比': { icon: Laptop, color: 'text-indigo-400' },
  '优惠带货': { icon: Package, color: 'text-orange-500' },
  
  // 娱乐内容类
  '影视解说': { icon: Clapperboard, color: 'text-red-500' },
  '游戏': { icon: Gamepad2, color: 'text-violet-400' },
  '直播切片': { icon: Video, color: 'text-pink-500' },
  '情感咨询': { icon: Heart, color: 'text-rose-400' },
}

// ============================================
// 时机图标映射（视频中使用的时机节点）
// ============================================

export const SCENE_ICONS: Record<string, TagIconConfig> = {
  '开头3秒': { icon: Anchor, color: 'text-red-500' },
  '步骤牵引': { icon: ArrowLeftRight, color: 'text-blue-400' },
  '转场过渡': { icon: Layers, color: 'text-purple-400' },
  '三连结尾': { icon: Flag, color: 'text-emerald-400' },
}

// ============================================
// 表现力图标映射（内容表现手法或风格特征）
// ============================================

export const STYLE_ICONS: Record<string, TagIconConfig> = {
  '沙雕': { icon: Laugh, color: 'text-yellow-400' },
  '戏精': { icon: Theater, color: 'text-purple-400' },
  '逗比欢乐多': { icon: Smile, color: 'text-orange-400' },
  '接地气': { icon: Home, color: 'text-yellow-700' },
  '又穷又开心': { icon: Smile, color: 'text-lime-400' },
  '呆萌可爱': { icon: HeartPulse, color: 'text-pink-400' },
  '反转再反转': { icon: RefreshCw, color: 'text-pink-500' },
  '社畜归来': { icon: Briefcase, color: 'text-slate-400' },
  '躺平EMO': { icon: Users, color: 'text-gray-400' },
  '心灵鸡汤': { icon: Lightbulb, color: 'text-yellow-400' },
  '治愈小伤口': { icon: Leaf, color: 'text-emerald-400' },
  '上头魔性': { icon: Zap, color: 'text-fuchsia-400' },
  '震撼超燃': { icon: Flame, color: 'text-red-500' },
  '硬核解说': { icon: GraduationCap, color: 'text-indigo-400' },
  '振奋励志': { icon: TrendingUp, color: 'text-amber-400' },
  '另类潮流': { icon: Sparkles, color: 'text-violet-400' },
  '怀旧复古': { icon: Music, color: 'text-yellow-700' },
  '脑洞科幻': { icon: Zap, color: 'text-cyan-400' },
  '炫酷不翻车': { icon: Glasses, color: 'text-green-400' },
}

// ============================================
// 情绪标签图标映射（表达情感和心理状态）
// ============================================

export const EMOTION_ICONS: Record<string, TagIconConfig> = {
  '笑了': { icon: Laugh, color: 'text-yellow-400' },
  '好奇': { icon: AlertCircle, color: 'text-sky-400' },
  '感动': { icon: HeartHandshake, color: 'text-red-400' },
  '失落': { icon: Users, color: 'text-gray-400' },
  '心疼': { icon: HeartPulse, color: 'text-pink-500' },
  '紧张': { icon: AlertCircle, color: 'text-purple-400' },
  '兴奋': { icon: Flame, color: 'text-orange-500' },
  '期待': { icon: Sparkles, color: 'text-amber-400' },
  '有点东西': { icon: Lightbulb, color: 'text-lime-400' },
  '破防': { icon: Heart, color: 'text-red-500' },
  '爱了': { icon: Heart, color: 'text-pink-500' },
  '震撼': { icon: Zap, color: 'text-violet-500' },
  '惊讶': { icon: AlertCircle, color: 'text-cyan-400' },
  '愤怒': { icon: Flame, color: 'text-red-600' },
  '开心': { icon: Smile, color: 'text-emerald-400' },
}

// ============================================
// 维度图标映射
// ============================================

export const DIMENSION_ICONS: Record<string, LucideIcon> = {
  PLATFORM: Smartphone,
  INDUSTRY: Video,
  SCENE: Clapperboard,
  STYLE: Sparkles,
  EMOTION: Heart,
  TEMPO: AudioLines,
  MOOD: Sunrise,
}

// ============================================
// 获取标签图标配置的工具函数
// ============================================

export function getTagIconConfig(dimension: string, tagName: string): TagIconConfig | null {
  switch (dimension) {
    case 'PLATFORM':
      return PLATFORM_ICONS[tagName] || null
    case 'INDUSTRY':
      return INDUSTRY_ICONS[tagName] || null
    case 'SCENE':
      return SCENE_ICONS[tagName] || null
    case 'STYLE':
      return STYLE_ICONS[tagName] || null
    case 'EMOTION':
      return EMOTION_ICONS[tagName] || null
    default:
      return null
  }
}

// 向后兼容的函数
export function getTagIcon(dimension: string, tagName: string): LucideIcon | null {
  const config = getTagIconConfig(dimension, tagName)
  return config?.icon || null
}

// ============================================
// 图标颜色配置
// ============================================

export const DIMENSION_COLORS: Record<string, { text: string; bg: string }> = {
  PLATFORM: { text: 'text-blue-400', bg: 'bg-blue-400/15' },
  INDUSTRY: { text: 'text-emerald-400', bg: 'bg-emerald-400/15' },
  SCENE: { text: 'text-purple-400', bg: 'bg-purple-400/15' },
  STYLE: { text: 'text-amber-400', bg: 'bg-amber-400/15' },
  EMOTION: { text: 'text-rose-400', bg: 'bg-rose-400/15' },
}
