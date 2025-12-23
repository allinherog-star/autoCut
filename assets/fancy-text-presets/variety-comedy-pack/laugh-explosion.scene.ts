/**
 * 笑场爆炸特效 - Canvas 2D 场景配置
 * 
 * 统一舞台模型:
 * - Plate Layer: 爆炸底板
 * - Impact FX Layer: 爆炸粒子 + 速度线
 * - Text Layer: 弹性缩放文字
 * - Emoji Layer: 笑脸表情
 */

import type { CanvasFancyTextScene, CanvasRenderConfig, RenderLayer } from '@/lib/canvas-fancy-text/types'

export interface CreateSceneOptions {
    text: string
    colorPresetId?: string
    width?: number
    height?: number
}

export function createLaughExplosionScene(options: CreateSceneOptions): CanvasFancyTextScene {
    const {
        text,
        width = 800,
        height = 400,
    } = options

    const fontSize = 85
    const plateSize = Math.max(text.length * fontSize * 0.8, fontSize * 3.5)

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
            id: 'explosion-plate',
            type: 'shape',
            zIndex: 1,
            visible: true,
            opacity: 1,
            config: {
                type: 'explosion',
                width: plateSize,
                height: plateSize * 0.85,
                color: '#FF4444',
                gradient: {
                    type: 'radial',
                    colors: ['#FF6666', '#FF2222'],
                },
                strokeColor: '#FFFFFF',
                strokeWidth: 5,
                roughness: 0.4,
            },
            animation: {
                duration: 0.35,
                keyframes: [
                    { time: 0, properties: { scale: 0, alpha: 0 } },
                    { time: 0.5, properties: { scale: 1.2, alpha: 1 }, easing: 'bounce' },
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
            opacity: 0.7,
            config: {
                rayCount: 16,
                color1: '#FFFFFF',
                color2: '#FF6666',
                rotation: 0,
                opacity: 0.7,
            },
            animation: {
                duration: 0.4,
                keyframes: [
                    { time: 0, properties: { scale: 0.3, alpha: 0 } },
                    { time: 0.4, properties: { scale: 1.5, alpha: 0.9 }, easing: 'easeOut' },
                    { time: 1, properties: { scale: 2, alpha: 0 } },
                ],
            },
        },
        {
            id: 'explosion-particles',
            type: 'particles-front',
            zIndex: 3,
            visible: true,
            opacity: 1,
            config: {
                count: 40,
                shapes: ['circle', 'rect'],
                colors: ['#FF4444', '#FFAA00', '#FFFFFF', '#FF6B9D'],
                minSize: 5,
                maxSize: 18,
            },
        },
        {
            id: 'speed-lines',
            type: 'speed-lines',
            zIndex: 4,
            visible: true,
            opacity: 0.6,
            config: {
                count: 20,
                colors: ['#FFFFFF', '#FF6666'],
                minLength: 60,
                maxLength: 150,
                minWidth: 2,
                maxWidth: 4,
                speed: 4,
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
                fillGradient: {
                    type: 'linear',
                    colors: ['#FFFFFF', '#FFEEEE'],
                    angle: 180,
                },
                strokes: [
                    { color: '#880000', width: 10 },
                    { color: '#FFFFFF', width: 5 },
                ],
                shadows: [
                    { color: 'rgba(136, 0, 0, 0.5)', blur: 10, offsetX: 3, offsetY: 3 },
                ],
            },
            animation: {
                duration: 0.5,
                keyframes: [
                    { time: 0, properties: { scale: 0, rotation: -15, alpha: 0 } },
                    { time: 0.4, properties: { scale: 1.25, rotation: 5, alpha: 1 }, easing: 'spring' },
                    { time: 0.7, properties: { scale: 0.95, rotation: -2, alpha: 1 } },
                    { time: 1, properties: { scale: 1, rotation: 0, alpha: 1 } },
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
                emojis: ['🤣', '😂', '💥', '🔥', '⚡'],
                positions: [
                    { x: -plateSize / 2 - 20, y: -60, size: 52 },
                    { x: plateSize / 2 + 20, y: -50, size: 48 },
                    { x: -plateSize / 2, y: 60, size: 44 },
                    { x: plateSize / 2, y: 50, size: 46 },
                    { x: 0, y: -plateSize / 2, size: 40 },
                ],
            },
            animation: {
                duration: 0.4,
                keyframes: [
                    { time: 0, properties: { scale: 0, alpha: 0, y: 20 } },
                    { time: 0.6, properties: { scale: 1.3, alpha: 1, y: -5 }, easing: 'bounce' },
                    { time: 1, properties: { scale: 1, alpha: 1, y: 0 } },
                ],
            },
        },
    ]

    return {
        id: 'laugh-explosion',
        name: '笑场爆炸特效',
        description: '综艺笑场爆炸效果',
        renderConfig,
        layers,
        duration: 1.5,
        loop: false,
    }
}

export default createLaughExplosionScene
