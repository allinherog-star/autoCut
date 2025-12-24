/**
 * VEIR 时间轴转换器
 * 实现 VEIR Timeline <-> UI Timeline 双向转换
 */

import type { VEIRProject, VEIRTimeline, Track, Clip } from '@/lib/veir/types';
import type { TimelineData, TimelineTrack, TimelineClip } from './types';
import { calculateDuration, generateTrackId, generateClipId } from './utils';

// ============================================
// VEIR -> Timeline UI
// ============================================

/**
 * 将 VEIR 项目转换为时间轴 UI 数据
 */
export function convertVEIRToTimeline(project: VEIRProject): TimelineData {
    const tracks: TimelineTrack[] = project.timeline.tracks.map((track, index) => ({
        ...track,
        displayName: getDefaultTrackName(track.type, index),
        color: getTrackColor(track.type),
        collapsed: false,
        locked: false,
        muted: false,
        hidden: false,
    }));

    // 按 layer 排序
    tracks.sort((a, b) => a.layer - b.layer);

    const data: TimelineData = {
        tracks,
        duration: project.meta.duration,
    };

    return data;
}

/**
 * 获取默认轨道名称
 */
function getDefaultTrackName(type: Track['type'], index: number): string {
    const typeNames: Record<Track['type'], string> = {
        video: '视频',
        audio: '音频',
        text: '文字',
        subtitle: '字幕',
        pip: '画中画',
    };
    return `${typeNames[type]} ${index + 1}`;
}

/**
 * 获取轨道颜色
 */
function getTrackColor(type: Track['type']): string {
    const colors: Record<Track['type'], string> = {
        video: '#6366f1',
        audio: '#22c55e',
        text: '#f59e0b',
        subtitle: '#eab308',
        pip: '#ec4899',
    };
    return colors[type];
}

// ============================================
// Timeline UI -> VEIR
// ============================================

/**
 * 将时间轴 UI 数据转换为 VEIR Timeline
 */
export function convertTimelineToVEIR(data: TimelineData): VEIRTimeline {
    const tracks: Track[] = data.tracks.map(track => ({
        id: track.id,
        type: track.type,
        layer: track.layer,
        clips: track.clips.map(clip => ({
            id: clip.id,
            asset: clip.asset,
            time: { ...clip.time },
            expression: clip.expression ? { ...clip.expression } : undefined,
            behavior: clip.behavior ? { ...clip.behavior } : undefined,
        })),
    }));

    return { tracks };
}

/**
 * 将时间轴 UI 数据合并回 VEIR 项目
 */
export function mergeTimelineToVEIRProject(
    project: VEIRProject,
    timelineData: TimelineData
): VEIRProject {
    return {
        ...project,
        meta: {
            ...project.meta,
            duration: timelineData.duration,
        },
        timeline: convertTimelineToVEIR(timelineData),
    };
}

// ============================================
// 增量同步
// ============================================

/**
 * 时间轴变更类型
 */
export type TimelineChange =
    | { type: 'track:added'; track: Track }
    | { type: 'track:removed'; trackId: string }
    | { type: 'track:updated'; trackId: string; updates: Partial<Track> }
    | { type: 'clip:added'; trackId: string; clip: Clip }
    | { type: 'clip:removed'; trackId: string; clipId: string }
    | { type: 'clip:updated'; trackId: string; clipId: string; updates: Partial<Clip> }
    | { type: 'clip:moved'; clipId: string; fromTrackId: string; toTrackId: string; newTime: { start: number; end: number } };

/**
 * 应用变更到 VEIR 项目
 */
export function applyChangeToVEIR(
    project: VEIRProject,
    change: TimelineChange
): VEIRProject {
    const updatedProject = { ...project };
    const timeline = { ...updatedProject.timeline, tracks: [...updatedProject.timeline.tracks] };
    updatedProject.timeline = timeline;

    switch (change.type) {
        case 'track:added': {
            timeline.tracks = [...timeline.tracks, change.track];
            break;
        }

        case 'track:removed': {
            timeline.tracks = timeline.tracks.filter(t => t.id !== change.trackId);
            break;
        }

        case 'track:updated': {
            timeline.tracks = timeline.tracks.map(t =>
                t.id === change.trackId ? { ...t, ...change.updates } : t
            );
            break;
        }

        case 'clip:added': {
            timeline.tracks = timeline.tracks.map(t =>
                t.id === change.trackId
                    ? { ...t, clips: [...t.clips, change.clip] }
                    : t
            );
            break;
        }

        case 'clip:removed': {
            timeline.tracks = timeline.tracks.map(t =>
                t.id === change.trackId
                    ? { ...t, clips: t.clips.filter(c => c.id !== change.clipId) }
                    : t
            );
            break;
        }

        case 'clip:updated': {
            timeline.tracks = timeline.tracks.map(t =>
                t.id === change.trackId
                    ? {
                        ...t,
                        clips: t.clips.map(c =>
                            c.id === change.clipId ? { ...c, ...change.updates } : c
                        ),
                    }
                    : t
            );
            break;
        }

        case 'clip:moved': {
            // 从源轨道移除
            let movedClip: Clip | undefined;
            timeline.tracks = timeline.tracks.map(t => {
                if (t.id === change.fromTrackId) {
                    movedClip = t.clips.find(c => c.id === change.clipId);
                    return { ...t, clips: t.clips.filter(c => c.id !== change.clipId) };
                }
                return t;
            });

            // 添加到目标轨道
            if (movedClip) {
                const updatedClip = { ...movedClip, time: change.newTime };
                timeline.tracks = timeline.tracks.map(t =>
                    t.id === change.toTrackId
                        ? { ...t, clips: [...t.clips, updatedClip] }
                        : t
                );
            }
            break;
        }
    }

    return updatedProject;
}

// ============================================
// 从素材创建 Clip
// ============================================

/**
 * 从素材创建 VEIR Clip
 */
export function createClipFromAsset(
    assetId: string,
    startTime: number,
    duration: number,
    options?: {
        expression?: Clip['expression'];
        behavior?: Clip['behavior'];
    }
): Clip {
    return {
        id: generateClipId(),
        asset: assetId,
        time: {
            start: startTime,
            end: startTime + duration,
        },
        expression: options?.expression,
        behavior: options?.behavior,
    };
}
