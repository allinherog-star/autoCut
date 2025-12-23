/**
 * VEIR 视频合成器
 * 基于 ModernComposer 新架构 (Fabric.js + Anime.js + MediaBunny)
 */

import type { VEIRProject } from '../types';
import { 
  ModernComposer, 
  composeVEIRModern,
  type ProgressCallback as ModernProgressCallback,
  type CompositionResult as ModernCompositionResult,
  type OutputFormat,
} from '@/lib/modern-composer';
import { convertVEIRToModern, validateVEIRForComposition, getVEIRStats } from './converter';
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
 * 使用新架构：Fabric.js + Anime.js + WebCodecs + MediaBunny
 */
export class VEIRComposer {
  private veir: VEIRProject;
  private resolver: AssetResolver;
  private modernComposer: ModernComposer | null = null;

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
   * 准备合成（验证项目）
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

    onProgress?.('parsing', 50, '转换项目配置...');

    try {
      // 转换为 ModernComposer 配置（仅验证）
      const { context } = await convertVEIRToModern(this.veir, this.resolver);

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
   * 使用 ModernComposer 新架构
   */
  async compose(
    config: Partial<ExportConfig> = {},
    onProgress?: CompositionProgressCallback
  ): Promise<CompositionResult> {
    // 准备阶段
    const prepResult = await this.prepare((stage, progress, msg) => {
      onProgress?.(stage, progress * 0.1, msg); // 准备阶段占 10%
    });

    if (!prepResult.success) {
      throw new Error(`Preparation failed: ${prepResult.errors.join(', ')}`);
    }

    // 映射进度回调
    const modernProgress: ModernProgressCallback = (progress, stage, message) => {
      // 将 ModernComposer 进度映射到 CompositionProgressCallback
      let composerStage: 'parsing' | 'loading' | 'rendering' | 'encoding' | 'complete';
      
      if (stage === 'loading') {
        composerStage = 'loading';
      } else if (stage === 'rendering') {
        composerStage = 'rendering';
      } else if (stage === 'encoding') {
        composerStage = 'encoding';
      } else if (stage === 'complete') {
        composerStage = 'complete';
      } else {
        composerStage = 'rendering';
      }
      
      // 调整进度：准备阶段 10%，其余 90%
      const adjustedProgress = 10 + progress * 0.9;
      onProgress?.(composerStage, adjustedProgress, message);
    };

    try {
      // 使用 ModernComposer 进行合成
      const result = await composeVEIRModern(this.veir, {
        format: (config.format as OutputFormat) || 'mp4',
        quality: config.quality || 'high',
        resolver: this.resolver,
        onProgress: modernProgress,
      });

      // 如果需要自定义文件名，在这里处理
      const filename = config.filename || `veir-export-${Date.now()}.${result.format}`;

      return {
        blob: result.blob,
        duration: result.duration,
        format: result.format,
        size: result.size,
        downloadUrl: result.downloadUrl,
      };
    } catch (error) {
      console.error('[VEIRComposer] Composition failed:', error);
      throw error;
    }
  }

  /**
   * 销毁资源
   */
  destroy(): void {
    this.modernComposer?.destroy();
    this.modernComposer = null;
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

/**
 * 释放合成结果的资源
 */
export function releaseComposition(result: CompositionResult): void {
  URL.revokeObjectURL(result.downloadUrl);
}

