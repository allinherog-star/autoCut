/**
 * 炫字预设系统 - 中国搞笑综艺节目文字特效
 * 
 * 参考：腾讯视频综艺《一见你就笑》视觉风格
 * 特点：色彩极其鲜艳明快，偏卡通漫画风，大面积亮黄色、蓝紫色背景
 *       手绘感爆炸图形，画面干净、色块层级分明
 */

import React from 'react'

// ============================================
// 类型定义
// ============================================

/** 炫字类别 */
export type DazzleTextCategory = 
  | 'main_title'     // 节目主标题
  | 'segment_title'  // 分段标题
  | 'name_card'      // 嘉宾姓名条
  | 'punch_line'     // 爆笑大字
  | 'reaction'       // 反应词
  | 'emphasis'       // 强调词

/** 入场动画类型 */
export type EnterAnimation = 
  | 'slam_down'          // 砸落
  | 'zoom_bounce'        // 放大弹跳
  | 'explode_in'         // 爆炸出现
  | 'slide_bounce'       // 滑入弹跳
  | 'typewriter'         // 打字机
  | 'wave_in'            // 波浪入场
  | 'spin_in'            // 旋转入场
  | 'pop_spring'         // 弹簧弹出
  | 'flash_in'           // 闪现
  | 'grow_shake'         // 生长抖动
  | 'bounce_sequence'    // 逐字弹跳
  | 'roll_in'            // 翻滚入场
  | 'scatter_gather'     // 散开聚拢

/** 循环动画类型 */
export type LoopAnimation = 
  | 'none'              // 无循环
  | 'pulse'             // 脉冲
  | 'shake'             // 抖动
  | 'float'             // 漂浮
  | 'glow'              // 发光
  | 'breathe'           // 呼吸
  | 'wiggle'            // 摆动
  | 'bounce'            // 弹跳
  | 'rotate'            // 旋转
  | 'flash'             // 闪烁
  | 'jelly'             // 果冻
  | 'swing'             // 摇摆

/** 装饰元素类型 */
export type DecorationType = 
  | 'explosion'         // 爆炸
  | 'star_burst'        // 星星爆发
  | 'confetti'          // 彩纸
  | 'speed_lines'       // 速度线
  | 'sparkle'           // 闪光
  | 'bubble'            // 气泡
  | 'arrow'             // 箭头
  | 'frame'             // 边框
  | 'ribbon'            // 彩带
  | 'lightning'         // 闪电
  | 'heart'             // 心形
  | 'fire'              // 火焰
  | 'cloud'             // 云朵
  | 'emoji'             // 表情符号

/** 装饰配置 */
export interface DecorationConfig {
  type: DecorationType
  enabled: boolean
  items?: string[]        // emoji 或图标
  position: 'around' | 'above' | 'below' | 'left' | 'right' | 'corners' | 'random'
  animated: boolean
  color?: string
  size?: number
  count?: number
}

/** 字体配置 */
export interface FontConfig {
  family: string
  weight: number
  size: number
  letterSpacing?: number
  lineHeight?: number
}

/** 颜色配置 */
export interface ColorConfig {
  primary: string           // 主色
  secondary?: string        // 次色
  gradient?: string         // 渐变
  stroke?: {
    color: string
    width: number
  }
  shadow?: string           // 阴影
  glow?: string             // 发光
}

/** 音效配置 */
export interface SoundEffectConfig {
  enter?: string            // 入场音效 URL
  loop?: string             // 循环音效 URL
  exit?: string             // 出场音效 URL
  volume?: number           // 音量 0-1
}

/** 炫字预设完整配置 */
export interface DazzleTextPreset {
  id: string
  name: string
  category: DazzleTextCategory
  description: string
  duration: number          // 时长（毫秒）
  
  // 文字样式
  font: FontConfig
  color: ColorConfig
  
  // 动画配置
  animation: {
    enter: EnterAnimation
    enterDuration: number   // 入场动画时长（毫秒）
    loop: LoopAnimation
    loopDuration?: number   // 循环动画时长（毫秒）
    stagger?: number        // 逐字延迟（毫秒）
  }
  
  // 装饰元素
  decorations: DecorationConfig[]
  
  // 变换
  transform: {
    rotation?: number       // 旋转角度
    scale?: number          // 缩放
    skew?: number           // 倾斜
    perspective?: number    // 透视
  }
  
  // 音效
  sound?: SoundEffectConfig
  
  // 标签
  tags: string[]
}

// ============================================
// 炫字类别配置
// ============================================

export const DAZZLE_CATEGORY_CONFIG: Record<DazzleTextCategory, {
  label: string
  labelEn: string
  icon: string
  color: string
  bgColor: string
  description: string
}> = {
  main_title: {
    label: '节目主标题',
    labelEn: 'Main Title',
    icon: '🎬',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    description: '节目名称、主标题展示',
  },
  segment_title: {
    label: '分段标题',
    labelEn: 'Segment Title',
    icon: '📑',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    description: '环节名称、主题标题',
  },
  name_card: {
    label: '嘉宾姓名条',
    labelEn: 'Name Card',
    icon: '👤',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
    description: '嘉宾介绍、姓名展示',
  },
  punch_line: {
    label: '爆笑大字',
    labelEn: 'Punch Line',
    icon: '😂',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    description: '笑点强调、高能时刻',
  },
  reaction: {
    label: '反应词',
    labelEn: 'Reaction',
    icon: '😱',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    description: '惊讶、震惊等反应',
  },
  emphasis: {
    label: '强调词',
    labelEn: 'Emphasis',
    icon: '⚡',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    description: '重点强调、关键词',
  },
}

