import type { VEIRProject } from '@/lib/veir/types'

function safeBasename(input: string): string | null {
  try {
    // 兼容绝对/相对 URL
    const pathname = input.startsWith('http://') || input.startsWith('https://') ? new URL(input).pathname : input
    const parts = pathname.split('?')[0].split('#')[0].split('/').filter(Boolean)
    const last = parts.at(-1)
    if (!last) return null
    return decodeURIComponent(last)
  } catch {
    return null
  }
}

/**
 * 统一素材展示名（同一份 VEIR JSON：assets.assets）
 * - text/subtitle：优先用 content
 * - video/audio/image：优先用 src 的文件名（basename）
 * - fallback：assetId
 */
export function getAssetDisplayName(project: VEIRProject | null | undefined, assetId: string): string {
  const asset = project?.assets?.assets?.[assetId]
  if (!asset) return assetId

  if (asset.type === 'text') {
    const content = typeof asset.content === 'string' ? asset.content.trim() : ''
    return content.length > 0 ? content : assetId
  }

  const src = (asset as { src?: string }).src
  const base = typeof src === 'string' ? safeBasename(src) : null
  return base || assetId
}








