import Link from 'next/link'
import type { ReactNode } from 'react'

import { applicationLabel, applicationPathKey } from '@/lib/portal'
import { groupImageSets, submissionFileUrl } from '@/lib/portal-media'
import type { Application } from '@/payload-types'

import { MediaGallery, MediaPlayer, TextLink, Title } from './ui'
import styles from './ApplicationReview.module.css'

type ApplicationReviewProps = {
  application: Application
  view: 'forms' | 'media'
  basePath: string
  /** Extra query params preserved on Forms / Media tabs (e.g. jury program). */
  tabParams?: Record<string, string>
  showIdentity?: boolean
}

function tabHref(basePath: string, view: 'forms' | 'media', tabParams?: Record<string, string>) {
  const params = new URLSearchParams(tabParams)
  params.set('view', view)
  return `${basePath}?${params.toString()}`
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string
  value?: string | null
  wide?: boolean
}) {
  const trimmed = value?.trim()

  return (
    <div className={wide ? `${styles.field} ${styles.fieldWide}` : styles.field}>
      <span className={styles.label}>{label}</span>
      <p className={trimmed ? styles.value : `${styles.value} ${styles.valueEmpty}`}>
        {trimmed || '—'}
      </p>
    </div>
  )
}

function Section({
  title,
  caps = false,
  children,
}: {
  title: string
  caps?: boolean
  children: ReactNode
}) {
  return (
    <section className={styles.section}>
      <h2 className={caps ? styles.sectionTitleCaps : styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function imageSets(entries: Application['workImages'], emptyLabel: string) {
  if (!entries?.length) {
    return <p className={styles.empty}>{emptyLabel}</p>
  }

  return (
    <div className={styles.fieldGridFull}>
      {groupImageSets(entries).map((set) => {
        const entry = set.entries[0]
        const images = set.entries.flatMap((item) => {
          const src = submissionFileUrl(item.file)
          return src ? [{ src, alt: item.title || 'Work image' }] : []
        })
        const facts = [entry?.yearCreated, entry?.materials, entry?.dimensions]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(' · ')
        const details = entry?.additionalDetails?.trim()

        return (
          <article className={styles.mediaSet} key={set.setId}>
            <div className={styles.mediaSetMeta}>
              <h3 className={styles.mediaSetTitle}>{entry?.title?.trim() || 'Untitled'}</h3>
              {facts ? <p className={styles.mediaSetFacts}>{facts}</p> : null}
              {details ? <p className={styles.mediaSetDetails}>{details}</p> : null}
            </div>
            {images.length > 0 ? <MediaGallery className={styles.gallery} items={images} /> : null}
          </article>
        )
      })}
    </div>
  )
}

export function ApplicationReview({
  application,
  view,
  basePath,
  tabParams,
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
    <div className={styles.review}>
      <header className={styles.header}>
        <Title>{applicationLabel(application)}</Title>
        <div className={styles.toolbar}>
          <nav aria-label="Application views" className={styles.tabs}>
            <Link
              aria-current={view === 'forms' ? 'page' : undefined}
              className={view === 'forms' ? styles.tabActive : styles.tab}
              href={tabHref(basePath, 'forms', tabParams)}
            >
              Forms
            </Link>
            <Link
              aria-current={view === 'media' ? 'page' : undefined}
              className={view === 'media' ? styles.tabActive : styles.tab}
              href={tabHref(basePath, 'media', tabParams)}
            >
              Media
            </Link>
          </nav>
          <div className={styles.downloads}>
            <TextLink href={`/api/portal/applications/${applicationPathKey(application)}/pdf`}>
              Download application (PDF)
            </TextLink>
            <TextLink href={`/api/portal/applications/${applicationPathKey(application)}/zip`}>
              Download images & media (ZIP)
            </TextLink>
          </div>
        </div>
      </header>

      {view === 'media' ? (
        <div className={styles.body}>
          <section className={styles.section}>
            <div className={styles.workIntro}>
              <h2 className={styles.workTitle}>{application.workTitle?.trim() || '—'}</h2>
              <div className={styles.fieldGrid}>
                <Field label="Year created" value={application.workYearCreated} />
                <Field label="Materials" value={application.workMaterials} />
                <Field label="Dimensions" value={application.workDimensions} wide />
              </div>
              <div className={styles.fieldGridFull}>
                <Field label="Statement of Practice" value={application.artistStatement} wide />
                <Field
                  label="Process of Submitted Work"
                  value={application.workDescription}
                  wide
                />
                <Field
                  label="Significance of Submitted Work"
                  value={application.workSignificance}
                  wide
                />
                <Field label="Why the Spector Craft Prize?" value={application.whyPrize} wide />
              </div>
            </div>
          </section>

          <Section title="Images of submitted work">
            {imageSets(application.workImages, 'No work images uploaded.')}
          </Section>

          <Section title="Career portfolio">
            {imageSets(application.portfolioImages, 'No portfolio images uploaded.')}
          </Section>

          <Section title="Video">
            {videoUrl ? (
              <div className={styles.playerWrap}>
                <MediaPlayer src={videoUrl} />
              </div>
            ) : (
              <p className={styles.empty}>No video uploaded.</p>
            )}
          </Section>
        </div>
      ) : (
        <div className={styles.body}>
          <Section caps title="Personal information">
            <div className={styles.fieldGrid}>
              <Field label="Full name" value={application.fullName} />
              <Field label="Artist name" value={application.artistName} />
              <Field label="Date of birth" value={application.dateOfBirth?.slice(0, 10)} />
              <Field label="Phone" value={application.phone} />
              <Field label="Email" value={application.email} />
              <Field label="Website/portfolio URL" value={application.website} />
              <Field label="Address line 1" value={application.addressLine1} wide />
              <Field label="Address line 2" value={application.addressLine2} wide />
              <Field label="City" value={application.city} />
              <Field label="State" value={application.state} />
              <Field label="Postal/zip code" value={application.postalCode} />
              <Field label="Country" value={application.country} />
              <Field label="Social media" value={application.socialMedia} wide />
            </div>
          </Section>

          <Section caps title="Eligibility confirmation">
            <div className={styles.fieldGrid}>
              <Field label="Years of practice" value={application.yearsOfPractice} />
              <Field
                label="United States citizen or resident"
                value={
                  application.usCitizenOrResident === 'yes'
                    ? 'Yes'
                    : application.usCitizenOrResident === 'no'
                      ? 'No'
                      : ''
                }
              />
              <Field label="Month and year practice began" value={application.practiceBegan} />
              <Field
                label="Practice timeline explanation"
                value={application.practiceBeganDetails}
                wide
              />
              <Field
                label="Educational/training background"
                value={application.trainingBackground}
                wide
              />
              <Field
                label="Primary craft discipline"
                value={application.primaryCraftDiscipline}
                wide
              />
            </div>
          </Section>

          <Section caps title="Biographical information">
            <div className={styles.fieldGridFull}>
              <Field label="Educational background" value={application.educationalBackground} wide />
              <Field label="Recent exhibitions" value={application.recentExhibitions} wide />
              <Field label="Awards/recognition" value={application.awardsRecognition} wide />
              <Field label="Biographical summary" value={application.biographicalSummary} wide />
            </div>
          </Section>

          {showIdentity ? (
            <Section title="Government-issued ID">
              {identityUrl ? (
                identityIsImage ? (
                  <MediaGallery className={styles.gallery} items={[{ src: identityUrl, alt: 'Government-issued ID' }]} />
                ) : (
                  <TextLink href={identityUrl}>Open ID file</TextLink>
                )
              ) : (
                <p className={styles.empty}>No government-issued ID uploaded.</p>
              )}
            </Section>
          ) : null}
        </div>
      )}
    </div>
  )
}
