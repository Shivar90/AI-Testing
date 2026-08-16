# Jira Test Case Generator

A two-screen Streamlit application that turns a Jira ticket into a draft test case table using an LLM. Type a request like `create test cases for VWO-49` and the app fetches the ticket, injects it into a test-case template, and renders the result — ChatGPT-style.

---

## Quick Start

```bash
pip install -r requirements.txt
python -m streamlit run src/app.py
```

The app opens in your browser automatically.

---

## LLM Backends

| Backend | Role | When it's used | Required |
|---|---|---|---|
| **Groq** | Primary (default) | When `provider` = Groq in Settings | Groq API key |
| **Ollama** | Fallback | When Groq fails and Ollama is running locally | Local Ollama server + `gemma3:1b` model |

Groq is tried first. If it fails (network error, auth error, timeout), the app automatically falls back to Ollama. You can also switch the default provider to Ollama in Settings.

---

## Screen 1 — Chat

After launching the app you land on the **Chat** screen.

1. Go to **Settings** (sidebar) first and save your credentials.
2. Return to **Chat**.
3. Type a request that includes a Jira ticket key, for example:
   ```
   create test cases for VWO-49
   ```
4. Click **Send**.

The app will:
1. Parse the ticket key (`VWO-49`).
2. Fetch the ticket from Jira (summary, description, acceptance criteria).
3. Merge the content into the template in `src/templates/testcase_creator.md`.
4. Send the combined prompt to Groq (or Ollama), and render the markdown test-case table in the chat pane.

### Example Output

| Test ID | Description | Pre-conditions | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-001 | Verify login with valid credentials | User is on the login page | 1. Enter valid email. 2. Enter valid password. 3. Click Login. | User is redirected to the dashboard | High |

---

## Screen 2 — Settings

Navigate via the sidebar → **Settings**.

| Field | Description | Example |
|---|---|---|
| **JIRA EMAIL** | Your Jira account email | `you@example.com` |
| **JIRA TOKEN** | Jira API token (or password for Server) | `your-token-here` |
| **JIRA URL** | Base URL of your Jira instance | `https://your-domain.atlassian.net` |
| **OLLAMA URL** | Local Ollama server endpoint | `http://localhost:11434` |
| **OLLAMA MODEL** | Ollama model to use as fallback | `gemma3:1b` |
| **GROQ Token** | API key from [groq.com](https://groq.com) | `gsk_...` |
| **Provider** | Which LLM to use first | `Groq` (default) or `Ollama` |

Click **Save Settings** to persist your credentials locally. They are stored in `src/config.json` and **excluded from version control** via `.gitignore`.

---

## File Overview

```
src/
├── app.py              # Chat screen (Screen 1)
├── config_store.py     # Reads/writes src/config.json
├── jira_client.py      # Jira REST API client
├── llm_client.py       # Groq + Ollama with fallback
├── pages/
│   └── settings.py     # Settings screen (Screen 2)
└── templates/
    ├── Prompt.md            # App-building instructions
    └── testcase_creator.md  # Test-case output template
```

---

## Notes

- Credentials are never hardcoded — they come from the Settings screen.
- The Ollama model (`gemma3:1b`) must already be pulled locally; the app does not download it.
- To reset settings, delete `src/config.json` and restart the app.
