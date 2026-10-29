import { readFile } from 'fs/promises'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import JSZip from 'jszip'

import { canAccessJuryView, isAdmin } from '@/access/roles'
import { findApplicationByPathKey } from '@/lib/find-application'
import { applicationLabel } from '@/lib/portal'
import { getPayloadClient } from '@/lib/payload'
import {
  readSubmissionFileBytes,
  resolveSubmissionFile,
} from '@/lib/submission-file-bytes'
import type { Application, SubmissionFile, User } from '@/payload-types'

async function embedPortalFont(pdf: PDFDocument): Promise<PDFFont> {
  pdf.registerFontkit(fontkit)

  // Prefer TTF — WOFF/WOFF2 embeds as web font bytes that most PDF viewers cannot draw
  // (pages look blank). ZeistL1Web-Book.ttf is decompressed from the site woff2.
  const candidates = [
    path.join(process.cwd(), 'src/fonts/ZeistL1Web-Book.ttf'),
    path.join(process.cwd(), 'src/fonts/ZeistL1Web-Book.woff2'),
    path.join(process.cwd(), 'src/fonts/ZeistL1Web-Book.woff'),
  ]

  for (const candidate of candidates) {
    try {
      const bytes = await readFile(candidate)
      return await pdf.embedFont(bytes, { subset: true })
    } catch {
      // try next format / fall through
    }
  }

  return pdf.embedFont(StandardFonts.Helvetica)
}

function fileLabel(file: SubmissionFile | number | null | undefined): string | null {
  if (!file || typeof file === 'number') {
    return null
  }

  return file.filename ?? `file-${file.id}`
}

/** Portal teal `#3A6573` — same `--teal` / `--fg-color` as the site. */
const TEAL = rgb(0.227, 0.396, 0.451)
/** Softer teal for labels — still the brand blue, just quieter. */
const TEAL_SOFT = rgb(0.42, 0.55, 0.59)
const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN_X = 48
const MARGIN_TOP = 52
const MARGIN_BOTTOM = 52
const GUTTER = 20
const COL_WIDTH = (PAGE_WIDTH - MARGIN_X * 2 - GUTTER) / 2
const FIELD_GAP = 18
const LABEL_SIZE = 10
const VALUE_SIZE = 13
const TITLE_SIZE = 26
const SECTION_SIZE = 14

function wrapByWidth(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return ['']
  }

  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
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

function pdfSafe(text: string): string {
  return text
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\t\n\r\x20-\x7E]/g, '?')
}

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? pdfSafe(trimmed) : '-'
}

type PdfWriter = {
  page: PDFPage
  y: number
  pdf: PDFDocument
  font: PDFFont
}

function ensureSpace(writer: PdfWriter, needed: number) {
  if (writer.y - needed >= MARGIN_BOTTOM) {
    return
  }
  writer.page = writer.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  writer.y = PAGE_HEIGHT - MARGIN_TOP
}

function fieldHeight(font: PDFFont, label: string, value: string | null | undefined, width: number) {
  const labelLines = wrapByWidth(pdfSafe(label), font, LABEL_SIZE, width)
  const valueLines = wrapByWidth(displayValue(value), font, VALUE_SIZE, width)
  const labelH = labelLines.length * LABEL_SIZE * 1.3
  const valueH = valueLines.length * VALUE_SIZE * 1.4
  return labelH + 6 + valueH + FIELD_GAP
}

function drawTracked(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  tracking: number,
) {
  let cursor = x
  for (const char of text) {
    page.drawText(char, { x: cursor, y, size, font, color: TEAL })
    cursor += font.widthOfTextAtSize(char, size) + tracking
  }
}

