'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { VEIRProject } from '@/lib/veir/types'

type Props = {
  project: VEIRProject
  time: number
  className?: string
}

/**
 * VEIR Canvas 预览（与导出同一渲染内核）
 * - 复用 ModernComposer.renderFrame()，不启动编码器
 * - Canvas 实际分辨率 = project.meta.resolution，外层用 CSS 做等比缩放
 */
export function VEIRCanvasPreview({ project, time, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const composerRef = useRef<null | { render: (t: number) => void; destroy: () => void }>(null)
  const projectRef = useRef<VEIRProject>(project)

  useEffect(() => {
    projectRef.current = project
  }, [project])

  const key = useMemo(() => {
    const [w, h] = project.meta.resolution
    return `${w}x${h}@${project.meta.fps}`
  }, [project.meta.resolution, project.meta.fps])

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    if (!canvas) return

    // 设置真实像素尺寸（避免 CSS 拉伸导致渲染模糊）
    canvas.width = project.meta.resolution[0]
    canvas.height = project.meta.resolution[1]

    const init = async () => {
      const { ModernComposer } = await import('@/lib/modern-composer')
      const composer = new ModernComposer({
        width: project.meta.resolution[0],
        height: project.meta.resolution[1],
        frameRate: project.meta.fps,
        duration: project.meta.duration,
        canvas,
        backgroundColor: '#000000',
      })

      await composer.initialize()
      if (cancelled) {
        composer.destroy()
        return
      }

      // 首帧
      await composer.renderFrame(projectRef.current, time)

      // rAF 合并渲染请求（避免 time 高频更新时重复 await）
      let raf: number | null = null
      let pending = time
      const render = (t: number) => {
        pending = t
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = null
          void composer.renderFrame(projectRef.current, pending)
        })
      }

      composerRef.current = {
        render,
        destroy: () => {
          if (raf) cancelAnimationFrame(raf)
          composer.destroy()
        },
      }
    }

    void init()

    return () => {
      cancelled = true
      composerRef.current?.destroy()
      composerRef.current = null
    }
    // key 变化代表分辨率/fps 变化，需要重建 composer
  }, [key, project.meta.duration])

  useEffect(() => {
    composerRef.current?.render(time)
  }, [time])

  return <canvas ref={canvasRef} className={className} />
}


