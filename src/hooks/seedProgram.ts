import type { Payload } from 'payload'

import { DEFAULT_WELCOME_TITLE, SELECTION_CRITERIA } from '@/lib/portal'

const DEFAULT_PROGRAM = {
  name: 'The Spector Craft Prize for Emerging Artists 2026–2027',
  slug: 'emerging-artists-2026-2027',
  code: 'SCP26',
  deadline: '2027-02-15T12:00:00.000Z',
  status: 'draft' as const,
  welcomeTitle: DEFAULT_WELCOME_TITLE,
  welcomeMessage: [
    'The Spector Craft Prize for Emerging Artists celebrates the next generation of visionary craft artists whose work reflects technical excellence, innovative design, and a thoughtful engagement with American culture. Through this award, the program highlights artists who are pushing the boundaries of material and process—those whose creative voices promise meaningful contributions to the future of the field.',
    'Eligible applicants are within the first seven years of their professional craft practice and must be living and working in the United States.',
  ].join('\n\n'),
  selectionCriteria: SELECTION_CRITERIA.map((item) => ({
    title: item.title,
    body: item.body,
  })),
  helpMessage:
    'For technical assistance with this submission process, email support@spectorcraftprize.org or use the Help link in the portal header.',
  incompleteMessage:
    'Your Spector Craft Prize for Emerging Artists 2027 Application is not yet complete. Please go back and check if all the required fields are completed.',
  readyToSubmitMessage:
    'Your application is ready to submit. Please save and carefully review your application before submitting. Once submitted, you will be unable to make changes.',
  confirmationEmailBody:
    'Thank you for submitting your application to the Spector Craft Prize for Emerging Artists. We have received your materials.',
  declarations: [
    { text: 'I meet all eligibility requirements in the Rules of Entry.' },
    { text: 'I agree to the terms set forth in the Rules of Entry.' },
    {
      text: 'The submitted work is my original creation, handmade or partly handmade by me and owned exclusively by me at all times since its creation.',
    },
    { text: 'The work does not infringe on any third-party intellectual property rights.' },
    { text: 'All information provided is accurate and complete.' },
    {
      text: 'If selected, I understand that I will be expected to attend the awards ceremony and participate in promotional activities related to the Prize, provide a complete and accurate IRS Form W-9 for tax reporting purposes, and report to the Spector Family Foundation regarding my use of the Prize proceeds in accordance with IRS requirements.',
    },
  ],
}

export async function seedDefaultProgram(payload: Payload) {
  try {
    const existing = await payload.find({
      collection: 'programs',
      where: {
        slug: {
          equals: DEFAULT_PROGRAM.slug,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const program = existing.docs[0]
      const previousWelcome =
        'The Spector Craft Prize for Emerging Artists celebrates the next generation of visionary craft artists whose work reflects technical excellence, innovative design, and a thoughtful engagement with American culture.'
      const previousIncomplete = 'Your application is not yet complete.'
      const welcomeNeedsUpdate =
        program.welcomeMessage === previousWelcome ||
        program.welcomeMessage.includes(
          'For questions about our policies, please use the contact information on the right.',
        )
      const codeNeedsUpdate = !program.code?.trim()
      const deadlineNeedsUpdate = program.deadline?.startsWith('2027-03-04')
      const titleNeedsUpdate = !program.welcomeTitle?.trim()
      const criteriaNeedsUpdate =
        !Array.isArray(program.selectionCriteria) || program.selectionCriteria.length === 0

      if (
        welcomeNeedsUpdate ||
        program.incompleteMessage === previousIncomplete ||
        codeNeedsUpdate ||
        deadlineNeedsUpdate ||
        titleNeedsUpdate ||
        criteriaNeedsUpdate
      ) {
        await payload.update({
          collection: 'programs',
          id: program.id,
          data: {
            ...(codeNeedsUpdate ? { code: DEFAULT_PROGRAM.code } : {}),
            ...(deadlineNeedsUpdate ? { deadline: DEFAULT_PROGRAM.deadline } : {}),
            ...(titleNeedsUpdate ? { welcomeTitle: DEFAULT_PROGRAM.welcomeTitle } : {}),
            ...(criteriaNeedsUpdate
              ? { selectionCriteria: DEFAULT_PROGRAM.selectionCriteria }
              : {}),
            welcomeMessage: welcomeNeedsUpdate
              ? DEFAULT_PROGRAM.welcomeMessage
              : program.welcomeMessage,
            incompleteMessage:
              program.incompleteMessage === previousIncomplete
                ? DEFAULT_PROGRAM.incompleteMessage
                : program.incompleteMessage,
          },
        })
      }
      return
    }

    await payload.create({
      collection: 'programs',
      data: DEFAULT_PROGRAM,
    })

    payload.logger.info(`Seeded program "${DEFAULT_PROGRAM.slug}"`)
  } catch (error) {
    // Portal tables may not exist yet (migrations pending). Don't fail the site build.
    payload.logger.warn({
      err: error,
      msg: 'Skipped program seed — programs collection is unavailable',
    })
  }
}
