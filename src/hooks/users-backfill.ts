import type { Payload } from 'payload'

export async function backfillUserListTitles(payload: Payload) {
  try {
    const result = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
    })

    for (const doc of result.docs) {
      const listTitle =
        [doc.firstName, doc.lastName].filter((part) => part?.trim()).join(' ').trim() ||
        doc.email ||
        'User'
      if (doc.listTitle === listTitle) {
        continue
      }

      await payload.update({
        collection: 'users',
        id: doc.id,
        data: { listTitle },
        overrideAccess: true,
      })
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: 'Skipped user listTitle backfill',
    })
  }
}
