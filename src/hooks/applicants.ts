import type { CollectionBeforeDeleteHook } from 'payload'

export const deleteApplicantDependents: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'applications',
    overrideAccess: true,
    overrideLock: true,
    req,
    where: {
      applicant: {
        equals: id,
      },
    },
  })

  await req.payload.delete({
    collection: 'submission-files',
    overrideAccess: true,
    overrideLock: true,
    req,
    where: {
      applicant: {
        equals: id,
      },
    },
  })
}
