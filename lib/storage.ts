import { writeFile, mkdir, unlink, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// 存储配置
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos')
const IMAGE_DIR = path.join(UPLOAD_DIR, 'images')
const AUDIO_DIR = path.join(UPLOAD_DIR, 'audio')

// 支持的文件类型
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
]

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
]

// 字体文件类型
export const SUPPORTED_FONT_TYPES = [
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2',
  'application/x-font-ttf',
  'application/x-font-otf',
  'application/font-woff',
  'application/font-woff2',
]

// JSON/配置文件类型（用于特效、转场、模版等）
export const SUPPORTED_CONFIG_TYPES = [
  'application/json',
]

// 素材类别
export type MediaCategory = 
  | 'video' 
  | 'image' 
  | 'audio' 
  | 'sound_effect'
  | 'fancy_text' 
  | 'font' 
  | 'sticker' 
  | 'emotion'
  | 'effect' 
  | 'transition'
  | 'template'

/**
 * 获取文件类型分类（基于 MIME 类型）
 */
export function getMediaCategory(mimeType: string): MediaCategory | null {
  if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) return 'video'
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (SUPPORTED_AUDIO_TYPES.includes(mimeType)) return 'audio'
  if (SUPPORTED_FONT_TYPES.includes(mimeType)) return 'font'
  if (SUPPORTED_CONFIG_TYPES.includes(mimeType)) return 'effect' // 默认为特效
  return null
}

/**
 * 检查文件类型是否支持
 */
export function isSupportedType(mimeType: string): boolean {
  return (
    SUPPORTED_VIDEO_TYPES.includes(mimeType) ||
    SUPPORTED_IMAGE_TYPES.includes(mimeType) ||
    SUPPORTED_AUDIO_TYPES.includes(mimeType) ||
    SUPPORTED_FONT_TYPES.includes(mimeType) ||
    SUPPORTED_CONFIG_TYPES.includes(mimeType)
  )
}

/**
 * 根据指定类别验证文件类型
 */
export function isValidTypeForCategory(mimeType: string, category: MediaCategory): boolean {
  switch (category) {
    case 'video':
      return SUPPORTED_VIDEO_TYPES.includes(mimeType)
    case 'image':
    case 'fancy_text':
    case 'sticker':
    case 'emotion':
      return SUPPORTED_IMAGE_TYPES.includes(mimeType)
    case 'audio':
    case 'sound_effect':
      return SUPPORTED_AUDIO_TYPES.includes(mimeType)
    case 'font':
      return SUPPORTED_FONT_TYPES.includes(mimeType)
    case 'effect':
    case 'transition':
    case 'template':
      return SUPPORTED_CONFIG_TYPES.includes(mimeType) || SUPPORTED_VIDEO_TYPES.includes(mimeType) || SUPPORTED_IMAGE_TYPES.includes(mimeType)
    default:
      return false
  }
}

// 新增存储目录
const FONT_DIR = path.join(UPLOAD_DIR, 'fonts')
const EFFECT_DIR = path.join(UPLOAD_DIR, 'effects')
const STICKER_DIR = path.join(UPLOAD_DIR, 'stickers')
const EMOTION_DIR = path.join(UPLOAD_DIR, 'emotions')
const TRANSITION_DIR = path.join(UPLOAD_DIR, 'transitions')
const TEMPLATE_DIR = path.join(UPLOAD_DIR, 'templates')
const FANCY_TEXT_DIR = path.join(UPLOAD_DIR, 'fancy_texts')
const SOUND_EFFECT_DIR = path.join(UPLOAD_DIR, 'sound_effects')

/**
 * 获取存储目录
 */
