import { CACHE_TAGS } from '@/lib/server/cache-tags'
import { serverFetchJson } from '@/lib/server/internal-fetch'
import type { ApiResponse, MediaListResponse, MediaSource, MediaType } from '@/lib/api/media'

export async function getMediaListServer(params?: {
  page?: number
  limit?: number
  type?: MediaType
  search?: string
  categories?: string[]
  source?: MediaSource
}): Promise<ApiResponse<MediaListResponse>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.type) searchParams.set('type', params.type)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.categories?.length) searchParams.set('categories', params.categories.join(','))
  if (params?.source && params.source !== 'all') searchParams.set('source', params.source)

  const url = `/api/media${searchParams.toString() ? `?${searchParams}` : ''}`
  return serverFetchJson<ApiResponse<MediaListResponse>>(url, undefined, {
    tags: [CACHE_TAGS.media],
    revalidate: 300,
  })
}





