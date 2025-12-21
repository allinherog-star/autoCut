/**
 * 花字模版预设
 * 系统内置的花字模版
 */

import type { 
  FancyTextTemplate, 
  FancyTextUsage, 
  FontStyleConfig, 
  VisualStyleConfig,
  TextureConfig,
  ColorValue,
} from './types'

// ============================================
// 字体风格预设
// ============================================

export const FONT_STYLE_PRESETS: FontStyleConfig[] = [
  {
    preset: 'handwritten',
    label: '手写体',
    fontFamily: '"Ma Shan Zheng", "STXingkai", cursive',
    fontWeight: 400,
    letterSpacing: 2,
    defaultColor: { type: 'solid', value: '#333333' },
  },
  {
    preset: 'pop',
    label: 'POP字',
    fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
    fontWeight: 900,
    letterSpacing: 4,
    defaultColor: { 
      type: 'linear-gradient', 
      value: 'linear-gradient(135deg, #FF6B6B, #FFE66D)',
      colors: ['#FF6B6B', '#FFE66D'],
      angle: 135,
    },
    defaultStroke: { enabled: true, color: '#FFFFFF', width: 4 },
    defaultShadow: { enabled: true, color: '#00000040', blur: 8, offsetX: 4, offsetY: 4 },
  },
  {
    preset: 'variety-bold',
    label: '综艺感黑体',
    fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
    fontWeight: 900,
    letterSpacing: 6,
    defaultColor: { type: 'solid', value: '#FFD700' },
    defaultStroke: { enabled: true, color: '#000000', width: 6 },
    defaultShadow: { enabled: true, color: '#FF4500', blur: 0, offsetX: 4, offsetY: 4 },
  },
  {
    preset: 'fun-bold',
    label: '趣味粗体',
    fontFamily: '"ZCOOL KuaiLe", "Comic Sans MS", cursive',
    fontWeight: 700,
    letterSpacing: 3,
    defaultColor: { type: 'solid', value: '#FF69B4' },
    defaultGlow: { enabled: true, color: '#FF69B480', blur: 15, spread: 5 },
  },
  {
    preset: 'bouncy',
    label: 'Q弹体',
    fontFamily: '"ZCOOL QingKe HuangYou", sans-serif',
    fontWeight: 400,
    letterSpacing: 2,
    defaultColor: { type: 'solid', value: '#4ECDC4' },
    defaultShadow: { enabled: true, color: '#00000030', blur: 4, offsetX: 2, offsetY: 2 },
  },
  {
    preset: 'cyber-neon',
    label: '赛博霓虹',
    fontFamily: '"Orbitron", "Noto Sans SC", sans-serif',
    fontWeight: 700,
    letterSpacing: 8,
    defaultColor: { type: 'solid', value: '#00FFFF' },
    defaultGlow: { enabled: true, color: '#00FFFF', blur: 20, spread: 10 },
    defaultStroke: { enabled: true, color: '#FF00FF', width: 2 },
  },
  {
    preset: 'cute-round',
    label: '可爱圆体',
    fontFamily: '"ZCOOL XiaoWei", "Yuanti SC", sans-serif',
    fontWeight: 500,
    letterSpacing: 2,
    defaultColor: { type: 'solid', value: '#FFB6C1' },
    defaultShadow: { enabled: true, color: '#FF69B450', blur: 10, offsetX: 0, offsetY: 3 },
  },
  {
    preset: 'chalk',
    label: '粉笔体',
    fontFamily: '"Noto Serif SC", "SimSun", serif',
    fontWeight: 400,
    letterSpacing: 1,
    defaultColor: { type: 'solid', value: '#FFFFFF' },
    defaultShadow: { enabled: true, color: '#00000020', blur: 2, offsetX: 1, offsetY: 1 },
  },
]

// ============================================
// 视觉风格预设
// ============================================

