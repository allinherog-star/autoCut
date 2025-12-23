/**
 * 图片素材解析器
 * Image Asset Parser
 */

import type { ImageAsset, ParseResult } from '../types';
import { generateId } from './utils';

/**
 * 解析图片文件
 */
export async function parseImageAsset(
    file: File,
    options?: { generateThumbnail?: boolean }
): Promise<ParseResult<ImageAsset>> {
    try {
        const id = generateId();
        const url = URL.createObjectURL(file);

        // 提取图片元数据
        const metadata = await extractImageMetadata(url);

        // 生成缩略图
        let thumbnailUrl: string | undefined;
        if (options?.generateThumbnail !== false) {
            thumbnailUrl = await generateImageThumbnail(url, metadata);
        }

        const asset: ImageAsset = {
            id,
            type: 'image',
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
            error: `图片解析失败: ${(error as Error).message}`,
        };
    }
}

/**
 * 提取图片元数据
 */
async function extractImageMetadata(url: string): Promise<ImageAsset['metadata']> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.onerror = () => {
            reject(new Error('无法加载图片'));
        };

        img.src = url;
    });
}

/**
 * 生成图片缩略图
 */
async function generateImageThumbnail(
    url: string,
    metadata: ImageAsset['metadata']
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('无法创建 Canvas 上下文'));
                return;
            }

            // 计算缩略图尺寸
            const maxSize = 320;
            let width = metadata.width;
            let height = metadata.height;

            if (width > height) {
                if (width > maxSize) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(thumbnailUrl);

            canvas.remove();
        };

        img.onerror = () => {
            reject(new Error('无法加载图片'));
        };

        img.src = url;
    });
}
