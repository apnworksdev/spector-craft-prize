'use client'

import {
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

import styles from './ui.module.css'

type FieldChrome = {
  label: ReactNode
  hint?: ReactNode
  note?: ReactNode
  error?: string
}

function controlClass(base: string, error?: string, extra?: string) {
  return [base, error ? styles.controlInvalid : null, extra].filter(Boolean).join(' ')
}

function Field({
  label,
  hint,
  hintId,
  note,
  noteId,
  error,
  errorId,
  children,
}: FieldChrome & { hintId?: string; noteId?: string; errorId?: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint ? (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
      {children}
      {error ? (
        <span className={styles.fieldError} id={errorId} role="alert">
          {error}
        </span>
      ) : null}
      {note ? (
        <span className={styles.hint} id={noteId}>
          {note}
        </span>
      ) : null}
    </label>
  )
}

function describedBy(ids: Array<string | undefined>, existing?: string) {
  return [...ids, existing].filter(Boolean).join(' ') || undefined
}

export function TextField({
  label,
  hint,
  note,
  error,
  className,
  ...input
}: FieldChrome & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <Field error={error} errorId={errorId} hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <input
        {...input}
        aria-describedby={describedBy([hintId, noteId, errorId], input['aria-describedby'])}
        aria-invalid={error ? true : input['aria-invalid']}
        className={controlClass(styles.input, error, className)}
      />
    </Field>
  )
}

export function TextArea({
  label,
  hint,
  note,
  error,
  className,
  ...textarea
}: FieldChrome & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <Field error={error} errorId={errorId} hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <textarea
        {...textarea}
        aria-describedby={describedBy([hintId, noteId, errorId], textarea['aria-describedby'])}
        aria-invalid={error ? true : textarea['aria-invalid']}
        className={controlClass(styles.textarea, error, className)}
      />
    </Field>
  )
}

export function SelectField({
  label,
  hint,
  note,
  error,
  className,
  children,
  ...select
}: FieldChrome & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <Field error={error} errorId={errorId} hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <select
        {...select}
        aria-describedby={describedBy([hintId, noteId, errorId], select['aria-describedby'])}
        aria-invalid={error ? true : select['aria-invalid']}
        className={controlClass(styles.select, error, className)}
      >
        {children}
      </select>
    </Field>
  )
}

export function FileField({
  label,
  hint,
  note,
  error,
  fileStatus,
  children,
  className,
  onChange,
  multiple,
  ...input
}: FieldChrome &
  InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode; fileStatus?: string | null }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined
  const errorId = error ? `${id}-error` : undefined
  const [dragging, setDragging] = useState(false)
  const [selectionLabel, setSelectionLabel] = useState<string | null>(null)

  useEffect(() => {
    if (fileStatus) {
      setSelectionLabel(fileStatus)
    }
  }, [fileStatus])

  const zoneClass = [
    styles.dropzone,
    dragging ? styles.dropzoneActive : null,
    error ? styles.controlInvalid : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const prompt = multiple ? 'Drop images here or browse' : 'Drop a file here or browse'

  return (
    <Field error={error} errorId={errorId} hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <div
        className={zoneClass}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return
          }
          setDragging(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDrop={() => {
          setDragging(false)
        }}
      >
        <input
          {...input}
          aria-describedby={describedBy([hintId, noteId, errorId], input['aria-describedby'])}
          aria-invalid={error ? true : input['aria-invalid']}
          className={styles.fileInputHidden}
          multiple={multiple}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length > 0) {
              setSelectionLabel(
                files.length === 1 ? files[0].name : `${files.length} files selected`,
              )
            }
            onChange?.(event)
          }}
          type="file"
        />
        <span className={styles.dropzonePrompt}>{prompt}</span>
      </div>
      {selectionLabel ? <span className={styles.hint}>{selectionLabel}</span> : null}
      {children}
    </Field>
  )
}

export function Checkbox({
  label,
  error,
  ...input
}: { label: ReactNode; error?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={styles.checkField}>
      <label className={styles.check}>
        <input
          {...input}
          aria-describedby={describedBy([errorId], input['aria-describedby'])}
          aria-invalid={error ? true : input['aria-invalid']}
          className={styles.checkbox}
          type="checkbox"
        />
        <span>{label}</span>
      </label>
      {error ? (
        <span className={styles.fieldError} id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...input } = props

  return <input {...input} className={[styles.input, className].filter(Boolean).join(' ')} />
}

export function Select({
  className,
  children,
  ...select
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...select} className={[styles.select, className].filter(Boolean).join(' ')}>
      {children}
    </select>
  )
}
