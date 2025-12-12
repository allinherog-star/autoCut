/**
 * 综艺主标题预设
 * "一见你就笑"片头 LOGO 效果
 */

import type { CanvasFancyTextScene } from '../types'

export const VARIETY_MAIN_TITLE_PRESET: CanvasFancyTextScene = {
  id: 'variety-main-title-yijiannijuxiao',
  name: '综艺主标题 - 一见你就笑',
  description: '搞笑综艺片头主标题，包含放射线、速度线、爆炸底板、弹性文字、彩纸粒子、表情装饰',
  
  renderConfig: {
    width: 1920,
    height: 1080,
    fps: 60,
    devicePixelRatio: 2,
    antialias: true,
    transparent: false,
  },
  
  duration: 2.5, // 2.5秒
  loop: false,
  
  layers: [
    // ============================================
    // 层1: 渐变背景
    // ============================================
    {
      id: 'background',
      type: 'background',
      zIndex: 0,
      visible: true,
      opacity: 1,
      config: {
        type: 'linear',
        angle: 135,
        colors: ['#6600CC', '#330066', '#000066'], // 紫色到蓝色
      },
      animation: {
        duration: 0.35,
        keyframes: [
          { time: 0, properties: { scale: 1.4, alpha: 0 }, easing: 'easeOut' },
          { time: 1, properties: { scale: 1, alpha: 1 } },
        ],
      },
    },
    
    // ============================================
    // 层2: 放射线
    // ============================================
    {
      id: 'radial-burst',
      type: 'radial-burst',
      zIndex: 1,
      visible: true,
      opacity: 1,
      config: {
        rayCount: 20,
        color1: '#9933FF',
        color2: '#6600CC',
        rotation: 0,
        opacity: 0.4,
      },
      animation: {
        duration: 0.4,
        keyframes: [
          { time: 0, properties: { scale: 0, rotation: -15, alpha: 0 } },
          { time: 1, properties: { scale: 1, rotation: 0, alpha: 1 }, easing: 'easeOut' },
        ],
      },
    },
    
    // ============================================
    // 层3: 速度线
    // ============================================
    {
      id: 'speed-lines',
      type: 'speed-lines',
      zIndex: 2,
      visible: true,
      opacity: 1,
      config: {
        count: 14,
        colors: ['#FFCC00', '#FF0099', '#00FFFF', '#FFFFFF'],
        minLength: 60,
        maxLength: 160,
        minWidth: 2,
        maxWidth: 6,
        speed: 2.5,
      },
      animation: {
        duration: 0.5,
        keyframes: [
          { time: 0, properties: { alpha: 0 } },
          { time: 0.4, properties: { alpha: 0.6 }, easing: 'easeOut' },
          { time: 1, properties: { alpha: 0 } },
        ],
      },
    },
    
    // ============================================
    // 层4: 彩纸粒子（背景层）
    // ============================================
    {
      id: 'particles-back',
      type: 'particles-back',
      zIndex: 3,
      visible: true,
      opacity: 1,
      config: {
        count: 25,
        colors: ['#FFCC00', '#FF0099', '#00FFFF', '#FF6600', '#00FF66', '#FFFFFF'],
        minSize: 5,
        maxSize: 13,
        shapes: ['rect', 'circle'],
      },
      animation: {
        duration: 1,
        keyframes: [
          { time: 0, properties: { alpha: 0 } },
          { time: 0.5, properties: { alpha: 1 }, easing: 'easeOut' },
          { time: 1, properties: { alpha: 0.3 } },
        ],
      },
    },
    
    // ============================================
    // 层5: 爆炸形状底板
    // ============================================
    {
      id: 'explosion-plate',
      type: 'shape',
      zIndex: 4,
      visible: true,
      opacity: 1,
      config: {
        type: 'explosion',
        width: 640,
        height: 220,
        color: '#FFCC00',
        gradient: {
          type: 'linear',
          colors: ['#FFFF00', '#FFCC00', '#FF9900'],
        },
        strokeColor: '#FF6600',
        strokeWidth: 4,
        roughness: 0.3,
      },
      animation: {
        duration: 0.4,
        keyframes: [
          { time: 0, properties: { scale: 0, rotation: -5, alpha: 0 } },
          { time: 0.3, properties: { scale: 1.1, rotation: 3, alpha: 1 }, easing: 'spring' },
          { time: 0.7, properties: { scale: 0.95, rotation: -1 } },
          { time: 1, properties: { scale: 1, rotation: 0 } },
        ],
      },
    },
    
    // ============================================
    // 层6: 主标题文字
    // ============================================
    {
      id: 'main-title-text',
      type: 'text',
      zIndex: 5,
      visible: true,
      opacity: 1,
      config: {
        text: '一见你就笑',
        fontFamily: 'Noto Sans SC, SimHei, sans-serif',
        fontSize: 112,
        fontWeight: 900,
        
        // 填充渐变
        fillGradient: {
          type: 'linear',
          colors: ['#FFFFFF', '#FFFF99', '#FFCC00', '#FF9900'],
        },
        
        // 多层描边
        strokes: [
          { color: '#000066', width: 18 }, // 最外层：深蓝
          { color: '#FFFFFF', width: 14 }, // 中层：白色
          { color: '#0033CC', width: 10 }, // 内层：蓝色
        ],
        
        // 阴影
        shadows: [
          { color: 'rgba(0,0,0,0.35)', blur: 15, offsetX: 4, offsetY: 6 },
        ],
        
        // 发光
        glow: {
          color: 'rgba(255,255,0,0.5)',
          blur: 12,
        },
      },
      animation: {
        duration: 0.5,
        keyframes: [
          { time: 0, properties: { scale: 0, y: 60, alpha: 0 } },
          { time: 0.3, properties: { scale: 1.2, y: -20, alpha: 1 }, easing: 'spring' },
          { time: 0.5, properties: { scale: 0.9, y: 10 } },
          { time: 0.7, properties: { scale: 1.05, y: -4 } },
          { time: 0.9, properties: { scale: 0.98, y: 2 } },
          { time: 1, properties: { scale: 1, y: 0 } },
        ],
      },
    },
    
    // ============================================
    // 层7: 表情装饰
    // ============================================
    {
      id: 'emoji-decorations',
      type: 'emoji-decoration',
      zIndex: 6,
      visible: true,
      opacity: 1,
      config: {
        emojis: ['😂', '🤣', '😆', '😹', '🤪'],
        positions: [
          { x: -180, y: -80, size: 48, delay: 0.15 },
          { x: 180, y: -80, size: 52, delay: 0.20 },
          { x: -180, y: 80, size: 44, delay: 0.25 },
          { x: 180, y: 80, size: 50, delay: 0.30 },
          { x: 0, y: -140, size: 40, delay: 0.35 },
        ],
      },
      animation: {
        duration: 0.4,
        keyframes: [
          { time: 0, properties: { scale: 0, alpha: 0 } },
          { time: 0.6, properties: { scale: 1.2, alpha: 1 }, easing: 'spring' },
          { time: 1, properties: { scale: 1 } },
        ],
      },
    },
    
    // ============================================
    // 层8: 彩纸粒子（前景层）
    // ============================================
    {
      id: 'particles-front',
      type: 'particles-front',
      zIndex: 7,
      visible: true,
      opacity: 1,
      config: {
        count: 20,
        colors: ['#FFCC00', '#FF0099', '#00FFFF'],
      },
      animation: {
        duration: 1,
        keyframes: [
          { time: 0, properties: { alpha: 0 } },
          { time: 0.6, properties: { alpha: 1 }, easing: 'easeOut' },
          { time: 1, properties: { alpha: 0.5 } },
        ],
      },
    },
  ],
  
  soundEffect: '/sounds/variety-whoosh.mp3',
}

// ============================================
// 可配置版本
// ============================================

export function createVarietyMainTitle(text: string, customColors?: {
  background?: string[]
  burst?: string[]
  text?: string[]
  plate?: string[]
}): CanvasFancyTextScene {
  const preset = { ...VARIETY_MAIN_TITLE_PRESET }
  
  // 修改文字
  const textLayer = preset.layers.find(l => l.id === 'main-title-text')
  if (textLayer) {
    textLayer.config.text = text
  }
  
  // 自定义颜色
  if (customColors) {
    if (customColors.background) {
      const bgLayer = preset.layers.find(l => l.id === 'background')
      if (bgLayer) bgLayer.config.colors = customColors.background
    }
    
    if (customColors.text) {
      const textLayer = preset.layers.find(l => l.id === 'main-title-text')
      if (textLayer) textLayer.config.fillGradient.colors = customColors.text
    }
    
    // 更多自定义...
  }
  
  return preset
}

