/**
 * Modern Composer - 现代化视频合成引擎
 *
 * 技术栈:
 * - Fabric.js v7: Canvas 对象模型与渲染
 * - Anime.js v4: 专业级动画引擎
 * - MediaBunny + WebCodecs: 硬件加速视频编码
 *
 * 架构层次:
 * ┌─────────────────────────────────────────────────────┐
 * │              ModernComposer (本模块)                 │
 * │      (VEIR Project → Video File)                   │
 * ├─────────────────────────────────────────────────────┤
 * │              Animation Engine (Anime.js)            │
 * │   (Timeline, Keyframes, Easing, Motion System)      │
 * ├─────────────────────────────────────────────────────┤
 * │              Canvas Engine (Fabric.js)              │
 * │   (Object Model, Groups, Filters, SVG Support)      │
 * ├─────────────────────────────────────────────────────┤
 * │            Video Encoder (MediaBunny)               │
 * │   (WebCodecs, MP4/WebM, Hardware Acceleration)      │
 * └─────────────────────────────────────────────────────┘
 */

// ============================================
// 模块导出
// ============================================

// Fabric.js 画布引擎
export {
  FabricEngine,
  type FabricEngineConfig,
  type ElementConfig,
  type RenderState,
  fabric,
} from './fabric';

// Anime.js 动画引擎
export {
  AnimeEngine,
  calculateAnimationState,
  createPresetAnimation,
  createStaggerAnimation,
  stagger,
  anime,
  createTimeline,
  type AnimationConfig,
  type AnimationProperties,
  type AnimationState,
  type Keyframe,
  type PresetAnimationType,
  type AnimeInstance,
  type Timeline,
} from './anime';

// WebCodecs + MediaBunny 视频合成器
export {
  MediaBunnyComposer,
  composeFromCanvas,
  checkWebCodecsSupport,
  checkCodecSupport,
  downloadVideo,
  revokeDownloadUrl,
  Output,
  Mp4OutputFormat,
  WebmOutputFormat,
  BufferTarget,
  CanvasSource,
  AudioSamplesSource,
  QUALITY_HIGH,
  QUALITY_MEDIUM,
  QUALITY_LOW,
  type VideoEncoderConfig,
  type AudioEncoderConfig,
  type OutputFormat,
  type VideoCodecType,
  type AudioCodecType,
  type ProgressCallback,
  type CompositionResult,
} from './webcodecs';

// ============================================
// 类型定义
// ============================================

import type { VEIRProject, Clip, Track, Asset } from '../veir/types';
import { FabricEngine, type ElementConfig, type RenderState } from './fabric';
import { AnimeEngine, calculateAnimationState, type Keyframe, type AnimationState } from './anime';
import {
  MediaBunnyComposer,
  type VideoEncoderConfig,
  type OutputFormat,
  type CompositionResult,
  type ProgressCallback,
} from './webcodecs';

/**
 * 合成器配置
 */
export interface ModernComposerConfig {
  // 视频配置
  width: number;
  height: number;
  frameRate: number;
  duration: number;
  // 输出配置
  format?: OutputFormat;
  quality?: 'high' | 'medium' | 'low';
  // 背景
  backgroundColor?: string;
}

/**
 * 素材解析器
 */
export interface AssetResolver {
  resolveVideo: (src: string) => Promise<string>;
  resolveAudio: (src: string) => Promise<string>;
  resolveImage: (src: string) => Promise<string>;
  resolveSVG?: (src: string) => Promise<string>;
}

// ============================================
// Modern Composer 主类
// ============================================

/**
 * 现代化视频合成器
 * 整合 Fabric.js + Anime.js + MediaBunny 的完整合成管线
 */
export class ModernComposer {
  private config: ModernComposerConfig;
  private resolver: AssetResolver;

  private fabricEngine: FabricEngine | null = null;
  private animeEngine: AnimeEngine | null = null;
  private videoComposer: MediaBunnyComposer | null = null;

