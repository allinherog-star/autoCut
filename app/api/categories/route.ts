import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CategoryDimension } from '@prisma/client'

// 统一响应格式
function successResponse<T>(data: T) {
  return NextResponse.json({ success: true, data })
}

function errorResponse(error: string, code: string, status: number = 400) {
  return NextResponse.json({ success: false, error, code }, { status })
}

/**
 * GET /api/categories - 获取分类标签
 * 
 * Query params:
 * - dimension: 指定维度（EMOTION, INDUSTRY, STYLE, SCENE, PLATFORM, TEMPO, MOOD）
 * - all: 如果为 true，返回所有维度的标签（按维度分组）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dimension = searchParams.get('dimension') as CategoryDimension | null
    const all = searchParams.get('all') === 'true'

    if (all) {
      // 返回所有维度的标签（按维度分组）
      const allTags = await prisma.categoryTag.findMany({
        orderBy: [{ dimension: 'asc' }, { sortOrder: 'asc' }],
      })

      // 按维度分组
      const grouped = allTags.reduce(
        (acc, tag) => {
          if (!acc[tag.dimension]) {
            acc[tag.dimension] = []
          }
          acc[tag.dimension].push(tag)
          return acc
        },
        {} as Record<string, typeof allTags>
      )

      // 维度元数据
      const dimensionMeta: Record<string, { name: string; description: string }> = {
        EMOTION: { name: '情绪', description: '内容传达的情感色彩' },
        INDUSTRY: { name: '行业', description: '内容所属的垂直领域' },
        STYLE: { name: '风格', description: '内容的调性和表达方式' },
        SCENE: { name: '场景', description: '素材适用的视频位置' },
        PLATFORM: { name: '平台', description: '适配的发布平台' },
        TEMPO: { name: '节奏', description: '剪辑的速度感' },
        MOOD: { name: '氛围', description: '画面的整体调性' },
      }

      return successResponse({
        dimensions: Object.entries(grouped).map(([dim, tags]) => ({
          dimension: dim,
          ...dimensionMeta[dim],
          tags,
        })),
      })
    }

    // 查询条件
    const where = dimension ? { dimension } : {}

    const tags = await prisma.categoryTag.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse({ tags })
  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse('Failed to fetch categories', 'FETCH_FAILED', 500)
  }
}

/**
 * POST /api/categories - 创建用户自定义标签
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dimension, name, color, description } = body

    // 验证必填字段
    if (!dimension || !name) {
      return errorResponse('维度和名称为必填项', 'VALIDATION_ERROR', 400)
    }

    // 验证维度是否有效
    if (!Object.values(CategoryDimension).includes(dimension)) {
      return errorResponse('无效的维度', 'INVALID_DIMENSION', 400)
    }

    // 检查是否已存在相同名称的标签
    const existing = await prisma.categoryTag.findUnique({
      where: { dimension_name: { dimension, name } },
    })

    if (existing) {
      return errorResponse('该维度下已存在相同名称的标签', 'DUPLICATE_TAG', 400)
    }

    // 获取当前维度的最大排序值
    const maxSort = await prisma.categoryTag.findFirst({
      where: { dimension },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    // 创建用户自定义标签
    const tag = await prisma.categoryTag.create({
      data: {
        dimension,
        name,
        color: color || '#808080',
        description: description || '',
        sortOrder: (maxSort?.sortOrder || 0) + 1,
        isSystem: false, // 用户创建的标签
      },
    })

    return successResponse(tag)
  } catch (error) {
    console.error('Create category error:', error)
    return errorResponse('创建标签失败', 'CREATE_FAILED', 500)
  }
}

/**
 * DELETE /api/categories - 删除用户自定义标签
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('缺少标签 ID', 'MISSING_ID', 400)
    }

    // 检查标签是否存在
    const tag = await prisma.categoryTag.findUnique({
      where: { id },
    })

    if (!tag) {
      return errorResponse('标签不存在', 'NOT_FOUND', 404)
    }

    // 不允许删除系统标签
    if (tag.isSystem) {
      return errorResponse('系统标签不能删除', 'SYSTEM_TAG', 403)
    }

    // 删除标签
    await prisma.categoryTag.delete({
      where: { id },
    })

    return successResponse({ id, deleted: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return errorResponse('删除标签失败', 'DELETE_FAILED', 500)
  }
}