function drawFieldBlock(
  writer: PdfWriter,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string | null | undefined,
) {
  let cursor = y
  const labelLines = wrapByWidth(pdfSafe(label), writer.font, LABEL_SIZE, width)
  for (const line of labelLines) {
    writer.page.drawText(line, {
      x,
      y: cursor,
      size: LABEL_SIZE,
      font: writer.font,
      color: TEAL_SOFT,
    })
    cursor -= LABEL_SIZE * 1.3
  }
  cursor -= 6
  const valueLines = wrapByWidth(displayValue(value), writer.font, VALUE_SIZE, width)
  for (const line of valueLines) {
    writer.page.drawText(line, {
      x,
      y: cursor,
      size: VALUE_SIZE,
      font: writer.font,
      color: TEAL,
    })
    cursor -= VALUE_SIZE * 1.4
  }
  return y - cursor
}

function drawField(writer: PdfWriter, label: string, value: string | null | undefined) {
  const width = PAGE_WIDTH - MARGIN_X * 2
  const height = fieldHeight(writer.font, label, value, width)
  ensureSpace(writer, height)
  drawFieldBlock(writer, MARGIN_X, writer.y, width, label, value)
  writer.y -= height
}

function drawFieldRow(
  writer: PdfWriter,
  left: { label: string; value: string | null | undefined },
  right: { label: string; value: string | null | undefined },
) {
  const leftH = fieldHeight(writer.font, left.label, left.value, COL_WIDTH)
  const rightH = fieldHeight(writer.font, right.label, right.value, COL_WIDTH)
  const height = Math.max(leftH, rightH)
  ensureSpace(writer, height)
  drawFieldBlock(writer, MARGIN_X, writer.y, COL_WIDTH, left.label, left.value)
  drawFieldBlock(writer, MARGIN_X + COL_WIDTH + GUTTER, writer.y, COL_WIDTH, right.label, right.value)
  writer.y -= height
}

function drawTitle(writer: PdfWriter, title: string) {
  const width = PAGE_WIDTH - MARGIN_X * 2
  const lines = wrapByWidth(title, writer.font, TITLE_SIZE, width)
  const height = lines.length * TITLE_SIZE * 1.2 + 28
  ensureSpace(writer, height)
  for (const line of lines) {
    writer.page.drawText(line, {
      x: MARGIN_X,
      y: writer.y,
      size: TITLE_SIZE,
      font: writer.font,
      color: TEAL,
    })
    writer.y -= TITLE_SIZE * 1.2
  }
  writer.y -= 28
}

function drawSection(writer: PdfWriter, title: string) {
  ensureSpace(writer, SECTION_SIZE + 28)
  writer.y -= 10
  drawTracked(
    writer.page,
    title.toUpperCase(),
    MARGIN_X,
    writer.y,
    SECTION_SIZE,
    writer.font,
    1.2,
  )
  writer.y -= SECTION_SIZE + 14
}

