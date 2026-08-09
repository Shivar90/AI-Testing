# salesforce_login_automation

A Playwright + Pytest automation framework for validating the Salesforce login page
(`https://login.salesforce.com/?locale=in`) using Playwright best-practice **semantic
locators** and the **Page Object Model**. It covers both a successful-login scenario and
an invalid-credential scenario, with shared Pytest fixtures for browser/context/page
lifecycle and structured exception handling in every layer.

Generated from the **RICE_POT** prompt template (`chapter_02_Prompt_Engg/02_RICE_POT.example.md`).

---

## Prerequisites

- **Python** 3.8 or newer
- **pip** (bundled with Python)
- Internet access (to reach `login.salesforce.com` and download the Chromium browser binary)

No other system dependencies are required.

---

## Installation

Clone or navigate to the framework directory, then install the Python packages and the
Playwright browser binaries:

```bash
cd chapter_02_Prompt_Engg/salesforce_login_automation

# 1. Python dependencies (Playwright + Pytest)
pip install -r requirements.txt

# 2. Playwright browser binaries (Chromium)
python -m playwright install chromium
```

After this you have everything needed to run the suite.

---

## Configuration

The framework supports **external credentials** via environment variables. Set them before
running the tests so the valid-login scenario can authenticate against a real Salesforce org.

### Environment variables

| Variable       | Purpose                  | Default (placeholder)        |
|---|---|---|
| `SF_USERNAME`  | Salesforce username/email | `valid_user@example.com` |
| `SF_PASSWORD`  | Salesforce password       | `valid_password`            |

If the variables are **not set**, the tests fall back to placeholder values and run without
configuration — useful for verifying the framework mechanics (the invalid-login test always
passes; the valid-login test will fail, since placeholders cannot authenticate).

### Examples

**Windows (PowerShell):**

```powershell
$env:SF_USERNAME = "your.username@company.com"
$env:SF_PASSWORD = "your-real-password"
python -m pytest -v
```

**Windows (cmd):**

```cmd
set SF_USERNAME=your.username@company.com
set SF_PASSWORD=your-real-password
python -m pytest -v
```

**Linux / macOS:**

```bash
export SF_USERNAME="your.username@company.com"
export SF_PASSWORD="your-real-password"
python -m pytest -v
```

---

## Running the tests

Tests run in **headed mode by default** (`headless=False` in `conftest.py`), so a visible
Chromium window opens during execution for visual verification.

### Run the full suite

```bash
python -m pytest -v
```

### Run a single test

```bash
python -m pytest tests/test_invalid_login.py -v
python -m pytest tests/test_valid_login.py -v
```

### To run headless (no visible browser)

Edit `conftest.py` and change `p.chromium.launch(headless=False)` to `headless=True`, then run as usual.

---

## Test scenarios

| Test file | Scenario | Expected outcome |
|---|---|---|
| `tests/test_valid_login.py` | Submit valid credentials (`SF_USERNAME` / `SF_PASSWORD`) | Login succeeds → the username field is no longer visible (page redirected away from the login form). Requires real credentials to pass. |
| `tests/test_invalid_login.py` | Submit invalid credentials | Login fails → the error message (`#error`) becomes visible. Always passes on the live page. |

---

## Framework structure

```
salesforce_login_automation/
├── conftest.py                    # Pytest fixtures: browser, context, page (setup + teardown)
├── pytest.ini                     # Config: testpaths + pythonpath (importable without PYTHONPATH tweaks)
├── requirements.txt               # playwright, pytest
├── README.md                      # This file
├── pages/
│   ├── __init__.py                # Package marker
│   └── login_page.py              # Page Object for the Salesforce login page
└── tests/
    ├── __init__.py                # Package marker
    ├── test_valid_login.py        # Valid-login scenario
    └── test_invalid_login.py      # Invalid-login scenario
```

**Deliverables (the 3 RICE_POT files):** `pages/login_page.py`, `tests/test_valid_login.py`,
`tests/test_invalid_login.py`.

**Supporting infrastructure:** `conftest.py`, `pages/__init__.py`, `tests/__init__.py`,
`requirements.txt`, `pytest.ini`, and this `README.md`.

---

## Locator strategy

All locators use **Playwright-native semantic selectors** as the primary strategy. **No XPath** is used.

### Primary (verified on the live page)

| Element | Locator |
|---|---|
| Username field | `page.get_by_label("Username")` |
| Password field | `page.get_by_label("Password")` |
| Login button | `page.get_by_role("button", name="Log In")` |
| Remember Me checkbox | `page.get_by_label("Remember me")` |

### Secondary (fallback)

| Element | Locator | Reason |
|---|---|---|
| Error message (visible) | `page.locator("#error")` | The error `div` has no ARIA `role`, so `get_by_role` cannot target it. `get_by_text` is ambiguous (it matches the `div` plus its `form`/`body` ancestors). The unique `id="error"` is a stable, reliable attribute. |

---

## Notes

- **Headed mode:** `conftest.py` launches Chromium with `headless=False`, so you see the
  browser during runs. This is intentional for visual verification/debugging.
- **Placeholder credentials:** Without `SF_USERNAME`/`SF_PASSWORD` set, the valid-login test
  cannot authenticate against real Salesforce and will fail at the `to_be_hidden()` assertion.
  Set the environment variables with real credentials to make it pass.
- **No `time.sleep()`:** the framework relies exclusively on Playwright's auto-waiting and
  `expect` assertions.
- **Anti-hallucination:** locators were verified against the live `login.salesforce.com` page
  via the Playwright MCP server before finalizing.
