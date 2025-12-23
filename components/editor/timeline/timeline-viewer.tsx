'use client';

/**
 * 只读时间轴查看器 - 极简紧凑布局
 * Minimal Timeline Viewer - Compact & Zoomable
 */

import React, { useMemo, useRef, useCallback, useState } from 'react';
import { useTimelineStore } from '@/lib/timeline/store';
import { timeToPixels, formatTimeCode, calculateRulerTicks } from '@/lib/timeline/utils';
import { TRACK_TYPE_COLORS } from '@/lib/timeline/types';
import type { Track } from '@/lib/veir/types';

interface TimelineViewerProps {
    className?: string;
}

// 轨道类型配置 - 极简版
const TRACK_CONFIG: Record<Track['type'], { label: string; icon: string; color: string }> = {
    video: { label: 'V', icon: '🎬', color: 'bg-indigo-950/40' },
    audio: { label: 'A', icon: '🎵', color: 'bg-emerald-950/40' },
    text: { label: 'T', icon: '📝', color: 'bg-amber-950/40' },
    pip: { label: 'P', icon: '🖼️', color: 'bg-pink-950/40' },
};

// 紧凑布局常量
const SIDEBAR_WIDTH = 48;      // 极简侧边栏宽度
const RULER_HEIGHT = 20;       // 紧凑标尺高度
const TRACK_HEIGHT = 24;       // 极简轨道高度
const MIN_TRACK_HEIGHT = 16;   // 最小轨道高度
const MAX_TRACK_HEIGHT = 48;   // 最大轨道高度

