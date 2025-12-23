/**
 * 时间轴状态管理
 * Timeline State Store (Zustand)
 */

import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Track, Clip, TrackType } from '@/lib/veir/types';
import type {
    TimelineState,
    TimelineData,
    TimelineAction,
    TimelineEvent,
    TimelineViewConfig,
    PlaybackState,
    SelectionState,
    DragState,
    HistoryEntry,
    DEFAULT_VIEW_CONFIG,
    DEFAULT_PLAYBACK_STATE,
    DEFAULT_SELECTION_STATE,
    DEFAULT_DRAG_STATE,
} from './types';
import {
    calculateDuration,
    findTrack,
    findClip,
    cloneTimelineData,
    createEmptyTrack,
    generateClipId,
    hasClipOverlap,
    findNearestGap,
} from './utils';

// ============================================
// Store 接口
// ============================================

export interface TimelineStore {
    // 状态
    data: TimelineData;
    view: TimelineViewConfig;
    playback: PlaybackState;
    selection: SelectionState;
    drag: DragState;
    history: HistoryEntry[];
    historyIndex: number;
    isDirty: boolean;

    // 事件监听器
    listeners: Set<(event: TimelineEvent) => void>;

    // 数据操作
    loadData: (data: TimelineData) => void;
    reset: () => void;
    setDuration: (duration: number) => void;

    // 轨道操作
    addTrack: (type: TrackType, index?: number) => Track;
    removeTrack: (trackId: string) => void;
    updateTrack: (trackId: string, updates: Partial<Track>) => void;
    reorderTracks: (fromIndex: number, toIndex: number) => void;

    // 片段操作
    addClip: (trackId: string, clip: Clip) => void;
    removeClip: (trackId: string, clipId: string) => void;
    updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void;
    moveClip: (clipId: string, targetTrackId: string, newStart: number) => void;
    splitClip: (trackId: string, clipId: string, splitTime: number) => void;
    trimClip: (trackId: string, clipId: string, edge: 'left' | 'right', newTime: number) => void;

    // 播放控制
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setPlaybackRate: (rate: number) => void;
    _tick: (deltaTime: number) => void;

    // 选择操作
    selectTrack: (trackId: string, additive?: boolean) => void;
    selectClip: (clipId: string, additive?: boolean) => void;
    selectTimeRange: (start: number, end: number) => void;
    clearSelection: () => void;

    // 视图操作
    zoomIn: () => void;
    zoomOut: () => void;
    setZoom: (pixelsPerSecond: number) => void;
    fitToView: (containerWidth: number) => void;

    // 拖拽操作
    startDrag: (type: DragState['dragType'], clipId?: string, startX?: number, startTime?: number) => void;
    updateDrag: (currentX: number) => void;
    endDrag: () => void;

    // 历史操作
    undo: () => void;
    redo: () => void;
    saveHistory: (description: string) => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // 事件系统
    subscribe: (listener: (event: TimelineEvent) => void) => () => void;
    emit: (event: TimelineEvent) => void;
}

// ============================================
// 默认状态
// ============================================

const DEFAULT_DATA: TimelineData = {
    tracks: [],
    duration: 60,
};

const DEFAULT_VIEW: TimelineViewConfig = {
    pixelsPerSecond: 50,
    trackHeight: 60,
    minZoom: 5,
    maxZoom: 200,
    rulerHeight: 32,
    sidebarWidth: 180,
};

const DEFAULT_PLAYBACK: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 60,
    playbackRate: 1,
    loop: false,
};

const DEFAULT_SELECTION: SelectionState = {
    selectedTrackIds: [],
    selectedClipIds: [],
};

const DEFAULT_DRAG: DragState = {
    isDragging: false,
};

// ============================================
// Store 实现
// ============================================

