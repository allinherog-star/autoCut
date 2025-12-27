'use client'

import React, { createContext, useContext } from 'react'
import type { DimensionGroup } from '@/lib/api/categories'
import type { FancyTextTemplate } from '@/lib/fancy-text/types'

export type TemplatesInitialData = {
  categoriesDimensions?: DimensionGroup[]
  fancyTextTemplates?: FancyTextTemplate[]
}

const TemplatesDataContext = createContext<TemplatesInitialData | null>(null)

export function TemplatesDataProvider({
  value,
  children,
}: {
  value: TemplatesInitialData
  children: React.ReactNode
}) {
  return <TemplatesDataContext.Provider value={value}>{children}</TemplatesDataContext.Provider>
}

export function useTemplatesInitialData(): TemplatesInitialData {
  return useContext(TemplatesDataContext) ?? {}
}





