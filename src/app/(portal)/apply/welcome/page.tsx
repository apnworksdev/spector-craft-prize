import { PortalShell } from '@/components/Portal/PortalShell'
import { Button, Panel, Stack, Text, TextLink, Title } from '@/components/Portal/ui'
import { stepComplete } from '@/lib/application-progress'
import { requireApplicant } from '@/lib/portal-auth'
import {
  ensureApplicantApplication,
  getLiveProgram,
  isApplicationReadOnly,
} from '@/lib/portal-data'
import {
  displayName,
  formatPortalDate,
  INFO_EMAIL,
  PORTAL_PATHS,
  SELECTION_CRITERIA,
  SUPPORT_EMAIL,
  WIZARD_STEPS,
} from '@/lib/portal'

import styles from '@/components/Portal/portal.module.css'

type PageProps = {
  searchParams: Promise<{ submitted?: string }>
}

export default async function ApplyWelcomePage({ searchParams }: PageProps) {
  const applicant = await requireApplicant()
  const program = await getLiveProgram()
  const { submitted } = await searchParams

  if (!program?.id) {
    return (
      <PortalShell showLogout userLabel={displayName(applicant)}>
        <Panel>
          <Title>Welcome, {displayName(applicant)}</Title>
          <Text>The application program is not open yet.</Text>
        </Panel>
      </PortalShell>
    )
  }

  const application = await ensureApplicantApplication(applicant.id, program.id)
  const readOnly = isApplicationReadOnly(application)
  const started = WIZARD_STEPS.some((step) => step !== 'submit' && stepComplete(application, step))
  const rulesDocument = program.rulesDocument
  const rulesHref =
    rulesDocument && typeof rulesDocument === 'object' && rulesDocument.url
      ? rulesDocument.url
      : null
  const deadline = formatPortalDate(program.deadline)
  const paragraphs = program.welcomeMessage
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <PortalShell showLogout userLabel={displayName(applicant)}>
      <div className={styles.welcomeLayout}>
        <Stack>
          <Title>Welcome to The Spector Craft Prize for Emerging Artists Submissions Portal.</Title>
          {paragraphs.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
          <Title as="h2">Selection criteria</Title>
          <ol className={styles.criteria}>
            {SELECTION_CRITERIA.map((item, index) => (
              <li className={styles.criteriaItem} key={item.title}>
                <p className={styles.criteriaTitle}>
                  {index + 1}. {item.title}
                </p>
                <Text>{item.body}</Text>
              </li>
            ))}
          </ol>
          <Text>
            For questions about our policies, please use the contact information on the right.
          </Text>
          <Text>
            For technical assistance with this submission process, please click the Help link above
            or email {SUPPORT_EMAIL}
          </Text>
          {submitted ? <Text variant="success">Your application was submitted.</Text> : null}
          {readOnly ? <Text>Your application is submitted and read-only.</Text> : null}
          {program.status !== 'live' && !readOnly ? (
            <Text>Applications are currently closed.</Text>
          ) : null}
          <div className={styles.programMeta}>
            <Text>{program.name}</Text>
            {deadline ? <Text>Deadline: {deadline}</Text> : null}
            {rulesHref ? (
              <TextLink href={rulesHref}>Rules of Entry</TextLink>
            ) : (
              <Text>Rules of Entry</Text>
            )}
          </div>
          {program.status === 'live' || readOnly ? (
            <Button href={`${PORTAL_PATHS.application}/personal`} variant="primary">
              {readOnly ? 'View application' : started ? 'Continue' : 'Begin'}
            </Button>
          ) : null}
        </Stack>
        <Stack as="aside">
          <Title as="h2">Contact</Title>
          <Text>
            For all general application questions, email{' '}
            <TextLink href={`mailto:${INFO_EMAIL}`}>{INFO_EMAIL}</TextLink>.
          </Text>
          <Text>
            For any tech-related issues, email{' '}
            <TextLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</TextLink>.
          </Text>
        </Stack>
      </div>
    </PortalShell>
  )
}
