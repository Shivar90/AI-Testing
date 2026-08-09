import os
from pages.login_page import LoginPage
from playwright.sync_api import expect

def test_valid_login(page):
    try:
        login_page = LoginPage(page)
        login_page.navigate()
        username = os.environ.get("SF_USERNAME", "valid_user@example.com")
        password = os.environ.get("SF_PASSWORD", "valid_password")
        login_page.login(username, password)
        expect(login_page.username_field).to_be_hidden()
    except Exception as e:
        raise Exception(f"Valid login test failed: {e}") from e
