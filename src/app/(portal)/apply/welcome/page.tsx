import { ApplicationProgressBar } from '@/components/Portal/ApplicationProgressBar'
import { PortalShell } from '@/components/Portal/PortalShell'
import { Button, Panel, Stack, Text, TextLink, Title } from '@/components/Portal/ui'
import { applicationHasStarted, furthestAllowedStep, stepComplete } from '@/lib/application-progress'
import { requireApplicant } from '@/lib/portal-auth'
import { isApplicationReadOnly, resolveApplicantPortal } from '@/lib/portal-data'
import {
  applicationDeadlineLabel,
  displayName,
  formatPortalDate,
  INFO_EMAIL,
  PORTAL_PATHS,
  SELECTION_CRITERIA,
  SUPPORT_EMAIL,
  WIZARD_STEP_HREF,
  WIZARD_STEPS,
} from '@/lib/portal'
import { programAcceptsSubmissions } from '@/lib/program-deadline'
import styles from '@/components/Portal/portal.module.css'

type PageProps = {
  searchParams: Promise<{ submitted?: string }>
}

export default async function ApplyWelcomePage({ searchParams }: PageProps) {
  const applicant = await requireApplicant()
  const { program, application } = await resolveApplicantPortal(applicant.id)
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

  if (!application) {
    return (
      <PortalShell showLogout userLabel={displayName(applicant)}>
        <Panel>
          <Title>Welcome, {displayName(applicant)}</Title>
          <Text>Applications are currently closed.</Text>
        </Panel>
      </PortalShell>
    )
  }

  const readOnly = isApplicationReadOnly(application)
  const submittedAt = formatPortalDate(application.submittedAt)
  const started = WIZARD_STEPS.some((step) => step !== 'submit' && stepComplete(application, step))
  const continueHref = WIZARD_STEP_HREF[furthestAllowedStep(application)]
  const showProgress = !readOnly && applicationHasStarted(application)
  const rulesDocument = program.rulesDocument
  const rulesHref =
    rulesDocument && typeof rulesDocument === 'object' && rulesDocument.url
      ? rulesDocument.url
      : null
  const deadline = applicationDeadlineLabel(program.deadline)
  const acceptingSubmissions = programAcceptsSubmissions(program)
  const paragraphs = program.welcomeMessage
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <PortalShell showLogout userLabel={displayName(applicant)}>
      <div className={styles.welcomeLayout}>
        <Stack>
          {readOnly ? (
            <div className={styles.welcomeStatus}>
              <Title as="h2">Application submitted</Title>
              {submitted ? (
                <Text variant="success">Your application was submitted.</Text>
              ) : null}
              {submittedAt ? <Text>Submitted on {submittedAt}.</Text> : null}
              <Text>Your answers are read-only. You can review them anytime.</Text>
              <Button href={`${PORTAL_PATHS.application}/personal`} variant="primary">
                View application
              </Button>
            </div>
          ) : null}
          <Title className={styles.welcomeTitle}>
            Welcome to The Spector Craft Prize for Emerging Artists Submissions Portal
          </Title>
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
            For all general inquiries about our policies, email{' '}
            <TextLink href={`mailto:${INFO_EMAIL}`}>{INFO_EMAIL}</TextLink>.
          </Text>
          <Text>
            For technical assistance with this submission process, please click the Help link above
            or email {SUPPORT_EMAIL}
          </Text>
          {!acceptingSubmissions && !readOnly ? (
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
          {showProgress ? <ApplicationProgressBar application={application} /> : null}
          {acceptingSubmissions && !readOnly ? (
            <Button href={continueHref} variant="primary">
              {started ? 'Continue' : 'Begin'}
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
