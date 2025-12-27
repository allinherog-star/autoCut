import { redirect } from 'next/navigation'

export default async function DraftEditorIndexPage({
  params,
}: {
  params: Promise<{ draftId: string }>
}) {
  const { draftId } = await params
  redirect(`/editor/${draftId}/upload`)
}


