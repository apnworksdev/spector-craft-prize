import type { CollectionBeforeChangeHook } from 'payload'

export const syncUserListTitle: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) {
    return data
  }

  const first =
    (typeof data.firstName === 'string' ? data.firstName : null) ??
    (typeof originalDoc?.firstName === 'string' ? originalDoc.firstName : null)
  const last =
    (typeof data.lastName === 'string' ? data.lastName : null) ??
    (typeof originalDoc?.lastName === 'string' ? originalDoc.lastName : null)
  const email =
    (typeof data.email === 'string' ? data.email : null) ??
    (typeof originalDoc?.email === 'string' ? originalDoc.email : null)

  const listTitle = [first, last].filter((part) => part?.trim()).join(' ').trim() || email?.trim() || 'User'

  return {
    ...data,
    listTitle,
  }
}
