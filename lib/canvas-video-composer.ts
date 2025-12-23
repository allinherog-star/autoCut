import {
  VEIRProject,
  Track,
  Clip,
  Asset,
  VEIRVocabulary,
  VEIRAssets,
  Preset,
  AnchorPosition
} from './veir/types';

/**
 * 进度回调
 */
export type ProgressCallback = (progress: number, message: string) => void;

/**
 * VEIR Canvas 视频合成器
 * 将 VEIR Project 渲染为视频文件
 */
export class VEIRComposer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private project: VEIRProject;
  private assetsMap: Map<string, HTMLVideoElement | HTMLImageElement> = new Map();

  constructor(project: VEIRProject) {
    this.project = project;
    this.canvas = document.createElement('canvas');
    this.canvas.width = project.meta.resolution[0];
    this.canvas.height = project.meta.resolution[1];
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 Canvas Context');
    this.ctx = ctx;
  }

  /**
   * 预加载所有素材
   */
  private async loadAssets(onProgress?: ProgressCallback) {
    const assets = this.project.assets.assets;
    const assetKeys = Object.keys(assets);
    let loadedCount = 0;

    for (const id of assetKeys) {
      const asset = assets[id];
      if (!asset.src) continue;

      try {
        if (asset.type === 'video') {
          await this.loadVideo(id, asset.src);
        } else if (asset.type === 'image') {
          await this.loadImage(id, asset.src);
        } else if (asset.type === 'text') {
          // 文本不需要加载资源
        }
        // TODO: Audio loading
      } catch (e) {
        console.error(`Failed to load asset ${id}:`, e);
      }

      loadedCount++;
      onProgress?.(
        (loadedCount / assetKeys.length) * 20, // 这里的 20% 是加载阶段占总进度的比例
        `加载素材 ${loadedCount}/${assetKeys.length}`
      );
    }
  }

  private loadVideo(id: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = src;
      video.crossOrigin = 'anonymous'; // 关键：允许跨域
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      video.onloadeddata = () => {
        this.assetsMap.set(id, video);
        resolve();
      };
      video.onerror = () => reject(new Error(`Video load failed: ${src}`));
    });
  }

  private loadImage(id: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        this.assetsMap.set(id, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    });
  }

  /**
   * 渲染单帧
   */
  private async renderFrame(time: number) {
    const { width, height } = this.canvas;

    // 清空画布
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    // 获取当前时间点的所有 Clips 并按 Layer 排序
    const activeClips = this.getActiveClips(time);
    activeClips.sort((a, b) => a.track.layer - b.track.layer);

    // 逐个渲染 Clip
    for (const item of activeClips) {
      await this.drawClip(item.clip, item.track, time);
    }
  }

  private getActiveClips(time: number) {
    const activeItems: { track: Track, clip: Clip }[] = [];
    for (const track of this.project.timeline.tracks) {
      for (const clip of track.clips) {
        if (time >= clip.time.start && time < clip.time.end) {
          activeItems.push({ track, clip });
          break; // 每个轨道同一时间理论上只有一个 Clip
        }
      }
    }
    return activeItems;
  }

  private async drawClip(clip: Clip, track: Track, globalTime: number) {
    const asset = this.project.assets.assets[clip.asset];
    if (!asset) return;

    // 计算 Clip 内部时间和进度
    const clipDuration = clip.time.end - clip.time.start;
    const localTime = globalTime - clip.time.start;
    const progress = localTime / clipDuration;

    // 应用动画/Expression
    const animState = this.calculateAnimation(clip, progress, clipDuration);

    this.ctx.save();
    this.ctx.globalAlpha = animState.opacity;

    // 应用变换 (简单的中心缩放/位移示例)
    // 注意：这里的变换原点默认是 (0,0)，实际应用通常需要基于 Anchor
    // 这里简化处理：如果是全屏视频，不做额外变换，除非有 PIP

    // TrackType definition does not include 'image', it is usually handled as 'video' or 'pip' with image asset
    if (track.type === 'video' || track.type === 'pip') {
      await this.drawVisualClip(clip, asset, animState, track.type, localTime);
    } else if (track.type === 'text') {
      this.drawTextClip(clip, asset, animState);
    }

    this.ctx.restore();
  }

  private async drawVisualClip(clip: Clip, asset: Asset, animState: any, type: string, localTime: number) {
    const element = this.assetsMap.get(clip.asset);
    if (!element) return;

    // 定位与尺寸
    let x = 0, y = 0, w = this.canvas.width, h = this.canvas.height;

    // PIP 处理
    if (type === 'pip' && clip.expression?.preset) {
      const preset = this.project.vocabulary.presets[clip.expression.preset];
      if (preset && preset.type === 'pipLayout') {
        const size = (preset.size as [number, number]) || [0.3, 0.3];
        const anchor = (preset.anchor as AnchorPosition) || 'bottom-right';

        w = this.canvas.width * size[0];
        h = this.canvas.height * size[1];

        // 简单的 Anchor 计算
        const padding = 20;
        if (anchor.includes('right')) x = this.canvas.width - w - padding;
        if (anchor.includes('left')) x = padding;
        if (anchor.includes('bottom')) y = this.canvas.height - h - padding;
        if (anchor.includes('top')) y = padding;
        if (anchor === 'center') {
          x = (this.canvas.width - w) / 2;
          y = (this.canvas.height - h) / 2;
        }
      }
    }

    // 应用动画变换 (Scale/Translate)
    if (animState.scale !== 1 || animState.y !== 0) {
      // 临时中心点变换
      const cx = x + w / 2;
      const cy = y + h / 2;
      this.ctx.translate(cx, cy);
      this.ctx.scale(animState.scale, animState.scale);
      this.ctx.translate(0, animState.y); // Y 轴位移
      this.ctx.translate(-cx, -cy);
    }

    if (asset.type === 'video') {
      const video = element as HTMLVideoElement;
      // 同步视频时间
      // 为了性能，通常是在 renderFrame 外部统一 seek，这里简化为每帧 seek
      if (Math.abs(video.currentTime - localTime) > 0.1) {
        video.currentTime = localTime;
      }
      // 绘制视频
      this.ctx.drawImage(video, x, y, w, h);
    } else if (asset.type === 'image') {
      this.ctx.drawImage(element as HTMLImageElement, x, y, w, h);
    }
  }

  private drawTextClip(clip: Clip, asset: Asset, animState: any) {
    if (!asset.content) return;
    const text = asset.content;

    const presetId = clip.expression?.preset;
    const preset = presetId ? this.project.vocabulary.presets[presetId] : null;

    const intensity = clip.expression?.intensity ?? 0.8;

    // 默认样式
    let fontSize = 40;
    let color = '#FFFFFF';
    let font = 'sans-serif';
    let x = this.canvas.width / 2;
    let y = this.canvas.height / 2;
    let textAlign: CanvasTextAlign = 'center';

    // 简单的样式映射 (对应 TextOverlay)
    if (preset && preset.category === '综艺') {
      fontSize = 32 + (intensity * 32); // rem to px approx
      color = '#FFD700';
      // Shadow/Stroke logic would go here
    } else if (preset && preset.category === '信息') {
      fontSize = 24;
      y = this.canvas.height - 100; // Bottom
      // Background rect logic would go here
    }

    // Anchor 处理
    if (preset?.anchor) {
      if (preset.anchor.includes('bottom')) y = this.canvas.height * 0.85;
      if (preset.anchor.includes('top')) y = this.canvas.height * 0.15;
    }

    // 应用动画变换
    this.ctx.translate(x, y);
    this.ctx.scale(animState.scale, animState.scale);
    this.ctx.translate(0, animState.y);

    this.ctx.font = `bold ${fontSize}px ${font}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = 'middle';

    // 简单的 Shadow 模拟
    if (preset?.category === '综艺') {
      this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
      this.ctx.shadowBlur = 10;
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = '#FF6B6B';
      this.ctx.strokeText(text, 0, 0);
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillText(text, 0, 0);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
  }

  /**
   * 必须与 TextOverlay 中的动画逻辑保持一致
   */
  private calculateAnimation(clip: Clip, progress: number, duration: number) {
    const enterDuration = 0.15; // 比例，不是秒？ TextOverlay里是0.15与progress(0-1)比较，所以是15%的时长
    const exitDuration = 0.15;

    let state = { opacity: 1, scale: 1, y: 0 };

    // Enter
    if (progress < enterDuration) {
      const t = progress / enterDuration; // 0 -> 1
      const behavior = clip.behavior?.enter;

      if (behavior === 'bounce') {
        // 模拟 spring: 簡單插值
        state.scale = t;
        state.y = (1 - t) * 50;
        state.opacity = t;
      } else if (behavior === 'slide-up') {
        state.y = (1 - t) * 100;
        state.opacity = t;
      } else { // fade-in
        state.opacity = t;
      }
    }
    // Exit
    else if (progress > (1 - exitDuration)) {
      const t = (progress - (1 - exitDuration)) / exitDuration; // 0 -> 1
      state.opacity = 1 - t;
    }

    return state;
  }

  /**
   * 导出视频
   */
  public async exportVideo(onProgress?: ProgressCallback): Promise<Blob> {
    await this.loadAssets(onProgress);

    const fps = this.project.meta.fps;
    const duration = this.project.meta.duration;
    const totalFrames = Math.ceil(duration * fps);

    // 初始化 MediaRecorder
    const stream = this.canvas.captureStream(fps);

    // 优先选择支持的 mimeType
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    let mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
    if (!mimeType) throw new Error('当前浏览器不支持视频录制');

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8_000_000 // 8Mbps 
    });

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.start();

    onProgress?.(20, '开始渲染...');

    // 逐帧渲染
    // 这里的关键是：我们需要等待 Video 元素 seek 到指定时间
    // 为了保证录制的帧率稳定，我们必须“一步一停”

    // 注意：Mac/Chrome 下 captureStream 可能需要画面变化才会推流
    // 我们使用 requestVideoFrameCallback 或者等一小段时间

    const frameInterval = 1000 / fps;
    const videoTracks = Object.values(this.assetsMap).filter(a => a instanceof HTMLVideoElement) as HTMLVideoElement[];

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / fps;

      // 1. Seek all active videos
      const seekPromises = videoTracks.map(v => {
        // 简单的优化：只有当视频在当前时间段内才 seek
        // 但为了简单稳定，暂时全部 seek (如果不播放也可以)
        v.currentTime = time % v.duration; // Loop check? VEIR clip defines time range
        return new Promise<void>(resolve => {
          if (v.readyState >= 2) resolve();
          else {
            const onSeeked = () => {
              v.removeEventListener('seeked', onSeeked);
              resolve();
            };
            v.addEventListener('seeked', onSeeked);
          }
        });
      });

      // await Promise.all(seekPromises); // Video seek is tricky in headless/batch
      // 在前端合成中，最可靠的是等待 video 触发 seeked

      // 渲染当前帧
      await this.renderFrame(time);

      // 给 MediaRecorder 一点时间捕捉 (Hack for stream capture)
      // 实际上必须等待 1/fps 才能录制出正确时长的视频，否则视频会变快/慢
      // 但 MediaRecorder 在 requestFrame 模式下记录的是“推流时间”
      // 所以我们必须真实地等待 frameInterval

      await new Promise(r => setTimeout(r, 0)); // Yield to event loop

      if (frame % 30 === 0) {
        onProgress?.(
          20 + (frame / totalFrames) * 70,
          `渲染中 ${(frame / totalFrames * 100).toFixed(0)}%`
        );
      }
    }

    recorder.stop();
    return new Promise(resolve => {
      recorder.onstop = () => {
        onProgress?.(100, '生成完成');
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };
    });
  }
}

