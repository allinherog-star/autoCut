/**
 * 动作重影效果工具库
 * 
 * 实现类似剪映的动作重影/残影效果
 * 
 * 原理：将视频的连续多帧以递减透明度叠加，创造出运动轨迹的残影效果
 * 
 * 支持的方式：
 * 1. Canvas 实时预览（帧缓存 + 混合）
 * 2. FFmpeg 滤镜处理（tmix/lagfun）
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'

// FFmpeg 核心 CDN 地址
const FFMPEG_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'

// FFmpeg 实例
let ffmpegInstance: FFmpeg | null = null
let isLoaded = false
let isLoading = false

/**
 * 重影效果配置
 */
export interface MotionGhostConfig {
  /** 重影帧数 (3-15，越大拖尾越长) */
  frameCount: number
  /** 衰减系数 (0.5-0.98，越大残影越明显) */
  decay: number
  /** 混合模式 */
  blendMode: 'normal' | 'screen' | 'lighten' | 'add'
  /** 是否启用运动检测（只对运动区域加重影） */
  motionDetection: boolean
  /** 运动检测阈值 (0-255) */
  motionThreshold: number
  /** 重影颜色化 (null 为原色) */
  tintColor: string | null
  /** 重影透明度基础值 */
  baseOpacity: number
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: MotionGhostConfig = {
  frameCount: 5,
  decay: 0.85,
  blendMode: 'screen',
  motionDetection: false,
  motionThreshold: 30,
  tintColor: null,
  baseOpacity: 0.8,
}

/**
 * 预设效果
 */
export const GHOST_PRESETS: Record<string, Partial<MotionGhostConfig> & { name: string; description: string }> = {
  subtle: {
    name: '轻微残影',
    description: '轻微的动作拖尾，适合日常视频',
    frameCount: 3,
    decay: 0.7,
    blendMode: 'normal',
    baseOpacity: 0.6,
  },
  standard: {
    name: '标准重影',
    description: '明显的动作重影效果',
    frameCount: 5,
    decay: 0.85,
    blendMode: 'screen',
    baseOpacity: 0.8,
  },
  intense: {
    name: '强烈拖尾',
    description: '长拖尾效果，适合动作场景',
    frameCount: 10,
    decay: 0.92,
    blendMode: 'screen',
    baseOpacity: 0.9,
  },
  neon: {
    name: '霓虹残影',
    description: '带有霓虹色调的炫酷效果',
    frameCount: 8,
    decay: 0.88,
    blendMode: 'add',
    tintColor: '#00ffff',
    baseOpacity: 0.7,
  },
  fire: {
    name: '火焰拖尾',
    description: '橙红色火焰般的拖尾效果',
    frameCount: 7,
    decay: 0.85,
    blendMode: 'add',
    tintColor: '#ff6600',
    baseOpacity: 0.75,
  },
  matrix: {
    name: '黑客帝国',
    description: '绿色矩阵风格的残影',
    frameCount: 12,
    decay: 0.9,
    blendMode: 'screen',
    tintColor: '#00ff00',
    baseOpacity: 0.65,
  },
  blur: {
    name: '动态模糊',
    description: '模拟运动模糊的效果',
    frameCount: 6,
    decay: 0.75,
    blendMode: 'lighten',
    baseOpacity: 0.5,
  },
}

/**
 * Canvas 动作重影处理器
 * 
 * 使用帧缓存实现实时预览
 */
export class CanvasMotionGhost {
  private frameBuffer: ImageData[] = []
  private config: MotionGhostConfig
  private prevFrame: ImageData | null = null
  
  constructor(config: Partial<MotionGhostConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MotionGhostConfig>) {
    this.config = { ...this.config, ...config }
    // 如果帧数减少，裁剪缓存
    if (this.frameBuffer.length > this.config.frameCount) {
      this.frameBuffer = this.frameBuffer.slice(-this.config.frameCount)
    }
  }

  /**
   * 重置帧缓存
   */
  reset() {
    this.frameBuffer = []
    this.prevFrame = null
  }

