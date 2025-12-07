/**
 * FFmpeg.wasm 字幕合成工具
 * 用于在浏览器端实现视频与字幕的烧录合成
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

// 视频缓存（避免重复下载）
const videoCache = new Map<string, Uint8Array>()

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
    // 下载并缓存字体（首次需要下载）
    if (!fontData) {
      onProgress?.(5, '下载字体文件...')
      fontData = await downloadAsUint8Array(
        FONT_URL,
        [5, 10],
        onProgress,
        '下载字体'
      )
    }
    await ffmpeg.writeFile('font.otf', fontData)

    // 检查视频缓存
    let videoData = videoCache.get(videoUrl)
    if (videoData) {
      onProgress?.(50, '使用缓存视频...')
    } else {
      // 下载视频文件（带进度显示）
      videoData = await downloadAsUint8Array(
        videoUrl,
        [10, 50],
        onProgress,
        '加载视频'
      )
      // 缓存视频数据
      videoCache.set(videoUrl, videoData)
    }
    await ffmpeg.writeFile('input.mp4', videoData)

    onProgress?.(55, '正在生成字幕...')

    // 调整字幕时间（相对于裁剪后的视频，因为 -ss 是 input seeking）
    const adjustedSubtitles = subtitles.map((sub) => ({
      ...sub,
      startTime: Math.max(0, sub.startTime - startTime),
      endTime: Math.max(0, sub.endTime - startTime),
    }))

    // 生成 SRT 字幕文件（更简单，兼容性更好）
    const srtContent = generateSrtSubtitle(adjustedSubtitles)
    console.log('[FFmpeg] SRT 字幕内容:\n', srtContent)
    const encoder = new TextEncoder()
    await ffmpeg.writeFile('subtitles.srt', encoder.encode(srtContent))

    onProgress?.(60, '正在合成视频...')

    // 获取第一条字幕的样式
    const style = adjustedSubtitles[0]?.style || { fontSize: 24, position: 'bottom' }
    const marginV = style.position === 'top' ? 50 : style.position === 'center' ? 0 : 50

    // 执行 FFmpeg 命令
    // 使用 subtitles 滤镜 + force_style 指定字体和样式
    const forceStyle = `FontName=font,FontSize=${style.fontSize},PrimaryColour=&HFFFFFF,OutlineColour=&H000000,BorderStyle=1,Outline=2,Shadow=1,MarginV=${marginV}`
    const ffmpegArgs = [
      '-ss', String(startTime),
      '-i', 'input.mp4',
      '-t', String(duration),
      '-vf', `subtitles=subtitles.srt:fontsdir=/:force_style='${forceStyle}'`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      'output.mp4'
    ]

    console.log('[FFmpeg] 执行命令:', ffmpegArgs.join(' '))
    await ffmpeg.exec(ffmpegArgs)

    onProgress?.(90, '正在导出...')

    // 读取输出文件
    const outputData = await ffmpeg.readFile('output.mp4')
    const blob = new Blob([outputData], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)

    // 清理临时文件
    await ffmpeg.deleteFile('input.mp4')
    await ffmpeg.deleteFile('subtitles.srt')
    await ffmpeg.deleteFile('output.mp4')

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
  videoCache.clear()
}

/**
 * 获取缓存的视频 URL 列表
 */
export function getCachedVideoUrls(): string[] {
  return Array.from(videoCache.keys())
}

/**
 * 检查 FFmpeg 是否已加载
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded
}

