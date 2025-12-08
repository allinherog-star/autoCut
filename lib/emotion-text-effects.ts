/**
 * 情绪文字特效系统
 * 
 * 灵感来源："一见你就笑"综艺节目的花字效果
 * 特点：随机可爱布局、活泼动画、多彩配色、情绪增强
 */

// ============================================
// 类型定义
// ============================================

export type EmotionType = 'happy' | 'excited' | 'surprised' | 'love' | 'angry' | 'sad' | 'scared' | 'confused' | 'cool' | 'funny'

export interface EmotionTextStyle {
  id: string
  name: string
  emotion: EmotionType
  description: string
  // 布局配置
  layout: {
    randomRotation: { min: number; max: number }  // 随机旋转范围（度）
    randomOffset: { x: number; y: number }         // 随机位置偏移（像素）
    randomScale: { min: number; max: number }      // 随机缩放范围
    stagger: boolean                               // 是否逐字错开
    staggerDelay: number                           // 错开延迟（毫秒）
  }
  // 文字样式
  text: {
    fontFamily: string
    fontWeight: number
    fontSize: number
    color: string
    gradient?: string
    stroke?: { color: string; width: number }
    shadow?: string
  }
  // 装饰元素
  decoration?: {
    type: 'emoji' | 'shape' | 'particle' | 'sparkle' | 'bubble'
    items: string[]
    position: 'around' | 'above' | 'below' | 'random'
    animated: boolean
  }
  // 动画配置
  animation: {
    enter: string      // 入场动画名称
    loop?: string      // 循环动画名称
    exit?: string      // 出场动画名称
    duration: number   // 动画时长（毫秒）
  }
}

// ============================================
// 情绪配色方案
// ============================================

export const EMOTION_COLORS: Record<EmotionType, { primary: string; secondary: string; accent: string; gradient: string }> = {
  happy: {
    primary: '#FFD93D',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
  },
  excited: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#FFE66D',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFE66D 100%)',
  },
  surprised: {
    primary: '#9B5DE5',
    secondary: '#F15BB5',
    accent: '#00F5D4',
    gradient: 'linear-gradient(135deg, #9B5DE5 0%, #F15BB5 100%)',
  },
  love: {
    primary: '#FF69B4',
    secondary: '#FF1493',
    accent: '#FFB6C1',
    gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 50%, #DC143C 100%)',
  },
  angry: {
    primary: '#FF4757',
    secondary: '#FF3838',
    accent: '#FF6348',
    gradient: 'linear-gradient(135deg, #FF4757 0%, #FF0000 100%)',
  },
  sad: {
    primary: '#74B9FF',
    secondary: '#0984E3',
    accent: '#A8D8EA',
    gradient: 'linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)',
  },
  scared: {
    primary: '#636E72',
    secondary: '#2D3436',
    accent: '#B2BEC3',
    gradient: 'linear-gradient(135deg, #636E72 0%, #2D3436 100%)',
  },
  confused: {
    primary: '#FDCB6E',
    secondary: '#F39C12',
    accent: '#E17055',
    gradient: 'linear-gradient(135deg, #FDCB6E 0%, #E17055 100%)',
  },
  cool: {
    primary: '#00CEC9',
    secondary: '#0984E3',
    accent: '#6C5CE7',
    gradient: 'linear-gradient(135deg, #00CEC9 0%, #0984E3 50%, #6C5CE7 100%)',
  },
  funny: {
    primary: '#A29BFE',
    secondary: '#FD79A8',
    accent: '#FFEAA7',
    gradient: 'linear-gradient(135deg, #A29BFE 0%, #FD79A8 50%, #FFEAA7 100%)',
  },
}

// ============================================
// 装饰元素配置
// ============================================

export const DECORATION_EMOJIS: Record<EmotionType, string[]> = {
  happy: ['😄', '😊', '🎉', '✨', '🌟', '💫', '🎈', '🌈'],
  excited: ['🔥', '⚡', '💥', '🚀', '🎯', '💪', '🌋', '☄️'],
  surprised: ['😮', '😲', '❗', '❓', '💡', '🤯', '😱', '🙀'],
  love: ['❤️', '💕', '💖', '💗', '💓', '💞', '💘', '🥰'],
  angry: ['😤', '💢', '🔥', '👊', '💣', '⚡', '😡', '🤬'],
  sad: ['😢', '😭', '💧', '🥺', '😿', '💔', '🌧️', '☔'],
  scared: ['😨', '😰', '😱', '👻', '💀', '🙈', '😵', '🫣'],
  confused: ['🤔', '❓', '❔', '🧐', '😕', '🤷', '💭', '🌀'],
  cool: ['😎', '🕶️', '💎', '🌊', '🧊', '❄️', '💠', '🔷'],
  funny: ['🤣', '😂', '🤪', '😜', '🎭', '🃏', '🎪', '🤡'],
}

// ============================================
// 预设样式库 - 专业级情绪特效
// ============================================