  /**
   * 处理单帧，返回带重影效果的图像数据
   */
  processFrame(
    ctx: CanvasRenderingContext2D,
    currentFrame: ImageData,
    outputCtx: CanvasRenderingContext2D
  ): void {
    const { frameCount, decay, blendMode, motionDetection, motionThreshold, tintColor, baseOpacity } = this.config
    const { width, height } = currentFrame

    // 添加当前帧到缓冲
    // 创建副本，因为 ImageData 可能被修改
    const frameCopy = new ImageData(
      new Uint8ClampedArray(currentFrame.data),
      width,
      height
    )
    this.frameBuffer.push(frameCopy)

    // 保持缓冲区大小
    while (this.frameBuffer.length > frameCount) {
      this.frameBuffer.shift()
    }

    // 创建输出图像数据
    const outputData = new ImageData(width, height)
    const output = outputData.data

    // 计算运动蒙版（如果启用）
    let motionMask: Uint8Array | null = null
    if (motionDetection && this.prevFrame) {
      motionMask = this.calculateMotionMask(this.prevFrame, currentFrame, motionThreshold)
    }
    this.prevFrame = frameCopy

    // 首先绘制当前帧作为基础
    for (let i = 0; i < output.length; i++) {
      output[i] = currentFrame.data[i]
    }

    // 从旧到新叠加帧
    const numFrames = this.frameBuffer.length
    for (let frameIdx = 0; frameIdx < numFrames - 1; frameIdx++) {
      const frame = this.frameBuffer[frameIdx]
      // 计算透明度：越旧的帧越透明
      const age = numFrames - 1 - frameIdx
      const alpha = baseOpacity * Math.pow(decay, age)

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4

          // 如果启用运动检测，只在运动区域应用效果
          if (motionMask && motionMask[y * width + x] < 128) {
            continue
          }

          let r = frame.data[i]
          let g = frame.data[i + 1]
          let b = frame.data[i + 2]

          // 应用颜色化
          if (tintColor) {
            const tint = hexToRgb(tintColor)
            if (tint) {
              const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
              r = Math.round(tint.r * luminance)
              g = Math.round(tint.g * luminance)
              b = Math.round(tint.b * luminance)
            }
          }

          // 根据混合模式叠加
          const [blendedR, blendedG, blendedB] = this.blend(
            output[i], output[i + 1], output[i + 2],
            r, g, b,
            alpha,
            blendMode
          )

          output[i] = blendedR
          output[i + 1] = blendedG
          output[i + 2] = blendedB
          // Alpha 通道保持不变
        }
      }
    }

    // 输出到画布
    outputCtx.putImageData(outputData, 0, 0)
  }

  /**
   * 计算运动蒙版
   */
  private calculateMotionMask(
    prevFrame: ImageData,
    currentFrame: ImageData,
    threshold: number
  ): Uint8Array {
    const { width, height } = currentFrame
    const mask = new Uint8Array(width * height)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        
        // 计算像素差异
        const diffR = Math.abs(currentFrame.data[i] - prevFrame.data[i])
        const diffG = Math.abs(currentFrame.data[i + 1] - prevFrame.data[i + 1])
        const diffB = Math.abs(currentFrame.data[i + 2] - prevFrame.data[i + 2])
        const diff = (diffR + diffG + diffB) / 3

        mask[y * width + x] = diff > threshold ? 255 : 0
      }
    }

    // 可选：膨胀运动区域使其更平滑
    return this.dilate(mask, width, height, 3)
  }

  /**
   * 膨胀操作（使运动区域更大）
   */
  private dilate(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
    const result = new Uint8Array(mask.length)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let maxVal = 0
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy
            const nx = x + dx
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              maxVal = Math.max(maxVal, mask[ny * width + nx])
            }
          }
        }
        result[y * width + x] = maxVal
      }
    }
    
    return result
  }

  /**
   * 混合两个颜色
   */
  private blend(
    baseR: number, baseG: number, baseB: number,
    overlayR: number, overlayG: number, overlayB: number,
    alpha: number,
    mode: string
  ): [number, number, number] {
    switch (mode) {
      case 'screen':
        return [
          Math.round(255 - (255 - baseR) * (255 - overlayR * alpha) / 255),
          Math.round(255 - (255 - baseG) * (255 - overlayG * alpha) / 255),
          Math.round(255 - (255 - baseB) * (255 - overlayB * alpha) / 255),
        ]
      case 'lighten':
        return [
          Math.max(baseR, Math.round(overlayR * alpha)),
          Math.max(baseG, Math.round(overlayG * alpha)),
          Math.max(baseB, Math.round(overlayB * alpha)),
        ]
      case 'add':
        return [
          Math.min(255, baseR + Math.round(overlayR * alpha)),
          Math.min(255, baseG + Math.round(overlayG * alpha)),
          Math.min(255, baseB + Math.round(overlayB * alpha)),
        ]
      case 'normal':
      default:
        return [
          Math.round(baseR * (1 - alpha) + overlayR * alpha),
          Math.round(baseG * (1 - alpha) + overlayG * alpha),
          Math.round(baseB * (1 - alpha) + overlayB * alpha),
        ]
    }
  }
}

/**
 * 十六进制颜色转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * 进度回调类型
 */
export type ProgressCallback = (progress: number, message: string) => void

/**
 * 获取或初始化 FFmpeg 实例
 */