// ============================================
// 入场动画 CSS 关键帧
// ============================================

export const DAZZLE_ENTER_ANIMATIONS_CSS = `
/* 砸落入场 */
@keyframes dazzle-slam-down {
  0% {
    transform: translateY(-200%) scale(2) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: translateY(15%) scale(0.9) rotate(3deg);
    opacity: 1;
  }
  80% {
    transform: translateY(-5%) scale(1.05) rotate(-1deg);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

/* 放大弹跳入场 */
@keyframes dazzle-zoom-bounce {
  0% {
    transform: scale(0) rotate(-15deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(5deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(-2deg);
  }
  85% {
    transform: scale(1.1) rotate(1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 爆炸出现 */
@keyframes dazzle-explode-in {
  0% {
    transform: scale(0);
    opacity: 0;
    filter: blur(20px);
  }
  40% {
    transform: scale(1.5);
    opacity: 1;
    filter: blur(5px);
  }
  60% {
    transform: scale(0.8);
    filter: blur(0);
  }
  80% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

/* 滑入弹跳 */
@keyframes dazzle-slide-bounce {
  0% {
    transform: translateX(-150%) rotate(-20deg);
    opacity: 0;
  }
  60% {
    transform: translateX(10%) rotate(5deg);
    opacity: 1;
  }
  80% {
    transform: translateX(-5%) rotate(-2deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}

/* 波浪入场 */
@keyframes dazzle-wave-in {
  0% {
    transform: translateY(100%) scaleY(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-20%) scaleY(1.2);
    opacity: 1;
  }
  70% {
    transform: translateY(10%) scaleY(0.9);
  }
  100% {
    transform: translateY(0) scaleY(1);
  }
}

/* 旋转入场 */
@keyframes dazzle-spin-in {
  0% {
    transform: rotate(-720deg) scale(0);
    opacity: 0;
  }
  70% {
    transform: rotate(20deg) scale(1.2);
    opacity: 1;
  }
  85% {
    transform: rotate(-10deg) scale(0.95);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

/* 弹簧弹出 */
@keyframes dazzle-pop-spring {
  0% {
    transform: scale(0) translateY(50px);
    opacity: 0;
  }
  40% {
    transform: scale(1.4) translateY(-30px);
    opacity: 1;
  }
  55% {
    transform: scale(0.85) translateY(10px);
  }
  70% {
    transform: scale(1.15) translateY(-5px);
  }
  85% {
    transform: scale(0.95) translateY(2px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

/* 闪现 */
@keyframes dazzle-flash-in {
  0% {
    opacity: 0;
    transform: scale(1.5);
    filter: brightness(3);
  }
  30% {
    opacity: 1;
    transform: scale(0.9);
    filter: brightness(2);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

/* 生长抖动 */
@keyframes dazzle-grow-shake {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  40% {
    transform: scaleX(1.1) rotate(2deg);
    opacity: 1;
  }
  50% {
    transform: scaleX(0.95) rotate(-2deg);
  }
  60% {
    transform: scaleX(1.05) rotate(1deg);
  }
  70% {
    transform: scaleX(0.98) rotate(-1deg);
  }
  80% {
    transform: scaleX(1.02) rotate(0.5deg);
  }
  100% {
    transform: scaleX(1) rotate(0);
  }
}

/* 翻滚入场 */
@keyframes dazzle-roll-in {
  0% {
    transform: translateX(-100%) rotate(-360deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
}

/* 散开聚拢 */
@keyframes dazzle-scatter-gather {
  0% {
    transform: scale(3);
    opacity: 0;
    filter: blur(30px);
  }
  50% {
    transform: scale(0.8);
    opacity: 1;
    filter: blur(0);
  }
  100% {
    transform: scale(1);
  }
}
`

// ============================================
// 循环动画 CSS 关键帧
// ============================================

export const DAZZLE_LOOP_ANIMATIONS_CSS = `
/* 脉冲 */
@keyframes dazzle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* 抖动 */
@keyframes dazzle-shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-3px) rotate(-1deg); }
  75% { transform: translateX(3px) rotate(1deg); }
}

/* 漂浮 */
@keyframes dazzle-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}

/* 发光 */
@keyframes dazzle-glow {
  0%, 100% { filter: drop-shadow(0 0 15px currentColor); }
  50% { filter: drop-shadow(0 0 30px currentColor) drop-shadow(0 0 60px currentColor); }
}

/* 呼吸 */
@keyframes dazzle-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.03); opacity: 0.95; }
}

/* 摆动 */
@keyframes dazzle-wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

/* 弹跳 */
@keyframes dazzle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 旋转 */
@keyframes dazzle-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 闪烁 */
@keyframes dazzle-flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.7; }
}

/* 果冻 */
@keyframes dazzle-jelly {
  0%, 100% { transform: scale(1, 1); }
  25% { transform: scale(0.95, 1.05); }
  50% { transform: scale(1.05, 0.95); }
  75% { transform: scale(0.98, 1.02); }
}

/* 摇摆 */
@keyframes dazzle-swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
`

