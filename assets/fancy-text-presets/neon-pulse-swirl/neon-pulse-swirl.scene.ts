/**
 * 霓虹脉冲旋风 - Canvas 2D 场景配置
 * 
 * 统一舞台模型:
 * - Plate Layer: 涡旋底板 + 脉冲光环
 * - Impact FX Layer: 闪电 + 星芒粒子  
 * - Text Layer: 三层描边文字
 * - Emoji Layer: 装饰图标
 */

import type { CanvasFancyTextScene, CanvasRenderConfig, RenderLayer } from '@/lib/canvas-fancy-text/types'

// ============================================
// 颜色预设
// ============================================

export interface NeonPulseSwirlColors {
    gradient: string
    strokeColor: string
    outerStrokeColor: string
    glowColor: string
    swirlColor: string
    lightningColor: string
}

export const COLOR_PRESETS: Record<string, NeonPulseSwirlColors> = {
    'cyber-neon': {
        gradient: 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 50%, #FFFF00 100%)',
        strokeColor: '#FF00FF',
        outerStrokeColor: '#001144',
        glowColor: '#00FFFF',
        swirlColor: '#00FFFF',
        lightningColor: '#FFFF00',
    },
    'fire-storm': {
        gradient: 'linear-gradient(180deg, #FFFF00 0%, #FF8800 40%, #FF0044 100%)',
        strokeColor: '#880000',
        outerStrokeColor: '#220000',
        glowColor: '#FF4400',
        swirlColor: '#FF8800',
        lightningColor: '#FFFF00',
    },
    'aurora-pulse': {
        gradient: 'linear-gradient(135deg, #00FF88 0%, #00DDFF 50%, #8800FF 100%)',
        strokeColor: '#004466',
        outerStrokeColor: '#001122',
        glowColor: '#00FF88',
        swirlColor: '#00DDFF',
        lightningColor: '#00FF88',
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

export function createNeonPulseSwirlScene(options: CreateSceneOptions): CanvasFancyTextScene {
    const {
        text,
        colorPresetId = 'cyber-neon',
        width = 800,
        height = 400,
    } = options

    const colors = COLOR_PRESETS[colorPresetId] || COLOR_PRESETS['cyber-neon']
    const fontSize = 90
    const plateSize = Math.max(text.length * fontSize * 0.85, fontSize * 3.5)

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
            id: 'swirl-plate',
            type: 'swirl-plate',
            zIndex: 1,
            visible: true,
            opacity: 1,
            config: {
                size: plateSize,
                arms: 6,
                color: colors.swirlColor,
                glowIntensity: 0.8,
                rotationSpeed: 0,
            },
            animation: {
                duration: 0.6,
                keyframes: [
                    { time: 0, properties: { scale: 0, rotation: -180, alpha: 0 } },
                    { time: 0.6, properties: { scale: 1.2, rotation: 30, alpha: 1 }, easing: 'easeOut' },
                    { time: 1, properties: { scale: 1, rotation: 0, alpha: 1 } },
                ],
            },
        },
        {
            id: 'pulse-rings',
            type: 'pulse-rings',
            zIndex: 2,
            visible: true,
            opacity: 1,
            config: {
                count: 4,
                color: colors.glowColor,
                baseRadius: 50,
                maxRadius: plateSize * 0.6,
                strokeWidth: 3,
                delay: 0.15,
            },
        },

        // --- Impact FX Layer ---
        {
            id: 'lightning-bolts',
            type: 'lightning-bolts',
            zIndex: 3,
            visible: true,
            opacity: 1,
            config: {
                count: 10,
                color: colors.lightningColor,
                minLength: 40,
                maxLength: 100,
                segments: 5,
                spreadDistance: 200,
            },
        },
        {
            id: 'starburst-particles',
            type: 'starburst-particles',
            zIndex: 4,
            visible: true,
            opacity: 1,
            config: {
                count: 40,
                colors: [colors.glowColor, colors.lightningColor, colors.strokeColor, '#FFFFFF'],
                minSize: 3,
                maxSize: 10,
                spreadDistance: 250,
                starRatio: 0.5,
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
                    colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
                    angle: 135,
                },
                strokes: [
                    { color: colors.outerStrokeColor, width: 16 },
                    { color: colors.strokeColor, width: 8 },
                ],
                shadows: [
                    { color: colors.glowColor, blur: 25, offsetX: 0, offsetY: 0 },
                ],
                glow: {
                    color: colors.glowColor,
                    blur: 50,
                },
            },
            animation: {
                duration: 0.7,
                keyframes: [
                    { time: 0, properties: { scale: 0.2, rotation: -45, alpha: 0 } },
                    { time: 0.4, properties: { scale: 1.25, rotation: 10, alpha: 1 }, easing: 'spring' },
                    { time: 0.7, properties: { scale: 0.9, rotation: -5, alpha: 1 } },
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
                emojis: ['⚡', '💥', '✨', '🔥', '💫', '⭐', '⭐'],
                positions: [
                    { x: -200, y: -100, size: 48 },
                    { x: 200, y: -80, size: 52 },
                    { x: -180, y: 100, size: 45 },
                    { x: 180, y: 90, size: 50 },
                    { x: 0, y: -150, size: 42 },
                    { x: -240, y: 0, size: 40 },
                    { x: 240, y: 10, size: 38 },
                ],
            },
            animation: {
                duration: 0.5,
                keyframes: [
                    { time: 0, properties: { scale: 0, alpha: 0, y: 40 } },
                    { time: 0.6, properties: { scale: 1.4, alpha: 1, y: -5 }, easing: 'bounce' },
                    { time: 1, properties: { scale: 1, alpha: 1, y: 0 } },
                ],
            },
        },
    ]

    return {
        id: 'neon-pulse-swirl',
        name: '霓虹脉冲旋风',
        description: '震撼登场综艺花字效果',
        renderConfig,
        layers,
        duration: 1.4,
        loop: false,
    }
}

export default createNeonPulseSwirlScene
