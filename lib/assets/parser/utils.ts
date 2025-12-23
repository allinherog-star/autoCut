/**
 * 工具函数
 */

/**
 * 生成唯一 ID
 */
export function generateId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 获取文件类型
 */
export function getAssetTypeFromMime(mimeType: string): 'video' | 'audio' | 'image' | null {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    return null;
}

/**
 * 验证文件类型
 */
export function isValidAssetFile(file: File): boolean {
    return getAssetTypeFromMime(file.type) !== null;
}

/**
 * 支持的文件扩展名
 */
export const SUPPORTED_EXTENSIONS = {
    video: ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
    audio: ['.mp3', '.wav', '.aac', '.ogg', '.m4a'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
};

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
}
