'use client'

import React, { createContext, useContext } from 'react'
import type { DimensionGroup } from '@/lib/api/categories'
import type { MediaListResponse } from '@/lib/api/media'

export type LibraryInitialData = {
  categoriesDimensions?: DimensionGroup[]
  mediaList?: MediaListResponse['items']
  mediaPagination?: MediaListResponse['pagination']
}

const LibraryDataContext = createContext<LibraryInitialData | null>(null)

export function LibraryDataProvider({
  value,
  children,
}: {
  value: LibraryInitialData
  children: React.ReactNode
}) {
  return <LibraryDataContext.Provider value={value}>{children}</LibraryDataContext.Provider>
}

export function useLibraryInitialData(): LibraryInitialData {
  return useContext(LibraryDataContext) ?? {}
}





