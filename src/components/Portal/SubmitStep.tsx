'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { submitApplication } from '@/lib/portal-actions'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { PORTAL_PATHS } from '@/lib/portal'
import type { Program } from '@/payload-types'

import { Button, Checkbox, FormSection, Stack, Text, Title } from './ui'

type SubmitStepProps = {
  applicationId: number
  program: Program
  readOnly: boolean
  declarationState: Array<{ accepted?: boolean | null }> | null | undefined
}

export function SubmitStep({
  applicationId,
  program,
  readOnly,
  declarationState,
}: SubmitStepProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    setError('')

    const declarationsAccepted = (program.declarations ?? []).map((_, index) => {
      const input = document.getElementById(`declaration_${index}`) as HTMLInputElement | null
      return { accepted: Boolean(input?.checked) }
    })

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
      <Title as="h2">Submit</Title>
      <Text>{program.readyToSubmitMessage}</Text>
      <Stack dense>
        {(program.declarations ?? []).map((entry, index) => (
          <Checkbox
            defaultChecked={Boolean(declarationState?.[index]?.accepted)}
            disabled={readOnly}
            id={`declaration_${index}`}
            key={index}
            label={entry.text}
            name={`declaration_${index}`}
          />
        ))}
      </Stack>
      {error ? <Text variant="error">{error}</Text> : null}
      {!readOnly ? (
        <Button disabled={loading} onClick={onSubmit} variant="primary">
          Submit
        </Button>
      ) : null}
    </FormSection>
  )
}