export const VISUAL_STYLE_PRESETS: VisualStyleConfig[] = [
  {
    preset: 'funny',
    label: '搞怪',
    emoji: '🤪',
    suggestedColors: [
      { type: 'solid', value: '#FFD700' },
      { type: 'solid', value: '#FF6B6B' },
    ],
    suggestedAnimations: {
      entrance: ['spring-shake', 'char-bounce', 'explode'],
      loop: ['shake', 'q-bounce'],
      exit: ['explode', 'glitch-out'],
    },
    suggestedDecorations: ['emoji', 'star-burst'],
  },
  {
    preset: 'dramatic',
    label: '戏精',
    emoji: '🎭',
    suggestedColors: [
      { type: 'solid', value: '#8B0000' },
      { type: 'linear-gradient', value: 'linear-gradient(45deg, #FF0000, #FFD700)', colors: ['#FF0000', '#FFD700'], angle: 45 },
    ],
    suggestedAnimations: {
      entrance: ['scale-bounce', 'flip-in', 'rotate-in'],
      loop: ['pulse', 'swing'],
      exit: ['flip-out', 'scale-shrink'],
    },
    suggestedDecorations: ['sparkle', 'star-burst'],
  },
  {
    preset: 'hilarious',
    label: '爆笑',
    emoji: '😂',
    suggestedColors: [
      { type: 'solid', value: '#FFE135' },
      { type: 'solid', value: '#FF4500' },
    ],
    suggestedAnimations: {
      entrance: ['spring-shake', 'char-scatter', 'glitch'],
      loop: ['shake', 'q-bounce', 'neon-flicker'],
      exit: ['explode', 'glitch-out'],
    },
    suggestedDecorations: ['emoji', 'confetti', 'star-burst'],
  },
  {
    preset: 'inspiring',
    label: '励志',
    emoji: '💪',
    suggestedColors: [
      { type: 'linear-gradient', value: 'linear-gradient(135deg, #667eea, #764ba2)', colors: ['#667eea', '#764ba2'], angle: 135 },
      { type: 'solid', value: '#FFD700' },
    ],
    suggestedAnimations: {
      entrance: ['scale-bounce', 'slide-up', 'zoom-blur'],
      loop: ['breath-glow', 'pulse'],
      exit: ['fade', 'blur-out'],
    },
    suggestedDecorations: ['sparkle', 'particle'],
  },
  {
    preset: 'healing',
    label: '治愈',
    emoji: '🌸',
    suggestedColors: [
      { type: 'solid', value: '#FFB6C1' },
      { type: 'linear-gradient', value: 'linear-gradient(135deg, #a8edea, #fed6e3)', colors: ['#a8edea', '#fed6e3'], angle: 135 },
    ],
    suggestedAnimations: {
      entrance: ['fade', 'slide-up', 'char-wave'],
      loop: ['float', 'breath-glow'],
      exit: ['fade', 'blur-out'],
    },
    suggestedDecorations: ['sparkle', 'particle'],
  },
  {
    preset: 'glowing',
    label: '炫光',
    emoji: '✨',
    suggestedColors: [
      { type: 'solid', value: '#FFD700' },
      { type: 'linear-gradient', value: 'linear-gradient(45deg, #f093fb, #f5576c)', colors: ['#f093fb', '#f5576c'], angle: 45 },
    ],
    suggestedAnimations: {
      entrance: ['flash', 'zoom-blur', 'scale-pop'],
      loop: ['neon-flicker', 'sparkle', 'color-shift'],
      exit: ['blur-out', 'fade'],
    },
    suggestedDecorations: ['sparkle', 'particle', 'star-burst'],
  },
  {
    preset: 'tech',
    label: '科技',
    emoji: '🤖',
    suggestedColors: [
      { type: 'solid', value: '#00FFFF' },
      { type: 'linear-gradient', value: 'linear-gradient(90deg, #00d2ff, #3a7bd5)', colors: ['#00d2ff', '#3a7bd5'], angle: 90 },
    ],
    suggestedAnimations: {
      entrance: ['glitch', 'typewriter', 'zoom-blur'],
      loop: ['neon-flicker', 'border-flow'],
      exit: ['glitch-out', 'blur-out'],
    },
    suggestedDecorations: ['particle', 'electric'],
  },
  {
    preset: 'variety-show',
    label: '综艺感',
    emoji: '🎬',
    suggestedColors: [
      { type: 'solid', value: '#FFD700' },
      { type: 'solid', value: '#FF4500' },
      { type: 'linear-gradient', value: 'linear-gradient(45deg, #FF6B6B, #FFE66D)', colors: ['#FF6B6B', '#FFE66D'], angle: 45 },
    ],
    suggestedAnimations: {
      entrance: ['scale-bounce', 'spring-shake', 'char-bounce'],
      loop: ['q-bounce', 'shake', 'pulse'],
      exit: ['scale-shrink', 'explode'],
    },
    suggestedDecorations: ['emoji', 'star-burst', 'confetti'],
  },
  {
    preset: 'magic',
    label: '魔法',
    emoji: '🪄',
    suggestedColors: [
      { type: 'linear-gradient', value: 'linear-gradient(135deg, #667eea, #764ba2)', colors: ['#667eea', '#764ba2'], angle: 135 },
      { type: 'solid', value: '#9B59B6' },
    ],
    suggestedAnimations: {
      entrance: ['char-scatter', 'rotate-in', 'zoom-blur'],
      loop: ['sparkle', 'float', 'color-shift'],
      exit: ['explode', 'blur-out'],
    },
    suggestedDecorations: ['sparkle', 'particle', 'star-burst'],
  },
  {
    preset: 'fire',
    label: '火焰',
    emoji: '🔥',
    suggestedColors: [
      { type: 'linear-gradient', value: 'linear-gradient(180deg, #FF4500, #FFD700)', colors: ['#FF4500', '#FFD700'], angle: 180 },
      { type: 'solid', value: '#FF4500' },
    ],
    suggestedAnimations: {
      entrance: ['explode', 'scale-bounce', 'flash'],
      loop: ['neon-flicker', 'pulse'],
      exit: ['explode', 'fade'],
    },
    suggestedDecorations: ['fire', 'particle'],
  },
]

