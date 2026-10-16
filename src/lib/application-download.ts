import fs from 'fs/promises'
import path from 'path'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import JSZip from 'jszip'

import { canAccessJuryView, isAdmin } from '@/access/roles'
import { getServerURL } from '@/lib/env'
import { getPayloadClient } from '@/lib/payload'
import type { Application, SubmissionFile, User } from '@/payload-types'

function fileLabel(file: SubmissionFile | number | null | undefined): string | null {
  if (!file || typeof file === 'number') {
    return null
  }

  return file.filename ?? `file-${file.id}`
}

async function readSubmissionFile(file: SubmissionFile, cookie = ''): Promise<Buffer | null> {
  const relative =
    file.url && !file.url.startsWith('http')
      ? file.url
      : file.filename
        ? `/api/submission-files/file/${encodeURIComponent(file.filename)}`
        : null
  const url = file.url?.startsWith('http')
    ? file.url
    : relative
      ? `${getServerURL()}${relative}`
      : null

  if (url) {
    const response = await fetch(url, {
      headers: cookie ? { cookie } : undefined,
    })
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer())
    }
  }

  if (file.filename) {
    const localPath = path.resolve(process.cwd(), 'submission-files', file.filename)
    try {
      return await fs.readFile(localPath)
    } catch {
      return null
    }
  }

  return null
}

function wrapLine(text: string, width = 90): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return ['']
  }

  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > width && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

export async function buildApplicationPdf(application: Application): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const lines = [
    'Spector Craft Prize — Application',
    '',
    `Status: ${application.status}`,
    `Full name: ${application.fullName ?? ''}`,
    `Artist name: ${application.artistName ?? ''}`,
    `Date of birth: ${application.dateOfBirth?.slice(0, 10) ?? ''}`,
    `Address: ${[application.addressLine1, application.addressLine2, application.city, application.state, application.postalCode, application.country].filter(Boolean).join(', ')}`,
    `Phone: ${application.phone ?? ''}`,
    `Email: ${application.email ?? ''}`,
    `Website: ${application.website ?? ''}`,
    `Social media: ${application.socialMedia ?? ''}`,
    '',
    `Years of practice: ${application.yearsOfPractice ?? ''}`,
    `Educational/training background: ${application.trainingBackground ?? ''}`,
    `Primary craft discipline: ${application.primaryCraftDiscipline ?? ''}`,
    `US citizen or resident: ${application.usCitizenOrResident ?? ''}`,
    '',
    `Educational background: ${application.educationalBackground ?? ''}`,
    `Recent exhibitions: ${application.recentExhibitions ?? ''}`,
    `Awards/recognition: ${application.awardsRecognition ?? ''}`,
    `Biographical summary: ${application.biographicalSummary ?? ''}`,
    '',
    `Work title: ${application.workTitle ?? ''}`,
    `Year created: ${application.workYearCreated ?? ''}`,
    `Dimensions: ${application.workDimensions ?? ''}`,
    `Materials: ${application.workMaterials ?? ''}`,
    `Statement of practice: ${application.artistStatement ?? ''}`,
    `Description of submitted work: ${application.workDescription ?? ''}`,
    `Significance: ${application.workSignificance ?? ''}`,
    `Why the Spector Craft Prize?: ${application.whyPrize ?? ''}`,
  ]

  let page = pdf.addPage()
  let y = 750
  for (const line of lines.flatMap((entry) => wrapLine(entry))) {
    if (y < 60) {
      page = pdf.addPage()
      y = 750
    }

    page.drawText(line, { x: 50, y, size: 11, font })
    y -= 16
  }

  return pdf.save()
}

export async function buildApplicationZip(
  application: Application,
  viewer: User,
  cookie = '',
): Promise<Uint8Array> {
  const zip = new JSZip()
  zip.file(
    'application.txt',
    [
      `Full name: ${application.fullName ?? ''}`,
      `Educational background: ${application.educationalBackground ?? ''}`,
      `Biographical summary: ${application.biographicalSummary ?? ''}`,
      `Work title: ${application.workTitle ?? ''}`,
      `Statement of practice: ${application.artistStatement ?? ''}`,
      `Significance: ${application.workSignificance ?? ''}`,
      `Why the Spector Craft Prize?: ${application.whyPrize ?? ''}`,
    ].join('\n'),
  )

  const includeId = isAdmin(viewer)

  const files: SubmissionFile[] = []
  for (const entry of [...(application.workImages ?? []), ...(application.portfolioImages ?? [])]) {
    if (entry?.file && typeof entry.file === 'object') {
      files.push(entry.file)
    }
  }

  if (application.workVideo && typeof application.workVideo === 'object') {
    files.push(application.workVideo)
  }

  if (includeId && application.governmentId && typeof application.governmentId === 'object') {
    files.push(application.governmentId)
  }

  for (const file of files) {
    const content = await readSubmissionFile(file, cookie)
    const name = fileLabel(file)
    if (content && name) {
      zip.file(name, content)
    }
  }

  return zip.generateAsync({ type: 'uint8array' })
}

export async function loadApplicationForDownload(id: number, viewer: User) {
  const payload = await getPayloadClient()
  return payload.findByID({
    collection: 'applications',
    id,
    depth: 1,
    user: { ...viewer, collection: 'users' },
    overrideAccess: false,
  })
}

export function canDownloadApplication(viewer: User): boolean {
  return isAdmin(viewer) || canAccessJuryView(viewer)
}
