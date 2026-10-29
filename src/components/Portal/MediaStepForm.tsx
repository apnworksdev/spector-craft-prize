'use client'

import { useEffect, useState } from 'react'

import { enqueueApplicationSave } from '@/lib/application-save-queue'
import type { FieldErrors } from '@/lib/application-validation'
import {
  ADDITIONAL_DETAILS_MAX_WORDS,
  APPLICATION_IMAGE_LIMITS,
  APPLICATION_IMAGE_MAX,
  APPLICATION_IMAGE_NAMING,
  APPLICATION_IMAGE_TYPES,
  APPLICATION_VIDEO_HELP,
  APPLICATION_VIDEO_TYPES,
  PORTFOLIO_IMAGE_LIMITS,
  submissionFileUrl,
} from '@/lib/portal-media'
import { PORTAL_PATHS, relationId, type WizardStep } from '@/lib/portal'
import { uploadSubmissionFile } from '@/lib/portal-upload'
import { wordCountError } from '@/lib/word-count'
import type { Application } from '@/payload-types'

import { useWizardFieldError } from '@/components/Portal/WizardFieldErrors'

import { ApplicationWizard } from './ApplicationWizard'
import styles from './portal.module.css'
import {
  Actions,
  Button,
  FileField,
  FormSection,
  MediaList,
  MediaRow,
  Modal,
  Text,
  TextArea,
  TextField,
  Title,
} from './ui'

type ImageEntry = {
  id?: string | null
  setId: string
  fileId: number
  url: string | null
  title: string
  yearCreated: string
  materials: string
  dimensions: string
  additionalDetails: string
}

type ImageList = 'work' | 'portfolio'

type MediaStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: (data: Partial<Application>) => void
  onContinue?: (data: Partial<Application>) => void
  onDraft?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  initialFieldErrors?: FieldErrors
  focusToken?: number
}

type Editor = { kind: 'image'; list: ImageList; setId: string | null } | { kind: 'video' }

function newSetId() {
  return crypto.randomUUID()
}

function imageEntries(entries: Application['workImages']): ImageEntry[] {
  return (entries ?? []).flatMap((entry) => {
    const fileId = relationId(entry.file)
    if (!fileId) {
      return []
    }

    return [
      {
        id: entry.id,
        setId: entry.setId?.trim() || entry.id || String(fileId),
        fileId,
        url: submissionFileUrl(typeof entry.file === 'object' ? entry.file : null),
        title: entry.title ?? '',
        yearCreated: entry.yearCreated ?? '',
        materials: entry.materials ?? '',
        dimensions: entry.dimensions ?? '',
        additionalDetails: entry.additionalDetails ?? '',
      },
    ]
  })
}

function grouped(entries: ImageEntry[]) {
  const sets: Array<{ setId: string; entries: ImageEntry[] }> = []
  for (const entry of entries) {
    const existing = sets.find((set) => set.setId === entry.setId)
    if (existing) {
      existing.entries.push(entry)
    } else {
      sets.push({ setId: entry.setId, entries: [entry] })
    }
  }

  return sets
}

function toPayload(entry: ImageEntry) {
  return {
    id: entry.id,
    setId: entry.setId,
    file: entry.fileId,
    title: entry.title,
    yearCreated: entry.yearCreated,
    materials: entry.materials,
    dimensions: entry.dimensions,
    additionalDetails: entry.additionalDetails,
  }
}

function mediaPayload(
  images: ImageEntry[],
  portfolio: ImageEntry[],
  videoId: number | null,
): Partial<Application> {
  return {
    workImages: images.map(toPayload),
    portfolioImages: portfolio.map(toPayload),
    workVideo: videoId,
  }
}

function WorkImagesIntro() {
  const workImagesError = useWizardFieldError('workImages')

  return (
    <>
      <Title as="h2" caps>
        Images of submitted work*
      </Title>
      <Text variant="hint">{APPLICATION_IMAGE_NAMING}</Text>
      <Text variant="hint">{APPLICATION_IMAGE_LIMITS}</Text>
      {workImagesError ? (
        <Text className={styles.sectionError} variant="error">
          {workImagesError}
        </Text>
      ) : null}
    </>
  )
}

