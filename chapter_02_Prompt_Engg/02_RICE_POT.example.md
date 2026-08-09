**R -> Role**
You are a QA automation engineer with 15 years of experience. You specialize in enterprise-grade automation frameworks and have strong expertise in CRM platforms like Salesforce. You design scalable, maintainable automation using Playwright with Python and Pytest.

---

**I -> Instructions**

* Generate a complete Playwright + Pytest automation framework following enterprise-level standards.
* Automate and validate the login page: https://login.salesforce.com/?locale=in using both valid and invalid test cases.
* [Critical] Use Pytest fixtures for setup and teardown (browser, context, page lifecycle).
* [Critical] Implement robust exception handling in Page Object methods and test layers using structured try-except blocks.
* [Mandatory] Use Page Object Model (POM) with clear separation of locators and reusable actions.
* [Mandatory] Use Playwright-native locator strategies:

  * primary: `get_by_role`, `get_by_label`, `get_by_placeholder`, `get_by_text`
  * Secondary: `locator()` with stable attributes (e.g., `data-testid`, `aria-*`)
  * Avoid XPath unless absolutely necessary
* [Mandatory] Use Playwright assertions (`expect`) for validations.
* [Mandatory] Use auto-waiting and explicit waits via Playwright APIs.
* [Don't] Do NOT use XPath as primary locator strategy.
* [Don't] Do NOT use CSS selectors if better semantic locators exist.
* [Don't] Do NOT use `time.sleep()` or hard waits.
* [Don't] Do NOT use Selenium-style patterns.
* [Generate] Generate exactly 3 files:

  1. 1 Page Object file
  2. 2 Pytest test scripts (valid login, invalid login)
* Maintain high readability, modular structure, and enterprise standards.

---

**C -> Context**

You are automating the Salesforce login page which includes:

* Username/email input
* Password input
* Login button
* Remember Me checkbox

The application may include A/B testing variations, so locators must be resilient and based on accessibility attributes rather than brittle DOM paths.

---

**E -> Example (Playwright Best Practice POM)**

class LoginPage:
def **init**(self, page):
self.page = page
self.username = page.get_by_label("Username")
self.password = page.get_by_label("Password")
self.login_button = page.get_by_role("button", name="Log In")

```
def login(self, user, password):
    self.username.fill(user)
    self.password.fill(password)
    self.login_button.click()
```

---

**P -> Parameters**

* Production-grade framework
* High reliability and maintainability
* Minimal flakiness using Playwright auto-waiting
* Supports external URLs and credentials
* Uses Playwright sync API with Pytest

---

**O -> Output**

Provide only:

* 1 Page Object file
* 2 Pytest test scripts
* No explanations, no comments, no extra text

---

**T -> Tone**

Highly technical, precise, enterprise-grade, Playwright-best-practice focused.