function getStorageDir(category: MediaCategory): string {
  switch (category) {
    case 'video':
      return VIDEO_DIR
    case 'image':
      return IMAGE_DIR
    case 'audio':
      return AUDIO_DIR
    case 'sound_effect':
      return SOUND_EFFECT_DIR
    case 'font':
      return FONT_DIR
    case 'effect':
      return EFFECT_DIR
    case 'sticker':
      return STICKER_DIR
    case 'emotion':
      return EMOTION_DIR
    case 'transition':
      return TRANSITION_DIR
    case 'template':
      return TEMPLATE_DIR
    case 'fancy_text':
      return FANCY_TEXT_DIR
    default:
      return UPLOAD_DIR
  }
}

/**
 * 获取存储子路径
 */
function getStorageSubPath(category: MediaCategory): string {
  switch (category) {
    case 'video':
      return 'videos'
    case 'image':
      return 'images'
    case 'audio':
      return 'audio'
    case 'sound_effect':
      return 'sound_effects'
    case 'font':
      return 'fonts'
    case 'effect':
      return 'effects'
    case 'sticker':
      return 'stickers'
    case 'emotion':
      return 'emotions'
    case 'transition':
      return 'transitions'
    case 'template':
      return 'templates'
    case 'fancy_text':
      return 'fancy_texts'
    default:
      return 'misc'
  }
}

/**
 * 确保目录存在
 */
async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

/**
 * 从原始文件名提取扩展名
 */
function getExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  return ext || ''
}

/**
 * 存储接口
 */
export interface StorageResult {
  filename: string // 存储的文件名 (uuid.ext)
  path: string // 相对于 public 的路径
  fullPath: string // 完整文件系统路径
  url: string // 可访问的 URL
}

/**
 * 存储文件
 */
export async function saveFile(
  file: File | Buffer,
  originalFilename: string,
  mimeType: string,
  category?: MediaCategory
): Promise<StorageResult> {
  // 如果没有指定类别，自动推断
  const mediaCategory = category || getMediaCategory(mimeType)
  if (!mediaCategory) {
    throw new Error(`Unsupported file type: ${mimeType}`)
  }

  const storageDir = getStorageDir(mediaCategory)
  await ensureDir(storageDir)

  const ext = getExtension(originalFilename)
  const filename = `${uuidv4()}${ext}`
  const fullPath = path.join(storageDir, filename)
  const subPath = getStorageSubPath(mediaCategory)
  const relativePath = `/uploads/${subPath}/${filename}`

  // 获取文件数据
  let buffer: Buffer
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else {
    buffer = file
  }

  // 写入文件
  await writeFile(fullPath, buffer)

  return {
    filename,
    path: relativePath,
    fullPath,
    url: relativePath,
  }
}

/**
 * 删除文件
 */
export async function deleteFile(relativePath: string): Promise<boolean> {
  try {
    const safeRelativePath = relativePath.startsWith('/')
      ? relativePath.slice(1)
      : relativePath
    const fullPath = path.join(process.cwd(), 'public', safeRelativePath)
    await unlink(fullPath)
    return true
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    const safeRelativePath = relativePath.startsWith('/')
      ? relativePath.slice(1)
      : relativePath
    const fullPath = path.join(process.cwd(), 'public', safeRelativePath)
    await stat(fullPath)
    return true
  } catch {
    return false
  }
}

/**
 * 获取文件大小限制（字节）
 */
export function getMaxFileSize(): number {
  const maxSize = process.env.MAX_FILE_SIZE
  return maxSize ? parseInt(maxSize, 10) : 500 * 1024 * 1024 // 默认 500MB
}

/**
 * 初始化存储目录
 */
export async function initStorage(): Promise<void> {
  await ensureDir(UPLOAD_DIR)
  await ensureDir(VIDEO_DIR)
  await ensureDir(IMAGE_DIR)
  await ensureDir(AUDIO_DIR)
  await ensureDir(SOUND_EFFECT_DIR)
  await ensureDir(FONT_DIR)
  await ensureDir(EFFECT_DIR)
  await ensureDir(STICKER_DIR)
  await ensureDir(EMOTION_DIR)
  await ensureDir(TRANSITION_DIR)
  await ensureDir(TEMPLATE_DIR)
  await ensureDir(FANCY_TEXT_DIR)
}

