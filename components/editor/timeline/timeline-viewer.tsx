'use client';

/**
 * 只读时间轴查看器 - 对标 PR/AE 效果
 * Professional Timeline Viewer
 */

import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { useTimelineStore } from '@/lib/timeline/store';
import { timeToPixels, formatTimeCode, calculateRulerTicks } from '@/lib/timeline/utils';
import { TRACK_TYPE_COLORS } from '@/lib/timeline/types';
import type { Track } from '@/lib/veir/types';

interface TimelineViewerProps {
    className?: string;
}

// 轨道类型配置
const TRACK_CONFIG: Record<Track['type'], { label: string; icon: string; bgPattern: string }> = {
    video: { label: '视频', icon: '🎬', bgPattern: 'bg-gradient-to-b from-indigo-900/20 to-indigo-950/20' },
    audio: { label: '音频', icon: '🎵', bgPattern: 'bg-gradient-to-b from-emerald-900/20 to-emerald-950/20' },
    text: { label: '文字', icon: '📝', bgPattern: 'bg-gradient-to-b from-amber-900/20 to-amber-950/20' },
    pip: { label: '贴纸', icon: '🖼️', bgPattern: 'bg-gradient-to-b from-pink-900/20 to-pink-950/20' },
};

// 侧边栏宽度
const SIDEBAR_WIDTH = 120;
// 标尺高度
const RULER_HEIGHT = 28;
// 轨道高度
const TRACK_HEIGHT = 48;

