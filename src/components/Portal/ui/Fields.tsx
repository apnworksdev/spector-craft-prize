import {
  useId,
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
}

function Field({
  label,
  hint,
  hintId,
  note,
  noteId,
  children,
}: FieldChrome & { hintId?: string; noteId?: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint ? (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
      {children}
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
  ...input
}: FieldChrome & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined

  return (
    <Field hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <input
        {...input}
        aria-describedby={describedBy([hintId, noteId], input['aria-describedby'])}
        className={styles.input}
      />
    </Field>
  )
}

export function TextArea({
  label,
  hint,
  note,
  ...textarea
}: FieldChrome & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined

  return (
    <Field hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <textarea
        {...textarea}
        aria-describedby={describedBy([hintId, noteId], textarea['aria-describedby'])}
        className={styles.textarea}
      />
    </Field>
  )
}

export function SelectField({
  label,
  hint,
  note,
  children,
  ...select
}: FieldChrome & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined

  return (
    <Field hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <select
        {...select}
        aria-describedby={describedBy([hintId, noteId], select['aria-describedby'])}
        className={styles.select}
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
  children,
  ...input
}: FieldChrome & InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const noteId = note ? `${id}-note` : undefined

  return (
    <Field hint={hint} hintId={hintId} label={label} note={note} noteId={noteId}>
      <input
        {...input}
        aria-describedby={describedBy([hintId, noteId], input['aria-describedby'])}
        className={styles.file}
        type="file"
      />
      {children}
    </Field>
  )
}

export function Checkbox({
  label,
  ...input
}: { label: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className={styles.check}>
      <input {...input} className={styles.checkbox} type="checkbox" />
      <span>{label}</span>
    </label>
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
