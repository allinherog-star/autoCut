'use client';

/**
 * 播放头组件
 * Timeline Playhead Component
 */

import React from 'react';
import { timeToPixels } from '@/lib/timeline/utils';

interface TimelinePlayheadProps {
    currentTime: number;
    pixelsPerSecond: number;
    sidebarWidth: number;
    rulerHeight: number;
}

export function TimelinePlayhead({
    currentTime,
    pixelsPerSecond,
    sidebarWidth,
    rulerHeight,
}: TimelinePlayheadProps) {
    const left = sidebarWidth + timeToPixels(currentTime, pixelsPerSecond);

    return (
        <div
            className="absolute top-0 bottom-0 pointer-events-none z-50"
            style={{ left }}
        >
            {/* 播放头顶部指示器 */}
            <div
                className="absolute w-4 h-4 -ml-2 bg-red-500 rounded-b"
                style={{ top: 0 }}
            >
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500" />
            </div>

            {/* 播放头线条 */}
            <div
                className="absolute w-0.5 bg-red-500"
                style={{ top: rulerHeight, bottom: 0 }}
            />
        </div>
    );
}
