'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { getServerURL } from '@/lib/env'
import { PORTAL_PATHS } from '@/lib/portal'

import { Actions, Button, PanelForm, Text, TextField, TextLink, Title } from './ui'

const serverURL = getServerURL()

type AuthFormsProps = {
  mode: 'login' | 'signup' | 'forgot' | 'reset'
  collection: 'applicants' | 'users'
  redirectTo: string
  resetToken?: string
}

export function AuthForms({ mode, collection, redirectTo, resetToken }: AuthFormsProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      if (mode === 'forgot') {
        const response = await fetch(`${serverURL}/api/${collection}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: String(formData.get('email') || '') }),
        })

        if (!response.ok) {
          throw new Error('Could not send reset email.')
        }

        setMessage('If that email exists, we sent reset instructions.')
        setLoading(false)
        return
      }

      if (mode === 'reset') {
        const response = await fetch(`${serverURL}/api/${collection}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken,
            password: String(formData.get('password') || ''),
          }),
        })

        if (!response.ok) {
          throw new Error('Could not reset password.')
        }

        router.push(redirectTo)
        router.refresh()
        return
      }

      if (mode === 'signup') {
        const createResponse = await fetch(`${serverURL}/api/${collection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: String(formData.get('email') || ''),
            password: String(formData.get('password') || ''),
            firstName: String(formData.get('firstName') || ''),
            lastName: String(formData.get('lastName') || ''),
          }),
        })

        const createResult = await createResponse.json().catch(() => ({}))
        if (!createResponse.ok) {
          throw new Error(createResult.errors?.[0]?.message || 'Sign up failed.')
        }

        setMessage('Check your email to verify your account before logging in.')
        setLoading(false)
        return
      }

      const response = await fetch(`${serverURL}/api/${collection}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: String(formData.get('email') || ''),
          password: String(formData.get('password') || ''),
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.message || 'Authentication failed.')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <PanelForm onSubmit={onSubmit}>
      <Title>
        {mode === 'login' && 'Log in to your account'}
        {mode === 'signup' && 'Sign up'}
        {mode === 'forgot' && 'Forgot password'}
        {mode === 'reset' && 'Reset password'}
      </Title>

      {mode === 'signup' ? (
        <>
          <TextField label="First name" name="firstName" required />
          <TextField label="Last name" name="lastName" required />
        </>
      ) : null}

      {mode !== 'reset' ? <TextField label="Email" name="email" required type="email" /> : null}

      {mode === 'login' || mode === 'signup' || mode === 'reset' ? (
        <TextField label="Password" name="password" required type="password" />
      ) : null}

      {error ? <Text variant="error">{error}</Text> : null}
      {message ? <Text variant="success">{message}</Text> : null}

      <Actions>
        <Button disabled={loading} type="submit" variant="primary">
          {mode === 'signup'
            ? 'Sign up'
            : mode === 'forgot'
              ? 'Send reset link'
              : mode === 'login'
                ? 'Log in'
                : 'Reset password'}
        </Button>
        {mode === 'login' && collection === 'applicants' ? (
          <>
            <TextLink href={PORTAL_PATHS.signup}>Sign up</TextLink>
            <TextLink href={PORTAL_PATHS.forgotPassword}>Forgot password?</TextLink>
          </>
        ) : null}
        {mode !== 'login' ? <TextLink href={PORTAL_PATHS.login}>Back to login</TextLink> : null}
      </Actions>
    </PanelForm>
  )
}
