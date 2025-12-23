/**
 * 嘉宾名牌滑入 - Canvas 2D 场景配置
 * 
 * 统一舞台模型:
 * - Plate Layer: 名牌底板
 * - Impact FX Layer: 闪光粒子
 * - Text Layer: 滑入文字
 * - Emoji Layer: 装饰图标
 */

import type { CanvasFancyTextScene, CanvasRenderConfig, RenderLayer } from '@/lib/canvas-fancy-text/types'

export interface CreateSceneOptions {
    text: string
    colorPresetId?: string
    width?: number
    height?: number
}

export function createGuestNameSlideScene(options: CreateSceneOptions): CanvasFancyTextScene {
    const {
        text,
        width = 600,
        height = 250,
    } = options

    const fontSize = 64
    const plateWidth = Math.max(text.length * fontSize * 0.75, fontSize * 4)

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
            id: 'name-plate',
            type: 'shape',
            zIndex: 1,
            visible: true,
            opacity: 1,
            config: {
                type: 'speech-bubble',
                width: plateWidth,
                height: fontSize * 1.6,
                color: '#FF6B9D',
                gradient: {
                    type: 'linear',
                    colors: ['#FF6B9D', '#FF4D7D'],
                },
                strokeColor: '#FFFFFF',
                strokeWidth: 3,
                roughness: 0,
            },
            animation: {
                duration: 0.5,
                keyframes: [
                    { time: 0, properties: { x: -300, alpha: 0 } },
                    { time: 0.7, properties: { x: 10, alpha: 1 }, easing: 'easeOut' },
                    { time: 1, properties: { x: 0, alpha: 1 } },
                ],
            },
        },

        // --- Impact FX Layer ---
        {
            id: 'sparkle-particles',
            type: 'particles-front',
            zIndex: 2,
            visible: true,
            opacity: 1,
            config: {
                count: 15,
                shapes: ['circle'],
                colors: ['#FFFFFF', '#FFD4E5', '#FF6B9D'],
                minSize: 3,
                maxSize: 8,
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
                fontFamily: '"Zcool KuaiLe", "PingFang SC", sans-serif',
                fontSize,
                fontWeight: 900,
                fillColor: '#FFFFFF',
                strokes: [
                    { color: '#CC3366', width: 6 },
                ],
                shadows: [
                    { color: 'rgba(204, 51, 102, 0.4)', blur: 6, offsetX: 2, offsetY: 2 },
                ],
            },
            animation: {
                duration: 0.6,
                keyframes: [
                    { time: 0, properties: { x: -250, alpha: 0 } },
                    { time: 0.7, properties: { x: 8, alpha: 1 }, easing: 'easeOut' },
                    { time: 1, properties: { x: 0, alpha: 1 } },
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
                emojis: ['🌟', '✨'],
                positions: [
                    { x: -plateWidth / 2 - 30, y: 0, size: 32 },
                    { x: plateWidth / 2 + 30, y: 0, size: 32 },
                ],
            },
            animation: {
                duration: 0.4,
                keyframes: [
                    { time: 0, properties: { scale: 0, alpha: 0 } },
                    { time: 0.6, properties: { scale: 1.2, alpha: 1 }, easing: 'bounce' },
                    { time: 1, properties: { scale: 1, alpha: 1 } },
                ],
            },
        },
    ]

    return {
        id: 'guest-name-slide',
        name: '嘉宾名牌滑入',
        description: '综艺嘉宾名牌滑入效果',
        renderConfig,
        layers,
        duration: 1.0,
        loop: false,
    }
}

export default createGuestNameSlideScene