export function TimelineViewer({ className = '' }: TimelineViewerProps) {
    const { data, playback, view, seek, togglePlay } = useTimelineStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sidebarScrollRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);

    // 计算时间标尺刻度
    const ticks = useMemo(
        () => calculateRulerTicks(data.duration, 10000, view.pixelsPerSecond),
        [data.duration, view.pixelsPerSecond]
    );

    const totalWidth = timeToPixels(data.duration, view.pixelsPerSecond);
    const playheadPosition = timeToPixels(playback.currentTime, view.pixelsPerSecond);

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

    // 生成秒级网格线
    const secondGridLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i <= Math.ceil(data.duration); i++) {
            const x = i * view.pixelsPerSecond;
            const isMajor = i % 5 === 0;
            lines.push({ x, isMajor });
        }
        return lines;
    }, [data.duration, view.pixelsPerSecond]);

    // 内容区最小宽度
    const contentMinWidth = Math.max(totalWidth + 100, 800);

    return (
        <div className={`flex flex-col bg-[#1a1a1e] border-t border-[#2a2a2e] overflow-hidden ${className}`}>
            {/* 控制栏 */}
            <div className="h-10 px-4 flex items-center justify-between bg-[#222226] border-b border-[#2a2a2e] flex-shrink-0">
                {/* 左侧：轨道统计 */}
                <div className="flex items-center gap-4 text-xs text-[#888]">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {data.tracks.length} 轨道
                    </span>
                    <span className="text-[#555]">|</span>
                    <span>{data.tracks.reduce((acc, t) => acc + t.clips.length, 0)} 片段</span>
                </div>

                {/* 中间：播放控制 */}
                <div className="flex items-center gap-2">
                    {/* 后退 */}
                    <button
                        className="p-1.5 text-[#888] hover:text-white hover:bg-[#333] rounded transition-colors"
                        onClick={() => seek(0)}
                        title="跳到开头"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* 播放/暂停 */}
                    <button
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-lg shadow-indigo-600/30 transition-all"
                        onClick={togglePlay}
                        title="播放/暂停 (空格)"
                    >
                        {playback.isPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* 前进 */}
                    <button
                        className="p-1.5 text-[#888] hover:text-white hover:bg-[#333] rounded transition-colors"
                        onClick={() => seek(data.duration)}
                        title="跳到结尾"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* 时间显示 */}
                    <div className="ml-3 px-3 py-1 bg-[#111] rounded-md border border-[#333] text-xs font-mono text-white">
                        <span className="text-white">{formatTimeCode(playback.currentTime)}</span>
                        <span className="text-[#555] mx-1">/</span>
                        <span className="text-[#888]">{formatTimeCode(data.duration)}</span>
                    </div>
                </div>

                {/* 右侧：缩放指示 */}
                <div className="text-xs text-[#666]">
                    {Math.round(view.pixelsPerSecond)}px/s
                </div>
            </div>

            {/* 时间轴主体 */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* 左侧固定区域：角落 + 轨道侧边栏 */}
                <div className="flex-shrink-0 flex flex-col" style={{ width: SIDEBAR_WIDTH }}>
                    {/* 左上角空白区域 */}
                    <div
                        className="bg-[#1e1e22] border-b border-r border-[#2a2a2e] flex items-center justify-center"
                        style={{ height: RULER_HEIGHT }}
                    >
                        <span className="text-[10px] text-[#555]">轨道</span>
                    </div>

                    {/* 轨道侧边栏 - 可滚动 */}
                    <div
                        ref={sidebarScrollRef}
                        className="flex-1 overflow-hidden bg-[#1e1e22] border-r border-[#2a2a2e]"
                    >
                        {data.tracks.map((track, index) => (
                            <div
                                key={track.id}
                                className={`flex items-center gap-2 px-3 border-b border-[#2a2a2e] ${TRACK_CONFIG[track.type].bgPattern}`}
                                style={{ height: TRACK_HEIGHT }}
                            >
                                {/* 轨道颜色条 */}
                                <div
                                    className="w-1 rounded-full flex-shrink-0"
                                    style={{
                                        height: TRACK_HEIGHT - 16,
                                        backgroundColor: TRACK_TYPE_COLORS[track.type],
                                    }}
                                />
                                {/* 轨道信息 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm">{TRACK_CONFIG[track.type].icon}</span>
                                        <span className="text-xs text-[#ccc] truncate">
                                            {TRACK_CONFIG[track.type].label} {index + 1}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-[#666]">
                                        {track.clips.length} 片段
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* 空状态 */}
                        {data.tracks.length === 0 && (
                            <div
                                className="flex items-center justify-center text-xs text-[#555]"
                                style={{ height: TRACK_HEIGHT * 2 }}
                            >
                                暂无轨道
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧滚动区域：刻度尺 + 轨道内容 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 时间标尺 - 单独横向滚动 */}
                    <div
                        ref={rulerRef}
                        className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-shrink-0"
                        style={{ height: RULER_HEIGHT }}
                        onClick={handleRulerClick}
                    >
                        <div
                            className="relative h-full bg-[#1e1e22] border-b border-[#2a2a2e] cursor-pointer"
                            style={{ width: contentMinWidth }}
                        >
                            {/* 刻度线和标签 */}
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
                                            className={`w-px ${tick.major ? 'bg-[#555]' : 'bg-[#333]'}`}
                                            style={{ height: tick.major ? 12 : 6 }}
                                        />
                                        {/* 时间标签 */}
                                        {tick.label && (
                                            <span
                                                className="absolute text-[10px] text-[#888] whitespace-nowrap"
                                                style={{
                                                    bottom: 14,
                                                    left: 3,
                                                    transform: 'translateY(0)',
                                                }}
                                            >
                                                {tick.label}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {/* 播放头顶部指示器 */}
                            <div
                                className="absolute bottom-0 z-20"
                                style={{ left: playheadPosition }}
                            >
                                <div className="relative">
                                    <div className="w-3 h-3 bg-red-500 rotate-45 rounded-[2px] -translate-x-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 轨道内容区域 */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-auto"
                        onScroll={handleScroll}
                    >
                        <div
                            className="relative"
                            style={{
                                width: contentMinWidth,
                                minHeight: data.tracks.length > 0 ? data.tracks.length * TRACK_HEIGHT : TRACK_HEIGHT * 2,
                            }}
                        >
                            {/* 秒级网格线 */}
                            {secondGridLines.map((line, index) => (
                                <div
                                    key={index}
                                    className={`absolute top-0 bottom-0 ${line.isMajor ? 'bg-[#2a2a2e]' : 'bg-[#222]'}`}
                                    style={{
                                        left: line.x,
                                        width: 1,
                                    }}
                                />
                            ))}

                            {/* 轨道行 */}
                            {data.tracks.map((track, trackIndex) => (
                                <div
                                    key={track.id}
                                    className={`absolute left-0 right-0 border-b border-[#2a2a2e] cursor-pointer ${TRACK_CONFIG[track.type].bgPattern}`}
                                    style={{
                                        top: trackIndex * TRACK_HEIGHT,
                                        height: TRACK_HEIGHT,
                                    }}
                                    onClick={handleTrackClick}
                                >
                                    {/* 片段 */}
                                    {track.clips.map((clip) => {
                                        const clipLeft = timeToPixels(clip.time.start, view.pixelsPerSecond);
                                        const clipWidth = timeToPixels(clip.time.end - clip.time.start, view.pixelsPerSecond);
                                        const color = TRACK_TYPE_COLORS[track.type];
                                        const duration = clip.time.end - clip.time.start;

                                        return (
                                            <div
                                                key={clip.id}
                                                className="absolute top-1.5 bottom-1.5 rounded-md overflow-hidden shadow-lg group cursor-pointer hover:brightness-110 transition-all"
                                                style={{
                                                    left: clipLeft,
                                                    width: Math.max(clipWidth, 8),
                                                    backgroundColor: color,
                                                    boxShadow: `0 2px 8px ${color}40`,
                                                }}
                                            >
                                                {/* 片段内容 */}
                                                <div className="h-full flex flex-col justify-between p-1.5">
                                                    {/* 顶部：素材名称 */}
                                                    <div className="flex items-center gap-1">
                                                        {clipWidth > 60 && (
                                                            <span className="text-[10px] text-white/90 truncate font-medium">
                                                                {clip.asset}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* 底部：时长 */}
                                                    <div className="flex items-center justify-between">
                                                        {clipWidth > 40 && (
                                                            <span className="text-[9px] text-white/60">
                                                                {duration.toFixed(1)}s
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 左边缘手柄 */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/0 hover:bg-white/30 cursor-ew-resize transition-colors" />
                                                {/* 右边缘手柄 */}
                                                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/0 hover:bg-white/30 cursor-ew-resize transition-colors" />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* 空状态 */}
                            {data.tracks.length === 0 && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center text-sm text-[#555] cursor-pointer"
                                    onClick={handleTrackClick}
                                    style={{ height: TRACK_HEIGHT * 2 }}
                                >
                                    <span>点击时间轴定位播放头</span>
                                </div>
                            )}

                            {/* 播放头竖线 */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20 shadow-lg"
                                style={{
                                    left: playheadPosition,
                                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
