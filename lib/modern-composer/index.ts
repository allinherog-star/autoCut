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
  type ElementBounds,
  type DragPosition,
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
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  AudioSampleSource,
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
import { compileVEIRToRenderPlan, createPreferredTimeStretchEngine, frameIndexToTimeUs, usToSec } from '../veir/engine';
import { FabricEngine, type ElementBounds, type ElementConfig, type RenderState, type DragPosition, fabric } from './fabric';
import { AnimeEngine, calculateAnimationState, type Keyframe, type AnimationState } from './anime';
import {
  MediaBunnyComposer,
  type VideoEncoderConfig,
  type OutputFormat,
  type CompositionResult,
  type ProgressCallback,
} from './webcodecs';
import { decodeAudioFromUrl } from './audio/decode';
import { decodePcmFromMediaUrl } from './audio/extract';
import type { TimeStretchEngine } from '../veir/engine';
import { percentToCanvasPixel } from '../preview/coordinate-system';

/**
 * 合成器配置
 */
export interface ModernComposerConfig {
  // 视频配置
  width: number;
  height: number;
  frameRate: number;
  duration: number;
  /**
   * 可选：注入一个“可见的” Canvas，用于预览渲染（编辑器 UI）
   * - 若不提供，内部会创建离屏 canvas（用于导出/编码）
   */
  canvas?: HTMLCanvasElement;
  // 输出配置
  format?: OutputFormat;
  quality?: 'high' | 'medium' | 'low';
  // 背景
  backgroundColor?: string;
  // 交互模式（启用 Canvas 拖拽）
  interactive?: boolean;
  // 拖拽事件回调
  onObjectDragStart?: (id: string, position: DragPosition) => void;
  onObjectDragging?: (id: string, position: DragPosition) => void;
  onObjectDragEnd?: (id: string, position: DragPosition) => void;
  onObjectSelected?: (id: string) => void;
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

  // 元素管理（专业剪辑：以 clip 为实例，而不是以 asset 为实例）
  // key: elementId（如 video-clip-xxx / image-clip-xxx / text-clip-xxx / subtitle-clip-xxx）
  private activeElements: Map<string, { clipId: string; elementType: string }> = new Map();
  // 仅缓存“解析后的素材 URL”（同一素材可被多个 clip 引用）
  private resolvedAssetSrc: Map<string, string> = new Map();

  // timeWarp 预计算缓存（按 clipId）
  private timeWarpCache: Map<string, PreparedTimeWarp | null> = new Map();

