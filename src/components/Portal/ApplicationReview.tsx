import { applicationLabel } from '@/lib/portal'
import { groupImageSets, submissionFileUrl } from '@/lib/portal-media'
import type { Application } from '@/payload-types'

import {
  Actions,
  MediaGallery,
  MediaPlayer,
  MediaRow,
  Readout,
  Stack,
  Text,
  TextLink,
  Title,
} from './ui'

type ApplicationReviewProps = {
  application: Application
  view: 'forms' | 'media'
  basePath: string
  showIdentity?: boolean
}

function imageSets(entries: Application['workImages'], emptyLabel: string) {
  if (!entries?.length) {
    return <Text>{emptyLabel}</Text>
  }

  return (
    <Stack>
      {groupImageSets(entries).map((set) => {
        const entry = set.entries[0]
        const images = set.entries.flatMap((item) => {
          const src = submissionFileUrl(item.file)
          return src ? [{ src, alt: item.title }] : []
        })

        return (
          <Stack key={set.setId}>
            <MediaRow
              details={entry?.additionalDetails}
              meta={`${entry?.yearCreated} · ${entry?.materials} · ${entry?.dimensions}`}
              title={entry?.title}
            />
            <MediaGallery items={images} />
          </Stack>
        )
      })}
    </Stack>
  )
}

export function ApplicationReview({
  application,
  view,
  basePath,
  showIdentity = false,
}: ApplicationReviewProps) {
  const videoUrl = submissionFileUrl(
    typeof application.workVideo === 'object' ? application.workVideo : null,
  )
  const identityUrl = submissionFileUrl(
    typeof application.governmentId === 'object' ? application.governmentId : null,
  )
  const identityIsImage =
    typeof application.governmentId === 'object' &&
    application.governmentId?.mimeType?.startsWith('image/')

  return (
    <Stack>
      <Title>{applicationLabel(application)}</Title>
      <Actions>
        <TextLink active={view === 'forms'} href={`${basePath}?view=forms`}>
          Forms
        </TextLink>
        <TextLink active={view === 'media'} href={`${basePath}?view=media`}>
          Media
        </TextLink>
        <TextLink href={`/api/portal/applications/${application.id}/pdf`}>
          Download application
        </TextLink>
        <TextLink href={`/api/portal/applications/${application.id}/zip`}>Download files</TextLink>
      </Actions>

      {view === 'media' ? (
        <Stack>
          <Title as="h2">{application.workTitle?.trim() || '—'}</Title>
          <Readout label="Year created" value={application.workYearCreated} />
          <Readout label="Materials" value={application.workMaterials} />
          <Readout label="Dimensions" value={application.workDimensions} />
          <Readout label="Statement of practice" value={application.artistStatement} />
          <Readout label="Description of submitted work" value={application.workDescription} />
          <Readout label="Significance" value={application.workSignificance} />
          <Readout label="Why the Spector Craft Prize?" value={application.whyPrize} />
          <Title as="h2">Images of submitted work</Title>
          {imageSets(application.workImages, 'No work images uploaded.')}
          <Title as="h2">Career portfolio</Title>
          {imageSets(application.portfolioImages, 'No portfolio images uploaded.')}
          <Title as="h2">Video</Title>
          {videoUrl ? <MediaPlayer src={videoUrl} /> : <Text>No video uploaded.</Text>}
        </Stack>
      ) : (
        <Stack>
          <Title as="h2">Personal information</Title>
          <Readout label="Full name" value={application.fullName} />
          <Readout label="Artist name" value={application.artistName} />
          <Readout label="Date of birth" value={application.dateOfBirth?.slice(0, 10)} />
          <Readout label="Address line 1" value={application.addressLine1} />
          <Readout label="Address line 2" value={application.addressLine2} />
          <Readout label="City" value={application.city} />
          <Readout label="State" value={application.state} />
          <Readout label="Postal/zip code" value={application.postalCode} />
          <Readout label="Country" value={application.country} />
          <Readout label="Phone" value={application.phone} />
          <Readout label="Email" value={application.email} />
          <Readout label="Website/portfolio URL" value={application.website} />
          <Readout label="Social media" value={application.socialMedia} />

          <Title as="h2">Eligibility confirmation</Title>
          <Readout label="Years of practice" value={application.yearsOfPractice} />
          <Readout label="Educational/training background" value={application.trainingBackground} />
          <Readout label="Primary craft discipline" value={application.primaryCraftDiscipline} />
          <Readout
            label="United States citizen or resident"
            value={
              application.usCitizenOrResident === 'yes'
                ? 'Yes'
                : application.usCitizenOrResident === 'no'
                  ? 'No'
                  : ''
            }
          />

          <Title as="h2">Biographical information</Title>
          <Readout label="Educational background" value={application.educationalBackground} />
          <Readout label="Recent exhibitions" value={application.recentExhibitions} />
          <Readout label="Awards/recognition" value={application.awardsRecognition} />
          <Readout label="Biographical summary" value={application.biographicalSummary} />

          {showIdentity ? (
            <>
              <Title as="h2">Government-issued ID</Title>
              {identityUrl ? (
                identityIsImage ? (
                  <MediaGallery items={[{ src: identityUrl, alt: 'Government-issued ID' }]} />
                ) : (
                  <TextLink href={identityUrl}>Open ID file</TextLink>
                )
              ) : (
                <Text>No government-issued ID uploaded.</Text>
              )}
            </>
          ) : null}
        </Stack>
      )}
    </Stack>
  )
}
