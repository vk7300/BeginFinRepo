## 2025-02-14 - Permissive CORS Fallback Bypassing Explicit Rules
**Vulnerability:** The CORS middleware in `server.ts` checks an explicit list of origins, but features a fallback `callback(null, true)` that permits any origin if the initial checks fail. This effectively renders the CORS configuration a wildcard (`*`) allowing credentials, which exposes the application to severe cross-origin risks.
  **Learning:** In complex environments (like integrating MCP connectors or testing on unknown subdomains), developers sometimes insert overly permissive fail-safes to prevent legitimate requests from dropping. This pattern completely undermines the intended security controls.
**Detection:** Look for `callback(null, true)` in the `else` branch or fallback logic of a custom CORS origin handler, especially when `credentials: true` is enabled.

## 2025-02-14 - Middleware Ordering Circumventing Rate Limits
**Vulnerability:** The `/api/upload-photo` endpoint in `server.ts` is defined before the global `/api` rate limiter (`app.use("/api", limiter, ...)`). As a result, the upload route is excluded from rate limiting entirely.
  **Learning:** In Express.js, middleware operates sequentially. Defining high-risk, resource-intensive routes (like photo uploads) before the global rate limiting middleware silently excludes them from protection, exposing the application to DoS attacks.
**Detection:** Check the order of `app.use(...)` and route definitions (`app.post(...)`, `app.get(...)`) in Express applications to ensure global security middleware is applied *before* the routes they are meant to protect.
