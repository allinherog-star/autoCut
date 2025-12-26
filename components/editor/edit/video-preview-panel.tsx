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
import { VEIRCanvasPreview } from './veir-canvas-preview'

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
  /** 素材变换变化回调（推荐：写回 VEIR adjustments.video.transform） */
  onClipTransformChange?: (
    clipId: string,
    patch: { xPercent?: number; yPercent?: number; scale?: number; rotation?: number }
  ) => void
  /** 选中素材回调 */
  onSelectClip?: (clipId: string, trackId: string) => void
  /** 自定义类名 */
  className?: string
}

// 模拟的素材位置数据
interface ClipPosition {
  x: number  // 0-100 百分比
  y: number  // 0-100 百分比
  scale: number
  rotation: number
}

// 默认位置
const DEFAULT_POSITION: ClipPosition = {
  x: 50,
  y: 50,
  scale: 100,
  rotation: 0,
}

export function VideoPreviewPanel({
  selectedClipId,
  selectedTrackId,
  targetDevice,
  deviceConfig,
  veirProject,
  onClipPositionChange,
  onClipTransformChange,
  onSelectClip,
  className = '',
}: VideoPreviewPanelProps) {
  const { data, playback, togglePlay, seek } = useTimelineStore()

  // 状态
  const [isMuted, setIsMuted] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  // 拖拽临时覆盖（最终以 VEIR adjustments 为准）
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
  const dragRafRef = useRef<number | null>(null)
  const dragPendingRef = useRef<{ clipId: string; x: number; y: number } | null>(null)

  // 监听可用空间变化，计算严格比例内框尺寸
  // 关键：使用 VEIR 项目的分辨率 (meta.resolution) 确保预览与导出效果一致
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    // 优先使用 VEIR 项目分辨率，回退到 deviceConfig
    // 这确保预览比例与导出完全一致（类似 PR/AE 的 WYSIWYG 体验）
    const [veirW, veirH] = veirProject?.meta?.resolution || [0, 0]
    const ratio = veirW > 0 && veirH > 0
      ? veirW / veirH
      : (deviceConfig.width > 0 && deviceConfig.height > 0 ? deviceConfig.width / deviceConfig.height : 16 / 9)

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
  }, [veirProject?.meta?.resolution, deviceConfig.width, deviceConfig.height])

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

  const readTransformFromVEIR = useCallback((clipId: string): ClipPosition | null => {
    if (!veirProject) return null
    const t = veirProject.adjustments?.clipOverrides?.[clipId]?.video?.transform
    if (!t) return null

    const [w, h] = veirProject.meta.resolution
    const offset = t.offset
    const x = offset ? (offset[0] / w) * 100 : undefined
    const y = offset ? (offset[1] / h) * 100 : undefined
    const scale = typeof t.scale === 'number' ? t.scale * 100 : undefined
    const rotation = typeof t.rotation === 'number' ? t.rotation : undefined

    return {
      x: typeof x === 'number' && Number.isFinite(x) ? x : DEFAULT_POSITION.x,
      y: typeof y === 'number' && Number.isFinite(y) ? y : DEFAULT_POSITION.y,
      scale: typeof scale === 'number' && Number.isFinite(scale) ? scale : DEFAULT_POSITION.scale,
      rotation: typeof rotation === 'number' && Number.isFinite(rotation) ? rotation : DEFAULT_POSITION.rotation,
    }
  }, [veirProject])

  // 统一的素材位置获取函数（考虑轨道类型的默认位置）
  const getClipPosition = useCallback((clipId: string, trackType: string): ClipPosition => {
    if (clipPositions[clipId]) {
      return clipPositions[clipId]
    }

    // VEIR 中的 transform 优先（保证预览/导出一致）
    const veirPos = readTransformFromVEIR(clipId)
    if (veirPos) return veirPos

    // 根据轨道类型返回不同的默认位置
    return {
      ...DEFAULT_POSITION,
      x: trackType === 'pip' ? 75 : 50,
      y: trackType === 'pip' ? 25 : trackType === 'subtitle' ? 88 : 85,
    }
  }, [clipPositions, readTransformFromVEIR])

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

      // rAF 节流：实时写回（让 Canvas 预览也跟着动）
      dragPendingRef.current = { clipId: dragState.clipId!, x: newX, y: newY }
      if (!dragRafRef.current) {
        dragRafRef.current = requestAnimationFrame(() => {
          dragRafRef.current = null
          const pending = dragPendingRef.current
          if (!pending) return
          onClipTransformChange?.(pending.clipId, { xPercent: pending.x, yPercent: pending.y })
          onClipPositionChange?.(pending.clipId, pending.x, pending.y)
        })
      }
    }

    const handleMouseUp = () => {
      if (dragState.clipId) {
        const finalPos = clipPositions[dragState.clipId] || DEFAULT_POSITION
        onClipTransformChange?.(dragState.clipId, { xPercent: finalPos.x, yPercent: finalPos.y })
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
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current)
      dragRafRef.current = null
      dragPendingRef.current = null
    }
  }, [dragState, clipPositions, onClipPositionChange, onClipTransformChange])

  // 调整缩放
  const handleScaleChange = (delta: number) => {
    if (!selectedClipId) return
    const nextScale = Math.max(10, Math.min(300, currentPosition.scale + delta))
    setClipPositions(prev => ({ ...prev, [selectedClipId]: { ...currentPosition, scale: nextScale } }))
    // scale 传 UI 百分比（100=100%），由上层写回 VEIR 时再换算为 ratio
    onClipTransformChange?.(selectedClipId, { scale: nextScale })
  }

  // 重置位置
  const handleResetPosition = () => {
    if (!selectedClipId) return
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: DEFAULT_POSITION,
    }))
    onClipTransformChange?.(selectedClipId, {
      xPercent: DEFAULT_POSITION.x,
      yPercent: DEFAULT_POSITION.y,
      scale: DEFAULT_POSITION.scale,
      rotation: DEFAULT_POSITION.rotation,
    })
    onClipPositionChange?.(selectedClipId, DEFAULT_POSITION.x, DEFAULT_POSITION.y)
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
          {/* 目标设备提示：优先显示 VEIR 项目分辨率（确保预览 = 导出） */}
          <div className="hidden sm:flex items-center gap-2 mr-2 px-2 py-1 rounded bg-black/30 border border-white/10">
            <span className="text-[10px] text-[#9aa]">
              {veirProject ? '项目分辨率' : deviceConfig.name}
            </span>
            <span className="text-[10px] text-[#666] font-mono">
              {veirProject
                ? `${veirProject.meta.resolution[0]}×${veirProject.meta.resolution[1]}`
                : `${deviceConfig.width}×${deviceConfig.height}`
              }
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
        className={`flex-1 relative overflow-hidden ${dragState.isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      >
        {/* 可用空间（留出内边距） */}
        <div ref={viewportRef} className="absolute inset-4 flex items-center justify-center">
          {/* 严格比例内框：所有渲染/拖拽都以此为基准 */}
          <div
            ref={videoContainerRef}
            className={`
              relative bg-black overflow-hidden shadow-2xl
              ${targetDevice === 'phone' ? 'rounded-2xl' : 'rounded-lg'}
            `}
            style={{
              width: frameSize.width ? `${frameSize.width}px` : undefined,
              height: frameSize.height ? `${frameSize.height}px` : undefined,
              aspectRatio: deviceConfig.aspectRatio,
            }}
          >
            {/* 网格参考线 */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 三分线 */}
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/10" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/10" />
                {/* 中心线 */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-violet-500/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-violet-500/30" />
              </div>
            )}

            {/* 主视频区域（真实素材优先） */}
            {veirProject ? (
              <VEIRCanvasPreview
                project={veirProject}
                time={playback.currentTime}
                isPlaying={playback.isPlaying}
                isMuted={isMuted}
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[#252528] flex items-center justify-center">
                    <Play className="w-8 h-8 text-[#444]" />
                  </div>
                  <p className="text-xs text-[#555]">{formatTime(playback.currentTime)} / {formatTime(playback.duration)}</p>
                </div>
              </div>
            )}

            {/* 交互层：仅对“当前选中且可见”的元素提供拖拽把手（画面由 Canvas 渲染，避免重复显示） */}
            {selectedClipId &&
              visibleClips
                .filter(({ clip }) => clip.id === selectedClipId)
                .map(({ clip, track, position }) => (
                  <DraggableElement
                    key={clip.id}
                    clip={clip}
                    track={track}
                    position={position}
                    isSelected={true}
                    isLocked={isLocked}
                    onDragStart={(e) => handleDragStart(e, clip.id, track.type)}
                    onSelect={() => onSelectClip?.(clip.id, track.id)}
                    veirProject={veirProject}
                  />
                ))}

            {/* 安全区域提示（基于严格比例内框） */}
            <div className="absolute inset-2 border border-dashed border-[#333] rounded-md pointer-events-none opacity-30" />
          </div>
        </div>
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

// 可拖拽元素组件
function DraggableElement({
  clip,
  track,
  position,
  isSelected,
  isLocked,
  onDragStart,
  onSelect,
  veirProject,
}: {
  clip: Clip
  track: Track
  position: ClipPosition
  isSelected: boolean
  isLocked: boolean
  onDragStart: (e: React.MouseEvent) => void
  onSelect?: () => void
  veirProject?: VEIRProject | null
}) {
  const isPip = track.type === 'pip'
  const isSubtitle = track.type === 'subtitle'

  const asset = veirProject?.assets.assets?.[clip.asset]
  const displayText =
    asset?.type === 'text' && typeof asset.content === 'string' && asset.content.length > 0
      ? asset.content
      : clip.asset

  return (
    <motion.div
      className={`
        absolute cursor-move transition-shadow
        ${isSelected ? 'ring-2 ring-amber-400' : ''}
        ${isPip ? 'rounded-lg overflow-hidden' : ''}
      `}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        // 重要：不要手写 transform 字符串并同时使用 framer-motion 的 scale/rotate/whileHover。
        // 否则 hover 时 framer-motion 会重算 transform，导致 translate(-50%,-50%) 被覆盖而出现“位置偏移”。
        x: '-50%',
        y: '-50%',
        scale: position.scale / 100,
        rotate: position.rotation,
      }}
      onMouseDown={(e) => {
        onSelect?.()
        if (!isLocked) onDragStart(e)
      }}
      whileHover={!isLocked ? { scale: (position.scale / 100) * 1.02 } : {}}
    >
      {isPip ? (
        <div className="w-28 h-28 bg-black/30 border border-white/15 rounded-lg overflow-hidden flex items-center justify-center">
          {asset?.type === 'image' && asset.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.src} alt={clip.asset} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl">{clip.asset.includes('.gif') ? '🎭' : '🖼️'}</span>
          )}
        </div>
      ) : (
        <div
          className={`
            px-3 py-2 rounded-lg border backdrop-blur
            ${isSubtitle
              ? 'bg-black/45 border-white/20'
              : 'bg-amber-400/15 border-amber-400/25'}
          `}
          style={{
            maxWidth: isSubtitle ? 320 : 240,
            textAlign: isSubtitle ? 'center' : 'left',
          }}
        >
          <span className={`text-xs ${isSubtitle ? 'text-white/95' : 'text-amber-200'}`}>
            {displayText}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// 选中元素控制框
function SelectedElementOverlay({
  position,
  isLocked,
  onDragStart,
}: {
  position: ClipPosition
  isLocked: boolean
  onDragStart: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 控制点 */}
      {!isLocked && (
        <>
          {/* 四角控制点 */}
          {[
            { x: -1, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: 1 },
          ].map((corner, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 bg-amber-400 rounded-sm pointer-events-auto cursor-nwse-resize"
              style={{
                left: `calc(50% + ${corner.x * 40}px - 5px)`,
                top: `calc(50% + ${corner.y * 40}px - 5px)`,
              }}
            />
          ))}

          {/* 移动手柄 */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
              w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center
              pointer-events-auto cursor-move shadow-lg"
            onMouseDown={onDragStart}
          >
            <Move className="w-3 h-3 text-black" />
          </div>
        </>
      )}
    </div>
  )
}