export const EMOTION_TEXT_PRESETS: EmotionTextStyle[] = [
  // ============================================
  // 💥 史诗级冲击系列 - 最震撼最炸裂
  // ============================================
  {
    id: 'hammer-smash',
    name: '🔨 锤爆碎屏',
    emotion: 'excited',
    description: '重锤从天而降砸裂屏幕！蜘蛛网裂纹+碎片飞溅+震颤余波',
    layout: {
      randomRotation: { min: -3, max: 3 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.05 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 100,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FF4444 30%, #CC0000 60%, #880000 100%)',
      stroke: { color: '#000000', width: 10 },
      shadow: '0 0 60px #FF0000, 0 0 120px rgba(255,0,0,0.8), 10px 10px 0 #000, -5px -5px 0 #FF4444, 0 0 200px rgba(255,0,0,0.5)',
    },
    decoration: {
      type: 'particle',
      items: ['💥', '🔨', '⚡', '💢', '🔥', '✨'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'hammer-smash-in',
      loop: 'crack-shake',
      duration: 400,
    },
  },
  {
    id: 'epic-impact',
    name: '💀 毁天灭地',
    emotion: 'excited',
    description: '末日级冲击波，天崩地裂的震撼效果',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 3, y: 3 },
      randomScale: { min: 1, max: 1.1 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 96,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFD700 20%, #FF6600 50%, #FF0000 80%, #660000 100%)',
      stroke: { color: '#000000', width: 8 },
      shadow: '0 0 80px #FF6600, 0 0 150px rgba(255,102,0,0.7), 8px 8px 0 #000, 0 0 250px rgba(255,0,0,0.4)',
    },
    decoration: {
      type: 'particle',
      items: ['💀', '☠️', '💥', '🔥', '⚡', '💢'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'hammer-smash-in',
      loop: 'crack-shake',
      duration: 350,
    },
  },

  // ============================================
  // 🔥 综艺爆款系列 - 最高能最吸睛
  // ============================================
  {
    id: 'variety-boom',
    name: '🔥 综艺炸裂',
    emotion: 'excited',
    description: '综艺节目经典效果，超强冲击力+爆炸集中线',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.1 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 88,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFE500 25%, #FF6B00 60%, #FF0000 100%)',
      stroke: { color: '#000000', width: 8 },
      shadow: '0 0 50px #FF6B00, 0 0 100px rgba(255,107,0,0.7), 8px 8px 0 #000, -4px -4px 0 #FF0000, 0 0 150px rgba(255,0,0,0.4)',
    },
    decoration: {
      type: 'particle',
      items: ['💥', '⚡', '🔥', '✨', '💢'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'variety-boom-in',
      loop: 'intense-shake',
      duration: 300,
    },
  },
  {
    id: 'variety-highlight',
    name: '⭐ 综艺高光',
    emotion: 'excited',
    description: '金色闪耀登场+星光场背景',
    layout: {
      randomRotation: { min: -2, max: 2 },
      randomOffset: { x: 1, y: 1 },
      randomScale: { min: 1, max: 1.08 },
      stagger: true,
      staggerDelay: 20,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 80,
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFFDE7 0%, #FFD700 25%, #FFA000 55%, #FF6F00 85%, #E65100 100%)',
      stroke: { color: '#5D4037', width: 6 },
      shadow: '0 0 40px #FFD700, 0 0 80px rgba(255,215,0,0.9), 6px 6px 0 #3E2723, 0 0 120px #FFD700, 0 0 200px rgba(255,215,0,0.4)',
    },
    decoration: {
      type: 'sparkle',
      items: ['⭐', '✨', '💫', '🌟', '👑', '🏆'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'golden-flash-in',
      loop: 'golden-glow',
      duration: 400,
    },
  },
  {
    id: 'variety-super',
    name: '🚀 超级加倍',
    emotion: 'excited',
    description: '夸张放大+冲击波背景，气势磅礴',
    layout: {
      randomRotation: { min: -4, max: 4 },
      randomOffset: { x: 3, y: 2 },
      randomScale: { min: 1.02, max: 1.15 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 96,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FF1744 20%, #D500F9 50%, #651FFF 80%, #304FFE 100%)',
      stroke: { color: '#000000', width: 8 },
      shadow: '0 0 60px #D500F9, 10px 10px 0 rgba(0,0,0,0.9), -5px -5px 0 #FF1744, 0 0 120px rgba(213,0,249,0.6), 0 0 200px rgba(101,31,255,0.4)',
    },
    decoration: {
      type: 'particle',
      items: ['🚀', '💎', '🔥', '💥', '⚡', '🌟'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'super-scale-in',
      loop: 'power-pulse',
      duration: 280,
    },
  },
  {
    id: 'variety-wow',
    name: '😱 震惊反转',
    emotion: 'surprised',
    description: '惊天大反转，剧情高能',
    layout: {
      randomRotation: { min: -12, max: 12 },
      randomOffset: { x: 6, y: 6 },
      randomScale: { min: 0.9, max: 1.2 },
      stagger: true,
      staggerDelay: 20,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 76,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #E040FB 0%, #7C4DFF 50%, #00E5FF 100%)',
      stroke: { color: '#000000', width: 5 },
      shadow: '0 0 40px #7C4DFF, 5px 5px 0 #000, -3px -3px 20px #E040FB',
    },
    decoration: {
      type: 'emoji',
      items: ['😱', '❗', '⁉️', '🤯'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'shock-wave-in',
      loop: 'dramatic-shake',
      duration: 400,
    },
  },
  {
    id: 'variety-awkward',
    name: '😅 社死现场',
    emotion: 'funny',
    description: '尴尬场面，笑中带泪',
    layout: {
      randomRotation: { min: -15, max: 15 },
      randomOffset: { x: 5, y: 8 },
      randomScale: { min: 0.9, max: 1.1 },
      stagger: true,
      staggerDelay: 60,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 60,
      color: '#81D4FA',
      stroke: { color: '#1565C0', width: 4 },
      shadow: '3px 3px 0 #1565C0, 6px 6px 0 #0D47A1, 0 0 20px rgba(129,212,250,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😅', '💧', '🫠', '😰'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'awkward-slide-in',
      loop: 'nervous-shake',
      duration: 600,
    },
  },

  // ============================================
  // ❤️ 心动名场面系列 - 心形爆发背景
  // ============================================
  {
    id: 'love-explosion',
    name: '💕 心动爆发',
    emotion: 'love',
    description: '心动瞬间+心形爆发背景+粉色光晕',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 0.98, max: 1.08 },
      stagger: true,
      staggerDelay: 45,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 700,
      fontSize: 72,
      color: '#FF4081',
      gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FF80AB 20%, #FF4081 45%, #F50057 70%, #C51162 100%)',
      stroke: { color: '#FFFFFF', width: 4 },
      shadow: '0 0 50px #FF4081, 0 0 100px rgba(255,64,129,0.7), 4px 4px 0 rgba(255,255,255,0.8), 0 0 150px rgba(245,0,87,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['💕', '💖', '💗', '💓', '💘', '💝', '🥰', '😍'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'heart-explosion-in',
      loop: 'heartbeat-glow',
      duration: 450,
    },
  },
  {
    id: 'love-sweet',
    name: '🍬 甜蜜暴击',
    emotion: 'love',
    description: '甜到齁，恋爱的味道',
    layout: {
      randomRotation: { min: -10, max: 10 },
      randomOffset: { x: 4, y: 5 },
      randomScale: { min: 0.9, max: 1.15 },
      stagger: true,
      staggerDelay: 70,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 58,
      color: '#FFB7C5',
      gradient: 'linear-gradient(180deg, #FFEEFF 0%, #FFB7C5 40%, #FF69B4 100%)',
      stroke: { color: '#FF1493', width: 3 },
      shadow: '0 0 25px #FF69B4, 4px 4px 0 #FF1493, 0 0 50px rgba(255,105,180,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['🍬', '🍭', '🧁', '🍰', '💕'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'sweet-pop-in',
      loop: 'sweet-float',
      duration: 600,
    },
  },

  // ============================================
  // 🎬 漫画风格系列 - 漫画对话框背景
  // ============================================
  {
    id: 'comic-action',
    name: '⚡ 动作线',
    emotion: 'excited',
    description: '速度感十足+速度线背景效果',
    layout: {
      randomRotation: { min: -4, max: 4 },
      randomOffset: { x: 2, y: 1 },
      randomScale: { min: 1, max: 1.12 },
      stagger: true,
      staggerDelay: 15,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 76,
      color: '#FFFFFF',
      stroke: { color: '#FF5722', width: 6 },
      shadow: '-40px 0 20px rgba(255,87,34,0.5), 6px 6px 0 #000, 0 0 40px rgba(255,87,34,0.4)',
    },
    decoration: {
      type: 'particle',
      items: ['⚡', '💨', '✨', '🏃'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'punch-impact-in',
      loop: 'impact-shake',
      duration: 280,
    },
  },
  {
    id: 'comic-punch',
    name: '👊 重拳出击',
    emotion: 'angry',
    description: '力量打击+速度线背景+火焰光环',
    layout: {
      randomRotation: { min: -8, max: 8 },
      randomOffset: { x: 4, y: 3 },
      randomScale: { min: 1, max: 1.18 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 88,
      color: '#FF1744',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFCDD2 15%, #FF1744 40%, #D50000 75%, #B71C1C 100%)',
      stroke: { color: '#000000', width: 8 },
      shadow: '0 0 50px #FF1744, 8px 8px 0 #000, 0 0 100px rgba(255,23,68,0.6), -4px -4px 0 #D50000',
    },
    decoration: {
      type: 'particle',
      items: ['👊', '💢', '💥', '🔥', '⚡', '💪'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'punch-impact-in',
      loop: 'impact-shake',
      duration: 300,
    },
  },

  // ============================================
  // ✨ 闪耀特效系列 - 星光场背景
  // ============================================
  {
    id: 'sparkle-magic',
    name: '✨ 魔法闪耀',
    emotion: 'happy',
    description: '梦幻闪光+星光场背景+紫色光晕',
    layout: {
      randomRotation: { min: -4, max: 4 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 0.96, max: 1.08 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 700,
      fontSize: 68,
      color: '#E1BEE7',
      gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 20%, #CE93D8 40%, #BA68C8 65%, #9C27B0 90%, #7B1FA2 100%)',
      shadow: '0 0 30px #E1BEE7, 0 0 60px #CE93D8, 0 0 90px #BA68C8, 0 0 120px rgba(156,39,176,0.5), 3px 3px 0 #7B1FA2',
    },
    decoration: {
      type: 'sparkle',
      items: ['✨', '💫', '⭐', '🌟', '💜', '🔮', '🦋'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'golden-flash-in',
      loop: 'golden-glow',
      duration: 600,
    },
  },
  {
    id: 'sparkle-rainbow',
    name: '🌈 彩虹闪耀',
    emotion: 'happy',
    description: '七彩梦幻+彩虹爆发背景',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 3 },
      randomScale: { min: 0.94, max: 1.1 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 72,
      color: '#FFFFFF',
      gradient: 'linear-gradient(90deg, #FF0000 0%, #FF7F00 16%, #FFFF00 33%, #00FF00 50%, #0000FF 66%, #4B0082 83%, #9400D3 100%)',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '0 0 25px rgba(255,255,255,0.9), 4px 4px 0 rgba(0,0,0,0.4), 0 0 50px rgba(255,0,0,0.3), 0 0 50px rgba(0,255,0,0.3), 0 0 50px rgba(0,0,255,0.3)',
    },
    decoration: {
      type: 'sparkle',
      items: ['🌈', '⭐', '✨', '🎨', '🦄', '🍭'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'bouncy-pop',
      loop: 'happy-wiggle',
      duration: 550,
    },
  },

  // ========== 🎭 戏剧效果系列 ==========
  {
    id: 'drama-reveal',
    name: '🎭 戏剧揭晓',
    emotion: 'surprised',
    description: '悬念揭晓的戏剧效果',
    layout: {
      randomRotation: { min: -3, max: 3 },
      randomOffset: { x: 1, y: 1 },
      randomScale: { min: 1, max: 1.08 },
      stagger: true,
      staggerDelay: 80,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 800,
      fontSize: 66,
      color: '#FFD700',
      gradient: 'linear-gradient(180deg, #FFF8E1 0%, #FFD700 40%, #FFA000 80%, #FF6F00 100%)',
      stroke: { color: '#5D4037', width: 4 },
      shadow: '0 0 30px #FFD700, 4px 4px 0 #5D4037, 0 0 60px rgba(255,215,0,0.4)',
    },
    decoration: {
      type: 'sparkle',
      items: ['🎭', '✨', '👑', '💫'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'curtain-reveal-in',
      loop: 'spotlight-glow',
      duration: 800,
    },
  },
  {
    id: 'drama-climax',
    name: '🔔 高潮来袭',
    emotion: 'excited',
    description: '剧情高潮，全场沸腾',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 4, y: 3 },
      randomScale: { min: 1, max: 1.18 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 74,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #00E5FF 30%, #00B8D4 60%, #0097A7 100%)',
      stroke: { color: '#004D40', width: 5 },
      shadow: '0 0 50px #00E5FF, 0 0 100px rgba(0,229,255,0.5), 5px 5px 0 #004D40',
    },
    decoration: {
      type: 'particle',
      items: ['🔔', '⚡', '🎆', '🎇'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'climax-burst-in',
      loop: 'climax-pulse',
      duration: 380,
    },
  },

  // ========== 💀 吐槽系列 ==========

  // ========== 原有开心系列（优化版） ==========
  {
    id: 'happy-rainbow',
    name: '🌈 彩虹糖',
    emotion: 'happy',
    description: '彩虹色逐字变化，梦幻可爱',
    layout: {
      randomRotation: { min: -15, max: 15 },
      randomOffset: { x: 4, y: 7 },
      randomScale: { min: 0.88, max: 1.15 },
      stagger: true,
      staggerDelay: 70,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 56,
      color: '#FFFFFF',
      gradient: 'linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96CEB4, #DDA0DD, #FF6B6B)',
      stroke: { color: '#FFFFFF', width: 2 },
      shadow: '3px 3px 10px rgba(0,0,0,0.35), 0 0 25px rgba(255,255,255,0.3)',
    },
    decoration: {
      type: 'sparkle',
      items: ['⭐', '🌈', '🎈', '🍭'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'rainbow-wave',
      loop: 'color-shift',
      duration: 750,
    },
  },

  // ========== 原有激动系列（优化版） ==========
  {
    id: 'excited-explosion',
    name: '💣 炸裂效果',
    emotion: 'excited',
    description: '震撼的爆发效果，高能场景必备',
    layout: {
      randomRotation: { min: -18, max: 18 },
      randomOffset: { x: 10, y: 10 },
      randomScale: { min: 0.82, max: 1.25 },
      stagger: true,
      staggerDelay: 25,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 70,
      color: '#FF6B35',
      gradient: 'linear-gradient(180deg, #FFFF00 0%, #FF6B35 40%, #FF4500 70%, #CC0000 100%)',
      stroke: { color: '#000000', width: 5 },
      shadow: '0 0 30px rgba(255,107,53,0.9), 5px 5px 0 #000, 0 0 60px rgba(255,69,0,0.6)',
    },
    decoration: {
      type: 'particle',
      items: ['💥', '🔥', '⚡', '💣'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'explosion-in',
      loop: 'fire-shake',
      duration: 450,
    },
  },
  {
    id: 'excited-zoom',
    name: '💫 冲击波',
    emotion: 'excited',
    description: '快速放大的冲击感',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.35 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 78,
      color: '#FFFFFF',
      stroke: { color: '#FF4500', width: 6 },
      shadow: '0 0 40px #FF4500, 0 0 80px rgba(255,69,0,0.6), 0 0 120px rgba(255,69,0,0.3)',
    },
    animation: {
      enter: 'zoom-shake',
      duration: 350,
    },
  },

  // ========== 惊讶系列 ==========
  {
    id: 'surprised-pop',
    name: '惊叹号',
    emotion: 'surprised',
    description: '夸张的弹出效果，惊讶时刻',
    layout: {
      randomRotation: { min: -20, max: 20 },
      randomOffset: { x: 10, y: 10 },
      randomScale: { min: 0.8, max: 1.25 },
      stagger: true,
      staggerDelay: 40,
    },
    text: {
      fontFamily: 'ZCOOL QingKe HuangYou',
      fontWeight: 400,
      fontSize: 56,
      color: '#9B5DE5',
      gradient: 'linear-gradient(135deg, #9B5DE5 0%, #F15BB5 100%)',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '4px 4px 0 #F15BB5, -2px -2px 0 #00F5D4',
    },
    decoration: {
      type: 'emoji',
      items: ['❗', '❓', '😮', '🤯'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'spring-pop',
      loop: 'surprised-shake',
      duration: 500,
    },
  },

  // ========== 爱心系列 ==========
  {
    id: 'love-hearts',
    name: '心动时刻',
    emotion: 'love',
    description: '浪漫心形漂浮效果',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 3 },
      randomScale: { min: 0.95, max: 1.05 },
      stagger: true,
      staggerDelay: 60,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 400,
      fontSize: 46,
      color: '#FF69B4',
      gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 50%, #DC143C 100%)',
      shadow: '0 0 15px rgba(255,105,180,0.6), 2px 2px 4px rgba(0,0,0,0.2)',
    },
    decoration: {
      type: 'emoji',
      items: ['❤️', '💕', '💖', '💗'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'heart-beat-in',
      loop: 'gentle-float',
      duration: 700,
    },
  },
  {
    id: 'love-sparkle',
    name: '闪闪发光',
    emotion: 'love',
    description: '闪烁星光的浪漫效果',
    layout: {
      randomRotation: { min: -3, max: 3 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 0.98, max: 1.02 },
      stagger: true,
      staggerDelay: 100,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 700,
      fontSize: 50,
      color: '#FFB6C1',
      shadow: '0 0 20px rgba(255,182,193,0.8), 0 0 40px rgba(255,105,180,0.4)',
    },
    decoration: {
      type: 'sparkle',
      items: ['✨', '💫', '⭐'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'sparkle-in',
      loop: 'twinkle',
      duration: 800,
    },
  },

  // ========== 搞笑系列 ==========
  {
    id: 'funny-cartoon',
    name: '漫画风',
    emotion: 'funny',
    description: '漫画式夸张表现',
    layout: {
      randomRotation: { min: -25, max: 25 },
      randomOffset: { x: 10, y: 8 },
      randomScale: { min: 0.8, max: 1.3 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'ZCOOL QingKe HuangYou',
      fontWeight: 400,
      fontSize: 60,
      color: '#FFFF00',
      stroke: { color: '#000000', width: 4 },
      shadow: '5px 5px 0 #000, -2px -2px 0 #000',
    },
    decoration: {
      type: 'shape',
      items: ['💥', '⭐', '💫'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'comic-pop',
      loop: 'comic-shake',
      duration: 500,
    },
  },

  // ========== 酷炫系列 ==========
  {
    id: 'cool-neon',
    name: '霓虹闪烁',
    emotion: 'cool',
    description: '赛博朋克霓虹灯效果',
    layout: {
      randomRotation: { min: -2, max: 2 },
      randomOffset: { x: 1, y: 1 },
      randomScale: { min: 1, max: 1 },
      stagger: true,
      staggerDelay: 30,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 700,
      fontSize: 52,
      color: '#00CEC9',
      shadow: '0 0 5px #00CEC9, 0 0 10px #00CEC9, 0 0 20px #00CEC9, 0 0 40px #0984E3',
    },
    animation: {
      enter: 'neon-flicker-in',
      loop: 'neon-pulse',
      duration: 600,
    },
  },
  {
    id: 'cool-glitch',
    name: '故障艺术',
    emotion: 'cool',
    description: '数字故障风格',
    layout: {
      randomRotation: { min: -1, max: 1 },
      randomOffset: { x: 2, y: 0 },
      randomScale: { min: 1, max: 1 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'JetBrains Mono',
      fontWeight: 600,
      fontSize: 48,
      color: '#FFFFFF',
      shadow: '-2px 0 #FF0000, 2px 0 #00FFFF',
    },
    animation: {
      enter: 'glitch-in',
      loop: 'glitch-loop',
      duration: 400,
    },
  },

  // ========== 生气系列 ==========
  {
    id: 'angry-rage',
    name: '暴怒模式',
    emotion: 'angry',
    description: '颤抖的愤怒效果',
    layout: {
      randomRotation: { min: -10, max: 10 },
      randomOffset: { x: 5, y: 3 },
      randomScale: { min: 1, max: 1.1 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 58,
      color: '#FF4757',
      stroke: { color: '#000000', width: 3 },
      shadow: '0 0 10px rgba(255,71,87,0.8), 3px 3px 0 #000',
    },
    decoration: {
      type: 'emoji',
      items: ['💢', '😤', '🔥'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'rage-in',
      loop: 'angry-shake',
      duration: 400,
    },
  },

  // ========== 悲伤系列 ==========
  {
    id: 'sad-rain',
    name: '泪雨纷飞',
    emotion: 'sad',
    description: '忧伤下坠效果',
    layout: {
      randomRotation: { min: -3, max: 3 },
      randomOffset: { x: 2, y: 4 },
      randomScale: { min: 0.95, max: 1 },
      stagger: true,
      staggerDelay: 100,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 400,
      fontSize: 44,
      color: '#74B9FF',
      shadow: '0 2px 10px rgba(116,185,255,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['💧', '😢', '🌧️'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'sad-drop',
      loop: 'gentle-sway',
      duration: 800,
    },
  },

  // ========== 害怕系列 ==========
  {
    id: 'scared-tremble',
    name: '瑟瑟发抖',
    emotion: 'scared',
    description: '恐惧颤抖效果',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 3, y: 2 },
      randomScale: { min: 0.9, max: 1 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 500,
      fontSize: 46,
      color: '#B2BEC3',
      stroke: { color: '#2D3436', width: 2 },
      shadow: '0 0 20px rgba(45,52,54,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😨', '👻', '💀'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'scared-appear',
      loop: 'tremble',
      duration: 500,
    },
  },

  // ========== 困惑系列 ==========

  // ============================================
  // 🎬 用户自定义花字 - 系统固化
  // ============================================
  {
    id: 'system-variety-fire',
    name: '🔥 综艺烈焰',
    emotion: 'excited',
    description: '综艺节目经典炸裂效果，火焰配色+强力阴影',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.1 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 88,
      color: '#FFFFFF',
      stroke: { color: '#000000', width: 8 },
      shadow: '0 0 50px #FF6B00, 0 0 100px rgba(255,107,0,0.7), 8px 8px 0 #000, -4px -4px 0 #FF0000, 0 0 150px rgba(255,0,0,0.4)',
    },
    decoration: {
      type: 'particle',
      items: ['💥', '⚡', '🔥', '✨', '💢'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'variety-boom-in',
      loop: 'intense-shake',
      duration: 300,
    },
  },

  // ============================================
  // 🆕 新增情绪花字系列
  // ============================================

  // ========== 😂 爆笑综艺系列 ==========
  {
    id: 'funny-lol',
    name: '🤣 笑死我了',
    emotion: 'funny',
    description: '综艺爆笑场面，笑到抖动',
    layout: {
      randomRotation: { min: -20, max: 20 },
      randomOffset: { x: 8, y: 10 },
      randomScale: { min: 0.85, max: 1.2 },
      stagger: true,
      staggerDelay: 40,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 64,
      color: '#FFD93D',
      stroke: { color: '#FF6B6B', width: 4 },
      shadow: '4px 4px 0 #FF6B6B, 8px 8px 0 rgba(0,0,0,0.3), 0 0 30px rgba(255,217,61,0.6)',
    },
    decoration: {
      type: 'emoji',
      items: ['🤣', '😂', '💀', '😹', '🤪', '😆'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'laugh-bounce-in',
      loop: 'happy-wiggle',
      duration: 400,
    },
  },
  {
    id: 'funny-hhh',
    name: '😹 哈哈哈哈',
    emotion: 'funny',
    description: '魔性笑声，停不下来',
    layout: {
      randomRotation: { min: -25, max: 25 },
      randomOffset: { x: 6, y: 8 },
      randomScale: { min: 0.9, max: 1.15 },
      stagger: true,
      staggerDelay: 60,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 58,
      color: '#FF9F43',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 6px 6px 0 #EE5A24, 0 0 25px rgba(255,159,67,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😹', '🤣', '😂', '🙈'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'bouncy-pop',
      loop: 'comic-shake',
      duration: 350,
    },
  },
  {
    id: 'funny-dead',
    name: '💀 笑到头掉',
    emotion: 'funny',
    description: '致死量搞笑，灵魂出窍',
    layout: {
      randomRotation: { min: -15, max: 15 },
      randomOffset: { x: 5, y: 6 },
      randomScale: { min: 0.9, max: 1.1 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 800,
      fontSize: 60,
      color: '#FFFFFF',
      stroke: { color: '#2D3436', width: 4 },
      shadow: '4px 4px 0 #2D3436, 0 0 20px rgba(255,255,255,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['💀', '☠️', '👻', '😵'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'shock-wave-in',
      loop: 'tremble',
      duration: 450,
    },
  },

  // ========== 😍 心动恋爱系列 ==========
  {
    id: 'love-kyaa',
    name: '💘 啊啊啊啊',
    emotion: 'love',
    description: '追星式心动尖叫',
    layout: {
      randomRotation: { min: -8, max: 8 },
      randomOffset: { x: 4, y: 5 },
      randomScale: { min: 0.95, max: 1.1 },
      stagger: true,
      staggerDelay: 35,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 66,
      color: '#FF6B81',
      gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FF6B81 40%, #E91E63 80%, #AD1457 100%)',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '0 0 40px #FF6B81, 3px 3px 0 rgba(255,255,255,0.8)',
    },
    decoration: {
      type: 'emoji',
      items: ['💘', '😍', '🥰', '💕', '✨', '💖'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'heart-explosion-in',
      loop: 'heartbeat-glow',
      duration: 380,
    },
  },
  {
    id: 'love-awsl',
    name: '💗 啊我死了',
    emotion: 'love',
    description: '可爱到致死，AWSL名场面',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 4 },
      randomScale: { min: 0.96, max: 1.08 },
      stagger: true,
      staggerDelay: 55,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 700,
      fontSize: 56,
      color: '#FF80AB',
      shadow: '0 0 30px #FF4081, 0 0 60px rgba(255,64,129,0.5), 3px 3px 0 #FFFFFF',
    },
    decoration: {
      type: 'emoji',
      items: ['💗', '😻', '🥺', '💕', '✨'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'sweet-pop-in',
      loop: 'gentle-float',
      duration: 600,
    },
  },
  {
    id: 'love-mua',
    name: '😘 么么哒',
    emotion: 'love',
    description: '甜蜜亲亲，撒狗粮专用',
    layout: {
      randomRotation: { min: -10, max: 10 },
      randomOffset: { x: 4, y: 4 },
      randomScale: { min: 0.92, max: 1.12 },
      stagger: true,
      staggerDelay: 70,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 54,
      color: '#E91E63',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 0 0 25px rgba(233,30,99,0.6)',
    },
    decoration: {
      type: 'emoji',
      items: ['😘', '💋', '❤️', '💕', '🥰'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'heart-beat-in',
      loop: 'sweet-float',
      duration: 550,
    },
  },

  // ========== 🤩 惊艳绝绝子系列 ==========
  {
    id: 'excited-jjz',
    name: '🤩 绝绝子',
    emotion: 'excited',
    description: '绝了绝了，口头禅必备',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 3, y: 3 },
      randomScale: { min: 1, max: 1.12 },
      stagger: true,
      staggerDelay: 25,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 72,
      color: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFD700 30%, #FF6B00 70%, #FF0000 100%)',
      stroke: { color: '#000000', width: 5 },
      shadow: '0 0 40px #FFD700, 5px 5px 0 #000',
    },
    decoration: {
      type: 'sparkle',
      items: ['🤩', '✨', '💫', '⭐', '🌟'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'super-scale-in',
      loop: 'golden-glow',
      duration: 350,
    },
  },
  {
    id: 'excited-yyds',
    name: '👑 永远的神',
    emotion: 'excited',
    description: 'YYDS封神效果',
    layout: {
      randomRotation: { min: -3, max: 3 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.08 },
      stagger: true,
      staggerDelay: 30,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 78,
      color: '#FFD700',
      stroke: { color: '#5D4037', width: 6 },
      shadow: '0 0 50px #FFD700, 0 0 100px rgba(255,215,0,0.6), 6px 6px 0 #3E2723',
    },
    decoration: {
      type: 'sparkle',
      items: ['👑', '🏆', '⭐', '💎', '✨'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'golden-flash-in',
      loop: 'spotlight-glow',
      duration: 450,
    },
  },
  {
    id: 'excited-slay',
    name: '💅 太绝了',
    emotion: 'excited',
    description: 'Slay全场，气场两米八',
    layout: {
      randomRotation: { min: -4, max: 4 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.1 },
      stagger: true,
      staggerDelay: 35,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 800,
      fontSize: 68,
      color: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
      stroke: { color: '#FFFFFF', width: 2 },
      shadow: '0 0 30px #764BA2, 4px 4px 0 rgba(0,0,0,0.3)',
    },
    decoration: {
      type: 'sparkle',
      items: ['💅', '👸', '💜', '✨', '💎'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'climax-burst-in',
      loop: 'golden-glow',
      duration: 400,
    },
  },

  // ========== 😱 震惊吃瓜系列 ==========
  {
    id: 'surprised-wc',
    name: '😱 卧槽',
    emotion: 'surprised',
    description: '惊呆了系列，下巴掉地上',
    layout: {
      randomRotation: { min: -15, max: 15 },
      randomOffset: { x: 8, y: 8 },
      randomScale: { min: 0.85, max: 1.2 },
      stagger: true,
      staggerDelay: 25,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 70,
      color: '#FFFFFF',
      stroke: { color: '#9B5DE5', width: 5 },
      shadow: '0 0 40px #9B5DE5, 5px 5px 0 #000, 0 0 80px rgba(155,93,229,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😱', '🤯', '😵', '❗', '⁉️'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'shock-wave-in',
      loop: 'dramatic-shake',
      duration: 350,
    },
  },
  {
    id: 'surprised-melon',
    name: '🍉 吃瓜吃瓜',
    emotion: 'surprised',
    description: '大瓜来了，准备搬小板凳',
    layout: {
      randomRotation: { min: -8, max: 8 },
      randomOffset: { x: 4, y: 4 },
      randomScale: { min: 0.95, max: 1.1 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 60,
      color: '#27AE60',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 6px 6px 0 #1E8449, 0 0 20px rgba(39,174,96,0.4)',
    },
    decoration: {
      type: 'emoji',
      items: ['🍉', '🍿', '👀', '😏', '📢'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'bouncy-pop',
      loop: 'happy-wiggle',
      duration: 500,
    },
  },
  {
    id: 'surprised-real',
    name: '❓ 真的假的',
    emotion: 'surprised',
    description: '怀疑人生系列，确定不是整活？',
    layout: {
      randomRotation: { min: -12, max: 12 },
      randomOffset: { x: 5, y: 6 },
      randomScale: { min: 0.9, max: 1.15 },
      stagger: true,
      staggerDelay: 45,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 700,
      fontSize: 58,
      color: '#F39C12',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 0 0 25px rgba(243,156,18,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['❓', '❔', '🤔', '🧐', '😕'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'spring-pop',
      loop: 'surprised-shake',
      duration: 550,
    },
  },

  // ========== 😤 吐槽无语系列 ==========
  {
    id: 'angry-emo',
    name: '😑 无语子',
    emotion: 'angry',
    description: '无话可说，摊手放弃',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 0.98, max: 1.05 },
      stagger: true,
      staggerDelay: 80,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 600,
      fontSize: 54,
      color: '#636E72',
      stroke: { color: '#FFFFFF', width: 2 },
      shadow: '2px 2px 0 #FFFFFF, 0 0 15px rgba(99,110,114,0.3)',
    },
    decoration: {
      type: 'emoji',
      items: ['😑', '😐', '🙄', '💤', '...'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'sad-drop',
      loop: 'gentle-sway',
      duration: 700,
    },
  },
  {
    id: 'angry-fml',
    name: '🤦 心态崩了',
    emotion: 'angry',
    description: '心态炸裂，原地爆炸',
    layout: {
      randomRotation: { min: -10, max: 10 },
      randomOffset: { x: 5, y: 4 },
      randomScale: { min: 0.95, max: 1.1 },
      stagger: true,
      staggerDelay: 40,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 800,
      fontSize: 62,
      color: '#E74C3C',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 0 0 30px rgba(231,76,60,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['🤦', '😩', '💔', '😫', '🫠'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'rage-in',
      loop: 'angry-shake',
      duration: 400,
    },
  },
  {
    id: 'angry-done',
    name: '✋ 我不玩了',
    emotion: 'angry',
    description: '下头了，直接退出群聊',
    layout: {
      randomRotation: { min: -8, max: 8 },
      randomOffset: { x: 4, y: 3 },
      randomScale: { min: 0.95, max: 1.08 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 700,
      fontSize: 56,
      color: '#95A5A6',
      stroke: { color: '#2C3E50', width: 3 },
      shadow: '3px 3px 0 #2C3E50',
    },
    decoration: {
      type: 'emoji',
      items: ['✋', '🚪', '👋', '😤', '🙅'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'awkward-slide-in',
      loop: 'gentle-sway',
      duration: 600,
    },
  },

  // ========== 🥺 可怜撒娇系列 ==========
  {
    id: 'sad-qaq',
    name: '🥺 QAQ',
    emotion: 'sad',
    description: '委屈巴巴，求安慰',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 2, y: 3 },
      randomScale: { min: 0.95, max: 1.05 },
      stagger: true,
      staggerDelay: 70,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 52,
      color: '#74B9FF',
      shadow: '0 0 20px rgba(116,185,255,0.6), 2px 2px 0 #FFFFFF',
    },
    decoration: {
      type: 'emoji',
      items: ['🥺', '😢', '💧', '😿', '🫠'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'sad-drop',
      loop: 'gentle-sway',
      duration: 700,
    },
  },
  {
    id: 'sad-emo',
    name: '😭 emo了',
    emotion: 'sad',
    description: '情绪低落，需要抱抱',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 4 },
      randomScale: { min: 0.93, max: 1.02 },
      stagger: true,
      staggerDelay: 90,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 400,
      fontSize: 48,
      color: '#5DADE2',
      shadow: '0 0 25px rgba(93,173,226,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😭', '😢', '🌧️', '💔', '☔'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'sad-drop',
      loop: 'gentle-sway',
      duration: 800,
    },
  },

  // ========== 😎 酷炫潮流系列 ==========
  {
    id: 'cool-nb',
    name: '😎 牛啤',
    emotion: 'cool',
    description: '666，太牛了',
    layout: {
      randomRotation: { min: -4, max: 4 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.1 },
      stagger: true,
      staggerDelay: 30,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 70,
      color: '#00CEC9',
      stroke: { color: '#FFFFFF', width: 4 },
      shadow: '0 0 30px #00CEC9, 4px 4px 0 #FFFFFF, 0 0 60px rgba(0,206,201,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😎', '🤙', '👍', '💯', '🔥'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'variety-boom-in',
      loop: 'power-pulse',
      duration: 350,
    },
  },
  {
    id: 'cool-666',
    name: '🤙 六六六',
    emotion: 'cool',
    description: '溜溜溜，操作秀',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 3 },
      randomScale: { min: 1, max: 1.15 },
      stagger: true,
      staggerDelay: 25,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 74,
      color: '#FFFFFF',
      stroke: { color: '#E74C3C', width: 5 },
      shadow: '0 0 40px #E74C3C, 5px 5px 0 #000, 0 0 80px rgba(231,76,60,0.4)',
    },
    decoration: {
      type: 'sparkle',
      items: ['🤙', '👏', '🙌', '💪', '⭐'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'super-scale-in',
      loop: 'intense-shake',
      duration: 300,
    },
  },

  // ========== 🌸 可爱萌系列 ==========
  {
    id: 'happy-kawaii',
    name: '🌸 好可爱',
    emotion: 'happy',
    description: '软萌可爱，少女心爆棚',
    layout: {
      randomRotation: { min: -8, max: 8 },
      randomOffset: { x: 3, y: 4 },
      randomScale: { min: 0.95, max: 1.1 },
      stagger: true,
      staggerDelay: 55,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 56,
      color: '#FFB6C1',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '0 0 25px #FFB6C1, 3px 3px 0 #FFFFFF, 0 0 50px rgba(255,182,193,0.5)',
    },
    decoration: {
      type: 'sparkle',
      items: ['🌸', '✨', '💕', '🎀', '🍬'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'sweet-pop-in',
      loop: 'sweet-float',
      duration: 550,
    },
  },
  {
    id: 'happy-moe',
    name: '😻 萌萌哒',
    emotion: 'happy',
    description: '超级无敌萌，猫猫头',
    layout: {
      randomRotation: { min: -10, max: 10 },
      randomOffset: { x: 4, y: 5 },
      randomScale: { min: 0.92, max: 1.12 },
      stagger: true,
      staggerDelay: 60,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 54,
      color: '#FFA500',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 6px 6px 0 #FF6B35, 0 0 25px rgba(255,165,0,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['😻', '🐱', '💕', '✨', '🎀'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'bouncy-pop',
      loop: 'happy-wiggle',
      duration: 500,
    },
  },

  // ========== 🎉 庆祝打call系列 ==========
  {
    id: 'happy-congrats',
    name: '🎉 恭喜恭喜',
    emotion: 'happy',
    description: '撒花庆祝，大喜事',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 3 },
      randomScale: { min: 0.98, max: 1.1 },
      stagger: true,
      staggerDelay: 40,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 800,
      fontSize: 64,
      color: '#E74C3C',
      stroke: { color: '#FFD700', width: 4 },
      shadow: '0 0 30px #E74C3C, 4px 4px 0 #FFD700, 0 0 60px rgba(231,76,60,0.4)',
    },
    decoration: {
      type: 'particle',
      items: ['🎉', '🎊', '🎈', '🥳', '✨'],
      position: 'around',
      animated: true,
    },
    animation: {
      enter: 'climax-burst-in',
      loop: 'happy-wiggle',
      duration: 400,
    },
  },
  {
    id: 'happy-call',
    name: '📣 打call',
    emotion: 'excited',
    description: '应援打call，气氛拉满',
    layout: {
      randomRotation: { min: -5, max: 5 },
      randomOffset: { x: 2, y: 2 },
      randomScale: { min: 1, max: 1.12 },
      stagger: false,
      staggerDelay: 0,
    },
    text: {
      fontFamily: 'Noto Sans SC',
      fontWeight: 900,
      fontSize: 68,
      color: '#FFFFFF',
      stroke: { color: '#F06292', width: 5 },
      shadow: '0 0 40px #F06292, 5px 5px 0 #000, 0 0 80px rgba(240,98,146,0.5)',
    },
    decoration: {
      type: 'sparkle',
      items: ['📣', '🎤', '💕', '✨', '🌟'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'variety-boom-in',
      loop: 'power-pulse',
      duration: 320,
    },
  },

  // ========== 🤤 馋嘴系列 ==========
  {
    id: 'happy-yummy',
    name: '🤤 好吃到哭',
    emotion: 'happy',
    description: '美食诱惑，口水直流',
    layout: {
      randomRotation: { min: -8, max: 8 },
      randomOffset: { x: 4, y: 4 },
      randomScale: { min: 0.95, max: 1.1 },
      stagger: true,
      staggerDelay: 50,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 58,
      color: '#FF7043',
      stroke: { color: '#FFFFFF', width: 3 },
      shadow: '3px 3px 0 #FFFFFF, 6px 6px 0 #E64A19, 0 0 25px rgba(255,112,67,0.5)',
    },
    decoration: {
      type: 'emoji',
      items: ['🤤', '😋', '🍔', '🍕', '🍜', '✨'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'bouncy-pop',
      loop: 'gentle-float',
      duration: 550,
    },
  },

  // ========== 😴 累了困了系列 ==========
  {
    id: 'tired-zzz',
    name: '😴 困了困了',
    emotion: 'confused',
    description: '困到不行，随时睡着',
    layout: {
      randomRotation: { min: -4, max: 4 },
      randomOffset: { x: 2, y: 3 },
      randomScale: { min: 0.96, max: 1.02 },
      stagger: true,
      staggerDelay: 100,
    },
    text: {
      fontFamily: 'LXGW WenKai',
      fontWeight: 400,
      fontSize: 50,
      color: '#9B59B6',
      shadow: '0 0 20px rgba(155,89,182,0.4)',
    },
    decoration: {
      type: 'emoji',
      items: ['😴', '💤', '🌙', '✨', '💭'],
      position: 'above',
      animated: true,
    },
    animation: {
      enter: 'sad-drop',
      loop: 'gentle-float',
      duration: 900,
    },
  },
  {
    id: 'tired-weekend',
    name: '🛋️ 摆烂中',
    emotion: 'confused',
    description: '今天也是摆烂的一天',
    layout: {
      randomRotation: { min: -6, max: 6 },
      randomOffset: { x: 3, y: 4 },
      randomScale: { min: 0.94, max: 1.04 },
      stagger: true,
      staggerDelay: 80,
    },
    text: {
      fontFamily: 'ZCOOL KuaiLe',
      fontWeight: 400,
      fontSize: 52,
      color: '#95A5A6',
      stroke: { color: '#FFFFFF', width: 2 },
      shadow: '2px 2px 0 #FFFFFF',
    },
    decoration: {
      type: 'emoji',
      items: ['🛋️', '📺', '🍿', '😌', '💤'],
      position: 'random',
      animated: true,
    },
    animation: {
      enter: 'sad-drop',
      loop: 'gentle-sway',
      duration: 800,
    },
  },
]

// ============================================
// 工具函数
// ============================================

/**
 * 生成随机值在范围内
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 根据情绪获取对应的预设样式
 */
export function getPresetsByEmotion(emotion: EmotionType): EmotionTextStyle[] {
  return EMOTION_TEXT_PRESETS.filter(preset => preset.emotion === emotion)
}

/**
 * 根据 ID 获取预设样式
 */
export function getPresetById(id: string): EmotionTextStyle | undefined {
  return EMOTION_TEXT_PRESETS.find(preset => preset.id === id)
}

/**
 * 获取情绪对应的颜色
 */
export function getEmotionColors(emotion: EmotionType) {
  return EMOTION_COLORS[emotion]
}

/**
 * 获取情绪对应的装饰 emoji
 */
export function getEmotionEmojis(emotion: EmotionType): string[] {
  return DECORATION_EMOJIS[emotion]
}

/**
 * 生成单个字符的随机样式
 */
export function generateCharStyle(
  layout: EmotionTextStyle['layout'],
  index: number
): React.CSSProperties {
  const rotation = randomInRange(layout.randomRotation.min, layout.randomRotation.max)
  const offsetX = randomInRange(-layout.randomOffset.x, layout.randomOffset.x)
  const offsetY = randomInRange(-layout.randomOffset.y, layout.randomOffset.y)
  const scale = randomInRange(layout.randomScale.min, layout.randomScale.max)

  return {
    display: 'inline-block',
    transform: `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    animationDelay: layout.stagger ? `${index * layout.staggerDelay}ms` : '0ms',
  }
}

/**
 * 将预设样式转换为 CSS
 */
export function presetToCSS(preset: EmotionTextStyle, scale: number = 1): React.CSSProperties {
  const css: React.CSSProperties = {
    fontFamily: `"${preset.text.fontFamily}", "Noto Sans SC", sans-serif`,
    fontWeight: preset.text.fontWeight,
    fontSize: `${preset.text.fontSize * scale}px`,
    lineHeight: 1.4,
  }

  // 判断是否使用渐变
  const hasGradient = !!preset.text.gradient

  // 渐变或纯色
  if (hasGradient) {
    // 使用 backgroundImage 而不是 background，避免与 backgroundClip 冲突
    css.backgroundImage = preset.text.gradient
    css.WebkitBackgroundClip = 'text'
    css.WebkitTextFillColor = 'transparent'
    css.backgroundClip = 'text'
    // 重要：渐变文字不能使用 text-shadow，会产生重影
    // 不添加任何阴影效果
  } else {
    css.color = preset.text.color
    
    // 只有纯色文字才能使用阴影效果
    if (preset.text.shadow) {
      css.textShadow = preset.text.shadow
    } else if (preset.text.stroke) {
      const { color, width } = preset.text.stroke
      const sw = width * scale
      const shadows = [
        `${-sw}px ${-sw}px 0 ${color}`,
        `${sw}px ${-sw}px 0 ${color}`,
        `${-sw}px ${sw}px 0 ${color}`,
        `${sw}px ${sw}px 0 ${color}`,
        `0 ${-sw}px 0 ${color}`,
        `0 ${sw}px 0 ${color}`,
        `${-sw}px 0 0 ${color}`,
        `${sw}px 0 0 ${color}`
      ]
      css.textShadow = shadows.join(', ')
    }
  }

  return css
}

/**
 * 获取情绪的中文名称
 */
export function getEmotionLabel(emotion: EmotionType): string {
  const labels: Record<EmotionType, string> = {
    happy: '开心',
    excited: '激动',
    surprised: '惊讶',
    love: '心动',
    angry: '生气',
    sad: '难过',
    scared: '害怕',
    confused: '困惑',
    cool: '酷炫',
    funny: '搞笑',
  }
  return labels[emotion]
}

/**
 * 获取情绪对应的图标名称
 */
export function getEmotionIcon(emotion: EmotionType): string {
  const icons: Record<EmotionType, string> = {
    happy: 'smile',
    excited: 'zap',
    surprised: 'alert-circle',
    love: 'heart',
    angry: 'flame',
    sad: 'cloud-rain',
    scared: 'ghost',
    confused: 'help-circle',
    cool: 'star',
    funny: 'laugh',
  }
  return icons[emotion]
}