  // 元素管理
  private activeElements: Map<string, { clipId: string; element: ElementConfig }> = new Map();
  private loadedAssets: Map<string, HTMLVideoElement | HTMLImageElement> = new Map();

  constructor(config: ModernComposerConfig, resolver?: AssetResolver) {
    this.config = config;
    this.resolver = resolver || {
      resolveVideo: async (src) => src,
      resolveAudio: async (src) => src,
      resolveImage: async (src) => src,
    };
  }

  /**
   * 初始化合成器
   */
  async initialize(): Promise<void> {
    // 初始化 Fabric 画布引擎
    this.fabricEngine = new FabricEngine({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor || '#000000',
    });

    // 初始化 Anime 动画引擎
    this.animeEngine = new AnimeEngine();

    // 初始化视频编码器
    this.videoComposer = new MediaBunnyComposer(
      {
        width: this.config.width,
        height: this.config.height,
        frameRate: this.config.frameRate,
        quality: this.config.quality || 'high',
      },
      undefined,
      this.config.format || 'mp4'
    );

    await this.videoComposer.start(this.fabricEngine.getCanvasElement());
  }

  /**
   * 从 VEIR 项目合成视频
   */
  async composeFromVEIR(
    project: VEIRProject,
    onProgress?: ProgressCallback
  ): Promise<CompositionResult> {
    if (!this.fabricEngine || !this.animeEngine || !this.videoComposer) {
      await this.initialize();
    }

    const totalFrames = Math.ceil(this.config.duration * this.config.frameRate);

    onProgress?.(0, 'loading', '加载素材...');

    // 预加载所有素材
    await this.preloadAssets(project, onProgress);

    onProgress?.(20, 'rendering', '开始渲染...');

    // 逐帧渲染
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / this.config.frameRate;

      // 更新场景
      await this.renderFrameFromVEIR(project, time);

      // 编码帧
      await this.videoComposer!.encodeFrame({
        keyFrame: frame % 30 === 0,
      });

      // 进度回调
      if (frame % 10 === 0) {
        const progress = 20 + (frame / totalFrames) * 70;
        onProgress?.(progress, 'rendering', `渲染帧 ${frame}/${totalFrames}`);
      }
    }

    onProgress?.(90, 'encoding', '完成编码...');

    // 完成合成
    const result = await this.videoComposer!.finalize();

    onProgress?.(100, 'complete', '完成');