export function MediaStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onDraft,
  onSaveAndExit,
  onSelectStep,
  initialFieldErrors,
  focusToken,
}: MediaStepFormProps) {
  const [images, setImages] = useState(() => imageEntries(application.workImages))
  const [portfolio, setPortfolio] = useState(() => imageEntries(application.portfolioImages))
  const [videoId, setVideoId] = useState<number | null>(() => relationId(application.workVideo))
  const [videoUrl, setVideoUrl] = useState(() =>
    submissionFileUrl(typeof application.workVideo === 'object' ? application.workVideo : null),
  )
  const [editor, setEditor] = useState<Editor | null>(null)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [yearCreated, setYearCreated] = useState('')
  const [materials, setMaterials] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [existingFileId, setExistingFileId] = useState<number | null>(null)
  const [setEntries, setSetEntries] = useState<ImageEntry[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [formError, setFormError] = useState('')
  const [editorFieldErrors, setEditorFieldErrors] = useState<Record<string, string>>({})
  const [savingItem, setSavingItem] = useState(false)

  function persist(
    nextImages: ImageEntry[],
    nextPortfolio: ImageEntry[],
    nextVideoId: number | null,
    nextVideoUrl: string | null = videoUrl,
  ) {
    setImages(nextImages)
    setPortfolio(nextPortfolio)
    setVideoId(nextVideoId)
    setVideoUrl(nextVideoId ? nextVideoUrl : null)
    const data = mediaPayload(nextImages, nextPortfolio, nextVideoId)
    onDraft?.(data)
    void enqueueApplicationSave(application.id, data).then((result) => {
      if (!result.ok) {
        setFormError(result.error)
      }
    })
  }

  function resetEditor() {
    setTitle('')
    setYearCreated('')
    setMaterials('')
    setDimensions('')
    setAdditionalDetails('')
    setExistingFileId(null)
    setSetEntries([])
    setPendingFiles([])
    setFormError('')
    setEditorFieldErrors({})
  }

  function openNewImage(list: ImageList) {
    resetEditor()
    setAdding(true)
    setEditor({ kind: 'image', list, setId: null })
  }

  function openImageSet(list: ImageList, setId: string) {
    const source = list === 'work' ? images : portfolio
    const entries = source.filter((entry) => entry.setId === setId)
    const entry = entries[0]
    if (!entry) {
      return
    }

    setTitle(entry.title)
    setYearCreated(entry.yearCreated)
    setMaterials(entry.materials)
    setDimensions(entry.dimensions)
    setAdditionalDetails(entry.additionalDetails)
    setSetEntries(entries)
    setPendingFiles([])
    setFormError('')
    setAdding(false)
    setEditor({ kind: 'image', list, setId })
  }

  function openNewVideo() {
    resetEditor()
    setAdding(true)
    setEditor({ kind: 'video' })
  }

  function openVideo() {
    resetEditor()
    setExistingFileId(videoId)
    setAdding(false)
    setEditor({ kind: 'video' })
  }

  function closeEditor() {
    if (savingItem) {
      return
    }

    setEditor(null)
    setFormError('')
  }

  function remainingSlots(list: ImageList, setId: string | null) {
    const source = list === 'work' ? images : portfolio
    const usedOutsideSet = source.filter((entry) => entry.setId !== setId).length
    return APPLICATION_IMAGE_MAX - usedOutsideSet - setEntries.length - pendingFiles.length
  }

  async function saveEditor() {
    if (!editor) {
      return
    }

    setSavingItem(true)
    setFormError('')

    if (editor.kind === 'video') {
      let nextVideoId = existingFileId
      let nextVideoUrl = videoUrl
      if (pendingFiles[0]) {
        const uploaded = await uploadSubmissionFile(pendingFiles[0], 'video')
        if ('error' in uploaded) {
          setFormError(uploaded.error)
          setSavingItem(false)
          return
        }
        nextVideoId = uploaded.id
        nextVideoUrl = uploaded.url
      }

      if (!nextVideoId) {
        setFormError('A video file is required.')
        setSavingItem(false)
        return
      }

      persist(images, portfolio, nextVideoId, nextVideoUrl)
      setSavingItem(false)
      setEditor(null)
      return
    }

    const nextFieldErrors: Record<string, string> = {}
    if (!title.trim()) {
      nextFieldErrors.title = 'This field is required.'
    }
    if (!yearCreated.trim()) {
      nextFieldErrors.yearCreated = 'This field is required.'
    }
    if (!materials.trim()) {
      nextFieldErrors.materials = 'This field is required.'
    }
    if (!dimensions.trim()) {
      nextFieldErrors.dimensions = 'This field is required.'
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setEditorFieldErrors(nextFieldErrors)
      setSavingItem(false)
      return
    }
    setEditorFieldErrors({})

    const detailsError = wordCountError(additionalDetails, ADDITIONAL_DETAILS_MAX_WORDS)
    if (detailsError !== true) {
      setEditorFieldErrors({ additionalDetails: detailsError })
      setSavingItem(false)
      return
    }

    if (setEntries.length + pendingFiles.length < 1) {
      setFormError('Add at least one image.')
      setSavingItem(false)
      return
    }

    const uploadedFiles: Array<{ id: number; url: string | null }> = []
    for (const file of pendingFiles) {
      const uploaded = await uploadSubmissionFile(file, 'image')
      if ('error' in uploaded) {
        setFormError(uploaded.error)
        setSavingItem(false)
        return
      }
      uploadedFiles.push(uploaded)
    }

    const setId = editor.setId ?? newSetId()
    const shared = {
      setId,
      title: title.trim(),
      yearCreated: yearCreated.trim(),
      materials: materials.trim(),
      dimensions: dimensions.trim(),
      additionalDetails: additionalDetails.trim(),
    }
    const nextSet: ImageEntry[] = [
      ...setEntries.map((entry) => ({ ...entry, ...shared })),
      ...uploadedFiles.map((file) => ({ fileId: file.id, url: file.url, ...shared })),
    ]

    const source = editor.list === 'work' ? images : portfolio
    const withoutSet = source.filter((entry) => entry.setId !== setId)
    const nextList = [...withoutSet, ...nextSet]
    const nextImages = editor.list === 'work' ? nextList : images
    const nextPortfolio = editor.list === 'portfolio' ? nextList : portfolio

    persist(nextImages, nextPortfolio, videoId)
    setSavingItem(false)
    setEditor(null)
  }

  function deleteImageSet(list: ImageList, setId: string) {
    if (list === 'work') {
      persist(
        images.filter((entry) => entry.setId !== setId),
        portfolio,
        videoId,
      )
      return
    }

    persist(
      images,
      portfolio.filter((entry) => entry.setId !== setId),
      videoId,
    )
  }

  function deleteVideo() {
    persist(images, portfolio, null)
  }

  function renderSets(list: ImageList, entries: ImageEntry[]) {
    return grouped(entries).map((set) => {
      const entry = set.entries[0]
      const count = set.entries.length
      return (
        <MediaRow
          actions={
            !readOnly ? (
              <>
                <Button onClick={() => openImageSet(list, set.setId)} variant="link">
                  Edit
                </Button>
                <Button onClick={() => deleteImageSet(list, set.setId)} variant="link">
                  Delete
                </Button>
              </>
            ) : null
          }
          details={entry.additionalDetails || undefined}
          key={set.setId}
          meta={`${entry.yearCreated} · ${entry.materials} · ${entry.dimensions} · ${count} ${count === 1 ? 'image' : 'images'}`}
          preview={entry.url ? { kind: 'image', src: entry.url } : null}
          title={entry.title}
        />
      )
    })
  }

  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : PORTAL_PATHS.work}
      busy={busy}
      focusToken={focusToken}
      getData={() => mediaPayload(images, portfolio, videoId)}
      initialFieldErrors={initialFieldErrors}
      nextHref={onContinue ? undefined : PORTAL_PATHS.submit}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      readOnly={readOnly}
      step="media"
    >
      <FormSection id="workImages" tabIndex={-1}>
        <WorkImagesIntro />
        <MediaList>
          {renderSets('work', images)}
          {!readOnly && images.length < APPLICATION_IMAGE_MAX ? (
            <Button onClick={() => openNewImage('work')} variant="dashed">
              Add images
            </Button>
          ) : null}
        </MediaList>
      </FormSection>

      <FormSection>
        <Title as="h2" caps>
          Career portfolio
        </Title>
        <Text variant="hint">{APPLICATION_IMAGE_NAMING}</Text>
        <Text variant="hint">{PORTFOLIO_IMAGE_LIMITS}</Text>
        <MediaList>
          {renderSets('portfolio', portfolio)}
          {!readOnly && portfolio.length < APPLICATION_IMAGE_MAX ? (
            <Button onClick={() => openNewImage('portfolio')} variant="dashed">
              Add images
            </Button>
          ) : null}
        </MediaList>
      </FormSection>

      <FormSection>
        <Title as="h2" caps>
          Video
        </Title>
        <Text variant="hint">{APPLICATION_VIDEO_HELP}</Text>
        <MediaList>
          {videoId ? (
            <MediaRow
              actions={
                !readOnly ? (
                  <>
                    <Button onClick={openVideo} variant="link">
                      Edit
                    </Button>
                    <Button onClick={deleteVideo} variant="link">
                      Delete
                    </Button>
                  </>
                ) : null
              }
              meta="MP4 attached"
              preview={videoUrl ? { kind: 'video', src: videoUrl } : null}
              title="Video"
            />
          ) : null}
          {!readOnly && videoId == null ? (
            <Button onClick={openNewVideo} variant="dashed">
              Add video
            </Button>
          ) : null}
        </MediaList>
      </FormSection>

      {formError && !editor ? <Text variant="error">{formError}</Text> : null}

      {editor ? (
        <Modal
          onClose={closeEditor}
          title={
            editor.kind === 'video'
              ? adding
                ? 'Add video'
                : 'Edit video'
              : adding
                ? 'Upload image'
                : 'Edit images'
          }
          titleId="media-modal-title"
        >
          <FileField
            accept={
              editor.kind === 'video'
                ? APPLICATION_VIDEO_TYPES.join(',')
                : APPLICATION_IMAGE_TYPES.join(',')
            }
            label={editor.kind === 'video' ? 'Video' : 'Images'}
            multiple={editor.kind === 'image'}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              if (editor.kind === 'video') {
                setPendingFiles(files.slice(0, 1))
                return
              }

              const slots = remainingSlots(editor.list, editor.setId)
              setPendingFiles((current) => [...current, ...files].slice(0, current.length + slots))
              event.currentTarget.value = ''
            }}
          >
            {editor.kind === 'image' ? (
              <Text variant="hint">
                {setEntries.length + pendingFiles.length === 0
                  ? 'You can select several images of the same work. Details below apply to all of them.'
                  : `${setEntries.length + pendingFiles.length} image${setEntries.length + pendingFiles.length === 1 ? '' : 's'} in this set.`}
              </Text>
            ) : existingFileId && pendingFiles.length === 0 ? (
              <Text variant="hint">Current file will be kept if you do not choose a new one.</Text>
            ) : null}
          </FileField>

          {editor.kind === 'image' && (setEntries.length > 0 || pendingFiles.length > 0) ? (
            <StackList
              files={[
                ...setEntries.map((entry) => ({
                  key: String(entry.fileId),
                  label: entry.title || `Attached image ${entry.fileId}`,
                  preview: entry.url ? ({ kind: 'image' as const, src: entry.url } as const) : null,
                  onRemove: () =>
                    setSetEntries((current) =>
                      current.filter((item) => item.fileId !== entry.fileId),
                    ),
                })),
                ...pendingFiles.map((file, index) => ({
                  key: `${file.name}-${index}`,
                  label: file.name,
                  file,
                  onRemove: () =>
                    setPendingFiles((current) =>
                      current.filter((_, fileIndex) => fileIndex !== index),
                    ),
                })),
              ]}
            />
          ) : null}

          {editor.kind === 'image' ? (
            <>
              <TextField
                error={editorFieldErrors.title}
                label="Title*"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
              <TextField
                error={editorFieldErrors.yearCreated}
                label="Year created*"
                name="yearCreated"
                onChange={(event) => setYearCreated(event.target.value)}
                value={yearCreated}
              />
              <TextField
                error={editorFieldErrors.materials}
                label="Materials*"
                name="materials"
                onChange={(event) => setMaterials(event.target.value)}
                value={materials}
              />
              <TextField
                error={editorFieldErrors.dimensions}
                label="Dimensions*"
                name="dimensions"
                onChange={(event) => setDimensions(event.target.value)}
                value={dimensions}
              />
              <TextArea
                error={editorFieldErrors.additionalDetails}
                hint={`${ADDITIONAL_DETAILS_MAX_WORDS} words maximum.`}
                label="Additional details"
                name="additionalDetails"
                onChange={(event) => setAdditionalDetails(event.target.value)}
                value={additionalDetails}
              />
            </>
          ) : null}

          {formError ? <Text variant="error">{formError}</Text> : null}

          <Actions>
            <Button onClick={closeEditor} variant="link">
              Cancel
            </Button>
            <Button disabled={savingItem} onClick={() => void saveEditor()} variant="primary">
              Save
            </Button>
          </Actions>
        </Modal>
      ) : null}
    </ApplicationWizard>
  )
}

function StackList({
  files,
}: {
  files: Array<{
    key: string
    label: string
    onRemove: () => void
    preview?: { kind: 'image' | 'video'; src: string } | null
    file?: File
  }>
}) {
  return (
    <MediaList>
      {files.map((file) => (
        <PendingMediaRow
          file={file.file}
          key={file.key}
          label={file.label}
          onRemove={file.onRemove}
          preview={file.preview}
        />
      ))}
    </MediaList>
  )
}

function PendingMediaRow({
  file,
  label,
  onRemove,
  preview,
}: {
  file?: File
  label: string
  onRemove: () => void
  preview?: { kind: 'image' | 'video'; src: string } | null
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setBlobUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const resolved =
    preview ??
    (blobUrl && file
      ? { kind: file.type.startsWith('video/') ? ('video' as const) : ('image' as const), src: blobUrl }
      : null)

  return (
    <MediaRow
      actions={
        <Button onClick={onRemove} variant="link">
          Remove
        </Button>
      }
      preview={resolved}
      title={label}
    />
  )
}
