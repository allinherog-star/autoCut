/**
 * 模版 API 客户端
 */

import type { FancyTextTemplate } from '@/lib/fancy-text/types'

export type TemplateType = 'VIDEO_TEMPLATE' | 'IMAGE_TEMPLATE' | 'FANCY_TEXT_TEMPLATE'
export type TemplateSource = 'SYSTEM' | 'USER' | 'AI_CRAWL' | 'AI_GENERATED'
export type FancyTextUsageType = 
  | 'TITLE' 
  | 'CHAPTER_TITLE' 
  | 'GUIDE' 
  | 'EMPHASIS' 
  | 'PERSON_INTRO' 
  | 'DIALOGUE' 
  | 'ANNOTATION' 
  | 'CALL_TO_ACTION'

export interface Template {
  id: string
  type: TemplateType
  name: string
  description?: string
  thumbnail?: string
  previewUrl?: string
  parameters: any // JSON
  source: TemplateSource
  userId?: string
  isPublic: boolean
  usageCount: number
  likes: number
  views: number
  downloads: number
  fancyTextUsage?: FancyTextUsageType
  duration?: number
  createdAt: string
  updatedAt: string
  tags: Array<{ id: string; tagName: string }>
}

export interface TemplateListResponse {
  success: boolean
  data?: {
    items: Template[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

/**
 * 获取模版列表
 */
export async function getTemplates(params?: {
  type?: TemplateType
  source?: TemplateSource
  usage?: FancyTextUsageType
  search?: string
  page?: number
  limit?: number
}): Promise<TemplateListResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.source) searchParams.set('source', params.source)
    if (params?.usage) searchParams.set('usage', params.usage)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))

    const response = await fetch(`/api/templates?${searchParams}`)
    return await response.json()
  } catch (error) {
    console.error('获取模版列表失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 获取单个模版
 */
export async function getTemplate(id: string): Promise<{ success: boolean; data?: Template; error?: string }> {
  try {
    const response = await fetch(`/api/templates/${id}`)
    return await response.json()
  } catch (error) {
    console.error('获取模版失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 创建模版
 */
export async function createTemplate(data: {
  type: TemplateType
  name: string
  description?: string
  thumbnail?: string
  previewUrl?: string
  parameters: any
  source?: TemplateSource
  fancyTextUsage?: FancyTextUsageType
  duration?: number
  tags?: string[]
}): Promise<{ success: boolean; data?: Template; error?: string }> {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error('创建模版失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 更新模版
 */
export async function updateTemplate(
  id: string,
  data: Partial<{
    name: string
    description: string
    thumbnail: string
    previewUrl: string
    parameters: any
    fancyTextUsage: FancyTextUsageType
    duration: number
    tags: string[]
  }>
): Promise<{ success: boolean; data?: Template; error?: string }> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error('更新模版失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 删除模版
 */
export async function deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    })
    return await response.json()
  } catch (error) {
    console.error('删除模版失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 将 FancyTextTemplate 转换为 Template
 */
export function fancyTextTemplateToTemplate(template: FancyTextTemplate): Partial<Template> {
  return {
    type: 'FANCY_TEXT_TEMPLATE',
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
    previewUrl: template.previewUrl,
    parameters: {
      globalParams: template.globalParams,
      perCharacter: template.perCharacter,
      visualStyles: template.visualStyles,
    },
    fancyTextUsage: template.usage?.toUpperCase().replace(/_/g, '_') as FancyTextUsageType,
    duration: template.globalParams.totalDuration,
    source: template.source === 'system' ? 'SYSTEM' : template.source === 'ai' ? 'AI_GENERATED' : 'USER',
  }
}





