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
  
  // 场景图标
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
// 行业图标映射（含颜色）
// ============================================

export const INDUSTRY_ICONS: Record<string, TagIconConfig> = {
  '美食': { icon: UtensilsCrossed, color: 'text-orange-400' },
  '旅游': { icon: Plane, color: 'text-cyan-400' },
  '知识': { icon: GraduationCap, color: 'text-blue-400' },
  '科技': { icon: Laptop, color: 'text-indigo-400' },
  '美妆': { icon: Sparkles, color: 'text-pink-400' },
  '穿搭': { icon: Shirt, color: 'text-rose-400' },
  '健身': { icon: Dumbbell, color: 'text-emerald-400' },
  '音乐': { icon: Music, color: 'text-purple-400' },
  '舞蹈': { icon: Drama, color: 'text-fuchsia-400' },
  '游戏': { icon: Gamepad2, color: 'text-violet-400' },
  '生活': { icon: Home, color: 'text-lime-400' },
  '职场': { icon: Briefcase, color: 'text-slate-400' },
  '情感': { icon: Heart, color: 'text-red-400' },
  '宠物': { icon: Cat, color: 'text-amber-400' },
  '母婴': { icon: Baby, color: 'text-pink-300' },
  '汽车': { icon: Car, color: 'text-zinc-400' },
  '家居': { icon: Sofa, color: 'text-yellow-700' },
  '三农': { icon: Wheat, color: 'text-yellow-500' },
  '剧情': { icon: Clapperboard, color: 'text-red-500' },
  '搞笑': { icon: Laugh, color: 'text-yellow-400' },
}

// ============================================
// 场景图标映射（含颜色）
// ============================================

export const SCENE_ICONS: Record<string, TagIconConfig> = {
  '开头Hook': { icon: Anchor, color: 'text-red-500' },
  '转场过渡': { icon: ArrowLeftRight, color: 'text-purple-400' },
  '高潮爆点': { icon: Flame, color: 'text-orange-500' },
  '结尾收尾': { icon: Flag, color: 'text-emerald-400' },
  '背景氛围': { icon: Sunrise, color: 'text-sky-400' },
  '产品展示': { icon: Package, color: 'text-amber-500' },
  '人物出场': { icon: UserCircle, color: 'text-pink-400' },
  '知识讲解': { icon: Lightbulb, color: 'text-yellow-400' },
  '情绪渲染': { icon: Theater, color: 'text-violet-400' },
  '节奏卡点': { icon: AudioLines, color: 'text-cyan-400' },
}

// ============================================
// 情绪图标映射（含颜色）
// ============================================

export const EMOTION_ICONS: Record<string, TagIconConfig> = {
  '开心': { icon: Smile, color: 'text-yellow-400' },
  '感动': { icon: HeartHandshake, color: 'text-red-400' },
  '治愈': { icon: Leaf, color: 'text-emerald-400' },
  '励志': { icon: TrendingUp, color: 'text-blue-400' },
  '紧张': { icon: AlertCircle, color: 'text-purple-400' },
  '震撼': { icon: Zap, color: 'text-red-500' },
  '共鸣': { icon: Users, color: 'text-sky-400' },
  '反转': { icon: RefreshCw, color: 'text-orange-400' },
  '可爱': { icon: HeartPulse, color: 'text-pink-400' },
  '酷炫': { icon: Glasses, color: 'text-slate-300' },
}

// ============================================
// 维度图标映射
// ============================================

export const DIMENSION_ICONS: Record<string, LucideIcon> = {
  PLATFORM: Smartphone,
  INDUSTRY: Briefcase,
  SCENE: Clapperboard,
  EMOTION: Heart,
  STYLE: Sparkles,
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
  EMOTION: { text: 'text-rose-400', bg: 'bg-rose-400/15' },
}