    return result;
  }

  /**
   * 预加载素材
   */
  private async preloadAssets(project: VEIRProject, onProgress?: ProgressCallback): Promise<void> {
    const assets = project.assets.assets;
    const assetIds = Object.keys(assets);
    let loadedCount = 0;

    for (const id of assetIds) {
      const asset = assets[id];
      if (!asset.src) continue;

      try {
        if (asset.type === 'video') {
          const resolvedSrc = await this.resolver.resolveVideo(asset.src);
          await this.fabricEngine!.addVideo({
            id,
            type: 'video',
            src: resolvedSrc,
            x: this.config.width / 2,
            y: this.config.height / 2,
            width: this.config.width,
            height: this.config.height,
            opacity: 0, // 初始不可见
          });
        } else if (asset.type === 'image') {
          const resolvedSrc = await this.resolver.resolveImage(asset.src);
          await this.fabricEngine!.addImage({
            id,
            type: 'image',
            src: resolvedSrc,
            x: this.config.width / 2,
            y: this.config.height / 2,
            opacity: 0,
          });
        }
      } catch (error) {
        console.error(`Failed to load asset ${id}:`, error);
      }

      loadedCount++;
      const progress = (loadedCount / assetIds.length) * 20;
      onProgress?.(progress, 'loading', `加载素材 ${loadedCount}/${assetIds.length}`);
    }
  }

  /**
   * 渲染单帧
   */
  private async renderFrameFromVEIR(project: VEIRProject, time: number): Promise<void> {
    if (!this.fabricEngine) return;

    // 获取当前时间活跃的 Clips
    const activeClips = this.getActiveClips(project, time);

    // 更新每个 Clip 的渲染状态
    for (const { track, clip } of activeClips) {
      const asset = project.assets.assets[clip.asset];
      if (!asset) continue;

      const clipDuration = clip.time.end - clip.time.start;
      const localTime = time - clip.time.start;
      const progress = localTime / clipDuration;

      // 计算动画状态
      const animState = this.calculateClipAnimation(clip, progress, clipDuration);

      // 计算位置
      const position = this.calculateClipPosition(clip, track, project);

      // 应用渲染状态
      const renderState: RenderState = {
        x: position.x + (animState.translateX || 0),
        y: position.y + (animState.translateY || 0),
        scaleX: animState.scaleX || animState.scale || 1,
        scaleY: animState.scaleY || animState.scale || 1,
        angle: animState.rotate || 0,
        opacity: animState.opacity ?? 1,
        blur: animState.blur || 0,
      };

      this.fabricEngine.applyRenderState(clip.asset, renderState);

      // 更新视频时间
      if (asset.type === 'video') {
        await this.fabricEngine.seekVideo(clip.asset, localTime);
      }

      // 处理文本
      if (asset.type === 'text' && asset.content) {
        this.renderTextClip(clip, asset, renderState, project);
      }
    }

    // 隐藏不活跃的元素
    this.hideInactiveElements(activeClips, project);

    // 渲染
    this.fabricEngine.render();
  }

  /**
   * 获取活跃的 Clips
   */
  private getActiveClips(
    project: VEIRProject,
    time: number
  ): { track: Track; clip: Clip }[] {
    const activeClips: { track: Track; clip: Clip }[] = [];

    for (const track of project.timeline.tracks) {
      for (const clip of track.clips) {
        if (time >= clip.time.start && time < clip.time.end) {
          activeClips.push({ track, clip });
        }
      }
    }

    // 按层级排序
    activeClips.sort((a, b) => a.track.layer - b.track.layer);

    return activeClips;
  }

  /**
   * 计算 Clip 动画状态
   * 必须与 veir-preview/page.tsx 中的 TextOverlay 动画逻辑保持一致
   * 
   * 动画分为三个阶段：
   * 1. 入场阶段 (0 ~ enterDuration): 元素进入的动画
   * 2. 持续阶段 (enterDuration ~ 1-exitDuration): 循环动画（如 shake、pulse）
   * 3. 出场阶段 (1-exitDuration ~ 1): 元素退出的动画
   */
  private calculateClipAnimation(
    clip: Clip,
    progress: number,
    duration: number
  ): AnimationState {
    const enterDuration = 0.15;
    const exitDuration = 0.15;

    const state: AnimationState = {
      progress,
      opacity: 1,
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotate: 0,
    };

    // 获取入场/出场动画类型
    const enterType = clip.behavior?.enter || 'fade-in';
    const exitType = clip.behavior?.exit || 'fade-out';
    
    // 当前绝对时间（秒）
    const currentTime = progress * duration;
    // 入场动画持续时间（秒）
    const enterDurSeconds = enterDuration * duration;
    // 入场完成后的时间
    const timeAfterEnter = Math.max(0, currentTime - enterDurSeconds);
    
    // 调试日志
    if (Math.floor(currentTime * 2) !== Math.floor((currentTime - 0.5) * 2)) {
      console.log('[ModernComposer] Animation:', {
        clipId: clip.id,
        enterType,
        currentTime: currentTime.toFixed(2),
        progress: progress.toFixed(3),
      });
    }

    // 处理特殊的循环动画类型（shake、pulse 等）
    // 这些动画需要在整个显示期间持续运行
    if (enterType === 'shake' || enterType === 'pulse') {
      // 计算基础透明度（入场/出场渐变）
      let baseOpacity = 1;
      if (progress < enterDuration) {
        baseOpacity = progress / enterDuration;
      } else if (progress > 1 - exitDuration) {
        baseOpacity = (1 - progress) / exitDuration;
      }
      state.opacity = baseOpacity;

      if (enterType === 'shake') {
        // shake: 整个显示期间持续抖动
        const shakeTime = currentTime * 30;  // 抖动频率
        let shakeIntensity = 1;
        
        // 入场时逐渐增加抖动
        if (progress < enterDuration) {
          shakeIntensity = progress / enterDuration;
        }
        // 出场时逐渐减少抖动
        else if (progress > 1 - exitDuration) {
          shakeIntensity = (1 - progress) / exitDuration;
        }
        
        state.translateX = Math.sin(shakeTime) * 8 * shakeIntensity;  // 8px 幅度
      } else if (enterType === 'pulse') {
        // pulse: 脉冲缩放效果
        const pulseTime = currentTime * 8;
        let pulseIntensity = 1;
        
        if (progress < enterDuration) {
          pulseIntensity = progress / enterDuration;
        } else if (progress > 1 - exitDuration) {
          pulseIntensity = (1 - progress) / exitDuration;
        }
        
        state.scale = 1 + Math.sin(pulseTime) * 0.1 * pulseIntensity;  // 10% 缩放幅度
      }
      
      return state;
    }

    // 入场动画
    if (progress < enterDuration) {
      const t = progress / enterDuration;
      // 使用 easeOut 缓动让动画更自然
      const easedT = 1 - Math.pow(1 - t, 3);

      switch (enterType) {
        case 'bounce':
          // bounce: 初始 scale=0, translateY=50, opacity=1，动画到 scale=1, translateY=0, opacity=1
          // 注意：bounce 的 opacity 始终为 1，不会渐变
          state.scale = easedT;
          state.translateY = (1 - easedT) * 50;
          state.opacity = 1; // bounce 动画不改变透明度
          break;

        case 'slide-up':
          // slide-up: 初始 translateY=100, opacity=0，动画到 translateY=0, opacity=1
          state.translateY = (1 - easedT) * 100;
          state.opacity = easedT;
          break;

        case 'slide-down':
          // slide-down: 初始 translateY=-100, opacity=0，动画到 translateY=0, opacity=1
          state.translateY = -(1 - easedT) * 100;
          state.opacity = easedT;
          break;

        case 'zoom':
          // zoom: 初始 scale=0.5, opacity=0，动画到 scale=1, opacity=1
          state.scale = 0.5 + easedT * 0.5;
          state.opacity = easedT;
          break;

        case 'fade-in':
        default:
          // fade-in: 仅透明度变化
          state.opacity = easedT;
          break;
      }
    }
    // 出场动画
    else if (progress > 1 - exitDuration) {
      const t = (progress - (1 - exitDuration)) / exitDuration;
      // 使用 easeIn 缓动让出场更自然
      const easedT = t * t * t;

      switch (exitType) {
        case 'zoom':
          state.scale = 1 - easedT * 0.2; // 缩小到 0.8
          state.opacity = 1 - easedT;
          break;

        case 'slide-up':
          state.translateY = -easedT * 30;
          state.opacity = 1 - easedT;
          break;

        case 'slide-down':
          state.translateY = easedT * 30;
          state.opacity = 1 - easedT;
          break;

        case 'fade-out':
        default:
          // fade-out: 仅透明度变化
          state.opacity = 1 - easedT;
          break;
      }
    }

    return state;
  }

  /**
   * 计算 Clip 位置
   */
  private calculateClipPosition(
    clip: Clip,
    track: Track,
    project: VEIRProject
  ): { x: number; y: number; width: number; height: number } {
    let x = this.config.width / 2;
    let y = this.config.height / 2;
    let width = this.config.width;
    let height = this.config.height;

    // 处理 PIP 布局
    if (track.type === 'pip' && clip.expression?.preset) {
      const preset = project.vocabulary.presets[clip.expression.preset];
      if (preset && preset.type === 'pipLayout') {
        const size = (preset.size as [number, number]) || [0.3, 0.3];
        const anchor = preset.anchor || 'bottom-right';

        width = this.config.width * size[0];
        height = this.config.height * size[1];

        const padding = 20;
        if (anchor.includes('right')) x = this.config.width - width / 2 - padding;
        if (anchor.includes('left')) x = width / 2 + padding;
        if (anchor.includes('bottom')) y = this.config.height - height / 2 - padding;
        if (anchor.includes('top')) y = height / 2 + padding;
        if (anchor === 'center') {
          x = this.config.width / 2;
          y = this.config.height / 2;
        }
      }
    }

    return { x, y, width, height };
  }

  /**
   * 渲染文本 Clip
   */
  private renderTextClip(
    clip: Clip,
    asset: Asset,
    renderState: RenderState,
    project: VEIRProject
  ): void {
    if (!this.fabricEngine || !asset.content) return;

    const elementId = `text-${clip.id}`;
    const existingElement = this.fabricEngine.getElement(elementId);

    if (!existingElement) {
      // 创建文本元素
      const preset = clip.expression?.preset
        ? project.vocabulary.presets[clip.expression.preset]
        : null;

      const intensity = clip.expression?.intensity ?? 0.8;
      let fontSize = 40;
      let fill = '#FFFFFF';
      let stroke: string | undefined;

      if (preset?.category === '综艺') {
        fontSize = 32 + intensity * 32;
        fill = '#FFD700';
        stroke = '#FF6B6B';
      } else if (preset?.category === '信息') {
        fontSize = 24;
      }

      this.fabricEngine.addText({
        id: elementId,
        type: 'text',
        content: asset.content,
        x: renderState.x || this.config.width / 2,
        y: renderState.y || this.config.height / 2,
        fontSize,
        fill,
        stroke,
        strokeWidth: stroke ? 4 : 0,
        opacity: renderState.opacity,
      });
    } else {
      this.fabricEngine.applyRenderState(elementId, renderState);
    }
  }

  /**
   * 隐藏不活跃的元素
   */
  private hideInactiveElements(
    activeClips: { track: Track; clip: Clip }[],
    project: VEIRProject
  ): void {
    if (!this.fabricEngine) return;

    const activeAssetIds = new Set(activeClips.map((c) => c.clip.asset));

    // 隐藏所有不活跃的资产
    for (const assetId of Object.keys(project.assets.assets)) {
      if (!activeAssetIds.has(assetId)) {
        this.fabricEngine.applyRenderState(assetId, { opacity: 0 });
      }
    }
  }

  /**
   * 销毁合成器
   */
  destroy(): void {
    this.fabricEngine?.destroy();
    this.animeEngine?.clear();
    this.videoComposer?.destroy();

    this.fabricEngine = null;
    this.animeEngine = null;
    this.videoComposer = null;
    this.activeElements.clear();
    this.loadedAssets.clear();
  }
}

// ============================================
// 便捷 API
// ============================================

/**
 * 快速合成 VEIR 项目
 */
export async function composeVEIRModern(
  project: VEIRProject,
  options?: {
    format?: OutputFormat;
    quality?: 'high' | 'medium' | 'low';
    resolver?: AssetResolver;
    onProgress?: ProgressCallback;
  }
): Promise<CompositionResult> {
  const composer = new ModernComposer(
    {
      width: project.meta.resolution[0],
      height: project.meta.resolution[1],
      frameRate: project.meta.fps,
      duration: project.meta.duration,
      format: options?.format,
      quality: options?.quality,
    },
    options?.resolver
  );

  try {
    await composer.initialize();
    return await composer.composeFromVEIR(project, options?.onProgress);
  } finally {
    composer.destroy();
  }
}




