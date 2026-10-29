import { publicSlug } from '@/lib/public-slug'

export const PORTAL_PATHS = {
  login: '/apply',
  signup: '/apply/signup',
  forgotPassword: '/apply/forgot-password',
  resetPassword: '/apply/reset-password',
  verify: '/apply/verify',
  welcome: '/apply/welcome',
  help: '/apply/help',
  application: '/apply/application',
  personal: '/apply/application/personal',
  eligibility: '/apply/application/eligibility',
  bio: '/apply/application/bio',
  work: '/apply/application/work',
  media: '/apply/application/media',
  submit: '/apply/application/submit',
  staff: '/staff',
  staffPrograms: '/staff/programs',
  staffApplicants: '/staff/applicants',
  staffUsers: '/staff/users',
  staffEvaluation: '/staff/evaluation',
  jury: '/jury',
} as const

export const WIZARD_STEPS = ['personal', 'eligibility', 'bio', 'work', 'media', 'submit'] as const
export const FORM_STEPS = ['personal', 'eligibility', 'bio', 'work'] as const
export type WizardStep = (typeof WIZARD_STEPS)[number]

export function wizardStepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step)
}

export function wizardStepFromPathname(pathname: string): WizardStep {
  const segment = pathname.split('/').filter(Boolean).pop()
  if (segment && (WIZARD_STEPS as readonly string[]).includes(segment)) {
    return segment as WizardStep
  }
  return 'personal'
}

export function displayName(
  user:
    | {
        firstName?: string | null
        lastName?: string | null
        email?: string | null
      }
    | null
    | undefined,
): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  return name || user?.email || 'Account'
}

export function applicationLabel(application: {
  id: number
  applicant?: unknown
  artistName?: string | null
  fullName?: string | null
}): string {
  const named = application.artistName?.trim() || application.fullName?.trim()
  if (named) {
    return named
  }

  const applicant = typeof application.applicant === 'object' ? application.applicant : null
  return applicant ? displayName(applicant) : 'Application'
}

type ApplicationPathFields = {
  id: number
  applicant?: unknown
  artistName?: string | null
  fullName?: string | null
  program?: unknown
  slug?: string | null
}

export function programPublicCode(program: unknown): string {
  return programCodeForDownload(program).toLowerCase()
}

/** Person segment, unique inside one program: `naz-sahin`. */
export function applicationPersonKey(application: ApplicationPathFields): string {
  const slug = application.slug?.trim().toLowerCase() ?? ''
  const prefix = `${programPublicCode(application.program)}-`
  if (slug.startsWith(prefix)) {
    return slug.slice(prefix.length)
  }

  const applicant =
    application.applicant &&
    typeof application.applicant === 'object' &&
    'slug' in application.applicant &&
    typeof application.applicant.slug === 'string'
      ? application.applicant.slug.trim().toLowerCase()
      : ''
  if (applicant) {
    return applicant
  }

  if (slug) {
    return slug
  }

  return publicSlug(applicationLabel(application))
}

/** Stored application address: `scp26-naz-sahin`. */
export function applicationPathKey(application: ApplicationPathFields): string {
  const slug = application.slug?.trim().toLowerCase()
  if (slug) {
    return slug
  }

  return `${programPublicCode(application.program)}-${applicationPersonKey(application)}`
}

export function applicationStaffPath(application: ApplicationPathFields): string {
  const code = programPublicCode(application.program)
  return `${PORTAL_PATHS.staff}/${code}/${applicationPersonKey(application)}`
}

/** ASCII-safe segment for download filenames. */
export function filenameSegment(value: string, maxLength = 48): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '')

  return cleaned || 'untitled'
}

export function programCodeForDownload(program: unknown): string {
  if (program && typeof program === 'object') {
    const code = 'code' in program && typeof program.code === 'string' ? program.code.trim() : ''
    if (code) {
      return filenameSegment(code.toUpperCase(), 12)
    }
    const slug = 'slug' in program && typeof program.slug === 'string' ? program.slug.trim() : ''
    if (slug) {
      return filenameSegment(slug.toUpperCase(), 12)
    }
  }

  return 'APP'
}

