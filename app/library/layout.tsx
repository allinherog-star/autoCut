import type { ReactNode } from 'react'
import { LibraryDataProvider } from '@/app/library/_components/library-data-provider'
import { getAllCategoriesServer } from '@/lib/server/categories'
import { getMediaListServer } from '@/lib/server/media'

export default async function LibraryLayout({ children }: { children: ReactNode }) {
  const [categoriesRes, mediaRes] = await Promise.all([
    getAllCategoriesServer(),
    getMediaListServer({ page: 1, limit: 24, source: 'all' }),
  ])

  const categoriesDimensions = categoriesRes.success ? categoriesRes.data?.dimensions ?? [] : []
  const mediaList = mediaRes.success ? mediaRes.data?.items ?? [] : []
  const mediaPagination = mediaRes.success ? mediaRes.data?.pagination ?? null : null

  return (
    <LibraryDataProvider
      value={{
        categoriesDimensions,
        mediaList,
        mediaPagination: mediaPagination ?? undefined,
      }}
    >
      {children}
    </LibraryDataProvider>
  )
}





