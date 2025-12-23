/**
 * VEIR 转换器
 * 将 VEIR DSL 转换为 ModernComposer 可用的配置
 */

import type { VEIRProject, Clip, Track, Asset as VEIRAssetDef } from '../types';
import type { PresetAnimationType } from '@/lib/modern-composer';
import {
  VEIRParseContext,
  AssetResolver,
  defaultAssetResolver,
  behaviorToAnimationMap,
  builtinTextStyles,
  TextStylePreset,
  FilterEffect,
  filterNameMap,
} from './types';

// ============================================
// 类型定义
// ============================================

/**
 * 转换后的资产配置
 */
export interface ConvertedAsset {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text';
  src?: string;
  content?: string;
  timelineStart: number;
  duration: number;
  clipStart?: number;
  clipEnd?: number;
  volume?: number;
  muted?: boolean;
  speed?: number;
  filters?: FilterEffect[];
  track?: number;
  position?: { x: number | string; y: number | string };
  size?: { width: number | string; height: number | string };
  opacity?: number;
  animation?: {
    enter: PresetAnimationType;
    exit?: PresetAnimationType;
    enterDuration?: number;
    exitDuration?: number;
  };
  style?: TextStylePreset;
}

/**
 * 转换后的项目配置
 */
export interface ConvertedProject {
  id: string;
  name: string;
  output: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    format: 'webm' | 'mp4';
    quality: 'high' | 'medium' | 'low';
  };
  assets: ConvertedAsset[];
  backgroundColor?: string;
}

// ============================================
// 转换器核心
// ============================================

/**
 * 将 VEIR 项目转换为 ModernComposer 可用的配置
 */
export async function convertVEIRToModern(
  veir: VEIRProject,
  resolver: AssetResolver = defaultAssetResolver
): Promise<{ project: ConvertedProject; context: VEIRParseContext }> {
  const context: VEIRParseContext = {
    project: veir,
    resolver,
    resolvedAssets: new Map(),
    errors: [],
    warnings: [],
  };

  // 创建基础项目结构
  const convertedProject: ConvertedProject = {
    id: `veir-${Date.now()}`,
    name: 'VEIR Composition',
    output: {
      width: veir.meta.resolution[0],
      height: veir.meta.resolution[1],
      fps: veir.meta.fps,
      duration: veir.meta.duration,
      format: 'mp4',
      quality: 'high',
    },
    assets: [],
    backgroundColor: '#000000',
  };

  // 解析并转换所有轨道和片段
  const allAssets: ConvertedAsset[] = [];
  
  for (const track of veir.timeline.tracks) {
    for (const clip of track.clips) {
      const asset = await convertClipToAsset(clip, track, context);
      if (asset) {
        allAssets.push(asset);
      }
    }
  }

  // 按轨道层级排序
  allAssets.sort((a, b) => (a.track ?? 0) - (b.track ?? 0));
  convertedProject.assets = allAssets;

  return { project: convertedProject, context };
}

/**
 * 将单个 Clip 转换为 Asset
 */
async function convertClipToAsset(
  clip: Clip,
  track: Track,
  context: VEIRParseContext
): Promise<ConvertedAsset | null> {
  const { project, resolver } = context;
  const assetDef = project.assets.assets[clip.asset];

  if (!assetDef) {
    context.warnings.push(`Asset not found: ${clip.asset}`);
    return null;
  }

  const duration = clip.time.end - clip.time.start;
  const adjustment = project.adjustments?.clipOverrides?.[clip.id];

  switch (assetDef.type) {
    case 'video':
      return await convertVideoAsset(clip, track, assetDef, duration, adjustment, context);
    
    case 'audio':
      return await convertAudioAsset(clip, track, assetDef, duration, context);
    
    case 'image':
      return await convertImageAsset(clip, track, assetDef, duration, adjustment, context);
    
    case 'text':
      return convertTextAsset(clip, track, assetDef, duration, adjustment, context);
    
    default:
      context.warnings.push(`Unknown asset type: ${(assetDef as { type: string }).type}`);
      return null;
  }
}

/**
 * 转换视频素材
 */
async function convertVideoAsset(
  clip: Clip,
  track: Track,
  assetDef: VEIRAssetDef,
  duration: number,
  adjustment: ReturnType<typeof getAdjustment>,
  context: VEIRParseContext
): Promise<ConvertedAsset | null> {
  if (!assetDef.src) {
    context.errors.push(`Video asset missing src: ${clip.asset}`);
    return null;
  }

  const resolvedSrc = await context.resolver.resolveVideo(assetDef.src);
  context.resolvedAssets.set(clip.asset, resolvedSrc);

  // 处理滤镜
  const filters: FilterEffect[] = [];
  if (adjustment?.video?.filter) {
    const filterDef = adjustment.video.filter;
    const filterType = mapFilterName(filterDef.id || 'warm');
    filters.push({
      type: filterType,
      value: filterDef.intensity ? filterDef.intensity * 100 : 50,
    });
  }

  // 处理时间偏移
  const timeOffset = adjustment?.time?.offset || 0;

  // 处理时间重映射（变速）
  const timeWarp = adjustment?.video?.timeWarp;
  const speedFromTimeWarp = deriveVideoSpeedFromTimeWarp(timeWarp, duration, context);

  return {
    id: clip.id,
    type: 'video',
    src: resolvedSrc,
    timelineStart: clip.time.start + timeOffset,
    duration,
    clipStart: 0,
    clipEnd: duration,
    volume: 1,
    muted: false,
    speed: speedFromTimeWarp ?? 1,
    filters: filters.length > 0 ? filters : undefined,
    track: track.layer,
  };
}

