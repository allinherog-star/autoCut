/**
 * Universal Preview - 通用预览组件
 * 
 * 支持多种视频比例的专业预览组件
 */

export { UniversalPreview, type UniversalPreviewRef } from './UniversalPreview'
export type {
    UniversalPreviewProps,
    PreviewState,
    PlaybackState,
    ElementDragEvent,
    ElementTransformEvent,
    PreviewCanvasProps,
    PreviewControlsProps,
    UseCoordinateSystemResult,
    UsePreviewStateResult,
} from './types'
export { useCoordinateSystem } from './hooks/useCoordinateSystem'
export { usePreviewState } from './hooks/usePreviewState'
