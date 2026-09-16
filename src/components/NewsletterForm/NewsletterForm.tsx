'use client'

import { type FormEvent, useState } from 'react'

import { MAILCHIMP, setCookie, subscribeToNewsletter } from '@/lib/mailchimp'

import styles from './NewsletterForm.module.css'

type NewsletterFormProps = {
  className?: string
  heading?: string
  headingLevel?: 'p' | 'h2'
  inputId?: string
  onSubscribed?: () => void
}

export function NewsletterForm({
  className,
  heading = 'Subscribe to our newsletter to get the latest news on the Spector Craft Prize',
  headingLevel = 'p',
  inputId = 'newsletter-email',
  onSubscribed,
}: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const email = String(new FormData(form).get('EMAIL') || '').trim()

    if (!email) {
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const result = await subscribeToNewsletter(form)
      if (result.result === 'success') {
        setStatus('success')
        setMessage(stripHtml(result.msg) || 'Thanks for subscribing.')
        form.reset()
        setCookie(MAILCHIMP.cookie, 'true', 365)
        onSubscribed?.()
      } else {
        setStatus('error')
        setMessage(stripHtml(result.msg) || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const HeadingTag = headingLevel

  return (
    <form
      autoComplete="off"
      className={`${styles.form}${className ? ` ${className}` : ''}`}
      noValidate
      onSubmit={onSubmit}
    >
      <HeadingTag className={styles.heading} id={`${inputId}-heading`}>
        {heading}
      </HeadingTag>
      <label className="sr-only" htmlFor={inputId}>
        Email address
      </label>
      <input
        autoComplete="off"
        className={styles.email}
        disabled={status === 'loading'}
        id={inputId}
        name="EMAIL"
        placeholder="Email address"
        required
        type="email"
      />
      <div aria-hidden="true" className={styles.honeypot}>
        <input defaultValue="" name={MAILCHIMP.honeypot} tabIndex={-1} type="text" />
      </div>
      <button className={styles.submit} disabled={status === 'loading'} name="subscribe" type="submit" value="Submit">
        {status === 'loading' ? 'Submitting' : 'Submit'}
      </button>
      {message ? (
        <p className={status === 'error' ? styles.error : styles.success} role="status">
          {message}
        </p>
      ) : null}
    </form>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