// ============================================
// 质感预设
// ============================================

export const TEXTURE_PRESETS: TextureConfig[] = [
  {
    preset: 'metallic',
    label: '金属',
    icon: '🔩',
    defaultColor: { 
      type: 'linear-gradient', 
      value: 'linear-gradient(180deg, #D4AF37, #F5D061, #D4AF37)',
      colors: ['#D4AF37', '#F5D061', '#D4AF37'],
      angle: 180,
    },
    defaultShadow: { enabled: true, color: '#00000060', blur: 4, offsetX: 2, offsetY: 3 },
  },
  {
    preset: 'glass',
    label: '玻璃',
    icon: '🪟',
    cssFilter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
    defaultColor: { type: 'solid', value: '#FFFFFF80' },
    defaultGlow: { enabled: true, color: '#FFFFFF60', blur: 15, spread: 5 },
  },
  {
    preset: 'neon',
    label: '霓虹',
    icon: '💡',
    defaultColor: { type: 'solid', value: '#00FFFF' },
    defaultGlow: { enabled: true, color: '#00FFFF', blur: 25, spread: 15 },
  },
  {
    preset: 'gradient',
    label: '渐变',
    icon: '🌈',
    defaultColor: { 
      type: 'linear-gradient', 
      value: 'linear-gradient(135deg, #667eea, #764ba2)',
      colors: ['#667eea', '#764ba2'],
      angle: 135,
    },
  },
  {
    preset: 'fluffy',
    label: '毛绒',
    icon: '🧸',
    defaultColor: { type: 'solid', value: '#FFB6C1' },
    defaultShadow: { enabled: true, color: '#FF69B430', blur: 15, offsetX: 0, offsetY: 5 },
  },
  {
    preset: 'cyber',
    label: '赛博',
    icon: '💾',
    defaultColor: { type: 'solid', value: '#FF00FF' },
    defaultGlow: { enabled: true, color: '#FF00FF', blur: 20, spread: 10 },
  },
  {
    preset: '3d',
    label: '3D立体',
    icon: '🎲',
    defaultColor: { type: 'solid', value: '#FF6B6B' },
    defaultShadow: { enabled: true, color: '#00000060', blur: 0, offsetX: 5, offsetY: 5 },
  },
]

// ============================================
// 花字模版预设
// ============================================

