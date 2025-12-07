/**
 * 视频合成系统
 * 
 * 完整支持：
 * - 视频：多片段、裁剪、滤镜
 * - 音频：混音、淡入淡出、背景音乐
 * - 字幕：多样式、动画效果（位置、颜色、描边、阴影等）
 * - 图片：叠加、动画
 * - 转场：多种效果
 */

export * from './types'
export { 
  VideoComposer, 
  quickCompose,
  type SubtitleInput,
} from './composer'
export * from './audio-mixer'

