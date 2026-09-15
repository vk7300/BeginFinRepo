# Security Audit Report

## Audit Scope
This report details the findings from a recent security review of the BeginFin backend APIs (`server.ts` and related). The goal of the audit was to identify potential vulnerabilities, including unauthenticated endpoints, rate limit bypasses, and XSS risks. No source code has been modified as part of this report.

## Findings Summary

| Severity | Vulnerability | Location |
| :--- | :--- | :--- |
| **CRITICAL** | Unauthenticated Arbitrary File Overwrite / Defacement | `server.ts:171` (`/api/upload-photo`) |
| **HIGH** | Rate Limit Bypass via IP Spoofing | `server.ts:440` (`/api/grade-quiz`) |
| **MEDIUM** | Weak Sanitization leading to Potential XSS | `server.ts:587`, `server.ts:692` |

---

## 🚨 CRITICAL: Unauthenticated Arbitrary File Overwrite / Defacement

**Location:** `server.ts`, line 171
**Endpoint:** `POST /api/upload-photo`

### Description
The `/api/upload-photo` endpoint is used to save a photo (`0S1A6490.jpg`) directly to the `public/` and `dist/` directories. However, this endpoint lacks any form of authentication or authorization. An unauthenticated attacker can send a POST request with an arbitrary base64-encoded string in the `dataUrl` field. The server will blindly decode this string and overwrite the `0S1A6490.jpg` file. While the file extension is restricted to `.jpg`, an attacker can upload an inappropriate image, effectively defacing the application.

### Potential Impact
- Defacement of the application's assets.
- Potential serving of malicious content if the web server interprets the uploaded file unpredictably.

### Recommended Fix
Require authentication (e.g., verifying a Firebase ID token) and verify that the user has admin privileges before allowing the file upload.

**Safe Code Snippet:**
```typescript
app.post('/api/upload-photo', async (req, res) => {
  try {
    // 1. Verify Authentication & Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const idToken = authHeader.split("Bearer ")[1]?.trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Check if the user is an admin (using the same logic as /api/status/update)
    const isAdmin = decodedToken.admin === true || decodedToken.role === 'admin'; // Simplified for example
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin privileges required." });
    }

    // 2. Validate Input
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing dataUrl' });
    }
    // ... continue with safe processing
```

---

## ⚠️ HIGH: Rate Limit Bypass via IP Spoofing

**Location:** `server.ts`, line 440
**Endpoint:** `POST /api/grade-quiz`

### Description
The `/api/grade-quiz` endpoint implements a custom in-memory rate limiter to prevent answer-key enumeration. For guest users (unauthenticated), the rate limiting key is generated using `req.ip`. However, the application also sets `app.set('trust proxy', 1)`. In many deployment environments, if the proxy configuration isn't strictly controlled, an attacker can trivially bypass the IP-based rate limiting by providing a spoofed `X-Forwarded-For` header.

### Potential Impact
- Answer-key enumeration and brute-forcing of quiz solutions.
- Potential Denial of Service (DoS) due to excessive memory usage if an attacker sends millions of requests with different spoofed IPs, filling the `quizGradingAttempts` Map.

### Recommended Fix
Do not rely solely on `req.ip` for security controls when `trust proxy` is enabled unless you are absolutely certain the reverse proxy sanitizes `X-Forwarded-For`. Implement an alternative rate-limiting strategy for guests (e.g., requiring a lightweight captcha, browser fingerprinting, or session cookies) or limit the maximum size of the in-memory Map.

**Safe Code Snippet:**
```typescript
// Do not blindly trust req.ip if the reverse proxy architecture is uncertain.
// Consider using an established library like express-rate-limit which handles proxy IPs more robustly,
// or enforce a maximum size on the quizGradingAttempts map to prevent memory exhaustion.
if (quizGradingAttempts.size > MAX_CACHE_SIZE) {
    // Evict oldest entries or reject new guests
}
```

---

## 🔒 MEDIUM: Weak Sanitization leading to Potential XSS

**Location:** `server.ts`, lines 587 (certificate generation) and 692 (class join)
**Endpoints:** `POST /api/issue-certificate`, `POST /api/join-class`

### Description
The application uses a custom `sanitizeHeader` function and a simple regex `replace(/<\/?[^>]+(>|$)/g, "")` to sanitize `graduateName` and `displayName`. This regex only strips explicit HTML tags (e.g., `<script>`). It does not protect against other XSS vectors, such as attribute injection (e.g., `" onmouseover="alert(1)` if rendered inside an attribute) or HTML entity encoding evasion, depending on how these fields are rendered on the frontend.

### Potential Impact
- Stored Cross-Site Scripting (XSS) if the `displayName` or `graduateName` is rendered unsafely on the client side (e.g., using `dangerouslySetInnerHTML`).

### Recommended Fix
Use a robust, dedicated HTML sanitization library (like `DOMPurify` on the frontend or `xss` / `sanitize-html` on the backend) rather than relying on custom regex-based sanitization.

**Safe Code Snippet:**
```typescript
import sanitizeHtml from 'sanitize-html';

// Replace regex with a robust sanitization library
const cleanGraduateName = typeof graduateName === 'string' && graduateName.trim()
  ? sanitizeHtml(graduateName, { allowedTags: [], allowedAttributes: {} }).substring(0, 100)
  : (userData.displayName || "BeginFin Student");
```
