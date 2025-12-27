'use client'

/**
 * 统一预览面板 - Fabric.js 驱动
 * Unified Preview Panel - Fabric.js Driven
 * 
 * 架构简化：
 * - 完全依赖 VEIRCanvasPreview 的 Fabric.js 交互模式
 * - 移除 HTML Overlay 拖拽逻辑
 * - 保留：工具栏、播放控制、吸附参考线
 */

import React, { useMemo, useRef, useState, useCallback } from 'react'
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Maximize2,
    Grid3X3,
    Lock,
    Unlock,
    RotateCw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react'
import { useTimelineStore } from '@/lib/timeline/store'
import type { VEIRProject } from '@/lib/veir/types'
import { VEIRCanvasPreview } from './veir-canvas-preview'
import { UniversalPreview } from '@/components/ui/universal-preview'

type TargetDevice = 'phone' | 'pc'

type DeviceConfig = {
    id: TargetDevice
    name: string
    description?: string
    aspectRatio: string
    width: number
    height: number
}

interface UnifiedPreviewPanelProps {
    /** 选中的素材 ID */
    selectedClipId: string | null
    /** 选中的轨道 ID */
    selectedTrackId: string | null
    /** 目标设备（决定预览比例） */
    targetDevice: TargetDevice
    /** 目标设备配置（决定预览分辨率与比例） */
    deviceConfig: DeviceConfig
    /** 可选：完整 VEIR 项目 */
    veirProject?: VEIRProject | null
    /** 素材变换变化回调 */
    onClipTransformChange?: (
        clipId: string,
        patch: { xPercent?: number; yPercent?: number; scale?: number; rotation?: number }
    ) => void
    /** 选中素材回调 */
    onSelectClip?: (clipId: string, trackId: string) => void
    /** 自定义类名 */
    className?: string
}

// 吸附参考线状态
type SnapGuideState = {
    v: number | null
    h: number | null
}

// 默认位置（百分比）
const DEFAULT_POSITION = {
    x: 50,
    y: 50,
    scale: 100,
    rotation: 0,
}

