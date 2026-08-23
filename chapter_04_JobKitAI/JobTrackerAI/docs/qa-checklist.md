# QA Checklist — Job Tracker AI

Manual, user-like test checklist. Run against `npm run dev` (http://localhost:5173),
primary browser Chrome; spot-check Edge + Firefox.

Environment: clear site data first (`Application → Clear site data` or DevTools) so
tests start from a clean IndexedDB.

---

## 1. Board page

- [ ] **+ Add Job** button opens the Add Job modal
- [ ] Empty columns show the "Drop jobs here" hint
- [ ] Validation: submit empty → errors for Company name, Job title, Date applied
- [ ] Fill required fields → **Add Job** → card appears in the chosen column, modal closes
- [ ] All fields save: status, date, resume used, salary, LinkedIn URL, notes, attachment
- [ ] **Edit** (pencil): modal prefills; change → **Save Changes** → card updates
- [ ] **Edit → Cancel** closes without changes
- [ ] **Delete** (trash): confirmation dialog appears
- [ ] Delete → **Cancel** keeps the card; **Delete** removes it
- [ ] Drag a card to another column → status updates (refresh page → persists)
- [ ] Search box filters by company and by role; clearing restores all
- [ ] Theme toggle (moon/sun) switches light/dark and persists after reload
- [ ] **Export** downloads a `.json` file
- [ ] **Import** restores jobs from a previously exported file
- [ ] Import a bad file → error banner appears; ✕ dismisses it
- [ ] Card with a linked resume shows the resume name + download (⤓) works
- [ ] Card with a linked evaluation shows "Open evaluation" → navigates to Job Match with it loaded
- [ ] Many cards in one column → column scrolls; header stays fixed

## 2. Job Match page (Evaluate)

- [ ] Header tab reads **Job Match**; page heading reads **Job Fit Analysis**; blue button reads **Job Match**
- [ ] Gear icon opens settings; **X**, **Cancel**, and backdrop click close it
- [ ] Engine switch: Dictionary / Groq / Ollama; Groq key field + proxy checkbox save
- [ ] **Resume upload (gear)**: upload PDF → text auto-fills; upload DOCX → same
- [ ] Upload a `.txt` → clear "Unsupported file type" error
- [ ] Oversized file → "File is too large" error
- [ ] **Job Match** button with Dictionary (no network): strengths + gaps render
- [ ] Groq engine, no key → inline "Groq API key is required"
- [ ] Ollama engine, not running → inline "Could not reach …" error
- [ ] Page scrolls internally when results + past evaluations exceed the viewport

## 3. Resume Library flow (the fixed bug)

- [ ] Upload a resume via the **gear icon** (Job Match)
- [ ] Open **+ Add Job** → "Resume used" dropdown **shows the uploaded resume** (with name — date)
- [ ] Select it → save the job → card shows the resume name
- [ ] **Save tailored resume for this evaluation** (after evaluating): opens with prefilled Company / Job Title / Date
- [ ] Save without name → "Resume name is required"; without file → "Please choose a file"
- [ ] Save valid → success message + **Create Job Application**
- [ ] **Create Job Application** → navigates to Board with Add Job open, company/role/resume preselected
- [ ] Duplicate save (same file, same evaluation) → warning; **Save anyway** replaces
- [ ] **Manage saved resumes** lists all; **Download** works
- [ ] Delete an unlinked resume → confirm → removed
- [ ] Delete a resume linked to a job → warning with count → archives (job card still shows the name)

## 4. Modal / popup closure audit

- [ ] Add/Edit Job: X closes, Cancel closes, backdrop closes, **Escape** closes
- [ ] Delete confirm: Cancel / backdrop close
- [ ] Gear settings: X / Cancel / backdrop / Escape
- [ ] Save Tailored Resume: X / Cancel / backdrop / Escape
- [ ] Resume Library: X / backdrop / Escape
- [ ] Reopening a modal has no stale state (errors/duplicate flags reset)

## 5. Data integrity

- [ ] Reload page → jobs, saved resumes, evaluations all persist
- [ ] Export → clear data → import → board restored; **library metadata restored** (names listed; file download unavailable — documented)
- [ ] Old backup (without savedResumes) still imports

## 6. Cross-browser / resolution (spot-check)

- [ ] Chrome, Edge, Firefox: board + Job Match page render and scroll correctly
- [ ] 1920×1080, 1366×768, 1024×768, ~900×600: no cut-off content, no bottom gap
- [ ] Firefox shows thin styled scrollbars

---

## Sign-off

- [ ] All flows pass
- [ ] No console errors during the run
- [ ] Ready for deployment
