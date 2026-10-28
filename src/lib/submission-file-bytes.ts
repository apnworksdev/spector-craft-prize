import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'

import { getServerURL, isR2SubmissionsConfigured } from '@/lib/env'
import { getPayloadClient } from '@/lib/payload'
import { submissionFileApiPath } from '@/lib/submission-file-path'
import type { SubmissionFile, User } from '@/payload-types'

let submissionsClient: S3Client | null = null

function getSubmissionsS3Client() {
  if (!isR2SubmissionsConfigured()) {
    return null
  }

  if (!submissionsClient) {
    submissionsClient = new S3Client({
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      forcePathStyle: true,
    })
  }

  return submissionsClient
}

function isPrivateObjectStoreUrl(url: string): boolean {
  const endpoint = process.env.R2_ENDPOINT?.replace(/\/$/, '')
  if (endpoint && url.startsWith(endpoint)) {
    return true
  }

  return /r2\.cloudflarestorage\.com/i.test(url)
}

async function readFromR2(file: SubmissionFile): Promise<Buffer | null> {
  const client = getSubmissionsS3Client()
  const bucket = process.env.R2_SUBMISSIONS_BUCKET
  if (!client || !bucket || !file.filename) {
    return null
  }

  const prefix = file.prefix?.trim() || 'submissions'
  const key = `${prefix.replace(/\/$/, '')}/${file.filename}`

  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    )
    const bytes = await result.Body?.transformToByteArray()
    return bytes ? Buffer.from(bytes) : null
  } catch {
    return null
  }
}

async function readFromLocalDisk(file: SubmissionFile): Promise<Buffer | null> {
  if (!file.filename) {
    return null
  }

  const localPath = path.resolve(process.cwd(), 'submission-files', file.filename)
  try {
    return await fs.readFile(localPath)
  } catch {
    return null
  }
}

async function readFromPayloadApi(file: SubmissionFile, cookie: string): Promise<Buffer | null> {
  const apiPath = submissionFileApiPath(file)
  if (!apiPath) {
    return null
  }

  // Never fetch private object-store URLs without credentials.
  if (file.url?.startsWith('http') && isPrivateObjectStoreUrl(file.url)) {
    // Prefer the access-controlled Payload route instead.
  } else if (file.url?.startsWith('http') && !isPrivateObjectStoreUrl(file.url)) {
    try {
      const direct = await fetch(file.url, {
        headers: cookie ? { cookie } : undefined,
      })
      if (direct.ok) {
        return Buffer.from(await direct.arrayBuffer())
      }
    } catch {
      // fall through
    }
  }

  try {
    const response = await fetch(`${getServerURL()}${apiPath}`, {
      headers: cookie ? { cookie } : undefined,
    })
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer())
    }
  } catch {
    return null
  }

  return null
}

export async function readSubmissionFileBytes(
  file: SubmissionFile,
  cookie = '',
): Promise<Buffer | null> {
  const fromR2 = await readFromR2(file)
  if (fromR2) {
    return fromR2
  }

  const fromDisk = await readFromLocalDisk(file)
  if (fromDisk) {
    return fromDisk
  }

  return readFromPayloadApi(file, cookie)
}

export async function resolveSubmissionFile(
  value: number | SubmissionFile | null | undefined,
  viewer: User,
): Promise<SubmissionFile | null> {
  if (!value) {
    return null
  }

  if (typeof value === 'object') {
    return value
  }

  const payload = await getPayloadClient()
  try {
    return await payload.findByID({
      collection: 'submission-files',
      id: value,
      depth: 0,
      user: { ...viewer, collection: 'users' },
      overrideAccess: false,
    })
  } catch {
    return null
  }
}
