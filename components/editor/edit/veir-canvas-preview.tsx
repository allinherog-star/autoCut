'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { VEIRProject } from '@/lib/veir/types'
import { VEIRAudioPlayer } from './veir-audio-player'

type Props = {
  project: VEIRProject
  time: number
  /** 是否正在播放（控制音频同步） */
  isPlaying?: boolean
  /** 是否静音 */
  isMuted?: boolean
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
 */
export function VEIRCanvasPreview({
  project,
  time,
  isPlaying = false,
  isMuted = false,
  className = ''
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const composerRef = useRef<null | { render: (t: number) => void; destroy: () => void }>(null)
  const audioPlayerRef = useRef<VEIRAudioPlayer | null>(null)
  const projectRef = useRef<VEIRProject>(project)
  // 跟踪当前正在初始化的 composer，避免 React Strict Mode 下重复初始化导致的 Fabric 错误
  const initializingComposerRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    projectRef.current = project
    // 更新音频播放器的项目
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setProject(project)
    }
  }, [project])

  const key = useMemo(() => {
    const [w, h] = project.meta.resolution
    return `${w}x${h}@${project.meta.fps}`
  }, [project.meta.resolution, project.meta.fps])

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
      // 如果正在初始化中，销毁它
      if (initializingComposerRef.current) {
        initializingComposerRef.current.destroy()
        initializingComposerRef.current = null
      }
      composerRef.current?.destroy()
      composerRef.current = null
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
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain' as const,
      // 居中显示
      margin: 'auto',
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={canvasStyle}
    />
  )
}
