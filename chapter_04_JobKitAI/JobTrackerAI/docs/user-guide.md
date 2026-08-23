# Job Tracker AI — User Guide

A local-first job application tracker with a built-in **Job Match** tool that
compares your resume against a job description.

---

## 1. What it does

Two pages:

- **Board** — a Kanban board for tracking job applications through six stages
  (Wishlist → Applied → Follow-up → Interview → Offer → Rejected).
- **Job Match** — paste a job description and your resume, and get a list of
  **strengths** (skills the JD asks for that your resume shows) and **gaps**
  (skills the JD asks for that your resume doesn't).

Everything is stored in your browser (IndexedDB / localStorage). There is no
account, no server, and no database to set up.

---

## 2. Getting started

Requires [Node.js](https://nodejs.org) (18+).

The app lives in the **`JobTrackerAI`** folder. Open a terminal and navigate
there first — all commands below must be run from inside that folder:

```bash
cd JobTrackerAI
```

### Run the app in development

```bash
npm install        # first time only — installs dependencies
npm run dev        # starts the dev server
```

Open the printed URL (usually `http://localhost:5173`) in your browser. The app
auto-reloads when you edit code.

### Build for production

```bash
npm run build      # type-checks and builds into the dist/ folder
npm run preview    # serves the production build locally
```

### Run the automated tests

```bash
npm test
```

> **Tip:** if `npm install` reports missing packages (e.g. `'tsc' is not
> recognized`), run it from inside `JobTrackerAI` — the terminal must be in the
> folder that contains `package.json`.

---

## 3. The Board page

### Add a job

Click **+ Add Job**. Fill in:

- **Company name** (required)
- **Job title / role** (required)
- **Status** — which column the card starts in
- **Date applied** — pre-filled with today, editable
- **Resume used** — pick from your saved resume library. Resumes matching the
  company or job title you entered are shown first; all others remain
  selectable. Older plain-text resume values from before the library existed
  still display and stay editable.
- **Salary range** — optional free text, e.g. `₹25-30 LPA` or `$150-180K`
- **LinkedIn job URL** — optional; makes a clickable link on the card
- **Notes** — optional (recruiter name, referral info…)
- **Attachment** — optional file

Click **Add Job** to save. The card appears instantly and is stored in the browser.

### Move a job

Drag a card from one column to another. The status updates automatically.

### Edit / delete a card

Hover a card to reveal the **pencil** (edit) and **trash** (delete) icons.
Deleting asks for confirmation first.

### Search

Use the search box in the header to filter cards by company name or role.

### Sort

Cards within a column are sorted by date applied, newest first.

### Light / dark mode

Click the **moon/sun** icon in the header to toggle the theme. Your choice is
remembered.

### Backup and restore

- **Export** (download icon) saves all your job data as a JSON file.
- **Import** (upload icon) restores data from a previously exported JSON file.
  This replaces the current data.

---

## 4. The Job Match page

Open the **Job Match** tab in the header.

1. Enter the **Company Name** and **Designation**.
2. Paste the **Job description** (the full JD — LinkedIn-style wording works best).
3. Provide your **Resume** — either paste the text directly, or **upload a
   resume file (PDF or DOCX)** via the gear icon (see below). Once uploaded, the
   resume text is filled in for you automatically.
4. Click **Job Match** (the blue button).

You get two lists:

- **Strengths** (green) — requirements in the JD that your resume demonstrates.
- **Gaps** (red) — requirements in the JD your resume does not mention.

Each list shows a count. Past evaluations are saved below the form — you can
delete individual entries with the ✕ button.

### Upload your resume file (PDF / DOCX)

Instead of pasting resume text, you can upload the actual file:

1. Click the **gear icon** (top-right of the Job Match page).
2. Under **Resume file (PDF or DOCX)**, click **Choose a resume file…**.
3. Pick a `.pdf` or `.docx` file. The app reads it on your device and stores the
   extracted text locally.
4. The resume text area on the Job Match page is then filled in automatically.
   You can still edit it before evaluating.

Uploading here also **adds the file to your resume library**, so it immediately
appears in the **"Resume used"** dropdown when you add or edit a job on the
Board.

Supported formats: **PDF** and **DOCX**. Text-only PDFs work best — scanned
image PDFs have no extractable text and will show an error. The file never
leaves your machine (except when you choose the Groq engine, which sends the
text to Groq for analysis).

### Save a tailored resume for an evaluation

After evaluating a JD, if you've manually tailored your resume (edited it
outside the app) and want to reuse it:

1. Click **"Save tailored resume for this evaluation"** below the results.
2. Enter a friendly **Resume Name** (e.g. `Acme_Embedded_Test_Automation_v1`).
3. Upload the finished **PDF/DOCX** and add optional notes.
4. Click **Save**. The resume is added to your library, linked to this
   evaluation (company, job title, date shown read-only).

After saving you can click **"Create Job Application"** — the Add Job form opens
with the company, job title and the saved resume preselected.

**Manage saved resumes:** click **"Manage saved resumes"** on the Job Match page
to see the library. You can download any resume, or delete it — if a resume is
linked to one or more jobs, the app warns you and archives it instead of
deleting it, so job cards keep showing the resume name.

### Which engine runs the analysis?

Click the **gear icon** (top-right of the Job Match page) to choose the engine:

| Engine | What it is | Needs | Private? |
|---|---|---|---|
| **Groq** (default) | Cloud LLM | A Groq API key | ❌ Sends JD + resume to Groq's API |
| **Dictionary** | Offline keyword matching | Nothing | ✅ 100% local |
| **Ollama** | Local LLM on your machine | Ollama installed & running | ✅ 100% local |

Your choice is remembered for next time.

#### Groq (cloud) — default

Groq gives the most accurate, context-aware analysis, but it sends your job
description and resume text to Groq's cloud API.

Setup:

1. Create a free key at <https://console.groq.com/keys>.
2. On the Job Match page, open the **gear icon**.
3. Paste the key into **Groq API key** and click **Save**.

**Secure server-side mode (recommended for Vercel):** in the gear settings,
tick **"Use secure server-side proxy"**. The app then calls Groq through a
small serverless function on Vercel that holds the key in a server environment
variable (`GROQ_API_KEY`) — your key is never stored in or sent from the
browser. In local development (no proxy), the key stays in your browser's
localStorage and is sent directly to Groq only when you evaluate.

The default model is `llama-3.3-70b-versatile`. You can change it in settings if
you have a preference.

#### Dictionary (offline)

No setup, works offline, instant. How it works:

1. The JD and resume are normalised to lowercase plain text.
2. The JD is scanned for skill terms from a built-in dictionary of ~130 common
   skills (Python, React, Docker, Jest, Playwright, AWS…).
3. Every skill found in the JD is looked up in the resume — found = Strength,
   not found = Gap.

**Limitations:**

- **Not AI.** It does not understand meaning, seniority, or years of experience.
- **Exact wording matters.** `React` vs `React.js`, `JavaScript` vs `JS`, `AWS`
  vs `Amazon Web Services` will not match each other.
- **Only ~130 common terms.** Niche tools (Figma, Postman, Tableau…) won't be
  flagged either way.
- **No context.** It can't tell "5+ years of Python" from "familiar with Python".

A gap means *"this exact word was not found in your resume"* — not necessarily
"you don't have this skill". For best results, spell skills the same way the JD
does.

#### Ollama (local)

A real LLM running on your own machine — accurate analysis with full privacy.

Setup:

1. Install Ollama from <https://ollama.com>.
2. Pull a model, e.g. `ollama pull llama3.2`.
3. Keep Ollama running (the desktop app does this automatically).
4. On the Job Match page, open the **gear icon**, choose **Ollama (local)**, and
   confirm the URL (`http://localhost:11434/v1/chat/completions`) and model
   (`llama3.2`) are correct.

---

## 5. Privacy & data

- **Board data** (jobs, attachments) — stored in your browser's IndexedDB. Never
  leaves your machine.
- **Settings** (theme, chosen engine, Groq key, Ollama URL/model) — stored in
  localStorage.
- **Evaluations** (JD + resume text + result) — stored in IndexedDB.
- **Saved resumes** (files + metadata) — stored in IndexedDB on your device.
- **Dictionary and Ollama engines** — nothing is sent anywhere.
- **Groq engine** — your JD and resume text are sent to Groq's cloud API for
  analysis. With the **secure server-side proxy** enabled, your Groq API key
  never leaves the server. Only choose Groq if you're comfortable sending the
  JD and resume text to the cloud.

Clearing your browser's site data removes everything.

**Backup note:** the JSON export includes job applications and **saved-resume
metadata** (names, links) but **not** the resume file blobs (PDF/DOCX). After a
restore, saved resumes appear in the library and dropdowns, but their files must
be re-uploaded to download them again. Exported data should be treated as
sensitive since it can contain resume text.

---

## 6. FAQ / troubleshooting

**"Groq API key is required"** — open the gear icon and add your key from
<https://console.groq.com/keys>, or enable the **secure server-side proxy** (the
key is then set once on the server, not in the browser).