/**
 * Download basename for jury/staff PDF and ZIP files:
 * `{PROGRAM_CODE}_{Applicant-Name}` e.g. `SCP26_Ada-Lovelace`.
 */
export function applicationDownloadBasename(application: ApplicationPathFields): string {
  const code = programCodeForDownload(application.program)
  const name = filenameSegment(applicationLabel(application))
  return `${code}_${name}`
}

/** Jury program list path: `/jury/scp26` */
export function programJuryPath(
  program: unknown,
  query?: Record<string, string>,
): string {
  const code = programCodeForDownload(program).toLowerCase()
  const path = `${PORTAL_PATHS.jury}/${code}`
  if (!query || Object.keys(query).length === 0) {
    return path
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value)
    }
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

/** Jury detail path: `/jury/scp26/ada-lovelace` */
export function applicationJuryPath(
  application: ApplicationPathFields,
  query?: Record<string, string>,
): string {
  const code = programCodeForDownload(application.program).toLowerCase()
  const path = `${PORTAL_PATHS.jury}/${code}/${applicationPersonKey(application)}`
  if (!query || Object.keys(query).length === 0) {
    return path
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value)
    }
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

export function applicationIdFromJurySlug(slug: string): number | null {
  const match = /(?:^|-)(\d+)$/.exec(slug.trim())
  if (!match) {
    return null
  }

  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

export function contentDispositionAttachment(filename: string): string {
  const safe = filename.replace(/["\\\r\n]/g, '_')
  return `attachment; filename="${safe}"`
}

/** Applicant-facing deadline. The calendar day closes at 11:59 PM Eastern. */
export function applicationDeadlineLabel(value: string | null | undefined): string | null {
  const date = formatPortalDate(value)
  if (!date) {
    return null
  }

  return `${date} at 11:59PM EST`
}

export function formatPortalDate(
  value: string | null | undefined,
  style: 'long' | 'short' = 'long',
): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString(
    'en-US',
    style === 'long'
      ? { day: 'numeric', month: 'long', timeZone: 'UTC', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', timeZone: 'UTC', year: 'numeric' },
  )
}

export const WIZARD_STEP_HREF: Record<WizardStep, string> = {
  personal: PORTAL_PATHS.personal,
  eligibility: PORTAL_PATHS.eligibility,
  bio: PORTAL_PATHS.bio,
  work: PORTAL_PATHS.work,
  media: PORTAL_PATHS.media,
  submit: PORTAL_PATHS.submit,
}

export function relationId(value: unknown): number | null {
  if (typeof value === 'number') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }

  return null
}

export const SUPPORT_EMAIL = 'support@spectorcraftprize.org'
export const INFO_EMAIL = 'info@spectorcraftprize.org'

export const SELECTION_CRITERIA = [
  {
    title: 'Artistic Excellence',
    body: 'We look for a clear demonstration of technical skill and artistic vision, with the hand of the artist evident in the work.',
  },
  {
    title: 'Cultural Significance',
    body: 'We look for a unique artistic perspective that contributes to the evolving landscape of American craft, drawing on community, place, personal experience, or through innovative approaches to materials, techniques, and processes, with an intentional engagement with tradition.',
  },
  {
    title: 'Growth Potential',
    body: 'We look for artists with a strong foundation whose practice continues to develop, who have not yet received widespread recognition, and whose careers could be meaningfully advanced by the Prize at this moment.',
  },
  {
    title: 'Mission Alignment',
    body: 'We look for artists whose work brings fresh perspectives and expands the possibilities of craft, combining tradition and innovation in ways that help shape what American craft means today.',
  },
] as const

export const DEFAULT_WELCOME_TITLE =
  'Welcome to The Spector Craft Prize for Emerging Artists Submissions Portal'

export const EMERGING_ARTISTS_PRIZE_PATH = '/emerging-artists-prize'

/** Prefer Program Rules PDF; otherwise the public Emerging Artists Prize page. */
export function programRulesHref(
  rulesDocument: { url?: string | null } | number | null | undefined,
): string {
  if (rulesDocument && typeof rulesDocument === 'object' && rulesDocument.url) {
    return rulesDocument.url
  }

  return EMERGING_ARTISTS_PRIZE_PATH
}
