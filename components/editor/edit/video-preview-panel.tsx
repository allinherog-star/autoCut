'use client'

/**
 * 视频预览区组件 - 支持素材拖拽调整位置
 * Video Preview Panel Component - Supports dragging materials to adjust position
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Move,
  Grid3X3,
  Lock,
  Unlock,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useTimelineStore } from '@/lib/timeline/store'
import type { Clip, Track, VEIRProject } from '@/lib/veir/types'
import { getFilterCSS } from '@/lib/veir/composer/filters'
import { VideoPreviewContent, type ClipPosition, DEFAULT_POSITION } from './video-preview-content-helper'

type TargetDevice = 'phone' | 'pc'

type DeviceConfig = {
  id: TargetDevice
  name: string
  description?: string
  aspectRatio: string
  width: number
  height: number
}

interface VideoPreviewPanelProps {
  /** 选中的素材 ID */
  selectedClipId: string | null
  /** 选中的轨道 ID */
  selectedTrackId: string | null
  /** 目标设备（决定预览比例） */
  targetDevice: TargetDevice
  /** 目标设备配置（决定预览分辨率与比例） */
  deviceConfig: DeviceConfig
  /** 可选：完整 VEIR 项目（用于加载真实素材并按 vocabulary/adjustments 渲染） */
  veirProject?: VEIRProject | null
  /** 素材位置变化回调 */
  onClipPositionChange?: (clipId: string, x: number, y: number) => void
  /** 选中素材回调 */
  onSelectClip?: (clipId: string, trackId: string) => void
  /** 自定义类名 */
  className?: string
}



