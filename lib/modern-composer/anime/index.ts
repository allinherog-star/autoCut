/**
 * Anime.js 动画引擎
 * 基于 Anime.js v4 的现代化动画系统
 * 提供时间轴、关键帧、缓动函数等专业级动画能力
 */

import anime, { type AnimeInstance, createTimeline, type Timeline, stagger, type EasingOptions } from 'animejs';

// ============================================
// 类型定义
// ============================================

/**
 * 动画属性
 */
export interface AnimationProperties {
  opacity?: number | number[];
  translateX?: number | number[];
  translateY?: number | number[];
  scale?: number | number[];
  scaleX?: number | number[];
  scaleY?: number | number[];
  rotate?: number | number[];
  skewX?: number | number[];
  skewY?: number | number[];
  blur?: number | number[];
}

/**
 * 关键帧定义
 */
export interface Keyframe extends AnimationProperties {
  duration?: number;
  delay?: number;
  easing?: EasingOptions;
  // 百分比位置 (0-100)
  at?: number;
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  id: string;
  keyframes: Keyframe[];
  duration: number;
  delay?: number;
  easing?: EasingOptions;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

/**
 * 动画状态
 */
export interface AnimationState extends AnimationProperties {
  progress: number;
}

/**
 * 预设动画类型
 */
export type PresetAnimationType =
  | 'fade-in'
  | 'fade-out'
  | 'zoom-in'
  | 'zoom-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'bounce-in'
  | 'bounce-out'
  | 'rotate-in'
  | 'rotate-out'
  | 'blur-in'
  | 'blur-out'
  | 'elastic-in'
  | 'elastic-out'
  | 'pop'
  | 'shake'
  | 'swing'
  | 'pulse';

// ============================================
// 动画状态计算器
// ============================================

/**
 * 基于关键帧计算指定时间点的动画状态
 */
export function calculateAnimationState(
  keyframes: Keyframe[],
  currentTime: number,
  totalDuration: number,
  easing: EasingOptions = 'easeOutQuad'
): AnimationState {
  const progress = Math.min(Math.max(currentTime / totalDuration, 0), 1);

  // 默认状态
  const state: AnimationState = {
    progress,
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    blur: 0,
  };

  if (keyframes.length === 0) return state;

  // 将关键帧转换为时间线位置
  const normalizedKeyframes = normalizeKeyframes(keyframes, totalDuration);

  // 找到当前时间点所在的关键帧区间
  let prevFrame: Keyframe & { time: number } = normalizedKeyframes[0];
  let nextFrame: Keyframe & { time: number } = normalizedKeyframes[0];

  for (let i = 0; i < normalizedKeyframes.length - 1; i++) {
    if (currentTime >= normalizedKeyframes[i].time && currentTime <= normalizedKeyframes[i + 1].time) {
      prevFrame = normalizedKeyframes[i];
      nextFrame = normalizedKeyframes[i + 1];
      break;
    }
    if (currentTime > normalizedKeyframes[i + 1].time) {
      prevFrame = normalizedKeyframes[i + 1];
      nextFrame = normalizedKeyframes[i + 1];
    }
  }

  // 计算区间内的进度
  const segmentDuration = nextFrame.time - prevFrame.time;
  const segmentProgress = segmentDuration > 0 ? (currentTime - prevFrame.time) / segmentDuration : 1;

  // 应用缓动
  const frameEasing = nextFrame.easing || easing;
  const easedProgress = applyEasing(segmentProgress, frameEasing);

  // 插值计算各属性
  const properties: (keyof AnimationProperties)[] = [
    'opacity',
    'translateX',
    'translateY',
    'scale',
    'scaleX',
    'scaleY',
    'rotate',
    'blur',
  ];

  for (const prop of properties) {
    const prevValue = getKeyframeValue(prevFrame, prop);
    const nextValue = getKeyframeValue(nextFrame, prop);

    if (prevValue !== undefined && nextValue !== undefined) {
      (state as Record<string, number>)[prop] = lerp(prevValue, nextValue, easedProgress);
    } else if (prevValue !== undefined) {
      (state as Record<string, number>)[prop] = prevValue;
    } else if (nextValue !== undefined) {
      (state as Record<string, number>)[prop] = nextValue;
    }
  }

  return state;
}

// ============================================
// Anime.js 时间轴引擎
// ============================================

export class AnimeEngine {
  private timelines: Map<string, Timeline> = new Map();
  private animations: Map<string, AnimeInstance> = new Map();
  private stateObjects: Map<string, AnimationState> = new Map();

