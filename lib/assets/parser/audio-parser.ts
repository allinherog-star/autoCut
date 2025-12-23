/**
 * 音频素材解析器
 * Audio Asset Parser
 */

import type { AudioAsset, ParseResult } from '../types';
import { generateId } from './utils';

/**
 * 解析音频文件
 */
export async function parseAudioAsset(
    file: File,
    options?: { generateWaveform?: boolean }
): Promise<ParseResult<AudioAsset>> {
    try {
        const id = generateId();
        const url = URL.createObjectURL(file);

        // 提取音频元数据
        const metadata = await extractAudioMetadata(url);

        // 生成波形数据
        let waveformData: number[] | undefined;
        if (options?.generateWaveform !== false) {
            try {
                waveformData = await generateWaveformData(file);
            } catch (e) {
                console.warn('波形生成失败:', e);
            }
        }

        // 生成缩略图（音频波形预览）
        let thumbnailUrl: string | undefined;
        if (waveformData) {
            thumbnailUrl = generateWaveformThumbnail(waveformData);
        }

        const asset: AudioAsset = {
            id,
            type: 'audio',
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
            waveformData,
        };

        return { success: true, asset };
    } catch (error) {
        return {
            success: false,
            error: `音频解析失败: ${(error as Error).message}`,
        };
    }
}

/**
 * 提取音频元数据
 */
async function extractAudioMetadata(url: string): Promise<AudioAsset['metadata']> {
    return new Promise((resolve, reject) => {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';

        audio.onloadedmetadata = () => {
            resolve({
                duration: audio.duration,
                sampleRate: 48000, // 默认值
                channels: 2, // 默认立体声
            });
            audio.remove();
        };

        audio.onerror = () => {
            reject(new Error('无法加载音频元数据'));
            audio.remove();
        };

        audio.src = url;
    });
}

/**
 * 生成波形数据
 */
async function generateWaveformData(file: File, samples: number = 200): Promise<number[]> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0); // 取第一个声道

        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];

        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;

            let sum = 0;
            for (let j = start; j < end; j++) {
                sum += Math.abs(channelData[j]);
            }

            waveform.push(sum / blockSize);
        }

        // 归一化
        const max = Math.max(...waveform);
        return waveform.map(v => v / max);
    } finally {
        await audioContext.close();
    }
}

/**
 * 生成波形缩略图
 */
function generateWaveformThumbnail(waveformData: number[]): string {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 80;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
    }

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 波形
    const barWidth = canvas.width / waveformData.length;
    const centerY = canvas.height / 2;

    ctx.fillStyle = '#6366f1';

    waveformData.forEach((value, index) => {
        const barHeight = value * (canvas.height - 10);
        const x = index * barWidth;
        const y = centerY - barHeight / 2;

        ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    });

    const thumbnailUrl = canvas.toDataURL('image/png');
    canvas.remove();

    return thumbnailUrl;
}

/**
 * 检测节拍点
 * 简化版实现，实际项目中可使用更复杂的算法
 */
export async function detectBeatMarkers(
    file: File,
    sensitivity: number = 0.5
): Promise<number[]> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // 简化的节拍检测：基于能量变化
        const blockSize = Math.floor(sampleRate / 10); // 100ms 块
        const energies: number[] = [];

        for (let i = 0; i < channelData.length; i += blockSize) {
            let energy = 0;
            for (let j = 0; j < blockSize && i + j < channelData.length; j++) {
                energy += channelData[i + j] ** 2;
            }
            energies.push(energy / blockSize);
        }

        // 找到能量峰值
        const threshold = Math.max(...energies) * sensitivity;
        const beatMarkers: number[] = [];

        for (let i = 1; i < energies.length - 1; i++) {
            if (
                energies[i] > threshold &&
                energies[i] > energies[i - 1] &&
                energies[i] > energies[i + 1]
            ) {
                beatMarkers.push((i * blockSize) / sampleRate);
            }
        }

        return beatMarkers;
    } finally {
        await audioContext.close();
    }
}
