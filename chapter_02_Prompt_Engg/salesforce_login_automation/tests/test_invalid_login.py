from pages.login_page import LoginPage
from playwright.sync_api import expect

def test_invalid_login(page):
    try:
        login_page = LoginPage(page)
        login_page.navigate()
        login_page.login("invalid_user@example.com", "wrong_password")
        expect(login_page.error_message).to_be_visible()
    except Exception as e:
        raise Exception(f"Invalid login test failed: {e}") from e