  /**
   * 创建动画时间轴
   */
  createTimeline(
    id: string,
    config?: {
      duration?: number;
      easing?: EasingOptions;
      autoplay?: boolean;
    }
  ): Timeline {
    const timeline = createTimeline({
      duration: config?.duration,
      playbackEase: config?.easing,
      autoplay: config?.autoplay ?? false,
    });

    this.timelines.set(id, timeline);
    return timeline;
  }

  /**
   * 添加动画到时间轴
   */
  addToTimeline(
    timelineId: string,
    targetId: string,
    animation: AnimationConfig,
    offset?: number | string
  ): void {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) throw new Error(`Timeline ${timelineId} not found`);

    // 创建状态对象用于追踪动画值
    const stateObj = this.getOrCreateState(targetId);

    // 构建动画参数对象
    const animParams: any = {
      targets: stateObj,
      duration: animation.duration,
      easing: animation.easing || 'easeOutQuad',
    };

    // 从关键帧提取目标值（使用最后一帧的值）
    const lastFrame = animation.keyframes[animation.keyframes.length - 1];
    if (lastFrame) {
      if (lastFrame.opacity !== undefined) animParams.opacity = lastFrame.opacity;
      if (lastFrame.translateX !== undefined) animParams.translateX = lastFrame.translateX;
      if (lastFrame.translateY !== undefined) animParams.translateY = lastFrame.translateY;
      if (lastFrame.scale !== undefined) animParams.scale = lastFrame.scale;
      if (lastFrame.scaleX !== undefined) animParams.scaleX = lastFrame.scaleX;
      if (lastFrame.scaleY !== undefined) animParams.scaleY = lastFrame.scaleY;
      if (lastFrame.rotate !== undefined) animParams.rotate = lastFrame.rotate;
      if (lastFrame.blur !== undefined) animParams.blur = lastFrame.blur;
    }

    // 设置初始值（从第一帧）
    const firstFrame = animation.keyframes[0];
    if (firstFrame) {
      if (firstFrame.opacity !== undefined) stateObj.opacity = firstFrame.opacity;
      if (firstFrame.translateX !== undefined) stateObj.translateX = firstFrame.translateX;
      if (firstFrame.translateY !== undefined) stateObj.translateY = firstFrame.translateY;
      if (firstFrame.scale !== undefined) stateObj.scale = firstFrame.scale;
      if (firstFrame.scaleX !== undefined) stateObj.scaleX = firstFrame.scaleX;
      if (firstFrame.scaleY !== undefined) stateObj.scaleY = firstFrame.scaleY;
      if (firstFrame.rotate !== undefined) stateObj.rotate = firstFrame.rotate;
      if (firstFrame.blur !== undefined) stateObj.blur = firstFrame.blur;
    }

    timeline.add(animParams, offset);
  }