// ============================================
// 装饰动画 CSS 关键帧
// ============================================

export const DAZZLE_DECORATION_ANIMATIONS_CSS = `
/* 彩纸飘落 */
@keyframes dazzle-confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* 速度线 */
@keyframes dazzle-speed-lines {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(0) translateX(100%);
    opacity: 0;
  }
}

/* 星星闪烁 */
@keyframes dazzle-sparkle {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
}

/* 爆炸扩散 */
@keyframes dazzle-explosion-expand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 闪电 */
@keyframes dazzle-lightning {
  0%, 100% { opacity: 0; }
  10%, 30%, 50% { opacity: 1; }
  20%, 40% { opacity: 0.3; }
}

/* 火焰摇曳 */
@keyframes dazzle-fire {
  0%, 100% { transform: scaleY(1) translateX(0); }
  25% { transform: scaleY(1.1) translateX(-2px); }
  50% { transform: scaleY(0.95) translateX(2px); }
  75% { transform: scaleY(1.05) translateX(-1px); }
}

/* 心跳 */
@keyframes dazzle-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

/* 气泡上升 */
@keyframes dazzle-bubble-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) scale(0.5);
    opacity: 0;
  }
}
`

// ============================================
// 综合 CSS（导出供组件使用）
// ============================================

export const DAZZLE_ALL_ANIMATIONS_CSS = `
${DAZZLE_ENTER_ANIMATIONS_CSS}
${DAZZLE_LOOP_ANIMATIONS_CSS}
${DAZZLE_DECORATION_ANIMATIONS_CSS}
`

// ============================================
// 预设样式库 - 中国搞笑综艺炫字
// ============================================

