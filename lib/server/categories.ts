import { CACHE_TAGS } from '@/lib/server/cache-tags'
import { serverFetchJson } from '@/lib/server/internal-fetch'
import type { ApiResponse, DimensionGroup } from '@/lib/api/categories'

export async function getAllCategoriesServer(): Promise<ApiResponse<{ dimensions: DimensionGroup[] }>> {
  return serverFetchJson<ApiResponse<{ dimensions: DimensionGroup[] }>>('/api/categories?all=true', undefined, {
    tags: [CACHE_TAGS.categories],
    revalidate: 3600,
  })
}