  // 预览用：素材预加载只做一次
  private previewAssetsLoaded: boolean = false;

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
      canvas: this.config.canvas,
      interactive: this.config.interactive,
      onObjectDragStart: this.config.onObjectDragStart,
      onObjectDragging: this.config.onObjectDragging,
      onObjectDragEnd: this.config.onObjectDragEnd,
      onObjectSelected: this.config.onObjectSelected,
    });

    // 初始化 Anime 动画引擎
    this.animeEngine = new AnimeEngine();

    // 初始化视频编码器（不调用 start，由 composeFromVEIR 根据需要决定是否包含音频）
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
  }

  /**
   * 预览：获取当前渲染使用的 Canvas 元素（可用于 UI 挂载/调试）
   */
  getCanvasElement(): HTMLCanvasElement | null {
    return this.fabricEngine?.getCanvasElement() ?? null;
  }

  /**
   * 交互层：获取当前帧中“活跃”的 clipId 列表（用于 WYSIWYG 选框/命中测试）
   * - 来源于渲染层 activeElements（真实存在的 Fabric 元素）
   */
  getActiveClipIds(): string[] {
    const ids = new Set<string>();
    for (const v of this.activeElements.values()) {
      if (v?.clipId) ids.add(v.clipId);
    }
    return Array.from(ids);
  }

  /**
   * 交互层：获取某个 clip 的渲染包围盒（axis-aligned bounding box）
   * 优先级：subtitle > text > image > video（与渲染分流一致）
   */
  getClipBounds(clipId: string): ElementBounds | null {
    if (!this.fabricEngine) return null;
    const candidates = [`subtitle-${clipId}`, `text-${clipId}`, `image-${clipId}`, `video-${clipId}`];
    for (const elementId of candidates) {
      if (this.fabricEngine.getElement(elementId)) {
        const b = this.fabricEngine.getElementBounds(elementId);
        if (b) return b;
      }
    }
    return null;
  }

  /**
   * 交互层：批量获取 clip 的渲染包围盒
   */
  getClipBoundsBatch(clipIds: string[]): Record<string, ElementBounds> {
    const out: Record<string, ElementBounds> = {};
    for (const clipId of clipIds) {
      const b = this.getClipBounds(clipId);
      if (b) out[clipId] = b;
    }
    return out;
  }

  /**
   * 预览：渲染指定时间点的一帧（不编码）
   * - 与导出路径共享同一渲染逻辑（sourceRange/timeWarp/转场/字幕布局等）
   */
  async renderFrame(project: VEIRProject, time: number): Promise<void> {
    if (!this.fabricEngine || !this.animeEngine || !this.videoComposer) {
      await this.initialize();
    }

    // 预览场景：首次渲染前预加载一次素材路径到缓存，减少首帧抖动
    if (!this.previewAssetsLoaded) {
      this.previewAssetsLoaded = true;
      try {
        await this.preloadAssets(project);
      } catch {
        // 预览不应因为预加载失败而阻断（后续 ensureVideoElement 会按需兜底）
      }
    }

    const clamped = Math.max(0, Math.min(time, this.config.duration));
    await this.renderFrameFromVEIR(project, clamped);
  }

  /**
   * 启动编码器
   */
  private async startComposer(withAudio: boolean): Promise<void> {
    if (!this.fabricEngine || !this.videoComposer) {
      throw new Error('Composer not initialized');
    }
    await this.videoComposer.start(this.fabricEngine.getCanvasElement(), { withAudio });
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

    // Pro Engine (v0): compile deterministic Render Plan (timeUs) to drive sampling.
    // This is the first step to ensure preview/export are driven by the same evaluator/time grid.
    const plan = compileVEIRToRenderPlan(project, { audio: { sampleRate: 48_000, channels: 2 } });
    const totalFrames = plan.meta.frameCount;

    onProgress?.(0, 'loading', '加载素材...');

    // 预加载所有素材
    await this.preloadAssets(project, onProgress);

    // 音频：对标 PR
    // - 若存在 audio track，编码其音频
    // - 若不存在 audio track，则尝试自动抽取视频原声并随 timeWarp 变化
    // 注意：pip 轨道也可能包含视频素材（画中画/主画面），需要纳入音频判断
    const wantAudio = plan.audio.clips.length > 0;

    // 启动编码器（在这里确定是否包含音频轨道）
    await this.startComposer(wantAudio);

    onProgress?.(20, 'rendering', '开始渲染...');

    // 逐帧渲染
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = usToSec(frameIndexToTimeUs(frame, plan.meta.fps));

      // 更新场景
      await this.renderFrameFromVEIR(project, time);

      // 编码帧 (传入时间戳，帧时长，关键帧选项)
      const frameDuration = 1 / plan.meta.fps;
      await this.videoComposer!.encodeFrame(time, frameDuration, {
        keyFrame: frame % 30 === 0,
      });

      // 进度回调
      if (frame % 10 === 0) {
        const progress = 20 + (frame / totalFrames) * 70;
        onProgress?.(progress, 'rendering', `渲染帧 ${frame}/${totalFrames}`);
      }
    }

    onProgress?.(90, 'encoding', '完成编码...');

    // 编码音频（若需要）
    if (wantAudio) {
      try {
        onProgress?.(90, 'encoding', '编码音频...');
        await this.renderAndEncodeAudioFromVEIR(project, onProgress);
      } catch (e) {
        console.warn('[ModernComposer] audio encode failed, output will be silent:', e);
      }
    }

    // 完成合成
    const result = await this.videoComposer!.finalize();

    onProgress?.(100, 'complete', '完成');

    return result;
  }

  /**
   * 解析转场配置：支持 transitionOut.preset 引用 vocabulary.presets（type=transition）
   * - 目标：让 VEIR 生成侧只需写 preset，渲染侧能得到可执行的 type/duration/direction/easing
   * - 合并规则：显式字段优先，其次取 preset 参数
   */
  private resolveTransition(
    project: VEIRProject,
    transition: unknown
  ): { type?: string; duration?: number; direction?: string; easing?: string; feather?: number } | undefined {
    if (!transition || typeof transition !== 'object') return undefined;

    const t = transition as {
      preset?: string;
      type?: string;
      duration?: number;
      direction?: string;
      easing?: string;
      feather?: number;
    };

    let presetParams: Record<string, unknown> | null = null;
    if (t.preset) {
      const preset = project.vocabulary?.presets?.[t.preset] as Record<string, unknown> | undefined;
      if (preset && (preset as any).type === 'transition') {
        presetParams = preset;
      }
    }

    const pick = <K extends string>(key: K, fallbackKeys: K[] = []) => {
      if (t[key as keyof typeof t] !== undefined) return t[key as keyof typeof t];
      if (!presetParams) return undefined;
      if (presetParams[key] !== undefined) return presetParams[key];
      for (const k of fallbackKeys) {
        if (presetParams[k] !== undefined) return presetParams[k];
      }
      return undefined;
    };

    // preset 中建议使用 transitionType 以避免与 preset 自己的 type 字段冲突
    const type = (pick('type' as any, ['transitionType' as any, 'transition' as any]) as unknown) as string | undefined;
    const duration = pick('duration' as any, ['transitionDuration' as any]) as number | undefined;
    const direction = pick('direction' as any) as string | undefined;
    const easing = pick('easing' as any) as string | undefined;
    const feather = pick('feather' as any) as number | undefined;

    if (!type || typeof duration !== 'number') {
      // 保持与旧行为一致：没有可执行字段则视为无转场
      return undefined;
    }

    return { type, duration, direction, easing, feather };
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
        // 仅做路径解析与缓存；真正的 Fabric 元素在 clip 激活时按需创建
        if (asset.type === 'video') {
          const resolvedSrc = await this.resolver.resolveVideo(asset.src);
          this.resolvedAssetSrc.set(id, resolvedSrc);
        } else if (asset.type === 'image') {
          const resolvedSrc = await this.resolver.resolveImage(asset.src);
          this.resolvedAssetSrc.set(id, resolvedSrc);
        } else if (asset.type === 'audio') {
          // 音频目前不走 Fabric 引擎（后续可接入音频合成管线）
          const resolvedSrc = await this.resolver.resolveAudio(asset.src);
          this.resolvedAssetSrc.set(id, resolvedSrc);
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

    // 预计算：同轨道前后 clip 关系（用于转场）
    const clipNeighbors = new Map<string, { prev?: Clip; next?: Clip; track?: Track }>();
    for (const track of project.timeline.tracks) {
      const sorted = [...track.clips].sort((a, b) => a.time.start - b.time.start);
      for (let i = 0; i < sorted.length; i++) {
        const clip = sorted[i];
        clipNeighbors.set(clip.id, { prev: sorted[i - 1], next: sorted[i + 1], track });
      }
    }

    // 获取当前时间活跃的 Clips
    const activeClips = this.getActiveClips(project, time);
    const shouldBeActiveElementIds = new Set<string>();

    // 更新每个 Clip 的渲染状态
    for (const { track, clip } of activeClips) {
      const asset = project.assets.assets[clip.asset];
      if (!asset) continue;

      const clipDuration = clip.time.end - clip.time.start;
      const localTime = time - clip.time.start;
      const progress = localTime / clipDuration;

      // 计算动画状态
      const animState = this.calculateClipAnimation(clip, progress, clipDuration);

      // 计算位置（所有轨道类型都统一读取 clipOverrides，确保拖拽更新能正确反映）
      const position = this.calculateClipPosition(clip, track, asset, project);

      // 应用渲染状态
      // 注意：animState 中的值在 calculateClipAnimation 中始终是 number 类型
      const getNum = (v: number | number[] | undefined, def: number) =>
        typeof v === 'number' ? v : (Array.isArray(v) ? v[0] : def);

      const renderState: RenderState = {
        x: position.x + getNum(animState.translateX, 0),
        y: position.y + getNum(animState.translateY, 0),
        scaleX: getNum(animState.scaleX, 1) || getNum(animState.scale, 1),
        scaleY: getNum(animState.scaleY, 1) || getNum(animState.scale, 1),
        angle: getNum(animState.rotate, 0),
        opacity: getNum(animState.opacity, 1),
        blur: getNum(animState.blur, 0),
      };

      // 转场（仅视频轨道/视频素材）：在各自片段内部做“无重叠的最小可靠转场”
      // - outgoing：在 [end - duration, end) 内渐出/滑出/缩放/模糊
      // - incoming：若 prev.transitionOut 存在，则在 [start, start + duration) 内渐入/滑入/缩放/模糊
      if (track.type === 'video' && asset.type === 'video') {
        const neighbor = clipNeighbors.get(clip.id);

        // incoming from prev
        const prev = neighbor?.prev;
        const prevTrans = this.resolveTransition(project, prev?.transitionOut);
        if (prevTrans?.type && typeof prevTrans.duration === 'number' && prevTrans.duration > 0) {
          const dur = prevTrans.duration;
          if (time >= clip.time.start && time < clip.time.start + dur) {
            const t = Math.min(1, Math.max(0, (time - clip.time.start) / dur));
            if (prevTrans.type === 'wipe') {
              // 真 wipe：靠 clipPath 做遮罩（需要 overlap 才能达到 PR 观感）
              // incoming：逐步揭示
              this.fabricEngine?.setClipPath(`video-${clip.id}`, buildWipeClipPath('in', t, prevTrans.direction, this.config.width, this.config.height));
            } else {
              applyTransitionToRenderState(renderState, prevTrans.type, 'in', t, this.config.width, this.config.height);
            }
          }
        }

        // outgoing to next
        const outTrans = this.resolveTransition(project, clip.transitionOut);
        if (outTrans?.type && typeof outTrans.duration === 'number' && outTrans.duration > 0) {
          const dur = outTrans.duration;
          const startOut = Math.max(clip.time.start, clip.time.end - dur);
          if (time >= startOut && time < clip.time.end) {
            const t = Math.min(1, Math.max(0, (time - startOut) / dur));
            if (outTrans.type === 'wipe') {
              // outgoing：逐步遮掉
              this.fabricEngine?.setClipPath(`video-${clip.id}`, buildWipeClipPath('out', t, outTrans.direction, this.config.width, this.config.height));
            } else {
              applyTransitionToRenderState(renderState, outTrans.type, 'out', t, this.config.width, this.config.height);
            }
          }
        }
      }

      // 视频/图片：以 clip 为实例创建元素（支持同一素材多次/同时使用 + 转场重叠）
      if (asset.type === 'video') {
        const elementId = `video-${clip.id}`;
        shouldBeActiveElementIds.add(elementId);
        // 交互策略：主轴背景视频不允许拖拽/选中（避免“背景被拖走”，且避免遮挡叠加层命中）
        const isMainVideoTrack = track.type === 'video' && track.layer === 0;
        const isBackgroundRole = asset.semanticRole === 'background';
        const interactable = !(isMainVideoTrack || isBackgroundRole);
        await this.ensureVideoElement(elementId, clip.id, clip.asset, asset.src, { interactable });

        // 默认清理 clipPath（如无 wipe 转场则不应残留）
        this.fabricEngine?.setClipPath(elementId, null);

        this.fabricEngine?.applyRenderState(elementId, renderState);

        // 专业剪辑：支持 sourceRange（in/out） + 曲线变速（timeWarp）
        const timeWarp = (project.adjustments?.clipOverrides?.[clip.id] as
          | { video?: { timeWarp?: unknown } }
          | undefined)?.video?.timeWarp as
          | { mode?: string; segments?: Array<{ when?: { start?: number; end?: number }; speed?: number; easing?: string }> }
          | undefined;

        const warpedLocalTime = this.mapLocalTimeWithPreparedTimeWarp(clip.id, localTime, clipDuration, timeWarp);
        const sourceOffset = clip.sourceRange?.start ?? 0;
        const sourceEnd = clip.sourceRange?.end;
        const unclamped = sourceOffset + warpedLocalTime;
        const eps = 1 / this.config.frameRate;
        const sourceTime =
          typeof sourceEnd === 'number' && Number.isFinite(sourceEnd) ? Math.min(sourceEnd - eps, unclamped) : unclamped;

        await this.fabricEngine?.seekVideo(elementId, Math.max(0, sourceTime));
      } else if (asset.type === 'image') {
        const elementId = `image-${clip.id}`;
        shouldBeActiveElementIds.add(elementId);
        await this.ensureImageElement(elementId, clip.id, clip.asset, asset.src);
        this.fabricEngine?.applyRenderState(elementId, renderState);
      }

      // 文本：根据轨道类型分流
      if (asset.type === 'text' && asset.content) {
        if (track.type === 'subtitle') {
          this.renderSubtitleClip(track, clip, asset, renderState, project);
          shouldBeActiveElementIds.add(`subtitle-${clip.id}`);
        } else {
          this.renderTextClip(clip, asset, renderState, project);
          shouldBeActiveElementIds.add(`text-${clip.id}`);
        }
      }
    }

    // 清理不活跃的元素（以 clip 为粒度）
    this.cleanupInactiveElements(shouldBeActiveElementIds);

    // 渲染（检查 fabricEngine 是否仍然存在，可能在异步操作期间被销毁）
    this.fabricEngine?.render();
  }

  private mapLocalTimeWithPreparedTimeWarp(
    clipId: string,
    localTime: number,
    clipDuration: number,
    timeWarp:
      | { mode?: string; segments?: Array<{ when?: { start?: number; end?: number }; speed?: number; easing?: string }> }
      | undefined
  ): number {
    if (!timeWarp) return clampTime(localTime, clipDuration);

    if (!this.timeWarpCache.has(clipId)) {
      this.timeWarpCache.set(clipId, prepareTimeWarp(clipDuration, timeWarp));
    }
    const prepared = this.timeWarpCache.get(clipId);
    if (!prepared) return mapLocalTimeWithTimeWarp(localTime, clipDuration, timeWarp);
    return evaluatePreparedTimeWarp(prepared, localTime);
  }

  /**
   * 确保视频元素已创建（按 clip 实例化）
   */
  private async ensureVideoElement(
    elementId: string,
    clipId: string,
    assetId: string,
    rawSrc?: string,
    opts?: { interactable?: boolean }
  ): Promise<void> {
    if (!this.fabricEngine) {
      console.warn('[ModernComposer] ensureVideoElement: no fabricEngine');
      return;
    }
    if (this.fabricEngine.getElement(elementId)) {
      return; // 已存在
    }

    const resolvedSrc =
      this.resolvedAssetSrc.get(assetId) ||
      (rawSrc ? await this.resolver.resolveVideo(rawSrc) : undefined);

    console.log('[ModernComposer] ensureVideoElement:', { elementId, assetId, resolvedSrc });

    if (!resolvedSrc) {
      console.warn('[ModernComposer] ensureVideoElement: no resolvedSrc for', assetId);
      return;
    }

    try {
      await this.fabricEngine.addVideo({
        id: elementId,
        type: 'video',
        src: resolvedSrc,
        x: this.config.width / 2,
        y: this.config.height / 2,
        width: this.config.width,
        height: this.config.height,
        opacity: 0,
        interactable: opts?.interactable,
      });

      this.activeElements.set(elementId, { clipId, elementType: 'video' });
    } catch (error) {
      console.warn('[ModernComposer] Failed to load video element, skipping:', { elementId, assetId, error });
      // 继续执行，不阻断导出流程
    }
  }

  /**
   * 确保图片元素已创建（按 clip 实例化）
   */
  private async ensureImageElement(elementId: string, clipId: string, assetId: string, rawSrc?: string): Promise<void> {
    if (!this.fabricEngine) return;
    if (this.fabricEngine.getElement(elementId)) return;

    const resolvedSrc =
      this.resolvedAssetSrc.get(assetId) ||
      (rawSrc ? await this.resolver.resolveImage(rawSrc) : undefined);
    if (!resolvedSrc) return;

    await this.fabricEngine.addImage({
      id: elementId,
      type: 'image',
      src: resolvedSrc,
      x: this.config.width / 2,
      y: this.config.height / 2,
      opacity: 0,
    });

    this.activeElements.set(elementId, { clipId, elementType: 'image' });
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
   * 使用统一坐标转换确保与预览一致
   */
  private calculateClipPosition(
    clip: Clip,
    track: Track,
    asset: Asset,
    project: VEIRProject
  ): { x: number; y: number; width: number; height: number } {
    let x = this.config.width / 2;
    let y = this.config.height / 2;
    let width = this.config.width;
    let height = this.config.height;

    // 文本默认位置：底部 85%（与编辑器预览一致）
    // - subtitle 由 renderSubtitleClip 基于安全区/对齐单独布局，这里不参与
    if (asset.type === 'text' && track.type !== 'subtitle') {
      y = this.config.height * 0.85;
    }

    // 检查是否有自定义位置（来自预览组件的拖拽）
    const adjustment = project.adjustments?.clipOverrides?.[clip.id];
    const transform = adjustment?.video?.transform;

    // 如果有 VEIR 中的 offset，使用统一坐标转换
    if (transform?.offset) {
      // VEIR offset 是像素坐标，转换为百分比再转为画布像素
      const resolution = project.meta.resolution;
      const percentX = (transform.offset[0] / resolution[0]) * 100;
      const percentY = (transform.offset[1] / resolution[1]) * 100;

      // 使用统一坐标转换函数确保与预览一致
      const pos = percentToCanvasPixel(percentX, percentY, this.config.width, this.config.height);
      x = pos.x;
      y = pos.y;
    }

    // 处理 PIP 布局
    if (track.type === 'pip' && clip.expression?.preset) {
      const preset = project.vocabulary.presets[clip.expression.preset];
      if (preset && preset.type === 'pipLayout') {
        const size = (preset.size as [number, number]) || [0.3, 0.3];
        const anchor = preset.anchor || 'bottom-right';

        width = this.config.width * size[0];
        height = this.config.height * size[1];

        // 如果没有自定义位置，使用预设锚点
        if (!transform?.offset) {
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
    }

    return { x, y, width, height };
  }

  /**
   * 渲染文本 Clip
   * 关键修复：读取 clipOverrides.video.transform.offset 确保拖拽位置生效
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

    // 读取 clipOverrides 中的自定义位置（来自预览拖拽）
    const adjustment = project.adjustments?.clipOverrides?.[clip.id];
    const transform = adjustment?.video?.transform;

    // 计算最终位置：优先使用 clipOverrides，否则使用默认中心位置
    let finalX = this.config.width / 2;
    let finalY = this.config.height * 0.85; // 文本默认在下方 85% 位置

    if (transform?.offset) {
      // VEIR offset 是像素坐标，转换为画布像素
      const resolution = project.meta.resolution;
      const percentX = (transform.offset[0] / resolution[0]) * 100;
      const percentY = (transform.offset[1] / resolution[1]) * 100;
      finalX = (percentX / 100) * this.config.width;
      finalY = (percentY / 100) * this.config.height;
    }

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
        // renderState 已经包含“基础位置 + 动画平移”，优先使用它，避免首帧出现跳位
        x: renderState.x ?? finalX,
        y: renderState.y ?? finalY,
        fontSize,
        fill,
        stroke,
        strokeWidth: stroke ? 4 : 0,
        opacity: renderState.opacity,
        angle: renderState.angle || 0,
        originX: 'center',
        originY: 'center',
      });
      this.activeElements.set(elementId, { clipId: clip.id, elementType: 'text' });
    } else {
      // 更新位置和动画状态
      // 关键修复：不要把 finalX/finalY 与 renderState.x/y 做“二次叠加”，否则拖拽后会出现偏移/跳位
      this.fabricEngine.applyRenderState(elementId, {
        ...renderState,
        x: renderState.x ?? finalX,
        y: renderState.y ?? finalY,
      });
    }
  }

  /**
   * 渲染字幕 Clip（强制统一安全区 + 底部/顶部对齐 + 自动换行）
   * - 新方案：字幕与花字/强调文本彻底分流，避免定位与对齐互相影响
   * - 关键修复：读取 clipOverrides.video.transform.offset 确保拖拽位置生效
   */
  private renderSubtitleClip(
    track: Track,
    clip: Clip,
    asset: Asset,
    renderState: RenderState,
    project: VEIRProject
  ): void {
    if (!this.fabricEngine || !asset.content) return;

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    const elementId = `subtitle-${clip.id}`;
    const existing = this.fabricEngine.getElement(elementId);

    // 样式来源：复用 vocabulary preset（可扩展字段，schema 允许 additionalProperties）
    const preset = clip.expression?.preset ? project.vocabulary.presets[clip.expression.preset] : null;
    const intensity = clip.expression?.intensity ?? 0.8;

    const fontFamily = (preset?.fontFamily as string) || 'Noto Sans SC';
    const fontWeight = (preset?.fontWeight as number) || 500;
    const fontSize =
      typeof preset?.fontSize === 'number' ? (preset.fontSize as number) : Math.round(36 * (0.9 + intensity * 0.2));
    const fill = (preset?.color as string) || '#FFFFFF';
    const stroke = (preset?.strokeColor as string) || undefined;
    const strokeWidth = typeof preset?.strokeWidth === 'number' ? (preset.strokeWidth as number) : 0;

    // 轨道布局（统一位置/对齐/安全区/最大宽度/行高）
    const layout = (track.layout || {}) as unknown as {
      position?: 'top' | 'bottom';
      alignment?: 'left' | 'center' | 'right';
      safeArea?: { left?: number; right?: number; top?: number; bottom?: number };
      maxWidth?: number;
      lineHeight?: number;
    };

    const safe = layout.safeArea || {};
    const safeLeft = clamp01(safe.left ?? 0.06);
    const safeRight = clamp01(safe.right ?? 0.06);
    const safeTop = clamp01(safe.top ?? 0.06);
    const safeBottom = clamp01(safe.bottom ?? 0.08);

    const safeWidth = Math.max(1, this.config.width * (1 - safeLeft - safeRight));
    const maxWidthRatio = clamp01(layout.maxWidth ?? 1);
    const textBoxWidth = Math.max(120, safeWidth * maxWidthRatio);

    const position = layout.position ?? 'bottom';
    const alignment = layout.alignment ?? 'center';

    // 默认位置（基于 track.layout）
    const defaultX = this.config.width * safeLeft + safeWidth / 2;
    const defaultY = position === 'top' ? this.config.height * safeTop : this.config.height * (1 - safeBottom);
    const originY: 'top' | 'bottom' = position === 'top' ? 'top' : 'bottom';

    // 读取 clipOverrides 中的自定义位置（来自预览拖拽）
    const adjustment = project.adjustments?.clipOverrides?.[clip.id];
    const transform = adjustment?.video?.transform;

    // 计算最终位置：优先使用 clipOverrides
    let finalX = defaultX;
    let finalY = defaultY;

    if (transform?.offset) {
      // VEIR offset 是像素坐标，转换为画布像素
      const resolution = project.meta.resolution;
      const percentX = (transform.offset[0] / resolution[0]) * 100;
      const percentY = (transform.offset[1] / resolution[1]) * 100;
      finalX = (percentX / 100) * this.config.width;
      finalY = (percentY / 100) * this.config.height;
    }

    if (!existing) {
      this.fabricEngine.addText({
        id: elementId,
        type: 'text',
        content: asset.content,
        x: finalX,
        y: finalY,
        // 关键：传入 width 触发 Fabric Textbox（自动换行）
        width: textBoxWidth,
        fontSize,
        fontFamily,
        fontWeight,
        fill,
        textAlign: alignment,
        originX: 'center',
        originY,
        opacity: renderState.opacity,
        angle: renderState.angle,
        lineHeight: layout.lineHeight ?? 1.25,
        stroke,
        strokeWidth,
      });
      this.activeElements.set(elementId, { clipId: clip.id, elementType: 'subtitle' });
    } else {
      // 更新位置和动画状态
      this.fabricEngine.applyRenderState(elementId, {
        x: finalX,
        y: finalY,
        scaleX: renderState.scaleX,
        scaleY: renderState.scaleY,
        angle: renderState.angle,
        opacity: renderState.opacity,
        blur: renderState.blur,
      });
    }
  }

  /**
   * 隐藏不活跃的元素
   */
  private cleanupInactiveElements(activeElementIds: Set<string>): void {
    if (!this.fabricEngine) return;

    for (const [elementId] of this.activeElements) {
      if (!activeElementIds.has(elementId)) {
        this.fabricEngine.removeElement(elementId);
        this.activeElements.delete(elementId);
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
    this.resolvedAssetSrc.clear();
  }

  /**
   * 生成并编码音频轨（browser-only）
   * - 支持：显式 audio track + 视频原声自动抽取、sourceRange、audio.timeWarp（含 ramp easing）、保音高 time-stretch（WSOLA）
   * - 对标 PR：默认“视频原声跟随视频 timeWarp”，且在转场窗口自动 crossfade
   */
  private async renderAndEncodeAudioFromVEIR(project: VEIRProject, onProgress?: ProgressCallback): Promise<void> {
    if (!this.videoComposer) return;

    const targetSampleRate = 48000;
    const targetChannels = 2;
    const totalFrames = Math.ceil(this.config.duration * targetSampleRate);
    const mix: Float32Array[] = new Array(targetChannels).fill(0).map(() => new Float32Array(totalFrames));

    // 0) 邻接关系（用于音频 crossfade）
    const neighborsByTrackAndClipId = new Map<string, { prev?: Clip; next?: Clip; track: Track }>();
    for (const track of project.timeline.tracks) {
      const sorted = [...track.clips].sort((a, b) => a.time.start - b.time.start);
      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];
        neighborsByTrackAndClipId.set(`${track.id}:${c.id}`, { prev: sorted[i - 1], next: sorted[i + 1], track });
      }
    }

    // 1) 收集音频 sources
    type AudioSourceItem =
      | { kind: 'audio-asset'; track: Track; clip: Clip; src: string }
      | { kind: 'video-asset-audio'; track: Track; clip: Clip; src: string };

    const sources: AudioSourceItem[] = [];
    for (const track of project.timeline.tracks) {
      if (track.type === 'audio') {
        for (const clip of track.clips) {
          const asset = project.assets.assets[clip.asset] as any;
          if (!asset || asset.type !== 'audio' || !asset.src) continue;
          const resolved = this.resolvedAssetSrc.get(clip.asset) || (await this.resolver.resolveAudio(asset.src));
          this.resolvedAssetSrc.set(clip.asset, resolved);
          sources.push({ kind: 'audio-asset', track, clip, src: resolved });
        }
      }

      // 自动抽取视频原声：直接从视频文件 demux+decode 音频轨（对标 PR）
      // 注意：pip 轨道也可能包含视频素材，需要抽取原声
      if (track.type === 'video' || track.type === 'pip') {
        for (const clip of track.clips) {
          const asset = project.assets.assets[clip.asset] as any;
          if (!asset || asset.type !== 'video' || !asset.src) continue;
          const resolved = this.resolvedAssetSrc.get(clip.asset) || (await this.resolver.resolveVideo(asset.src));
          this.resolvedAssetSrc.set(clip.asset, resolved);
          sources.push({ kind: 'video-asset-audio', track, clip, src: resolved });
        }
      }
    }
    // 注意：即使 sources 为空，也要写入“静音轨”，否则容器可能会被 mux 成“无音频轨”
    // 这会导致用户看到“导出视频没有音频”的表现（即使我们在 start 时添加了 audio track）。

    // 2) 解码缓存（按 URL/区间）
    const decodedAudioCache = new Map<string, Awaited<ReturnType<typeof decodeAudioFromUrl>>>();
    const decodedMediaAudioCache = new Map<string, Awaited<ReturnType<typeof decodePcmFromMediaUrl>>>();

    const getDecodedAudioAsset = async (url: string) => {
      if (!decodedAudioCache.has(url)) decodedAudioCache.set(url, await decodeAudioFromUrl(url));
      return decodedAudioCache.get(url)!;
    };
    const getDecodedFromMedia = async (url: string, startTime: number, endTime: number) => {
      const key = `${url}#${Math.round(startTime * 100)}-${Math.round(endTime * 100)}`; // 10ms
      if (!decodedMediaAudioCache.has(key)) {
        decodedMediaAudioCache.set(key, await decodePcmFromMediaUrl(url, { startTime, endTime }));
      }
      return decodedMediaAudioCache.get(key)!;
    };

    const resampleLinear = (pcm: Float32Array, inRate: number, outRate: number): Float32Array => {
      if (inRate === outRate) return pcm;
      const ratio = outRate / inRate;
      const outLen = Math.max(1, Math.floor(pcm.length * ratio));
      const out = new Float32Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const x = i / ratio;
        const x0 = Math.floor(x);
        const x1 = Math.min(pcm.length - 1, x0 + 1);
        const t = x - x0;
        out[i] = pcm[x0] * (1 - t) + pcm[x1] * t;
      }
      return out;
    };

    // 3) 逐 clip 生成音频并混音（显式音频轨 + 视频原声）
    let hasAnyDecodedAudio = false;
    // TimeStretch engine (WASM/Worker preferred; JS fallback guaranteed)
    let timeStretchEngine: TimeStretchEngine | null = null;

    const tryDecodeVideoAudio = async (url: string, startTime: number, endTime: number) => {
      // 优先：MediaBunny demux+decode（更“剪辑友好”，可按区间解码）
      try {
        const decoded = await getDecodedFromMedia(url, startTime, endTime);
        if (decoded && decoded.pcm?.length) return decoded;
      } catch (e) {
        console.warn('[ModernComposer] decodePcmFromMediaUrl failed, fallback to WebAudio:', { url, e });
      }

      // 回退：WebAudio decodeAudioData（兼容性更好，但通常需要解码整段再 slice）
      try {
        const decoded = await getDecodedAudioAsset(url);
        const inRate = decoded.sampleRate;
        const channels = decoded.channels;
        const startS = Math.max(0, Math.floor(startTime * inRate));
        const endS = Number.isFinite(endTime) ? Math.max(startS + 1, Math.floor(endTime * inRate)) : decoded.pcm[0]?.length ?? 0;

        const pcm = decoded.pcm.map((ch) => {
          const a = ch.subarray(startS, Math.min(ch.length, endS));
          const out = new Float32Array(Math.max(1, a.length));
          out.set(a.length ? a : new Float32Array([0]));
          return out;
        });
        return { sampleRate: inRate, channels, pcm };
      } catch (e) {
        console.warn('[ModernComposer] decodeAudioFromUrl fallback failed:', { url, e });
        return null;
      }
    };

    let processed = 0;
    for (const item of sources) {
      processed++;
      const p = 90 + (processed / sources.length) * 5;
      onProgress?.(p, 'encoding', `处理音频 ${processed}/${sources.length}`);

      const { clip, track, src } = item;
      const clipDur = clip.time.end - clip.time.start;
      if (!(clipDur > 0)) continue;
      const outLen = Math.max(1, Math.floor(clipDur * targetSampleRate));

      // timeWarp：优先 adjustments.audio；否则继承 video.timeWarp（对标 PR：原声随视频变速）
      const override = (project.adjustments?.clipOverrides?.[clip.id] as any) || {};
      const audioAdj = override.audio || {};
      const videoAdj = override.video || {};
      const timeWarp = (audioAdj.timeWarp || videoAdj.timeWarp) as
        | { mode?: string; segments?: Array<{ when?: { start?: number; end?: number }; speed?: number; easing?: string }> }
        | undefined;
      const maintainPitch = typeof audioAdj.maintainPitch === 'boolean' ? audioAdj.maintainPitch : true;

      // 估算输入长度（秒）≈ ∫ speed(t) dt
      const estimateSourceDurationSec = () => {
        if (!timeWarp) return clipDur;
        return mapLocalTimeWithTimeWarp(clipDur, clipDur, timeWarp);
      };
      const inNeededSec = estimateSourceDurationSec();

      // 计算源区间（默认从 sourceRange.start 开始）
      const srcStart = clip.sourceRange?.start ?? 0;
      const srcEnd = typeof clip.sourceRange?.end === 'number' ? clip.sourceRange.end : (srcStart + inNeededSec);

      // 解码并归一到目标采样率/声道
      let pcmResampled: Float32Array[] = [];
      try {
        if (item.kind === 'audio-asset') {
          const decoded = await getDecodedAudioAsset(src);
          const inCh = decoded.channels;
          const inRate = decoded.sampleRate;
          for (let c = 0; c < Math.min(inCh, targetChannels); c++) {
            pcmResampled.push(resampleLinear(decoded.pcm[c], inRate, targetSampleRate));
          }
          hasAnyDecodedAudio = true;
        } else {
          const decoded = await tryDecodeVideoAudio(src, srcStart, srcEnd);
          if (!decoded) continue;
          const inCh = decoded.channels;
          const inRate = decoded.sampleRate;
          for (let c = 0; c < Math.min(inCh, targetChannels); c++) {
            pcmResampled.push(resampleLinear(decoded.pcm[c], inRate, targetSampleRate));
          }
          hasAnyDecodedAudio = true;
        }
      } catch (e) {
        // 单个音频源失败不应影响整个导出（否则表现为“导出无音频”）
        console.warn('[ModernComposer] audio source decode failed, skipping:', { kind: item.kind, src, e });
        continue;
      }
      while (pcmResampled.length < targetChannels) {
        pcmResampled.push(pcmResampled[pcmResampled.length - 1] || new Float32Array(1));
      }

      // slice：音频资产需要从 sourceRange.start 截取；视频原声解码已按 start/end 截取
      const inNeeded = Math.max(1, Math.floor(inNeededSec * targetSampleRate));
      const srcStartSamples = Math.max(0, Math.floor(srcStart * targetSampleRate));
      const slice = (ch: Float32Array) => {
        const start = item.kind === 'audio-asset' ? srcStartSamples : 0;
        const end = Math.min(ch.length, start + inNeeded);
        const out = new Float32Array(Math.max(1, end - start));
        out.set(ch.subarray(start, end));
        return out;
      };
      const inputSlice = pcmResampled.map(slice);

      // 非保音高变速（更稳的回退路径）：按 timeWarp 把输出时间映射到源时间，再线性插值取样
      // 注意：inputSlice 已经是“以 sourceRange.start 为 0”的源音频片段
      const resampleWithTimeWarp = (ch: Float32Array): Float32Array => {
        // 没有 timeWarp：直接截断/补零
        if (!timeWarp) {
          if (ch.length >= outLen) return ch.subarray(0, outLen) as unknown as Float32Array;
          const out = new Float32Array(outLen);
          out.set(ch);
          return out;
        }

        const inLen = ch.length;
        const out = new Float32Array(outLen);
        if (inLen <= 1) return out; // 只有 0/1 个样本时，直接输出静音（避免插值越界）

        const maxIdx = inLen - 1;
        for (let i = 0; i < outLen; i++) {
          const tOut = i / targetSampleRate; // clip local time
          const tIn = mapLocalTimeWithTimeWarp(tOut, clipDur, timeWarp); // source time
          let x = tIn * targetSampleRate; // source sample index (in inputSlice domain)
          if (!Number.isFinite(x)) x = 0;
          if (x < 0) x = 0;
          if (x > maxIdx) x = maxIdx;
          const x0 = Math.floor(x);
          const x1 = Math.min(maxIdx, x0 + 1);
          const t = x - x0;
          const s0 = ch[x0] ?? 0;
          const s1 = ch[x1] ?? 0;
          out[i] = s0 * (1 - t) + s1 * t;
        }
        return out;
      };

      let stretched: Float32Array[];
      if (!maintainPitch) {
        // 不保音高：按 timeWarp 做“速率映射重采样”（避免 WSOLA，同时保证时间一致）
        stretched = inputSlice.map(resampleWithTimeWarp);
      } else {
        // 检查是否真正需要变速处理
        // 如果没有 timeWarp，或者是恒定速度为 1.0，则跳过 WSOLA 避免引入伪影
        const needsTimeStretch = (() => {
          if (!timeWarp) return false;
          const mode = typeof timeWarp.mode === 'string' ? timeWarp.mode : 'constant';
          const segments = Array.isArray(timeWarp.segments) ? timeWarp.segments : [];

          if (mode === 'constant') {
            const speed = segments[0]?.speed;
            // 如果是恒定速度 1.0（或未定义），不需要变速
            return typeof speed === 'number' && Math.abs(speed - 1.0) > 0.01;
          }

          // ramp 模式：检查是否所有 segment 都是 1.0 速度
          const hasVariableSpeed = segments.some(s => {
            const speed = s?.speed;
            return typeof speed === 'number' && Math.abs(speed - 1.0) > 0.01;
          });
          return hasVariableSpeed;
        })();

        if (!needsTimeStretch) {
          // 不需要变速，直接使用原音频（避免 WSOLA 伪影）
          stretched = inputSlice.map((ch) => {
            if (ch.length >= outLen) {
              return ch.subarray(0, outLen) as unknown as Float32Array;
            }
            // 如果输入比输出短，填充静音
            const out = new Float32Array(outLen);
            out.set(ch);
            return out;
          });
          console.log('[ModernComposer] Audio: skipping WSOLA (no speed change needed)', { clipId: clip.id });
        } else {
          // Pro path: pitch-preserving time-stretch via WASM/Worker (ffmpeg.wasm atempo)
          // - Always deterministic (ratioCurve sampled per output frame)
          // - Any error will fallback to JS engine (handled by createPreferredTimeStretchEngine)
          // - If still fails, fallback to non-pitch resample (last resort)
          try {
            if (!timeStretchEngine) {
              timeStretchEngine = await createPreferredTimeStretchEngine({ coreBaseURL: '/ffmpeg-core' });
            }

            const ratioAtUs = (tUs: any) => {
              const tSec = (tUs as number) / 1e6;
              const speed = speedAtTimeWarp(timeWarp, clipDur, tSec);
              const s = Math.min(4, Math.max(0.1, speed));
              return 1 / s;
            };

            console.log('[ModernComposer] Audio: using WASM time-stretch (ffmpeg atempo)', { clipId: clip.id, timeWarp });
            stretched = await timeStretchEngine.stretchPlanarF32({
              sampleRate: targetSampleRate,
              channels: targetChannels,
              input: inputSlice,
              outputFrames: outLen,
              ratioAt: ratioAtUs,
              quality: 'high',
            });
          } catch (e) {
            console.warn('[ModernComposer] Audio: WASM time-stretch failed, fallback to timeWarp resample', { clipId: clip.id, e });
            stretched = inputSlice.map(resampleWithTimeWarp);
          }
        }
      }


      // 音频 crossfade：转场窗口淡入淡出（对标 PR）
      const neighbor = neighborsByTrackAndClipId.get(`${track.id}:${clip.id}`);
      const prev = neighbor?.prev;
      const prevT = this.resolveTransition(project, prev?.transitionOut);
      const outT = this.resolveTransition(project, clip.transitionOut);
      const fadeInDur = typeof prevT?.duration === 'number' ? Math.max(0, prevT.duration) : 0;
      const fadeOutDur = typeof outT?.duration === 'number' ? Math.max(0, outT.duration) : 0;
      const fadeInFrames = Math.min(outLen, Math.floor(fadeInDur * targetSampleRate));
      const fadeOutFrames = Math.min(outLen, Math.floor(fadeOutDur * targetSampleRate));
      const envelope = (i: number) => {
        let g = 1;
        if (fadeInFrames > 0 && i < fadeInFrames) {
          g *= i / fadeInFrames; // 可升级 equal-power
        }
        if (fadeOutFrames > 0 && i >= outLen - fadeOutFrames) {
          g *= Math.max(0, Math.min(1, (outLen - i) / fadeOutFrames));
        }
        return g;
      };

      const outOffset = Math.max(0, Math.floor(clip.time.start * targetSampleRate));
      for (let c = 0; c < targetChannels; c++) {
        const dst = mix[c];
        const srcCh = stretched[c];
        const maxWrite = Math.min(dst.length - outOffset, srcCh.length);
        for (let i = 0; i < maxWrite; i++) dst[outOffset + i] += srcCh[i] * envelope(i);
      }
    }

    // Ensure we clean up worker/wasm resources (important for repeated exports)
    try { timeStretchEngine?.destroy(); } catch { }

    // 说明：若没有任何音频成功解码，也要继续写入“静音”，确保输出包含音频轨
    if (!hasAnyDecodedAudio) {
      console.warn('[ModernComposer] no decodable audio sources; writing silent audio track to keep container audio track');
    }

    // 4) 混音后的清洗 + 峰值归一化 + 软限幅
    // - 先把 NaN/Infinity 等异常样本清零，避免导出变成“麦没插好”的爆噪
    // - 再做峰值归一化与软限幅，降低削波失真风险
    let peakValue = 0;
    let nonFiniteCount = 0;
    let sumSq = 0;
    let sumCount = 0;
    for (let c = 0; c < targetChannels; c++) {
      const ch = mix[c];
      for (let i = 0; i < ch.length; i++) {
        const v = ch[i];
        if (!Number.isFinite(v)) {
          ch[i] = 0;
          nonFiniteCount++;
          continue;
        }
        const absVal = Math.abs(v);
        if (absVal > peakValue) peakValue = absVal;
        sumSq += v * v;
        sumCount++;
      }
    }

    const targetPeak = 0.9; // 目标峰值，留有余量
    const shouldNormalize = peakValue > 1.0;
    for (let c = 0; c < targetChannels; c++) {
      const ch = mix[c];
      for (let i = 0; i < ch.length; i++) {
        let v = ch[i];

        // 峰值过高时做统一缩放
        if (shouldNormalize) {
          v = (v / peakValue) * targetPeak;
        }

        // 软限幅 + 最终硬限幅（编码前兜底，防止极端值导致杂音/爆音）
        if (Math.abs(v) > 0.9) {
          const sign = v > 0 ? 1 : -1;
          const excess = Math.abs(v) - 0.9;
          v = sign * (0.9 + 0.08 * Math.tanh(excess * 8));
        }
        // clamp 到 WebAudio 典型 [-1, 1]，避免某些编码器实现对越界 float 处理异常
        if (v > 1) v = 1;
        if (v < -1) v = -1;

        ch[i] = v;
      }
    }
    if (shouldNormalize) {
      console.log(`[ModernComposer] Audio peak normalization applied: ${peakValue.toFixed(2)} -> ${targetPeak}`);
    }
    if (nonFiniteCount > 0) {
      console.warn(`[ModernComposer] Audio contained non-finite samples, zeroed: ${nonFiniteCount}`);
    }
    // 便于排查“必现爆噪”：快速观测音频整体能量是否异常（接近 1 的 RMS 往往意味着全段饱和/噪声）
    const rms = sumCount > 0 ? Math.sqrt(sumSq / sumCount) : 0;
    const stats = {
      sampleRate: targetSampleRate,
      channels: targetChannels,
      frames: totalFrames,
      peak: peakValue,
      rms,
      hasAnyDecodedAudio,
    };
    console.log('[ModernComposer] Audio stats', stats);
    // 方便你在 Chrome 里直接复制（单行 JSON）
    console.log('[ModernComposer] Audio stats JSON', JSON.stringify(stats));

    // 5) 输出到编码器：分块写入 AudioData
    const chunkFrames = 1024;

    for (let offset = 0; offset < totalFrames; offset += chunkFrames) {
      const n = Math.min(chunkFrames, totalFrames - offset);
      // 重要：使用 f32-planar（按声道平面顺序存储）更符合 MediaBunny/AudioEncoder 的“最兼容”路径
      // layout: [ch0 frames...][ch1 frames...]...
      const planar = new Float32Array(n * targetChannels);
      for (let c = 0; c < targetChannels; c++) {
        planar.set(mix[c].subarray(offset, offset + n), c * n);
      }
      const timestampUs = Math.round((offset / targetSampleRate) * 1e6);
      await this.videoComposer.encodeAudioPlanarF32({
        data: planar,
        sampleRate: targetSampleRate,
        numberOfChannels: targetChannels,
        timestampUs,
      });
    }
  }
}

function speedAtTimeWarp(
  timeWarp:
    | { mode?: string; segments?: Array<{ when?: { start?: number; end?: number }; speed?: number; easing?: string }> }
    | undefined,
  clipDuration: number,
  localTime: number
): number {
  const t = Math.min(clipDuration, Math.max(0, localTime));
  if (!timeWarp) return 1;
  const mode = typeof timeWarp.mode === 'string' ? timeWarp.mode : 'constant';
  const segments = Array.isArray(timeWarp.segments) ? timeWarp.segments : [];
  const clampSpeed = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(4, Math.max(0.1, v)) : undefined);
  if (mode === 'constant') return clampSpeed(segments[0]?.speed) ?? 1;

  // ramp：找到覆盖 t 的 segment，按“从上一段 speed → 当前段 speed”的 easing 插值
  type Seg = { start: number; end: number; speed: number; easing: string | undefined };
  const segs: Seg[] = [];
  for (const s of segments) {
    const when = s?.when;
    const start = typeof when?.start === 'number' && Number.isFinite(when.start) ? when.start : undefined;
    const end = typeof when?.end === 'number' && Number.isFinite(when.end) ? when.end : undefined;
    const speed = clampSpeed(s?.speed);
    if (start === undefined || end === undefined || speed === undefined) continue;
    if (end <= start) continue;
    const a = Math.max(0, start);
    const b = Math.min(clipDuration, end);
    if (b <= a) continue;
    segs.push({ start: a, end: b, speed, easing: s?.easing });
  }
  segs.sort((a, b) => (a.start - b.start) || (a.end - b.end));
  if (segs.length === 0) return 1;

  let prevSpeed = 1;
  for (const s of segs) {
    if (t < s.start) return 1;
    if (t >= s.start && t < s.end) {
      const u = (t - s.start) / Math.max(1e-9, (s.end - s.start));
      const e = normalizeEasing(s.easing);
      const k = ease(e, u);
      return prevSpeed + (s.speed - prevSpeed) * k;
    }
    prevSpeed = s.speed;
  }
  return 1;
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

// ============================================
// 快速合成函数 (简化 API)
// ============================================

/**
 * 字幕输入类型
 */
export interface SubtitleInput {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    position?: 'top' | 'center' | 'bottom';
    alignment?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontWeight?: number;
    stroke?: { color: string; width: number };
    shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
    animation?: {
      enter?: string;
      exit?: string;
      enterDuration?: number;
      exitDuration?: number;
    };
  };
}

/**
 * 快速合成选项
 */
export interface QuickComposeOptions {
  startTime?: number;
  endTime?: number;
  width?: number;
  height?: number;
  fps?: number;
  keepAudio?: boolean;
  format?: OutputFormat;
  quality?: 'high' | 'medium' | 'low';
}

/**
 * 老架构兼容的进度回调类型
 */
export type LegacyProgressCallback = (progress: number, message: string) => void;

/**
 * 动画效果类型 (兼容老架构)
 */
export interface AnimationEffect {
  type: 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'bounce' | 'shake' | 'pulse' | 'glow';
  enterDuration?: number;
  exitDuration?: number;
  easing?: string;
}

/**
 * 快速合成视频与字幕
 * 这是一个简化的 API，用于快速将视频和字幕合成为新视频
 * 
 * @param videoUrl - 视频 URL
 * @param subtitles - 字幕列表
 * @param options - 合成选项
 * @param onProgress - 进度回调
 * @returns 输出视频的 Blob URL
 */
export async function quickCompose(
  videoUrl: string,
  subtitles: SubtitleInput[],
  options: QuickComposeOptions = {},
  onProgress?: LegacyProgressCallback
): Promise<string> {
  const {
    startTime = 0,
    endTime,
    width = 1920,
    height = 1080,
    fps = 30,
    format = 'mp4',
    quality = 'high',
  } = options;

  onProgress?.(0, '初始化合成器...');

  // 创建 Fabric 画布引擎
  const fabricEngine = new FabricEngine({
    width,
    height,
    backgroundColor: '#000000',
  });

  try {
    onProgress?.(5, '加载视频...');

    // 加载视频
    await fabricEngine.addVideo({
      id: 'main-video',
      type: 'video',
      src: videoUrl,
      x: width / 2,
      y: height / 2,
      width,
      height,
    });

    // 计算时长
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      videoElement.onloadedmetadata = () => resolve();
      videoElement.onerror = () => reject(new Error('Failed to load video'));
    });

    const videoDuration = endTime ?? videoElement.duration;
    const duration = videoDuration - startTime;
    const totalFrames = Math.ceil(duration * fps);

    onProgress?.(10, '准备编码器...');

    // 创建视频合成器
    const videoComposer = new MediaBunnyComposer(
      {
        width,
        height,
        frameRate: fps,
        quality,
      },
      undefined,
      format
    );

    await videoComposer.start(fabricEngine.getCanvasElement());

    onProgress?.(15, '开始渲染...');

    // 逐帧渲染
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = startTime + frame / fps;

      // 更新视频帧
      await fabricEngine.seekVideo('main-video', time);
      fabricEngine.applyRenderState('main-video', { opacity: 1 });

      // 渲染字幕
      renderSubtitlesOnCanvas(
        fabricEngine,
        subtitles,
        time,
        { width, height }
      );

      // 渲染并编码帧
      fabricEngine.render();

      const frameDuration = 1 / fps;
      await videoComposer.encodeFrame(frame / fps, frameDuration, {
        keyFrame: frame % 30 === 0,
      });

      // 更新进度
      if (frame % 10 === 0) {
        const progress = 15 + (frame / totalFrames) * 80;
        onProgress?.(progress, `渲染中 ${Math.round((frame / totalFrames) * 100)}%`);
      }
    }

    onProgress?.(95, '完成编码...');

    // 完成合成
    const result = await videoComposer.finalize();
    videoComposer.destroy();

    onProgress?.(100, '完成');

    return result.downloadUrl;
  } finally {
    fabricEngine.destroy();
  }
}

