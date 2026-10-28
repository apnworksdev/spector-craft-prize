'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  evaluationTotal,
  formatJuryTotal,
  JURY_SCORE_FIELDS,
  JURY_SCORE_MAX,
  JURY_SCORE_MIN,
  JURY_SCORE_TOTAL_MAX,
  type JuryScoreValues,
} from '@/lib/jury-scores'
import { saveEvaluation } from '@/lib/portal-actions'
import { PORTAL_PATHS } from '@/lib/portal'

import { Button, SelectField, Text, TextArea } from './ui'
import styles from './JuryScoreForm.module.css'
import layoutStyles from './JuryApplicationLayout.module.css'

type JuryScoreFormProps = {
  applicationId: number
  returnTo?: string
  initial?: (JuryScoreValues & { notes?: string | null }) | null
}

const emptyScores = {
  artisticExcellence: 0,
  culturalSignificance: 0,
  growthPotential: 0,
  missionAlignment: 0,
}

export function JuryScoreForm({ applicationId, returnTo, initial }: JuryScoreFormProps) {
  const router = useRouter()
  const [scores, setScores] = useState<JuryScoreValues>({
    artisticExcellence: initial?.artisticExcellence ?? emptyScores.artisticExcellence,
    culturalSignificance: initial?.culturalSignificance ?? emptyScores.culturalSignificance,
    growthPotential: initial?.growthPotential ?? emptyScores.growthPotential,
    missionAlignment: initial?.missionAlignment ?? emptyScores.missionAlignment,
  })
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const hasAllScores = JURY_SCORE_FIELDS.every((field) => scores[field.name] >= JURY_SCORE_MIN)
  const liveTotal = hasAllScores ? formatJuryTotal(evaluationTotal(scores)) : null

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault()
        setSaving(true)
        setError('')
        try {
          const result = await saveEvaluation(applicationId, { ...scores, notes })
          if (!result.ok) {
            setSaving(false)
            setError(result.error)
            return
          }
          router.push(returnTo || PORTAL_PATHS.jury)
        } catch {
          setSaving(false)
          setError('Could not save score.')
        }
      }}
    >
      <h2 className={layoutStyles.asideTitle} id="jury-score-heading">
        Score
      </h2>
      <p className={layoutStyles.asideLead}>
        Score each criterion from {JURY_SCORE_MIN} to {JURY_SCORE_MAX} (total out of{' '}
        {JURY_SCORE_TOTAL_MAX}). Other jurors cannot see your scores.
      </p>
      {liveTotal ? <p className={styles.average}>Total: {liveTotal}</p> : null}
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
          {Array.from({ length: JURY_SCORE_MAX }, (_, index) => index + JURY_SCORE_MIN).map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </SelectField>
      ))}
      <div className={styles.notes}>
        <TextArea
          label="Notes"
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
      </div>
      {error ? <Text variant="error">{error}</Text> : null}
      <Button disabled={saving} type="submit" variant="primary">
        {saving ? 'Saving…' : 'Submit scores'}
      </Button>
    </form>
  )
}
