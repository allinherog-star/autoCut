'use client';

/**
 * 时间标尺组件
 * Timeline Ruler Component
 */

import React, { useMemo } from 'react';
import { timeToPixels, calculateRulerTicks } from '@/lib/timeline/utils';

interface TimelineRulerProps {
    duration: number;
    pixelsPerSecond: number;
    currentTime: number;
    height?: number;
}

export function TimelineRuler({
    duration,
    pixelsPerSecond,
    currentTime,
    height = 32,
}: TimelineRulerProps) {
    // 计算刻度
    const ticks = useMemo(
        () => calculateRulerTicks(duration, 10000, pixelsPerSecond),
        [duration, pixelsPerSecond]
    );

    const totalWidth = timeToPixels(duration, pixelsPerSecond);

    return (
        <div
            className="relative bg-gray-800 border-b border-gray-700 select-none"
            style={{ height, width: totalWidth, minWidth: '100%' }}
        >
            {/* 刻度线和标签 */}
            {ticks.map((tick, index) => {
                const x = timeToPixels(tick.time, pixelsPerSecond);
                return (
                    <div
                        key={index}
                        className="absolute top-0"
                        style={{ left: x }}
                    >
                        {/* 刻度线 */}
                        <div
                            className={`w-px ${tick.major ? 'bg-gray-500' : 'bg-gray-600'}`}
                            style={{ height: tick.major ? height * 0.6 : height * 0.3 }}
                        />

                        {/* 时间标签 */}
                        {tick.label && (
                            <span
                                className="absolute text-xs text-gray-400 whitespace-nowrap"
                                style={{
                                    top: height * 0.6 + 2,
                                    left: 4,
                                    fontSize: '10px',
                                }}
                            >
                                {tick.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
