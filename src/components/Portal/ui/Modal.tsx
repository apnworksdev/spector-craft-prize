'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Title } from './Layout'
import styles from './ui.module.css'

type ModalProps = {
  title: ReactNode
  titleId?: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Modal({ title, titleId, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const generatedId = useId()
  const labelledBy = titleId ?? generatedId

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = focusables()[0] ?? dialog
    first.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        dialog?.focus()
        return
      }

      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === firstItem || active === dialog)) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={styles.modal}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <Title as="h2" id={labelledBy}>
          {title}
        </Title>
        {children}
      </div>
    </div>
  )
}
