/**
 * 时间轴工具函数
 * Timeline Utilities
 */

import type { Track, Clip, TimeRange, TrackType } from '@/lib/veir/types';
import type { TimelineData, TimelineViewConfig, TRACK_TYPE_COLORS } from './types';

// ============================================
// 时间计算
// ============================================

/**
 * 时间转像素
 */
export function timeToPixels(time: number, pixelsPerSecond: number): number {
    return time * pixelsPerSecond;
}

/**
 * 像素转时间
 */
export function pixelsToTime(pixels: number, pixelsPerSecond: number): number {
    return pixels / pixelsPerSecond;
}

/**
 * 格式化时间显示
 */
export function formatTimeCode(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0').slice(0, 2)}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0').slice(0, 2)}`;
}

/**
 * 格式化刻度尺时间显示（简洁版）
 * 只显示分:秒格式，适用于时间轴刻度尺
 */
export function formatRulerTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 对齐到帧
 */
export function snapToFrame(time: number, fps: number): number {
    const frame = Math.round(time * fps);
    return frame / fps;
}

/**
 * 对齐到网格
 */
export function snapToGrid(time: number, gridSize: number): number {
    return Math.round(time / gridSize) * gridSize;
}

// ============================================
// 轨道操作
// ============================================

/**
 * 生成轨道 ID
 */
export function generateTrackId(type: TrackType): string {
    return `track_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 生成片段 ID
 */
export function generateClipId(): string {
    return `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 创建空轨道
 */
export function createEmptyTrack(type: TrackType, layer: number): Track {
    return {
        id: generateTrackId(type),
        type,
        layer,
        clips: [],
    };
}

/**
 * 获取轨道内片段列表（按时间排序）
 */
export function getClipsByTime(track: Track): Clip[] {
    return [...track.clips].sort((a, b) => a.time.start - b.time.start);
}

/**
 * 检查时间范围是否有重叠
 */
export function hasTimeOverlap(range1: TimeRange, range2: TimeRange): boolean {
    return range1.start < range2.end && range2.start < range1.end;
}

/**
 * 检查片段是否与轨道内其他片段重叠
 */
export function hasClipOverlap(track: Track, clipId: string, newTime: TimeRange): boolean {
    return track.clips.some(clip =>
        clip.id !== clipId && hasTimeOverlap(clip.time, newTime)
    );
}

/**
 * 查找片段可放置的最近空位
 */
export function findNearestGap(track: Track, startTime: number, duration: number): number {
    const sortedClips = getClipsByTime(track);

    // 如果没有片段，直接返回请求的开始时间
    if (sortedClips.length === 0) {
        return Math.max(0, startTime);
    }

    // 检查每个片段之间的间隙
    let lastEnd = 0;
    for (const clip of sortedClips) {
        const gapStart = lastEnd;
        const gapEnd = clip.time.start;
        const gapDuration = gapEnd - gapStart;

        // 如果间隙足够大
        if (gapDuration >= duration) {
            // 如果请求的开始时间在这个间隙内
            if (startTime >= gapStart && startTime + duration <= gapEnd) {
                return startTime;
            }
            // 如果请求的开始时间在这个间隙之前
            if (startTime < gapStart) {
                return gapStart;
            }
        }

        lastEnd = clip.time.end;
    }

    // 如果在所有片段之后
    if (startTime >= lastEnd) {
        return startTime;
    }

    // 否则放在最后
    return lastEnd;
}

// ============================================
// 时间轴数据操作
// ============================================

/**
 * 计算时间轴总时长
 */
export function calculateDuration(data: TimelineData): number {
    let maxEnd = 0;
    for (const track of data.tracks) {
        for (const clip of track.clips) {
            if (clip.time.end > maxEnd) {
                maxEnd = clip.time.end;
            }
        }
    }
    return Math.max(maxEnd, 60); // 最小 60 秒
}

/**
 * 根据 ID 查找轨道
 */
export function findTrack(data: TimelineData, trackId: string): Track | undefined {
    return data.tracks.find(t => t.id === trackId);
}

/**
 * 根据 ID 查找片段
 */
export function findClip(data: TimelineData, clipId: string): { track: Track; clip: Clip } | undefined {
    for (const track of data.tracks) {
        const clip = track.clips.find(c => c.id === clipId);
        if (clip) {
            return { track, clip };
        }
    }
    return undefined;
}

/**
 * 获取指定时间点的所有活动片段
 */
export function getActiveClipsAtTime(data: TimelineData, time: number): Array<{ track: Track; clip: Clip }> {
    const result: Array<{ track: Track; clip: Clip }> = [];

    for (const track of data.tracks) {
        for (const clip of track.clips) {
            if (time >= clip.time.start && time < clip.time.end) {
                result.push({ track, clip });
            }
        }
    }

    // 按 layer 排序
    return result.sort((a, b) => a.track.layer - b.track.layer);
}

/**
 * 深拷贝时间轴数据
 */
export function cloneTimelineData(data: TimelineData): TimelineData {
    return JSON.parse(JSON.stringify(data));
}

// ============================================
// 时间标尺
// ============================================

/**
 * 计算时间标尺刻度
 */
export function calculateRulerTicks(
    duration: number,
    containerWidth: number,
    pixelsPerSecond: number
): Array<{ time: number; label: string; major: boolean }> {
    const ticks: Array<{ time: number; label: string; major: boolean }> = [];

    // 根据缩放级别确定刻度间隔
    let interval: number;
    let majorInterval: number;

    if (pixelsPerSecond >= 100) {
        interval = 0.5;
        majorInterval = 1;
    } else if (pixelsPerSecond >= 50) {
        interval = 1;
        majorInterval = 5;
    } else if (pixelsPerSecond >= 20) {
        interval = 2;
        majorInterval = 10;
    } else if (pixelsPerSecond >= 10) {
        interval = 5;
        majorInterval = 30;
    } else {
        interval = 10;
        majorInterval = 60;
    }

    for (let t = 0; t <= duration; t += interval) {
        const major = t % majorInterval === 0;
        ticks.push({
            time: t,
            label: major ? formatRulerTime(t) : '',
            major,
        });
    }

    return ticks;
}