/**
 * 转换音频素材
 */
async function convertAudioAsset(
  clip: Clip,
  track: Track,
  assetDef: VEIRAssetDef,
  duration: number,
  context: VEIRParseContext
): Promise<ConvertedAsset | null> {
  if (!assetDef.src) {
    context.warnings.push(`Audio asset missing src: ${clip.asset}`);
    return null;
  }

  const resolvedSrc = await context.resolver.resolveAudio(assetDef.src);
  context.resolvedAssets.set(clip.asset, resolvedSrc);

  return {
    id: clip.id,
    type: 'audio',
    src: resolvedSrc,
    timelineStart: clip.time.start,
    duration,
    clipStart: 0,
    volume: 0.7,
    track: track.layer,
  };
}

/**
 * 转换图片素材
 */
async function convertImageAsset(
  clip: Clip,
  track: Track,
  assetDef: VEIRAssetDef,
  duration: number,
  adjustment: ReturnType<typeof getAdjustment>,
  context: VEIRParseContext
): Promise<ConvertedAsset | null> {
  if (!assetDef.src) {
    context.errors.push(`Image asset missing src: ${clip.asset}`);
    return null;
  }

  const resolvedSrc = await context.resolver.resolveImage(assetDef.src);
  context.resolvedAssets.set(clip.asset, resolvedSrc);

  // 获取动画效果
  const animation = getAnimationFromBehavior(clip.behavior);

  // 处理变换
  const transform = adjustment?.video?.transform;
  const scale = transform?.scale ?? 1;
  const offset = transform?.offset ?? [0, 0];

  return {
    id: clip.id,
    type: 'image',
    src: resolvedSrc,
    timelineStart: clip.time.start,
    duration,
    position: { x: offset[0], y: offset[1] },
    size: { width: `${scale * 100}%`, height: `${scale * 100}%` },
    opacity: 1,
    animation,
    track: track.layer,
  };
}

/**
 * 转换文字素材
 */
function convertTextAsset(
  clip: Clip,
  track: Track,
  assetDef: VEIRAssetDef,
  duration: number,
  adjustment: ReturnType<typeof getAdjustment>,
  context: VEIRParseContext
): ConvertedAsset | null {
  const content = assetDef.content || '';
  if (!content) {
    context.warnings.push(`Text asset has no content: ${clip.asset}`);
    return null;
  }

  // 获取预设样式
  const presetId = clip.expression?.preset;
  const intensity = clip.expression?.intensity ?? 0.8;
  const style = getTextStyleFromPreset(presetId, intensity, context);

  // 获取动画效果
  const animation = getAnimationFromBehavior(clip.behavior);

  // 处理位置（来自预设或默认）
  const preset = presetId ? context.project.vocabulary.presets[presetId] : null;
  const position = getPositionFromAnchor(preset?.anchor as string);

  return {
    id: clip.id,
    type: 'text',
    content,
    timelineStart: clip.time.start,
    duration,
    style,
    position,
    animation,
    track: track.layer,
  };
}

// ============================================
// 辅助函数
// ============================================

/**
 * 获取调整配置的类型安全辅助函数
 */
function getAdjustment(project: VEIRProject, clipId: string) {
  return project.adjustments?.clipOverrides?.[clipId];
}

/**
 * 从行为定义获取动画效果
 */
function getAnimationFromBehavior(behavior?: { enter?: string; exit?: string }): {
  enter: PresetAnimationType;
  exit?: PresetAnimationType;
  enterDuration?: number;
  exitDuration?: number;
} {
  const behaviorEnter = behavior?.enter;
  const behaviorExit = behavior?.exit;
  
  const enterType = behaviorEnter ? (behaviorToAnimationMap[behaviorEnter] || 'fade-in') : 'fade-in';
  const exitType = behaviorExit ? (behaviorToAnimationMap[behaviorExit] || 'fade-out') : 'fade-out';
  
  return {
    enter: enterType,
    exit: exitType,
    enterDuration: 0.3,
    exitDuration: 0.25,
  };
}

/**
 * 从预设 ID 获取文字样式
 */