  /**
   * 创建独立动画
   */
  createAnimation(targetId: string, config: AnimationConfig): AnimeInstance {
    const stateObj = this.getOrCreateState(targetId);

    const animeConfig: Parameters<typeof anime>[0] = {
      targets: stateObj,
      duration: config.duration,
      delay: config.delay,
      easing: config.easing || 'easeOutQuad',
      loop: config.loop,
      direction: config.direction,
      autoplay: false,
    };

    // 添加动画属性
    config.keyframes.forEach((kf, index) => {
      if (index === 0) {
        // 第一帧设置初始值
        Object.assign(stateObj, {
          opacity: kf.opacity ?? stateObj.opacity,
          translateX: kf.translateX ?? stateObj.translateX,
          translateY: kf.translateY ?? stateObj.translateY,
          scale: kf.scale ?? stateObj.scale,
          rotate: kf.rotate ?? stateObj.rotate,
          blur: kf.blur ?? stateObj.blur,
        });
      }
    });

    // 使用最后一帧作为目标值
    const lastFrame = config.keyframes[config.keyframes.length - 1];
    if (lastFrame) {
      if (lastFrame.opacity !== undefined) animeConfig.opacity = lastFrame.opacity;
      if (lastFrame.translateX !== undefined) animeConfig.translateX = lastFrame.translateX;
      if (lastFrame.translateY !== undefined) animeConfig.translateY = lastFrame.translateY;
      if (lastFrame.scale !== undefined) animeConfig.scale = lastFrame.scale;
      if (lastFrame.scaleX !== undefined) animeConfig.scaleX = lastFrame.scaleX;
      if (lastFrame.scaleY !== undefined) animeConfig.scaleY = lastFrame.scaleY;
      if (lastFrame.rotate !== undefined) animeConfig.rotate = lastFrame.rotate;
      if (lastFrame.blur !== undefined) animeConfig.blur = lastFrame.blur;
    }

    const anim = anime(animeConfig);
    this.animations.set(config.id, anim);

    return anim;
  }

  /**
   * 根据时间获取动画状态
   */
  getStateAtTime(targetId: string, time: number): AnimationState {
    const stateObj = this.stateObjects.get(targetId);
    return stateObj || createDefaultState();
  }

  /**
   * 跳转到指定时间
   */
  seekTimeline(timelineId: string, time: number): void {
    const timeline = this.timelines.get(timelineId);
    if (timeline) {
      timeline.seek(time * 1000); // Anime.js 使用毫秒
    }
  }

  /**
   * 跳转动画到指定时间
   */
  seekAnimation(animationId: string, time: number): void {
    const anim = this.animations.get(animationId);
    if (anim) {
      anim.seek(time * 1000);
    }
  }

  /**
   * 播放时间轴
   */
  playTimeline(timelineId: string): void {
    const timeline = this.timelines.get(timelineId);
    if (timeline) {
      timeline.play();
    }
  }

  /**
   * 暂停时间轴
   */
  pauseTimeline(timelineId: string): void {
    const timeline = this.timelines.get(timelineId);
    if (timeline) {
      timeline.pause();
    }
  }

  /**
   * 销毁时间轴
   */
  destroyTimeline(timelineId: string): void {
    const timeline = this.timelines.get(timelineId);
    if (timeline) {
      timeline.pause();
      this.timelines.delete(timelineId);
    }
  }

  /**
   * 销毁动画
   */
  destroyAnimation(animationId: string): void {
    const anim = this.animations.get(animationId);
    if (anim) {
      anim.pause();
      this.animations.delete(animationId);
    }
  }

  /**
   * 清空所有
   */
  clear(): void {
    this.timelines.forEach((tl) => tl.pause());
    this.animations.forEach((anim) => anim.pause());
    this.timelines.clear();
    this.animations.clear();
    this.stateObjects.clear();
  }

  private getOrCreateState(targetId: string): AnimationState {
    let state = this.stateObjects.get(targetId);
    if (!state) {
      state = createDefaultState();
      this.stateObjects.set(targetId, state);
    }
    return state;
  }
}

// ============================================
// 预设动画生成器
// ============================================