export function TimelineViewer({ className = '' }: TimelineViewerProps) {
    const { data, playback, view, seek, togglePlay, zoomIn, zoomOut, setZoom } = useTimelineStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sidebarScrollRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);
    
    // 轨道高度状态（支持动态调整）
    const [trackHeight, setTrackHeight] = useState(TRACK_HEIGHT);

    // 计算时间标尺刻度
    const ticks = useMemo(
        () => calculateRulerTicks(data.duration, 10000, view.pixelsPerSecond),
        [data.duration, view.pixelsPerSecond]
    );

    const totalWidth = timeToPixels(data.duration, view.pixelsPerSecond);
    const playheadPosition = timeToPixels(playback.currentTime, view.pixelsPerSecond);

    // 缩放等级百分比
    const zoomPercentage = Math.round((view.pixelsPerSecond / view.minZoom) * 10);

    // 同步滚动 - 横向
    const handleHorizontalScroll = useCallback(() => {
        if (scrollContainerRef.current && rulerRef.current) {
            rulerRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
        }
    }, []);

    // 同步滚动 - 纵向
    const handleVerticalScroll = useCallback(() => {
        if (scrollContainerRef.current && sidebarScrollRef.current) {
            sidebarScrollRef.current.scrollTop = scrollContainerRef.current.scrollTop;
        }
    }, []);

    // 组合滚动处理
    const handleScroll = useCallback(() => {
        handleHorizontalScroll();
        handleVerticalScroll();
    }, [handleHorizontalScroll, handleVerticalScroll]);

    // 点击时间轴跳转
    const handleRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scrollLeft = rulerRef.current?.scrollLeft || 0;
        const x = e.clientX - rect.left + scrollLeft;
        const time = x / view.pixelsPerSecond;
        seek(Math.max(0, Math.min(time, data.duration)));
    }, [view.pixelsPerSecond, data.duration, seek]);

    // 点击轨道区域跳转
    const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
        const x = e.clientX - rect.left + scrollLeft;
        const time = x / view.pixelsPerSecond;
        seek(Math.max(0, Math.min(time, data.duration)));
    }, [view.pixelsPerSecond, data.duration, seek]);

    // 生成秒级网格线 - 减少数量以提升性能
    const secondGridLines = useMemo(() => {
        const lines = [];
        const step = view.pixelsPerSecond < 20 ? 5 : view.pixelsPerSecond < 50 ? 2 : 1;
        for (let i = 0; i <= Math.ceil(data.duration); i += step) {
            const x = i * view.pixelsPerSecond;
            const isMajor = i % 5 === 0;
            lines.push({ x, isMajor });
        }
        return lines;
    }, [data.duration, view.pixelsPerSecond]);

    // 缩放滑块处理
    const handleZoomSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setZoom(value);
    }, [setZoom]);

    // 轨道高度调整
    const handleTrackHeightChange = useCallback((delta: number) => {
        setTrackHeight(h => Math.max(MIN_TRACK_HEIGHT, Math.min(MAX_TRACK_HEIGHT, h + delta)));
    }, []);

    // 内容区最小宽度
    const contentMinWidth = Math.max(totalWidth + 100, 800);

    return (
        <div className={`flex flex-col bg-[#141417] border-t border-[#2a2a2e] overflow-hidden ${className}`}>
            {/* 紧凑控制栏 */}
            <div className="h-8 px-3 flex items-center justify-between bg-[#1c1c20] border-b border-[#252528] flex-shrink-0">
                {/* 左侧：播放控制 */}
                <div className="flex items-center gap-1">
                    {/* 跳到开头 */}
                    <button
                        className="p-1 text-[#666] hover:text-white hover:bg-[#333] rounded transition-colors"
                        onClick={() => seek(0)}
                        title="跳到开头"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* 播放/暂停 */}
                    <button
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white transition-all"
                        onClick={togglePlay}
                        title="播放/暂停"
                    >
                        {playback.isPlaying ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* 跳到结尾 */}
                    <button
                        className="p-1 text-[#666] hover:text-white hover:bg-[#333] rounded transition-colors"
                        onClick={() => seek(data.duration)}
                        title="跳到结尾"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* 时间显示 */}
                    <div className="ml-2 px-2 py-0.5 bg-[#111] rounded border border-[#333] text-[10px] font-mono text-white tabular-nums">
                        <span className="text-white">{formatTimeCode(playback.currentTime)}</span>
                        <span className="text-[#444] mx-0.5">/</span>
                        <span className="text-[#666]">{formatTimeCode(data.duration)}</span>
                    </div>

                    {/* 轨道统计 */}
                    <div className="ml-3 flex items-center gap-2 text-[10px] text-[#555]">
                        <span>{data.tracks.length}轨</span>
                        <span>·</span>
                        <span>{data.tracks.reduce((acc, t) => acc + t.clips.length, 0)}片</span>
                    </div>
                </div>

                {/* 右侧：缩放控制 */}
                <div className="flex items-center gap-2">
                    {/* 轨道高度调整 */}
                    <div className="flex items-center gap-0.5 mr-2">
                        <button
                            className="p-0.5 text-[#555] hover:text-white hover:bg-[#333] rounded transition-colors"
                            onClick={() => handleTrackHeightChange(-4)}
                            title="缩小轨道"
                        >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M4 12h16M4 6h16M4 18h16" strokeLinecap="round" />
                            </svg>
                        </button>
                        <button
                            className="p-0.5 text-[#555] hover:text-white hover:bg-[#333] rounded transition-colors"
                            onClick={() => handleTrackHeightChange(4)}
                            title="放大轨道"
                        >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M4 10h16M4 14h16" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* 分隔线 */}
                    <div className="w-px h-4 bg-[#333]" />

                    {/* 缩放按钮 */}
                    <button
                        className="p-0.5 text-[#555] hover:text-white hover:bg-[#333] rounded transition-colors"
                        onClick={zoomOut}
                        title="缩小"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>

                    {/* 缩放滑块 */}
                    <input
                        type="range"
                        min={view.minZoom}
                        max={view.maxZoom}
                        value={view.pixelsPerSecond}
                        onChange={handleZoomSlider}
                        className="w-20 h-1 bg-[#333] rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-2.5
                            [&::-webkit-slider-thumb]:h-2.5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-indigo-500
                            [&::-webkit-slider-thumb]:hover:bg-indigo-400
                            [&::-webkit-slider-thumb]:transition-colors"
                        title={`缩放: ${zoomPercentage}%`}
                    />

                    <button
                        className="p-0.5 text-[#555] hover:text-white hover:bg-[#333] rounded transition-colors"
                        onClick={zoomIn}
                        title="放大"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                    {/* 缩放百分比 */}
                    <span className="text-[10px] text-[#555] w-8 text-right tabular-nums">
                        {zoomPercentage}%
                    </span>
                </div>
            </div>

            {/* 时间轴主体 - 极简布局 */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* 左侧固定区域：极简轨道标签 */}
                <div className="flex-shrink-0 flex flex-col" style={{ width: SIDEBAR_WIDTH }}>
                    {/* 左上角 */}
                    <div
                        className="bg-[#18181b] border-b border-r border-[#252528] flex items-center justify-center"
                        style={{ height: RULER_HEIGHT }}
                    >
                        <span className="text-[8px] text-[#444] font-medium">TRK</span>
                    </div>

                    {/* 轨道侧边栏 - 极简 */}
                    <div
                        ref={sidebarScrollRef}
                        className="flex-1 overflow-hidden bg-[#18181b] border-r border-[#252528]"
                    >
                        {data.tracks.map((track, index) => (
                            <div
                                key={track.id}
                                className={`flex items-center justify-center border-b border-[#252528] ${TRACK_CONFIG[track.type].color}`}
                                style={{ height: trackHeight }}
                                title={`${TRACK_CONFIG[track.type].label === 'V' ? '视频' : 
                                    TRACK_CONFIG[track.type].label === 'A' ? '音频' : 
                                    TRACK_CONFIG[track.type].label === 'T' ? '文字' : '贴纸'} ${index + 1} - ${track.clips.length} 片段`}
                            >
                                {/* 极简轨道标识 */}
                                <div className="flex items-center gap-1">
                                    <div
                                        className="w-0.5 rounded-full"
                                        style={{
                                            height: Math.max(trackHeight - 8, 8),
                                            backgroundColor: TRACK_TYPE_COLORS[track.type],
                                        }}
                                    />
                                    <span className="text-[9px] text-[#888] font-mono">
                                        {TRACK_CONFIG[track.type].label}{index + 1}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* 空状态 */}
                        {data.tracks.length === 0 && (
                            <div
                                className="flex items-center justify-center text-[9px] text-[#444]"
                                style={{ height: trackHeight * 2 }}
                            >
                                空
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧滚动区域：刻度尺 + 轨道内容 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 时间标尺 - 紧凑版 */}
                    <div
                        ref={rulerRef}
                        className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-shrink-0"
                        style={{ height: RULER_HEIGHT }}
                        onClick={handleRulerClick}
                    >
                        <div
                            className="relative h-full bg-[#18181b] border-b border-[#252528] cursor-pointer"
                            style={{ width: contentMinWidth }}
                        >
                            {/* 刻度线和标签 - 紧凑版 */}
                            {ticks.map((tick, index) => {
                                const x = timeToPixels(tick.time, view.pixelsPerSecond);
                                return (
                                    <div
                                        key={index}
                                        className="absolute flex flex-col items-start"
                                        style={{ left: x, bottom: 0 }}
                                    >
                                        {/* 刻度线 */}
                                        <div
                                            className={`w-px ${tick.major ? 'bg-[#444]' : 'bg-[#2a2a2e]'}`}
                                            style={{ height: tick.major ? 10 : 4 }}
                                        />
                                        {/* 时间标签 - 仅主刻度 */}
                                        {tick.label && (
                                            <span
                                                className="absolute text-[8px] text-[#666] whitespace-nowrap font-mono"
                                                style={{
                                                    bottom: 10,
                                                    left: 2,
                                                }}
                                            >
                                                {tick.label}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {/* 播放头顶部指示器 - 紧凑 */}
                            <div
                                className="absolute bottom-0 z-20"
                                style={{ left: playheadPosition }}
                            >
                                <div className="w-2 h-2 bg-red-500 rotate-45 rounded-[1px] -translate-x-1/2 shadow-sm shadow-red-500/50" />
                            </div>
                        </div>
                    </div>

                    {/* 轨道内容区域 - 紧凑版 */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
                        onScroll={handleScroll}
                    >
                        <div
                            className="relative"
                            style={{
                                width: contentMinWidth,
                                minHeight: data.tracks.length > 0 ? data.tracks.length * trackHeight : trackHeight * 2,
                            }}
                        >
                            {/* 秒级网格线 - 淡化 */}
                            {secondGridLines.map((line, index) => (
                                <div
                                    key={index}
                                    className={`absolute top-0 bottom-0 ${line.isMajor ? 'bg-[#252528]' : 'bg-[#1e1e21]'}`}
                                    style={{
                                        left: line.x,
                                        width: 1,
                                    }}
                                />
                            ))}

                            {/* 轨道行 - 紧凑 */}
                            {data.tracks.map((track, trackIndex) => (
                                <div
                                    key={track.id}
                                    className={`absolute left-0 right-0 border-b border-[#252528] cursor-pointer ${TRACK_CONFIG[track.type].color}`}
                                    style={{
                                        top: trackIndex * trackHeight,
                                        height: trackHeight,
                                    }}
                                    onClick={handleTrackClick}
                                >
                                    {/* 片段 - 紧凑版 */}
                                    {track.clips.map((clip) => {
                                        const clipLeft = timeToPixels(clip.time.start, view.pixelsPerSecond);
                                        const clipWidth = timeToPixels(clip.time.end - clip.time.start, view.pixelsPerSecond);
                                        const color = TRACK_TYPE_COLORS[track.type];
                                        const duration = clip.time.end - clip.time.start;
                                        // 根据轨道高度动态调整内边距
                                        const padding = trackHeight < 20 ? 1 : trackHeight < 28 ? 2 : 3;

                                        return (
                                            <div
                                                key={clip.id}
                                                className="absolute rounded-sm overflow-hidden cursor-pointer hover:brightness-125 transition-all"
                                                style={{
                                                    left: clipLeft,
                                                    top: padding,
                                                    bottom: padding,
                                                    width: Math.max(clipWidth, 4),
                                                    backgroundColor: color,
                                                    boxShadow: `0 1px 3px ${color}30`,
                                                }}
                                                title={`${clip.asset} (${duration.toFixed(1)}s)`}
                                            >
                                                {/* 片段内容 - 仅在足够宽时显示 */}
                                                {clipWidth > 30 && trackHeight >= 20 && (
                                                    <div className="h-full flex items-center px-1 overflow-hidden">
                                                        <span className="text-[8px] text-white/80 truncate leading-none">
                                                            {clip.asset}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* 空状态 */}
                            {data.tracks.length === 0 && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center text-[10px] text-[#444] cursor-pointer"
                                    onClick={handleTrackClick}
                                    style={{ height: trackHeight * 2 }}
                                >
                                    <span>点击定位</span>
                                </div>
                            )}

                            {/* 播放头竖线 - 细化 */}
                            <div
                                className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-20"
                                style={{
                                    left: playheadPosition,
                                    boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