export const DAZZLE_TEXT_PRESETS: DazzleTextPreset[] = [
  // ============================================
  // 🎬 节目主标题系列
  // ============================================
  {
    id: 'main-title-yijiannijiuxiao',
    name: '一见你就笑',
    category: 'main_title',
    description: '节目主标题 - 鲜艳黄底蓝紫渐变字，爆炸装饰',
    duration: 3000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 120,
      letterSpacing: 8,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFE500 20%, #FF6B00 50%, #FF00AA 80%, #6600FF 100%)',
      stroke: { color: '#1A0033', width: 8 },
      shadow: '0 8px 0 #FF00AA, 0 16px 0 rgba(0,0,0,0.3), 0 0 60px rgba(255,0,170,0.8), 0 0 120px rgba(102,0,255,0.6)',
    },
    animation: {
      enter: 'slam_down',
      enterDuration: 600,
      loop: 'glow',
      loopDuration: 2000,
    },
    decorations: [
      {
        type: 'explosion',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFE500',
        size: 150,
      },
      {
        type: 'sparkle',
        enabled: true,
        items: ['✨', '⭐', '💫'],
        position: 'corners',
        animated: true,
        count: 8,
      },
      {
        type: 'confetti',
        enabled: true,
        position: 'above',
        animated: true,
        color: '#FF00AA',
        count: 20,
      },
    ],
    transform: {
      rotation: -3,
      scale: 1,
    },
    tags: ['主标题', '综艺', '节目名', '一见你就笑'],
  },
  {
    id: 'main-title-huanle-zongyyi',
    name: '欢乐综艺秀',
    category: 'main_title',
    description: '经典综艺节目标题 - 金色渐变，皇冠装饰',
    duration: 3000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 110,
      letterSpacing: 6,
    },
    color: {
      primary: '#FFD700',
      gradient: 'linear-gradient(180deg, #FFFACD 0%, #FFD700 30%, #FFA500 60%, #FF8C00 100%)',
      stroke: { color: '#8B4513', width: 7 },
      shadow: '0 6px 0 #8B4513, 0 12px 0 rgba(0,0,0,0.4), 0 0 80px rgba(255,215,0,0.9)',
    },
    animation: {
      enter: 'zoom_bounce',
      enterDuration: 700,
      loop: 'breathe',
      loopDuration: 2500,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['👑'],
        position: 'above',
        animated: true,
        size: 60,
      },
      {
        type: 'star_burst',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFD700',
        count: 12,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['主标题', '综艺', '金色', '皇冠'],
  },
  {
    id: 'main-title-baoxiao-juchang',
    name: '爆笑剧场',
    category: 'main_title',
    description: '喜剧综艺主标题 - 红黄撞色，漫画爆炸风格',
    duration: 2500,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 130,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFFF00 30%, #FF6600 70%, #FF0000 100%)',
      stroke: { color: '#000000', width: 10 },
      shadow: '12px 12px 0 #FF0000, -4px -4px 0 #FFFF00, 0 0 50px rgba(255,102,0,0.7)',
    },
    animation: {
      enter: 'explode_in',
      enterDuration: 500,
      loop: 'shake',
      loopDuration: 400,
    },
    decorations: [
      {
        type: 'explosion',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FF0000',
        size: 200,
      },
      {
        type: 'speed_lines',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFFF00',
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['💥', '🔥', '⚡'],
        position: 'random',
        animated: true,
        count: 6,
      },
    ],
    transform: {
      rotation: -5,
      scale: 1,
      skew: 2,
    },
    tags: ['主标题', '爆笑', '漫画风', '爆炸'],
  },

  // ============================================
  // 📑 分段标题系列
  // ============================================
  {
    id: 'segment-title-benqi-zhuti',
    name: '本期主题',
    category: 'segment_title',
    description: '分段标题 - 蓝紫渐变，红框装饰',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 80,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #C7B8FF 30%, #8B5CF6 60%, #6D28D9 100%)',
      stroke: { color: '#4C1D95', width: 5 },
      shadow: '0 4px 0 #DC2626, 0 8px 0 rgba(0,0,0,0.3), 0 0 40px rgba(139,92,246,0.6)',
    },
    animation: {
      enter: 'slide_bounce',
      enterDuration: 500,
      loop: 'pulse',
      loopDuration: 1500,
    },
    decorations: [
      {
        type: 'frame',
        enabled: true,
        position: 'around',
        animated: false,
        color: '#DC2626',
      },
      {
        type: 'sparkle',
        enabled: true,
        items: ['✨'],
        position: 'corners',
        animated: true,
        count: 4,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['分段', '标题', '本期主题', '紫色'],
  },
  {
    id: 'segment-title-youxi-huanjie',
    name: '游戏环节',
    category: 'segment_title',
    description: '游戏环节标题 - 明亮黄色，活力十足',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 85,
      letterSpacing: 6,
    },
    color: {
      primary: '#1A1A2E',
      gradient: 'linear-gradient(180deg, #FFFDE7 0%, #FFEE58 40%, #FFC107 70%, #FF9800 100%)',
      stroke: { color: '#E65100', width: 6 },
      shadow: '0 5px 0 #E65100, 0 10px 0 rgba(0,0,0,0.3), 0 0 50px rgba(255,193,7,0.8)',
    },
    animation: {
      enter: 'pop_spring',
      enterDuration: 600,
      loop: 'bounce',
      loopDuration: 1000,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['🎮', '🎯', '🏆'],
        position: 'around',
        animated: true,
        count: 3,
      },
      {
        type: 'star_burst',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFEE58',
        count: 8,
      },
    ],
    transform: {
      rotation: 3,
      scale: 1,
    },
    tags: ['分段', '游戏', '环节', '黄色'],
  },
  {
    id: 'segment-title-pk-dadui',
    name: 'PK大对决',
    category: 'segment_title',
    description: 'PK对决环节 - 红蓝对撞，火花四溅',
    duration: 2500,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 90,
      letterSpacing: 2,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(90deg, #FF0000 0%, #FFFFFF 50%, #0066FF 100%)',
      stroke: { color: '#000000', width: 8 },
      shadow: '-8px 0 0 #FF0000, 8px 0 0 #0066FF, 0 0 60px rgba(255,255,255,0.8)',
    },
    animation: {
      enter: 'grow_shake',
      enterDuration: 500,
      loop: 'shake',
      loopDuration: 500,
    },
    decorations: [
      {
        type: 'lightning',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFD700',
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['⚔️', '🔥', '💥'],
        position: 'around',
        animated: true,
        count: 4,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
      perspective: 500,
    },
    tags: ['PK', '对决', '红蓝', '对撞'],
  },
  {
    id: 'segment-title-jingcai-huifang',
    name: '精彩回放',
    category: 'segment_title',
    description: '回放环节标题 - 电影胶片风格',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 75,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #F5F5F5 0%, #E0E0E0 50%, #9E9E9E 100%)',
      stroke: { color: '#212121', width: 5 },
      shadow: '0 4px 0 #212121, 0 8px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.5)',
    },
    animation: {
      enter: 'roll_in',
      enterDuration: 800,
      loop: 'none',
    },
    decorations: [
      {
        type: 'frame',
        enabled: true,
        position: 'around',
        animated: false,
        color: '#FFD700',
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['🎬', '📽️'],
        position: 'corners',
        animated: true,
        count: 2,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['回放', '精彩', '电影', '胶片'],
  },

  // ============================================
  // 👤 嘉宾姓名条系列
  // ============================================
  {
    id: 'name-card-standard',
    name: '嘉宾介绍',
    category: 'name_card',
    description: '标准嘉宾姓名条 - 简洁大气',
    duration: 2500,
    font: {
      family: 'Noto Sans SC',
      weight: 700,
      size: 60,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #E0E7FF 50%, #A5B4FC 100%)',
      stroke: { color: '#3730A3', width: 4 },
      shadow: '0 3px 0 #3730A3, 0 6px 0 rgba(0,0,0,0.2), 0 0 25px rgba(99,102,241,0.5)',
    },
    animation: {
      enter: 'slide_bounce',
      enterDuration: 400,
      loop: 'breathe',
      loopDuration: 3000,
    },
    decorations: [
      {
        type: 'frame',
        enabled: true,
        position: 'around',
        animated: false,
        color: '#6366F1',
      },
      {
        type: 'sparkle',
        enabled: true,
        items: ['✨'],
        position: 'right',
        animated: true,
        count: 2,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['嘉宾', '姓名', '介绍', '名牌'],
  },
  {
    id: 'name-card-star',
    name: '明星嘉宾',
    category: 'name_card',
    description: '明星嘉宾专属 - 金色高光',
    duration: 3000,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 70,
      letterSpacing: 6,
    },
    color: {
      primary: '#FFD700',
      gradient: 'linear-gradient(180deg, #FFFEF0 0%, #FFE55D 30%, #FFD700 60%, #F5A623 100%)',
      stroke: { color: '#8B6914', width: 5 },
      shadow: '0 4px 0 #8B6914, 0 8px 0 rgba(0,0,0,0.3), 0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(245,166,35,0.5)',
    },
    animation: {
      enter: 'flash_in',
      enterDuration: 500,
      loop: 'glow',
      loopDuration: 1500,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['👑', '⭐'],
        position: 'above',
        animated: true,
        count: 1,
      },
      {
        type: 'star_burst',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFD700',
        count: 6,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['明星', '嘉宾', '金色', 'VIP'],
  },
  {
    id: 'name-card-funny',
    name: '搞笑担当',
    category: 'name_card',
    description: '搞笑艺人姓名条 - 活泼可爱',
    duration: 2500,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 65,
      letterSpacing: 3,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)',
      stroke: { color: '#FFFFFF', width: 4 },
      shadow: '4px 4px 0 #FF6B6B, -4px -4px 0 #4ECDC4, 0 0 30px rgba(78,205,196,0.6)',
    },
    animation: {
      enter: 'pop_spring',
      enterDuration: 600,
      loop: 'wiggle',
      loopDuration: 1200,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['🤣', '😂', '🎭'],
        position: 'around',
        animated: true,
        count: 3,
      },
      {
        type: 'confetti',
        enabled: true,
        position: 'above',
        animated: true,
        count: 10,
      },
    ],
    transform: {
      rotation: -3,
      scale: 1,
    },
    tags: ['搞笑', '艺人', '活泼', '可爱'],
  },

  // ============================================
  // 😂 爆笑大字系列
  // ============================================
  {
    id: 'punch-xiaosi-wole',
    name: '笑死我了',
    category: 'punch_line',
    description: '经典爆笑 - 黄底红字，震颤抖动',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 100,
      letterSpacing: 2,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFFF00 30%, #FF9500 60%, #FF0000 100%)',
      stroke: { color: '#8B0000', width: 8 },
      shadow: '0 8px 0 #8B0000, 0 16px 0 rgba(0,0,0,0.4), 0 0 60px rgba(255,0,0,0.8), 8px 8px 0 #FFFF00',
    },
    animation: {
      enter: 'explode_in',
      enterDuration: 400,
      loop: 'shake',
      loopDuration: 300,
      stagger: 50,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['🤣', '😂', '💀', '😹'],
        position: 'random',
        animated: true,
        count: 6,
      },
      {
        type: 'explosion',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFFF00',
        size: 180,
      },
    ],
    transform: {
      rotation: -5,
      scale: 1,
      skew: 3,
    },
    tags: ['笑死', '爆笑', '经典', '高能'],
  },
  {
    id: 'punch-juele',
    name: '绝了',
    category: 'punch_line',
    description: '惊艳绝绝子 - 紫金渐变，星光璀璨',
    duration: 1800,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 120,
      letterSpacing: 8,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #E1BEE7 20%, #9C27B0 50%, #6A1B9A 80%, #4A148C 100%)',
      stroke: { color: '#FFD700', width: 6 },
      shadow: '0 6px 0 #FFD700, 0 0 50px rgba(156,39,176,0.9), 0 0 100px rgba(255,215,0,0.6)',
    },
    animation: {
      enter: 'zoom_bounce',
      enterDuration: 500,
      loop: 'glow',
      loopDuration: 1200,
    },
    decorations: [
      {
        type: 'sparkle',
        enabled: true,
        items: ['✨', '💫', '⭐', '🌟'],
        position: 'around',
        animated: true,
        count: 8,
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['🤩', '👑', '💜'],
        position: 'corners',
        animated: true,
        count: 3,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['绝了', '绝绝子', '惊艳', '紫色'],
  },
  {
    id: 'punch-haohuiwan',
    name: '好会玩',
    category: 'punch_line',
    description: '夸赞玩梗 - 彩虹渐变，活力四射',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 95,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(90deg, #FF0000 0%, #FF7F00 17%, #FFFF00 33%, #00FF00 50%, #0000FF 67%, #4B0082 83%, #9400D3 100%)',
      stroke: { color: '#FFFFFF', width: 5 },
      shadow: '0 5px 0 rgba(0,0,0,0.4), 0 0 40px rgba(255,127,0,0.6), 0 0 80px rgba(0,255,0,0.4)',
    },
    animation: {
      enter: 'bounce_sequence',
      enterDuration: 800,
      loop: 'wiggle',
      loopDuration: 1000,
      stagger: 100,
    },
    decorations: [
      {
        type: 'confetti',
        enabled: true,
        position: 'above',
        animated: true,
        count: 25,
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['🎉', '🎊', '🤙', '👏'],
        position: 'around',
        animated: true,
        count: 4,
      },
      {
        type: 'star_burst',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFD700',
        count: 10,
      },
    ],
    transform: {
      rotation: 3,
      scale: 1,
    },
    tags: ['好会玩', '玩梗', '彩虹', '活力'],
  },
  {
    id: 'punch-wocao',
    name: '卧槽',
    category: 'punch_line',
    description: '震惊反应 - 蓝紫冲击，爆炸效果',
    duration: 1500,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 130,
      letterSpacing: 0,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #00BFFF 30%, #0066FF 60%, #6600CC 100%)',
      stroke: { color: '#000000', width: 10 },
      shadow: '0 10px 0 #000, 0 0 80px rgba(0,102,255,0.9), 0 0 150px rgba(102,0,204,0.7)',
    },
    animation: {
      enter: 'explode_in',
      enterDuration: 350,
      loop: 'shake',
      loopDuration: 250,
    },
    decorations: [
      {
        type: 'explosion',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#0066FF',
        size: 220,
      },
      {
        type: 'speed_lines',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#00BFFF',
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['😱', '🤯', '💥', '⚡'],
        position: 'random',
        animated: true,
        count: 5,
      },
    ],
    transform: {
      rotation: -8,
      scale: 1,
      skew: 5,
    },
    tags: ['卧槽', '震惊', '蓝色', '爆炸'],
  },
  {
    id: 'punch-niubi',
    name: '牛逼',
    category: 'punch_line',
    description: '超级牛 - 金色霸气，火焰环绕',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 110,
      letterSpacing: 6,
    },
    color: {
      primary: '#FFD700',
      gradient: 'linear-gradient(180deg, #FFFACD 0%, #FFD700 20%, #FFA500 50%, #FF4500 80%, #DC143C 100%)',
      stroke: { color: '#8B0000', width: 7 },
      shadow: '0 7px 0 #8B0000, 0 14px 0 rgba(0,0,0,0.5), 0 0 70px rgba(255,165,0,0.9), 0 0 140px rgba(220,20,60,0.6)',
    },
    animation: {
      enter: 'slam_down',
      enterDuration: 450,
      loop: 'pulse',
      loopDuration: 800,
    },
    decorations: [
      {
        type: 'fire',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FF4500',
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['🔥', '💪', '👑', '🏆'],
        position: 'around',
        animated: true,
        count: 4,
      },
      {
        type: 'lightning',
        enabled: true,
        position: 'above',
        animated: true,
        color: '#FFD700',
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['牛逼', '厉害', '金色', '火焰'],
  },
  {
    id: 'punch-taixiule',
    name: '太秀了',
    category: 'punch_line',
    description: '操作秀 - 青色科技感，电流效果',
    duration: 1800,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 100,
      letterSpacing: 4,
    },
    color: {
      primary: '#00FFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #00FFFF 30%, #00CED1 60%, #008B8B 100%)',
      stroke: { color: '#006666', width: 6 },
      shadow: '0 6px 0 #006666, 0 0 50px rgba(0,255,255,0.9), 0 0 100px rgba(0,206,209,0.7)',
      glow: '0 0 20px #00FFFF',
    },
    animation: {
      enter: 'flash_in',
      enterDuration: 400,
      loop: 'flash',
      loopDuration: 500,
    },
    decorations: [
      {
        type: 'lightning',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#00FFFF',
      },
      {
        type: 'sparkle',
        enabled: true,
        items: ['⚡', '✨', '💫'],
        position: 'around',
        animated: true,
        count: 6,
      },
    ],
    transform: {
      rotation: 2,
      scale: 1,
    },
    tags: ['太秀了', '操作', '科技', '青色'],
  },
  {
    id: 'punch-emole',
    name: '破防了',
    category: 'punch_line',
    description: 'emo瞬间 - 蓝紫忧郁，玻璃碎裂',
    duration: 2500,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 90,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #E8EAF6 0%, #9FA8DA 30%, #5C6BC0 60%, #3949AB 100%)',
      stroke: { color: '#1A237E', width: 5 },
      shadow: '0 5px 0 #1A237E, 0 0 40px rgba(92,107,192,0.7)',
    },
    animation: {
      enter: 'scatter_gather',
      enterDuration: 700,
      loop: 'breathe',
      loopDuration: 2000,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['😢', '💔', '🥺', '😭'],
        position: 'around',
        animated: true,
        count: 4,
      },
      {
        type: 'sparkle',
        enabled: true,
        items: ['💧'],
        position: 'above',
        animated: true,
        count: 5,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['破防', 'emo', '蓝色', '忧郁'],
  },

  // ============================================
  // 😱 反应词系列
  // ============================================
  {
    id: 'reaction-zhenjia',
    name: '真的假的',
    category: 'reaction',
    description: '怀疑反应 - 橙黄疑问，问号装饰',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 85,
      letterSpacing: 2,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFF8E1 0%, #FFCA28 40%, #FF9800 70%, #E65100 100%)',
      stroke: { color: '#BF360C', width: 5 },
      shadow: '0 5px 0 #BF360C, 0 0 35px rgba(255,152,0,0.7)',
    },
    animation: {
      enter: 'wave_in',
      enterDuration: 500,
      loop: 'swing',
      loopDuration: 1500,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['❓', '🤔', '🧐', '❔'],
        position: 'around',
        animated: true,
        count: 4,
      },
    ],
    transform: {
      rotation: -3,
      scale: 1,
    },
    tags: ['真的假的', '怀疑', '疑问', '橙色'],
  },
  {
    id: 'reaction-wodele',
    name: '我的天',
    category: 'reaction',
    description: '惊叹反应 - 蓝白渐变，天空效果',
    duration: 1800,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 95,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #BBDEFB 30%, #64B5F6 60%, #1976D2 100%)',
      stroke: { color: '#0D47A1', width: 6 },
      shadow: '0 6px 0 #0D47A1, 0 0 50px rgba(25,118,210,0.7), 0 0 100px rgba(100,181,246,0.5)',
    },
    animation: {
      enter: 'zoom_bounce',
      enterDuration: 500,
      loop: 'float',
      loopDuration: 2000,
    },
    decorations: [
      {
        type: 'cloud',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFFFFF',
        count: 3,
      },
      {
        type: 'emoji',
        enabled: true,
        items: ['😲', '😮', '🌟'],
        position: 'above',
        animated: true,
        count: 2,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['我的天', '惊叹', '蓝色', '天空'],
  },
  {
    id: 'reaction-buhuiba',
    name: '不会吧',
    category: 'reaction',
    description: '难以置信 - 紫粉渐变，震惊表情',
    duration: 1800,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 90,
      letterSpacing: 3,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FCE4EC 0%, #F48FB1 40%, #E91E63 70%, #AD1457 100%)',
      stroke: { color: '#880E4F', width: 5 },
      shadow: '0 5px 0 #880E4F, 0 0 40px rgba(233,30,99,0.7)',
    },
    animation: {
      enter: 'pop_spring',
      enterDuration: 550,
      loop: 'shake',
      loopDuration: 600,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['😱', '🙀', '😨', '❗'],
        position: 'around',
        animated: true,
        count: 4,
      },
    ],
    transform: {
      rotation: 5,
      scale: 1,
    },
    tags: ['不会吧', '难以置信', '粉色', '震惊'],
  },

  // ============================================
  // ⚡ 强调词系列
  // ============================================
  {
    id: 'emphasis-zhuyi',
    name: '注意',
    category: 'emphasis',
    description: '提醒注意 - 红黑警示，感叹号',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 85,
      letterSpacing: 6,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFCDD2 30%, #EF5350 60%, #C62828 100%)',
      stroke: { color: '#000000', width: 6 },
      shadow: '0 6px 0 #000, 0 0 40px rgba(198,40,40,0.8)',
    },
    animation: {
      enter: 'flash_in',
      enterDuration: 400,
      loop: 'pulse',
      loopDuration: 800,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['⚠️', '❗', '🚨'],
        position: 'above',
        animated: true,
        count: 1,
      },
      {
        type: 'lightning',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FF0000',
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['注意', '警示', '红色', '提醒'],
  },
  {
    id: 'emphasis-gaoneng',
    name: '高能预警',
    category: 'emphasis',
    description: '高能提示 - 红黄闪烁，警报效果',
    duration: 2500,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 80,
      letterSpacing: 4,
    },
    color: {
      primary: '#FFFFFF',
      gradient: 'linear-gradient(180deg, #FFFF00 0%, #FF9800 40%, #FF5722 70%, #D32F2F 100%)',
      stroke: { color: '#000000', width: 7 },
      shadow: '0 7px 0 #000, 0 0 60px rgba(255,152,0,0.9), 0 0 120px rgba(211,47,47,0.7)',
    },
    animation: {
      enter: 'slam_down',
      enterDuration: 400,
      loop: 'flash',
      loopDuration: 400,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['🚨', '⚡', '🔥', '💥'],
        position: 'around',
        animated: true,
        count: 4,
      },
      {
        type: 'speed_lines',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FF5722',
      },
    ],
    transform: {
      rotation: -3,
      scale: 1,
    },
    tags: ['高能', '预警', '红黄', '警报'],
  },
  {
    id: 'emphasis-zhongdian',
    name: '划重点',
    category: 'emphasis',
    description: '重点标记 - 荧光笔效果',
    duration: 2000,
    font: {
      family: 'Noto Sans SC',
      weight: 800,
      size: 75,
      letterSpacing: 3,
    },
    color: {
      primary: '#1A1A1A',
      gradient: 'linear-gradient(180deg, #1A1A1A 0%, #333333 100%)',
      stroke: { color: '#FFFF00', width: 8 },
      shadow: '0 0 30px rgba(255,255,0,0.9), 0 4px 0 #CC9900',
    },
    animation: {
      enter: 'grow_shake',
      enterDuration: 500,
      loop: 'glow',
      loopDuration: 1500,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['✏️', '📝', '💡'],
        position: 'left',
        animated: true,
        count: 1,
      },
      {
        type: 'sparkle',
        enabled: true,
        items: ['✨'],
        position: 'around',
        animated: true,
        count: 4,
      },
    ],
    transform: {
      rotation: -2,
      scale: 1,
    },
    tags: ['重点', '划重点', '荧光', '标记'],
  },
  {
    id: 'emphasis-victory',
    name: '胜利',
    category: 'emphasis',
    description: '胜利庆祝 - 金色奖杯，彩带飘扬',
    duration: 3000,
    font: {
      family: 'Noto Sans SC',
      weight: 900,
      size: 100,
      letterSpacing: 8,
    },
    color: {
      primary: '#FFD700',
      gradient: 'linear-gradient(180deg, #FFFEF0 0%, #FFD700 25%, #FFC107 50%, #FF9800 75%, #E65100 100%)',
      stroke: { color: '#5D4037', width: 7 },
      shadow: '0 7px 0 #5D4037, 0 14px 0 rgba(0,0,0,0.4), 0 0 80px rgba(255,215,0,1), 0 0 160px rgba(255,152,0,0.7)',
    },
    animation: {
      enter: 'zoom_bounce',
      enterDuration: 600,
      loop: 'glow',
      loopDuration: 1500,
    },
    decorations: [
      {
        type: 'emoji',
        enabled: true,
        items: ['🏆', '👑', '🥇', '🎉'],
        position: 'around',
        animated: true,
        count: 4,
      },
      {
        type: 'confetti',
        enabled: true,
        position: 'above',
        animated: true,
        count: 30,
      },
      {
        type: 'star_burst',
        enabled: true,
        position: 'around',
        animated: true,
        color: '#FFD700',
        count: 12,
      },
    ],
    transform: {
      rotation: 0,
      scale: 1,
    },
    tags: ['胜利', '冠军', '金色', '庆祝'],
  },
]

