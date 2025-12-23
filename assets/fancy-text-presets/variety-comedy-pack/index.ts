/**
 * 《一见你就笑》综艺花字套件 - Variety Comedy Pack
 * 
 * 包含4类文字动画模板:
 * 1. show-title-burst    - 节目主标题 (逐字弹入 + 爆炸底板)
 * 2. segment-title-pop   - 分段标题 (弹性缩放 + 色块底板)
 * 3. guest-name-slide    - 嘉宾姓名条 (滑入动画 + 头像)
 * 4. laugh-explosion     - 爆笑大字 (震动爆炸 + 笑哭表情)
 * 
 * 统一舞台模型 (Stage Model):
 * 舞台中心 (0,0)
 * ├── Plate Layer      - 底板层 (背景装饰/色块)
 * ├── Impact FX Layer  - 冲击特效层 (速度线/粒子/闪光)
 * ├── Text Layer       - 文字层 (多层描边渐变文字)
 * └── Emoji / Comic Layer - 表情漫画层 (emoji/漫画符号)
 */

// 共享组件
export * from './shared-fx-components'

// 预设组件
export { ShowTitleBurst, type ShowTitleBurstProps } from './show-title-burst.motion'
export { SegmentTitlePop, type SegmentTitlePopProps } from './segment-title-pop.motion'
export { GuestNameSlide, type GuestNameSlideProps } from './guest-name-slide.motion'
export { LaughExplosion, type LaughExplosionProps } from './laugh-explosion.motion'

// 元数据导入
import showTitleBurstMeta from './show-title-burst.meta.json'
import segmentTitlePopMeta from './segment-title-pop.meta.json'
import guestNameSlideMeta from './guest-name-slide.meta.json'
import laughExplosionMeta from './laugh-explosion.meta.json'

// 导出元数据
export const VARIETY_COMEDY_METAS = {
    'show-title-burst': showTitleBurstMeta,
    'segment-title-pop': segmentTitlePopMeta,
    'guest-name-slide': guestNameSlideMeta,
    'laugh-explosion': laughExplosionMeta,
} as const

// 导出组件加载器
export const VARIETY_COMEDY_LOADERS = {
    'show-title-burst': () => import('./show-title-burst.motion'),
    'segment-title-pop': () => import('./segment-title-pop.motion'),
    'guest-name-slide': () => import('./guest-name-slide.motion'),
    'laugh-explosion': () => import('./laugh-explosion.motion'),
} as const

export type VarietyComedyPresetId = keyof typeof VARIETY_COMEDY_METAS






