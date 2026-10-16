import type { CollectionConfig } from 'payload'

import {
  evaluationsCreate,
  evaluationsRead,
  evaluationsUpdate,
} from '@/access/evaluations'
import { adminOnly, isAdmin } from '@/access/roles'
import { assignEvaluationJuror, enforceEvaluationTarget } from '@/hooks/evaluations'
import { JURY_SCORE_FIELDS, JURY_SCORE_MAX, JURY_SCORE_MIN } from '@/lib/jury-scores'

export const Evaluations: CollectionConfig = {
  slug: 'evaluations',
  admin: {
    defaultColumns: ['application', 'juror', 'updatedAt'],
    hidden: ({ user }) => user?.role !== 'admin',
    group: 'Submissions',
    useAsTitle: 'id',
  },
  access: {
    admin: ({ req }) => isAdmin(req.user),
    create: evaluationsCreate,
    read: evaluationsRead,
    update: evaluationsUpdate,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [enforceEvaluationTarget, assignEvaluationJuror],
  },
  indexes: [
    {
      fields: ['application', 'juror'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      required: true,
    },
    {
      name: 'juror',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    ...JURY_SCORE_FIELDS.map((field) => ({
      name: field.name,
      type: 'number' as const,
      required: true,
      min: JURY_SCORE_MIN,
      max: JURY_SCORE_MAX,
      admin: {
        description: `${field.title}. ${JURY_SCORE_MIN}–${JURY_SCORE_MAX}.`,
      },
    })),
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
