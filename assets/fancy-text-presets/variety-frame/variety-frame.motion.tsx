/**
 * 综艺边框花字 - React 组件动效
 * 
 * 经典综艺节目边框花字效果，包含：
 * - 红色矩形边框
 * - 左侧太阳装饰（带笑脸）
 * - 多层描边文字（阴影 + 外描边 + 内描边 + 渐变填充）
 * - 底部装饰线和圆点
 * - 弹跳入场动画
 */

// 直接从组件库导出，保持单一源
export { VarietyFrameText, VarietyFrameText as default } from '@/components/emotion-text-effect'

// 类型定义导出
export interface VarietyFrameTextProps {
    /** 显示的文字内容 */
    text: string
    /** 缩放比例 (默认: 1) */
    scale?: number
    /** 边框颜色 (默认: #CC0000) */
    frameColor?: string
    /** 太阳装饰颜色 (默认: #FFCC00) */
    sunColor?: string
    /** 文字渐变 (默认: 白到蓝紫渐变) */
    textGradient?: string
    /** 内描边颜色 (默认: #6633CC) */
    strokeColor?: string
    /** 外描边颜色 (默认: #CC0000) */
    outerStrokeColor?: string
    /** 额外的 CSS 类名 */
    className?: string
}

// 配色预设类型
export interface ColorPreset {
    id: string
    name: string
    frameColor: string
    sunColor: string
    textGradient: string
    strokeColor: string
    outerStrokeColor: string
}

// 配色预设列表
export const COLOR_PRESETS: ColorPreset[] = [
    {
        id: 'classic-red',
        name: '经典红框（原版）',
        frameColor: '#CC0000',
        sunColor: '#FFCC00',
        textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #CCCCFF 30%, #9999FF 50%, #6666CC 70%, #333399 100%)',
        strokeColor: '#6633CC',
        outerStrokeColor: '#CC0000',
    },
    {
        id: 'golden-luxury',
        name: '金色奢华',
        frameColor: '#CC9900',
        sunColor: '#FFFF00',
        textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFFF99 30%, #FFCC00 60%, #FF9900 100%)',
        strokeColor: '#996633',
        outerStrokeColor: '#CC6600',
    },
    {
        id: 'cyber-pink',
        name: '赛博粉',
        frameColor: '#FF0099',
        sunColor: '#FF66CC',
        textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFCCFF 30%, #FF99CC 50%, #FF6699 70%, #CC0066 100%)',
        strokeColor: '#990066',
        outerStrokeColor: '#FF0099',
    },
    {
        id: 'ocean-blue',
        name: '海洋蓝',
        frameColor: '#0066CC',
        sunColor: '#00CCFF',
        textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #CCFFFF 30%, #66CCFF 50%, #3399FF 70%, #0033CC 100%)',
        strokeColor: '#003399',
        outerStrokeColor: '#0066CC',
    },
    {
        id: 'forest-green',
        name: '森林绿',
        frameColor: '#009933',
        sunColor: '#99FF00',
        textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #CCFFCC 30%, #66FF66 50%, #33CC33 70%, #006600 100%)',
        strokeColor: '#006633',
        outerStrokeColor: '#009933',
    },
    {
        id: 'sunset-orange',
        name: '日落橙',
        frameColor: '#FF6600',
        sunColor: '#FFCC00',
        textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFCC99 30%, #FF9966 50%, #FF6633 70%, #CC3300 100%)',
        strokeColor: '#993300',
        outerStrokeColor: '#FF6600',
    },
]
