/**
 * 视频素材解析器
 * Video Asset Parser
 */

import type { VideoAsset, ParseResult } from '../types';
import { generateId } from './utils';

/**
 * 解析视频文件
 */
export async function parseVideoAsset(
    file: File,
    options?: { generateThumbnail?: boolean; generateWaveform?: boolean }
): Promise<ParseResult<VideoAsset>> {
    try {
        const id = generateId();
        const url = URL.createObjectURL(file);

        // 创建视频元素获取元数据
        const metadata = await extractVideoMetadata(url);

        // 生成缩略图
        let thumbnailUrl: string | undefined;
        if (options?.generateThumbnail !== false) {
            thumbnailUrl = await generateVideoThumbnail(url, metadata.duration / 2);
        }

        const asset: VideoAsset = {
            id,
            type: 'video',
            name: file.name.replace(/\.[^/.]+$/, ''),
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            status: 'ready',
            createdAt: new Date(),
            updatedAt: new Date(),
            url,
            thumbnailUrl,
            metadata,
        };

        return { success: true, asset };
    } catch (error) {
        return {
            success: false,
            error: `视频解析失败: ${(error as Error).message}`,
        };
    }
}

/**
 * 提取视频元数据
 */
async function extractVideoMetadata(url: string): Promise<VideoAsset['metadata']> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            resolve({
                width: video.videoWidth,
                height: video.videoHeight,
                duration: video.duration,
                frameRate: 30, // 默认值，实际可能需要更复杂的检测
            });
            video.remove();
        };

        video.onerror = () => {
            reject(new Error('无法加载视频元数据'));
            video.remove();
        };

        video.src = url;
    });
}

/**
 * 生成视频缩略图
 */
async function generateVideoThumbnail(
    url: string,
    seekTime: number = 0
): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.crossOrigin = 'anonymous';

        video.onloadeddata = () => {
            video.currentTime = Math.min(seekTime, video.duration);
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('无法创建 Canvas 上下文'));
                    return;
                }

                // 生成合适尺寸的缩略图
                const maxWidth = 320;
                const scale = maxWidth / video.videoWidth;
                canvas.width = maxWidth;
                canvas.height = video.videoHeight * scale;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(thumbnailUrl);

                video.remove();
                canvas.remove();
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => {
            reject(new Error('无法加载视频'));
            video.remove();
        };

        video.src = url;
    });
}

/**
 * 生成视频关键帧缩略图列表
 */
export async function generateKeyframeThumbnails(
    url: string,
    count: number = 10
): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.crossOrigin = 'anonymous';

            await new Promise<void>((res, rej) => {
                video.onloadedmetadata = () => res();
                video.onerror = () => rej(new Error('无法加载视频'));
                video.src = url;
            });

            const duration = video.duration;
            const interval = duration / count;
            const thumbnails: string[] = [];

            for (let i = 0; i < count; i++) {
                const time = i * interval;
                const thumbnail = await captureFrame(video, time);
                thumbnails.push(thumbnail);
            }

            video.remove();
            resolve(thumbnails);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 捕获指定时间的帧
 */
async function captureFrame(video: HTMLVideoElement, time: number): Promise<string> {
    return new Promise((resolve, reject) => {
        video.currentTime = time;

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('无法创建 Canvas 上下文'));
                return;
            }

            const maxWidth = 160;
            const scale = maxWidth / video.videoWidth;
            canvas.width = maxWidth;
            canvas.height = video.videoHeight * scale;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
            canvas.remove();
        };
    });
}
