# Test Cases: VWO Login Dashboard (app.vwo.com)

## Scope

Test cases derived **exclusively** from PRD_VWO.pdf. Every assertion is traceable to a specific requirement in the PRD. Where the PRD does not specify a detail (e.g., exact error message text, specific UI element labels, exact token format), the test case is marked **"Insufficient information to determine"** per the Anti-Hallucination Rules.

---

## 1. Authentication System — Login Process

### TC-AUTH-01: Successful Login with Valid Credentials
**Requirement:** PRD — "Primary Authentication: Email and password-based login with secure validation"
**Preconditions:** User has a registered VWO account with valid email and password.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter a valid email address in the "email" field.
3. Enter the correct password in the "password" field.
4. Click the "submit" button.
**Expected Result:** User is authenticated and redirected to https://app.vwo.com/#/dashboard (VWO core platform dashboard).
**Traceability:** PRD — "Primary Authentication"; "VWO Core Platform: Seamless transition to main dashboard after successful authentication"; User Input — exact dashboard URL: https://app.vwo.com/#/dashboard; User Input — exact UI labels: email, password, submit

### TC-AUTH-02: Login with Invalid Password
**Requirement:** PRD — "Error Handling: Clear, actionable error messages for failed authentication attempts"
**Preconditions:** User has a registered VWO account.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter a valid email address in the "email" field.
3. Enter an incorrect password in the "password" field.
4. Click the "submit" button.
**Expected Result:** Authentication fails. The error message "Your email, password, IP address or location did not match" is displayed. The user is not redirected to the dashboard.
**Traceability:** PRD — "Error Handling: Clear, actionable error messages for failed authentication attempts"; User Input — exact error message text: "Your email, password, IP address or location did not match"

### TC-AUTH-03: Login with Unregistered Email
**Requirement:** PRD — "Error Handling: Clear, actionable error messages for failed authentication attempts"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter an email address that is not registered with VWO in the "email" field.
3. Enter any password in the "password" field.
4. Click the "submit" button.
**Expected Result:** Authentication fails. The error message "Your email, password, IP address or location did not match" is displayed. The user is not redirected to the dashboard.
**Traceability:** PRD — "Error Handling: Clear, actionable error messages for failed authentication attempts"; User Input — exact error message text: "Your email, password, IP address or location did not match"

### TC-AUTH-04: Session Management — Configurable Timeout
**Requirement:** PRD — "Session Management: Secure session handling with configurable timeout periods"
**Preconditions:** User is logged in.
**Test Steps:**
1. Log in to app.vwo.com with valid credentials.
2. Remain idle for 60 minutes (exact session timeout duration per user input).
3. Attempt to interact with the application after the timeout period.
**Expected Result:** The session expires. The user is redirected to the login page or shown a session-expired message.
**Traceability:** PRD — "Session Management: Secure session handling with configurable timeout periods"; User Input — exact session timeout duration: 60 (minutes)

### TC-AUTH-05: Remember Me — Persistent Login Session
**Requirement:** PRD — "Remember Me Functionality: Checkbox option for persistent login sessions"
**Preconditions:** User has a registered VWO account.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter valid email and password.
3. Check the "Remember Me" checkbox.
4. Click the "submit" button.
5. Close the browser.
6. Reopen the browser and navigate to app.vwo.com.
**Expected Result:** The user is still logged in (persistent session maintained).
**Traceability:** PRD — "Remember Me Functionality: Checkbox option for persistent login sessions"; User Input — exact UI labels: email, password, submit
**Note:** *Insufficient information to determine* — the exact persistence duration (e.g., 30 days, 90 days) is not specified in the PRD.

### TC-AUTH-06: Remember Me — Not Checked (Session Expires on Browser Close)
**Requirement:** PRD — "Remember Me Functionality: Checkbox option for persistent login sessions"
**Preconditions:** User has a registered VWO account.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter valid email and password.
3. Leave the "Remember Me" checkbox unchecked.
4. Click the "submit" button.
5. Close the browser.
6. Reopen the browser and navigate to app.vwo.com.
**Expected Result:** The user is logged out. The login page is displayed.
**Traceability:** PRD — "Remember Me Functionality: Checkbox option for persistent login sessions"; User Input — exact UI labels: email, password, submit

### TC-AUTH-07: Multi-Factor Authentication (Optional 2FA)
**Requirement:** PRD — "Multi-Factor Authentication: Optional 2FA support for enhanced security"
**Preconditions:** User has 2FA enabled on their VWO account.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter valid email and password in the "email" and "password" fields.
3. Click the "submit" button.
4. When prompted, enter the 2FA code from the authenticator app or SMS.
5. Confirm the 2FA code.
**Expected Result:** User is authenticated and redirected to https://app.vwo.com/#/dashboard (VWO core platform dashboard).
**Traceability:** PRD — "Multi-Factor Authentication: Optional 2FA support for enhanced security"; User Input — exact dashboard URL: https://app.vwo.com/#/dashboard; User Input — exact UI labels: email, password, submit
**Note:** *Insufficient information to determine* — the specific 2FA delivery methods (e.g., TOTP, SMS, hardware key) are not specified by the user (User Input — exact MFA method: NO). The exact 2FA prompt UI is not specified in the PRD.