export function createPresetAnimation(
  type: PresetAnimationType,
  duration: number = 500,
  options?: {
    distance?: number;
    intensity?: number;
    easing?: EasingOptions;
  }
): Keyframe[] {
  const distance = options?.distance || 50;
  const intensity = options?.intensity || 1;
  const easing = options?.easing;

  switch (type) {
    case 'fade-in':
      return [
        { opacity: 0, duration: 0 },
        { opacity: 1, duration, easing: easing || 'easeOutQuad' },
      ];

    case 'fade-out':
      return [
        { opacity: 1, duration: 0 },
        { opacity: 0, duration, easing: easing || 'easeInQuad' },
      ];

    case 'zoom-in':
      return [
        { opacity: 0, scale: 0.5 * intensity, duration: 0 },
        { opacity: 1, scale: 1, duration, easing: easing || 'easeOutBack' },
      ];

    case 'zoom-out':
      return [
        { opacity: 1, scale: 1, duration: 0 },
        { opacity: 0, scale: 0.8, duration, easing: easing || 'easeInQuad' },
      ];

    case 'slide-up':
      return [
        { opacity: 0, translateY: distance * intensity, duration: 0 },
        { opacity: 1, translateY: 0, duration, easing: easing || 'easeOutQuad' },
      ];

    case 'slide-down':
      return [
        { opacity: 0, translateY: -distance * intensity, duration: 0 },
        { opacity: 1, translateY: 0, duration, easing: easing || 'easeOutQuad' },
      ];

    case 'slide-left':
      return [
        { opacity: 0, translateX: distance * intensity, duration: 0 },
        { opacity: 1, translateX: 0, duration, easing: easing || 'easeOutQuad' },
      ];

    case 'slide-right':
      return [
        { opacity: 0, translateX: -distance * intensity, duration: 0 },
        { opacity: 1, translateX: 0, duration, easing: easing || 'easeOutQuad' },
      ];

    case 'bounce-in':
      return [
        { opacity: 0, scale: 0.3, translateY: distance * intensity, duration: 0 },
        { opacity: 1, scale: 1, translateY: 0, duration, easing: easing || 'spring(1, 80, 10, 0)' },
      ];

    case 'bounce-out':
      return [
        { opacity: 1, scale: 1, translateY: 0, duration: 0 },
        {
          opacity: 0,
          scale: 0.5,
          translateY: distance * intensity,
          duration,
          easing: easing || 'easeInQuad',
        },
      ];

    case 'rotate-in':
      return [
        { opacity: 0, rotate: -180 * intensity, scale: 0.5, duration: 0 },
        { opacity: 1, rotate: 0, scale: 1, duration, easing: easing || 'easeOutBack' },
      ];

    case 'rotate-out':
      return [
        { opacity: 1, rotate: 0, scale: 1, duration: 0 },
        { opacity: 0, rotate: 180 * intensity, scale: 0.5, duration, easing: easing || 'easeInQuad' },
      ];

    case 'blur-in':
      return [
        { opacity: 0, blur: 20 * intensity, duration: 0 },
        { opacity: 1, blur: 0, duration, easing: easing || 'easeOutQuad' },
      ];

    case 'blur-out':
      return [
        { opacity: 1, blur: 0, duration: 0 },
        { opacity: 0, blur: 20 * intensity, duration, easing: easing || 'easeInQuad' },
      ];

    case 'elastic-in':
      return [
        { opacity: 0, scale: 0, duration: 0 },
        { opacity: 1, scale: 1, duration, easing: easing || 'easeOutElastic(1, 0.5)' },
      ];

    case 'elastic-out':
      return [
        { opacity: 1, scale: 1, duration: 0 },
        { opacity: 0, scale: 0, duration, easing: easing || 'easeInElastic(1, 0.5)' },
      ];

    case 'pop':
      return [
        { scale: 1, duration: 0 },
        { scale: 1.2 * intensity, duration: duration * 0.4, easing: 'easeOutQuad' },
        { scale: 1, duration: duration * 0.6, easing: 'easeOutBounce' },
      ];

    case 'shake':
      return [
        { translateX: 0, duration: 0 },
        { translateX: -10 * intensity, duration: duration * 0.1 },
        { translateX: 10 * intensity, duration: duration * 0.2 },
        { translateX: -10 * intensity, duration: duration * 0.2 },
        { translateX: 10 * intensity, duration: duration * 0.2 },
        { translateX: 0, duration: duration * 0.3 },
      ];

    case 'swing':
      return [
        { rotate: 0, duration: 0 },
        { rotate: 15 * intensity, duration: duration * 0.2 },
        { rotate: -10 * intensity, duration: duration * 0.2 },
        { rotate: 5 * intensity, duration: duration * 0.2 },
        { rotate: -5 * intensity, duration: duration * 0.2 },
        { rotate: 0, duration: duration * 0.2 },
      ];

    case 'pulse':
      return [
        { scale: 1, opacity: 1, duration: 0 },
        { scale: 1.1 * intensity, opacity: 0.8, duration: duration * 0.5 },
        { scale: 1, opacity: 1, duration: duration * 0.5 },
      ];

    default:
      return [{ opacity: 1, duration }];
  }
}

