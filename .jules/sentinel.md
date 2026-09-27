## 2024-05-18 - [Critical] Hardcoded Firebase API Key
**Vulnerability:** A hardcoded Firebase API Key (`AIzaSyD...<REDACTED>...196o`) was found in both `.env.example`, `firebase-applet-config.json`, and as a fallback in `firebase.ts`.
  **Learning:** Hardcoding API keys is an extremely common vulnerability, but in this case, it seems to have been explicitly included as a fallback when the environment variable is not defined, leading to potential exploitation of Firebase services if not properly secured.
**Detection:** Look for `import.meta.env.* || 'AIza...'` or plain string assignments of sensitive values. Regular expression searches for common API key formats (like `AIza` for Google/Firebase) are effective.

## 2024-05-18 - [Critical] Hardcoded Admin Emails in server.ts
**Vulnerability:** The `server.ts` file contains a hardcoded array of administrator emails (e.g., `<REDACTED>@gmail.com`, `<REDACTED>@begin-fin.com`, etc.) used to grant admin privileges.
  **Learning:** Relying on a hardcoded list of email addresses for authorization logic bypassing token claims (`decodedToken.admin === true`) is brittle and can lead to privilege escalation if an attacker can compromise or spoof one of these email addresses (or if one of these accounts is compromised, the blast radius is larger since their admin access is guaranteed in code).
**Detection:** Look for arrays of specific email addresses or user IDs used in authorization checks (e.g., `ADMIN_EMAILS.includes(...)`).