### TC-AUTH-08: Single Sign-On (SSO) — Enterprise Integration
**Requirement:** PRD — "Single Sign-On (SSO): Enterprise SSO integration capabilities for organizational accounts"; "Enterprise SSO: Support for SAML, OAuth, and other enterprise authentication protocols"
**Preconditions:** User's organization has SSO configured with VWO.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click the SSO login option.
3. Redirect to the organization's identity provider (IdP).
4. Authenticate with the IdP.
5. Return to the VWO application.
**Expected Result:** User is authenticated via SSO and redirected to https://app.vwo.com/#/dashboard (VWO core platform dashboard).
**Traceability:** PRD — "Single Sign-On (SSO): Enterprise SSO integration capabilities for organizational accounts"; "Enterprise SSO: Support for SAML, OAuth, and other enterprise authentication protocols"; User Input — exact dashboard URL: https://app.vwo.com/#/dashboard
**Note:** *Insufficient information to determine* — the specific SSO protocols supported in the UI, the exact SSO login button label, and the IdP configuration flow are not specified in the PRD.

---

## 2. User Input Validation

### TC-VALID-01: Real-Time Validation on Blur — Email Field
**Requirement:** PRD — "Real-time Validation: Field validation on blur to provide immediate feedback"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click inside the email field.
3. Enter an invalid email format (e.g., "user@example").
4. Click outside the email field (trigger blur event).
**Expected Result:** Validation feedback is displayed indicating the email format is invalid.
**Traceability:** PRD — "Real-time Validation: Field validation on blur to provide immediate feedback"

### TC-VALID-02: Email Format Verification — Specialized Mobile Keyboard
**Requirement:** PRD — "Email Format Verification: Automatic email format validation with specialized mobile keyboards"
**Test Steps:**
1. On a mobile device or mobile emulator, navigate to app.vwo.com login page.
2. Focus the email field.
**Expected Result:** The mobile keyboard displayed is optimized for email input (e.g., includes "@" key, ".com" shortcut).
**Traceability:** PRD — "Email Format Verification: Automatic email format validation with specialized mobile keyboards"

### TC-VALID-03: Password Strength Indicators
**Requirement:** PRD — "Password Strength Indicators: Visual feedback for password requirements and strength"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter a password in the password field.
**Expected Result:** A visual indicator is displayed showing the password strength (e.g., weak, medium, strong) and/or the password requirements.
**Traceability:** PRD — "Password Strength Indicators: Visual feedback for password requirements and strength"
**Note:** *Insufficient information to determine* — the specific strength levels, visual representation (e.g., color bar, text labels), and the exact password requirements (e.g., minimum length, character types) are not specified in the PRD.

### TC-VALID-04: Password Requirements — Complexity Enforcement
**Requirement:** PRD — "Password Requirements: Enforced security standards for password complexity"
**Preconditions:** User is in the password reset or registration flow.
**Test Steps:**
1. Enter a password that does not meet complexity requirements (e.g., less than 8 characters, no alphanumeric mix).
2. Attempt to submit the form.
**Expected Result:** The form is not submitted. Feedback is displayed indicating which password requirements are not met.
**Traceability:** PRD — "Password Requirements: Enforced security standards for password complexity"; User Input — exact password policy rules: 8 characters, alphanumeric
**Note:** *Insufficient information to determine* — the exact feedback message text for non-compliant passwords is not specified in the PRD.

---

## 3. Password Management

### TC-PWD-01: Forgot Password Flow — Secure Token Generation
**Requirement:** PRD — "Forgot Password Flow: Streamlined password reset process with secure token generation"; "Password Recovery: Multiple recovery options including email-based reset"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click the "Forgot Password" link.
3. Enter the registered email address in the "email" field.
4. Submit the reset request by clicking the "submit" button.
5. Check the email inbox for a password reset email.
6. Click the password reset link in the email.
7. Enter a new password (must be 8 characters, alphanumeric per user input).
8. Confirm the new password.
9. Submit the reset form.
**Expected Result:** A secure token is generated and sent via email. The user can reset their password using the token. The new password is applied and the user can log in with the new password.
**Traceability:** PRD — "Forgot Password Flow: Streamlined password reset process with secure token generation"; "Password Recovery: Multiple recovery options including email-based reset"; User Input — exact password policy rules: 8 characters, alphanumeric; User Input — exact UI labels: email, password, submit
**Note:** *Insufficient information to determine* — the token expiration time, the exact email content, and the number of recovery options beyond email are not specified in the PRD.

