import type { ReactNode } from 'react'
import { TemplatesDataProvider } from '@/app/templates/_components/templates-data-provider'
import { getAllCategoriesServer } from '@/lib/server/categories'
import { convertPresetToTemplate } from '@/lib/fancy-text-presets/converter'
import { loadPresets, getPreset } from '@/lib/fancy-text-presets/registry'
import type { FancyTextTemplate } from '@/lib/fancy-text/types'

export default async function TemplatesLayout({ children }: { children: ReactNode }) {
  const categoriesRes = await getAllCategoriesServer()
  const categoriesDimensions = categoriesRes.success ? categoriesRes.data?.dimensions ?? [] : []

  // 花字模版：服务端预构建（减少首屏 Client JS + 避免重复计算）
  const registry = await loadPresets()
  const templates: FancyTextTemplate[] = []
  for (const item of registry) {
    const preset = await getPreset(item)
    if (preset) templates.push(convertPresetToTemplate(preset))
  }

  return (
    <TemplatesDataProvider value={{ categoriesDimensions, fancyTextTemplates: templates }}>
      {children}
    </TemplatesDataProvider>
  )
}





