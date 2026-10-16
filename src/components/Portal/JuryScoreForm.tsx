'use client'

import { useState } from 'react'

import { saveEvaluation } from '@/lib/portal-actions'
import {
  JURY_SCORE_FIELDS,
  JURY_SCORE_MAX,
  JURY_SCORE_MIN,
  type JuryScoreValues,
} from '@/lib/jury-scores'

import { Button, FormStack, SelectField, Text, TextArea, Title } from './ui'

type JuryScoreFormProps = {
  applicationId: number
  initial?: (JuryScoreValues & { notes?: string | null }) | null
}

const emptyScores = {
  artisticExcellence: 0,
  culturalSignificance: 0,
  growthPotential: 0,
  missionAlignment: 0,
}

export function JuryScoreForm({ applicationId, initial }: JuryScoreFormProps) {
  const [scores, setScores] = useState<JuryScoreValues>({
    artisticExcellence: initial?.artisticExcellence ?? emptyScores.artisticExcellence,
    culturalSignificance: initial?.culturalSignificance ?? emptyScores.culturalSignificance,
    growthPotential: initial?.growthPotential ?? emptyScores.growthPotential,
    missionAlignment: initial?.missionAlignment ?? emptyScores.missionAlignment,
  })
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  return (
    <FormStack
      onSubmit={async (event) => {
        event.preventDefault()
        setSaving(true)
        setError('')
        setSaved(false)
        const result = await saveEvaluation(applicationId, { ...scores, notes })
        setSaving(false)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setSaved(true)
      }}
    >
      <Title as="h2">Score</Title>
      <Text>Score each criterion from {JURY_SCORE_MIN} to {JURY_SCORE_MAX}. Other jurors cannot see your scores.</Text>
      {JURY_SCORE_FIELDS.map((field) => (
        <SelectField
          key={field.name}
          label={`${field.title}*`}
          name={field.name}
          note={field.body}
          onChange={(event) =>
            setScores((current) => ({
              ...current,
              [field.name]: Number(event.target.value),
            }))
          }
          value={scores[field.name] || ''}
        >
          <option value="">Select</option>
          {Array.from({ length: JURY_SCORE_MAX }, (_, index) => index + JURY_SCORE_MIN).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
      ))}
      <TextArea
        label="Notes"
        onChange={(event) => setNotes(event.target.value)}
        value={notes}
      />
      {error ? <Text variant="error">{error}</Text> : null}
      {saved ? <Text variant="success">Score saved.</Text> : null}
      <Button disabled={saving} type="submit" variant="primary">
        Save score
      </Button>
    </FormStack>
  )
}