export async function buildApplicationPdf(application: Application): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await embedPortalFont(pdf)
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const writer: PdfWriter = {
    pdf,
    page,
    y: PAGE_HEIGHT - MARGIN_TOP,
    font,
  }

  const citizen =
    application.usCitizenOrResident === 'yes'
      ? 'Yes'
      : application.usCitizenOrResident === 'no'
        ? 'No'
        : ''

  drawTitle(writer, pdfSafe(applicationLabel(application)))

  drawSection(writer, 'Personal information')
  drawFieldRow(
    writer,
    { label: 'Full name', value: application.fullName },
    { label: 'Artist name', value: application.artistName },
  )
  drawField(writer, 'Date of birth', application.dateOfBirth?.slice(0, 10))
  drawFieldRow(
    writer,
    { label: 'Address line 1', value: application.addressLine1 },
    { label: 'Address line 2', value: application.addressLine2 },
  )
  drawFieldRow(
    writer,
    { label: 'City', value: application.city },
    { label: 'State', value: application.state },
  )
  drawFieldRow(
    writer,
    { label: 'Postal/zip code', value: application.postalCode },
    { label: 'Country', value: application.country },
  )
  drawFieldRow(
    writer,
    { label: 'Phone', value: application.phone },
    { label: 'Email', value: application.email },
  )
  drawFieldRow(
    writer,
    { label: 'Website/portfolio URL', value: application.website },
    { label: 'Social media', value: application.socialMedia },
  )

  drawSection(writer, 'Eligibility confirmation')
  drawField(writer, 'Years of practice', application.yearsOfPractice)
  drawField(writer, 'Month and year practice began', application.practiceBegan)
  drawField(writer, 'Practice timeline explanation', application.practiceBeganDetails)
  drawField(writer, 'Educational/training background', application.trainingBackground)
  drawField(writer, 'Primary craft discipline', application.primaryCraftDiscipline)
  drawField(writer, 'United States citizen or resident', citizen)

  drawSection(writer, 'Biographical information')
  drawField(writer, 'Educational background', application.educationalBackground)
  drawField(writer, 'Recent exhibitions', application.recentExhibitions)
  drawField(writer, 'Awards/recognition', application.awardsRecognition)
  drawField(writer, 'Biographical summary', application.biographicalSummary)

  drawSection(writer, 'Submitted work')
  drawFieldRow(
    writer,
    { label: 'Work title', value: application.workTitle },
    { label: 'Year created', value: application.workYearCreated },
  )
  drawFieldRow(
    writer,
    { label: 'Dimensions', value: application.workDimensions },
    { label: 'Materials', value: application.workMaterials },
  )
  drawField(writer, 'Statement of Practice', application.artistStatement)
  drawField(writer, 'Process of Submitted Work', application.workDescription)
  drawField(writer, 'Significance of Submitted Work', application.workSignificance)
  drawField(writer, 'Why the Spector Craft Prize?', application.whyPrize)

  return pdf.save()
}

function uniqueZipPath(zip: JSZip, folder: string, filename: string): string {
  const safeName = filename.replace(/[\\/]/g, '-')
  let candidate = `${folder}/${safeName}`
  let index = 2
  while (zip.file(candidate)) {
    const ext = path.extname(safeName)
    const base = path.basename(safeName, ext)
    candidate = `${folder}/${base}-${index}${ext}`
    index += 1
  }
  return candidate
}

async function addFilesToZipFolder(
  zip: JSZip,
  folder: string,
  files: Array<number | SubmissionFile | null | undefined>,
  viewer: User,
  cookie: string,
) {
  for (const entry of files) {
    const file = await resolveSubmissionFile(entry, viewer)
    // Government IDs never belong in media ZIPs (jury or staff).
    if (!file || file.kind === 'id') {
      continue
    }

    const content = await readSubmissionFileBytes(file, cookie)
    const name = fileLabel(file)
    if (!content || !name) {
      continue
    }
    zip.file(uniqueZipPath(zip, folder, name), content)
  }
}

export async function buildApplicationZip(
  application: Application,
  viewer: User,
  cookie = '',
): Promise<Uint8Array> {
  const zip = new JSZip()

  const workFiles = (application.workImages ?? []).map((entry) => entry?.file)
  const portfolioFiles = (application.portfolioImages ?? []).map((entry) => entry?.file)
  const videoFiles = application.workVideo ? [application.workVideo] : []

  await addFilesToZipFolder(zip, 'work', workFiles, viewer, cookie)
  await addFilesToZipFolder(zip, 'portfolio', portfolioFiles, viewer, cookie)
  await addFilesToZipFolder(zip, 'video', videoFiles, viewer, cookie)

  if (Object.keys(zip.files).filter((name) => !zip.files[name].dir).length === 0) {
    zip.file('readme.txt', 'No media files were available for this application.')
  }

  return zip.generateAsync({ type: 'uint8array' })
}

export async function loadApplicationForDownloadKey(key: string, viewer: User) {
  const application = await findApplicationByPathKey(key, viewer, 2)
  if (!application) {
    throw new Error('Application not found')
  }
  return application
}

export function canDownloadApplication(viewer: User): boolean {
  return isAdmin(viewer) || canAccessJuryView(viewer)
}
