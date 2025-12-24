'use client';

/**
 * 时间轴轨道组件
 * Timeline Track Component
 */

import React, { useCallback } from 'react';
import type { Track } from '@/lib/veir/types';
import { timeToPixels } from '@/lib/timeline/utils';
import { TRACK_TYPE_COLORS } from '@/lib/timeline/types';
import { TimelineClip } from './timeline-clip';

interface TimelineTrackProps {
    track: Track;
    index: number;
    sidebarWidth: number;
    trackHeight: number;
    pixelsPerSecond: number;
    totalWidth: number;
    selectedClipIds: string[];
    onClipClick: (clipId: string, additive?: boolean) => void;
}

export function TimelineTrack({
    track,
    index,
    sidebarWidth,
    trackHeight,
    pixelsPerSecond,
    totalWidth,
    selectedClipIds,
    onClipClick,
}: TimelineTrackProps) {
    const trackColor = TRACK_TYPE_COLORS[track.type];

    const typeLabels: Record<Track['type'], string> = {
        video: '视频',
        audio: '音频',
        text: '文字',
        subtitle: '字幕',
        pip: '画中画',
    };

    const typeIcons: Record<Track['type'], string> = {
        video: '🎬',
        audio: '🎵',
        text: '📝',
        subtitle: '💬',
        pip: '🖼️',
    };

    return (
        <div className="flex border-b border-gray-700" style={{ height: trackHeight }}>
            {/* 轨道侧边栏 */}
            <div
                className="flex-shrink-0 flex items-center gap-2 px-3 bg-gray-800 border-r border-gray-700"
                style={{ width: sidebarWidth }}
            >
                {/* 轨道颜色指示器 */}
                <div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: trackColor }}
                />

                {/* 轨道信息 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <span className="text-sm">{typeIcons[track.type]}</span>
                        <span className="text-sm text-white truncate">
                            {typeLabels[track.type]} {index + 1}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {track.clips.length} 个片段
                    </div>
                </div>

                {/* 轨道操作按钮 */}
                <div className="flex items-center gap-1">
                    {/* 静音按钮（仅音频/视频） */}
                    {(track.type === 'audio' || track.type === 'video') && (
                        <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </button>
                    )}

                    {/* 锁定按钮 */}
                    <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 轨道内容区域 */}
            <div
                className="relative flex-1 bg-gray-850"
                style={{
                    width: totalWidth,
                    minWidth: '100%',
                    background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent ${pixelsPerSecond - 1}px,
            rgba(75, 85, 99, 0.3) ${pixelsPerSecond - 1}px,
            rgba(75, 85, 99, 0.3) ${pixelsPerSecond}px
          )`,
                }}
            >
                {/* 渲染片段 */}
                {track.clips.map((clip) => (
                    <TimelineClip
                        key={clip.id}
                        clip={clip}
                        trackType={track.type}
                        trackHeight={trackHeight}
                        pixelsPerSecond={pixelsPerSecond}
                        selected={selectedClipIds.includes(clip.id)}
                        onClick={onClipClick}
                    />
                ))}
            </div>
        </div>
    );
}
