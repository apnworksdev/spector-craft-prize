import { forwardRef, type ComponentProps, type HTMLAttributes, type ReactNode } from 'react'

import { cx } from './cx'
import styles from './ui.module.css'

type PanelWidth = {
  width?: 'narrow' | 'wide'
}

export function Panel({
  width = 'narrow',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & PanelWidth) {
  return (
    <div className={cx(width === 'wide' ? styles.widePanel : styles.panel, className)} {...rest}>
      {children}
    </div>
  )
}

export function PanelForm({
  width = 'narrow',
  className,
  children,
  ...rest
}: ComponentProps<'form'> & PanelWidth) {
  return (
    <form className={cx(width === 'wide' ? styles.widePanel : styles.panel, className)} {...rest}>
      {children}
    </form>
  )
}

type StackProps = {
  as?: 'div' | 'section' | 'ul' | 'aside' | 'form'
  className?: string
  dense?: boolean
  children: ReactNode
  action?: ComponentProps<'form'>['action']
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'action'>

export function Stack({ as: Tag = 'div', className, dense, children, ...rest }: StackProps) {
  const Component = Tag as 'div'

  return (
    <Component className={cx(styles.stack, dense && styles.stackDense, className)} {...rest}>
      {children}
    </Component>
  )
}

export const FormStack = forwardRef<HTMLFormElement, ComponentProps<'form'>>(function FormStack(
  { className, ...props },
  ref,
) {
  return <form ref={ref} className={cx(styles.stack, className)} {...props} />
})

export function FieldRow({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.fieldRow, className)} {...rest}>
      {children}
    </div>
  )
}

type ActionsProps = {
  as?: 'div' | 'form' | 'nav'
  className?: string
  children: ReactNode
  action?: ComponentProps<'form'>['action']
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'action'> & {
    'aria-label'?: string
  }

export function Actions({ as: Tag = 'div', className, children, ...rest }: ActionsProps) {
  const Component = Tag as 'div'

  return (
    <Component className={cx(styles.actions, className)} {...rest}>
      {children}
    </Component>
  )
}

export function Title({
  as: Tag = 'h1',
  variant,
  children,
  id,
}: {
  as?: 'h1' | 'h2' | 'p'
  variant?: 'page' | 'section'
  children: ReactNode
  id?: string
}) {
  const resolvedVariant = variant ?? (Tag === 'h2' ? 'section' : 'page')

  return (
    <Tag
      className={resolvedVariant === 'section' ? styles.sectionTitle : styles.title}
      id={id}
    >
      {children}
    </Tag>
  )
}

export function FormSection({ className, children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cx(styles.formSection, className)} {...rest}>
      {children}
    </section>
  )
}

export function Text({
  as: Tag = 'p',
  variant = 'lead',
  children,
}: {
  as?: 'p' | 'span'
  variant?: 'lead' | 'hint' | 'error' | 'success'
  children: ReactNode
}) {
  return (
    <Tag
      className={styles[variant]}
      role={variant === 'error' ? 'alert' : variant === 'success' ? 'status' : undefined}
    >
      {children}
    </Tag>
  )
}

export function Table({ children }: { children: ReactNode }) {
  return <table className={styles.table}>{children}</table>
}
