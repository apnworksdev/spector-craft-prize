import {
  evaluationTotal,
  formatJuryTotal,
  JURY_SCORE_FIELDS,
  meanEvaluationTotal,
  medianEvaluationTotal,
  type JuryScoreValues,
} from '@/lib/jury-scores'
import { displayName } from '@/lib/portal'

import { Readout, Stack, Table, Text, Title } from './ui'

type EvaluationRow = JuryScoreValues & {
  id: number
  notes?: string | null
  juror?:
    | number
    | {
        firstName?: string | null
        lastName?: string | null
        email?: string | null
      }
}

export function EvaluationSummary({ evaluations }: { evaluations: EvaluationRow[] }) {
  const panelMedian = medianEvaluationTotal(evaluations)
  const panelMean = meanEvaluationTotal(evaluations)

  return (
    <Stack>
      <Title as="h2">Jury scores</Title>
      {evaluations.length === 0 ? (
        <Text>No scores yet.</Text>
      ) : (
        <>
          {panelMedian != null ? (
            <Readout label="Panel median" value={formatJuryTotal(panelMedian)} />
          ) : null}
          {panelMean != null && panelMean !== panelMedian ? (
            <Readout label="Panel average" value={formatJuryTotal(panelMean)} />
          ) : null}
          <Table>
            <thead>
              <tr>
                <th>Juror</th>
                {JURY_SCORE_FIELDS.map((field) => (
                  <th key={field.name}>{field.title}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td>
                    {typeof evaluation.juror === 'object'
                      ? displayName(evaluation.juror)
                      : `Juror ${evaluation.juror}`}
                  </td>
                  {JURY_SCORE_FIELDS.map((field) => (
                    <td key={field.name}>{evaluation[field.name]}</td>
                  ))}
                  <td>{formatJuryTotal(evaluationTotal(evaluation))}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {evaluations.map((evaluation) =>
            evaluation.notes?.trim() ? (
              <Readout
                key={`${evaluation.id}-notes`}
                label={`Notes · ${typeof evaluation.juror === 'object' ? displayName(evaluation.juror) : 'Juror'}`}
                value={evaluation.notes}
              />
            ) : null,
          )}
        </>
      )}
    </Stack>
  )
}