export function VideoPreviewPanel({
  selectedClipId,
  selectedTrackId,
  targetDevice,
  deviceConfig,
  veirProject,
  onClipPositionChange,
  onSelectClip,
  className = '',
}: VideoPreviewPanelProps) {
  const { data, playback, togglePlay, seek } = useTimelineStore()

  // 状态
  const [isMuted, setIsMuted] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [clipPositions, setClipPositions] = useState<Record<string, ClipPosition>>({})

  // 严格比例预览内框（用于保证 phone=9:16 / pc=16:9）
  const viewportRef = useRef<HTMLDivElement>(null) // 可用空间（去掉 padding 后）
  const [frameSize, setFrameSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  // 拖拽状态
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    clipId: string | null
    startMouseX: number
    startMouseY: number
    startPosX: number
    startPosY: number
  }>({
    isDragging: false,
    clipId: null,
    startMouseX: 0,
    startMouseY: 0,
    startPosX: 0,
    startPosY: 0,
  })
  const previewRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null) // 严格比例内框（拖拽坐标基于该容器）
  const videoRef = useRef<HTMLVideoElement>(null)

  // 监听可用空间变化，计算严格比例内框尺寸
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const ratio = deviceConfig.width > 0 && deviceConfig.height > 0 ? deviceConfig.width / deviceConfig.height : 16 / 9

    const compute = () => {
      const rect = el.getBoundingClientRect()
      const availableW = Math.max(0, rect.width)
      const availableH = Math.max(0, rect.height)
      if (availableW === 0 || availableH === 0) return

      let width = availableW
      let height = width / ratio
      if (height > availableH) {
        height = availableH
        width = height * ratio
      }

      // 避免小数导致的抖动
      const next = { width: Math.floor(width), height: Math.floor(height) }
      setFrameSize(prev => (prev.width === next.width && prev.height === next.height ? prev : next))
    }

    const rafCompute = () => requestAnimationFrame(compute)
    const timer = window.setTimeout(rafCompute, 0)

    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(rafCompute)
      ro.observe(el)
    } catch {
      // 降级：无 ResizeObserver 时不做自动监听
    }

    return () => {
      window.clearTimeout(timer)
      ro?.disconnect()
    }
  }, [deviceConfig.width, deviceConfig.height])

  // 获取选中素材信息
  const selectedClipInfo = useMemo(() => {
    if (!selectedClipId || !selectedTrackId) return null

    const track = data.tracks.find(t => t.id === selectedTrackId)
    if (!track) return null

    const clip = track.clips.find(c => c.id === selectedClipId)
    if (!clip) return null

    return { clip, track }
  }, [selectedClipId, selectedTrackId, data.tracks])

  // 从 VEIR project 获取素材（若提供）
  const getAsset = useCallback((assetId: string) => {
    return veirProject?.assets.assets?.[assetId]
  }, [veirProject])

  // 当前时间点活跃的主视频 clip（用于渲染真实视频 + 滤镜）
  const activeVideoClip = useMemo(() => {
    if (!veirProject) return null
    const t = playback.currentTime
    const videoTracks = veirProject.timeline.tracks
      .filter(tr => tr.type === 'video')
      .sort((a, b) => a.layer - b.layer)
    for (const tr of videoTracks) {
      const clip = tr.clips.find(c => t >= c.time.start && t < c.time.end)
      if (clip) return clip
    }
    return null
  }, [veirProject, playback.currentTime])

  const activeVideoSrc = useMemo(() => {
    if (!activeVideoClip) return null
    const asset = getAsset(activeVideoClip.asset)
    return asset?.src || null
  }, [activeVideoClip, getAsset])

  const activeVideoFilter = useMemo(() => {
    if (!veirProject || !activeVideoClip) return 'none'
    const clipId = activeVideoClip.id
    const filterRef = veirProject.adjustments?.clipOverrides?.[clipId]?.video?.filter
    return getFilterCSS(filterRef)
  }, [veirProject, activeVideoClip])

  // 同步 video 播放状态（基础版：把 store 的播放/暂停与 currentTime 驱动到 <video>）
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (!activeVideoSrc) return
    if (playback.isPlaying) {
      void el.play().catch(() => {
        // 浏览器可能阻止自动播放：静默降级
      })
    } else {
      el.pause()
    }
  }, [playback.isPlaying, activeVideoSrc])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (!activeVideoClip) return

    // 将时间轴时间映射到 clip 的局部时间（考虑 sourceRange）
    const t = playback.currentTime
    const clipLocal = Math.max(0, t - activeVideoClip.time.start)
    const sourceStart = activeVideoClip.sourceRange?.start ?? 0
    const desired = sourceStart + clipLocal
    if (Number.isFinite(desired) && Math.abs((el.currentTime || 0) - desired) > 0.25) {
      try {
        el.currentTime = desired
      } catch {
        // Safari/某些状态下设置 currentTime 可能抛错：忽略
      }
    }
  }, [playback.currentTime, activeVideoClip])

  // 统一的素材位置获取函数（考虑轨道类型的默认位置）
  const getClipPosition = useCallback((clipId: string, trackType: string): ClipPosition => {
    if (clipPositions[clipId]) {
      return clipPositions[clipId]
    }
    // 根据轨道类型返回不同的默认位置
    return {
      ...DEFAULT_POSITION,
      x: trackType === 'pip' ? 75 : 50,
      y: trackType === 'pip' ? 25 : trackType === 'subtitle' ? 88 : 85,
    }
  }, [clipPositions])

  // 获取当前选中素材的位置（使用统一的位置获取函数）
  const currentPosition = useMemo(() => {
    if (!selectedClipId) return DEFAULT_POSITION

    // 使用 selectedTrackId 获取轨道类型，确保与 selectedClipInfo 一致
    const track = selectedTrackId
      ? data.tracks.find(t => t.id === selectedTrackId)
      : data.tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    const trackType = track?.type || 'text'

    return getClipPosition(selectedClipId, trackType)
  }, [selectedClipId, selectedTrackId, data.tracks, getClipPosition])

  // 获取当前时间点可见的所有素材（用于画中画/贴纸显示）
  const visibleClips = useMemo(() => {
    const clips: Array<{ clip: Clip; track: Track; position: ClipPosition }> = []

    data.tracks.forEach(track => {
      if (track.type === 'pip' || track.type === 'text' || track.type === 'subtitle') {
        track.clips.forEach(clip => {
          if (playback.currentTime >= clip.time.start && playback.currentTime < clip.time.end) {
            clips.push({
              clip,
              track,
              position: getClipPosition(clip.id, track.type),
            })
          }
        })
      }
    })

    return clips
  }, [data.tracks, playback.currentTime, getClipPosition])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 开始拖拽（接收要拖拽的 clipId 和 trackType）
  const handleDragStart = useCallback((e: React.MouseEvent, clipId: string, trackType: string) => {
    if (isLocked) return
    e.preventDefault()
    e.stopPropagation()

    const pos = getClipPosition(clipId, trackType)
    setDragState({
      isDragging: true,
      clipId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    })
  }, [isLocked, getClipPosition])

  // 全局鼠标移动和释放事件
  useEffect(() => {
    if (!dragState.isDragging || !dragState.clipId) return

    const handleMouseMove = (e: MouseEvent) => {
      // 使用内层视频容器的尺寸进行计算
      const rect = videoContainerRef.current?.getBoundingClientRect()
      if (!rect) return

      // 计算鼠标移动的像素差值
      const deltaX = e.clientX - dragState.startMouseX
      const deltaY = e.clientY - dragState.startMouseY

      // 将像素差值转换为百分比
      const deltaXPercent = (deltaX / rect.width) * 100
      const deltaYPercent = (deltaY / rect.height) * 100

      // 新位置 = 起始位置 + 差值
      const newX = Math.max(0, Math.min(100, dragState.startPosX + deltaXPercent))
      const newY = Math.max(0, Math.min(100, dragState.startPosY + deltaYPercent))

      setClipPositions(prev => ({
        ...prev,
        [dragState.clipId!]: {
          ...(prev[dragState.clipId!] || DEFAULT_POSITION),
          x: newX,
          y: newY,
        },
      }))
    }

    const handleMouseUp = () => {
      if (dragState.clipId) {
        const finalPos = clipPositions[dragState.clipId] || DEFAULT_POSITION
        onClipPositionChange?.(dragState.clipId, finalPos.x, finalPos.y)
      }
      setDragState({
        isDragging: false,
        clipId: null,
        startMouseX: 0,
        startMouseY: 0,
        startPosX: 0,
        startPosY: 0,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, clipPositions, onClipPositionChange])

  // 调整缩放
  const handleScaleChange = (delta: number) => {
    if (!selectedClipId) return
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: {
        ...currentPosition,
        scale: Math.max(10, Math.min(300, currentPosition.scale + delta)),
      },
    }))
  }

  // 重置位置
  const handleResetPosition = () => {
    if (!selectedClipId) return
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: DEFAULT_POSITION,
    }))
  }

  return (
    <div className={`flex flex-col h-full bg-black ${className}`}>
      {/* 工具栏 */}
      <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between bg-[#1a1a1e] border-b border-[#2a2a2e]">
        {/* 左侧：视图控制 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-violet-500/20 text-violet-400' : 'text-[#666] hover:text-[#999]'}`}
            title="网格参考线"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`p-1.5 rounded transition-colors ${isLocked ? 'bg-amber-500/20 text-amber-400' : 'text-[#666] hover:text-[#999]'}`}
            title={isLocked ? '解锁位置' : '锁定位置'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>

        {/* 中间：选中素材信息 */}
        {selectedClipInfo && (
          <div className="flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-[#555]" />
            <span className="text-xs text-[#888] truncate max-w-[150px]">
              {selectedClipInfo.clip.asset}
            </span>
          </div>
        )}

        {/* 右侧：缩放控制 */}
        <div className="flex items-center gap-1">
          {/* 目标设备提示（严格比例渲染） */}
          <div className="hidden sm:flex items-center gap-2 mr-2 px-2 py-1 rounded bg-black/30 border border-white/10">
            <span className="text-[10px] text-[#9aa]">{deviceConfig.name}</span>
            <span className="text-[10px] text-[#666] font-mono">
              {deviceConfig.width}×{deviceConfig.height}
            </span>
          </div>
          <button
            onClick={() => handleScaleChange(-10)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#666] font-mono w-10 text-center">
            {currentPosition.scale}%
          </span>
          <button
            onClick={() => handleScaleChange(10)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetPosition}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors ml-1"
            title="重置位置"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      <div
        ref={previewRef}
        className={`flex-1 relative overflow-hidden flex items-center justify-center ${dragState.isDragging ? 'cursor-grabbing' : 'cursor-crosshair'} py-8`}
      >
        {/*
          严格比例预览容器
          根据 targetDevice 决定外层包裹样式
         */}
        {targetDevice === 'phone' ? (
          /* 手机外观壳 */
          <div
            className="relative bg-[#000] rounded-[2.5rem] shadow-2xl border-[4px] border-[#333] box-content"
            style={{
              width: frameSize.width ? `${frameSize.width}px` : undefined,
              height: frameSize.height ? `${frameSize.height}px` : undefined,
              padding: '12px', // 手机边框厚度
            }}
          >
            {/* 顶部刘海模拟 */}
            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-24 h-6 bg-[#000] rounded-b-xl z-20 pointer-events-none" />

            {/* 屏幕显示区域 (Strict Ratio Area) */}
            <div
              ref={videoContainerRef}
              className="relative w-full h-full bg-black overflow-hidden rounded-[2rem]"
              style={{
                // 确保屏幕区域也是严格比例
                aspectRatio: deviceConfig.aspectRatio,
              }}
            >
              <VideoPreviewContent
                activeVideoSrc={activeVideoSrc}
                activeVideoFilter={activeVideoFilter}
                isMuted={isMuted}
                playback={playback}
                showGrid={showGrid}
                visibleClips={visibleClips}
                selectedClipId={selectedClipId}
                isLocked={isLocked}
                veirProject={veirProject ?? null}
                onSelectClip={onSelectClip}
                onDragStart={handleDragStart}
                videoRef={videoRef}
              />
            </div>
          </div>
        ) : (
          /* 电脑/通用外观壳 */
          <div
            className="relative bg-[#1a1a1e] rounded-lg shadow-2xl border border-[#333] p-1"
            style={{
              width: frameSize.width ? `${frameSize.width}px` : undefined,
              height: frameSize.height ? `${frameSize.height}px` : undefined,
            }}
          >
            {/* 屏幕显示区域 */}
            <div
              ref={videoContainerRef}
              className="relative w-full h-full bg-black overflow-hidden rounded-md"
              style={{
                aspectRatio: deviceConfig.aspectRatio,
              }}
            >
              <VideoPreviewContent
                activeVideoSrc={activeVideoSrc}
                activeVideoFilter={activeVideoFilter}
                isMuted={isMuted}
                playback={playback}
                showGrid={showGrid}
                visibleClips={visibleClips}
                selectedClipId={selectedClipId}
                isLocked={isLocked}
                veirProject={veirProject ?? null}
                onSelectClip={onSelectClip}
                onDragStart={handleDragStart}
                videoRef={videoRef}
              />
            </div>
          </div>
        )}

        {/* 隐藏的视口测量引用 (用于计算最大可用尺寸) */}
        <div ref={viewportRef} className="absolute inset-8 pointer-events-none -z-10 opacity-0" />
      </div>

      {/* 播放控制栏 */}
      <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between bg-[#1a1a1e] border-t border-[#2a2a2e]">
        {/* 左侧：播放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => seek(0)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white transition-colors"
          >
            {playback.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => seek(playback.duration)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* 中间：时间进度 */}
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#888] font-mono w-12">
              {formatTime(playback.currentTime)}
            </span>
            <div className="flex-1 h-1 bg-[#333] rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${(playback.currentTime / playback.duration) * 100}%` }}
              />
            </div>
            <span className="text-xs text-[#555] font-mono w-12">
              {formatTime(playback.duration)}
            </span>
          </div>
        </div>

        {/* 右侧：音量和全屏 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded transition-colors ${isMuted ? 'text-amber-400' : 'text-[#666] hover:text-[#999]'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