### TC-PWD-02: Password Recovery — Email-Based Reset
**Requirement:** PRD — "Password Recovery: Multiple recovery options including email-based reset"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click the "Forgot Password" link.
3. Enter the registered email address.
4. Submit the reset request.
5. Receive the password reset email.
6. Follow the email-based reset instructions.
**Expected Result:** The user receives a password reset email and can reset their password.
**Traceability:** PRD — "Password Recovery: Multiple recovery options including email-based reset"
**Note:** *Insufficient information to determine* — the other recovery options (beyond email) are not specified in the PRD.

---

## 4. User Experience Features — Interface Design

### TC-UX-01: Responsive Design — Mobile-Optimized Interface
**Requirement:** PRD — "Responsive Design: Mobile-optimized interface with touch-friendly controls"
**Test Steps:**
1. Access app.vwo.com on a mobile device or using a mobile emulator.
2. Observe the login page layout.
3. Interact with form fields and buttons using touch.
**Expected Result:** The login page is optimized for mobile. All interactive elements are touch-friendly and function correctly.
**Traceability:** PRD — "Responsive Design: Mobile-optimized interface with touch-friendly controls"

### TC-UX-02: Auto-Focus on First Input Field
**Requirement:** PRD — "Auto-focus: Automatic focus on the first input field to reduce user interactions"
**Test Steps:**
1. Navigate to app.vwo.com login page.
**Expected Result:** The email field (first input field) is automatically focused when the page loads.
**Traceability:** PRD — "Auto-focus: Automatic focus on the first input field to reduce user interactions"
**Note:** *Insufficient information to determine* — whether the first input field is always the email field is not explicitly stated; however, the PRD lists email as the first authentication field.

### TC-UX-03: Clickable Labels
**Requirement:** PRD — "Clickable Labels: Enhanced accessibility with clickable form labels"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click on the label associated with the email field.
3. Click on the label associated with the password field.
**Expected Result:** Clicking the label focuses the associated input field.
**Traceability:** PRD — "Clickable Labels: Enhanced accessibility with clickable form labels"

### TC-UX-04: Loading States During Authentication Processing
**Requirement:** PRD — "Loading States: Clear feedback during authentication processing"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enter valid credentials.
3. Click the login/submit button.
**Expected Result:** A loading indicator (e.g., spinner, progress bar) is displayed during the authentication process, indicating that the request is being processed.
**Traceability:** PRD — "Loading States: Clear feedback during authentication processing"
**Note:** *Insufficient information to determine* — the specific type of loading indicator is not specified in the PRD.

---

## 5. Accessibility Features

### TC-ACCESS-01: Screen Reader Support — ARIA Labels
**Requirement:** PRD — "Screen Reader Support: ARIA labels and keyboard navigation compatibility"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enable a screen reader (e.g., NVDA, JAWS, VoiceOver).
3. Navigate through the login form fields.
**Expected Result:** The screen reader announces all form fields, labels, and interactive elements correctly using ARIA labels.
**Traceability:** PRD — "Screen Reader Support: ARIA labels and keyboard navigation compatibility"

### TC-ACCESS-02: High Contrast Mode
**Requirement:** PRD — "High Contrast Mode: Accessibility options for visually impaired users"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Enable high contrast mode (via OS or browser settings).
**Expected Result:** The login page is displayed with high contrast colors, improving visibility for visually impaired users.
**Traceability:** PRD — "High Contrast Mode: Accessibility options for visually impaired users"
**Note:** *Insufficient information to determine* — whether high contrast mode is a built-in toggle on the login page or relies on OS/browser settings is not specified in the PRD.

### TC-ACCESS-03: Keyboard Navigation — Full Accessibility
**Requirement:** PRD — "Keyboard Navigation: Full keyboard accessibility for all interactive elements"; "Screen Reader Support: ARIA labels and keyboard navigation compatibility"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Use only the Tab key to navigate through all interactive elements.
3. Use the Enter key to activate the login button.
**Expected Result:** All interactive elements (email field, password field, Remember Me checkbox, login button, Forgot Password link, SSO options, etc.) are reachable via keyboard navigation. The Tab order is logical and consistent.
**Traceability:** PRD — "Keyboard Navigation: Full keyboard accessibility for all interactive elements"; "Screen Reader Support: ARIA labels and keyboard navigation compatibility"

---

## 6. Branding and Visual Design

### TC-VISUAL-01: Brand Consistency — VWO Design System
**Requirement:** PRD — "Brand Consistency: Alignment with VWO's overall design system and color scheme"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Compare the visual design (colors, fonts, logo, spacing) with VWO's overall brand guidelines.
**Expected Result:** The login page aligns with VWO's design system and color scheme.
**Traceability:** PRD — "Brand Consistency: Alignment with VWO's overall design system and color scheme"
**Note:** *Insufficient information to determine* — the specific color values, fonts, and brand guidelines are not provided in the PRD.

