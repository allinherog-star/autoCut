/**
 * Next.js Data Cache tags
 * - Server Components / Route Handlers 共用
 * - 写操作调用 revalidateTag(tag) 刷新相关列表
 */
export const CACHE_TAGS = {
  media: 'media',
  categories: 'categories',
  templates: 'templates',
} as const