export const FANCY_TEXT_TEMPLATE_PRESETS: FancyTextTemplate[] = [
  // ========== 标题类 ==========
  {
    id: 'title-variety-canvas-yijiannijuxiao',
    name: '综艺主标题(Canvas)',
    description: '一见你就笑 - 高性能Canvas渲染，包含放射线、爆炸底板、粒子特效',
    usage: 'title',
    visualStyles: ['variety-show', 'funny', 'cute'],
    renderer: 'canvas',
    canvasPresetId: 'variety-main-title',
    globalParams: {
      text: '一见你就笑',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 100,
      fontWeight: 900,
      letterSpacing: 0,
      lineHeight: 1,
      color: { type: 'solid', value: '#FFD700' },
      stroke: { enabled: true, color: '#000000', width: 0 },
      shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'none',
        entranceDuration: 0,
        entranceEasing: 'linear',
        entranceDelay: 0,
        loop: 'none',
        loopDuration: 0,
        loopDelay: 0,
        exit: 'none',
        exitDuration: 0,
        exitEasing: 'linear',
      },
      decorations: [],
      totalDuration: 2.5,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2025-12-21',
    updatedAt: '2025-12-21',
  },

  {
    id: 'title-variety-pop',
    name: '综艺弹出标题',
    description: '适合综艺节目风格的大标题，弹跳入场配合Q弹效果',
    usage: 'title',
    visualStyles: ['variety-show', 'funny'],
    globalParams: {
      text: '综艺标题',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 72,
      fontWeight: 900,
      letterSpacing: 8,
      lineHeight: 1.2,
      color: { type: 'solid', value: '#FFD700' },
      stroke: { enabled: true, color: '#000000', width: 6 },
      shadow: { enabled: true, color: '#FF4500', blur: 0, offsetX: 6, offsetY: 6 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'scale-bounce',
        entranceDuration: 0.5,
        entranceEasing: 'spring',
        entranceDelay: 0,
        loop: 'q-bounce',
        loopDuration: 0.8,
        loopDelay: 0,
        exit: 'scale-shrink',
        exitDuration: 0.3,
        exitEasing: 'ease-in',
      },
      decorations: [
        { type: 'star-burst', enabled: true, position: 'around', color: '#FFD700', size: 30, count: 6 },
      ],
      soundEffect: 'pop',
      totalDuration: 3,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  {
    id: 'title-neon-glow',
    name: '霓虹发光标题',
    description: '赛博朋克风格霓虹发光效果',
    usage: 'title',
    visualStyles: ['tech', 'glowing'],
    globalParams: {
      text: '霓虹标题',
      fontFamily: '"Orbitron", sans-serif',
      fontSize: 64,
      fontWeight: 700,
      letterSpacing: 10,
      lineHeight: 1.2,
      color: { type: 'solid', value: '#00FFFF' },
      stroke: { enabled: true, color: '#FF00FF', width: 2 },
      shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0 },
      glow: { enabled: true, color: '#00FFFF', blur: 30, spread: 15 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'glitch',
        entranceDuration: 0.5,
        entranceEasing: 'ease-out',
        entranceDelay: 0,
        loop: 'neon-flicker',
        loopDuration: 0.5,
        loopDelay: 2,
        exit: 'glitch-out',
        exitDuration: 0.4,
        exitEasing: 'ease-in',
      },
      decorations: [
        { type: 'electric', enabled: true, position: 'around', color: '#00FFFF', size: 20, count: 4 },
      ],
      totalDuration: 3,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  // ========== 章节标题类 ==========
  {
    id: 'chapter-step-number',
    name: '步骤编号标题',
    description: '适合教程视频的步骤编号标题',
    usage: 'chapter_title',
    visualStyles: ['inspiring'],
    globalParams: {
      text: '第一步',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 48,
      fontWeight: 700,
      letterSpacing: 4,
      lineHeight: 1.3,
      color: { 
        type: 'linear-gradient', 
        value: 'linear-gradient(135deg, #667eea, #764ba2)',
        colors: ['#667eea', '#764ba2'],
        angle: 135,
      },
      stroke: { enabled: false, color: '', width: 0 },
      shadow: { enabled: true, color: '#00000030', blur: 10, offsetX: 0, offsetY: 4 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'slide-left',
        entranceDuration: 0.4,
        entranceEasing: 'ease-out',
        entranceDelay: 0,
        loop: 'none',
        loopDuration: 0,
        loopDelay: 0,
        exit: 'fade',
        exitDuration: 0.3,
        exitEasing: 'ease-out',
      },
      decorations: [],
      totalDuration: 2,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  // ========== 强调特写类 ==========
  {
    id: 'emphasis-explosion',
    name: '爆炸强调',
    description: '爆炸式入场的强调文字',
    usage: 'emphasis',
    visualStyles: ['dramatic', 'hilarious'],
    globalParams: {
      text: '重点！',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 80,
      fontWeight: 900,
      letterSpacing: 4,
      lineHeight: 1.2,
      color: { type: 'solid', value: '#FF0000' },
      stroke: { enabled: true, color: '#FFFFFF', width: 4 },
      shadow: { enabled: true, color: '#00000060', blur: 10, offsetX: 4, offsetY: 4 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: -5,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'explode',
        entranceDuration: 0.5,
        entranceEasing: 'ease-out',
        entranceDelay: 0,
        loop: 'shake',
        loopDuration: 0.5,
        loopDelay: 1,
        exit: 'explode',
        exitDuration: 0.4,
        exitEasing: 'ease-out',
      },
      decorations: [
        { type: 'star-burst', enabled: true, position: 'behind', color: '#FFD700', size: 50, count: 8 },
      ],
      soundEffect: 'explosion',
      totalDuration: 2,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  {
    id: 'emphasis-shake',
    name: '抖动强调',
    description: '持续抖动的强调文字',
    usage: 'emphasis',
    visualStyles: ['funny', 'variety-show'],
    globalParams: {
      text: '震惊！',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 64,
      fontWeight: 900,
      letterSpacing: 6,
      lineHeight: 1.2,
      color: { type: 'solid', value: '#FFE135' },
      stroke: { enabled: true, color: '#FF4500', width: 4 },
      shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0 },
      glow: { enabled: true, color: '#FFE13560', blur: 15, spread: 5 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'spring-shake',
        entranceDuration: 0.6,
        entranceEasing: 'spring',
        entranceDelay: 0,
        loop: 'shake',
        loopDuration: 0.5,
        loopDelay: 0.5,
        exit: 'scale-shrink',
        exitDuration: 0.3,
        exitEasing: 'ease-in',
      },
      decorations: [
        { type: 'emoji', enabled: true, position: 'around', items: ['😱', '❗', '⚡'], count: 3 },
      ],
      soundEffect: 'whoosh',
      totalDuration: 2.5,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  // ========== 操作指引类 ==========
  {
    id: 'guide-arrow',
    name: '箭头指引',
    description: '带箭头装饰的操作指引文字',
    usage: 'guide',
    visualStyles: ['tech'],
    globalParams: {
      text: '点击这里',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 32,
      fontWeight: 600,
      letterSpacing: 2,
      lineHeight: 1.4,
      color: { type: 'solid', value: '#FFFFFF' },
      stroke: { enabled: false, color: '', width: 0 },
      shadow: { enabled: true, color: '#00000060', blur: 8, offsetX: 2, offsetY: 2 },
      glow: { enabled: true, color: '#00BFFF60', blur: 10, spread: 3 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'slide-right',
        entranceDuration: 0.3,
        entranceEasing: 'ease-out',
        entranceDelay: 0,
        loop: 'pulse',
        loopDuration: 1,
        loopDelay: 0,
        exit: 'slide-out',
        exitDuration: 0.3,
        exitEasing: 'ease-in',
      },
      decorations: [],
      totalDuration: 3,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  // ========== 人物介绍类 ==========
  {
    id: 'person-intro-elegant',
    name: '优雅人物介绍',
    description: '适合正式场合的人物介绍',
    usage: 'person_intro',
    visualStyles: ['inspiring'],
    globalParams: {
      text: '张三 | 资深设计师',
      fontFamily: '"Noto Serif SC", serif',
      fontSize: 36,
      fontWeight: 500,
      letterSpacing: 4,
      lineHeight: 1.5,
      color: { type: 'solid', value: '#FFFFFF' },
      stroke: { enabled: false, color: '', width: 0 },
      shadow: { enabled: true, color: '#00000040', blur: 10, offsetX: 0, offsetY: 4 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'fade',
        entranceDuration: 0.5,
        entranceEasing: 'ease-out',
        entranceDelay: 0,
        loop: 'none',
        loopDuration: 0,
        loopDelay: 0,
        exit: 'fade',
        exitDuration: 0.4,
        exitEasing: 'ease-out',
      },
      decorations: [
        { type: 'underline', enabled: true, position: 'front', color: '#FFD700', size: 3 },
      ],
      totalDuration: 4,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  // ========== 重点强调类 ==========
  {
    id: 'cta-like-subscribe',
    name: '点赞关注提示',
    description: '引导用户点赞关注的互动文字',
    usage: 'emphasis',
    visualStyles: ['funny', 'variety-show'],
    globalParams: {
      text: '点赞关注！',
      fontFamily: '"ZCOOL KuaiLe", cursive',
      fontSize: 40,
      fontWeight: 400,
      letterSpacing: 2,
      lineHeight: 1.3,
      color: { type: 'solid', value: '#FF69B4' },
      stroke: { enabled: true, color: '#FFFFFF', width: 3 },
      shadow: { enabled: true, color: '#FF69B440', blur: 10, offsetX: 0, offsetY: 3 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: -3,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'char-bounce',
        entranceDuration: 0.4,
        entranceEasing: 'spring',
        entranceDelay: 0,
        loop: 'swing',
        loopDuration: 1.5,
        loopDelay: 0,
        exit: 'scale-shrink',
        exitDuration: 0.3,
        exitEasing: 'ease-in',
      },
      decorations: [
        { type: 'emoji', enabled: true, position: 'around', items: ['👍', '❤️', '⭐'], count: 3 },
        { type: 'sparkle', enabled: true, position: 'around', color: '#FFD700', count: 10 },
      ],
      soundEffect: 'ding',
      totalDuration: 3,
    },
    perCharacter: {
      enabled: true,
      characters: [
        { charIndex: 0, offsetX: 0, offsetY: -5, scale: 1.1, rotation: -5, entranceDelay: 0, fontSizeMultiplier: 1 },
        { charIndex: 1, offsetX: 0, offsetY: 0, scale: 1, rotation: 0, entranceDelay: 0.05, fontSizeMultiplier: 1 },
        { charIndex: 2, offsetX: 0, offsetY: 5, scale: 1.05, rotation: 3, entranceDelay: 0.1, fontSizeMultiplier: 1 },
        { charIndex: 3, offsetX: 0, offsetY: 0, scale: 1, rotation: -2, entranceDelay: 0.15, fontSizeMultiplier: 1 },
      ],
    },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
  
  // ========== 详细描述类 ==========
  {
    id: 'dialogue-bubble',
    name: '对话气泡',
    description: '带气泡背景的对话字幕',
    usage: 'detail_description',
    visualStyles: ['cute'],
    globalParams: {
      text: '你好呀~',
      fontFamily: '"ZCOOL XiaoWei", sans-serif',
      fontSize: 28,
      fontWeight: 500,
      letterSpacing: 1,
      lineHeight: 1.4,
      color: { type: 'solid', value: '#333333' },
      stroke: { enabled: false, color: '', width: 0 },
      shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0 },
      glow: { enabled: false, color: '', blur: 0, spread: 0 },
      rotation: 0,
      skewX: 0,
      skewY: 0,
      animation: {
        entrance: 'scale-pop',
        entranceDuration: 0.3,
        entranceEasing: 'ease-out',
        entranceDelay: 0,
        loop: 'none',
        loopDuration: 0,
        loopDelay: 0,
        exit: 'fade',
        exitDuration: 0.2,
        exitEasing: 'ease-out',
      },
      decorations: [
        { type: 'speech-bubble', enabled: true, position: 'behind', color: '#FFFFFF' },
      ],
      totalDuration: 2,
    },
    perCharacter: { enabled: false, characters: [] },
    source: 'system',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
]

// ============================================
// 工具函数
// ============================================

/**
 * 根据用途获取推荐模版
 */
export function getTemplatesByUsage(usage: FancyTextUsage): FancyTextTemplate[] {
  return FANCY_TEXT_TEMPLATE_PRESETS.filter(t => t.usage === usage)
}

/**
 * 根据视觉风格获取推荐模版
 */
export function getTemplatesByStyle(style: string): FancyTextTemplate[] {
  return FANCY_TEXT_TEMPLATE_PRESETS.filter(t => t.visualStyles.includes(style))
}

/**
 * 获取所有用途的标签配置
 */
export const USAGE_LABELS: Record<FancyTextUsage, { label: string; icon: string; description: string }> = {
  title: { label: '标题', icon: '📌', description: '视频开头主标题' },
  chapter_title: { label: '章节段落', icon: '📋', description: '章节段落分隔' },
  guide: { label: '操作步骤', icon: '👉', description: '操作步骤引导' },
  emphasis: { label: '重点强调', icon: '⚡', description: '重点内容强调' },
  person_intro: { label: '人物介绍', icon: '👤', description: '人物出场介绍' },
  detail_description: { label: '详细描述', icon: '📝', description: '详细说明文字' },
}

