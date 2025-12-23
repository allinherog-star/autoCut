/**
 * VEIR 合成器模块
 * 基于 ModernComposer 新架构的视频合成导出系统
 */

// 类型导出
export * from './types';

// 转换器导出
export {
  convertVEIRToModern,
  validateVEIRForComposition,
  getVEIRStats,
  type ConvertedAsset,
  type ConvertedProject,
} from './converter';

// 合成器导出
export {
  VEIRComposer,
  composeVEIR,
  downloadComposition,
  createPreviewElement,
  releaseComposition,
} from './composer';

// 运动关键帧导出
export {
  calculateMotionState,
  motionToTransform,
  applyMotionToCanvas,
  createEntranceMotion,
  createExitMotion,
  getEasingFunction,
  easingFunctions,
  type MotionValues,
} from './motion';

// 滤镜导出
export {
  getFilterCSS,
  getFilterConfig,
  listFilters,
  combineFilters,
  applyFilterToCanvas,
  resetCanvasFilter,
  getPresetFilterCSS,
  builtinFilters,
  filterPresets,
  type FilterConfig,
} from './filters';

