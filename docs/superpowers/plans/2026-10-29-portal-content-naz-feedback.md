# Portal content & Naz feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Naz’s portal content/UX feedback on staging: Program-editable welcome page, essay/CMS labels, practice-began split, media naming note, ID preview, Rules link fallback, and Evaluations CSV export.

**Architecture:** Program CMS owns welcome title/intro/criteria/rules PDF; applicant forms and Payload labels share title-case question copy; schema migrations for `practiceBegan` and Program welcome fields; CSV export via authenticated admin route; FileField preview for government ID.

**Tech Stack:** Next.js 16, Payload 3, Neon Postgres migrations, Vitest, no new xlsx dependency (CSV).

## Global Constraints

- Staging/local only — no production content migration.
- Do not rename essay field keys (`artistStatement`, etc.).
- Do not commit unless the user asks (user git rule).
- Contact emails stay in code (`INFO_EMAIL` / `SUPPORT_EMAIL`).
- Excel export = CSV that opens in Excel.

## File map

| Area | Files |
|------|--------|
| Program welcome | `Programs.ts`, `seedProgram.ts`, welcome `page.tsx`, `ApplicationFlow.tsx`, migration, `payload-types` via generate |
| Criteria defaults | `portal.ts`, `jury-scores.ts` (consumes `SELECTION_CRITERIA`) |
| Essay labels | `WorkStepForm.tsx`, `ApplicationReview.tsx`, `Applications.ts`, `hooks/applications.ts`, `application-download.ts` |
| Practice began | `Applications.ts`, `EligibilityStepForm.tsx`, validation/hooks/review/download, migration |
| Media copy | `portal-media.ts`, tests, `MediaStepForm.tsx` if needed |
| Government ID | `Fields.tsx`, `SubmitStepForm.tsx`, `portal-media` if needed |
| CSV export | new admin component + API route or collection `admin.components`, `Evaluations.ts` |

---

### Task 1: Selection criteria defaults + essay labels

**Files:**
- Modify: `src/lib/portal.ts` (`SELECTION_CRITERIA`)
- Modify: `src/components/Portal/WorkStepForm.tsx`
- Modify: `src/components/Portal/ApplicationReview.tsx`
- Modify: `src/collections/Applications.ts` (essay field labels/descriptions)
- Modify: `src/hooks/applications.ts` (human labels)
- Modify: `src/lib/application-download.ts`
- Test: `src/lib/jury-scores.test.ts` if titles asserted

- [ ] **Step 1:** Update `SELECTION_CRITERIA` titles (Title Case) and bodies to Naz final copy from the spec.
- [ ] **Step 2:** Set Work form labels to title case including word max; keep existing hints (already final).
- [ ] **Step 3:** Add Payload `label` on essay fields matching form titles; descriptions = prompts or word limits.
- [ ] **Step 4:** Align review, download PDF, and hook error labels.
- [ ] **Step 5:** Run `pnpm test src/lib/jury-scores.test.ts` (and related) — expect PASS.

### Task 2: Program welcome CMS fields + welcome UI

**Files:**
- Modify: `src/collections/Programs.ts`
- Modify: `src/hooks/seedProgram.ts`
- Modify: `src/app/(portal)/apply/welcome/page.tsx`
- Modify: `src/components/Portal/ApplicationFlow.tsx`
- Create: `src/migrations/20261029_120000_program_welcome_fields.ts`
- Modify: `src/migrations/index.ts`
- Run: `pnpm generate:types` (or rely on push in dev)

**Schema:**
- `welcomeTitle` text required
- Keep `welcomeMessage` as intro textarea (alias of spec `welcomeIntro` — **keep name `welcomeMessage`** to avoid rename churn; admin label “Welcome intro”)
- `selectionCriteria` array `{ title, body }` required minRows 1
- Clarify `rulesDocument` admin description

