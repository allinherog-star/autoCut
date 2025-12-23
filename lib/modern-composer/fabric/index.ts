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

  constructor(config: FabricEngineConfig) {
    // 创建 StaticCanvas（用于渲染/导出，不需要交互）
    const canvasEl = document.createElement('canvas');
    canvasEl.width = config.width;
    canvasEl.height = config.height;

    this.canvas = new fabric.StaticCanvas(canvasEl, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor || '#000000',
      preserveObjectStacking: config.preserveObjectStacking ?? true,
      renderOnAddRemove: false, // 手动控制渲染
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
    return this.canvas.getElement();
  }

  /**
   * 获取 2D Context
   */
  getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext();
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

    const video = document.createElement('video');
    video.src = config.src;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error(`Failed to load video: ${config.src}`));
    });

    // 创建 Fabric Image 从视频元素
    const fabricImage = new fabric.FabricImage(video, {
      objectCaching: false, // 视频需要禁用缓存以更新帧
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

    if (Math.abs(video.currentTime - time) > 0.05) {
      video.currentTime = time;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
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
  addText(config: ElementConfig): fabric.FabricText {
    const text = new fabric.FabricText(config.content || '', {
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
    });

    if (config.shadow) {
      text.shadow = new fabric.Shadow(
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
    const svgGroup = fabric.util.groupSVGElements(objects, options);

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
      video.src = '';
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
   * 清空所有元素
   */
  clear(): void {
    this.canvas.clear();
    this.elements.clear();

    // 清理所有视频
    this.videoElements.forEach((video) => {
      video.pause();
      video.src = '';
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
    if (state.scaleX !== undefined) element.set('scaleX', state.scaleX);
    if (state.scaleY !== undefined) element.set('scaleY', state.scaleY);
    if (state.angle !== undefined) element.set('angle', state.angle);
    if (state.opacity !== undefined) element.set('opacity', state.opacity);

    // 模糊效果需要通过滤镜实现
    if (state.blur !== undefined && state.blur > 0) {
      element.filters = [new fabric.filters.Blur({ blur: state.blur / 100 })];
      if ('applyFilters' in element) {
        (element as fabric.FabricImage).applyFilters();
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

    this.canvas.moveTo(element, order);
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

  private applyElementConfig(element: fabric.FabricObject, config: ElementConfig): void {
    element.set({
      left: config.x,
      top: config.y,
      originX: config.originX || 'center',
      originY: config.originY || 'center',
      opacity: config.opacity ?? 1,
      angle: config.angle || 0,
    });

    if (config.width) {
      const currentWidth = element.width || 1;
      element.set('scaleX', (config.scaleX || 1) * (config.width / currentWidth));
    }
    if (config.height) {
      const currentHeight = element.height || 1;
      element.set('scaleY', (config.scaleY || 1) * (config.height / currentHeight));
    }

    element.setCoords();
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.clear();
    this.canvas.dispose();
  }
}

// ============================================
// 导出
// ============================================

export { fabric };

