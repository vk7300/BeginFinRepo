# Security Audit Report

## CRITICAL: Rate Limiter IP Spoofing Vulnerability
- **Location:** `server.ts` line 398
- **Description:** The `/api/grade-quiz` endpoint relies on `req.ip` for rate-limiting guests. However, `app.set('trust proxy', 1)` is enabled on line 39. This means that if the server is deployed behind a proxy, an attacker can trivially bypass the rate limiting by spoofing the `X-Forwarded-For` header. The comment explicitly mentions: `// Rely solely on req.ip which respects app.set('trust proxy', 1) to prevent rate-limit evasion via spoofed X-Forwarded-For headers`. This is completely backward. Trusting the proxy allows the `X-Forwarded-For` header to determine `req.ip`, which allows spoofing if not properly configured with trusted proxy IP ranges.
- **Remediation:**
  - Ensure `trust proxy` is configured strictly for known proxy IPs, or use a more robust identifier for guest rate limiting that cannot be arbitrarily forged by the client.
```typescript
// Example remediation snippet: Configure trust proxy correctly or use a different guest identifier mechanism
app.set('trust proxy', 'loopback, linklocal, uniquelocal'); // Or specific proxy IPs
```

## HIGH: Authorization Bypass / IDOR Risk in Status Update
- **Location:** `server.ts` line 1024
- **Description:** The `/api/status/update` endpoint checks if a user is an admin by checking `decodedToken.admin`, `decodedToken.role === 'admin'`, or an email whitelist. However, if those fail, it looks up the user in Firestore using `decodedToken.uid` and checks `userDoc.data()?.role === 'admin'`. If a user can arbitrarily modify their own document (e.g., via insecure Firestore rules or another endpoint) to have the role 'admin', they could bypass this check.
- **Remediation:**
  - Ensure Firestore security rules strictly prevent users from modifying their own `role` field.
  - Rely exclusively on Custom Claims for roles, avoiding database lookups for authorization decisions unless absolutely necessary and securely governed.

## MEDIUM: Insecure Regex for XSS Sanitization
- **Location:** `server.ts` line 542 & 665
- **Description:** The application uses `replace(/<\/?[^>]+(>|$)/g, "")` to sanitize inputs like `graduateName` and `displayName`. Regex is notoriously brittle for preventing XSS and can often be bypassed by clever payloads.
- **Remediation:**
  - Use a robust library like DOMPurify or let the frontend framework (React) handle HTML escaping natively.
```typescript
// Example using a robust library
import DOMPurify from 'isomorphic-dompurify';
const cleanGraduateName = DOMPurify.sanitize(graduateName);
```
