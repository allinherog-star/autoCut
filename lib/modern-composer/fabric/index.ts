/**
 * Fabric.js 画布引擎
 * 基于 Fabric.js v7 的现代化 Canvas 渲染引擎
 * 提供对象模型、自动变换、SVG 支持等高级功能
 */

import * as fabric from 'fabric';

// ============================================
// 类型定义
// ============================================

export interface FabricEngineConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  preserveObjectStacking?: boolean;
  /** 可选：使用已有的 Canvas 元素，而不是创建新的 */
  canvas?: HTMLCanvasElement;
}

export interface ElementConfig {
  id: string;
  type: 'image' | 'video' | 'text' | 'svg' | 'rect' | 'group';
  src?: string;
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'center' | 'bottom';
  // 文本特有属性
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  /** 文本行高倍数（仅对 Textbox 生效） */
  lineHeight?: number;
  shadow?: fabric.Shadow | string;
  // 视频特有属性
  videoTime?: number;
}

export interface RenderState {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  blur?: number;
}

// ============================================
// Fabric 画布引擎
// ============================================

export class FabricEngine {
  private canvas: fabric.StaticCanvas;
  private elements: Map<string, fabric.FabricObject> = new Map();
  private videoElements: Map<string, HTMLVideoElement> = new Map();
  private canvasElement: HTMLCanvasElement;
  // 隐藏挂载容器：Fabric.js 渲染视频在部分浏览器需要 canvas/video 在 DOM 中
  private mountContainer: HTMLDivElement | null = null;
  // 存储 Blob URL 以便销毁时释放
  private blobUrls: string[] = [];