async function getFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance
  }

  if (isLoading) {
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if (ffmpegInstance && isLoaded) {
      return ffmpegInstance
    }
  }

  isLoading = true

  try {
    const ffmpeg = new FFmpeg()

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg Ghost]', message)
    })

    ffmpeg.on('progress', ({ progress }) => {
      const pct = Math.round(progress * 100)
      onProgress?.(30 + pct * 0.6, `处理中... ${pct}%`)
    })

    onProgress?.(5, '下载核心模块...')
    
    // 下载核心文件
    const coreResponse = await fetch(`${FFMPEG_BASE_URL}/ffmpeg-core.js`)
    const coreBlob = await coreResponse.blob()
    const coreURL = URL.createObjectURL(coreBlob)

    onProgress?.(10, '下载 WASM 引擎...')
    const wasmResponse = await fetch(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`)
    const wasmBlob = await wasmResponse.blob()
    const wasmURL = URL.createObjectURL(wasmBlob)

    onProgress?.(25, '初始化引擎...')
    await ffmpeg.load({ coreURL, wasmURL })

    ffmpegInstance = ffmpeg
    isLoaded = true
    onProgress?.(30, '准备就绪')

    return ffmpeg
  } catch (error) {
    console.error('FFmpeg 加载失败:', error)
    isLoading = false
    throw new Error('FFmpeg 加载失败: ' + (error instanceof Error ? error.message : '网络错误'))
  } finally {
    isLoading = false
  }
}

/**
 * 使用 FFmpeg 处理视频添加动作重影效果
 */
export async function applyMotionGhostFFmpeg(
  videoFile: File | Blob,
  config: Partial<MotionGhostConfig> = {},
  onProgress?: ProgressCallback
): Promise<Blob> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  
  onProgress?.(0, '初始化中...')
  const ffmpeg = await getFFmpeg(onProgress)

  try {
    // 写入输入文件
    onProgress?.(30, '加载视频文件...')
    const inputData = new Uint8Array(await videoFile.arrayBuffer())
    await ffmpeg.writeFile('input.mp4', inputData)

    // 构建滤镜命令
    const filter = buildFFmpegFilter(fullConfig)
    
    onProgress?.(35, '开始处理...')
    
    // 执行 FFmpeg 命令
    const args = [
      '-i', 'input.mp4',
      '-vf', filter,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'copy',
      '-y',
      'output.mp4'
    ]

    console.log('[FFmpeg Ghost] 命令:', args.join(' '))
    await ffmpeg.exec(args)

    onProgress?.(92, '读取输出...')
    const outputData = await ffmpeg.readFile('output.mp4')
    
    // 清理
    await ffmpeg.deleteFile('input.mp4')
    await ffmpeg.deleteFile('output.mp4')

    onProgress?.(100, '处理完成')
    return new Blob([outputData], { type: 'video/mp4' })
  } catch (error) {
    console.error('动作重影处理失败:', error)
    throw new Error('处理失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 构建 FFmpeg 滤镜命令
 */
function buildFFmpegFilter(config: MotionGhostConfig): string {
  const { frameCount, decay, blendMode, tintColor } = config
  
  // 方案1：使用 tmix 滤镜（帧混合）
  // tmix 会混合连续的帧，创建重影效果
  const weights = Array.from({ length: frameCount }, (_, i) => 
    Math.pow(decay, frameCount - 1 - i).toFixed(2)
  ).join(' ')
  
  let filter = `tmix=frames=${frameCount}:weights='${weights}'`
  
  // 如果有颜色化，添加 colorbalance 或 hue
  if (tintColor) {
    const rgb = hexToRgb(tintColor)
    if (rgb) {
      // 使用 colorchannelmixer 来调整颜色
      // 这里简化处理，实际可以更精细
      filter += `,colorbalance=rs=${(rgb.r / 255 - 0.5).toFixed(2)}:gs=${(rgb.g / 255 - 0.5).toFixed(2)}:bs=${(rgb.b / 255 - 0.5).toFixed(2)}`
    }
  }
  
  // 根据混合模式可能需要额外处理
  // screen 模式需要特殊处理，这里使用 curves 来近似
  if (blendMode === 'screen' || blendMode === 'add') {
    filter += ',curves=all=0/0 0.25/0.35 0.5/0.6 0.75/0.85 1/1'
  }
  
  return filter
}

/**
 * 获取 FFmpeg lagfun 滤镜命令（另一种重影方式）
 * lagfun 创建更平滑的拖尾效果
 */
export function getLagfunFilter(decay: number = 0.95): string {
  return `lagfun=decay=${decay}`
}

/**
 * 检查 FFmpeg 是否已加载
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded
}

/**
 * 释放 FFmpeg 资源
 */
export function terminateFFmpeg(): void {
  if (ffmpegInstance) {
    ffmpegInstance.terminate()
    ffmpegInstance = null
    isLoaded = false
  }
}















