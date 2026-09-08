
## 2024-05-18 - [Authorization Bypass due to Poor Fallback Logic]
**Vulnerability:** Found a critical authorization bypass in `/api/issue-certificate` where the server falls back to trusting client-provided `completedModules` if the database query returns an empty array.
  **Learning:** In attempting to be robust against "container IAM sandbox" read errors, the developer conflated "failed to read from database" with "user has 0 modules completed" and improperly allowed client-side assertion of authority.
**Detection:** Look for conditions where server-side verification falls back to client-provided parameters (e.g., `req.body`) for authorization or state checks when the server-side check yields an empty or null result.
