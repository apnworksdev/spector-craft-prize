import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from './cx'
import styles from './ui.module.css'

type Variant = 'primary' | 'secondary' | 'link' | 'dashed'

const variantClass: Record<Variant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.button,
  link: styles.linkButton,
  dashed: styles.dashed,
}

type Shared = {
  variant?: Variant
  children: ReactNode
  className?: string
}

type AsButton = Shared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined
  }

type AsLink = Shared & {
  href: string
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href) || href.startsWith('/api/')
}

function isLink(props: AsButton | AsLink): props is AsLink {
  return typeof props.href === 'string'
}

export function Button(props: AsButton | AsLink) {
  const className = cx(variantClass[props.variant ?? 'secondary'], props.className)

  if (isLink(props)) {
    if (isExternal(props.href)) {
      return (
        <a className={className} href={props.href}>
          {props.children}
        </a>
      )
    }

    return (
      <Link className={className} href={props.href}>
        {props.children}
      </Link>
    )
  }

  const { children, className: _className, type = 'button', variant: _variant, ...rest } = props

  return (
    <button className={className} type={type} {...rest}>
      {children}
    </button>
  )
}
