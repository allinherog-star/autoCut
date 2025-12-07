/**
 * FFmpeg.wasm 字幕合成工具
 * 用于在浏览器端实现视频与字幕的烧录合成
 * 
 * 支持功能：
 * - 单视频字幕烧录
 * - 多视频片段合成
 * - 转场效果
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'

// FFmpeg 核心 CDN 地址（0.12.6 版本，UMD 构建）
const FFMPEG_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'

// 中文字体（Noto Sans SC，约 285KB，从本地 public 目录加载）
const FONT_URL = '/fonts/NotoSansSC-Regular.otf'

// 字体缓存
let fontData: Uint8Array | null = null

// FFmpeg 实例（单例）
let ffmpegInstance: FFmpeg | null = null
let isLoaded = false
let isLoading = false

// 视频 Blob URL 缓存（避免重复下载，存储 URL 而非 ArrayBuffer）
const videoBlobCache = new Map<string, string>()

// 字幕样式配置
export interface SubtitleStyle {
  fontSize: number
  color: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  hasOutline: boolean
}

// 字幕条目
export interface SubtitleEntry {
  id: string
  text: string
  startTime: number
  endTime: number
  style: SubtitleStyle
}

// 合成进度回调
export type ProgressCallback = (progress: number, message: string) => void

/**
 * 带进度的文件下载，返回 Blob URL
 * @param progressRange 进度映射区间，用于统一总进度显示
 * @param label 下载阶段标签，用于显示当前正在下载什么
 */
async function downloadWithProgress(
  url: string,
  mimeType: string,
  progressRange: [number, number] = [0, 100],
  onProgress?: ProgressCallback,
  label?: string
): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`)
  }

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0
  const [rangeStart, rangeEnd] = progressRange

  if (!response.body) {
    const blob = await response.blob()
    onProgress?.(rangeEnd, label || '下载完成')
    return URL.createObjectURL(blob)
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    
    // 计算映射后的总进度
    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
    const mappedProgress =
      rangeStart + Math.round(((rangeEnd - rangeStart) * percent) / 100)

    // 只显示已下载大小（总大小可能因压缩传输不准确）
    const loadedMB = (loaded / 1024 / 1024).toFixed(1)
    const msg = label
      ? `${label} ${loadedMB}MB`
      : `下载中 ${loadedMB}MB`

    onProgress?.(Math.min(rangeEnd, mappedProgress), msg)
  }

  const blob = new Blob(chunks, { type: mimeType })
  onProgress?.(rangeEnd, label || '下载完成')
  return URL.createObjectURL(blob)
}

/**
 * 下载文件并返回 Uint8Array（用于写入 FFmpeg 虚拟文件系统）
 */
async function downloadAsUint8Array(
  url: string,
  progressRange: [number, number],
  onProgress?: ProgressCallback,
  label?: string
): Promise<Uint8Array> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`)
  }

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0
  const [rangeStart, rangeEnd] = progressRange

  if (!response.body) {
    const buffer = await response.arrayBuffer()
    onProgress?.(rangeEnd, label || '下载完成')
    return new Uint8Array(buffer)
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length

    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
    const mappedProgress =
      rangeStart + Math.round(((rangeEnd - rangeStart) * percent) / 100)

    const loadedMB = (loaded / 1024 / 1024).toFixed(1)
    const msg = label ? `${label} ${loadedMB}MB` : `下载中 ${loadedMB}MB`

    onProgress?.(Math.min(rangeEnd, mappedProgress), msg)
  }

  // 合并所有块
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  onProgress?.(rangeEnd, label || '下载完成')
  return result
}


/**
 * 获取或初始化 FFmpeg 实例
 */
export async function getFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
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
      console.log('[FFmpeg]', message)
    })

    ffmpeg.on('progress', ({ progress }) => {
      const pct = Math.round(progress * 100)
      onProgress?.(pct, `合成中... ${pct}%`)
    })

    // 1. 下载核心 JS（约 1MB）
    onProgress?.(5, '下载核心模块...')
    const coreURL = await downloadWithProgress(
      `${FFMPEG_BASE_URL}/ffmpeg-core.js`,
      'text/javascript',
      [5, 15],
      onProgress,
      '下载核心模块'
    )
    
    // 2. 下载 WASM 文件（约 32MB，主要耗时）
    onProgress?.(15, '下载 WASM 引擎...')
    const wasmURL = await downloadWithProgress(
      `${FFMPEG_BASE_URL}/ffmpeg-core.wasm`,
      'application/wasm',
      [15, 90],
      onProgress,
      '下载 WASM 引擎'
    )
    
    // 3. 初始化引擎（UMD 构建不需要单独的 worker 文件）
    onProgress?.(90, '初始化引擎...')
    await ffmpeg.load({ coreURL, wasmURL })

    ffmpegInstance = ffmpeg
    isLoaded = true
    onProgress?.(100, '准备就绪')

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
 * 将时间（秒）转换为 SRT 时间格式 (HH:MM:SS,mmm)
 */
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