export const createTimelineStore = () => create<TimelineStore>()(
    immer((set, get) => ({
        // 初始状态
        data: DEFAULT_DATA,
        view: DEFAULT_VIEW,
        playback: DEFAULT_PLAYBACK,
        selection: DEFAULT_SELECTION,
        drag: DEFAULT_DRAG,
        history: [],
        historyIndex: -1,
        isDirty: false,
        listeners: new Set(),

        // ============================================
        // 数据操作
        // ============================================

        loadData: (data) => {
            set((state) => {
                state.data = data;
                state.playback.duration = data.duration;
                state.isDirty = false;
                state.history = [];
                state.historyIndex = -1;
            });
            get().emit({ type: 'data:loaded' });
        },

        reset: () => {
            set((state) => {
                state.data = DEFAULT_DATA;
                state.playback = DEFAULT_PLAYBACK;
                state.selection = DEFAULT_SELECTION;
                state.drag = DEFAULT_DRAG;
                state.history = [];
                state.historyIndex = -1;
                state.isDirty = false;
            });
        },

        setDuration: (duration) => {
            set((state) => {
                state.data.duration = duration;
                state.playback.duration = duration;
                state.isDirty = true;
            });
        },

        // ============================================
        // 轨道操作
        // ============================================

        addTrack: (type, index) => {
            const layer = get().data.tracks.length;
            const track = createEmptyTrack(type, layer);

            set((state) => {
                if (index !== undefined) {
                    state.data.tracks.splice(index, 0, track);
                } else {
                    state.data.tracks.push(track);
                }
                state.isDirty = true;
            });

            get().emit({ type: 'track:added', track });
            return track;
        },

        removeTrack: (trackId) => {
            set((state) => {
                state.data.tracks = state.data.tracks.filter(t => t.id !== trackId);
                state.selection.selectedTrackIds = state.selection.selectedTrackIds.filter(id => id !== trackId);
                state.isDirty = true;
            });
            get().emit({ type: 'track:removed', trackId });
        },

        updateTrack: (trackId, updates) => {
            set((state) => {
                const track = state.data.tracks.find(t => t.id === trackId);
                if (track) {
                    Object.assign(track, updates);
                    state.isDirty = true;
                }
            });
        },

        reorderTracks: (fromIndex, toIndex) => {
            set((state) => {
                const [track] = state.data.tracks.splice(fromIndex, 1);
                state.data.tracks.splice(toIndex, 0, track);
                // 更新 layer
                state.data.tracks.forEach((t, i) => {
                    t.layer = i;
                });
                state.isDirty = true;
            });
        },

        // ============================================
        // 片段操作
        // ============================================

        addClip: (trackId, clip) => {
            set((state) => {
                const track = state.data.tracks.find(t => t.id === trackId);
                if (track) {
                    track.clips.push(clip);
                    state.isDirty = true;
                }
            });
            get().emit({ type: 'clip:added', trackId, clip });
        },

        removeClip: (trackId, clipId) => {
            set((state) => {
                const track = state.data.tracks.find(t => t.id === trackId);
                if (track) {
                    track.clips = track.clips.filter(c => c.id !== clipId);
                    state.selection.selectedClipIds = state.selection.selectedClipIds.filter(id => id !== clipId);
                    state.isDirty = true;
                }
            });
            get().emit({ type: 'clip:removed', trackId, clipId });
        },

        updateClip: (trackId, clipId, updates) => {
            set((state) => {
                const track = state.data.tracks.find(t => t.id === trackId);
                if (track) {
                    const clip = track.clips.find(c => c.id === clipId);
                    if (clip) {
                        Object.assign(clip, updates);
                        state.isDirty = true;
                    }
                }
            });
            get().emit({ type: 'clip:updated', trackId, clipId, updates });
        },

        moveClip: (clipId, targetTrackId, newStart) => {
            const { data } = get();
            const result = findClip(data, clipId);
            if (!result) return;

            const { track: sourceTrack, clip } = result;
            const duration = clip.time.end - clip.time.start;

            set((state) => {
                // 从源轨道移除
                const srcTrack = state.data.tracks.find(t => t.id === sourceTrack.id);
                if (srcTrack) {
                    srcTrack.clips = srcTrack.clips.filter(c => c.id !== clipId);
                }

                // 添加到目标轨道
                const dstTrack = state.data.tracks.find(t => t.id === targetTrackId);
                if (dstTrack) {
                    const movedClip = {
                        ...clip,
                        time: { start: newStart, end: newStart + duration },
                    };
                    dstTrack.clips.push(movedClip);
                }

                state.isDirty = true;
            });

            get().emit({
                type: 'clip:moved',
                clipId,
                fromTrackId: sourceTrack.id,
                toTrackId: targetTrackId,
            });
        },

        splitClip: (trackId, clipId, splitTime) => {
            set((state) => {
                const track = state.data.tracks.find(t => t.id === trackId);
                if (!track) return;

                const clipIndex = track.clips.findIndex(c => c.id === clipId);
                if (clipIndex === -1) return;

                const clip = track.clips[clipIndex];
                if (splitTime <= clip.time.start || splitTime >= clip.time.end) return;

                // 创建两个新片段
                const leftClip: Clip = {
                    ...clip,
                    id: generateClipId(),
                    time: { start: clip.time.start, end: splitTime },
                };

                const rightClip: Clip = {
                    ...clip,
                    id: generateClipId(),
                    time: { start: splitTime, end: clip.time.end },
                };

                // 替换原片段
                track.clips.splice(clipIndex, 1, leftClip, rightClip);
                state.isDirty = true;
            });
        },

        trimClip: (trackId, clipId, edge, newTime) => {
            set((state) => {
                const track = state.data.tracks.find(t => t.id === trackId);
                if (!track) return;

                const clip = track.clips.find(c => c.id === clipId);
                if (!clip) return;

                if (edge === 'left') {
                    clip.time.start = Math.max(0, Math.min(newTime, clip.time.end - 0.1));
                } else {
                    clip.time.end = Math.max(clip.time.start + 0.1, newTime);
                }

                state.isDirty = true;
            });
        },

        // ============================================
        // 播放控制
        // ============================================

        play: () => {
            set((state) => {
                state.playback.isPlaying = true;
            });
            get().emit({ type: 'playback:started' });
        },

        pause: () => {
            set((state) => {
                state.playback.isPlaying = false;
            });
            get().emit({ type: 'playback:paused' });
        },

        togglePlay: () => {
            const { playback } = get();
            if (playback.isPlaying) {
                get().pause();
            } else {
                get().play();
            }
        },

        seek: (time) => {
            set((state) => {
                state.playback.currentTime = Math.max(0, Math.min(time, state.playback.duration));
            });
            get().emit({ type: 'playback:seeked', time: get().playback.currentTime });
        },

        setPlaybackRate: (rate) => {
            set((state) => {
                state.playback.playbackRate = rate;
            });
        },

        _tick: (deltaTime) => {
            const { playback } = get();
            if (!playback.isPlaying) return;

            const newTime = playback.currentTime + deltaTime * playback.playbackRate;

            if (newTime >= playback.duration) {
                if (playback.loop) {
                    get().seek(0);
                } else {
                    get().seek(playback.duration);
                    get().pause();
                }
            } else {
                get().seek(newTime);
            }
        },

        // ============================================
        // 选择操作
        // ============================================

        selectTrack: (trackId, additive = false) => {
            set((state) => {
                if (additive) {
                    if (state.selection.selectedTrackIds.includes(trackId)) {
                        state.selection.selectedTrackIds = state.selection.selectedTrackIds.filter(id => id !== trackId);
                    } else {
                        state.selection.selectedTrackIds.push(trackId);
                    }
                } else {
                    state.selection.selectedTrackIds = [trackId];
                    state.selection.selectedClipIds = [];
                }
            });
            get().emit({ type: 'selection:changed', selection: get().selection });
        },

        selectClip: (clipId, additive = false) => {
            set((state) => {
                if (additive) {
                    if (state.selection.selectedClipIds.includes(clipId)) {
                        state.selection.selectedClipIds = state.selection.selectedClipIds.filter(id => id !== clipId);
                    } else {
                        state.selection.selectedClipIds.push(clipId);
                    }
                } else {
                    state.selection.selectedClipIds = [clipId];
                    state.selection.selectedTrackIds = [];
                }
            });
            get().emit({ type: 'selection:changed', selection: get().selection });
        },

        selectTimeRange: (start, end) => {
            set((state) => {
                state.selection.timeSelection = { start, end };
            });
        },

        clearSelection: () => {
            set((state) => {
                state.selection = DEFAULT_SELECTION;
            });
            get().emit({ type: 'selection:changed', selection: get().selection });
        },

        // ============================================
        // 视图操作
        // ============================================

        zoomIn: () => {
            set((state) => {
                state.view.pixelsPerSecond = Math.min(
                    state.view.pixelsPerSecond * 1.25,
                    state.view.maxZoom
                );
            });
        },

        zoomOut: () => {
            set((state) => {
                state.view.pixelsPerSecond = Math.max(
                    state.view.pixelsPerSecond / 1.25,
                    state.view.minZoom
                );
            });
        },

        setZoom: (pixelsPerSecond) => {
            set((state) => {
                state.view.pixelsPerSecond = Math.max(
                    state.view.minZoom,
                    Math.min(pixelsPerSecond, state.view.maxZoom)
                );
            });
        },

        fitToView: (containerWidth) => {
            const { data, view } = get();
            const availableWidth = containerWidth - view.sidebarWidth;
            const newZoom = availableWidth / data.duration;
            get().setZoom(newZoom);
        },

        // ============================================
        // 拖拽操作
        // ============================================

        startDrag: (type, clipId, startX, startTime) => {
            set((state) => {
                state.drag = {
                    isDragging: true,
                    dragType: type,
                    dragClipId: clipId,
                    dragStartX: startX,
                    dragStartTime: startTime,
                };
            });
        },

        updateDrag: (currentX) => {
            // 由组件处理具体逻辑
        },

        endDrag: () => {
            set((state) => {
                state.drag = DEFAULT_DRAG;
            });
        },

        // ============================================
        // 历史操作
        // ============================================

        saveHistory: (description) => {
            const { data, history, historyIndex } = get();

            set((state) => {
                // 移除当前位置之后的历史
                state.history = state.history.slice(0, historyIndex + 1);

                // 添加新历史记录
                const entry: HistoryEntry = {
                    description,
                    timestamp: new Date(),
                    beforeState: cloneTimelineData(data),
                    afterState: cloneTimelineData(data),
                };

                state.history.push(entry);
                state.historyIndex = state.history.length - 1;

                // 限制历史记录数量
                if (state.history.length > 50) {
                    state.history = state.history.slice(-50);
                    state.historyIndex = state.history.length - 1;
                }
            });
        },

        undo: () => {
            const { history, historyIndex } = get();
            if (historyIndex <= 0) return;

            set((state) => {
                const entry = state.history[state.historyIndex - 1];
                if (entry) {
                    state.data = cloneTimelineData(entry.beforeState);
                    state.historyIndex--;
                }
            });
        },

        redo: () => {
            const { history, historyIndex } = get();
            if (historyIndex >= history.length - 1) return;

            set((state) => {
                const entry = state.history[state.historyIndex + 1];
                if (entry) {
                    state.data = cloneTimelineData(entry.afterState);
                    state.historyIndex++;
                }
            });
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        // ============================================
        // 事件系统
        // ============================================

        subscribe: (listener) => {
            get().listeners.add(listener);
            return () => get().listeners.delete(listener);
        },

        emit: (event) => {
            get().listeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    console.error('Timeline event listener error:', error);
                }
            });
        },
    }))
);

// 默认 store 实例
export const useTimelineStore = createTimelineStore();
