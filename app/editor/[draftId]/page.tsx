import { redirect } from 'next/navigation'

export default function DraftEditorIndexPage({ params }: { params: { draftId: string } }) {
  redirect(`/editor/${params.draftId}/upload`)
}


