'use client'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export async function uploadSubmissionFile(
  file: File,
  kind: 'image' | 'video' | 'id',
): Promise<{ id: number; url: string | null } | { error: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append(
    '_payload',
    JSON.stringify({
      kind,
    }),
  )

  const response = await fetch(`${serverURL}/api/submission-files`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    return { error: result.errors?.[0]?.message || 'Upload failed.' }
  }

  if (typeof result.doc?.id !== 'number') {
    return { error: 'Upload failed.' }
  }

  return {
    id: result.doc.id,
    url: typeof result.doc.url === 'string' ? result.doc.url : null,
  }
}