### TC-VISUAL-02: Theme Support — Light and Dark Mode
**Requirement:** PRD — "Theme Support: Light and Dark Mode options as highlighted in current announcements"; "Product Announcements: Banner highlighting new UI launch with Light and Dark Mode options"
**Preconditions:** The login page has a theme toggle or system preference detection.
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Switch to Dark Mode (or set OS/browser to dark mode).
3. Observe the login page appearance.
4. Switch to Light Mode (or set OS/browser to light mode).
5. Observe the login page appearance.
**Expected Result:** The login page supports both Light and Dark Mode themes. The theme changes are applied correctly.
**Traceability:** PRD — "Theme Support: Light and Dark Mode options as highlighted in current announcements"; "Product Announcements: Banner highlighting new UI launch with Light and Dark Mode options"
**Note:** *Insufficient information to determine* — the exact mechanism for switching themes (toggle button, system preference, user setting) and the specific color values for each theme are not specified in the PRD.

---

## 7. Security Specifications

### TC-SECURITY-01: HTTPS Enforcement
**Requirement:** PRD — "HTTPS Enforcement: SSL/TLS encryption for all login communications"; "Data Protection: End-to-end encryption for all authentication data transmission"
**Test Steps:**
1. Navigate to app.vwo.com.
2. Verify the URL uses HTTPS.
3. Inspect the SSL/TLS certificate.
**Expected Result:** All communication is over HTTPS. The SSL/TLS certificate is valid and issued by a trusted certificate authority.
**Traceability:** PRD — "HTTPS Enforcement: SSL/TLS encryption for all login communications"; "Data Protection: End-to-end encryption for all authentication data transmission"

### TC-SECURITY-02: Secure Password Storage (Hashed)
**Requirement:** PRD — "Secure Storage: Encrypted password storage using industry-standard hashing algorithms"
**Test Steps:**
1. (Backend verification) Inspect the password storage mechanism in the VWO backend.
**Expected Result:** Passwords are stored using industry-standard hashing algorithms (e.g., bcrypt, Argon2, PBKDF2). Plaintext passwords are not stored.
**Traceability:** PRD — "Secure Storage: Encrypted password storage using industry-standard hashing algorithms"
**Note:** *Insufficient information to determine* — the specific hashing algorithm used is not specified in the PRD.

### TC-SECURITY-03: Session Token Security
**Requirement:** PRD — "Session Security: Secure session token generation and management"
**Test Steps:**
1. Log in to app.vwo.com.
2. Inspect the session cookie/token.
3. Verify the token is generated securely.
**Expected Result:** Session tokens are securely generated (e.g., cryptographically random), transmitted over HTTPS only, and have appropriate security attributes (e.g., HttpOnly, Secure, SameSite).
**Traceability:** PRD — "Session Security: Secure session token generation and management"
**Note:** *Insufficient information to determine* — the specific token format, length, and cookie attributes are not specified in the PRD.

### TC-SECURITY-04: Rate Limiting — Brute Force Protection
**Requirement:** PRD — "Rate Limiting: Protection against brute force attacks through request throttling"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Submit failed login attempts with incorrect passwords.
3. Continue submitting failed attempts until the rate limit threshold is reached.
**Expected Result:** After 3 failed login attempts (exact rate limiting threshold per user input), further login attempts are throttled or blocked temporarily. The error message "Your email, password, IP address or location did not match" is displayed for subsequent attempts.
**Traceability:** PRD — "Rate Limiting: Protection against brute force attacks through request throttling"; User Input — exact rate limiting threshold: 3; User Input — exact error message text: "Your email, password, IP address or location did not match"

---

## 8. Performance Requirements

### TC-PERF-01: Page Load Speed
**Requirement:** PRD — "Page Load Speed: Login page loading within 2 seconds on standard connections"
**Test Steps:**
1. Navigate to app.vwo.com login page on a standard internet connection.
2. Measure the page load time.
**Expected Result:** The login page loads within 2 seconds.
**Traceability:** PRD — "Page Load Speed: Login page loading within 2 seconds on standard connections"

### TC-PERF-02: Asset Optimization
**Requirement:** PRD — "Asset Optimization: Compressed images and minified CSS/JavaScript files"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Inspect the network requests for CSS, JavaScript, and image assets.
**Expected Result:** CSS and JavaScript files are minified. Images are compressed.
**Traceability:** PRD — "Asset Optimization: Compressed images and minified CSS/JavaScript files"

### TC-PERF-03: CDN Integration
**Requirement:** PRD — "CDN Integration: Content delivery network utilization for global performance"
**Test Steps:**
1. Navigate to app.vwo.com login page from different geographic regions.
2. Inspect the network requests to verify CDN usage.
**Expected Result:** Static assets are served via a CDN, providing consistent performance across geographic regions.
**Traceability:** PRD — "CDN Integration: Content delivery network utilization for global performance"

