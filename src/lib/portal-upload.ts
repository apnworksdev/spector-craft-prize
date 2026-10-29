'use client'

import { coerceGovernmentIdFile, governmentIdError } from '@/lib/portal-media'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

function uploadErrorMessage(result: {
  errors?: Array<{ message?: string }>
  message?: string
}): string {
  return (
    result.errors?.[0]?.message ||
    result.message ||
    'Upload failed. Try JPG, PNG, or PDF under 10 MB.'
  )
}

export async function uploadSubmissionFile(
  file: File,
  kind: 'image' | 'video' | 'id',
): Promise<{ id: number; url: string | null } | { error: string }> {
  const uploadFile = kind === 'id' ? coerceGovernmentIdFile(file) : file

  if (kind === 'id') {
    const validation = governmentIdError({
      mimeType: uploadFile.type,
      filename: uploadFile.name,
      filesize: uploadFile.size,
    })
    if (validation !== true) {
      return { error: validation }
    }
  }

  const formData = new FormData()
  formData.append('file', uploadFile)
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
    return { error: uploadErrorMessage(result) }
  }

  if (typeof result.doc?.id !== 'number') {
    return { error: 'Upload failed. Try JPG, PNG, or PDF under 10 MB.' }
  }

  return {
    id: result.doc.id,
    url: typeof result.doc.url === 'string' ? result.doc.url : null,
  }
}
