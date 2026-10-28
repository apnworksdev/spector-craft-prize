'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  firstInvalidField,
  focusFirstInvalidField,
  mergeApplication,
  validateSubmitReady,
  wizardStepForField,
  type FieldErrors,
} from '@/lib/application-validation'
import { submitApplication } from '@/lib/portal-actions'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { PORTAL_PATHS } from '@/lib/portal'
import type { Application, Program } from '@/payload-types'

import { Button, Checkbox, FormSection, Stack, Text, Title } from './ui'

type SubmitStepProps = {
  application: Application
  applicationId: number
  program: Program
  readOnly: boolean
  sectionsReady?: boolean
  declarationState: Array<{ accepted?: boolean | null }> | null | undefined
  onGovernmentIdError?: (message: string) => void
  onGoToMissingField?: (errors: FieldErrors) => void
}

export function SubmitStep({
  application,
  applicationId,
  program,
  readOnly,
  sectionsReady = true,
  declarationState,
  onGovernmentIdError,
  onGoToMissingField,
}: SubmitStepProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [declarationErrors, setDeclarationErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    setError('')
    setDeclarationErrors({})
    onGovernmentIdError?.('')

    const declarationsAccepted = (program.declarations ?? []).map((_, index) => {
      const input = document.getElementById(`declaration_${index}`) as HTMLInputElement | null
      return { accepted: Boolean(input?.checked) }
    })

    const merged = mergeApplication(application, { declarationsAccepted })
    const validationErrors = validateSubmitReady(merged, program)

    if (Object.keys(validationErrors).length > 0) {
      const field = firstInvalidField(validationErrors)
      const targetStep = field ? wizardStepForField(field) : 'submit'

      if (targetStep === 'submit') {
        const { governmentId: governmentIdError, ...declarationOnlyErrors } = validationErrors
        if (Object.keys(declarationOnlyErrors).length > 0) {
          setDeclarationErrors(declarationOnlyErrors)
        }
        if (governmentIdError) {
          onGovernmentIdError?.(governmentIdError)
        }
        focusFirstInvalidField(validationErrors)
      } else {
        onGoToMissingField?.(validationErrors)
      }

      setLoading(false)
      return
    }

    const saveResult = await enqueueApplicationSave(applicationId, { declarationsAccepted })
    if (!saveResult.ok) {
      setError(saveResult.error)
      setLoading(false)
      return
    }

    const result = await submitApplication(applicationId)
    if (result && 'error' in result && result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`${PORTAL_PATHS.welcome}?submitted=1`)
  }

  return (
    <FormSection>
      <Title as="h2" caps>
        Submit
      </Title>
      <Text>{sectionsReady ? program.readyToSubmitMessage : program.incompleteMessage}</Text>
      <Stack dense>
        {(program.declarations ?? []).map((entry, index) => (
          <Checkbox
            defaultChecked={Boolean(declarationState?.[index]?.accepted)}
            disabled={readOnly}
            error={declarationErrors[`declaration_${index}`]}
            id={`declaration_${index}`}
            key={index}
            label={entry.text}
            name={`declaration_${index}`}
          />
        ))}
      </Stack>
      {error ? <Text variant="error">{error}</Text> : null}
      {!readOnly ? (
        <Button disabled={loading} onClick={onSubmit} type="button" variant="primary">
          Submit
        </Button>
      ) : null}
    </FormSection>
  )
}