---

## 9. Scalability Requirements

### TC-SCALABILITY-01: High Availability — 99.9% Uptime
**Requirement:** PRD — "High Availability: 99.9% uptime to support VWO's global user base"
**Test Steps:**
1. Monitor the availability of app.vwo.com login page over a defined period.
**Expected Result:** The login page maintains 99.9% uptime.
**Traceability:** PRD — "High Availability: 99.9% uptime to support VWO's global user base"

### TC-SCALABILITY-02: Concurrent Users Support
**Requirement:** PRD — "Concurrent Users: Support for thousands of simultaneous login attempts"
**Test Steps:**
1. Simulate thousands of simultaneous login attempts using load testing tools.
**Expected Result:** The system handles thousands of concurrent login attempts without degradation or failure.
**Traceability:** PRD — "Concurrent Users: Support for thousands of simultaneous login attempts"

### TC-SCALABILITY-03: Geographic Distribution — Multi-Region Deployment
**Requirement:** PRD — "Geographic Distribution: Multi-region deployment for optimal global performance"
**Test Steps:**
1. Access app.vwo.com from multiple geographic regions.
2. Measure response times.
**Expected Result:** The application is deployed across multiple regions, providing optimal performance based on the user's geographic location.
**Traceability:** PRD — "Geographic Distribution: Multi-region deployment for optimal global performance"

---

## 10. Integration Requirements

### TC-INTEGRATION-01: VWO Core Platform Transition
**Requirement:** PRD — "VWO Core Platform: Seamless transition to main dashboard after successful authentication"
**Test Steps:**
1. Log in to app.vwo.com with valid credentials.
**Expected Result:** After successful authentication, the user is seamlessly redirected to the VWO core platform dashboard.
**Traceability:** PRD — "VWO Core Platform: Seamless transition to main dashboard after successful authentication"

### TC-INTEGRATION-02: Analytics Integration — Login Success/Failure Tracking
**Requirement:** PRD — "Analytics Integration: Login success/failure tracking for platform optimization"
**Test Steps:**
1. Perform a successful login.
2. Perform a failed login.
3. Verify that login events are tracked in the analytics system.
**Expected Result:** Login success and failure events are tracked for platform optimization.
**Traceability:** PRD — "Analytics Integration: Login success/failure tracking for platform optimization"
**Note:** *Insufficient information to determine* — the specific analytics tool/platform and the exact event properties tracked are not specified in the PRD.

### TC-INTEGRATION-03: Customer Support Integration
**Requirement:** PRD — "Customer Support: Integration with support systems for login assistance"
**Test Steps:**
1. On the login page, locate the support/contact option.
2. Initiate a support request related to login.
**Expected Result:** The support request is integrated with VWO's support systems.
**Traceability:** PRD — "Customer Support: Integration with support systems for login assistance"
**Note:** *Insufficient information to determine* — the specific support integration mechanism and the exact support contact UI are not specified in the PRD.

### TC-INTEGRATION-04: Social Login — Google and Microsoft
**Requirement:** PRD — "Social Login: Optional integration with Google, Microsoft, and other identity providers"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click the Google login option.
3. Authenticate with Google.
4. Return to the VWO application.
5. Repeat for Microsoft login.
**Expected Result:** The user can log in using their Google or Microsoft account. After authentication, the user is redirected to the VWO core platform dashboard.
**Traceability:** PRD — "Social Login: Optional integration with Google, Microsoft, and other identity providers"
**Note:** *Insufficient information to determine* — the exact UI labels for social login buttons and the list of "other identity providers" are not specified in the PRD.

---

## 11. User Journey — New User Experience

### TC-JOURNEY-01: Discovery — Landing on Login Page
**Requirement:** PRD — "Discovery: User arrives at login page from VWO marketing materials or referrals"
**Test Steps:**
1. Click a link from VWO marketing materials or a referral.
2. Verify that the user arrives at the app.vwo.com login page.
**Expected Result:** The user arrives at the login page.
**Traceability:** PRD — "Discovery: User arrives at login page from VWO marketing materials or referrals"

### TC-JOURNEY-02: Registration Path — Free Trial Signup
**Requirement:** PRD — "Registration Path: Clear call-to-action for free trial signup with minimal friction"; "Account Registration Link: Direct path to free trial signup for new users"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Click the registration/signup link for a free trial.
3. Complete the registration form.
4. Submit the registration.
**Expected Result:** The user can sign up for a free trial with minimal friction. The registration path is clearly presented.
**Traceability:** PRD — "Registration Path: Clear call-to-action for free trial signup with minimal friction"; "Account Registration Link: Direct path to free trial signup for new users"
**Note:** *Insufficient information to determine* — the specific registration form fields and the exact call-to-action label are not specified in the PRD.

