import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FavoriteTargetType } from '@prisma/client'

// 默认用户ID（预留多用户支持）
const DEFAULT_USER_ID = 'default-user'

// GET /api/favorites - 获取收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('type') as FavoriteTargetType | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    const where = {
      userId: DEFAULT_USER_ID,
      ...(targetType && { targetType }),
    }

    const [favorites, total] = await Promise.all([
      prisma.userFavorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.userFavorite.count({ where }),
    ])

    // 获取收藏的目标详情
    const mediaIds = favorites
      .filter((f) => f.targetType === 'MEDIA')
      .map((f) => f.targetId)
    const templateIds = favorites
      .filter((f) => f.targetType === 'TEMPLATE')
      .map((f) => f.targetId)

    const [mediaItems, templateItems] = await Promise.all([
      mediaIds.length > 0
        ? prisma.media.findMany({ where: { id: { in: mediaIds } } })
        : [],
      templateIds.length > 0
        ? prisma.template.findMany({ where: { id: { in: templateIds } } })
        : [],
    ])

    // 合并结果
    const items = favorites.map((fav) => {
      if (fav.targetType === 'MEDIA') {
        const media = mediaItems.find((m) => m.id === fav.targetId)
        return { ...fav, target: media, targetData: media }
      } else {
        const template = templateItems.find((t) => t.id === fav.targetId)
        return { ...fav, target: template, targetData: template }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取收藏列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - 添加收藏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetId, targetType } = body

    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否已收藏
    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_targetId_targetType: {
          userId: DEFAULT_USER_ID,
          targetId,
          targetType,
        },
      },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: '已经收藏过了',
      })
    }

    const favorite = await prisma.userFavorite.create({
      data: {
        userId: DEFAULT_USER_ID,
        targetId,
        targetType,
      },
    })

    return NextResponse.json({
      success: true,
      data: favorite,
    })
  } catch (error) {
    console.error('添加收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '添加收藏失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const targetType = searchParams.get('targetType') as FavoriteTargetType | null

    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    await prisma.userFavorite.deleteMany({
      where: {
        userId: DEFAULT_USER_ID,
        targetId,
        targetType,
      },
    })

    return NextResponse.json({
      success: true,
      message: '取消收藏成功',
    })
  } catch (error) {
    console.error('取消收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '取消收藏失败' },
      { status: 500 }
    )
  }
}





