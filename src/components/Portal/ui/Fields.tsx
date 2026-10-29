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

function EyeIcon({ crossed }: { crossed?: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
      {crossed ? (
        <path
          d="M4 20 20 4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.75"
        />
      ) : null}
    </svg>
  )
}

export function TextField({
  label,
  hint,
  note,
  error,
  className,
  type = 'text',
  ...input
}: FieldChrome & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined
  const errorId = error ? `${id}-error` : undefined
  const isPassword = type === 'password'
  const [passwordVisible, setPasswordVisible] = useState(false)

  const control = (
    <input
      {...input}
      aria-describedby={describedBy([hintId, noteId, errorId], input['aria-describedby'])}
      aria-invalid={error ? true : input['aria-invalid']}
      className={controlClass(
        styles.input,
        error,
        [isPassword ? styles.passwordInput : null, className].filter(Boolean).join(' ') || undefined,
      )}
      type={isPassword ? (passwordVisible ? 'text' : 'password') : type}
    />
  )

  return (
    <Field error={error} errorId={errorId} hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      {isPassword ? (
        <span className={styles.passwordField}>
          {control}
          <button
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            className={styles.passwordToggle}
            disabled={input.disabled}
            onClick={() => setPasswordVisible((visible) => !visible)}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            <EyeIcon crossed={passwordVisible} />
          </button>
        </span>
      ) : (
        control
      )}
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

export type FileFieldPreview = {
  kind: 'image' | 'pdf'
  src?: string | null
  name?: string | null
}

export function FileField({
  label,
  hint,
  note,
  error,
  fileStatus,
  preview,
  children,
  className,
  onChange,
  multiple,
  ...input
}: FieldChrome &
  InputHTMLAttributes<HTMLInputElement> & {
    children?: ReactNode
    fileStatus?: string | null
    preview?: FileFieldPreview | null
  }) {
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
    preview ? styles.dropzoneHasPreview : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const prompt = multiple ? 'Drop images here or browse' : 'Drop a file here or browse'
  const previewLabel =
    preview?.kind === 'pdf'
      ? preview.name?.trim() || 'PDF on file'
      : preview?.name?.trim() || selectionLabel

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
        {preview?.kind === 'image' && preview.src ? (
          <img alt="" className={styles.dropzonePreviewImage} decoding="async" src={preview.src} />
        ) : null}
        {preview?.kind === 'pdf' ? (
          <span className={styles.dropzonePreviewPdf}>PDF on file</span>
        ) : null}
        {!preview ? <span className={styles.dropzonePrompt}>{prompt}</span> : null}
        {preview && previewLabel ? (
          <span className={styles.dropzonePreviewName}>{previewLabel}</span>
        ) : null}
      </div>
      {!preview && selectionLabel ? <span className={styles.hint}>{selectionLabel}</span> : null}
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
