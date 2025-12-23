/**
 * VEIR 滤镜处理
 * 支持 vocabulary.filters 和 adjustments.video.filter
 */

import type { FilterRef } from '../types';

// ============================================
// 滤镜类型
// ============================================

/**
 * 滤镜配置
 */
export interface FilterConfig {
  /** 滤镜名称 */
  name: string;
  /** CSS filter 函数 */
  cssFunction: string;
  /** 默认强度 */
  defaultIntensity: number;
  /** 强度范围 [min, max] */
  intensityRange: [number, number];
  /** 将强度转换为 CSS 值的函数 */
  toValue: (intensity: number) => string;
}

/**
 * 内置滤镜配置
 */
export const builtinFilters: Record<string, FilterConfig> = {
  // 色彩滤镜
  warm: {
    name: '暖色调',
    cssFunction: 'sepia',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `sepia(${i * 30}%) saturate(${100 + i * 20}%)`,
  },
  cool: {
    name: '冷色调',
    cssFunction: 'hue-rotate',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `hue-rotate(${i * 15}deg) saturate(${100 - i * 10}%)`,
  },
  vintage: {
    name: '复古胶片',
    cssFunction: 'sepia',
    defaultIntensity: 0.5,
    intensityRange: [0, 1],
    toValue: (i) => `sepia(${i * 50}%) contrast(${90 + i * 10}%) brightness(${95 + i * 5}%)`,
  },
  // 亮度对比度
  bright: {
    name: '提亮',
    cssFunction: 'brightness',
    defaultIntensity: 0.2,
    intensityRange: [0, 1],
    toValue: (i) => `brightness(${100 + i * 30}%)`,
  },
  dark: {
    name: '暗调',
    cssFunction: 'brightness',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `brightness(${100 - i * 30}%)`,
  },
  highContrast: {
    name: '高对比度',
    cssFunction: 'contrast',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `contrast(${100 + i * 50}%)`,
  },
  lowContrast: {
    name: '低对比度',
    cssFunction: 'contrast',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `contrast(${100 - i * 30}%)`,
  },
  // 饱和度
  saturate: {
    name: '高饱和',
    cssFunction: 'saturate',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `saturate(${100 + i * 100}%)`,
  },
  desaturate: {
    name: '低饱和',
    cssFunction: 'saturate',
    defaultIntensity: 0.5,
    intensityRange: [0, 1],
    toValue: (i) => `saturate(${100 - i * 60}%)`,
  },
  grayscale: {
    name: '黑白',
    cssFunction: 'grayscale',
    defaultIntensity: 1,
    intensityRange: [0, 1],
    toValue: (i) => `grayscale(${i * 100}%)`,
  },
  // 特效
  blur: {
    name: '模糊',
    cssFunction: 'blur',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `blur(${i * 10}px)`,
  },
  sharpen: {
    name: '锐化',
    cssFunction: 'contrast',
    defaultIntensity: 0.2,
    intensityRange: [0, 1],
    toValue: (i) => `contrast(${100 + i * 20}%) brightness(${100 + i * 5}%)`,
  },
  // 色调
  hueRotate: {
    name: '色相偏移',
    cssFunction: 'hue-rotate',
    defaultIntensity: 0.5,
    intensityRange: [0, 1],
    toValue: (i) => `hue-rotate(${i * 360}deg)`,
  },
  invert: {
    name: '反色',
    cssFunction: 'invert',
    defaultIntensity: 1,
    intensityRange: [0, 1],
    toValue: (i) => `invert(${i * 100}%)`,
  },
  // 电影风格
  cinematic: {
    name: '电影感',
    cssFunction: 'contrast',
    defaultIntensity: 0.5,
    intensityRange: [0, 1],
    toValue: (i) =>
      `contrast(${105 + i * 15}%) saturate(${85 + i * 15}%) brightness(${95 + i * 5}%)`,
  },
  dramatic: {
    name: '戏剧化',
    cssFunction: 'contrast',
    defaultIntensity: 0.5,
    intensityRange: [0, 1],
    toValue: (i) => `contrast(${110 + i * 30}%) saturate(${80 + i * 20}%) brightness(${90 + i * 10}%)`,
  },
  dreamy: {
    name: '梦幻',
    cssFunction: 'blur',
    defaultIntensity: 0.3,
    intensityRange: [0, 1],
    toValue: (i) => `blur(${i * 1}px) brightness(${105 + i * 10}%) saturate(${90 + i * 20}%)`,
  },
};

