# Plan: Jira Test Case Generator App (Streamlit)

## Goal
Build a lightweight two-screen Streamlit application that lets a QA engineer enter Jira + LLM credentials once, then chat with the app to generate test cases from a Jira ticket. Uses **Groq (with API key) by default** and **Ollama (`gemma3:1b`, local) as fallback**. All application code lives under a `src/` folder.

## Project Structure

```
chapter_03_Local_TC_Generator/
├── plan.md                  # This plan (saved in project directory)
├── src/
│   ├── app.py               # Entry point — Chat screen (Screen 1)
│   ├── config_store.py      # Read/write persisted settings (JSON)
│   ├── jira_client.py       # Fetch ticket details via Jira REST API
│   ├── llm_client.py        # Groq + Ollama calls with fallback logic
│   ├── pages/
│   │   └── settings.py      # Settings screen (Screen 2)
│   └── templates/
│       ├── Prompt.md        # Existing — instructions for the app
│       └── testcase_creator.md  # Existing — test case template
├── .env.example             # Template for credentials (NOT committed)
├── .gitignore               # Excludes .env, config.json, __pycache__
├── requirements.txt         # Python dependencies
└── README.md                # Quick setup/run instructions
```

## Screen 1 — Chat (src/app.py)
- **Layout**: ChatGPT-style conversation area + text input box + "Send" button (matches screenshot left panel).
- **Behavior**:
  1. User types a natural-language request, e.g., `create test cases for VWO-49`.
  2. On Send, parse the Jira ticket key (regex: `[A-Z]+-\d+`) from the message.
  3. Display assistant message: "Fetching ticket VWO-49 from Jira…"
  4. Call `jira_client.fetch_ticket(key, config)` → returns summary, description, acceptance criteria.
  5. Load template from `src/templates/testcase_creator.md`, inject ticket content into `[PASTE REQUIREMENTS HERE]`.
  6. Call `llm_client.generate(prompt, config)` → **Groq first (default), Ollama fallback**.
  7. Render the returned markdown table in the chat pane as the assistant's response.
- **Navigation**: A sidebar link/button to navigate to the Settings screen.

## Screen 2 — Settings (src/pages/settings.py)
- **Layout**: Form with fields matching screenshot right panel:
  - `JIRA EMAIL` (text_input)
  - `JIRA TOKEN` (text_input, type=password)
  - `JIRA URL` (text_input)
  - `OLLAMA URL` (text_input, default `http://localhost:11434`)
  - `OLLAMA MODEL` (text_input, default `gemma3:1b`)
  - `GROQ Token` (text_input, type=password)
  - `LLM Provider` (radio: Groq / Ollama — **Groq is default**)
  - "Save Settings" button (matches screenshot).
- **Behavior**:
  - On load, read existing settings via `config_store.load_config()` and pre-fill fields.
  - On save, write via `config_store.save_config({...})` to a local JSON file (e.g., `src/config.json`).
  - Show success message on save.
  - Validate that required fields are non-empty before saving.

## Data Flow

```
[User types request in Chat]
    → parse Jira key (app.py)
    → jira_client.fetch_ticket(key, config)
        → HTTP GET {jira_url}/rest/api/2/issue/{key} (or /rest/api/3/)
        → returns {summary, description, acceptance_criteria}
    → load template (src/templates/testcase_creator.md)
    → inject ticket content into template
    → llm_client.generate(prompt, config)
        ├── try Groq (DEFAULT): POST https://api.groq.com/openai/v1/chat/completions
        │      with GROQ_API_KEY from config, model "gemma2-9b-it"
        └── if Groq fails → fallback Ollama: POST {ollama_url}/api/generate
              with model "gemma3:1b"
    → render markdown table in chat pane
```

## Module Details

### src/config_store.py
- `load_config() → dict` — reads `src/config.json` (or `~/.aitester/config.json` if not found locally).
- `save_config(config: dict) → None` — writes config to `src/config.json`.
- Config keys: `jira_email`, `jira_token`, `jira_url`, `ollama_url`, `ollama_model`, `groq_api_key`, `provider` (default `"groq"`).
- Config file excluded from git via `.gitignore`.