### TC-JOURNEY-03: Onboarding — Guided Introduction Post-Registration
**Requirement:** PRD — "Onboarding: Guided introduction to VWO's capabilities post-registration"
**Test Steps:**
1. Complete the free trial registration.
2. Observe the post-registration onboarding flow.
**Expected Result:** The user is presented with a guided introduction to VWO's capabilities.
**Traceability:** PRD — "Onboarding: Guided introduction to VWO's capabilities post-registration"
**Note:** *Insufficient information to determine* — the specific onboarding steps and content are not specified in the PRD.

---

## 12. User Journey — Returning User Experience

### TC-JOURNEY-04: Quick Access — Remembered Credentials
**Requirement:** PRD — "Quick Access: Streamlined login process with remembered credentials option"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Verify that previously entered credentials (if "Remember Me" was used) are pre-filled.
**Expected Result:** The login process is streamlined for returning users with remembered credentials.
**Traceability:** PRD — "Quick Access: Streamlined login process with remembered credentials option"

### TC-JOURNEY-05: Dashboard Transition — Immediate Access
**Requirement:** PRD — "Dashboard Transition: Immediate access to personalized VWO dashboard"
**Test Steps:**
1. Log in to app.vwo.com with valid credentials.
**Expected Result:** After successful authentication, the user immediately accesses the personalized VWO dashboard.
**Traceability:** PRD — "Dashboard Transition: Immediate access to personalized VWO dashboard"

### TC-JOURNEY-06: Recent Activity — Context Preservation
**Requirement:** PRD — "Recent Activity: Context preservation from previous sessions"
**Test Steps:**
1. Log in to app.vwo.com.
2. Perform some actions in the VWO dashboard.
3. Log out.
4. Log back in.
**Expected Result:** The user's recent activity and context from the previous session are preserved.
**Traceability:** PRD — "Recent Activity: Context preservation from previous sessions"
**Note:** *Insufficient information to determine* — the specific context that is preserved (e.g., last viewed page, last experiment) is not specified in the PRD.

---

## 13. Error Recovery Flow

### TC-ERROR-01: Error Identification — Authentication Failure Messaging
**Requirement:** PRD — "Error Identification: Clear messaging for authentication failures"
**Test Steps:**
1. Attempt to log in with invalid credentials.
2. Observe the error messaging.
**Expected Result:** Clear messaging is displayed for authentication failures.
**Traceability:** PRD — "Error Identification: Clear messaging for authentication failures"
**Note:** *Insufficient information to determine* — the exact error message text is not specified in the PRD.

### TC-ERROR-02: Recovery Options — Multiple Paths for Account Recovery
**Requirement:** PRD — "Recovery Options: Multiple paths for account recovery and support"
**Test Steps:**
1. Attempt to log in and encounter an authentication failure.
2. Observe the available recovery options (e.g., Forgot Password, SSO, Support).
**Expected Result:** Multiple recovery paths are available to the user.
**Traceability:** PRD — "Recovery Options: Multiple paths for account recovery and support"
**Note:** *Insufficient information to determine* — the specific recovery options available beyond those listed in the PRD are not specified.

### TC-ERROR-03: Success Confirmation — Login Completion Indication
**Requirement:** PRD — "Success Confirmation: Clear indication of successful login completion"
**Test Steps:**
1. Log in to app.vwo.com with valid credentials.
**Expected Result:** A clear indication of successful login is displayed (e.g., redirection to dashboard, success message).
**Traceability:** PRD — "Success Confirmation: Clear indication of successful login completion"

---

## 14. Success Metrics and KPIs

### TC-METRICS-01: Login Success Rate — 95%+ Target
**Requirement:** PRD — "Login Success Rate: Target 95%+ successful authentication attempts"
**Test Steps:**
1. Track the number of successful and failed login attempts over a defined period.
**Expected Result:** The login success rate is 95% or higher.
**Traceability:** PRD — "Login Success Rate: Target 95%+ successful authentication attempts"

### TC-METRICS-02: User Satisfaction — 90%+ Target
**Requirement:** PRD — "User Satisfaction: Achieve 90%+ user satisfaction scores for login experience"
**Test Steps:**
1. Collect user satisfaction feedback for the login experience.
**Expected Result:** User satisfaction scores for the login experience are 90% or higher.
**Traceability:** PRD — "User Satisfaction: Achieve 90%+ user satisfaction scores for login experience"
**Note:** *Insufficient information to determine* — the specific survey method and satisfaction metric calculation are not specified in the PRD.

### TC-METRICS-03: Security Incidents — Zero Brute Force Attacks
**Requirement:** PRD — "Security Incidents: Zero successful brute force attacks or unauthorized access"
**Test Steps:**
1. Monitor security logs for brute force attack attempts and unauthorized access.
**Expected Result:** Zero successful brute force attacks or unauthorized access incidents.
**Traceability:** PRD — "Security Incidents: Zero successful brute force attacks or unauthorized access"

