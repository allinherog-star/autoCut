/**
 * WebCodecs + MediaBunny 视频合成器
 * 基于 WebCodecs API 和 MediaBunny 的现代化视频编码系统
 * 支持 MP4/WebM 输出、硬件加速、帧级精确控制
 */

import {
  Output,
  Mp4OutputFormat,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  AudioSampleSource,
  getFirstEncodableVideoCodec,
  QUALITY_HIGH,
  QUALITY_MEDIUM,
  QUALITY_LOW,
} from 'mediabunny';

// ============================================
// 类型定义
// ============================================

/**
 * 视频编码器配置
 */
export interface VideoEncoderConfig {
  width: number;
  height: number;
  frameRate: number;
  bitrate?: number;
  codec?: VideoCodecType;
  quality?: 'high' | 'medium' | 'low';
  hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
  keyFrameInterval?: number;
}

/**
 * 音频编码器配置
 */
export interface AudioEncoderConfig {
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
  codec?: AudioCodecType;
}

/**
 * 输出格式
 */
export type OutputFormat = 'mp4' | 'webm';

/**
 * 视频编解码器类型
 */
export type VideoCodecType = 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';

/**
 * 音频编解码器类型
 */
export type AudioCodecType = 'aac' | 'opus' | 'mp3';

/**
 * 合成进度回调
 */
export type ProgressCallback = (progress: number, stage: string, message: string) => void;

/**
 * 合成结果
 */
export interface CompositionResult {
  blob: Blob;
  duration: number;
  format: OutputFormat;
  size: number;
  downloadUrl: string;
}

// ============================================
// MediaBunny 视频合成器
// ============================================

export class MediaBunnyComposer {
  private output: Output | null = null;
  private videoSource: CanvasSource | null = null;
  private audioSource: AudioSampleSource | null = null;
  private config: VideoEncoderConfig;
  private audioConfig: AudioEncoderConfig;
  private format: OutputFormat;
  private isStarted: boolean = false;
  private frameCount: number = 0;

  constructor(
    videoConfig: VideoEncoderConfig,
    audioConfig?: AudioEncoderConfig,
    format: OutputFormat = 'mp4'
  ) {
    this.config = {
      ...videoConfig,
      bitrate: videoConfig.bitrate || this.getDefaultBitrate(videoConfig.quality),
      codec: videoConfig.codec || 'h264',
      keyFrameInterval: videoConfig.keyFrameInterval || 30,
    };

    this.audioConfig = {
      sampleRate: 48000,
      channels: 2,
      bitrate: 192000,
      codec: 'aac',
      ...audioConfig,
    };

    this.format = format;
  }

  /**
   * 初始化编码器
   */
  async initialize(): Promise<void> {
    // 创建输出格式
    const outputFormat =
      this.format === 'mp4'
        ? new Mp4OutputFormat({ fastStart: 'in-memory' })
        : new WebMOutputFormat();

    // 创建输出实例
    this.output = new Output({
      format: outputFormat,
      target: new BufferTarget(),
    });

    // 获取最佳可用编解码器
    const supportedCodecs = outputFormat.getSupportedVideoCodecs();
    const bestCodec = await getFirstEncodableVideoCodec(supportedCodecs);

    if (!bestCodec) {
      throw new Error('No supported video codec found');
    }

    console.log(`[MediaBunnyComposer] Using video codec: ${bestCodec}`);
  }

