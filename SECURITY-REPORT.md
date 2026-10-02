# Security Audit Report

## 🚨 HIGH PRIORITY: Overly Permissive CORS Configuration

**File:** `server.ts`
**Line:** 205-225

**Description:**
The application configures CORS (Cross-Origin Resource Sharing) with an extremely permissive fallback. Specifically, in the `app.use(cors({...}))` block, if the `origin` doesn't match the explicit allowed origins, the `else` block still calls `callback(null, true)`.

Coupled with `credentials: true`, this allows **any** website to make cross-origin requests to the API and include the user's cookies (or other credentials) in the request. The developer included a comment `// Permissive fallback so external MCP connectors are never dropped`, but this effectively disables CORS protections for authenticated endpoints.

**Potential Impact:**
*   **Cross-Site Request Forgery (CSRF):** An attacker can trick a victim into visiting a malicious website. This website can then send requests to the API (e.g., `/api/grade-quiz`, `/api/join-class`, `/api/issue-certificate`) on behalf of the authenticated user.
*   **Data Exposure:** Since any origin is allowed and credentials are included, a malicious site could potentially read sensitive data returned by the API if there are GET endpoints that return user-specific data based on session cookies (though the current authentication relies heavily on Bearer tokens in headers, which mitigates CSRF somewhat, but relying on this permissive CORS is still a significant security risk).

**Recommended Remediation:**
Remove the permissive fallback. If external MCP connectors need access, their specific origins should be added to the `explicitAllowedOrigins` list or dynamically validated against a safe list. Do not blindly allow all origins when `credentials: true` is set.

```typescript
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin ||
          explicitAllowedOrigins.has(origin) ||
          origin.endsWith('.run.app') ||
          origin.includes('ai.studio') ||
          origin.endsWith('.claude.ai') ||
          origin.endsWith('.anthropic.com') ||
          origin.endsWith('.cursor.com') ||
          origin.endsWith('.google.com') ||
          origin.endsWith('.googleusercontent.com') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        // Reject disallowed origins
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
```