- [ ] **Step 1:** Add fields + Welcome group in `Programs.ts`.
- [ ] **Step 2:** Migration: add `welcome_title`, create `programs_selection_criteria` / `_rels` tables as Payload expects — prefer `pnpm migrate:create` after schema edit in local, or hand-write matching existing style.
- [ ] **Step 3:** Seed defaults (title, criteria from `SELECTION_CRITERIA`, intro unchanged).
- [ ] **Step 4:** Welcome page: render `program.welcomeTitle`, `welcomeMessage` paragraphs, `program.selectionCriteria`; Rules link new tab + fallback `/emerging-artists-prize`.
- [ ] **Step 5:** Same Rules helper in `ApplicationFlow`.

### Task 3: Practice began split

**Files:**
- Modify: `Applications.ts`, `EligibilityStepForm.tsx`, `ApplicationReview.tsx`, `application-validation.ts`, `hooks/applications.ts`, `application-download.ts`
- Create: `src/migrations/20261029_121000_practice_began.ts`
- Modify: `src/migrations/index.ts`
- Test: `src/lib/application-validation.test.ts`

- [ ] **Step 1:** Add `practiceBegan` text field; shorten `practiceBeganDetails` label to optional explanation.
- [ ] **Step 2:** Migration ADD COLUMN `practice_began`.
- [ ] **Step 3:** Eligibility UI: required month/year field + optional details below; include in form `getData`.
- [ ] **Step 4:** `requireText` for `practiceBegan` when `requireComplete` on eligibility; map `FIELD_STEP`.
- [ ] **Step 5:** Update tests; run `pnpm test src/lib/application-validation.test.ts`.

### Task 4: Media naming note

**Files:**
- Modify: `src/lib/portal-media.ts`
- Modify: `src/lib/portal-media.test.ts` if copy asserted
- Modify: `MediaStepForm.tsx` if help is split across elements — ensure naming is its own line before max images

- [ ] **Step 1:** Prepend naming convention sentence as its own paragraph/line in `APPLICATION_IMAGE_HELP` and `PORTFOLIO_IMAGE_HELP`.
- [ ] **Step 2:** If MediaStepForm renders help as one blob, split into two `Text`/`note` lines so naming appears above max-images line.

### Task 5: Government ID preview + PNG

**Files:**
- Modify: `src/components/Portal/ui/Fields.tsx` (`FileField`)
- Modify: `src/components/Portal/SubmitStepForm.tsx`
- Modify: CSS module for dropzone preview if needed
- Check: `src/hooks/submissionFiles.ts`, `portal-media.ts`

- [ ] **Step 1:** Extend `FileField` with optional `preview?: { kind: 'image' | 'pdf'; src?: string; name?: string }`.
- [ ] **Step 2:** After upload in SubmitStepForm, set preview from object URL or returned `url`; show filename for PDF.
- [ ] **Step 3:** Confirm PNG in `GOVERNMENT_ID_ACCEPT` / server validation; fix client-side reject if any.

### Task 6: Evaluations CSV export

**Files:**
- Create: `src/app/(payload)/api/evaluations/export/route.ts` (or under existing API pattern)
- Create: `src/components/Admin/EvaluationsExportButton.tsx`
- Modify: `src/collections/Evaluations.ts` admin components
- Modify: import map if Payload requires it (`pnpm generate:importmap`)

- [ ] **Step 1:** Authenticated GET route: list evaluations with depth for applicant/juror names; return `text/csv` attachment.
- [ ] **Step 2:** Admin list beforeList / Description button linking to that route (credentials/session cookie).
- [ ] **Step 3:** Columns: listTitle, applicant, juror, four scores, total, updatedAt.

### Task 7: Verify

- [ ] Run `pnpm test` for touched test files.
- [ ] Run `pnpm lint` on changed files if practical.
- [ ] Manual checklist from spec (welcome CMS, eligibility, media, ID, CSV).

---

## Spec coverage

| Spec section | Task |
|--------------|------|
| Program welcome CMS | 2 |
| Essay titles/CMS | 1 |
| Eligibility practice began | 3 |
| Media naming | 4 |
| Government ID | 5 |
| Excel/CSV | 6 |
| Selection criteria copy | 1 (+ seed in 2) |
| Rules of Entry | 2 |
| No production migration | Global |

## Note on `welcomeIntro`

Plan keeps DB/API field name **`welcomeMessage`** with admin label “Welcome intro” to avoid a destructive rename; matches existing seed and data.