### src/jira_client.py
- `fetch_ticket(ticket_key: str, config: dict) → JiraTicket` — makes authenticated GET request using basic auth (email + API token). Returns a dataclass/dict with `summary`, `description`, `acceptance_criteria` fields. Handles Jira Cloud and Server (try `/rest/api/3/` then `/rest/api/2/` if 404).

### src/llm_client.py
- `generate(prompt: str, config: dict) → str` — returns the LLM text response.
- **Groq path (DEFAULT)**: POST to `https://api.groq.com/openai/v1/chat/completions` with `Authorization: Bearer {groq_api_key}` and model `gemma2-9b-it` (fast, cheap). If the request fails (network error, auth error, timeout), trigger fallback.
- **Ollama fallback**: If Groq fails, POST to `{ollama_url}/api/generate` with model `gemma3:1b`. If `config['provider'] == 'groq'` explicitly, still attempt fallback to Ollama automatically on Groq failure.
- **Explicit Ollama**: If `config['provider'] == 'ollama'`, skip Groq and call Ollama directly (no further fallback needed).
- Return the raw text from whichever provider succeeds.

### src/templates/testcase_creator.md
- Already exists. Replace `[PASTE REQUIREMENTS HERE]` placeholder with the fetched Jira ticket content (summary + description + acceptance criteria) before sending to LLM.

## Environment / Credentials
- A `.env.example` file documents the required fields (`JIRA_EMAIL`, `JIRA_TOKEN`, `JIRA_URL`, `GROQ_API_KEY`, `OLLAMA_URL`).
- The actual credentials are entered via the Settings screen (Screen 2) and persisted to `src/config.json` — per `Finetune_Prompt.md`, credentials are NOT hardcoded and NOT in `.env` at runtime. They come from user input in the UI.
- If a `.env` file is later provided with credentials, `config_store.py` can optionally read from it as a one-time bootstrap, but the primary persistence is the Settings UI → `src/config.json`.

## Implementation Order (one module at a time, per prompt)
1. **`src/config_store.py`** — config read/write, `.gitignore`, `.env.example`.
2. **`src/jira_client.py`** — Jira ticket fetch with auth.
3. **`src/llm_client.py`** — Groq (default) + Ollama fallback.
4. **`src/pages/settings.py`** — settings form (Screen 2).
5. **`src/app.py`** — chat screen (Screen 1) wiring everything together.
6. **`requirements.txt`** — streamlit, requests, python-dotenv.
7. **Verify** — run `streamlit run src/app.py`, enter settings, test with a sample Jira key.

## Dependencies (requirements.txt)
```
streamlit>=1.30
requests>=2.31
python-dotenv>=1.0
```

## .gitignore
```
.env
src/config.json
__pycache__/
*.pyc
```

## Verification
1. `pip install -r requirements.txt`
2. `streamlit run src/app.py`
3. Navigate to Settings, enter Groq API key, Jira URL/email/token, select Groq as provider, click "Save Settings".
4. Back in Chat, type `create test cases for VWO-49`, click Send.
5. Verify: ticket fetched from Jira, test cases generated via Groq, rendered as markdown table.
6. To test fallback: stop internet/revoke Groq key, retry — should fall back to Ollama (gemma3:1b) automatically.

## Key Changes from Initial Plan
- **All code under `src/` folder** — `app.py`, `config_store.py`, `jira_client.py`, `llm_client.py`, `pages/settings.py`, `templates/` all moved into `src/`.
- **Groq is now the default/primary** LLM provider (with API key), Ollama (`gemma3:1b`) is the fallback — reversed from the original plan.
- **plan.md saved in the project directory** — this file will be saved to both `~/.commandcode/plans/plan.md` (plan mode) and `chapter_03_Local_TC_Generator/plan.md` (project directory) after implementation begins.
- Updated `requirements.txt` run command to `streamlit run src/app.py`.
- Config persisted to `src/config.json` instead of project root.