/**
 * 在 Canvas 上渲染字幕
 */
function renderSubtitlesOnCanvas(
  fabricEngine: FabricEngine,
  subtitles: SubtitleInput[],
  currentTime: number,
  dimensions: { width: number; height: number }
): void {
  const { width, height } = dimensions;

  // 找到当前时间的字幕
  const activeSubtitles = subtitles.filter(
    (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  // 移除不活跃的字幕
  for (const sub of subtitles) {
    if (!activeSubtitles.includes(sub)) {
      fabricEngine.removeElement(`subtitle-${sub.id}`);
    }
  }

  // 渲染活跃的字幕
  for (const subtitle of activeSubtitles) {
    const elementId = `subtitle-${subtitle.id}`;
    const existing = fabricEngine.getElement(elementId);

    // 计算位置
    const style = subtitle.style || {};
    let y = height * 0.85; // 默认底部
    if (style.position === 'top') y = height * 0.1;
    if (style.position === 'center') y = height * 0.5;

    // 计算动画状态
    const duration = subtitle.endTime - subtitle.startTime;
    const localTime = currentTime - subtitle.startTime;
    const progress = localTime / duration;
    const animState = calculateSubtitleAnimation(progress, style.animation);

    if (!existing) {
      // 创建新字幕
      fabricEngine.addText({
        id: elementId,
        type: 'text',
        content: subtitle.text,
        x: width / 2,
        y,
        fontSize: style.fontSize || 36,
        fontFamily: style.fontFamily || 'Noto Sans SC',
        fontWeight: style.fontWeight || 500,
        fill: style.color || '#FFFFFF',
        stroke: style.stroke?.color,
        strokeWidth: style.stroke?.width || 0,
        textAlign: style.alignment || 'center',
        opacity: animState.opacity,
      });
    } else {
      // 更新字幕状态
      fabricEngine.applyRenderState(elementId, {
        opacity: animState.opacity,
        y: y + (animState.translateY || 0),
        scaleX: animState.scale,
        scaleY: animState.scale,
      });
    }
  }
}

/**
 * 计算字幕动画状态
 */
function calculateSubtitleAnimation(
  progress: number,
  animation?: { enter?: string; exit?: string; enterDuration?: number; exitDuration?: number }
): { opacity: number; translateY: number; scale: number } {
  const enterDuration = animation?.enterDuration ?? 0.15;
  const exitDuration = animation?.exitDuration ?? 0.15;

  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  const enterType = animation?.enter || 'fade';
  const exitType = animation?.exit || 'fade';

  // 入场动画
  if (progress < enterDuration) {
    const t = progress / enterDuration;
    const easedT = 1 - Math.pow(1 - t, 3); // easeOut

    switch (enterType) {
      case 'slide-up':
        translateY = (1 - easedT) * 50;
        opacity = easedT;
        break;
      case 'slide-down':
        translateY = -(1 - easedT) * 50;
        opacity = easedT;
        break;
      case 'zoom':
        scale = 0.5 + easedT * 0.5;
        opacity = easedT;
        break;
      case 'bounce':
        scale = easedT;
        translateY = (1 - easedT) * 50;
        opacity = 1;
        break;
      case 'fade':
      default:
        opacity = easedT;
        break;
    }
  }
  // 出场动画
  else if (progress > 1 - exitDuration) {
    const t = (progress - (1 - exitDuration)) / exitDuration;
    const easedT = t * t * t; // easeIn

    switch (exitType) {
      case 'slide-up':
        translateY = -easedT * 30;
        opacity = 1 - easedT;
        break;
      case 'slide-down':
        translateY = easedT * 30;
        opacity = 1 - easedT;
        break;
      case 'zoom':
        scale = 1 - easedT * 0.2;
        opacity = 1 - easedT;
        break;
      case 'fade':
      default:
        opacity = 1 - easedT;
        break;
    }
  }

  return { opacity, translateY, scale };
}

/**
 * 将转场效果应用到 RenderState（无重叠版本：分别作用于 outgoing/incoming 片段内部）
 */
function applyTransitionToRenderState(
  state: RenderState,
  type: string,
  phase: 'in' | 'out',
  t: number,
  canvasW: number,
  canvasH: number
): void {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const tt = clamp01(t);
  const p = phase === 'in' ? tt : (1 - tt); // 1->0 for out, 0->1 for in（便于统一）

  const baseOpacity = state.opacity ?? 1;

  // 对齐类型：dissolve 在当前实现中与 fade 等价（不做双片段叠加）
  const normalized = type === 'dissolve' ? 'fade' : type;

  switch (normalized) {
    case 'fade':
      state.opacity = baseOpacity * p;
      break;

    case 'slide': {
      const dx = canvasW * 0.08;
      state.opacity = baseOpacity * p;
      // incoming 从右进；outgoing 向左出
      state.x = (state.x ?? canvasW / 2) + (phase === 'in' ? (1 - tt) * dx : -tt * dx);
      break;
    }

    case 'zoom': {
      const s = phase === 'in' ? (0.94 + 0.06 * tt) : (1 - 0.06 * tt);
      state.opacity = baseOpacity * p;
      state.scaleX = (state.scaleX ?? 1) * s;
      state.scaleY = (state.scaleY ?? 1) * s;
      break;
    }

    case 'blur': {
      state.opacity = baseOpacity * p;
      // 0~20 的轻模糊（Fabric 内部 /100）
      const blurAmount = phase === 'in' ? (1 - tt) * 20 : tt * 20;
      state.blur = Math.max(state.blur ?? 0, blurAmount);
      break;
    }

    case 'wipe':
    default:
      // 当前 Fabric 渲染器不做 clip-mask，先降级为 fade
      state.opacity = baseOpacity * p;
      break;
  }
}

function buildWipeClipPath(
  phase: 'in' | 'out',
  t: number,
  direction: string | undefined,
  canvasW: number,
  canvasH: number
): fabric.FabricObject {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const tt = clamp01(t);
  const dir = direction === 'right' || direction === 'up' || direction === 'down' ? direction : 'left';

  // absolutePositioned：使用画布坐标系
  const rect = new fabric.Rect({
    left: 0,
    top: 0,
    width: canvasW,
    height: canvasH,
    absolutePositioned: true,
  } as any);

  // incoming: reveal from 0 -> full
  // outgoing: hide from full -> 0
  const k = phase === 'in' ? tt : (1 - tt);

  if (dir === 'left') {
    rect.set({
      left: 0,
      top: 0,
      width: canvasW * k,
      height: canvasH,
    });
  } else if (dir === 'right') {
    rect.set({
      left: canvasW * (1 - k),
      top: 0,
      width: canvasW * k,
      height: canvasH,
    });
  } else if (dir === 'up') {
    rect.set({
      left: 0,
      top: canvasH * (1 - k),
      width: canvasW,
      height: canvasH * k,
    });
  } else if (dir === 'down') {
    rect.set({
      left: 0,
      top: 0,
      width: canvasW,
      height: canvasH * k,
    });
  }

  return rect;
}

/**
 * 将 clip 内的 localTime（timeline 时间）映射到 source 时间（素材播放时间）
 * - constant: 统一倍率
 * - ramp: 分段倍率曲线（按 segments 区间做积分；未覆盖区间默认 speed=1）
 */
function mapLocalTimeWithTimeWarp(
  localTime: number,
  clipDuration: number,
  timeWarp:
    | { mode?: string; segments?: Array<{ when?: { start?: number; end?: number }; speed?: number; easing?: string }> }
    | undefined
): number {
  if (!(typeof localTime === 'number') || !Number.isFinite(localTime)) return 0;
  if (!(typeof clipDuration === 'number') || !Number.isFinite(clipDuration) || clipDuration <= 0) return Math.max(0, localTime);

  const t = Math.min(clipDuration, Math.max(0, localTime));
  if (!timeWarp || typeof timeWarp !== 'object') return t;

  const mode = typeof timeWarp.mode === 'string' ? timeWarp.mode : 'constant';
  const segments = Array.isArray(timeWarp.segments) ? timeWarp.segments : [];

  const clampSpeed = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(4, Math.max(0.1, v)) : undefined);

  if (mode === 'constant') {
    const s0 = clampSpeed(segments[0]?.speed) ?? 1;
    return t * s0;
  }

  // ramp：按区间积分（piecewise-constant）
  type Seg = { start: number; end: number; speed: number };
  const segs: Seg[] = [];
  for (const s of segments) {
    const when = s?.when;
    const start = typeof when?.start === 'number' && Number.isFinite(when.start) ? when.start : undefined;
    const end = typeof when?.end === 'number' && Number.isFinite(when.end) ? when.end : undefined;
    const speed = clampSpeed(s?.speed);
    if (start === undefined || end === undefined || speed === undefined) continue;
    if (end <= start) continue;
    const a = Math.max(0, start);
    const b = Math.min(clipDuration, end);
    if (b <= a) continue;
    segs.push({ start: a, end: b, speed });
  }
  segs.sort((a, b) => (a.start - b.start) || (a.end - b.end));

  // 去重/去重叠（保持最简单的确定性）
  const normalized: Seg[] = [];
  let cursor = 0;
  for (const s of segs) {
    const ss = Math.max(s.start, cursor);
    const ee = s.end;
    if (ee <= ss) continue;
    normalized.push({ start: ss, end: ee, speed: s.speed });
    cursor = ee;
    if (cursor >= clipDuration) break;
  }

  let source = 0;
  let cur = 0;
  for (const s of normalized) {
    if (cur >= t) break;
    const gapEnd = Math.min(t, s.start);
    if (gapEnd > cur) {
      source += (gapEnd - cur) * 1;
      cur = gapEnd;
    }
    if (cur >= t) break;
    const segEnd = Math.min(t, s.end);
    if (segEnd > cur) {
      source += (segEnd - cur) * s.speed;
      cur = segEnd;
    }
  }
  if (cur < t) {
    source += (t - cur) * 1;
  }

  return source;
}

type EasingName = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
type PreparedSegment = {
  start: number;
  end: number;
  speed0: number;
  speed1: number;
  easing: EasingName;
  prefixSourceAtStart: number;
};
type PreparedTimeWarp = {
  clipDuration: number;
  segments: PreparedSegment[];
};

function clampTime(localTime: number, clipDuration: number): number {
  if (!(typeof localTime === 'number') || !Number.isFinite(localTime)) return 0;
  if (!(typeof clipDuration === 'number') || !Number.isFinite(clipDuration) || clipDuration <= 0) return Math.max(0, localTime);
  return Math.min(clipDuration, Math.max(0, localTime));
}

function normalizeEasing(name: unknown): EasingName {
  const s = typeof name === 'string' ? name : '';
  if (s === 'ease-in' || s === 'ease-out' || s === 'ease-in-out' || s === 'linear') return s;
  // 兼容常见别名
  if (/easeinout/i.test(s)) return 'ease-in-out';
  if (/easein/i.test(s)) return 'ease-in';
  if (/easeout/i.test(s)) return 'ease-out';
  return 'linear';
}

function ease(e: EasingName, t: number): number {
  const x = Math.min(1, Math.max(0, t));
  switch (e) {
    case 'ease-in':
      return x * x;
    case 'ease-out':
      return 1 - (1 - x) * (1 - x);
    case 'ease-in-out':
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    case 'linear':
    default:
      return x;
  }
}

function integrateSpeedSegment(seg: PreparedSegment, tEnd: number): number {
  const a = seg.start;
  const b = Math.min(seg.end, tEnd);
  if (b <= a) return 0;
  // Simpson's rule with fixed even n
  const n = 8;
  const h = (b - a) / n;
  const speedAt = (t: number) => {
    const u = (t - seg.start) / Math.max(1e-9, (seg.end - seg.start));
    const k = ease(seg.easing, u);
    return seg.speed0 + (seg.speed1 - seg.speed0) * k;
  };
  let s = speedAt(a) + speedAt(b);
  for (let i = 1; i < n; i++) {
    const x = a + h * i;
    s += speedAt(x) * (i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * s;
}

function prepareTimeWarp(
  clipDuration: number,
  timeWarp:
    | { mode?: string; segments?: Array<{ when?: { start?: number; end?: number }; speed?: number; easing?: string }> }
    | undefined
): PreparedTimeWarp | null {
  if (!timeWarp || typeof timeWarp !== 'object') return null;
  const mode = typeof timeWarp.mode === 'string' ? timeWarp.mode : 'constant';
  if (mode !== 'ramp') return null;

  const clampSpeed = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(4, Math.max(0.1, v)) : undefined);
  const raw = Array.isArray(timeWarp.segments) ? timeWarp.segments : [];

  // 以“区间”为主：每段可选择 easing 表达“从上一段 speed → 当前段 speed”的连续过渡
  type RawSeg = { start: number; end: number; speed: number; easing: EasingName };
  const segs: RawSeg[] = [];
  for (const s of raw) {
    const when = s?.when;
    const start = typeof when?.start === 'number' && Number.isFinite(when.start) ? when.start : undefined;
    const end = typeof when?.end === 'number' && Number.isFinite(when.end) ? when.end : undefined;
    const speed = clampSpeed(s?.speed);
    if (start === undefined || end === undefined || speed === undefined) continue;
    if (end <= start) continue;
    const a = Math.max(0, start);
    const b = Math.min(clipDuration, end);
    if (b <= a) continue;
    segs.push({ start: a, end: b, speed, easing: normalizeEasing(s?.easing) });
  }
  segs.sort((a, b) => (a.start - b.start) || (a.end - b.end));
  if (segs.length === 0) return null;

  // 构造覆盖全片段的“段列表”，空洞默认 speed=1（linear）
  const prepared: PreparedSegment[] = [];
  let cursor = 0;
  let prevSpeed = 1;
  let prefix = 0;

  const pushSeg = (start: number, end: number, speed0: number, speed1: number, easingName: EasingName) => {
    const seg: PreparedSegment = { start, end, speed0, speed1, easing: easingName, prefixSourceAtStart: prefix };
    // 预计算该段完整积分，更新 prefix
    prefix += integrateSpeedSegment(seg, end);
    prepared.push(seg);
  };

  for (const s of segs) {
    if (s.start > cursor) {
      pushSeg(cursor, s.start, 1, 1, 'linear');
      cursor = s.start;
      prevSpeed = 1;
    }
    // 连续曲线：从 prevSpeed 过渡到当前段 speed
    pushSeg(s.start, s.end, prevSpeed, s.speed, s.easing);
    cursor = s.end;
    prevSpeed = s.speed;
  }
  if (cursor < clipDuration) {
    pushSeg(cursor, clipDuration, 1, 1, 'linear');
  }

  return { clipDuration, segments: prepared };
}

function evaluatePreparedTimeWarp(prepared: PreparedTimeWarp, localTime: number): number {
  const t = clampTime(localTime, prepared.clipDuration);
  const segs = prepared.segments;
  // 二分查找所在段
  let lo = 0;
  let hi = segs.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = segs[mid];
    if (t < s.start) hi = mid - 1;
    else if (t >= s.end) lo = mid + 1;
    else {
      return s.prefixSourceAtStart + integrateSpeedSegment(s, t);
    }
  }
  // fallback：最后一段结束
  const last = segs[segs.length - 1];
  return last.prefixSourceAtStart + integrateSpeedSegment(last, last.end);
}