export function UnifiedPreviewPanel({
    selectedClipId,
    selectedTrackId,
    targetDevice,
    deviceConfig,
    veirProject,
    onClipTransformChange,
    onSelectClip,
    className = '',
}: UnifiedPreviewPanelProps) {
    const { data, playback, togglePlay, seek, pause, play } = useTimelineStore()

    // 状态
    const [isMuted, setIsMuted] = useState(false)
    const [showGrid, setShowGrid] = useState(false)
    const [isLocked, setIsLocked] = useState(false)
    const [snapGuides, setSnapGuides] = useState<SnapGuideState>({ v: null, h: null })
    const [isDragging, setIsDragging] = useState(false)

    // 播放恢复标记
    const resumeAfterDragRef = useRef(false)

    // 内容分辨率：优先使用 VEIR 项目的分辨率
    const contentResolution: [number, number] = useMemo(() => {
        if (veirProject?.meta?.resolution) {
            return veirProject.meta.resolution as [number, number]
        }
        return [deviceConfig.width, deviceConfig.height]
    }, [veirProject?.meta?.resolution, deviceConfig.width, deviceConfig.height])

    // 辅助函数：根据 clipId 查找对应的 trackId
    const findTrackIdByClipId = useCallback((clipId: string): string | undefined => {
        for (const track of data.tracks) {
            if (track.clips.some(c => c.id === clipId)) {
                return track.id
            }
        }
        return undefined
    }, [data.tracks])

    // 计算吸附（50% 中心线 + 可选三分线）
    const computeSnapped = useCallback((raw: { x: number; y: number }, opts: { altKey?: boolean }) => {
        // alt/option：临时禁用吸附
        if (opts.altKey) return { ...raw, guides: { v: null, h: null } }

        const threshold = 0.8 // percent
        const snaps: number[] = showGrid ? [33.3333, 50, 66.6667] : [50]

        let x = raw.x
        let y = raw.y
        let v: number | null = null
        let h: number | null = null

        for (const s of snaps) {
            if (Math.abs(x - s) <= threshold) {
                x = s
                v = s
                break
            }
        }
        for (const s of snaps) {
            if (Math.abs(y - s) <= threshold) {
                y = s
                h = s
                break
            }
        }

        return { x, y, guides: { v, h } }
    }, [showGrid])

    // 格式化时间
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    // 读取当前选中素材的 scale（从 VEIR clipOverrides）
    const currentScale = useMemo(() => {
        if (!selectedClipId || !veirProject) return DEFAULT_POSITION.scale
        const transform = veirProject.adjustments?.clipOverrides?.[selectedClipId]?.video?.transform
        if (transform?.scale != null) {
            return Math.round(transform.scale * 100)
        }
        return DEFAULT_POSITION.scale
    }, [selectedClipId, veirProject])

    // 缩放控制
    const handleScaleChange = useCallback((delta: number) => {
        if (!selectedClipId) return
        const nextScale = Math.max(10, Math.min(300, currentScale + delta))
        onClipTransformChange?.(selectedClipId, { scale: nextScale })
    }, [selectedClipId, currentScale, onClipTransformChange])

    // 重置位置
    const handleResetPosition = useCallback(() => {
        if (!selectedClipId) return
        onClipTransformChange?.(selectedClipId, {
            xPercent: DEFAULT_POSITION.x,
            yPercent: DEFAULT_POSITION.y,
            scale: DEFAULT_POSITION.scale,
            rotation: DEFAULT_POSITION.rotation,
        })
    }, [selectedClipId, onClipTransformChange])

    // Fabric.js 拖拽回调
    const handleDragStart = useCallback((clipId: string) => {
        const trackId = findTrackIdByClipId(clipId)
        if (trackId) {
            onSelectClip?.(clipId, trackId)
        }
        if (playback.isPlaying) {
            resumeAfterDragRef.current = true
            pause()
        } else {
            resumeAfterDragRef.current = false
        }
        setIsDragging(true)
    }, [findTrackIdByClipId, onSelectClip, playback.isPlaying, pause])

    const handleDragging = useCallback((clipId: string, xPercent: number, yPercent: number) => {
        const snapped = computeSnapped({ x: xPercent, y: yPercent }, { altKey: false })
        setSnapGuides(snapped.guides)
        onClipTransformChange?.(clipId, { xPercent: snapped.x, yPercent: snapped.y })
    }, [computeSnapped, onClipTransformChange])

    const handleDragEnd = useCallback((clipId: string, xPercent: number, yPercent: number) => {
        const snapped = computeSnapped({ x: xPercent, y: yPercent }, { altKey: false })
        onClipTransformChange?.(clipId, { xPercent: snapped.x, yPercent: snapped.y })
        setSnapGuides({ v: null, h: null })
        setIsDragging(false)
        if (resumeAfterDragRef.current) {
            resumeAfterDragRef.current = false
            play()
        }
    }, [computeSnapped, onClipTransformChange, play])

    const handleSelect = useCallback((clipId: string) => {
        const trackId = findTrackIdByClipId(clipId)
        if (trackId) {
            onSelectClip?.(clipId, trackId)
        }
    }, [findTrackIdByClipId, onSelectClip])

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

                {/* 中间：分辨率信息 */}
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-black/30 border border-white/10">
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

                {/* 右侧：缩放控制 */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleScaleChange(-10)}
                        className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
                        title="缩小"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-[#666] font-mono w-10 text-center">
                        {currentScale}%
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
            <div className={`flex-1 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}>
                <UniversalPreview
                    contentResolution={contentResolution}
                    showGrid={showGrid}
                    showCenterLines={showGrid}
                    showSafeArea={true}
                    showControls={false}
                    className="absolute inset-0"
                >
                    {/* Canvas 预览 */}
                    {veirProject ? (
                        <VEIRCanvasPreview
                            project={veirProject}
                            time={playback.currentTime}
                            isPlaying={playback.isPlaying}
                            isMuted={isMuted}
                            interactive={!isLocked}
                            onDragStart={handleDragStart}
                            onDragging={handleDragging}
                            onDragEnd={handleDragEnd}
                            onSelect={handleSelect}
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14]">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[#252528] flex items-center justify-center">
                                    <Play className="w-8 h-8 text-[#444]" />
                                </div>
                                <p className="text-xs text-[#555]">{formatTime(playback.currentTime)} / {formatTime(playback.duration)}</p>
                            </div>
                        </div>
                    )}

                    {/* 吸附参考线 */}
                    {(snapGuides.v != null || snapGuides.h != null) && (
                        <div className="absolute inset-0 pointer-events-none z-50">
                            {snapGuides.v != null && (
                                <div
                                    className="absolute top-0 bottom-0 w-px bg-violet-400/60"
                                    style={{ left: `${snapGuides.v}%` }}
                                />
                            )}
                            {snapGuides.h != null && (
                                <div
                                    className="absolute left-0 right-0 h-px bg-violet-400/60"
                                    style={{ top: `${snapGuides.h}%` }}
                                />
                            )}
                        </div>
                    )}
                </UniversalPreview>
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
                        onClick={() => {
                            if (isDragging) return
                            togglePlay()
                        }}
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
                        <div
                            className="flex-1 h-1 bg-[#333] rounded-full overflow-hidden cursor-pointer"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const ratio = (e.clientX - rect.left) / rect.width
                                seek(ratio * playback.duration)
                            }}
                        >
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
