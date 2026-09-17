'use client'

import { useEffect, useRef, useState } from 'react'

import { NewsletterForm } from '@/components/NewsletterForm/NewsletterForm'
import { getCookie, MAILCHIMP, setCookie } from '@/lib/mailchimp'

import styles from './NewsletterPopup.module.css'

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

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

    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog?.focus()

    const focusableSelector = 'button, [href], input, select, textarea'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        return
      }

      if (event.key !== 'Tab' || !dialog) {
        return
      }

      const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter(
        (node) => !node.hasAttribute('disabled') && node.tabIndex !== -1,
      )
      if (!focusable.length) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
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
      <button
        aria-label="Close newsletter"
        className={styles.scrim}
        onClick={close}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-labelledby="newsletter-popup-email-heading"
        aria-modal="true"
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
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
