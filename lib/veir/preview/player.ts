/**
 * VEIR 预览播放器（与导出渲染一致）
 * - 复用 ModernComposer 的 renderFrame（同一套渲染逻辑）
 * - 仅渲染 Canvas，不进行编码
 */

import type { VEIRProject } from '@/lib/veir/types'
import { ModernComposer, type AssetResolver } from '@/lib/modern-composer'

export class VEIRPreviewPlayer {
  private project: VEIRProject
  private composer: ModernComposer | null = null
  private canvas: HTMLCanvasElement

  constructor(project: VEIRProject, options?: { canvas?: HTMLCanvasElement; resolver?: AssetResolver }) {
    this.project = project
    this.canvas =
      options?.canvas ??
      (() => {
        const c = document.createElement('canvas')
        // 让 CSS 控制显示尺寸
        c.style.width = '100%'
        c.style.height = '100%'
        c.style.display = 'block'
        return c
      })()

    this.composer = new ModernComposer(
      {
        width: project.meta.resolution[0],
        height: project.meta.resolution[1],
        frameRate: project.meta.fps,
        duration: project.meta.duration,
        canvas: this.canvas,
        // format/quality 在预览无意义，但保留默认值
        format: 'mp4',
        quality: 'high',
      },
      options?.resolver
    )
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.canvas
  }

  setProject(project: VEIRProject): void {
    this.project = project
  }

  async render(time: number): Promise<void> {
    if (!this.composer) return
    await this.composer.renderFrame(this.project, time)
  }

  destroy(): void {
    this.composer?.destroy()
    this.composer = null
  }
}


