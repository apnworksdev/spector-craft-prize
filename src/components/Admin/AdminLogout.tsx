'use client'

import { useEffect } from 'react'

import { clearSharedAuthCookie } from './clearSharedAuthCookie'

export function AdminLogout() {
  useEffect(() => {
    void clearSharedAuthCookie().finally(() => {
      window.location.replace('/admin/login')
    })
  }, [])

  return null
}
