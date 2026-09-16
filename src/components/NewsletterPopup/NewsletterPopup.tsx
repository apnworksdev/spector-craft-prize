'use client'

import { useEffect, useState } from 'react'

import { NewsletterForm } from '@/components/NewsletterForm/NewsletterForm'
import { getCookie, MAILCHIMP, setCookie } from '@/lib/mailchimp'

import styles from './NewsletterPopup.module.css'

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (getCookie(MAILCHIMP.cookie)) {
      return
    }

    const timer = window.setTimeout(() => setOpen(true), 5000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    if (!getCookie(MAILCHIMP.cookie)) {
      setCookie(MAILCHIMP.cookie, 'true', 30)
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className={styles.root}>
      <button aria-label="Close newsletter" className={styles.scrim} onClick={close} type="button" />
      <div className={styles.dialog} role="dialog" aria-labelledby="newsletter-popup-email-heading" aria-modal="true">
        <button aria-label="Close" className={styles.close} onClick={close} type="button">
          ×
        </button>
        <NewsletterForm
          heading="Subscribe to our newsletter to get the latest news on the Spector Craft Prize"
          headingLevel="h2"
          inputId="newsletter-popup-email"
          onSubscribed={() => window.setTimeout(close, 3000)}
        />
      </div>
    </div>
  )
}