  /**
   * 开始合成
   */
  async start(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<void> {
    if (!this.output) {
      await this.initialize();
    }

    if (!this.output) {
      throw new Error('Composer not initialized');
    }

    // 创建 Canvas 视频源
    this.videoSource = new CanvasSource(canvas as HTMLCanvasElement, {
      codec: this.mapCodec(this.config.codec || 'h264'),
      bitrate: this.config.bitrate || QUALITY_HIGH,
      hardwareAcceleration: this.config.hardwareAcceleration || 'prefer-hardware',
      keyFrameInterval: this.config.keyFrameInterval,
    });

    // 添加视频轨道
    this.output.addVideoTrack(this.videoSource);

    // 启动输出
    await this.output.start();
    this.isStarted = true;
    this.frameCount = 0;
  }

  /**
   * 添加音频轨道
   */
  async addAudioTrack(): Promise<void> {
    if (!this.output) {
      throw new Error('Composer not initialized');
    }

    // 创建音频采样源 (MediaBunny AudioSampleSource 只需要 codec 和 bitrate)
    this.audioSource = new AudioSampleSource({
      codec: this.mapAudioCodec(this.audioConfig.codec || 'aac'),
      bitrate: this.audioConfig.bitrate || 192000,
    });

    this.output.addAudioTrack(this.audioSource);
  }

  /**
   * 编码一帧视频
   * @param timestamp - 帧的时间戳（秒）
   * @param duration - 帧的持续时间（秒），默认为 1/fps
   * @param options - 可选配置，如 keyFrame
   */
  async encodeFrame(timestamp: number, duration?: number, options?: { keyFrame?: boolean }): Promise<void> {
    if (!this.videoSource || !this.isStarted) {
      throw new Error('Composer not started');
    }

    const frameDuration = duration ?? (1 / this.config.frameRate);
    const isKeyFrame = options?.keyFrame ?? this.frameCount % (this.config.keyFrameInterval || 30) === 0;

    // MediaBunny CanvasSource 使用 add(timestamp, duration, options) 方法
    await this.videoSource.add(timestamp, frameDuration, { keyFrame: isKeyFrame });
    this.frameCount++;
  }

  /**
   * 编码音频采样 (接受 AudioSample 对象)
   */
  async encodeAudioSamples(audioSample: any): Promise<void> {
    if (!this.audioSource) {
      throw new Error('Audio track not added');
    }

    await this.audioSource.add(audioSample);
  }

  /**
   * 完成编码并获取结果
   */
  async finalize(): Promise<CompositionResult> {
    if (!this.output) {
      throw new Error('Composer not initialized');
    }

    // 完成编码
    await this.output.finalize();

    // 获取输出缓冲区
    const buffer = (this.output.target as BufferTarget).buffer;
    if (!buffer) {
      throw new Error('Output buffer is null');
    }
    const blob = new Blob([buffer], {
      type: this.format === 'mp4' ? 'video/mp4' : 'video/webm',
    });

    const duration = this.frameCount / this.config.frameRate;
    const downloadUrl = URL.createObjectURL(blob);

    return {
      blob,
      duration,
      format: this.format,
      size: blob.size,
      downloadUrl,
    };
  }

  /**
   * 销毁资源
   */
  destroy(): void {
    this.output = null;
    this.videoSource = null;
    this.audioSource = null;
    this.isStarted = false;
    this.frameCount = 0;
  }

  /**
   * 获取默认码率 (返回数字类型)
   */
  private getDefaultBitrate(quality?: 'high' | 'medium' | 'low'): number {
    switch (quality) {
      case 'high':
        return Number(QUALITY_HIGH);
      case 'medium':
        return Number(QUALITY_MEDIUM);
      case 'low':
        return Number(QUALITY_LOW);
      default:
        return Number(QUALITY_HIGH);
    }
  }

  /**
   * 映射视频编解码器
   */
  private mapCodec(codec: VideoCodecType): 'avc' | 'hevc' | 'vp8' | 'vp9' | 'av1' {
    switch (codec) {
      case 'h264':
        return 'avc';
      case 'h265':
        return 'hevc';
      case 'vp8':
        return 'vp8';
      case 'vp9':
        return 'vp9';
      case 'av1':
        return 'av1';
      default:
        return 'avc';
    }
  }

  /**
   * 映射音频编解码器
   */
  private mapAudioCodec(codec: AudioCodecType): 'aac' | 'opus' | 'mp3' {
    return codec;
  }
}

// ============================================
// 便捷合成函数
// ============================================

/**
 * 从 Canvas 渲染序列创建视频
 */
export async function composeFromCanvas(options: {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  duration: number;
  frameRate: number;
  width?: number;
  height?: number;
  renderFrame: (time: number, frameIndex: number) => Promise<void> | void;
  format?: OutputFormat;
  quality?: 'high' | 'medium' | 'low';
  onProgress?: ProgressCallback;
}): Promise<CompositionResult> {
  const {
    canvas,
    duration,
    frameRate,
    renderFrame,
    format = 'mp4',
    quality = 'high',
    onProgress,
  } = options;

  const width = options.width || (canvas as HTMLCanvasElement).width;
  const height = options.height || (canvas as HTMLCanvasElement).height;
  const totalFrames = Math.ceil(duration * frameRate);

  onProgress?.(0, 'initializing', '初始化编码器...');

  // 创建合成器
  const composer = new MediaBunnyComposer(
    {
      width,
      height,
      frameRate,
      quality,
    },
    undefined,
    format
  );

  await composer.start(canvas);

  onProgress?.(5, 'encoding', '开始编码...');

  // 逐帧渲染和编码
  const frameDuration = 1 / frameRate;
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / frameRate;

    // 渲染帧内容
    await renderFrame(time, frame);

    // 编码帧 (传入时间戳和持续时间)
    await composer.encodeFrame(time, frameDuration, {
      keyFrame: frame % 30 === 0,
    });

    // 更新进度
    const progress = 5 + (frame / totalFrames) * 90;
    if (frame % 10 === 0) {
      onProgress?.(progress, 'encoding', `编码中 ${Math.round((frame / totalFrames) * 100)}%`);
    }
  }