  constructor(config: FabricEngineConfig) {
    // 使用传入的 canvas 或创建新的
    const canvasEl = config.canvas ?? document.createElement('canvas');
    canvasEl.width = config.width;
    canvasEl.height = config.height;
    this.canvasElement = canvasEl;

    // Fabric.js v7：某些场景（尤其是 video 元素作为源）需要 canvas 在 DOM 中才能稳定渲染
    // 导出/合成属于“离屏渲染”，这里自动创建一个隐藏容器挂载，避免导出视频无画面
    if (typeof document !== 'undefined' && !canvasEl.isConnected) {
      const container = document.createElement('div');
      container.setAttribute('data-fabric-engine-mount', 'true');
      container.style.position = 'fixed';
      container.style.left = '-100000px';
      container.style.top = '0';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-1';
      container.appendChild(canvasEl);
      document.body.appendChild(container);
      this.mountContainer = container;
    }

    // Fabric.js v7: 始终传入 canvas 元素
    // 注意：canvas 必须已添加到 DOM 中才能正常工作
    this.canvas = new fabric.StaticCanvas(canvasEl, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor || '#000000',
      preserveObjectStacking: config.preserveObjectStacking ?? true,
      renderOnAddRemove: false,
    });
  }

  /**
   * 获取 Canvas 尺寸
   */
  get width(): number {
    return this.canvas.width || 0;
  }

  get height(): number {
    return this.canvas.height || 0;
  }

  /**
   * 获取原生 Canvas 元素
   */
  getCanvasElement(): HTMLCanvasElement {
    // 直接返回保存的 canvas 元素引用，避免 Fabric.js 内部状态问题
    return this.canvasElement;
  }

  /**
   * 获取 2D Context
   */
  getContext(): CanvasRenderingContext2D {
    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    return ctx;
  }
  // ============================================
  // 元素管理
  // ============================================

  /**
   * 添加图片元素
   */
  async addImage(config: ElementConfig): Promise<fabric.FabricImage> {
    if (!config.src) throw new Error('Image source is required');

    const img = await fabric.FabricImage.fromURL(config.src, {
      crossOrigin: 'anonymous',
    });

    this.applyElementConfig(img, config);
    this.canvas.add(img);
    this.elements.set(config.id, img);

    return img;
  }

  /**
   * 添加视频元素
   */
  async addVideo(config: ElementConfig): Promise<fabric.FabricImage> {
    if (!config.src) throw new Error('Video source is required');

    const normalizedSrc = this.normalizeMediaSrc(config.src);
    if (this.isLikelyLocalFilesystemPath(normalizedSrc)) {
      throw new Error(
        `Invalid video src (looks like a local filesystem path, not a URL): ${config.src}. ` +
        `Please provide a URL (e.g. /uploads/xxx.mp4) or a blob: URL.`
      );
    }

    console.log('[FabricEngine] addVideo:', { id: config.id, src: config.src, normalizedSrc });

    const video = document.createElement('video');

    // 仅在跨域时才使用 Blob 方式加载，避免同源大文件被整段下载到内存中
    // （同源场景让 <video> 自己流式加载/Range 更稳、更省内存）
    let videoSrc = normalizedSrc;
    let fetchDebug:
      | {
        requestedUrl: string;
        finalUrl?: string;
        status?: number;
        statusText?: string;
        contentType?: string | null;
        blobType?: string;
        blobSize?: number;
      }
      | undefined;

    const shouldBlobFetch = this.shouldFetchVideoAsBlob(normalizedSrc);
    if (shouldBlobFetch) {
      try {
        const requestedUrl = this.toAbsoluteUrl(normalizedSrc);
        console.log('[FabricEngine] Fetching cross-origin video as blob:', { id: config.id, requestedUrl });
        const response = await fetch(requestedUrl);
        fetchDebug = {
          requestedUrl,
          finalUrl: response.url,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
        };
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        const blob = await response.blob();
        fetchDebug.blobType = blob.type;
        fetchDebug.blobSize = blob.size;
        const blobUrl = URL.createObjectURL(blob);
        this.blobUrls.push(blobUrl);
        videoSrc = blobUrl;
        console.log('[FabricEngine] Video blob created:', { id: config.id, blobUrl, blobType: blob.type, blobSize: blob.size });
      } catch (err) {
        console.warn('[FabricEngine] Failed to fetch cross-origin video as blob, falling back to direct URL:', {
          id: config.id,
          src: normalizedSrc,
          error: err,
          fetchDebug,
        });
        // Fallback：保持原样，可能会导致 Canvas tainted（但至少允许播放/预览）
      }
    }

    console.log('[FabricEngine] addVideo: about to set video.src:', { id: config.id, videoSrc, normalizedSrc, typeof: typeof videoSrc, isEmpty: videoSrc === '' });
    video.src = videoSrc;
    console.log('[FabricEngine] addVideo: after set video.src:', { id: config.id, videoSrcAttr: video.src, videoCurrentSrc: video.currentSrc });

    // Blob URL 是同源的，不需要 crossOrigin，但如果 fallback 到原始 URL 可能需要
    if (videoSrc === normalizedSrc && this.isCrossOrigin(normalizedSrc)) {
      video.crossOrigin = 'anonymous';
    }

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    // 挂载 video 到隐藏容器中，提升解码/seek 稳定性（尤其是 Safari/WebKit）
    if (this.mountContainer && !video.isConnected) {
      this.mountContainer.appendChild(video);
    }

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => {
        console.log('[FabricEngine] video onloadeddata:', { id: config.id, videoWidth: video.videoWidth, videoHeight: video.videoHeight });
        resolve();
      };
      video.onerror = (e) => {
        const errorInfo = this.getVideoErrorInfo(video);
        const errorDetails = {
          id: config.id,
          originalSrc: config.src,
          normalizedSrc,
          assignedSrc: video.src,
          currentSrc: video.currentSrc,
          networkState: video.networkState,
          readyState: video.readyState,
          error: errorInfo,
          fetchDebug,
          // 注意：video error event 在大多数浏览器里几乎没有可读字段（通常显示为 {}）
          eventType: (e as Event | undefined)?.type,
        };

        // Next.js dev overlay 会把 console.error 作为 “Console Error” 高亮显示。
        // 这里改为 warn，但仍提供可检索的详细信息。
        console.warn('[FabricEngine] video onerror:', errorDetails);
        console.warn('[FabricEngine] video onerror details (stringified):', safeJsonStringify(errorDetails));

        reject(
          new Error(
            `Failed to load video: ${config.src} ` +
            `(code=${errorInfo.code ?? 'unknown'}${errorInfo.codeName ? `/${errorInfo.codeName}` : ''}, ` +
            `networkState=${video.networkState}, readyState=${video.readyState})`
          )
        );
      };

      // Explicitly load the video to trigger loading/buffering
      video.load();
    });

    // 创建 Fabric Image 从视频元素
    const fabricImage = new fabric.FabricImage(video, {
      objectCaching: false, // 视频需要禁用缓存以更新帧
    });

    // 关键修复：Fabric 对 HTMLVideoElement 的初始宽高可能为 0，导致“什么都不画”（导出黑屏但叠加层正常）
    // 用 video.videoWidth/video.videoHeight 强制初始化对象尺寸，确保后续 scale/transform 正常。
    const vw = video.videoWidth || 0;
    const vh = video.videoHeight || 0;
    if (vw > 0 && vh > 0) {
      // 同时给 video 元素赋值，避免部分浏览器/渲染路径读到 0
      video.width = vw;
      video.height = vh;
      fabricImage.set({ width: vw, height: vh });
    } else if (typeof config.width === 'number' && typeof config.height === 'number') {
      // 最后兜底：至少保证 Fabric 对象有非 0 尺寸
      fabricImage.set({ width: Math.max(1, config.width), height: Math.max(1, config.height) });
    }

    console.log('[FabricEngine] fabricImage created:', {
      id: config.id,
      width: fabricImage.width,
      height: fabricImage.height,
      videoWidth: vw,
      videoHeight: vh,
    });

    this.applyElementConfig(fabricImage, config);
    this.canvas.add(fabricImage);
    this.elements.set(config.id, fabricImage);
    this.videoElements.set(config.id, video);

    return fabricImage;
  }

  /**
   * 更新视频时间
   */
  async seekVideo(id: string, time: number): Promise<void> {
    const video = this.videoElements.get(id);
    if (!video) return;

    // 帧级导出时每帧时间步进很小（如 30fps: 0.033s / 60fps: 0.016s），0.05 的阈值会导致大量帧不更新
    // 这里用更小的阈值保证画面连续，尤其是在 clip.sourceRange.start（微调/裁剪）不为 0 时。
    const threshold = 0.001;

    // 若可获取 duration，先做 clamp，避免 seek 到超出范围导致解码异常
    const duration = Number.isFinite(video.duration) ? video.duration : undefined;
    const targetTime = duration && duration > 0 ? Math.min(Math.max(0, time), Math.max(0, duration - 1e-4)) : Math.max(0, time);

    // 确保已加载到可 seek 的状态（至少要有 metadata/data）
    if (video.readyState < 1) {
      await new Promise<void>((resolve) => {
        const done = () => {
          video.removeEventListener('loadedmetadata', done);
          video.removeEventListener('loadeddata', done);
          video.removeEventListener('error', done);
          resolve();
        };
        video.addEventListener('loadedmetadata', done);
        video.addEventListener('loadeddata', done);
        video.addEventListener('error', done);
      });
    }

    // 某些浏览器在“从未播放过”的 video 上频繁 seek 时更容易拿不到帧，这里用一次 play/pause 进行解码预热（muted 允许自动播放）
    // 注意：失败也不应阻断导出，catch 忽略。
    const vAny = video as unknown as { __fabricPrimed?: boolean };
    if (!vAny.__fabricPrimed) {
      vAny.__fabricPrimed = true;
      try {
        const p = video.play();
        if (p && typeof (p as Promise<void>).then === 'function') await p;
        video.pause();
      } catch {
        // ignore
      }
    }

    if (Math.abs(video.currentTime - targetTime) > threshold) {
      await new Promise<void>((resolve) => {
        let settled = false;
        const cleanup = () => {
          video.removeEventListener('seeked', onSeeked);
          video.removeEventListener('error', onError);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('canplay', onCanPlay);
          if (timeoutId) window.clearTimeout(timeoutId);
        };
        const finish = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve();
        };
        const onError = () => finish();
        const onLoadedData = () => finish();
        const onCanPlay = () => finish();

        const waitForFrame = () => {
          // 尽量确保“新帧已可用”再返回，避免 Fabric drawImage 读到黑帧
          const rvfc = (video as any).requestVideoFrameCallback as undefined | ((cb: () => void) => void);
          if (typeof rvfc === 'function') {
            try {
              rvfc(() => finish());
              return;
            } catch {
              // fallback
            }
          }
          if (video.readyState >= 2) {
            finish();
            return;
          }
          video.addEventListener('loadeddata', onLoadedData, { once: true });
          video.addEventListener('canplay', onCanPlay, { once: true });
        };

        const onSeeked = () => waitForFrame();

        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError, { once: true });

        // 防止极端情况下卡死（网络/解码问题）
        const timeoutId = typeof window !== 'undefined' ? window.setTimeout(() => finish(), 1500) : undefined;

        // 触发 seek
        video.currentTime = targetTime;
      });
    }

    // 标记需要重新渲染
    const element = this.elements.get(id);
    if (element) {
      element.setCoords();
    }
  }

  /**
   * 添加文本元素
   */
  addText(config: ElementConfig): fabric.FabricObject {
    const content = config.content || '';
    const useTextbox = typeof config.width === 'number' && Number.isFinite(config.width) && config.width > 0;

    const baseOptions = {
      left: config.x,
      top: config.y,
      fontSize: config.fontSize || 40,
      fontFamily: config.fontFamily || 'sans-serif',
      fontWeight: config.fontWeight || 'normal',
      fill: config.fill || '#FFFFFF',
      stroke: config.stroke,
      strokeWidth: config.strokeWidth || 0,
      textAlign: config.textAlign || 'center',
      originX: config.originX || 'center',
      originY: config.originY || 'center',
      opacity: config.opacity ?? 1,
      angle: config.angle || 0,
    };

    const text: fabric.FabricObject = useTextbox
      ? new (fabric as unknown as { Textbox: new (t: string, o: Record<string, unknown>) => fabric.FabricObject }).Textbox(
        content,
        {
          ...baseOptions,
          width: config.width,
          lineHeight: config.lineHeight ?? 1.2,
        }
      )
      : new fabric.FabricText(content, baseOptions);

    if (config.shadow) {
      (text as unknown as { shadow?: unknown }).shadow = new fabric.Shadow(
        typeof config.shadow === 'string'
          ? { color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 0, offsetY: 0 }
          : config.shadow
      );
    }

    this.canvas.add(text);
    this.elements.set(config.id, text);

    return text;
  }

  /**
   * 添加 SVG 元素
   */
  async addSVG(config: ElementConfig): Promise<fabric.FabricObject> {
    if (!config.src) throw new Error('SVG source is required');

    const { objects, options } = await fabric.loadSVGFromURL(config.src);
    const validObjects = objects.filter((o): o is fabric.FabricObject => !!o);
    const svgGroup = fabric.util.groupSVGElements(validObjects, options);

    this.applyElementConfig(svgGroup, config);
    this.canvas.add(svgGroup);
    this.elements.set(config.id, svgGroup);

    return svgGroup;
  }

  /**
   * 添加矩形元素
   */
  addRect(config: ElementConfig & { rx?: number; ry?: number }): fabric.Rect {
    const rect = new fabric.Rect({
      left: config.x,
      top: config.y,
      width: config.width || 100,
      height: config.height || 100,
      fill: config.fill || '#FFFFFF',
      stroke: config.stroke,
      strokeWidth: config.strokeWidth || 0,
      rx: config.rx || 0,
      ry: config.ry || 0,
      originX: config.originX || 'center',
      originY: config.originY || 'center',
      opacity: config.opacity ?? 1,
      angle: config.angle || 0,
    });

    this.canvas.add(rect);
    this.elements.set(config.id, rect);

    return rect;
  }

  /**
   * 移除元素
   */
  removeElement(id: string): void {
    const element = this.elements.get(id);
    if (element) {
      this.canvas.remove(element);
      this.elements.delete(id);
    }

    // 清理视频元素
    const video = this.videoElements.get(id);
    if (video) {
      video.pause();
      // 先清除所有事件处理器，避免触发虚假的 onerror（src='' 会导致 "Empty src attribute" 错误）
      video.onerror = null;
      video.onloadeddata = null;
      video.onloadedmetadata = null;
      video.oncanplay = null;
      video.onseeked = null;
      video.removeAttribute('src');
      // 触发资源释放
      video.load();
      try {
        video.remove();
      } catch {
        // ignore
      }
      this.videoElements.delete(id);
    }
  }

  /**
   * 获取元素
   */
  getElement(id: string): fabric.FabricObject | undefined {
    return this.elements.get(id);
  }

  /**
   * 设置 clipPath（用于 wipe/mask 转场）
   * - 传入 null 将清除 clipPath
   */
  setClipPath(id: string, clipPath: fabric.FabricObject | null): void {
    const element = this.elements.get(id);
    if (!element) return;
    (element as unknown as { clipPath?: fabric.FabricObject | null }).clipPath = clipPath;
    element.setCoords();
  }

  /**
   * 清空所有元素
   */
  clear(): void {
    this.canvas.clear();
    this.elements.clear();

    // 清理所有视频
    this.videoElements.forEach((video) => {
      try {
        video.pause();
        // 避免触发 onerror 噪音（src='' 常见会导致 "Empty src attribute"）
        video.onerror = null;
        video.onloadeddata = null;
        video.onloadedmetadata = null;
        video.oncanplay = null;
        video.onseeked = null;
        video.removeAttribute('src');
        // 触发资源释放
        video.load();
      } catch {
        // ignore
      }
    });
    this.videoElements.clear();
  }

  // ============================================
  // 渲染状态应用
  // ============================================

  /**
   * 应用渲染状态到元素
   */
  applyRenderState(id: string, state: RenderState): void {
    const element = this.elements.get(id);
    if (!element) return;

    if (state.x !== undefined) element.set('left', state.x);
    if (state.y !== undefined) element.set('top', state.y);
    // 关键：renderState.scaleX/scaleY 是“动画倍率”，不应覆盖元素在创建时根据 width/height 计算出来的基础缩放。
    // 否则会出现：导出时视频被缩回原始分辨率（看起来像“没画面”，实际是画面变成一个很小的点）。
    const data = (element as any).data || {};
    const baseScaleX = typeof data.__baseScaleX === 'number' ? data.__baseScaleX : (element.scaleX ?? 1);
    const baseScaleY = typeof data.__baseScaleY === 'number' ? data.__baseScaleY : (element.scaleY ?? 1);
    if (state.scaleX !== undefined) element.set('scaleX', baseScaleX * state.scaleX);
    if (state.scaleY !== undefined) element.set('scaleY', baseScaleY * state.scaleY);
    if (state.angle !== undefined) element.set('angle', state.angle);
    if (state.opacity !== undefined) element.set('opacity', state.opacity);

    // 模糊效果需要通过滤镜实现
    if (state.blur !== undefined && state.blur > 0) {
      if ('filters' in element) {
        (element as any).filters = [new fabric.filters.Blur({ blur: state.blur / 100 })];
        if ('applyFilters' in element) {
          (element as fabric.FabricImage).applyFilters();
        }
      }
    }

    element.setCoords();
  }

  /**
   * 设置元素层级
   */
  setElementOrder(id: string, order: number): void {
    const element = this.elements.get(id);
    if (!element) return;

    // Fabric v6+ uses moveObjectTo, or we cast if method name changed
    if ('moveObjectTo' in this.canvas) {
      (this.canvas as any).moveObjectTo(element, order);
    } else if ('moveTo' in this.canvas) {
      (this.canvas as any).moveTo(element, order);
    }
  }

  // ============================================
  // 渲染
  // ============================================

  /**
   * 渲染当前帧
   */
  render(): void {
    this.canvas.renderAll();
  }

  /**
   * 获取当前帧的 ImageData
   */
  getImageData(): ImageData {
    const ctx = this.canvas.getContext();
    return ctx.getImageData(0, 0, this.width, this.height);
  }

  /**
   * 获取当前帧为 Blob
   */
  async toBlob(type: string = 'image/png', quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvasEl = this.canvas.getElement();
      canvasEl.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        type,
        quality
      );
    });
  }

  /**
   * 导出为 Data URL
   */
  toDataURL(options?: fabric.TDataUrlOptions): string {
    return this.canvas.toDataURL(options);
  }

  // ============================================
  // 辅助方法
  // ============================================

  private isCrossOrigin(url: string): boolean {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return false;
    if (typeof window !== 'undefined') {
      const parser = document.createElement('a');
      parser.href = url;
      return parser.origin !== window.location.origin;
    }
    return false;
  }

  private shouldFetchVideoAsBlob(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('blob:') || url.startsWith('data:')) return false;
    return this.isCrossOrigin(url);
  }

  private normalizeMediaSrc(src: string): string {
    const s = src.trim();
    if (!s) return s;
    // Windows path like "C:\foo\bar.mp4" or UNC path "\\server\share\file"
    if (/^[a-zA-Z]:\\/.test(s) || s.startsWith('\\\\')) return s;
    // Already absolute path or URL-like schemes (http, https, blob, data, file, etc.)
    if (s.startsWith('/') || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(s)) return s;
    // Common case: saved as "uploads/xxx.mp4" (missing leading slash) -> make it root-relative.
    return `/${s}`;
  }

  private isLikelyLocalFilesystemPath(src: string): boolean {
    if (!src) return false;
    if (src.startsWith('file:')) return true;
    if (/^[a-zA-Z]:\\/.test(src) || src.startsWith('\\\\')) return true; // Windows / UNC
    // macOS/Linux absolute paths that are not meant to be served as web paths
    if (src.startsWith('/Users/') || src.startsWith('/home/') || src.startsWith('/var/') || src.startsWith('/Volumes/')) return true;
    return false;
  }

  private toAbsoluteUrl(url: string): string {
    if (typeof window === 'undefined') return url;
    try {
      return new URL(url, window.location.href).toString();
    } catch {
      return url;
    }
  }

  private getVideoErrorInfo(video: HTMLVideoElement): { code?: number; codeName?: string; message?: string } {
    const code = video.error?.code;
    let codeName: string | undefined;
    // https://html.spec.whatwg.org/multipage/media.html#mediaerror
    if (code === 1) codeName = 'MEDIA_ERR_ABORTED';
    else if (code === 2) codeName = 'MEDIA_ERR_NETWORK';
    else if (code === 3) codeName = 'MEDIA_ERR_DECODE';
    else if (code === 4) codeName = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
    return { code, codeName, message: video.error?.message || undefined };
  }

  private applyElementConfig(element: fabric.FabricObject, config: ElementConfig): void {
    element.set({
      left: config.x,
      top: config.y,
      originX: config.originX || 'center',
      originY: config.originY || 'center',
      opacity: config.opacity ?? 1,
      angle: config.angle || 0,
    });

    const elementType = (element as unknown as { type?: string }).type;
    const isTextbox = elementType === 'textbox';

    // Textbox 的 width 是“排版宽度”（用于自动换行），不应走 scaleX 缩放
    if (typeof config.width === 'number' && Number.isFinite(config.width) && config.width > 0 && isTextbox) {
      element.set('width', config.width);
    } else if (config.width) {
      const currentWidth = element.width || 1;
      element.set('scaleX', (config.scaleX || 1) * (config.width / currentWidth));
    }
    if (config.height) {
      const currentHeight = element.height || 1;
      element.set('scaleY', (config.scaleY || 1) * (config.height / currentHeight));
    }

    // 保存"基础缩放"，后续 applyRenderState 会把动画倍率乘在这个基础上
    // 注意：data 可能被业务侧使用，因此只追加私有字段
    const existingData = (element as any).data && typeof (element as any).data === 'object' ? (element as any).data : {};
    (element as any).data = {
      ...existingData,
      __baseScaleX: element.scaleX ?? 1,
      __baseScaleY: element.scaleY ?? 1,
    };

    element.setCoords();
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.clear();
    this.canvas.dispose();
    if (this.mountContainer) {
      try {
        this.mountContainer.remove();
      } catch {
        // ignore
      }
      this.mountContainer = null;
    }

    // 清理 Blob URLs
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
  }
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}

// ============================================
// 导出
// ============================================

export { fabric };
