import styles from './page.module.css'

export default function NotFound() {
  return (
    <article className={styles.page}>
      <h1>Page not found</h1>
      <p>That page does not exist.</p>
    </article>
  )
}
