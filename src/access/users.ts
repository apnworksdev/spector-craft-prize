import type { Access } from 'payload'

import { isAdmin, isJuror } from '@/access/roles'

export const usersRead: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (isJuror(req.user) && req.user?.id) {
    return {
      id: {
        equals: req.user.id,
      },
    }
  }

  return false
}

export const usersUpdate: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (isJuror(req.user) && req.user?.id) {
    return {
      id: {
        equals: req.user.id,
      },
    }
  }

  return false
}
