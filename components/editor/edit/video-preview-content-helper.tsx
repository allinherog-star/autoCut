import React from 'react'
import { motion } from 'framer-motion'
import { Play, Move } from 'lucide-react'
import type { Clip, Track, VEIRProject } from '@/lib/veir/types'

// 模拟的素材位置数据
/**
 * 素材位置（Content Space - 内容坐标系）
 * 
 * 坐标空间说明：
 * - x, y: 使用百分比（0-100），表示归一化坐标 × 100
 * - 原点在左上角
 * - 所有值都是"内容坐标系"的，不受预览缩放影响
 */
export interface ClipPosition {
    /** X 位置 (0-100 百分比，内容坐标系) */
    x: number
    /** Y 位置 (0-100 百分比，内容坐标系) */
    y: number
    /** 缩放比例 (100 = 原始大小) */
    scale: number
    /** 旋转角度 (度) */
    rotation: number
}

// 默认位置
export const DEFAULT_POSITION: ClipPosition = {
    x: 50,
    y: 50,
    scale: 100,
    rotation: 0,
}

// 提取内部视频渲染逻辑，避免主组件过于臃肿
export function VideoPreviewContent({
    activeVideoSrc,
    activeVideoFilter,
    isMuted,
    playback,
    showGrid,
    visibleClips,
    selectedClipId,
    isLocked,
    veirProject,
    onSelectClip,
    onDragStart,
    videoRef,
}: {
    activeVideoSrc: string | null
    activeVideoFilter: string
    isMuted: boolean
    playback: { currentTime: number; duration: number }
    showGrid: boolean
    visibleClips: Array<{ clip: Clip; track: Track; position: ClipPosition }>
    selectedClipId: string | null
    isLocked: boolean
    veirProject: VEIRProject | null
    onSelectClip?: (clipId: string, trackId: string) => void
    onDragStart: (e: React.MouseEvent, clipId: string, trackType: string) => void
    videoRef: React.RefObject<HTMLVideoElement | null>
}) {
    // 格式化时间
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return (
        <>
            {/* 网格参考线 */}
            {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-30">
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
            {activeVideoSrc ? (
                <video
                    ref={videoRef}
                    src={activeVideoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: activeVideoFilter }}
                    muted={isMuted}
                    playsInline
                    preload="auto"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[#252528] flex items-center justify-center">
                            <Play className="w-8 h-8 text-[#444]" />
                        </div>
                        <p className="text-xs text-[#555]">
                            {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
                        </p>
                    </div>
                </div>
            )}

            {/* 可见的贴纸/画中画素材 */}
            {visibleClips.map(({ clip, track, position }) => {
                const isSelected = clip.id === selectedClipId
                return (
                    <React.Fragment key={clip.id}>
                        <DraggableElement
                            clip={clip}
                            track={track}
                            position={position}
                            isSelected={isSelected}
                            isLocked={isLocked}
                            onDragStart={(e) => onDragStart(e, clip.id, track.type)}
                            onSelect={() => onSelectClip?.(clip.id, track.id)}
                            veirProject={veirProject}
                        />
                        {/* 选中的元素叠加层（控制柄） */}
                        {isSelected && (
                            <SelectedElementOverlay
                                position={position}
                                isLocked={isLocked}
                                onDragStart={(e) => onDragStart(e, clip.id, track.type)}
                            />
                        )}
                    </React.Fragment>
                )
            })}

            {/* 安全区域提示 */}
            {/* 边界线已移除 */}
        </>
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
