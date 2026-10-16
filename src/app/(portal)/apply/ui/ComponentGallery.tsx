'use client'

import { useState, type ReactNode } from 'react'

import {
  Actions,
  Button,
  Checkbox,
  FieldRow,
  FileField,
  FormStack,
  Input,
  MediaList,
  MediaRow,
  Modal,
  Panel,
  PanelForm,
  Readout,
  Select,
  SelectField,
  Stack,
  Table,
  Text,
  TextArea,
  TextField,
  TextLink,
  Title,
} from '@/components/Portal/ui'

import styles from './gallery.module.css'

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <p className={styles.label}>{label}</p>
      {children}
    </section>
  )
}

export function ComponentGallery() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className={styles.page}>
      <Specimen label="Title">
        <Title>Page title</Title>
        <Title as="h2">Section title</Title>
        <Title as="p">Title as a paragraph</Title>
      </Specimen>

      <Specimen label="Text">
        <Text>Lead copy for introductions and helper paragraphs.</Text>
        <Text as="span" variant="hint">
          Hint text sits under a label or beside a field.
        </Text>
        <Text variant="error">Something went wrong. Please try again.</Text>
        <Text variant="success">Your application was submitted.</Text>
      </Specimen>

      <Specimen label="Button">
        <Actions>
          <Button variant="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button variant="link">Text button</Button>
          <Button href="/apply/ui" variant="primary">
            Primary link
          </Button>
          <Button disabled variant="primary">
            Disabled
          </Button>
          <Button disabled>Disabled secondary</Button>
        </Actions>
        <Button variant="dashed">Add image</Button>
      </Specimen>

      <Specimen label="Text link">
        <Actions>
          <TextLink href="/apply/ui">Default link</TextLink>
          <TextLink active href="/apply/ui">
            Active link
          </TextLink>
          <TextLink href="mailto:support@spectorcraftprize.org">Email link</TextLink>
        </Actions>
      </Specimen>

      <Specimen label="Fields">
        <TextField defaultValue="Ada Lovelace" label="Full name*" name="fullName" />
        <TextArea
          defaultValue="A short statement about the work."
          hint="150 words maximum."
          label="Artist statement*"
          name="statement"
        />
        <SelectField
          defaultValue="yes"
          label="Are you a United States citizen or resident?*"
          name="citizenship"
          note="Selected applicants must be able to provide a complete and accurate IRS Form W-9."
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </SelectField>
        <FileField label="Upload government issued ID" name="governmentId" />
        <Stack>
          <Checkbox
            defaultChecked
            label="I confirm this application is accurate."
            name="declaration"
          />
          <Checkbox label="I agree to the rules of entry." name="rules" />
        </Stack>
      </Specimen>

      <Specimen label="Field row">
        <FieldRow>
          <TextField defaultValue="New York" label="City*" name="city" />
          <TextField defaultValue="NY" label="State*" name="state" />
        </FieldRow>
      </Specimen>

      <Specimen label="Search controls">
        <Actions>
          <Input aria-label="Search" defaultValue="" name="q" placeholder="Search" type="search" />
          <Select aria-label="Application status" defaultValue="" name="status">
            <option value="">Application status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In progress</option>
          </Select>
          <Button type="button">Search</Button>
        </Actions>
      </Specimen>

      <Specimen label="Actions">
        <Actions>
          <Button variant="link">&lt; Back</Button>
          <Button>Save and exit</Button>
          <Button variant="primary">Continue &gt;</Button>
        </Actions>
      </Specimen>

      <Specimen label="Panel">
        <Panel>
          <Title as="h2">Narrow panel</Title>
          <Text>Used for login, help, and other short pages. It is 720px wide.</Text>
          <Button variant="primary">Continue</Button>
        </Panel>
      </Specimen>

      <Specimen label="Wide panel">
        <Panel width="wide">
          <Title as="h2">Wide panel</Title>
          <Text>Used for the application wizard and staff pages. It is 960px wide.</Text>
        </Panel>
      </Specimen>

      <Specimen label="Form">
        <PanelForm
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <Title as="h2">Login to your account</Title>
          <TextField label="Email" name="email" type="email" />
          <TextField label="Password" name="password" type="password" />
          <Actions>
            <Button type="submit" variant="primary">
              Login
            </Button>
            <TextLink href="/apply/ui">Forgot password?</TextLink>
          </Actions>
        </PanelForm>
        <FormStack
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <TextField label="First name" name="firstName" />
          <Button type="submit" variant="primary">
            Create juror
          </Button>
        </FormStack>
      </Specimen>

      <Specimen label="Readout">
        <Readout label="Full name" value="Ada Lovelace" />
        <Readout label="Artist name" value="" />
      </Specimen>

      <Specimen label="Table">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026 Emerging Artists</td>
              <td>March 1, 2026</td>
              <td>live</td>
            </tr>
            <tr>
              <td>2025 Emerging Artists</td>
              <td>March 1, 2025</td>
              <td>closed</td>
            </tr>
          </tbody>
        </Table>
      </Specimen>

      <Specimen label="Media">
        <MediaList>
          <MediaRow
            actions={
              <Actions>
                <Button variant="link">Edit</Button>
                <Button variant="link">Delete</Button>
              </Actions>
            }
            details="Additional notes about the piece."
            meta="2024 · Porcelain · 12 × 8 × 6 in"
            title="Vessel II"
          />
          <MediaRow meta="MP4 attached" title="Video" />
          <Button variant="dashed">Add image</Button>
        </MediaList>
      </Specimen>

      <Specimen label="Modal">
        <Button onClick={() => setModalOpen(true)} variant="primary">
          Open modal
        </Button>
        {modalOpen ? (
          <Modal
            onClose={() => setModalOpen(false)}
            title="Upload image"
            titleId="gallery-modal-title"
          >
            <FileField label="Image">
              <span>Current file will be kept if you do not choose a new one.</span>
            </FileField>
            <TextField label="Title*" name="imageTitle" />
            <TextArea hint="100 words maximum." label="Additional details" name="details" />
            <Actions>
              <Button onClick={() => setModalOpen(false)} variant="link">
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)} variant="primary">
                Save
              </Button>
            </Actions>
          </Modal>
        ) : null}
      </Specimen>
    </div>
  )
}
