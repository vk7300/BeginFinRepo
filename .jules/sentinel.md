## 2024-05-24 - Rate Limiter Bypass
**Vulnerability:** The rate limit key logic for guests in `server.ts` relies on `req.ip` and `req.headers['user-agent']`.
  **Learning:** Because `app.set('trust proxy', 1)` is used, an attacker can trivially spoof the `X-Forwarded-For` header to change `req.ip` and bypass the rate limit, leading to abuse. This demonstrates that trusting proxy headers without verifying the deployment architecture introduces critical bypasses.
**Detection:** Look for rate limiting logic using `req.ip` when `trust proxy` is enabled without careful IP validation.

## 2024-05-24 - Express CORS credentials bypass
**Vulnerability:** The CORS configuration in `server.ts` dynamically reflects the origin (via `callback(null, true)`) while also setting `credentials: true`.
  **Learning:** Setting `credentials: true` with a dynamically reflected origin entirely defeats CORS, allowing any malicious site to make authenticated requests on behalf of a user. The "permissive fallback" for MCP connectors compromises the entire application's security.
**Detection:** Look for CORS configurations that allow all origins (via wildcard or dynamic reflection) while simultaneously allowing credentials.