// ============================================
// Stagger 交错动画
// ============================================

export { stagger };

export function createStaggerAnimation(
  count: number,
  animation: Keyframe[],
  staggerOptions?: {
    start?: number;
    from?: 'first' | 'last' | 'center' | number;
    direction?: 'normal' | 'reverse';
    easing?: EasingOptions;
    grid?: [number, number];
  }
): AnimationConfig[] {
  const configs: AnimationConfig[] = [];

  for (let i = 0; i < count; i++) {
    const delayMultiplier = calculateStaggerDelay(i, count, staggerOptions);
    const totalDuration = animation.reduce((sum, kf) => sum + (kf.duration || 0), 0);

    configs.push({
      id: `stagger-${i}`,
      keyframes: animation.map((kf) => ({
        ...kf,
        delay: (kf.delay || 0) + (staggerOptions?.start || 100) * delayMultiplier,
      })),
      duration: totalDuration,
    });
  }

  return configs;
}

// ============================================
// 辅助函数
// ============================================

function createDefaultState(): AnimationState {
  return {
    progress: 0,
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    blur: 0,
  };
}

function normalizeKeyframes(
  keyframes: Keyframe[],
  totalDuration: number
): (Keyframe & { time: number })[] {
  let accumulatedTime = 0;

  return keyframes.map((kf, index) => {
    let time: number;

    if (kf.at !== undefined) {
      // 百分比定位
      time = (kf.at / 100) * totalDuration;
    } else if (kf.duration !== undefined) {
      // 基于时长定位
      time = accumulatedTime;
      accumulatedTime += kf.duration;
    } else {
      // 均匀分布
      time = (index / (keyframes.length - 1 || 1)) * totalDuration;
    }

    return { ...kf, time };
  });
}

function getKeyframeValue(kf: Keyframe, prop: keyof AnimationProperties): number | undefined {
  const value = kf[prop];
  if (Array.isArray(value)) return value[0];
  return value;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function applyEasing(t: number, easing: EasingOptions): number {
  // 简化的缓动函数实现
  // Anime.js 会在实际动画中处理完整的缓动
  if (typeof easing === 'string') {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeInQuad':
        return t * t;
      case 'easeOutQuad':
        return t * (2 - t);
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'easeInCubic':
        return t * t * t;
      case 'easeOutCubic':
        return --t * t * t + 1;
      case 'easeInOutCubic':
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      case 'easeOutBack':
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      case 'easeOutBounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      default:
        return t;
    }
  }
  return t;
}

function calculateStaggerDelay(
  index: number,
  count: number,
  options?: {
    from?: 'first' | 'last' | 'center' | number;
    direction?: 'normal' | 'reverse';
  }
): number {
  const from = options?.from || 'first';
  const direction = options?.direction || 'normal';

  let delay: number;

  if (from === 'first') {
    delay = index;
  } else if (from === 'last') {
    delay = count - 1 - index;
  } else if (from === 'center') {
    const center = (count - 1) / 2;
    delay = Math.abs(index - center);
  } else {
    delay = Math.abs(index - from);
  }

  if (direction === 'reverse') {
    delay = count - 1 - delay;
  }

  return delay;
}

// ============================================
// 导出
// ============================================

export { anime, createTimeline };
export type { AnimeInstance, Timeline };

