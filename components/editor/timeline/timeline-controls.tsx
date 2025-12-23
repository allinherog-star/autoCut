'use client';

/**
 * 时间轴控制栏组件
 * Timeline Controls Component
 */

import React from 'react';
import { useTimelineStore } from '@/lib/timeline/store';
import { formatTimeCode } from '@/lib/timeline/utils';

export function TimelineControls() {
    const {
        playback,
        view,
        data,
        play,
        pause,
        togglePlay,
        seek,
        zoomIn,
        zoomOut,
        fitToView,
        addTrack,
        canUndo,
        canRedo,
        undo,
        redo,
    } = useTimelineStore();

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            {/* 左侧：轨道操作 */}
            <div className="flex items-center gap-2">
                {/* 添加轨道下拉菜单 */}
                <div className="relative group">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        添加轨道
                    </button>

                    {/* 下拉菜单 */}
                    <div className="absolute left-0 top-full mt-1 w-40 py-1 bg-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <button
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                            onClick={() => addTrack('video')}
                        >
                            🎬 视频轨道
                        </button>
                        <button
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                            onClick={() => addTrack('audio')}
                        >
                            🎵 音频轨道
                        </button>
                        <button
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                            onClick={() => addTrack('text')}
                        >
                            📝 文字轨道
                        </button>
                        <button
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                            onClick={() => addTrack('pip')}
                        >
                            🖼️ 画中画轨道
                        </button>
                    </div>
                </div>

                {/* 撤销/重做 */}
                <div className="flex items-center border-l border-gray-600 pl-2 ml-1">
                    <button
                        className={`p-1.5 rounded ${canUndo() ? 'text-white hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'}`}
                        onClick={undo}
                        disabled={!canUndo()}
                        title="撤销 (Ctrl+Z)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    <button
                        className={`p-1.5 rounded ${canRedo() ? 'text-white hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'}`}
                        onClick={redo}
                        disabled={!canRedo()}
                        title="重做 (Ctrl+Shift+Z)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 中间：播放控制 */}
            <div className="flex items-center gap-3">
                {/* 跳到开头 */}
                <button
                    className="p-1.5 text-white hover:bg-gray-700 rounded"
                    onClick={() => seek(0)}
                    title="跳到开头"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>

                {/* 后退 5 秒 */}
                <button
                    className="p-1.5 text-white hover:bg-gray-700 rounded"
                    onClick={() => seek(Math.max(0, playback.currentTime - 5))}
                    title="后退 5 秒"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* 播放/暂停 */}
                <button
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-colors"
                    onClick={togglePlay}
                    title="播放/暂停 (空格)"
                >
                    {playback.isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* 前进 5 秒 */}
                <button
                    className="p-1.5 text-white hover:bg-gray-700 rounded"
                    onClick={() => seek(Math.min(playback.duration, playback.currentTime + 5))}
                    title="前进 5 秒"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* 跳到结尾 */}
                <button
                    className="p-1.5 text-white hover:bg-gray-700 rounded"
                    onClick={() => seek(playback.duration)}
                    title="跳到结尾"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>

                {/* 时间显示 */}
                <div className="ml-2 px-3 py-1 bg-gray-700 rounded font-mono text-sm text-white">
                    <span>{formatTimeCode(playback.currentTime)}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-400">{formatTimeCode(playback.duration)}</span>
                </div>
            </div>

            {/* 右侧：缩放控制 */}
            <div className="flex items-center gap-2">
                {/* 缩放按钮 */}
                <button
                    className="p-1.5 text-white hover:bg-gray-700 rounded"
                    onClick={zoomOut}
                    title="缩小 (Ctrl+-)"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                </button>

                {/* 缩放滑块 */}
                <input
                    type="range"
                    min={view.minZoom}
                    max={view.maxZoom}
                    value={view.pixelsPerSecond}
                    onChange={(e) => useTimelineStore.getState().setZoom(Number(e.target.value))}
                    className="w-24 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                />

                <button
                    className="p-1.5 text-white hover:bg-gray-700 rounded"
                    onClick={zoomIn}
                    title="放大 (Ctrl++)"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                </button>

                {/* 适应视图 */}
                <button
                    className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                    onClick={() => fitToView(window.innerWidth)}
                    title="适应视图"
                >
                    适应
                </button>

                {/* 缩放百分比 */}
                <span className="text-xs text-gray-400 w-12 text-right">
                    {Math.round(view.pixelsPerSecond)}px/s
                </span>
            </div>
        </div>
    );
}
