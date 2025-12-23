/**
 * VEIR 运动关键帧处理
 * 支持 adjustments.clipOverrides 中的 motion 定义
 */

import type { MotionSegment, EasingFunction } from '../types';

// ============================================
// 缓动函数
// ============================================

/**
 * 缓动函数实现
 */
export const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t * t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * 获取缓动函数
 */
export function getEasingFunction(easing: EasingFunction = 'ease-out'): (t: number) => number {
  return easingFunctions[easing] || easingFunctions['ease-out'];
}

// ============================================
// 运动状态计算
// ============================================

/**
 * 运动状态值
 */
export interface MotionValues {
  opacity?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  rotation?: number;
  blur?: number;
}

/**
 * 线性插值
 */
function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * 计算关键帧运动状态
 * @param motion 运动片段数组
 * @param currentTime 当前时间（相对于 clip 开始）
 * @param clipStart clip 在时间轴上的开始时间
 * @returns 计算后的运动状态值
 */
export function calculateMotionState(
  motion: MotionSegment[] | undefined,
  currentTime: number,
  clipStart: number
): MotionValues {
  const result: MotionValues = {
    opacity: 1,
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0,
    blur: 0,
  };

  if (!motion || motion.length === 0) {
    return result;
  }

  // 计算绝对时间
  const absoluteTime = clipStart + currentTime;

  for (const segment of motion) {
    // 检查当前时间是否在这个运动片段范围内
    if (absoluteTime >= segment.when.start && absoluteTime <= segment.when.end) {
      const segmentDuration = segment.when.end - segment.when.start;
      const localProgress = (absoluteTime - segment.when.start) / segmentDuration;
      
      // 应用缓动函数
      const easing = getEasingFunction(segment.easing);
      const easedProgress = easing(Math.min(1, Math.max(0, localProgress)));

      // 插值计算各属性
      const from = segment.from as Record<string, number>;
      const to = segment.to as Record<string, number>;

      for (const key of Object.keys(from)) {
        if (typeof from[key] === 'number' && typeof to[key] === 'number') {
          const value = lerp(from[key], to[key], easedProgress);
          
          switch (key) {
            case 'opacity':
              result.opacity = value;
              break;
            case 'scale':
              result.scale = value;
              break;
            case 'scaleX':
              result.scaleX = value;
              break;
            case 'scaleY':
              result.scaleY = value;
              break;
            case 'translateX':
            case 'x':
              result.translateX = value;
              break;
            case 'translateY':
            case 'y':
              result.translateY = value;
              break;
            case 'rotation':
            case 'rotate':
              result.rotation = value;
              break;
            case 'blur':
              result.blur = value;
              break;
          }
        }
      }

      // 找到第一个匹配的片段就返回（片段可能重叠）
      break;
    }

    // 如果时间在片段之后，应用最终状态
    if (absoluteTime > segment.when.end) {
      const to = segment.to as Record<string, number>;
      for (const key of Object.keys(to)) {
        if (typeof to[key] === 'number') {
          switch (key) {
            case 'opacity':
              result.opacity = to[key];
              break;
            case 'scale':
              result.scale = to[key];
              break;
            case 'translateX':
            case 'x':
              result.translateX = to[key];
              break;
            case 'translateY':
            case 'y':
              result.translateY = to[key];
              break;
            case 'rotation':
            case 'rotate':
              result.rotation = to[key];
              break;
          }
        }
      }
    }
  }

  return result;
}

/**
 * 将运动状态转换为 CSS transform 字符串
 */
export function motionToTransform(motion: MotionValues): string {
  const transforms: string[] = [];

  if (motion.translateX !== 0 || motion.translateY !== 0) {
    transforms.push(`translate(${motion.translateX || 0}px, ${motion.translateY || 0}px)`);
  }

  if (motion.scale !== undefined && motion.scale !== 1) {
    transforms.push(`scale(${motion.scale})`);
  } else {
    if (motion.scaleX !== undefined && motion.scaleX !== 1) {
      transforms.push(`scaleX(${motion.scaleX})`);
    }
    if (motion.scaleY !== undefined && motion.scaleY !== 1) {
      transforms.push(`scaleY(${motion.scaleY})`);
    }
  }

  if (motion.rotation !== 0) {
    transforms.push(`rotate(${motion.rotation}deg)`);
  }

  return transforms.length > 0 ? transforms.join(' ') : 'none';
}

/**
 * 将运动状态转换为 Canvas 变换矩阵
 */
export function applyMotionToCanvas(
  ctx: CanvasRenderingContext2D,
  motion: MotionValues,
  centerX: number,
  centerY: number
): void {
  // 移动到中心点
  ctx.translate(centerX, centerY);

  // 应用缩放
  if (motion.scale !== undefined && motion.scale !== 1) {
    ctx.scale(motion.scale, motion.scale);
  } else {
    ctx.scale(motion.scaleX ?? 1, motion.scaleY ?? 1);
  }

  // 应用旋转
  if (motion.rotation) {
    ctx.rotate((motion.rotation * Math.PI) / 180);
  }

  // 移回原点
  ctx.translate(-centerX + (motion.translateX || 0), -centerY + (motion.translateY || 0));

  // 应用透明度
  if (motion.opacity !== undefined) {
    ctx.globalAlpha = motion.opacity;
  }

  // 应用模糊（如果支持）
  if (motion.blur && motion.blur > 0) {
    ctx.filter = `blur(${motion.blur}px)`;
  }
}

// ============================================
// 预定义运动模板
// ============================================

/**
 * 生成入场运动片段
 */
export function createEntranceMotion(
  type: 'fade' | 'zoom' | 'slide-up' | 'slide-down' | 'bounce',
  startTime: number,
  duration: number = 0.5
): MotionSegment {
  const endTime = startTime + duration;

  switch (type) {
    case 'fade':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 0 },
        to: { opacity: 1 },
        easing: 'ease-out',
      };
    
    case 'zoom':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1 },
        easing: 'ease-out',
      };
    
    case 'slide-up':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 0, translateY: 50 },
        to: { opacity: 1, translateY: 0 },
        easing: 'ease-out',
      };
    
    case 'slide-down':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 0, translateY: -50 },
        to: { opacity: 1, translateY: 0 },
        easing: 'ease-out',
      };
    
    case 'bounce':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 0, scale: 0.3, translateY: 80 },
        to: { opacity: 1, scale: 1, translateY: 0 },
        easing: 'spring',
      };
  }
}

/**
 * 生成出场运动片段
 */
export function createExitMotion(
  type: 'fade' | 'zoom' | 'slide-up' | 'slide-down',
  endTime: number,
  duration: number = 0.3
): MotionSegment {
  const startTime = endTime - duration;

  switch (type) {
    case 'fade':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 1 },
        to: { opacity: 0 },
        easing: 'ease-in',
      };
    
    case 'zoom':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 1, scale: 1 },
        to: { opacity: 0, scale: 0.8 },
        easing: 'ease-in',
      };
    
    case 'slide-up':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 1, translateY: 0 },
        to: { opacity: 0, translateY: -30 },
        easing: 'ease-in',
      };
    
    case 'slide-down':
      return {
        when: { start: startTime, end: endTime },
        from: { opacity: 1, translateY: 0 },
        to: { opacity: 0, translateY: 30 },
        easing: 'ease-in',
      };
  }
}





