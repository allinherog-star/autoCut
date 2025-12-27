'use client';

/**
 * 时间轴编辑器主组件
 * Timeline Editor Component
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useTimelineStore } from '@/lib/timeline/store';
import {
    timeToPixels,
    pixelsToTime,
    calculateRulerTicks,
} from '@/lib/timeline/utils';
import { TimelineRuler } from './timeline-ruler';
import { TimelineTrack } from './timeline-track';
import { TimelinePlayhead } from './timeline-playhead';
import { TimelineControls } from './timeline-controls';

interface TimelineEditorProps {
    className?: string;
}

export function TimelineEditor({ className = '' }: TimelineEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Store
    const {
        data,
        view,
        playback,
        selection,
        drag,
        play,
        pause,
        togglePlay,
        seek,
        zoomIn,
        zoomOut,
        setZoom,
        fitToView,
        selectClip,
        clearSelection,
        _tick,
    } = useTimelineStore();

    // 播放动画循环
    useEffect(() => {
        if (!playback.isPlaying) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const animate = (time: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = time;
            }
            const deltaTime = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            _tick(deltaTime);
            animationRef.current = requestAnimationFrame(animate);
        };

        lastTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [playback.isPlaying, _tick]);

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 忽略输入框内的按键
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'Delete':
                case 'Backspace':
                    // 删除选中的片段
                    break;
                case 'Escape':
                    clearSelection();
                    break;
                case '=':
                case '+':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        zoomIn();
                    }
                    break;
                case '-':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        zoomOut();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, clearSelection, zoomIn, zoomOut]);

    // 时间轴点击定位
    const handleTimelineClick = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;

        const rect = scrollRef.current.getBoundingClientRect();
        const scrollLeft = scrollRef.current.scrollLeft;
        const x = e.clientX - rect.left + scrollLeft - view.sidebarWidth;

        if (x >= 0) {
            const time = pixelsToTime(x, view.pixelsPerSecond);
            seek(time);
        }
    }, [view.pixelsPerSecond, view.sidebarWidth, seek]);

    // 计算总宽度
    const totalWidth = timeToPixels(data.duration, view.pixelsPerSecond);

    return (
        <div className={`flex flex-col bg-gray-900 ${className}`}>
            {/* 控制栏 */}
            <TimelineControls />

            {/* 时间轴主体 */}
            <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
                {/* 时间标尺 */}
                <div className="flex">
                    {/* 左侧占位 */}
                    <div
                        className="flex-shrink-0 bg-gray-800 border-r border-gray-700"
                        style={{ width: view.sidebarWidth }}
                    />

                    {/* 标尺区域 */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-x-auto overflow-y-hidden"
                        onClick={handleTimelineClick}
                    >
                        <TimelineRuler
                            duration={data.duration}
                            pixelsPerSecond={view.pixelsPerSecond}
                            currentTime={playback.currentTime}
                        />
                    </div>
                </div>

                {/* 轨道区域 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 轨道侧边栏 + 轨道内容 */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <div className="flex flex-col min-w-full">
                            {data.tracks.map((track, index) => (
                                <TimelineTrack
                                    key={track.id}
                                    track={track}
                                    index={index}
                                    sidebarWidth={view.sidebarWidth}
                                    trackHeight={view.trackHeight}
                                    pixelsPerSecond={view.pixelsPerSecond}
                                    totalWidth={totalWidth}
                                    selectedClipIds={selection.selectedClipIds}
                                    onClipClick={selectClip}
                                />
                            ))}

                            {/* 空轨道占位 */}
                            {data.tracks.length === 0 && (
                                <div
                                    className="flex items-center justify-center text-gray-500"
                                    style={{ height: view.trackHeight * 3 }}
                                >
                                    <p>拖入素材或添加轨道开始编辑</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 播放头 */}
                <TimelinePlayhead
                    currentTime={playback.currentTime}
                    pixelsPerSecond={view.pixelsPerSecond}
                    sidebarWidth={view.sidebarWidth}
                    rulerHeight={view.rulerHeight}
                />
            </div>
        </div>
    );
}
