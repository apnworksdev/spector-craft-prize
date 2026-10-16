import {
  evaluationAverage,
  formatJuryScore,
  JURY_SCORE_FIELDS,
  meanEvaluationAverage,
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
  const panelAverage = meanEvaluationAverage(evaluations)

  return (
    <Stack>
      <Title as="h2">Jury scores</Title>
      {evaluations.length === 0 ? (
        <Text>No scores yet.</Text>
      ) : (
        <>
          {panelAverage != null ? (
            <Readout label="Panel average" value={formatJuryScore(panelAverage)} />
          ) : null}
          <Table>
            <thead>
              <tr>
                <th>Juror</th>
                {JURY_SCORE_FIELDS.map((field) => (
                  <th key={field.name}>{field.title}</th>
                ))}
                <th>Average</th>
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
                  <td>{formatJuryScore(evaluationAverage(evaluation))}</td>
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
