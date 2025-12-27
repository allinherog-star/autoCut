import { headers } from 'next/headers'

/**
 * 在 Server Components / Route Handlers 中构造当前请求的 baseUrl。
 * - 优先使用反向代理头（Vercel/NGINX）
 * - 回退到 Host
 */
export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return 'http://localhost:3000'
  return `${proto}://${host}`
}

export type ServerFetchOptions = {
  /** Next fetch cache tags */
  tags?: string[]
  /** ISR revalidate seconds */
  revalidate?: number
}

/**
 * Server-side JSON fetch wrapper with Next.js cache hints.
 */
export async function serverFetchJson<T>(
  path: string,
  init?: RequestInit,
  options?: ServerFetchOptions
): Promise<T> {
  const baseUrl = await getRequestBaseUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`

  const res = await fetch(url, {
    ...init,
    // 默认 GET 允许缓存；写操作由 Route Handler 自己 revalidateTag
    next: {
      ...(options?.revalidate != null ? { revalidate: options.revalidate } : {}),
      ...(options?.tags?.length ? { tags: options.tags } : {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`serverFetchJson failed: ${res.status} ${res.statusText} url=${url} body=${text.slice(0, 500)}`)
  }

  return (await res.json()) as T
}



