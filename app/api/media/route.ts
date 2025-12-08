import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  saveFile,
  getMediaCategory,
  isSupportedType,
  getMaxFileSize,
  initStorage,
} from '@/lib/storage'
import { MediaType } from '@prisma/client'

// 统一响应格式
function successResponse<T>(data: T) {
  return NextResponse.json({ success: true, data })
}

function errorResponse(error: string, code: string, status: number = 400) {
  return NextResponse.json({ success: false, error, code }, { status })
}

/**
 * POST /api/media - 上传素材
 */
export async function POST(request: NextRequest) {
  try {
    // 确保存储目录存在
    await initStorage()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return errorResponse('No file provided', 'NO_FILE', 400)
    }

    // 检查文件类型
    if (!isSupportedType(file.type)) {
      return errorResponse(
        `Unsupported file type: ${file.type}. Supported types: video/mp4, video/webm, image/jpeg, image/png, etc.`,
        'UNSUPPORTED_TYPE',
        400
      )
    }

    // 检查文件大小
    const maxSize = getMaxFileSize()
    if (file.size > maxSize) {
      return errorResponse(
        `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
        'FILE_TOO_LARGE',
        400
      )
    }

    // 保存文件
    const storageResult = await saveFile(file, file.name, file.type)

    // 获取媒体类型
    const category = getMediaCategory(file.type)
    let mediaType: MediaType
    switch (category) {
      case 'video':
        mediaType = MediaType.VIDEO
        break
      case 'image':
        mediaType = MediaType.IMAGE
        break
      case 'audio':
        mediaType = MediaType.AUDIO
        break
      default:
        mediaType = MediaType.VIDEO
    }

    // 创建数据库记录
    const media = await prisma.media.create({
      data: {
        name: file.name,
        filename: storageResult.filename,
        type: mediaType,
        mimeType: file.type,
        size: file.size,
        path: storageResult.path,
      },
    })

    return successResponse(media)
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse('Failed to upload file', 'UPLOAD_FAILED', 500)
  }
}

/**
 * GET /api/media - 获取素材列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // 筛选参数
    const type = searchParams.get('type') as MediaType | null
    const search = searchParams.get('search')

    // 构建查询条件
    const where: {
      type?: MediaType
      name?: { contains: string }
    } = {}

    if (type && Object.values(MediaType).includes(type)) {
      where.type = type
    }

    if (search) {
      where.name = { contains: search }
    }

    // 并行查询数据和总数
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ])

    return successResponse({
      items: media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List error:', error)
    return errorResponse('Failed to fetch media list', 'LIST_FAILED', 500)
  }
}