  onProgress?.(95, 'finalizing', '完成编码...');

  // 完成
  const result = await composer.finalize();
  composer.destroy();

  onProgress?.(100, 'complete', '完成');

  return result;
}

/**
 * 检查 WebCodecs 支持
 */
export function checkWebCodecsSupport(): {
  supported: boolean;
  videoEncoder: boolean;
  audioEncoder: boolean;
  videoDecoder: boolean;
  audioDecoder: boolean;
} {
  return {
    supported: typeof VideoEncoder !== 'undefined' && typeof AudioEncoder !== 'undefined',
    videoEncoder: typeof VideoEncoder !== 'undefined',
    audioEncoder: typeof AudioEncoder !== 'undefined',
    videoDecoder: typeof VideoDecoder !== 'undefined',
    audioDecoder: typeof AudioDecoder !== 'undefined',
  };
}

/**
 * 检查编解码器支持
 */
export async function checkCodecSupport(codec: VideoCodecType): Promise<boolean> {
  try {
    const codecString = getCodecString(codec);
    const result = await VideoEncoder.isConfigSupported({
      codec: codecString,
      width: 1920,
      height: 1080,
      bitrate: 4_000_000,
      framerate: 30,
    });
    return result.supported || false;
  } catch {
    return false;
  }
}

/**
 * 获取编解码器字符串
 */
function getCodecString(codec: VideoCodecType): string {
  switch (codec) {
    case 'h264':
      return 'avc1.640028'; // H.264 High Profile Level 4.0
    case 'h265':
      return 'hvc1.1.6.L93.B0'; // H.265 Main Profile
    case 'vp8':
      return 'vp8';
    case 'vp9':
      return 'vp09.00.10.08'; // VP9 Profile 0
    case 'av1':
      return 'av01.0.08M.08'; // AV1 Main Profile Level 4.0
    default:
      return 'avc1.640028';
  }
}

// ============================================
// 下载辅助函数
// ============================================

/**
 * 下载视频文件
 */
export function downloadVideo(result: CompositionResult, filename?: string): void {
  const link = document.createElement('a');
  link.href = result.downloadUrl;
  link.download = filename || `video-${Date.now()}.${result.format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 释放下载 URL
 */
export function revokeDownloadUrl(result: CompositionResult): void {
  URL.revokeObjectURL(result.downloadUrl);
}

// ============================================
// 导出
// ============================================

export {
  Output,
  Mp4OutputFormat,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  AudioSampleSource,
  QUALITY_HIGH,
  QUALITY_MEDIUM,
  QUALITY_LOW,
};




