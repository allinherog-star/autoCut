/**
 * 花字动画定义
 * 包含入场、循环、退场动画的关键帧和配置
 */

import type { AnimationDefinition, EntranceAnimation, LoopAnimation, ExitAnimation } from './types'

// ============================================
// 入场动画
// ============================================

export const ENTRANCE_ANIMATIONS: Record<EntranceAnimation, AnimationDefinition> = {
  none: {
    name: 'none',
    label: '无',
    description: '直接显示',
    defaultDuration: 0,
    keyframes: [
      { offset: 0, properties: { opacity: 1 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
  
  fade: {
    name: 'fade',
    label: '淡入',
    description: '透明度渐变显示',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
  
  'scale-bounce': {
    name: 'scale-bounce',
    label: '放大弹跳',
    description: '从小放大并弹跳',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 0 } },
      { offset: 0.5, properties: { opacity: 1, scale: 1.2 }, easing: 'ease-out' },
      { offset: 0.7, properties: { scale: 0.9 } },
      { offset: 0.85, properties: { scale: 1.05 } },
      { offset: 1, properties: { scale: 1 } },
    ],
  },
  
  'scale-pop': {
    name: 'scale-pop',
    label: '弹出',
    description: '快速弹出效果',
    defaultDuration: 0.3,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 0.3 } },
      { offset: 0.6, properties: { opacity: 1, scale: 1.1 }, easing: 'ease-out' },
      { offset: 1, properties: { scale: 1 } },
    ],
  },
  
  'slide-left': {
    name: 'slide-left',
    label: '左侧飘入',
    description: '从左侧滑入',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateX: -100 } },
      { offset: 1, properties: { opacity: 1, translateX: 0 }, easing: 'ease-out' },
    ],
  },
  
  'slide-right': {
    name: 'slide-right',
    label: '右侧飘入',
    description: '从右侧滑入',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateX: 100 } },
      { offset: 1, properties: { opacity: 1, translateX: 0 }, easing: 'ease-out' },
    ],
  },
  
  'slide-up': {
    name: 'slide-up',
    label: '底部飘入',
    description: '从底部滑入',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateY: 50 } },
      { offset: 1, properties: { opacity: 1, translateY: 0 }, easing: 'ease-out' },
    ],
  },
  
  'slide-down': {
    name: 'slide-down',
    label: '顶部飘入',
    description: '从顶部滑入',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateY: -50 } },
      { offset: 1, properties: { opacity: 1, translateY: 0 }, easing: 'ease-out' },
    ],
  },
  
  flash: {
    name: 'flash',
    label: '闪现',
    description: '快速闪现效果',
    defaultDuration: 0.2,
    keyframes: [
      { offset: 0, properties: { opacity: 0 } },
      { offset: 0.5, properties: { opacity: 1 } },
      { offset: 0.7, properties: { opacity: 0.7 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
  
  explode: {
    name: 'explode',
    label: '爆炸入场',
    description: '爆炸式出现',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 2, blur: 20 } },
      { offset: 0.3, properties: { opacity: 1, scale: 0.9, blur: 5 }, easing: 'ease-out' },
      { offset: 0.5, properties: { scale: 1.1, blur: 0 } },
      { offset: 1, properties: { scale: 1 } },
    ],
  },
  
  'spring-shake': {
    name: 'spring-shake',
    label: '弹簧抖动',
    description: '弹簧式抖动入场',
    defaultDuration: 0.6,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 0.5, rotation: -10 } },
      { offset: 0.3, properties: { opacity: 1, scale: 1.1, rotation: 5 } },
      { offset: 0.5, properties: { scale: 0.95, rotation: -3 } },
      { offset: 0.7, properties: { scale: 1.02, rotation: 2 } },
      { offset: 0.85, properties: { scale: 0.98, rotation: -1 } },
      { offset: 1, properties: { scale: 1, rotation: 0 } },
    ],
  },
  
  typewriter: {
    name: 'typewriter',
    label: '打字机',
    description: '逐字打出效果',
    defaultDuration: 0.05, // 每个字符的时长
    keyframes: [
      { offset: 0, properties: { opacity: 0 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
  
  'char-scatter': {
    name: 'char-scatter',
    label: '逐字散开',
    description: '字符从中心散开',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 0.5, translateX: 0, translateY: 0 } },
      { offset: 0.6, properties: { opacity: 1, scale: 1.1 }, easing: 'ease-out' },
      { offset: 1, properties: { scale: 1 } },
    ],
  },
  
  'char-wave': {
    name: 'char-wave',
    label: '波浪入场',
    description: '字符波浪式入场',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateY: 30 } },
      { offset: 0.5, properties: { opacity: 1, translateY: -10 }, easing: 'ease-out' },
      { offset: 1, properties: { translateY: 0 } },
    ],
  },
  
  'char-bounce': {
    name: 'char-bounce',
    label: '逐字弹跳',
    description: '字符逐个弹跳入场',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateY: -50, scale: 0.5 } },
      { offset: 0.6, properties: { opacity: 1, translateY: 5, scale: 1.1 }, easing: 'ease-out' },
      { offset: 0.8, properties: { translateY: -3, scale: 0.95 } },
      { offset: 1, properties: { translateY: 0, scale: 1 } },
    ],
  },
  
  'rotate-in': {
    name: 'rotate-in',
    label: '旋转入场',
    description: '旋转出现',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 0.5, rotation: -180 } },
      { offset: 1, properties: { opacity: 1, scale: 1, rotation: 0 }, easing: 'ease-out' },
    ],
  },
  
  'flip-in': {
    name: 'flip-in',
    label: '翻转入场',
    description: '3D 翻转入场',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scaleY: 0 } },
      { offset: 0.6, properties: { opacity: 1, scaleY: 1.1 }, easing: 'ease-out' },
      { offset: 1, properties: { scaleY: 1 } },
    ],
  },
  
  'zoom-blur': {
    name: 'zoom-blur',
    label: '模糊放大',
    description: '从模糊到清晰',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 0, scale: 1.5, blur: 20 } },
      { offset: 1, properties: { opacity: 1, scale: 1, blur: 0 }, easing: 'ease-out' },
    ],
  },
  
  glitch: {
    name: 'glitch',
    label: '故障风',
    description: '故障艺术入场',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 0, translateX: -10 } },
      { offset: 0.2, properties: { opacity: 1, translateX: 5 } },
      { offset: 0.4, properties: { translateX: -3, skewX: 5 } },
      { offset: 0.6, properties: { translateX: 2, skewX: -3 } },
      { offset: 0.8, properties: { translateX: -1, skewX: 1 } },
      { offset: 1, properties: { translateX: 0, skewX: 0 } },
    ],
  },
}