function getTextStyleFromPreset(
  presetId: string | undefined,
  intensity: number,
  context: VEIRParseContext
): TextStylePreset {
  // 优先使用内置预设
  if (presetId && builtinTextStyles[presetId]) {
    const preset = builtinTextStyles[presetId];
    return {
      ...preset,
      fontSize: Math.round(preset.fontSize * (0.8 + intensity * 0.4)),
    };
  }

  // 检查项目词汇表
  if (presetId) {
    const vocabPreset = context.project.vocabulary.presets[presetId];
    if (vocabPreset?.category === '综艺') {
      return {
        ...builtinTextStyles['title-variety'],
        fontSize: Math.round(72 * (0.8 + intensity * 0.4)),
      };
    } else if (vocabPreset?.category === '信息') {
      return builtinTextStyles['subtitle-bottom'];
    }
  }

  // 默认样式
  return {
    fontSize: 42,
    fontFamily: 'Noto Sans SC',
    fontWeight: 500,
    color: '#FFFFFF',
    textAlign: 'center',
    verticalAlign: 'bottom',
    marginBottom: 10,
    stroke: { color: '#000000', width: 2 },
  };
}

/**
 * 从锚点获取位置
 */
function getPositionFromAnchor(anchor?: string): { x: number | string; y: number | string } | undefined {
  switch (anchor) {
    case 'top':
    case 'top-left':
    case 'top-right':
      return { x: '50%', y: '10%' };
    case 'center':
      return { x: '50%', y: '50%' };
    case 'bottom':
    case 'bottom-left':
    case 'bottom-right':
    default:
      return undefined; // 使用默认底部位置
  }
}

/**
 * 映射滤镜名称
 */
function mapFilterName(name: string): FilterEffect['type'] {
  return filterNameMap[name] || 'saturate';
}

/**
 * 从 VEIR adjustments.video.timeWarp 推导速度
 */
function deriveVideoSpeedFromTimeWarp(
  timeWarp: { mode?: string; segments?: Array<{ speed?: number; when?: { start?: number; end?: number } }> } | undefined,
  clipDuration: number,
  context: VEIRParseContext
): number | undefined {
  if (!timeWarp || typeof timeWarp !== 'object') return undefined;

  const segments = Array.isArray(timeWarp.segments) ? timeWarp.segments : [];
  if (segments.length === 0) return undefined;

  const clamp = (v: number) => Math.min(4, Math.max(0.1, v));
  const safeSpeed = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? clamp(v) : undefined);

  const mode = typeof timeWarp.mode === 'string' ? timeWarp.mode : 'constant';

  if (mode === 'constant') {
    const s0 = safeSpeed(segments[0]?.speed);
    return s0;
  }

  // ramp：加权平均近似
  let weightedSum = 0;
  let totalWeight = 0;

  for (const seg of segments) {
    const speed = safeSpeed(seg?.speed);
    const when = seg?.when;
    if (!speed || !when || typeof when !== 'object') continue;

    const start = typeof when.start === 'number' ? when.start : 0;
    const end = typeof when.end === 'number' ? when.end : 0;
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

    const segStart = Math.max(0, start);
    const segEnd = Math.min(clipDuration, end);
    const weight = Math.max(0, segEnd - segStart);
    if (weight <= 0) continue;

    weightedSum += speed * weight;
    totalWeight += weight;
  }

  if (totalWeight <= 0) {
    const fallback = safeSpeed(segments[0]?.speed);
    return fallback;
  }

  context.warnings.push(
    'timeWarp(mode=ramp) 当前在合成器中仅做常量 speed 近似（分段时长加权平均）。'
  );
  return clamp(weightedSum / totalWeight);
}

// ============================================
// 验证函数
// ============================================

/**
 * 验证 VEIR 项目完整性
 */
export function validateVEIRForComposition(veir: VEIRProject): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查基本结构
  if (!veir.meta) {
    errors.push('Missing meta configuration');
  } else {
    if (!veir.meta.resolution || veir.meta.resolution.length !== 2) {
      errors.push('Invalid resolution');
    }
    if (!veir.meta.fps || veir.meta.fps <= 0) {
      errors.push('Invalid fps');
    }
    if (!veir.meta.duration || veir.meta.duration <= 0) {
      errors.push('Invalid duration');
    }
  }

  // 检查时间轴
  if (!veir.timeline?.tracks?.length) {
    errors.push('No tracks in timeline');
  } else {
    for (const track of veir.timeline.tracks) {
      if (!track.clips?.length) {
        warnings.push(`Track ${track.id} has no clips`);
      }
      for (const clip of track.clips) {
        if (!veir.assets.assets[clip.asset]) {
          errors.push(`Clip ${clip.id} references missing asset: ${clip.asset}`);
        }
        if (clip.time.end <= clip.time.start) {
          errors.push(`Clip ${clip.id} has invalid time range`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 计算 VEIR 项目统计信息
 */
export function getVEIRStats(veir: VEIRProject): {
  trackCount: number;
  clipCount: number;
  assetCount: number;
  duration: number;
  resolution: [number, number];
  fps: number;
  trackTypes: Record<string, number>;
} {
  const trackTypes: Record<string, number> = {};
  let clipCount = 0;

  for (const track of veir.timeline.tracks) {
    trackTypes[track.type] = (trackTypes[track.type] || 0) + 1;
    clipCount += track.clips.length;
  }

  return {
    trackCount: veir.timeline.tracks.length,
    clipCount,
    assetCount: Object.keys(veir.assets.assets).length,
    duration: veir.meta.duration,
    resolution: veir.meta.resolution,
    fps: veir.meta.fps,
    trackTypes,
  };
}

