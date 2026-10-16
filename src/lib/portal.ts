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
  return applicant ? displayName(applicant) : `Application ${application.id}`
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
    title: 'Artistic excellence',
    body: 'We look for a clear demonstration of technical skill and artistic vision, with the hand of the artist evident in the work.',
  },
  {
    title: 'Cultural significance',
    body: 'We look for a unique artistic perspective rooted in a meaningful connection to community, place, or personal identity, and in an intentional engagement with tradition.',
  },
  {
    title: 'Growth potential',
    body: 'We look for artists with a strong foundation who are still early in their development, whose practice remains open to new directions, and whose careers would be meaningfully accelerated by the Prize at this moment.',
  },
  {
    title: 'Mission alignment',
    body: 'We look for work that combines tradition and innovation and helps shape what American craft means today, elevating new voices that have not yet had a major platform.',
  },
] as const
