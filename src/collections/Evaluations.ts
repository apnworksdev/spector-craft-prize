import type { CollectionConfig } from 'payload'

import {
  evaluationsCreate,
  evaluationsRead,
  evaluationsUpdate,
} from '@/access/evaluations'
import { adminOnly, isAdmin } from '@/access/roles'
import {
  assignEvaluationJuror,
  assignEvaluationTotal,
  enforceEvaluationTarget,
  refreshApplicationPanelGradeAfterChange,
  refreshApplicationPanelGradeAfterDelete,
  syncEvaluationIdentity,
} from '@/hooks/evaluations'
import {
  JURY_SCORE_FIELDS,
  JURY_SCORE_MAX,
  JURY_SCORE_MIN,
  JURY_SCORE_TOTAL_MAX,
} from '@/lib/jury-scores'

export const Evaluations: CollectionConfig = {
  slug: 'evaluations',
  admin: {
    defaultColumns: [
      'listTitle',
      'application',
      'juror',
      'artisticExcellence',
      'culturalSignificance',
      'growthPotential',
      'missionAlignment',
      'total',
      'updatedAt',
    ],
    hidden: ({ user }) => user?.role !== 'admin',
    group: 'Submissions',
    useAsTitle: 'listTitle',
    description:
      'All juror scores on one list. Total is the sum of the four criteria (max 20). Filter by application or juror as needed.',
    components: {
      beforeListTable: ['/components/Admin/EvaluationsExportButton#EvaluationsExportButton'],
    },
  },
  access: {
    admin: ({ req }) => isAdmin(req.user),
    create: evaluationsCreate,
    read: evaluationsRead,
    update: evaluationsUpdate,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      enforceEvaluationTarget,
      assignEvaluationJuror,
      assignEvaluationTotal,
      syncEvaluationIdentity,
    ],
    afterChange: [refreshApplicationPanelGradeAfterChange],
    afterDelete: [refreshApplicationPanelGradeAfterDelete],
  },
  indexes: [
    {
      fields: ['application', 'juror'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'listTitle',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Applicant and juror. This is the evaluation title and URL.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      required: true,
      admin: {
        description: 'Shown by applicant name when the application list title is set.',
      },
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
      name: 'total',
      type: 'number',
      min: JURY_SCORE_FIELDS.length * JURY_SCORE_MIN,
      max: JURY_SCORE_TOTAL_MAX,
      admin: {
        readOnly: true,
        description: `Sum of the four criteria (max ${JURY_SCORE_TOTAL_MAX}).`,
        components: {
          Cell: '/components/Admin/PanelMedianCell#PanelMedianCell',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
