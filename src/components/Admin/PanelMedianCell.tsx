'use client'

import { formatJuryTotal } from '@/lib/jury-scores'

type Props = {
  cellData?: number | null
}

export function PanelMedianCell({ cellData }: Props) {
  if (cellData == null || Number.isNaN(Number(cellData))) {
    return <span style={{ opacity: 0.55 }}>—</span>
  }

  return <span>{formatJuryTotal(Number(cellData))}</span>
}
