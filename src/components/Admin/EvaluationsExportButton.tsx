'use client'

import React from 'react'

export function EvaluationsExportButton() {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <a
        href="/api/admin/evaluations/export"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.45rem 0.75rem',
          borderRadius: 4,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        Download scores (Excel/CSV)
      </a>
    </div>
  )
}
