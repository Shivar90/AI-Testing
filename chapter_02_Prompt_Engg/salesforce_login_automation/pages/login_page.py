from playwright.sync_api import expect

class LoginPage:
    def __init__(self, page):
        self.page = page
        self.username_field = page.get_by_label("Username")
        self.password_field = page.get_by_label("Password")
        self.login_button = page.get_by_role("button", name="Log In")
        self.remember_me = page.get_by_label("Remember me")
        self.error_message = page.locator("#error")

    def navigate(self):
        self.page.goto("https://login.salesforce.com/?locale=in")
        expect(self.username_field).to_be_visible()

    def login(self, username, password):
        try:
            self.username_field.fill(username)
            self.password_field.fill(password)
            self.login_button.click()
        except Exception as e:
            raise Exception(f"Login action failed: {e}") from e