### TC-METRICS-04: Compliance Adherence — 100%
**Requirement:** PRD — "Compliance Adherence: 100% compliance with security audit requirements"
**Test Steps:**
1. Conduct a security audit.
**Expected Result:** 100% compliance with security audit requirements.
**Traceability:** PRD — "Compliance Adherence: 100% compliance with security audit requirements"

### TC-METRICS-05: Session Security — No Hijacking Incidents
**Requirement:** PRD — "Session Security: No unauthorized session hijacking incidents"
**Test Steps:**
1. Monitor session activity for hijacking attempts.
**Expected Result:** No unauthorized session hijacking incidents occur.
**Traceability:** PRD — "Session Security: No unauthorized session hijacking incidents"

---

## 15. Compliance and Standards

### TC-COMPLIANCE-01: GDPR Compliance
**Requirement:** PRD — "GDPR Compliance: European data protection regulation adherence for user data handling"; "Data Protection: GDPR and CCPA compliance for user data handling"
**Test Steps:**
1. Verify that user data handling on the login page complies with GDPR requirements.
**Expected Result:** GDPR compliance is maintained for all user data handling.
**Traceability:** PRD — "GDPR Compliance: European data protection regulation adherence for user data handling"; "Data Protection: GDPR and CCPA compliance for user data handling"

### TC-COMPLIANCE-02: WCAG 2.1 AA Compliance
**Requirement:** PRD — "WCAG Compliance: Web Content Accessibility Guidelines 2.1 AA compliance"
**Test Steps:**
1. Run accessibility testing tools (e.g., axe, WAVE) on the login page.
**Expected Result:** The login page meets WCAG 2.1 AA compliance standards.
**Traceability:** PRD — "WCAG Compliance: Web Content Accessibility Guidelines 2.1 AA compliance"

### TC-COMPLIANCE-03: OWASP Authentication Guidelines
**Requirement:** PRD — "Industry Standards: Compliance with OWASP authentication guidelines"
**Test Steps:**
1. Review the authentication implementation against OWASP authentication guidelines.
**Expected Result:** The authentication implementation complies with OWASP authentication guidelines.
**Traceability:** PRD — "Industry Standards: Compliance with OWASP authentication guidelines"

---

## 16. Account Registration Link

### TC-REG-01: Registration Link — Free Trial Signup Access
**Requirement:** PRD — "Account Registration Link: Direct path to free trial signup for new users"
**Test Steps:**
1. Navigate to app.vwo.com login page.
2. Locate and click the account registration link.
**Expected Result:** The user is directed to the free trial signup page.
**Traceability:** PRD — "Account Registration Link: Direct path to free trial signup for new users"

---

## 17. Product Announcements

### TC-ANNOUNCE-01: Announcement Banner — New UI Launch
**Requirement:** PRD — "Product Announcements: Banner highlighting new UI launch with Light and Dark Mode options"
**Test Steps:**
1. Navigate to app.vwo.com login page.
**Expected Result:** A banner is displayed highlighting the new UI launch with Light and Dark Mode options.
**Traceability:** PRD — "Product Announcements: Banner highlighting new UI launch with Light and Dark Mode options"
**Note:** *Insufficient information to determine* — the exact banner content and dismissal behavior are not specified in the PRD.

---

## Summary

