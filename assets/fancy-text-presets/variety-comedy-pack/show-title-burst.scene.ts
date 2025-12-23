/**
 * 节目主标题爆炸 - Canvas 2D 场景配置
 * 
 * 统一舞台模型:
 * - Plate Layer: 漫画爆炸底板
 * - Impact FX Layer: 闪光 + 速度线 + 彩色粒子
 * - Text Layer: 逐字弹入动画
 * - Emoji Layer: 笑脸/星星装饰
 */

import type { CanvasFancyTextScene, CanvasRenderConfig, RenderLayer } from '@/lib/canvas-fancy-text/types'

// ============================================
// 颜色预设
// ============================================

export interface ShowTitleBurstColors {
    gradient: string
    strokeColor: string
    outerStrokeColor: string
    plateColor: string
    glowColor: string
}

export const COLOR_PRESETS: Record<string, ShowTitleBurstColors> = {
    'sunshine-laugh': {
        gradient: 'linear-gradient(180deg, #FFE135 0%, #FF8C00 50%, #FF6B9D 100%)',
        strokeColor: '#FFFFFF',
        outerStrokeColor: '#2D1B4E',
        plateColor: '#FFE135',
        glowColor: '#FFE135',
    },
    'candy-pop': {
        gradient: 'linear-gradient(135deg, #FF6B9D 0%, #7C3AED 50%, #00D4FF 100%)',
        strokeColor: '#FFFFFF',
        outerStrokeColor: '#2D1B4E',
        plateColor: '#FF6B9D',
        glowColor: '#FF6B9D',
    },
    'electric-joy': {
        gradient: 'linear-gradient(180deg, #00D4FF 0%, #7C3AED 100%)',
        strokeColor: '#FFFFFF',
        outerStrokeColor: '#1A0A2E',
        plateColor: '#00D4FF',
        glowColor: '#00D4FF',
    },
}

// ============================================
// 场景生成函数
// ============================================

export interface CreateSceneOptions {
    text: string
    colorPresetId?: string
    width?: number
    height?: number
}

export function createShowTitleBurstScene(options: CreateSceneOptions): CanvasFancyTextScene {
    const {
        text,
        colorPresetId = 'sunshine-laugh',
        width = 900,
        height = 450,
    } = options

    const colors = COLOR_PRESETS[colorPresetId] || COLOR_PRESETS['sunshine-laugh']
    const fontSize = 95
    const plateSize = Math.max(text.length * fontSize * 0.75, fontSize * 3.5)

    const renderConfig: CanvasRenderConfig = {
        width,
        height,
        fps: 30,
        devicePixelRatio: 2,
        antialias: true,
        transparent: true,
    }

    const layers: RenderLayer[] = [
        // --- Plate Layer ---
        {
            id: 'comic-burst-plate',
            type: 'shape',
            zIndex: 1,
            visible: true,
            opacity: 1,
            config: {
                type: 'explosion',
                width: plateSize,
                height: plateSize * 0.8,
                color: colors.plateColor,
                gradient: {
                    type: 'radial',
                    colors: [colors.plateColor, `${colors.plateColor}CC`],
                },
                strokeColor: colors.outerStrokeColor,
                strokeWidth: 4,
                roughness: 0.3,
            },
            animation: {
                duration: 0.4,
                keyframes: [
                    { time: 0, properties: { scale: 0, alpha: 0 } },
                    { time: 0.5, properties: { scale: 1.15, alpha: 1 }, easing: 'bounce' },
                    { time: 1, properties: { scale: 1, alpha: 1 } },
                ],
            },
        },

        // --- Impact FX Layer ---
        {
            id: 'radial-burst',
            type: 'radial-burst',
            zIndex: 2,
            visible: true,
            opacity: 0.6,
            config: {
                rayCount: 24,
                color1: '#FFFFFF',
                color2: colors.plateColor,
                rotation: 0,
                opacity: 0.6,
            },
            animation: {
                duration: 0.3,
                keyframes: [
                    { time: 0, properties: { scale: 0.5, alpha: 0 } },
                    { time: 0.5, properties: { scale: 1.5, alpha: 0.8 }, easing: 'easeOut' },
                    { time: 1, properties: { scale: 2, alpha: 0 } },
                ],
            },
        },
        {
            id: 'speed-lines',
            type: 'speed-lines',
            zIndex: 3,
            visible: true,
            opacity: 0.7,
            config: {
                count: 24,
                colors: ['#FFFFFF', colors.plateColor],
                minLength: 80,
                maxLength: 180,
                minWidth: 2,
                maxWidth: 5,
                speed: 3,
            },
        },
        {
            id: 'colorful-particles',
            type: 'particles-front',
            zIndex: 4,
            visible: true,
            opacity: 1,
            config: {
                count: 35,
                shapes: ['circle', 'rect'],
                colors: [colors.plateColor, '#FF6B9D', '#00D4FF', '#7C3AED'],
                minSize: 6,
                maxSize: 16,
            },
        },

        // --- Text Layer ---
        {
            id: 'main-text',
            type: 'text',
            zIndex: 10,
            visible: true,
            opacity: 1,
            config: {
                text,
                fontFamily: '"Zcool KuaiLe", "Zcool QingKe HuangYou", "PingFang SC", sans-serif',
                fontSize,
                fontWeight: 900,
                fillColor: '#FFFFFF',
                fillGradient: {
                    type: 'linear',
                    colors: ['#FFE135', '#FF8C00', '#FF6B9D'],
                    angle: 180,
                },
                strokes: [
                    { color: colors.outerStrokeColor, width: 12 },
                    { color: colors.strokeColor, width: 6 },
                ],
                shadows: [
                    { color: colors.outerStrokeColor, blur: 0, offsetX: 3, offsetY: 3 },
                ],
            },
            animation: {
                duration: 0.6,
                keyframes: [
                    { time: 0, properties: { scale: 0, y: 50, alpha: 0 } },
                    { time: 0.4, properties: { scale: 1.1, y: -10, alpha: 1 }, easing: 'bounce' },
                    { time: 0.7, properties: { scale: 0.95, y: 5, alpha: 1 } },
                    { time: 1, properties: { scale: 1, y: 0, alpha: 1 } },
                ],
            },
        },

        // --- Emoji Layer ---
        {
            id: 'emoji-decoration',
            type: 'emoji-decoration',
            zIndex: 15,
            visible: true,
            opacity: 1,
            config: {
                emojis: ['😂', '🤣', '✨', '⭐', '💥', '🌟'],
                positions: [
                    { x: -200, y: -90, size: 48 },
                    { x: 200, y: -70, size: 52 },
                    { x: -180, y: 90, size: 44 },
                    { x: 180, y: 80, size: 46 },
                    { x: 0, y: -120, size: 42 },
                    { x: -220, y: 20, size: 40 },
                ],
            },
            animation: {
                duration: 0.5,
                keyframes: [
                    { time: 0, properties: { scale: 0, alpha: 0, y: 30 } },
                    { time: 0.6, properties: { scale: 1.3, alpha: 1, y: -8 }, easing: 'bounce' },
                    { time: 1, properties: { scale: 1, alpha: 1, y: 0 } },
                ],
            },
        },
    ]

    return {
        id: 'show-title-burst',
        name: '节目主标题爆炸',
        description: '《一见你就笑》风格节目主标题特效',
        renderConfig,
        layers,
        duration: 1.8,
        loop: false,
    }
}

export default createShowTitleBurstScene
