import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FavoriteTargetType } from '@prisma/client'

const DEFAULT_USER_ID = 'default-user'

// GET /api/favorites/check - 检查是否已收藏
export async function GET(request: NextRequest) {
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

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_targetId_targetType: {
          userId: DEFAULT_USER_ID,
          targetId,
          targetType,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favorite,
      },
    })
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    return NextResponse.json(
      { success: false, error: '检查收藏状态失败' },
      { status: 500 }
    )
  }
}

// POST /api/favorites/check - 批量检查收藏状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body // [{ targetId, targetType }]

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: DEFAULT_USER_ID,
        OR: items.map((item: { targetId: string; targetType: FavoriteTargetType }) => ({
          targetId: item.targetId,
          targetType: item.targetType,
        })),
      },
    })

    // 构建结果映射
    const favoriteMap: Record<string, boolean> = {}
    favorites.forEach((fav) => {
      favoriteMap[`${fav.targetType}:${fav.targetId}`] = true
    })

    return NextResponse.json({
      success: true,
      data: {
        favoriteMap,
        favorites,
      },
    })
  } catch (error) {
    console.error('批量检查收藏状态失败:', error)
    return NextResponse.json(
      { success: false, error: '批量检查收藏状态失败' },
      { status: 500 }
    )
  }
}




