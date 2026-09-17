'use client'

import styles from './status.module.css'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <article className={styles.page}>
      <h1>Something went wrong</h1>
      <p>Please refresh the page and try again.</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </article>
  )
}