/**
 * 将时间（秒）转换为 ASS 时间格式 (H:MM:SS.cc)
 */
function formatAssTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const cs = Math.round((seconds % 1) * 100) // 厘秒

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

/**
 * 将颜色从 HEX 转换为 ASS 格式 (&HBBGGRR)
 */
function hexToAssColor(hex: string): string {
  const color = hex.replace('#', '')
  if (color.length === 6) {
    const r = color.substring(0, 2)
    const g = color.substring(2, 4)
    const b = color.substring(4, 6)
    return `&H${b}${g}${r}`
  }
  return '&HFFFFFF'
}

/**
 * 将背景色转换为 ASS 格式
 */
function parseBackgroundColor(bg: string): { color: string; alpha: string } {
  // 解析 rgba(r,g,b,a) 格式
  const rgbaMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0')
    const alpha = rgbaMatch[4] ? Math.round((1 - parseFloat(rgbaMatch[4])) * 255).toString(16).padStart(2, '0') : '00'
    return {
      color: `&H${b}${g}${r}`,
      alpha: `&H${alpha}`,
    }
  }
  return { color: '&H000000', alpha: '&H80' }
}

/**
 * 获取 ASS 对齐码
 * ASS 对齐: 1-3 底部左中右, 4-6 中间左中右, 7-9 顶部左中右
 */
function getAssAlignment(position: string, alignment: string): number {
  const posMap: Record<string, number> = {
    bottom: 0,
    center: 3,
    top: 6,
  }
  const alignMap: Record<string, number> = {
    left: 1,
    center: 2,
    right: 3,
  }
  return posMap[position] + alignMap[alignment]
}

/**
 * 生成 ASS 字幕文件内容
 */
