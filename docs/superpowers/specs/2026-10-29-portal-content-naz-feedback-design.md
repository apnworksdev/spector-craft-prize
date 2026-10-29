# Portal content & Naz feedback (staging)

**Date:** 2026-10-29  
**Scope:** Staging / local only — no production content migration in this pass.  
**Source:** FINAL APPLICATION QUESTIONS COPY + Naz Figma comments (Excel export, CMS labels, Rules of Entry, practice began split, media naming, government ID preview, selection criteria) + move welcome page copy into Program CMS.

## Goals

1. Staff can edit welcome-page copy (intro + selection criteria + Rules PDF) on the Program admin item (`/admin/collections/programs/…`).
2. Applicant/CMS labels match final application question titles and prompts.
3. Address Naz’s remaining portal UX notes without shipping production DB sync.

## Non-goals

- Migrating Neon staging content into production.
- Changing public Emerging Artists Prize page structure (homepage Rules link stays CMS rich text there).
- Renaming Payload field keys (`artistStatement`, etc.).

---

## 1. Program welcome CMS

### Current

- `welcomeMessage` (textarea) → intro paragraphs only.
- Selection criteria hardcoded in `SELECTION_CRITERIA` (`src/lib/portal.ts`).
- Welcome H1 hardcoded on `apply/welcome/page.tsx`.
- `rulesDocument` → Documents PDF; if empty, “Rules of Entry” renders as plain text (no link).

### Target fields on Programs (Welcome page group/tab)

| Field | Type | Notes |
|--------|------|--------|
| `welcomeTitle` | text, required | Portal H1 |
| `welcomeIntro` | textarea, required | Replaces `welcomeMessage`. Blank line = new paragraph |
| `selectionCriteria` | array `{ title, body }`, min 1 | Numbered list on welcome |
| `rulesDocument` | upload → `documents` | Clearer admin label: Rules of Entry PDF |

Keep in **code** (site-wide): `INFO_EMAIL` / `SUPPORT_EMAIL` contact lines and Contact aside.

Keep existing Program fields: name, deadline, status, help/incomplete/ready/confirmation, declarations.

### Migration / seed

- Rename or map `welcomeMessage` → `welcomeIntro` (Payload migration + update seed).
- Seed `welcomeTitle` and `selectionCriteria` with Naz’s final criteria copy.
- Welcome page reads title, intro, and criteria **only** from Program.
- Jury score criterion titles: keep shared defaults derived from the same seeded copy (or continue using a code constant that matches seed). Do **not** require loading Program on every jury score widget unless already available; criteria **bodies** on welcome are Program-owned; jury rubric titles stay aligned via seed/default constant updated to final titles.

### Rules of Entry behaviour

- Welcome meta + wizard bar: if `rulesDocument.url` exists → `TextLink` (open in new tab).
- Else → link to public `/emerging-artists-prize` (same page that hosts homepage Rules content) so the control is never dead text.
- Ops: attach the Rules PDF on the Program for the direct PDF experience Naz expects.

---

## 2. Application questions (copy + CMS labels)

Applicant Work step prompts already match FINAL COPY. Update **labels** to title case everywhere they appear:

- Statement of Practice (200 words maximum)
- Process of Submitted Work (100 words maximum)
- Significance of Submitted Work (100 words maximum)
- Why the Spector Craft Prize? (125 words maximum)

Surfaces: `WorkStepForm`, `ApplicationReview`, validation human names, application PDF download labels, Payload `Applications` field `label` + descriptions (prompts or word limits as description).

No DB column renames.

---

## 3. Eligibility — practice began split

### Current

One optional textarea `practiceBeganDetails` with a combined long label.

### Target

| Field | Required | UI |
|--------|----------|-----|
| `practiceBegan` (new text) | Yes on submit | “State the month and year when your professional craft practice began*” |
| `practiceBeganDetails` | No | Separate optional box: interruption / timeline explanation only |

Schema migration + submit validation for `practiceBegan`. Update review, hooks, Payload labels.

---

## 4. Media — file naming note

Add a dedicated line **before** the “Maximum 5 images…” sentence in submitted-work (and portfolio) help copy:

> Name files with your full name plus a number or description (e.g., FirstnameLastname_SubmittedWork1 or FirstnameLastname_CareerPortfolio1).

Update `APPLICATION_IMAGE_HELP` / `PORTFOLIO_IMAGE_HELP` (and any intro that duplicates them) so the naming line is visually its own line in the UI.

---

## 5. Government ID upload

- After successful upload, show content **inside** the dropzone: image thumbnail when MIME is image; for PDF, filename + “PDF on file”.
- Keep accept: JPG, PNG, PDF.
- Investigate PNG “upload failed” path (`uploadSubmissionFile`, client mime, `governmentIdError`) and fix if valid PNGs are rejected.
- Prefer extending `FileField` or submit-step usage with a `preview` prop consistent with media step patterns.

---

## 6. Evaluations — Excel export

- Payload Evaluations list (admin): control “Download scores”.
- Export **CSV** (Excel-openable; no new xlsx dependency).
- Columns: list title / applicant, juror, four criteria, total, updated at (align with `defaultColumns`).
- Prefer server route or admin custom component that fetches evaluations (respect admin auth); CSV download as file attachment.
- Scope: all evaluations the admin can list (program filter later if cheap; not required for v1).

---

## 7. Selection criteria copy (Naz final)

Bodies to seed / defaults:

1. **Artistic Excellence** — We look for a clear demonstration of technical skill and artistic vision, with the hand of the artist evident in the work.
2. **Cultural Significance** — We look for a unique artistic perspective that contributes to the evolving landscape of American craft, drawing on community, place, personal experience, or through innovative approaches to materials, techniques, and processes, with an intentional engagement with tradition.
3. **Growth Potential** — We look for artists with a strong foundation whose practice continues to develop, who have not yet received widespread recognition, and whose careers could be meaningfully advanced by the Prize at this moment.
4. **Mission Alignment** — We look for artists whose work brings fresh perspectives and expands the possibilities of craft, combining tradition and innovation in ways that help shape what American craft means today.

Update jury score field descriptions / shared constant titles to match (Title Case).

---

## Architecture sketch

```
Programs (CMS)
  welcomeTitle, welcomeIntro, selectionCriteria[], rulesDocument
       │
       ▼
apply/welcome/page.tsx ──► portal UI
ApplicationFlow ──────────► Rules link

Applications
  practiceBegan (new) + practiceBeganDetails (optional)
  essay fields: labels only

portal-media.ts ──► naming help strings
SubmitStepForm ──► ID preview
Evaluations admin ──► CSV export
```

## Testing (manual / light automated)

- Welcome: edit Program fields → refresh `/apply/welcome` reflects changes; Rules links when PDF set; fallback when not.
- Work step + CMS Application: titles match FINAL COPY.
- Eligibility: cannot submit without month/year; optional explanation saves independently.
- Media: naming line appears above max-images line.
- ID: PNG and PDF upload succeed; preview/filename visible in box.
- Evaluations: CSV downloads and opens in Excel/Numbers with scores.

## Out of scope reminder

Production Neon sync / content import deferred until portal launch.