// ============================================
// 工具函数
// ============================================

/**
 * 根据类别获取炫字预设
 */
export function getDazzlePresetsByCategory(category: DazzleTextCategory): DazzleTextPreset[] {
  return DAZZLE_TEXT_PRESETS.filter(preset => preset.category === category)
}

/**
 * 根据 ID 获取炫字预设
 */
export function getDazzlePresetById(id: string): DazzleTextPreset | undefined {
  return DAZZLE_TEXT_PRESETS.find(preset => preset.id === id)
}

/**
 * 搜索炫字预设
 */
export function searchDazzlePresets(keyword: string): DazzleTextPreset[] {
  const lowerKeyword = keyword.toLowerCase()
  return DAZZLE_TEXT_PRESETS.filter(preset => 
    preset.name.toLowerCase().includes(lowerKeyword) ||
    preset.description.toLowerCase().includes(lowerKeyword) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * 获取入场动画名称
 */
export function getEnterAnimationName(animation: EnterAnimation): string {
  return `dazzle-${animation.replace(/_/g, '-')}`
}

/**
 * 获取循环动画名称
 */
export function getLoopAnimationName(animation: LoopAnimation): string {
  if (animation === 'none') return ''
  return `dazzle-${animation}`
}

/**
 * 将炫字预设转换为 CSS 样式
 */
export function dazzlePresetToCSS(preset: DazzleTextPreset, scale: number = 1): React.CSSProperties {
  const css: React.CSSProperties = {
    fontFamily: `"${preset.font.family}", "Noto Sans SC", sans-serif`,
    fontWeight: preset.font.weight,
    fontSize: `${preset.font.size * scale}px`,
    letterSpacing: preset.font.letterSpacing ? `${preset.font.letterSpacing * scale}px` : undefined,
    lineHeight: preset.font.lineHeight || 1.2,
    display: 'inline-block',
    position: 'relative',
  }

  // 处理颜色
  if (preset.color.gradient) {
    css.backgroundImage = preset.color.gradient
    css.WebkitBackgroundClip = 'text'
    css.WebkitTextFillColor = 'transparent'
    css.backgroundClip = 'text'
  } else {
    css.color = preset.color.primary
  }

  // 处理描边和阴影（非渐变时）
  if (!preset.color.gradient) {
    const shadows: string[] = []
    
    if (preset.color.stroke) {
      const { color, width } = preset.color.stroke
      const sw = width * scale
      // 8 方向描边
      shadows.push(
        `${-sw}px ${-sw}px 0 ${color}`,
        `${sw}px ${-sw}px 0 ${color}`,
        `${-sw}px ${sw}px 0 ${color}`,
        `${sw}px ${sw}px 0 ${color}`,
        `0 ${-sw}px 0 ${color}`,
        `0 ${sw}px 0 ${color}`,
        `${-sw}px 0 0 ${color}`,
        `${sw}px 0 0 ${color}`
      )
    }
    
    if (preset.color.shadow) {
      shadows.push(preset.color.shadow)
    }
    
    if (shadows.length > 0) {
      css.textShadow = shadows.join(', ')
    }
  }

  // 处理变换
  const transforms: string[] = []
  if (preset.transform.rotation) {
    transforms.push(`rotate(${preset.transform.rotation}deg)`)
  }
  if (preset.transform.scale && preset.transform.scale !== 1) {
    transforms.push(`scale(${preset.transform.scale})`)
  }
  if (preset.transform.skew) {
    transforms.push(`skewX(${preset.transform.skew}deg)`)
  }
  if (transforms.length > 0) {
    css.transform = transforms.join(' ')
  }

  return css
}

/**
 * 获取类别标签颜色
 */
export function getCategoryColor(category: DazzleTextCategory): string {
  return DAZZLE_CATEGORY_CONFIG[category].color
}

/**
 * 获取类别背景颜色
 */
export function getCategoryBgColor(category: DazzleTextCategory): string {
  return DAZZLE_CATEGORY_CONFIG[category].bgColor
}












