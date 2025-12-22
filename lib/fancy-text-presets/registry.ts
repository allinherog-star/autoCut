/**
 * Fancy Text Presets Registry
 * 
 * 使用静态导入从 assets/fancy-text-presets/ 加载预设
 * 不再使用 HTTP fetch 从 public/ 目录加载
 */

import {
    PRESET_REGISTRY,
    PresetMeta,
    PresetEntry,
    getPresetMeta,
    getAllPresetMetas,
    loadPresetComponent,
} from '@/assets/fancy-text-presets'

// Re-export types and functions
export type { PresetMeta, PresetEntry }
export { getPresetMeta, getAllPresetMetas, loadPresetComponent, PRESET_REGISTRY }

// Legacy interface for compatibility
export interface PresetRegistryItem {
    id: string
    category: string
    name: string
    level: string
    thumbnail?: string
    tags: string[]
}

/**
 * Loads the list of available presets (synchronous, no HTTP fetch)
 */
export async function loadPresets(): Promise<PresetRegistryItem[]> {
    return PRESET_REGISTRY.map(entry => ({
        id: entry.meta.id,
        category: entry.meta.category || 'variety',
        name: entry.meta.name,
        level: entry.meta.level,
        tags: entry.meta.tags,
    }))
}

/**
 * Fetches full preset data by registry item
 */
export async function getPreset(item: PresetRegistryItem): Promise<{ meta: PresetMeta } | null> {
    const meta = getPresetMeta(item.id)
    if (!meta) return null
    return { meta }
}

/**
 * Get preset by ID directly
 */
export async function getPresetById(id: string): Promise<{ meta: PresetMeta } | null> {
    const meta = getPresetMeta(id)
    if (!meta) return null
    return { meta }
}
