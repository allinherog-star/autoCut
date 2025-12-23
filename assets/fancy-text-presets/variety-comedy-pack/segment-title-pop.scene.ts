/**
 * 环节标题弹跳 - Canvas 2D 场景配置
 * 
 * 统一舞台模型:
 * - Plate Layer: 圆角矩形底板
 * - Impact FX Layer: 弹跳粒子
 * - Text Layer: 弹跳文字
 * - Emoji Layer: 装饰图标
 */

import type { CanvasFancyTextScene, CanvasRenderConfig, RenderLayer } from '@/lib/canvas-fancy-text/types'

export interface CreateSceneOptions {
    text: string
    colorPresetId?: string
    width?: number
    height?: number
}

export function createSegmentTitlePopScene(options: CreateSceneOptions): CanvasFancyTextScene {
    const {
        text,
        width = 700,
        height = 300,
    } = options

    const fontSize = 72
    const plateWidth = Math.max(text.length * fontSize * 0.7, fontSize * 3)

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
            id: 'plate',
            type: 'shape',
            zIndex: 1,
            visible: true,
            opacity: 1,
            config: {
                type: 'speech-bubble',
                width: plateWidth,
                height: fontSize * 1.8,
                color: '#7C3AED',
                gradient: {
                    type: 'linear',
                    colors: ['#7C3AED', '#5B21B6'],
                },
                strokeColor: '#FFFFFF',
                strokeWidth: 4,
                roughness: 0.1,
            },
            animation: {
                duration: 0.5,
                keyframes: [
                    { time: 0, properties: { scale: 0, y: 80, alpha: 0 } },
                    { time: 0.5, properties: { scale: 1.1, y: -10, alpha: 1 }, easing: 'bounce' },
                    { time: 1, properties: { scale: 1, y: 0, alpha: 1 } },
                ],
            },
        },

        // --- Impact FX Layer ---
        {
            id: 'particles',
            type: 'particles-front',
            zIndex: 2,
            visible: true,
            opacity: 1,
            config: {
                count: 20,
                shapes: ['circle'],
                colors: ['#7C3AED', '#A78BFA', '#FFFFFF'],
                minSize: 4,
                maxSize: 12,
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
                    { color: '#5B21B6', width: 8 },
                    { color: '#FFFFFF', width: 4 },
                ],
                shadows: [
                    { color: 'rgba(91, 33, 182, 0.4)', blur: 8, offsetX: 2, offsetY: 2 },
                ],
            },
            animation: {
                duration: 0.6,
                keyframes: [
                    { time: 0, properties: { scale: 0, y: 60, alpha: 0 } },
                    { time: 0.5, properties: { scale: 1.15, y: -8, alpha: 1 }, easing: 'bounce' },
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
                emojis: ['✨', '🎉', '⭐'],
                positions: [
                    { x: -plateWidth / 2 - 40, y: -30, size: 36 },
                    { x: plateWidth / 2 + 40, y: -30, size: 36 },
                    { x: 0, y: -fontSize - 20, size: 32 },
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
        id: 'segment-title-pop',
        name: '环节标题弹跳',
        description: '综艺环节标题弹跳入场效果',
        renderConfig,
        layers,
        duration: 1.2,
        loop: false,
    }
}

export default createSegmentTitlePopScene
