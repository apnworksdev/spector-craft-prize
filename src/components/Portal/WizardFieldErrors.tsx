'use client'

import { createContext, useContext } from 'react'

import type { FieldErrors } from '@/lib/application-validation'

const WizardFieldErrorsContext = createContext<FieldErrors>({})

export function WizardFieldErrorsProvider({
  errors,
  children,
}: {
  errors: FieldErrors
  children: React.ReactNode
}) {
  return (
    <WizardFieldErrorsContext.Provider value={errors}>{children}</WizardFieldErrorsContext.Provider>
  )
}

export function useWizardFieldError(name: string): string | undefined {
  const errors = useContext(WizardFieldErrorsContext)
  return errors[name]
}

export function useWizardFieldErrors(): FieldErrors {
  return useContext(WizardFieldErrorsContext)
}
