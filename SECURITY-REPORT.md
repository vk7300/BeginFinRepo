# 🛡️ Sentinel Security Audit Report

## Audit Summary
An automated security review of the BeginFin platform was conducted focusing on source code vulnerabilities and potential configuration issues.

## Findings

### 🚨 CRITICAL: Missing Authentication in Admin Endpoints
**Description:** The system status endpoint at `POST /api/status/update` uses a hardcoded whitelist of email addresses as a fallback for authorization, some of which are not loaded via environmental variables. The fallback list includes emails directly inside the code (`ADMIN_EMAILS = ['<REDACTED_EMAIL>', '<REDACTED_EMAIL>', '<REDACTED_EMAIL>', '<REDACTED_EMAIL>', '<REDACTED_EMAIL>', '<REDACTED_EMAIL>', '<REDACTED_EMAIL>', ...envAdminEmails]`), which bypasses the standard token claims check if an attacker manages to impersonate or register with these addresses.
**File:** `server.ts`
**Impact:** A malicious actor who is able to sign in with an email on the hardcoded list can update system statuses, which may lead to social engineering attacks against platform users.
**Recommendation:** Remove the hardcoded email fallback. Rely strictly on `decodedToken.admin === true` or standard role-based access control checking against the Firestore database (`role === 'admin'`).
**Code Fix Example:**
```typescript
let isAdmin = decodedToken.admin === true || decodedToken.role === 'admin';
if (!isAdmin) {
  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
  if (userDoc.exists && userDoc.data()?.role === 'admin') {
    isAdmin = true;
  }
}
```

### 🚨 CRITICAL: Hardcoded Test API Keys
**Description:** In `firebase-applet-config.json`, `apiKey` has been hardcoded (`"<REDACTED_API_KEY>"`).
**File:** `firebase-applet-config.json`
**Impact:** Exposure of API keys can lead to unauthorized billing on the associated Google Cloud project or access to Firebase backend resources.
**Recommendation:** Remove this hardcoded key and rely strictly on environmental variables.

### ⚠️ HIGH: Potential Cross-Site Scripting (XSS) in Email Templates
**Description:** The `POST /api/request-certifier-credential` endpoint escapes `cleanEmail`, `cleanName`, `cleanSerial`, and `cleanUserId` using a custom `escapeHtml` function, however, the `mailto:` link is not safely URL encoded before being rendered into the template attribute, which may allow injection if the custom escape HTML fails on edge cases.
**File:** `server.ts`
**Impact:** Administrators viewing these requests in poorly-configured email clients could execute malicious scripts if an attacker structures an email payload that escapes `mailto:`.
**Recommendation:** Implement robust encoding using a standard library (like DOMPurify on the frontend or a server-side validator/escaper that handles URLs correctly) or `encodeURIComponent` for attributes.

### ⚠️ HIGH: Rate Limit Evasion due to Improper IP Header Trust
**Description:** The application extracts the client IP for rate limiting using `req.headers["x-forwarded-for"]` directly on `POST /api/grade-quiz` without validating proxy layers. `app.set('trust proxy', 1)` is enabled globally, but the code explicitly parses `x-forwarded-for` bypassing Express's built-in `req.ip` behavior that honors `trust proxy`.
**File:** `server.ts`
**Impact:** An attacker can trivially bypass the `MAX_QUIZ_ATTEMPTS_PER_WINDOW` limit by supplying a spoofed `X-Forwarded-For` header, allowing them to enumerate the answer keys for modules.
**Recommendation:** Since Express is configured to trust the proxy, rely solely on `req.ip`.
**Code Fix Example:**
```typescript
// Replace:
// const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "guest";
// With:
const clientIp = req.ip || "guest";
```

### 🔒 MEDIUM: Email Spoofing via Unverified Sender Data
**Description:** In `POST /api/request-certifier-credential`, the recipient is hardcoded to `"<REDACTED_EMAIL>"` if `SMTP_TO` is absent. Additionally, the fallback `SMTP_FROM` allows arbitrary sending addresses.
**File:** `server.ts`
**Impact:** Missing DMARC/DKIM compliance for the outgoing email if `SMTP_FROM` does not match the authenticated user domain.
**Recommendation:** Enforce environment variable presence for mailing configuration rather than relying on fallbacks.
