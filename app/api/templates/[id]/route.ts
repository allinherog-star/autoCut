import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates/[id] - 获取单个模版
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: '模版不存在' },
        { status: 404 }
      )
    }

    // 增加浏览次数
    await prisma.template.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('获取模版失败:', error)
    return NextResponse.json(
      { success: false, error: '获取模版失败' },
      { status: 500 }
    )
  }
}

// PUT /api/templates/[id] - 更新模版
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      thumbnail,
      previewUrl,
      parameters,
      fancyTextUsage,
      duration,
      tags,
    } = body

    // 更新模版
    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(thumbnail && { thumbnail }),
        ...(previewUrl && { previewUrl }),
        ...(parameters && { parameters }),
        ...(fancyTextUsage && { fancyTextUsage }),
        ...(duration !== undefined && { duration }),
      },
      include: {
        tags: true,
      },
    })

    // 更新标签
    if (tags) {
      // 删除旧标签
      await prisma.templateTag.deleteMany({ where: { templateId: id } })
      // 创建新标签
      await prisma.templateTag.createMany({
        data: tags.map((tagName: string) => ({ templateId: id, tagName })),
      })
    }

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('更新模版失败:', error)
    return NextResponse.json(
      { success: false, error: '更新模版失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates/[id] - 删除模版
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.template.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除模版失败:', error)
    return NextResponse.json(
      { success: false, error: '删除模版失败' },
      { status: 500 }
    )
  }
}





