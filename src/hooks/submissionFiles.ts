import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { isApplicantUser } from '@/access/roles'
import {
  applicationImageError,
  applicationVideoError,
  governmentIdError,
} from '@/lib/portal-media'

export const assignSubmissionFileOwner: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && isApplicantUser(req.user) && req.user?.id) {
    return {
      ...data,
      applicant: req.user.id,
    }
  }

  return data
}

export const validateSubmissionFileRules: CollectionBeforeValidateHook = ({ data, req }) => {
  const kind = data?.kind
  const filesize = data?.filesize ?? req.file?.size
  const mimeType = data?.mimeType ?? req.file?.mimetype
  const filename =
    (typeof data?.filename === 'string' && data.filename) ||
    req.file?.name ||
    null
  const width = data?.width
  const height = data?.height

  const file = { kind, filesize, mimeType, filename, width, height }

  if (kind === 'image') {
    const error = applicationImageError(file)
    if (error !== true) {
      throw new APIError(error, 400)
    }
  }

  if (kind === 'video') {
    const error = applicationVideoError(file)
    if (error !== true) {
      throw new APIError(error, 400)
    }
  }

  if (kind === 'id') {
    const error = governmentIdError(file)
    if (error !== true) {
      throw new APIError(error, 400)
    }
  }

  return data
}
