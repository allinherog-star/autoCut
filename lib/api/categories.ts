/**
 * 分类 API 客户端
 */

export type CategoryDimension = 
  | 'EMOTION' 
  | 'INDUSTRY' 
  | 'STYLE' 
  | 'SCENE' 
  | 'PLATFORM' 
  | 'TEMPO' 
  | 'MOOD'

export interface CategoryTag {
  id: string
  dimension: CategoryDimension
  name: string
  nameEn: string | null
  icon: string | null
  color: string | null
  description: string | null
  sortOrder: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface DimensionGroup {
  dimension: CategoryDimension
  name: string
  description: string
  tags: CategoryTag[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * 获取所有分类（按维度分组）
 */
export async function getAllCategories(): Promise<ApiResponse<{ dimensions: DimensionGroup[] }>> {
  try {
    const response = await fetch('/api/categories?all=true')
    return response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
      code: 'FETCH_ERROR',
    }
  }
}

/**
 * 获取指定维度的分类
 */
export async function getCategoriesByDimension(
  dimension: CategoryDimension
): Promise<ApiResponse<{ tags: CategoryTag[] }>> {
  try {
    const response = await fetch(`/api/categories?dimension=${dimension}`)
    return response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
      code: 'FETCH_ERROR',
    }
  }
}

/**
 * 维度显示名称映射
 */
export const DIMENSION_NAMES: Record<CategoryDimension, string> = {
  EMOTION: '氛围',
  INDUSTRY: '类型',
  STYLE: '风格',
  SCENE: '场景',
  PLATFORM: '平台',
  TEMPO: '节奏',
  MOOD: '调性',
}

/**
 * 维度图标映射（已弃用，请使用 lib/icons.tsx 中的 DIMENSION_ICONS）
 * @deprecated
 */
export const DIMENSION_ICONS: Record<CategoryDimension, string> = {
  EMOTION: '',
  INDUSTRY: '',
  STYLE: '',
  SCENE: '',
  PLATFORM: '',
  TEMPO: '',
  MOOD: '',
}

