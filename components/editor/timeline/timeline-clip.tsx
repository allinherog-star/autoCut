'use client';

/**
 * 时间轴片段组件
 * Timeline Clip Component
 */

import React, { useCallback, useState } from 'react';
import type { Clip, TrackType } from '@/lib/veir/types';
import { timeToPixels } from '@/lib/timeline/utils';
import { TRACK_TYPE_COLORS } from '@/lib/timeline/types';

interface TimelineClipProps {
    clip: Clip;
    trackType: TrackType;
    trackHeight: number;
    pixelsPerSecond: number;
    selected: boolean;
    onClick: (clipId: string, additive?: boolean) => void;
}

export function TimelineClip({
    clip,
    trackType,
    trackHeight,
    pixelsPerSecond,
    selected,
    onClick,
}: TimelineClipProps) {
    const [isHovered, setIsHovered] = useState(false);

    const duration = clip.time.end - clip.time.start;
    const left = timeToPixels(clip.time.start, pixelsPerSecond);
    const width = timeToPixels(duration, pixelsPerSecond);
    const color = TRACK_TYPE_COLORS[trackType];

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(clip.id, e.shiftKey || e.metaKey);
    }, [clip.id, onClick]);

    // 格式化时长显示
    const formatDuration = (seconds: number): string => {
        const s = Math.floor(seconds);
        const ms = Math.floor((seconds % 1) * 10);
        return `${s}.${ms}s`;
    };

    return (
        <div
            className={`
        absolute top-1 bottom-1 rounded cursor-pointer overflow-hidden
        transition-all duration-100
        ${selected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}
        ${isHovered ? 'brightness-110' : ''}
      `}
            style={{
                left,
                width: Math.max(width, 20),
                backgroundColor: color,
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 片段内容 */}
            <div className="h-full flex flex-col justify-between p-1 overflow-hidden">
                {/* 缩略图区域（视频/图片） */}
                {(trackType === 'video' || trackType === 'pip') && (
                    <div className="flex-1 bg-black/20 rounded-sm overflow-hidden">
                        {/* 实际项目中这里会显示视频缩略图 */}
                        <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                            {clip.asset}
                        </div>
                    </div>
                )}

                {/* 波形区域（音频） */}
                {trackType === 'audio' && (
                    <div className="flex-1 flex items-center justify-center">
                        {/* 简化的波形展示 */}
                        <div className="flex items-center gap-px h-full">
                            {Array.from({ length: Math.min(Math.floor(width / 4), 50) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-white/60 rounded-full"
                                    style={{ height: `${20 + Math.random() * 60}%` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 文字内容（文字轨道） */}
                {trackType === 'text' && (
                    <div className="flex-1 flex items-center px-1">
                        <span className="text-white text-xs truncate">
                            {clip.asset}
                        </span>
                    </div>
                )}

                {/* 底部信息栏 */}
                <div className="flex items-center justify-between mt-0.5">
                    <span className="text-white/80 text-[10px] truncate">
                        {formatDuration(duration)}
                    </span>
                </div>
            </div>

            {/* 左边缘拖拽手柄 */}
            <div
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/0 hover:bg-white/30 transition-colors"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    // TODO: 实现边缘拖拽
                }}
            />

            {/* 右边缘拖拽手柄 */}
            <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/0 hover:bg-white/30 transition-colors"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    // TODO: 实现边缘拖拽
                }}
            />
        </div>
    );
}
