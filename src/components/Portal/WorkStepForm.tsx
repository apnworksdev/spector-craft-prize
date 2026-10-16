'use client'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
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
  onBack?: () => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  reachedIndex?: number
}

function valueOf(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name)
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim()
  }

  return ''
}

export function WorkStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  reachedIndex,
}: WorkStepFormProps) {
  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : `${PORTAL_PATHS.application}/bio`}
      busy={busy}
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
      nextHref={onContinue ? undefined : PORTAL_PATHS.media}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      reachedIndex={reachedIndex}
      readOnly={readOnly}
      step="work"
    >
      <Title as="h2">Submitted work</Title>
      <FieldRow>
        <TextField
          defaultValue={application.workTitle ?? ''}
          label="Work title*"
          name="workTitle"
        />
        <TextField
          defaultValue={application.workYearCreated ?? ''}
          label="Year created*"
          name="workYearCreated"
        />
      </FieldRow>
      <FieldRow>
        <TextField
          defaultValue={application.workDimensions ?? ''}
          label="Dimensions*"
          name="workDimensions"
        />
        <TextField
          defaultValue={application.workMaterials ?? ''}
          label="Materials*"
          name="workMaterials"
        />
      </FieldRow>
      <TextArea
        defaultValue={application.artistStatement ?? ''}
        hint={`How does your work contribute to craft's role in contemporary American culture? Describe your practice's relationship to traditional methods, materials, or lineages (if applicable), and how it combines tradition with innovation. Tell us how your community, locale, or personal identity informs your work. ${ARTIST_STATEMENT_MAX_WORDS} words maximum.`}
        label="Statement of practice*"
        name="artistStatement"
      />
      <TextArea
        defaultValue={application.workDescription ?? ''}
        hint={`Describe the process, materials, and techniques used to create the submitted work. How does the work demonstrate your expertise and technical skill? If assistants, fabricators, or industrial processes were involved, describe your own role in the making. ${WORK_DESCRIPTION_MAX_WORDS} words maximum.`}
        label="Description of submitted work*"
        name="workDescription"
      />
      <TextArea
        defaultValue={application.workSignificance ?? ''}
        hint={`How does the submitted work reflect your distinct artistic voice? What significance does it hold within your broader practice? ${WORK_SIGNIFICANCE_MAX_WORDS} words maximum.`}
        label="Significance*"
        name="workSignificance"
      />
      <TextArea
        defaultValue={application.whyPrize ?? ''}
        hint={`How would the Spector Craft Prize support your ongoing artistic practice? Be specific about where you are in your career and what areas of your practice you want to develop in particular. ${WHY_PRIZE_MAX_WORDS} words maximum.`}
        label="Why the Spector Craft Prize?*"
        name="whyPrize"
      />
    </ApplicationWizard>
  )
}
