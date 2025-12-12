import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage'

// 统一响应格式
function successResponse<T>(data: T) {
  return NextResponse.json({ success: true, data })
}

function errorResponse(error: string, code: string, status: number = 400) {
  return NextResponse.json({ success: false, error, code }, { status })
}

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/media/[id] - 获取单个素材
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    })

    if (!media) {
      return errorResponse('Media not found', 'NOT_FOUND', 404)
    }

    return successResponse(media)
  } catch (error) {
    console.error('Get media error:', error)
    return errorResponse('Failed to fetch media', 'FETCH_FAILED', 500)
  }
}

/**
 * DELETE /api/media/[id] - 删除素材
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // 先查找素材
    const media = await prisma.media.findUnique({
      where: { id },
    })

    if (!media) {
      return errorResponse('Media not found', 'NOT_FOUND', 404)
    }

    // 删除文件
    await deleteFile(media.path)

    // 删除缩略图（如果存在）
    if (media.thumbnailPath) {
      await deleteFile(media.thumbnailPath)
    }

    // 删除数据库记录
    await prisma.media.delete({
      where: { id },
    })

    return successResponse({ id, deleted: true })
  } catch (error) {
    console.error('Delete media error:', error)
    return errorResponse('Failed to delete media', 'DELETE_FAILED', 500)
  }
}

/**
 * PATCH /api/media/[id] - 更新素材信息
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // 检查素材是否存在
    const existing = await prisma.media.findUnique({
      where: { id },
    })

    if (!existing) {
      return errorResponse('Media not found', 'NOT_FOUND', 404)
    }

    // 只允许更新特定字段
    const allowedFields = ['name', 'duration', 'width', 'height']
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', 'NO_FIELDS', 400)
    }

    // 更新数据库记录
    const media = await prisma.media.update({
      where: { id },
      data: updateData,
    })

    return successResponse(media)
  } catch (error) {
    console.error('Update media error:', error)
    return errorResponse('Failed to update media', 'UPDATE_FAILED', 500)
  }
}