// ============================================
// 循环动画
// ============================================

export const LOOP_ANIMATIONS: Record<LoopAnimation, AnimationDefinition> = {
  none: {
    name: 'none',
    label: '无',
    description: '无循环动画',
    defaultDuration: 0,
    keyframes: [],
  },
  
  'breath-glow': {
    name: 'breath-glow',
    label: '呼吸光',
    description: '呼吸式发光效果',
    defaultDuration: 2,
    keyframes: [
      { offset: 0, properties: { opacity: 1 } },
      { offset: 0.5, properties: { opacity: 0.7 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
  
  'neon-flicker': {
    name: 'neon-flicker',
    label: '霓虹闪烁',
    description: '霓虹灯闪烁效果',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { opacity: 1 } },
      { offset: 0.1, properties: { opacity: 0.8 } },
      { offset: 0.2, properties: { opacity: 1 } },
      { offset: 0.3, properties: { opacity: 0.9 } },
      { offset: 0.5, properties: { opacity: 0.7 } },
      { offset: 0.6, properties: { opacity: 1 } },
      { offset: 0.8, properties: { opacity: 0.85 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
  
  'border-flow': {
    name: 'border-flow',
    label: '边框流光',
    description: '边框流动发光',
    defaultDuration: 2,
    keyframes: [
      { offset: 0, properties: {} },
      { offset: 1, properties: {} },
    ],
  },
  
  'q-bounce': {
    name: 'q-bounce',
    label: 'Q弹抖动',
    description: '可爱的Q弹效果',
    defaultDuration: 0.8,
    keyframes: [
      { offset: 0, properties: { scaleY: 1, scaleX: 1 } },
      { offset: 0.25, properties: { scaleY: 0.95, scaleX: 1.05 } },
      { offset: 0.5, properties: { scaleY: 1.05, scaleX: 0.95 } },
      { offset: 0.75, properties: { scaleY: 0.98, scaleX: 1.02 } },
      { offset: 1, properties: { scaleY: 1, scaleX: 1 } },
    ],
  },
  
  float: {
    name: 'float',
    label: '悬浮',
    description: '上下悬浮效果',
    defaultDuration: 2,
    keyframes: [
      { offset: 0, properties: { translateY: 0 } },
      { offset: 0.5, properties: { translateY: -10 } },
      { offset: 1, properties: { translateY: 0 } },
    ],
  },
  
  pulse: {
    name: 'pulse',
    label: '脉冲',
    description: '脉冲缩放效果',
    defaultDuration: 1,
    keyframes: [
      { offset: 0, properties: { scale: 1 } },
      { offset: 0.5, properties: { scale: 1.05 } },
      { offset: 1, properties: { scale: 1 } },
    ],
  },
  
  swing: {
    name: 'swing',
    label: '摇摆',
    description: '左右摇摆效果',
    defaultDuration: 1.5,
    keyframes: [
      { offset: 0, properties: { rotation: 0 } },
      { offset: 0.25, properties: { rotation: 5 } },
      { offset: 0.5, properties: { rotation: 0 } },
      { offset: 0.75, properties: { rotation: -5 } },
      { offset: 1, properties: { rotation: 0 } },
    ],
  },
  
  shake: {
    name: 'shake',
    label: '抖动',
    description: '快速抖动效果',
    defaultDuration: 0.5,
    keyframes: [
      { offset: 0, properties: { translateX: 0 } },
      { offset: 0.1, properties: { translateX: -5 } },
      { offset: 0.2, properties: { translateX: 5 } },
      { offset: 0.3, properties: { translateX: -5 } },
      { offset: 0.4, properties: { translateX: 5 } },
      { offset: 0.5, properties: { translateX: -3 } },
      { offset: 0.6, properties: { translateX: 3 } },
      { offset: 0.7, properties: { translateX: -2 } },
      { offset: 0.8, properties: { translateX: 2 } },
      { offset: 0.9, properties: { translateX: -1 } },
      { offset: 1, properties: { translateX: 0 } },
    ],
  },
  
  rotate: {
    name: 'rotate',
    label: '旋转',
    description: '持续旋转效果',
    defaultDuration: 3,
    keyframes: [
      { offset: 0, properties: { rotation: 0 } },
      { offset: 1, properties: { rotation: 360 } },
    ],
  },
  
  'color-shift': {
    name: 'color-shift',
    label: '色彩变换',
    description: '颜色渐变效果',
    defaultDuration: 3,
    keyframes: [
      { offset: 0, properties: {} },
      { offset: 0.33, properties: {} },
      { offset: 0.66, properties: {} },
      { offset: 1, properties: {} },
    ],
  },
  
  sparkle: {
    name: 'sparkle',
    label: '闪烁',
    description: '星光闪烁效果',
    defaultDuration: 1.5,
    keyframes: [
      { offset: 0, properties: { opacity: 1 } },
      { offset: 0.25, properties: { opacity: 0.8 } },
      { offset: 0.5, properties: { opacity: 1 } },
      { offset: 0.75, properties: { opacity: 0.9 } },
      { offset: 1, properties: { opacity: 1 } },
    ],
  },
}

// ============================================
// 退场动画
// ============================================

export const EXIT_ANIMATIONS: Record<ExitAnimation, AnimationDefinition> = {
  none: {
    name: 'none',
    label: '无',
    description: '直接消失',
    defaultDuration: 0,
    keyframes: [],
  },
  
  fade: {
    name: 'fade',
    label: '淡出',
    description: '透明度渐变消失',
    defaultDuration: 0.3,
    keyframes: [
      { offset: 0, properties: { opacity: 1 } },
      { offset: 1, properties: { opacity: 0 } },
    ],
  },
  
  'scale-shrink': {
    name: 'scale-shrink',
    label: '缩回',
    description: '缩小消失',
    defaultDuration: 0.3,
    keyframes: [
      { offset: 0, properties: { opacity: 1, scale: 1 } },
      { offset: 1, properties: { opacity: 0, scale: 0.5 }, easing: 'ease-in' },
    ],
  },
  
  'flip-out': {
    name: 'flip-out',
    label: '翻转消失',
    description: '翻转退场',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 1, scaleY: 1 } },
      { offset: 1, properties: { opacity: 0, scaleY: 0 }, easing: 'ease-in' },
    ],
  },
  
  explode: {
    name: 'explode',
    label: '爆炸消散',
    description: '爆炸式消散',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 1, scale: 1, blur: 0 } },
      { offset: 0.5, properties: { opacity: 0.8, scale: 1.3, blur: 5 } },
      { offset: 1, properties: { opacity: 0, scale: 2, blur: 20 }, easing: 'ease-out' },
    ],
  },
  
  'slide-out': {
    name: 'slide-out',
    label: '滑出',
    description: '滑出屏幕',
    defaultDuration: 0.3,
    keyframes: [
      { offset: 0, properties: { opacity: 1, translateY: 0 } },
      { offset: 1, properties: { opacity: 0, translateY: -50 }, easing: 'ease-in' },
    ],
  },
  
  'blur-out': {
    name: 'blur-out',
    label: '模糊消失',
    description: '模糊渐隐',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 1, blur: 0 } },
      { offset: 1, properties: { opacity: 0, blur: 20 } },
    ],
  },
  
  'glitch-out': {
    name: 'glitch-out',
    label: '故障消失',
    description: '故障艺术退场',
    defaultDuration: 0.4,
    keyframes: [
      { offset: 0, properties: { opacity: 1, translateX: 0, skewX: 0 } },
      { offset: 0.3, properties: { opacity: 0.8, translateX: -10, skewX: 10 } },
      { offset: 0.5, properties: { opacity: 0.6, translateX: 5, skewX: -5 } },
      { offset: 0.7, properties: { opacity: 0.4, translateX: -3, skewX: 3 } },
      { offset: 1, properties: { opacity: 0, translateX: 20, skewX: 15 } },
    ],
  },
}