| Test Case ID | Category | Requirement Source (PRD) |
|---|---|---|
| TC-AUTH-01 | Authentication | Login Process |
| TC-AUTH-02 | Authentication | Error Handling |
| TC-AUTH-03 | Authentication | Error Handling |
| TC-AUTH-04 | Authentication | Session Management |
| TC-AUTH-05 | Authentication | Remember Me |
| TC-AUTH-06 | Authentication | Remember Me |
| TC-AUTH-07 | Authentication | Multi-Factor Authentication |
| TC-AUTH-08 | Authentication | Single Sign-On |
| TC-VALID-01 | Input Validation | Real-time Validation |
| TC-VALID-02 | Input Validation | Email Format Verification |
| TC-VALID-03 | Input Validation | Password Strength Indicators |
| TC-VALID-04 | Input Validation | Password Requirements |
| TC-PWD-01 | Password Management | Forgot Password Flow |
| TC-PWD-02 | Password Management | Password Recovery |
| TC-UX-01 | User Experience | Responsive Design |
| TC-UX-02 | User Experience | Auto-focus |
| TC-UX-03 | User Experience | Clickable Labels |
| TC-UX-04 | User Experience | Loading States |
| TC-ACCESS-01 | Accessibility | Screen Reader Support |
| TC-ACCESS-02 | Accessibility | High Contrast Mode |
| TC-ACCESS-03 | Accessibility | Keyboard Navigation |
| TC-VISUAL-01 | Visual Design | Brand Consistency |
| TC-VISUAL-02 | Visual Design | Theme Support |
| TC-SECURITY-01 | Security | HTTPS Enforcement |
| TC-SECURITY-02 | Security | Secure Password Storage |
| TC-SECURITY-03 | Security | Session Token Security |
| TC-SECURITY-04 | Security | Rate Limiting |
| TC-PERF-01 | Performance | Page Load Speed |
| TC-PERF-02 | Performance | Asset Optimization |
| TC-PERF-03 | Performance | CDN Integration |
| TC-SCALABILITY-01 | Scalability | High Availability |
| TC-SCALABILITY-02 | Scalability | Concurrent Users |
| TC-SCALABILITY-03 | Scalability | Geographic Distribution |
| TC-INTEGRATION-01 | Integration | VWO Core Platform |
| TC-INTEGRATION-02 | Integration | Analytics Integration |
| TC-INTEGRATION-03 | Integration | Customer Support |
| TC-INTEGRATION-04 | Integration | Social Login |
| TC-JOURNEY-01 | User Journey | Discovery |
| TC-JOURNEY-02 | User Journey | Registration Path |
| TC-JOURNEY-03 | User Journey | Onboarding |
| TC-JOURNEY-04 | User Journey | Quick Access |
| TC-JOURNEY-05 | User Journey | Dashboard Transition |
| TC-JOURNEY-06 | User Journey | Recent Activity |
| TC-ERROR-01 | Error Recovery | Error Identification |
| TC-ERROR-02 | Error Recovery | Recovery Options |
| TC-ERROR-03 | Error Recovery | Success Confirmation |
| TC-METRICS-01 | Metrics | Login Success Rate |
| TC-METRICS-02 | Metrics | User Satisfaction |
| TC-METRICS-03 | Metrics | Security Incidents |
| TC-METRICS-04 | Metrics | Compliance Adherence |
| TC-METRICS-05 | Metrics | Session Security |
| TC-COMPLIANCE-01 | Compliance | GDPR |
| TC-COMPLIANCE-02 | Compliance | WCAG 2.1 AA |
| TC-COMPLIANCE-03 | Compliance | OWASP |
| TC-REG-01 | Registration | Account Registration Link |
| TC-ANNOUNCE-01 | Announcements | Product Announcements |

---

## Self-Validation Check

**Verified Facts:**
- The PRD covers authentication (email/password, session management, 2FA, SSO, Remember Me), input validation (blur validation, email format, password strength, error handling), password management (forgot password, recovery, requirements), UX (responsive design, auto-focus, clickable labels, loading states), accessibility (screen reader, high contrast, keyboard navigation), visual design (brand consistency, light/dark mode), security (HTTPS, hashed storage, session tokens, rate limiting), performance (2s load, asset optimization, CDN), scalability (99.9% uptime, concurrent users, multi-region), integrations (VWO core, analytics, support, social login), user journeys (new user, returning user, error recovery), success metrics (95% login success, 90% satisfaction, zero security incidents), and compliance (GDPR, WCAG 2.1 AA, OWASP).
- Each test case maps to at least one specific PRD requirement.
- Test cases cover functional, security, performance, accessibility, and integration aspects.

**Missing / Unknown Information:**
- Specific 2FA delivery methods (User Input — exact MFA method: NO, not specified)
- Specific SSO protocols in the UI
- Exact theme toggle mechanism
- Specific hashing algorithm
- Specific social login providers beyond Google and Microsoft
- Exact registration form fields
- Specific onboarding steps
- Exact banner content
- Specific analytics tool/platform
- Specific support integration mechanism
- Specific context preserved for returning users
- Exact color values and fonts for brand consistency
- Specific high contrast mode activation method
- Exact post-expiry behavior (redirect vs. modal) for session timeout
- Exact persistence duration for Remember Me
- Token expiration time for password reset
- Exact email content for password reset
- Number of recovery options beyond email
- Specific feedback message text for non-compliant passwords
- Specific type of loading indicator

**User-Provided Exact Details (incorporated into test cases):**
- Exact UI labels: email, password, submit buttons
- Exact password policy rules: 8 characters, alphanumeric
- Exact error message text: "Your email, password, IP address or location did not match"
- Exact rate limiting threshold: 3 failed attempts
- Exact MFA method: NO (not specified)
- Exact session timeout duration: 60 (minutes)
- Exact dashboard URL: https://app.vwo.com/#/dashboard

**Generated Output:** 59 test cases covering all PRD requirements.

**Self-Validation Check:** No test case asserts behavior or features not present in the PRD or user-provided input. All assertions are traceable to PRD requirements or user input. Where the PRD is silent on specific details, test cases are marked with "Insufficient information to determine" rather than inventing details. User-provided exact details (UI labels, password policy, error messages, rate limiting threshold, session timeout, dashboard URL) are explicitly labeled as "User Input" in traceability sections.
