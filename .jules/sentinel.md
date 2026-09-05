## 2025-09-05 - Rate Limit IP Spoofing via X-Forwarded-For
**Vulnerability:** The application extracts the client IP for rate limiting using `req.headers["x-forwarded-for"]` directly on `POST /api/grade-quiz` (line 605) instead of using Express's `req.ip`.
**Learning:** Even though Express is configured securely with `app.set('trust proxy', 1)`, explicitly reading raw headers like `x-forwarded-for` for security controls like rate limiting bypasses the proxy trust logic, allowing attackers to trivial spoof their IP and evade limits.
**Detection:** Always grep for `x-forwarded-for` and ensure `req.ip` is used in Express apps configured with `trust proxy`.

## 2025-09-05 - Hardcoded API Key in Firebase Config JSON
**Vulnerability:** A hardcoded Google API key was found in `firebase-applet-config.json`.
**Learning:** While environmental variables `.env` and `.env.example` are present and used, fallback configuration files like JSON files often slip through code reviews and get committed with sensitive keys.
**Detection:** Scan JSON configuration files for `apiKey` and secret fields.
