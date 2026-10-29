'use client'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { useWizardFieldError } from '@/components/Portal/WizardFieldErrors'
import type { FieldErrors } from '@/lib/application-validation'
import {
  ARTIST_STATEMENT_MAX_WORDS,
  WHY_PRIZE_MAX_WORDS,
  WORK_DESCRIPTION_MAX_WORDS,
  WORK_SIGNIFICANCE_MAX_WORDS,
} from '@/lib/portal-media'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { FieldRow, TextArea, TextField, Title } from './ui'

type WorkStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: (data: Partial<Application>) => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  initialFieldErrors?: FieldErrors
  focusToken?: number
}

function valueOf(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name)
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim()
  }

  return ''
}

function WorkFields({ application, readOnly }: { application: Application; readOnly: boolean }) {
  const workTitleError = useWizardFieldError('workTitle')
  const workYearError = useWizardFieldError('workYearCreated')
  const workDimensionsError = useWizardFieldError('workDimensions')
  const workMaterialsError = useWizardFieldError('workMaterials')
  const artistStatementError = useWizardFieldError('artistStatement')
  const workDescriptionError = useWizardFieldError('workDescription')
  const workSignificanceError = useWizardFieldError('workSignificance')
  const whyPrizeError = useWizardFieldError('whyPrize')

  return (
    <>
      <Title as="h2" caps>
        Submitted work
      </Title>
      <FieldRow>
        <TextField
          defaultValue={application.workTitle ?? ''}
          error={workTitleError}
          label="Work title*"
          name="workTitle"
          readOnly={readOnly}
        />
        <TextField
          defaultValue={application.workYearCreated ?? ''}
          error={workYearError}
          label="Year created*"
          name="workYearCreated"
          readOnly={readOnly}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          defaultValue={application.workDimensions ?? ''}
          error={workDimensionsError}
          label="Dimensions*"
          name="workDimensions"
          readOnly={readOnly}
        />
        <TextField
          defaultValue={application.workMaterials ?? ''}
          error={workMaterialsError}
          label="Materials*"
          name="workMaterials"
          readOnly={readOnly}
        />
      </FieldRow>
      <TextArea
        defaultValue={application.artistStatement ?? ''}
        error={artistStatementError}
        hint="How does your work contribute to craft's role in contemporary American culture? Describe your practice's relationship to traditional methods, materials, or lineages (if applicable), and how it combines tradition with innovation. How do your experiences, community, or cultural context shape your artistic perspective and the ideas you explore through your work?"
        label={`Statement of Practice (${ARTIST_STATEMENT_MAX_WORDS} words maximum)*`}
        name="artistStatement"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.workDescription ?? ''}
        error={workDescriptionError}
        hint="Describe the process, materials, and techniques used to create the submitted work. How does the work demonstrate your expertise and technical skill? If assistants, fabricators, or industrial processes were involved, describe your own role in the making."
        label={`Process of Submitted Work (${WORK_DESCRIPTION_MAX_WORDS} words maximum)*`}
        name="workDescription"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.workSignificance ?? ''}
        error={workSignificanceError}
        hint="How does the submitted work reflect your distinct artistic voice? What significance does it hold within your broader practice?"
        label={`Significance of Submitted Work (${WORK_SIGNIFICANCE_MAX_WORDS} words maximum)*`}
        name="workSignificance"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.whyPrize ?? ''}
        error={whyPrizeError}
        hint="How would the Spector Craft Prize support your ongoing artistic practice and professional development? Be specific about where you are in your career, what areas you hope to develop, and what receiving the Prize would make possible for you at this stage."
        label={`Why the Spector Craft Prize? (${WHY_PRIZE_MAX_WORDS} words maximum)*`}
        name="whyPrize"
        readOnly={readOnly}
      />
    </>
  )
}

export function WorkStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  initialFieldErrors,
  focusToken,
}: WorkStepFormProps) {
  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : `${PORTAL_PATHS.application}/bio`}
      busy={busy}
      focusToken={focusToken}
      getData={(form) => ({
        workTitle: valueOf(form, 'workTitle'),
        workYearCreated: valueOf(form, 'workYearCreated'),
        workDimensions: valueOf(form, 'workDimensions'),
        workMaterials: valueOf(form, 'workMaterials'),
        artistStatement: valueOf(form, 'artistStatement'),
        workDescription: valueOf(form, 'workDescription'),
        workSignificance: valueOf(form, 'workSignificance'),
        whyPrize: valueOf(form, 'whyPrize'),
      })}
      initialFieldErrors={initialFieldErrors}
      nextHref={onContinue ? undefined : PORTAL_PATHS.media}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      readOnly={readOnly}
      step="work"
    >
      <WorkFields application={application} readOnly={readOnly} />
    </ApplicationWizard>
  )
}
