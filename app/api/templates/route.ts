import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TemplateType, AssetSource, FancyTextUsage } from '@prisma/client'

// GET /api/templates - 获取模版列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as TemplateType | null
    const source = searchParams.get('source') as AssetSource | null
    const usage = searchParams.get('usage') as FancyTextUsage | null
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (source) {
      where.source = source
    }

    if (usage) {
      where.fancyTextUsage = usage
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: [
          { usageCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: true,
        },
      }),
      prisma.template.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取模版列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取模版列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/templates - 创建模版
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      name,
      description,
      thumbnail,
      previewUrl,
      parameters,
      source = 'USER',
      fancyTextUsage,
      duration,
      tags = [],
    } = body

    if (!type || !name || !parameters) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: {
        type,
        name,
        description,
        thumbnail,
        previewUrl,
        parameters,
        source,
        fancyTextUsage,
        duration,
        tags: {
          create: tags.map((tagName: string) => ({ tagName })),
        },
      },
      include: {
        tags: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('创建模版失败:', error)
    return NextResponse.json(
      { success: false, error: '创建模版失败' },
      { status: 500 }
    )
  }
}