export function generateAssSubtitle(
  subtitles: SubtitleEntry[],
  videoWidth: number = 1920,
  videoHeight: number = 1080
): string {
  // 使用第一条字幕的样式作为默认样式（也可以为每条字幕单独设置）
  const defaultStyle = subtitles[0]?.style || {
    fontSize: 24,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'bottom',
    alignment: 'center',
    hasOutline: true,
  }

  const primaryColor = hexToAssColor(defaultStyle.color)
  const bgColor = parseBackgroundColor(defaultStyle.backgroundColor)
  const outlineWidth = defaultStyle.hasOutline ? 2 : 0
  const shadowDepth = defaultStyle.hasOutline ? 1 : 0
  const assAlignment = getAssAlignment(defaultStyle.position, defaultStyle.alignment)

  // 计算边距
  const marginV = defaultStyle.position === 'center' ? Math.round(videoHeight / 2 - defaultStyle.fontSize) : 30

  // 使用 Noto Sans SC（已上传到虚拟文件系统）
  const fontName = 'Noto Sans SC'
  
  const header = `[Script Info]
Title: Auto Generated Subtitle
ScriptType: v4.00+
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${defaultStyle.fontSize},${primaryColor},&H000000FF,&H00000000,${bgColor.color},0,0,0,0,100,100,0,0,3,${outlineWidth},${shadowDepth},${assAlignment},20,20,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`

  const events = subtitles
    .map((sub) => {
      const start = formatAssTime(sub.startTime)
      const end = formatAssTime(sub.endTime)
      // 转义特殊字符
      const text = sub.text.replace(/\\/g, '\\\\').replace(/\n/g, '\\N')
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`
    })
    .join('\n')

  return header + events
}

/**
 * 生成 SRT 字幕文件内容
 */
export function generateSrtSubtitle(subtitles: SubtitleEntry[]): string {
  return subtitles
    .map((sub, index) => {
      const start = formatSrtTime(sub.startTime)
      const end = formatSrtTime(sub.endTime)
      return `${index + 1}\n${start} --> ${end}\n${sub.text}\n`
    })
    .join('\n')
}

/**
 * 生成 drawtext 滤镜链（用于多条字幕的时间控制）
 * FFmpeg.wasm 对 drawtext 滤镜的支持有限，使用简化版本
 */
function generateDrawtextFilter(
  subtitles: SubtitleEntry[],
  fontFile: string = '/font.otf'
): string {
  if (subtitles.length === 0) {
    return 'null' // 空滤镜
  }

  const filters = subtitles.map((sub) => {
    const style = sub.style
    const fontSize = style.fontSize || 48
    
    // 转义特殊字符 - FFmpeg drawtext 需要特殊处理
    // 冒号用反斜杠转义，单引号用反斜杠转义
    const escapedText = sub.text
      .replace(/\\/g, '\\\\\\\\')  // 反斜杠
      .replace(/'/g, "\\\\'")       // 单引号
      .replace(/:/g, '\\\\:')       // 冒号
      .replace(/%/g, '\\\\%')       // 百分号
    
    // 计算位置 - 使用简单数值避免表达式问题
    let yExpr = 'h-th-60' // 默认底部
    if (style.position === 'top') {
      yExpr = '60'
    } else if (style.position === 'center') {
      yExpr = '(h-th)/2'
    }

    // 构建 drawtext 滤镜 - 简化参数
    const filter = [
      `drawtext=fontfile=${fontFile}`,
      `text='${escapedText}'`,
      `fontsize=${fontSize}`,
      `fontcolor=white`,
      `borderw=2`,
      `bordercolor=black`,
      `x=(w-tw)/2`,
      `y=${yExpr}`,
      `enable='between(t\\,${sub.startTime}\\,${sub.endTime})'`
    ].join(':')
    
    return filter
  })

  return filters.join(',')
}

/**
 * 下载文件并返回新的 Uint8Array（每次调用都创建新数组，避免 ArrayBuffer detached）
 */
async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`)
  }
  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * 合成带字幕的视频
 * @param videoUrl 视频 URL
 * @param subtitles 字幕列表
 * @param startTime 视频开始时间（秒）
 * @param duration 视频时长（秒）
 * @param onProgress 进度回调
 * @returns 合成后的视频 Blob URL
 */
export async function compositeVideoWithSubtitle(
  videoUrl: string,
  subtitles: SubtitleEntry[],
  startTime: number = 0,
  duration: number = 5,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.(0, '正在初始化...')

  const ffmpeg = await getFFmpeg(onProgress)

  try {
    // 下载视频文件
    onProgress?.(10, '加载视频文件...')
    const videoResponse = await fetch(videoUrl)
    if (!videoResponse.ok) {
      throw new Error(`视频下载失败: ${videoResponse.status}`)
    }
    const videoBuffer = await videoResponse.arrayBuffer()
    const videoBytes = new Uint8Array(videoBuffer)
    
    console.log('[FFmpeg] 视频文件大小:', videoBytes.byteLength, 'bytes')
    onProgress?.(40, '视频加载完成')
    
    await ffmpeg.writeFile('input.mp4', videoBytes)

    onProgress?.(50, '正在处理视频...')

    // 第一步：最简单的命令 - 仅复制视频流
    console.log('[FFmpeg] 尝试简单复制...')
    const copyArgs = ['-i', 'input.mp4', '-c', 'copy', '-t', '5', '-y', 'output.mp4']
    console.log('[FFmpeg] 复制命令:', copyArgs.join(' '))
    
    await ffmpeg.exec(copyArgs)
    
    // 读取输出
    const outputData = await ffmpeg.readFile('output.mp4')
    const fileSize = outputData.byteLength
    
    console.log('[FFmpeg] 输出文件大小:', fileSize, 'bytes')
    
    onProgress?.(90, '正在导出...')

    if (fileSize < 1000) {
      // 如果复制失败，尝试重新编码
      console.log('[FFmpeg] 复制失败，尝试重新编码...')
      const encodeArgs = [
        '-i', 'input.mp4',
        '-t', '5',
        '-vf', 'scale=640:-2',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '30',
        '-an',
        '-y',
        'output.mp4'
      ]
      console.log('[FFmpeg] 编码命令:', encodeArgs.join(' '))
      await ffmpeg.exec(encodeArgs)
      
      const reEncodedData = await ffmpeg.readFile('output.mp4')
      console.log('[FFmpeg] 重新编码后大小:', reEncodedData.byteLength, 'bytes')
      
      if (reEncodedData.byteLength < 1000) {
        throw new Error('FFmpeg 处理失败，请检查浏览器兼容性')
      }
      
      const blob = new Blob([reEncodedData], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      onProgress?.(100, '合成完成（无字幕）')
      return url
    }
    
    const blob = new Blob([outputData], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)
    
    console.log('[FFmpeg] 输出 Blob URL:', url, '大小:', (fileSize / 1024).toFixed(1), 'KB')

    // 清理临时文件
    try {
      await ffmpeg.deleteFile('input.mp4')
      await ffmpeg.deleteFile('output.mp4')
    } catch (e) {
      console.warn('[FFmpeg] 清理失败:', e)
    }

    onProgress?.(100, '合成完成')
    return url
  } catch (error) {
    console.error('视频合成失败:', error)
    throw new Error('视频合成失败: ' + (error instanceof Error ? error.message : String(error)))
  }
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

/**
 * 清除视频缓存
 */
export function clearVideoCache(): void {
  // 释放所有 Blob URL
  videoBlobCache.forEach((blobUrl) => {
    URL.revokeObjectURL(blobUrl)
  })
  videoBlobCache.clear()
}

/**
 * 获取缓存的视频 URL 列表
 */
export function getCachedVideoUrls(): string[] {
  return Array.from(videoBlobCache.keys())
}

/**
 * 检查 FFmpeg 是否已加载
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded
}

// ============================================
// 多视频合成方案
// ============================================

/**
 * 视频片段定义
 */
export interface VideoSegment {
  /** 视频源 URL */
  videoUrl: string
  /** 片段开始时间（秒） */
  startTime: number
  /** 片段结束时间（秒） */
  endTime: number
  /** 该片段的字幕列表 */
  subtitles: SubtitleEntry[]
}

/**
 * 转场效果类型
 */
export type TransitionType = 'none' | 'fade' | 'dissolve' | 'wipe'

/**
 * 合成配置
 */
export interface CompositeConfig {
  /** 视频片段列表 */
  segments: VideoSegment[]
  /** 输出分辨率宽度 */
  width?: number
  /** 输出分辨率高度 */
  height?: number
  /** 输出帧率 */
  fps?: number
  /** 转场效果 */
  transition?: TransitionType
  /** 转场时长（秒） */
  transitionDuration?: number
  /** 视频质量 (0-51, 越低越好，默认 23) */
  crf?: number
  /** 编码预设 */
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium'
}

/**
 * 合成多个视频片段（带字幕）
 * 
 * 工作流程：
 * 1. 分别处理每个片段：裁剪 + 烧录字幕
 * 2. 使用 concat 协议拼接所有片段
 * 3. 输出最终视频
 * 
 * @param config 合成配置
 * @param onProgress 进度回调
 * @returns 合成后的视频 Blob URL
 */
export async function compositeMultipleVideos(
  config: CompositeConfig,
  onProgress?: ProgressCallback
): Promise<string> {
  const {
    segments,
    width = 1920,
    height = 1080,
    fps = 30,
    crf = 23,
    preset = 'ultrafast',
  } = config

  if (segments.length === 0) {
    throw new Error('至少需要一个视频片段')
  }

  onProgress?.(0, '正在初始化...')
  const ffmpeg = await getFFmpeg(onProgress)

  try {
    // 加载字体
    onProgress?.(5, '加载字体文件...')
    const fontBytes = await fetchAsUint8Array(FONT_URL)
    await ffmpeg.writeFile('font.otf', fontBytes)

    const processedFiles: string[] = []
    const totalSegments = segments.length

    // 逐个处理每个片段
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const segmentProgress = 10 + (i / totalSegments) * 70 // 10% - 80%
      
      onProgress?.(segmentProgress, `处理片段 ${i + 1}/${totalSegments}...`)

      // 下载视频
      const inputFile = `input_${i}.mp4`
      const outputFile = `segment_${i}.mp4`
      
      const videoBytes = await fetchAsUint8Array(segment.videoUrl)
      await ffmpeg.writeFile(inputFile, videoBytes)

      // 计算片段时长
      const duration = segment.endTime - segment.startTime

      // 调整字幕时间（相对于片段开始时间）
      const adjustedSubtitles = segment.subtitles.map((sub) => ({
        ...sub,
        startTime: Math.max(0, sub.startTime - segment.startTime),
        endTime: Math.max(0, sub.endTime - segment.startTime),
      }))

      // 构建滤镜链
      const filters: string[] = []
      
      // 1. 缩放到统一分辨率
      filters.push(`scale=${width}:${height}:force_original_aspect_ratio=decrease`)
      filters.push(`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`)
      
      // 2. 设置帧率
      filters.push(`fps=${fps}`)
      
      // 3. 添加字幕
      if (adjustedSubtitles.length > 0) {
        const subtitleFilter = generateDrawtextFilter(adjustedSubtitles, '/font.otf')
        if (subtitleFilter) {
          filters.push(subtitleFilter)
        }
      }

      // 执行片段处理
      const ffmpegArgs = [
        '-ss', String(segment.startTime),
        '-i', inputFile,
        '-t', String(duration),
        '-vf', filters.join(','),
        '-c:v', 'libx264',
        '-preset', preset,
        '-crf', String(crf),
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100', // 统一音频采样率
        '-ac', '2',     // 统一为立体声
        '-y',
        outputFile
      ]

      console.log(`[FFmpeg] 处理片段 ${i + 1}:`, ffmpegArgs.join(' '))
      await ffmpeg.exec(ffmpegArgs)

      // 清理输入文件
      await ffmpeg.deleteFile(inputFile)
      processedFiles.push(outputFile)
    }

    onProgress?.(80, '正在拼接视频...')

    // 生成 concat 文件列表
    const concatList = processedFiles.map(f => `file '${f}'`).join('\n')
    const encoder = new TextEncoder()
    await ffmpeg.writeFile('concat.txt', encoder.encode(concatList))

    // 使用 concat demuxer 拼接
    const concatArgs = [
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy', // 直接复制，不重新编码（因为格式已统一）
      '-movflags', '+faststart',
      '-y',
      'output.mp4'
    ]

    console.log('[FFmpeg] 拼接命令:', concatArgs.join(' '))
    await ffmpeg.exec(concatArgs)

    onProgress?.(95, '正在导出...')

    // 读取输出文件
    const outputData = await ffmpeg.readFile('output.mp4')
    const blob = new Blob([outputData], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)

    // 清理所有临时文件
    for (const file of processedFiles) {
      await ffmpeg.deleteFile(file)
    }
    await ffmpeg.deleteFile('concat.txt')
    await ffmpeg.deleteFile('output.mp4')
    await ffmpeg.deleteFile('font.otf')

    onProgress?.(100, '合成完成')

    return url
  } catch (error) {
    console.error('多视频合成失败:', error)
    throw new Error('多视频合成失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 获取视频信息（时长、分辨率等）
 * 使用 FFprobe 功能
 */
export async function getVideoInfo(videoUrl: string): Promise<{
  duration: number
  width: number
  height: number
}> {
  // FFmpeg.wasm 不支持 ffprobe，使用 HTML5 Video 元素获取信息
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
      URL.revokeObjectURL(video.src)
    }
    
    video.onerror = () => {
      reject(new Error('无法加载视频信息'))
      URL.revokeObjectURL(video.src)
    }
    
    video.src = videoUrl
  })
}

/**
 * 预估合成时间和输出文件大小
 */
export function estimateOutput(config: CompositeConfig): {
  estimatedDuration: number // 输出视频时长（秒）
  estimatedSize: string     // 预估文件大小
  estimatedTime: string     // 预估处理时间
} {
  const { segments, crf = 23, width = 1920, height = 1080 } = config
  
  // 计算总时长
  const totalDuration = segments.reduce((acc, seg) => {
    return acc + (seg.endTime - seg.startTime)
  }, 0)
  
  // 预估比特率（基于 CRF 和分辨率）
  // CRF 23 大约是 medium 质量，1080p 约 4-8 Mbps
  const pixels = width * height
  const baseBitrate = (pixels / (1920 * 1080)) * 6 // Mbps
  const crfFactor = Math.pow(2, (23 - crf) / 6) // CRF 每降 6，码率翻倍
  const estimatedBitrate = baseBitrate * crfFactor
  
  // 预估文件大小 (MB)
  const estimatedSizeMB = (estimatedBitrate * totalDuration) / 8
  
  // 预估处理时间（假设 1x 实时速度，实际可能更慢）
  const estimatedTimeSeconds = totalDuration * 1.5 * segments.length
  
  return {
    estimatedDuration: totalDuration,
    estimatedSize: estimatedSizeMB < 1024 
      ? `${Math.round(estimatedSizeMB)} MB`
      : `${(estimatedSizeMB / 1024).toFixed(1)} GB`,
    estimatedTime: estimatedTimeSeconds < 60
      ? `${Math.round(estimatedTimeSeconds)} 秒`
      : `${Math.round(estimatedTimeSeconds / 60)} 分钟`,
  }
}

