/**
 * VEIR 视频合成器
 * 核心合成引擎，基于 Canvas + MediaRecorder
 */

import type { VEIRProject } from '../types';
import type { ComposerProject, ProgressCallback } from '@/lib/video-composer/types';
import { VideoComposer } from '@/lib/video-composer/composer';
import { convertVEIRToComposer, validateVEIRForComposition, getVEIRStats } from './converter';
import type {
  ExportConfig,
  AssetResolver,
  CompositionResult,
  CompositionProgressCallback,
} from './types';

// ============================================
// VEIR 合成器类
// ============================================

/**
 * VEIR 视频合成器
 * 将 VEIR DSL 项目渲染为视频文件
 */
export class VEIRComposer {
  private veir: VEIRProject;
  private resolver: AssetResolver;
  private composerProject: ComposerProject | null = null;

  constructor(veir: VEIRProject, resolver?: AssetResolver) {
    this.veir = veir;
    this.resolver = resolver || {
      resolveVideo: async (src) => src,
      resolveAudio: async (src) => src,
      resolveImage: async (src) => src,
    };
  }

  /**
   * 验证项目
   */
  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    return validateVEIRForComposition(this.veir);
  }

  /**
   * 获取项目统计
   */
  getStats() {
    return getVEIRStats(this.veir);
  }

  /**
   * 准备合成（解析资源、转换配置）
   */
  async prepare(
    onProgress?: CompositionProgressCallback
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    onProgress?.('parsing', 0, '验证项目结构...');

    // 验证
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, errors: validation.errors, warnings: validation.warnings };
    }

    onProgress?.('parsing', 30, '转换项目配置...');

    try {
      // 转换为 ComposerProject
      const { project, context } = await convertVEIRToComposer(this.veir, this.resolver);
      this.composerProject = project;

      onProgress?.('parsing', 100, '准备完成');

      return {
        success: true,
        errors: context.errors,
        warnings: context.warnings,
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message],
        warnings: [],
      };
    }
  }

  /**
   * 执行合成导出
   */
  async compose(
    config: Partial<ExportConfig> = {},
    onProgress?: CompositionProgressCallback
  ): Promise<CompositionResult> {
    // 确保已准备
    if (!this.composerProject) {
      const prepResult = await this.prepare(onProgress);
      if (!prepResult.success) {
        throw new Error(`Preparation failed: ${prepResult.errors.join(', ')}`);
      }
    }

    const project = this.composerProject!;

    // 应用导出配置
    if (config.format) {
      project.output.format = config.format;
    }
    if (config.videoBitrate) {
      project.output.videoBitrate = config.videoBitrate;
    }
    if (config.audioBitrate) {
      project.output.audioBitrate = config.audioBitrate;
    }

    // 创建合成器
    const composer = new VideoComposer(project);

    try {
      // 执行渲染
      const result = await composer.render((progress, message) => {
        if (progress < 15) {
          onProgress?.('loading', progress, message);
        } else if (progress < 90) {
          onProgress?.('rendering', progress, message);
        } else if (progress < 100) {
          onProgress?.('encoding', progress, message);
        } else {
          onProgress?.('complete', 100, '完成');
        }
      });

      // 创建下载 URL
      const downloadUrl = URL.createObjectURL(result.blob);
      const filename = config.filename || `veir-export-${Date.now()}.${result.format}`;

      return {
        blob: result.blob,
        duration: result.duration,
        format: result.format,
        size: result.size,
        downloadUrl,
      };
    } finally {
      composer.destroy();
    }
  }

  /**
   * 销毁资源
   */
  destroy(): void {
    this.composerProject = null;
  }
}

// ============================================
// 便捷 API
// ============================================

/**
 * 快速合成 VEIR 项目
 */
export async function composeVEIR(
  veir: VEIRProject,
  options?: {
    config?: Partial<ExportConfig>;
    resolver?: AssetResolver;
    onProgress?: CompositionProgressCallback;
  }
): Promise<CompositionResult> {
  const composer = new VEIRComposer(veir, options?.resolver);

  try {
    return await composer.compose(options?.config, options?.onProgress);
  } finally {
    composer.destroy();
  }
}

/**
 * 下载合成结果
 */
export function downloadComposition(result: CompositionResult, filename?: string): void {
  const link = document.createElement('a');
  link.href = result.downloadUrl;
  link.download = filename || `video-${Date.now()}.${result.format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 预览合成结果（创建 video 元素）
 */
export function createPreviewElement(result: CompositionResult): HTMLVideoElement {
  const video = document.createElement('video');
  video.src = result.downloadUrl;
  video.controls = true;
  video.style.maxWidth = '100%';
  return video;
}

