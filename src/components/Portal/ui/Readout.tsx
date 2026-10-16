import styles from './ui.module.css'

export function Readout({ label, value }: { label: string; value?: string | null }) {
  const trimmed = value?.trim()

  return (
    <p className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span>{trimmed || '—'}</span>
    </p>
  )
}
