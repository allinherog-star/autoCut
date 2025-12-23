/**
 * VEIR 合成器类型定义
 * 基于 ModernComposer 新架构
 */

import type { VEIRProject, Clip, Track, Asset as VEIRAsset } from '../types';
import type { AnimationState, PresetAnimationType } from '@/lib/modern-composer';

// ============================================
// 合成器配置
// ============================================

/**
 * 合成导出配置
 */
export interface ExportConfig {
  /** 输出格式 */
  format: 'webm' | 'mp4';
  /** 视频比特率 (bps) */
  videoBitrate?: number;
  /** 音频比特率 (bps) */
  audioBitrate?: number;
  /** 是否包含音频 */
  includeAudio?: boolean;
  /** 输出文件名 */
  filename?: string;
  /** 视频质量 */
  quality?: 'high' | 'medium' | 'low';
}

/**
 * 资源解析器 - 用于解析 VEIR 中的素材路径
 */
export interface AssetResolver {
  /** 解析视频路径 */
  resolveVideo(src: string): Promise<string>;
  /** 解析音频路径 */
  resolveAudio(src: string): Promise<string>;
  /** 解析图片路径 */
  resolveImage(src: string): Promise<string>;
}

/**
 * 默认资源解析器
 */
export const defaultAssetResolver: AssetResolver = {
  async resolveVideo(src: string) { return src; },
  async resolveAudio(src: string) { return src; },
  async resolveImage(src: string) { return src; },
};

// ============================================
// 动画效果映射
// ============================================

/**
 * 动画效果类型
 */
export type AnimationEffectType = 
  | 'fade'
  | 'fade-in'
  | 'fade-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'zoom-in'
  | 'zoom-out'
  | 'bounce'
  | 'bounce-in'
  | 'bounce-out'
  | 'shake'
  | 'pulse'
  | 'glow'
  | 'rotate-in'
  | 'rotate-out';

/**
 * 行为到动画效果的映射
 */
export const behaviorToAnimationMap: Record<string, PresetAnimationType> = {
  'fade-in': 'fade-in',
  'fade-out': 'fade-out',
  'bounce': 'bounce-in',
  'slide-up': 'slide-up',
  'slide-down': 'slide-down',
  'shake': 'shake',
  'pulse': 'pulse',
  'zoom': 'zoom-in',
  'zoom-in': 'zoom-in',
  'zoom-out': 'zoom-out',
};

/**
 * 滤镜效果类型
 */
export type FilterEffectType = 
  | 'brightness'
  | 'contrast'
  | 'saturate'
  | 'grayscale'
  | 'sepia'
  | 'hue-rotate'
  | 'blur'
  | 'invert';

/**
 * 滤镜效果
 */
export interface FilterEffect {
  type: FilterEffectType;
  value: number;
}

/**
 * 滤镜名称到滤镜效果的映射
 */
export const filterNameMap: Record<string, FilterEffectType> = {
  'vintage': 'sepia',
  'warm': 'saturate',
  'cool': 'hue-rotate',
  'bright': 'brightness',
  'dark': 'brightness',
  'blur': 'blur',
  'grayscale': 'grayscale',
};

// ============================================
// 预设样式
// ============================================

/**
 * 文字样式预设
 */
export interface TextStylePreset {
  fontSize: number;
  fontFamily?: string;
  fontWeight?: number;
  color: string;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  marginBottom?: number;
  letterSpacing?: number;
  stroke?: {
    color: string;
    width: number;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
}

/**
 * 内置文字样式预设
 */
export const builtinTextStyles: Record<string, TextStylePreset> = {
  'title-variety': {
    fontSize: 72,
    fontFamily: 'Noto Sans SC',
    fontWeight: 900,
    color: '#FFD700',
    textAlign: 'center',
    verticalAlign: 'middle',
    stroke: { color: '#FF6B6B', width: 4 },
    shadow: { color: 'rgba(0,0,0,0.8)', blur: 10, offsetX: 4, offsetY: 4 },
  },
  'subtitle-bottom': {
    fontSize: 36,
    fontFamily: 'Noto Sans SC',
    fontWeight: 500,
    color: '#FFFFFF',
    textAlign: 'center',
    verticalAlign: 'bottom',
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backgroundPadding: 12,
    backgroundRadius: 6,
  },
  'caption-top': {
    fontSize: 28,
    fontFamily: 'Noto Sans SC',
    fontWeight: 400,
    color: '#FFFFFF',
    textAlign: 'center',
    verticalAlign: 'top',
    marginBottom: 8,
    stroke: { color: '#000000', width: 2 },
  },
  'emphasis-center': {
    fontSize: 56,
    fontFamily: 'Noto Sans SC',
    fontWeight: 800,
    color: '#FF4757',
    textAlign: 'center',
    verticalAlign: 'middle',
    stroke: { color: '#FFFFFF', width: 3 },
    shadow: { color: 'rgba(0,0,0,0.9)', blur: 8, offsetX: 3, offsetY: 3 },
  },
  'neon-glow': {
    fontSize: 64,
    fontFamily: 'Noto Sans SC',
    fontWeight: 700,
    color: '#00FFE5',
    textAlign: 'center',
    verticalAlign: 'middle',
    shadow: { color: '#00FFE5', blur: 20, offsetX: 0, offsetY: 0 },
  },
  'gradient-pop': {
    fontSize: 60,
    fontFamily: 'Noto Sans SC',
    fontWeight: 900,
    color: '#FFFFFF',
    textAlign: 'center',
    verticalAlign: 'middle',
    gradient: { type: 'linear', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'], angle: 45 },
    shadow: { color: 'rgba(0,0,0,0.8)', blur: 6, offsetX: 2, offsetY: 2 },
  },
};

/**
 * 画中画布局预设
 */
export interface PipLayoutPreset {
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: [number, number];
  margin?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

export const builtinPipLayouts: Record<string, PipLayoutPreset> = {
  'pip-corner': {
    anchor: 'bottom-right',
    size: [0.25, 0.25],
    margin: 20,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
  },
  'pip-large': {
    anchor: 'bottom-right',
    size: [0.35, 0.35],
    margin: 16,
    borderRadius: 16,
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 3,
  },
  'pip-top-left': {
    anchor: 'top-left',
    size: [0.25, 0.25],
    margin: 20,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
  },
};

// ============================================
// 解析上下文
// ============================================

/**
 * VEIR 解析上下文
 */
export interface VEIRParseContext {
  project: VEIRProject;
  resolver: AssetResolver;
  /** 已解析的资源映射 */
  resolvedAssets: Map<string, string>;
  /** 错误列表 */
  errors: string[];
  /** 警告列表 */
  warnings: string[];
}

/**
 * 合成结果
 */
export interface CompositionResult {
  /** 输出视频 Blob */
  blob: Blob;
  /** 视频时长 */
  duration: number;
  /** 输出格式 */
  format: string;
  /** 文件大小 */
  size: number;
  /** 下载 URL */
  downloadUrl: string;
}

/**
 * 合成进度回调
 */
export type CompositionProgressCallback = (
  stage: 'parsing' | 'loading' | 'rendering' | 'encoding' | 'complete',
  progress: number,
  message: string
) => void;