// ============================================
// 滤镜处理函数
// ============================================

/**
 * 获取滤镜 CSS 值
 */
export function getFilterCSS(filterRef: FilterRef | undefined): string {
  if (!filterRef?.id) return 'none';

  const config = builtinFilters[filterRef.id];
  if (!config) {
    console.warn(`[Filter] Unknown filter: ${filterRef.id}`);
    return 'none';
  }

  const intensity = filterRef.intensity ?? config.defaultIntensity;
  return config.toValue(Math.min(1, Math.max(0, intensity)));
}

/**
 * 获取滤镜配置
 */
export function getFilterConfig(filterId: string): FilterConfig | undefined {
  return builtinFilters[filterId];
}

/**
 * 列出所有可用滤镜
 */
export function listFilters(): { id: string; name: string; category: string }[] {
  return [
    // 色彩
    { id: 'warm', name: '暖色调', category: '色彩' },
    { id: 'cool', name: '冷色调', category: '色彩' },
    { id: 'vintage', name: '复古胶片', category: '色彩' },
    // 亮度
    { id: 'bright', name: '提亮', category: '亮度' },
    { id: 'dark', name: '暗调', category: '亮度' },
    { id: 'highContrast', name: '高对比度', category: '亮度' },
    { id: 'lowContrast', name: '低对比度', category: '亮度' },
    // 饱和度
    { id: 'saturate', name: '高饱和', category: '饱和度' },
    { id: 'desaturate', name: '低饱和', category: '饱和度' },
    { id: 'grayscale', name: '黑白', category: '饱和度' },
    // 特效
    { id: 'blur', name: '模糊', category: '特效' },
    { id: 'hueRotate', name: '色相偏移', category: '特效' },
    { id: 'invert', name: '反色', category: '特效' },
    // 风格
    { id: 'cinematic', name: '电影感', category: '风格' },
    { id: 'dramatic', name: '戏剧化', category: '风格' },
    { id: 'dreamy', name: '梦幻', category: '风格' },
  ];
}

/**
 * 组合多个滤镜
 */
export function combineFilters(filterRefs: FilterRef[]): string {
  const filterStrings = filterRefs
    .map((ref) => {
      if (!ref.id) return null;
      const config = builtinFilters[ref.id];
      if (!config) return null;
      const intensity = ref.intensity ?? config.defaultIntensity;
      return config.toValue(intensity);
    })
    .filter(Boolean);

  return filterStrings.length > 0 ? filterStrings.join(' ') : 'none';
}

/**
 * 将滤镜应用到 Canvas 上下文
 */
export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  filterRef: FilterRef | undefined
): void {
  const filterCSS = getFilterCSS(filterRef);
  ctx.filter = filterCSS;
}

/**
 * 重置 Canvas 滤镜
 */
export function resetCanvasFilter(ctx: CanvasRenderingContext2D): void {
  ctx.filter = 'none';
}

// ============================================
// 滤镜预设组合
// ============================================

/**
 * 预设滤镜组合
 */
export const filterPresets: Record<string, FilterRef[]> = {
  natural: [], // 无滤镜
  warmth: [{ id: 'warm', intensity: 0.3 }],
  coolTone: [{ id: 'cool', intensity: 0.3 }],
  retro: [{ id: 'vintage', intensity: 0.5 }],
  blackAndWhite: [{ id: 'grayscale', intensity: 1 }],
  highKey: [{ id: 'bright', intensity: 0.3 }, { id: 'lowContrast', intensity: 0.2 }],
  lowKey: [{ id: 'dark', intensity: 0.2 }, { id: 'highContrast', intensity: 0.3 }],
  cinema: [{ id: 'cinematic', intensity: 0.5 }],
  drama: [{ id: 'dramatic', intensity: 0.5 }],
  dream: [{ id: 'dreamy', intensity: 0.4 }],
  vibrant: [{ id: 'saturate', intensity: 0.4 }, { id: 'highContrast', intensity: 0.2 }],
  muted: [{ id: 'desaturate', intensity: 0.3 }, { id: 'lowContrast', intensity: 0.2 }],
};

/**
 * 获取预设滤镜 CSS
 */
export function getPresetFilterCSS(presetName: string): string {
  const preset = filterPresets[presetName];
  if (!preset) return 'none';
  return combineFilters(preset);
}