**Ollama: "Could not reach …"** — make sure Ollama is installed and running, and
that the URL in settings matches `http://localhost:11434/v1/chat/completions`.

**Ollama: model not found** — run `ollama pull llama3.2` (or whichever model you
set) once.

**Dictionary says a skill is a gap but I have it** — the dictionary only matches
exact wording. Reword your resume to use the JD's exact skill names, or switch to
Groq/Ollama for smarter analysis.

**Where is my data?** — In your browser profile, under the site's IndexedDB and
localStorage. Export a JSON backup from the header to keep a copy.

---

## 7. Project layout (for developers)

```
JobTrackerAI/
├── src/
│   ├── main.tsx                 # entry point
│   ├── app/App.tsx              # app shell + page routing
│   ├── components/              # shared UI (Header, Icons)
│   ├── config/                  # IndexedDB config
│   ├── styles/                  # global CSS
│   ├── utils/                   # export/import
│   ├── services/                # shared IndexedDB connection
│   ├── job-applications/        # board domain
│   │   ├── components/  hooks/  services/  types/  validators/  utils/
│   ├── evaluate-job/            # evaluate domain
│   │   ├── components/  hooks/  services/  types/  validators/
│   └── resume-library/          # saved-resume library domain
│       ├── components/  hooks/  services/  types/  validators/  utils/
├── api/groq.ts                  # Vercel serverless Groq proxy (secure key)
├── vercel.json                  # security headers + CSP
├── tests/unit/                  # unit tests
├── docs/                        # documentation
└── public/                      # static assets
```

Tech: React 18 + Vite + Tailwind CSS + IndexedDB (`idb`) + `@dnd-kit` for
drag-and-drop. No persistent backend — the only server code is the optional
Vercel `/api/groq` proxy that protects the Groq API key.
