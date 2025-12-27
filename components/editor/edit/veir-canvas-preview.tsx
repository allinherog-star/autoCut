'use client'

import { useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react'
import type { VEIRProject } from '@/lib/veir/types'
import { VEIRAudioPlayer } from './veir-audio-player'
import type { ElementBounds, DragPosition } from '@/lib/modern-composer'

type Props = {
  project: VEIRProject
  time: number
  /** 是否正在播放（控制音频同步） */
  isPlaying?: boolean
  /** 是否静音 */
  isMuted?: boolean
  /**
   * 交互层：回传当前帧中各 clip 的真实包围盒（Content Space 像素）
   * 用于实现 PR/AE 风格 WYSIWYG 选框/命中区。
   */
  onOverlayBoundsChange?: (boundsByClipId: Record<string, ElementBounds>) => void
  /** 启用交互模式（Canvas 内拖拽） */
  interactive?: boolean
  /** 拖拽开始回调 */
  onDragStart?: (clipId: string) => void
  /** 拖拽中回调（百分比坐标） */
  onDragging?: (clipId: string, xPercent: number, yPercent: number) => void
  /** 拖拽结束回调（百分比坐标） */
  onDragEnd?: (clipId: string, xPercent: number, yPercent: number) => void
  /** 对象被选中回调 */
  onSelect?: (clipId: string) => void
  className?: string
}

/**
 * VEIR Canvas 预览（与导出同一渲染内核）
 * 
 * 标准化预览组件：
 * - Canvas 分辨率 = project.meta.resolution（与导出完全一致）
 * - 复用 ModernComposer.renderFrame()，不启动编码器
 * - 集成音频播放器，实现音画同步
 * - CSS 等比缩放显示
 * - 可选交互模式：启用 Canvas 内拖拽
 */
export function VEIRCanvasPreview({
  project,
  time,
  isPlaying = false,
  isMuted = false,
  onOverlayBoundsChange,
  interactive = false,
  onDragStart,
  onDragging,
  onDragEnd,
  onSelect,
  className = ''
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<null | { render: (t: number) => void; destroy: () => void }>(null)
  const composerInstanceRef = useRef<null | { getActiveClipIds: () => string[]; getClipBoundsBatch: (ids: string[]) => Record<string, ElementBounds> }>(null)
  const audioPlayerRef = useRef<VEIRAudioPlayer | null>(null)
  const projectRef = useRef<VEIRProject>(project)
  // 跟踪当前正在初始化的 composer，避免 React Strict Mode 下重复初始化导致的 Fabric 错误
  const initializingComposerRef = useRef<{ destroy: () => void } | null>(null)

  /**
   * 关键修复：Fabric 会把 <canvas> 包装成 `.canvas-container`，并把 CSS width/height 写死为「项目分辨率像素」。
   * 在预览容器较小时会被 overflow-hidden 裁掉，导致“画面显示不全/只显示局部”。
   *
   * 这里强制把 `.canvas-container` 以及 lower/upper 两层 canvas 的 CSS 尺寸改成 100% 自适应父容器，
   * 同时保持 canvas.width/canvas.height（真实像素）不变，确保渲染/导出语义一致。
   */
  const fixFabricContainerSizing = useCallback(() => {
    const canvas = canvasRef.current
    const host = containerRef.current
    if (!canvas || !host) return

    // Fabric 会把原 canvas 替换成 lower-canvas，并在其外层创建 .canvas-container
    const fabricContainer = canvas.closest('.canvas-container') as HTMLDivElement | null
    if (!fabricContainer) return

    // 让容器彻底 follow 父容器尺寸（UniversalPreview 的 renderArea）
    fabricContainer.style.width = '100%'
    fabricContainer.style.height = '100%'
    fabricContainer.style.position = 'absolute'
    fabricContainer.style.left = '0'
    fabricContainer.style.top = '0'

    // lower/upper 两层 canvas 同步改成 100%（覆盖 Fabric 写死的 1920x1080 CSS 像素）
    const lower = fabricContainer.querySelector('canvas.lower-canvas') as HTMLCanvasElement | null
    const upper = fabricContainer.querySelector('canvas.upper-canvas') as HTMLCanvasElement | null
    for (const c of [lower, upper]) {
      if (!c) continue
      c.style.width = '100%'
      c.style.height = '100%'
      c.style.display = 'block'
    }
  }, [])

  // 容器尺寸变化时也需要再次修正（避免 Fabric 在某些路径重写 style）
  useLayoutEffect(() => {
    const host = containerRef.current
    if (!host) return

    fixFabricContainerSizing()

    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(() => {
        // 避免同步布局抖动
        requestAnimationFrame(() => fixFabricContainerSizing())
      })
      ro.observe(host)
    } catch {
      // ignore
    }

    return () => {
      ro?.disconnect()
    }
  }, [fixFabricContainerSizing])

  // 坐标转换：Canvas 像素 -> 百分比
  const pixelToPercent = useCallback((pos: DragPosition): { xPercent: number; yPercent: number } => {
    const [w, h] = project.meta.resolution
    return {
      xPercent: (pos.x / w) * 100,
      yPercent: (pos.y / h) * 100,
    }
  }, [project.meta.resolution])

  // 提取 clipId（移除 elementId 前缀如 "video-"、"text-" 等）
  const extractClipId = useCallback((elementId: string): string => {
    // elementId 格式: "video-{clipId}", "text-{clipId}", "subtitle-{clipId}", "image-{clipId}"
    const prefixes = ['video-', 'text-', 'subtitle-', 'image-']
    for (const prefix of prefixes) {
      if (elementId.startsWith(prefix)) {
        return elementId.slice(prefix.length)
      }
    }
    return elementId
  }, [])

  useEffect(() => {
    projectRef.current = project
    // 更新音频播放器的项目
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setProject(project)
    }
    // 关键修复：project 变化时（如拖拽更新 clipOverrides）也需要重新渲染当前帧
    // 否则拖拽时只更新了 projectRef，但 Canvas 不会反映新位置
    composerRef.current?.render(time)
  }, [project, time])

  const key = useMemo(() => {
    const [w, h] = project.meta.resolution
    // 包含 interactive 以便切换交互模式时重建 composer
    return `${w}x${h}@${project.meta.fps}:${interactive}`
  }, [project.meta.resolution, project.meta.fps, interactive])

  // 初始化 Canvas 渲染器
  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    if (!canvas) return

    // 设置真实像素尺寸（与 VEIR 分辨率一致，确保预览 = 导出）
    canvas.width = project.meta.resolution[0]
    canvas.height = project.meta.resolution[1]

    const init = async () => {
      const { ModernComposer } = await import('@/lib/modern-composer')

      // 如果之前有正在初始化的 composer，先销毁它（处理 React Strict Mode 双重调用）
      if (initializingComposerRef.current) {
        initializingComposerRef.current.destroy()
        initializingComposerRef.current = null
      }

      const composer = new ModernComposer({
        width: project.meta.resolution[0],
        height: project.meta.resolution[1],
        frameRate: project.meta.fps,
        duration: project.meta.duration,
        canvas,
        backgroundColor: '#000000',
        interactive,
        onObjectDragStart: interactive ? (elementId, pos) => {
          const clipId = extractClipId(elementId)
          onDragStart?.(clipId)
        } : undefined,
        onObjectDragging: interactive ? (elementId, pos) => {
          const clipId = extractClipId(elementId)
          const { xPercent, yPercent } = pixelToPercent(pos)
          onDragging?.(clipId, xPercent, yPercent)
        } : undefined,
        onObjectDragEnd: interactive ? (elementId, pos) => {
          const clipId = extractClipId(elementId)
          const { xPercent, yPercent } = pixelToPercent(pos)
          onDragEnd?.(clipId, xPercent, yPercent)
        } : undefined,
        onObjectSelected: interactive ? (elementId) => {
          const clipId = extractClipId(elementId)
          onSelect?.(clipId)
        } : undefined,
      })

      // 在初始化之前保存引用，以便 cleanup 可以销毁它
      initializingComposerRef.current = composer

      await composer.initialize()

      // 清除初始化引用
      initializingComposerRef.current = null

      if (cancelled) {
        composer.destroy()
        return
      }

      // 关键修复：初始化完成后立即修正 Fabric 的 CSS 尺寸，避免预览被裁切
      fixFabricContainerSizing()

      // 首帧
      await composer.renderFrame(projectRef.current, time)
      composerInstanceRef.current = composer as unknown as {
        getActiveClipIds: () => string[]
        getClipBoundsBatch: (ids: string[]) => Record<string, ElementBounds>
      }
      // 回传一次 bbox（首帧）
      try {
        const clipIds = composerInstanceRef.current.getActiveClipIds()
        const bounds = composerInstanceRef.current.getClipBoundsBatch(clipIds)
        onOverlayBoundsChange?.(bounds)
      } catch {
        // ignore
      }

      // 渲染调度（关键修复：避免 async renderFrame 并发堆积导致“二次播放变卡”）
      // 目标：任何时刻最多只有 1 个 renderFrame 在飞行中；如果来新时间点，只渲染“最新一帧”（丢帧策略）
      let raf: number | null = null
      let latest = time
      let inFlight = false
      let dirty = false

      const pump = () => {
        if (raf) return
        raf = requestAnimationFrame(async () => {
          raf = null
          if (cancelled) return
          if (inFlight) {
            dirty = true
            return
          }
          inFlight = true
          const t = latest
          try {
            await composer.renderFrame(projectRef.current, t)
            // 每帧渲染后回传 bbox（用于 WYSIWYG 选框跟随动画/拖拽）
            if (composerInstanceRef.current && onOverlayBoundsChange) {
              const clipIds = composerInstanceRef.current.getActiveClipIds()
              const bounds = composerInstanceRef.current.getClipBoundsBatch(clipIds)
              onOverlayBoundsChange(bounds)
            }
          } finally {
            inFlight = false
          }
          if (dirty) {
            dirty = false
            pump()
          }
        })
      }

      const render = (t: number) => {
        latest = t
        if (inFlight) {
          dirty = true
          return
        }
        pump()
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
      // 如果正在初始化中，销毁它
      if (initializingComposerRef.current) {
        initializingComposerRef.current.destroy()
        initializingComposerRef.current = null
      }
      composerRef.current?.destroy()
      composerRef.current = null
      composerInstanceRef.current = null
    }
    // key 变化代表分辨率/fps 变化，需要重建 composer
  }, [key, project.meta.duration])

  // 初始化音频播放器
  useEffect(() => {
    const player = new VEIRAudioPlayer(project)
    audioPlayerRef.current = player

    // 预加载音频
    player.preload().catch(err => {
      console.warn('[VEIRCanvasPreview] Audio preload failed:', err)
    })

    return () => {
      player.destroy()
      audioPlayerRef.current = null
    }
  }, [project])

  // 渲染帧
  useEffect(() => {
    composerRef.current?.render(time)
  }, [time])

  // 同步音频时间
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seek(time)
    }
  }, [time])

  // 控制音频播放/暂停
  useEffect(() => {
    if (!audioPlayerRef.current) return

    if (isPlaying) {
      audioPlayerRef.current.play()
    } else {
      audioPlayerRef.current.pause()
    }
  }, [isPlaying])

  // 控制音频静音
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setMuted(isMuted)
    }
  }, [isMuted])

  // CSS 样式：使用 max 约束确保 canvas 不超出父容器并保持比例居中
  // 父容器 (UniversalPreview 的渲染区域) 已计算好正确的尺寸
  const canvasStyle = useMemo(() => {
    return {
      display: 'block',
      // 注意：Fabric 会把 canvas 包装并写死 CSS 尺寸；我们在 fixFabricContainerSizing 里统一改为 100%。
      // 这里保留基础样式即可。
      width: '100%',
      height: '100%',
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={canvasStyle}
      />
    </div>
  )
}
