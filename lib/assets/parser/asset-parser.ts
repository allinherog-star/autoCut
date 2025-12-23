/**
 * 统一素材解析器
 * Universal Asset Parser
 */

import type { Asset, ParseResult, UploadOptions } from '../types';
import { parseVideoAsset } from './video-parser';
import { parseAudioAsset } from './audio-parser';
import { parseImageAsset } from './image-parser';
import { getAssetTypeFromMime, isValidAssetFile } from './utils';

/**
 * 解析任意素材文件
 */
export async function parseAsset(
    file: File,
    options?: UploadOptions
): Promise<ParseResult> {
    // 验证文件类型
    if (!isValidAssetFile(file)) {
        return {
            success: false,
            error: `不支持的文件类型: ${file.type}`,
        };
    }

    const assetType = getAssetTypeFromMime(file.type);

    switch (assetType) {
        case 'video':
            return parseVideoAsset(file, {
                generateThumbnail: options?.generateThumbnail,
                generateWaveform: options?.generateWaveform,
            });

        case 'audio':
            return parseAudioAsset(file, {
                generateWaveform: options?.generateWaveform,
            });

        case 'image':
            return parseImageAsset(file, {
                generateThumbnail: options?.generateThumbnail,
            });

        default:
            return {
                success: false,
                error: `未知的素材类型: ${file.type}`,
            };
    }
}

/**
 * 批量解析素材
 */
export async function parseAssets(
    files: File[],
    options?: UploadOptions & {
        onProgress?: (current: number, total: number, asset?: Asset) => void;
    }
): Promise<ParseResult[]> {
    const results: ParseResult[] = [];

    for (let i = 0; i < files.length; i++) {
        const result = await parseAsset(files[i], options);
        results.push(result);

        options?.onProgress?.(i + 1, files.length, result.asset);
    }

    return results;
}
