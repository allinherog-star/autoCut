import { CACHE_TAGS } from '@/lib/server/cache-tags'
import { serverFetchJson } from '@/lib/server/internal-fetch'
import type { FancyTextUsageType, TemplateListResponse, TemplateSource, TemplateType } from '@/lib/api/templates'

export async function getTemplatesServer(params?: {
  type?: TemplateType
  source?: TemplateSource
  usage?: FancyTextUsageType
  search?: string
  page?: number
  limit?: number
}): Promise<TemplateListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.type) searchParams.set('type', params.type)
  if (params?.source) searchParams.set('source', params.source)
  if (params?.usage) searchParams.set('usage', params.usage)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))

  const url = `/api/templates${searchParams.toString() ? `?${searchParams}` : ''}`
  return serverFetchJson<TemplateListResponse>(url, undefined, {
    tags: [CACHE_TAGS.templates],
    revalidate: 300,
  })
}





