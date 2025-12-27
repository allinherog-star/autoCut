/**
 * 收藏 API 客户端
 */

export type FavoriteTargetType = 'MEDIA' | 'TEMPLATE'

export interface UserFavorite {
  id: string
  userId: string
  targetId: string
  targetType: FavoriteTargetType
  createdAt: string
  targetData?: any // 关联的素材或模版数据
}

export interface FavoriteListResponse {
  success: boolean
  data?: {
    items: UserFavorite[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

export interface FavoriteCheckResponse {
  success: boolean
  data?: {
    isFavorite: boolean
    favorite?: UserFavorite
  }
  error?: string
}

export interface BatchFavoriteCheckResponse {
  success: boolean
  data?: {
    favoriteMap: Record<string, boolean>
    favorites: UserFavorite[]
  }
  error?: string
}

/**
 * 获取收藏列表
 */
export async function getFavorites(params?: {
  type?: FavoriteTargetType
  page?: number
  limit?: number
}): Promise<FavoriteListResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))

    const response = await fetch(`/api/favorites?${searchParams}`)
    return await response.json()
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 添加收藏
 */
export async function addFavorite(
  targetId: string,
  targetType: FavoriteTargetType
): Promise<{ success: boolean; data?: UserFavorite; error?: string }> {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, targetType }),
    })
    return await response.json()
  } catch (error) {
    console.error('添加收藏失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 取消收藏
 */
export async function removeFavorite(
  targetId: string,
  targetType: FavoriteTargetType
): Promise<{ success: boolean; error?: string }> {
  try {
    const searchParams = new URLSearchParams({
      targetId,
      targetType,
    })
    const response = await fetch(`/api/favorites?${searchParams}`, {
      method: 'DELETE',
    })
    return await response.json()
  } catch (error) {
    console.error('取消收藏失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 切换收藏状态
 */
export async function toggleFavorite(
  targetId: string,
  targetType: FavoriteTargetType,
  currentState: boolean
): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
  if (currentState) {
    const result = await removeFavorite(targetId, targetType)
    return { ...result, isFavorite: !result.success }
  } else {
    const result = await addFavorite(targetId, targetType)
    return { ...result, isFavorite: result.success }
  }
}

/**
 * 检查是否已收藏
 */
export async function checkFavorite(
  targetId: string,
  targetType: FavoriteTargetType
): Promise<FavoriteCheckResponse> {
  try {
    const searchParams = new URLSearchParams({
      targetId,
      targetType,
    })
    const response = await fetch(`/api/favorites/check?${searchParams}`)
    return await response.json()
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    return { success: false, error: '网络错误' }
  }
}

/**
 * 批量检查收藏状态
 */
export async function batchCheckFavorites(
  items: Array<{ targetId: string; targetType: FavoriteTargetType }>
): Promise<BatchFavoriteCheckResponse> {
  try {
    const response = await fetch('/api/favorites/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    return await response.json()
  } catch (error) {
    console.error('批量检查收藏状态失败:', error)
    return { success: false, error: '网络错误' }
  }
}


