// ============================================
// 动画工具函数
// ============================================

/**
 * 获取入场动画定义
 */
export function getEntranceAnimation(type: EntranceAnimation): AnimationDefinition {
  return ENTRANCE_ANIMATIONS[type] || ENTRANCE_ANIMATIONS.none
}

/**
 * 获取循环动画定义
 */
export function getLoopAnimation(type: LoopAnimation): AnimationDefinition {
  return LOOP_ANIMATIONS[type] || LOOP_ANIMATIONS.none
}

/**
 * 获取退场动画定义
 */
export function getExitAnimation(type: ExitAnimation): AnimationDefinition {
  return EXIT_ANIMATIONS[type] || EXIT_ANIMATIONS.none
}

/**
 * 动画选项列表（用于 UI 选择）
 */
export const ENTRANCE_OPTIONS = Object.entries(ENTRANCE_ANIMATIONS).map(([key, value]) => ({
  value: key as EntranceAnimation,
  label: value.label,
  description: value.description,
}))

export const LOOP_OPTIONS = Object.entries(LOOP_ANIMATIONS).map(([key, value]) => ({
  value: key as LoopAnimation,
  label: value.label,
  description: value.description,
}))

export const EXIT_OPTIONS = Object.entries(EXIT_ANIMATIONS).map(([key, value]) => ({
  value: key as ExitAnimation,
  label: value.label,
  description: value.description,
}))








