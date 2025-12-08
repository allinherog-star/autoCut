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

