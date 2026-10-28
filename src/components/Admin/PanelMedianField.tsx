'use client'

import { useField } from '@payloadcms/ui'

import { formatJuryTotal, JURY_SCORE_TOTAL_MAX } from '@/lib/jury-scores'

export function PanelMedianField() {
  const { value } = useField<number | null>({ path: 'panelMedian' })
  const count = useField<number | null>({ path: 'evaluationCount' })

  const hasScore = value != null && !Number.isNaN(Number(value))
  const parsedCount = Number(count.value)
  const jurorCount = Number.isFinite(parsedCount) ? parsedCount : 0

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Panel median grade</div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
        {hasScore ? formatJuryTotal(Number(value)) : `— / ${JURY_SCORE_TOTAL_MAX}`}
      </div>
      <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>
        {jurorCount === 0
          ? 'No evaluations yet'
          : `${jurorCount} juror${jurorCount === 1 ? '' : 's'} scored`}
      </div>
    </div>
  )
}
